// The workspace tab must open for a freshly staged draft even when the right
// column is already expanded: discarding a plan closes the tab but keeps the
// column open, so the tab's own listener is unmounted when the next draft is
// created from the conversation header (issue: "没有生效" after 生成草案).
import test from 'node:test'
import assert from 'node:assert/strict'
import { TEAM_CREATED_EVENT, shouldRevealTeam } from '../lib/client/team-reveal.js'

const base = { sessionId: 'session-a', onScreenSessionId: 'session-a', teamId: 'sect-1' }

test('an explicit creation always reveals the team, expanded column included', () => {
  assert.equal(shouldRevealTeam({ ...base, source: 'created', expanded: true }), true)
  assert.equal(shouldRevealTeam({ ...base, source: 'created', expanded: false }), true)
})

test('discovery only claims a collapsed column so it cannot replace a file', () => {
  assert.equal(shouldRevealTeam({ ...base, source: 'discovered', expanded: false }), true)
  assert.equal(shouldRevealTeam({ ...base, source: 'discovered', expanded: true }), false)
})

test('a team is never revealed into a session whose surface is not bound', () => {
  assert.equal(shouldRevealTeam({ ...base, source: 'created', onScreenSessionId: 'session-b', expanded: false }), false)
  assert.equal(shouldRevealTeam({ ...base, source: 'created', onScreenSessionId: undefined, expanded: false }), false)
  assert.equal(shouldRevealTeam({ ...base, source: 'discovered', onScreenSessionId: 'session-b', expanded: false }), false)
})

test('a missing session or team id is nothing to reveal', () => {
  assert.equal(shouldRevealTeam({ ...base, source: 'created', sessionId: undefined, expanded: true }), false)
  assert.equal(shouldRevealTeam({ ...base, source: 'created', sessionId: '', expanded: true }), false)
  assert.equal(shouldRevealTeam({ ...base, source: 'created', teamId: undefined, expanded: true }), false)
  assert.equal(shouldRevealTeam({ ...base, source: 'created', teamId: '', expanded: true }), false)
})

test('the dialog, both listeners and the reveal rule share one event name', () => {
  assert.equal(TEAM_CREATED_EVENT, 'agent-teams:team-created')
})
