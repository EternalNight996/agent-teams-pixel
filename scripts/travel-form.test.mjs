/**
 * 出行形态回归：普通修士步行，只有装了飞剑/神兽才离地。
 *
 * 曾经的实现按等级自动御剑（Lv.5 起全队悬浮），这次把规则收成纯函数并用
 * 测试钉住：默认不飞、等级不够不飞、双击循环不跳级。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BEAST_LEVEL, CHARACTER_DISPLAY_HEIGHT, CHARACTER_HEIGHT, CHARACTER_SCALE, SHOE_HEIGHT, SWORD_LEVEL, TRAVEL_LIFT,
  characterRig, nextTravelForm, travelFormFor,
} from '../lib/client/pixel-office/travel.js'

test('no level ever auto-flies: default, auto and off all walk', () => {
  for (const level of [0, 1, 2, 4, 5, 7, 8, 20, 9999]) {
    assert.equal(travelFormFor(level), 'walk', `Lv.${level} must walk by default`)
    assert.equal(travelFormFor(level, 'auto'), 'walk', `Lv.${level} auto must walk`)
    assert.equal(travelFormFor(level, 'off'), 'walk', `Lv.${level} off must walk`)
  }
})

test('an equipped flying sword lifts only from the sword level on', () => {
  assert.equal(travelFormFor(SWORD_LEVEL - 1, 'sword'), 'walk')
  assert.equal(travelFormFor(SWORD_LEVEL, 'sword'), 'sword')
  assert.equal(travelFormFor(9999, 'sword'), 'sword')
  assert.ok(travelFormFor(SWORD_LEVEL - 1, 'sword') !== 'sword')
})

test('an equipped divine beast lifts only from the beast level on', () => {
  assert.equal(travelFormFor(BEAST_LEVEL - 1, 'beast'), 'walk')
  assert.equal(travelFormFor(BEAST_LEVEL, 'beast'), 'beast')
  assert.equal(travelFormFor(9999, 'beast'), 'beast')
})

test('double-click cycles walk -> sword -> beast -> walk without skipping', () => {
  assert.equal(nextTravelForm(1, 'walk'), 'walk')
  assert.equal(nextTravelForm(SWORD_LEVEL, 'walk'), 'sword')
  assert.equal(nextTravelForm(SWORD_LEVEL, 'sword'), 'walk')
  assert.equal(nextTravelForm(BEAST_LEVEL, 'walk'), 'sword')
  assert.equal(nextTravelForm(BEAST_LEVEL, 'sword'), 'beast')
  assert.equal(nextTravelForm(BEAST_LEVEL, 'beast'), 'walk')
})

test('lift matches the mount art: walk stays on the ground, beasts higher than swords', () => {
  assert.equal(TRAVEL_LIFT.walk, 0)
  assert.ok(TRAVEL_LIFT.sword > 0)
  assert.ok(TRAVEL_LIFT.beast > TRAVEL_LIFT.sword)
})

test('mounted cultivators hover clear of the low desk (17px tall)', () => {
  // 矮案案面在 baseY−17；离地高度必须更大，否则剑/兽会压在案面上。
  assert.ok(TRAVEL_LIFT.sword > 17)
  assert.ok(TRAVEL_LIFT.beast > 17)
})

test('the painted figure stands on the ground instead of floating above its shadow', () => {
  for (const baseY of [120, 470, 1000]) {
    const rig = characterRig(baseY)
    assert.equal(rig.headY, baseY - CHARACTER_HEIGHT)
    // 鞋底正好落在 baseY：脚踩地面，而不是悬在落影上方。
    assert.equal(rig.shoeY + SHOE_HEIGHT, baseY)
    // 缩放后脚底仍在 baseY（以脚底为锚点缩放，不会把人抬起来）。
    assert.equal(Math.round(baseY + (rig.shoeY + SHOE_HEIGHT - baseY) * CHARACTER_SCALE), baseY)
    assert.ok(rig.headY < rig.bodyY && rig.bodyY < rig.waistY
      && rig.waistY < rig.hemY && rig.hemY < rig.shoeY, 'rig lines stay ordered top-down')
  }
})

test('the cultivator is a mini figure: art is drawn large, then scaled down', () => {
  assert.ok(CHARACTER_SCALE > 0.5 && CHARACTER_SCALE < 0.7, 'scale keeps the pixel figure hand-sized')
  assert.ok(CHARACTER_DISPLAY_HEIGHT >= 48 && CHARACTER_DISPLAY_HEIGHT <= 60, 'the visible figure is about 56px tall')
  // 缩放后头顶高度 = 显示高度，名牌/等级框/热区都按这个值对齐。
  assert.equal(Math.round(CHARACTER_HEIGHT * CHARACTER_SCALE), CHARACTER_DISPLAY_HEIGHT)
})
