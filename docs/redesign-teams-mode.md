# 重新设计：按 dsh-agent-teams 模式重构团队 UI

> 参考：[NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams)（[README_ZH](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/README_ZH.md)，1.8k star）。
> 本文只做**重新设计**（信息架构 + 交互规范 + 落地锚点），不改代码。
> 配套可点设计稿：[`design/teams-mode.html`](../design/teams-mode.html)。
> 与前作关系：[`ui-interaction-simplify.md`](./ui-interaction-simplify.md) 解决「控件太多」，本文解决「入口太散、运行态看不见」。两者不冲突，后者的 P0-2/P0-3 被本文 P0-3 吸收。

## 0. 一句话定版

现在的入口是**四个散点**（工作角色页签 / 像素办公室浮层 / 浮层里的团队抽屉 / 设置分区），运行态藏在浮层里、计划闸门藏在 API 里。
按参考模式重构为：**跟随会话的一个入口 + 一个双栏面板 + 一道计划闸门**，角色库与像素小人保持不变。

## 1. 参考模式拆解（10 条，逐条带出处）

| # | 模式 | 出处 | 它解决了什么 |
|---|---|---|---|
| M1 | **入口跟随会话**：会话头一个按钮，只在「本会话名下真有团队」时渲染 | `src/client/TeamChatEntry.tsx:10-18`，注册在 `conversation.session.header.actions` | 通用工作区页签会让无关会话也看到入口；跟随会话则「有团队才出现」 |
| M2 | **回合尾卡片**：回合结束才在回复下方出一张团队卡 | `TeamChatEntry.tsx:20-27`，注册在 `conversation.chat.turnTail` | 结果留在对话流里，回看历史能看到当时是谁在干活 |
| M3 | **面板是独立容器，不抢聊天** | `src/client/index.tsx:94-111`（`sidebar.right.pane.tab` + `sidebarRightTabs`），`layout.openRightbar()` | 看团队不等于离开对话；关面板不停团队 |
| M4 | **双栏分工**：左 = 人（队长 + 成员树 + 总进度），右 = 事（依赖图 + 详情卡） | 界面截图 `docs/workspace-181-verification/workspace.png` | 「谁在干什么」和「事情到哪了」是两种视线，硬塞一栏就会互相挤 |
| M5 | **进度 = 任务数分段条**，一个任务一段，颜色 = 状态 | `src/client/ActivityPanel.tsx:302-325`（`team.tasks.map(task => <span data-state=…>)`） | 百分比条丢掉了「哪一项卡住」；分段条一眼看出是哪一段 |
| M6 | **成员行 = 头像 + 名字 + 角色 chip + 模型 chip + 交付计数 n/m + 一行下一步** | `ActivityPanel.tsx:215-262`、`:487+` | 「这个人现在到底在等还是在做」不用点进去猜 |
| M7 | **点任务 → 定位负责成员 + 出详情卡**（前置 / 解锁 / 模型 / 状态） | `ActivityPanel.tsx:331-483`，`onSelectTask` 与 `selectedAssignee` 联动 | 从「哪件事卡了」到「谁负责」零跳转 |
| M8 | **计划先行（staged）**：计划态左侧变**计划编辑器**，三步 stepper + 三出口 | `src/client/StagingPlanEditor.tsx`；文案 `plan.flow.review/spawn/run`、`plan.approve/continue/discard` | 先看分工再烧 token；「放弃」是危险色且二次确认 |
| M9 | **文案即状态机**：一份摘要函数覆盖十种局面 | `ActivityPanel.tsx:269-300`（`staged / allDelivered / ended / failedSettled / blockedAndRunning / running / ready / blocked / waitingSchedule / discarded`） | 界面任何时刻都有一句话解释「现在怎么样」，不靠用户推理 |
| M10 | **i18n 走宿主 locale 服务**，一个 namespace，不自建语言设置 | `src/client/index.tsx:61-64`，`ctx.locale.register('agentTeams', { zh, en })` | 跟随宿主中英实时切换，省掉一套自己的设置 |

## 2. 可行性校准（用 `cordis_inspect_query` 实测**我们这台宿主**）

参考项目能用，不代表我们能用同名落点。以下是实测结论，抄之前先看这一节。

