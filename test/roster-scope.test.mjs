// 角色导入作用域门禁（用户口径）：
//   ① 不全部导入 —— 508 张卡是「可查询的库」，不是默认导入的内容；
//   ② 用户在办公室选了什么角色，就只导入什么角色；
//   ③ 编排某支团队时，只导入该团队用到的角色。
// 断言方式是**数 spawn 次数** + 校验被注入的种子只来自选中集合 —— 全库导入会让这些断言失败。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/* 宿主在模块加载时读 DSH_HOME；测试用临时家目录，并预写「办公室选人」镜像 */
const HOME = mkdtempSync(join(tmpdir(), 'pixe-scope-'))
process.env.DSH_HOME = HOME
const PERSIST_DIR = join(HOME, 'agents-pixe')
mkdirSync(PERSIST_DIR, { recursive: true })

const SELECTED = ['zh:engineering/engineering-code-reviewer', 'en:design/design-ux-architect']
const SID = 'lead-scope'
function writeSelection (sessions) {
  writeFileSync(join(PERSIST_DIR, 'persist.json'), JSON.stringify({
    entries: {
      'agents-pixe.state.v4': JSON.stringify({ draft: { roles: [] }, lastApplied: { roles: [] }, sessions })
    }
  }), 'utf8')
}
writeSelection({ [SID]: { active: SELECTED, activeLeader: SELECTED[0] } })

const { apply } = await import('../lib/index.js')
const ROLES = JSON.parse(readFileSync(join(root, 'lib', 'roles-full.json'), 'utf8'))
/* 宿主的 keyIndex() 先 en 后 zh（先到先得），所以期望名必须用同一优先级取，否则会拿到中文别名 */
const recOf = (id) => ROLES.en[id] || ROLES.zh[id]
const roleId = (k) => String(k).replace(/^(zh|en):/, '')
const selectedNames = SELECTED.map((k) => recOf(roleId(k)).name)

function makeHost () {
  const tools = new Map()
  const calls = { startContinuable: [], start: [] }
  const subagents = {
    list () { return ['spawn'] },
    getProvider (n) { return { name: n || 'spawn' } },
    async startContinuable (spec) { calls.startContinuable.push(spec); return { childId: 'c' + calls.startContinuable.length, messageId: 'm' + calls.startContinuable.length } },
    async start () { calls.start.push(1); throw new Error('一次性编排不应被调用') },
    async sendMessage () { return 'mid' },
    async listChildren () { return [] }
  }
  const config = { enabled: true, memberCardMode: 'key' }
  const service = {
    configure () { return () => {} },
    describe () { return [{ ns: 'agent-teams-pixel', revision: 1, value: config }] },
    async update () {}
  }
  const ctx = {
    get (k) {
      if (k === 'settings') return service
      if (k === 'subagents') return subagents
      if (k === 'commands') return { register: () => () => {} }
      return undefined
    },
    systemPrompt: { section: () => () => {} },
    tools: { register: (d) => { tools.set(d.name, d); return () => {} } },
    effect: (cb) => (typeof cb === 'function' ? cb() : undefined),
    on: () => () => {},
    off: () => {}
  }
  ctx.llm = undefined
  ctx.webServer = undefined
  return { ctx, tools, calls, config }
}

test('不传 team → 只导入「办公室选中的角色」：spawn 次数 == 选中数，且种子只来自选中集合', async () => {
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true, memberCardMode: 'key' })
  const out = await tools.get('agents_pixe_team_create').execute({ max_roles: 8 }, { agent: { id: SID } })
  assert.match(out, /来源：办公室选人/, '应说明来源：' + out)
  assert.equal(calls.startContinuable.length, SELECTED.length, '只应 spawn 选中的 ' + SELECTED.length + ' 个角色，实际 ' + calls.startContinuable.length)
  assert.equal(calls.start.length, 0, '不应走一次性编排')
  const seeded = calls.startContinuable.map((s) => s.request.prompt[0].text)
  for (const name of selectedNames) {
    assert.ok(seeded.some((t) => t.includes(name)), '选中角色「' + name + '」应被导入')
  }
  /* 全库导入的回归哨兵：未选中的典型角色不得出现在任何种子里 */
  for (const otherId of ['engineering/engineering-software-architect', 'engineering/engineering-threat-detection-engineer', 'supply-chain/supply-chain-strategist']) {
    const other = recOf(otherId).name
    assert.ok(!seeded.some((t) => t.includes(other)), '未选中的「' + other + '」不该被导入')
  }
})

