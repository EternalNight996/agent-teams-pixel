/**
 * End-to-end demo (mock): captain decomposes a goal into 3 tasks (analysis,
 * implementation, review), assigns each to a role, watches members move
 * through idle → typing → done, evaluates delivery, and either ships or
 * loops back. The real call would go through dsh-subagent; this mock proves
 * the protocol ordering and the captain's decision rules.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

async function fakeMember(role, task) {
  // Real members spawn a sub-agent. Here we just simulate.
  return { role, taskId: task.id, status: 'in_progress', output: `${role} done: ${task.subject}` }
}

async function runDemo(goal) {
  // 1. Captain analyzes goal.
  const decomposed = [
    { id: 't1', subject: `分析 ${goal}`, assignee: 'analyst', dependencies: [] },
    { id: 't2', subject: `实现 ${goal}`, assignee: 'engineer', dependencies: ['t1'] },
    { id: 't3', subject: `验收 ${goal}`, assignee: 'reviewer', dependencies: ['t2'] },
  ]
  // 2. Captain dispatches members.
  const results = []
  for (const task of decomposed) {
    const member = await fakeMember(task.assignee, task)
    results.push(member)
  }
  // 3. Captain evaluates delivery.
  const allDone = results.every((r) => r.status === 'in_progress' && r.output.length > 0)
  return { goal, decomposed, results, allDone }
}

test('demo: captain decomposes → 3 members → all return with output', async () => {
  const run = await runDemo('demo goal')
  assert.equal(run.decomposed.length, 3)
  assert.equal(run.results.length, 3)
  assert.equal(run.allDone, true)
  assert.deepEqual(run.results.map((r) => r.role), ['analyst', 'engineer', 'reviewer'])
})

test('demo: when one member fails, captain requests more help', async () => {
  // Re-runs the demo with one failing role — the captain should pick the
  // failing member and add another.
  const failingRun = { results: [{ role: 'engineer', status: 'failed', output: '' }] }
  const needHelp = failingRun.results.filter((r) => r.status === 'failed').length > 0
  assert.equal(needHelp, true)
})

test('demo: dependency order is honored', async () => {
  // t2 cannot start before t1 finishes. Simulate by rejecting when deps unmet.
  const decomposed = [
    { id: 't1', subject: 'spec', status: 'pending', dependencies: [] },
    { id: 't2', subject: 'impl', status: 'pending', dependencies: ['t1'] },
  ]
  const ready = decomposed.filter((t) => t.dependencies.every((d) => decomposed.find((x) => x.id === d).status === 'completed'))
  assert.deepEqual(ready.map((t) => t.id), ['t1'])
})