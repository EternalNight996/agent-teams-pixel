// 插件 inject 契约门禁（dsh 0.2.0-rc.2）：
//   `inject` 是**硬依赖** —— 只要有一个服务不存在，cordis 就永不调用 apply()，
//   现象是「页签 + 浮层 + 设置分区整块静默消失」（无报错、F12 也看不到线索）。
//   本项目真实踩过：客户端 inject 里长期留着 'settingsScope'，而该客户端服务在 0.2.0-rc.2 已不存在。
//
// 服务目录来源：运行时只读查询
//   host:   cordis_inspect_query host Service listService
//   client: cordis_inspect_query client Service listService
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/* dsh 0.2.0-rc.2 实际存在的服务键（Inspect 目录快照，2026-09-30） */
const HOST_SERVICES = ['tools', 'systemPrompt', 'llm', 'webServer', 'settings', 'subagents', 'agentTeams', 'commands', 'timer', 'sessions', 'layout', 'theme']
const CLIENT_SERVICES = ['layout', 'locale', 'sessions', 'slots', 'theme', 'timer', 'uiWorkspace', 'workspaces']

const bundle = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
const hostSrc = readFileSync(join(root, 'lib', 'index.js'), 'utf8')
const buildSrc = readFileSync(join(root, 'scripts', 'build-client.mjs'), 'utf8')

function parseInject (text, label) {
  const m = /exports\.inject\s*=\s*\[([^\]]*)\]/.exec(text) || /const inject\s*=\s*\[([^\]]*)\]/.exec(text)
  assert.ok(m, label + ' 找不到 inject 声明')
  return m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
}

test('客户端 inject 只声明真实存在的服务（不得再出现 settingsScope）', () => {
  const inject = parseInject(bundle, '客户端 bundle')
  assert.ok(inject.length > 0)
  assert.ok(!inject.includes('settingsScope'), 'settingsScope 在 dsh 0.2.0-rc.2 已不是客户端服务；声明它会让整个客户端半边永不挂载')
  for (const key of inject) {
    assert.ok(CLIENT_SERVICES.includes(key), '客户端 inject 含未知服务 ' + key + '（会让 apply 永不执行）')
  }
  assert.ok(inject.includes('slots'), 'slots 是渲染必需，应声明')
})

test('宿主 inject 只声明真实存在的服务', () => {
  const inject = parseInject(hostSrc, '宿主 lib/index.js')
  assert.ok(inject.length > 0)
  for (const key of inject) {
    assert.ok(HOST_SERVICES.includes(key), '宿主 inject 含未知服务 ' + key + '（会让 apply 永不执行）')
  }
})

test('构建脚本里的 inject 与运行时容错策略一致（服务缺失不炸，只降级）', () => {
  assert.match(buildSrc, /exports\.inject = \['slots', 'locale'\]/)
  assert.ok(!/settingsScope/.test(buildSrc.replace(/历史坑[\s\S]*?装死。/, '')), 'build 脚本不应再把 settingsScope 写进 inject')
  /* 运行时必须用 ctx.get() 容错读取（缺服务只降级，不抛） */
  assert.match(bundle, /var slots = ctx\.get\('slots'\);\s*\n\s*if \(slots === undefined\) return;/)
  assert.match(bundle, /ctx\.get\('settingsScope'\)/)
})
