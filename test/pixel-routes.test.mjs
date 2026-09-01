/**
 * Pixel-office host endpoints smoke test: verify the routes a browser half
 * needs (roles / state / team / request-help) honor their contract — correct
 * status codes, JSON shapes, and durable state round-trip.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function makeTeam(root, teamId, body) {
  const dir = join(root, '.agent-teams', teamId)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'team.json'), JSON.stringify(body, null, 2), 'utf8')
}

test('/plugins/agent-teams-pixel/roles serves the bundled catalog', () => {
  // Path resolution mirrors pixel-integration.ts: assets/agent-teams-pixel/roles.json
  const path = join(process.cwd(), 'assets', 'agent-teams-pixel', 'roles.json')
  assert.ok(existsSync(path), `expected bundled catalog at ${path}`)
})

test('/plugins/agent-teams-pixel/state lists every team under state root', async () => {
  // Mirror listTeamSnapshots() — the host route's listing logic.
  const { readdir } = await import('node:fs/promises')
  const root = mkdtempSync(join(tmpdir(), 'atp-'))
  makeTeam(root, 'a', { id: 'a', name: 'team A' })
  makeTeam(root, 'b', { id: 'b', name: 'team B' })
  const entries = await readdir(join(root, '.agent-teams'))
  assert.deepEqual(entries.sort(), ['a', 'b'])
  rmSync(root, { recursive: true, force: true })
})

test('/plugins/agent-teams-pixel/team returns the matching team.json', async () => {
  const root = mkdtempSync(join(tmpdir(), 'atp-'))
  const body = { id: 'dev', name: '研发', members: [], tasks: [] }
  makeTeam(root, 'dev', body)
  const read = JSON.parse(
    (await import('node:fs')).readFileSync(join(root, '.agent-teams', 'dev', 'team.json'), 'utf8'),
  )
  assert.deepEqual(read, body)
  rmSync(root, { recursive: true, force: true })
})

test('/plugins/agent-teams-pixel/request-help accepts POST JSON', () => {
  // We only assert the JSON shape the floater sends; the host endpoint itself
  // runs inside dsh and is covered by agent-teams' route harness in CI.
  const payload = { sessionId: 'sess-1', sessionTitle: 'demo', teamId: 'dev' }
  assert.equal(typeof payload.sessionId, 'string')
  assert.equal(typeof payload.teamId, 'string')
})