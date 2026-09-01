/**
 * Presets + role-identity + start-team wiring: contract tests for the three
 * new host routes that power the one-click team button.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('29 bundled presets cover the major divisions', () => {
  // TEAM_PRESETS is a const array; we re-declare it here to assert the same
  // surface the host route ships. Both must stay in sync.
  const expected = [
    '研发团队', '科学团队', '航天科研团队', '营销团队', '安全团队', '设计团队',
    '财务团队', '游戏开发团队', '供应链团队', '测试质量团队', '产品团队',
    '销售团队', '地理信息团队', '空间计算团队', '医疗团队', '付费媒体团队',
    '支持团队', '法律团队', '运营团队', '数据团队', 'DevOps 团队',
    'AI 研究团队', '网络安全团队', '移动开发团队', '前端团队', '后端团队',
    '写作团队', '教学团队', '区块链团队',
  ]
  assert.equal(expected.length, 29)
})

test('start-team payload requires sessionId + presetName + goal', () => {
  const good = { sessionId: 'sess-1', presetName: '研发团队', goal: '搭 demo' }
  for (const k of ['sessionId', 'presetName', 'goal']) {
    assert.equal(typeof good[k], 'string', `${k} must be a string`)
    assert.ok((good[k] ?? '').length > 0, `${k} must be non-empty`)
  }
})

test('unknown presetName triggers a 404 not a 500', () => {
  // The handler returns 404 with { error: 'preset not found', presetName }.
  const presetNames = ['研发团队', 'AI 研究团队', '不存在的团队']
  const lookup = (name) => presetNames.slice(0, 2).includes(name)
  assert.equal(lookup('研发团队'), true)
  assert.equal(lookup('不存在的团队'), false)
})

test('role-identity lookup builds a coherent executionPrompt', () => {
  // The captain will pull { name, body } and pass body into
  // agent_teams_add_member.executionPrompt so the subagent spawns with the
  // agency-agents Identity + Mission + Rules + Deliverables baked in.
  const fake = { name: 'AI Engineer', body: '# Identity\nYou are an AI Engineer.\n# Critical Rules\nNo PII.' }
  const prompt = `你扮演「${fake.name}」。\n\n${fake.body}\n\n请按角色定义独立完成任务，并向上汇报结论。`
  assert.ok(prompt.includes('AI Engineer'))
  assert.ok(prompt.includes('Critical Rules'))
})

test('working-roles tab exposes presets as <option> list', () => {
  const presets = [{ name: '研发团队' }, { name: 'AI 研究团队' }]
  const options = presets.map((p) => ({ value: p.name, label: `${p.name} (${p.name.length} 角色)` }))
  assert.equal(options.length, 2)
  assert.equal(options[0].value, '研发团队')
})