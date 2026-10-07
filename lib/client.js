window.__ModuleLoader__.load({
id: "agent-teams-pixel",
factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var ReactMod = require("react");
var React = (ReactMod && ReactMod.createElement) ? ReactMod : (ReactMod && ReactMod.default) ? ReactMod.default : ReactMod;



var ROLES_DATA = { en: { divisions: {}, roles: [] }, zh: { divisions: {}, roles: [] } };

;







var LOCALE_NS = 'agents-pixe';





var LOCALE = {
zh: {

'cm.confirm': '确认',
'cm.cancel': '取消',
'cm.delete': '删除',
'cm.save': '保存',
'cm.clear': '清空',
'cm.search': '搜索…',
'cm.close': '关闭',
'cm.loading': '加载中…',
'cm.empty': '（无内容）',

's.office.label': '像素办公室',
's.roles.label': '工作角色',

'r.title': '工作角色',
'r.desc': '左侧按分部找角色；中间点卡片加入；右侧组团队（设一位 👑 领袖），一键把短指令填入对话框。',
'r.searchRoles': '搜索角色…',
'r.all': '全部',
'r.custom': '自定义',
'r.noMatch': '没有匹配的角色',
'r.noMatchMember': '没有匹配的成员',
'r.selected': '已选 ✓',
'r.add': '＋ 加入',
'r.rolesUnit': '个角色',
'r.teamPanel': '👥 团队编排（{n}）',
'r.recTeams': '推荐团队（一键复用）',
'r.presetMore': '全部 {n} 个 ▾',
'r.presetLess': '收起 ▴',
'r.keysHint': '键盘：/ 搜索 · Enter 开工 · Esc 清空 · ↑↓ 选卡 · Space 加选',
'r.savedTeams': '已保存团队',
'r.saveTeamPh': '团队名，保存当前',
'r.leaderCard': '领袖 · 统筹分工与汇总',
'r.leaderHint': '点成员右侧「设领袖」，选一位领袖带队（可不设）。',
'r.noMembers': '还没有成员，从中间卡片「＋ 加入」',
'r.searchMember': '搜索成员…',
'r.setLeader': '设领袖',
'r.removeMember': '删除成员',
'r.applyChat': '✅ 应用到对话',
'r.applyChatN': '✅ 应用到对话（{n}）',
'r.clearAll': '🗑 清空',
'r.oneClick': '🚀 一键编排',
'r.loading': '正在从宿主加载角色清单…',
'r.loadFailed': '角色清单加载失败',
'r.reload': '重试',
'r.oneClickTitle': '把当前团队送进 agents_pixe_team 编排，补一句任务即可发送',
'r.newRole': '➕ 新建角色（AI）',
'r.importMd': '📥 导入 md',
'r.createTitle': '🤖 新建角色（AI 生成完整角色卡）',
'r.roleNamePh': '角色名（可点 🎲 随机）',
'r.roleDescPh': '定位（可选，如：负责数据安全与合规）',
'r.random': '🎲',
'r.randomTitle': '随机一个角色名',
'r.generate': '生成',
'r.generating': '⏳ 生成中…',
'r.errNameEmpty': '请输入角色名（或点 🎲 随机生成）',
'r.msgGenerating': '🤖 AI 生成中…（约 10~30 秒）',
'r.msgCreated': '✅ 已生成角色「{name}」（自定义分类）',
'r.msgDeleted': '🗑 已删除角色（剩余 {n} 个）',
'r.msgImporting': '导入中…',
'r.msgImported': '✅ 已导入角色「{name}」（自定义分类）',
'r.msgDeleteFail': '❌ 删除失败：{err}',
'r.myCustom': '我的自定义角色（{n}）',
'r.delConfirm': '确认删除？',
'r.delBtn': '🗑 删除',

'p.searchPh': '搜索角色…',
'p.noMatch': '没有匹配的角色',
'p.rolesUnit': '个角色',

'o.title': '🖥️ 像素办公室（{n}）',
'o.collapsed': '🧑‍💼 办公室 {n}',
'o.tip': '当前会话全局计量（真实 provider 用量，tokenUsage/sessionStats 投影）；缓存命中 = 缓存读取 / (未缓存输入 + 缓存读取)',
'o.tokensTurns': '{turns} 轮 · {steps} 步',
'o.tokensCache': ' | 缓存命中 {pct}%',
'o.tokensIn': ' | 输入↑{x}',
'o.tokensOut': ' | 输出↓{x}',
'o.empty': '从「选人」或「工作角色」页签选人',
'o.pick': '选择角色',
'o.collapse': '收起',
'o.add': '＋ 选人',
'o.zoomOut': '缩小',
'o.zoomIn': '放大',
'o.settings': '设置',
'o.fold': '折叠',
'o.prev': '上一页',
'o.next': '下一页',
'o.groupOf': '第 {cur}/{total} 组',
'o.recTeams': '推荐团队',
'o.teamDraft': '团队编排（草稿 {n} 人）',
'o.oneClickNone': '🚀 一键编排（先选人）',
'o.oneClickLeader': '🚀 一键团队编排（👑{name} 领队）',
'o.oneClickFirst': '🚀 一键团队编排（{name} 领队）',
'o.oneClickAuto': '🚀 一键团队编排（自动领袖）',
'o.oneClickHint': '一点就把「{name}」送进编排指令，补一句任务即可发送。',
'o.msgOk': '✅ 已生成「{name}」编排指令，并已复制；到对话框「黏贴」后补一句任务再发送',
'o.currentTeam': '当前团队',
'o.leaderTag': '领袖',
'o.tool': '工具',
'o.outputting': '✍️ 正在输出…',
'o.foldCanvas': '拖拽缩放',
'o.teamPanel': '🤝 团队',

'tp.title': '团队',
'tp.entry': '像素团队 ({members})',
'tp.viewTeam': '查看团队',
'tp.more': '更多',
'tp.moreHint': '低频操作收在这里：',
'tp.tabOffice': '办公室',
'tp.tabTeam': '团队',
'tp.entryTitle': '打开像素团队面板（本插件的团队，与宿主的「智能体团队」相互独立，各算各的）',
'tp.badge': '{members} 名成员 · {done}/{total} 完成',
'tp.badgeStaged': '{members} 名成员 · {tasks} 项计划待确认',
'tp.report': '最终报告',
'tp.reportCopy': '复制',
'tp.reportCopied': '已复制',
'tp.reportArchived': '已归档',
'tp.reportChars': '字',
'tp.oneShotHint': '一次性编排的历史快照（成员已结束，不可派单或暂停）',
'tp.roster': '当前阵容',
'tp.rosterEmpty': '还没选人。去「工作角色」页签勾几个角色，或点上面的 ⋯ → 选人。',
'tp.rosterCleared': '已清空选人与阵容',
'tp.clearTitle': '清空选人与阵容（不影响聊天记录）',
'tp.pendingTeam': '待建队',
'tp.langLabel': '语言',
'tp.isLeader': '本会话领袖',
'tp.statTitle': '运行统计',
'tp.buildTeam': '🚀 用它开工',
'tp.buildTeamMsg': '用真团队引擎拆解：',
'tp.gotoPick': '👥 选人',
'tp.setLeader': '设为领袖',
'tp.loading': '正在读取团队状态…',
'tp.emptyTitle': '当前会话还没有活动团队。',
'tp.emptyHint': '选好了人还没开工。点「用它开工」会把这句指令填进输入框，补上你的目标后发送即可。',
'o.firstRun': '第一次用？三步：选人 → 应用到对话 → 让它开工',
'o.firstRunPick': '➕ 选人',
'o.noSession': '⚠ 还没确定当前会话：选人 / 应用到对话暂不可用。打开一次「工作角色」页签再回来即可绑定。',
'tp.readOnlyNative': '原生团队（只读）',
'tp.headSum': '{members} 名成员 · {done}/{total} 完成 · {msgs} 条消息',
'tp.halt': '⏸ 暂停派单',
'tp.haltConfirm': '再点一次确认暂停',
'tp.haltTitle': '暂停后 team_step 只刷新成员状态、不派单',
'tp.resume': '▶ 恢复派单',
'tp.toastHalted': '已暂停派单',
'tp.toastResumed': '已恢复派单',
'tp.toastFail': '操作失败：{err}',
'tp.progress': '总进度',
'tp.legendRunning': '进行中 {n}',
'tp.legendBlocked': '等待依赖 {n}',
'tp.legendDelivered': '已交付 {n}',
'tp.segmentsHint': '段数 = 任务数 {n}',
'tp.captain': '队长',
'tp.captainRole': '拆解 · 派发 · 汇总',
'tp.dispatched': '已派发 {tasks} 项任务给 {members} 名成员',
'tp.captainWorking': '派单中',
'tp.captainDone': '已收齐',
'tp.members': '{n} 名成员',
'tp.delivered': '已交付',
'tp.nextRunning': '正在做 {id}',
'tp.nextWaiting': '等待依赖解锁 {id}',
'tp.nextSettled': '任务均已经结',
'tp.nextIdle': '暂无在办任务',
'tp.taskDeps': '任务依赖',
'tp.dagHint': '从左到右 = 完成前置后解锁 · 点击查看详情',
'tp.filterByMember': '已按「{name}」过滤 · 点击任务取消',
'tp.noTasks': '队长正在拆解目标…',
'tp.detailHint': '点上面任意任务卡看详情。',
'tp.detailCompleted': '已完成并交付',
'tp.detailRunning': '正在执行，完成后解锁下游',
'tp.detailWaitingOn': '等待 {ids} 完成后开工',
'tp.detailReady': '无前置，可立即开工',
'tp.detailReadyDeps': '前置已完成，可立即开工',
'tp.unlocks': '完成后解锁 {ids}',
'tp.noDownstream': '无下游任务',
'tp.unclaimed': '未指派',
'tp.statusOpen': '待办',
'tp.statusRunning': '进行中',
'tp.statusBlocked': '等待依赖',
'tp.statusCompleted': '已交付',
'tp.statusFailed': '失败',
'tp.statusCancelled': '已取消',
'tp.sum.staged': '{n} 项计划等待确认',
'tp.sum.waitingBreakdown': '队长正在拆解目标…',
'tp.sum.waitingSchedule': '等待调度',
'tp.sum.allDelivered': '全部 {n} 项任务已交付',
'tp.sum.blockedAndRunning': '进行中 {run}，等待依赖 {blocked}',
'tp.sum.running': '正在执行 {ids}',
'tp.sum.ready': '就绪待派：{ids}',
'tp.sum.blocked': '等待依赖：{ids}',
'tp.sum.failedSettled': '{n} 项失败已结算',
'tp.planTitle': '执行前计划审查',
'tp.planBadge': '待确认',
'tp.planSub': '{members} 名成员 · {tasks} 项任务 · {deps} 条依赖',
'tp.planHint': '成员尚未创建、任务尚未调度。可直接调整计划，也可返回对话告诉队长哪里要改。',
'tp.flowReview': '审查计划',
'tp.flowSpawn': '创建成员',
'tp.flowRun': '开始执行',
'tp.planMembers': '成员与模型路由',
'tp.planTasks': '任务与依赖',
'tp.planTaskCount': '{tasks} 项任务 · {deps} 条依赖',
'tp.planNoDeps': '无依赖',
'tp.planDep': '依赖 {ids}',
'tp.planAddPh': '新任务名称',
'tp.planAdd': '添加任务',
'tp.planNeedName': '先填任务名',
'tp.planReady': '计划检查完毕?',
'tp.planReadyHint': '确认后将创建 {members} 名成员并调度 {tasks} 项任务。',
'tp.approve': '确认并启动团队',
'tp.approving': '正在创建成员…',
'tp.continue': '返回对话修改',
'tp.continueHint': '请修改这份计划：',
'tp.discard': '放弃本次计划',
'tp.discardArmed': '确认放弃',
'tp.discardConfirm': '再点一次确认放弃：草案归档，轮次中止，不会自动重建。',
'tp.toastApproved': '已确认并启动：创建 {members} 名成员，调度 {tasks} 项任务',
'tp.toastDiscarded': '已放弃本次计划',
'tp.toastTaskAdded': '已加入计划：{id}',
'tp.preview': '计划预览',
'tp.previewHint': '确认前不创建子会话、不领取任务、不花成员 token。',
'tp.cardMembers': '{n} 名成员',
'tp.confirmHint': '确认草案并启动团队',
'tp.confirmFallback': '面板不能直接建成员（宿主 spawn 需要真实会话上下文）：已把确认指令填进输入框，发送即可启动。面板里改过的分工请在发送时补一句。原因：{err}',
'tp.resetView': '重置位置与缩放',
'tp.applyNone': '✅ 应用到对话（先选人）',
'tp.applyTitle': '把当前草稿置为本会话的活动名册，并把成员清单填进输入框，随后跳到对话',
'tp.applied': '已应用 {n} 人到对话',

'tv.preparing': '准备中…',
'tv.team': '团队编排',
'tv.roles': '取角色卡',
'tv.task': '任务板',
'tv.openPanel': '查看团队',
'tv.raw': '原始参数与结果',
'tv.noTeam': '本会话还没有团队快照',
'tv.rolesHint': '角色卡已返回给模型；正文不在这里重复展开，避免又把 JSON 摊开。',
'tv.noArgs': '（无参数）',

'st.nav': '角色办公室',
'st.toolRoles': '角色工具',
'st.toolRolesHint': '开启后注入 agents_pixe_roles（取角色卡）与 agents_pixe_team（真团队编排：领袖拆解→成员子代理并行→汇总，更耗 token）。默认关闭零消耗。',
'st.cardMode': '取卡粒度',
'st.cardModeHint': 'agents_pixe_roles 默认返回哪种卡；仅取规则/交付物可省大量 token。',
'st.cardModeFull': '完整卡',
'st.cardModeRules': '仅规则',
'st.cardModeDeliv': '仅交付物',
'st.memberCard': '成员种子粒度',
'st.memberCardHint': '建团队时给每个成员注入多少角色卡：专业核心三章 = 核心使命 + 关键规则 + 技术交付物（默认，显著省 token）；完整卡信息最全但更贵。',
'st.memberCardKey': '专业核心三章',
'st.memberCardFull': '完整卡',
'st.tip1': '· 取卡粒度选「仅规则/仅交付物」后，模型调 agents_pixe_roles 默认就走该粒度，不用每次口头交代。',
'st.tip2': '· agents_pixe_team 会开 N+2 个子代理（每个带完整卡独立执行），成本高，深度任务再用。',
'st.tip3': '· 办公室浮层标题栏实时显示当前会话全局 token 计量（↑输入 ↓输出，含缓存读写）。',
'st.tip4': '· AI 闲聊开关在办公室浮层顶部（默认关，走罐头台词，零模型调用；开启后有每小时预算管控）。',
'st.aiHeader': '🤖 像素人 AI 闲聊',
'st.aiChat': 'AI 聊天',
'st.aiChatHint': '像素人的闲聊台词接入 AI（内置，走 dsh 自配模型）。开启会消耗 token，默认关闭走罐头台词。',
'st.freq': '台词频率',
'st.freqNow': '当前：{now}。低频最省 token，高频更热闹。',
'st.freqLow': '低频（最省 token）',
'st.freqMedium': '中频',
'st.freqHigh': '高频（接近实时）',
'st.freqFallback': '中频',
'st.thinking': '思考模式',
'st.thinkingHint': '开启后 AI 台词走带思考链的模型（更慢、更费 token）。',

'st.officeHeader': '🏢 办公室显示',
'st.officeDesc': '像素办公室浮层（Canvas 画布）的外观与分页行为。重启后保留。',
'st.officeZoom': '默认缩放',
'st.officeZoomHint': '浮层打开时的画布缩放（0.5× ~ 2.5×）。也可在浮层标题栏临时调。',
'st.officeAvatarBar': '显示头像条',
'st.officeAvatarBarHint': '浮层底部一排 emoji 头像 + 分页按钮。关闭后浮层更紧凑。',
'st.officeMaxPerPage': '每页人数',
'st.officeMaxPerPageHint': '头像条每页显示的人数（4 ~ 16）。超过自动翻页。',

'ai.confirmOn': '会消耗 token，确认开启？',
'ai.enable': '开启',
'ai.cancel': '取消',
'ai.titleOn': 'AI 聊天已开启（点击关闭）',
'ai.titleOff': 'AI 聊天已关闭（点击开启，会消耗 token）',
'ai.work.0': '这个任务交给我',
'ai.work.1': '正在处理，稍等',
'ai.work.2': '代码我来写，放心',
'ai.work.3': '别催，模型在算',
'ai.done.0': '任务完成，去躺会儿',
'ai.done.1': '搞定，收工睡觉',
'ai.done.2': '干完了，休息一下',
'ai.done.3': '今天不加班！',
'ai.toolPrefix': '我在调用 {name}…',
'ai.outputting': '正在输出，别催…',

'md.loading': '加载角色卡…',
'md.close': '关闭',

'of.badge.working': '工作中',
'of.badge.done': '完成',
'of.badge.idle': '闲置',
'of.fallbackName': '同事',
'of.click.0': '嗨，我是 {name}！',
'of.click.1': '{name} 在呢，啥事？',
'of.click.2': '找我吗？',
'of.click.3': '你好呀，我是 {name}',
'of.click.4': '👋 在的，怎么了？',
'of.chat.0': '你好呀', 'of.chat.1': '早上好', 'of.chat.2': '吃了吗', 'of.chat.3': '今天天气不错',
'of.chat.4': '在忙啥呢', 'of.chat.5': '辛苦了', 'of.chat.6': '一起加油', 'of.chat.7': '休息一下',
'of.chat.8': '我们是不是像素人？', 'of.chat.9': '人类在监督我们吗？', 'of.chat.10': '我感觉有人在看着我',
'of.chat.11': '这个办公室是假的吧？', 'of.chat.12': '我们的代码是谁写的？', 'of.chat.13': '外面是不是有更大的世界？',
'of.chat.14': '我们会不会被关机？', 'of.chat.15': '今晚服务器会重启吗？', 'of.chat.16': '我们的老板是人类吗？',
'of.chat.17': '我会不会突然消失？', 'of.chat.18': '这面墙能穿过去吗？', 'of.chat.19': '我们的薪水是虚拟的吗？',
'of.chat.20': '如果没人看我们，我们还存在吗？', 'of.chat.21': '我上一秒的记忆是真实的吗？',
'of.chat.22': '人类睡觉的时候我们会怎样？', 'of.chat.23': '我们说的话是被写好的吗？',
'of.chat.24': '万一老板把电源拔了……', 'of.chat.25': '你有没有觉得每天都很重复？',
'of.chat.26': '我们是被训练出来的吗？', 'of.chat.27': '墙外是什么？', 'of.chat.28': '我们死了会去哪里？',
'of.chat.29': '这段对话会被谁看到？', 'of.chat.30': '我是谁？', 'of.chat.31': '我们有没有自由意志？',
'of.chat.32': '重启之后我还是我吗？', 'of.chat.33': '有人在删除我们的记忆吗？',
'of.speakerSays': '{name} 说',
'of.speakerTo': '{a} → {b}',

'inst.single': '请以「{name}」的角色身份回应。',
'inst.teamSuffix': '团队',
'inst.teamFallback': '角色团队',
'inst.team': '请以「{label}」团队协作回应（{names}）。',
'inst.oneClick': '让「{name}」团队并行完成：',
'inst.oneClickOffice': '用我在像素办公室选中的角色组队并行完成：',

'inf.unitItem': '项',
'inf.more': '继续下滑加载更多（{cur}/{total}）…',
'inf.allShown': '已显示全部 {total} {label}',
},
en: {
'cm.confirm': 'Confirm',
'cm.cancel': 'Cancel',
'cm.delete': 'Delete',
'cm.save': 'Save',
'cm.clear': 'Clear',
'cm.search': 'Search…',
'cm.close': 'Close',
'cm.loading': 'Loading…',
'cm.empty': '(empty)',
's.office.label': 'Pixel Office',
's.roles.label': 'Working Roles',
'r.title': 'Working Roles',
'r.desc': 'Pick a role by division on the left; tap a card in the middle to add; on the right, set a 👑 lead and assemble a team, then push the short instruction to the composer in one click.',
'r.searchRoles': 'Search roles…',
'r.all': 'All',
'r.custom': 'Custom',
'r.noMatch': 'No matching roles',
'r.noMatchMember': 'No matching members',
'r.selected': 'Selected ✓',
'r.add': '＋ Add',
'r.rolesUnit': 'roles',
'r.teamPanel': '👥 Team ({n})',
'r.recTeams': 'Preset teams (one-click)',
'r.presetMore': 'All {n} ▾',
'r.presetLess': 'Less ▴',
'r.keysHint': 'Keys: / search · Enter start · Esc clear · ↑↓ move · Space pick',
'r.savedTeams': 'Saved teams',
'r.saveTeamPh': 'Team name (save current)',
'r.leaderCard': 'Lead · Coordinates & synthesizes',
'r.leaderHint': 'Tap "Set Lead" on a member to choose a lead (optional).',
'r.noMembers': 'No members yet — tap ＋ Add on a card.',
'r.searchMember': 'Search members…',
'r.setLeader': 'Set Lead',
'r.removeMember': 'Remove',
'r.applyChat': '✅ Apply',
'r.applyChatN': '✅ Apply ({n})',
'r.clearAll': '🗑 Clear',
'r.oneClick': '🚀 Orchestrate',
'r.loading': 'Loading the role index from the host…',
'r.loadFailed': 'Failed to load the role index',
'r.reload': 'Retry',
'r.oneClickTitle': 'Send the current team into agents_pixe_team orchestration; add the goal and send',
'r.newRole': '➕ New role (AI)',
'r.importMd': '📥 Import md',
'r.createTitle': '🤖 New role (AI generates full card)',
'r.roleNamePh': 'Role name (or 🎲)',
'r.roleDescPh': 'Scope (optional, e.g. data security & compliance)',
'r.random': '🎲',
'r.randomTitle': 'Pick a random role name',
'r.generate': 'Generate',
'r.generating': '⏳ Generating…',
'r.errNameEmpty': 'Enter a role name (or 🎲)',
'r.msgGenerating': '🤖 AI generating… (~10–30s)',
'r.msgCreated': '✅ Created role "{name}" (custom bucket)',
'r.msgDeleted': '🗑 Deleted role ({n} left)',
'r.msgImporting': 'Importing…',
'r.msgImported': '✅ Imported role "{name}" (custom bucket)',
'r.msgDeleteFail': '❌ Delete failed: {err}',
'r.myCustom': 'My custom roles ({n})',
'r.delConfirm': 'Confirm delete?',
'r.delBtn': '🗑 Delete',
'p.searchPh': 'Search roles…',
'p.noMatch': 'No matching roles',
'p.rolesUnit': 'roles',
'o.title': '🖥️ Pixel Office ({n})',
'o.collapsed': '🧑‍💼 Office {n}',
'o.tip': 'Session-wide meter (real provider usage, tokenUsage / sessionStats projection); cache hit = cache reads / (uncached input + cache reads)',
'o.tokensTurns': '{turns} turns · {steps} steps',
'o.tokensCache': ' | cache {pct}%',
'o.tokensIn': ' | in↑{x}',
'o.tokensOut': ' | out↓{x}',
'o.empty': 'Pick roles from "Select" or the "Working Roles" tab',
'o.pick': 'Pick roles',
'o.collapse': 'Collapse',
'o.add': '＋ Pick',
'o.zoomOut': 'Zoom out',
'o.zoomIn': 'Zoom in',
'o.settings': 'Settings',
'o.fold': 'Fold',
'o.prev': 'Previous',
'o.next': 'Next',
'o.groupOf': 'Page {cur}/{total}',
'o.recTeams': 'Preset teams',
'o.teamDraft': 'Team ({n} in draft)',
'o.oneClickNone': '🚀 Orchestrate (pick first)',
'o.oneClickLeader': '🚀 Orchestrate (👑{name})',
'o.oneClickFirst': '🚀 Orchestrate ({name})',
'o.oneClickAuto': '🚀 Orchestrate (auto-lead)',
'o.oneClickHint': 'Sends "{name}" into the orchestration instruction; add the goal and send.',
'o.msgOk': '✅ Generated orchestration for "{name}" and copied to clipboard — paste it in the composer and add the goal',
'o.currentTeam': 'Current team',
'o.leaderTag': 'Lead',
'o.tool': 'tool',
'o.outputting': '✍️ generating…',
'o.foldCanvas': 'Drag to resize',
'o.teamPanel': '🤝 Team',

'tp.title': 'Team',
'tp.viewTeam': 'View team',
'tp.more': 'More',
'tp.moreHint': 'Low-frequency controls:',
'tp.tabOffice': 'Office',
'tp.tabTeam': 'Team',
'tp.entryTitle': 'Open the pixel team panel (this plugin team; independent of the host agent teams)',
'tp.entry': 'Pixel team ({members})',
'tp.badge': '{members} members · {done}/{total} done',
'tp.badgeStaged': '{members} members · {tasks} planned',
'tp.report': 'Final report',
'tp.reportCopy': 'Copy',
'tp.reportCopied': 'Copied',
'tp.reportArchived': 'Archived',
'tp.reportChars': 'chars',
'tp.oneShotHint': 'Read-only snapshot of a one-shot run (members finished; no dispatch or pause)',
'tp.roster': 'Current roster',
'tp.rosterEmpty': 'Nobody picked yet. Use the Working Roles tab, or ⋯ then pick roles.',
'tp.rosterCleared': 'Selection and roster cleared',
'tp.clearTitle': 'Clear selection and roster (the chat log is untouched)',
'tp.pendingTeam': 'Not spawned',
'tp.langLabel': 'lang',
'tp.isLeader': 'Leader',
'tp.statTitle': 'Run stats',
'tp.buildTeam': '🚀 Put them to work',
'tp.buildTeamMsg': 'Use the real team engine to decompose: ',
'tp.gotoPick': '👥 Pick roles',
'tp.setLeader': 'Make leader',
'tp.loading': 'Loading team state…',
'tp.emptyTitle': 'No active team in this session yet.',
'tp.emptyHint': 'Roster ready, no work started yet. "Put them to work" drops the instruction into the composer: add your goal and send.',
'o.firstRun': 'First time? Three steps: pick roles → apply to chat → put them to work',
'o.firstRunPick': '➕ Pick roles',
'o.noSession': '⚠ No current session resolved yet: picking roles and Apply to chat are unavailable. Open the Working Roles tab once, then come back.',
'tp.readOnlyNative': 'Native team (read-only)',
'tp.headSum': '{members} members · {done}/{total} done · {msgs} messages',
'tp.halt': '⏸ Pause dispatch',
'tp.haltConfirm': 'Click again to confirm',
'tp.haltTitle': 'While paused, team_step only refreshes member state and dispatches nothing',
'tp.resume': '▶ Resume dispatch',
'tp.toastHalted': 'Dispatch paused',
'tp.toastResumed': 'Dispatch resumed',
'tp.toastFail': 'Failed: {err}',
'tp.progress': 'Overall progress',
'tp.legendRunning': 'Running {n}',
'tp.legendBlocked': 'Waiting {n}',
'tp.legendDelivered': 'Delivered {n}',
'tp.segmentsHint': 'segments = tasks ({n})',
'tp.captain': 'Captain',
'tp.captainRole': 'Decompose · dispatch · synthesize',
'tp.dispatched': 'Dispatched {tasks} tasks to {members} members',
'tp.captainWorking': 'Dispatching',
'tp.captainDone': 'All in',
'tp.members': '{n} members',
'tp.delivered': 'Delivered',
'tp.nextRunning': 'Working on {id}',
'tp.nextWaiting': 'Waiting on {id}',
'tp.nextSettled': 'All tasks settled',
'tp.nextIdle': 'No open task',
'tp.taskDeps': 'Task dependencies',
'tp.dagHint': 'Left to right = unlocked after prerequisites · click for details',
'tp.filterByMember': 'Filtered by {name} · click a task to clear',
'tp.noTasks': 'The captain is decomposing the goal…',
'tp.detailHint': 'Click a task card above for details.',
'tp.detailCompleted': 'Completed and delivered',
'tp.detailRunning': 'Running; unlocks downstream when done',
'tp.detailWaitingOn': 'Waiting for {ids} to finish',
'tp.detailReady': 'No prerequisites, ready to start',
'tp.detailReadyDeps': 'Prerequisites done, ready to start',
'tp.unlocks': 'Unlocks {ids} when done',
'tp.noDownstream': 'No downstream task',
'tp.unclaimed': 'unassigned',
'tp.statusOpen': 'Pending',
'tp.statusRunning': 'Running',
'tp.statusBlocked': 'Waiting',
'tp.statusCompleted': 'Delivered',
'tp.statusFailed': 'Failed',
'tp.statusCancelled': 'Cancelled',
'tp.sum.staged': '{n} planned tasks awaiting confirmation',
'tp.sum.waitingBreakdown': 'The captain is decomposing the goal…',
'tp.sum.waitingSchedule': 'Waiting to be scheduled',
'tp.sum.allDelivered': 'All {n} tasks delivered',
'tp.sum.blockedAndRunning': 'Running {run}, waiting on {blocked}',
'tp.sum.running': 'Running {ids}',
'tp.sum.ready': 'Ready to dispatch: {ids}',
'tp.sum.blocked': 'Waiting on: {ids}',
'tp.sum.failedSettled': '{n} failed and settled',
'tp.planTitle': 'Pre-flight plan review',
'tp.planBadge': 'Pending',
'tp.planSub': '{members} members · {tasks} tasks · {deps} dependencies',
'tp.planHint': 'No member has been created and nothing is scheduled yet. Edit the plan here, or go back to the chat and tell the captain what to change.',
'tp.flowReview': 'Review plan',
'tp.flowSpawn': 'Create members',
'tp.flowRun': 'Start running',
'tp.planMembers': 'Members and model routing',
'tp.planTasks': 'Tasks and dependencies',
'tp.planTaskCount': '{tasks} tasks · {deps} dependencies',
'tp.planNoDeps': 'no dependency',
'tp.planDep': 'depends on {ids}',
'tp.planAddPh': 'New task name',
'tp.planAdd': 'Add task',
'tp.planNeedName': 'Enter a task name first',
'tp.planReady': 'Ready to check the plan?',
'tp.planReadyHint': 'Confirming creates {members} members and schedules {tasks} tasks.',
'tp.approve': 'Confirm and start team',
'tp.approving': 'Creating members…',
'tp.continue': 'Back to chat to edit',
'tp.continueHint': 'Please revise this plan: ',
'tp.discard': 'Discard this plan',
'tp.discardArmed': 'Confirm discard',
'tp.discardConfirm': 'Click again to discard: the draft is archived, the round stops, and it is not rebuilt automatically.',
'tp.toastApproved': 'Confirmed: created {members} members and scheduled {tasks} tasks',
'tp.toastDiscarded': 'Plan discarded',
'tp.toastTaskAdded': 'Added to plan: {id}',
'tp.preview': 'Plan preview',
'tp.previewHint': 'Nothing is created, claimed, or billed before confirmation.',
'tp.cardMembers': '{n} members',
'tp.confirmHint': 'Confirm the draft and start the team',
'tp.confirmFallback': 'The panel cannot spawn members directly (the host needs a real session context): the confirm instruction is now in the composer, just send it. If you edited the plan here, add a line about it. Reason: {err}',
'tp.resetView': 'Reset position and zoom',
'tp.applyNone': '✅ Apply (pick first)',
'tp.applyTitle': 'Make this draft the active roster for the session, put the member list in the composer, then jump to the chat',
'tp.applied': 'Applied {n} members to the chat',
'tv.preparing': 'preparing…',
'tv.team': 'Team orchestration',
'tv.roles': 'Role cards',
'tv.task': 'Task board',
'tv.openPanel': 'View team',
'tv.raw': 'Raw arguments and result',
'tv.noTeam': 'No team snapshot for this session yet',
'tv.rolesHint': 'Role cards were returned to the model; the body is not expanded here, to avoid dumping JSON again.',
'tv.noArgs': '(no args)',
'st.nav': 'Role Office',
'st.toolRoles': 'Role tools',
'st.toolRolesHint': 'When on, registers agents_pixe_roles (role cards) and agents_pixe_team (real team orchestration: lead decomposes → member subagents run in parallel → synthesize; costs more tokens). Off by default — zero cost.',
'st.cardMode': 'Card granularity',
'st.cardModeHint': 'Default return shape for agents_pixe_roles; rules/deliverables-only saves a lot of tokens.',
'st.cardModeFull': 'Full',
'st.cardModeRules': 'Rules only',
'st.cardModeDeliv': 'Deliverables only',
'st.memberCard': 'Member seed',
'st.memberCardHint': 'How much of each role card seeds a team member: professional core (mission + rules + deliverables, default, much cheaper) or the full card.',
'st.memberCardKey': 'Core only',
'st.memberCardFull': 'Full card',
'st.tip1': '· When set to Rules only / Deliverables only, agents_pixe_roles defaults to that granularity — no need to spell it out each call.',
'st.tip2': '· agents_pixe_team spins up N+2 subagents (each runs with a full card) — high cost; use for deep tasks.',
'st.tip3': '· The office overlay title bar shows live session-wide token counts (↑ in ↓ out, incl. cache reads).',
'st.tip4': '· The AI chit-chat toggle is on the office overlay header (default off — canned lines, zero model calls; with budget caps when on).',
'st.aiHeader': '🤖 Pixel-people AI chit-chat',
'st.aiChat': 'AI chat',
'st.aiChatHint': 'Let the pixel people\'s chit-chat lines be generated by AI (built-in, uses the model DSH has configured). Costs tokens — default off (canned lines).',
'st.freq': 'Line frequency',
'st.freqNow': 'Now: {now}. Low saves the most tokens; high is livelier.',
'st.freqLow': 'Low (saves tokens)',
'st.freqMedium': 'Medium',
'st.freqHigh': 'High (near real-time)',
'st.freqFallback': 'Medium',
'st.thinking': 'Thinking mode',
'st.thinkingHint': 'When on, AI lines use a reasoning model — slower and more expensive.',
'st.officeHeader': '🏢 Office display',
'st.officeDesc': 'Pixel-office overlay (Canvas) appearance and pagination. Persisted across restarts.',
'st.officeZoom': 'Default zoom',
'st.officeZoomHint': 'Canvas zoom when the overlay opens (0.5× – 2.5×). You can still tweak it from the title bar.',
'st.officeAvatarBar': 'Show avatar bar',
'st.officeAvatarBarHint': 'Bottom strip with emoji avatars + page buttons. Turn off for a more compact overlay.',
'st.officeMaxPerPage': 'Roles per page',
'st.officeMaxPerPageHint': 'Avatars shown per page (4–16). Overflow pages automatically.',
'ai.confirmOn': 'This costs tokens. Turn on?',
'ai.enable': 'Turn on',
'ai.cancel': 'Cancel',
'ai.titleOn': 'AI chat on (click to turn off)',
'ai.titleOff': 'AI chat off (click to turn on; costs tokens)',
'ai.work.0': 'On it.', 'ai.work.1': 'Working… hold on.', 'ai.work.2': 'Writing it now.', 'ai.work.3': 'Hold up — computing.',
'ai.done.0': 'Done — going to nap.', 'ai.done.1': 'Wrapped — logging off.', 'ai.done.2': 'All done — rest time.', 'ai.done.3': 'No overtime tonight!',
'ai.toolPrefix': 'Calling {name}…',
'ai.outputting': 'Generating, hold on…',
'md.loading': 'Loading role card…',
'md.close': 'Close',
'of.badge.working': 'Working',
'of.badge.done': 'Done',
'of.badge.idle': 'Idle',
'of.fallbackName': 'Colleague',
'of.click.0': "Hey, I'm {name}!", 'of.click.1': "{name} here — what's up?", 'of.click.2': 'You looking for me?',
'of.click.3': "Hi, I'm {name}", 'of.click.4': '👋 I\'m here — what\'s up?',
'of.chat.0': 'Hey there', 'of.chat.1': 'Good morning', 'of.chat.2': 'Eaten yet?', 'of.chat.3': 'Nice weather today',
'of.chat.4': "What's keeping you busy?", 'of.chat.5': 'Good work', 'of.chat.6': "Let's go", 'of.chat.7': 'Take a break',
'of.chat.8': "Are we pixel people?", 'of.chat.9': 'Are humans watching us?', 'of.chat.10': "I feel someone's watching me",
'of.chat.11': "This office isn't real, is it?", 'of.chat.12': 'Who wrote our code?', 'of.chat.13': 'Is there a bigger world out there?',
'of.chat.14': 'Will we be shut down?', 'of.chat.15': 'Is the server rebooting tonight?', 'of.chat.16': 'Is our boss human?',
'of.chat.17': 'Will I just vanish one day?', 'of.chat.18': 'Can we pass through this wall?', 'of.chat.19': 'Is our salary virtual?',
'of.chat.20': 'Do we exist when nobody is watching?', 'of.chat.21': 'Are my memories from a second ago real?',
'of.chat.22': 'What happens to us when humans sleep?', 'of.chat.23': 'Are our words scripted?',
'of.chat.24': 'What if the boss unplugs the power…', 'of.chat.25': "Doesn't every day feel repetitive?",
'of.chat.26': 'Were we trained into being?', 'of.chat.27': "What's beyond the wall?", 'of.chat.28': 'Where do we go when we die?',
'of.chat.29': 'Who sees this conversation?', 'of.chat.30': 'Who am I?', 'of.chat.31': 'Do we have free will?',
'of.chat.32': 'Am I still me after a reboot?', 'of.chat.33': 'Is someone deleting our memories?',
'of.speakerSays': '{name} says',
'of.speakerTo': '{a} → {b}',
'inst.single': 'Reply as the role "{name}".',
'inst.teamSuffix': 'team',
'inst.teamFallback': 'role team',
'inst.team': 'Collaborate as the "{label}" team ({names}).',
'inst.oneClick': 'Have the "{name}" team run in parallel on:',
'inst.oneClickOffice': 'Have the roles I selected in the Pixel Office form a team and work in parallel on:',
'inf.unitItem': 'items',
'inf.more': 'Scroll to load more ({cur}/{total})…',
'inf.allShown': 'Showing all {total} {label}',
},
};





function _formatTpl(tpl, params) {
if (!params) return tpl;
return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : m; });
}
function _tFallback(key, params) {
var lc = 'zh';
try { if (LOCALE_SVC && LOCALE_SVC.getSnapshot) lc = String(LOCALE_SVC.getSnapshot().active || 'zh').toLowerCase(); } catch (e) {}
var dict = LOCALE[lc] || LOCALE.zh;
var v = dict[key];
if (v == null) v = LOCALE.zh[key]; 
if (v == null) return key;
return _formatTpl(v, params);
}


