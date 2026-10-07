;
/* agents-pixe 客户端主体：工作角色页签（分部分类/角色网格/团队预设与编排）+ 像素办公室浮层。
 * 状态按会话隔离（每个会话独立 roles/leader/name），办公室跟随当前活动会话。
 * 此文件被 build-client.mjs 拼接到 prelude 之后，并在末尾补 exports.apply。
 * 中英切换：参考 dsh-theme 的做法，注册 agents-pixe 命名空间 zh/en 字典，
 * 设置分区 / 会话页签 / 浮层标签全部走 label: () => t(...)，组件通过
 * `locale: LOCALE_NS` 拿到 t，字符串集中放在 LOCALE.* 里。 */

var LOCALE_NS = 'agents-pixe';

/* 全量 zh 字典（关键值源）+ en 字典。缺失 en 时降级走 zh（fallbackChain）。
 * 按界面分区组织：s(shell/overlay) / r(roles tab) / o(office overlay) /
 * p(picker) / st(settings) / ai(AI chat) / rc(role create/custom) /
 * md(modal) / of(office canvas + greetings) / cm(common)。 */
var LOCALE = {
  zh: {
    /* cm — 通用 */
    'cm.confirm': '确认',
    'cm.cancel': '取消',
    'cm.delete': '删除',
    'cm.save': '保存',
    'cm.clear': '清空',
    'cm.search': '搜索…',
    'cm.close': '关闭',
    'cm.loading': '加载中…',
    'cm.empty': '（无内容）',
    /* s — shell.overlay / conversation.view 标签 */
    's.office.label': '像素办公室',
    's.roles.label': '工作角色',
    /* r — 工作角色页签（WorkingRolesView） */
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
    /* p — 办公室内嵌选人（RolePicker） */
    'p.searchPh': '搜索角色…',
    'p.noMatch': '没有匹配的角色',
    'p.rolesUnit': '个角色',
    /* o — 办公室浮层（OfficeOverlay） */
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
    /* tp — 团队面板（重新设计版：双栏 + 计划闸门 + 状态机文案） */
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
    /* tv — 团队工具在对话里的专用卡片（tool.call.toolview，key = wire 工具名） */
    'tv.preparing': '准备中…',
    'tv.team': '团队编排',
    'tv.roles': '取角色卡',
    'tv.task': '任务板',
    'tv.openPanel': '查看团队',
    'tv.raw': '原始参数与结果',
    'tv.noTeam': '本会话还没有团队快照',
    'tv.rolesHint': '角色卡已返回给模型；正文不在这里重复展开，避免又把 JSON 摊开。',
    'tv.noArgs': '（无参数）',
    /* st — 设置分区（PixeSettingsSection） */
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
    /* st.office — 办公室显示（参考 dsh-theme，把所有配置收进 settings 命名空间） */
    'st.officeHeader': '🏢 办公室显示',
    'st.officeDesc': '像素办公室浮层（Canvas 画布）的外观与分页行为。重启后保留。',
    'st.officeZoom': '默认缩放',
    'st.officeZoomHint': '浮层打开时的画布缩放（0.5× ~ 2.5×）。也可在浮层标题栏临时调。',
    'st.officeAvatarBar': '显示头像条',
    'st.officeAvatarBarHint': '浮层底部一排 emoji 头像 + 分页按钮。关闭后浮层更紧凑。',
    'st.officeMaxPerPage': '每页人数',
    'st.officeMaxPerPageHint': '头像条每页显示的人数（4 ~ 16）。超过自动翻页。',
    /* ai — AI 开关与内置台词 */
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
    /* md — 角色卡详情模态框 */
    'md.loading': '加载角色卡…',
    'md.close': '关闭',
    /* of — 办公室 canvas 状态徽章 / 默认角色名 / 罐头问候 */
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
    /* inst — applyToChat / oneClickTeam 指令文本 */
    'inst.single': '请以「{name}」的角色身份回应。',
    'inst.teamSuffix': '团队',
    'inst.teamFallback': '角色团队',
    'inst.team': '请以「{label}」团队协作回应（{names}）。',
    'inst.oneClick': '让「{name}」团队并行完成：',
    'inst.oneClickOffice': '用我在像素办公室选中的角色组队并行完成：',
    /* inf — 无限滚动 */
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
    /* tp — 团队面板（重新设计版：双栏 + 计划闸门 + 状态机文案） */
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

/* locale 命名空间的 translate 函数：根 zh 为真源，en 缺失时自动回退到 zh。
 * 必须放在 LOCALE 定义后，被所有 t() 调用引用。运行时由 apply() 里替换为
 * ctx.locale.bind(LOCALE_NS) —— 那个版本会自动随 DSH 语言切换 + 订阅重渲染。
 * 此处导出一个 fallback，便于 build 期 / 单测直接引用。 */
function _formatTpl(tpl, params) {
  if (!params) return tpl;
  return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : m; });
}
function _tFallback(key, params) {
  var lc = 'zh';
  try { if (LOCALE_SVC && LOCALE_SVC.getSnapshot) lc = String(LOCALE_SVC.getSnapshot().active || 'zh').toLowerCase(); } catch (e) {}
  var dict = LOCALE[lc] || LOCALE.zh;
  var v = dict[key];
  if (v == null) v = LOCALE.zh[key]; // en 缺失 → 回落到 zh
  if (v == null) return key;
  return _formatTpl(v, params);
}

/* 兼容 DSH 可能返回 raw key 或 undefined 的 t：强制回退到内部 _tFallback。 */
function safeT(t) {
  return function (key, params) {
    var v = null;
    try { v = t ? t(key, params) : null; } catch (e) { v = null; }
    return (v == null || v === key) ? _tFallback(key, params) : v;
  };
}

/* React 错误边界 —— 包在 OfficeOverlay / WorkingRolesView / PixeSettingsSection 的关键
 * 子区域外面。任一子组件 render throw 时（比如 future locale / settings scope 时序坑、
 * 第三方 React 行为变更、用户上传的角色 markdown 解析异常），只降级那块子区域，不
 * 影响浮层整体可见性。降级 UI 是"⚠ 区域加载失败（控制台 [agents-pixe] 看根因）"。
 * Console 暴露完整 stack，方便定位（之前 React 错误被默认 boundary 吞掉只剩黄色警告行）。
 *
 * 用 React 16+ 标准的 ES6 class + getDerivedStateFromError。React 15 的 React.createClass
 * 已经废弃了，本文件没有 React.createClass fallback（plugin 要求 React 16+）。
 *
 * 兼容：如果宿主提供的 React 镜像没有暴露 `React.Component`（例如轻量 react facade），
 * 不在模块加载期做 `Object.create(React.Component.prototype)`，否则整个 client bundle
 * 会在 boot 时抛错，导致浮层/设置入口全部消失。无错误边界能力时直接渲染子节点。 */
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
  /* 当前宿主 React 对类式错误边界的识别不稳定：若 PixErrorBoundary 被当成函数组件
   * 调用会返回 undefined，导致 OfficeOverlay 主体整块空白。先直接透传子节点，
   * 保住浮层/设置正常显示；错误边界能力等宿主 React 兼容性明确后再启用。 */
  return children;
}

/* ---------- 通用工具 ---------- */
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

/* ---------- 角色索引（可重建：清单是懒加载来的） ---------- */
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
  mergeCustomRoles(_CUSTOM_ROLES_CACHE);   // 清单重建后把自定义角色补回去
}
var _CUSTOM_ROLES_CACHE = [];

/* 自定义角色（AI 生成 / 导入 md）合并进 INDEX：中英两种 key 都注册，办公室/团队/角色选择共用 */
function mergeCustomRoles(list) {
  (list || []).forEach(function (r) {
    if (!r || !r.id) return;
    ['en', 'zh'].forEach(function (lang) {
      var key = lang + ':' + r.id;
      INDEX.map[key] = { key: key, lang: lang, id: r.id, div: 'custom', name: r.name, cname: r.name, emoji: r.emoji || '🧑', color: r.color || '#8b5cf6', desc: r.description || '', full: r.full };
    });
  });
}

/* ---------- 角色清单存储：宿主一次性下发 + 版本化本地缓存（缓存优先，24h 内不发请求） ---------- */
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
      /* 缓存足够新 → 零请求；否则后台校验一次版本（失败也继续用缓存） */
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
/* 清单未加载完成时，**不得**用「查不到」当作「非法」去剪枝用户的选择（否则会误删已选角色） */
function keyKnown(k) { return !!INDEX.map[k] || !ROLES_STORE.get().loaded; }
/* 清单加载态 UI（工作角色页签与选人面板共用） */
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

/* ---------- 无限滚动：哨兵 + IntersectionObserver（自动跟随任意祖先滚动容器，避免嵌套滚动条/留白） ---------- */
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

