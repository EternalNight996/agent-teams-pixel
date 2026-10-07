// team-engine 单测：纯逻辑（依赖就绪 / 状态机 / 停驻 / 冷停）+ 调度器行为（mock subagents）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { computeReady, holdsOpenAttempt, strandedCold, transitionAllowed, orderNum, buildTeamFacade } from '../lib/team-engine.js'

const mkTask = (id, status, o) => ({ id, revision: 1, subject: 't' + id, description: '', status, blockedBy: [], ownerName: undefined, ready: false, ...(o || {}) })

test('computeReady：无依赖即就绪；依赖全 done 才就绪', () => {
  const a = mkTask('a', 'pending')
  assert.equal(computeReady(a, [a]), true)
  const b = mkTask('b', 'pending', { blockedBy: ['a'] })
  assert.equal(computeReady(b, [b, mkTask('a', 'pending')]), false)
  assert.equal(computeReady(b, [b, mkTask('a', 'completed')]), true)
})

test('computeReady：非 pending 不算就绪；缺依赖返回 false', () => {
  assert.equal(computeReady(mkTask('a', 'in_progress'), []), false)
  const b = mkTask('b', 'pending', { blockedBy: ['missing'] })
  assert.equal(computeReady(b, [b]), false)
})

test('transitionAllowed：attempt 状态机合法迁移', () => {
  assert.equal(transitionAllowed(mkTask('x', 'pending'), 'claim'), true)
  assert.equal(transitionAllowed(mkTask('x', 'pending'), 'complete'), false)
  assert.equal(transitionAllowed(mkTask('x', 'in_progress'), 'complete'), true)
  assert.equal(transitionAllowed(mkTask('x', 'in_progress'), 'release'), true)
  assert.equal(transitionAllowed(mkTask('x', 'completed'), 'reopen'), true)
  assert.equal(transitionAllowed(mkTask('x', 'pending'), 'reassign'), true)
  assert.equal(transitionAllowed(mkTask('x', 'deleted'), 'claim'), false)
})

test('holdsOpenAttempt：存在归属自己且在做的任务才为真', () => {
  const tasks = [mkTask('a', 'in_progress', { ownerName: 'A' }), mkTask('b', 'pending')]
  assert.equal(holdsOpenAttempt('A', tasks), true)
  assert.equal(holdsOpenAttempt('B', tasks), false)
})

test('strandedCold：属主 inactive/failed 判定冷停遗留；running 不算', () => {
  const r = new Map([['A', { name: 'A', status: 'running' }]])
  assert.equal(strandedCold(mkTask('a', 'in_progress', { ownerName: 'A' }), r), false)
  const cold = new Map([['A', { name: 'A', status: 'inactive' }]])
  assert.equal(strandedCold(mkTask('a', 'in_progress', { ownerName: 'A' }), cold), true)
  assert.equal(strandedCold(mkTask('a', 'completed', { ownerName: 'A' }), cold), false)
  assert.equal(strandedCold(mkTask('a', 'in_progress'), new Map()), false)
})

test('orderNum：取 id 数字序', () => {
  assert.equal(orderNum('task-3'), 3)
  assert.equal(orderNum('task-10') > orderNum('task-2'), true)
  assert.equal(orderNum('none'), 0)
})

/* ---------- 调度器行为（mock subagents：startContinuable/sendMessage/listChildren） ---------- */
function makeMockSub() {
  const members = []
  let seq = 0
  return {
    list() { return ['spawn'] },
    async startContinuable({ provider, label }) {
      const m = { id: 'sub-' + (members.length + 1), name: label, activity: 'inactive' }
      members.push(m); return { childId: m.id, messageId: 'm' + (++seq) }
    },
    async sendMessage(sender, targetId) {
      const m = members.find((x) => x.id === targetId); if (m) m.activity = 'running'; return 'msg' + (++seq)
    },
    async listChildren(parentId) {
      return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false }))
    },
  }
}
function buildFacade(mock) {
  return buildTeamFacade({ subagents: mock, llm: {}, teamsDir: mkdtempSync(join(tmpdir(), 'pixe-')), callLlm: async () => '# 汇总' })
}
const caller = { id: 'lead-session' }
const roster = (names) => names.map((n) => ({ name: n, desc: n, full: 'f' + n }))
const task = (r, subject) => r.tasks.find((t) => t.subject === subject)

test('createTeam：创建一个团队并生成可续聊成员；再次调用幂等返回现有名册', async () => {
  const f = buildFacade(makeMockSub())
  const r = await f.createTeam(caller, { roster: roster(['A', 'B']) })
  assert.equal(r.created, true)
  assert.equal(r.members.length, 2)
  const r2 = await f.createTeam(caller, { roster: roster(['C']) })
  assert.equal(r2.created, false)
  assert.equal(r2.members.length, 2)
})

