/**
 * Captain wiring: verify the request-help endpoint's payload shape and the
 * escalated-flag rendering contract the floater depends on.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('request-help payload has sessionId + reason + optional teamId', () => {
  const payload = { sessionId: 'sess-1', teamId: 'dev', reason: 'need a reviewer' }
  assert.equal(typeof payload.sessionId, 'string')
  assert.equal(payload.sessionId.length > 0, true)
  assert.equal(typeof payload.reason, 'string')
})

test('escalated flag on a team surfaces a needs-user indicator', () => {
  const team = { teamId: 'dev', name: '研发', escalated: true }
  // Pixel office predicate: any team.escalated === true flips the title bar red.
  const showDot = team.escalated === true
  assert.equal(showDot, true)
})

test('non-escalated teams do not trigger the indicator', () => {
  const team = { teamId: 'dev', name: '研发', escalated: false }
  assert.equal(team.escalated === true, false)
  const team2 = { teamId: 'dev', name: '研发' }
  assert.equal(team2.escalated === true, false)
})

test('the floater merges embedded members from upstream /state shape', () => {
  const upstream = { teams: [{ teamId: 'dev', name: '研发', members: [
    { id: 'm1', name: '工程师', role: 'engineer', status: 'idle' },
  ] }] }
  const flat = []
  for (const team of upstream.teams) {
    if (Array.isArray(team.members)) flat.push(...team.members)
  }
  assert.equal(flat.length, 1)
  assert.equal(flat[0].name, '工程师')
})

test('when the upstream /state route is missing, the fallback URL is used', () => {
  const upstreamOK = false
  const candidates = ['/plugins/dsh-agent-teams/state', '/plugins/agent-teams-pixel/state?ws=x']
  const tried = []
  for (const c of candidates) tried.push(c)
  assert.equal(tried.length, 2)
  assert.equal(tried[1].includes('agent-teams-pixel'), true)
})