test('办公室领袖（activeLeader）被排到名册第一位', async () => {
  const sid = 'lead-leader'
  writeSelection({ [sid]: { active: SELECTED, activeLeader: SELECTED[1] } })
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true, memberCardMode: 'key' })
  await tools.get('agents_pixe_team_create').execute({ max_roles: 8 }, { agent: { id: sid } })
  assert.equal(calls.startContinuable.length, SELECTED.length)
  const first = calls.startContinuable[0].request.prompt[0].text
  assert.ok(first.includes(recOf(roleId(SELECTED[1])).name), '第一位应是 activeLeader 对应角色')
  writeSelection({ [SID]: { active: SELECTED, activeLeader: SELECTED[0] } })
})

test('没选任何角色 + 不传 team → 明确提示「不会全库导入」，且 0 次 spawn', async () => {
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true })
  const out = await tools.get('agents_pixe_team_create').execute({}, { agent: { id: 'session-without-selection' } })
  assert.match(out, /没有选中的角色/)
  assert.match(out, /不会全库导入|不会\*\*全库导入/)
  assert.equal(calls.startContinuable.length, 0, '绝不因为是空就退回全库/预设导入')
})

test('预设团队：只导入该团队的 roster（且受 max_roles 截断），不导入全库', async () => {
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true, memberCardMode: 'key' })
  const out = await tools.get('agents_pixe_team_create').execute({ team: '研发团队', max_roles: 2 }, { agent: { id: 'any-session' } })
  assert.match(out, /来源：预设团队/)
  assert.equal(calls.startContinuable.length, 2, 'max_roles=2 → 只导入 2 张卡')
})

test('角色名列表：只导入列出的角色', async () => {
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true, memberCardMode: 'key' })
  const wanted = ['engineering/engineering-code-reviewer', 'design/design-ux-architect'].map((id) => recOf(id).name)
  const out = await tools.get('agents_pixe_team_create').execute({ team: wanted.join(', ') }, { agent: { id: 'any' } })
  assert.match(out, /来源：角色列表/)
  assert.equal(calls.startContinuable.length, 2, '实际返回：' + out)
  for (const n of wanted) assert.ok(calls.startContinuable.some((s) => s.request.prompt[0].text.includes(n)), '应导入 ' + n)
})

test('agents_pixe_team（一次性编排）空团队 + 无选人时：直接给指引，不 spawn', async () => {
  const { ctx, tools, calls } = makeHost()
  apply(ctx, { enabled: true })
  const out = await tools.get('agents_pixe_team').execute({ task: '随便看看' }, { agent: { id: 'no-selection' } })
  assert.match(out, /没有选中的角色/)
  assert.equal(calls.start.length, 0)
})

test('agents_pixe_roles：不传角色名 → 不导入任何卡', async () => {
  const { ctx, tools } = makeHost()
  apply(ctx, { enabled: true })
  const out = await tools.get('agents_pixe_roles').execute({ names: '   ' }, { agent: { id: 'any' } })
  assert.match(out, /未提供角色名/)
})

test('选人按会话读取、逐次生效：两个会话各按自己的选人导入', async () => {
  const sidA = 'lead-sel-a'
  const sidB = 'lead-sel-b'
  writeSelection({
    [sidA]: { active: ['zh:testing/testing-api-tester'], activeLeader: null },
    [sidB]: { active: SELECTED, activeLeader: null }
  })
  const a = makeHost(); apply(a.ctx, { enabled: true, memberCardMode: 'key' })
  await a.tools.get('agents_pixe_team_create').execute({ max_roles: 8 }, { agent: { id: sidA } })
  assert.equal(a.calls.startContinuable.length, 1, 'A 会话只选了 1 个角色 → 只导入 1 张卡')
  assert.ok(a.calls.startContinuable[0].request.prompt[0].text.includes(recOf('testing/testing-api-tester').name))

  const b = makeHost(); apply(b.ctx, { enabled: true, memberCardMode: 'key' })
  await b.tools.get('agents_pixe_team_create').execute({ max_roles: 8 }, { agent: { id: sidB } })
  assert.equal(b.calls.startContinuable.length, SELECTED.length, 'B 会话选了 2 个 → 导入 2 张卡')
})
