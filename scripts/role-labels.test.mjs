// Role ids stay English on the wire; every read-only surface must render the
// localized label so a Chinese session never shows "implementer" (and English
// stays English in the en dictionary).
import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_META, roleLabel } from '../lib/client/role-labels.js'

const zh = {
  'role.implementer.name': '剑修',
  'role.implementer.ability': '攻坚与实现',
  'role.reviewer.name': '执法长老',
  'role.reviewer.ability': '审查与裁断',
}
const en = {
  'role.implementer.name': 'Sword cultivator',
  'role.implementer.ability': 'build & fix',
  'role.reviewer.name': 'Elder',
  'role.reviewer.ability': 'review & judge',
}
const t = (dict) => (key) => dict[key] ?? key

test('a renamed member shows its role name in the active language', () => {
  assert.equal(roleLabel('implementer', '老王', t(zh)), '剑修')
  assert.equal(roleLabel('implementer', 'Wang', t(en)), 'Sword cultivator')
  assert.equal(roleLabel('reviewer', '阿青', t(zh)), '执法长老')
})

test('a member named after its role shows the role duty instead of repeating itself', () => {
  assert.equal(roleLabel('implementer', '剑修', t(zh)), '攻坚与实现')
  assert.equal(roleLabel('reviewer', '执法长老', t(zh)), '审查与裁断')
  assert.equal(roleLabel('implementer', 'Sword cultivator', t(en)), 'build & fix')
})

test('a custom role falls back to the untouched wire id', () => {
  assert.equal(roleLabel('data-auditor', '老王', t(zh)), 'data-auditor')
  assert.equal(roleLabel('', '老王', t(zh)), '')
})

test('every built-in role resolves to a localized name and duty', () => {
  const dict = Object.fromEntries(ROLE_META.flatMap((role) => [
    [role.nameKey, 'N-' + role.id],
    [role.abilityKey, 'A-' + role.id],
  ]))
  for (const role of ROLE_META) {
    assert.equal(roleLabel(role.id, 'someone', t(dict)), 'N-' + role.id)
    assert.equal(roleLabel(role.id, 'N-' + role.id, t(dict)), 'A-' + role.id)
  }
})