/* ---------- 持久化桥：localStorage ↔ 磁盘文件（host 端点），解决随机端口导致 localStorage 丢失 ---------- */
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
/* 页面加载：若本地 localStorage 为空（换了 origin），从磁盘水合回来 */
(function hydrateFromDisk() {
  try {
    if (localStorage.getItem('agents-pixe.state.v4') !== null) return;
    fetch('/agents-pixe/persist')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var entries = (d && d.entries) || {};
        if (!Object.keys(entries).length) return;
        // 只水合白名单内的 key，防止 persist.json 被污染时写入任意 localStorage key
        PERSIST_KEYS.forEach(function (k) { if (entries[k] != null) { try { localStorage.setItem(k, entries[k]); } catch (e) {} } });
        if (entries['agents-pixe.state.v4']) { try { STATE.hydrate(entries['agents-pixe.state.v4']); } catch (e) {} }
        if (entries['agents-pixe.teams.v1']) { try { TEAMS.hydrate(entries['agents-pixe.teams.v1']); } catch (e) {} }
        if (entries['agents-pixe.chatAi.v1']) { try { CHAT_AI.hydrate(entries['agents-pixe.chatAi.v1']); } catch (e) {} }
        if (entries['agents-pixe.chatCfg.v1']) { try { CHAT_CFG.hydrate(entries['agents-pixe.chatCfg.v1']); } catch (e) {} }
      }).catch(function () {});
  } catch (e) {}
})();

/* ---------- 状态：**按会话完全隔离** ----------
 * 每个会话各有一份草稿（draft）与一份已生效名册（active），两者恒等：
 *   active 是给宿主读的别名（宿主按 persist.json 的 sessions[sid].active 组队）；
 *   draft  是给界面读的。A 会话选人不会碰 B 会话。
 *
 * 历史坑：v4 早期 draft 是**全局**的（跨会话共享），于是「A 选 5 个 → 切到 B → B 的页签显示同样 5 个，
 * 一勾就把 A 的阵容写进 B」。现在每个会话一份；旧数据里的全局草稿只在「本次加载的首个会话」播种一次。 */
var STATE = (function () {
  var KEY = 'agents-pixe.state.v4';   /* 键名不变：宿主按这个名字读 sessions[sid].active */
  var legacyDraft = null;             /* 旧版全局草稿，仅用于给首个会话播种 */
  var lastApplied = { roles: [], leader: null };
  var bySession = {};
  var bootInherited = false;          /* 本次加载是否已给首个会话播过种 */
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
      /* 新会话的种子：只在「本次加载的首个会话」沿用最近一次工作配置，其余新会话从空开始，
       * 这样切会话既不会串味，也不会每次开新对话都从头选一遍。 */
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
    /* 旧数据迁移：早期只有 active 没有 draft —— 拿 active 当草稿，行为不变 */
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
  /* 统一写入口：没有实际变化就既不落盘也不通知（避免无谓重渲染）。
   * **没有会话可写时宁可不写** —— 写进「空 sid」桶的话，界面（读真实会话）与宿主都看不到，
   * 表现成「点了没反应」，是最难查的一类 bug（本会话历史上真的出现过这个桶）。 */
  function mut(sid, fn) {
    var key = String(sid || ACTIVE_SID || '');
    if (!key) return;
    var st = sess(key);
    if (fn(st.draft) === false) return;
    sync(st); persist(); notify();
  }
  /* 取当前会话：显式 sid 优先，其次当前活跃会话（读操作共用同一套回落，避免读写落到不同的桶） */
  function cur(sid) { return sess(sid || ACTIVE_SID); }
  return {
    /* —— 每个会话自己的草稿；不传 sid 时落到当前会话 —— */
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
    /* —— 已生效名册：宿主读的就是这份，与本会话草稿恒等 —— */
    getActive: function (sid) { return cur(sid).active.slice().filter(keyKnown); },
    getActiveLeader: function (sid) { return cur(sid).activeLeader; },
    apply: function (sid) {
      var key = String(sid || ACTIVE_SID || '');
      if (!key) return;
      var st = sess(key); sync(st); persist(); notify();
    },
    /* 清空 = 草稿与名册同时归零（两处分开清过就会剩一个幽灵名册给宿主） */
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
        bootInherited = false;   /* 水合后重置：让当前会话重新播种 */
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
/* 订阅「当前会话的阵容」：返回快照是字符串（useSyncExternalStore 要求引用稳定，
 * 直接返回数组会每次都判定成「变了」→ 无限重渲染）。 */
function useActiveKeys(sid) {
  return React.useSyncExternalStore(
    STATE.subscribe,
    function () { return sid ? (STATE.getActive(sid) || []).join('|') : ''; }
  );
}
function rosterOfKeys(keysCsv) {
  return String(keysCsv || '').split('|').filter(Boolean).map(function (k) { return INDEX.map[k]; }).filter(Boolean);
}

/* 跳转到「对话」页签：优先注入的 setView，回退 DOM 点击页签按钮 */
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

/* DOM 方式填输入框（办公室在根作用域拿不到 inputActions，用原生 setter + input 事件） */
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

/* 把文本写进对话输入框：**优先宿主官方 API**（props.inputActions.setDraft），DOM 抓取只作兜底。
 *
 * 为什么要改：fillInput 依赖 `document.querySelector('textarea')` +
 * `window.HTMLTextAreaElement.prototype` 的 value setter。宿主只要换一次输入框实现
 * （换成 contenteditable、换 class、放进 shadow root），它就会**静默返回 false** ——
 * 用户看到的就是「点了『应用到对话』什么都没发生」，而且控制台没有报错。
 * 工作角色页签一直用的是 inputActions，所以只有浮窗这条路会静默失败。 */
function writeComposer(inputActions, text) {
  if (!text) return false;
  try {
    if (inputActions && typeof inputActions.setDraft === 'function') { inputActions.setDraft(text); return true; }
  } catch (e) { /* 落到 DOM 兜底 */ }
  return fillInput(text);
}

/* ---------- 已保存团队（全局复用） ---------- */
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

/* 预设团队 chip 显示名：DSH locale = en 且有 nameEn 时用英文，否则中文。
 * 用 systemLang()（与角色选人面板、对话页角色列表同一来源）。 */
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

/* ---------- 像素小人 ---------- */
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
    /* 抱着一台笔记本电脑工作，双手随敲击上下动（幅度加大） */
    var typeBob = Math.sin(t * 10) * 0.9 * s;
    g.fillStyle = '#3a3f4a';                       // 屏幕边框
    g.fillRect(x - 2.6 * s, y - 8.6 * s, 5.2 * s, 3.4 * s);
    g.fillStyle = '#8fc4ff';                       // 屏幕亮起
    g.fillRect(x - 2.1 * s, y - 8.1 * s, 4.2 * s, 2.4 * s);
    g.fillStyle = '#5a5f6a';                       // 键盘底座
    g.fillRect(x - 3 * s, y - 5.2 * s, 6 * s, 1 * s);
    g.fillStyle = bodyD;                           // 手臂搭键盘（敲击上下动）
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
/* 睡觉姿势：平躺在床垫上 */
function drawSleeping(g, cx, bedTop, s, role, isLeader) {
  var col = hexToRgb(role.color);
  var bodyC = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
  var x = cx - 16;
  var y = bedTop + 1;
  g.fillStyle = bodyC;                         // 横卧身体
  g.fillRect(x, y, 24, 7);
  g.fillStyle = '#f5c98f';                     // 头
  g.fillRect(x + 24, y - 1, 9, 8);
  g.fillStyle = '#3a2d20';                     // 头发
  g.fillRect(x + 24, y - 1, 9, 2);
  g.fillStyle = '#2b2b2b';                     // 闭眼
  g.fillRect(x + 28, y + 2, 2.5, 1.5);
  g.font = '13px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText(role.emoji || '🟢', cx + 2, y - 4);
  if (isLeader) { g.font = '11px sans-serif'; g.fillText('👑', cx + 13, y - 4); }
}
/* 坐姿（沙发上）：身体直立 + 腿前伸 */
function drawSitting(g, cx, seatY, s, role, isLeader, facing) {
  var col = hexToRgb(role.color);
  var bodyC = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
  var bodyD = shade(col, 0.7), bodyL = shade(col, 1.2);
  var x = Math.round(cx), y = Math.round(seatY);
  var faceOff = (facing === -1 ? -0.6 : facing === 1 ? 0.6 : 0) * s;
  g.fillStyle = bodyD;                          // 腿前伸
  g.fillRect(x - 2 * s, y - 3 * s, 2 * s, 3 * s);
  g.fillRect(x, y - 3 * s, 2.6 * s, 2 * s);
  g.fillStyle = bodyC;                          // 上身
  g.fillRect(x - 2.4 * s, y - 9 * s, 4.8 * s, 6 * s);
  g.fillStyle = bodyL;
  g.fillRect(x - 2.4 * s, y - 9 * s, 1.3 * s, 6 * s);
  g.fillStyle = '#f5c98f';                      // 头
  g.fillRect(x - 1.6 * s, y - 13 * s, 4 * s, 4 * s);
  g.fillStyle = '#3a2d20';
  g.fillRect(x - 1.6 * s, y - 13 * s, 4 * s, 1.2 * s);
  g.fillStyle = '#2b2b2b';                      // 眼
  g.fillRect(x - 1 * s + faceOff, y - 11 * s, 0.6 * s, 0.8 * s);
  g.fillRect(x + 0.4 * s + faceOff, y - 11 * s, 0.6 * s, 0.8 * s);
  g.font = Math.round(2.6 * s) + 'px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText(role.emoji || '🟢', x + 0.4 * s, y - 13.4 * s);
  if (isLeader) { g.font = Math.round(2.4 * s) + 'px sans-serif'; g.fillText('👑', x + 0.4 * s, y - 16.6 * s); }
}
/* 三态：working 工作中（工位抱电脑敲）/ done 完成（走来走去）/ idle 闲置（工位前待着） */
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
  if (state === 'working') return 'type';   // 工位抱电脑敲
  if (state === 'done') return 'sleep';     // 睡床
  return 'walk';                            // 闲置：走来走去
}
/* 头顶状态徽章：彩色底 + 白字 */
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
/* 每人头顶的中文名：直接读角色数据里固定的 cname（已植入 roles.json） */
function roleName(rec) {
  if (!rec) return _tFallback('of.fallbackName');
  try { var a = LOCALE_SVC && String(LOCALE_SVC.getSnapshot().active || '').toLowerCase(); if (a && a.indexOf('zh') !== 0) return (rec.name || rec.cname) || _tFallback('of.fallbackName'); } catch (e) {}
  return (rec.cname || rec.name) || _tFallback('of.fallbackName');
}
/* 头顶姓名 */
function drawNameTag(g, cx, footY, name) {
  g.font = '10px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 2;
  g.fillStyle = '#ffffff';
  g.fillText(name, cx, footY - 42);
  g.shadowColor = 'transparent'; g.shadowBlur = 0;
}
/* 点击互动：每帧记录每个人物的命中盒，点击后触发动作回应 + 对话 */
var PERSON_BOXES = [];
var CLICKED = null;   // { key, t, line, name }
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
/* 云朵气泡：显示当前工作内容 */
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

/* 闲置聊天问候语（含打破第四面墙的细思极恐问答） */
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
/* 每人每隔一段时间说一句（按 key 相位错开，持续约 3.5 秒） */
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
/* 聊天气泡：头顶小白框，支持折行（最长 2 行，每行 14 字） */
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
  /* 姓名头：谁在对谁说（携带姓名） */
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

/* ---------- AI 聊天：开关 + 可插拔接口 + 内置（基于实时活动） ---------- */
/* 开关：全局（localStorage 持久化），控制像素人聊天是否走 AI */
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

/* AI 模型配置（工作角色栏）：选用哪个模型 + 是否开思考 + 台词频率；全局 localStorage 持久化 */
var CHAT_CFG = (function () {
  var KEY = 'agents-pixe.chatCfg.v1';
  var cfg = { model: null, thinking: false, freq: 'low' };   // freq: low/medium/high 台词频率；默认 low（token 管控）
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

/* 接口：外部 AI 可赋值 window.__AGENTS_PIXE_CHAT__ = async (req) => '台词'（返回 null/空则回退内置）。
 * req = { roleName, roleKey, emoji, state, activity, sessionId, isLeader } */
var AI_CACHE = {};   // '<key>:<epoch>' -> { pending, text }
var CHAT_LOG = {};   // key -> { text, at }：每人最近说过的话，供相邻同事接话
/* 预取节流：避免每个角色每 15s 都真实调一次模型持续烧 token */
var AI_FETCH_AT = {};        // key -> 上次真实模型调用时间戳
var AI_INFLIGHT = 0;         // 全局在途调用数
/* 按频率档位动态取节流参数：low 最省 token、high 最接近原行为 */
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
/* 内置 AI 生产者：fetch 宿主端点 /agents-pixe/chat（调 dsh 自配模型），失败返回 null 回退 */
function builtinProvider(req) {
  var cfg = CHAT_CFG.get();
  var q = new URLSearchParams();
  q.set('roleName', req.roleName || '同事');
  q.set('roleKey', req.roleKey || '');
  q.set('state', req.state || 'idle');
  q.set('activity', req.activity || '');
  q.set('isLeader', req.isLeader ? 'true' : 'false');
  q.set('thinking', cfg.thinking ? 'on' : 'off');
  q.set('aiEnabled', req.aiOn ? '1' : '0');   // AI 模式授权标记：服务端硬门凭此放行
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
  if (AI_CACHE[ck]) return true;   // 已有缓存或在途
  // 节流：间隔内已真实调用过则跳过（返回 false 供调用方回退罐头台词）
  var now = Date.now();
  if (AI_FETCH_AT[rec.key] && now - AI_FETCH_AT[rec.key] < aiMinInterval()) return false;
  // 并发上限：全局同时最多 N 个真实调用
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
      if (t) CHAT_LOG[rec.key] = { text: t, at: Date.now() };   // 记下，供相邻同事接话
    }).catch(function () { AI_INFLIGHT--; AI_CACHE[ck] = { pending: false, text: null }; });
  } catch (e) { AI_INFLIGHT--; AI_CACHE[ck] = { pending: false, text: null }; }
  return true;   // 已发起真实调用
}
/* 内置 AI：基于实时运行态生成台词（真实模型正在做的事） */
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
  return null;   // 闲置无实时活动可报 → 回退罐头问候
}
/* 解析某人在 t 时刻的台词（AI 关 → 罐头问候；AI 开 → 外部接口优先，其次内置 fetch 模型，失败回退活动台词/罐头） */
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
    // 被节流（60s 内已调过 / 并发满）→ 回退罐头/活动台词，避免空气泡
    if (!prefetchLine(producer, rec, info, cp.gi)) return builtinAiLine(rec, info) || chatText(rec.key, t);
  }
  return '';   // 模型尚未返回 → 本帧暂不显示气泡
}
if (typeof window !== 'undefined') {
  window.__AGENTS_PIXE_CHAT_API__ = {
    setProvider: function (fn) { window.__AGENTS_PIXE_CHAT__ = (typeof fn === 'function') ? fn : null; },
    getProvider: function () { return window.__AGENTS_PIXE_CHAT__ || null; },
    isOn: CHAT_AI.isOn,
    setEnabled: function (v) { CHAT_AI.set(v); }
  };
}
/* 拉取宿主模型目录：GET /agents-pixe/models → { providers:[{provider,name,models:[{id,name}]}] } */
var MODELS_CACHE = null;
function fetchModels(force) {
  if (MODELS_CACHE && !force) return Promise.resolve(MODELS_CACHE);
  return fetch('/agents-pixe/models')
    .then(function (r) { return r.json(); })
    .then(function (j) { MODELS_CACHE = (j && Array.isArray(j.providers)) ? j.providers : []; return MODELS_CACHE; })
    .catch(function () { return MODELS_CACHE || []; });
}
/* token 数格式化：1234 → 1.2K，1200000 → 1.2M */
function fmtTok(n) {
  var v = Number(n) || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  return String(v);
}

