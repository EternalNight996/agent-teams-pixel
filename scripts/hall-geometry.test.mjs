import assert from 'node:assert/strict'
import test from 'node:test'
import {HALL_SHEET_GAP,hallSheetPlacement,hallSheetWidth,hallYieldWidth} from '../lib/client/hall-geometry.js'

test('sheet right edge stops 8px before the panel left edge', () => {
  const viewport = 1920
  const panelLeft = 1400
  const { left, width } = hallSheetPlacement(panelLeft, viewport)
  assert.equal(width, 480)
  assert.equal(left + width, panelLeft - HALL_SHEET_GAP)
})

test('a wider panel shifts the sheet further left', () => {
  const viewport = 1920
  const narrowPanel = hallSheetPlacement(1200, viewport).left
  const widePanel = hallSheetPlacement(800, viewport).left
  assert.ok(widePanel < narrowPanel)
})

test('sheet is clamped inside the viewport instead of leaving the screen', () => {
  const viewport = 900
  const hardRight = hallSheetPlacement(viewport, viewport)
  assert.equal(hardRight.left + hardRight.width, viewport - 16)
  assert.ok(hardRight.left >= 16)

  const farLeft = hallSheetPlacement(200, viewport)
  assert.equal(farLeft.left, 16)
  assert.ok(farLeft.left + farLeft.width <= viewport)
})

test('the hall yields two thirds of its width to the conversation', () => {
  assert.equal(hallYieldWidth(620, 1920), 413)
  assert.equal(hallYieldWidth(1040, 1920), 693)
  // a panel wider than the viewport is capped to viewport − 32 before the ratio
  assert.equal(hallYieldWidth(2400, 1200), 779)
})

test('the yield always leaves 360px for the conversation', () => {
  // 620 × 2/3 = 413, capped by viewport − 360
  assert.equal(hallYieldWidth(620, 700), 340)
  // 568 × 2/3 = 379, capped by viewport − 360
  assert.equal(hallYieldWidth(2400, 600), 240)
})

test('sheet shrinks with a viewport narrower than 512px', () => {
  assert.equal(hallSheetWidth(400), 368)
  const { left, width } = hallSheetPlacement(300, 400)
  assert.equal(width, 368)
  assert.equal(left, 16)
  assert.ok(left + width <= 400)
})
