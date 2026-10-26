/**
 * 「反馈异常」纯函数回归：GitHub issue 预填、诊断信息、给 AI 的提示词。
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PLUGIN_REPO, buildAgentPrompt, buildIssueBody, buildIssueTitle, buildIssueUrl, collectDiagnostics,
} from '../lib/client/feedback.js'
import { PLUGIN_VERSION } from '../lib/client/version.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('client version constant tracks package.json', () => {
  assert.equal(PLUGIN_VERSION, pkg.version)
})

test('issue title takes the first line and caps its length', () => {
  assert.equal(buildIssueTitle('归栏后界面空白\n复现步骤…'), '归栏后界面空白')
  assert.equal(buildIssueTitle('   '), 'dsh-pixel-team 异常反馈')
  const long = buildIssueTitle('x'.repeat(80))
  assert.equal(long.length, 60)
  assert.ok(long.endsWith('…'))
})

test('issue body carries the report and the diagnostics block', () => {
  const body = buildIssueBody({ description: '点封神榜没反应', diagnostics: 'plugin: x@1.0.0', version: '1.0.0' })
  assert.ok(body.includes('点封神榜没反应'))
  assert.ok(body.includes('plugin: x@1.0.0'))
  assert.ok(body.includes('诊断信息'))
})

test('issue url is fully encoded and points at the repository', () => {
  const url = buildIssueUrl({
    description: '点封神榜 没反应 / 空白',
    diagnostics: 'plugin: dsh-pixel-team@0.3.0',
    version: '0.3.0',
  })
  assert.ok(url.startsWith(PLUGIN_REPO + '/issues/new?title='))
  assert.ok(url.includes('&body='))
  assert.ok(!url.includes(' '), 'spaces must be encoded')
  assert.ok(!url.includes('封神榜'), 'Chinese text must be encoded')
})

test('the AI prompt carries both report and diagnostics', () => {
  const prompt = buildAgentPrompt({ description: '反馈内容', diagnostics: 'diag line' })
  assert.ok(prompt.includes('反馈内容'))
  assert.ok(prompt.includes('diag line'))
  assert.ok(prompt.includes('dsh-pixel-team'))
  const english = buildAgentPrompt({ description: 'report', diagnostics: 'diag', locale: 'en' })
  assert.ok(english.includes('You are debugging'))
})

test('diagnostics include version, environment and team summary', () => {
  const text = collectDiagnostics({
    version: '9.9.9',
    team: { name: '斗法宗', phase: 'running', members: 3, tasks: { total: 5, done: 2, failed: 1, running: 1 } },
  })
  assert.ok(text.includes('dsh-pixel-team@9.9.9'))
  assert.ok(text.includes('team: 斗法宗 [running] members=3 tasks=2/5 running=1 failed=1'))
  assert.ok(text.includes('user agent:'))
  assert.ok(text.includes('viewport:'))
  assert.ok(collectDiagnostics({ version: '1.0.0' }).includes('team: none'))
})

test('support QR assets ship with the package', () => {
  for (const file of ['group-qr.jpg', 'wechat-pay.jpg', 'wechat-reward.jpg']) {
    assert.ok(existsSync(new URL(`../assets/support/${file}`, import.meta.url)), `missing assets/support/${file}`)
  }
  assert.ok(pkg.files.includes('assets/support'))
  assert.ok(pkg.files.includes('SPONSOR.md'))
  assert.ok(existsSync(new URL('../SPONSOR.md', import.meta.url)))
})