/* 角色卡正文 markdown → JSX（按 ## 拆节，去行首 emoji） */
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

/* 角色卡详情模态框：左键点击像素人时打开（全屏覆盖层 + 角色完整卡分段渲染） */
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

/* 模型调用计数：GET /agents-pixe/stats → { calls, fails } */
function fetchStats() {
  return fetch('/agents-pixe/stats')
    .then(function (r) { return r.json(); })
    .then(function (j) { return (j && typeof j.calls === 'number') ? j : { calls: 0, fails: 0 }; })
    .catch(function () { return { calls: 0, fails: 0 }; });
}
/* 一键跳到 设置 → agent-teams-pixel 分区（多选择器 + dispatchEvent 兜底，防 DOM 差异） */
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
/* AI 开关：开启前弹确认（会消耗 token），关闭直接关 */
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

/* ---------- 办公室场景：超员时手动翻页 ---------- */
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
    var lastErrAt = 0; // 帧内抛错节流（60fps 不然 console 会爆）

    /* RAF 调度与 try/catch 包在 paint 里，render 是纯绘制。
     * 60fps 任何一帧抛错都会让小人卡死或半渲染（Canvas 没有 React 错误边界，
     * throw 会直接停止 RAF 后续调度，因为 raf = requestAnimationFrame(render)
     * 写在 render() 的第一行，throw 后这行不执行）。这里把调度移到外层，绘制
     * try/catch 包住，throw 时降级为单色背景 + console.error 节流输出。 */
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

      /* 装饰：踢脚线 + 挂钟 + 地毯 */
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
      /* 内边框 */
      ctx2d.strokeStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.6)'; ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      ctx2d.moveTo(rx + 26, ry + 9);
      ctx2d.arcTo(rx + rw - 12, ry + 9, rx + rw - 12, ry + rh - 5, 8);
      ctx2d.arcTo(rx + rw - 12, ry + rh - 5, rx + 12, ry + rh - 5, 8);
      ctx2d.arcTo(rx + 12, ry + rh - 5, rx + 12, ry + 9, 8);
      ctx2d.arcTo(rx + 12, ry + 9, rx + 26, ry + 9, 8);
      ctx2d.closePath(); ctx2d.stroke();
      /* 中心菱形纹样 */
      ctx2d.strokeStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.72)';
      ctx2d.beginPath();
      ctx2d.moveTo(W / 2, ry + 14);
      ctx2d.lineTo(W / 2 + 24, ry + rh / 2);
      ctx2d.lineTo(W / 2, ry + rh - 10);
      ctx2d.lineTo(W / 2 - 24, ry + rh / 2);
      ctx2d.closePath(); ctx2d.stroke();
      /* 左右流苏 */
      ctx2d.fillStyle = dark ? 'rgba(99,102,241,0.32)' : 'rgba(99,102,241,0.24)';
      for (var fr = 0; fr < 5; fr++) {
        ctx2d.fillRect(rx - 4, ry + 4 + fr * 6, 5, 3);
        ctx2d.fillRect(rx + rw - 1, ry + 4 + fr * 6, 5, 3);
      }
      /* 墙上挂画（左侧） */
      ctx2d.fillStyle = dark ? '#4b5563' : '#f9f5ec';
      ctx2d.fillRect(150, 30, 42, 34);
      ctx2d.strokeStyle = dark ? '#1f2937' : '#8a6a45'; ctx2d.lineWidth = 2;
      ctx2d.strokeRect(150, 30, 42, 34);
      ctx2d.fillStyle = dark ? '#6f96c8' : '#a8d4ff'; ctx2d.fillRect(155, 35, 15, 12);
      ctx2d.fillStyle = dark ? '#b91c1c' : '#ef4444'; ctx2d.fillRect(172, 35, 15, 12);
      ctx2d.fillStyle = dark ? '#ca8a04' : '#f59e0b'; ctx2d.fillRect(155, 49, 15, 10);
      ctx2d.fillStyle = dark ? '#15803d' : '#22c55e'; ctx2d.fillRect(172, 49, 15, 10);
      /* 盆栽（左下角） */
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

      /* 沙发（右前角，双人座） */
      var sx = 405, sy = 292;
      ctx2d.fillStyle = dark ? '#5b4a3a' : '#b0804a';   // 靠背
      ctx2d.fillRect(sx, sy + 6, 96, 16);
      ctx2d.fillRect(sx, sy, 96, 7);
      ctx2d.fillStyle = dark ? '#6b5948' : '#c0955f';   // 扶手（圆润）
      ctx2d.fillRect(sx - 5, sy + 4, 11, 30);
      ctx2d.fillRect(sx + 90, sy + 4, 11, 30);
      ctx2d.fillStyle = dark ? '#7a5a38' : '#c9a27a';   // 坐垫
      ctx2d.fillRect(sx, sy + 22, 96, 12);
      ctx2d.fillStyle = dark ? '#8a6a45' : '#d8b98a';   // 坐垫高光
      ctx2d.fillRect(sx, sy + 22, 96, 3);
      ctx2d.fillStyle = dark ? '#a855f7' : '#c084fc';   // 靠枕1（紫）
      ctx2d.fillRect(sx + 8, sy + 7, 32, 13);
      ctx2d.fillStyle = dark ? '#ec4899' : '#f472b6';   // 靠枕2（粉）
      ctx2d.fillRect(sx + 54, sy + 7, 32, 13);
      ctx2d.fillStyle = dark ? '#b8860b' : '#d4a017';   // 金色沙发腿
      ctx2d.fillRect(sx + 4, sy + 34, 5, 5);
      ctx2d.fillRect(sx + 87, sy + 34, 5, 5);

      /* 装饰：吊灯 + 书架 + 饮水机 */
      ctx2d.fillStyle = dark ? '#374151' : '#6b7280';   // 吊灯线
      ctx2d.fillRect(W / 2 - 1, 0, 2, 16);
      ctx2d.fillStyle = dark ? '#eab308' : '#fbbf24';   // 灯罩
      ctx2d.beginPath(); ctx2d.moveTo(W / 2 - 14, 16); ctx2d.lineTo(W / 2 + 14, 16); ctx2d.lineTo(W / 2 + 6, 30); ctx2d.lineTo(W / 2 - 6, 30); ctx2d.closePath(); ctx2d.fill();
      ctx2d.fillStyle = dark ? '#fef3c7' : '#fff7d6';   // 灯光
      ctx2d.beginPath(); ctx2d.arc(W / 2, 40, 8, 0, 6.2832); ctx2d.fill();
      ctx2d.fillStyle = dark ? '#6b5640' : '#8a6a45';   // 书架框
      ctx2d.fillRect(206, 40, 66, 50);
      ctx2d.fillStyle = dark ? '#4a3b2e' : '#c9a27a';   // 书架内
      ctx2d.fillRect(209, 43, 60, 44);
      var bookCols = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
      for (var shelfRow = 0; shelfRow < 3; shelfRow++) {
        for (var bi2 = 0; bi2 < 6; bi2++) {
          ctx2d.fillStyle = bookCols[(shelfRow + bi2) % bookCols.length];
          ctx2d.fillRect(210 + bi2 * 10, 44 + shelfRow * 15, 8, 13);
        }
      }
      ctx2d.fillStyle = dark ? '#64748b' : '#cbd5e1';   // 饮水机
      ctx2d.fillRect(400, 250, 26, 44);
      ctx2d.fillStyle = dark ? '#38bdf8' : '#7dd3fc';   // 水桶
      ctx2d.fillRect(404, 234, 18, 18);

      /* 床位（后排，供「完成」睡觉） */
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

      /* 手动翻页：一页最多 8 人 */
      var groups = Math.max(1, Math.ceil(roles.length / (props.maxPerPage || 8)));
      var pg = Math.min(page, groups - 1);
      var visible = roles.slice(pg * 8, pg * 8 + 8);

      var n = visible.length;
      var deskXs = [], deskYs = [];
      for (var d = 0; d < n; d++) {
        /* 两行摆放：每行 4 列；后行 y=155，前行 y=260 */
        var drow = Math.floor(d / 4);
        var dcol = d % 4;
        var dx = 40 + dcol * 130;
        var dy = (drow === 0) ? 155 : 260;
        deskXs.push(dx);
        deskYs.push(dy);
        /* 华丽办公桌：木纹桌面 + 金色套脚 + 抽屉金拉手 + 显示器支架 */
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
        var partnerIdx = (k % 2 === 0) ? k + 1 : k - 1;   // 相邻配对 (0,1)(2,3)
        var partnerRec = (partnerIdx >= 0 && partnerIdx < n) ? visible[partnerIdx] : null;
        var pname = roleName(rec2);   // 每人头顶的中文名
        var partnerName = partnerRec ? roleName(partnerRec) : null;
        var aiInfo = { aiOn: CHAT_AI.isOn(), state: st, activity: activity, sessionId: sessionId, isLeader: rec2.key === leader, context: partnerRec ? recentLine(partnerRec.key) : '', partnerName: partnerName };
        var clicked = (CLICKED && CLICKED.key === rec2.key && (now - CLICKED.t) < 2500) ? CLICKED : null;
        var bounce = clicked ? Math.abs(Math.sin((now - CLICKED.t) / 1000 * Math.PI * 1.6)) * 12 : 0;
        if (act === 'sleep') {
          /* 完成 → 前两人坐沙发休息，其余睡后排床位 */
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
          /* 闲置：平时上下左右走动；聊天时原地停住，只转身面向对方（不瞬移） */
          var greet = resolveChat(rec2, cp, t, aiInfo);
          /* 有效走动时间：聊天窗口(每15秒的前3.5秒)内暂停推进，位置因此连续不停顿 */
          var teff = cp.gi * 11.5 + (cp.cyc < 3.5 ? 0 : cp.cyc - 3.5);
          var baseX = 60 + k * 55;
          var baseY = 128 + (k % 3) * 50;
          var walkX = Math.sin(teff * 0.7 + (wseed % 100) / 10) * 200;
          var walkY = Math.sin(teff * 0.5 + ((wseed * 7) % 100) / 10) * 65;
          var ccx = baseX + walkX;
          var ccy = baseY + walkY;
          var facing = 0, act2 = cp.isChat ? 'idle' : 'walk';
          if (cp.isChat) {
            /* 面向正在聊天的伙伴：只转眼睛/身体朝向，坐标不动 */
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
          /* 工作中 → 工位抱电脑敲（动作大）；同时也会聊天（转脸面向伙伴） */
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
      /* 云朵气泡：当前工作内容（优先挂在领袖头上） */
      if (activity) {
        var bx = deskXs[0] + 34, by = deskYs[0] - 3;
        for (var bi = 0; bi < visible.length; bi++) if (visible[bi].key === leader) { bx = deskXs[bi] + 34; by = deskYs[bi] - 3; }
        drawCloud(ctx2d, bx, by, activity);
      }
      if (groups > 1) labelText(ctx2d, '第 ' + (pg + 1) + '/' + groups + ' 组', W / 2, 335, 11);
    }
    /* raf 调度已由 paint() 接管：paint = RAF 调度器 + try/catch + 单色降级背景；
     * render(now) 是纯绘制，paint 调它并 catch 任何 throw，让小人永远不会卡死。 */
    raf = requestAnimationFrame(paint);
    return function () { cancelAnimationFrame(raf); };
  }, [roles, leader, zoom, working, page, activity, done, sessionId, lang]);

  /* Ctrl + 滚轮缩放（原生监听 + passive:false；React 的 onWheel 在根节点是 passive，拦不住默认行为）。
   * 不按 Ctrl/Meta 时完全不拦截，普通滚动照旧。onZoom 传的是 setZoom（引用稳定），
   * 用函数式更新，避免 effect 反复重订阅与闭包过期。 */
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
      /* 紧身命中盒：只有鼠标真正接触到像素人本体（约 22×50）才算命中 */
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
      /* 左键点击像素人 → 打开该角色完整卡详情 */
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