test('step：为每个空闲成员原子领取一项就绪任务并唤醒（CAS）', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  await f.createTask(caller, { subject: 'T1' })
  await f.createTask(caller, { subject: 'T2' })
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 2)
  assert.deepEqual(r.dispatched.map((d) => d.member).sort(), ['A', 'B'])
  assert.equal(r.dispatched[0].revision > 1, true, '新 attempt revision')
})

test('updateTask：CAS 版本冲突被拒绝（转派撤销旧 attempt 靠 revision 校验）', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A']) })
  const r0 = await f.createTask(caller, { subject: 'T1' })
  const claimed = await f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'claim', owner: 'A' })
  assert.equal(claimed.status, 'in_progress')
  await assert.rejects(() => f.updateTask(caller, { taskId: r0.id, expectedRevision: r0.revision, action: 'complete' }), /CAS conflict/)
  const done = await f.updateTask(caller, { taskId: r0.id, expectedRevision: claimed.revision, action: 'complete' })
  assert.equal(done.status, 'completed')
})

test('step：依赖未完成的任务不被领取（显式依赖）', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A']) })
  const b = await f.createTask(caller, { subject: 'B' })
  await f.createTask(caller, { subject: 'C', blockedBy: ['x-not-done'] })
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.dispatched.length, 1)
  assert.equal(r.dispatched[0].taskId, b.id)
})

/* ---------- halt + lastStep + direct mutators（面板质量闸 + 写操作） ---------- */
test('halt 状态下 step 只刷新成员状态不派单，且 lastStep.halted=true 留给面板读', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A', 'B']) })
  await f.createTask(caller, { subject: 'T1' })
  await f.createTask(caller, { subject: 'T2' })
  f.setHaltedDirect(caller.id, true)
  const r = await f.step(caller, { waitMs: 100 })
  assert.equal(r.halted, true)
  assert.equal(r.dispatched.length, 0)
  assert.ok(r.lastStep && r.lastStep.halted === true, 'lastStep 标记 halted 供面板读')
  const v = await f.view(caller)
  assert.equal(v.halted, true)
  assert.ok(v.lastStep && v.lastStep.halted === true, 'view 返回 halted + lastStep')
})

test('resume 后 step 恢复正常派单；setHaltedDirect 自身写落盘', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A']) })
  await f.createTask(caller, { subject: 'T1' })
  f.setHaltedDirect(caller.id, true)
  const halted = await f.step(caller, { waitMs: 100 })
  assert.equal(halted.dispatched.length, 0)
  f.setHaltedDirect(caller.id, false)
  const resumed = await f.step(caller, { waitMs: 100 })
  assert.equal(resumed.dispatched.length, 1)
  assert.equal(resumed.lastStep.halted, false)
})

test('addTaskDirect / editTaskDirect / deleteTaskDirect 走 CAS + lastStep + view 过滤 deleted', async () => {
  const f = buildFacade(makeMockSub())
  await f.createTeam(caller, { roster: roster(['A']) })
  const t = await f.addTaskDirect(caller.id, { subject: '调研', description: '背景', blockedBy: [] })
  assert.ok(t.id && t.status === 'pending', 'addTaskDirect 建任务（rev=1）')
  /* 第一次 edit 用 t.revision 应当成功，CAS 拒绝旧 revision */
  const t2 = await f.editTaskDirect(caller.id, { taskId: t.id, expectedRevision: t.revision, action: 'edit', subject: '调研-v2' })
  assert.equal(t2.subject, '调研-v2')
  assert.ok(t2.revision > t.revision, 'edit 成功 bump revision')
  await assert.rejects(() => f.editTaskDirect(caller.id, { taskId: t.id, expectedRevision: t.revision, action: 'edit' }), /CAS conflict/)
  /* delete → status deleted，不再 view 出来 */
  await f.deleteTaskDirect(caller.id, t.id, t2.revision)
  const v = await f.view(caller)
  assert.equal(v.tasks.find((x) => x.id === t.id), undefined, 'view 已过滤 deleted')
  /* 最后一次 step 写 lastStep */
  await f.addTaskDirect(caller.id, { subject: 'after-delete' })
  const r = await f.step(caller, { waitMs: 100 })
  assert.ok(r.lastStep && Array.isArray(r.lastStep.dispatched), 'step 写 lastStep')
})

/* ---------- 确认草案必须挂真实 parent（真跑 plan_confirm 才发现的 bug） ----------
 * 现象：面板/工具的确认路径曾经传 `directCaller(l)`（只有 {id} 的假对象）当 parent，
 * 宿主 spawn 续聊成员时读到 undefined，报 `Cannot read properties of undefined (reading 'header')`，
 * 表现为「未能创建任何成员」。对照实验：同样名册，直接路径（真实 exec.agent）一次跑通。
 * 建任务是纯 CAS，假 caller 等价；**spawn 成员不行** —— 这两件事必须分开对待。 */

