import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FACILITIES, FACILITY_ORDER, WALL_HEIGHT, facilityAt,
} from '../lib/client/pixel-office/office-actions.js'

test('the wall exposes six non-overlapping facilities inside the wall band', () => {
  // 传音阁已移除；封神榜、天机阁与宗门志补上墙上设施。
  assert.deepEqual([...FACILITY_ORDER].sort(), ['about', 'board', 'config', 'gear', 'ranks', 'teams'])
  const rects = FACILITY_ORDER.map(action => ({ action, ...FACILITIES[action] }))
  for (const rect of rects) {
    assert.ok(rect.x >= 0 && rect.x + rect.w <= 520, `${rect.action} leaves the world horizontally`)
    assert.ok(rect.y >= 0 && rect.y + rect.h <= WALL_HEIGHT, `${rect.action} leaves the wall band`)
  }
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]
      const b = rects[j]
      const disjoint = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y
      assert.ok(disjoint, `${a.action} overlaps ${b.action}`)
    }
  }
})

test('facility hit testing resolves each centre to exactly its own action', () => {
  for (const action of FACILITY_ORDER) {
    const rect = FACILITIES[action]
    assert.equal(facilityAt(rect.x + rect.w / 2, rect.y + rect.h / 2), action)
  }
  assert.equal(facilityAt(520, 96), undefined)
  assert.equal(facilityAt(260, WALL_HEIGHT + 1), undefined)
})
