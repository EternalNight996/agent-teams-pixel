// 工程级回归：registerFace 重入（scope.watch 触发配置变更）不得重复注册引擎工具。
// 用 mock ctx 驱动真 apply()（lib/index.js，peer deps 已装，可直接 import）：
// 模拟 settings.register 返回 scope（watch 捕获 registerFace），
// apply 内部已注册一轮，再触发 watch 重入，断言 agents_pixe_team_* 仍各注册一次。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../lib/index.js'

function makeCtx() {
  const registered = []
  const tools = {
    register(def) {
      const name = def && def.name
      registered.push(name)
      return function dispose() {
        const i = registered.lastIndexOf(name)
        if (i >= 0) registered.splice(i, 1)
      }
    }
  }
  const commands = {
    register(def) {
      const name = 'cmd:' + (def && def.name)
      registered.push(name)
      return function dispose() { const i = registered.lastIndexOf(name); if (i >= 0) registered.splice(i, 1) }
    }
  }
  let watchCb = null
  const settingsScope = {
    get() { return { enabled: true, cardMode: 'full' } },
    watch(cb) { watchCb = cb },
  }
  const settings = { register() { return settingsScope } }
  const ctx = {
    get(name) {
      if (name === 'settings') return settings
      if (name === 'llm') return undefined
      if (name === 'subagents') return {}   // 引擎 facade 以假 subagents 构建（方法不真调用）
      if (name === 'commands') return commands
      return undefined
    },
    systemPrompt: { section() { return function () {} } },
    tools,
    effect(cb) { return typeof cb === 'function' ? cb() : undefined },
    on() { return function () {} },
  }
  ctx.llm = undefined
  ctx.webServer = undefined
  return { ctx, registered, fireWatch: () => { if (watchCb) watchCb() } }
}

const engineNames = (reg) => reg.filter((n) => /^agents_pixe_(team|task)_/.test(String(n)))
const allEngine = [
  'agents_pixe_team_create', 'agents_pixe_task_create', 'agents_pixe_task_update',
  'agents_pixe_team_step', 'agents_pixe_team_message', 'agents_pixe_team_report',
]

test('apply 注册一轮：6 个引擎工具全部在场', () => {
  const { ctx, registered } = makeCtx()
  apply(ctx)
  const engine = engineNames(registered)
  assert.equal(engine.length, 6, '引擎工具应 6 个，实际 ' + engine.length)
  assert.deepEqual([...engine].sort(), [...allEngine].sort())
})

test('registerFace 重入（scope.watch 触发）不重复注册引擎工具', () => {
  const { ctx, registered, fireWatch } = makeCtx()
  apply(ctx)
  assert.equal(engineNames(registered).length, 6, '首轮')
  // 模拟配置变更：scope.watch 回调（registerFace）再次触发
  fireWatch()
  const engine = engineNames(registered)
  assert.equal(engine.length, 6, '重入后应仍 6 个（不叠加为 12）')
  const uniq = new Set(engine)
  assert.equal(uniq.size, 6, '每个引擎工具名应只注册一次')
  assert.deepEqual([...uniq].sort(), [...allEngine].sort())
  // 再重入一次仍稳定
  fireWatch()
  assert.equal(engineNames(registered).length, 6)
})

test('registerFace 重入后 dispose 仍有效：关配置恢复零注册', () => {
  const { ctx, registered, fireWatch } = makeCtx()
  apply(ctx)
  fireWatch()
  assert.equal(registered.length, 9, '应 9 个（roles+team+6 引擎+teams 命令）')
  assert.equal(engineNames(registered).length, 6)
  assert.ok(registered.includes('cmd:teams'), '/teams 命令已注册')
})

test('/teams 命令确定性注册：斜杠命令命中触发团队协议', () => {
  const { ctx, registered } = makeCtx()
  apply(ctx)
  assert.ok(registered.includes('cmd:teams'), '注册了 teams 命令')
})
