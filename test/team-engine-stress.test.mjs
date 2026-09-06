// 高保真 harness 硬压：真引擎（subagents 续聊原语 + 文件态）的边界三连 + 调度语义。
// mock 忠实复刻 subagents（startContinuable/sendMessage/listChildren），断言读 facade 返回/视图。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildTeamFacade, holdsOpenAttempt, resolvePlanDeps, decomposeFallback } from '../lib/team-engine.js'

/* mock subagents：startContinuable 建成员、sendMessage(wakeup) 置 running、listChildren 报 activity */
function makeMockSub() {
  const members = []
  let seq = 0
  return {
    list() { return ['spawn'] },
    getProvider(n) { return n === 'spawn' ? { name: 'spawn', capabilities: {}, inheritsParentContext: false } : undefined },
    async startContinuable({ provider, label, request }) {
      const m = { id: 'sub-' + (members.length + 1), name: label, activity: 'inactive' }
      members.push(m)
      return { childId: m.id, messageId: 'm' + (++seq) }
    },
    async sendMessage(sender, targetId, content) {
      const m = members.find((x) => x.id === targetId)
      if (m) m.activity = 'running'
      return 'msg' + (++seq)
    },
    async listChildren(parentId) {
      return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false }))
    },
    _setActivity(name, a) { const m = members.find((x) => x.name === name); if (m) m.activity = a },
    _drop(name) { const i = members.findIndex((x) => x.name === name); if (i >= 0) members.splice(i, 1) },
  }
}

let lastDir = null
function facade(mock) {
  const dir = mkdtempSync(join(tmpdir(), 'pixe-stress-'))
  lastDir = dir
  return buildTeamFacade({ subagents: mock, llm: {}, teamsDir: dir, callLlm: async () => '# 汇总' })
}
const caller = { id: 'lead-session' }
const roster = (names) => names.map((n) => ({ name: n, desc: n, full: 'f' + n }))
const task = (r, subject) => r.tasks.find((t) => t.subject === subject)

test('冷恢复：属主冷(从子代理注册表移除)后由空闲成员接手，任务换新 attempt', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  mock._setActivity('A', 'running')
  mock._drop('A')                        // 冷重启：A 从注册表消失 → status inactive
  const r = await f.step(caller, { waitMs: 100 })
  assert.ok(r.recovered.length >= 1, '应恢复冷停任务')
  const tA = task(r, 'T1')
  assert.equal(tA.ownerName, 'B')
  assert.equal(tA.status, 'in_progress')
  assert.ok(tA.revision > r0.revision + 1, 'revision 增长（新 attempt）')
})

test('冷恢复：无空闲成员可接手时也只释放死属主（任务落回 pending）', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  mock._setActivity('A', 'running'); mock._drop('A')
  const r = await f.step(caller, { waitMs: 100 })
  const tA = task(r, 'T1')
  assert.equal(tA.status, 'pending')
  assert.equal(tA.ownerName, undefined)
  assert.ok(r.recovered.length >= 1)
  assert.equal(r.recovered[0].member, null)
})

test('转派：reassign 把 attempt 从 A 交给 B，revision 增长，旧 owner 不再持有；旧 revision 遭 CAS 拒绝', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  const claimed = await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  const reassigned = await f.updateTask(caller, { taskId: r0.id, expectedRevision: claimed.revision, action: 'reassign', owner: 'B' })
  assert.equal(reassigned.ownerName, 'B')
  assert.equal(reassigned.revision, claimed.revision + 1)
  const v = await f.view(caller); const t = task(v, 'T1')
  assert.ok(holdsOpenAttempt('A', [t]) === false)
  assert.ok(holdsOpenAttempt('B', [t]) === true)
  await assert.rejects(() => f.updateTask(caller, { taskId: r0.id, expectedRevision: claimed.revision, action: 'release' }), /CAS conflict/)
})

test('停驻：空闲成员仍持有开放 attempt 时不续领新任务（parked），就绪任务留待下一轮', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  await f.createTask(caller, { subject: 'T2' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  mock._setActivity('A', 'inactive')     // A 做完这一轮但仍持有 T1 → 刷新为 idle
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.filter((d) => d.member === 'A').length, 0, '停驻成员 A 不续领')
  assert.ok(r.parked.includes('A'))
  assert.equal(task(r, 'T2').status, 'pending', 'T2 未被派给停驻成员')
})

test('多依赖串联：单成员按 A→B→C 推进（后序依赖未就绪不派发）', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const a1 = await f.createTask(caller, { subject: 'A1' })
  const a2 = await f.createTask(caller, { subject: 'A2', blockedBy: [a1.id] })
  const a3 = await f.createTask(caller, { subject: 'A3', blockedBy: [a2.id] })
  let r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['A1'])
  assert.equal(task(r, 'A2').status, 'pending'); assert.equal(task(r, 'A3').status, 'pending')
  await f.updateTask(caller, { taskId: a1.id, expectedRevision: task(r, 'A1').revision, action: 'complete' })
  mock._setActivity('A', 'inactive')
  r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['A2'])
  await f.updateTask(caller, { taskId: a2.id, expectedRevision: task(r, 'A2').revision, action: 'complete' })
  mock._setActivity('A', 'inactive')
  r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['A3'])
})

