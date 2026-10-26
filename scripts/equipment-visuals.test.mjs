/**
 * 装备外观映射：每件法器/坐骑都要有可画出来的形状，避免“切了装备没变化”。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { CULTIVATION_ITEMS } from '../lib/client/cultivation.js'
import { mountModelFor, toneForTier, weaponShapeFor } from '../lib/client/equipment-visuals.js'

test('every weapon item maps to a concrete shape', () => {
  const weapons = CULTIVATION_ITEMS.filter(item => item.kind === 'weapon')
  const shapes = new Set()
  for (const item of weapons) {
    shapes.add(weaponShapeFor(item.id))
  }
  assert.ok(weapons.length >= 10)
  assert.ok(shapes.size >= 5, `expected at least 5 weapon shapes, got ${[...shapes].join(', ')}`)
  assert.equal(weaponShapeFor('weapon-tao'), 'sword')
  assert.equal(weaponShapeFor('weapon-treasure'), 'orb')
  assert.equal(weaponShapeFor('weapon-core'), 'trident')
  assert.equal(weaponShapeFor('weapon-divine'), 'bolt')
  assert.equal(weaponShapeFor('weapon-immortal'), 'staff')
  assert.equal(weaponShapeFor('weapon-true-immortal'), 'star')
  assert.equal(weaponShapeFor('weapon-dao'), 'planet')
  assert.equal(weaponShapeFor(undefined), 'sword')
})

test('weapon tone follows the unlock tier', () => {
  assert.equal(toneForTier(1).name, 'mortal')
  assert.equal(toneForTier(50).name, 'spirit')
  assert.equal(toneForTier(500).name, 'immortal')
  assert.equal(toneForTier(2800).name, 'dao')
  assert.ok(toneForTier(2800).scale > toneForTier(1).scale)
})

test('every mount item resolves to a model family', () => {
  const mounts = CULTIVATION_ITEMS.filter(item => item.kind === 'mount' && item.form === 'beast')
  const models = new Set()
  for (const item of mounts) models.add(mountModelFor(item.id))
  assert.ok(models.size >= 6, `expected several mount models, got ${[...models].join(', ')}`)
  assert.equal(mountModelFor('mount-crane'), 'crane')
  assert.equal(mountModelFor('mount-qilin'), 'qilin')
  assert.equal(mountModelFor('mount-kirin'), 'qilin')
  assert.equal(mountModelFor('mount-jiao'), 'jiao')
  assert.equal(mountModelFor('mount-dragon'), 'dragon')
  assert.equal(mountModelFor('mount-true-dragon'), 'dragon')
  assert.equal(mountModelFor('mount-phoenix'), 'phoenix')
  assert.equal(mountModelFor('mount-dao-beast'), 'dao')
  assert.equal(mountModelFor('mount-beast'), 'beast')
  assert.equal(mountModelFor(undefined), 'beast')
})