/* 当前活动会话 id（模块级） */
var ACTIVE_SID = null;
function currentSessionId() { return ACTIVE_SID; }

/* 会话/定时器服务（在 apply 里捕获，供运行态轮询用） */
var SESSIONS_SVC = null;
var TIMER_SVC = null;
var LOCALE_SVC = null;
/* settings 命名空间 scope（在 apply 里绑定为 agents-pixe，给办公室浮层实时读默认缩放/头像条/每页人数用） */
var PIXE_SCOPE = null;
/* 设置作用域（客户端侧）。
 * dsh ≥0.1.7 起客户端**不再有 settingsScope 服务**（宿主 settings 只剩表单服务
 * configure/describe/update/replace/mutate），因此配置读写统一走宿主端点
 * /agents-pixe/config：GET 读 live Config 快照 + revision，POST 走 settings.update(条目 id, patch, rev)。
 * localStorage 只作离线镜像：宿主不可用时 UI 仍可切换，宿主恢复后以宿主值覆盖。
 * （做法对照 memory-eternal：它同样不依赖 settingsScope，而是自带 API + settings.update。） */
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
      data[key] = val; mirror(); emit();   /* 乐观更新：UI 立刻响应 */
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

/* 跟随 dsh 系统语言：locale 快照 active = 'zh' | 'en'；切换语言时组件自动重渲染 */
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

