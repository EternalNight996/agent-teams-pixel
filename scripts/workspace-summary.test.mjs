import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { en, zh } from '../lib/client/locales.js'

// Render the production components; CSS modules and unrelated host UI are stubbed.
const hook = registerHooks({ resolve(specifier, context, next) {
  let source
  if (specifier.endsWith('.module.css')) source = 'export default new Proxy({}, {get: (_, key) => key})'
  if (context.parentURL?.endsWith('/client/ActivityPanel.js')) {
    if (specifier === '@deepseek-ai/dsh-client-ui-primitives') source = 'export const Modal = () => null'
    if (specifier === './AgentTeamsCard.js') source = 'export const OPEN_PANEL_EVENT = "test-open"'
    if (specifier === './StagingPlanEditor.js') source = 'export const StagingPlanEditor = () => null'
  }
  return source === undefined ? next(specifier, context) : { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
} })
const { TeamSection } = await import('../lib/client/ActivityPanel.js')
const { HallInbox } = await import('../lib/client/HallInbox.js')
hook.deregister()

const translate = dict => (key, values = {}) => dict[key].replace(/\{(\w+)\}/g, (_, name) => String(values[name]))
const base = { workspace: '', teamId: 'summary', name: 'Summary', captainSessionId: 'captain', phase: 'running', members: [], tasks: [], messageCount: 0, captainInbox: [] }
const worker = { id: 'worker', name: 'worker', status: 'working', joinedAt: 1, role: 'implementer' }
const task = (id, status, state = status, assignee = 'worker') => ({ id, subject: id, status, state, assignee, dependencies: [], depth: 0 })
const render = (team, dict, extra = {}) => renderToStaticMarkup(React.createElement(TeamSection, {
  team, workspace: true, onNavigate() {}, t: translate(dict), ...extra,
}))

for (const dict of [en, zh]) test(`workspace header keeps lifecycle counts and drops the moved summary (${dict === en ? 'en' : 'zh'})`, () => {
  const team = {
    ...base,
    members: [worker],
    tasks: [
      task('done', 'completed'),
      task('failed', 'failed'),
      task('cancelled', 'cancelled'),
      task('claimed', 'claimed'),
      task('running', 'in_progress', 'running'),
    ],
  }
  const html = render(team, dict)
  assert.ok(html.includes(translate(dict)('team.stats.completed', { completed: 1, total: 5 })))
  assert.match(html, /data-state="running"/)
  // 宗门气运与掌门收件箱在 e2a0f1f 迁到山门洞府：面板不再重复渲染。
  assert.doesNotMatch(html, /class="completionTasks"|class="inboxCard"/)
  // 依赖图只属于侧栏视图；workspace 视图不画 data-task-id 节点。
  assert.doesNotMatch(html, /data-task-id=/)
})

for (const dict of [en, zh]) test(`stale verdicts surface on workshop assignment chips (${dict === en ? 'en' : 'zh'})`, () => {
  const stale = { ...task('audit', 'completed'), verdict: 'pass', verdictStale: 'workspace content changed' }
  const html = render({ ...base, members: [worker], tasks: [stale] }, dict)
  assert.match(html, /class="assignmentChip"[^>]*data-state="completed"[^>]*data-verdict-stale="true"/)
  assert.ok(html.includes('workspace content changed'))
  assert.ok(html.includes(translate(dict)('team.stats.completed', { completed: 1, total: 1 })))
})

test('hall inbox renders message bodies as text and stays keyboard reachable', () => {
  const messages = [{ from: '<script>sender</script>', content: '<img src=x onerror=alert(1)>\nreport' }]
  const html = renderToStaticMarkup(React.createElement(HallInbox, { messages, t: translate(en) }))
  assert.match(html, /class="inboxList"[^>]*tabindex="0"/)
  assert.ok(html.includes('aria-label="Captain inbox"'))
  assert.match(html, /&lt;script&gt;sender&lt;\/script&gt;/)
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(html, /<script>/)
  assert.doesNotMatch(html, /<img/)
  // 空状态走同一份文案。
  const empty = renderToStaticMarkup(React.createElement(HallInbox, { messages: [], t: translate(en) }))
  assert.ok(empty.includes(en['workspace.inboxEmpty']))
  // 面板不再自己渲染收件箱卡片。
  assert.doesNotMatch(render({ ...base, captainInbox: messages }, en), /class="inboxCard"|class="inboxMessages"/)
})
