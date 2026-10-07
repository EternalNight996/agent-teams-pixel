// 团队面板重新设计（参考 dsh-agent-teams 模式）的结构门禁。
// 卡的是「设计稿说了但代码没做」的漂移：入口跟随会话、单轮询器、分段进度、计划闸门、二次确认。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync('src/client.main.js', 'utf8')

/* 本机（dsh 0.2.0-rc.2 Web）实测存在的 Slot 快照：
 * 来源 cordis_inspect_query client / Slots / listSubTree。
 * 参考项目用的 conversation.chat.node 与 sidebar.right.pane.tab 依赖的服务在本机不存在或 keyDomain 已满，
 * 所以本项目只用下面这几个（见 docs/redesign-teams-mode.md 第 2 节）。 */
const KNOWN_SLOTS = [
  'conversation.session.header.actions',
  'conversation.chat.turnTail',
  'tool.call.toolview',
  'conversation.view',
  'shell.overlay',
  'settings.section',
]

test('新入口只注册在实测存在的 slot 上（不照抄别的项目里的 slot 名）', () => {
  const used = [...src.matchAll(/slots\.inject\('([^']+)'/g)].map((m) => m[1])
  assert.ok(used.length >= 5, 'slots.inject 数量异常：' + used.length)
  for (const k of used) assert.ok(KNOWN_SLOTS.includes(k), '注册了未校准的 slot：' + k)
  for (const need of ['conversation.session.header.actions', 'conversation.chat.turnTail']) {
    assert.ok(used.includes(need), '缺少新入口注册：' + need)
  }
})

test('入口跟随会话：没有团队时返回 null，完全不占位', () => {
  assert.match(src, /function teamOf\(data\)[\s\S]*?if \(!members\.length && !tasks\.length && !data\.plan\) return null/)
  const entry = src.match(/function SessionTeamEntry\(props\)[\s\S]*?\n\}/)
  assert.ok(entry, '缺 SessionTeamEntry')
  assert.match(entry[0], /if \(!team\) return null/)
  const card = src.match(/function TurnTailTeamCard\(props\)[\s\S]*?\n\}/)
  assert.ok(card, '缺 TurnTailTeamCard')
  assert.match(card[0], /if \(!team\) return null/)
  /* 用户明确要求：任务结束后团队信息**不要立即清空**，要持续显示。
   * 所以结算态不能 return null，而是退化成紧凑一行。 */
  assert.equal(/if \(!c\.live\) return null/.test(card[0]), false, '结算后不得隐藏（要求持续显示团队信息）')
  assert.match(card[0], /if \(!c\.live\) \{/, '结算态应退化为紧凑一行而不是消失')
  assert.match(card[0], /PANEL_CTL\.open\('team'\)/, '结算态仍要能打开面板')
})