/* 读取 settings 命名空间里 agents-pixe 当前值（办公室显示等配置），随设置变更自动重渲染。
 * useSyncExternalStore 要求 getSnapshot 返回**稳定引用**：无 settings scope 时返回同一
 * 个模块级空对象，否则 React 会判 Object.is 不等、无限重渲染（OfficeOverlay 整层消失）。 */
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

/* ---------- 办公室内嵌选人 ---------- */
function RolePicker(props) {
  useRolesStore();   // 订阅：清单懒加载完成后自动重渲染（否则空列表要等下一次交互才刷新）
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

/* ================= 团队视图共享 store =================
 * 会话头入口 / 回合尾卡 / 浮层面板三处读同一份快照：一个会话只有一个轮询器。
 * 三条纪律：① 页面隐藏时不轮询；② 内容签名不变就不通知订阅者（不重建 DOM）；
 * ③ 没有订阅者就停表（关掉面板不烧请求）。 */
var TEAM_STORE = (function () {
  var cache = {};      /* sid -> { data, sig, at, error } */
  var subs = {};       /* sid -> [fn] */
  var timer = null;
  /* 分档自适应频率（不降频的话，一个常驻会话就是每小时 900 次 /teams/view，
   * 参考项目自己也点过这个「轮询风暴」）：
   *   ACTIVE  有草案待确认、或有未结算任务 —— 状态随时在变，值得 4 秒一次；
   *   SETTLED 有团队但已全部结算 —— 成了历史，15 秒确认一次没有新动静就够；
   *   IDLE    本会话还没有团队 —— 30 秒。
   * 注意：上一轮把「任务结束后团队信息永久保留」做成默认行为之后，
   * 如果还按「有团队就 4 秒」，绝大多数会话会永远停在最高频率 —— 所以这里必须分档。 */
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
    var next = IDLE_MS;   /* 取所有会话里最急的那个 */
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
    if (typeof document !== 'undefined' && document.hidden) return;   /* 后台标签页不轮询 */
    Object.keys(subs).forEach(function (sid) { if ((subs[sid] || []).length) load(sid); });
  }
  /* 回到前台立刻补一次：否则后台期间的变化要等下一个 tick 才看到 */
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
        if (!prev || prev.sig !== sig) emit(sid);      /* 内容变了才通知，避免定时无谓重建 DOM */
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

/* 面板开关总线：会话头入口 / 回合尾卡 → 浮层面板（跨 slot 通信，两处不共享 React 树） */
var PANEL_CTL = (function () {
  var listeners = [];
  var last = null;
  /* 'team' / 'office' 打开浮层并切视图；'pick' 直接进入选人（团队面板空态里的
   * 「去选人」按钮要能把用户送到能做事的地方，而不是让他自己找页签）。 */
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

/* ---------- 团队活动主视图 ---------- */
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

/* 任务态：completed / running / failed / blocked / open（面板颜色与文案都读这一处） */
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

/* 文案即状态机：界面任何时刻都有一句话解释现状（十态） */
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

/* 分段进度：一段 = 一任务，颜色 = 状态 */
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

/* 成员树：头像 + 名字 + 角色/路由 chip + 交付计数 + 一行下一步 + 任务 chip */
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

/* 依赖图：按依赖深度分列 + 详情卡（点任务 → 高亮负责成员 + 出详情） */
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

/* 计划闸门：草案确认（0.2.10 已有 plan/confirm · plan/discard 端点，这里补 UI） */
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
  /* 面板确认走 HTTP，而 HTTP 里**没有真实 Agent** —— 宿主 spawn 续聊成员必须有它
   * （实测：假 parent 会让宿主报 `Cannot read properties of undefined (reading 'header')`）。
   * 所以这里用「先试 HTTP（这样面板里改过的分工能带过去）→ 失败就降级为把确认指令填进输入框」，
   * 而不是留一个点了必然报错的按钮。 */
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
    /* 三步 stepper */
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 } },
      [t('tp.flowReview'), t('tp.flowSpawn'), t('tp.flowRun')].map(function (label, i) {
        return React.createElement('span', { key: label, style: { display: 'inline-flex', alignItems: 'center', gap: 4, color: i === 0 ? 'var(--px-blue,#3b82f6)' : 'var(--dsw-alias-label-secondary,#888)' } },
          React.createElement('i', { style: { width: 17, height: 17, border: '1px solid ' + (i === 0 ? 'var(--px-blue,#3b82f6)' : 'var(--dsw-alias-border-l1,#ccc)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'normal' } }, String(i + 1)),
          label,
          i < 2 ? React.createElement('s', { style: { display: 'inline-block', width: 14, height: 1, background: 'var(--dsw-alias-border-l2,#ddd)', marginLeft: 3 } }) : null);
      })
    ),
    /* 成员与模型路由 */
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
    /* 任务与依赖 */
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
    /* 收尾：三出口 */
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

/* 当前阵容的**详细**列表：只要选了角色就实时显示。
 * 每行给到：序号/领袖冠、主题色、角色名、分部、描述；点开还有 id / 语言 / 设为领袖。
 * 抽成组件是因为两处都要用：还没建队时的主视图，以及已有宿主团队时的补充区块。 */
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
        /* 可聚焦 + 支持回车/空格：只做 onClick 的话键盘与读屏用户根本进不来
         * （这是我上一轮自己指出、这一轮补上的可达性缺口）。 */
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

/* 面板主体：左看人 / 右看事；有草案时左栏换成计划闸门 */
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
  /* 当前会话的阵容（选人即生效，所以这份就是「刚勾的那几个」） */
  var activeKeys = useActiveKeys(sid);
  useRolesStore();   /* 角色索引是异步加载的：不订阅的话，索引到位前阵容 chips 会短暂显示成空 */
  var roster = rosterOfKeys(activeKeys);   /* 详细列表两处共用（无团队时的主视图 / 有团队时的补充区块） */
  var [rosterOpen, setRosterOpen] = React.useState(null);
  var [rosterShown, setRosterShown] = React.useState(false);
  function showToast(msg, ms) { setToast(msg); setTimeout(function () { setToast(null) }, ms || 2400); }
  /* 有可派发/在跑的任务才谈得上暂停；已归档的团队、一次性快照都没有可暂停的东西。 */
  function isDispatchable(x) {
    var s = String((x && x.status) || '');
    return s === 'pending' || s === 'claimed' || s === 'in_progress' || s === 'running';
  }
  /* 「用它开工」：把**一句人话**填进对话框，剩下交给模型。
   * 用户不需要知道工具名 —— 面板里出现的每个字都应该是用户语言。 */
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
    /* 还没有宿主团队时，这里显示**当前选中的阵容**：选人实时反映到团队界面。
     * 只写一句「还没有活动团队」等于把用户刚勾的人藏起来，那正是以前的问题。 */
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
      /* 空态必须给「下一步」。以前这里是一句让用户去调工具名的话（agents_pixe_team_create…），
       * 那是给开发者看的，不是给用户看的。现在给真按钮 + 一句人话。 */
      React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        roster.length
          ? React.createElement('button', { type: 'button', onClick: buildTeam, style: Object.assign({}, btnLike, { background: 'var(--px-violet,#7c3aed)', borderColor: 'var(--px-violet,#7c3aed)', color: '#fff', fontWeight: 700, padding: '5px 12px' }) }, t('tp.buildTeam'))
          : null,
        React.createElement('button', { type: 'button', onClick: function () { PANEL_CTL.open('pick'); }, style: Object.assign({}, btnLike, { padding: '5px 12px' }) }, t('tp.gotoPick'))),
      React.createElement('div', { style: { fontSize: 12, opacity: 0.75 } }, t('tp.emptyHint')));
  }

  function toggleHalt() {
    if (!sid || busy) return;
    if (!data.halted && !armedHalt) { setArmedHalt(true); return; }   /* 暂停是破坏性动作：二次确认 */
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
    /* 面板头：标题 + 状态 + 摘要 + 停止（二次确认）+ 消息 */
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderBottom: '1px solid var(--dsw-alias-border-l1,#ccc)', flexWrap: 'wrap' } },
      React.createElement('span', { style: { width: 8, height: 8, borderRadius: 4, background: bannerTone, display: 'inline-block' } }),
      React.createElement('b', { style: { fontSize: 13 } }, (plan && plan.teamName) || data.teamName || t('tp.title')),
      isNative ? React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.readOnlyNative')) : null,
      React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, opacity: 0.7 } }, t('tp.headSum', { members: members.length, done: done, total: tasks.length, msgs: msgs })),
      /* 暂停/恢复只在「有可派发的东西」或「已经暂停」时出现：
       * 已归档的团队和一次性快照都没有可暂停的对象，给按钮只会误导。
       * 一次性快照还要额外说清它是只读历史。 */
      data.oneShot ? React.createElement('span', { style: { fontSize: 11, opacity: 0.7 } }, t('tp.oneShotHint')) : null,
      (isNative || data.oneShot || !(tasks.some(isDispatchable) || data.halted)) ? null
        : React.createElement('button', { type: 'button', onClick: toggleHalt, disabled: busy, title: t('tp.haltTitle'),
            style: Object.assign({}, btn, { borderColor: data.halted ? 'var(--px-green,#16a34a)' : (armedHalt ? 'var(--px-amber,#f59e0b)' : 'var(--dsw-alias-border-l1,#ccc)'), color: armedHalt ? 'var(--px-amber,#f59e0b)' : 'inherit' }) },
            data.halted ? t('tp.resume') : (armedHalt ? t('tp.haltConfirm') : t('tp.halt')))
    ),
    /* 全局一句话摘要 */
    React.createElement('div', { style: { padding: '5px 8px', fontSize: 12, background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
      React.createElement('span', { style: { color: bannerTone } }, '● ' + sum.text),
      toast ? React.createElement('span', { style: { marginLeft: 10, opacity: 0.75 } }, toast) : null
    ),
    /* 主体 */
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
            /* 左栏：人 */
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
            /* 右栏：事 */
            React.createElement('div', { style: { flex: '2 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                React.createElement('b', { style: { fontSize: 13 } }, t('tp.taskDeps')),
                React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, opacity: 0.7 } }, picked ? t('tp.filterByMember', { name: picked }) : t('tp.dagHint'))),
              React.createElement(DAGraph, { tasks: tasks, byId: byId, t: t, pinned: pinned, onPin: setPinned, picked: picked }),
              React.createElement(TaskDetail, { t: t, task: detailTask, byId: byId, tasks: tasks })
            )),
      /* 当前阵容：已有宿主团队时也实时显示（只要有角色就显示，与是否建队无关） */
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
      /* 最终报告：团队结束后真正有价值的东西。它一直写在状态里，但 view 不返回（本轮补上），
       * 界面上任何地方都看不到 —— 用户只能翻聊天记录找。默认收起，需要时展开。 */
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

