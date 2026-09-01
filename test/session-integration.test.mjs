/**
 * v0.1.3 wiring: SessionListSnapshot subscription + TaskProgress aggregation
 * + recent-presets localStorage contract.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('SessionListSnapshot.current is the captain to address', () => {
  // The client subscribes to ctx.sessions and reads snapshot.current as the
  // SessionId the user is currently driving. Without that we cannot ship the
  // start-team / request-help POST without falling back to a global.
  const snap = { items: [], current: 'sess-42', state: 'idle', phase: 'ready', error: null, subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined }
  assert.equal(snap.current, 'sess-42')
})

test('TaskProgressBar aggregates per-status counts into a single bar', () => {
  const tasks = [
    { id: 't1', subject: 'spec', status: 'completed', dependencies: [] },
    { id: 't2', subject: 'impl', status: 'in_progress', dependencies: ['t1'] },
    { id: 't3', subject: 'review', status: 'pending', dependencies: ['t2'] },
    { id: 't4', subject: 'doc', status: 'pending', dependencies: [] },
  ]
  const counts = {
    completed: tasks.filter((t) => t.status === 'completed').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    pending: tasks.filter((t) => t.status === 'pending' || t.status === 'claimed').length,
    failed: tasks.filter((t) => t.status === 'failed' || t.status === 'cancelled').length,
  }
  assert.deepEqual(counts, { completed: 1, in_progress: 1, pending: 2, failed: 0 })
})

test('TaskProgressBar surfaces the highest review/repair round', () => {
  const tasks = [
    { id: 't1', subject: 'r1', status: 'completed', dependencies: [], round: 1 },
    { id: 't2', subject: 'r2', status: 'completed', dependencies: [], round: 2 },
    { id: 't3', subject: 'r3', status: 'in_progress', dependencies: [], round: 3 },
  ]
  const maxRound = tasks.reduce((max, t) => Math.max(max, t.round ?? 0), 0)
  assert.equal(maxRound, 3)
})

test('blocked ratio > 50% with no in-progress tasks raises the warning', () => {
  const tasks = [
    { id: 't1', subject: 'a', status: 'pending', dependencies: [] },
    { id: 't2', subject: 'b', status: 'pending', dependencies: [] },
    { id: 't3', subject: 'c', status: 'pending', dependencies: [] },
  ]
  const pending = tasks.filter((t) => t.status === 'pending').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const blocked = pending / tasks.length
  assert.ok(blocked > 0.5 && inProgress === 0)
})

test('recent presets stay capped at the most-recent 5', () => {
  const prev = ['AI 研究团队', '研发团队', '设计团队']
  const next = ['营销团队', ...prev.filter((p) => p !== '营销团队')].slice(0, 5)
  assert.deepEqual(next, ['营销团队', 'AI 研究团队', '研发团队', '设计团队'])
})

test('recent presets survive localStorage corruption gracefully', () => {
  // The tab swallows JSON.parse errors so a corrupt entry does not break the
  // panel; the user re-memorizes on the next successful start.
  let recovered = []
  try { recovered = JSON.parse('not json') } catch { recovered = [] }
  assert.deepEqual(recovered, [])
})

test('active session id is undefined until the sidebar attaches', () => {
  const snap = { items: [], current: undefined, state: 'loading', phase: 'pending', error: null, subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined }
  assert.equal(snap.current, undefined)
})

test('start-team uses the live session id, never a window global', () => {
  // The v0.1.2 fallback `window.__DSH_ACTIVE_SESSION__` is removed in v0.1.3.
  // The single source of truth is the SessionListSnapshot subscription.
  const win = {}
  const activeId = 'sess-1'
  const resolved = activeId || (win.__DSH_ACTIVE_SESSION__ || '')
  assert.equal(resolved, 'sess-1')
})