test('confirmPlanDirect：没有真实 parent 必须明确拒绝，而不是拿假 caller 去 spawn', async () => {
  const f = buildFacade(makeMockSub())
  f.writePlanDirect('lead-session', { roster: roster(['A']), tasks: [] })
  await assert.rejects(
    () => f.confirmPlanDirect('lead-session', null),
    /真实存活的 Agent/,
    '没有 parent 时必须抛可读错误'
  )
  assert.ok(f.readPlanDirect('lead-session'), '拒绝后草案必须仍在（不能被消费掉）')
})

test('confirmPlanDirect：带真实 parent 时，spawn 用的就是它，且任务照常建出来', async () => {
  const seen = []
  const mock = makeMockSub()
  const rawStart = mock.startContinuable.bind(mock)
  mock.startContinuable = async (spec) => { seen.push(spec.request && spec.request.parent); return rawStart(spec) }
  const f = buildFacade(mock)
  f.writePlanDirect('lead-session', { roster: roster(['A', 'B']), tasks: [{ subject: 't1', description: 'd', blockedBy: [] }] })
  const realParent = { id: 'lead-session', tag: 'REAL-AGENT' }
  const res = await f.confirmPlanDirect('lead-session', null, undefined, realParent)
  assert.equal(res.confirmed, true)
  assert.equal(res.members.length, 2)
  assert.equal(res.tasks.length, 1)
  assert.equal(seen.length, 2, '两个成员各 spawn 一次')
  for (const p of seen) assert.equal(p, realParent, 'startContinuable 的 parent 必须是调用方传入的真实对象')
  assert.equal(f.readPlanDirect('lead-session'), null, '确认成功后草案被消费')
})

/* ---------- 一次性编排的快照：让它「持续可查」而不是查无此队 ----------
 * 现象：agents_pixe_team 的非引擎路径直接在宿主里跑完就返回，磁盘上什么都不写，
 * 于是面板/会话头/回合尾卡在跑完后依然显示「还没有活动团队」。 */
test('view() 必须带出 lastReport / archivedAt / oneShot（团队结束后界面才有东西可显示）', async () => {
  const g = buildFacade(makeMockSub())
  g.recordRunDirect('lead-o', { members: [{ name: 'A' }], tasks: [{ subject: 'x' }], report: '# 最终报告正文' })
  const v1 = await g.view({ id: 'lead-o' })
  assert.equal(v1.lastReport, '# 最终报告正文', 'view 不带 lastReport → 面板永远看不到成果')
  assert.equal(v1.oneShot, true, 'oneShot 要能透出去，面板据此隐藏暂停按钮')
  assert.ok(v1.archivedAt, 'archivedAt 要能透出去')

  /* 引擎路径：刚建团还没归档时字段也要存在（类型稳定，客户端不用判 undefined） */
  const f = buildFacade(makeMockSub())
  await f.createTeam({ id: 'lead-r' }, { roster: roster(['A']) })
  const v0 = await f.view({ id: 'lead-r' })
  assert.equal(typeof v0.lastReport, 'string')
  assert.equal(v0.oneShot, false)
  assert.equal(v0.archivedAt, null)
})

test('recordRunDirect：一次性编排也留快照，面板才能持续显示', async () => {
  const f = buildFacade(makeMockSub())
  const r = f.recordRunDirect('lead-oneshot', {
    teamName: '研发团队', provider: 'spawn', report: '# 报告',
    members: [{ name: 'A' }, { name: 'B' }],
    tasks: [{ subject: 't1', ownerName: 'A' }, { subject: 't2', ownerName: 'B' }],
  })
  assert.equal(r.recorded, true)
  assert.equal(r.members, 2)
  assert.equal(r.tasks, 2)
  const v = await f.view({ id: 'lead-oneshot' })
  assert.equal(v.members.length, 2, '成员要能被 view 出来（面板/入口都读它）')
  assert.equal(v.tasks.length, 2)
  assert.ok(v.tasks.every((t) => t.status === 'completed'), '快照任务标记 completed：step 不会去派发不存在的成员')
  assert.equal(v.members.some((m) => m.name === 'A'), true)
})

test('recordRunDirect：已有真团队状态时绝不覆盖', async () => {
  const g = buildFacade(makeMockSub())
  await g.createTeam({ id: 'lead-real' }, { roster: roster(['X']) })
  const r2 = g.recordRunDirect('lead-real', { members: [{ name: 'Y' }], tasks: [] })
  assert.equal(r2.recorded, false)
  assert.equal(r2.reason, 'existing')
  const v2 = await g.view({ id: 'lead-real' })
  assert.equal(v2.members.length, 1)
  assert.equal(v2.members[0].name, 'X', '真团队的成员不能被一次性快照覆盖')
})
