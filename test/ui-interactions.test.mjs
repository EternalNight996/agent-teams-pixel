// 真实交互验证：把 lib/client.js 跑起来、渲染浮层、**真的点它**。
// 这是补上「正则断言抓不到点了没反应」的那一刀。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bootClient, fakeUseSessions } from './helpers/client-harness.mjs'

const SID = 'session-test-1'

/* 「应用到对话（先选人）」里也含「选人」两个字：必须精确挑出真正的选人按钮，
 * 否则测试会点成那个禁用的应用按钮，然后误判成产品 bug（我第一版就踩了这个坑）。 */
function pickButtons(h) {
  return h.buttons().filter((b) => {
    const s = h.text(b)
    return s.indexOf('选人') >= 0 && s.indexOf('应用到对话') < 0
  })
}
const nPeople = (h, n) => new RegExp('像素办公室[（(]' + n + '[）)]').test(h.text())
const withRoles = (keys, leader) => ({
  lastApplied: { roles: [], leader: null },
  sessions: {
    [SID]: {
      draft: { roles: keys.slice(), leader: leader || null, name: '' },
      active: keys.slice(),
      activeLeader: leader || null,
    },
  },
})

/* ⛔ 会话来源形状（本轮根因）：只有 `current` 的假快照绝不能解析出会话 */
test('会话来源必须是宿主真实快照形状（byId + retainedBy.mainView），臆造字段不算', () => {
  const wrong = (sel) => sel({ current: SID })
  const h0 = bootClient({ useSessions: wrong, state: withRoles(['zh:project-manager-senior']) }).mountOverlay()
  assert.ok(nPeople(h0, 0), '臆造字段 current 不该被当作会话来源，实际：' + h0.text().slice(0, 90))
  const h1 = bootClient({ useSessions: fakeUseSessions(SID), state: withRoles(['zh:project-manager-senior']) }).mountOverlay()
  assert.ok(nPeople(h1, 1), 'byId + retainedBy.mainView 必须解析出会话，实际：' + h1.text().slice(0, 90))
})

test('拿不到会话时必须给出**看得见**的降级，而不是静默', () => {
  const h = bootClient({ useSessions: undefined }).mountOverlay()
  assert.match(h.text(), /还没确定当前会话/, '没有会话时必须可见提示，否则用户只会看到「点了没反应」')
})

test('⛔ 点角色行后界面上的人数必须变（「点击角色无效」的直接断言）', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  const h = c.mountOverlay()
  h.click(pickButtons(h)[0])
  const row = h.all((n) => n.kind === 'host' && h.text(n).indexOf('前端开发者') >= 0 && n.props && typeof n.props.onClick === 'function')[0]
  assert.ok(row, '找不到「前端开发者」这一行')
  h.click(row)
  assert.ok(nPeople(h, 1), '点了角色但界面没变（' + h.text().slice(0, 90) + '）—— 这正是用户报的症状')
  const st = JSON.parse(c.store.get('agents-pixe.state.v4'))
  assert.deepEqual(st.sessions[SID].active, ['zh:engineering-frontend-developer'], '选择必须写进当前会话')
})

test('浮层能注册并渲染（前提：apply 真的跑起来了）', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  assert.ok(c.slot('shell.overlay', 'agents-pixe-office'), '浮层没注册')
  const h = c.mountOverlay()
  assert.match(h.text(), /像素办公室/, '浮层标题没渲染出来')
  assert.equal(h.errors.length, 0, '渲染期抛错：' + h.errors.map((e) => e.message).join(' / '))
})

test('办公室 0 人时不显示视图切换器（上一轮的规则，用真实渲染验证）', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  const h = c.mountOverlay()
  const labels = h.buttons().map((b) => h.text(b))
  assert.equal(labels.some((x) => x.indexOf('团队') >= 0), false, '0 人时不该出现「团队」切换器，实际按钮：' + labels.join(' | '))
})

/* ---------- 本轮的重点：浮窗里的「选人」到底能不能点开 ---------- */

test('⛔ 浮层必须自己 opt-in 点击（shell.overlay 默认 click-through，这是「浮窗按钮全失效」的根因）', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  const h = c.mountOverlay()
  assert.equal(h.tree.props.style.pointerEvents, 'auto',
    '浮层根容器没有把 pointer-events 拿回来 —— 整块浮层看得见、点不动，而且没有任何报错')
  assert.match(c.src, /pointerEvents: 'auto'/, '源码里必须留下 opt-in')
})

test('折叠徽章也必须 opt-in 点击（它同样是浮层占用者）', () => {
  const c = bootClient({
    useSessions: fakeUseSessions(SID),
    extraStore: { 'agents-pixe.overlay.v1': JSON.stringify({ collapsed: true }) },
  })
  const h = c.mountOverlay()
  const badge = h.all((n) => n.kind === 'host' && n.props && n.props.style && n.props.style.borderRadius === 14)[0]
  assert.ok(badge, '找不到折叠徽章（文字：' + h.text().slice(0, 120) + '）')
  assert.equal(badge.props.style.pointerEvents, 'auto', '折叠徽章也必须 opt-in，否则点不开面板')
})

test('浮窗「选人」：点一下必须真的出现选人面板', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  const h = c.mountOverlay()
  const btn = pickButtons(h)
  assert.ok(btn.length > 0, '浮层里找不到「选人」按钮，现有：' + h.buttons().map((b) => h.text(b)).join(' | '))
  h.click(btn[0])
  const inputs = h.all((n) => n.kind === 'host' && n.type === 'input')
  assert.ok(inputs.length > 0, '点了「选人」之后没有出现选人面板的搜索框（当前文字：' + h.text().slice(0, 200) + '）')
})

