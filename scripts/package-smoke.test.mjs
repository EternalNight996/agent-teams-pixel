/**
 * Publish artifact smoke: the npm tarball must contain everything the host
 * routes and about/sponsor surfaces need, and must not ship source/tests.
 */
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('..', import.meta.url))

let cachedPack
function packList() {
  if (cachedPack !== undefined) return cachedPack
  // Run through the shell: npm is a .cmd shim on Windows and execFile cannot
  // spawn it directly (EINVAL).
  const raw = execSync('npm pack --dry-run --json --ignore-scripts', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60_000,
  })
  const parsed = JSON.parse(raw)
  assert.ok(Array.isArray(parsed) && parsed.length > 0)
  cachedPack = parsed[0]
  return cachedPack
}

test('the publish tarball contains the runtime, support QRs and sponsor/about docs', () => {
  const pack = packList()
  const paths = new Set(pack.files.map(file => file.path))
  for (const required of [
    'package.json',
    'lib/index.js',
    'lib/client.js',
    'lib/client/pixel-office/PixelOfficeScene.js',
    'assets/support/group-qr.jpg',
    'assets/support/wechat-pay.jpg',
    'assets/support/wechat-reward.jpg',
    'SPONSOR.md',
    'README.md',
    'cordis.patch.yml',
  ]) {
    assert.ok(paths.has(required), `tarball is missing ${required}`)
  }
  assert.ok(paths.size > 50, 'the tarball should carry the built plugin, not a stub')
  assert.ok(pack.size > 0 && pack.size < 8 * 1024 * 1024, `tarball size ${pack.size}`)
})

test('the publish tarball ships only the intended runtime scripts, no source/tests/docs', () => {
  const paths = packList().files.map(file => file.path)
  assert.deepEqual(paths.filter(path => path.startsWith('src/') || path.startsWith('docs/')), [])
  assert.deepEqual(
    paths.filter(path => path.startsWith('scripts/')).sort(),
    ['scripts/compatibility.mjs', 'scripts/doctor.mjs', 'scripts/legacy-session-source-repair.mjs'],
  )
  assert.deepEqual(paths.filter(path => path.endsWith('.test.mjs')), [])
})

test('the support route allowlist matches the packaged QR assets', () => {
  const host = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8')
  const routeAssets = [...host.matchAll(/'([a-z-]+\.jpg)', 'image\/jpeg'/g)].map(match => match[1]).sort()
  assert.deepEqual(routeAssets, ['group-qr.jpg', 'wechat-pay.jpg', 'wechat-reward.jpg'])
  const files = packList().files.map(file => file.path)
  for (const asset of routeAssets) assert.ok(files.includes(`assets/support/${asset}`))
})