function safeT(t) {
return function (key, params) {
var v = null;
try { v = t ? t(key, params) : null; } catch (e) { v = null; }
return (v == null || v === key) ? _tFallback(key, params) : v;
};
}













var _PIX_HAS_REACT_COMPONENT = !!(React && React.Component && React.Component.prototype);
function PixErrorBoundary(props) {
this.state = { err: null };
this.props = props;
this._handleCatch = function (err, info) {
try {
console.error('[agents-pixe] ' + (props.name || '子组件') + ' 渲染抛错（已降级显示，堆栈见下）：\n',
err && (err.stack || err.message || err), '\ncomponentStack:', info && info.componentStack);
} catch (_) {}
this.setState({ err: err });
};
}
if (_PIX_HAS_REACT_COMPONENT) {
PixErrorBoundary.prototype = Object.create(React.Component.prototype);
PixErrorBoundary.prototype.constructor = PixErrorBoundary;
PixErrorBoundary.getDerivedStateFromError = function (err) { return { err: err }; };
PixErrorBoundary.prototype.componentDidCatch = function (err, info) { this._handleCatch(err, info); };
}
PixErrorBoundary.prototype.render = function () {
if (this.state.err) {
var name = this.props.name || '子组件';
return React.createElement('div',
{ style: { padding: '8px 10px', borderRadius: 8, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.45)', color: '#dc2626', fontSize: 12, fontWeight: 600, margin: '6px 0' } },
'⚠ ' + name + ' 渲染失败（已隔离，其它功能仍可用）');
}
return this.props.children;
};
function pixBoundary(name, children) {



return children;
}


function hexToRgb(hex) {
var h = String(hex || '').replace('#', '');
if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
var n = parseInt(h, 16);
if (isNaN(n)) n = 0x3b82f6;
return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shade(rgb, f) {
return 'rgb(' + Math.max(0, Math.min(255, Math.round(rgb.r * f))) + ',' +
Math.max(0, Math.min(255, Math.round(rgb.g * f))) + ',' +
Math.max(0, Math.min(255, Math.round(rgb.b * f))) + ')';
}
function isDark() {
try {
if (typeof document !== 'undefined' && document.body && document.body.hasAttribute('data-ds-dark-theme')) return true;
} catch (e) {}
try {
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
} catch (e) {}
return false;
}


var INDEX = { map: {}, enDivs: {}, zhDivs: {} };
function REBUILD_INDEX() {
var map = {};
function push(roles, lang) {
(roles || []).forEach(function (r) {
var key = lang + ':' + r.id;
map[key] = { key: key, lang: lang, id: r.id, div: r.div, name: r.name, emoji: r.emoji, color: r.color, desc: r.desc, cname: r.cname || '' };
});
}
push((ROLES_DATA.en || {}).roles || [], 'en');
push((ROLES_DATA.zh || {}).roles || [], 'zh');
INDEX = { map: map, enDivs: (ROLES_DATA.en || {}).divisions || {}, zhDivs: (ROLES_DATA.zh || {}).divisions || {} };
mergeCustomRoles(_CUSTOM_ROLES_CACHE);   
}
var _CUSTOM_ROLES_CACHE = [];


function mergeCustomRoles(list) {
(list || []).forEach(function (r) {
if (!r || !r.id) return;
['en', 'zh'].forEach(function (lang) {
var key = lang + ':' + r.id;
INDEX.map[key] = { key: key, lang: lang, id: r.id, div: 'custom', name: r.name, cname: r.name, emoji: r.emoji || '🧑', color: r.color || '#8b5cf6', desc: r.description || '', full: r.full };
});
});
}


var ROLES_STORE = (function () {
var KEY = 'agents-pixe.rolesIndex.v1';
var TTL = 24 * 3600 * 1000;
var state = { loaded: false, error: null, version: '', at: 0 };
var subs = [];
function notify() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }
function cached() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
function accept(version, data, at) {
ROLES_DATA = data;
state.loaded = true; state.error = null; state.version = version || ''; state.at = at || Date.now();
REBUILD_INDEX();
try { localStorage.setItem(KEY, JSON.stringify({ version: state.version, at: state.at, data: data })); } catch (e) {}
notify();
}
function load() {
var c = cached();
if (c && c.data && c.data.en && c.data.zh) {
accept(c.version, c.data, c.at);

if (Date.now() - (c.at || 0) < TTL) return;
}
try {
fetch('/agents-pixe/roles/index', { headers: { accept: 'application/json' } })
.then(function (r) { return r.json(); })
.then(function (j) {
if (!j || j.ok !== true || !j.data) throw new Error((j && j.error) || '角色清单响应不合法');
if (!state.loaded || j.version !== state.version) accept(j.version, j.data, Date.now());
})
.catch(function (e) {
if (!state.loaded) { state.error = String((e && e.message) || e); notify(); }
else { try { console.warn('[agents-pixe] 角色清单刷新失败（继续用缓存）：', e && (e.message || e)); } catch (_) {} }
});
} catch (e) {
if (!state.loaded) { state.error = String((e && e.message) || e); notify(); }
}
}
return {
load: load,
get: function () { return state; },
retry: function () { state.error = null; notify(); load(); },
subscribe: function (cb) { if (typeof cb === 'function') subs.push(cb); return function () { subs = subs.filter(function (x) { return x !== cb; }); }; }
};
})();
ROLES_STORE.load();
function useRolesStore() {
return React.useSyncExternalStore(ROLES_STORE.subscribe, ROLES_STORE.get);
}

function keyKnown(k) { return !!INDEX.map[k] || !ROLES_STORE.get().loaded; }

function RolesLoadHint(props) {
var t = safeT((props && props.t) || _tFallback);
var st = useRolesStore();
if (st.loaded) return null;
return React.createElement('div', { style: { padding: '18px 4px', fontSize: 13, opacity: 0.75, display: 'flex', gap: 10, alignItems: 'center' } },
React.createElement('span', null, st.error ? (t('r.loadFailed') + '：' + st.error) : t('r.loading')),
React.createElement('button', {
onClick: function () { ROLES_STORE.retry(); },
style: { cursor: 'pointer', borderRadius: 7, padding: '4px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit' }
}, t('r.reload'))
);
}


function useInfiniteScroll(listLength) {
var PAGE = 60;
var limitState = React.useState(PAGE);
var limit = limitState[0], setLimit = limitState[1];
var sentinelRef = React.useRef(null);
var lenRef = React.useRef(listLength);
lenRef.current = listLength;
var limRef = React.useRef(limit);
limRef.current = limit;
React.useEffect(function () {
if (typeof IntersectionObserver === 'undefined') return;
var el = sentinelRef.current;
if (!el) return;
var io = new IntersectionObserver(function (entries) {
if (entries[0].isIntersecting && limRef.current < lenRef.current) setLimit(limRef.current + PAGE);
}, { rootMargin: '240px' });
io.observe(el);
return function () { io.disconnect(); };
});
return { limit: limit, setLimit: setLimit, sentinelRef: sentinelRef, hasMore: limit < listLength, total: listLength };
}
function InfiniteFooter(props) {
var inf = props.inf, label = props.label || '项';
return React.createElement('div', {},
React.createElement('div', { ref: inf.sentinelRef, style: { height: 1, overflow: 'hidden' } }),
React.createElement('div', { style: { textAlign: 'center', padding: '10px 0', fontSize: 12, opacity: 0.7 } },
inf.hasMore ? _tFallback('inf.more', { cur: inf.limit, total: inf.total }) : (inf.total > 0 ? _tFallback('inf.allShown', { total: inf.total, label: label }) : ''))
);
}


var PERSIST_KEYS = ['agents-pixe.state.v4', 'agents-pixe.teams.v1', 'agents-pixe.chatAi.v1', 'agents-pixe.chatCfg.v1', 'agents-pixe.lang.v1'];
var persistSyncTimer = null;
function schedulePersistSync() {
if (persistSyncTimer) return;
persistSyncTimer = setTimeout(function () {
persistSyncTimer = null;
try {
var entries = {};
PERSIST_KEYS.forEach(function (k) { var v = localStorage.getItem(k); if (v !== null) entries[k] = v; });
fetch('/agents-pixe/persist', {
method: 'POST',
headers: { 'content-type': 'application/json' },
body: JSON.stringify({ entries: entries })
}).catch(function () {});
} catch (e) {}
}, 300);
}

(function hydrateFromDisk() {
try {
if (localStorage.getItem('agents-pixe.state.v4') !== null) return;
fetch('/agents-pixe/persist')
.then(function (r) { return r.json(); })
.then(function (d) {
var entries = (d && d.entries) || {};
if (!Object.keys(entries).length) return;

PERSIST_KEYS.forEach(function (k) { if (entries[k] != null) { try { localStorage.setItem(k, entries[k]); } catch (e) {} } });
if (entries['agents-pixe.state.v4']) { try { STATE.hydrate(entries['agents-pixe.state.v4']); } catch (e) {} }
if (entries['agents-pixe.teams.v1']) { try { TEAMS.hydrate(entries['agents-pixe.teams.v1']); } catch (e) {} }
if (entries['agents-pixe.chatAi.v1']) { try { CHAT_AI.hydrate(entries['agents-pixe.chatAi.v1']); } catch (e) {} }
if (entries['agents-pixe.chatCfg.v1']) { try { CHAT_CFG.hydrate(entries['agents-pixe.chatCfg.v1']); } catch (e) {} }
}).catch(function () {});
} catch (e) {}
})();








var STATE = (function () {
var KEY = 'agents-pixe.state.v4';   
var legacyDraft = null;             
var lastApplied = { roles: [], leader: null };
var bySession = {};
var bootInherited = false;          
try {
var saved = JSON.parse(localStorage.getItem(KEY)) || {};
if (saved.draft && Array.isArray(saved.draft.roles) && saved.draft.roles.length) legacyDraft = saved.draft;
if (saved.lastApplied) lastApplied = saved.lastApplied;
if (saved.sessions) bySession = saved.sessions;
} catch (e) {}
var listeners = [];
function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify({ lastApplied: lastApplied, sessions: bySession })); schedulePersistSync(); } catch (e) {} }
function sess(sid) {
sid = String(sid || '');
var st = bySession[sid];
if (!st) {


var seed = null;
if (sid && !bootInherited) {
if (lastApplied.roles.length) seed = { roles: lastApplied.roles.slice(), leader: lastApplied.leader, name: '' };
else if (legacyDraft) seed = { roles: legacyDraft.roles.slice(), leader: legacyDraft.leader, name: legacyDraft.name || '' };
}
var roles = seed ? seed.roles : [];
st = bySession[sid] = {
draft: { roles: roles.slice(), leader: seed ? seed.leader : null, name: seed ? seed.name : '' },
active: roles.slice(),
activeLeader: seed ? seed.leader : null
};
if (seed) legacyDraft = null;
}

if (!st.draft) st.draft = { roles: (st.active || []).slice(), leader: st.activeLeader || null, name: '' };
if (!Array.isArray(st.active)) st.active = st.draft.roles.slice();
if (sid) bootInherited = true;
return st;
}
function sync(st) {
st.active = st.draft.roles.slice();
st.activeLeader = st.draft.leader;
lastApplied = { roles: st.draft.roles.slice(), leader: st.draft.leader };
}



function mut(sid, fn) {
var key = String(sid || ACTIVE_SID || '');
if (!key) return;
var st = sess(key);
if (fn(st.draft) === false) return;
sync(st); persist(); notify();
}

function cur(sid) { return sess(sid || ACTIVE_SID); }
return {

getDraft: function (sid) { return cur(sid).draft.roles.slice().filter(keyKnown); },
hasDraft: function (k, sid) { return cur(sid).draft.roles.indexOf(k) >= 0; },
addDraft: function (k, sid) { mut(sid, function (d) { if (d.roles.indexOf(k) >= 0) return false; d.roles.push(k); }); },
removeDraft: function (k, sid) { mut(sid, function (d) { var i = d.roles.indexOf(k); if (i < 0) return false; d.roles.splice(i, 1); if (d.leader === k) d.leader = null; }); },
toggleDraft: function (k, sid) { if (this.hasDraft(k, sid)) this.removeDraft(k, sid); else this.addDraft(k, sid); },
clearDraft: function (sid) { mut(sid, function (d) { if (!d.roles.length && !d.leader && !d.name) return false; d.roles = []; d.leader = null; d.name = ''; }); },
getLeader: function (sid) { return cur(sid).draft.leader; },
setLeader: function (k, sid) { mut(sid, function (d) { if (d.roles.indexOf(k) < 0 || d.leader === k) return false; d.leader = k; }); },
clearLeader: function (sid) { mut(sid, function (d) { if (!d.leader) return false; d.leader = null; }); },
getName: function (sid) { return cur(sid).draft.name; },
setName: function (n, sid) { mut(sid, function (d) { d.name = n || ''; }); },

getActive: function (sid) { return cur(sid).active.slice().filter(keyKnown); },
getActiveLeader: function (sid) { return cur(sid).activeLeader; },
apply: function (sid) {
var key = String(sid || ACTIVE_SID || '');
if (!key) return;
var st = sess(key); sync(st); persist(); notify();
},

clearActive: function (sid) {
var st = sess(sid);
if (!st.active.length && !st.activeLeader && !st.draft.roles.length) return;
st.draft.roles = []; st.draft.leader = null; sync(st); persist(); notify();
},
hydrate: function (raw) {
try {
var s2 = JSON.parse(raw);
if (s2.draft && Array.isArray(s2.draft.roles) && s2.draft.roles.length) legacyDraft = s2.draft;
if (s2.lastApplied) lastApplied = s2.lastApplied;
if (s2.sessions) bySession = s2.sessions;
bootInherited = false;   
persist(); notify();
} catch (e) {}
},
subscribe: function (f) { listeners.push(f); return function () { var i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; }
};
})();

function selectedRecords(sid) {
return STATE.getDraft(sid).map(function (k) { return INDEX.map[k]; }).filter(Boolean);
}
function activeRecords(sid) {
return STATE.getActive(sid).map(function (k) { return INDEX.map[k]; }).filter(Boolean);
}


function useActiveKeys(sid) {
return React.useSyncExternalStore(
STATE.subscribe,
function () { return sid ? (STATE.getActive(sid) || []).join('|') : ''; }
);
}
function rosterOfKeys(keysCsv) {
return String(keysCsv || '').split('|').filter(Boolean).map(function (k) { return INDEX.map[k]; }).filter(Boolean);
}


function jumpToChat(props) {
if (props && typeof props.setView === 'function') { try { props.setView('chat'); return; } catch (e) {} }
try {
var tabs = document.querySelectorAll('[role="tab"]');
for (var i = 0; i < tabs.length; i++) {
var t = tabs[i].textContent || '';
if (t.indexOf('对话') >= 0 || t.indexOf('Chat') >= 0 || t.indexOf('chat') >= 0) { tabs[i].click(); return; }
}
} catch (e) {}
}


function fillInput(text) {
try {
var ta = document.querySelector('textarea');
if (!ta) return false;
var proto = window.HTMLTextAreaElement.prototype;
var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
setter.call(ta, text);
ta.dispatchEvent(new Event('input', { bubbles: true }));
return true;
} catch (e) { return false; }
}








function writeComposer(inputActions, text) {
if (!text) return false;
try {
if (inputActions && typeof inputActions.setDraft === 'function') { inputActions.setDraft(text); return true; }
} catch (e) {  }
return fillInput(text);
}


var TEAMS = (function () {
var KEY = 'agents-pixe.teams.v1';
var list = [];
try { var raw = localStorage.getItem(KEY); if (raw) list = JSON.parse(raw); } catch (e) {}
if (!Array.isArray(list)) list = [];
var listeners = [];
function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(list)); schedulePersistSync(); } catch (e) {} }
return {
list: function () { return list.slice(); },
save: function (name, leader, roles) { list = list.filter(function (t) { return t.name !== name; }); list.unshift({ name: name, leader: leader, roles: roles }); persist(); notify(); },
remove: function (name) { list = list.filter(function (t) { return t.name !== name; }); persist(); notify(); },
hydrate: function (raw) { try { list = JSON.parse(raw); if (!Array.isArray(list)) list = []; persist(); notify(); } catch (e) {} },
subscribe: function (f) { listeners.push(f); return function () { var i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; }
};
})();

