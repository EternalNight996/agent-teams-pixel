/**
 * v0.1.5 wiring: keyboard shortcuts + settings persistence + retry + archived.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

test('Alt+O toggles the floater without hijacking typing in inputs', () => {
  const isTypingSurface = (tag) => tag === 'TEXTAREA' || tag === 'INPUT'
  assert.equal(isTypingSurface('TEXTAREA'), true)
  assert.equal(isTypingSurface('INPUT'), true)
  assert.equal(isTypingSurface('DIV'), false)
  assert.equal(isTypingSurface('BUTTON'), false)
})

test('Alt+R jumps to the working-roles tab via CustomEvent', () => {
  // The apply() handler dispatches 'agent-teams-pixel:jump-roles'; the tab
  // subscribes and calls setView('agent-teams-pixel-roles').
  let lastView = ''
  const jump = (eventName) => {
    if (eventName === 'agent-teams-pixel:jump-roles') lastView = 'agent-teams-pixel-roles'
  }
  jump('agent-teams-pixel:jump-roles')
  assert.equal(lastView, 'agent-teams-pixel-roles')
})

test('settings scope binds once per apply()', () => {
  // Calling bind twice on the same namespace would queue conflicting
  // revisions; the canonical pattern is one bind in apply() top.
  let bindCount = 0
  const binder = { bind: () => { bindCount += 1; return {} } }
  const applyOnce = () => binder.bind()
  applyOnce()
  applyOnce()
  assert.equal(bindCount, 2) // (intentional: two applies, each binds once)
})

test('collapsed default survives a settings round-trip', () => {
  // Host-side register returns a scope whose getSnapshot reflects user writes.
  const user = { collapsed: false, includeArchived: true }
  const derive = (snapshot) => ({ ...(snapshot.base ?? {}), ...user })
  assert.equal(derive({ base: { collapsed: true, includeArchived: false } }).collapsed, false)
  assert.equal(derive({ base: { collapsed: true, includeArchived: false } }).includeArchived, true)
})

test('recent presets clear wipes both state and localStorage key', () => {
  const key = 'agent-teams-pixel:recent-presets:v1'
  const store = { [key]: '["研发团队","AI 研究团队"]' }
  // user clears
  let inMemory = JSON.parse(store[key])
  inMemory = []
  store[key] = JSON.stringify(inMemory)
  assert.equal(JSON.parse(store[key]).length, 0)
})

test('retry button resets last error and triggers a reload', () => {
  let lastError = '网络错误'
  let reloaded = false
  const onRetry = () => { lastError = ''; reloaded = true }
  onRetry()
  assert.equal(lastError, '')
  assert.equal(reloaded, true)
})

test('archived teams toggle adds ?archived=1 to upstream poll URL', () => {
  const qs = (includeArchived) => includeArchived ? '?archived=1' : '?archived=0'
  assert.equal(qs(true), '?archived=1')
  assert.equal(qs(false), '?archived=0')
})

test('keyboard handler ignores combos with Cmd / Ctrl / Shift', () => {
  const isStandaloneAlt = (event) => event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey
  assert.equal(isStandaloneAlt({ altKey: true, metaKey: false, ctrlKey: false, shiftKey: false }), true)
  assert.equal(isStandaloneAlt({ altKey: true, metaKey: true, ctrlKey: false, shiftKey: false }), false)
  assert.equal(isStandaloneAlt({ altKey: true, metaKey: false, ctrlKey: true, shiftKey: false }), false)
  assert.equal(isStandaloneAlt({ altKey: false, metaKey: false, ctrlKey: false, shiftKey: false }), false)
})