| 参考落点 | 我们宿主（DSH 0.2.0-rc.2 Web） | 结论 |
|---|---|---|
| `conversation.session.header.actions` | 存在：list / session / `replaceRisk: none` | ✅ 直接抄（M1） |
| `conversation.chat.turnTail` | 存在：list / session / none | ✅ 直接抄（M2） |
| `conversation.chat.commandview` | 存在：keyed / session，无占用 | ✅ 可抄（P2 的斜杠命令） |
| `tool.call.toolview` | 存在：keyed，keyDomain 开放，**`agents_pixe_*` 未被占用** | ✅ 可用：把我们的工具调用从 JSON 变成团队卡 |
| `shell.overlay` | 存在：list / root / none | ✅ 我们已在用（浮层） |
| `conversation.view` | 存在：list / session / none | ✅ 我们已在用（工作角色页签） |
| `sidebar.right.pane.tab` | **body 槽存在**（keyed / session / none），但控制 tab 条目的服务 `sidebarRightTabs` **不在客户端服务目录里** | ⚠️ 换实现：先用浮层做双栏，配 `layout.openRightbar(true,false)` |
| `conversation.chat.node` | keyDomain **已被 ChatNodeKind 占满**（assistant-step / turn-tail / tool-call … 全满），要新增得靠 `uiConversation.events.register`，而 `uiConversation` **不在我们的服务目录里** | ❌ 抄不了。替代：`turnTail`（list）+ `tool.call.toolview` |

客户端服务实测目录（8 个）：`layout` / `locale` / `sessions` / `slots` / `theme` / `timer` / `uiWorkspace` / `workspaces`。
参考项目的 `inject` 里声明了 `uiConversation` 与 `modelDirectories`，**这两个在我们宿主不存在**，所以它的客户端半边在本机挂不上去。照抄 slot 名而不做这步校准，结果就是「装上了但整块不渲染」。

## 3. 目标信息架构（4 个落点，取代现在的散点）

| 层 | 落点 | 内容 | 取代 |
|---|---|---|---|
| **L1 会话头** | `conversation.session.header.actions` | 「🧩 团队 (n)」，**仅当本会话名下有团队时渲染** → 打开面板 | 现在要先去浮层点「🤝 团队」 |
| **L2 回合尾** | `conversation.chat.turnTail` | 团队摘要卡：队名 + n 名成员 + 头像行 + 「查看团队」；回合结束才出 | 现在对话里只有工具 JSON |
| **L3 工具卡** | `tool.call.toolview` key `agents_pixe_team` | 把派单 / 步骤 / 汇总渲染成卡片（成员 + 任务 + 结果），不再是 JSON 折叠块 | 现在靠人读 JSON |
| **L4 浮层面板** | `shell.overlay`（已有） | 双栏 + 折叠徽章 + 计划闸门；像素办公室降为面板内的第三个页签 | 浮层里的「团队抽屉」独立形态 |

保留 `conversation.view` 的「工作角色」页签，但**降级为「选人 / 组建」专用**：那是我们的差异化（508 张角色卡 + 29 预设），参考项目没有对应物。
团队**运行态一律走 L4**，页签不再承载运行态（现在的职责重叠就此消除）。

## 4. 面板规范

### 4.1 双栏（宽屏并排，窄栏自动堆叠）

| 左栏（人） | 右栏（事） |
|---|---|
| 队长卡：像素小人 + 「队长 拆解 · 派发 · 汇总」 + 一句话现状 + 状态徽章 | 区块头「任务依赖」+ 右侧摘要「已结束 · n 名成员 · n/n 完成 · n 条消息」 |
| **总进度**：分段条，段数 = 任务数，颜色 = 状态；图例「进行中 n · 等待依赖 n · 已交付 n」 | **依赖图**：按依赖深度分列，卡片 = 状态点 + 任务 id + 负责人 + 主题（两行截断） |
| **成员树**：从队长挂出的连接线；每行 头像 + 名字 + 角色 chip + 模型 chip + 「已交付 n/m」+ 一行下一步 + 本回合任务 chip | **详情卡**：选中任务的状态 / 负责人 / 前置 / 「完成后解锁 t3、t5」/ 模型 |
| 底部横幅：全局一句话摘要（M9 的状态机文案） | |

### 4.2 计划闸门（staged 态）

进入 `phase === 'staged'` 时，左栏整体换成**计划编辑器**，右栏仍显示预览（同一份数据的两种用法）：

