/**
 * 境界配色回归：每重境界一套颜色，等级牌在洞府/名册/装备页保持一致。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { CULTIVATION_REALMS, REALM_BANDS, realmIndexForLevel } from '../lib/client/cultivation.js'
import { REALM_PALETTES, realmPaletteForLevel } from '../lib/client/realm-colors.js'

test('every realm has exactly one palette', () => {
  assert.equal(REALM_PALETTES.length, CULTIVATION_REALMS.length)
  assert.equal(REALM_PALETTES.length, REALM_BANDS.length)
  for (const palette of REALM_PALETTES) {
    for (const key of ['border', 'background', 'text', 'bar']) {
      assert.match(palette[key], /^#[0-9a-f]{6}$/i, `${key} must be a hex colour`)
    }
  }
})

test('realm boundaries resolve to the matching palette', () => {
  assert.equal(realmIndexForLevel(1), 0)
  assert.equal(realmIndexForLevel(4), 0)
  assert.equal(realmIndexForLevel(5), 1)
  assert.equal(realmIndexForLevel(49), 1)
  assert.equal(realmIndexForLevel(50), 2)
  assert.equal(realmIndexForLevel(149), 2)
  assert.equal(realmIndexForLevel(150), 3)
  assert.equal(realmIndexForLevel(2799), 7)
  assert.equal(realmIndexForLevel(2800), 8)
  assert.equal(realmIndexForLevel(9999), 14)
  assert.equal(realmIndexForLevel(12000), 14)
  assert.equal(realmPaletteForLevel(1), REALM_PALETTES[0])
  assert.equal(realmPaletteForLevel(9999), REALM_PALETTES[14])
  assert.equal(realmPaletteForLevel(0), REALM_PALETTES[0])
})

test('palettes are visually distinct across realms', () => {
  const backgrounds = new Set(REALM_PALETTES.map(palette => palette.background))
  const borders = new Set(REALM_PALETTES.map(palette => palette.border))
  assert.equal(backgrounds.size, REALM_PALETTES.length)
  assert.equal(borders.size, REALM_PALETTES.length)
})
