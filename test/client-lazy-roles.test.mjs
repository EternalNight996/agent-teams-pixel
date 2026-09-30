// 客户端角色清单「懒加载」回归（v0.2.6）：
//   · bundle 不再内嵌精简清单（原先占 160 KB / 包体 46%）→ 体积与内容双断言
//   · 宿主端点 /agents-pixe/roles/index 是**唯一真相源**（带 version 供版本化缓存）
//   · 安全不变式：清单未加载完成前，不得把「查不到」当「非法」剪枝用户选择
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
process.env.DSH_HOME = mkdtempSync(join(tmpdir(), 'pixe-lazy-'))
const { apply } = await import('../lib/index.js')

const clientSrc = readFileSync(join(root, 'src', 'client.main.js'), 'utf8')
const bundle = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
const prelude = readFileSync(join(root, 'src', 'client.prelude.js'), 'utf8')
const buildSrc = readFileSync(join(root, 'scripts', 'build-client.mjs'), 'utf8')

/* ---------- bundle 侧 ---------- */

test('bundle 不再内嵌角色精简清单：体积回落且不含数据块', () => {
  const kb = bundle.length / 1024
  assert.ok(kb < 240, 'lib/client.js 应回落到 240 KB 以下（内嵌清单时会到 ~340 KB），实际 ' + kb.toFixed(1) + ' KB')
  assert.ok(!bundle.includes('"generatedAt"'), 'bundle 不应再含清单数据块（generatedAt）')
  assert.ok(!/roles":\[\{"id":"academic\//.test(bundle), 'bundle 不应再含 roles 数组字面量')
  /* 逻辑仍在 */
  for (const marker of ['ROLES_STORE', '/agents-pixe/roles/index', 'keyKnown', 'REBUILD_INDEX', 'RolesLoadHint']) {
    assert.ok(bundle.includes(marker), 'bundle 缺少 ' + marker)
  }
})

test('prelude 只留空壳清单，build 脚本不再读取 roles.json 注入', () => {
  assert.match(prelude, /var ROLES_DATA = \{ en: \{ divisions: \{\}, roles: \[\] \}, zh: \{ divisions: \{\}, roles: \[\] \} \};/)
  assert.ok(!/roles\.json/.test(buildSrc), 'build-client.mjs 不应再读 roles.json 注入')
})

test('安全不变式：清单未加载完成前不剪枝用户选择（否则会误删已选角色）', () => {
  assert.match(clientSrc, /function keyKnown\(k\) \{ return !!INDEX\.map\[k\] \|\| !ROLES_STORE\.get\(\)\.loaded; \}/)
  assert.match(clientSrc, /getDraft: function \(\) \{ return globalDraft\.roles\.slice\(\)\.filter\(keyKnown\); \}/)
  assert.match(clientSrc, /getActive: function \(sid\) \{ return sess\(sid\)\.active\.slice\(\)\.filter\(keyKnown\); \}/)
  assert.ok(!/globalDraft\.roles\.slice\(\)\.filter\(function \(k\) \{ return INDEX\.map\[k\]; \}\)/.test(clientSrc), '不得保留「查不到即剪枝」的旧写法')
})

test('缓存策略：版本化 localStorage + 24h TTL（命中即零请求）', () => {
  assert.match(clientSrc, /agents-pixe\.rolesIndex\.v1/)
  assert.match(clientSrc, /var TTL = 24 \* 3600 \* 1000;/)
  assert.match(clientSrc, /Date\.now\(\) - \(c\.at \|\| 0\) < TTL/)
})

/* ---------- 宿主端点侧 ---------- */

function makeHost () {
  const routes = new Map()
  const config = { enabled: true }
  const service = { configure: () => () => {}, describe: () => [{ ns: 'agent-teams-pixel', revision: 1, value: config }], async update () {} }
  const ctx = {
    get (k) {
      if (k === 'settings') return service
      if (k === 'subagents') return {}
      if (k === 'commands') return { register: () => () => {} }
      return undefined
    },
    systemPrompt: { section: () => () => {} },
    tools: { register: () => () => {} },
    effect: (cb) => (typeof cb === 'function' ? cb() : undefined),
    on: () => () => {},
    off: () => {}
  }
  ctx.llm = {}
  ctx.webServer = { register: (def) => { routes.set(def.path, def.handler); return () => {} } }
  return { ctx, routes }
}
async function callRoute (handler, opts = {}) {
  const res = { code: null, payload: null, writeHead (c) { this.code = c }, end (t) { try { this.payload = JSON.parse(String(t)) } catch { this.payload = String(t) } } }
  const req = { method: opts.method || 'GET', url: '/', headers: { host: '127.0.0.1:19387' }, on () { return req }, destroy () {} }
  await handler(req, res)
  return res
}

test('宿主端点 /agents-pixe/roles/index 返回精简清单 + version（en/zh 全量）', async () => {
  const { ctx, routes } = makeHost()
  apply(ctx, { enabled: true })
  const handler = routes.get('/agents-pixe/roles/index')
  assert.ok(handler, '应注册 /agents-pixe/roles/index')
  const res = await callRoute(handler)
  assert.equal(res.code, 200)
  assert.equal(res.payload.ok, true)
  assert.match(String(res.payload.version), /\d+:\d+/, 'version 应是 mtime:size 形态')
  assert.ok(res.payload.data.en.roles.length >= 200, 'en 角色数不足：' + res.payload.data.en.roles.length)
  assert.ok(res.payload.data.zh.roles.length >= 200, 'zh 角色数不足：' + res.payload.data.zh.roles.length)
  const sample = res.payload.data.zh.roles[0]
  for (const f of ['id', 'div', 'name', 'emoji', 'color', 'desc']) assert.ok(f in sample, '精简条目缺字段 ' + f)
})

test('lib/roles.json 在发布 files 里（端点运行时要读它）', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.ok(pkg.files.includes('lib/roles.json'), 'files 必须含 lib/roles.json，否则发布后端点 500')
  assert.ok(existsSync(join(root, 'lib', 'roles.json')))
})