- 区块头：`plan.flow` 三步 stepper：**审查计划 → 创建成员 → 开始执行**（当前步高亮）
- `成员与模型路由 (n 名成员)`：可折叠；每行 名字 + 角色 + 模型路由 + `›`
- `任务与依赖 (n 项任务 · n 条依赖)`：可折叠；每行 任务 id + 主题 + 负责人 + 依赖摘要 + `›`
- `新增计划任务`：输入 + 「添加任务」
- 收尾卡「计划检查完毕?」+ 说明「确认后将创建 n 名成员并调度 n 项任务」
- **三出口**：`确认并启动团队`（主，蓝）/ `返回对话修改`（次）/ `放弃本次计划`（危险色，**二次确认**）

### 4.3 折叠徽章

面板折叠后不是一条空白窄条，而是带计数的徽章：`● 3 名成员 · 4/6 完成`，运行中有呼吸点。重建入口的成本降到一次点击。

### 4.4 文案状态机（照搬 M9 的十态，键名对齐宿主 locale）

`team.summary` 一个函数出口，覆盖：`staged / allDelivered / ended / failedSettled / blockedAndRunning / running / ready / blocked / waitingSchedule / discarded`。
任何时刻界面上必须有一句话在解释现状，禁止只显示数字。

## 5. 保留的差异化（不要为了像参考而砍掉）

| 我们独有 | 为什么留 |
|---|---|
| 508 张 agency-agents 角色卡 | 参考只有 `cordis.patch.yml` 里的 profile 名单；我们是「库 + 一键成军」 |
| 29 个预设中文团队 | 参考要手写 profile；我们点一下就有 |
| 像素办公室（canvas 会动的小人） | 参考用静态 sprite；这是我们的品牌记忆点，保留为面板第三页签 |
| 角色卡详情弹窗 / 点击像素人 / AI 闲聊 | 参考没有对应物 |

## 6. 分期实施

> 状态列更新于 2026-10-02：**P0 全部 + P1-1/P1-3/P1-4 已落地源码并构建进包**（`lib/client.js` 232.5 KB，166/166 测试通过）。
> 代码锚点见 `src/client.main.js` 的 `TEAM_STORE` / `TeamPanel` / `ProgressSegments` / `MemberTree` / `DAGraph` / `TaskDetail` / `PlanGate` / `SessionTeamEntry` / `TurnTailTeamCard`。

### P0（纯前端，只用实测存在的 slot，不动 host 端点）

| # | 动作 | 落地形态 | 状态 |
|---|---|---|---|
| P0-1 | 会话头「团队 (n)」入口，仅在有名下团队时渲染 | `SessionTeamEntry` 注册在 `conversation.session.header.actions`，无团队返回 `null` | ✅ |
| P0-2 | 回合尾团队摘要卡 | `TurnTailTeamCard` 注册在 `conversation.chat.turnTail`，全部结算后自动消失 | ✅ |
| P0-3 | 浮层改双栏（左人右事），删掉独立「团队抽屉」 | `OfficeOverlay` 改两档视图切换（办公室 / 团队）+ `⋯` 低频抽屉；`TeamPanel` 左栏 330px / 右栏自适应 | ✅ |
| P0-4 | 分段进度（一段 = 一任务） | `ProgressSegments`：`tasks.map` 生成段，颜色由 `taskStateColor` 决定 | ✅ |
| P0-5 | 成员树（名字 + 角色 + 交付计数 + 下一步 + 任务 chip） | `MemberTree`：连接线 + 每成员一行下一步文案 + 任务状态色 chip | ✅ |
| P0-6 | 文案状态机十态 | `teamSummary(team, t)` 单一出口，键名 `tp.sum.*` | ✅ |
| P0-7 | 折叠徽章带计数 | 折叠态显示「n 名成员 · done/total 完成」，点击直接切到团队视图 | ✅ |
| P0-8 | 单轮询器（新增，做的时候才发现必须做） | `TEAM_STORE`：按 sid 去重、后台标签页跳过、内容签名不变不通知订阅者；全文件只有一个 `teams/view` 拉取点 | ✅ |

### P1

| # | 动作 | 状态 |
|---|---|---|
| P1-1 | 计划闸门接后端草案层（`plan/confirm` · `plan/discard`） | ✅ `PlanGate`：三步 stepper + 成员/任务两个可折叠区 + 加任务 + 三出口 + 放弃二次确认 |
| P1-2 | `tool.call.toolview` key `agents_pixe_*` | ✅ 8 个工具各一张卡：实时状态 + 分段条 + 成员 chips + 「查看团队」；**不解析参数**，直接读 `TEAM_STORE` |
| P1-3 | 停止入口移到面板标题 + 二次确认 | ✅ 面板头「⏸ 暂停派单」→ 再点一次确认；恢复为单击 |
| P1-4 | 点任务 → 高亮负责成员（跨栏联动） | ✅ `DAGraph` 的 `pinned` / `picked` 双向联动 + `TaskDetail` 前置/解锁 |