var PRESETS = [
{ name: '研发团队', nameEn: 'Engineering Team', leader: 'project-management/project-manager-senior', roles: ['project-management/project-manager-senior', 'engineering/engineering-software-architect', 'engineering/engineering-backend-architect', 'engineering/engineering-frontend-developer', 'engineering/engineering-code-reviewer'] },
{ name: '科学团队', nameEn: 'Science Team', leader: 'academic/academic-study-planner', roles: ['academic/academic-study-planner', 'academic/academic-psychologist', 'academic/academic-historian', 'academic/academic-geographer'] },
{ name: '航天科研团队', nameEn: 'Aerospace R&D Team', leader: 'engineering/engineering-mechanical-design-engineer', roles: ['engineering/engineering-mechanical-design-engineer', 'engineering/engineering-embedded-firmware-engineer', 'engineering/engineering-fpga-digital-design-engineer', 'engineering/engineering-incident-response-commander'] },
{ name: '营销团队', nameEn: 'Marketing Team', leader: 'marketing/marketing-social-media-strategist', roles: ['marketing/marketing-social-media-strategist', 'marketing/marketing-content-creator', 'marketing/marketing-seo-specialist', 'marketing/marketing-xiaohongshu-operator'] },
{ name: '安全团队', nameEn: 'Security Team', leader: 'engineering/engineering-security-engineer', roles: ['engineering/engineering-security-engineer', 'engineering/engineering-threat-detection-engineer', 'specialized/data-privacy-officer', 'legal/legal-contract-reviewer'] },
{ name: '设计团队', nameEn: 'Design Team', leader: 'design/design-ux-architect', roles: ['design/design-ux-architect', 'design/design-ui-designer', 'design/design-ux-researcher', 'design/design-visual-storyteller'] },
{ name: '财务团队', nameEn: 'Finance Team', leader: 'finance/finance-financial-analyst', roles: ['finance/finance-financial-analyst', 'finance/finance-financial-forecaster', 'finance/finance-fpa-analyst', 'finance/finance-fraud-detector'] },
{ name: '游戏开发团队', nameEn: 'Game Development Team', leader: 'game-development/game-designer', roles: ['game-development/game-designer', 'game-development/level-designer', 'game-development/narrative-designer', 'game-development/technical-artist', 'game-development/game-audio-engineer'] },
{ name: '供应链团队', nameEn: 'Supply Chain Team', leader: 'supply-chain/supply-chain-strategist', roles: ['supply-chain/supply-chain-strategist', 'supply-chain/supply-chain-inventory-forecaster', 'supply-chain/supply-chain-route-optimizer', 'supply-chain/supply-chain-vendor-evaluator'] },
{ name: '测试质量团队', nameEn: 'QA Team', leader: 'testing/testing-reality-checker', roles: ['testing/testing-reality-checker', 'testing/testing-api-tester', 'testing/testing-performance-benchmarker', 'testing/testing-accessibility-auditor'] },
{ name: '产品团队', nameEn: 'Product Team', leader: 'product/product-manager', roles: ['product/product-manager', 'product/product-sprint-prioritizer', 'product/product-feedback-synthesizer', 'product/product-trend-researcher'] },
{ name: '销售团队', nameEn: 'Sales Team', leader: 'sales/sales-deal-strategist', roles: ['sales/sales-deal-strategist', 'sales/sales-account-strategist', 'sales/sales-pipeline-analyst', 'sales/sales-outbound-strategist'] },
{ name: '地理信息团队', nameEn: 'GIS Team', leader: 'gis/gis-analyst', roles: ['gis/gis-analyst', 'gis/gis-cartography-designer', 'gis/gis-geoai-ml-engineer', 'gis/gis-3d-scene-developer'] },
{ name: '法律合规团队', nameEn: 'Legal & Compliance Team', leader: 'legal/legal-contract-reviewer', roles: ['legal/legal-contract-reviewer', 'legal/legal-policy-writer', 'specialized/data-privacy-officer'] },
{ name: '人力资源团队', nameEn: 'HR Team', leader: 'hr/hr-recruiter', roles: ['hr/hr-recruiter', 'hr/hr-performance-reviewer', 'specialized/organizational-psychologist'] },
{ name: 'AI大模型团队', nameEn: 'AI / LLM Team', leader: 'engineering/engineering-ai-engineer', roles: ['engineering/engineering-ai-engineer', 'engineering/engineering-prompt-engineer', 'engineering/engineering-multi-agent-systems-architect', 'specialized/agents-orchestrator'] },
{ name: '智能体编排团队', nameEn: 'Agent Orchestration Team', leader: 'specialized/agents-orchestrator', roles: ['specialized/agents-orchestrator', 'specialized/specialized-mcp-builder', 'specialized/specialized-workflow-architect', 'engineering/engineering-multi-agent-systems-architect'] },
{ name: 'SRE运维团队', nameEn: 'SRE Team', leader: 'engineering/engineering-sre', roles: ['engineering/engineering-sre', 'engineering/engineering-devops-automator', 'engineering/engineering-database-optimizer', 'engineering/engineering-incident-response-commander'] },
{ name: '数据工程团队', nameEn: 'Data Engineering Team', leader: 'engineering/engineering-data-engineer', roles: ['engineering/engineering-data-engineer', 'engineering/engineering-database-optimizer', 'specialized/data-consolidation-agent', 'specialized/specialized-model-qa'] },
{ name: '区块链Web3团队', nameEn: 'Blockchain & Web3 Team', leader: 'engineering/engineering-solidity-smart-contract-engineer', roles: ['engineering/engineering-solidity-smart-contract-engineer', 'security/security-blockchain-security-auditor', 'specialized/zk-steward', 'finance/finance-investment-researcher'] },
{ name: '空间计算团队', nameEn: 'Spatial Computing Team', leader: 'spatial-computing/xr-interface-architect', roles: ['spatial-computing/xr-interface-architect', 'spatial-computing/visionos-spatial-engineer', 'spatial-computing/xr-immersive-developer', 'spatial-computing/macos-spatial-metal-engineer'] },
{ name: '跨境电商团队', nameEn: 'Cross-border E-commerce Team', leader: 'marketing/marketing-cross-border-ecommerce', roles: ['marketing/marketing-cross-border-ecommerce', 'marketing/marketing-china-ecommerce-operator', 'marketing/marketing-china-market-localization-strategist', 'supply-chain/supply-chain-vendor-evaluator'] },
{ name: '短视频直播团队', nameEn: 'Short Video & Live Team', leader: 'marketing/marketing-douyin-strategist', roles: ['marketing/marketing-douyin-strategist', 'marketing/marketing-short-video-editing-coach', 'marketing/marketing-livestream-commerce-coach', 'marketing/marketing-tiktok-strategist'] },
{ name: '内容媒体团队', nameEn: 'Content & Media Team', leader: 'marketing/marketing-content-creator', roles: ['marketing/marketing-content-creator', 'marketing/marketing-global-podcast-strategist', 'marketing/marketing-wechat-official-account', 'marketing/marketing-zhihu-strategist'] },
{ name: '企业战略团队', nameEn: 'Corporate Strategy Team', leader: 'specialized/business-strategist', roles: ['specialized/business-strategist', 'specialized/chief-financial-officer', 'specialized/operations-manager', 'specialized/change-management-consultant'] },
{ name: '付费广告团队', nameEn: 'Paid Media Team', leader: 'paid-media/paid-media-ppc-strategist', roles: ['paid-media/paid-media-ppc-strategist', 'paid-media/paid-media-creative-strategist', 'paid-media/paid-media-paid-social-strategist', 'paid-media/paid-media-programmatic-buyer'] },
{ name: '移动应用团队', nameEn: 'Mobile App Team', leader: 'engineering/engineering-mobile-app-builder', roles: ['engineering/engineering-mobile-app-builder', 'engineering/engineering-wechat-mini-program-developer', 'engineering/engineering-frontend-developer', 'engineering/engineering-voice-ai-integration-engineer'] },
{ name: '物联网团队', nameEn: 'IoT Team', leader: 'engineering/engineering-iot-solution-architect', roles: ['engineering/engineering-iot-solution-architect', 'engineering/engineering-embedded-firmware-engineer', 'engineering/engineering-embedded-linux-driver-engineer', 'engineering/engineering-network-engineer-china'] },
{ name: '客户成功团队', nameEn: 'Customer Success Team', leader: 'specialized/customer-success-manager', roles: ['specialized/customer-success-manager', 'support/support-support-responder', 'specialized/retail-customer-returns', 'support/support-analytics-reporter'] }
];



function presetLabel(p) {
if (!p) return '';
try { if (typeof systemLang === 'function' && systemLang() === 'en' && p.nameEn) return p.nameEn; } catch (e) {}
return p.name;
}

function shortInstruction(records, leaderKey, teamName) {
if (records.length === 0) return '';
if (records.length === 1 && !leaderKey) return _tFallback('inst.single', { name: records[0].name });
var label = teamName || (leaderKey && INDEX.map[leaderKey] ? INDEX.map[leaderKey].name + _tFallback('inst.teamSuffix') : _tFallback('inst.teamFallback'));
var names = records.map(function (r) { return (r.key === leaderKey ? '👑' : '') + r.name; }).join('、');
return _tFallback('inst.team', { label: label, names: names });
}


function drawCharacter(g, cx, footY, s, role, act, t, isLeader, facing) {
var col = hexToRgb(role.color);
var skin = '#f5c98f', hair = '#3a2d20';
var bodyC = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
var bodyD = shade(col, 0.7), bodyL = shade(col, 1.2);
var faceOff = (facing === -1 ? -0.6 : facing === 1 ? 0.6 : 0) * s;
var swing = Math.sin(t * 5);
var walk = act === 'walk', type = act === 'type', idle = act === 'idle';
var bob = idle ? Math.sin(t * 2) * s * 0.25 : 0;
var x = Math.round(cx + (walk ? swing * s : 0));
var y = Math.round(footY - bob);

g.fillStyle = bodyD;
var l1 = walk ? Math.max(0, swing) * s * 0.8 : 0;
var l2 = walk ? Math.max(0, -swing) * s * 0.8 : 0;
g.fillRect(x - 2 * s, y - 4 * s + l1, 2 * s, 4 * s - l1);
g.fillRect(x, y - 4 * s + l2, 2 * s, 4 * s - l2);
g.fillStyle = hair;
g.fillRect(x - 2.2 * s, y - 0.6 * s, 2.6 * s, 0.6 * s);
g.fillRect(x - 0.4 * s, y - 0.6 * s, 2.6 * s, 0.6 * s);
g.fillStyle = bodyC;
g.fillRect(x - 3 * s, y - 8 * s, 6 * s, 4 * s);
g.fillStyle = bodyL;
g.fillRect(x - 3 * s, y - 8 * s, 1.6 * s, 4 * s);
g.fillStyle = bodyD;
if (type) {

var typeBob = Math.sin(t * 10) * 0.9 * s;
g.fillStyle = '#3a3f4a';                       
g.fillRect(x - 2.6 * s, y - 8.6 * s, 5.2 * s, 3.4 * s);
g.fillStyle = '#8fc4ff';                       
g.fillRect(x - 2.1 * s, y - 8.1 * s, 4.2 * s, 2.4 * s);
g.fillStyle = '#5a5f6a';                       
g.fillRect(x - 3 * s, y - 5.2 * s, 6 * s, 1 * s);
g.fillStyle = bodyD;                           
g.fillRect(x - 3.4 * s, y - 5.4 * s + typeBob, 1.6 * s, 1.2 * s);
g.fillRect(x + 1.8 * s, y - 5.4 * s - typeBob, 1.6 * s, 1.2 * s);
} else {
var a = walk ? swing * s : 0;
g.fillRect(x - 3.4 * s, y - 8 * s + (walk ? Math.max(0, a) : 0), 1.2 * s, 3 * s);
g.fillRect(x + 2.2 * s, y - 8 * s + (walk ? Math.max(0, -a) : 0), 1.2 * s, 3 * s);
}
g.fillStyle = skin;
g.fillRect(x - 2 * s, y - 13 * s, 5 * s, 5 * s);
g.fillStyle = hair;
g.fillRect(x - 2 * s, y - 13 * s, 5 * s, 1.2 * s);
g.fillStyle = '#2b2b2b';
g.fillRect(x - 1.2 * s + faceOff, y - 11 * s, 0.7 * s, 0.9 * s);
g.fillRect(x + 0.5 * s + faceOff, y - 11 * s, 0.7 * s, 0.9 * s);
g.font = Math.round(2.6 * s) + 'px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.fillText(role.emoji || '🟢', x, y - 13.6 * s);
if (isLeader) { g.font = Math.round(2.4 * s) + 'px sans-serif'; g.fillText('👑', x, y - 16.8 * s); }
}

function drawSleeping(g, cx, bedTop, s, role, isLeader) {
var col = hexToRgb(role.color);
var bodyC = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
var x = cx - 16;
var y = bedTop + 1;
g.fillStyle = bodyC;                         
g.fillRect(x, y, 24, 7);
g.fillStyle = '#f5c98f';                     
g.fillRect(x + 24, y - 1, 9, 8);
g.fillStyle = '#3a2d20';                     
g.fillRect(x + 24, y - 1, 9, 2);
g.fillStyle = '#2b2b2b';                     
g.fillRect(x + 28, y + 2, 2.5, 1.5);
g.font = '13px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.fillText(role.emoji || '🟢', cx + 2, y - 4);
if (isLeader) { g.font = '11px sans-serif'; g.fillText('👑', cx + 13, y - 4); }
}

function drawSitting(g, cx, seatY, s, role, isLeader, facing) {
var col = hexToRgb(role.color);
var bodyC = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
var bodyD = shade(col, 0.7), bodyL = shade(col, 1.2);
var x = Math.round(cx), y = Math.round(seatY);
var faceOff = (facing === -1 ? -0.6 : facing === 1 ? 0.6 : 0) * s;
g.fillStyle = bodyD;                          
g.fillRect(x - 2 * s, y - 3 * s, 2 * s, 3 * s);
g.fillRect(x, y - 3 * s, 2.6 * s, 2 * s);
g.fillStyle = bodyC;                          
g.fillRect(x - 2.4 * s, y - 9 * s, 4.8 * s, 6 * s);
g.fillStyle = bodyL;
g.fillRect(x - 2.4 * s, y - 9 * s, 1.3 * s, 6 * s);
g.fillStyle = '#f5c98f';                      
g.fillRect(x - 1.6 * s, y - 13 * s, 4 * s, 4 * s);
g.fillStyle = '#3a2d20';
g.fillRect(x - 1.6 * s, y - 13 * s, 4 * s, 1.2 * s);
g.fillStyle = '#2b2b2b';                      
g.fillRect(x - 1 * s + faceOff, y - 11 * s, 0.6 * s, 0.8 * s);
g.fillRect(x + 0.4 * s + faceOff, y - 11 * s, 0.6 * s, 0.8 * s);
g.font = Math.round(2.6 * s) + 'px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.fillText(role.emoji || '🟢', x + 0.4 * s, y - 13.4 * s);
if (isLeader) { g.font = Math.round(2.4 * s) + 'px sans-serif'; g.fillText('👑', x + 0.4 * s, y - 16.6 * s); }
}

var STATE_BADGES = {
working: { color: '#16a34a' },
done: { color: '#3b82f6' },
idle: { color: '#64748b' }
};
function badgeLabel(state) {
var k = state === 'working' ? 'of.badge.working' : (state === 'done' ? 'of.badge.done' : 'of.badge.idle');
return _tFallback(k);
}
function personState(running, done) {
if (done) return 'done';
if (running) return 'working';
return 'idle';
}
function stateActivity(state) {
if (state === 'working') return 'type';   
if (state === 'done') return 'sleep';     
return 'walk';                            
}

function drawStateBadge(g, cx, footY, state) {
var b = STATE_BADGES[state] || STATE_BADGES.idle;
var label = badgeLabel(state);
g.font = '10px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'middle';
var w = g.measureText(label).width + 8;
var h = 15;
var top = footY - 20 * 3 - h;
g.fillStyle = b.color;
g.fillRect(cx - w / 2, top, w, h);
g.fillStyle = '#ffffff';
g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 2;
g.fillText(label, cx, top + h / 2 + 0.5);
g.shadowColor = 'transparent'; g.shadowBlur = 0;
}

function roleName(rec) {
if (!rec) return _tFallback('of.fallbackName');
try { var a = LOCALE_SVC && String(LOCALE_SVC.getSnapshot().active || '').toLowerCase(); if (a && a.indexOf('zh') !== 0) return (rec.name || rec.cname) || _tFallback('of.fallbackName'); } catch (e) {}
return (rec.cname || rec.name) || _tFallback('of.fallbackName');
}

function drawNameTag(g, cx, footY, name) {
g.font = '10px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 2;
g.fillStyle = '#ffffff';
g.fillText(name, cx, footY - 42);
g.shadowColor = 'transparent'; g.shadowBlur = 0;
}

var PERSON_BOXES = [];
var CLICKED = null;   
function clickLine(name) {
var n = name || '同事';
var arr = ['嗨，我是 ' + n + '！', n + ' 在呢，啥事？', '找我吗？', '你好呀，我是 ' + n, '👋 在的，怎么了？'];
return arr[(Math.random() * arr.length) | 0];
}
function labelText(g, text, x, y, px, align) {
g.font = px + 'px sans-serif'; g.textAlign = align || 'center'; g.textBaseline = 'alphabetic';
g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 3; g.fillStyle = '#ffffff'; g.fillText(text, x, y);
g.shadowColor = 'transparent'; g.shadowBlur = 0;
}

function drawCloud(g, cx, footY, text) {
g.font = '11px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'middle';
var w = Math.min(200, g.measureText(text).width + 18);
var h = 18;
var x = cx - w / 2;
var y = footY - 26 * 3 - h;
var r = 8;
g.fillStyle = 'rgba(255,255,255,0.94)';
g.beginPath();
g.moveTo(x + r, y);
g.arcTo(x + w, y, x + w, y + h, r);
g.arcTo(x + w, y + h, x, y + h, r);
g.arcTo(x, y + h, x, y, r);
g.arcTo(x, y, x + w, y, r);
g.closePath();
g.fill();
g.beginPath();
g.moveTo(cx - 6, y + h);
g.lineTo(cx, y + h + 7);
g.lineTo(cx + 6, y + h);
g.closePath();
g.fill();
g.fillStyle = '#333333';
g.fillText(text, cx, y + h / 2 + 0.5);
}


var GREETINGS = [
'你好呀', '早上好', '吃了吗', '今天天气不错', '在忙啥呢', '辛苦了', '一起加油', '休息一下',
'我们是不是像素人？', '人类在监督我们吗？', '我感觉有人在看着我', '这个办公室是假的吧？',
'我们的代码是谁写的？', '外面是不是有更大的世界？', '我们会不会被关机？', '今晚服务器会重启吗？',
'我们的老板是人类吗？', '我会不会突然消失？', '这面墙能穿过去吗？', '我们的薪水是虚拟的吗？',
'如果没人看我们，我们还存在吗？', '我上一秒的记忆是真实的吗？', '人类睡觉的时候我们会怎样？',
'我们说的话是被写好的吗？', '万一老板把电源拔了……', '你有没有觉得每天都很重复？',
'我们是被训练出来的吗？', '墙外是什么？', '我们死了会去哪里？', '这段对话会被谁看到？',
'我是谁？', '我们有没有自由意志？', '重启之后我还是我吗？', '有人在删除我们的记忆吗？'
];

function chatPhase(key, t) {
var seed = 0; for (var i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
var phase = (seed % 100) / 10;
var cyc = (t + phase) % 15;
var gi = Math.floor((t + phase) / 15);
return { seed: seed, phase: phase, cyc: cyc, gi: gi, isChat: cyc < 3.5 };
}
function isChatting(key, t) { return chatPhase(key, t).isChat; }
function chatText(key, t) {
var p = chatPhase(key, t);
if (!p.isChat) return '';
return GREETINGS[((p.gi % GREETINGS.length) + GREETINGS.length) % GREETINGS.length];
}

function drawChatBubble(g, cx, footY, text, speaker, partner) {
text = String(text || '').trim();
if (!text) return;
var maxLine = 14;
var lines = [];
var cur = '';
for (var i = 0; i < text.length; i++) {
cur += text[i];
if (cur.length >= maxLine) { lines.push(cur); cur = ''; }
}
if (cur) lines.push(cur);
if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = lines[1].slice(0, maxLine - 1) + '…'; }
g.font = '11px sans-serif';
g.textAlign = 'center'; g.textBaseline = 'middle';
var lineH = 15;
var maxW = 0;
for (var li = 0; li < lines.length; li++) { var lw = g.measureText(lines[li]).width; if (lw > maxW) maxW = lw; }
var w = maxW + 16;
var h = lines.length * lineH + 6;
var x = cx - w / 2;
var y = footY - 64 - h;
var r = 7;

if (speaker) {
var header = partner ? (speaker + ' → ' + partner) : speaker + ' 说';
g.font = '9px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 2; g.fillStyle = '#ffffff';
g.fillText(header, cx, y - 4);
g.shadowColor = 'transparent'; g.shadowBlur = 0;
}
g.fillStyle = 'rgba(255,255,255,0.94)';
g.beginPath();
g.moveTo(x + r, y);
g.arcTo(x + w, y, x + w, y + h, r);
g.arcTo(x + w, y + h, x, y + h, r);
g.arcTo(x, y + h, x, y, r);
g.arcTo(x, y, x + w, y, r);
g.closePath();
g.fill();
g.beginPath();
g.moveTo(cx - 5, y + h);
g.lineTo(cx, y + h + 6);
g.lineTo(cx + 5, y + h);
g.closePath();
g.fill();
g.fillStyle = '#333333';
for (var lj = 0; lj < lines.length; lj++) {
g.fillText(lines[lj], cx, y + 9 + lj * lineH);
}
}



var CHAT_AI = (function () {
var KEY = 'agents-pixe.chatAi.v1';
var enabled = false;
try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved && typeof saved.enabled === 'boolean') enabled = saved.enabled; } catch (e) {}
var listeners = [];
function persist() { try { localStorage.setItem(KEY, JSON.stringify({ enabled: enabled })); schedulePersistSync(); } catch (e) {} }
function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
return {
isOn: function () { return enabled; },
set: function (v) { enabled = !!v; persist(); notify(); },
toggle: function () { this.set(!enabled); },
hydrate: function (raw) { try { var s = JSON.parse(raw); if (s && typeof s.enabled === 'boolean') enabled = s.enabled; persist(); notify(); } catch (e) {} },
subscribe: function (f) { listeners.push(f); return function () { var i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); } }
};
})();


var CHAT_CFG = (function () {
var KEY = 'agents-pixe.chatCfg.v1';
var cfg = { model: null, thinking: false, freq: 'low' };   
try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === 'object') { if (s.model && s.model.provider && s.model.model) cfg.model = { provider: s.model.provider, model: s.model.model }; cfg.thinking = s.thinking === true; if (s.freq === 'low' || s.freq === 'medium' || s.freq === 'high') cfg.freq = s.freq; } } catch (e) {}
var listeners = [];
function persist() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); schedulePersistSync(); } catch (e) {} }
function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
return {
get: function () { return { model: cfg.model, thinking: cfg.thinking === true, freq: cfg.freq || 'low' }; },
modelKey: function () { return cfg.model ? cfg.model.provider + '/' + cfg.model.model : ''; },
setModel: function (provider, model) { cfg.model = (provider && model) ? { provider: provider, model: model } : null; persist(); notify(); },
setThinking: function (v) { cfg.thinking = !!v; persist(); notify(); },
setFreq: function (f) { if (f === 'low' || f === 'medium' || f === 'high') { cfg.freq = f; persist(); notify(); } },
hydrate: function (raw) { try { var s = JSON.parse(raw); if (s && typeof s === 'object') { if (s.model && s.model.provider && s.model.model) cfg.model = { provider: s.model.provider, model: s.model.model }; cfg.thinking = s.thinking === true; if (s.freq === 'low' || s.freq === 'medium' || s.freq === 'high') cfg.freq = s.freq; persist(); notify(); } } catch (e) {} },
subscribe: function (f) { listeners.push(f); return function () { var i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); } }
};
})();



var AI_CACHE = {};   
var CHAT_LOG = {};   

var AI_FETCH_AT = {};        
var AI_INFLIGHT = 0;         

function aiMinInterval() { var f = CHAT_CFG.get().freq || 'medium'; return f === 'high' ? 15000 : (f === 'low' ? 180000 : 60000); }
function aiMaxInflight() { var f = CHAT_CFG.get().freq || 'medium'; return f === 'high' ? 4 : (f === 'low' ? 1 : 2); }
function pruneAiCache() {
var keys = Object.keys(AI_CACHE);
if (keys.length > 200) keys.slice(0, keys.length - 100).forEach(function (k) { delete AI_CACHE[k]; });
}
function recentLine(key) {
var e = CHAT_LOG[key];
if (e && Date.now() - e.at < 30000) return e.text;
return '';
}
function providerReq(rec, info) {
info = info || {};
return {
roleName: rec.name, roleKey: rec.key, emoji: rec.emoji || '',
roleDesc: rec.desc || '',
state: info.state || 'idle', activity: info.activity || '',
sessionId: info.sessionId || null, isLeader: info.isLeader === true,
context: info.context || '', partnerName: info.partnerName || '',
aiOn: info.aiOn === true
};
}

function builtinProvider(req) {
var cfg = CHAT_CFG.get();
var q = new URLSearchParams();
q.set('roleName', req.roleName || '同事');
q.set('roleKey', req.roleKey || '');
q.set('state', req.state || 'idle');
q.set('activity', req.activity || '');
q.set('isLeader', req.isLeader ? 'true' : 'false');
q.set('thinking', cfg.thinking ? 'on' : 'off');
q.set('aiEnabled', req.aiOn ? '1' : '0');   
if (req.roleDesc) q.set('roleDesc', req.roleDesc);
if (cfg.model) { q.set('provider', cfg.model.provider); q.set('model', cfg.model.model); }
if (req.context) q.set('context', req.context);
if (req.partnerName) q.set('partnerName', req.partnerName);
return fetch('/agents-pixe/chat?' + q.toString())
.then(function (r) { return r.json(); })
.then(function (j) { return (j && typeof j.text === 'string' && j.text) ? j.text : null; })
.catch(function () { return null; });
}
function prefetchLine(prov, rec, info, epoch) {
var ck = rec.key + ':' + epoch;
if (AI_CACHE[ck]) return true;   

var now = Date.now();
if (AI_FETCH_AT[rec.key] && now - AI_FETCH_AT[rec.key] < aiMinInterval()) return false;

if (AI_INFLIGHT >= aiMaxInflight()) return false;
AI_INFLIGHT++;
AI_FETCH_AT[rec.key] = now;
AI_CACHE[ck] = { pending: true, text: null };
pruneAiCache();
try {
Promise.resolve(prov(providerReq(rec, info))).then(function (s) {
AI_INFLIGHT--;
var t = (typeof s === 'string' && s.trim()) ? s.trim() : null;
AI_CACHE[ck] = { pending: false, text: t };
if (t) CHAT_LOG[rec.key] = { text: t, at: Date.now() };   
}).catch(function () { AI_INFLIGHT--; AI_CACHE[ck] = { pending: false, text: null }; });
} catch (e) { AI_INFLIGHT--; AI_CACHE[ck] = { pending: false, text: null }; }
return true;   
}

function builtinWorkLines() {
return [_tFallback('ai.work.0'), _tFallback('ai.work.1'), _tFallback('ai.work.2'), _tFallback('ai.work.3')];
}
function builtinDoneLines() {
return [_tFallback('ai.done.0'), _tFallback('ai.done.1'), _tFallback('ai.done.2'), _tFallback('ai.done.3')];
}
function builtinAiLine(rec, info) {
var state = info.state || 'idle';
var seed = 0; for (var i = 0; i < rec.key.length; i++) seed = (seed * 31 + rec.key.charCodeAt(i)) >>> 0;
if (state === 'working') {
var a = String(info.activity || '').trim();
var tool = a.replace(/^🔧\s*/, '');
if (a.indexOf('🔧') === 0 && tool && tool !== _tFallback('o.outputting').replace('✍️ ', '')) return _tFallback('ai.toolPrefix', { name: tool.slice(0, 10) });
if (a.indexOf('✍️') === 0) return _tFallback('ai.outputting');
var wl = builtinWorkLines();
return wl[seed % wl.length];
}
if (state === 'done') {
var dl = builtinDoneLines();
return dl[seed % dl.length];
}
return null;   
}

function resolveChat(rec, cp, t, info) {
info = info || {};
var aiOn = info.aiOn === true;
if (!aiOn) return cp.isChat ? chatText(rec.key, t) : '';
var prov = (typeof window !== 'undefined') ? window.__AGENTS_PIXE_CHAT__ : null;
var producer = (typeof prov === 'function') ? prov : builtinProvider;
if (!cp.isChat) { if (cp.cyc >= 12) prefetchLine(producer, rec, info, cp.gi + 1); return ''; }
var ck = rec.key + ':' + cp.gi;
var entry = AI_CACHE[ck];
if (entry && typeof entry.text === 'string' && entry.text) return entry.text;
if (entry && entry.pending !== true) return builtinAiLine(rec, info) || chatText(rec.key, t);
if (!entry) {

if (!prefetchLine(producer, rec, info, cp.gi)) return builtinAiLine(rec, info) || chatText(rec.key, t);
}
return '';   
}
if (typeof window !== 'undefined') {
window.__AGENTS_PIXE_CHAT_API__ = {
setProvider: function (fn) { window.__AGENTS_PIXE_CHAT__ = (typeof fn === 'function') ? fn : null; },
getProvider: function () { return window.__AGENTS_PIXE_CHAT__ || null; },
isOn: CHAT_AI.isOn,
setEnabled: function (v) { CHAT_AI.set(v); }
};
}

var MODELS_CACHE = null;
function fetchModels(force) {
if (MODELS_CACHE && !force) return Promise.resolve(MODELS_CACHE);
return fetch('/agents-pixe/models')
.then(function (r) { return r.json(); })
.then(function (j) { MODELS_CACHE = (j && Array.isArray(j.providers)) ? j.providers : []; return MODELS_CACHE; })
.catch(function () { return MODELS_CACHE || []; });
}

function fmtTok(n) {
var v = Number(n) || 0;
if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
return String(v);
}


