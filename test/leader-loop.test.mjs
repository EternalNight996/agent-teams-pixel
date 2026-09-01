/**
 * Leader Loop: validate that "which role does this task belong to" produces
 * a stable answer when each role has a non-overlapping specialization, and
 * that the dependency graph yields the correct topological order for the
 * leader's dispatch sequence.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

/** A toy planner: assign each task to the first role whose tags cover it. */
function assign(task, roles) {
  const tags = (task.tags ?? []).map((t) => t.toLowerCase())
  for (const role of roles) {
    if (role.tags.some((rt) => tags.includes(rt.toLowerCase()))) return role.name
  }
  return 'generalist'
}

/** Kahn's algorithm — yields the dispatch order from the task DAG. */
function topoOrder(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const indeg = new Map(tasks.map((t) => [t.id, (t.dependencies ?? []).length]))
  const ready = tasks.filter((t) => indeg.get(t.id) === 0).map((t) => t.id)
  const order = []
  while (ready.length > 0) {
    const id = ready.shift()
    order.push(id)
    for (const t of tasks) {
      const deps = t.dependencies ?? []
      if (deps.includes(id)) {
        indeg.set(t.id, indeg.get(t.id) - 1)
        if (indeg.get(t.id) === 0) ready.push(t.id)
      }
    }
  }
  if (order.length !== tasks.length) throw new Error('cycle detected')
  return order.map((id) => byId.get(id))
}

test('assign() picks the most specific role for each task', () => {
  const roles = [
    { name: 'reviewer', tags: ['review', 'audit'] },
    { name: 'engineer', tags: ['implementation', 'coding'] },
    { name: 'researcher', tags: ['research', 'docs'] },
  ]
  assert.equal(assign({ tags: ['implementation'] }, roles), 'engineer')
  assert.equal(assign({ tags: ['review'] }, roles), 'reviewer')
  assert.equal(assign({ tags: ['unknown'] }, roles), 'generalist')
})

test('topoOrder respects dependencies and yields parallel-ready sets', () => {
  const tasks = [
    { id: 't1', subject: 'spec', dependencies: [] },
    { id: 't2', subject: 'implement', dependencies: ['t1'] },
    { id: 't3', subject: 'review', dependencies: ['t2'] },
    { id: 't4', subject: 'docs', dependencies: ['t1'] },
  ]
  const order = topoOrder(tasks)
  assert.deepEqual(order.map((t) => t.id), ['t1', 't2', 't4', 't3'])
})

test('leader may request more help when no role covers the task', () => {
  const roles = [{ name: 'engineer', tags: ['coding'] }]
  const missing = assign({ tags: ['legal-review'] }, roles)
  assert.equal(missing, 'generalist')
  // Real flow: the captain would then issue agent_teams_add_member with the
  // suggested role; this test only confirms the planner flags it.
})

test('apply threshold for "needs more hands" — many unmatched tasks', () => {
  const tasks = Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, subject: 'spec', dependencies: [], tags: ['legal-review'] }))
  const roles = [{ name: 'engineer', tags: ['coding'] }]
  const unmatched = tasks.filter((t) => assign(t, roles) === 'generalist').length
  assert.ok(unmatched >= 5, 'captain should request more help when most tasks fall to generalist')
})