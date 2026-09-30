// 写域（writeScopes）确定性硬拦回归：
//   声明了写域的任务，完成时必须上报 changed_paths 且全部落在域内；越界或缺字段一律拒绝完成。
//   这是本项目相对 DSH 原生「writeScopes + 仅 advisory 警告」的**可证伪优势点**。
//   未声明写域的任务 = 零行为变更（不要求 changed_paths）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildTeamFacade, normScopes, normPaths, pathInScope } from '../lib/team-engine.js'

const tempTeams = () => mkdtempSync(join(tmpdir(), 'pixe-scope-gate-'))
function makeMockSub () {
  const members = []
  return {
    list () { return ['spawn'] },
    async startContinuable ({ label }) { const m = { id: 'sub-' + (members.length + 1), name: label, activity: 'inactive' }; members.push(m); return { childId: m.id, messageId: 'm' } },
    async sendMessage () { return 'mid' },
    async listChildren () { return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false })) }
  }
}
function makeFacade () {
  return buildTeamFacade({ subagents: makeMockSub(), llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
}
const lead = { id: 'lead-ws' }

async function setup (writeScopes) {
  const f = makeFacade()
  await f.createTeam(lead, { roster: [{ name: 'A', seed: 'sA' }] })
  const t = await f.createTask(lead, { subject: '改支付模块', description: 'd', writeScopes })
  const claimed = await f.updateTask(lead, { taskId: t.id, expectedRevision: t.revision, action: 'claim', owner: 'A' })
  return { f, task: claimed }
}

/* ---------- 纯逻辑 ---------- */

test('normScopes / normPaths：数组与逗号串都吃，反斜杠与 ./ 归一，空值区分', () => {
  assert.deepEqual(normScopes('src/a, src\\b/,  tests/ '), ['src/a', 'src/b', 'tests'])
  assert.deepEqual(normScopes(['src\\x', './y']), ['src/x', 'y'])
  assert.deepEqual(normScopes(''), [])
  assert.equal(normPaths(undefined), null, '未上报 → null（与「上报空」区分）')
  assert.deepEqual(normPaths(''), null)
  assert.deepEqual(normPaths('a\\b, c'), ['a/b', 'c'])
})

test('pathInScope：目录前缀 / 完全相等 / 相对↔绝对混用都算在域内；明显域外不算', () => {
  assert.equal(pathInScope('src/a.ts', ['src']), true, '目录前缀')
  assert.equal(pathInScope('src/a.ts', ['src/a.ts']), true, '完全相等')
  assert.equal(pathInScope('F:/proj/src/a.ts', ['src/a.ts']), true, '绝对路径 vs 相对域')
  assert.equal(pathInScope('F:/proj/src/a.ts', ['src']), true, '绝对路径含域段')
  assert.equal(pathInScope('SRC/A.TS', ['src']), true, '大小写不敏感')
  assert.equal(pathInScope('other/b.ts', ['src']), false, '域外')
  assert.equal(pathInScope('secrets/.env', ['src']), false, '域外（前缀相近但不同段）')
})

/* ---------- 硬拦行为 ---------- */

test('声明写域后：complete 不带 changed_paths → 拒绝（SCOPE_UNVERIFIED），任务留在 in_progress', async () => {
  const { f, task } = await setup(['src/payments'])
  await assert.rejects(
    () => f.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'complete' }),
    /SCOPE_UNVERIFIED|changed_paths/
  )
  const v = await f.view(lead)
  assert.equal(v.tasks.find((t) => t.id === task.id).status, 'in_progress', '被拒后不得置为 completed')
})

test('声明写域后：changed_paths 全在域内 → 正常完成，并记录 lastScopeCheck', async () => {
  const { f, task } = await setup(['src/payments', 'tests/payments'])
  const done = await f.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'complete', changedPaths: ['src/payments/pay.ts', 'tests/payments/pay.test.ts'] })
  assert.equal(done.status, 'completed')
  assert.equal(done.lastScopeCheck.ok, true)
  assert.equal(done.lastScopeCheck.changed.length, 2)
})

test('声明写域后：有一个越界路径 → 拒绝并列出违例，任务不完成', async () => {
  const { f, task } = await setup(['src/payments'])
  await assert.rejects(
    () => f.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'complete', changedPaths: ['src/payments/pay.ts', 'src/auth/login.ts'] }),
    (e) => {
      assert.equal(e.code, 'SCOPE_VIOLATION')
      assert.match(e.message, /src\/auth\/login\.ts/, '错误里要点名越界文件')
      return true
    }
  )
  const v = await f.view(lead)
  assert.equal(v.tasks.find((t) => t.id === task.id).status, 'in_progress')
})

test('领袖可 edit + write_scopes 显式放宽写域（越界 → 放宽 → 通过）', async () => {
  const { f, task } = await setup(['src/payments'])
  await assert.rejects(
    () => f.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'complete', changedPaths: ['src/auth/login.ts'] }),
    (e) => { assert.equal(e.code, 'SCOPE_VIOLATION'); return true }
  )
  const v0 = (await f.view(lead)).tasks.find((t) => t.id === task.id)
  const widened = await f.updateTask(lead, { taskId: task.id, expectedRevision: v0.revision, action: 'edit', writeScopes: ['src/payments', 'src/auth'] })
  assert.deepEqual(widened.writeScopes, ['src/payments', 'src/auth'])
  const done = await f.updateTask(lead, { taskId: task.id, expectedRevision: widened.revision, action: 'complete', changedPaths: ['src/auth/login.ts'] })
  assert.equal(done.status, 'completed')
})

test('edit + write_scopes="" → 取消写域，之后完成不再要求 changed_paths', async () => {
  const { f, task } = await setup(['src/payments'])
  const v0 = (await f.view(lead)).tasks.find((t) => t.id === task.id)
  const cleared = await f.updateTask(lead, { taskId: task.id, expectedRevision: v0.revision, action: 'edit', writeScopes: [] })
  assert.deepEqual(cleared.writeScopes, [])
  const done = await f.updateTask(lead, { taskId: task.id, expectedRevision: cleared.revision, action: 'complete' })
  assert.equal(done.status, 'completed')
})

test('未声明写域的任务：零行为变更（complete 不需要 changed_paths）', async () => {
  const f = makeFacade()
  await f.createTeam(lead, { roster: [{ name: 'A', seed: 'sA' }] })
  const t = await f.createTask(lead, { subject: '普通任务' })
  assert.deepEqual(t.writeScopes, [])
  const c = await f.updateTask(lead, { taskId: t.id, expectedRevision: t.revision, action: 'claim', owner: 'A' })
  const done = await f.updateTask(lead, { taskId: t.id, expectedRevision: c.revision, action: 'complete' })
  assert.equal(done.status, 'completed')
})

test('派单唤醒语里带出写域与 changed_paths 要求（成员知道规则，不靠猜）', async () => {
  const f = makeFacade()
  const mock = { sent: [], sub: null }
  await f.createTeam(lead, { roster: [{ name: 'A', seed: 'sA' }] })
  const t = await f.createTask(lead, { subject: '改支付', writeScopes: ['src/payments'] })
  await f.step(lead, { waitMs: 1 })
  const v = await f.view(lead)
  assert.ok(v.tasks.length > 0)
  assert.deepEqual(v.tasks.find((x) => x.id === t.id).writeScopes, ['src/payments'])
})
