/**
 * Role contracts and the full-stack template:
 * - every software role has a concise, bounded contract;
 * - the template keeps frontend/backend disjoint and gates the integration.
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { ROLE_CONTRACT_IDS, roleGuidance } from '../lib/role-guidance.js'
import { buildQuickStartPlan } from '../lib/quick-start.js'
import { memberPersona } from '../lib/members.js'

test('software roles expose bounded contracts with ownership, rules and done', () => {
  for (const role of ['frontend', 'backend', 'integrator', 'verifier', 'reviewer']) {
    assert.ok(ROLE_CONTRACT_IDS.includes(role), `missing role ${role}`)
    const text = roleGuidance(role)
    assert.equal(typeof text, 'string')
    assert.ok(text.length >= 300 && text.length <= 1400, `${role} contract length ${text.length}`)
    assert.match(text, /Ownership:/)
    assert.match(text, /Must:/)
    assert.match(text, /Done:/)
  }
  assert.equal(roleGuidance('captain'), undefined)
  assert.equal(roleGuidance(undefined), undefined)
})

test('frontend/backend/integrator contracts stay in disjoint layers', () => {
  const frontend = roleGuidance('frontend')
  const backend = roleGuidance('backend')
  const integrator = roleGuidance('integrator')
  assert.match(frontend, /loading \/ empty \/ error/)
  assert.match(frontend, /screen-reader|keyboard/)
  assert.match(frontend, /server routes, database schemas/)
  assert.match(backend, /contract|migration|authz/)
  assert.match(backend, /edit UI/)
  assert.match(integrator, /end-to-end smoke/)
  assert.match(integrator, /contract drift/)
})

test('member persona appends the contract only for recognized software roles', () => {
  const team = { id: 't', name: 'T', description: 'goal', profile: { protocol: 'p' } }
  const frontend = memberPersona(team, { name: 'm', role: 'frontend' }, '/tmp')
  assert.match(frontend, /Role contract:/)
  assert.match(frontend, /loading \/ empty \/ error/)
  const generic = memberPersona(team, { name: 'm', role: 'researcher' }, '/tmp')
  assert.doesNotMatch(generic, /Role contract:/)
})

test('the fullstack template builds a contract -> parallel layers -> integration DAG', () => {
  const plan = buildQuickStartPlan('implement a booking flow', 'fullstack')
  const roles = plan.members.map(member => member.role)
  assert.ok(roles.includes('frontend') && roles.includes('backend') && roles.includes('integrator'))
  const byId = new Map(plan.tasks.map(task => [task.id, task]))
  assert.deepEqual(byId.get('frontend')?.dependencies, ['contract'])
  assert.deepEqual(byId.get('backend')?.dependencies, ['contract'])
  assert.deepEqual(byId.get('integrate')?.dependencies, ['frontend', 'backend'])
  assert.deepEqual(byId.get('verify')?.dependencies, ['integrate'])
  assert.deepEqual(byId.get('review')?.dependencies, ['verify'])
  assert.equal(byId.get('contract')?.assignee, '阵修')
  assert.equal(byId.get('frontend')?.assignee, '灵绘师')
  assert.equal(byId.get('backend')?.assignee, '地脉师')
})
