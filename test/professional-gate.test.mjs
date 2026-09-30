// P2「专业门禁」回归：角色卡的「关键规则 / 技术交付物」→ review 任务的**逐条验收判据**。
// 这是三方对比里两边都没有的能力：原生与 dsh-agent-teams 只有通用流程（需求→实现→验证→审查→集成），
// 本项目把**领域判据**抽出来当门禁，并且 fail 时自动把被审任务打回（下游继续阻塞）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { buildTeamFacade, normAcceptance, normAcceptanceResults } from '../lib/team-engine.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
process.env.DSH_HOME = mkdtempSync(join(tmpdir(), 'pixe-pro-'))
const { cardAcceptance } = await import('../lib/index.js')

const tempTeams = () => mkdtempSync(join(tmpdir(), 'pixe-pro-team-'))
function makeFacade () {
  const members = []
  const subagents = {
    list () { return ['spawn'] },
    async startContinuable ({ label }) { const m = { id: 'sub-' + (members.length + 1), name: label, activity: 'inactive' }; members.push(m); return { childId: m.id, messageId: 'm' } },
    async sendMessage () { return 'mid' },
    async listChildren () { return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false })) }
  }
  return buildTeamFacade({ subagents, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
}
const lead = { id: 'lead-pro' }
const ACC = [{ item: '不得吞异常', source: '代码审查员 · 关键规则' }, { item: '必须给出可复现的失败用例', source: '代码审查员 · 技术交付物' }]

async function workDone (f) {
  const w = await f.createTask(lead, { subject: '实现支付回调' })
  const c = await f.updateTask(lead, { taskId: w.id, expectedRevision: w.revision, action: 'claim', owner: 'A' })
  const d = await f.updateTask(lead, { taskId: w.id, expectedRevision: c.revision, action: 'complete' })
  return d
}
async function reviewTask (f, reviewOf, acceptance = ACC) {
  const r = await f.createTask(lead, { subject: '审查支付回调', kind: 'review', reviewOf, acceptance })
  const c = await f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'claim', owner: 'B' })
  return c
}

/* ---------- 纯逻辑 ---------- */

test('normAcceptance：去空/去重/保序，支持字符串与 {item,source}', () => {
  assert.deepEqual(normAcceptance(['a', { item: 'b', source: 'S' }, 'a', '  ']), [{ item: 'a', source: '' }, { item: 'b', source: 'S' }])
  assert.deepEqual(normAcceptance(null), [])
})

test('normAcceptanceResults：紧凑串 / JSON / 未提供（null）三态', () => {
  assert.equal(normAcceptanceResults(undefined), null, '没给 → null（门禁靠它判断是否自证）')
  assert.equal(normAcceptanceResults(''), null)
  assert.deepEqual(normAcceptanceResults('1:pass, 2:fail:没做幂等'), [{ index: 1, pass: true, note: undefined }, { index: 2, pass: false, note: '没做幂等' }])
  assert.deepEqual(normAcceptanceResults('1:通过, 2:不通过'), [{ index: 1, pass: true, note: undefined }, { index: 2, pass: false, note: undefined }])
  assert.deepEqual(normAcceptanceResults('[{"index":1,"pass":true}]'), [{ index: 1, pass: true, note: undefined }])
  assert.equal(normAcceptanceResults('乱七八糟'), null)
})

test('cardAcceptance：真实角色卡能抽出可判定条目，带来源标注', () => {
  const roles = JSON.parse(readFileSync(join(root, 'lib', 'roles-full.json'), 'utf8'))
  const rec = roles.zh['engineering/engineering-code-reviewer']
  const list = cardAcceptance(rec)
  assert.ok(list.length >= 3, '应从「关键规则/技术交付物」抽到条目，实际 ' + list.length)
  for (const it of list) {
    assert.ok(it.item.length >= 6 && it.item.length <= 160)
    assert.match(it.source, /代码审查员 · (关键规则|技术交付物)/)
  }
  assert.equal(new Set(list.map((x) => x.item)).size, list.length, '不应有重复条目')
  assert.deepEqual(cardAcceptance(null), [])
})

/* ---------- 门禁行为 ---------- */

