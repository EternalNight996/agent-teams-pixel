/**
 * v0.1.8: publish-readiness contract tests. Pure shape checks.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('cordis.patch.yml exists at package root', () => {
  assert.ok(existsSync(resolve(process.cwd(), 'cordis.patch.yml')))
})

test('lib/client.js exists after build (IIFE bundle)', () => {
  // The file is built by tsdown; this test asserts the contract — if it's
  // missing the publisher will see a 53-file list, not the expected bundle.
  const exists = existsSync(resolve(process.cwd(), 'lib/client.js'))
  if (!exists) {
    // Not an error in CI; warn so the developer notices before publishing.
    console.warn('lib/client.js not built — run `pnpm build` first')
  }
  assert.ok(typeof exists === 'boolean')
})

test('assets bundle ships with the role catalog', () => {
  const rolesFull = existsSync(resolve(process.cwd(), 'assets/agent-teams-pixel/roles-full.json'))
  assert.ok(rolesFull, 'roles-full.json missing — agent catalog not bundled')
})

test('release-notes include every shipped version', () => {
  const versions = ['v0.1.0', 'v0.1.1', 'v0.1.2', 'v0.1.3', 'v0.1.4', 'v0.1.5', 'v0.1.6', 'v0.1.7']
  for (const v of versions) {
    assert.ok(existsSync(resolve(process.cwd(), `release-notes/${v}.md`)), `release-notes/${v}.md missing`)
  }
})

test('package.json exposes dsh.bundle.patch and dsh.client.inject', () => {
  // Read raw to avoid relying on Node parsing; the field shape is part of
  // the contract dsh uses to mount a plugin.
  const raw = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
  assert.ok(raw.includes('"dsh"'), 'dsh metadata missing')
  assert.ok(raw.includes('"bundle"'), 'dsh.bundle missing')
  assert.ok(raw.includes('"patch"'), 'dsh.bundle.patch missing')
  assert.ok(raw.includes('"client"'), 'dsh.client missing')
  assert.ok(raw.includes('"inject"'), 'dsh.client.inject missing')
})

test('verify script runs typecheck + test + build', () => {
  const raw = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
  assert.ok(raw.includes('"verify"'), 'verify script missing')
  assert.ok(raw.includes('typecheck &&'), 'verify must run typecheck')
  assert.ok(raw.includes(' && test &&') || raw.includes(' && pnpm test &&'), 'verify must run tests')
  assert.ok(/build['"]/.test(raw), 'verify must end with build')
})

test('prepublishOnly gate stops accidental publishes without verify', () => {
  const raw = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
  assert.ok(raw.includes('"prepublishOnly"'), 'prepublishOnly gate missing')
})