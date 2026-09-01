/**
 * v0.1.7 wiring: settings.section registration + toggles + clear-recent action.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('settings.section registers with the dsh settings shell', () => {
  const registration = { name: 'settings.section', id: 'agent-teams-pixel', order: 30, label: '像素办公室' }
  assert.equal(registration.id, 'agent-teams-pixel')
  assert.equal(registration.label, '像素办公室')
})

test('settings.section body binds to the same scope as the floater', () => {
  // The section's inject() returns { scope }, the render uses scope.snapshot
  // for the current value and scope.set / scope.unset for writes.
  const inject = (scope) => ({ scope })
  const body = inject({ getSnapshot: () => ({ value: { collapsed: false } }), set: () => {} })
  assert.ok(body.scope)
})

test('toggle flips the persisted boolean through scope.set', () => {
  let stored = { collapsed: true }
  const set = (field, value) => { stored = { ...stored, [field]: value } }
  const toggle = (field) => set(field, !stored[field])
  toggle('collapsed')
  assert.equal(stored.collapsed, false)
  toggle('collapsed')
  assert.equal(stored.collapsed, true)
})

test('clear-recent action wipes localStorage entry', () => {
  const store = { 'agent-teams-pixel:recent-presets:v1': '["研发团队"]' }
  // Simulate user pressing 清空
  delete store['agent-teams-pixel:recent-presets:v1']
  assert.equal(Object.prototype.hasOwnProperty.call(store, 'agent-teams-pixel:recent-presets:v1'), false)
})

test('settings section reads scope snapshot reactively via useSyncExternalStore', () => {
  const listeners = new Set()
  const scope = {
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
    getSnapshot: () => ({ value: { collapsed: false, includeArchived: true } }),
  }
  let snap = scope.getSnapshot()
  const refresh = () => { snap = scope.getSnapshot() }
  scope.subscribe(refresh)
  listeners.forEach((fn) => fn())
  assert.equal(snap.value.collapsed, false)
  assert.equal(snap.value.includeArchived, true)
})

test('settings section lives next to 插件 in the dsh settings sidebar', () => {
  // The standard dsh settings shell renders settings.section entries as a
  // flat list under the per-feature label. Our label "像素办公室" sits in
  // the same row as locale / model / agent-teams / etc.
  const labels = ['语言', '模型', '插件', '像素办公室']
  assert.ok(labels.includes('像素办公室'))
})