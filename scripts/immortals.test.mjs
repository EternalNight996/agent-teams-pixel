/**
 * 封神榜数据契约：十五重境界首尾相接覆盖 1..9999，且每条文案中英文都在。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { CULTIVATION_REALMS } from '../lib/client/cultivation.js'
import { ASCENSION_RANKS, ASCENSION_STORY, ASCENSION_TIPS, rankAtLevel } from '../lib/client/immortals.js'
import { en, zh } from '../lib/client/locales.js'

test('the board covers every level from 1 to 9999 without gaps', () => {
  assert.equal(ASCENSION_RANKS.length, CULTIVATION_REALMS.length)
  assert.equal(ASCENSION_RANKS[0].levelMin, 1)
  assert.equal(ASCENSION_RANKS.at(-1).levelMax, 9999)
  for (let index = 1; index < ASCENSION_RANKS.length; index += 1) {
    assert.equal(ASCENSION_RANKS[index].levelMin, ASCENSION_RANKS[index - 1].levelMax + 1,
      `${ASCENSION_RANKS[index].realm} must start right after the previous realm`)
  }
  assert.deepEqual(ASCENSION_RANKS.map(rank => rank.realm), [...CULTIVATION_REALMS])
})

test('rankAtLevel resolves the realm boundaries exactly', () => {
  assert.equal(rankAtLevel(1).realm, 'realm.mortal')
  assert.equal(rankAtLevel(4).realm, 'realm.mortal')
  assert.equal(rankAtLevel(5).realm, 'realm.qi')
  assert.equal(rankAtLevel(49).realm, 'realm.qi')
  assert.equal(rankAtLevel(50).realm, 'realm.foundation')
  assert.equal(rankAtLevel(9999).realm, 'realm.dao')
  assert.equal(rankAtLevel(0).realm, 'realm.mortal')
  assert.equal(rankAtLevel(99999).realm, 'realm.dao')
})

test('every rank, tip and story line has Chinese and English copy', () => {
  const keys = [
    ...ASCENSION_RANKS.map(rank => rank.descKey),
    ...ASCENSION_TIPS,
    ...ASCENSION_STORY,
  ]
  for (const key of keys) {
    assert.equal(typeof zh[key], 'string', `missing zh copy: ${key}`)
    assert.equal(typeof en[key], 'string', `missing en copy: ${key}`)
    assert.ok(zh[key].length > 0 && en[key].length > 0, `empty copy: ${key}`)
  }
  assert.ok(ASCENSION_TIPS.length >= 4)
  assert.ok(ASCENSION_STORY.length >= 3)
})