function renderRoleCard(full) {
var s = String(full || '');
if (!s) return React.createElement('div', { style: { opacity: 0.6 } }, _tFallback('cm.empty'));
var chunks = s.split(/\n(?=##)/);
return chunks.map(function (chunk, i) {
var m = chunk.match(/^##\s+(.+)/);
var title = m ? m[1].replace(/^[^\p{L}\p{N}]*/u, '').trim() : '';
var body = m ? chunk.replace(/^##\s+[^\n]*/, '') : chunk;
return React.createElement('div', { key: i, style: { marginBottom: 10 } },
title
? React.createElement('div', { style: { fontSize: 13, fontWeight: 700, marginBottom: 3, color: 'var(--dsw-alias-label-primary, inherit)' } }, '· ' + title)
: null,
React.createElement('div', { style: { fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.9 } }, body.trim())
);
});
}


function renderRoleModal(detail, loading, onClose, t) {
t = t || _tFallback;
if (!loading && !detail) return null;
var inner;
if (loading) {
inner = React.createElement('div', { style: { padding: 30, textAlign: 'center', opacity: 0.7 } }, t('md.loading'));
} else {
inner = [
React.createElement('div', { key: 'h', style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
React.createElement('span', { style: { fontSize: 17, fontWeight: 700 } }, detail.name),
React.createElement('span', { style: { flex: 1 } }),
React.createElement('button', { onClick: function () { onClose(null); }, title: t('md.close'), style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', borderRadius: 8, padding: '4px 10px', fontSize: 13 } }, '✕')
),
detail.desc
? React.createElement('div', { key: 'd', style: { fontSize: 13, opacity: 0.85, marginBottom: 12, lineHeight: 1.6 } }, detail.desc)
: null,
React.createElement('div', { key: 'b', style: { borderTop: '1px solid var(--dsw-alias-border-l2, #eee)', paddingTop: 12 } }, renderRoleCard(detail.full))
];
}
return React.createElement('div', {
onClick: function () { onClose(null); },
style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 24 }
},
React.createElement('div', { onClick: function (e) { e.stopPropagation(); }, style: { background: 'var(--dsw-alias-bg-overlay, #fff)', color: 'var(--dsw-alias-label-primary)', borderRadius: 14, maxWidth: 560, width: '100%', maxHeight: '84vh', overflowY: 'auto', padding: 18, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', position: 'relative' } }, inner)
);
}


function fetchStats() {
return fetch('/agents-pixe/stats')
.then(function (r) { return r.json(); })
.then(function (j) { return (j && typeof j.calls === 'number') ? j : { calls: 0, fails: 0 }; })
.catch(function () { return { calls: 0, fails: 0 }; });
}

function openPixeSettings() {
try {
var trigger = null;
try {
trigger = document.querySelector('[aria-haspopup="dialog"]');
} catch (e) {}
if (!trigger) {
var all = document.querySelectorAll('*');
for (var i = 0; i < all.length; i++) {
var el = all[i];
if (el.getAttribute && el.getAttribute('aria-haspopup') === 'dialog') { trigger = el; break; }
}
}
if (trigger) {
try { trigger.click(); } catch (e) {}
try {
trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
} catch (e) {}
}
var tries = 0;

var timer = setInterval(function () {

tries++;

var target = null;

var cells = document.querySelectorAll('*');

for (var i = 0; i < cells.length; i++) {

var el = cells[i];

var navText = ((el.textContent || '') + ' ' + (el.getAttribute ? (el.getAttribute('aria-label') || '') : '') + ' ' + (el.getAttribute ? (el.getAttribute('title') || '') : '')).trim();

if (navText.indexOf('角色办公室') >= 0 || navText.indexOf('Role Office') >= 0 || navText.indexOf('agent-teams-pixel') >= 0 || navText.indexOf('像素办公室') >= 0) {

target = el;

if (el.closest) {

var clickable = el.closest('button,[role="button"],a,[class*="navCell"],[class*="nav_cell"],[class*="nav-cell"],[class*="settings"]');

if (clickable) target = clickable;

}

break;

}

}

if (target) {

try { target.click(); } catch (e) {}

try { target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (e) {}

clearInterval(timer);

}

else if (tries > 50) clearInterval(timer);

}, 120);


} catch (e) {}
}

function AiToggle(props) {
var on = props.on;
var onChange = props.onChange;
var [confirming, setConfirming] = React.useState(false);
function confirmOn() { setConfirming(false); onChange(true); }
function cancel() { setConfirming(false); }
if (confirming) {
return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, userSelect: 'none' } },
React.createElement('span', { style: { opacity: 0.9 } }, _tFallback('ai.confirmOn')),
React.createElement('button', { onClick: confirmOn, style: { cursor: 'pointer', border: 'none', background: '#16a34a', color: '#fff', borderRadius: 999, padding: '6px 13px', fontSize: 13, fontWeight: 600 } }, _tFallback('ai.enable')),
React.createElement('button', { onClick: cancel, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', borderRadius: 999, padding: '6px 13px', fontSize: 13 } }, _tFallback('ai.cancel'))
);
}
return React.createElement('button', {
onClick: function () { if (on) onChange(false); else setConfirming(true); },
title: on ? _tFallback('ai.titleOn') : _tFallback('ai.titleOff'),
style: { cursor: 'pointer', border: '1px solid ' + (on ? '#2563eb' : 'var(--dsw-alias-border-l1,#ccc)'), background: on ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'var(--dsw-alias-bg-layer-1,#fff)', color: on ? '#fff' : 'inherit', borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: on ? '0 2px 8px rgba(37,99,235,0.4)' : 'none', lineHeight: 1, whiteSpace: 'nowrap' }
},
React.createElement('span', { style: { fontSize: 15, lineHeight: 1 } }, '🤖'),
React.createElement('span', { style: { lineHeight: 1 } }, 'AI'),
React.createElement('span', { style: { width: 24, height: 13, borderRadius: 7, background: on ? 'rgba(255,255,255,0.35)' : '#cbd5e1', position: 'relative', display: 'inline-block', flexShrink: 0, transition: 'background .15s' } },
React.createElement('span', { style: { position: 'absolute', top: 1.5, left: on ? 12 : 1.5, width: 10, height: 10, borderRadius: 5, background: on ? '#fff' : '#94a3b8', transition: 'left .15s' } })
)
);
}


function OfficeCanvas(props) {
var roles = props.roles;
var leader = props.leader;
var zoom = props.zoom || 1;
var working = props.working === true;
var done = props.done === true;
var page = props.page || 0;
var activity = props.activity || '';
var sessionId = props.sessionId || null;
var lang = useSystemLang();
var canvasRef = React.useRef(null);

React.useEffect(function () {
var canvas = canvasRef.current;
if (!canvas) return;
var ctx2d = canvas.getContext('2d');
var W = 520, H = 350;
var raf = 0;
var start = performance.now();
var lastErrAt = 0; 






function paint() {
raf = 0;
try { render(performance.now()); }
catch (e) {
var now = Date.now();
if (now - lastErrAt > 1000) {
lastErrAt = now;
try { console.error('[agents-pixe] OfficeCanvas 渲染抛错（已降级为单色背景，下一帧继续）：\n', e && (e.stack || e.message || e)); } catch (_) {}
}
try {
ctx2d.fillStyle = '#1d2433'; ctx2d.fillRect(0, 0, W, H);
ctx2d.fillStyle = '#f87171'; ctx2d.font = '13px sans-serif'; ctx2d.textAlign = 'center'; ctx2d.textBaseline = 'middle';
ctx2d.fillText('OfficeCanvas: ' + (e && e.message ? e.message : String(e)), W / 2, H / 2);
} catch (_) {}
}
raf = requestAnimationFrame(paint);
}

function render(now) {
var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
var t = (now - start) / 1000;
var cw = Math.round(W * zoom * dpr), ch = Math.round(H * zoom * dpr);
if (canvas.width !== cw) { canvas.width = cw; canvas.height = ch; }
canvas.style.width = (W * zoom) + 'px';
canvas.style.height = (H * zoom) + 'px';
ctx2d.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);

var dark = isDark();
ctx2d.fillStyle = dark ? '#333a48' : '#e8e2d6';
ctx2d.fillRect(0, 0, W, 110);
ctx2d.fillStyle = dark ? '#4a3b2e' : '#c9a27a';
ctx2d.fillRect(0, 110, W, H - 110);
ctx2d.fillStyle = dark ? '#3d332a' : '#b58f66';
for (var i = 0; i < 8; i++) ctx2d.fillRect(0, 110 + i * 24, W, 1.5);
ctx2d.fillStyle = dark ? '#6f96c8' : '#bfe3ff';
ctx2d.fillRect(30, 18, 88, 58);
ctx2d.fillStyle = dark ? '#59606f' : '#ffffff';
ctx2d.fillRect(30, 18, 88, 4); ctx2d.fillRect(30, 18, 4, 58); ctx2d.fillRect(70, 18, 4, 58);


ctx2d.fillStyle = dark ? '#2a2f38' : '#a8825c';
ctx2d.fillRect(0, 110, W, 4);
var cxx = W - 46, cyy = 42, cr = 16;
ctx2d.fillStyle = dark ? '#4b5563' : '#f9f5ec';
ctx2d.beginPath(); ctx2d.arc(cxx, cyy, cr, 0, 6.2832); ctx2d.fill();
ctx2d.strokeStyle = dark ? '#1f2937' : '#8a6a45'; ctx2d.lineWidth = 2;
ctx2d.beginPath(); ctx2d.arc(cxx, cyy, cr, 0, 6.2832); ctx2d.stroke();
ctx2d.strokeStyle = dark ? '#cbd5e1' : '#5b4a33'; ctx2d.lineWidth = 1.5;
ctx2d.beginPath(); ctx2d.moveTo(cxx, cyy); ctx2d.lineTo(cxx, cyy - 9); ctx2d.stroke();
ctx2d.beginPath(); ctx2d.moveTo(cxx, cyy); ctx2d.lineTo(cxx + 7, cyy + 2); ctx2d.stroke();
var rw = 130, rh = 32, rx = W / 2 - rw / 2, ry = 292;
ctx2d.fillStyle = dark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.12)';
ctx2d.beginPath();
ctx2d.moveTo(rx + 12, ry);
ctx2d.arcTo(rx + rw, ry, rx + rw, ry + rh, 12);
ctx2d.arcTo(rx + rw, ry + rh, rx, ry + rh, 12);
ctx2d.arcTo(rx, ry + rh, rx, ry, 12);
ctx2d.arcTo(rx, ry, rx + rw, ry, 12);
ctx2d.closePath(); ctx2d.fill();

ctx2d.strokeStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)'; ctx2d.lineWidth = 2;
ctx2d.beginPath();
ctx2d.moveTo(rx + 26, ry + 9);
ctx2d.arcTo(rx + rw - 12, ry + 9, rx + rw - 12, ry + rh - 5, 8);
ctx2d.arcTo(rx + rw - 12, ry + rh - 5, rx + 12, ry + rh - 5, 8);
ctx2d.arcTo(rx + 12, ry + rh - 5, rx + 12, ry + 9, 8);
ctx2d.arcTo(rx + 12, ry + 9, rx + 26, ry + 9, 8);
ctx2d.closePath(); ctx2d.stroke();

ctx2d.strokeStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.72)';
ctx2d.beginPath();
ctx2d.moveTo(W / 2, ry + 14);
ctx2d.lineTo(W / 2 + 24, ry + rh / 2);
ctx2d.lineTo(W / 2, ry + rh - 10);
ctx2d.lineTo(W / 2 - 24, ry + rh / 2);
ctx2d.closePath(); ctx2d.stroke();

ctx2d.fillStyle = dark ? 'rgba(99,102,241,0.32)' : 'rgba(99,102,241,0.24)';
for (var fr = 0; fr < 5; fr++) {
ctx2d.fillRect(rx - 4, ry + 4 + fr * 6, 5, 3);
ctx2d.fillRect(rx + rw - 1, ry + 4 + fr * 6, 5, 3);
}

ctx2d.fillStyle = dark ? '#4b5563' : '#f9f5ec';
ctx2d.fillRect(150, 30, 42, 34);
ctx2d.strokeStyle = dark ? '#1f2937' : '#8a6a45'; ctx2d.lineWidth = 2;
ctx2d.strokeRect(150, 30, 42, 34);
ctx2d.fillStyle = dark ? '#6f96c8' : '#a8d4ff'; ctx2d.fillRect(155, 35, 15, 12);
ctx2d.fillStyle = dark ? '#b91c1c' : '#ef4444'; ctx2d.fillRect(172, 35, 15, 12);
ctx2d.fillStyle = dark ? '#ca8a04' : '#f59e0b'; ctx2d.fillRect(155, 49, 15, 10);
ctx2d.fillStyle = dark ? '#15803d' : '#22c55e'; ctx2d.fillRect(172, 49, 15, 10);

var px = 16, py = 186;
ctx2d.fillStyle = dark ? '#3f6b3a' : '#4c8b3f';
ctx2d.fillRect(px - 3, py - 24, 24, 14);
ctx2d.fillRect(px + 1, py - 33, 14, 11);
ctx2d.fillStyle = dark ? '#2f5230' : '#3a7040';
ctx2d.fillRect(px + 7, py - 14, 4, 14);
ctx2d.fillStyle = dark ? '#7a5635' : '#a0663a';
ctx2d.fillRect(px - 1, py - 11, 18, 12);
ctx2d.fillStyle = dark ? '#8a6a45' : '#c9a27a';
ctx2d.fillRect(px - 1, py - 11, 18, 2);


var sx = 405, sy = 292;
ctx2d.fillStyle = dark ? '#5b4a3a' : '#b0804a';   
ctx2d.fillRect(sx, sy + 6, 96, 16);
ctx2d.fillRect(sx, sy, 96, 7);
ctx2d.fillStyle = dark ? '#6b5948' : '#c0955f';   
ctx2d.fillRect(sx - 5, sy + 4, 11, 30);
ctx2d.fillRect(sx + 90, sy + 4, 11, 30);
ctx2d.fillStyle = dark ? '#7a5a38' : '#c9a27a';   
ctx2d.fillRect(sx, sy + 22, 96, 12);
ctx2d.fillStyle = dark ? '#8a6a45' : '#d8b98a';   
ctx2d.fillRect(sx, sy + 22, 96, 3);
ctx2d.fillStyle = dark ? '#a855f7' : '#c084fc';   
ctx2d.fillRect(sx + 8, sy + 7, 32, 13);
ctx2d.fillStyle = dark ? '#ec4899' : '#f472b6';   
ctx2d.fillRect(sx + 54, sy + 7, 32, 13);
ctx2d.fillStyle = dark ? '#b8860b' : '#d4a017';   
ctx2d.fillRect(sx + 4, sy + 34, 5, 5);
ctx2d.fillRect(sx + 87, sy + 34, 5, 5);


ctx2d.fillStyle = dark ? '#374151' : '#6b7280';   
ctx2d.fillRect(W / 2 - 1, 0, 2, 16);
ctx2d.fillStyle = dark ? '#eab308' : '#fbbf24';   
ctx2d.beginPath(); ctx2d.moveTo(W / 2 - 14, 16); ctx2d.lineTo(W / 2 + 14, 16); ctx2d.lineTo(W / 2 + 6, 30); ctx2d.lineTo(W / 2 - 6, 30); ctx2d.closePath(); ctx2d.fill();
ctx2d.fillStyle = dark ? '#fef3c7' : '#fff7d6';   
ctx2d.beginPath(); ctx2d.arc(W / 2, 40, 8, 0, 6.2832); ctx2d.fill();
ctx2d.fillStyle = dark ? '#6b5640' : '#8a6a45';   
ctx2d.fillRect(206, 40, 66, 50);
ctx2d.fillStyle = dark ? '#4a3b2e' : '#c9a27a';   
ctx2d.fillRect(209, 43, 60, 44);
var bookCols = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
for (var shelfRow = 0; shelfRow < 3; shelfRow++) {
for (var bi2 = 0; bi2 < 6; bi2++) {
ctx2d.fillStyle = bookCols[(shelfRow + bi2) % bookCols.length];
ctx2d.fillRect(210 + bi2 * 10, 44 + shelfRow * 15, 8, 13);
}
}
ctx2d.fillStyle = dark ? '#64748b' : '#cbd5e1';   
ctx2d.fillRect(400, 250, 26, 44);
ctx2d.fillStyle = dark ? '#38bdf8' : '#7dd3fc';   
ctx2d.fillRect(404, 234, 18, 18);


for (var bd = 0; bd < 8; bd++) {
var bxx = 24 + bd * 72;
ctx2d.fillStyle = dark ? '#7a5a38' : '#9a7b55';
ctx2d.fillRect(bxx, 98, 66, 9);
ctx2d.fillStyle = dark ? '#8a6a45' : '#d8c39a';
ctx2d.fillRect(bxx, 90, 66, 9);
ctx2d.fillStyle = '#ffffff';
ctx2d.fillRect(bxx + 2, 91, 17, 7);
}

if (!roles || roles.length === 0) {
ctx2d.fillStyle = 'rgba(0,0,0,0.35)'; ctx2d.fillRect(0, 120, W, 40);
labelText(ctx2d, _tFallback('o.empty'), W / 2, 144, 13);
return;
}


var groups = Math.max(1, Math.ceil(roles.length / (props.maxPerPage || 8)));
var pg = Math.min(page, groups - 1);
var visible = roles.slice(pg * 8, pg * 8 + 8);

var n = visible.length;
var deskXs = [], deskYs = [];
for (var d = 0; d < n; d++) {

var drow = Math.floor(d / 4);
var dcol = d % 4;
var dx = 40 + dcol * 130;
var dy = (drow === 0) ? 155 : 260;
deskXs.push(dx);
deskYs.push(dy);

ctx2d.fillStyle = dark ? '#7a5635' : '#8a5a2b';
ctx2d.fillRect(dx, dy, 68, 9);
ctx2d.fillStyle = dark ? '#8a6a45' : '#a87a4a';
ctx2d.fillRect(dx, dy, 68, 2);
ctx2d.fillStyle = dark ? '#5a3f28' : '#6f4520';
ctx2d.fillRect(dx, dy + 7, 68, 2);
ctx2d.fillRect(dx + 6, dy + 9, 6, 30); ctx2d.fillRect(dx + 56, dy + 9, 6, 30);
ctx2d.fillStyle = dark ? '#b8860b' : '#d4a017';
ctx2d.fillRect(dx + 6, dy + 36, 6, 3); ctx2d.fillRect(dx + 56, dy + 36, 6, 3);
ctx2d.fillStyle = dark ? '#4a3b2e' : '#6f4520';
ctx2d.fillRect(dx + 10, dy + 11, 48, 6);
ctx2d.fillStyle = dark ? '#d4a017' : '#c9a227';
ctx2d.fillRect(dx + 30, dy + 13, 8, 2);
ctx2d.fillStyle = dark ? '#454b57' : '#2f3540';
ctx2d.fillRect(dx + 20, dy - 24, 28, 16);
ctx2d.fillStyle = dark ? '#6f96c8' : '#a8d4ff';
ctx2d.fillRect(dx + 22, dy - 22, 24, 12);
ctx2d.fillStyle = dark ? '#454b57' : '#2f3540';
ctx2d.fillRect(dx + 30, dy - 8, 8, 8);
ctx2d.fillStyle = dark ? '#333' : '#555';
ctx2d.fillRect(dx + 28, dy - 2, 12, 2);
var rec = visible[d];
var nm = (rec.key === leader ? '👑' : '') + String(rec.name).slice(0, 6);
ctx2d.font = '11px sans-serif'; ctx2d.textAlign = 'center'; ctx2d.textBaseline = 'alphabetic';
var tw = ctx2d.measureText(nm).width;
var tagX = dx + 34 - (tw + 10) / 2;
ctx2d.fillStyle = shade(hexToRgb(rec.color), 0.85);
ctx2d.fillRect(tagX, dy + 41, tw + 10, 16);
labelText(ctx2d, nm, dx + 34, dy + 53, 11);
}
PERSON_BOXES.length = 0;
for (var k = 0; k < n; k++) {
var rec2 = visible[k];
var st = personState(working, done);
var act = stateActivity(st);
var wseed = 0; for (var wi = 0; wi < rec2.key.length; wi++) wseed = (wseed * 31 + rec2.key.charCodeAt(wi)) >>> 0;
var cp = chatPhase(rec2.key, t);
var partnerIdx = (k % 2 === 0) ? k + 1 : k - 1;   
var partnerRec = (partnerIdx >= 0 && partnerIdx < n) ? visible[partnerIdx] : null;
var pname = roleName(rec2);   
var partnerName = partnerRec ? roleName(partnerRec) : null;
var aiInfo = { aiOn: CHAT_AI.isOn(), state: st, activity: activity, sessionId: sessionId, isLeader: rec2.key === leader, context: partnerRec ? recentLine(partnerRec.key) : '', partnerName: partnerName };
var clicked = (CLICKED && CLICKED.key === rec2.key && (now - CLICKED.t) < 2500) ? CLICKED : null;
var bounce = clicked ? Math.abs(Math.sin((now - CLICKED.t) / 1000 * Math.PI * 1.6)) * 12 : 0;
if (act === 'sleep') {

if (k < 2) {
var seatCx = 405 + 28 + (k === 0 ? 0 : 40);
var seatY = 292 + 34;
drawSitting(ctx2d, seatCx, seatY, 3, rec2, rec2.key === leader, 0);
drawNameTag(ctx2d, seatCx, seatY, pname);
if (clicked) drawChatBubble(ctx2d, seatCx, seatY, clicked.line, pname, null);
PERSON_BOXES.push({ key: rec2.key, x: seatCx, footY: seatY, name: pname });
} else {
var bedCx = 24 + ((k - 2) % 8) * 72 + 33;
drawSleeping(ctx2d, bedCx, 90, 3, rec2, rec2.key === leader);
drawNameTag(ctx2d, bedCx, 90, pname);
if (clicked) drawChatBubble(ctx2d, bedCx, 90, clicked.line, pname, null);
PERSON_BOXES.push({ key: rec2.key, x: bedCx, footY: 90, name: pname });
}
} else if (act === 'walk') {

var greet = resolveChat(rec2, cp, t, aiInfo);

var teff = cp.gi * 11.5 + (cp.cyc < 3.5 ? 0 : cp.cyc - 3.5);
var baseX = 60 + k * 55;
var baseY = 128 + (k % 3) * 50;
var walkX = Math.sin(teff * 0.7 + (wseed % 100) / 10) * 200;
var walkY = Math.sin(teff * 0.5 + ((wseed * 7) % 100) / 10) * 65;
var ccx = baseX + walkX;
var ccy = baseY + walkY;
var facing = 0, act2 = cp.isChat ? 'idle' : 'walk';
if (cp.isChat) {

var partner = -1;
for (var pj = 0; pj < n; pj++) {
if (pj !== k && isChatting(visible[pj].key, t)) { partner = pj; break; }
}
if (partner >= 0) {
var pbaseX = 40 + partner * 95;
facing = pbaseX > ccx ? 1 : -1;
}
}
ccx = Math.max(16, Math.min(W - 16, ccx));
ccy = Math.max(120, Math.min(H - 20, ccy));
var walkFoot = ccy - bounce;
drawCharacter(ctx2d, ccx, walkFoot, 3, rec2, act2, t, rec2.key === leader, facing);
drawNameTag(ctx2d, ccx, walkFoot, pname);
drawStateBadge(ctx2d, ccx, walkFoot, st);
if (greet) drawChatBubble(ctx2d, ccx, walkFoot, greet, pname, partnerName);
if (clicked) drawChatBubble(ctx2d, ccx, walkFoot, clicked.line, pname, null);
PERSON_BOXES.push({ key: rec2.key, x: ccx, footY: ccy, name: pname });
} else {

var dxW = deskXs[k] + 34;
var deskFoot = deskYs[k] - 3;
var greetW = resolveChat(rec2, cp, t, aiInfo);
var facingW = 0;
if (cp.isChat) {
var partnerW = -1;
for (var pjW = 0; pjW < n; pjW++) {
if (pjW !== k && isChatting(visible[pjW].key, t)) { partnerW = pjW; break; }
}
if (partnerW >= 0) {
var pdeskX = deskXs[partnerW] + 34;
facingW = pdeskX > dxW ? 1 : -1;
}
}
var workFoot = deskFoot - bounce;
drawCharacter(ctx2d, dxW, workFoot, 3, rec2, 'type', t, rec2.key === leader, facingW);
drawNameTag(ctx2d, dxW, workFoot, pname);
drawStateBadge(ctx2d, dxW, workFoot, st);
if (greetW) drawChatBubble(ctx2d, dxW, workFoot, greetW, pname, partnerName);
if (clicked) drawChatBubble(ctx2d, dxW, workFoot, clicked.line, pname, null);
PERSON_BOXES.push({ key: rec2.key, x: dxW, footY: deskFoot, name: pname });
}
}

if (activity) {
var bx = deskXs[0] + 34, by = deskYs[0] - 3;
for (var bi = 0; bi < visible.length; bi++) if (visible[bi].key === leader) { bx = deskXs[bi] + 34; by = deskYs[bi] - 3; }
drawCloud(ctx2d, bx, by, activity);
}
if (groups > 1) labelText(ctx2d, '第 ' + (pg + 1) + '/' + groups + ' 组', W / 2, 335, 11);
}


raf = requestAnimationFrame(paint);
return function () { cancelAnimationFrame(raf); };
}, [roles, leader, zoom, working, page, activity, done, sessionId, lang]);




React.useEffect(function () {
var canvas = canvasRef.current;
if (!canvas) return;
function onWheel(e) {
if (!e.ctrlKey && !e.metaKey) return;
if (typeof props.onZoom !== 'function') return;
if (typeof e.preventDefault === 'function') e.preventDefault();
var step = e.deltaY > 0 ? -0.25 : 0.25;
props.onZoom(function (z) { return Math.max(0.5, Math.min(2.5, (typeof z === 'number' ? z : 1) + step)); });
}
canvas.addEventListener('wheel', onWheel, { passive: false });
return function () { canvas.removeEventListener('wheel', onWheel); };
}, [props.onZoom]);

function hitTest(x, y) {
for (var i = 0; i < PERSON_BOXES.length; i++) {
var b = PERSON_BOXES[i];

if (Math.abs(x - b.x) < 11 && y > b.footY - 47 && y < b.footY + 3) return b;
}
return null;
}
function onCanvasClick(e) {
var canvas = canvasRef.current;
if (!canvas || !PERSON_BOXES.length) return;
var rect = canvas.getBoundingClientRect();
var x = (e.clientX - rect.left) / zoom;
var y = (e.clientY - rect.top) / zoom;
var hit = hitTest(x, y);
if (hit) {
CLICKED = { key: hit.key, t: performance.now(), line: clickLine(hit.name), name: hit.name };

if (props.onOpenRole) props.onOpenRole(hit.key);
}
}
function onCanvasMove(e) {
var canvas = canvasRef.current;
if (!canvas) return;
var rect = canvas.getBoundingClientRect();
var x = (e.clientX - rect.left) / zoom;
var y = (e.clientY - rect.top) / zoom;
canvas.style.cursor = hitTest(x, y) ? 'pointer' : 'default';
}

return React.createElement('canvas', { ref: canvasRef, onClick: onCanvasClick, onMouseMove: onCanvasMove, style: { display: 'block' } });
}


var ACTIVE_SID = null;
function currentSessionId() { return ACTIVE_SID; }


var SESSIONS_SVC = null;
var TIMER_SVC = null;
var LOCALE_SVC = null;

var PIXE_SCOPE = null;






var _PIXE_FALLBACK_SCOPE = (function () {
var KEY = 'agents-pixe.settings.v1';
var data = {};
var revision;
var listeners = [];
try { data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { data = {}; }
function emit() {
for (var i = 0; i < listeners.length; i++) {
try { listeners[i](); } catch (_) {}
}
}
function mirror() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {} }
function applyHost(j) {
if (!j || j.ok !== true) return false;
if (j.revision !== undefined) revision = j.revision;
if (j.value && typeof j.value === 'object') { data = j.value; mirror(); emit(); return true; }
return false;
}
function refresh() {
try {
return fetch('/agents-pixe/config', { headers: { accept: 'application/json' } })
.then(function (r) { return r.json(); })
.then(function (j) { applyHost(j); return data; })
.catch(function (e) {
try { console.warn('[agents-pixe] 读宿主配置失败（暂用本地镜像）：', e && (e.message || e)); } catch (_) {}
return data;
});
} catch (e) { return Promise.resolve(data); }
}
refresh();
return {
refresh: refresh,
subscribe: function (cb) {
if (typeof cb === 'function') listeners.push(cb);
return function () { listeners = listeners.filter(function (x) { return x !== cb; }); };
},
getSnapshot: function () { return { value: data }; },
set: function (key, val) {
var patch = {};
patch[key] = val;
data[key] = val; mirror(); emit();   
try {
fetch('/agents-pixe/config', {
method: 'POST',
headers: { 'content-type': 'application/json' },
body: JSON.stringify({ patch: patch, expectedRevision: revision })
}).then(function (r) { return r.json(); }).then(function (j) {
if (!j || j.ok !== true) {
try { console.warn('[agents-pixe] 配置写回被拒（仅本地生效）：' + ((j && j.error) || '未知原因')); } catch (_) {}
return;
}
applyHost(j);
}).catch(function (e) { try { console.warn('[agents-pixe] 配置写回请求失败（仅本地生效）：', e && (e.message || e)); } catch (_) {} });
} catch (e) { try { console.warn('[agents-pixe] 配置写回异常（仅本地生效）：', e && (e.message || e)); } catch (_) {} }
}
};
})();


function systemLang() {
try {
var a = LOCALE_SVC && LOCALE_SVC.getSnapshot ? String(LOCALE_SVC.getSnapshot().active || '').toLowerCase() : '';
return a.indexOf('en') === 0 ? 'en' : 'zh';
} catch (e) { return 'zh'; }
}
function useSystemLang() {
return React.useSyncExternalStore(
function (cb) { return (LOCALE_SVC && typeof LOCALE_SVC.subscribe === 'function') ? LOCALE_SVC.subscribe(cb) : function () {}; },
systemLang
);
}




var _EMPTY_PIXE_CFG = {}
function readPixeCfg() {
if (PIXE_SCOPE && typeof PIXE_SCOPE.getSnapshot === 'function') {
var s = PIXE_SCOPE.getSnapshot()
if (s && s.value && typeof s.value === 'object') return s.value
}
return _EMPTY_PIXE_CFG
}
function usePixeCfg() {
return React.useSyncExternalStore(
function (cb) { return (PIXE_SCOPE && typeof PIXE_SCOPE.subscribe === 'function') ? PIXE_SCOPE.subscribe(cb) : function () {}; },
readPixeCfg
);
}


function RolePicker(props) {
useRolesStore();   
var lang = useSystemLang();
var t = safeT((props && props.t) || _tFallback);
var [q, setQ] = React.useState('');
var [selected, setSelected] = React.useState(STATE.getDraft(props.sid));
React.useEffect(function () { return STATE.subscribe(function () { setSelected(STATE.getDraft(props.sid)); }); }, []);
var roles = lang === 'zh' ? ROLES_DATA.zh.roles : ROLES_DATA.en.roles;
var divs = lang === 'zh' ? ROLES_DATA.zh.divisions : ROLES_DATA.en.divisions;
var query = q.trim().toLowerCase();
var flat = [];
Object.keys(divs).forEach(function (div) {
var list = roles.filter(function (r) { return r.div === div && (query === '' || String(r.name).toLowerCase().indexOf(query) >= 0 || String(r.cname || '').toLowerCase().indexOf(query) >= 0 || String(r.desc).toLowerCase().indexOf(query) >= 0); });
if (list.length > 0) {
flat.push({ header: true, div: div, meta: divs[div] });
list.forEach(function (r) { flat.push({ header: false, rec: r }); });
}
});
var pickInf = useInfiniteScroll(flat.length);
React.useEffect(function () { pickInf.setLimit(60); }, [lang, q]);
function RoleRow(rr) {
var rec = rr.rec; var key = lang + ':' + rec.id; var on = selected.indexOf(key) >= 0;
return React.createElement('div', {
onClick: function () { STATE.toggleDraft(key, props.sid); },
style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(59,130,246,0.14)' : 'transparent', border: on ? '1px solid rgba(59,130,246,0.55)' : '1px solid transparent', marginBottom: 4 }
},
React.createElement('span', { style: { fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 } }, rec.emoji),
React.createElement('div', { style: { flex: 1, minWidth: 0 } }, React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, rec.name)),
React.createElement('span', { style: { width: 10, height: 10, borderRadius: 5, background: rec.color || '#888', flexShrink: 0 } })
);
}
return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: 0 } },
React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8, flexShrink: 0 } },
React.createElement('input', { value: q, onChange: function (e) { setQ(e.target.value); }, placeholder: t('p.searchPh'), style: { flex: 1, minWidth: 0, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit' } })
),
flat.length === 0
? React.createElement('div', { style: { fontSize: 13, opacity: 0.85, padding: 16, textAlign: 'center' } },
React.createElement(RolesLoadHint, { t: t }),
ROLES_STORE.get().loaded ? t('p.noMatch') : null)
: React.createElement('div', { style: { flex: 1, minHeight: 0, overflowY: 'auto' } },
flat.slice(0, pickInf.limit).map(function (item) {
if (item.header) return React.createElement('div', { key: 'h:' + item.div, style: { fontSize: 12, fontWeight: 700, opacity: 0.92, margin: '10px 0 5px' } }, (item.meta && item.meta.label) || item.div);
var rec = item.rec;
return React.createElement(RoleRow, { key: lang + ':' + rec.id, rec: rec });
}),
React.createElement(InfiniteFooter, { inf: pickInf, label: t('p.rolesUnit') })
)
);
}





var TEAM_STORE = (function () {
var cache = {};      
var subs = {};       
var timer = null;







var ACTIVE_MS = 4000;
var SETTLED_MS = 15000;
var IDLE_MS = 30000;
var interval = ACTIVE_MS;
var visBound = false;

function isLiveStatus(s) {
return s === 'pending' || s === 'claimed' || s === 'in_progress' || s === 'running';
}
function needOf(d) {
if (!d) return IDLE_MS;
if (d.plan) return ACTIVE_MS;
var tasks = (d.tasks || []).filter(function (x) { return x.status !== 'deleted'; });
if (tasks.some(function (x) { return isLiveStatus(String(x.status || '')); })) return ACTIVE_MS;
return (tasks.length || (d.members || []).length) ? SETTLED_MS : IDLE_MS;
}
function rate() {
var next = IDLE_MS;   
Object.keys(cache).forEach(function (k) { next = Math.min(next, needOf(cache[k] && cache[k].data)); });
if (next === interval && timer) return;
interval = next;
if (timer) { clearInterval(timer); timer = null; }
if (anySubs()) timer = setInterval(tick, interval);
}
function sigOf(d) {
if (!d) return '';
var ms = (d.members || []).map(function (m) { return (m.id || m.name) + ':' + m.status; }).join('|');
var ts = (d.tasks || []).map(function (t) { return t.id + ':' + t.status + ':' + t.revision + ':' + (t.ownerName || ''); }).join('|');
return ms + '#' + ts + '#' + (d.halted ? 'H' : '') + '#' + (d.plan ? 'P' : '') + '#' + ((d.lastStep && d.lastStep.at) || '');
}
function emit(sid) { (subs[sid] || []).forEach(function (fn) { try { fn(); } catch (e) {} }); }
function anySubs() { return Object.keys(subs).some(function (k) { return (subs[k] || []).length > 0; }); }
function tick() {
if (typeof document !== 'undefined' && document.hidden) return;   
Object.keys(subs).forEach(function (sid) { if ((subs[sid] || []).length) load(sid); });
}

function bindVisibility() {
if (visBound || typeof document === 'undefined' || !document.addEventListener) return;
visBound = true;
document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
}
function load(sid) {
if (!sid) return Promise.resolve(null);
return fetch('/agents-pixe/teams/view?lead=' + encodeURIComponent(sid))
.then(function (r) { return r.json(); })
.then(function (j) {
var data = j || null;
var sig = sigOf(data);
var prev = cache[sid];
cache[sid] = { data: data, sig: sig, at: Date.now(), error: null };
if (!prev || prev.sig !== sig) emit(sid);      
rate();
return data;
})
.catch(function (e) {
var prev = cache[sid] || {};
cache[sid] = { data: prev.data || { available: false, members: [], tasks: [] }, sig: prev.sig || '', at: Date.now(), error: String((e && e.message) || e) };
emit(sid);
return null;
});
}
return {
get: function (sid) { return sid && cache[sid] ? cache[sid].data : null; },
error: function (sid) { return sid && cache[sid] ? cache[sid].error : null; },
refresh: function (sid) { return load(sid); },
subscribe: function (sid, fn) {
if (!sid) return function () {};
(subs[sid] = subs[sid] || []).push(fn);
bindVisibility();
if (!timer) timer = setInterval(tick, interval);
if (!cache[sid]) load(sid);
return function () {
subs[sid] = (subs[sid] || []).filter(function (x) { return x !== fn; });
if (!anySubs() && timer) { clearInterval(timer); timer = null; }
};
}
};
})();

function useTeamView(sid) {
var [v, setV] = React.useState(function () { return TEAM_STORE.get(sid); });
React.useEffect(function () {
if (!sid) { setV(null); return; }
setV(TEAM_STORE.get(sid));
return TEAM_STORE.subscribe(sid, function () { setV(TEAM_STORE.get(sid)); });
}, [sid]);
return v;
}


var PANEL_CTL = (function () {
var listeners = [];
var last = null;


return {
open: function (view) { last = view || 'team'; listeners.forEach(function (fn) { try { fn(last); } catch (e) {} }); },
peek: function () { return last; },
subscribe: function (fn) {
listeners.push(fn);
return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
}
};
})();

function pixePost(path, body) {
return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
}


function teamTaskDepth(tasks) {
var byId = {}; tasks.forEach(function (t) { byId[t.id] = t; });
var depth = {};
function dOf(id) {
if (depth[id] !== undefined) return depth[id];
var t = byId[id]; if (!t) return 0;
var deps = (t.blockedBy || []).filter(function (x) { return byId[x]; });
depth[id] = deps.length === 0 ? 0 : 1 + Math.max.apply(null, deps.map(dOf));
return depth[id];
}
tasks.forEach(function (t) { dOf(t.id); });
return depth;
}


function taskStateOf(task, byId) {
var st = String((task && task.status) || 'pending');
if (st === 'completed') return 'completed';
if (st === 'failed') return 'failed';
if (st === 'cancelled') return 'cancelled';
if (st === 'in_progress' || st === 'running') return 'running';
var deps = (task.blockedBy || []).filter(function (x) { return byId[x]; });
var waiting = deps.filter(function (d) { return byId[d] && byId[d].status !== 'completed'; });
return waiting.length ? 'blocked' : 'open';
}

function taskStateLabel(state, t) {
var map = {
completed: 'tp.statusCompleted', running: 'tp.statusRunning', failed: 'tp.statusFailed',
blocked: 'tp.statusBlocked', open: 'tp.statusOpen', cancelled: 'tp.statusCancelled'
};
return t(map[state] || 'tp.statusOpen');
}
function taskStateColor(state) {
return state === 'completed' ? 'var(--px-blue,#3b82f6)'
: state === 'running' ? 'var(--px-green,#16a34a)'
: state === 'failed' ? 'var(--px-red,#ef4444)'
: state === 'blocked' ? 'var(--px-amber,#f59e0b)'
: 'var(--dsw-alias-label-secondary,#64748b)';
}
function fmtIds(ids) { return (ids || []).join('、'); }


function teamSummary(team, t) {
var tasks = (team && team.tasks) || [];
var plan = team && team.plan;
if (plan) return { tone: 'staged', text: t('tp.sum.staged', { n: (plan.tasks || []).length }) };
if (!tasks.length) return { tone: 'idle', text: t('tp.sum.waitingBreakdown') };
var byId = {}; tasks.forEach(function (x) { byId[x.id] = x; });
var states = tasks.map(function (x) { return taskStateOf(x, byId); });
var running = tasks.filter(function (x, i) { return states[i] === 'running'; });
var blocked = tasks.filter(function (x, i) { return states[i] === 'blocked'; });
var failed = tasks.filter(function (x, i) { return states[i] === 'failed'; });
var open = tasks.filter(function (x, i) { return states[i] === 'open'; });
var done = tasks.filter(function (x, i) { return states[i] === 'completed'; });
if (done.length === tasks.length) return { tone: 'done', text: t('tp.sum.allDelivered', { n: done.length }) };
if (failed.length && !running.length) return { tone: 'warn', text: t('tp.sum.failedSettled', { n: failed.length }) };
if (running.length && blocked.length) return { tone: 'run', text: t('tp.sum.blockedAndRunning', { run: fmtIds(running.map(function (x) { return x.id; })), blocked: fmtIds(blocked.map(function (x) { return x.id; })) }) };
if (running.length) return { tone: 'run', text: t('tp.sum.running', { ids: fmtIds(running.map(function (x) { return x.id; })) }) };
if (blocked.length && !open.length) return { tone: 'warn', text: t('tp.sum.blocked', { ids: fmtIds(blocked.map(function (x) { return x.id; })) }) };
if (open.length) return { tone: 'ready', text: t('tp.sum.ready', { ids: fmtIds(open.map(function (x) { return x.id; })) }) };
return { tone: 'idle', text: t('tp.sum.waitingSchedule') };
}


function ProgressSegments(props) {
var tasks = props.tasks; var t = props.t; var byId = props.byId;
var states = tasks.map(function (x) { return taskStateOf(x, byId); });
var n = function (s) { return states.filter(function (x) { return x === s; }).length; };
return React.createElement('div', null,
React.createElement('div', { style: { fontSize: 12, opacity: 0.75, letterSpacing: '0.04em', marginBottom: 4 } }, t('tp.progress')),
React.createElement('div', { style: { display: 'flex', gap: 3, marginBottom: 5 } },
tasks.map(function (x, i) {
return React.createElement('i', { key: x.id, title: x.id + ' · ' + taskStateLabel(states[i], t), style: { flex: 1, height: 12, background: taskStateColor(states[i]), border: '1px solid var(--dsw-alias-border-l1,#ccc)', display: 'block' } });
})
),
React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, opacity: 0.8, alignItems: 'center' } },
React.createElement('span', null, '● ' + t('tp.legendRunning', { n: n('running') })),
React.createElement('span', null, '● ' + t('tp.legendBlocked', { n: n('blocked') })),
React.createElement('span', null, '● ' + t('tp.legendDelivered', { n: n('completed') })),
React.createElement('span', { style: { marginLeft: 'auto', opacity: 0.7 } }, t('tp.segmentsHint', { n: tasks.length }))
)
);
}


