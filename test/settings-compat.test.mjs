// 设置服务兼容回归（dsh 0.2.0-rc.2 的真实断点）：
//
// dsh ≤0.1.5：ctx.settings 是「设置命名空间注册表」，settings.register(ns, Config, {base}) 返回
//             SettingsScope（get/watch/update）。
// dsh ≥0.1.7（含 0.2.0-rc.2）：ctx.settings **没有 register()**，只剩
//             configure/describe/update/replace/mutate；Config 由 loader 作为活引用传进
//             apply(ctx, config)，写回走 settings.update(<loader 条目 id>, patch, revision)。
//
// 回归锚点（实机复现过）：旧写法在 0.2.0-rc.2 上抛 `settings.register is not a function`
// → scope=null → 「角色工具」开关永远打不开、agents_pixe_* 工具永不注册（插件装了但没功能，UI 静默）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply, Config, name, inject } from '../lib/index.js'

const ENTRY_ID = 'agent-teams-pixel'

function makeCtx (options = {}) {
  const { enabled = true, withRegister = false, updateImpl } = options
  const registered = []
  const prompts = []
  const routes = new Map()
  const calls = { configure: 0, update: [], register: 0 }
  const config = { enabled, cardMode: 'full' }
  let revision = 7

  const service = {
    configure (presentation, owner) { calls.configure++; return () => {} },
    describe () { return [{ ns: ENTRY_ID, revision, value: { ...config } }] },
    async update (ns, patch, expectedRevision) {
      calls.update.push({ ns, patch, expectedRevision })
      if (updateImpl) return updateImpl(ns, patch, expectedRevision)
      if (expectedRevision !== undefined && expectedRevision !== revision) {
        throw new Error('settings changed since revision ' + expectedRevision)
      }
      Object.assign(config, patch)
      revision += 1
    }
  }
  if (withRegister) {
    service.register = (ns, schema, opts) => {
      calls.register++
      calls.registerArgs = { ns, schema, opts }
      return {
        get: () => ({ ...config }),
        watch: (cb) => { calls.watch = cb; return () => {} },
        update: async (patch) => { Object.assign(config, patch) }
      }
    }
  }

  const tools = { register (def) { registered.push(def && def.name); return () => {} } }
  const commands = { register (def) { registered.push('cmd:' + (def && def.name)); return () => {} } }
  const webServer = { register (def) { routes.set(def.path, def.handler); return () => {} } }

  const ctx = {
    get (k) {
      if (k === 'settings') return service
      if (k === 'commands') return commands
      if (k === 'subagents') return {}
      return undefined
    },
    systemPrompt: { section (def) { prompts.push(def); return () => {} } },
    tools,
    effect (cb) { return typeof cb === 'function' ? cb() : undefined },
    on () { return () => {} },
    off () {}
  }
  ctx.llm = { listProviders: () => [] }
  ctx.webServer = webServer
  return { ctx, config, registered, prompts, routes, calls, revisionOf: () => revision }
}

/** 用假 req/res 调一次端点处理器（readJson 只需 on('data'|'end')） */
async function callRoute (handler, opts = {}) {
  const { method = 'GET', body, host = '127.0.0.1:19387' } = opts
  const res = {
    code: null,
    payload: null,
    writeHead (c) { this.code = c },
    end (t) { try { this.payload = JSON.parse(String(t)) } catch { this.payload = String(t) } }
  }
  const listeners = {}
  const req = {
    method,
    url: '/agents-pixe/config',
    headers: { host },
    on (ev, cb) {
      listeners[ev] = cb
      if (ev === 'data' && body !== undefined) cb(Buffer.from(JSON.stringify(body)))
      if (ev === 'end') cb()
      return req
    },
    destroy () {}
  }
  await handler(req, res)
  return res
}

/* ---------- 新宿主（无 register，0.2.0-rc.2 的真实形状） ---------- */

test('回归锚点：settings 服务没有 register() 时，apply 仍不抛错（旧代码在这里抛 is not a function）', () => {
  const { ctx } = makeCtx()
  assert.doesNotThrow(() => apply(ctx, { enabled: true, cardMode: 'full' }))
})

test('新宿主：声明 Config 活引用 + configure({auto:false}) 页面策略', () => {
  const { ctx, calls } = makeCtx()
  apply(ctx, { enabled: true, cardMode: 'full' })
  assert.equal(name, 'agent-teams-pixel')
  assert.ok(inject.includes('settings'), 'inject 必须声明 settings')
  assert.equal(calls.register, 0, '新宿主不应再调 settings.register')
  assert.equal(calls.configure, 1, '应调用 configure 声明本实例的页面策略')
})