test('多依赖并行分支：两成员同时领 P/Q，汇合后 R 才就绪', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  const p = await f.createTask(caller, { subject: 'P' })
  const q = await f.createTask(caller, { subject: 'Q' })
  const rtask = await f.createTask(caller, { subject: 'R', blockedBy: [p.id, q.id] })
  let r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 2)
  assert.deepEqual(r.dispatched.map((d) => d.subject).sort(), ['P', 'Q'])
  assert.equal(task(r, 'R').status, 'pending')
  mock._setActivity('A', 'inactive'); mock._setActivity('B', 'inactive')
  await f.updateTask(caller, { taskId: p.id, expectedRevision: task(r, 'P').revision, action: 'complete' })
  await f.updateTask(caller, { taskId: q.id, expectedRevision: task(r, 'Q').revision, action: 'complete' })
  r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['R'])
})

test('max 成员并发上限：每成员每步最多领一项，超出留待下一轮', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  const ids = []
  for (let i = 1; i <= 4; i++) { const t = await f.createTask(caller, { subject: 'T' + i }); ids.push(t.id) }
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 2)
  assert.deepEqual(r.dispatched.map((d) => d.member).sort(), ['A', 'B'])
  assert.equal(task(r, 'T3').status, 'pending'); assert.equal(task(r, 'T4').status, 'pending')
})

test('空闲成员自动续领：完成当前任务回 idle 后，下一步领下一个就绪任务', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const t1 = await f.createTask(caller, { subject: 'T1' })
  await f.createTask(caller, { subject: 'T2' })
  let r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['T1'])
  mock._setActivity('A', 'inactive')
  await f.updateTask(caller, { taskId: t1.id, expectedRevision: task(r, 'T1').revision, action: 'complete' })
  r = await f.step(caller, { waitMs: 100 })
  assert.deepEqual(r.dispatched.map((d) => d.subject), ['T2'])
})

test('report 草稿归档：有未完成任务时不合最终报告，但归档为草稿', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  await f.createTask(caller, { subject: 'T2' })
  const c = await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: c.revision, action: 'complete' })
  const r = await f.report(caller, { task: 'goal', teamName: 'T' })
  assert.equal(r.done, 1); assert.equal(r.open, 1)
  assert.equal(r.report, '', 'open>0 不合成')
  assert.equal(r.archived, true)
  const snap = JSON.parse(readFileSync(join(lastDir, 'lead-session.json'), 'utf8'))
  assert.ok(snap.archivedAt > 0); assert.equal(snap.openCount, 1)
})

test('report 全完成：合成最终报告并归档（正式）', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  const c = await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: c.revision, action: 'complete' })
  const r = await f.report(caller, { task: 'goal', teamName: 'T' })
  assert.equal(r.open, 0); assert.ok(r.report.length > 0)
  const snap = JSON.parse(readFileSync(join(lastDir, 'lead-session.json'), 'utf8'))
  assert.ok(snap.lastReport.length > 0); assert.equal(snap.openCount, 0)
})

test('resolvePlanDeps：剔自依赖/前向/非法引用，保留合法前序', () => {
  const plan = [
    { subject: 'A', blockedBy: [] },
    { subject: 'B', blockedBy: [0] },
    { subject: 'C', blockedBy: [1, 2] },
    { subject: 'D', blockedBy: [2, 3, 99, -1, 'x'] },
  ]
  const { resolved, warnings } = resolvePlanDeps(plan)
  assert.deepEqual(resolved[0].blocked, [])
  assert.deepEqual(resolved[1].blocked, [0])
  assert.deepEqual(resolved[2].blocked, [1])
  assert.deepEqual(resolved[3].blocked, [2])
  assert.ok(warnings.length >= 4)
  assert.ok(warnings.some((w) => w.reason === 'self-dep'))
  assert.ok(warnings.some((w) => w.reason === 'forward-ref'))
  assert.ok(warnings.some((w) => w.reason === 'invalid-ref'))
  for (const r of resolved) for (const idx of r.blocked) assert.ok(idx < r.i)
})

test('decomposeFallback：拆解失败退化为各成员并行处理同一整体任务', () => {
  const task = '一个很长很长的目标，用于验证兜底时截断与每人一任务'
  const fb = decomposeFallback(task, [{ name: 'A' }, { name: 'B' }, { name: 'C' }])
  assert.equal(fb.length, 3)
  assert.equal(fb[0].blockedBy.length, 0)
  assert.equal(fb[0].description, task)
  assert.ok(fb[1].subject.startsWith('2. '))
})

test('同一 step：任务认领不重复（used 屏障），多个空闲成员不抢占同一就绪任务', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  await f.createTask(caller, { subject: 'T1' })
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 1)
  assert.equal(task(r, 'T1').ownerName, 'A')
})

test('跨 step 幂等：已认领任务不重复派发', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A']) })
  await f.createTask(caller, { subject: 'T1' })
  await f.step(caller, { waitMs: 100 })
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 0)
  assert.equal(task(r, 'T1').status, 'in_progress')
})

test('CAS 防并发双领：过期 revision 认领被拒', async () => {
  const mock = makeMockSub(); const f = facade(mock)
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  await assert.rejects(() => f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'B' }), /CAS conflict/)
})