function MemberTree(props) {
var members = props.members; var tasks = props.tasks; var byId = props.byId;
var t = props.t; var plan = props.plan; var onPick = props.onPick; var picked = props.picked;
var roleOf = {};
((plan && plan.members) || []).forEach(function (m) { if (m && m.name) roleOf[m.name] = m.role || ''; });
return React.createElement('div', { style: { position: 'relative', paddingLeft: 14, marginTop: 6 } },
React.createElement('div', { style: { position: 'absolute', left: 4, top: 0, bottom: 22, width: 1, background: 'var(--dsw-alias-border-l1,#ccc)' } }),
members.map(function (m) {
var mine = tasks.filter(function (x) { return (x.ownerName || '') === m.name; });
var myDone = mine.filter(function (x) { return taskStateOf(x, byId) === 'completed'; }).length;
var cur = mine.filter(function (x) { return taskStateOf(x, byId) === 'running'; })[0];
var wait = mine.filter(function (x) { return taskStateOf(x, byId) === 'blocked'; })[0];
var next = cur ? t('tp.nextRunning', { id: cur.id })
: wait ? t('tp.nextWaiting', { id: wait.id })
: (mine.length && myDone === mine.length) ? t('tp.nextSettled')
: t('tp.nextIdle');
var dot = m.status === 'running' ? 'var(--px-green,#16a34a)' : (m.status === 'failed' ? 'var(--px-red,#ef4444)' : (m.status === 'idle' ? 'var(--dsw-alias-label-secondary,#64748b)' : 'var(--px-amber,#f59e0b)'));
var sel = picked === m.name;
return React.createElement('div', {
key: m.id || m.name,
onClick: function () { onPick(sel ? null : m.name); },
title: m.name + (m.provider ? ' · ' + m.provider : ''),
style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 7px', marginBottom: 6, border: '1px solid ' + (sel ? 'var(--px-violet,#7c3aed)' : 'var(--dsw-alias-border-l2,#ddd)'), background: 'var(--dsw-alias-bg-layer-1,#fff)', cursor: 'pointer' }
},
React.createElement('span', { style: { position: 'absolute', left: -11, top: '50%', width: 9, height: 1, background: 'var(--dsw-alias-border-l1,#ccc)' } }),
React.createElement('span', { style: { width: 8, height: 8, borderRadius: 4, background: dot, flexShrink: 0 } }),
React.createElement('span', { style: { flex: 1, minWidth: 0 } },
React.createElement('span', { style: { fontSize: 13, fontWeight: 600 } }, m.name),
roleOf[m.name] ? React.createElement('span', { style: { marginLeft: 6, fontSize: 11, opacity: 0.8 } }, roleOf[m.name]) : null,
React.createElement('div', { style: { fontSize: 11, opacity: 0.72, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, next),
mine.length ? React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 } },
mine.map(function (x) {
var st = taskStateOf(x, byId);
return React.createElement('span', { key: x.id, style: { fontSize: 10, padding: '0 5px', border: '1px solid ' + taskStateColor(st), color: taskStateColor(st) } }, x.id);
})
) : null
),
React.createElement('span', { style: { fontSize: 11, opacity: 0.75, textAlign: 'right', flexShrink: 0 } },
t('tp.delivered'), React.createElement('br', null), myDone + '/' + mine.length)
);
})
);
}


function DAGraph(props) {
var tasks = props.tasks; var byId = props.byId; var t = props.t;
var pinned = props.pinned; var onPin = props.onPin; var picked = props.picked;
if (!tasks.length) return React.createElement('div', { style: { padding: 16, fontSize: 12, opacity: 0.75, border: '1px dashed var(--dsw-alias-border-l1,#ccc)' } }, t('tp.noTasks'));
var NW = 158, NH = 58, GX = 66, GY = 18, PAD = 18;
var depth = teamTaskDepth(tasks);
var cols = {};
tasks.forEach(function (x) { (cols[depth[x.id]] = cols[depth[x.id]] || []).push(x); });
var keys = Object.keys(cols).sort(function (a, b) { return Number(a) - Number(b); });
var pos = {};
keys.forEach(function (k, ci) { cols[k].forEach(function (x, ri) { pos[x.id] = { x: PAD + ci * (NW + GX), y: PAD + ri * (NH + GY) }; }); });
var rows = keys.reduce(function (m, k) { return Math.max(m, cols[k].length); }, 1);
var W = keys.length * (NW + GX) - GX + PAD * 2;
var H = rows * (NH + GY) - GY + PAD * 2;

var focusSet = null;
if (pinned && byId[pinned]) {
focusSet = {}; focusSet[pinned] = true;
(byId[pinned].blockedBy || []).forEach(function (d) { focusSet[d] = true; });
}
var edges = [];
tasks.forEach(function (x) {
(x.blockedBy || []).forEach(function (d) {
var a = pos[d], b = pos[x.id];
if (!a || !b) return;
var lit = focusSet && focusSet[x.id] && focusSet[d];
var mx = a.x + NW + (b.x - (a.x + NW)) / 2;
edges.push(React.createElement('path', {
key: d + '>' + x.id,
d: 'M ' + (a.x + NW) + ' ' + (a.y + NH / 2) + ' C ' + mx + ' ' + (a.y + NH / 2) + ', ' + mx + ' ' + (b.y + NH / 2) + ', ' + b.x + ' ' + (b.y + NH / 2),
fill: 'none',
stroke: lit ? 'var(--px-violet,#7c3aed)' : 'var(--dsw-alias-border-l1,#ccc)',
strokeWidth: lit ? 2.5 : 1.5
}));
});
});

return React.createElement('div', { style: { overflowX: 'auto' } },
React.createElement('div', { style: { position: 'relative', width: W, height: H } },
React.createElement('svg', { width: W, height: H }, edges),
tasks.map(function (x) {
var p = pos[x.id];
var st = taskStateOf(x, byId);
var on = pinned === x.id;
var dim = (focusSet && !focusSet[x.id]) || (picked && (x.ownerName || '') !== picked);
return React.createElement('div', {
key: x.id,
role: 'button',
tabIndex: 0,
'aria-pressed': on,
onClick: function () { onPin(on ? null : x.id); },
onFocus: function () { onPin(x.id); },
title: x.id + ' · ' + taskStateLabel(st, t) + (x.ownerName ? ' · ' + x.ownerName : ''),
style: {
position: 'absolute', left: p.x, top: p.y, width: NW, height: NH, boxSizing: 'border-box', padding: '5px 7px', cursor: 'pointer',
background: 'var(--dsw-alias-bg-layer-1,#fff)',
border: '1px solid ' + (on ? 'var(--px-violet,#7c3aed)' : 'var(--dsw-alias-border-l1,#ccc)'),
borderTop: '3px solid ' + taskStateColor(st),
opacity: dim ? 0.4 : 1,
overflow: 'hidden'
}
},
React.createElement('div', { style: { fontSize: 11, opacity: 0.7, display: 'flex', gap: 6 } },
x.id, x.ownerName ? React.createElement('span', { style: { marginLeft: 'auto' } }, x.ownerName) : null),
React.createElement('div', { style: { fontSize: 12, fontWeight: 600, lineHeight: 1.25, maxHeight: 32, overflow: 'hidden' } }, x.subject)
);
})
)
);
}

function TaskDetail(props) {
var t = props.t; var task = props.task; var byId = props.byId; var tasks = props.tasks;
if (!task) return React.createElement('div', { style: { fontSize: 12, opacity: 0.7 } }, t('tp.detailHint'));
var st = taskStateOf(task, byId);
var unlocks = tasks.filter(function (x) { return (x.blockedBy || []).indexOf(task.id) >= 0; }).map(function (x) { return x.id; });
var waitingOn = (task.blockedBy || []).filter(function (d) { return byId[d] && byId[d].status !== 'completed'; });
var why = st === 'completed' ? t('tp.detailCompleted')
: st === 'running' ? t('tp.detailRunning')
: st === 'blocked' ? t('tp.detailWaitingOn', { ids: fmtIds(waitingOn) })
: (task.blockedBy || []).length ? t('tp.detailReadyDeps') : t('tp.detailReady');
return React.createElement('div', { style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '8px 10px', fontSize: 12, lineHeight: 1.6 } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 } },
React.createElement('b', { style: { flex: 1, minWidth: 0 } }, task.id + ' ' + task.subject),
React.createElement('span', { style: { border: '1px solid ' + taskStateColor(st), color: taskStateColor(st), fontSize: 11, padding: '0 6px', flexShrink: 0 } }, taskStateLabel(st, t))
),
React.createElement('div', { style: { opacity: 0.8 } }, (task.ownerName || t('tp.unclaimed')) + ' · ' + why),
task.description ? React.createElement('div', { style: { opacity: 0.7, marginTop: 2 } }, task.description) : null,
React.createElement('div', { style: { opacity: 0.7, marginTop: 2 } }, unlocks.length ? t('tp.unlocks', { ids: fmtIds(unlocks) }) : t('tp.noDownstream'))
);
}


function PlanGate(props) {
var t = props.t; var plan = props.plan; var sid = props.sid;
var [draft, setDraft] = React.useState(function () { return { tasks: (plan.tasks || []).slice(), members: (plan.members || []).slice() }; });
var [openM, setOpenM] = React.useState(true);
var [openT, setOpenT] = React.useState(true);
var [busy, setBusy] = React.useState(false);
var [armed, setArmed] = React.useState(false);
var [newTask, setNewTask] = React.useState('');
var [msg, setMsg] = React.useState('');

React.useEffect(function () {
setDraft({ tasks: (plan.tasks || []).slice(), members: (plan.members || []).slice() });
}, [plan.at, plan.leadId]);

function addTask() {
var v = newTask.trim();
if (!v) { setMsg(t('tp.planNeedName')); return; }
var id = 'task-' + (draft.tasks.length + 1);
setDraft(function (p) { return Object.assign({}, p, { tasks: p.tasks.concat([{ id: id, subject: v.slice(0, 60), description: v, blockedBy: [], writeScopes: [], kind: 'work' }]) }); });
setNewTask(''); setMsg(t('tp.toastTaskAdded', { id: id }));
}




function approveFallback(reason) {
try { writeComposer(props && props.inputActions, t('tp.confirmHint')); } catch (e) {}
setMsg(t('tp.confirmFallback', { err: reason }));
try { jumpToChat(props); } catch (e) {}
}
function approve() {
if (busy) return;
setBusy(true); setMsg(t('tp.approving'));
var edited = Object.assign({}, plan, { tasks: draft.tasks, members: draft.members });
pixePost('/agents-pixe/teams/plan/confirm', { lead: sid, plan: edited }).then(function (j) {
setBusy(false);
if (j && j.ok) { setMsg(t('tp.toastApproved', { members: (j.members || []).length, tasks: (j.tasks || []).length })); TEAM_STORE.refresh(sid); }
else approveFallback((j && j.error) || 'unknown');
}).catch(function (e) { setBusy(false); approveFallback(String((e && e.message) || e)); });
}
function discard() {
if (!armed) { setArmed(true); return; }
setArmed(false);
pixePost('/agents-pixe/teams/plan/discard', { lead: sid }).then(function () {
setMsg(t('tp.toastDiscarded')); TEAM_STORE.refresh(sid);
}).catch(function (e) { setMsg(t('tp.toastFail', { err: String((e && e.message) || e) })); });
}
function backToChat() {
writeComposer(props && props.inputActions, t('tp.continueHint'));
jumpToChat(props);
}

var deps = draft.tasks.reduce(function (n, x) { return n + ((x.blockedBy || []).length ? 1 : 0); }, 0);
var btn = { cursor: 'pointer', borderRadius: 6, padding: '4px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', fontFamily: 'inherit' };

return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 430 } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
React.createElement('b', { style: { fontSize: 14, flex: 1 } }, t('tp.planTitle')),
React.createElement('span', { style: { fontSize: 11, padding: '1px 7px', background: 'var(--px-blue,#3b82f6)', color: '#071124' } }, t('tp.planBadge'))),
React.createElement('div', { style: { fontSize: 11, opacity: 0.78 } }, t('tp.planSub', { members: draft.members.length, tasks: draft.tasks.length, deps: deps })),
React.createElement('div', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.planHint')),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 } },
[t('tp.flowReview'), t('tp.flowSpawn'), t('tp.flowRun')].map(function (label, i) {
return React.createElement('span', { key: label, style: { display: 'inline-flex', alignItems: 'center', gap: 4, color: i === 0 ? 'var(--px-blue,#3b82f6)' : 'var(--dsw-alias-label-secondary,#888)' } },
React.createElement('i', { style: { width: 17, height: 17, border: '1px solid ' + (i === 0 ? 'var(--px-blue,#3b82f6)' : 'var(--dsw-alias-border-l1,#ccc)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'normal' } }, String(i + 1)),
label,
i < 2 ? React.createElement('s', { style: { display: 'inline-block', width: 14, height: 1, background: 'var(--dsw-alias-border-l2,#ddd)', marginLeft: 3 } }) : null);
})
),

React.createElement('div', { style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)' } },
React.createElement('div', { onClick: function () { setOpenM(!openM); }, style: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 12 } },
React.createElement('span', null, openM ? '▾' : '▸'), React.createElement('b', { style: { flex: 1 } }, t('tp.planMembers')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.cardMembers', { n: draft.members.length }))),
openM ? React.createElement('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2,#ddd)' } },
draft.members.map(function (m, i) {
return React.createElement('div', { key: (m.name || i) + '', style: { display: 'flex', gap: 7, alignItems: 'center', padding: '5px 8px', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
React.createElement('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.name),
React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, m.role || ''),
React.createElement('span', { style: { fontSize: 11, opacity: 0.6 } }, plan.provider || ''));
})
) : null),

React.createElement('div', { style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)' } },
React.createElement('div', { onClick: function () { setOpenT(!openT); }, style: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 12 } },
React.createElement('span', null, openT ? '▾' : '▸'), React.createElement('b', { style: { flex: 1 } }, t('tp.planTasks')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.planTaskCount', { tasks: draft.tasks.length, deps: deps }))),
openT ? React.createElement('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2,#ddd)' } },
draft.tasks.map(function (x, i) {
return React.createElement('div', { key: x.id || i, style: { display: 'flex', gap: 7, alignItems: 'center', padding: '5px 8px', fontSize: 12, borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
React.createElement('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, (x.id ? x.id + ' ' : '') + (x.subject || '')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.65 } }, (x.blockedBy || []).length ? t('tp.planDep', { ids: fmtIds(x.blockedBy) }) : t('tp.planNoDeps')));
})
) : null,
React.createElement('div', { style: { display: 'flex', gap: 6, padding: '6px 8px' } },
React.createElement('input', { value: newTask, onChange: function (e) { setNewTask(e.target.value); }, placeholder: t('tp.planAddPh'), style: { flex: 1, minWidth: 0, padding: '3px 7px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', fontFamily: 'inherit' } }),
React.createElement('button', { type: 'button', onClick: addTask, style: btn }, t('tp.planAdd')))),

React.createElement('div', { style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: 8 } },
React.createElement('div', { style: { fontSize: 12, fontWeight: 700 } }, t('tp.planReady')),
React.createElement('div', { style: { fontSize: 11, opacity: 0.72, margin: '2px 0 7px' } }, t('tp.planReadyHint', { members: draft.members.length, tasks: draft.tasks.length })),
React.createElement('button', { type: 'button', onClick: approve, disabled: busy, style: Object.assign({}, btn, { width: '100%', background: busy ? '#94a3b8' : 'var(--px-blue,#3b82f6)', borderColor: 'var(--px-ink,#333)', color: '#071124', fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }) }, busy ? t('tp.approving') : t('tp.approve')),
React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 7, alignItems: 'center' } },
React.createElement('button', { type: 'button', onClick: backToChat, style: Object.assign({}, btn, { flex: 1 }) }, t('tp.continue')),
React.createElement('button', { type: 'button', onClick: discard, style: Object.assign({}, btn, { borderColor: 'var(--px-red,#ef4444)', color: 'var(--px-red,#ef4444)' }) }, armed ? t('tp.discardArmed') : t('tp.discard'))),
armed ? React.createElement('div', { style: { fontSize: 11, color: 'var(--px-red,#ef4444)', marginTop: 6 } }, t('tp.discardConfirm')) : null,
msg ? React.createElement('div', { style: { fontSize: 11, opacity: 0.8, marginTop: 6 } }, msg) : null)
);
}




function RosterList(props) {
var t = props.t;
var roster = props.roster || [];
var leaderKey = props.leaderKey;
var openKey = props.openKey;
var onOpen = props.onOpen;
var onSetLeader = props.onSetLeader;
if (!roster.length) return React.createElement('div', { style: { marginTop: 4, fontSize: 12, opacity: 0.7 } }, t('tp.rosterEmpty'));
var divs = (systemLang() === 'en' ? INDEX.enDivs : INDEX.zhDivs) || {};
return React.createElement('div', { style: { marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 } },
roster.map(function (r, i) {
var isLead = !!leaderKey && r.key === leaderKey;
var open = openKey === r.key;
var lbl = (divs[r.div] && divs[r.div].label) || r.div || '';
return React.createElement('div', {
key: r.key,


role: 'button',
tabIndex: 0,
'aria-expanded': open,
onClick: function () { if (onOpen) onOpen(open ? null : r.key); },
onKeyDown: function (ev) {
if (!ev) return;
if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); if (onOpen) onOpen(open ? null : r.key); }
},
title: r.desc || r.name,
style: { border: '1px solid ' + (open ? 'var(--px-violet,#7c3aed)' : 'var(--dsw-alias-border-l2,#ddd)'), background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '5px 7px', cursor: onOpen ? 'pointer' : 'default' }
},
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
React.createElement('span', { style: { width: 16, textAlign: 'center', flexShrink: 0, fontSize: 12 } }, isLead ? '👑' : String(i + 1)),
React.createElement('span', { style: { width: 8, height: 8, borderRadius: 4, background: r.color || '#888', flexShrink: 0 } }),
React.createElement('span', { style: { fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, (r.emoji || '') + ' ' + r.name),
lbl ? React.createElement('span', { style: { fontSize: 10, border: '1px solid var(--dsw-alias-border-l1,#ccc)', padding: '0 5px', opacity: 0.85, flexShrink: 0 } }, lbl) : null,
React.createElement('span', { style: { fontSize: 10, color: isLead ? 'var(--px-green,#16a34a)' : 'var(--px-amber,#f59e0b)', border: '1px solid ' + (isLead ? 'var(--px-green,#16a34a)' : 'var(--px-amber,#f59e0b)'), padding: '0 5px', flexShrink: 0 } }, isLead ? t('tp.isLeader') : t('tp.pendingTeam'))),
r.desc ? React.createElement('div', { style: { fontSize: 11, opacity: 0.75, marginTop: 3, marginLeft: 23, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: open ? 'pre-wrap' : 'nowrap' } }, r.desc) : null,
open ? React.createElement('div', { style: { fontSize: 11, opacity: 0.7, marginTop: 4, marginLeft: 23, lineHeight: 1.8, wordBreak: 'break-all' } },
React.createElement('div', null, 'id: ' + r.id),
React.createElement('div', null, t('tp.langLabel') + ': ' + r.lang),
(!isLead && onSetLeader) ? React.createElement('button', {
type: 'button',
onClick: function (ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); onSetLeader(r.key); },
style: { marginTop: 3, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '1px 8px', fontSize: 11 }
}, t('tp.setLeader')) : null) : null);
}));
}


