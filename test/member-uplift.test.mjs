// P0「追平两家」三项改动的专项回归：
//   a) 成员种子粒度 —— 默认只注角色卡的「专业核心三章」，整卡按需取（省 token，且不失专业人格）
//   b) 成员 LLM 路由 —— agentOptions 下发；provider 不支持时降级并记 degraded（不静默）
//   c) 成员出厂工具白名单 —— toolFilter 下发（能力绑定的物理执行层）
//   d) 成员 ↔ 成员直达 —— 引擎用领袖 Agent 引用做邻接投递（宿主 sendMessage 不支持兄弟邻接）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { buildTeamFacade } from '../lib/team-engine.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/* 测试不打真实用户目录：lib/index.js 在模块加载时读 DSH_HOME */
process.env.DSH_HOME = mkdtempSync(join(tmpdir(), 'pixe-home-'))
const { apply, cardSeed, Config } = await import('../lib/index.js')

const tempTeams = () => mkdtempSync(join(tmpdir(), 'pixe-teams-'))

/* ---------- a) 种子粒度：用真实 508 张卡量化 ---------- */

test('cardSeed：key 模式只保留专业核心三章，且对全部真实角色卡都有可观压缩', () => {
  const data = JSON.parse(readFileSync(join(root, 'lib', 'roles-full.json'), 'utf8'))
  let cards = 0
  let withSections = 0
  let fullChars = 0
  let seedChars = 0
  for (const lang of ['en', 'zh']) {
    for (const rec of Object.values(data[lang] || {})) {
      const full = String(rec.full || '')
      if (!full) continue
      cards++
      fullChars += full.length
      const seed = cardSeed(rec, 'key')
      seedChars += seed.length
      if (seed !== full) withSections++
    }
  }
  assert.ok(cards >= 400, '角色卡样本应 ≥400，实际 ' + cards)
  const coverage = withSections / cards
  const reduction = 1 - seedChars / fullChars
  /* 实测基线（508 张）：命中率 95.7%、压缩率 66.3%。阈值留出余量，但一旦回退到整卡就会红。 */
  assert.ok(coverage >= 0.9, '命中三章的卡占比应 ≥90%，实际 ' + (coverage * 100).toFixed(1) + '%')
  assert.ok(reduction >= 0.55, '整卡→种子应至少省 55% 字符，实际 ' + (reduction * 100).toFixed(1) + '%')
})