/* ================= 跟随会话的两个入口 =================
 * 参考 dsh-agent-teams 的模式：入口属于会话，不属于通用工作区。
 * 没有团队时两处都返回 null（完全不占位）；有团队才出现。 */
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
  /* 草案态下 members/tasks 都是空的（成员还没创建），计数必须改读计划里的名册与任务，
   * 否则会话头会显示「团队 (0)」、折叠徽章会显示「0 名成员 · 0/0 完成」——
   * 这是「真跑一次 plan_only」才暴露出来的：纯静态读代码看不出来。 */
  var plan = team.plan || null;
  var staged = !!plan;
  var nMembers = staged ? ((plan.members || []).length || (plan.roster || []).length) : team.members.length;
  var nTasks = staged ? (plan.tasks || []).length : team.tasks.length;
  /* 草案态没有真成员，只有计划名册；卡片上的名字行要能照常显示 */
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
  /* 任务全部结算后**不隐藏**：用户要的是「任务结束后团队信息保留着，持续显示」。
   * 但也不该每回合都甩一张大卡 —— 结算后退化成一行，信息在、不占地方。 */
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
      /* 草案态：没有真成员，只有计划名册 —— 名字行照常显示，别让卡片看起来是空的 */
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

/* ================= 团队工具的对话内卡片（tool.call.toolview） =================
 * 设计取舍：**不解析工具参数**去拼视图，直接读 TEAM_STORE 的实时快照。理由：
 *   ① 不必依赖宿主内部 block 的形状（那是随版本会变的东西，猜错就静默不渲染）；
 *   ② 显示的是「现在进行到哪」，而不是一次性的 JSON 快照；
 *   ③ 原始参数/结果仍可展开，需要查证时够用。
 * 注册 key = wire 工具名（本机实测 keyDomain 开放，agents_pixe_* 未被占用）。
 * 一律套 pixBoundary：这里的任何意外都不允许把聊天渲染带崩。 */
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
/* 容错取值：block 形状随宿主版本可能不同，取不到就返回空，绝不 throw */
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
  var data = useTeamView(sid);                       /* hook：无条件调用 */
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

/* ---------- 浮层布局记忆 ----------
 * 位置 / 缩放 / 折叠态 / 当前视图落 localStorage（按 profile 共用一份，不按会话区分：面板位置是人的习惯，不是会话的属性）。
 * 读的时候顺手把位置夹回可视区：换显示器或改分辨率后，旧坐标可能整块跑到屏幕外。 */
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
  } catch (e) { /* 隐私模式 / quota：布局记不住不影响功能，静默降级 */ }
}