test('单轮询器：三处共用 TEAM_STORE，团队快照只有一个拉取点', () => {
  assert.ok(src.includes('var TEAM_STORE = (function ()'), '缺 TEAM_STORE')
  assert.equal(/setInterval\(load, 3000\)/.test(src), false, '旧的 3s 全量轮询仍在')
  /* 真正的契约：团队快照只允许有一个 fetch 点（在 TEAM_STORE 里） */
  const viewFetches = src.match(/fetch\('\/agents-pixe\/teams\/view/g) || []
  assert.equal(viewFetches.length, 1, '团队快照应只有一个拉取点，实际 ' + viewFetches.length + ' 个')
  const panel = src.match(/function TeamPanel\(props\)[\s\S]*?\n\}/)
  assert.ok(panel, '缺 TeamPanel')
  assert.equal(/setInterval/.test(panel[0]), false, 'TeamPanel 不应自己轮询')
  /* 轮询风暴防线：没团队时降频，否则常驻会话每小时 900 次请求 */
  assert.match(src, /var ACTIVE_MS = 4000;/, '缺活跃频率常量')
  assert.match(src, /var IDLE_MS = 30000;/, '缺空闲降频常量（没团队时应降频）')
  assert.match(src, /function rate\(\) \{/, '缺自适应频率切换')
  assert.match(src, /visibilitychange/, '从后台回到前台应立刻补一次，而不是等下一个 tick')
  assert.match(src, /document\.hidden\) return;/, '后台标签页应跳过轮询')
  assert.match(src, /if \(!prev \|\| prev\.sig !== sig\) emit\(sid\)/, '内容未变时不应通知订阅者（避免无谓重建）')
})

test('分段进度：段数 = 任务数，颜色 = 状态', () => {
  const seg = src.match(/function ProgressSegments\(props\)[\s\S]*?\n\}/)
  assert.ok(seg, '缺 ProgressSegments')
  assert.match(seg[0], /tasks\.map\(function \(x, i\)/, '每段必须来自任务数组')
  assert.match(seg[0], /background: taskStateColor\(states\[i\]\)/, '段颜色必须来自任务状态')
})

test('文案状态机：十种局面都有出口，且只有 teamSummary 一处', () => {
  for (const k of ['staged', 'waitingBreakdown', 'waitingSchedule', 'allDelivered', 'blockedAndRunning', 'running', 'ready', 'blocked', 'failedSettled']) {
    assert.ok(src.includes("'tp.sum." + k + "'"), '缺状态文案 tp.sum.' + k)
  }
  assert.match(src, /function teamSummary\(team, t\)/, '缺 teamSummary 单一出口')
  const defs = src.match(/function teamSummary\(/g) || []
  assert.equal(defs.length, 1, 'teamSummary 只能有一处定义')
})

test('计划闸门：三出口齐全，破坏性动作二次确认', () => {
  assert.match(src, /pixePost\('\/agents-pixe\/teams\/plan\/confirm'/)
  assert.match(src, /pixePost\('\/agents-pixe\/teams\/plan\/discard'/)
  for (const k of ['tp.approve', 'tp.continue', 'tp.discard', 'tp.discardConfirm']) {
    assert.ok(src.includes(k), '缺计划闸门文案 ' + k)
  }
  assert.match(src, /if \(!armed\) \{ setArmed\(true\); return; \}/, '放弃计划必须二次确认')
  assert.match(src, /if \(!data\.halted && !armedHalt\) \{ setArmedHalt\(true\); return; \}/, '暂停派单必须二次确认')
})

test('折叠徽章带计数：不打开也知道进度', () => {
  /* 计数走 teamOf + teamCounts，并且区分运行态/草案态两种文案。
   * （旧写法是直接数 tv.members/tv.tasks，草案态会显示「0 名成员 · 0/0 完成」。） */
  assert.ok(src.includes("t('tp.badge', { members: tc.nMembers, done: tc.done, total: tc.nTasks })"), '运行态徽章文案')
  assert.ok(src.includes("t('tp.badgeStaged', { members: tc.nMembers, tasks: tc.nTasks })"), '草案态徽章文案')
})

test('浮层标题栏收敛：平铺按钮与旧抽屉开关不再出现', () => {
  assert.equal(/title: t\('o\.pick'\)/.test(src), false, '旧的「选人」平铺按钮仍在')
  assert.equal(/setTeamPanelOpen/.test(src), false, '旧的团队抽屉开关仍在')
  assert.equal(/function TeamActivityPanel/.test(src), false, '旧的单体面板仍在')
  assert.ok(src.includes('tp.tabOffice') && src.includes('tp.tabTeam'), '缺两档视图切换')
  assert.match(src, /React\.createElement\(TeamPanel, \{ sid: sid/, '浮层主体没有接上 TeamPanel')
})

test('跨 slot 通信：面板可在会话头/回合尾卡触发下展开并切到团队视图', () => {
  assert.match(src, /var PANEL_CTL = \(function \(\)/)
  assert.match(src, /PANEL_CTL\.open\('team'\)/)
  assert.match(src, /PANEL_CTL\.subscribe\(function \(target\)/)
})

test('「应用到对话」常驻在浮层标题栏：面板停在哪个画面都能点', () => {
  assert.match(src, /function applyDraftToChat\(\)/, '缺常驻的 applyDraftToChat')
  /* 位置证明：这两颗必须在标题栏内、且顺序为 应用到对话 → 清空 → ⋯ */
  assert.match(
    src,
    /\}, draftN === 0 \? t\('tp\.applyNone'\) : t\('r\.applyChatN', \{ n: draftN \}\)\),[\s\S]{0,1600}?\}, '🗑 ' \+ t\('cm\.clear'\)\),\s*\r?\n\s*React\.createElement\('button', \{ type: 'button', 'aria-expanded': moreOpen/,
    '标题栏顺序应为：应用到对话 → 清空 → ⋯'
  )
  /* 没选人时置灰而不是隐藏：隐藏了用户就不知道有这个动作 */
  assert.match(src, /disabled: draftN === 0,\s*\r?\n\s*title: draftN === 0 \? t\('tp\.applyNone'\)/, '没选人时必须置灰并给出原因')
  /* 语义必须与「一键编排」区分开：这颗走成员清单，那颗走编排指令 */
  const fn = src.match(/function applyDraftToChat\(\)[\s\S]*?\n  \}/)
  assert.ok(fn, '缺 applyDraftToChat 函数体')
  assert.match(fn[0], /shortInstruction\(recs/, '应用到对话必须填成员清单（shortInstruction），不是编排指令')
  assert.match(fn[0], /jumpToChat\(props\)/, '应用后必须跳到对话')
})

test('「应用到对话」的三条文案 zh/en 成对存在', () => {
  for (const k of ['tp.applyNone', 'tp.applyTitle', 'tp.applied']) {
    /* 只数字典定义（'key': value），不数使用点（t('key')），否则计数会被调用处污染 */
    const n = (src.match(new RegExp("'" + k.replace('.', '\\.') + "':", 'g')) || []).length
    assert.equal(n, 2, k + ' 应在 zh/en 各定义一次，实际 ' + n)
  }
})

test('草案态计数：折叠徽章与会话头入口必须读计划里的人数（真跑 plan_only 才暴露的 bug）', () => {
  /* 草案态下 data.members / data.tasks 都是空的（成员还没创建）。
   * 直接数它们会得到「团队 (0)」「0 名成员 · 0/0 完成」——纯静态读代码看不出来。 */
  assert.match(src, /var staged = !!plan;/, '缺草案态判定')
  assert.match(src, /var nMembers = staged \? \(\(plan\.members \|\| \[\]\)\.length \|\| \(plan\.roster \|\| \[\]\)\.length\) : team\.members\.length;/, '缺草案态人数回退')
  assert.match(src, /t\('tp\.entry', \{ members: c\.nMembers \}\)/, '会话头入口必须用计划态计数')
  assert.match(src, /t\('tp\.badgeStaged'/, '草案态需要专门的徽章文案')
  assert.equal(/members: cMembers, done: cDone/.test(src), false, '旧的直数 tv.members 的写法应已移除')
  assert.match(src, /var c = teamCounts\(team\);\s*\r?\n\s*var sum = teamSummary\(team\.raw, t\);/, '回合尾卡也要走同一套计数')
})

test('轮询分档：已结算的团队不能停在最高频率（永久保留 = 否则永久 4 秒轮询）', () => {
  assert.match(src, /var ACTIVE_MS = 4000;/)
  assert.match(src, /var SETTLED_MS = 15000;/, '缺「已结算」这一档')
  assert.match(src, /var IDLE_MS = 30000;/)
  assert.match(src, /function needOf\(d\) \{/, '缺分档判定单一出口')
  assert.match(src, /if \(d\.plan\) return ACTIVE_MS;/)
  assert.match(src, /return \(tasks\.length \|\| \(d\.members \|\| \[\]\)\.length\) \? SETTLED_MS : IDLE_MS;/, '已结算应降到 SETTLED 档')
  assert.equal(/anyActive\(\) \? ACTIVE_MS : IDLE_MS/.test(src), false, '旧的二档判定应已移除')
})

test('最终报告要能在面板里看到（否则团队结束后的成果只能翻聊天记录）', () => {
  assert.match(src, /'tp\.report': '/, '缺最终报告文案')
  assert.match(src, /String\(data\.lastReport\)/, '面板必须读 lastReport')
  assert.match(src, /data\.archivedAt \?/, '要有归档标识')
  assert.match(src, /t\('tp\.reportCopy'\)/, '要有复制按钮')
})

test('一次性快照不给「暂停派单」按钮，并说明是只读历史', () => {
  assert.match(src, /function isDispatchable\(x\)/, '缺可派发判定')
  assert.match(src, /data\.oneShot \? React\.createElement\('span'[^\n]*tp\.oneShotHint/, '一次性快照要说明它是只读历史')
  assert.match(src, /\(isNative \|\| data\.oneShot \|\| !\(tasks\.some\(isDispatchable\) \|\| data\.halted\)\) \? null/, '没有可派发的东西时不应出现暂停按钮')
})

/* ---------- 选人链路（本轮用户明确提的四条） ---------- */

test('选人即生效：草稿一变就同步到当前会话的 active（办公室与宿主读的都是 active）', () => {
  const m = src.match(/var STATE = \(function \(\)[\s\S]*?\n\}\)\(\);/)
  assert.ok(m, '缺 STATE store')
  const s = m[0]
  assert.match(s, /function sync\(st\) \{/, '缺同步函数')
  assert.match(s, /st\.active = st\.draft\.roles\.slice\(\)/, '要把**本会话**草稿写进**本会话** active')
  assert.match(s, /function mut\(sid, fn\) \{[\s\S]*?sync\(st\); persist\(\); notify\(\);/, '统一写入口必须 sync')
  for (const fn of ['addDraft', 'removeDraft', 'clearDraft', 'setLeader', 'clearLeader']) {
    assert.match(s, new RegExp(fn + ':\\s*function[\\s\\S]{0,220}mut\\('), fn + ' 必须走统一写入口（否则办公室与宿主拿到的是旧名册）')
  }
})

test('每个会话一份草稿：切会话不串味（历史坑：draft 是全局的）', () => {
  const s = src.match(/var STATE = \(function \(\)[\s\S]*?\n\}\)\(\);/)[0]
  assert.equal(/var globalDraft/.test(s), false, '不应再有跨会话共享的全局草稿')
  assert.match(s, /draft: \{ roles: roles\.slice\(\)/, '草稿要挂在每个会话上')
  assert.match(s, /getDraft: function \(sid\)/, '读写 API 必须带会话参数')
  /* 旧数据迁移：早期只有 active 没有 draft —— 拿 active 当草稿，行为不变 */
  assert.match(s, /if \(!st\.draft\) st\.draft = \{ roles: \(st\.active \|\| \[\]\)\.slice\(\)/, '缺旧数据迁移')
  /* 播种只给「本次加载的首个会话」，其余新会话从空开始 */
  assert.match(s, /if \(sid && !bootInherited\) \{/, '播种必须只作用于首个会话')
})

test('所有 STATE 调用点都显式带会话（不能再靠全局 ACTIVE_SID 兜底串味）', () => {
  const storeEnd = src.indexOf('function selectedRecords(sid) {')
  assert.ok(storeEnd > 0, '找不到 store 结束锚点')
  const bare = src.slice(storeEnd).match(/STATE\.\w+\(\s*\)/g) || []
  assert.equal(bare.length, 0, '仍有不带会话参数的调用：' + bare.join(', '))
  assert.match(src, /React\.createElement\(RolePicker, \{ t: t, sid: sid \}\)/, 'RolePicker 必须拿到 sid')
  assert.match(src, /STATE\.toggleDraft\(key, props\.sid\)/, 'RolePicker 的勾选要落到它所属会话')
})

test('清空必须同时清掉本会话阵容（以前只清草稿 → 办公室还站着旧人、宿主还照旧组队）', () => {
  assert.match(src, /function clearSelection\(\)[\s\S]*?STATE\.clearDraft\(sid\)[\s\S]*?STATE\.clearActive\(/, '浮层清空要清两处')
  assert.match(src, /function clearAll\(\) \{ STATE\.clearDraft\(sid\); STATE\.clearActive\(sid\); \}/, '页签清空要清两处')
  assert.match(src, /onClick: clearSelection,/, '选人抽屉的清空要复用同一条路径，不能各写一套')
})

test('团队界面在还没建队时显示当前阵容（选人实时反映到团队界面）', () => {
  assert.match(src, /function useActiveKeys\(sid\)/, '缺阵容订阅 hook')
  assert.match(src, /useSyncExternalStore\(\s*\r?\n?\s*STATE\.subscribe,/, '必须订阅 STATE，否则不会实时更新')
  assert.match(src, /var activeKeys = useActiveKeys\(sid\);/, 'TeamPanel 要订阅阵容')
  assert.match(src, /var roster = rosterOfKeys\(activeKeys\);/, '空态要渲染阵容')
  assert.match(src, /'tp\.roster'/, '缺「当前阵容」文案')
  assert.equal(/t\('tp\.emptyTitle'\)/.test(src), false, '旧的「还没有活动团队」空态应已被阵容卡取代')
})

test('「应用到对话」只负责把模板写进对话框', () => {
  const fn = src.match(/function applyDraftToChat\(\)[\s\S]*?\n  \}/)
  assert.ok(fn, '缺 applyDraftToChat')
  assert.match(fn[0], /shortInstruction\(recs/, '填进对话框的必须是成员清单模板')
  assert.match(fn[0], /jumpToChat\(props\)/, '填完要跳到对话')
  assert.match(src, /选人即生效/, '要留下「为什么不再需要手动 apply 才生效」的说明')
})

test('阵容详细信息：只要有角色就实时显示（不是一排小标签）', () => {
  assert.match(src, /function RosterList\(props\)/, '缺阵容详细列表组件')
  assert.match(src, /var roster = rosterOfKeys\(activeKeys\);/, '阵容要在 hooks 区算一次，两处共用')
  const uses = (src.match(/React\.createElement\(RosterList, \{/g) || []).length
  assert.equal(uses, 2, '应有「无团队主视图」与「有团队补充区块」两处，实际 ' + uses)
  const rl = src.match(/function RosterList\(props\)[\s\S]*?\n\}/)
  assert.ok(rl, '拿不到 RosterList 源码')
  /* 每行必须给到「详细信息」：分部 + 描述 + 领袖 + 展开后的 id / 设为领袖 */
  assert.match(rl[0], /divs\[r\.div\]/, '要显示分部标签')
  assert.match(rl[0], /r\.desc/, '要显示角色描述')
  assert.match(rl[0], /'👑'/, '领袖要有冠标')
  assert.match(rl[0], /'id: ' \+ r\.id/, '展开后要给出角色 id')
  assert.match(rl[0], /tp\.setLeader/, '展开后可设为领袖')
  assert.equal(/useState/.test(rl[0]), false, 'RosterList 应是无状态纯组件（展开态由调用方传入，两处共享）')
  for (const k of ['tp.pendingTeam', 'tp.langLabel', 'tp.isLeader', 'tp.setLeader']) {
    const n = (src.match(new RegExp("'" + k.replace('.', '\\.') + "':", 'g')) || []).length
    assert.equal(n, 2, k + ' 应在 zh/en 各定义一次，实际 ' + n)
  }
})

/* ---------- 用户体验梳理（本轮按用户视角重排） ---------- */

test('UX：标题栏只留「我在哪 / 我能做什么」，遥测下沉到抽屉', () => {
  const m = src.match(/t\('o\.title', \{ n: roles\.length \}\)[\s\S]{0,500}?\n      \),/)
  assert.ok(m, '拿不到标题行')
  assert.equal(/o\.tokensTurns|o\.tokensCache|o\.tokensIn/.test(m[0]), false, '标题行不得再放遥测数字')
  assert.match(src, /'tp\.statTitle'/, '遥测要搬进抽屉并带一个标题')
})

test('UX：破坏性动作不常驻（没东西可清时「清空」不出现）', () => {
  assert.match(src, /draftN === 0 \? null : React\.createElement\('button', \{[\s\S]{0,200}clearSelection/, '清空应改为按需出现')
})

test('UX：空态给的是按钮与人话，不是工具名', () => {
  assert.match(src, /t\('tp\.buildTeam'\)/, '缺「用它开工」按钮')
  assert.match(src, /PANEL_CTL\.open\('pick'\)/, '缺「去选人」的直达路径')
  assert.match(src, /target === 'pick'/, 'PANEL_CTL 订阅者要处理 pick 指令')
  /* 旧文案让用户自己去调工具名 —— 那是给开发者看的 */
  assert.equal(/agents_pixe_team_create 建团/.test(src), false, '中文旧提示应已移除')
  assert.equal(/create a team with agents_pixe_team_create/.test(src), false, '英文旧提示应已移除')
})

test('UX：办公室空画布要有首次引导，选了人就消失', () => {
  assert.match(src, /roles\.length === 0[\s\S]{0,420}o\.firstRun/, '缺首次引导条')
  assert.match(src, /'o\.firstRunPick'/, '引导条要带一个直接可点的「选人」')
})

test('UX：可点击的行必须键盘可达（上一轮自己指出、这一轮补上的缺口）', () => {
  const rl = src.match(/function RosterList\(props\)[\s\S]*?\n\}/)[0]
  assert.match(rl, /role: 'button'/, '阵容行要声明 button 角色')
  assert.match(rl, /tabIndex: 0/, '阵容行要能 Tab 聚焦')
  assert.match(rl, /onKeyDown:/, '阵容行要支持键盘操作')
  assert.match(rl, /ev\.key === 'Enter'/, '回车应能展开')
  assert.match(rl, /'aria-expanded': open/, '要播报展开状态')
  /* 「当前阵容」区块的折叠头同理 */
  assert.match(src, /role: 'button', tabIndex: 0, 'aria-expanded': !!rosterShown,/, '区块折叠头也要键盘可达')
})

test('回归：任何「选人」入口都必须同时切到办公室视图（团队页签优先会吃掉 pickerOpen）', () => {
  assert.match(src, /function gotoPicker\(\) \{[\s\S]{0,200}setView\('office'\)[\s\S]{0,80}setPickerOpen\(true\)/, 'gotoPicker 必须同时切视图 + 开面板')
  assert.match(src, /if \(pickerOpen\) \{ setPickerOpen\(false\); \} else \{ gotoPicker\(\); \}/, '抽屉里的「＋选人」必须走 gotoPicker')
  assert.equal(/setPickerOpen\(!pickerOpen\); setMoreOpen\(false\)/.test(src), false, '旧的「只置 pickerOpen」写法应已移除')
  assert.match(src, /onClick: gotoPicker,/, '首次引导的「＋选人」也要走同一条路径')
  /* 渲染分支「团队优先」是根因，必须留下说明，防止以后又有人单独置 pickerOpen */
  assert.match(src, /团队页签优先/, '要留下「为什么必须切视图」的说明')
})

test('回归：写操作绝不落进「空 sid」桶（那种写入界面和宿主都读不到）', () => {
  const s = src.match(/var STATE = \(function \(\)[\s\S]*?\n\}\)\(\);/)[0]
  assert.match(s, /var key = String\(sid \|\| ACTIVE_SID \|\| ''\);\s*\r?\n\s*if \(!key\) return;/, 'mut 必须拒绝无会话写入')
  assert.match(s, /function cur\(sid\) \{ return sess\(sid \|\| ACTIVE_SID\); \}/, '读操作也要回落，避免读写落到不同的桶')
  assert.match(src, /var sid = \(props && props\.sessionId\) \|\| ACTIVE_SID;/, '工作角色页签的 sid 要有回落')
})

test('UX：办公室 0 人时不提供「团队」这一屏，但已有团队时绝不隐藏入口', () => {
  assert.match(src, /var hasTeamView = roles\.length > 0 \|\| !!\(tv && \(\(\(tv\.members \|\| \[\]\)\.length\) \|\| \(\(tv\.tasks \|\| \[\]\)\.length\) \|\| tv\.plan\)\);/,
    '存在条件必须同时看「办公室有人」与「本会话已有宿主团队」')
  assert.match(src, /var effView = hasTeamView \? view : 'office';/, '用派生视图，而不是改 state（人再选上时要恢复原视图偏好）')
  assert.match(src, /hasTeamView\s*\r?\n\s*\? React\.createElement\('span', \{ style: \{ display: 'inline-flex'[^]*?\n\s*\)\s*\r?\n\s*: null,/, '切换器整体按需渲染')
  assert.match(src, /effView === 'team'\s*\r?\n\s*\? React\.createElement\('div', \{ style: \{ display: 'flex', flexDirection: 'column', width: '100%'/, '主体分支必须用派生视图')
  assert.equal(/minWidth: view === 'team'/.test(src), false, '容器宽度也要用派生视图，否则会撑成 900px 的办公室')
})

test('入口不得与宿主原生「团队」撞名（同一个 slot 区里有宿主自己的 agent-team 入口）', () => {
  /* 实测 slot：order -20 是宿主的 agent-team（显示「团队 (2)」），order 50 是我们。
   * 两个按钮都叫「团队」时，一个说 2 一个说 0，用户必然以为自相矛盾。 */
  const zh = src.match(/'tp\.entry': '([^']*)'/)
  const en = src.match(/'tp\.entry': '([^']*)'/)
  assert.ok(zh, '缺 tp.entry')
  assert.equal(zh[1].indexOf('像素团队'), 0, '我们的入口必须自称「像素团队」，实际：' + zh[1])
  assert.equal((src.match(/'tp\.entry':/g) || []).length, 2, 'tp.entry 必须 zh/en 各一次（重复键会被静默覆盖）')
  assert.match(src, /'tp\.entryTitle': '[^']*独立/, '入口提示要说清与宿主智能体团队相互独立')
  assert.equal(/t\('tp\.entryTitle'\)/.test(src), true, '标题要挂到入口上')
  void en
})

test('工具卡片：8 个 wire 工具名各注册一个 key，且不解析工具参数', () => {
  /* keyDomain 开放，但本插件只碰自己的工具名：不能去替换别人的视图 */
  const keys = [...src.matchAll(/'(agents_pixe_[a-z_]+)'/g)].map((m) => m[1])
  const declared = src.match(/var PIXE_TOOL_KEYS = \[([\s\S]*?)\];/)
  assert.ok(declared, '缺 PIXE_TOOL_KEYS')
  const list = [...declared[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  assert.equal(list.length, 8, '工具 key 数应为 8，实际 ' + list.length)
  for (const k of list) assert.ok(keys.includes(k), 'PIXE_TOOL_KEYS 里的 ' + k + ' 与源码其它处不一致')
  assert.match(src, /name: 'tool\.call\.toolview', key: toolKey/, '注册时必须带 key（keyed slot）')
  assert.match(src, /pixBoundary\('团队工具卡片'/, '工具卡片必须被 pixBoundary 包（不能把聊天渲染带崩）')
  /* 关键设计取舍：不解析 block 拼视图，而是读实时快照 */
  const view = src.match(/function PixeToolView\(props\)[\s\S]*?\n\}/)
  assert.ok(view, '缺 PixeToolView')
  assert.match(view[0], /var data = useTeamView\(sid\)/, '工具卡片应读实时快照')
})

test('工具卡片的原始区容错：取不到字段就留空，绝不 throw', () => {
  const raw = src.match(/function pixeToolRaw\(props\)[\s\S]*?\n\}/)
  assert.ok(raw, '缺 pixeToolRaw')
  assert.match(raw[0], /try \{/, 'pixeToolRaw 必须包 try（block 形状随宿主版本会变）')
  assert.match(raw[0], /catch \(e\) \{\}/, 'pixeToolRaw 的 catch 必须兜底')
  /* 多字段名兜底，而不是只认一个 */
  assert.match(raw[0], /b\.input \|\| b\.args \|\| b\.arguments \|\| b\.parameters/)
})

test('浮层布局记忆：位置/缩放/折叠/视图可恢复，且位置读回时夹回可视区', () => {
  assert.match(src, /var _OVERLAY_KEY = 'agents-pixe\.overlay\.v1'/)
  assert.match(src, /function readOverlayLayout\(\)/)
  assert.match(src, /function writeOverlayLayout\(patch\)/)
  assert.match(src, /Math\.max\(16 - W, Math\.min\(16, out\.dx\)\)/, '读回位置必须夹回可视区（换显示器后旧坐标可能整块在屏幕外）')
  assert.match(src, /var \[collapsed, setCollapsed\] = React\.useState\(savedLayout\.collapsed === true\)/)
  assert.match(src, /setTimeout\(function \(\) \{ writeOverlayLayout\(\{ dx: pos\.dx, dy: pos\.dy, zoom: zoom \}\); \}, 400\)/, '位置/缩放必须防抖写（拖拽每帧都写会打爆 localStorage）')
})