test('新宿主：enabled=true 时工具/命令全量注册（旧写法会一个都不注册）', () => {
  const { ctx, registered } = makeCtx()
  apply(ctx, { enabled: true, cardMode: 'full' })
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 8, 'roles+team+6 引擎')
  assert.ok(registered.includes('cmd:teams'))
})

test('新宿主：enabled 默认 false 时不注册角色/团队工具（token 安全默认不变）', () => {
  const { ctx, registered } = makeCtx({ enabled: false })
  apply(ctx, { enabled: false, cardMode: 'full' })
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 0)
})

test('Config 全字段 volatile（dsh ≥0.1.7 只投影/只允许写 volatile 字段）', () => {
  const fields = Object.entries(Config.dict || {})
  assert.ok(fields.length >= 2, 'Config 应含 enabled / cardMode')
  for (const [key, field] of fields) {
    assert.equal(field.meta && field.meta.volatile, true, key + ' 未标 volatile，设置页会显示但拒写')
  }
})

/* ---------- 配置端点：客户端唯一可用的读写通道 ---------- */

test('GET /agents-pixe/config 返回活引用快照 + revision', async () => {
  const { ctx, routes } = makeCtx({ enabled: true })
  apply(ctx, { enabled: true, cardMode: 'rules' })
  const res = await callRoute(routes.get('/agents-pixe/config'))
  assert.equal(res.code, 200)
  assert.equal(res.payload.ok, true)
  assert.equal(res.payload.value.enabled, true)
  assert.equal(res.payload.value.cardMode, 'rules')
  assert.equal(res.payload.revision, 7)
})

test('POST /agents-pixe/config 走 settings.update(<loader 条目 id>, patch, revision)', async () => {
  const { ctx, routes, calls, config } = makeCtx({ enabled: false })
  apply(ctx, { enabled: false, cardMode: 'full' })
  const res = await callRoute(routes.get('/agents-pixe/config'), {
    method: 'POST', body: { patch: { enabled: true }, expectedRevision: 7 }
  })
  assert.equal(res.payload.ok, true)
  assert.equal(calls.update.length, 1)
  assert.equal(calls.update[0].ns, ENTRY_ID, 'ns 必须是 loader 条目 id（settings.describe 的 ns）')
  assert.deepEqual(calls.update[0].patch, { enabled: true })
  assert.equal(calls.update[0].expectedRevision, 7)
  assert.equal(config.enabled, true)
  assert.equal(res.payload.value.enabled, true, '写回后返回值应立刻反映新值')
})

test('revision 过期：自动取最新 revision 重试一次，而不是把冲突抛给用户', async () => {
  const { ctx, routes, calls } = makeCtx({ enabled: false })
  apply(ctx, { enabled: false, cardMode: 'full' })
  const res = await callRoute(routes.get('/agents-pixe/config'), {
    method: 'POST', body: { patch: { enabled: true }, expectedRevision: 1 } /* 过期 */
  })
  assert.equal(res.payload.ok, true)
  assert.equal(calls.update.length, 2, '应重试一次')
  assert.equal(calls.update[1].expectedRevision, 7, '重试使用 describe 的最新 revision')
})

test('通过 POST /agents-pixe/config 打开「角色工具」后，工具立刻注册（不依赖 volatile 回流时序）', async () => {
  const { ctx, routes, registered } = makeCtx({ enabled: false })
  apply(ctx, { enabled: false, cardMode: 'full' })
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 0, '默认关闭')
  const res = await callRoute(routes.get('/agents-pixe/config'), {
    method: 'POST', body: { patch: { enabled: true }, expectedRevision: 7 }
  })
  assert.equal(res.payload.ok, true)
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 8, '写成功后应立刻注册工具')
})

test('POST 跨源被拒（localOnly 闸门保持）', async () => {
  const { ctx, routes, calls } = makeCtx()
  apply(ctx, { enabled: false, cardMode: 'full' })
  const res = await callRoute(routes.get('/agents-pixe/config'), {
    method: 'POST', host: 'evil.example.com', body: { patch: { enabled: true } }
  })
  assert.equal(res.code, 403)
  assert.equal(calls.update.length, 0)
})

/* ---------- 老宿主：行为必须保持兼容 ---------- */

test('老宿主（settings.register 存在）：仍走 register 拿 SettingsScope，不调 configure/update', () => {
  const { ctx, calls, registered } = makeCtx({ enabled: true, withRegister: true })
  apply(ctx, { enabled: true, cardMode: 'full' })
  assert.equal(calls.register, 1)
  assert.equal(calls.registerArgs.ns, 'agents-pixe', '老宿主的命名空间保持不变')
  assert.equal(calls.configure, 0, '老宿主没有 configure，不应调用')
  assert.equal(registered.filter((n) => /^agents_pixe_/.test(n)).length, 8)
})