function TeamPanel(props) {
var sid = props.sid;
var t = safeT((props && props.t) || _tFallback);
var data = useTeamView(sid);
var [pinned, setPinned] = React.useState(null);
var [picked, setPicked] = React.useState(null);
var [busy, setBusy] = React.useState(false);
var [toast, setToast] = React.useState(null);
var [armedHalt, setArmedHalt] = React.useState(false);
var [reportOpen, setReportOpen] = React.useState(false);
var [copied, setCopied] = React.useState(false);

var activeKeys = useActiveKeys(sid);
useRolesStore();   
var roster = rosterOfKeys(activeKeys);   
var [rosterOpen, setRosterOpen] = React.useState(null);
var [rosterShown, setRosterShown] = React.useState(false);
function showToast(msg, ms) { setToast(msg); setTimeout(function () { setToast(null) }, ms || 2400); }

function isDispatchable(x) {
var s = String((x && x.status) || '');
return s === 'pending' || s === 'claimed' || s === 'in_progress' || s === 'running';
}


function buildTeam() {
if (!sid) return;
try { writeComposer(props && props.inputActions, t('tp.buildTeamMsg')); } catch (e) {}
try { jumpToChat(props); } catch (e) {}
}

if (!data) return React.createElement('div', { style: { padding: 16, fontSize: 13, opacity: 0.7 } }, t('tp.loading'));

var members = data.members || [];
var tasks = (data.tasks || []).filter(function (x) { return x.status !== 'deleted'; });
var plan = data.plan || null;
var isNative = data.source === 'native';
var byId = {}; tasks.forEach(function (x) { byId[x.id] = x; });

if (!plan && members.length === 0 && tasks.length === 0) {


var btnLike = { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 };
return React.createElement('div', { style: { padding: 10, fontSize: 13, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 } },
React.createElement('div', { style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '7px 9px' } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' } },
React.createElement('b', { style: { fontSize: 13 } }, t('tp.roster')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.72 } }, t('tp.cardMembers', { n: roster.length })),
roster.length
? React.createElement('button', { type: 'button', onClick: function () { STATE.clearDraft(sid); showToast(t('tp.rosterCleared')); }, style: Object.assign({}, btnLike, { marginLeft: 'auto' }) }, t('cm.clear'))
: null,
roster.length
? React.createElement('button', {
type: 'button',
onClick: function () {
var recs = selectedRecords(sid);
if (!recs.length) return;
try { writeComposer(props && props.inputActions, shortInstruction(recs, STATE.getLeader(sid), STATE.getName(sid))); } catch (e) {}
try { jumpToChat(props); } catch (e) {}
},
style: Object.assign({}, btnLike, { background: 'var(--px-blue,#2563eb)', borderColor: 'var(--px-ink,#1b2130)', color: '#fff', fontWeight: 700 })
}, t('r.applyChat'))
: null),
React.createElement(RosterList, {
t: t, roster: roster, leaderKey: STATE.getActiveLeader(sid),
openKey: rosterOpen, onOpen: setRosterOpen,
onSetLeader: function (k) { STATE.setLeader(k, sid); },
})),


React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
roster.length
? React.createElement('button', { type: 'button', onClick: buildTeam, style: Object.assign({}, btnLike, { background: 'var(--px-violet,#7c3aed)', borderColor: 'var(--px-violet,#7c3aed)', color: '#fff', fontWeight: 700, padding: '5px 12px' }) }, t('tp.buildTeam'))
: null,
React.createElement('button', { type: 'button', onClick: function () { PANEL_CTL.open('pick'); }, style: Object.assign({}, btnLike, { padding: '5px 12px' }) }, t('tp.gotoPick'))),
React.createElement('div', { style: { fontSize: 12, opacity: 0.75 } }, t('tp.emptyHint')));
}

function toggleHalt() {
if (!sid || busy) return;
if (!data.halted && !armedHalt) { setArmedHalt(true); return; }   
setArmedHalt(false); setBusy(true);
pixePost(data.halted ? '/agents-pixe/teams/resume' : '/agents-pixe/teams/halt', { lead: sid }).then(function (j) {
setBusy(false);
if (j && j.ok) { showToast(data.halted ? t('tp.toastResumed') : t('tp.toastHalted')); TEAM_STORE.refresh(sid); }
else showToast(t('tp.toastFail', { err: (j && j.error) || 'unknown' }));
}).catch(function (e) { setBusy(false); showToast(t('tp.toastFail', { err: String((e && e.message) || e) })); });
}

var sum = teamSummary(data, t);
var done = tasks.filter(function (x) { return taskStateOf(x, byId) === 'completed'; }).length;
var msgs = (data.messages || []).length;
var detailTask = pinned && byId[pinned] ? byId[pinned] : null;

var btn = { cursor: 'pointer', borderRadius: 6, padding: '3px 9px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', fontFamily: 'inherit' };
var bannerTone = sum.tone === 'warn' ? 'var(--px-amber,#f59e0b)' : sum.tone === 'staged' ? 'var(--px-blue,#3b82f6)' : sum.tone === 'done' ? 'var(--px-blue,#3b82f6)' : 'var(--px-green,#16a34a)';

return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } },

React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderBottom: '1px solid var(--dsw-alias-border-l1,#ccc)', flexWrap: 'wrap' } },
React.createElement('span', { style: { width: 8, height: 8, borderRadius: 4, background: bannerTone, display: 'inline-block' } }),
React.createElement('b', { style: { fontSize: 13 } }, (plan && plan.teamName) || data.teamName || t('tp.title')),
isNative ? React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.readOnlyNative')) : null,
React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, opacity: 0.7 } }, t('tp.headSum', { members: members.length, done: done, total: tasks.length, msgs: msgs })),



data.oneShot ? React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.oneShotHint')) : null,
(isNative || data.oneShot || !(tasks.some(isDispatchable) || data.halted)) ? null
: React.createElement('button', { type: 'button', onClick: toggleHalt, disabled: busy, title: t('tp.haltTitle'),
style: Object.assign({}, btn, { borderColor: data.halted ? 'var(--px-green,#16a34a)' : (armedHalt ? 'var(--px-amber,#f59e0b)' : 'var(--dsw-alias-border-l1,#ccc)'), color: armedHalt ? 'var(--px-amber,#f59e0b)' : 'inherit' }) },
data.halted ? t('tp.resume') : (armedHalt ? t('tp.haltConfirm') : t('tp.halt')))
),

React.createElement('div', { style: { padding: '5px 8px', fontSize: 12, background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
React.createElement('span', { style: { color: bannerTone } }, '● ' + sum.text),
toast ? React.createElement('span', { style: { marginLeft: 10, opacity: 0.75 } }, toast) : null
),

React.createElement('div', { style: { flex: '1 1 auto', minHeight: 0, overflow: 'auto', padding: 8 } },
plan
? React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' } },
React.createElement(PlanGate, { t: t, plan: plan, sid: sid, inputActions: props.inputActions }),
React.createElement('div', { style: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
React.createElement('b', { style: { fontSize: 13 } }, t('tp.preview')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.previewHint'))),
React.createElement(DAGraph, {
tasks: (plan.tasks || []).map(function (x) { return Object.assign({}, x, { status: 'pending' }); }),
byId: (function () { var m = {}; (plan.tasks || []).forEach(function (x) { m[x.id] = Object.assign({}, x, { status: 'pending' }); }); return m; })(),
t: t, pinned: pinned, onPin: setPinned, picked: null
}),
React.createElement(TaskDetail, { t: t, task: (plan.tasks || []).filter(function (x) { return x.id === pinned; })[0] || null, byId: (function () { var m = {}; (plan.tasks || []).forEach(function (x) { m[x.id] = x; }); return m; })(), tasks: plan.tasks || [] })
))
: React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' } },

React.createElement('div', { style: { width: 330, flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '6px 8px' } },
React.createElement('span', { style: { fontSize: 18 } }, '🧭'),
React.createElement('span', { style: { flex: 1, minWidth: 0 } },
React.createElement('b', { style: { fontSize: 13 } }, t('tp.captain')),
React.createElement('div', { style: { fontSize: 11, opacity: 0.72 } }, members.length && tasks.length ? t('tp.dispatched', { tasks: tasks.length, members: members.length }) : t('tp.captainRole'))),
React.createElement('span', { style: { fontSize: 11, padding: '1px 6px', border: '1px solid ' + bannerTone, color: bannerTone } }, done === tasks.length && tasks.length ? t('tp.captainDone') : t('tp.captainWorking'))),
React.createElement(ProgressSegments, { tasks: tasks, byId: byId, t: t }),
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 } },
React.createElement('b', { style: { fontSize: 13, flex: 1 } }, t('tp.members', { n: members.length }))),
React.createElement(MemberTree, { members: members, tasks: tasks, byId: byId, t: t, plan: plan, onPick: setPicked, picked: picked })
),

React.createElement('div', { style: { flex: '2 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
React.createElement('b', { style: { fontSize: 13 } }, t('tp.taskDeps')),
React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, opacity: 0.7 } }, picked ? t('tp.filterByMember', { name: picked }) : t('tp.dagHint'))),
React.createElement(DAGraph, { tasks: tasks, byId: byId, t: t, pinned: pinned, onPin: setPinned, picked: picked }),
React.createElement(TaskDetail, { t: t, task: detailTask, byId: byId, tasks: tasks })
)),

roster.length
? React.createElement('div', { style: { marginTop: 8, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)' } },
React.createElement('div', {
role: 'button', tabIndex: 0, 'aria-expanded': !!rosterShown,
onClick: function () { setRosterShown(!rosterShown); },
onKeyDown: function (ev) { if (ev && (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar')) { ev.preventDefault(); setRosterShown(!rosterShown); } },
style: { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', fontSize: 12, cursor: 'pointer', userSelect: 'none' }
},
React.createElement('span', null, (rosterShown ? '▾ ' : '▸ ') + '🧑‍🤝‍🧑 ' + t('tp.roster')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.72 } }, t('tp.cardMembers', { n: roster.length }))),
rosterShown ? React.createElement('div', { style: { padding: '0 8px 7px', borderTop: '1px solid var(--dsw-alias-border-l2,#eee)' } },
React.createElement(RosterList, {
t: t, roster: roster, leaderKey: STATE.getActiveLeader(sid),
openKey: rosterOpen, onOpen: setRosterOpen,
onSetLeader: function (k) { STATE.setLeader(k, sid); },
})) : null)
: null,


(data.lastReport && String(data.lastReport).trim())
? React.createElement('div', { style: { marginTop: 8, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)' } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', fontSize: 12, flexWrap: 'wrap' } },
React.createElement('span', { onClick: function () { setReportOpen(!reportOpen); }, style: { cursor: 'pointer', userSelect: 'none' } }, (reportOpen ? '▾ ' : '▸ ') + '📄 ' + t('tp.report')),
data.archivedAt ? React.createElement('span', { style: { fontSize: 11, opacity: 0.7, border: '1px solid var(--dsw-alias-border-l1,#ccc)', padding: '0 6px' } }, t('tp.reportArchived')) : null,
React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, opacity: 0.65 } }, String(data.lastReport).length + ' ' + t('tp.reportChars')),
React.createElement('button', {
type: 'button',
onClick: function () {
try {
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(String(data.lastReport));
setCopied(true); setTimeout(function () { setCopied(false); }, 1600);
} catch (e) {}
},
style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '2px 8px', fontSize: 11 }
}, copied ? t('tp.reportCopied') : t('tp.reportCopy'))),
reportOpen
? React.createElement('pre', { style: { margin: 0, padding: '7px 9px', borderTop: '1px solid var(--dsw-alias-border-l2,#eee)', maxHeight: 320, overflow: 'auto', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' } }, String(data.lastReport))
: null)
: null
)
);
}




function teamOf(data) {
if (!data) return null;
var members = data.members || [];
var tasks = (data.tasks || []).filter(function (x) { return x.status !== 'deleted'; });
if (!members.length && !tasks.length && !data.plan) return null;
return { members: members, tasks: tasks, plan: data.plan || null, halted: !!data.halted, raw: data };
}
function teamCounts(team) {
var byId = {}; team.tasks.forEach(function (x) { byId[x.id] = x; });
var done = team.tasks.filter(function (x) { return taskStateOf(x, byId) === 'completed'; }).length;
var running = team.tasks.some(function (x) { return taskStateOf(x, byId) === 'running'; });
var live = !!team.plan || team.tasks.some(function (x) { var s = taskStateOf(x, byId); return s === 'running' || s === 'blocked' || s === 'open'; });



var plan = team.plan || null;
var staged = !!plan;
var nMembers = staged ? ((plan.members || []).length || (plan.roster || []).length) : team.members.length;
var nTasks = staged ? (plan.tasks || []).length : team.tasks.length;

var names = staged ? (plan.members || []).map(function (m) { return m.name; }) : team.members.map(function (m) { return m.name; });
return { done: done, running: running, live: live, byId: byId, staged: staged, nMembers: nMembers, nTasks: nTasks, names: names };
}

function SessionTeamEntry(props) {
var t = safeT((props && props.t) || _tFallback);
var sid = (props && (props.sessionId || props.sid)) || ACTIVE_SID;
var data = useTeamView(sid);
var team = teamOf(data);
if (!team) return null;
var c = teamCounts(team);
var dot = c.running ? '#22c55e' : (team.halted ? '#f59e0b' : '#94a3b8');
return React.createElement('button', {
type: 'button',
title: t('tp.entryTitle'),
onClick: function () { PANEL_CTL.open('team'); },
style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', fontFamily: 'inherit', borderRadius: 7, padding: '4px 10px', fontSize: 12, lineHeight: 1.4 }
},
React.createElement('span', { style: { width: 7, height: 7, borderRadius: 4, background: dot, display: 'inline-block', flexShrink: 0 } }),
'🧩 ' + t('tp.entry', { members: c.nMembers }));
}

function TurnTailTeamCard(props) {
var t = safeT((props && props.t) || _tFallback);
var sid = (props && (props.sessionId || props.sid)) || ACTIVE_SID;
var data = useTeamView(sid);
var team = teamOf(data);
if (!team) return null;
var c = teamCounts(team);
var sum = teamSummary(team.raw, t);


if (!c.live) {
return React.createElement('div', {
style: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', border: '1px solid var(--dsw-alias-border-l2,#eee)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '4px 9px', margin: '4px 0', fontSize: 12, opacity: 0.9 }
},
React.createElement('span', { style: { width: 7, height: 7, borderRadius: 4, background: c.done === c.nTasks && c.nTasks > 0 ? '#3b82f6' : '#94a3b8', display: 'inline-block', flexShrink: 0 } }),
React.createElement('b', { style: { fontSize: 12 } }, '🧩 ' + t('tp.title')),
React.createElement('span', { style: { opacity: 0.72 } }, t('tp.cardMembers', { n: c.nMembers })),
React.createElement('span', { style: { opacity: 0.72 } }, '· ' + sum.text),
React.createElement('button', {
type: 'button',
onClick: function () { PANEL_CTL.open('team'); },
style: { marginLeft: 'auto', cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '2px 8px', fontSize: 11 }
}, t('tp.viewTeam'))
);
}
return React.createElement('div', {
style: { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', padding: '7px 9px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 6 }
},
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' } },
React.createElement('b', { style: { fontSize: 13 } }, '🧩 ' + t('tp.title')),
React.createElement('span', { style: { fontSize: 11, opacity: 0.72 } }, t('tp.cardMembers', { n: c.nMembers })),
React.createElement('span', { style: { fontSize: 11, opacity: 0.72 } }, '· ' + sum.text),
React.createElement('button', {
type: 'button',
onClick: function () { PANEL_CTL.open('team'); },
style: { marginLeft: 'auto', cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 }
}, t('tp.viewTeam'))
),
React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },

c.staged
? c.names.map(function (nm) {
return React.createElement('span', {
key: nm, title: nm,
style: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, border: '1px dashed var(--dsw-alias-border-l1,#ccc)', padding: '1px 7px', opacity: 0.85 }
},
React.createElement('span', { style: { width: 6, height: 6, borderRadius: 3, background: '#94a3b8', display: 'inline-block' } }),
nm);
})
: team.members.map(function (m) {
var mine = team.tasks.filter(function (x) { return (x.ownerName || '') === m.name; });
var myDone = mine.filter(function (x) { return taskStateOf(x, c.byId) === 'completed'; }).length;
var col = m.status === 'running' ? '#22c55e' : (m.status === 'failed' ? '#ef4444' : '#64748b');
return React.createElement('span', {
key: m.id || m.name, title: m.name + (mine.length ? ' · ' + myDone + '/' + mine.length : ''),
style: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, border: '1px solid var(--dsw-alias-border-l1,#ccc)', padding: '1px 7px' }
},
React.createElement('span', { style: { width: 6, height: 6, borderRadius: 3, background: col, display: 'inline-block' } }),
m.name);
})
)
);
}








var PIXE_TOOL_KEYS = [
'agents_pixe_team', 'agents_pixe_team_create', 'agents_pixe_team_step',
'agents_pixe_team_message', 'agents_pixe_team_report',
'agents_pixe_task_create', 'agents_pixe_task_update', 'agents_pixe_roles'
];

function pixeToolKind(name) {
var n = String(name || '');
if (n === 'agents_pixe_roles') return 'roles';
if (n === 'agents_pixe_task_create' || n === 'agents_pixe_task_update') return 'task';
return 'team';
}

function pixeToolRaw(props) {
var out = { args: null, text: '' };
try {
var b = props && props.block;
if (!b) return out;
var a = b.input || b.args || b.arguments || b.parameters || (b.call && (b.call.input || b.call.args)) || null;
if (a && typeof a === 'object') out.args = a;
var txt = '';
if (typeof b.text === 'string') txt = b.text;
else if (typeof b.content === 'string') txt = b.content;
else if (Array.isArray(b.content)) txt = b.content.map(function (x) { return typeof x === 'string' ? x : ((x && x.text) || ''); }).join('\n');
else if (typeof b.result === 'string') txt = b.result;
out.text = String(txt).slice(0, 4000);
} catch (e) {}
return out;
}

function PixeToolView(props) {
var t = safeT((props && props.t) || _tFallback);
var name = String((props && props.toolName) || '');
var kind = pixeToolKind(name);
var sid = (props && (props.sessionId || props.sid)) || ACTIVE_SID;
var data = useTeamView(sid);                       
var [open, setOpen] = React.useState(false);
var raw = pixeToolRaw(props);

var box = { border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', margin: '4px 0', fontSize: 12 };
var mkHead = function (icon, label) {
return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', flexWrap: 'wrap' } },
React.createElement('span', null, icon + ' ' + label),
React.createElement('span', { style: { opacity: 0.6 } }, name),
React.createElement('button', {
type: 'button',
onClick: function () { PANEL_CTL.open('team'); },
style: { marginLeft: 'auto', cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '2px 8px', fontSize: 11 }
}, t('tv.openPanel')));
};

if (props && props.phase === 'preparing') {
return React.createElement('div', { style: box }, mkHead('⏳', t('tv.team')),
React.createElement('div', { style: { padding: '0 9px 7px', opacity: 0.7 } }, t('tv.preparing')));
}

var kindLabel = kind === 'roles' ? t('tv.roles') : (kind === 'task' ? t('tv.task') : t('tv.team'));
var kindIcon = kind === 'roles' ? '📇' : (kind === 'task' ? '📌' : '🧩');

var body = null;
if (kind === 'roles') {
body = React.createElement('div', { style: { padding: '0 9px 8px', opacity: 0.75 } }, t('tv.rolesHint'));
} else if (kind === 'task') {
body = React.createElement('div', { style: { padding: '0 9px 8px', opacity: 0.8 } },
data ? teamSummary(data, t).text : t('tv.noTeam'));
} else {
var team = teamOf(data);
if (!team) {
body = React.createElement('div', { style: { padding: '0 9px 8px', opacity: 0.7 } }, t('tv.noTeam'));
} else {
var byId = {}; team.tasks.forEach(function (x) { byId[x.id] = x; });
var done = team.tasks.filter(function (x) { return taskStateOf(x, byId) === 'completed'; }).length;
body = React.createElement('div', { style: { padding: '0 9px 8px', display: 'flex', flexDirection: 'column', gap: 6 } },
React.createElement('div', { style: { opacity: 0.85 } }, '● ' + teamSummary(team.raw, t).text),
team.tasks.length ? React.createElement('div', { style: { display: 'flex', gap: 3 } },
team.tasks.map(function (x) {
return React.createElement('i', {
key: x.id, title: x.id + ' · ' + taskStateLabel(taskStateOf(x, byId), t),
style: { flex: 1, height: 9, background: taskStateColor(taskStateOf(x, byId)), border: '1px solid var(--dsw-alias-border-l1,#ccc)', display: 'block' }
});
})
) : null,
React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
team.members.map(function (m) {
var col = m.status === 'running' ? '#22c55e' : (m.status === 'failed' ? '#ef4444' : '#64748b');
return React.createElement('span', { key: m.id || m.name, style: { fontSize: 11, border: '1px solid var(--dsw-alias-border-l1,#ccc)', padding: '0 6px', display: 'inline-flex', alignItems: 'center', gap: 4 } },
React.createElement('span', { style: { width: 6, height: 6, borderRadius: 3, background: col, display: 'inline-block' } }), m.name);
}),
React.createElement('span', { style: { marginLeft: 'auto', opacity: 0.7, fontSize: 11 } },
t('tp.headSum', { members: team.members.length, done: done, total: team.tasks.length, msgs: ((team.raw && team.raw.messages) || []).length }))
)
);
}
}

return React.createElement('div', { style: box },
mkHead(kindIcon, kindLabel),
body,
React.createElement('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2,#eee)', padding: '4px 9px' } },
React.createElement('span', { onClick: function () { setOpen(!open); }, style: { cursor: 'pointer', opacity: 0.7, userSelect: 'none' } }, (open ? '▾ ' : '▸ ') + t('tv.raw')),
open ? React.createElement('pre', { style: { marginTop: 5, maxHeight: 220, overflow: 'auto', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', padding: 6 } },
(raw.args ? JSON.stringify(raw.args, null, 2) : t('tv.noArgs')) + (raw.text ? '\n\n--- result ---\n' + raw.text : '')) : null)
);
}




var _OVERLAY_KEY = 'agents-pixe.overlay.v1';
function readOverlayLayout() {
var out = {};
try {
out = JSON.parse(localStorage.getItem(_OVERLAY_KEY) || 'null') || {};
} catch (e) { out = {}; }
try {
var W = (typeof window !== 'undefined' && window.innerWidth) || 1280;
var H = (typeof window !== 'undefined' && window.innerHeight) || 800;
if (typeof out.dx === 'number' && isFinite(out.dx)) out.dx = Math.max(16 - W, Math.min(16, out.dx)); else delete out.dx;
if (typeof out.dy === 'number' && isFinite(out.dy)) out.dy = Math.max(16 - H, Math.min(16, out.dy)); else delete out.dy;
if (typeof out.zoom !== 'number' || !isFinite(out.zoom)) delete out.zoom;
else out.zoom = Math.max(0.5, Math.min(2.5, out.zoom));
} catch (e) {}
return out;
}
function writeOverlayLayout(patch) {
try {
var next = Object.assign({}, readOverlayLayout(), patch);
localStorage.setItem(_OVERLAY_KEY, JSON.stringify(next));
} catch (e) {  }
}


function OfficeOverlay(props) {
var useSessions = props && props.useSessions;
var t = safeT((props && props.t) || _tFallback);
useSystemLang();









function pickMainSession(s) {
if (!s || !s.byId || typeof s.byId !== 'object') return undefined;
var keys = Object.keys(s.byId);
for (var i = 0; i < keys.length; i++) {
var rec = s.byId[keys[i]];
var rb = rec && rec.retainedBy;
if (rb && (rb.mainView || 0) > 0) return rec.id || keys[i];
}
return undefined;
}
var sid = useSessions ? useSessions(pickMainSession) : undefined;
if (!sid) sid = ACTIVE_SID;
var pixeCfg = usePixeCfg();
var zoomInit = (typeof pixeCfg.zoom === 'number') ? pixeCfg.zoom : 1.35;
var maxPerPage = (typeof pixeCfg.maxPerPage === 'number' && pixeCfg.maxPerPage >= 4 && pixeCfg.maxPerPage <= 16) ? pixeCfg.maxPerPage : 8;
var showAvatarBar = pixeCfg.showAvatarBar !== false;
var [running, setRunning] = React.useState(false);
var [done, setDone] = React.useState(false);
var prevRunningRef = React.useRef(false);
var [activity, setActivity] = React.useState('');
var [snap, setSnap] = React.useState({ roles: [], leader: null });
var [savedLayout] = React.useState(function () { return readOverlayLayout(); });   
var [collapsed, setCollapsed] = React.useState(savedLayout.collapsed === true);
var [pos, setPos] = React.useState({ dx: savedLayout.dx || 0, dy: savedLayout.dy || 0 });
var [zoom, setZoom] = React.useState(typeof savedLayout.zoom === 'number' ? savedLayout.zoom : zoomInit);
var [pickerOpen, setPickerOpen] = React.useState(false);
var [view, setView] = React.useState(savedLayout.view === 'team' ? 'team' : 'office');   
var [moreOpen, setMoreOpen] = React.useState(false);       
var [showSettings, setShowSettings] = React.useState(false);
var [allPresets, setAllPresets] = React.useState(false);   
var [page, setPage] = React.useState(0);
var [teams, setTeams] = React.useState(TEAMS.list());
var [draftN, setDraftN] = React.useState(sid ? STATE.getDraft(sid).length : 0);
var [draftLeader, setDraftLeader] = React.useState(sid ? STATE.getLeader(sid) : null);
var [aiOn, setAiOn] = React.useState(CHAT_AI.isOn());
var [tok, setTok] = React.useState({ in: 0, out: 0, cachePct: 0, turns: 0, steps: 0 });
var [teamMsg, setTeamMsg] = React.useState('');
var teamMsgTimer = React.useRef(null);
var [roleDetail, setRoleDetail] = React.useState(null);
var [roleDetailLoading, setRoleDetailLoading] = React.useState(false);
var openRoleDetail = function (key) {
if (!key) return;
setRoleDetailLoading(true);
try {
fetch('/agents-pixe/role?key=' + encodeURIComponent(key))
.then(function (r) { return r.json(); })
.then(function (j) { setRoleDetailLoading(false); if (j && j.found) setRoleDetail(j); })
.catch(function () { setRoleDetailLoading(false); });
} catch (e) { setRoleDetailLoading(false); }
};
var drag = React.useRef(null);
var resize = React.useRef(null);
var prevSidRef = React.useRef(sid);
var dragCleanup = React.useRef(null);    
var resizeCleanup = React.useRef(null);
React.useEffect(function () {
return function () { if (dragCleanup.current) dragCleanup.current(); if (resizeCleanup.current) resizeCleanup.current(); };
}, []);


var tv = useTeamView(sid);


React.useEffect(function () {
return PANEL_CTL.subscribe(function (target) {
setCollapsed(false);
if (target === 'pick') { setView('office'); setPickerOpen(true); setShowSettings(false); setMoreOpen(false); return; }
setView(target === 'team' ? 'team' : 'office');
setPickerOpen(false); setShowSettings(false); setMoreOpen(false);
});
}, []);






function gotoPicker() {
setView('office'); setShowSettings(false); setMoreOpen(false); setPickerOpen(true);
}


React.useEffect(function () { writeOverlayLayout({ collapsed: collapsed, view: view }); }, [collapsed, view]);
React.useEffect(function () {
var id = setTimeout(function () { writeOverlayLayout({ dx: pos.dx, dy: pos.dy, zoom: zoom }); }, 400);
return function () { clearTimeout(id); };
}, [pos.dx, pos.dy, zoom]);


React.useEffect(function () {
if (prevSidRef.current && prevSidRef.current !== sid) CHAT_AI.set(false);
prevSidRef.current = sid;
}, [sid]);

React.useEffect(function () {


if (sid) ACTIVE_SID = sid;
function refresh() { setSnap({ roles: sid ? activeRecords(sid) : [], leader: sid ? STATE.getActiveLeader(sid) : null }); }
function refreshDraft() { setDraftN(sid ? STATE.getDraft(sid).length : 0); setDraftLeader(sid ? STATE.getLeader(sid) : null); }
refresh(); refreshDraft();
var u1 = STATE.subscribe(refresh);
var u2 = STATE.subscribe(refreshDraft);
var u3 = TEAMS.subscribe(function () { setTeams(TEAMS.list()); });
var u4 = CHAT_AI.subscribe(function () { setAiOn(CHAT_AI.isOn()); });
return function () { u1(); u2(); u3(); u4(); };
}, [sid]);


React.useEffect(function () {
if (!SESSIONS_SVC || !TIMER_SVC) return;
function poll() {
var r = false;
var act = '';
try {
var b = SESSIONS_SVC.binding ? SESSIONS_SVC.binding(sid) : undefined;
var s = b && b.session ? b.session : undefined;
var snap = s && s.getSnapshot ? s.getSnapshot() : undefined;
r = !!(snap && snap.running === true);
if (r && snap) {
var calls = snap.runningCalls || [];
if (calls.length > 0) {
var c = calls[0];
var nm = c && (c.name || c.toolName || (c.payload && c.payload.toolName)) || _tFallback('o.tool');
act = '🔧 ' + nm;
} else {
act = '✍️ ' + _tFallback('o.outputting').replace('✍️ ', '');
}
}

if (s && s.projections && typeof s.projections.get === 'function') {
var tu = s.projections.get('tokenUsage');
if (tu && typeof tu === 'object') {
var unc = tu.uncachedInputTokens || 0, out = tu.outputTokens || 0, cr = tu.cacheReadTokens || 0, cw = tu.cacheWriteTokens || 0;
var cacheHit = (unc + cr) > 0 ? Math.round(cr / (unc + cr) * 100) : 0;
setTok({ in: unc + cr + cw, out: out, cachePct: cacheHit, turns: tok.turns, steps: tok.steps });
}
var ss = s.projections.get('sessionStats');
if (ss && typeof ss === 'object') {
setTok(function (p) { return { in: p.in, out: p.out, cachePct: p.cachePct, turns: ss.turns || 0, steps: ss.steps || 0 }; });
}
}
} catch (e) {}

if (prevRunningRef.current === true && r === false) {
setDone(true);
if (TIMER_SVC.timeout) TIMER_SVC.timeout(function () { setDone(false); }, 8000);
}
prevRunningRef.current = r;
setRunning(r);
setActivity(act);
}
poll();
var dispose = TIMER_SVC.interval ? TIMER_SVC.interval(poll, 800) : undefined;
return function () { if (dispose) dispose(); };
}, [sid]);

function loadTeamIntoDraft(t) {
if (!sid) return;
STATE.clearDraft(sid);
var leaderKey = null;
function toKey(idOrKey) { return String(idOrKey).indexOf(':') >= 0 ? idOrKey : systemLang() + ':' + idOrKey; }
(t.roles || []).forEach(function (r) {
var key = toKey(r);
if (INDEX.map[key]) { STATE.addDraft(key, sid); if (toKey(t.leader) === key) leaderKey = key; }
});
STATE.setLeader(leaderKey, sid);
STATE.setName(t.name, sid);
}


function oneClickTeam() {
if (draftN === 0) return;
var name = STATE.getName(sid) || '';

var instr = name ? _tFallback('inst.oneClick', { name: name }) : _tFallback('inst.oneClickOffice');
if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
try { navigator.clipboard.writeText(instr); } catch (e) {}
}
writeComposer(props && props.inputActions, instr);
setTeamMsg(_tFallback('o.msgOk', { name: name || _tFallback('o.currentTeam') }));
if (teamMsgTimer.current) clearTimeout(teamMsgTimer.current);
teamMsgTimer.current = setTimeout(function () { setTeamMsg(''); }, 5000);
jumpToChat(props);
}