test('cardSeed：三个章节标题都在，且不含被排除的叙事章节', () => {
  const data = JSON.parse(readFileSync(join(root, 'lib', 'roles-full.json'), 'utf8'))
  const rec = Object.values(data.zh).find((r) => /##\s*关键规则/.test(String(r.full || '')))
  assert.ok(rec, '应能找到含「关键规则」章节的中文卡')
  const seed = cardSeed(rec, 'key')
  assert.match(seed, /## 核心使命|## 关键规则/, '种子应含专业章节')
  assert.ok(seed.includes('# ' + rec.name), '种子应保留卡名')
  assert.ok(!/##\s*身份与记忆/.test(seed), '种子不应包含「身份与记忆」叙事章节')
})

test('cardSeed：卡结构不含三章时回退整卡；full 模式原样返回', () => {
  const odd = { name: '奇形卡', desc: 'd', full: '# 奇形卡\n\n## 别的章节\n内容' }
  assert.equal(cardSeed(odd, 'key'), odd.full, '无三章 → 整卡兜底（宁可贵，不失人格）')
  const rec = { name: 'x', desc: 'd', full: '# x\n\n## 关键规则\n- a' }
  assert.equal(cardSeed(rec, 'full'), rec.full)
  assert.equal(cardSeed(null, 'key'), '')
})

/* ---------- b/c) spawn 规格：路由 + 工具白名单 + 降级 ---------- */

function makeMockSub (opts = {}) {
  const calls = { start: [], send: [] }
  const members = []
  let seq = 0
  return {
    calls,
    async startContinuable (spec) {
      calls.start.push(spec)
      const req = spec.request || {}
      if (opts.rejectCaps && (req.agentOptions || req.toolFilter || req.persona)) {
        const e = new Error('subagent provider "acp" does not support the "agentOptions" capability')
        e.code = 'UNSUPPORTED_CAPABILITY'
        throw e
      }
      const m = { id: 'sub-' + (members.length + 1), name: spec.label, activity: 'inactive' }
      members.push(m)
      return { childId: m.id, messageId: 'm' + (++seq) }
    },
    async sendMessage (sender, targetId, content) {
      calls.send.push({ sender, targetId, text: (content && content[0] && content[0].text) || '' })
      const m = members.find((x) => x.id === targetId)
      if (m) m.activity = 'running'
      return 'msg' + (++seq)
    },
    async listChildren () {
      return members.map((m) => ({ id: m.id, activity: m.activity, mode: 'continuable', label: m.name, kind: 'child', hasChildren: false }))
    },
    list () { return ['spawn'] }
  }
}

test('spawn 带 agentOptions / toolFilter / persona，并如实记到成员上（面板可见用的是什么模型）', async () => {
  const mock = makeMockSub()
  const facade = buildTeamFacade({ subagents: mock, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
  const lead = { id: 'lead-1' }
  const res = await facade.createTeam(lead, {
    roster: [{ name: 'A', seed: 'seedA', toolFilter: { deny: ['edit'] } }],
    spawn: { agentOptions: { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'high' }, toolFilter: { allow: ['read'] }, persona: '资深审查员' }
  })
  const req = mock.calls.start[0].request
  assert.deepEqual(req.agentOptions, { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'high' })
  assert.deepEqual(req.toolFilter, { deny: ['edit'] }, '成员级 toolFilter 优先于全局')
  assert.equal(req.persona, '资深审查员')
  assert.match(req.prompt[0].text, /seedA/)
  assert.equal(res.members[0].model, 'deepseek-v4-pro')
  assert.equal(res.members[0].reasoningEffort, 'high')
  assert.equal(res.members[0].degraded, undefined)
})

test('provider 不支持这些能力时：降级重试 + 不静默（成员建得出来，并标 degraded）', async () => {
  const mock = makeMockSub({ rejectCaps: true })
  const facade = buildTeamFacade({ subagents: mock, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
  const res = await facade.createTeam({ id: 'lead-1' }, {
    roster: [{ name: 'A', seed: 'seedA' }],
    spawn: { agentOptions: { model: 'x' }, toolFilter: { deny: ['write'] } }
  })
  assert.equal(mock.calls.start.length, 2, '第一次带能力被拒 → 第二次裸请求')
  assert.equal(mock.calls.start[1].request.agentOptions, undefined)
  assert.equal(res.members.length, 1, '降级后成员仍应创建成功')
  assert.match(String(res.members[0].degraded || ''), /不支持/)
  assert.equal(res.members[0].model, undefined)
})

test('后端报非能力类错误时不吞：原样计入 spawnErrors（成员 0 → NO_MEMBERS）', async () => {
  const mock = makeMockSub()
  mock.startContinuable = async () => { throw new Error('backend exploded') }
  const facade = buildTeamFacade({ subagents: mock, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
  await assert.rejects(
    () => facade.createTeam({ id: 'lead-1' }, { roster: [{ name: 'A', seed: 's' }], spawn: { agentOptions: { model: 'x' } } }),
    /NO_MEMBERS|backend exploded/
  )
})

/* ---------- d) 成员 ↔ 成员直达 ---------- */

test('成员发给队友：由引擎以领袖引用做邻接投递，内容标注来源，并记入 messages', async () => {
  const mock = makeMockSub()
  const facade = buildTeamFacade({ subagents: mock, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
  const lead = { id: 'lead-1' }
  await facade.createTeam(lead, { roster: [{ name: 'A', seed: 'sA' }, { name: 'B', seed: 'sB' }] })
  const view = await facade.view(lead)
  const [a, b] = view.members
  const r = await facade.message({ id: a.id }, { target: 'B', content: '帮我看下这个接口' })
  const sent = mock.calls.send.at(-1)
  assert.equal(sent.sender, lead, '应以领袖 Agent 引用投递（兄弟不邻接）')
  assert.equal(sent.targetId, b.id, '目标应是队友的会话 id')
  assert.match(sent.text, /来自队友 A/)
  assert.match(sent.text, /帮我看下这个接口/)
  assert.equal(r.relayed, true)
  assert.equal(r.to, 'B')
  const after = await facade.view(lead)
  assert.equal(after.messages.length, 1)
  assert.equal(after.messages[0].relayed, true)
})

test('成员发给 @lead：仍用成员自己是发送者（走子→父邻接），并落 inbox', async () => {
  const mock = makeMockSub()
  const facade = buildTeamFacade({ subagents: mock, llm: {}, teamsDir: tempTeams(), callLlm: async () => '# r' })
  const lead = { id: 'lead-1' }
  await facade.createTeam(lead, { roster: [{ name: 'A', seed: 'sA' }] })
  const view = await facade.view(lead)
  const member = { id: view.members[0].id }
  const r = await facade.message(member, { target: '@lead', content: '我做完了' })
  const sent = mock.calls.send.at(-1)
  assert.equal(sent.sender, member, '成员→领袖不代理，保持真实发送者')
  assert.equal(sent.targetId, 'lead-1')
  assert.equal(sent.text, '我做完了', '成员→领袖不加「来自队友」前缀')
  assert.equal(r.relayed, false, '成员→领袖不代理')
})

test('领袖引用不在本进程（如重启后成员先发言）：给出可操作错误，且领袖任意引擎调用后自愈', async () => {
  const dir = tempTeams()
  const mock1 = makeMockSub()
  const f1 = buildTeamFacade({ subagents: mock1, llm: {}, teamsDir: dir, callLlm: async () => '# r' })
  await f1.createTeam({ id: 'lead-1' }, { roster: [{ name: 'A', seed: 'sA' }, { name: 'B', seed: 'sB' }] })
  const aId = (await f1.view({ id: 'lead-1' })).members[0].id

  const mock2 = makeMockSub()
  const f2 = buildTeamFacade({ subagents: mock2, llm: {}, teamsDir: dir, callLlm: async () => '# r' })
  await assert.rejects(() => f2.message({ id: aId }, { target: 'B', content: 'hi' }), /NO_TRANSPORT|请改发 @lead/)

  // 领袖调一次引擎工具 → 重新登记引用 → 成员又能直达
  await f2.step({ id: 'lead-1' }, { waitMs: 1 })
  const r = await f2.message({ id: aId }, { target: 'B', content: 'hi again' })
  assert.equal(r.relayed, true)
})

/* ---------- 经 apply 的端到端：配置真的下到成员种子 ---------- */

function makeHostCtx (config) {
  const tools = new Map()
  const captured = []
  const subagents = makeMockSub()
  const settingsService = {
    configure () { return () => {} },
    describe () { return [{ ns: 'agent-teams-pixel', revision: 1, value: config }] },
    async update () {}
  }
  const ctx = {
    get (k) {
      if (k === 'settings') return settingsService
      if (k === 'subagents') return subagents
      if (k === 'commands') return { register: (d) => { captured.push('cmd:' + d.name); return () => {} } }
      return undefined
    },
    systemPrompt: { section: () => () => {} },
    tools: { register: (d) => { tools.set(d.name, d); captured.push(d.name); return () => {} } },
    effect: (cb) => (typeof cb === 'function' ? cb() : undefined),
    on: () => () => {},
    off: () => {}
  }
  ctx.llm = undefined
  ctx.webServer = undefined
  return { ctx, tools, subagents, captured }
}

test('端到端：memberCardMode=key + memberModel 配置真的落到成员种子与 spawn 规格', async () => {
  const config = { enabled: true, memberCardMode: 'key', memberModel: 'deepseek-v4-flash', memberToolDeny: 'edit,write' }
  const { ctx, tools, subagents } = makeHostCtx(config)
  apply(ctx, config)
  const def = tools.get('agents_pixe_team_create')
  assert.ok(def, 'team_create 工具应已注册')
  const out = await def.execute({ team: '研发团队', max_roles: 1 }, { agent: { id: 'lead-9' } })
  assert.match(out, /已建团队/, '实际返回：' + out)
  const req = subagents.calls.start[0].request
  assert.match(req.prompt[0].text, /## (核心使命|关键规则|技术交付物)/, '种子应是专业核心章节，而不是整卡')
  assert.ok(!/##\s*身份与记忆/.test(req.prompt[0].text), '种子不应带叙事章节')
  assert.equal(req.agentOptions.model, 'deepseek-v4-flash')
  assert.deepEqual(req.toolFilter, { deny: ['edit', 'write'] })
})

test('端到端：memberCardMode=full 时回到整卡（可回退，行为与旧版一致）', async () => {
  const config = { enabled: true, memberCardMode: 'full' }
  const { ctx, tools, subagents } = makeHostCtx(config)
  apply(ctx, config)
  await tools.get('agents_pixe_team_create').execute({ team: '研发团队', max_roles: 1 }, { agent: { id: 'lead-8' } })
  const seed = subagents.calls.start[0].request.prompt[0].text
  assert.ok(seed.length > 800, '整卡应明显更长，实际 ' + seed.length)
  assert.ok(subagents.calls.start[0].request.agentOptions === undefined, '未配置模型档时不下发 agentOptions')
})

test('防呆：allow 白名单自动补回「交作业」必需工具（否则任务永久卡 in_progress）', async () => {
  const config = { enabled: true, memberToolAllow: 'read,glob,grep' }
  const { ctx, tools, subagents } = makeHostCtx(config)
  apply(ctx, config)
  await tools.get('agents_pixe_team_create').execute({ team: '研发团队', max_roles: 1 }, { agent: { id: 'lead-7' } })
  const filter = subagents.calls.start[0].request.toolFilter
  assert.ok(filter.allow.includes('read') && filter.allow.includes('grep'), '白名单原项保留')
  for (const t of ['agents_pixe_task_update', 'agents_pixe_team_message', 'agents_pixe_roles']) {
    assert.ok(filter.allow.includes(t), 'allow 必须补回 ' + t)
  }
  assert.equal(filter.deny, undefined)
})

test('防呆：deny 里的必需工具被剔除（不把用户自己锁死）', async () => {
  const config = { enabled: true, memberToolDeny: 'edit,write,agents_pixe_task_update' }
  const { ctx, tools, subagents } = makeHostCtx(config)
  apply(ctx, config)
  await tools.get('agents_pixe_team_create').execute({ team: '研发团队', max_roles: 1 }, { agent: { id: 'lead-6' } })
  const filter = subagents.calls.start[0].request.toolFilter
  assert.deepEqual(filter.deny, ['edit', 'write'], '必需工具应从 deny 里剔除')
  assert.equal(filter.allow, undefined)
})

test('Config 暴露 P0 新字段且默认值安全（key + 空路由 + 空白名单）', () => {
  const fields = Object.keys(Config.dict || {})
  for (const k of ['memberCardMode', 'memberProvider', 'memberModel', 'memberReasoningEffort', 'memberToolAllow', 'memberToolDeny']) {
    assert.ok(fields.includes(k), 'Config 缺少 ' + k)
    assert.equal(Config.dict[k].meta && Config.dict[k].meta.volatile, true, k + ' 未标 volatile（设置页会拒写）')
  }
  const defaults = Config['~standard'].validate({})
  assert.equal(defaults.issues, undefined)
  /* schemastery ≥3.18.4 会把 volatile 字段解析成 cosmokit 活引用（{ get() }），≤3.18.1 是普通值 —— 两种都要能过 */
  const deref = (v) => (v && typeof v === 'object' && typeof v.get === 'function') ? v.get() : v
  assert.equal(deref(defaults.value.memberCardMode), 'key')
  assert.equal(deref(defaults.value.memberModel), '')
  assert.equal(deref(defaults.value.memberToolDeny), '')
})