test('review 任务：complete 不给 acceptance_results → 拒绝（ACCEPTANCE_UNVERIFIED）且列清单', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  const r = await reviewTask(f, w.id)
  await assert.rejects(
    () => f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete' }),
    (e) => { assert.equal(e.code, 'ACCEPTANCE_UNVERIFIED'); assert.match(e.message, /不得吞异常/); return true }
  )
  const v = await f.view(lead)
  assert.equal(v.tasks.find((t) => t.id === r.id).status, 'in_progress')
})

test('review 任务：漏判某一条 → 拒绝并点名缺哪条（不允许跳过）', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  const r = await reviewTask(f, w.id)
  await assert.rejects(
    () => f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete', acceptanceResults: '1:pass' }),
    (e) => { assert.equal(e.code, 'ACCEPTANCE_UNVERIFIED'); assert.match(e.message, /缺少第 2 条/); return true }
  )
})

test('review 任务：全部通过 → verdict=pass，被审任务保持 completed', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  const r = await reviewTask(f, w.id)
  const done = await f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete', acceptanceResults: '1:pass, 2:pass' })
  assert.equal(done.status, 'completed')
  assert.equal(done.verdict, 'pass')
  assert.equal(done.acceptanceResults.length, 2)
  const v = await f.view(lead)
  assert.equal(v.tasks.find((t) => t.id === w.id).status, 'completed')
})

test('review 任务：有一条 fail → 审查结论 fail，**被审任务自动打回 in_progress** 并记失败项', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  const r = await reviewTask(f, w.id)
  const done = await f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete', acceptanceResults: '1:pass, 2:fail:没有失败用例' })
  assert.equal(done.verdict, 'fail')
  assert.equal(done.status, 'completed', '审查任务本身出结论（fail 也是结论）')
  const v = await f.view(lead)
  const reviewed = v.tasks.find((t) => t.id === w.id)
  assert.equal(reviewed.status, 'in_progress', '被审任务应被打回，下游因此继续阻塞')
  assert.equal(reviewed.lastReviewFailures.failures[0].item, ACC[1].item)
  assert.match(String(reviewed.lastReviewFailures.failures[0].note), /没有失败用例/)
})

test('review 任务：被审任务尚未 completed → 拒绝出结论（REVIEW_TARGET_NOT_DONE）', async () => {
  const f = makeFacade()
  const w = await f.createTask(lead, { subject: '还没做完' })
  const c = await f.updateTask(lead, { taskId: w.id, expectedRevision: w.revision, action: 'claim', owner: 'A' })
  const r = await reviewTask(f, w.id)
  await assert.rejects(
    () => f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete', acceptanceResults: '1:pass, 2:pass' }),
    (e) => { assert.equal(e.code, 'REVIEW_TARGET_NOT_DONE'); return true }
  )
  assert.equal((await f.view(lead)).tasks.find((t) => t.id === w.id).status, 'in_progress')
})

test('review_of 指向不存在的任务 → NOT_FOUND', async () => {
  const f = makeFacade()
  const r = await reviewTask(f, 'task-999')
  await assert.rejects(
    () => f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'complete', acceptanceResults: '1:pass, 2:pass' }),
    (e) => { assert.equal(e.code, 'NOT_FOUND'); return true }
  )
})

test('非 review 任务：零行为变更（不需要 acceptance_results，也不产生 verdict）', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  assert.equal(w.kind, 'work')
  assert.equal(w.verdict, undefined)
  assert.deepEqual(w.acceptance, [])
})

test('review 任务的验收清单可通过 edit 调整（领袖可加/改判据）；判据变了则旧的越界判定被拒', async () => {
  const f = makeFacade()
  const w = await workDone(f)
  const r = await reviewTask(f, w.id)
  const edited = await f.updateTask(lead, { taskId: r.id, expectedRevision: r.revision, action: 'edit', acceptance: ['只看这一条'] })
  assert.equal(edited.acceptance.length, 1)
  await assert.rejects(
    () => f.updateTask(lead, { taskId: r.id, expectedRevision: edited.revision, action: 'complete', acceptanceResults: '1:pass, 2:pass' }),
    (e) => { assert.equal(e.code, 'ACCEPTANCE_UNVERIFIED'); assert.match(e.message, /超出清单范围/); return true }
  )
  const done = await f.updateTask(lead, { taskId: r.id, expectedRevision: edited.revision, action: 'complete', acceptanceResults: '1:pass' })
  assert.equal(done.verdict, 'pass')
})
