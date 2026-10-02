// P2 计划先行（信任闸门）门禁：草案落盘 → 人确认 → 才建会话/派单。
//  - 未确认前不 spawn 成员（mock 的 startContinuable 调用次数必须为 0）
//  - confirm 后按草案名册建团队 + 逐个建任务，草案文件被消费
//  - view 一次取回 team + plan（面板单请求渲染）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildTeamFacade } from '../lib/team-engine.js'

function makeMockSub() {
  const members = []
  let calls = 0
  return {
    _calls: () => calls,
    list() { return ['spawn'] },
    getProvider(n) { return n === 'spawn' ? { name: 'spawn', capabilities: {}, inheritsParentContext: false } : undefined },
    async startContinuable({ label }) { calls += 1; const m = { id: 'sub-' + (members.length + 1), name: label, activity: 'inactive' }; members.push(m); return { childId: m.id, messageId: 'm1' } },
    async sendMessage() { return 'msg' },
    async listChildren() { return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false })) },
  }
}

const roster = [{ name: '架构师', desc: '架构师', full: 'f1' }, { name: '审查员', desc: '审查员', full: 'f2' }]
const draft = {
  teamName: '研发团队', leader: '架构师', task: '重构支付模块', provider: 'spawn',
  roster,
  members: [{ name: '架构师', role: '架构师', assignment: '出架构方案' }, { name: '审查员', role: '审查员', assignment: '审风险' }],
  tasks: [
    { id: 'task-1', subject: '出架构方案', description: '出架构方案', blockedBy: [], writeScopes: ['docs/'], kind: 'work' },
    { id: 'task-2', subject: '审风险', description: '审风险', blockedBy: ['task-1'], writeScopes: [], kind: 'review', reviewOf: 'task-1' },
  ],
}
const caller = { id: 'lead-plan' }

function facade() {
  const mock = makeMockSub()
  const dir = mkdtempSync(join(tmpdir(), 'pixe-plan-'))
  return { mock, engine: buildTeamFacade({ subagents: mock, llm: {}, teamsDir: dir, callLlm: async () => '# 汇总' }) }
}

test('草案落盘：不 spawn 任何成员，view 能一次取回 plan', async () => {
  const { mock, engine } = facade()
  const written = engine.writePlanDirect('lead-plan', draft)
  assert.equal(written.teamName, '研发团队')
  assert.equal(mock._calls(), 0, '出草案阶段不得创建任何成员')
  const view = await engine.view({ id: 'lead-plan' })
  assert.ok(view.plan, 'view 必须带 plan（面板单请求渲染）')
  assert.equal(view.plan.tasks.length, 2)
  assert.equal(view.members.length, 0, '未确认前团队名册为空')
})

test('确认草案：按名册建成员 + 逐条建任务（依赖/写域/review 保真），草案被消费', async () => {
  const { mock, engine } = facade()
  engine.writePlanDirect('lead-plan', draft)
  const r = await engine.confirmPlanDirect('lead-plan')
  assert.equal(r.confirmed, true)
  assert.equal(mock._calls(), 2, '确认后按草案名册创建 2 名成员')
  assert.equal(r.tasks.length, 2)
  const tasks = (await engine.view(caller)).tasks
  assert.equal(tasks.length, 2)
  assert.deepEqual(tasks[1].blockedBy, ['task-1'])
  assert.deepEqual(tasks[0].writeScopes, ['docs'], '写域经 normScopes 归一（去尾斜杠）')
  assert.equal(tasks[1].kind, 'review')
  assert.equal(tasks[1].reviewOf, 'task-1')
  assert.equal(engine.readPlanDirect('lead-plan'), null, '确认后草案应被消费')
})

test('丢弃草案：文件清掉，不建任何会话', async () => {
  const { mock, engine } = facade()
  engine.writePlanDirect('lead-plan', draft)
  assert.deepEqual(engine.discardPlanDirect('lead-plan'), { discarded: true })
  assert.equal(engine.readPlanDirect('lead-plan'), null)
  assert.equal(mock._calls(), 0)
})

test('没有草案时确认 → 明确报错（不静默建空团队）', async () => {
  const { mock, engine } = facade()
  await assert.rejects(() => engine.confirmPlanDirect('lead-plan'), /没有待确认的计划草案/)
  assert.equal(mock._calls(), 0)
})