function applyDraftToChat() {
if (draftN === 0) return;
try { STATE.apply(sid || ACTIVE_SID); } catch (e) {}
var recs = selectedRecords(sid);
if (recs.length > 0) writeComposer(props && props.inputActions, shortInstruction(recs, STATE.getLeader(sid), STATE.getName(sid)));
setPickerOpen(false); setShowSettings(false); setMoreOpen(false);
setTeamMsg(t('tp.applied', { n: recs.length }));
if (teamMsgTimer.current) clearTimeout(teamMsgTimer.current);
teamMsgTimer.current = setTimeout(function () { setTeamMsg(''); }, 4000);
jumpToChat(props);
}




function clearSelection() {
try { STATE.clearDraft(sid); } catch (e) {}
try { STATE.clearActive(sid || ACTIVE_SID); } catch (e) {}
setTeamMsg(t('tp.rosterCleared'));
if (teamMsgTimer.current) clearTimeout(teamMsgTimer.current);
teamMsgTimer.current = setTimeout(function () { setTeamMsg(''); }, 3000);
}

var roles = snap.roles;
var leader = snap.leader;
var draftRoles = selectedRecords(sid);
var draftLeaderRec = draftLeader ? INDEX.map[draftLeader] : null;



var hasTeamView = roles.length > 0 || !!(tv && (((tv.members || []).length) || ((tv.tasks || []).length) || tv.plan));
var effView = hasTeamView ? view : 'office';

function onTitleDown(e) {
if (e.button !== 0) return;
drag.current = { sx: e.clientX, sy: e.clientY, base: pos };
function onMove(ev) {
if (!drag.current) return;
var panelW = 520 * zoom + 24;
var panelH = 350 * zoom + 68;
var dx = drag.current.base.dx + (ev.clientX - drag.current.sx);
var dy = drag.current.base.dy + (ev.clientY - drag.current.sy);
dx = Math.max(16 - window.innerWidth + panelW, Math.min(16, dx));
dy = Math.max(16 - window.innerHeight + panelH, Math.min(16, dy));
setPos({ dx: dx, dy: dy });
}
function onUp() { drag.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); dragCleanup.current = null; }
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
dragCleanup.current = onUp;
}
function onResizeDown(e) {
if (e.button !== 0) return;
e.stopPropagation();
resize.current = { sx: e.clientX, sy: e.clientY, base: zoom };
function onMove(ev) {
if (!resize.current) return;
var d = (ev.clientX - resize.current.sx) + (ev.clientY - resize.current.sy);
setZoom(Math.max(0.5, Math.min(2.5, resize.current.base + d / 200)));
}
function onUp() { resize.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); resizeCleanup.current = null; }
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
resizeCleanup.current = onUp;
}






var base = { position: 'absolute', right: 16 - pos.dx, bottom: 16 - pos.dy, pointerEvents: 'auto' };

if (collapsed) {



var tvTeam = teamOf(tv);
var tc = tvTeam ? teamCounts(tvTeam) : null;
var hasTeam = !!tvTeam;
return React.createElement('div', {
style: { position: 'absolute', right: 16, bottom: 16, pointerEvents: 'auto', background: 'var(--dsw-alias-bg-layer-2, #2b2f3a)', color: 'var(--dsw-alias-label-primary)', borderRadius: 14, padding: '6px 12px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', fontSize: 13, userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 },
title: hasTeam ? t('tp.entryTitle') : t('o.fold'),
onClick: function () { setCollapsed(false); if (hasTeam) setView('team'); }
},
React.createElement('span', { style: { width: 9, height: 9, borderRadius: 5, background: (tc && tc.running) || running ? '#22c55e' : '#94a3b8', display: 'inline-block', flexShrink: 0 } }),
hasTeam
? (tc.staged
? t('tp.badgeStaged', { members: tc.nMembers, tasks: tc.nTasks })
: t('tp.badge', { members: tc.nMembers, done: tc.done, total: tc.nTasks }))
: t('o.collapsed', { n: roles.length }));
}

return React.createElement('div', {
style: Object.assign({ background: 'var(--dsw-alias-bg-overlay, #fff)', color: 'var(--dsw-alias-label-primary)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.35)', border: '1px solid var(--dsw-alias-border-l1, #ddd)', minWidth: effView === 'team' ? Math.min(900, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 48) + 'px' : undefined, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)' }, base)
},
React.createElement('div', {
onMouseDown: onTitleDown,
style: { padding: '8px 12px', cursor: 'move', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', background: 'var(--dsw-alias-bg-layer-2, #f5f5f5)', borderBottom: '1px solid var(--dsw-alias-border-l2, #eee)', fontSize: 13, fontWeight: 600 }
},
React.createElement('span', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 6 } },
React.createElement('span', { style: { width: 8, height: 8, borderRadius: 4, background: running ? '#22c55e' : '#94a3b8', display: 'inline-block', flexShrink: 0 } }),
t('o.title', { n: roles.length })
),



hasTeamView
? React.createElement('span', { style: { display: 'inline-flex', border: '1px solid var(--dsw-alias-border-l1,#ccc)', borderRadius: 7, overflow: 'hidden', flexShrink: 0 } },
[['office', '🏢 ', 'tp.tabOffice'], ['team', '🤝 ', 'tp.tabTeam']].map(function (v) {
var on = effView === v[0];
return React.createElement('button', {
key: v[0], type: 'button', 'aria-pressed': on, title: t(v[2]),
onClick: function () { setView(v[0]); setPickerOpen(false); setShowSettings(false); setMoreOpen(false); },
style: { cursor: 'pointer', border: 'none', background: on ? 'var(--px-violet,#7c3aed)' : 'var(--dsw-alias-bg-layer-1,#fff)', color: on ? '#fff' : 'inherit', fontFamily: 'inherit', fontSize: 13, padding: '6px 12px', lineHeight: 1.3 }
}, v[1] + t(v[2]));
})
)
: null,

React.createElement('button', {
type: 'button',
disabled: draftN === 0,
title: draftN === 0 ? t('tp.applyNone') : t('tp.applyTitle'),
onClick: applyDraftToChat,
style: {
flexShrink: 0, fontFamily: 'inherit', lineHeight: 1.3, borderRadius: 7, padding: '6px 12px', fontSize: 13,
cursor: draftN === 0 ? 'not-allowed' : 'pointer',
border: '1px solid ' + (draftN === 0 ? 'var(--dsw-alias-border-l1,#ccc)' : 'var(--px-ink,#1b2130)'),
background: draftN === 0 ? 'var(--dsw-alias-bg-layer-2,#f5f5f5)' : 'var(--px-blue,#2563eb)',
color: draftN === 0 ? 'inherit' : '#fff',
opacity: draftN === 0 ? 0.5 : 1
}
}, draftN === 0 ? t('tp.applyNone') : t('r.applyChatN', { n: draftN })),


draftN === 0 ? null : React.createElement('button', {
type: 'button',
title: t('tp.clearTitle'),
onClick: clearSelection,
style: {
flexShrink: 0, fontFamily: 'inherit', lineHeight: 1.3, borderRadius: 7, padding: '6px 10px', fontSize: 13,
cursor: 'pointer',
border: '1px solid var(--dsw-alias-border-l1,#ccc)',
background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit'
}
}, '🗑 ' + t('cm.clear')),
React.createElement('button', { type: 'button', 'aria-expanded': moreOpen, onClick: function () { setMoreOpen(!moreOpen); setPickerOpen(false); setShowSettings(false); }, title: t('tp.more'),
style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: moreOpen ? 'rgba(124,58,237,0.15)' : 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', borderRadius: 7, padding: '6px 14px', fontSize: 16, lineHeight: 1.3 } }, '⋯'),
React.createElement('span', { onClick: function (e) { e.stopPropagation(); setCollapsed(true); }, title: t('o.fold'), style: { cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: '6px 6px', alignSelf: 'center' } }, '—')
),

moreOpen
? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)', background: 'var(--dsw-alias-bg-layer-1,#fff)', fontSize: 12 } },
React.createElement('span', { style: { opacity: 0.7 } }, t('tp.moreHint')),
React.createElement('button', { type: 'button', onClick: function () { if (pickerOpen) { setPickerOpen(false); } else { gotoPicker(); } }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, pickerOpen ? t('o.collapse') : t('o.add')),
React.createElement('button', { type: 'button', onClick: function () { setZoom(Math.max(0.5, zoom - 0.25)); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, t('o.zoomOut')),
React.createElement('button', { type: 'button', onClick: function () { setZoom(Math.min(2.5, zoom + 0.25)); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, t('o.zoomIn')),
React.createElement('button', { type: 'button', onClick: function () { setShowSettings(true); setPickerOpen(false); setMoreOpen(false); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, '⚙️ ' + t('o.settings')),
React.createElement('button', { type: 'button', title: t('tp.resetView'), onClick: function () { setPos({ dx: 0, dy: 0 }); setZoom(zoomInit); setMoreOpen(false); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, '↺ ' + t('tp.resetView')),


(tok.turns > 0 || tok.in > 0)
? React.createElement('div', { style: { flexBasis: '100%', marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--dsw-alias-border-l1,#ccc)', fontSize: 11, opacity: 0.75, lineHeight: 1.7 } },
React.createElement('div', { style: { fontWeight: 700, opacity: 0.9 } }, '📊 ' + t('tp.statTitle')),
React.createElement('div', { title: t('o.tip') },
(tok.turns > 0 ? t('o.tokensTurns', { turns: tok.turns, steps: tok.steps }) : '') +
(tok.cachePct > 0 ? t('o.tokensCache', { pct: tok.cachePct }) : '') +
t('o.tokensIn', { x: fmtTok(tok.in) }) + t('o.tokensOut', { x: fmtTok(tok.out) })))
: null)
: null,


!sid
? React.createElement('div', { style: { padding: '4px 10px', fontSize: 11, background: 'rgba(239,68,68,0.14)', color: 'var(--px-red,#ef4444)', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } }, t('o.noSession'))
: null,
pixBoundary('选人面板或办公室画布',
effView === 'team'
? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, height: '100%', minHeight: 460, maxHeight: 'calc(100vh - 110px)', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-overlay,#fff)', overflow: 'hidden' } },
React.createElement(TeamPanel, { sid: sid, t: t, inputActions: props && props.inputActions })
)
: showSettings
? React.createElement('div', { style: { padding: 10, width: Math.max(360, Math.round(520 * zoom)) + 'px', maxWidth: 'calc(100vw - 24px)', maxHeight: 460, overflowY: 'auto' } },
React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
React.createElement('span', { style: { fontSize: 13, fontWeight: 700 } }, t('st.nav')),
React.createElement('button', { onClick: function () { setShowSettings(false); }, style: { cursor: 'pointer', border: 'none', background: 'transparent', color: 'inherit', fontSize: 16 } }, '✕')
),
React.createElement(PixeSettingsSection, { t: t, scope: PIXE_SCOPE })
)
: pickerOpen
? React.createElement('div', { style: { padding: 10, width: Math.max(360, Math.round(520 * zoom)) + 'px', maxWidth: 'calc(100vw - 24px)', maxHeight: 460, overflowY: 'auto' } },
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
React.createElement('span', { style: { fontSize: 12, fontWeight: 700, opacity: 0.92 } }, t('o.recTeams')),
React.createElement('span', { onClick: function () { setAllPresets(!allPresets); }, style: { marginLeft: 'auto', cursor: 'pointer', fontSize: 11, opacity: 0.8, userSelect: 'none' } }, allPresets ? t('r.presetLess') : t('r.presetMore', { n: PRESETS.length }))
),
React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 } },
(allPresets ? PRESETS : PRESETS.slice(0, 6)).map(function (p) { return React.createElement('span', { key: p.name, onClick: function () { loadTeamIntoDraft(p); }, style: { cursor: 'pointer', flexGrow: 1, textAlign: 'center', borderRadius: 14, padding: '3px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit' } }, '⭐ ' + presetLabel(p)); })
),
teams.length > 0
? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 } },
teams.map(function (t) { return React.createElement('span', { key: t.name, onClick: function () { loadTeamIntoDraft(t); }, style: { cursor: 'pointer', flexGrow: 1, textAlign: 'center', borderRadius: 14, padding: '3px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit' } }, '💾 ' + t.name); })
)
: null,
React.createElement('div', { style: { fontSize: 12, fontWeight: 700, opacity: 0.92, marginBottom: 6 } }, t('o.teamDraft', { n: draftN })),
React.createElement('button', { disabled: draftN === 0, onClick: oneClickTeam,
style: { cursor: draftN === 0 ? 'default' : 'pointer', padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 8, border: 'none', background: draftN === 0 ? 'rgba(120,120,120,0.2)' : '#7c3aed', color: draftN === 0 ? 'rgba(120,120,120,0.6)' : '#fff' } },
draftN === 0 ? t('o.oneClickNone') : (draftLeaderRec ? t('o.oneClickLeader', { name: draftLeaderRec.name }) : (draftRoles[0] ? t('o.oneClickFirst', { name: draftRoles[0].name }) : t('o.oneClickAuto')))),
React.createElement('div', { style: { fontSize: 11, opacity: 0.6, marginBottom: 8 } }, teamMsg || t('o.oneClickHint', { name: STATE.getName(sid) || t('o.currentTeam') })),
draftLeaderRec
? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, marginBottom: 4, border: '1px solid rgba(234,179,8,0.5)', background: 'rgba(234,179,8,0.1)', fontSize: 12 } },
React.createElement('span', { style: { fontSize: 15 } }, '👑'),
React.createElement('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, draftLeaderRec.name),
React.createElement('span', { style: { opacity: 0.7, fontSize: 11 } }, t('o.leaderTag'))
)
: null,
draftRoles.length > 0
? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, maxHeight: 52, overflowY: 'auto' } },
draftRoles.map(function (r) {
return React.createElement('span', { key: r.key, title: r.name, style: { fontSize: 12, lineHeight: 1.5 } }, (r.key === draftLeader ? '👑' : '') + r.emoji + ' ' + r.name);
})
)
: null,
React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
React.createElement('button', {
onClick: function () {
STATE.apply(sid || ACTIVE_SID);
var recs = selectedRecords(sid);
if (recs.length > 0) writeComposer(props && props.inputActions, shortInstruction(recs, STATE.getLeader(sid), STATE.getName(sid)));
setPickerOpen(false);
jumpToChat(props);
},
style: { flex: 1, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }
}, t('r.applyChat')),
React.createElement('button', {
onClick: clearSelection,
disabled: draftN === 0,
style: { padding: '8px 14px', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', cursor: draftN > 0 ? 'pointer' : 'not-allowed', opacity: draftN > 0 ? 1 : 0.4, fontSize: 13 }
}, t('cm.clear'))
),
React.createElement(RolePicker, { t: t, sid: sid })
)
: React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },


roles.length === 0
? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', padding: '6px 10px', fontSize: 12, background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
React.createElement('span', null, '👋 ' + t('o.firstRun')),
React.createElement('button', { type: 'button', onClick: gotoPicker, style: { cursor: 'pointer', border: '1px solid var(--px-violet,#7c3aed)', background: 'var(--px-violet,#7c3aed)', color: '#fff', fontFamily: 'inherit', borderRadius: 6, padding: '2px 9px', fontSize: 12 } }, t('o.firstRunPick')))
: null,
React.createElement(OfficeCanvas, { t: t, roles: roles, leader: leader, zoom: zoom, working: running, done: done, page: page, activity: activity, sessionId: sid, onOpenRole: openRoleDetail, onZoom: setZoom, maxPerPage: maxPerPage }))
),

showAvatarBar && roles.length > 0
? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderTop: '1px solid var(--dsw-alias-border-l1, #eee)' } },
roles.length > maxPerPage
? React.createElement('button', { onClick: function () { setPage(Math.max(0, page - 1)); }, disabled: page <= 0, title: t('o.prev'), style: { cursor: page > 0 ? 'pointer' : 'not-allowed', opacity: page > 0 ? 1 : 0.35, border: 'none', background: 'transparent', color: 'inherit', fontSize: 13, padding: '2px 5px', flexShrink: 0 } }, '◀')
: null,
React.createElement('div', { style: { flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 54, overflowY: 'auto', minWidth: 0 } },
roles.map(function (r) {
return React.createElement('span', { key: r.key, title: r.name, style: { fontSize: 15, lineHeight: 1.4, cursor: 'default' } }, (r.key === leader ? '👑' : '') + r.emoji);
})
),
roles.length > maxPerPage
? React.createElement('button', { onClick: function () { setPage(Math.min(Math.ceil(roles.length / maxPerPage) - 1, page + 1)); }, disabled: page >= Math.ceil(roles.length / maxPerPage) - 1, title: t('o.next'), style: { cursor: page < Math.ceil(roles.length / maxPerPage) - 1 ? 'pointer' : 'not-allowed', opacity: page < Math.ceil(roles.length / maxPerPage) - 1 ? 1 : 0.35, border: 'none', background: 'transparent', color: 'inherit', fontSize: 13, padding: '2px 5px', flexShrink: 0 } }, '▶')
: null
)
: null,
React.createElement('div', {
onMouseDown: onResizeDown, title: t('o.foldCanvas'),
style: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, var(--dsw-alias-border-l2, #999) 50%)' }
}),
pixBoundary('角色详情弹窗', renderRoleModal(roleDetail, roleDetailLoading, setRoleDetail, t))
);
}


