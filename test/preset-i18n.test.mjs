// 预设团队（29 个）中英同步回归测试：卡死"nameEn 不丢、zh+en 都能匹配"这条链路。
//
// 背景：TEAM_PRESETS（host）每条必须有 nameEn（英文名）；findPreset() 必须支持
// zh 与 en 双向匹配（用户输入 "Engineering Team" 能找到"研发团队"，反之亦然）；
// presetDisplayName() 按 memberLang() 切；客户端 PRESETS 同样要有 nameEn，且
// presetLabel() / PRESETS chip 渲染都按 systemLang() 切。
//
// 出问题时会静默丢英文路径（zh 永远兜底），所以用源文本断言卡死结构。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const clientSrc = readFileSync('src/client.main.js', 'utf8')
const hostSrc = readFileSync('lib/index.js', 'utf8')

/* 抽 29 个 preset：抓数组字面量里的 `{ name: 'XXX', nameEn: 'YYY', leader: ..., roles: [...] }` */
function extractPresets(src, marker, markerEnd) {
  const i = src.indexOf(marker)
  if (i < 0) return []
  const bodyStart = src.indexOf('[', i)
  let depth = 0, end = -1
  for (let j = bodyStart; j < src.length; j++) {
    const c = src[j]
    if (c === '[') depth++
    else if (c === ']') { depth--; if (depth === 0) { end = j; break } }
  }
  const body = src.slice(bodyStart, end + 1)
  const out = []
  const re = /\{ name: '([^']+)'(?:, nameEn: '([^']+)')?,/g
  let m
  while ((m = re.exec(body))) out.push({ name: m[1], nameEn: m[2] || null })
  return out
}

const clientPresets = extractPresets(clientSrc, 'var PRESETS = [')
const hostPresets = extractPresets(hostSrc, 'const TEAM_PRESETS = [')

test('客户端 PRESETS 与 host TEAM_PRESETS 都正好 29 条且一一对应', () => {
  assert.equal(clientPresets.length, 29, `客户端 PRESETS 应有 29 条，实际 ${clientPresets.length}`)
  assert.equal(hostPresets.length, 29, `host TEAM_PRESETS 应有 29 条，实际 ${hostPresets.length}`)
  assert.deepEqual(
    clientPresets.map((p) => p.name).sort(),
    hostPresets.map((p) => p.name).sort(),
    '客户端与 host 的中文名集合必须一致（顺序可不同）'
  )
})

test('每条 PRESETS 都必须有 nameEn（否则英文路径静默丢）', () => {
  for (const p of clientPresets) {
    assert.ok(p.nameEn && p.nameEn.length > 0, `客户端 ${p.name} 缺 nameEn`)
  }
  for (const p of hostPresets) {
    assert.ok(p.nameEn && p.nameEn.length > 0, `host ${p.name} 缺 nameEn`)
  }
})

test('客户端与 host 的 nameEn 必须一一对应', () => {
  const cMap = Object.fromEntries(clientPresets.map((p) => [p.name, p.nameEn]))
  const hMap = Object.fromEntries(hostPresets.map((p) => [p.name, p.nameEn]))
  for (const k of Object.keys(cMap)) {
    assert.equal(cMap[k], hMap[k], `客户端与 host 的 ${k} 翻译不一致：${cMap[k]} vs ${hMap[k]}`)
  }
})

test('nameEn 之间不能重复（chip key 用 name 不会撞，但运维时一眼看出来）', () => {
  const ens = clientPresets.map((p) => p.nameEn)
  const dup = ens.filter((v, i) => ens.indexOf(v) !== i)
  assert.equal(dup.length, 0, `nameEn 重复：${[...new Set(dup)].join(', ')}`)
})

test('host findPreset 必须支持 zh + en 双向匹配', () => {
  // findPreset 必须能查 name 和 nameEn 两种
  assert.match(hostSrc, /function\s+findPreset\s*\([^)]*\)\s*\{[\s\S]*?TEAM_PRESETS\.find\(\(t\)\s*=>\s*t\.name\s*===\s*raw\s*\|\|\s*t\.nameEn\s*===\s*raw\)/,
    'findPreset 必须 t.name === raw || t.nameEn === raw')
  // 子串匹配兜底也必须含 nameEn
  assert.match(hostSrc, /t\.name\.toLowerCase\(\)\.indexOf\(lower\)\s*>=\s*0\s*\|\|\s*\(t\.nameEn\s*&&\s*t\.nameEn\.toLowerCase\(\)\.indexOf\(lower\)\s*>=\s*0\)/,
    'findPreset 模糊匹配也必须覆盖 nameEn')
})

test('host presetDisplayName 必须按 memberLang() 切中英', () => {
  assert.match(hostSrc, /function\s+presetDisplayName[\s\S]*?memberLang\(\)\s*===\s*'en'[\s\S]*?p\.nameEn/,
    'presetDisplayName 必须在 en 时取 p.nameEn')
})

test('host resolveRoster / runEngineTeam 必须走 findPreset + presetDisplayName（不再裸比 t.name）', () => {
  // 之前的裸写 "TEAM_PRESETS.find(t => t.name === raw)" 应该全消失
  const bareMatches = hostSrc.match(/TEAM_PRESETS\.find\(\(t\)\s*=>\s*t\.name\s*===\s*raw\)/g) || []
  assert.equal(bareMatches.length, 0, `仍有 ${bareMatches.length} 处裸 t.name 匹配未走 findPreset`)
  // preset.name 字面赋值给 teamName 也应该被 presetDisplayName 替掉
  const bareAssigns = hostSrc.match(/teamName\s*=\s*preset\.name\b/g) || []
  assert.equal(bareAssigns.length, 0, `仍有 ${bareAssigns.length} 处 teamName = preset.name 未走 presetDisplayName`)
})

test('客户端 presetLabel + PRESETS chip 渲染必须按 systemLang() 切', () => {
  // presetLabel 必须存在
  assert.match(clientSrc, /function\s+presetLabel\s*\(\s*p\s*\)/, '缺 presetLabel(p)')
  // chip 渲染必须用 presetLabel(p) 而不是 p.name
  const chipUses = clientSrc.match(/'⭐ '\s*\+\s*p\.name\b/g) || []
  assert.equal(chipUses.length, 0, `客户端仍有 ${chipUses.length} 处 '⭐ ' + p.name 未切到 presetLabel(p)`)
  const chipUsesEn = clientSrc.match(/'⭐ '\s*\+\s*presetLabel\(p\)/g) || []
  assert.ok(chipUsesEn.length >= 2, `应至少 2 处 PRESETS chip 走 presetLabel(p)，实际 ${chipUsesEn.length} 处`)
})