/* ---------- 浮层面板（跟随当前会话 + 边界钳制 + 头像条） ---------- */
function OfficeOverlay(props) {
  var useSessions = props && props.useSessions;
  var t = safeT((props && props.t) || _tFallback);
    useSystemLang();
  /* 当前会话 id 必须来自**宿主真实快照的形状**。
   *
   * 曾经写成 `useSessions(s => s.current)` —— 那是臆造的字段：快照只有
   * `{ byId, phase, projectionsBySession }`，**没有 current**，于是永远 undefined，
   * 浮层退化成「会话盲」：办公室恒显示 0 人、点角色被写入口拒绝（静默无反应）、
   * 「应用到对话」永远置灰 —— 用户看到的正是「点击角色与应用到对话 无效」。
   *
   * 正确写法照抄宿主自己（它在 shell 里找主会话就是这么写的）：
   *   Object.values(s.byId).find(x => (x.retainedBy.mainView ?? 0) > 0)?.id */
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
  var [savedLayout] = React.useState(function () { return readOverlayLayout(); });   /* 只读一次，作为初值 */
  var [collapsed, setCollapsed] = React.useState(savedLayout.collapsed === true);
  var [pos, setPos] = React.useState({ dx: savedLayout.dx || 0, dy: savedLayout.dy || 0 });
  var [zoom, setZoom] = React.useState(typeof savedLayout.zoom === 'number' ? savedLayout.zoom : zoomInit);
  var [pickerOpen, setPickerOpen] = React.useState(false);
  var [view, setView] = React.useState(savedLayout.view === 'team' ? 'team' : 'office');   /* office | team：标题栏两档切换 */
  var [moreOpen, setMoreOpen] = React.useState(false);       /* ⋯ 低频操作（选人 / 缩放 / 设置） */
    var [showSettings, setShowSettings] = React.useState(false);
  var [allPresets, setAllPresets] = React.useState(false);   /* 预设团队递进披露：默认只露 6 个 */
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
  var dragCleanup = React.useRef(null);    // 拖拽中的 window 监听清理函数（卸载时兜底移除，防泄漏）
  var resizeCleanup = React.useRef(null);
  React.useEffect(function () {
    return function () { if (dragCleanup.current) dragCleanup.current(); if (resizeCleanup.current) resizeCleanup.current(); };
  }, []);

  /* 团队快照：与会话头入口 / 回合尾卡共享同一个轮询器（TEAM_STORE 按 sid 去重） */
  var tv = useTeamView(sid);

  /* 会话头入口 / 回合尾卡 → 展开浮层并切到团队视图（跨 slot 通信） */
  React.useEffect(function () {
    return PANEL_CTL.subscribe(function (target) {
      setCollapsed(false);
      if (target === 'pick') { setView('office'); setPickerOpen(true); setShowSettings(false); setMoreOpen(false); return; }
      setView(target === 'team' ? 'team' : 'office');
      setPickerOpen(false); setShowSettings(false); setMoreOpen(false);
    });
  }, []);

  /* 选人入口只有一个：任何地方点「选人」都必须走这里。
   *
   * 为什么必须切 view：主体渲染分支是 `view === 'team' ? TeamPanel : showSettings ? … : pickerOpen ? 选人 : 画布`
   * ——**团队页签优先**。只置 pickerOpen 而不切视图，在「团队」页签上选人面板永远不会被渲染，
   * 用户看到的就是「点了没反应」（抽屉还会顺手关掉，更像没反应）。 */
  function gotoPicker() {
    setView('office'); setShowSettings(false); setMoreOpen(false); setPickerOpen(true);
  }

  /* 布局记忆：折叠态与视图立即写；位置/缩放防抖写（拖拽期间每帧都写会把 localStorage 打爆） */
  React.useEffect(function () { writeOverlayLayout({ collapsed: collapsed, view: view }); }, [collapsed, view]);
  React.useEffect(function () {
    var id = setTimeout(function () { writeOverlayLayout({ dx: pos.dx, dy: pos.dy, zoom: zoom }); }, 400);
    return function () { clearTimeout(id); };
  }, [pos.dx, pos.dy, zoom]);

  /* 切换会话自动关闭 AI（避免跨会话误耗 token） */
  React.useEffect(function () {
    if (prevSidRef.current && prevSidRef.current !== sid) CHAT_AI.set(false);
    prevSidRef.current = sid;
  }, [sid]);

  React.useEffect(function () {
    /* 只在拿到**真实**会话 id 时才写全局：否则浮层这一次 undefined 会把
     * 工作角色页签刚设好的 ACTIVE_SID 冲掉，两个组件的会话来源互相打架。 */
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

  /* 运行态轮询：直接读当前会话快照的 running + 当前活动内容；顺带读全局 token 计量投影 */
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
        /* 全局 token 计量（真实 provider usage，tokenUsage 投影）+ 轮/步（sessionStats 投影） */
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
      /* 检测 running 从 true → false：完成后让像素人「完成」（走动）约 8 秒 */
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

  /* 一键团队编排：浮层拿不到 dsh setDraft（React 受控 textarea 会被覆盖），改用复制到剪贴板 + 跳转对话粘贴 */
  function oneClickTeam() {
    if (draftN === 0) return;
    var name = STATE.getName(sid) || '';
    /* 未命名预设团队 → 走「用户选中的角色」：宿主会读办公室选人，只导入选中的角色卡 */
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

  /* 「应用到对话」常驻动作（标题栏）：不管面板当前停在哪个画面都能用
   * （办公室 / 团队 / 选人 / 设置）。语义与工作角色页签顶部那颗一致：
   * 把当前草稿置为本会话的活动名册 → 把成员清单填进输入框 → 跳到对话。
   * 注意与 oneClickTeam 的区别：那颗走的是「编排指令」，这颗走的是「成员清单」。 */
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

  /* 清空选人：草稿 + 本会话 active 一起清。
   * 以前只清草稿 —— 于是「清了人，办公室还站着旧人，宿主还照旧按旧名册组队」。
   * syncActive() 会自动同步一次，这里再显式清一次兜底（ACTIVE_SID 尚未绑定时不会自动同步）。 */
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
  /* 「团队」这一屏什么时候存在：办公室有人（有队伍可看），**或者**本会话已经有宿主团队（成员/任务/草案）。
   * 后半句不能漏 —— 清空选人后如果直接隐藏入口，那份已完成的团队信息（含最终报告）就再也打不开了。
   * 用派生视图而不是改 state：人再选上时，用户原先停在「团队」的偏好会自动恢复。 */
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

  /* ⚠️ 关键：`shell.overlay` 这一层**默认点击穿透**（DSH slot 文档原文：
   * "click-through until your entry opts into pointer events"）。
   * 占用者必须自己把 pointer-events 拿回来，否则整块浮层看得见、点不动 ——
   * 症状是「浮窗里每个按钮都像失效了」，而且**没有任何报错**。
   * 这是长期被误判成「选人按钮坏了」的真正原因。 */
  var base = { position: 'absolute', right: 16 - pos.dx, bottom: 16 - pos.dy, pointerEvents: 'auto' };

  if (collapsed) {
    /* 折叠徽章带计数：把「重新打开面板」的成本压到一次点击，且不打开也知道进度。
     * 计数统一走 teamOf + teamCounts —— 草案态下 members/tasks 是空的，
     * 直接数 tv.members 会得到「0 名成员 · 0/0 完成」（真跑 plan_only 才暴露的 bug）。 */
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
      /* 两档视图切换：取代原来平铺的「选人 / − / ＋ / ⚙️ / 🤝团队」5 个按钮。
       * 办公室 0 人且本会话没有宿主团队时，整组切换**不出现** —— 一个只有一个选项的切换器是噪音，
       * 而且「团队」那一屏当时也确实没什么可看的。 */
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
      /* 「应用到对话」常驻：面板停在哪个画面都在，没选人时置灰（不是隐藏 —— 隐藏了用户就不知道有这个动作） */
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
      /* 清空：**有选人才出现**（破坏性动作不该常驻；没东西可清时它只是噪音）。
       * 清的是选人与阵容，不是聊天记录。 */
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
    /* ⋯ 低频操作：默认不占首屏，展开后仍是一行 */
    moreOpen
      ? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)', background: 'var(--dsw-alias-bg-layer-1,#fff)', fontSize: 12 } },
          React.createElement('span', { style: { opacity: 0.7 } }, t('tp.moreHint')),
          React.createElement('button', { type: 'button', onClick: function () { if (pickerOpen) { setPickerOpen(false); } else { gotoPicker(); } }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, pickerOpen ? t('o.collapse') : t('o.add')),
          React.createElement('button', { type: 'button', onClick: function () { setZoom(Math.max(0.5, zoom - 0.25)); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, t('o.zoomOut')),
          React.createElement('button', { type: 'button', onClick: function () { setZoom(Math.min(2.5, zoom + 0.25)); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, t('o.zoomIn')),
          React.createElement('button', { type: 'button', onClick: function () { setShowSettings(true); setPickerOpen(false); setMoreOpen(false); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, '⚙️ ' + t('o.settings')),
          React.createElement('button', { type: 'button', title: t('tp.resetView'), onClick: function () { setPos({ dx: 0, dy: 0 }); setZoom(zoomInit); setMoreOpen(false); }, style: { cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l1,#ccc)', background: 'var(--dsw-alias-bg-layer-2,#f5f5f5)', color: 'inherit', fontFamily: 'inherit', borderRadius: 6, padding: '3px 9px', fontSize: 12 } }, '↺ ' + t('tp.resetView')),
          /* 运行统计：这些数字对「用插件的人」没有可操作性，所以从标题栏搬到这里。
           * 标题栏留给「我在哪、我能做什么」。 */
          (tok.turns > 0 || tok.in > 0)
            ? React.createElement('div', { style: { flexBasis: '100%', marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--dsw-alias-border-l1,#ccc)', fontSize: 11, opacity: 0.75, lineHeight: 1.7 } },
                React.createElement('div', { style: { fontWeight: 700, opacity: 0.9 } }, '📊 ' + t('tp.statTitle')),
                React.createElement('div', { title: t('o.tip') },
                  (tok.turns > 0 ? t('o.tokensTurns', { turns: tok.turns, steps: tok.steps }) : '') +
                  (tok.cachePct > 0 ? t('o.tokensCache', { pct: tok.cachePct }) : '') +
                  t('o.tokensIn', { x: fmtTok(tok.in) }) + t('o.tokensOut', { x: fmtTok(tok.out) })))
            : null)
      : null,
    /* 拿不到当前会话时**必须看得见**：以前这里是静默的 ——
     * 点角色、应用到对话全都不生效，界面上却没有一个字解释为什么。 */
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
          /* 首次使用引导：办公室画面在「一个人都没选」时是块空画布，
           * 新用户看不出要先做什么。三步一句话，选了人就自动消失。 */
          roles.length === 0
            ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', padding: '6px 10px', fontSize: 12, background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid var(--dsw-alias-border-l2,#eee)' } },
                React.createElement('span', null, '👋 ' + t('o.firstRun')),
                React.createElement('button', { type: 'button', onClick: gotoPicker, style: { cursor: 'pointer', border: '1px solid var(--px-violet,#7c3aed)', background: 'var(--px-violet,#7c3aed)', color: '#fff', fontFamily: 'inherit', borderRadius: 6, padding: '2px 9px', fontSize: 12 } }, t('o.firstRunPick')))
            : null,
          React.createElement(OfficeCanvas, { t: t, roles: roles, leader: leader, zoom: zoom, working: running, done: done, page: page, activity: activity, sessionId: sid, onOpenRole: openRoleDetail, onZoom: setZoom, maxPerPage: maxPerPage }))
    ),
    /* 头像条 + 翻页按钮同行：◀ [全员 emoji] ▶（每页人数来自 settings.maxPerPage） */
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

/* ---------- 工作角色页签（会话内） ---------- */
function WorkingRolesView(props) {
  useRolesStore();   // 订阅：清单懒加载完成后自动重渲染
  var inputActions = props && props.inputActions;
  var t = safeT((props && props.t) || _tFallback);
  /* 会话 id 缺失时回落到当前活跃会话：不回落到「空 sid」桶 ——
   * 那里的选择界面和宿主都读不到，表现成「点了没反应」。 */
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
    if (generating) return; // 防重复点击
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
  var [allPresets, setAllPresets] = React.useState(false);   /* 预设团队递进披露：默认只露 6 个 */
  var [focusIdx, setFocusIdx] = React.useState(-1);          /* 键盘焦点所在角色卡下标（-1 = 无） */
  var searchRef = React.useRef(null);
  var cardRefs = React.useRef({});
  var keyRef = React.useRef(null);
  var [aiOn, setAiOn] = React.useState(CHAT_AI.isOn());
  var [models, setModels] = React.useState([]);
  var [cfg, setCfg] = React.useState(CHAT_CFG.get());
  var [stats, setStats] = React.useState({ calls: 0, fails: 0, budgeted: 0, cached: 0, tokens: { in: 0, out: 0, est: 0 } });
  var listRef = React.useRef(null);
  /* 进入页签/切换分部分类/搜索/语言/会话时，角色列表滚动回顶部 */
  /* 归零：列表自身 + 所有可滚动的祖先容器 */
  function scrollTopAll(el) {
    if (!el) return;
    el.scrollTop = 0;
    var p = el.parentElement;
    while (p) { if (p.scrollTop && p.scrollTop > 0) p.scrollTop = 0; p = p.parentElement; }
  }
  React.useLayoutEffect(function () { scrollTopAll(listRef.current); }, [sid, div, lang, q]);
  /* 页签被重新显示时（隐藏→可见）也滚回顶部 */
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

  /* 只有 AI 开启时才拉模型目录（关闭时零请求，连元数据都不碰） */
  React.useEffect(function () {
    if (!aiOn) return;
    fetchModels().then(function (m) { setModels(m); });
  }, [aiOn]);

  /* AI 开启时轮询调用计数（每 5 秒），关闭即停 */
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
  /* 一键团队编排：把当前选中团队送进 agents_pixe_team 指令（setDraft 可靠路径） */
  function oneClickTeam() {
    var recs = selectedRecords(sid);
    if (recs.length === 0) return;
    STATE.apply(sid);
    var name = STATE.getName(sid) || '';
    /* 未命名预设团队 → 让宿主按「本会话选中的角色」组队（只导入选中的角色卡） */
    var instr = name ? _tFallback('inst.oneClick', { name: name }) : _tFallback('inst.oneClickOffice');
    if (inputActions && typeof inputActions.setDraft === 'function') inputActions.setDraft(instr);
    else fillInput(instr);
    jumpToChat(props);
  }

  /* ---------- 键盘等价路径 ----------
   * / 聚焦搜索 · Enter 开工 · Esc 清搜索 · ↑↓←→ 移动角色卡 · Space 选中/取消
   * window 监听 + keyRef：闭包始终来自最新一次渲染，不会读到过期的 selected / shown。
   * 三条护栏：① 焦点在输入控件里一律不抢键；② 带 Ctrl/Meta/Alt 的组合键不抢；
   * ③ 页签不可见（被隐藏，零尺寸）时直接退出，避免在聊天视图里误吞按键。 */
  function pixVisible() {
    var el = listRef.current;
    if (!el || !el.isConnected) return false;
    var r = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
    if (!r || r.width <= 0 || r.height <= 0) return false;      /* display:none / 零尺寸 */
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
      /* 只在「焦点就在搜索框里」或「根本没在输入」时清搜索；
       * 否则（例如在团队名输入框按 Esc）不越权动别人的输入 */
      var inSearch = !!(searchRef.current && document.activeElement === searchRef.current);
      if (inSearch) { if (q) setQ(''); else searchRef.current.blur(); return; }
      if (!typing && q) setQ('');
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    /* 按钮/链接自带 Enter 与 Space 语义，不抢（否则按一次会触发两次） */
    if (tag === 'BUTTON' || tag === 'A') return;
    if (e.key === 'Enter') { if (selected.length > 0) { e.preventDefault(); oneClickTeam(); } return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveCardFocus(focusIdx + 1); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveCardFocus(focusIdx - 1); return; }
    if (e.key === ' ' || e.key === 'Spacebar') {
      if (focusIdx < 0 || !shown[focusIdx]) return;   /* 没有焦点卡时不吃 Space，保留默认滚动等行为 */
      e.preventDefault();
      toggleRole(shown[focusIdx]);
    }
  }
  /* 不在渲染期写 ref（并发渲染下渲染体不保证只跑一次）：交给 layout effect 每次提交后同步最新处理器。
   * keydown 监听只注册一次，事件里始终读 keyRef.current。 */
  React.useLayoutEffect(function () { keyRef.current = onGlobalKey; });
  React.useEffect(function () {
    function onKey(e) { if (keyRef.current) keyRef.current(e); }
    window.addEventListener('keydown', onKey);
    return function () { window.removeEventListener('keydown', onKey); };
  }, []);

  var btnBase = { cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary)' };
  var chipBase = { cursor: 'pointer', borderRadius: 14, padding: '3px 10px', fontSize: 12, border: '1px solid var(--dsw-alias-border-l1, #ccc)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 };
  /* 模型下拉选项（自动 + 各 provider 的模型） */
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
      /* 新建角色（AI 生成）/ 导入 md */
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
            /* 自定义角色管理 */
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
                    /* 漫游 tabindex：Tab 只落到一张卡（首张或当前焦点卡），卡间移动交给 ↑↓←→。
                     * 带 focusIdx 越界兜底：搜索/切分部把列表变短后，仍然有一张卡可 Tab 进入。 */
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
        /* 底部只留「清空」：主 CTA 统一在顶部一个渲染点
         * （去掉重复的「应用到对话」，见 docs/ui-interaction-simplify.md P0-1） */
        React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--dsw-alias-border-l1, #eee)' } },
          React.createElement('button', { onClick: clearAll, disabled: selected.length === 0, style: Object.assign({}, btnBase, { flex: 1, opacity: selected.length ? 1 : 0.5, cursor: selected.length ? 'pointer' : 'not-allowed' }) }, t('cm.clear'))
        )
      )
    )
  );
}

/* ---------- 设置分区：设置 → agent-teams-pixel（参考 dsh-theme 的 settings.section 设计） ---------- */
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



/* ---------- 插件入口 ---------- */
function apply(ctx) {
  var slots = ctx.get('slots');
  if (slots === undefined) return;
  SESSIONS_SVC = ctx.get('sessions');
  TIMER_SVC = ctx.get('timer');
  LOCALE_SVC = ctx.get('locale');

  /* 与 memory-eternal 一致：slot 注册通过 ctx.effect 托管，刷新/重入时能正确重注册。 */
  var reg = function (label, fn) {
    if (ctx && typeof ctx.effect === 'function') { return ctx.effect(fn, label); }
    return fn();
  };

  /* 注册 agents-pixe 命名空间 zh/en 字典；返回的 t 函数随 DSH locale 自动重渲染。
   * LocaleRuntime.register 同时要求 zh/en 同键集校验——保持两侧键一致。 */
  reg('agents-pixe: locale', function () {
    if (LOCALE_SVC && typeof LOCALE_SVC.register === 'function') {
      /* 注册 zh/en 字典给 agents-pixe 命名空间。LocaleRuntime.register 会在 zh/en 键集不一致时 throw，
       * 这里必须 console.error 暴露根因（让 zh 兜底生效，但用户要能看到是配置问题）。 */
      try { LOCALE_SVC.register(LOCALE_NS, LOCALE); }
      catch (e) {
        try { console.error('[agents-pixe] locale.register(' + LOCALE_NS + ') 失败（zh/en 键集可能不一致）：\n', e && (e.stack || e.message || e)); } catch (_) {}
      }
    }
  });
  var t = (LOCALE_SVC && typeof LOCALE_SVC.bind === 'function') ? LOCALE_SVC.bind(LOCALE_NS) : _tFallback;

  /* 把 DSH 当前 locale 镜像到 persist key `agents-pixe.lang.v1`，宿主侧的
   * memberLang()（team / agents_pixe_team 的成员名中英选择）才能读到正确的语言。 */
  if (LOCALE_SVC && typeof LOCALE_SVC.subscribe === 'function') {
    var writeLang = function () {
      try {
        var lc = String(LOCALE_SVC.getSnapshot().active || 'zh').toLowerCase();
        var cur = lc.indexOf('en') === 0 ? 'en' : 'zh';
        try { localStorage.setItem('agents-pixe.lang.v1', cur); } catch (e) {
          /* localStorage 写入失败（quota / privacy mode）—— 不静默，提醒用户清缓存或检查设置 */
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

  /* label / inject 函数都包 try/catch —— slot 注册是同步链路，任何一步 throw 都会让
   * 整条注册静默丢失（导致浮层 / 设置入口不渲染，但不报错）。这里全部用静默兜底
   * + 原字符串 fallback，确保 slot 一定注册成功。
   *
   * 升级：safeSlotInject 把整个 slots.inject callback 包起来 —— 如果 slots.register
   * 自身或外层 throw（不在 safeLabel/safeInject 内部的 throw），用 console.error
   * 把完整 stack 暴露到 F12 控制台，不再静默丢。 */
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
        return undefined; // 让 slots.inject 走"没注册"的路径；console.error 已经把根因打到控制台
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

  /* 入口跟随会话（重新设计 P0-1 / P0-2）：
   * 会话头动作 + 回合尾卡，两处都只在「本会话名下真有团队」时渲染，无团队时返回 null 不占位。
   * 数据源与会话面板共用 TEAM_STORE（按 sid 去重，一个会话只跑一个轮询器）。 */
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

  /* 对话内的团队工具卡片（P1-2）：key = wire 工具名。
   * 本机实测 tool.call.toolview 的 keyDomain 开放、agents_pixe_* 未被占用（占用键会被本插件替换掉别人的视图，这里不碰）。
   * 每个 key 独立注册、独立容错：一个失败不影响其它。 */
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

  /* 设置分区：设置 → 角色办公室
   * 参考 memory-eternal：settings.section 无条件注册。优先用宿主 settingsScope（老客户端有），
   * 没有（dsh ≥0.1.7 已移除该客户端服务）就用 HTTP 支撑的 _PIXE_FALLBACK_SCOPE
   * ——它读 /agents-pixe/config、写 settings.update，所以开关真的会落到宿主侧。 */
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