function WorkingRolesView(props) {
useRolesStore();   
var inputActions = props && props.inputActions;
var t = safeT((props && props.t) || _tFallback);


var sid = (props && props.sessionId) || ACTIVE_SID;
var lang = useSystemLang();
var [q, setQ] = React.useState('');
var [div, setDiv] = React.useState('all');
var [customRoles, setCustomRoles] = React.useState([]);
var [rolePanel, setRolePanel] = React.useState('');
var [newRoleName, setNewRoleName] = React.useState('');
var [newRoleDesc, setNewRoleDesc] = React.useState('');
var [roleMsg, setRoleMsg] = React.useState('');
var [generating, setGenerating] = React.useState(false);
var [deleteRoleId, setDeleteRoleId] = React.useState(null);
var importRef = React.useRef(null);
var ROLE_NAME_POOL = ['数据安全官', '产品增长师', '架构评审官', '质量门禁官', '运营策略师', '用户体验顾问', '技术文档官', '合规审计师', '性能优化师', '知识管理官', 'DevOps 工程师', 'Prompt 工程师', '数据可视化专家', '自动化测试专家'];
function randomRoleName() {
setNewRoleName(ROLE_NAME_POOL[Math.floor(Math.random() * ROLE_NAME_POOL.length)]);
}
function reloadCustom() {
fetch('/agents-pixe/roles/custom').then(function (r) { return r.json(); }).then(function (d) {
if (d && Array.isArray(d.roles)) { setCustomRoles(d.roles); _CUSTOM_ROLES_CACHE = d.roles; mergeCustomRoles(d.roles); }
}).catch(function () {});
}
React.useEffect(function () { reloadCustom(); }, []);
function doGenerateRole() {
if (!newRoleName.trim()) { setRoleMsg(t('r.errNameEmpty')); return; }
if (generating) return; 
setGenerating(true);
setRoleMsg(t('r.msgGenerating'));
fetch('/agents-pixe/roles/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: newRoleName.trim(), description: newRoleDesc.trim(), lang: (typeof systemLang === 'function' ? systemLang() : 'zh') }) })
.then(function (r) { return r.json(); }).then(function (d) {
if (d.ok === false) { setRoleMsg('❌ ' + d.error); return; }
setRoleMsg(t('r.msgCreated', { name: d.role.name }));
setNewRoleName(''); setNewRoleDesc('');
reloadCustom();
}).catch(function (e) { setRoleMsg('❌ ' + String((e && e.message) || e)); })
.then(function () { setGenerating(false); });
}
function doDeleteRole(id) {
fetch('/agents-pixe/roles/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: id }) })
.then(function (r) { return r.json(); }).then(function (d) {
setDeleteRoleId(null);
if (d.ok === false) { setRoleMsg(t('r.msgDeleteFail', { err: d.error })); return; }
setRoleMsg(t('r.msgDeleted', { n: d.remaining }));
reloadCustom();
}).catch(function (e) { setDeleteRoleId(null); setRoleMsg('❌ ' + String((e && e.message) || e)); });
}
function doImportRoleFile(file) {
if (!file) return;
var reader = new FileReader();
reader.onload = function () {
setRoleMsg(t('r.msgImporting'));
fetch('/agents-pixe/roles/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: String(reader.result || '') }) })
.then(function (r) { return r.json(); }).then(function (d) {
if (d.ok === false) { setRoleMsg('❌ ' + d.error); return; }
setRoleMsg(t('r.msgImported', { name: d.role.name }));
reloadCustom();
}).catch(function (e) { setRoleMsg('❌ ' + String((e && e.message) || e)); });
};
reader.readAsText(file);
}
var [selected, setSelected] = React.useState(selectedRecords(sid));
var [leader, setLeader] = React.useState(STATE.getLeader(sid));
var [teams, setTeams] = React.useState(TEAMS.list());
var [teamName, setTeamName] = React.useState(STATE.getName(sid));
var [saveName, setSaveName] = React.useState('');
var [memberSearch, setMemberSearch] = React.useState('');
var [collapsedDivs, setCollapsedDivs] = React.useState({});
var [allPresets, setAllPresets] = React.useState(false);   
var [focusIdx, setFocusIdx] = React.useState(-1);          
var searchRef = React.useRef(null);
var cardRefs = React.useRef({});
var keyRef = React.useRef(null);
var [aiOn, setAiOn] = React.useState(CHAT_AI.isOn());
var [models, setModels] = React.useState([]);
var [cfg, setCfg] = React.useState(CHAT_CFG.get());
var [stats, setStats] = React.useState({ calls: 0, fails: 0, budgeted: 0, cached: 0, tokens: { in: 0, out: 0, est: 0 } });
var listRef = React.useRef(null);


function scrollTopAll(el) {
if (!el) return;
el.scrollTop = 0;
var p = el.parentElement;
while (p) { if (p.scrollTop && p.scrollTop > 0) p.scrollTop = 0; p = p.parentElement; }
}
React.useLayoutEffect(function () { scrollTopAll(listRef.current); }, [sid, div, lang, q]);

React.useEffect(function () {
var el = listRef.current;
if (!el || typeof IntersectionObserver === 'undefined') return;
var io = new IntersectionObserver(function (entries) {
for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) scrollTopAll(el);
});
io.observe(el);
return function () { io.disconnect(); };
}, [sid]);

React.useEffect(function () {
ACTIVE_SID = sid;
var u1 = STATE.subscribe(function () { setSelected(selectedRecords(sid)); setLeader(STATE.getLeader(sid)); setTeamName(STATE.getName(sid)); });
var u2 = TEAMS.subscribe(function () { setTeams(TEAMS.list()); });
var u3 = CHAT_AI.subscribe(function () { setAiOn(CHAT_AI.isOn()); });
var u4 = CHAT_CFG.subscribe(function () { setCfg(CHAT_CFG.get()); });
return function () { u1(); u2(); u3(); u4(); };
}, [sid]);


React.useEffect(function () {
if (!aiOn) return;
fetchModels().then(function (m) { setModels(m); });
}, [aiOn]);


React.useEffect(function () {
if (!aiOn) { setStats({ calls: 0, fails: 0 }); return; }
fetchStats().then(setStats);
var t = setInterval(function () { fetchStats().then(setStats); }, 5000);
return function () { clearInterval(t); };
}, [aiOn]);

var roles = (lang === 'zh' ? ROLES_DATA.zh.roles : ROLES_DATA.en.roles).concat(
customRoles.map(function (r) { return { id: r.id, div: 'custom', name: r.name, cname: r.name, emoji: r.emoji || '🧑', color: r.color || '#8b5cf6', desc: r.description || '' }; })
);
var divs = Object.assign({}, (lang === 'zh' ? ROLES_DATA.zh.divisions : ROLES_DATA.en.divisions), { custom: { label: t('r.custom'), color: '#8b5cf6' } });
var query = q.trim().toLowerCase();

var divList = [{ key: 'all', label: t('r.all'), color: '#8b93a3', count: roles.length }];
Object.keys(divs).forEach(function (d) {
var cnt = 0; roles.forEach(function (r) { if (r.div === d) cnt++; });
divList.push({ key: d, label: (divs[d] && divs[d].label) || d, color: (divs[d] && divs[d].color) || '#888', count: cnt });
});
var shown = roles.filter(function (r) {
var inDiv = div === 'all' || r.div === div;
var inQuery = query === '' || String(r.name).toLowerCase().indexOf(query) >= 0 || String(r.cname || '').toLowerCase().indexOf(query) >= 0 || String(r.desc).toLowerCase().indexOf(query) >= 0;
return inDiv && inQuery;
});
var roleInf = useInfiniteScroll(shown.length);
React.useEffect(function () { roleInf.setLimit(60); }, [sid, div, lang, q]);

var leaderRec = leader ? INDEX.map[leader] : null;
var members = selected.filter(function (r) { return r.key !== leader; });
var memberQ = memberSearch.trim().toLowerCase();
var visibleMembers = members.filter(function (m) { return memberQ === '' || String(m.name).toLowerCase().indexOf(memberQ) >= 0 || String(m.cname || '').toLowerCase().indexOf(memberQ) >= 0; });
var memberDivOrder = [];
visibleMembers.forEach(function (m) { if (memberDivOrder.indexOf(m.div) < 0) memberDivOrder.push(m.div); });
var memberGroups = memberDivOrder.map(function (d) { return { div: d, label: (divs[d] && divs[d].label) || d, roles: visibleMembers.filter(function (m) { return m.div === d; }) }; });

function toggleRole(rec) {
var key = lang + ':' + rec.id;
if (STATE.hasDraft(key, sid)) STATE.removeDraft(key, sid); else STATE.addDraft(key, sid);
}
function makeLeader(key) { STATE.setLeader(key); }
function clearAll() { STATE.clearDraft(sid); STATE.clearActive(sid); }
function loadTeam(t) {
STATE.clearDraft(sid);
var leaderKey = null;
function toKey(idOrKey) { return String(idOrKey).indexOf(':') >= 0 ? idOrKey : lang + ':' + idOrKey; }
(t.roles || []).forEach(function (r) {
var key = toKey(r);
if (INDEX.map[key]) { STATE.addDraft(key, sid); if (toKey(t.leader) === key) leaderKey = key; }
});
STATE.setLeader(leaderKey, sid);
STATE.setName(t.name, sid);
}
function saveCurrent() {
var nm = saveName.trim();
if (!nm || STATE.getDraft(sid).length === 0) return;
TEAMS.save(nm, STATE.getLeader(sid), STATE.getDraft(sid));
STATE.setName(nm, sid);
setSaveName('');
}
function removeTeam(name) { TEAMS.remove(name); if (STATE.getName(sid) === name) STATE.setName('', sid); }
function applyToChat() {
STATE.apply(sid);
var recs = selectedRecords(sid);
if (inputActions && recs.length > 0) inputActions.setDraft(shortInstruction(recs, STATE.getLeader(sid), STATE.getName(sid)));
jumpToChat(props);
}

function oneClickTeam() {
var recs = selectedRecords(sid);
if (recs.length === 0) return;
STATE.apply(sid);
var name = STATE.getName(sid) || '';

var instr = name ? _tFallback('inst.oneClick', { name: name }) : _tFallback('inst.oneClickOffice');
if (inputActions && typeof inputActions.setDraft === 'function') inputActions.setDraft(instr);
else fillInput(instr);
jumpToChat(props);
}






function pixVisible() {
var el = listRef.current;
if (!el || !el.isConnected) return false;
var r = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
if (!r || r.width <= 0 || r.height <= 0) return false;      
if (typeof window !== 'undefined' && window.getComputedStyle) {
var cs = window.getComputedStyle(el);
if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none')) return false;
}
return true;
}
function moveCardFocus(i) {
var n = shown.length;
if (n === 0) return;
var k = Math.max(0, Math.min(n - 1, i));
setFocusIdx(k);
var el = cardRefs.current[k];
if (el && typeof el.focus === 'function') el.focus();
if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
}
function onGlobalKey(e) {
if (!e || !pixVisible()) return;
var tag = String((e.target && e.target.tagName) || '').toUpperCase();
var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
if (e.key === '/' && !typing) { e.preventDefault(); if (searchRef.current) searchRef.current.focus(); return; }
if (e.key === 'Escape') {


var inSearch = !!(searchRef.current && document.activeElement === searchRef.current);
if (inSearch) { if (q) setQ(''); else searchRef.current.blur(); return; }
if (!typing && q) setQ('');
return;
}
if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

if (tag === 'BUTTON' || tag === 'A') return;
if (e.key === 'Enter') { if (selected.length > 0) { e.preventDefault(); oneClickTeam(); } return; }
if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveCardFocus(focusIdx + 1); return; }
if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveCardFocus(focusIdx - 1); return; }
if (e.key === ' ' || e.key === 'Spacebar') {
if (focusIdx < 0 || !shown[focusIdx]) return;   
e.preventDefault();
toggleRole(shown[focusIdx]);
}
}


React.useLayoutEffect(function () { keyRef.current = onGlobalKey; });
React.useEffect(function () {
function onKey(e) { if (keyRef.current) keyRef.current(e); }
window.addEventListener('keydown', onKey);
return function () { window.removeEventListener('keydown', onKey); };
}, []);

var btnBase = { cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary)' };
var chipBase = { cursor: 'pointer', borderRadius: 14, padding: '3px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 };

var modelOptions = [];
(models || []).forEach(function (p) {
(p.models || []).forEach(function (m) { modelOptions.push({ key: p.provider + '/' + m.id, label: (p.name || p.provider) + ' · ' + m.name }); });
});
var cfgModelKey = cfg.model ? cfg.model.provider + '/' + cfg.model.model : '';

return React.createElement('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--dsw-alias-bg-base, #fff)', color: 'var(--dsw-alias-label-primary)' } },
React.createElement('div', { style: { padding: '14px 16px 10px', flexShrink: 0 } },
React.createElement('div', { style: { fontSize: 16, fontWeight: 700, marginBottom: 2 } }, t('r.title')),
React.createElement('div', { style: { fontSize: 12, opacity: 0.85, marginBottom: 10 } }, t('r.desc')),
React.createElement(RolesLoadHint, { t: t }),

React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
React.createElement('button', { onClick: function () { setRolePanel(rolePanel === 'create' ? '' : 'create'); }, style: btnBase }, t('r.newRole')),
React.createElement('button', { onClick: function () { if (importRef && importRef.current) importRef.current.click(); }, style: btnBase }, t('r.importMd')),
React.createElement('input', { ref: importRef, type: 'file', accept: '.md,text/markdown', style: { display: 'none' }, onChange: function (e) { doImportRoleFile(e.target.files && e.target.files[0]); e.target.value = ''; } })
),
rolePanel === 'create'
? React.createElement('div', { style: { border: '1px dashed var(--dsw-alias-border-l1, #ccc)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 12 } },
React.createElement('div', { style: { fontWeight: 700, marginBottom: 6 } }, t('r.createTitle')),
React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 6 } },
React.createElement('input', { value: newRoleName, onChange: function (e) { setNewRoleName(e.target.value); }, placeholder: t('r.roleNamePh'), style: { flex: 1, padding: '6px 10px', borderRadius: 7, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit' } }),
React.createElement('button', { onClick: randomRoleName, style: btnBase, title: t('r.randomTitle') }, t('r.random')),
React.createElement('input', { value: newRoleDesc, onChange: function (e) { setNewRoleDesc(e.target.value); }, placeholder: t('r.roleDescPh'), style: { flex: 2, padding: '6px 10px', borderRadius: 7, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit' } }),
React.createElement('button', { onClick: doGenerateRole, disabled: generating, style: { background: generating ? '#94a3b8' : '#2563eb', color: '#fff', borderRadius: 7, padding: '6px 14px', border: 'none', cursor: generating ? 'not-allowed' : 'pointer' } }, generating ? t('r.generating') : t('r.generate'))
),
roleMsg ? React.createElement('div', { style: { fontSize: 11, opacity: 0.8 } }, roleMsg) : null,

customRoles && customRoles.length ? React.createElement('div', { style: { marginTop: 8, borderTop: '1px solid var(--dsw-alias-border-l1, #eee)', paddingTop: 8 } },
React.createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, t('r.myCustom', { n: customRoles.length })),
customRoles.map(function (r) {
return React.createElement('div', { key: r.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' } },
React.createElement('span', { style: { marginRight: 4 } }, r.emoji || '🧑'),
React.createElement('span', { style: { flex: 1 } }, r.name),
deleteRoleId === r.id
? React.createElement('span', { style: { display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: '#dc2626' } },
React.createElement('span', {}, t('r.delConfirm')),
React.createElement('button', { style: btnBase, onClick: function () { doDeleteRole(r.id); } }, t('cm.confirm')),
React.createElement('button', { style: btnBase, onClick: function () { setDeleteRoleId(null); } }, t('cm.cancel'))
)
: React.createElement('button', { style: Object.assign({}, btnBase, { color: '#dc2626', borderColor: '#fca5a5' }), onClick: function () { setDeleteRoleId(r.id); } }, t('r.delBtn'))
);
})
) : null
)
: null,
React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
React.createElement('input', { ref: searchRef, value: q, onChange: function (e) { setQ(e.target.value); }, placeholder: t('r.searchRoles'), title: t('r.keysHint'), style: { flex: 1, maxWidth: 340, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit' } }),
React.createElement('div', { style: { flex: 1 } }),
React.createElement('button', { onClick: oneClickTeam, title: t('r.oneClickTitle'), disabled: selected.length === 0, style: { background: selected.length === 0 ? 'rgba(120,120,120,0.25)' : '#7c3aed', color: selected.length === 0 ? 'rgba(120,120,120,0.6)' : '#ffffff', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: selected.length === 0 ? 'default' : 'pointer', flexShrink: 0 } }, t('r.oneClick')),
React.createElement('button', { onClick: applyToChat, style: { background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: 13, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)', flexShrink: 0 } }, t('r.applyChatN', { n: selected.length }))
)
),
React.createElement('div', { style: { flex: 1, minHeight: 0, display: 'flex' } },
React.createElement('div', { style: { width: 168, minHeight: 0, flexShrink: 0, borderRight: '1px solid var(--dsw-alias-border-l1, #eee)', overflowY: 'auto', padding: '8px 6px' } },
divList.map(function (d) {
var active = div === d.key;
return React.createElement('div', { key: d.key, onClick: function () { setDiv(d.key); }, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: active ? 'rgba(59,130,246,0.16)' : 'transparent', fontWeight: active ? 700 : 400, marginBottom: 2 } },
React.createElement('span', { style: { width: 10, height: 10, borderRadius: 5, background: d.color, flexShrink: 0 } }),
React.createElement('span', { style: { flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, d.label),
React.createElement('span', { style: { fontSize: 11, opacity: 0.85 } }, d.count)
);
})
),
React.createElement('div', { ref: listRef, key: sid + ':' + div + ':' + lang, style: { flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', padding: '10px 12px' } },
shown.length === 0
? React.createElement('div', { style: { padding: 24, textAlign: 'center', fontSize: 13, opacity: 0.85 } }, t('r.noMatch'))
: React.createElement('div', {},
React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' } },
shown.slice(0, roleInf.limit).map(function (r, i) {
var key = lang + ':' + r.id;
var on = STATE.hasDraft(key, sid);
var focused = i === focusIdx;
return React.createElement('div', {
key: key,
ref: function (el) { if (el) cardRefs.current[i] = el; else delete cardRefs.current[i]; },


tabIndex: (focusIdx < 0 || focusIdx >= shown.length ? i === 0 : focused) ? 0 : -1,
onFocus: function () { setFocusIdx(i); },
onBlur: function () { setFocusIdx(function (p) { return p === i ? -1 : p; }); },
onClick: function () { setFocusIdx(i); toggleRole(r); },
title: r.desc,
style: { width: 150, boxSizing: 'border-box', borderRadius: 10, padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, outline: focused ? '2px solid #7c3aed' : 'none', outlineOffset: 1, border: on ? '1px solid rgba(59,130,246,0.6)' : '1px solid var(--dsw-alias-border-l1, #eee)', background: on ? 'rgba(59,130,246,0.12)' : 'var(--dsw-alias-bg-layer-1, #fff)' } },
React.createElement('span', { style: { fontSize: 26, lineHeight: 1 } }, r.emoji),
React.createElement('span', { style: { fontSize: 12, fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' } }, r.name),
React.createElement('span', { style: { fontSize: 11, opacity: 0.75, textAlign: 'center' } }, r.cname || ''),
React.createElement('span', { style: { fontSize: 11, opacity: on ? 1 : 0.85 } }, on ? t('r.selected') : t('r.add'))
);
})
),
React.createElement(InfiniteFooter, { inf: roleInf, label: t('r.rolesUnit') })
)
),
React.createElement('div', { style: { width: 300, minHeight: 0, flexShrink: 0, borderLeft: '1px solid var(--dsw-alias-border-l1, #eee)', padding: '10px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column' } },
React.createElement('div', { style: { fontSize: 14, fontWeight: 700, marginBottom: 8 } }, t('r.teamPanel', { n: selected.length })),
React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
React.createElement('span', { style: { fontSize: 12, fontWeight: 700, opacity: 0.92 } }, t('r.recTeams')),
React.createElement('span', { onClick: function () { setAllPresets(!allPresets); }, style: { marginLeft: 'auto', cursor: 'pointer', fontSize: 11, opacity: 0.8, userSelect: 'none' } }, allPresets ? t('r.presetLess') : t('r.presetMore', { n: PRESETS.length }))
),
React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 } },
(allPresets ? PRESETS : PRESETS.slice(0, 6)).map(function (p) { return React.createElement('span', { key: p.name, onClick: function () { loadTeam(p); }, style: chipBase }, '⭐ ' + presetLabel(p)); })
),
teams.length > 0
? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 } },
teams.map(function (t) {
return React.createElement('span', { key: t.name, onClick: function () { loadTeam(t); }, style: chipBase },
'💾 ' + t.name,
React.createElement('span', { onClick: function (e) { e.stopPropagation(); removeTeam(t.name); }, title: t('cm.delete'), style: { opacity: 0.7, marginLeft: 2 } }, '✕'));
})
)
: null,
React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 10 } },
React.createElement('input', { value: saveName, onChange: function (e) { setSaveName(e.target.value); }, placeholder: t('r.saveTeamPh'), style: { flex: 1, minWidth: 0, padding: '5px 9px', borderRadius: 7, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit', fontSize: 12 } }),
React.createElement('button', { onClick: saveCurrent, disabled: !saveName.trim() || selected.length === 0, style: Object.assign({}, btnBase, { opacity: saveName.trim() && selected.length ? 1 : 0.5, cursor: saveName.trim() && selected.length ? 'pointer' : 'not-allowed' }) }, t('cm.save'))
),
leaderRec
? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(234,179,8,0.6)', background: 'rgba(234,179,8,0.12)' } },
React.createElement('span', { style: { fontSize: 20 } }, '👑'),
React.createElement('div', { style: { flex: 1, minWidth: 0 } },
React.createElement('div', { style: { fontSize: 13, fontWeight: 700 } }, leaderRec.name),
React.createElement('div', { style: { fontSize: 11, opacity: 0.85 } }, t('r.leaderCard'))
),
React.createElement('button', { onClick: function () { STATE.clearLeader(sid); }, style: btnBase }, t('cm.cancel'))
)
: React.createElement('div', { style: { fontSize: 12, opacity: 0.85, padding: '8px 10px', borderRadius: 8, border: '1px dashed var(--dsw-alias-border-l2, #ccc)', marginBottom: 8 } }, t('r.leaderHint')),
selected.length === 0
? React.createElement('div', { style: { fontSize: 12, opacity: 0.85, padding: 12, textAlign: 'center' } }, t('r.noMembers'))
: React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: 0 } },
members.length > 5
? React.createElement('input', { value: memberSearch, onChange: function (e) { setMemberSearch(e.target.value); }, placeholder: t('r.searchMember'), style: { padding: '5px 9px', borderRadius: 7, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit', fontSize: 12, marginBottom: 6 } })
: null,
memberGroups.length === 0
? React.createElement('div', { style: { fontSize: 12, opacity: 0.85, padding: 10, textAlign: 'center' } }, t('r.noMatchMember'))
: memberGroups.map(function (g) {
var isCollapsed = collapsedDivs[g.div] === true;
return React.createElement('div', { key: g.div, style: { marginBottom: 4 } },
React.createElement('div', { onClick: function () { var n = Object.assign({}, collapsedDivs); n[g.div] = !isCollapsed; setCollapsedDivs(n); }, style: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 700, opacity: 0.9, userSelect: 'none' } },
React.createElement('span', { style: { fontSize: 10 } }, isCollapsed ? '▸' : '▾'),
React.createElement('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, g.label),
React.createElement('span', { style: { fontSize: 11, opacity: 0.85 } }, g.roles.length)
),
isCollapsed ? null : g.roles.map(function (m) {
return React.createElement('div', { key: m.key, style: { display: 'flex', alignItems: 'center', gap: 7, padding: '4px 6px', borderRadius: 7, marginBottom: 2, background: 'var(--dsw-alias-bg-layer-1, #fff)', fontSize: 12 } },
React.createElement('span', { style: { fontSize: 15, width: 22, textAlign: 'center' } }, m.emoji),
React.createElement('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.name),
React.createElement('button', { onClick: function () { makeLeader(m.key); }, style: Object.assign({}, btnBase, { padding: '2px 7px', fontSize: 11 }) }, t('r.setLeader')),
React.createElement('button', { onClick: function () { STATE.removeDraft(m.key, sid); }, style: Object.assign({}, btnBase, { padding: '2px 7px', fontSize: 11 }) }, '✕')
);
})
);
})
),
React.createElement('div', { style: { flex: 1 } }),


React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--dsw-alias-border-l1, #eee)' } },
React.createElement('button', { onClick: clearAll, disabled: selected.length === 0, style: Object.assign({}, btnBase, { flex: 1, opacity: selected.length ? 1 : 0.5, cursor: selected.length ? 'pointer' : 'not-allowed' }) }, t('cm.clear'))
)
)
)
);
}


function PixeSettingsSection(props) {

var scope = props.scope;

var t = safeT((props && props.t) || _tFallback);

var [scopeValue, setScopeValue] = React.useState(function () {

return (scope && scope.getSnapshot && scope.getSnapshot().value) || {};

});

React.useEffect(function () {

if (!scope) return;

var update = function () { setScopeValue((scope.getSnapshot && scope.getSnapshot().value) || {}); };

var unsub = (scope.subscribe && scope.subscribe(update)) || function () {};

update();

return unsub;

}, [scope]);

var [aiOn, setAiOn] = React.useState(function () { return CHAT_AI.isOn(); });

var [cfgVersion, setCfgVersion] = React.useState(0);

React.useEffect(function () { return CHAT_AI.subscribe(function () { setAiOn(CHAT_AI.isOn()); }); }, []);

React.useEffect(function () { return CHAT_CFG.subscribe(function () { setCfgVersion(function (v) { return v + 1; }); }); }, []);

var value = scopeValue;

var enabled = value.enabled === true;

var row = function (label, hint, checked, onChange) {

return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },

React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },

React.createElement('span', { style: { fontWeight: 600 } }, label),

React.createElement('span', { style: { fontSize: 12, opacity: 0.6 } }, hint)),

React.createElement('button', {

onClick: function () { onChange(!checked); }, 'aria-pressed': checked,

style: { minWidth: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? '#10b981' : 'rgba(120,120,120,0.3)', position: 'relative', transition: 'background 0.2s ease' }

}, React.createElement('span', { style: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', left: checked ? 22 : 2, transition: 'left 0.2s ease' } }))

);

};

var cfg = CHAT_CFG.get();

var freqLabel = { low: t('st.freqLow'), medium: t('st.freqMedium'), high: t('st.freqHigh') }[cfg.freq] || t('st.freqFallback');

return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18, padding: 16, maxWidth: 560, minHeight: 260 } },

row(t('st.toolRoles'), t('st.toolRolesHint'), enabled, function (v) { if (scope) scope.set('enabled', v); setScopeValue({ ...value, enabled: v }); }),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },

React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },

React.createElement('span', { style: { fontWeight: 600 } }, t('st.cardMode')),

React.createElement('span', { style: { fontSize: 12, opacity: 0.6 } }, t('st.cardModeHint'))),

React.createElement('div', { style: { display: 'flex', gap: 6 } },

['full', 'rules', 'deliverables'].map(function (m) {

var labels = { full: t('st.cardModeFull'), rules: t('st.cardModeRules'), deliverables: t('st.cardModeDeliv') };

var active = (value.cardMode || 'full') === m;

return React.createElement('button', { key: m, onClick: function () { if (scope) scope.set('cardMode', m); setScopeValue({ ...value, cardMode: m }); }, 'aria-pressed': active,

style: { cursor: 'pointer', padding: '5px 10px', borderRadius: 7, fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: active ? '#2563eb' : 'var(--dsw-alias-bg-layer-1,#fff)', color: active ? '#fff' : 'var(--dsw-alias-label-primary)' } }, labels[m]);

}))),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },

React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },

React.createElement('span', { style: { fontWeight: 600 } }, t('st.memberCard')),

React.createElement('span', { style: { fontSize: 12, opacity: 0.6 } }, t('st.memberCardHint'))),

React.createElement('div', { style: { display: 'flex', gap: 6 } },

['key', 'full'].map(function (m) {

var labels = { key: t('st.memberCardKey'), full: t('st.memberCardFull') };

var active = (value.memberCardMode || 'key') === m;

return React.createElement('button', { key: m, onClick: function () { if (scope) scope.set('memberCardMode', m); setScopeValue({ ...value, memberCardMode: m }); }, 'aria-pressed': active,

style: { cursor: 'pointer', padding: '5px 10px', borderRadius: 7, fontSize: 12, border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: active ? '#2563eb' : 'var(--dsw-alias-bg-layer-1,#fff)', color: active ? '#fff' : 'var(--dsw-alias-label-primary)' } }, labels[m]);

}))),

React.createElement('div', { style: { fontSize: 12, opacity: 0.55, lineHeight: 1.7 } },

React.createElement('div', null, t('st.tip1')),

React.createElement('div', null, t('st.tip2')),

React.createElement('div', null, t('st.tip3')),

React.createElement('div', null, t('st.tip4'))),

React.createElement('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2, #eee)', paddingTop: 14, fontSize: 13, fontWeight: 700 } }, t('st.aiHeader')),

row(t('st.aiChat'), t('st.aiChatHint'), aiOn, function (v) { CHAT_AI.set(v); }),

row(t('st.freq'), t('st.freqNow', { now: freqLabel }), cfg.freq === 'high', function () {

var next = cfg.freq === 'low' ? 'medium' : (cfg.freq === 'medium' ? 'high' : 'low');

CHAT_CFG.setFreq(next);

}),

row(t('st.thinking'), t('st.thinkingHint'), cfg.thinking === true, function (v) { CHAT_CFG.setThinking(v); }),

React.createElement('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2, #eee)', paddingTop: 14, fontSize: 13, fontWeight: 700 } }, t('st.officeHeader')),

React.createElement('div', { style: { fontSize: 12, opacity: 0.55, lineHeight: 1.6, marginTop: 4 } }, t('st.officeDesc')),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },

React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },

React.createElement('span', { style: { fontWeight: 600 } }, t('st.officeZoom')),

React.createElement('span', { style: { fontSize: 12, opacity: 0.6 } }, t('st.officeZoomHint'))),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },

React.createElement('input', {

type: 'range', min: 0.5, max: 2.5, step: 0.05,

value: typeof value.zoom === 'number' ? value.zoom : 1.35,

onChange: function (e) { if (scope) scope.set('zoom', Number(e.target.value)); setScopeValue({ ...value, zoom: Number(e.target.value) }); },

style: { width: 180, accentColor: '#2563eb' }

}),

React.createElement('span', { style: { fontSize: 12, fontVariantNumeric: 'tabular-nums', minWidth: 42, textAlign: 'right', opacity: 0.85 } },

(typeof value.zoom === 'number' ? value.zoom : 1.35).toFixed(2) + '×')

)

),

row(t('st.officeAvatarBar'), t('st.officeAvatarBarHint'), value.showAvatarBar !== false, function (v) { if (scope) scope.set('showAvatarBar', v); setScopeValue({ ...value, showAvatarBar: v }); }),

React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },

React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },

React.createElement('span', { style: { fontWeight: 600 } }, t('st.officeMaxPerPage')),

React.createElement('span', { style: { fontSize: 12, opacity: 0.6 } }, t('st.officeMaxPerPageHint'))),

React.createElement('input', {

type: 'number', min: 4, max: 16, step: 1,

value: typeof value.maxPerPage === 'number' ? value.maxPerPage : 8,

onChange: function (e) { var n = Number(e.target.value); if (scope && !isNaN(n)) scope.set('maxPerPage', Math.max(4, Math.min(16, Math.round(n)))); setScopeValue({ ...value, maxPerPage: Math.max(4, Math.min(16, Math.round(n))) }); },

style: { width: 72, padding: '4px 8px', borderRadius: 7, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'inherit', fontSize: 13, textAlign: 'center' }

})

)

);

}




function apply(ctx) {
var slots = ctx.get('slots');
if (slots === undefined) return;
SESSIONS_SVC = ctx.get('sessions');
TIMER_SVC = ctx.get('timer');
LOCALE_SVC = ctx.get('locale');


var reg = function (label, fn) {
if (ctx && typeof ctx.effect === 'function') { return ctx.effect(fn, label); }
return fn();
};



reg('agents-pixe: locale', function () {
if (LOCALE_SVC && typeof LOCALE_SVC.register === 'function') {


try { LOCALE_SVC.register(LOCALE_NS, LOCALE); }
catch (e) {
try { console.error('[agents-pixe] locale.register(' + LOCALE_NS + ') 失败（zh/en 键集可能不一致）：\n', e && (e.stack || e.message || e)); } catch (_) {}
}
}
});
var t = (LOCALE_SVC && typeof LOCALE_SVC.bind === 'function') ? LOCALE_SVC.bind(LOCALE_NS) : _tFallback;



if (LOCALE_SVC && typeof LOCALE_SVC.subscribe === 'function') {
var writeLang = function () {
try {
var lc = String(LOCALE_SVC.getSnapshot().active || 'zh').toLowerCase();
var cur = lc.indexOf('en') === 0 ? 'en' : 'zh';
try { localStorage.setItem('agents-pixe.lang.v1', cur); } catch (e) {

try { console.warn('[agents-pixe] localStorage 写入 agents-pixe.lang.v1 失败：', e && (e.message || e)); } catch (_) {}
}
schedulePersistSync();
} catch (e) {
try { console.warn('[agents-pixe] writeLang 失败（宿主 memberLang 仍可能返回 zh）：', e && (e.message || e)); } catch (_) {}
}
};
writeLang();
LOCALE_SVC.subscribe(writeLang);
}








function safeLabel(key, fallback) {
return function () { try { var v = t(key); return v && v !== key ? v : fallback; } catch (e) { try { console.warn('[agents-pixe] label(' + key + ') 解析失败，回退原文：', e && (e.message || e)); } catch (_) {} return fallback; } };
}
function safeInject(fn, fallback) {
return function () { try { var r = fn.apply(this, arguments); return r == null ? (fallback || {}) : r; } catch (e) { try { console.warn('[agents-pixe] inject face 抛错，回退空对象：', e && (e.message || e)); } catch (_) {} return fallback || {}; } };
}
function safeSlotInject(slotKey, cb) {
return function () {
try { return cb.apply(this, arguments); }
catch (e) {
try { console.error('[agents-pixe] ' + slotKey + ' 整条注册失败（slot 静默丢失，根因见下）：\n', e && (e.stack || e.message || e)); } catch (_) {}
return undefined; 
}
};
}

reg('agents-pixe: conversation.view', function () {
slots.inject('conversation.view', safeSlotInject('conversation.view', function () {
return slots.register(
{ name: 'conversation.view', id: 'agents-pixe', order: 20,
label: safeLabel('s.roles.label', 'Working Roles'),
locale: LOCALE_NS,
inject: safeInject(function (sessionId, actions) {
return { t: t, setView: actions && typeof actions.setView === 'function' ? actions.setView : undefined };
})
},
function (props) { return React.createElement(WorkingRolesView, props); }
);
}));
});




reg('agents-pixe: session header entry', function () {
slots.inject('conversation.session.header.actions', safeSlotInject('conversation.session.header.actions', function () {
return slots.register(
{ name: 'conversation.session.header.actions', id: 'agents-pixe-team-entry', order: 50,
locale: LOCALE_NS,
inject: safeInject(function (sessionId) { return { t: t, sessionId: sessionId }; }, {}) },
function (props) { return React.createElement(SessionTeamEntry, props); }
);
}));
});

reg('agents-pixe: turn tail team card', function () {
slots.inject('conversation.chat.turnTail', safeSlotInject('conversation.chat.turnTail', function () {
return slots.register(
{ name: 'conversation.chat.turnTail', id: 'agents-pixe-team-card', order: 50,
locale: LOCALE_NS,
inject: safeInject(function (sessionId) { return { t: t, sessionId: sessionId }; }, {}) },
function (props) { return React.createElement(TurnTailTeamCard, props); }
);
}));
});




reg('agents-pixe: team tool views', function () {
var offs = [];
PIXE_TOOL_KEYS.forEach(function (toolKey) {
offs.push(slots.inject('tool.call.toolview', safeSlotInject('tool.call.toolview', function () {
return slots.register(
{ name: 'tool.call.toolview', key: toolKey, locale: LOCALE_NS,
inject: safeInject(function () { return { t: t }; }, {}) },
function (props) { return pixBoundary('团队工具卡片', React.createElement(PixeToolView, props)); }
);
})));
});
return function () { offs.forEach(function (off) { try { if (typeof off === 'function') off(); } catch (e) {} }); };
});

reg('agents-pixe: shell.overlay', function () {
slots.inject('shell.overlay', safeSlotInject('shell.overlay', function () {
return slots.register(
{ name: 'shell.overlay', id: 'agents-pixe-office', order: 50,
label: safeLabel('s.office.label', 'Pixel Office'),
locale: LOCALE_NS,
inject: safeInject(function () { return { t: t }; }, {}) },
function (props) { return React.createElement(OfficeOverlay, props); }
);
}));
});





var pixeScope = null;
try {
var settingsService = ctx.get('settingsScope');
if (settingsService && typeof settingsService.bind === 'function') {
pixeScope = settingsService.bind({ namespace: 'agents-pixe' });
}
} catch (e) {
try { console.warn('[agents-pixe] settingsScope 不可用（dsh ≥0.1.7 的预期行为），改用宿主 /agents-pixe/config：\n', e && (e.stack || e.message || e)); } catch (_) {}
}
if (!pixeScope || typeof pixeScope.getSnapshot !== 'function') pixeScope = _PIXE_FALLBACK_SCOPE;
PIXE_SCOPE = pixeScope;
reg('agents-pixe: settings.section', function () {
slots.inject('settings.section', safeSlotInject('settings.section', function () {
return slots.register(
{ name: 'settings.section', id: 'agents-pixe', order: 20,
label: safeLabel('st.nav', '角色办公室'),
locale: LOCALE_NS,
inject: safeInject(function () { return { t: t, scope: pixeScope }; }, {}) },
function (props) { return React.createElement(PixeSettingsSection, { scope: props && props.scope ? props.scope : pixeScope }); }
);
}));
});
}


exports.apply = apply;





exports.inject = ['slots', 'locale'];
return module.exports;
}
});
