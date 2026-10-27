/**
 * 挂机/任务曲线回归：挂机 -80%（1 级每 10 秒 2 点），任务 +500%，破境特效更长；连击最高 3 倍。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LEVEL_UP_FX_MS, REALM_BREAK_FX_MS, captainKey, captainTaskXpFor, idleStreakMultiplier, idleXpPer10s,
  levelUpFxDuration, memberKey, taskXpFor, xpNeed,
} from '../lib/client/cultivation.js'

/** 满连击（3x）下升一级要多少秒。 */
const secondsPerLevel = level => (xpNeed(level) / (idleXpPer10s(level) * 3)) * 10

test('level 1 idles exactly 2 XP per 10 seconds (80% slower than the old curve)', () => {
  assert.equal(idleXpPer10s(1), 2)
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

test('idle levels take about 5x longer than the old 20s/level curve', () => {
  assert.ok(secondsPerLevel(1) >= 85 && secondsPerLevel(1) <= 115, 'Lv.1 should take about 100s at 3x')
  assert.ok(secondsPerLevel(100) >= 85 && secondsPerLevel(100) <= 120,
    `Lv.100 should be about 100s after the 80% cut, got ${secondsPerLevel(100).toFixed(1)}s`)
  assert.ok(secondsPerLevel(1000) >= 500,
    `Lv.1000 should take at least 8 minutes (${secondsPerLevel(1000).toFixed(1)}s)`)
  assert.ok(secondsPerLevel(9999) >= 3000,
    `the cap should take at least 50 minutes (${(secondsPerLevel(9999) / 60).toFixed(1)} min)`)
  assert.ok(secondsPerLevel(9999) > secondsPerLevel(1000) * 3,
    'the cap should be the slowest part of the curve')
})

test('simulated max-streak idle now takes hours to reach level 100', () => {
  let level = 1
  let seconds = 0
  while (level < 100) {
    seconds += secondsPerLevel(level)
    level += 1
  }
  assert.ok(seconds < 4 * 3600, `1->100 took ${(seconds / 60).toFixed(1)} minutes at 3x`)
  assert.ok(seconds > 2 * 3600, 'the 80% cut must push 1->100 well past two hours')
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

test('task completion pays 5x the old XP', () => {
  assert.equal(taskXpFor(1), 375)
  assert.equal(taskXpFor(10), 1050)
  assert.equal(captainTaskXpFor(1), 240)
  assert.equal(captainTaskXpFor(10), 600)
})

test('crossing a realm stretches the level-up effect', () => {
  assert.equal(levelUpFxDuration(1, 2), LEVEL_UP_FX_MS)
  assert.equal(levelUpFxDuration(4, 5), REALM_BREAK_FX_MS)
  assert.equal(levelUpFxDuration(49, 50), REALM_BREAK_FX_MS)
  assert.equal(levelUpFxDuration(149, 150), REALM_BREAK_FX_MS)
  assert.equal(levelUpFxDuration(150, 151), LEVEL_UP_FX_MS)
})

test('every sect shares one global captain level while members keep their own', () => {
  assert.equal(captainKey('魔宗·045343'), 'captain:global')
  assert.equal(captainKey('剑宗·123456'), 'captain:global')
  assert.equal(memberKey('魔修'), 'member:魔修')
  assert.notEqual(memberKey('魔修'), memberKey('毒修'))
})
