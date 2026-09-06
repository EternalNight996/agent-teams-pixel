// 角色名中英国际化回归测试：卡死"DSH 语言 → 宿主侧编排输出成员名"这条链路。
//
// 背景：lib/index.js 的 memberLang() 读 readPersist().entries['agents-pixe.lang.v1']，
// memberOf(m) 在 lang==='en' 时取 m.name（英文），否则 m.cname || m.name（中文）。
// 客户端通过 PERSIST_KEYS 把当前 DSH locale 写进这个 key + 同步到磁盘。
//
// 本测试不依赖 dsh 运行时，直接：
//   1. 校验客户端 PERSIST_KEYS 含 agents-pixe.lang.v1
//   2. 校验客户端有 LOCALE_SVC.subscribe 写这个 key 的逻辑
//   3. 校验宿主 memberLang 真的读这个 key（且按 en/zh 区分）
//   4. 校验宿主 memberOf 在 lang='en' 时返回英文名、'zh' 时返回中文名
//   5. 校验 runEngineTeam / agents_pixe_team_create 的输出走的是 memberOf（不再硬写中文）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const clientSrc = readFileSync('src/client.main.js', 'utf8')
const hostSrc = readFileSync('lib/index.js', 'utf8')

test('client PERSIST_KEYS 含 agents-pixe.lang.v1（DSH locale → 磁盘的桥）', () => {
  assert.match(clientSrc, /PERSIST_KEYS\s*=\s*\[[^\]]*'agents-pixe\.lang\.v1'/, 'PERSIST_KEYS 必须包含 agents-pixe.lang.v1，否则宿主 memberLang 永远读不到 DSH locale')
})

test('client 订阅 LOCALE_SVC 并把当前语言写入 agents-pixe.lang.v1', () => {
  // 必须存在：取 active、写 localStorage('agents-pixe.lang.v1')、schedulePersistSync
  assert.match(clientSrc, /LOCALE_SVC\.subscribe\([^)]*writeLang|writeLang\s*=\s*function/, '缺少 LOCALE_SVC.subscribe 镜像逻辑')
  assert.match(clientSrc, /localStorage\.setItem\(\s*'agents-pixe\.lang\.v1'/, '缺少 localStorage.setItem(\'agents-pixe.lang.v1\', cur)')
  assert.match(clientSrc, /schedulePersistSync\s*\(\s*\)/, '缺少 schedulePersistSync() 把变更推到 /agents-pixe/persist')
})

test('client 生成角色时把 lang 传给宿主 /agents-pixe/roles/generate', () => {
  assert.match(clientSrc, /roles\/generate'[\s\S]{0,400}body:\s*JSON\.stringify\(\{[^}]*lang/, 'doGenerateRole 必须把 lang 写进 POST body（影响 generateRole 的中英 prompt）')
})

test('宿主 memberLang 读 agents-pixe.lang.v1，en/zh 区分', () => {
  // memberLang: raw === 'en' ? 'en' : 'zh'
  assert.match(hostSrc, /memberLang\s*\(\)\s*\{[\s\S]*?agents-pixe\.lang\.v1[\s\S]*?raw\s*===\s*'en'\s*\?\s*'en'\s*:\s*'zh'/, 'memberLang 必须读 agents-pixe.lang.v1 并按 en/zh 区分')
})

test('宿主 memberOf 在 lang=en 时返回英文名，zh 时返回中文名', () => {
  const m = hostSrc.match(/const\s+memberOf\s*=\s*\(m\)\s*=>\s*\(\{[\s\S]*?\}\)/)
  assert.ok(m, '找不到 memberOf 定义')
  const body = m[0]
  // en 分支：m.name（英文）
  assert.match(body, /memberLang\(\)\s*===\s*'en'\s*\?\s*\(m\.name\s*\|\|\s*m\.cname\)/, 'en 时必须取 m.name（英文名）')
  // zh 分支：m.cname || m.name（中文名）
  assert.match(body, /memberLang\(\)\s*===\s*'en'\s*\?\s*\(m\.name[\s\S]*?:\s*\(m\.cname\s*\|\|\s*m\.name\)/, 'zh 时必须取 m.cname || m.name（中文名）')
})

test('宿主不再有硬写中文的 memberOf 旁路（编排输出走 memberOf）', () => {
  // 关键使用点：runEngineTeam 创建团队 roster、agents_pixe_team_create 工具返回 roster，
  // 都应通过 members.map(memberOf) 派生名字，而不是直接用 m.cname / m.name 字面量。
  // 至少要有两处 members.map(memberOf)。
  const matches = hostSrc.match(/members\.map\(memberOf\)/g) || []
  assert.ok(matches.length >= 2, `编排输出至少两处应走 memberOf（runEngineTeam + team_create），实际找到 ${matches.length} 处`)
  // 反向断言：编排路径里不能出现直接读 m.cname 拼名字的硬编码
  // （其他字段用 .cname 不算：例如 STATE 显示中文、divisions label 等）
  const hardcodedCnameInOrchestration = /roster\s*:\s*[^,}]*\.map\([^)]*=>\s*\(\s*\{\s*name:\s*m\.cname/
  assert.equal(hardcodedCnameInOrchestration.test(hostSrc), false, '编排 roster 不能硬写 name: m.cname')
})
