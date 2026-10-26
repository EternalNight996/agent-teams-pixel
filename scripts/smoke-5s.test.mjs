/**
 * Bounded 5-second smoke round: the smallest reproducible check that a
 * time-boxed unit of work ("测试5秒钟") starts, runs to completion, and is
 * measurable. It intentionally touches no team state, no LLM and no host
 * runtime, so it can run anywhere and never flakes on scheduling noise.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

const ROUND_MS = 5_000
// Generous ceiling: a loaded CI box may overshoot, but a hung round must fail.
const CEILING_MS = 30_000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

test('a bounded 5-second round completes and is measurable', async () => {
  const startedAt = performance.now()
  await sleep(ROUND_MS)
  const elapsed = performance.now() - startedAt

  assert.ok(elapsed >= ROUND_MS, `round finished early: ${elapsed.toFixed(1)}ms < ${ROUND_MS}ms`)
  assert.ok(elapsed < CEILING_MS, `round overran its ceiling: ${elapsed.toFixed(1)}ms >= ${CEILING_MS}ms`)
})