### P2

| # | 动作 | 状态 |
|---|---|---|
| P2-1 | 宿主命令 `/pixe-team <目标>` + `conversation.chat.commandview`（对应参考的 `/agent-teams`） | ⏳ 未做（宿主 `commands` 契约已探明：`register({name, description, input, handler})`，handler 收 `{commandId, agent, rawInput, signal}`） |
| P2-2 | 面板几何记忆（位置/缩放/折叠态落盘） | ✅ `localStorage['agents-pixe.overlay.v1']` + 读回夹取可视区 + 防抖写 + `⋯` 内「重置位置与缩放」 |
| P2-3 | 状态目录改到工作区相对路径 `<workspace>/.agent-teams/` | ⏳ 未做（涉及迁移，收益低） |

## 7. 验收断言

1. **入口跟随会话**：无团队时不渲染会话头按钮与回合尾卡（`test/teams-mode-redesign.test.mjs` 卡住 `if (!team) return null`）。
2. **单轮询器**：全文件只有一个 `fetch('/agents-pixe/teams/view')` 拉取点，`TeamPanel` 内不得出现 `setInterval`。
3. **分段进度**：段由 `tasks.map` 生成，颜色由 `taskStateColor(states[i])` 决定。
4. **计划闸门**：三出口齐全（`tp.approve` / `tp.continue` / `tp.discard`），放弃与暂停都必须二次确认。
5. **状态机**：九种 `tp.sum.*` 文案 + `teamSummary` 只有一处定义。
6. **槽位校准**：`slots.inject` 用到的每个 slot 名都必须在本机实测白名单内。
7. **i18n**：新增 93 对文案，zh/en 键集一致（`test/locale-key-parity.test.mjs`，实测 297/297）。
8. **零 em-dash**；`npm run check` 全绿。

## 8. 风险与边界

- **R1 服务缺失即整块消失**：客户端 `inject` 声明不存在的服务，cordis 永不调用 `apply()`，现象是「装了但什么都不显示，F12 也没线索」。本项目历史上踩过 `settingsScope`。任何新落点先跑第 2 节的校准。
- **R2 右栏页签不是稳的**：`sidebar.right.pane.tab` 的 body 槽在，但注册 tab 条目要的 `sidebarRightTabs` 服务不在目录里。P0 先用浮层做双栏，等宿主补齐再迁。
- **R3 会话内节点抄不了**：`conversation.chat.node` keyDomain 已满，`uiConversation` 服务不存在。要「对话里长出团队卡」，只能用 `turnTail` + `tool.call.toolview`。
- **R4 不为了像参考而砍功能**：508 卡 / 29 预设 / 像素办公室是差异化，只换承载方式，不删能力。
- **R5 不碰 host 端点与 `lib/team-engine.js`**：P1-1 只用 0.2.10 已有的三个端点。

## 9. 本稿自检（2026-10-02）

| 项 | 结果 |
|---|---|
| 参考项目事实 | 源码与截图取自仓库 main 分支（`README_ZH.md`、`src/client/index.tsx`、`TeamChatEntry.tsx`、`ActivityPanel.tsx`、`locales.ts` 与 `docs/workspace-181-verification/*.png`） |
| 落点可行性 | `cordis_inspect_query`（client Slots / client Service）在本机实测，结论见第 2 节 |
| 设计稿脚本 | [`design/teams-mode.html`](../design/teams-mode.html) 内联脚本 `node --check` 通过（exit 0） |
| 引用完整性 | `$('id')` 44 处引用 vs HTML 47 个 `id` 声明，**0 悬空** |
| 行尾 | 新建与改动的文件已归一为 CRLF，符合 `.editorconfig` |
| **未做** | **视觉渲染验证**：本机 Chrome 与 Edge 的无头模式均被环境拦截（`--headless=new` 返回 exit 21、零输出、不产图），所以「长得对不对」需要你双击打开确认 |

一句话：**逻辑与结构有自动化证据，像素级外观没有**。打开设计稿若有错位，把截图发我即可对位修。
