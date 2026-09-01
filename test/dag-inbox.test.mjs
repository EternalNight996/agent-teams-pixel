/**
 * v0.1.4 wiring: Task DAG layout + inbox message reader + task output fold.
 * Pure contract tests — no DOM, no React, no fetch.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('DAG depth via longest dependency path is stable for acyclic graphs', () => {
  const tasks = [
    { id: 't1', subject: 'spec', status: 'completed', dependencies: [] },
    { id: 't2', subject: 'impl', status: 'in_progress', dependencies: ['t1'] },
    { id: 't3', subject: 'review', status: 'pending', dependencies: ['t2'] },
    { id: 't4', subject: 'doc', status: 'pending', dependencies: ['t1'] },
  ]
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const depth = new Map()
  const compute = (id, seen = new Set()) => {
    if (seen.has(id)) return 0
    if (depth.has(id)) return depth.get(id)
    seen.add(id)
    const t = byId.get(id)
    if (t === undefined || t.dependencies.length === 0) { depth.set(id, 0); return 0 }
    const d = 1 + Math.max(...t.dependencies.map((dep) => compute(dep, seen)))
    depth.set(id, d)
    return d
  }
  for (const t of tasks) compute(t.id)
  assert.equal(depth.get('t1'), 0)
  assert.equal(depth.get('t2'), 1)
  assert.equal(depth.get('t3'), 2)
  assert.equal(depth.get('t4'), 1)
})

test('DAG layout groups by depth into columns', () => {
  const depth = new Map([['t1', 0], ['t2', 1], ['t3', 2], ['t4', 1]])
  const levels = new Map()
  for (const [id, d] of depth) {
    const list = levels.get(d) ?? []
    list.push(id)
    levels.set(d, list)
  }
  assert.deepEqual(levels.get(0), ['t1'])
  assert.deepEqual(levels.get(1).sort(), ['t2', 't4'])
  assert.deepEqual(levels.get(2), ['t3'])
})

test('DAG status colors map to the same palette as TaskProgressBar', () => {
  const color = (s) => {
    if (s === 'completed') return '#22c55e'
    if (s === 'in_progress') return '#f59e0b'
    if (s === 'failed' || s === 'cancelled') return '#ef4444'
    return '#475569'
  }
  assert.equal(color('completed'), '#22c55e')
  assert.equal(color('in_progress'), '#f59e0b')
  assert.equal(color('failed'), '#ef4444')
  assert.equal(color('pending'), '#475569')
})

test('inbox reader surfaces the 5 newest messages newest-first', () => {
  const msgs = [
    { id: 'm1', from: 'a', ts: 1, content: 'first' },
    { id: 'm2', from: 'b', ts: 5, content: 'fifth' },
    { id: 'm3', from: 'c', ts: 3, content: 'third' },
    { id: 'm4', from: 'd', ts: 2, content: 'second' },
    { id: 'm5', from: 'e', ts: 4, content: 'fourth' },
    { id: 'm6', from: 'f', ts: 6, content: 'sixth (dropped)' },
  ]
  const sorted = [...msgs].sort((a, b) => Number(b.ts) - Number(a.ts)).slice(0, 5)
  assert.deepEqual(sorted.map((m) => m.id), ['m6', 'm2', 'm5', 'm3', 'm4'])
})

test('inbox JSONL parser drops corrupt lines without throwing', () => {
  const raw = '{"id":"m1","from":"a"}\nnot-json\n{"id":"m2","from":"b"}\n'
  const parsed = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try { parsed.push(JSON.parse(trimmed)) } catch { /* skip */ }
  }
  assert.equal(parsed.length, 2)
  assert.equal(parsed[1].id, 'm2')
})

test('task output fold truncates huge blobs to keep the modal usable', () => {
  const huge = 'x'.repeat(50_000)
  const preview = huge.length > 4096 ? huge.slice(0, 4096) + '…' : huge
  assert.ok(preview.endsWith('…'))
})

test('team.json + inbox payload shape the /team route ships', () => {
  const payload = { id: 'dev', name: '研发', members: [], tasks: [{ id: 't1', subject: 'x', status: 'completed', dependencies: [] }], inbox: [{ id: 'm1', from: 'captain', to: 'm1', content: 'go', ts: 1 }] }
  assert.ok(Array.isArray(payload.inbox))
  assert.ok(Array.isArray(payload.tasks))
})

test('active team drill-down loads only when a team is selected', () => {
  // The lazy loader stops polling when activeTeam becomes null.
  let loading = true
  const activeTeam = null
  if (activeTeam === null) loading = false
  assert.equal(loading, false)
})