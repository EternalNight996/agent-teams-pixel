// P3 门禁：面板数据源改为「原生团队只读投影」（宿主 agentTeams 的真相）。
//   - lead 有 live Agent 且原生队里有真实成员/任务 → /teams/view 返回 source:'native'，成员/任务来自原生
//   - 原生只有领袖一人且无任务 → 不抢显示，回落本插件引擎（source:'engine'）
//   - 原生投影生效时，写端点（POST）一律拒绝：真相在宿主，本项目只读
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../lib/index.js'

function fakeReq({ method = 'GET', url = '/', headers = {}, body = null } = {}) {
  return {
    method,
    url,
    headers,
    on(evt, cb) {
      if (evt === 'data' && body !== null) cb(Buffer.from(JSON.stringify(body)))
      if (evt === 'end') cb()
      return this
    },
    destroy() {},
  }
}

function fakeRes() {
  const out = { code: 0, body: null }
  return {
    out,
    writeHead(code) { out.code = code },
    end(text) { try { out.body = JSON.parse(text) } catch { out.body = text } },
  }
}

function makeCtx({ members = [], tasks = [], agents = [] } = {}) {
  const routes = []
  const ctx = {
    llm: undefined,
    webServer: { register(route) { routes.push(route); return function dispose() {} } },
    systemPrompt: { section() { return function () {} } },
    tools: { register() { return function () {} } },
    effect(cb) { return typeof cb === 'function' ? cb() : undefined },
    on() { return function () {} },
    get(name) {
      if (name === 'settings') return { register() { return { get() { return { enabled: true, cardMode: 'full' } }, watch() {} } } }
      if (name === 'agentTeams') return { listMembers: () => members, listTasks: () => tasks }
      if (name === 'agents') return { list: () => agents, get: (id) => agents.find((a) => a.id === id) }
      if (name === 'subagents') return { startContinuable() {} }
      return undefined
    },
  }
  return { ctx, routes }
}

const route = (routes, path) => routes.find((r) => r.path === path)

const LEAD = 'session-lead-1'
const NATIVE_MEMBERS = [
  { id: LEAD, name: 'lead', role: 'lead', status: 'running', diagnostics: [] },
  { id: 'm-1', name: '研究员', role: 'teammate', status: 'idle', description: '调研', provider: 'spawn', model: 'deepseek-v4-flash', diagnostics: [] },
]
const NATIVE_TASKS = [
  { id: 't1', revision: 2, subject: '调研方案', description: '看三家', status: 'in_progress', blockedBy: [], writeScopes: ['docs/'], ownerName: '研究员', ready: false, writeScopeWarnings: [] },
]

test('原生团队有真实成员/任务 → 面板读原生（source:native，只读）', async () => {
  const { ctx, routes } = makeCtx({ members: NATIVE_MEMBERS, tasks: NATIVE_TASKS, agents: [{ id: LEAD, session: { id: LEAD } }] })
  apply(ctx)
  const res = fakeRes()
  await route(routes, '/agents-pixe/teams/view').handler(fakeReq({ url: '/agents-pixe/teams/view?lead=' + LEAD }), res)
  assert.equal(res.out.code, 200)
  assert.equal(res.out.body.source, 'native')
  assert.equal(res.out.body.readOnly, true)
  assert.equal(res.out.body.members.length, 2)
  assert.equal(res.out.body.members[1].name, '研究员')
  assert.equal(res.out.body.members[1].model, 'deepseek-v4-flash')
  assert.equal(res.out.body.tasks.length, 1)
  assert.equal(res.out.body.tasks[0].subject, '调研方案')
  assert.equal(res.out.body.tasks[0].ownerName, '研究员')
  assert.deepEqual(res.out.body.tasks[0].writeScopes, ['docs/'])
})

test('原生只有领袖一人且无任务 → 不抢显示，回落引擎（source:engine）', async () => {
  const { ctx, routes } = makeCtx({ members: [NATIVE_MEMBERS[0]], tasks: [], agents: [{ id: LEAD, session: { id: LEAD } }] })
  apply(ctx)
  const res = fakeRes()
  await route(routes, '/agents-pixe/teams/view').handler(fakeReq({ url: '/agents-pixe/teams/view?lead=no-such-team' }), res)
  assert.equal(res.out.body.source, 'engine')
})

test('原生投影生效时写端点拒绝（只读，不产生第二真相源）', async () => {
  const { ctx, routes } = makeCtx({ members: NATIVE_MEMBERS, tasks: NATIVE_TASKS, agents: [{ id: LEAD, session: { id: LEAD } }] })
  apply(ctx)
  for (const path of ['/agents-pixe/teams/tasks/create', '/agents-pixe/teams/tasks/update', '/agents-pixe/teams/halt']) {
    const res = fakeRes()
    await route(routes, path).handler(fakeReq({ method: 'POST', url: path, headers: { host: '127.0.0.1:19387' }, body: { lead: LEAD, subject: 'x' } }), res)
    assert.equal(res.out.body.ok, false, path + ' 应拒绝写')
    assert.match(String(res.out.body.error), /只读投影/, path + ' 的错误应说明只读投影')
  }
})

test('原生没有该会话的 live Agent → 回落引擎，不误判为原生', async () => {
  const { ctx, routes } = makeCtx({ members: NATIVE_MEMBERS, tasks: NATIVE_TASKS, agents: [] })
  apply(ctx)
  const res = fakeRes()
  await route(routes, '/agents-pixe/teams/view').handler(fakeReq({ url: '/agents-pixe/teams/view?lead=' + LEAD }), res)
  assert.equal(res.out.body.source, 'engine')
})
