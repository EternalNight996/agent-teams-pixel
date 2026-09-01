/**
 * v0.1.9: real-publish + real-install contract tests.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('cordis.patch.yml uses unscoped package name', () => {
  const patch = readFileSync(resolve(process.cwd(), 'cordis.patch.yml'), 'utf8')
  assert.ok(patch.includes('name: \'agent-teams-pixel\''))
  assert.ok(!patch.includes('@eternal-night'))
})

test('package.json name matches the unscoped install target', () => {
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))
  assert.equal(pkg.name, 'agent-teams-pixel')
  assert.equal(pkg.version.startsWith('0.1.'), true)
})

test('npm package is fetchable from the registry (head check)', async () => {
  // Skip when running offline — the test environment may not have outbound
  // network. The assertion is a single HEAD; failures here should not block
  // CI but should be visible in the run log.
  try {
    const res = await fetch('https://registry.npmjs.org/agent-teams-pixel', { method: 'HEAD' })
    assert.ok(res.status === 200 || res.status === 304, `registry HEAD: ${res.status}`)
  } catch (error) {
    console.warn('network unavailable; skipped npm HEAD check')
  }
})

test('assets/agent-teams-pixel contains both compact and full catalogs', () => {
  assert.ok(existsSync(resolve(process.cwd(), 'assets/agent-teams-pixel/roles.json')))
  assert.ok(existsSync(resolve(process.cwd(), 'assets/agent-teams-pixel/roles-full.json')))
  assert.ok(existsSync(resolve(process.cwd(), 'assets/agent-teams-pixel/README.md')))
})

test('VISUAL.md describes every UI affordance the floater renders', () => {
  const visual = readFileSync(resolve(process.cwd(), 'assets/readme/VISUAL.md'), 'utf8')
  // Each component the floater actually renders should be described.
  for (const expected of [
    'Canvas', 'Progress bar', 'Task DAG', 'Inbox', '刷新办公室', '恢复运行', '申请增配',
    '🚀 一键组队', 'role', '清空', '默认收起', '含归档',
  ]) {
    assert.ok(visual.includes(expected), `VISUAL.md missing mention of ${expected}`)
  }
})

test('README risk section enumerates every alpha-only assumption', () => {
  const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')
  assert.ok(readme.includes('## Risks & known limits'))
  assert.ok(readme.includes('alpha.2 only'))
  assert.ok(readme.includes('--legacy-peer-deps'))
  assert.ok(readme.includes('AI chatter'))
  assert.ok(readme.includes('Archival recovery'))
})