/**
 * 挂机曲线回归：1 级每 10 秒 10 点；前 100 级很快，之后逐步变慢；连击最高 3 倍。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { idleStreakMultiplier, idleXpPer10s, xpNeed } from '../lib/client/cultivation.js'

/** 满连击（3x）下升一级要多少秒。 */
const secondsPerLevel = level => (xpNeed(level) / (idleXpPer10s(level) * 3)) * 10

test('level 1 idles exactly 10 XP per 10 seconds', () => {
  assert.equal(idleXpPer10s(1), 10)
})

test('idle XP grows with level and stays a whole number', () => {
  let previous = 0
  for (const level of [1, 2, 5, 10, 50, 100, 500, 1000, 2800, 5200, 9999]) {
    const xp = idleXpPer10s(level)
    assert.ok(Number.isInteger(xp), `Lv.${level} must grant an integer`)
    assert.ok(xp >= previous, `idle XP must not drop between levels (${level})`)
    previous = xp
  }
  assert.ok(idleXpPer10s(100) > idleXpPer10s(1) * 20)
})

test('levels 1-100 settle around 20s and high levels taper harder', () => {
  assert.ok(secondsPerLevel(1) >= 18 && secondsPerLevel(1) <= 22, 'Lv.1 should take about 20s at 3x')
  assert.ok(secondsPerLevel(100) >= 18 && secondsPerLevel(100) <= 24,
    `Lv.100 should be about 20s after the half-speed pass, got ${secondsPerLevel(100).toFixed(1)}s`)
  assert.ok(secondsPerLevel(1000) >= 120,
    `Lv.1000 should take at least 2 minutes (${secondsPerLevel(1000).toFixed(1)}s)`)
  assert.ok(secondsPerLevel(9999) >= 720,
    `the cap should take at least 12 minutes (${(secondsPerLevel(9999) / 60).toFixed(1)} min)`)
  assert.ok(secondsPerLevel(9999) > secondsPerLevel(1000) * 3,
    'the cap should be the slowest part of the curve')
})

test('simulated max-streak idle reaches level 100 within an hour', () => {
  let level = 1
  let seconds = 0
  while (level < 100) {
    seconds += secondsPerLevel(level)
    level += 1
  }
  assert.ok(seconds < 3600, `1->100 took ${(seconds / 60).toFixed(1)} minutes at 3x`)
  assert.ok(seconds > 1800, 'the half-speed pass must roughly double the old 1->100 time')
  // 后 100 级必须明显比前 100 级慢。
  let tail = 0
  for (let lv = 1000; lv < 1100; lv += 1) tail += secondsPerLevel(lv)
  assert.ok(tail > seconds, 'late levels must take longer than the first 100')
})

test('the online streak caps at 3x after four minutes', () => {
  assert.equal(idleStreakMultiplier(0), 1)
  assert.equal(idleStreakMultiplier(5), 1)
  assert.equal(idleStreakMultiplier(6), 1.5)
  assert.equal(idleStreakMultiplier(12), 2)
  assert.equal(idleStreakMultiplier(18), 2.5)
  assert.equal(idleStreakMultiplier(24), 3)
  assert.equal(idleStreakMultiplier(9999), 3)
})