test('浮窗「选人」：从团队页签点也要能切回来（团队优先分支吃过这个 bug）', () => {
  const c = bootClient({
    useSessions: fakeUseSessions(SID),
    state: { lastApplied: { roles: [], leader: null }, sessions: { [SID]: { draft: { roles: ['zh:project-manager-senior'], leader: null, name: '' }, active: ['zh:project-manager-senior'], activeLeader: null } } },
  })
  const h = c.mountOverlay()
  /* 有 1 人了，切到团队页签 */
  h.click(h.button('团队'))
  assert.match(h.text(), /当前阵容|计划|团队/, '团队页签没渲染')
  /* 再从 ⋯ 抽屉里点「选人」 */
  h.click(h.button('⋯'))
  const pick = pickButtons(h)
  assert.ok(pick.length > 0, '抽屉里没有「选人」按钮')
  h.click(pick[0])
  const inputs = h.all((n) => n.kind === 'host' && n.type === 'input')
  assert.ok(inputs.length > 0, '从团队页签点「选人」没有切回选人面板（说明 pickerOpen 被团队分支吃掉了）')
})

/* ---------- 选人真的能改状态吗 ---------- */

test('点角色行必须真的选中（写进当前会话，而不是「空 sid」桶）', () => {
  const c = bootClient({ useSessions: fakeUseSessions(SID) })
  const h = c.mountOverlay()
  h.click(pickButtons(h)[0])
  /* 角色行是 div，按名字找 */
  const row = h.all((n) => n.kind === 'host' && h.text(n) === '🖥 前端开发者')[0]
    || h.all((n) => n.kind === 'host' && h.text(n).indexOf('前端开发者') >= 0 && n.props && typeof n.props.onClick === 'function')[0]
  assert.ok(row, '找不到「前端开发者」这一行')
  h.click(row)
  const raw = c.store.get('agents-pixe.state.v4')
  const st = JSON.parse(raw)
  assert.ok(st.sessions[SID], '状态里没有这个会话的桶。实际桶：' + Object.keys(st.sessions).join(', '))
  assert.deepEqual(st.sessions[SID].active, ['zh:engineering-frontend-developer'], '选中没有写进当前会话')
})

test('清空按钮必须真的把阵容清掉（草稿与 active 一起）', () => {
  const c = bootClient({
    useSessions: fakeUseSessions(SID),
    state: { lastApplied: { roles: [], leader: null }, sessions: { [SID]: { draft: { roles: ['zh:project-manager-senior', 'zh:engineering-frontend-developer'], leader: 'zh:project-manager-senior', name: '' }, active: ['zh:project-manager-senior', 'zh:engineering-frontend-developer'], activeLeader: 'zh:project-manager-senior' } } },
  })
  const h = c.mountOverlay()
  assert.ok(nPeople(h, 2), '初始应显示 2 人，实际：' + h.text().slice(0, 120))
  const clear = h.buttons().filter((b) => h.text(b).indexOf('清空') >= 0)
  assert.ok(clear.length > 0, '有 2 个人时应出现「清空」')
  h.click(clear[0])
  const st = JSON.parse(c.store.get('agents-pixe.state.v4'))
  assert.deepEqual(st.sessions[SID].active, [], '清空后 active 应归零')
  assert.deepEqual(st.sessions[SID].draft.roles, [], '清空后草稿也应归零')
  assert.ok(nPeople(h, 0), '清空后标题应回到 0 人，实际：' + h.text().slice(0, 120))
})

test('「应用到对话」必须把成员清单模板写进输入框', () => {
  const filled = []
  const c = bootClient({
    useSessions: fakeUseSessions(SID),
    state: { lastApplied: { roles: [], leader: null }, sessions: { [SID]: { draft: { roles: ['zh:project-manager-senior'], leader: null, name: '' }, active: ['zh:project-manager-senior'], activeLeader: null } } },
  })
  const h = c.mountOverlay({ inputActions: { setDraft: (txt) => filled.push(txt) } })
  const apply = h.buttons().filter((b) => h.text(b).indexOf('应用到对话') >= 0)
  assert.ok(apply.length > 0, '找不到「应用到对话」')
  h.click(apply[0])
  assert.equal(filled.length, 1, '应把模板填进输入框一次，实际 ' + filled.length + ' 次')
  assert.match(filled[0], /高级项目经理/, '填进输入框的内容应包含成员名单')
})

/* ---------- 退化场景：宿主没给 useSessions 时会发生什么 ---------- */

test('退化：拿不到会话 id 时，选人不能「静默无效」（要么写对桶，要么给出可见反馈）', () => {
  const c = bootClient({ useSessions: undefined })
  const h = c.mountOverlay()
  h.click(pickButtons(h)[0])
  const row = h.all((n) => n.kind === 'host' && h.text(n).indexOf('前端开发者') >= 0 && n.props && typeof n.props.onClick === 'function')[0]
  assert.ok(row, '找不到角色行')
  h.click(row)
  const raw = c.store.get('agents-pixe.state.v4')
  const st = raw ? JSON.parse(raw) : { sessions: {} }
  const buckets = Object.keys(st.sessions || {})
  const wroteEmpty = buckets.indexOf('') >= 0 && (st.sessions[''].active || []).length > 0
  assert.equal(wroteEmpty, false, '不允许把选择写进「空 sid」桶（界面和宿主都读不到）')
  /* 要么有可见反馈，要么写进了某个真实会话桶 */
  const realWrite = buckets.some((b) => b && (st.sessions[b].active || []).length > 0)
  const visible = /选|会话|无效|不可/.test(h.text())
  assert.ok(realWrite || visible, '点了既没写进会话桶、界面也没有任何反馈 —— 这就是「点了没反应」')
})
