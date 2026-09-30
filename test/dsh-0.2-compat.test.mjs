// DSH 0.2.0-rc.2 更新后的兼容回归门禁。
//
// 背景（真实根因，来自 dsh-app-boot@0.2.0-rc.2 的 `evaluatePluginCompatibility`）：
//   DSH 在安装/激活插件前，会对 manifest.peerDependencies 里所有 `@deepseek-ai/dsh` 与
//   `@deepseek-ai/dsh-*` 条目跑一次
//       semver.satisfies(runtimeVersion, range, { includePrerelease: true })
//   任一不满足即判定 `incompatible-version`，拒绝安装/激活（除非按 name@version + 精确运行时版本
//   发豁免）。本项目 0.2.0 声明 `^0.1.0-rc.7 || ^0.1.1-rc.2`：caret 会把上界规范成 `<0.2.0-0`，
//   而 `0.2.0-rc.2 < 0.2.0-0` 为假 ⇒ 更新到 0.2.0-rc.2 后直接被门禁挡死。
//
// 本测试锁死「新运行时必须被声明覆盖」+「旧的 0.1.x caret 写法不得回归」+「不得与原生 Agent Teams 撞名」。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import semver from 'semver'
import { apply } from '../lib/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

/* 本项目声称兼容的 DSH 运行时版本（必须与 dsh.compatibility.dshReleases 的键一致） */
const CLAIMED_RUNTIMES = Object.keys(manifest.dsh.compatibility.dshReleases)

/* DSH 原生 Agent Teams（@deepseek-ai/dsh-experimental-tool-agent-team）占用的工具名 */
const NATIVE_TEAM_TOOLS = [
  'spawn_teammate', 'send_message', 'list_agents', 'wait_agent', 'interrupt_agent',
  'team_task_create', 'team_task_list', 'team_task_get', 'team_task_update'
]

/* ---------- 1. peer 区间必须满足全部声称兼容的运行时 ---------- */

