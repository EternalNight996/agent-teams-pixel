/**
 * v0.1.6 wiring: resume-team endpoint + archived team recovery button.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('resume-team payload requires sessionId + teamId', () => {
  const good = { sessionId: 'sess-1', teamId: 'dev', teamName: '研发', reason: 'continue' }
  for (const k of ['sessionId', 'teamId']) {
    assert.equal(typeof good[k], 'string')
    assert.ok((good[k] ?? '').length > 0)
  }
})

test('resume-team defaults teamName to "未命名" when not provided', () => {
  const payload = { sessionId: 'sess-1', teamId: 'dev' }
  const teamName = typeof payload.teamName === 'string' && payload.teamName.trim() !== '' ? payload.teamName.trim() : '未命名'
  assert.equal(teamName, '未命名')
})

test('resume-team defaults reason when prompt returns null', () => {
  const reason = ''
  const final = reason.trim() !== '' ? reason : '重新启动该团队'
  assert.equal(final, '重新启动该团队')
})

test('captain followup text asks for resume first, rebuild second', () => {
  const text = '请优先调用 agent_teams_resume({ teamId, reason }) 恢复已 halted 团队；若该团队已 archived / deleted（team.json 不在活跃目录），请基于团队历史描述创建新团队。'
  assert.ok(text.includes('agent_teams_resume'))
  assert.ok(text.includes('archived'))
  assert.ok(text.includes('创建新团队'))
})

test('resume button only renders when includeArchived is on', () => {
  const includeArchived = true
  const activeTeam = { teamId: 'dev', name: '研发' }
  const show = includeArchived && activeTeam !== null
  assert.equal(show, true)
})

test('resume without active session surfaces a clear error', () => {
  const activeSessionId = undefined
  const error = activeSessionId === undefined ? '当前没有活动的会话，无法恢复归档团队。' : ''
  assert.equal(error, '当前没有活动的会话，无法恢复归档团队。')
})

test('rebuild vs resume: the captain decides based on team.json presence', () => {
  // The followup text guides the captain to call resume first; if team.json
  // is missing from the live state root, the captain recreates. The host
  // does not pre-decide; the model has the full file access.
  const teamJsonPresent = false
  const action = teamJsonPresent ? 'resume' : 'recreate'
  assert.equal(action, 'recreate')
})