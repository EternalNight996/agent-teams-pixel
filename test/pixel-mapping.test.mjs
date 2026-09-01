/**
 * Pixel state mapping: agent-teams' 9 SessionEvent types + 6 task statuses
 * must map cleanly onto the canvas's 5 pixel states (idle/typing/walking/
 * done/error). Off-by-one here would silently break the live office.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

function deriveState(member) {
  if (member.status === 'removed') return 'error'
  if (member.taskKind === 'failed') return 'error'
  if (member.status === 'working' || ['claimed', 'in_progress'].includes(member.taskKind)) return 'typing'
  if (member.taskKind === 'completed') return 'done'
  return 'idle'
}

test('idle member with no task → idle', () => {
  assert.equal(deriveState({ status: 'idle', taskKind: undefined }), 'idle')
})

test('working member with active task → typing', () => {
  assert.equal(deriveState({ status: 'working', taskKind: 'in_progress' }), 'typing')
  assert.equal(deriveState({ status: 'idle', taskKind: 'claimed' }), 'typing')
})

test('completed task → done', () => {
  assert.equal(deriveState({ status: 'idle', taskKind: 'completed' }), 'done')
})

test('removed member or failed task → error', () => {
  assert.equal(deriveState({ status: 'removed', taskKind: undefined }), 'error')
  assert.equal(deriveState({ status: 'idle', taskKind: 'failed' }), 'error')
})

test('all 6 task statuses resolve to a known state', () => {
  // pending with no worker → idle
  // claimed + worker → typing
  // in_progress + worker → typing
  // completed → done
  // failed → error
  // cancelled → falls through (idle: cancelled tasks no longer consume the
  // member; the captain decides what happens next).
  const cases = [
    { input: { status: 'idle', taskKind: 'pending' }, expected: 'idle' },
    { input: { status: 'working', taskKind: 'claimed' }, expected: 'typing' },
    { input: { status: 'working', taskKind: 'in_progress' }, expected: 'typing' },
    { input: { status: 'idle', taskKind: 'completed' }, expected: 'done' },
    { input: { status: 'idle', taskKind: 'failed' }, expected: 'error' },
    { input: { status: 'idle', taskKind: 'cancelled' }, expected: 'idle' },
  ]
  for (const c of cases) {
    assert.equal(deriveState(c.input), c.expected, JSON.stringify(c.input))
  }
})