test('全部 @deepseek-ai/dsh* peer 区间满足声称兼容的每个运行时（DSH 的 includePrerelease 规则）', () => {
  const peers = Object.entries(manifest.peerDependencies || {})
    .filter(([name]) => name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-'))
  assert.ok(peers.length > 0, '必须声明 @deepseek-ai/dsh* peer（否则 DSH 无法判断兼容性）')
  for (const [name, range] of peers) {
    for (const runtime of CLAIMED_RUNTIMES) {
      assert.ok(
        semver.satisfies(runtime, range, { includePrerelease: true }),
        `${name} 的区间 "${range}" 不满足运行时 ${runtime} —— DSH 会以 incompatible-version 拒绝安装/激活`
      )
    }
  }
})

test('回归锚点：0.1.x 的 caret 上界（<0.2.0-0）永远不满足 0.2.0-rc.*，不得回归', () => {
  const legacy = '^0.1.0-rc.7 || ^0.1.1-rc.2'
  assert.equal(semver.satisfies('0.2.0-rc.2', legacy, { includePrerelease: true }), false,
    '这是 0.2.0 被门禁挡死的根因；此断言用来防止旧写法回潮')
  const current = manifest.peerDependencies['@deepseek-ai/dsh-llm']
  assert.notEqual(current, legacy, 'peer 区间已修正，不应再是 0.1.x-only 写法')
  assert.equal(semver.satisfies('0.2.0-rc.2', current, { includePrerelease: true }), true)
  assert.equal(semver.satisfies('0.1.7-rc.2', current, { includePrerelease: true }), true,
    '修 0.2 不能把老运行时 0.1.7-rc.2 打掉（兼容是加法不是替换）')
})

/* ---------- 2. 元数据自洽 ---------- */

test('engines.dsh / dsh.compatibility.dsh 与 peer 区间自洽', () => {
  const engineRange = manifest.engines.dsh
  const compatRange = manifest.dsh.compatibility.dsh
  assert.equal(engineRange, compatRange, 'engines.dsh 与 dsh.compatibility.dsh 应一致')
  for (const runtime of CLAIMED_RUNTIMES) {
    assert.ok(semver.satisfies(runtime, engineRange, { includePrerelease: true }),
      `engines.dsh "${engineRange}" 不满足声称兼容的 ${runtime}`)
  }
})

test('dsh.compatibility 声明 dshReleases 且含最新运行时 0.2.0-rc.2，profiles 覆盖 web+desktop', () => {
  const releases = manifest.dsh.compatibility.dshReleases
  assert.equal(releases['0.2.0-rc.2'], 'compatible', '必须显式声明 0.2.0-rc.2 兼容')
  assert.deepEqual([...manifest.dsh.compatibility.profiles].sort(), ['desktop', 'web'])
  assert.equal(manifest.dsh.compatibility.node, manifest.engines.node)
})

test('manifest 保留 dsh.bundle.patch 自挂载声明（profile 靠它把插件挂进 bundles）', () => {
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
  assert.match(patch, /id:\s*agent-teams-pixel/)
})

/* ---------- 3. 不与原生 Agent Teams 撞名 / 路由提示 ---------- */

function makeCtx(services = {}) {
  const registered = []
  const prompts = []
  const tools = {
    register(def) {
      registered.push(def && def.name)
      return function dispose() {}
    }
  }
  const commands = {
    register(def) { registered.push('cmd:' + (def && def.name)); return function dispose() {} }
  }
  const settingsScope = { get() { return { enabled: true, cardMode: 'full' } }, watch() {} }
  const settings = { register() { return settingsScope } }
  const base = {
    settings,
    llm: undefined,
    subagents: {},
    commands,
    ...services
  }
  const ctx = {
    get(name) { return base[name] },
    systemPrompt: { section(def) { prompts.push(def); return function () {} } },
    tools,
    effect(cb) { return typeof cb === 'function' ? cb() : undefined },
    on() { return function () {} }
  }
  ctx.llm = base.llm
  ctx.webServer = undefined
  return { ctx, registered, prompts }
}

test('插件注册的工具名与原生 Agent Teams 工具零冲突（同名会被 dsh 视为覆盖）', () => {
  const { ctx, registered } = makeCtx()
  apply(ctx)
  const clash = registered.filter((n) => NATIVE_TEAM_TOOLS.includes(n))
  assert.deepEqual(clash, [], '撞名工具：' + clash.join(', '))
  /* 插件自身工具一律 agents_pixe_ 前缀 */
  const own = registered.filter((n) => !String(n).startsWith('cmd:'))
  for (const n of own) assert.match(String(n), /^agents_pixe_/, '插件工具应统一 agents_pixe_ 前缀：' + n)
})

test('宿主挂载原生 Agent Teams 时，系统提示段给出「原生优先」路由，且工具仍全量注册', () => {
  const { ctx, registered, prompts } = makeCtx({ agentTeams: { spawnTeammate() {} } })
  apply(ctx)
  assert.ok(prompts.some((p) => p && p.name === 'tool:agents-pixe'), '系统提示段已注册')
  const text = prompts.map((p) => p && p.text).join('\n')
  assert.match(text, /原生 Agent Teams/, '未提示宿主已有原生 Agent Teams')
  assert.match(text, /spawn_teammate/, '未点名原生工具，模型可能重复编排')
  assert.match(text, /不要两套混用|不要在同一次编排里混用/)
  /* 工具注册数量不因原生在场而变化 */
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 8, 'roles+team+6 引擎')
  assert.ok(registered.includes('cmd:teams'), '/teams 命令仍在')
})

test('宿主没有原生 Agent Teams（老运行时）时，提示段退回「走 agents_pixe_*」且不报错', () => {
  const { ctx, registered, prompts } = makeCtx()
  apply(ctx)
  const text = prompts.map((p) => p && p.text).join('\n')
  assert.match(text, /未启用 DSH 原生 Agent Teams/)
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 8)
})

test('ctx.get("agentTeams") 抛错也不得让 apply 崩（老宿主可能没有该服务键）', () => {
  const { ctx, registered } = makeCtx()
  const origGet = ctx.get
  ctx.get = (name) => { if (name === 'agentTeams') throw new Error('no such service'); return origGet(name) }
  assert.doesNotThrow(() => apply(ctx))
  assert.ok(registered.includes('agents_pixe_roles'))
})
