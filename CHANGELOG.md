# Changelog

本项目所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布 · 2026-10-06b] - 修根因 2：浮层拿不到会话 id（点角色 / 应用到对话全失效）

> 用户反馈（在点击穿透修好之后）：**点击角色与应用到对话 无效**。
> 截图给出决定性线索：`像素办公室 (0)` + `草稿 0 人` + `应用到对话（先选人）` —— 三处同时说明浮层认为当前会话一个人都没有。

### 🔴 根因：`useSessions` 的选择器字段是**我们自己臆造的**

- 原代码：`var sid = useSessions(s => s && s.current)`。
- 宿主的真实快照形状（从 `app.asar` 里扫出的 DSH 自身调用点）：
  `{ phase, byId: { [sid]: { id, retainedBy: { mainView }, cwd, blank } }, projectionsBySession }`
  **根本没有 `current` 字段** → 选择器永远返回 `undefined` → 浮层退化成「会话盲」，只能靠 `ACTIVE_SID` 兜底（那是工作角色页签设的，用户不开页签就是 null）。
- 连带后果三个全中：①办公室恒显示 `0` 人；②点角色被写入口拒绝 → **静默无反应**；③「应用到对话」永远置灰。
- 修复：照抄宿主自己的写法解析主会话 —— `Object.values(s.byId).find(x => (x.retainedBy.mainView || 0) > 0)?.id`；并且**只在拿到真实 sid 时才写 `ACTIVE_SID`**（否则浮层这一次 undefined 会把页签刚设好的值冲掉）。

### 🟠 不再允许静默：拿不到会话时给出可见降级

- 新增提示条：`⚠ 还没确定当前会话：选人 / 应用到对话暂不可用。打开一次「工作角色」页签再回来即可绑定。`
- 这条比修复本身更重要：**「点了没反应」这类 bug 之所以三轮没查出来，就是因为它完全没有声音。**

### 🧪 测试台补强（关键教训）

- 上一轮我写的假 `useSessions` 返回 `{ current }` —— **那是不存在的形状**，于是测试台「验证」通过了一条现实中必然失败的路径。测试台喂假数据必须以**宿主真实契约**为准，否则只是把错误结论粉饰得更像真的。
- 现在假快照严格照真实形状，并新增断言：**只有 `current` 的假快照绝不能被解析出会话**。
- 新增 3 条：会话来源形状（正反两面）、无会话必须有可见降级、**点角色行后界面上的人数必须变**。

### 测试

`node --test` **229/229**（+3）。`lib/client.js` 223.9 KB / 门槛 240 KB。已部署。

## [未发布 · 2026-10-06] - 修根因：浮层整块点击穿透 + 建立真实交互测试台

> 用户反馈：**全部功能需要重新验证，有些操作失效，尤其是在浮窗：选人无法触发。**
> 这一轮不再靠读代码推理，而是先把「真的渲染 + 真的点击」的测试台建起来。

### 🔴 根因：`shell.overlay` 默认点击穿透，我们从未 opt-in

- DSH 自己的 slot 文档（从 `app.asar` 里直接扫出的原文）：
  > register into `shell.overlay` instead (a list slot: additive, and **click-through until your entry opts into pointer events**)
- 我们的浮层根容器**从来没有设置过 `pointerEvents`**（全源码只有一处无关的 `pointerEvents === 'none'` 判断）。
- 后果：浮层里的**每一个按钮点击都穿到下面的应用**，浮窗看起来完全正常却点不动，而且**没有任何报错** —— 这解释了为什么前几轮我改的 `gotoPicker()`、`pickerOpen` 分支优先序等「逻辑修复」全都无效：**点击根本没到达按钮**。
- 修复：浮层根容器与折叠徽章都加 `pointerEvents: 'auto'`（占用者主动取回指针事件）。

### 🟠 同类静默失效：`fillInput` 抓 DOM

- 「应用到对话」一直通过 `document.querySelector('textarea')` + `window.HTMLTextAreaElement.prototype` 的 value setter 写入。宿主只要换一次输入框实现（contenteditable / shadow root / 改 class），它就**静默返回 false**，控制台无报错。
- 修复：新增 `writeComposer(inputActions, text)` —— **优先宿主官方 API `inputActions.setDraft`**（工作角色页签一直用的是它，所以只有浮窗这条路会静默失败），DOM 抓取降级为兜底。浮层、计划闸门、团队面板的 6 处写输入框全部改走它。

### 🧪 新增：真实交互测试台（这是本轮最有价值的产出）

- `test/helpers/mini-react.mjs`：迷你 React（useState/useEffect/useRef/useMemo/useSyncExternalStore 等），返回可遍历的纯对象树，不碰 DOM。
- `test/helpers/client-harness.mjs`：用 `vm` 把**真实 `lib/client.js`** 跑起来，喂一套最小可用宿主面（slots / locale / sessions / timer / fetch / canvas 2d 代理），把浮层注册结果取出来。
- `test/ui-interactions.test.mjs`：**真的渲染浮层、真的点按钮、真的断言状态变了** —— 10 条，覆盖：浮层注册与渲染、0 人无切换器、**opt-in 点击（根因守卫）**、折叠徽章可点、选人打开面板、从团队页签切回选人、点角色行写进正确会话桶、清空、应用到对话、退化场景不写空桶。
- **为什么必须建它**：此前所有 UI「验证」都是对源码做正则断言，那种测试**永远抓不到「点了没反应」** —— 病灶在运行时状态机与真实宿主契约里。这个测试台第一次跑就抓到了两个真 bug（其中一个是我自己上一轮加的守卫把「写错桶」变成了「静默无效」）。

### 测试基建

- `node --test`（不带参数）会把 `test/` 下**所有文件**当测试跑，包括 helpers，导致挂载浮层后定时器让子进程永不退出 → 脚本改为 `node --test --test-force-exit "test/*.test.mjs"`（并加上逐用例超时）。

### 测试

`node --test` **226/226**（+10 条真实交互）。`lib/client.js` 223.1 KB / 门槛 240 KB。已部署。

## [未发布 · 2026-10-03n] - 入口改名：避免与宿主原生「团队」撞名

### 现象

用户报告：**团队没有人，却显示团队 2**（截图里办公室显示 `(0)`，而顶部那个入口显示 `团队 (2)`）。

### 定位（先查是不是我们的按钮）

1. **先证伪「我们的入口在说谎」**：直接问宿主 `GET /agents-pixe/teams/view?lead=<会话>` → `members` 空、`tasks` 空；`~/.dsh/agents-pixe/teams/` 目录也是**空的**。而 `SessionTeamEntry` 在 `teamOf(data)` 为 null 时 `return null`，**此刻我们的入口根本不渲染**。
2. **再查那个按钮是谁的**：用客户端 Inspect 读 `conversation.session.header.actions` 的实时占用者：

   | order | id | 注册方 |
   |---|---|---|
   | -30 | `subagent-catalog` | 宿主 |
   | **-20** | **`agent-team`** | **宿主** ← 就是那个「团队 (2)」 |
   | -10 | `agent-preset` | 宿主 |
   | 20 | `job-list` | 宿主 |
   | **50** | **`agents-pixe-team-entry`** | 我们 |

   **结论：那是宿主自带的「智能体团队」入口（2 名原生成员），与本插件的像素团队是两个互不相干的东西。**

### 修复

- **根因是命名撞车**：两个按钮紧挨着，都叫「团队」，一个说 2 一个说 0 —— 用户不可能不误解。我们的入口改为自称 **「像素团队 (n)」**（en: `Pixel team`），提示语也说清「与宿主的智能体团队相互独立，各算各的」。
- 顺带修掉一个隐患：英文字典里残留了旧的 `'tp.entry'`（重复键会被静默覆盖），现在 zh/en 各只有一处，并有断言守卫。

### 测试

`node --test` **216/216**（新增 1 项：入口必须自称「像素团队」、`tp.entry` 不得重复、提示语必须说明独立性）。
`lib/client.js` 222.5 KB / 门槛 240 KB。已部署。

## [未发布 · 2026-10-03m] - 办公室 0 人时不提供「团队」这一屏

### 变更

- 用户要求：**当办公室 0 时则不需要使用团队**。以前「🏢 办公室 | 🤝 团队」两档切换器常驻，办公室一个人都没有时「团队」那一屏只是把空态和「去选人」再说一遍 —— 一个只有一个选项的切换器是噪音。
- 现在整组切换器**按需出现**，判据是**两条一起看**：
  ```js
  var hasTeamView = roles.length > 0 || !!(tv && ((tv.members||[]).length || (tv.tasks||[]).length || tv.plan));
  ```
  后半句**不能漏**：清空选人之后如果直接隐藏入口，那份已完成的团队信息（含最终报告）就再也打不开了。
- 用**派生视图**（`effView = hasTeamView ? view : 'office'`）而不是改 state：人再选上时，用户原先停在「团队」的偏好会自动恢复。主体分支、切换器高亮、容器宽度（`minWidth`）三处统一改用它 —— 只改主体不改宽度的话，办公室会被撑成 900px 宽。

### 测试

`node --test` **215/215**（新增 1 项：存在条件必须同时看两条、必须用派生视图、容器宽度不得再用原始 view）。
`lib/client.js` 222.4 KB / 门槛 240 KB（余量 17.6 KB）。已部署。

## [未发布 · 2026-10-03l] - 修复「选人」点了没反应

### 现象

用户报告：**选人 点击无法生效**。运行的是 06:17 的版本（进程 06:20:58 重启，晚于部署）。

### 定位过程（先证伪再定罪）

1. **先证伪「勾选坏了」**：读用户机器上的持久化数据，会话 `session-ff11237a…` 的 `draft.roles` 正好是 `project-manager-senior, engineering-frontend-developer` —— 与他截图里的两个人一致。**说明勾选链路是好的**，坏的只有「选人」这个入口。
2. **看渲染分支**（根因）：
   ```js
   view === 'team' ? <TeamPanel/>        // 团队页签优先
   : showSettings ? <设置/>
   : pickerOpen   ? <选人/>              // ← 置了 pickerOpen 也轮不到它
   : <办公室画布/>
   ```
   `⋯` 抽屉里的「＋ 选人」只做了 `setPickerOpen(!pickerOpen)`，**没有切视图**。停在「团队」页签时置 `pickerOpen` 不会渲染任何东西，抽屉还顺手把自己关了 —— 表现就是「点了没反应」。
3. **为什么用户必然撞上这一条**：他的会话里有一份 5 人计划草案，所以团队面板渲染的是**计划闸门**分支，上一轮新加的「👥 选人」按钮根本不在这一屏；他能点的「选人」只有抽屉里那一个。

### 修复

- 新增**唯一入口** `gotoPicker()`：切到办公室视图 + 关设置/抽屉 + 开选人面板。三个入口（抽屉的「＋ 选人」、首次引导的「＋ 选人」、团队面板的「👥 选人」）全部走它。
- 在 `gotoPicker()` 上写清根因注释（「团队页签优先会吃掉 pickerOpen」），防止以后又有人单独置 `pickerOpen`。

### 同类防守（同一个 bug 家族）

- **写操作绝不落进「空 sid」桶**：会话 id 缺失时 `mut()` 直接放弃写入，而不是写进 `''` 桶 —— 那种写入界面与宿主都读不到，症状同样是「点了没反应」（用户机器上确实存在这个桶）。
- 读操作（`getDraft`/`getActive`/`getLeader`/`getName`）与工作角色页签的 `sid` 统一回落到 `ACTIVE_SID`，保证**读写不会落到不同的桶**。

### 测试

`node --test` **214/214**（新增 2 项回归：所有「选人」入口必须同时切视图、写操作必须拒绝无会话写入）。
`lib/client.js` 222.2 KB / 门槛 240 KB。已部署。

## [未发布 · 2026-10-03k] - 按用户体验重新梳理（不再是逐个补功能）

> 用户要求：**重新梳理，按用户体验的角度去完成**。所以这一轮不是加功能，是把已有交互按用户视角重排。
> 梳理出的四条原则，以及每条对应的改动：

### 原则一：标题栏回答「我在哪 / 我能做什么」，不放遥测

- 标题栏原来最宽的一格是 `15 轮 · 539 步 | 缓存命中 99% | 输入↑234.4M | 输出↓460.3K`。这些数字**对用户没有可操作性**，还挤得标题栏换行。
- 现在标题行只剩 `● 像素办公室 (n)`；遥测搬进 `⋯` 抽屉，成为带标题的「📊 运行统计」区块（要查还在，不挡路）。

### 原则二：破坏性动作不常驻

- 「🗑 清空」原来常驻置灰。现在**有选人才出现** —— 没东西可清时它只是噪音。主行动「✅ 应用到对话」保持常驻置灰（它是入口，隐藏了用户就不知道有这个动作）。

### 原则三：空态必须给「下一步」，而且是人话

- 团队面板空态原本文案是「在工作角色页签选人后，用 **agents_pixe_team_create** 建团，或直接说…」——**这是给开发者看的**，用户不需要知道工具名。
- 现在换成两个真按钮：**「🚀 用它开工」**（把 `用真团队引擎拆解：` 填进输入框并跳到对话，用户补上目标就能发）与 **「👥 选人」**（`PANEL_CTL.open('pick')` 直达选人，不用自己找页签）；提示改成一句人话。
- 新增断言：面向用户的文案里不得再出现工具名。

### 原则五：新用户第一眼要知道从哪开始

- 办公室画面在「一个人都没选」时是一块**空画布**，新用户看不出要先做什么。
- 现在顶部出现引导条 `👋 第一次用？三步：选人 → 应用到对话 → 让它开工 [➕ 选人]`，选了人自动消失。

### 原则四：可点击的行必须键盘可达

- 上一轮我把阵容行做成了 `clickable div`：不能 Tab 聚焦、不能回车展开 —— **只对鼠标用户可用**。这是我自己上一轮指出的缺口，这一轮补上：阵容行与「当前阵容」区块的折叠头都加了 `role="button"` / `tabIndex: 0` / `aria-expanded` / 回车与空格处理。

### 测试

`node --test` **212/212**（本轮 +5 项，逐条对应上面四条原则 + 可达性）。
`lib/client.js` **221.9 KB / 门槛 240 KB**（余量 18.1 KB）—— 这轮改动净增 2.5 KB，上一轮压缩腾出的空间正好接住。

### 状态

已部署。生效需重启 DSH。

## [未发布 · 2026-10-03j] - 阵容详细信息实时显示 + 构建期缩进压缩

> 用户要求：**团队详细信息只要有角色则实时显示**（截图中「当前阵容」只有一排小标签）。
> 同时兑现上一轮立的规矩：加新功能之前先压缩体积，而不是抬门槛。

### 新增

- **当前阵容从「一排小标签」升级为可展开的详细信息列表**（新组件 `RosterList`，无状态纯组件）：
  - 每行给到：**序号 / 👑 领袖冠**、主题色圆点、角色名（含 emoji）、**分部标签**、**角色描述**；
  - 点开一行还有：**角色 id**、语言、以及「**设为领袖**」按钮（就地改，不只是显示）；
  - 状态徽章区分 `👑 本会话领袖` / `待建队`；
  - **两处复用同一个组件**：还没建队时是主视图（常驻展开），已有宿主团队时是补充区块（默认收起，避免和成员树打架）。
  - 「只要有角色就显示」：与是否建队无关，靠 `useActiveKeys` 订阅 STATE，勾选即刷新。

### 构建

- **新增行首缩进压缩**（`scripts/strip-comments.mjs` 扩展，同一台状态机）。三条安全约束都可测：
  ① **只压行首空白**，不压行内空白；② **绝不删换行** —— 换行是 ASI 的判据，动了它就可能悄悄改语义，缩进不是；③ 字符串 / 模板 / 正则状态整体原样复制。
  效果：`238.6 KB → 219.4 KB`，**省下 19.2 KB**（含注释共省 48.5 KB）。门槛余量从 **1.4 KB 恢复到 20.6 KB**。
  新增 4 项断言：行首压缩的正确性、模板/字符串绝不被碰、**换行总数必须与源码一致**、产物里行首缩进必须为 0。

### 测试

`node --test` **207/207**（本轮 +5 项：阵容详细列表组件与两处复用、四个新文案 zh/en 配对、缩进压缩 4 项）。
`node --check lib/client.js` 通过；`test/bundle-loads.test.mjs` 实际执行了压缩后的产物（不是只看字节数）。

### 状态

已部署。生效需重启 DSH。

> 体积纪律记一笔：这是**第二次**靠压缩而不是抬门槛解决余量（第一次是注释剥离省 27 KB）。下次再撞墙时，下一个杠杆是「去掉行内多余空白」，但那要单独评估 —— 它对 ASI 已经不敏感（换行仍在），风险比这次低，收益也更小。

## [未发布 · 2026-10-03i] - 会话完全隔离：草稿也按会话存

> 用户要求：**每个会话要隔离独立，互不干预影响**。这一刀正好砍在上一轮改动的破绽上。

### 修复

- **草稿（draft）从全局改为按会话存**。上一轮为了「选人即生效」加了同步，但草稿本身仍是**跨会话共享**的 `globalDraft`，于是「A 会话选 5 个 → 切到 B → B 的页签显示同样 5 个，一勾就把 A 的阵容写进 B」。
  - 现在 `bySession[sid] = { draft, active }`，两者恒等（`active` 是给宿主读的别名）。`getDraft / addDraft / removeDraft / clearDraft / getLeader / setLeader / getName / setName` 全部接受会话参数。
  - **53 处调用点全部改为显式传会话**（脚本化替换 + 断言「store 之外不得再出现不带参数的 STATE 调用」，`RolePicker` 也补上了 `sid`）。不再靠全局 `ACTIVE_SID` 兜底 —— 那在切会话的过渡帧里会写错会话。
  - 新增断言型测试：store 之外任何 `STATE.x()` 空参调用直接判失败。
- **旧数据迁移**：早期持久化里只有 `active` 没有 `draft`（还有一份全局 `draft`）。加载时按会话补出 `draft = active`（每个会话保住自己那份名册），全局草稿只在「本次加载的首个会话」播种一次、随后丢弃 —— 这样既有的一次性配置不丢，又不会再把一个人的选择糊到所有会话上。
- 播种规则收紧：只有**本次加载的首个会话**会继承最近工作配置，其余新会话（含切对话）从空开始。

### 现场证据（用户机器上的真实持久化数据，修前）

```
顶层键: draft, lastApplied, sessions
[全局草稿] name=研发团队  roles=(空)            ← 名字与勾选不同步
[会话 ff11237a…] active = 3 人
[会话 (空 sid)]  active = 5 人                  ← 同一个"团队"在两个桶里不一样
[会话 fb1259b8…] active = (空)
```
三个互不相同的名册 + 一份空草稿 —— 这正是「切会话互相影响」的后果。

### 测试

`node --test` **202/202**（本轮 +2 项：每个会话一份草稿且旧数据能迁移、所有调用点必须显式带会话；另修正 2 项因签名变化而过期的断言 —— 它们正确地抓到了这次重构）。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` **234.1 KB / 门槛 240 KB，余量 5.9 KB**）；已部署。生效需重启 DSH。

> ⚠️ 余量只剩 5.9 KB。下一轮若要做**新功能**，先做「代码缩进/空白压缩」（剥离器里已有模板字符串状态，缩进压缩是安全的），不要抬门槛。

## [未发布 · 2026-10-03h] - 选人即生效：勾选/清空/阵容三者对齐

> 用户给的功能定义：**勾选后实时更新到团队界面和办公室界面；「应用到对话」只负责把模板写进对话框；增加清空；选人功能要确保正确。**

### 修复

- **「勾了人但办公室没动静」**。根因是状态模型里有两套东西：勾选写 `draft`，而**办公室界面、宿主 `agents_pixe_team`（读 `persist.json` 的 `sessions[sid].active`）读的都是 `active`**；以前只有按「应用到对话」才把 `draft` 抄进 `active` 一次。
  - 现在加 `syncActive()`：`addDraft` / `removeDraft` / `clearDraft` / `setLeader` / `clearLeader` 每次改动后**立即**把草稿同步到当前会话的 `active`。于是**用户看到的界面**和**宿主真正吃到的名册**恒等 —— 这同时消掉了一类「UI 显示 5 个人，宿主只组到 2 个」的错位。
- **清空只清了草稿，没清阵容**（`clearActive` 写好了但**从来没人调用**）。后果是：清空选人后办公室还站着旧人，宿主还会照旧按旧名册组队。
  - 新增 `clearSelection()` 统一路径：草稿 + 本会话 `active` 一起清，浮层、选人抽屉、工作角色页签三处复用同一条路径（不再各写一套）。
- **团队界面在还没建队时只显示一句「当前会话还没有活动团队」**，把用户刚勾的人藏了起来。
  - 改成显示**当前阵容**卡：`当前阵容 · n 名成员` + 角色 chips + `清空` + `应用到对话`。靠 `useSyncExternalStore(STATE.subscribe, …)` 订阅，勾选时实时更新；同时订阅角色索引，避免索引未到位时短暂显示成空。

### 变更

- 「应用到对话」语义收敛为**只把成员清单模板写进对话框**（`shortInstruction` + 跳转），不再是「让办公室更新」的唯一途径 —— 那条路已由 `syncActive()` 接管。切会话后仍会补一次 `apply()`，覆盖「新会话还没同步过」的情况。
- 浮层标题栏在「应用到对话」右侧新增常驻「🗑 清空」，顺序为 `应用到对话 → 清空 → ⋯`；没选人时两者都置灰。

### 测试

`node --test` **200/200**（本轮 +4 项：选人即生效的五个入口都必须 syncActive、清空必须同时清两处且三处复用同一路径、团队界面空态必须显示阵容且旧空态已移除、「应用到对话」只填模板）。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` **233.2 KB / 门槛 240 KB，余量只剩 6.8 KB**）；已部署。生效需重启 DSH。

> ⚠️ 余量提醒：注释剥离当年省下的 27 KB 已被这几轮吃掉。下一轮若再加功能，应先做「代码缩进/空白压缩」而不是抬门槛 —— 门槛是防「角色清单被塞回包」的，不是配速旋钮。

## [未发布 · 2026-10-03g] - 团队成果可见 + 轮询分档降频 + 快照只读语义

> 三处都是上一轮「任务结束后持续显示团队信息」的**自然延伸** —— 把信息留住之后，接下来要解决的是「留住的信息有没有用、成本对不对」。

### 新增

- **面板里终于能看到最终报告**。报告一直写在状态文件里（`lastReport`），但 `view()` **不返回它**，所以界面上任何地方都看不到，用户只能翻聊天记录找。
  - 引擎 `view()` 补出 `lastReport` / `archivedAt` / `oneShot` / `teamName` 四个字段（类型稳定，客户端不用判 `undefined`）。
  - 面板底部新增「📄 最终报告」可折叠区：字数、复制按钮、`已归档` 标识、内容区限高可滚。默认收起（报告可能很长）。

### 变更

- **轮询从两档改成三档**。上一轮把「任务结束后团队信息永久保留」做成默认行为之后，原来的「有团队就 4 秒」意味着**绝大多数会话会永远停在最高频率**（每小时 900 次 `teams/view`）—— 这是上一轮引入的成本，这一轮还掉：
  | 档 | 间隔 | 判据 |
  |---|---|---|
  | ACTIVE | 4s | 有草案待确认，或有 pending/claimed/in_progress/running 任务 |
  | SETTLED | 15s | 有成员或任务但已全部结算（历史） |
  | IDLE | 30s | 本会话还没有团队 |
  取所有已订阅会话里**最急**的那一档。
- **一次性编排快照不再显示「暂停派单」按钮**，并加一行「只读历史」说明。给一个没有可派发对象的团队显示暂停按钮只会误导；判定收敛到 `isDispatchable()` 一处：有可派发任务、或当前已暂停，才出现该按钮（原生只读投影与一次性快照一律不出现）。

### 测试

`node --test` **196/196**（新增 4 项：`view()` 必须带出 `lastReport`/`archivedAt`/`oneShot`、轮询三档存在且旧二档判定已移除、报告区读 `lastReport` 且带复制与归档标识、一次性快照不出暂停按钮）。

### 状态

`node --check` 全通过；`npm run build:client` 已执行（`lib/client.js` 228.8 KB / 门槛 240 KB）；已部署。**改动含宿主半边（`lib/team-engine.js`），必须重启 DSH 才生效。**

## [未发布 · 2026-10-03f] - 任务结束后持续显示团队信息

### 修复

- **回合尾团队卡在任务全部结算后自动消失**。这是我当初刻意写的「整洁」规则（`if (!c.live) return null`，理由是「历史入口交给会话头按钮」），但它违背了用户的真实需要：**任务结束了，团队信息应该保留着持续显示**。
  - 现在结算态**不隐藏**，而是退化成紧凑一行：`● 🧩 团队 · n 名成员 · 全部 n 项任务已交付 · [查看团队]`。信息在、不占地方，也不会每回合甩一张大卡。
  - 会话头入口、折叠徽章、面板三处本来就会保留（`view()` 始终返回成员与任务，宿主侧也没有任何清空动作 —— 已核对 `report()` 只追加归档、`refreshStatus()` 只改状态不删成员）。
- **一次性编排（`agents_pixe_team` 非引擎路径）从不留痕**，磁盘上什么都没有，于是面板/会话头/尾卡在跑完后依然显示「当前会话还没有活动团队」——用户看到的是「团队信息从未出现」，比「被清空」更糟。
  - 新增 `recordRunDirect()`：把一次性编排的成员/任务/报告写成一份**只读历史快照**（`oneShot: true`，任务全部标记 `completed`，所以 `step()` 不会去派发不存在的成员）。
  - **已有真团队状态时绝不覆盖**（真团队优先）；写快照失败也绝不影响本次编排结果。

### 测试

`node --test` **192/192**（新增 2 项：一次性快照可被 `view` 读出且不覆盖真团队；另把「结算后必须隐藏」的旧断言反向钉死为「结算后不得隐藏」）。

### 状态

`node --check` 全通过；`npm run build:client` 已执行（`lib/client.js` 225.4 KB）；已部署。**改动含宿主半边，必须重启 DSH 才生效。**

## [未发布 · 2026-10-03e] - 修复「确认草案」无法建成员（真跑 plan_confirm 才暴露）

### 修复

- **计划闸门的「确认并启动团队」此前必然失败**，报 `未能创建任何成员：Cannot read properties of undefined (reading 'header')`。
  - **根因**：`confirmPlanDirect` 把 `directCaller(lead)`（只有 `{id}` 的假对象）当作 `parent: Agent` 传给 `subagents.startContinuable`。建任务是纯 CAS，假 caller 等价；但**建团队要 spawn 续聊子会话**，宿主会拿 parent 去 materialize 子会话（读它的 session header），假对象让它读到 undefined。
  - **对照实验（不是推理）**：同一份 5 人名册，直接路径（`agents_pixe_team`，传真实 `exec.agent`）一次跑通（成员 spawn → 产出回传 → 领袖汇总全部可用）；确认路径（`plan_confirm=true` / 面板按钮）必失败。两条路径的唯一差别就是 parent。
  - **修法**：`confirmPlanDirect(lead, plan, signal, parent)` 新增 `parent` 形参并**强制校验** —— 没有真实 parent 时抛可读错误（「确认草案需要真实存活的 Agent 作为 parent…」），不再退化去用一个假对象；工具路径把 `exec.agent` 传下去。
  - **面板路径的取舍**：HTTP 路由里**根本没有 Agent**，所以面板按钮改为「先试 HTTP（这样面板里改过的分工能带过去）→ 失败就把确认指令填进输入框并跳转对话」，而不是留一个点了必然报错的按钮。端点也改成返回可执行的原因，不再抛宿主内部错误。
  - 顺带修正 `dead code`：`directCaller` 仍然服务于建任务路径（那里它是对的），注释写明了「哪些路径能用、哪些不能」。

### 测试

`node --test` **190/190**。新增 3 项：无 parent 必须拒绝且**草案不能被消费掉**、带真实 parent 时 `startContinuable` 收到的就是那个对象、`plan-draft` 的确认用例改传真实 parent。另 1 项旧用例因签名变化而失败并被修正 —— 这是它该干的活。

### 状态

`node --check` 全通过；`npm run build:client` 已执行（`lib/client.js` 224.2 KB）；已部署。**改动含宿主半边，必须重启 DSH 才生效。**

## [未发布 · 2026-10-03d] - 修复草案态计数（真跑一次 plan_only 才发现）

### 修复

- **草案态下会话头入口与折叠徽章显示错误计数**。`plan_only` 出草案时成员还没创建，`view` 返回的 `members` / `tasks` 都是**空数组**；而入口按钮与大徽章直接数这两个数组，于是显示成「🧩 团队 (0)」和「0 名成员 · 0/0 完成」——明明草案里有 5 名成员、5 项任务。
  - 修法：新增 `teamCounts()` 统一出口，草案态改读 `plan.members` / `plan.roster` 与 `plan.tasks`；会话头入口、折叠徽章、回合尾卡三处全部走它。
  - 折叠徽章新增草案态文案 `tp.badgeStaged`（`{members} 名成员 · {tasks} 项计划待确认`），不再用运行态的「n/m 完成」措辞。
  - 回合尾卡的成员名字行在草案态改为虚线 chip（表示「还没创建」），而不是渲染成空行。
  - **这个 bug 纯静态读代码看不出来**：读代码时 `plan` 分支是「有 plan 就渲染」，很自然；只有真跑一次 `plan_only`，才会看到 `members: []` 与 `plan.members: [5 项]` 并存。

### 测试

`node --test` **188/188**（新增 1 项钉死草案态计数回退；另修正 1 项因实现变更而过期的旧断言）。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` 223.5 KB）；已部署。生效需重启 DSH。

## [未发布 · 2026-10-03c] - 「应用到对话」常驻浮层标题栏

### 新增

- **「✅ 应用到对话 (n)」常驻在浮层标题栏**：不管面板当前停在**哪个画面**（办公室 / 团队 / 选人 / 设置）都能点。
  - 之前这颗只存在于两处：工作角色页签顶部、浮层里的「选人」抽屉。重设计后团队面板成了主界面，**面板里反而没有这个动作**。
  - **没选人时置灰而不是隐藏**：隐藏了用户就不知道有这个动作；置灰同时把原因写在 title 里（`tp.applyNone`）。
  - 语义刻意与「🚀 一键编排」区分：这颗走**成员清单**（`shortInstruction`），那颗走**编排指令**（`inst.oneClick*`）。两者混用会让模型收到自相矛盾的指令。
  - 点击后：置为本会话活动名册 → 成员清单进输入框 → 跳到对话，并回一条「已应用 n 人到对话」。
  - 标题栏补 `flex-wrap`：现在有「两档切换 + 应用到对话 + ⋯ + 折叠」四组控件，窄屏必须能换行而不是被挤掉。

### 测试

`node --test` **187/187**（新增 2 项：常驻位置证明（紧邻 ⋯ 之前，证明它在标题栏而不是抽屉里）+ 三条文案 zh/en 成对定义）。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` 222.5 KB）；已部署到 `~/.dsh/profiles/desktop/node_modules/agent-teams-pixel`。生效需重启 DSH。

## [未发布 · 2026-10-03b] - 构建期注释剥离 + `/teams` 命令补齐契约

### 新增

- **构建期注释剥离**（[`scripts/strip-comments.mjs`](scripts/strip-comments.mjs)）：bundle 从 244.8 KB 降到 **220.7 KB**（省 24.1 KB）。用**状态机**而不是正则：必须区分「注释的 `//`」与「字符串里的 `//`」、「正则字面量」与「除法」，切错会得到「语法通过、行为错误」的产物。两条安全设计：① 原样保留所有换行，剥离后堆栈行号仍与源码对齐；② 字符串/模板/正则各自在独立状态里整体复制，绝不解析其内容。
  - 配套 10 项针对性测试（转义引号、跨行模板、正则里的 `//`、除法、关键字后的正则、行数不变、真实源码收益）。
  - **bundle 体积门槛从 260 KB 收回 240 KB**：上一轮为容纳新功能临时抬高，这次靠剥离省出的空间收回去。
- **新的交付产物门禁** [`test/bundle-loads.test.mjs`](test/bundle-loads.test.mjs)：把 `lib/client.js` **真跑一遍**（stub 掉 window/document/localStorage/fetch/React），断言能被 `__ModuleLoader__.load` 收走、id 正确、`factory()` 返回带 `apply` / `inject` 的模块。其它 bundle 测试都只是 grep 字符串，抓不到「字符串还在但产物已经坏了」。

### 修复

- **`/teams` 斜杠命令此前没有 `handler`**。宿主 `CommandDefinition.handler` 是必填字段；缺失的后果是命令不出现、或 `register` 抛错被 catch 吞掉，两种都只表现为「打了斜杠没反应」。现在补齐 `handler` + `input.hint` + `recordInput: true`：
  - `recordInput: true` 让命令原文进入会话记录 —— 命令被认领后是**原文作为用户消息**送进主会话的，模型要靠它拿到目标；
  - `handler` **刻意不返回 `text`**：原文已作为用户消息可见，再回一段文字就是聊天里重复一行。
  - 配套 4 项契约测试（必填字段、recordInput/input.hint、handler 不带 text、失败留痕）。

### 测试

`node --test` **185/185**（本轮新增 16 项：注释剥离 10 + bundle 真加载 2 + 斜杠命令契约 4）。

### 状态

`node --check` 全通过；`npm run build:client` 已执行（`lib/client.js` 220.7 KB）；已部署到 `~/.dsh/profiles/desktop/node_modules/agent-teams-pixel`。生效需重启 DSH。

## [未发布 · 2026-10-03] - 团队工具的对话内卡片 + 浮层布局记忆

### 新增

- **对话内的团队工具卡片**（`tool.call.toolview`，key = wire 工具名）：`agents_pixe_team` / `agents_pixe_team_create` / `agents_pixe_team_step` / `agents_pixe_team_message` / `agents_pixe_team_report` / `agents_pixe_task_create` / `agents_pixe_task_update` / `agents_pixe_roles` 八个工具不再摊原始 JSON，改为一张卡：实时状态一句话 + 任务分段条 + 成员状态 chips + 「查看团队」。原始参数与结果仍可展开查证。
  - **设计取舍**：卡片**不解析工具参数**拼视图，而是直接读 `TEAM_STORE` 的实时快照。原因：① 不必依赖宿主内部 block 的形状（随版本会变，猜错就静默不渲染）；② 显示的是「现在进行到哪」而不是一次性快照；③ 取参数的辅助函数做多字段名兜底 + try/catch，取不到就留空，绝不抛。
  - 每个 key 独立注册、独立 `pixBoundary` 包裹：这里的任何意外都不允许把聊天渲染带崩。
- **浮层布局记忆**：位置 / 缩放 / 折叠态 / 当前视图落 `localStorage['agents-pixe.overlay.v1']`，重启后仍在。读回时把坐标夹回可视区（换显示器或改分辨率后旧坐标可能整块在屏幕外）；位置与缩放**防抖 400ms** 写入（拖拽期间每帧都写会打爆 localStorage）；`⋯` 菜单新增「重置位置与缩放」。

### 变更

- `client-lazy-roles` 的体积门槛 260 KB 保持不变，但余量已从 27 KB 收到 **15 KB**（实际 244.8 KB）。下一轮若再加功能，需要先精简注释或重新评估门槛。

### 测试

`node --test` **169/169**，新增 3 项（工具卡片 8 key 注册且不解析参数、`pixeToolRaw` 容错兜底、布局记忆读回夹取与防抖写）。槽位白名单加入 `tool.call.toolview`（本机 Inspect 实测 keyDomain 开放、`agents_pixe_*` 未被占用）。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` 244.8 KB）；已部署到 `~/.dsh/profiles/desktop/node_modules/agent-teams-pixel`（备份 `agent-teams-pixel-20261003-000541`）。生效需重启 DSH。

## [未发布 · 2026-10-02b] - 团队面板重新设计（参考 dsh-agent-teams 模式）

### 新增

- **入口跟随会话**：会话头动作（`conversation.session.header.actions`）一个「🧩 团队 (n)」按钮，加回复下方一张回合尾团队摘要卡（`conversation.chat.turnTail`）。两处都只在「本会话名下真有团队」时渲染，没有团队时返回 `null` 完全不占位；回合尾卡在全部任务结算后自动消失，历史入口交给会话头按钮。
- **双栏团队面板**：左看人（队长卡 / 分段进度 / 成员树），右看事（依赖图 / 详情卡）。点任务高亮负责成员，点成员过滤其任务，详情卡给出前置、完成后解锁谁、当前状态。
- **进度改分段条**：一段 = 一任务，颜色 = 状态。百分比条会丢掉「哪一项卡住」，分段条一眼看出是哪一段。
- **文案状态机**：`teamSummary()` 单一出口，覆盖 staged / waitingBreakdown / waitingSchedule / allDelivered / blockedAndRunning / running / ready / blocked / failedSettled 九种局面，界面任何时刻都有一句话解释现状。
- **计划闸门 UI**：`staged` 态左栏变计划编辑器（三步 stepper + 成员与模型路由 + 任务与依赖 + 新增计划任务），三出口「确认并启动团队 / 返回对话修改 / 放弃本次计划」；放弃与暂停派单都要二次确认。
- **单轮询器 `TEAM_STORE`**：会话头按钮、回合尾卡、面板三处共用一份快照，按 `sid` 去重；后台标签页跳过轮询；内容签名不变时不通知订阅者（不重建 DOM）。全文件只剩一个 `teams/view` 拉取点。
- **浮层标题栏收敛**：原来的「选人 / − / ＋ / ⚙️ / 🤝团队」5 个平铺按钮 → 两档视图切换（办公室 / 团队）+「⋯」低频抽屉 + 折叠；折叠态显示「n 名成员 · done/total 完成」。
- 93 对中英文案（`tp.*`），zh/en 键集一致（实测 297/297）。

### 变更

- **两个参考落点没有采用**，原因是本机实测不支持（详见 [docs/redesign-teams-mode.md](docs/redesign-teams-mode.md) 第 2 节）：`conversation.chat.node` 的 keyDomain 已被 ChatNodeKind 占满且 `uiConversation` 服务在本机不存在；`sidebar.right.pane.tab` 注册 tab 条目所需的 `sidebarRightTabs` 服务不在客户端服务目录。面板因此落在 `shell.overlay`（浮层双栏）。
- `client-lazy-roles` 的体积门槛 240 KB → 260 KB。该门槛的用途只有一个：抓「又把 160 KB 角色清单塞回 bundle」（那时约 340 KB）。本次重新设计后实际 232.5 KB，旧阈值只剩 7.5 KB 余量，会在下一次正常迭代误报。

### 测试

`node --test` **166/166**，新增 [`test/teams-mode-redesign.test.mjs`](test/teams-mode-redesign.test.mjs) 9 项：槽位白名单校准、入口跟随会话、单拉取点、分段进度、状态机单一出口、计划闸门二次确认、折叠徽章计数、标题栏收敛、跨 slot 通信。

### 状态

`node --check` 通过；`npm run build:client` 已执行（`lib/client.js` 232.5 KB）。生效需重启 DSH（`requiresRestart: true`）。

**未做的验证**：本机 Chrome / Edge 无头模式被环境拦截（exit 21、零输出），面板的**实际渲染效果没有做视觉验证**。结构有测试覆盖，像素级外观要靠你打开确认。

## [未发布 · 2026-10-02a] - UI 交互简化 P0（低风险子集）

### 变更

- 删除「工作角色」页签右栏底部重复的「应用到对话」按钮：主 CTA 只保留顶部一个渲染点，底部只留「清空」。
- 预设团队改为**递进披露**：首屏只露 6 个 + 「全部 29 ▾」（页签右栏与办公室浮层两处一致）。
- `o.oneClickHint` 去掉「首选…那里最稳」这类把实现细节暴露给用户的文案（zh/en 成对改写）。
- 新增**键盘等价路径**：`/` 聚焦搜索 · `Enter` 开工 · `Esc` 清空搜索 · `↑↓←→` 移动角色卡 · `Space` 加选。
  三条护栏：输入控件与按钮不抢键、带 Ctrl/Meta/Alt 的组合键不抢、页签不可见时全局监听直接让路。
- 像素办公室浮层支持 `Ctrl + 滚轮` 缩放（原生非 passive 监听，不按 Ctrl 时普通滚动完全不受影响）。
- 新增 3 对 locale 键：`r.presetMore` / `r.presetLess` / `r.keysHint`。

### 状态：已验证并已构建（2026-10-02）

- `node --check src/client.main.js` 通过；`npm test` **157/157** 通过（含 `locale-key-parity`、`preset-i18n`、`render-error-recovery`）。
- `npm run build:client` 已执行：`lib/client.js` 181.7 KB（源码字符数）/ 196.9 KB（落盘），在 `client-lazy-roles` 的 240 KB 上限内。
- 独立静态复核未发现语法或回归问题，并抓出 3 处已修的细节（Esc 误清搜索、`focusIdx` 越界导致整格卡片不可 Tab、渲染期写 ref）。
- 生效需重启 DSH（`dsh.marketplace.requiresRestart: true`）。

### 文档

新增 [`docs/redesign-teams-mode.md`](docs/redesign-teams-mode.md) 与可点对照稿 [`design/teams-mode.html`](design/teams-mode.html)：参考 dsh-agent-teams 模式重排信息架构（入口跟随会话 / 双栏面板 / 计划闸门），落点已用本机 Slot 与 Service 实测校准。本次只出设计，不改代码。


### 计划

剩余 P0（合并顶部主按钮、浮层标题栏 6→3、角色卡就地设领袖、删除任务改内联确认 + 撤销）与 P1/P2 见 [docs/ui-interaction-simplify.md](docs/ui-interaction-simplify.md)。

## [0.2.10] - P2 计划先行（信任闸门）：先出草案，人确认后才烧 token

### 新增

- `agents_pixe_team` 两个新参数：`plan_only=true` 只出「成员 + 分工」草案并落盘（**不创建任何成员、成员 token 为 0**）；`plan_confirm=true` 确认既有草案（沿用磁盘草案建团队 + 建任务，不重新拆解、不再花拆解 token）。
- 引擎草案层：`writePlanDirect / readPlanDirect / discardPlanDirect / confirmPlanDirect`，草案 = `<DSH_HOME>/agents-pixe/teams/<lead>.plan.json`；`view()` 一次返回 `plan`（面板单请求渲染）。
- 3 个端点：`GET /agents-pixe/teams/plan`、`POST /agents-pixe/teams/plan/confirm`、`POST /agents-pixe/teams/plan/discard`（localOnly 守；原生投影模式下统一拒绝）。
- 确认保真：`blockedBy` 依赖、`writeScopes` 写域、`kind=review` + `reviewOf` 原样落到任务板。

### 测试

`node --test` **157/157**（新增 `test/plan-draft.test.mjs` 4 项：草案不 spawn、确认建团建任务保真且草案被消费、丢弃、无草案时明确报错）。

### 未做

面板上的「确认草案 / 编辑草案」交互（下一版）。

## [0.2.9] - P3：团队面板改为「原生团队只读投影」

### 变更

- 面板数据源优先取宿主**原生 Agent Teams** 的真相：`ctx.agentTeams.listMembers/listTasks`（lead 会话 → live Agent 走 `ctx.agents`）。原生队里有真实成员（>1）或任务时，`GET /agents-pixe/teams/view` 返回 `source:'native'` + 原生成员/任务 + `readOnly:true`。
- 没有原生团队（或老宿主没有 `agentTeams`）时**回落**本插件引擎快照，返回 `source:'engine'`，行为与 0.2.8 一致——不抢显示、不回归。
- 原生投影生效时，5 个写端点（`tasks/create|update|delete`、`halt`、`resume`）一律 `{ok:false}` + 只读提示：任务板真相在宿主，本项目不再维护第二份。
- 客户端：来源为原生时标题栏显示「原生团队（只读）」，隐藏「暂停/恢复」「+ 任务」按钮。

### 未做（有意）

`agents_pixe_team` 工具本身**不降级**：系统提示段自 0.2.3 起已优先引导原生工具，而角色卡人格/预设团队是本项目护城河，老宿主仍靠它兜底。

### 测试

`node --test` **153/153**（新增 `test/native-projection.test.mjs` 4 项：原生映射、回落引擎、写端点拒绝、无 live Agent 回落）。

## [0.2.8] - 角色工具默认开启：装完即用，不再需要先开开关

### 变更

- `Config.enabled` 默认值 `false` → `true`（[lib/index.js](./lib/index.js)）：安装后 `agents_pixe_roles` / `agents_pixe_team` 工具与系统提示段**默认注册**，与本机原生「团队协作」的默认开启对齐。
- 设置 → 像素办公室 的「角色工具」开关保留：关掉即动态移除工具与提示段（无需重启），回到纯本地零 token。
- README「Token 管控」章节同步改写；存量配置里已显式写过的值优先（本改动只改默认值）。

### 成本

- 默认每轮多一段角色工具提示 + 工具定义（工具本身不调用就不产生推理成本）；要零成本请在设置里关掉「角色工具」。

## [0.2.7] - 修「页签 / 浮层 / 设置分区整块消失」：客户端 inject 里有个已不存在的服务

### 症状

安装后**完全没有画面**：工作角色页签、像素办公室浮层、设置里的「角色办公室」分区**全部不存在**，且无报错、无日志。

### 根因（两个，第 2 个才是代码 bug）

1. **插件当时并未装进活跃 profile**：`~/.dsh/profiles/desktop/package.json` 的 `dependencies` 与 `dsh.profile.bundles` 里都没有 `agent-teams-pixel`（plugin-manager 日志显示 16:35 有一次 `remove agent-teams-pixel`）。DSH 插件树只看 `bundles`，不在里面 = 不存在。
2. **客户端半边声明了已不存在的服务**（真正的代码 bug）：bundle 尾部为
   ```js
   exports.inject = ['settingsScope', 'slots', 'locale'];
   ```
   而 dsh 0.2.0-rc.2 的**客户端服务目录**只有 `layout / locale / sessions / slots / theme / timer / uiWorkspace / workspaces` —— **没有 `settingsScope`**（0.1.x 时代有，更新后移除）。
   cordis 的 `inject` 是**硬依赖**：任一服务不存在，就**永远不会调用插件的 `apply()`**。于是客户端半边既不注册 slot、也不注册设置分区 —— 正好对应「页签 + 浮层 + 配置图标全无且完全静默」。
   *宿主半边不受影响：它的 `inject = ['tools','systemPrompt','llm','webServer','settings','subagents']` 在 0.2.0-rc.2 全部存在，所以 `/agents-pixe/*` 端点一直是好的 —— 这也是之前只查端点看不出问题的原因。*

### 修复

- `scripts/build-client.mjs`：客户端 `inject` 改为 `['slots', 'locale']`；其余客户端服务一律 `ctx.get()` 容错读取（缺服务只降级，不阻塞挂载）——`settingsScope` 的读取分支保留（老客户端可用），但**不再作为硬依赖**。
- 新增 `test/client-inject-contract.test.mjs`（3 项门禁）：客户端/宿主 `inject` 的每一项都必须落在**运行时服务目录**内，且不得再出现 `settingsScope`；构建脚本与运行时容错策略一致。服务目录快照取自运行时只读查询（host/client `Service listService`），来源与日期写在测试注释里。

### 教训（已写进防复发清单）

`inject` 里的服务名是**硬依赖契约**：写错一个，插件就静默不挂载。第三方插件在 DSH 升级后**必须重新核对服务目录**，只测自己的 HTTP 端点是不够的。

### 测试

**全套 149/149 通过**（新增 3 项）。

## [0.2.6] - P2 专业门禁（角色卡 → 验收判据）+ 客户端角色清单懒加载

### 新增：**专业门禁**（三方对比里两家都没有的能力）

原生与 dsh-agent-teams 的审查只有**通用流程**（需求→实现→验证→审查→集成）；本项目把**领域判据**抽出来当门禁：

- `agents_pixe_task_create` 支持 `kind="review"` + `review_of=<任务id>`：自动从角色卡抽「关键规则 / 技术交付物」生成**验收清单**（`acceptance_from` 指定取哪个角色的卡，默认 = 被审任务负责人 → 团队第一位成员；`acceptance` 可自定义覆盖）。建任务返回值会把清单逐条列出，模型/用户一眼可见判据。
- `agents_pixe_task_update(action="complete")` 对 review 任务要求 `acceptance_results`（格式 `1:pass, 2:fail:原因`，或 JSON 数组）：
  - **漏判**任何一条 → `ACCEPTANCE_UNVERIFIED`（点名缺第几条）——不允许跳过；
  - 判定**超出清单范围**（判据被 edit 改过）→ 同样拒绝；
  - 有任一 `fail` → `verdict=fail`，**被审任务自动打回 `in_progress`** 并记 `lastReviewFailures`（下游因此继续阻塞，不会带着缺陷往下走）；
  - 全 `pass` → `verdict=pass`，正常完成。
- `cardAcceptance(rec)`：从「关键规则/技术交付物」抽 bullet 条目（去重、限量 12 条、单条 ≤160 字、带来源标注如「代码审查员 · 关键规则」）；卡不含这两章则清单为空 → 退回通用流程。
- 派单唤醒语自动带出审查规则；`edit` 可调整清单；**非 review 任务零行为变更**。

### 变更：客户端角色清单懒加载（包体 -48%）

- `lib/client.js` **不再内嵌**角色精简清单：**339 KB → 175.5 KB（-163 KB / -48%）**（实测内嵌块占原包体 46%）。
- 新增宿主端点 `GET /agents-pixe/roles/index` → `{ ok, version, data }`（version = 文件 `mtime:size`）。**宿主是唯一真相源** → 客户端清单永不与 `roles-full.json` 漂移（旧方案是"构建期复制一份"，升级后可能不同步）。
- 客户端 `ROLES_STORE`：**缓存优先 + 24h TTL 版本化校验**（命中即零请求；失败继续用缓存）；`RolesLoadHint` 提供「加载中／失败 + 重试」UI；`RolePicker` 与 `WorkingRolesView` 订阅 store 自动重渲染。
- **安全不变式（有测试锁死）**：清单未加载完成前，`keyKnown(k)` 把「查不到」视为**合法**，不剪枝用户已选角色 —— 否则懒加载会在首屏误删选人并写回 localStorage。
- `lib/roles.json` 加入发布 `files`（端点在运行时读它），冒烟测试同步断言。

### 对齐进度：P1 剩余项**被宿主契约挡住**（取证）

`ctx.tools.guard` 执行期拒绝越界编辑 / `agentTeams.tryMembership` 作用域化工具：**当前做不到**。取证：`subagents.startContinuable` 只返回 `{ childId, messageId }`（`@deepseek-ai/dsh-subagent@0.2.0-rc.2/lib/index.js:1710`），**不暴露成员 live Agent**，因此无法对成员做 `agent.ctx.tools.guard/register`；`listChildren` 返回的也只是视图（id/activity/label/…），没有 Agent。**现有替代**：协议层门禁（0.2.5 写域 + 0.2.6 专业门禁，都不可绕过）+ 成员 `toolFilter` 裁剪（0.2.3）。等宿主开放「childId → live Agent」再补执行期拦截。

### 测试

新增 `test/professional-gate.test.mjs`（11 项：清单归一/判定解析三态/真实卡抽条目/漏判与越界判定被拒/pass 与 fail 分流/fail 自动打回/被审未完成拒绝出结论/review_of 不存在/非 review 零变更/edit 改清单后旧判定被拒）+ `test/client-lazy-roles.test.mjs`（6 项：包体与内容不再内嵌清单/prelude 空壳与 build 不再注入/不剪枝安全不变式/缓存策略/宿主端点返回全量清单/files 含 roles.json）。**全套 146/146 通过。**

## [0.2.5] - P1：任务写域（writeScopes）确定性硬拦

对齐路线 §7.5 的 P1 首项 —— 也是本项目**明确超过 DSH 原生**的一项：原生的 `writeScopes` 只产出 advisory 的 `writeScopeWarnings`（提示，不拦），本项目做成**确定性门禁**。

### 新增

- **任务可声明写域 `writeScopes`**（逗号分隔的路径/目录前缀，数组或字符串都吃）：`agents_pixe_task_create` 的 `write_scopes`、`agents_pixe_task_update(action=edit)` 的 `write_scopes`、团队面板 HTTP 路由同样支持。
- **完成即对账（硬拦）**：任务声明了写域后，`action=complete` **必须**上报 `changed_paths`（实际改动的文件路径），且全部落在域内：
  - 缺 `changed_paths` → `SCOPE_UNVERIFIED`，任务留在 `in_progress`，错误里写明该带什么；
  - 有越界路径 → `SCOPE_VIOLATION`，错误里**点名越界文件**，任务不完成；
  - 全部在域内 → 正常完成，并记录 `lastScopeCheck{at,scopes,changed,ok}` 供审计。
  - **不允许"悄悄越界再报完成"**：成员要么改回域内，要么让领袖用 `edit + write_scopes` **显式放宽**（放宽动作留痕在任务 `revision` 上）。
- **路径判定**（`pathInScope`，大小写不敏感、兼容相对/绝对混用）：完全相等 / 以「域/」开头 / 以「/域」结尾 / 中间出现「/域/」四条命中任一即算在域内 —— 取舍是"少误伤正常工作，也不放过明显域外改动"。
- **派单唤醒语自动带出规则**：`wakeTail` 在任务有写域时会写明「只允许改动 X、完成时必须带 changed_paths，越界或缺字段都会被拒绝」—— 成员不必靠猜。
- `edit + write_scopes=""` = **取消写域**（传空串与"未传"区分）；未声明写域的任务**零行为变更**（不需要 `changed_paths`）。

### 未做（诚实标注）

- **执行期拦截**（`ctx.tools.guard` 在成员会话里直接拒绝越界编辑）：宿主契约允许（`guard` 经 `agent.ctx` 注册即只作用于该 agent，返回字符串即拒绝执行），但需要成员 live Agent 引用 + 动态任务→作用域映射；本版先做**协议层确定性门禁**（不可绕过，因为有 CAS + 状态机兜底），执行期 guard 留待后续。

### 测试

新增 `test/write-scope-gate.test.mjs`（9 项）：`normScopes`/`normPaths` 归一（含"未上报 vs 上报空"区分）；`pathInScope` 四条命中规则与两个域外反例；缺 `changed_paths` 拒绝且任务不完成；全在域内完成并记 `lastScopeCheck`；有越界路径拒绝并点名违例文件；领袖 `edit` 放宽后通过；`write_scopes=""` 取消写域；未声明写域零行为变更；写域随任务视图可见。**全套 129/129 通过。**

## [0.2.4] - 角色导入作用域：只导入「用户选中的角色」

用户口径：**不全部导入** —— 用户选了什么角色就导入什么角色；编排某支团队时只导入该团队用到的角色。

### 变更

- **`agents_pixe_team_create` / `agents_pixe_team` 的 `team` 改为可选**：**留空 = 用当前会话在像素办公室选中的角色**组队（读 `<DSH_HOME>/agents-pixe/persist.json` 的 `agents-pixe.state.v4` → `sessions[<sid>].active` / `activeLeader`），选中的 leader 自动排到名册第一位。选人是**按会话**读取的，逐次生效、不缓存。
- **显式不做全库导入**（508 张卡是「可查询的库」，不是默认导入内容）。三种来源各自只导入自己那份：

  | 来源 | 导入内容 | 实测断言 |
  | --- | --- | --- |
  | 办公室选人（`team` 留空） | 选中的 N 个角色 | spawn 次数 == N，且未选中角色的名字**不得**出现在任何种子里 |
  | 预设团队（29 个） | 该预设自己的 roster（3–5 个） | spawn 次数 == min(roster, `max_roles`) |
  | 角色名列表 | 列出的那几个 | spawn 次数 == 列出的数量 |

- **无选中角色时不静默兜底**：返回可操作指引（「去办公室面板 ＋选人」或「显式传 `team`」），**0 张卡被导入**（不会退回预设、更不会全库）。
- **建团返回值带来源与导入量**：`来源：办公室选人（只导入 2 张角色卡，未做全库导入）`；预设/列表同理。
- **系统提示段**写明这条规则（`team` 可留空、**不要全库导入**）。
- **客户端「🚀 一键编排」**：未命名预设团队时改用新文案「用我在像素办公室选中的角色组队并行完成：」（en: "Have the roles I selected in the Pixel Office form a team and work in parallel on:"）→ 直接走选人作用域，无需再手打团队名。zh/en 键集对齐。
- 修正文档：`docs/usage.md` 的漂移警示里「办公室选人对齐**未实现**」一条，**0.2.4 起已实现**（改为留空 `team` 即用选人）。

### 测试

新增 `test/roster-scope.test.mjs`（8 项）：办公室选人 == spawn 数且未选中角色不得入种子（全库导入哨兵）；`activeLeader` 排首位；无选人时 0 次 spawn + 明确指引；预设团队只导入自己 roster 且受 `max_roles` 截断；角色名列表只导入列出项；一次性编排路径同样不兜底；`agents_pixe_roles` 空参不导入；选人按会话读取且逐会话生效。**全套 120/120 通过。**

## [0.2.3] - P0「追平两家」三项：种子粒度 / 成员模型档 / 成员直达消息

目标来自三方对比 §7.5 的 P0：**用最小改动追平原生与 dsh-agent-teams 在「token 成本 / 成员模型档 / 成员互通」上的差距**，不改架构、可一键回退。**契约先行**：动手前先用 `cordis_inspect_query` + `app.asar` 源码核实了 0.2.0-rc.2 的真实能力位。

### 新增

- **成员种子粒度 `memberCardMode`（默认 `key`）**：建团队时不再为每个成员注入整张角色卡，默认只注**专业核心三章**（核心使命 / 关键规则 / 技术交付物）+ 卡名与定位；卡结构不含这三章时**回退整卡**（宁可贵，不失专业人格）；超长章切 6K 字符上限。设置页新增「成员种子粒度」开关，可随时切回 `full`（行为与 0.2.2 一致）。
  **实测（真实 508 张卡）**：命中三章 486 张（95.7%）；整卡合计 5,278,826 字符（≈2.64M tok）→ 种子 1,780,530 字符（≈890K tok），**压缩 66.3%**；平均每张 10,391 → 3,505 字符；样例「代码审查员」3,476 → 522 字符。**4 成员团队（领袖拆解 + 4 成员 + 汇总 = 6 次注入）≈ 31.2K → 10.5K token，单次编排省约 2 万 token。**
- **成员 LLM 路由 `memberProvider` / `memberModel` / `memberReasoningEffort`**（默认全空 = 快照/继承领袖当前路由，与 dsh-agent-teams 同语义、不弹窗）：经 `subagents.startContinuable({ request: { agentOptions } })` / `subagents.start({ agentOptions })` 下发；成员上如实记录 `model` / `provider` / `reasoningEffort`，`agents_pixe_team_create` 的返回与面板都能看到「谁用的什么模型」。
- **成员工具白名单 `memberToolAllow` / `memberToolDeny`**（默认全空 = **零行为变更**）：经 `request.toolFilter` 下发，宿主在**子会话自己的 ctx 里 `tools.restrict`** —— 这是「角色 → 权限」能力绑定的物理执行层（例如 `memberToolDeny='edit,write'` 让审查型成员物理上无法改文件）。
  **防呆**：`allow` 会自动补回「交作业」必需工具（`agents_pixe_task_update` / `agents_pixe_team_message` / `agents_pixe_task_create` / `agents_pixe_roles`），`deny` 里出现必需工具会被剔除并 `console.warn` —— 否则成员无法回报，任务会永久卡在 `in_progress`。
- **成员 ↔ 成员直达消息**：`agents_pixe_team_message(target="队友名")` 现在**成员之间也能用**，由引擎用**领袖 Agent 引用做邻接代理投递**（`leadAgents` 内存表，`createTeam`/`step`/`report`/`createTask`/`view` 任一处由领袖调用都会自愈登记）。内容带「【来自队友 X 的消息】」前缀，投递记入团队状态 `messages[]`，面板 `/agents-pixe/teams/view` 可读。
  与「人工转达」的本质区别：**不占领袖 LLM 轮次、不进领袖上下文、立即唤醒目标成员**。领袖引用不在本进程（如重启后成员先发言）时返回可操作错误 `NO_TRANSPORT`，指引改发 `@lead`。
- 设置页新增「成员种子粒度」行（zh/en 双语，键集对齐）；`/agents-pixe/settings` 诊断新增 `memberPolicy`（当前生效的种子粒度 / agentOptions / toolFilter）。

### 更正（留痕）

- 上一版对比文档 §7.1 曾断言「成员↔成员用 `subagents.sendMessage` 接线即可，~60 行」——**该断言是错的**。实测 `dsh-subagent@0.2.0-rc.2` 的契约原文是 *"Deliver one model-authored message to a **direct continuable child** or to the **sender's direct parent**"*，非直系会在 `deliverToChild` 处失败：兄弟子会话不邻接。真实实现改为「引擎代理投递」（见上），并已把该结论写回文档。
- 另核实：跨进程后端（ACP）对 `agentOptions`/`toolFilter`/`persona` advertise 全 `false` 且会**抛 `UNSUPPORTED_CAPABILITY`**（不静默忽略）；in-process `spawn`/`fork` advertise 全 `true`。因此实现采用「带能力试一次 → 命中不支持就裸请求降级」，并把降级如实写进成员字段 `degraded`。

### 测试

新增 `test/member-uplift.test.mjs`（14 项）：种子粒度对**真实 508 张卡**的命中率/压缩率门禁；三章保留与叙事章节排除；缺章回退整卡；`full` 模式原样返回；spawn 带 `agentOptions`/`toolFilter`/`persona` 并如实记录；`UNSUPPORTED_CAPABILITY` 降级重试且非能力类错误不吞；成员→队友代理投递（发送者是领袖引用、目标是队友 id、内容标注来源、记入 `messages`）；成员→`@lead` 保持真实发送者且不代理；`NO_TRANSPORT` 报错与领袖调用后自愈；`allow`/`deny` 防呆；Config 新字段与默认值（含 schemastery 3.18.4 的 volatile 活引用解引用）。**全套 112/112 通过。**

## [0.2.2] - 设置服务迁移（dsh ≥0.1.7 的真实断点）

**这是「装了但没功能」的根因修复**：0.2.1 只解决了「插件能不能被装上/挂上」；装上之后，0.2.0-rc.2 上插件的「角色工具」开关仍然打不开、`agents_pixe_*` 工具永不注册。

### 现象与取证

改完 0.2.1 并挂进 desktop profile 后，实机查 `GET /agents-pixe/settings`：

```json
{ "hasScope": false, "registerErr": "settings.register is not a function", ... }
```

### 根因

`@deepseek-ai/dsh-settings@0.2.0-rc.2` 的服务形状变了（与 memory-eternal 文档化的同一条演进）：

| 宿主 | `ctx.settings` 形状 | 配置来源 | 写回方式 |
| --- | --- | --- | --- |
| dsh ≤0.1.5 | **设置命名空间注册表**：`register(ns, Config, {base})` → `SettingsScope`（get/watch/update） | `settings.yaml` | `scope.update()` |
| dsh ≥0.1.7（含 0.2.0-rc.2） | **只剩表单服务**：`configure` / `describe` / `update` / `replace` / `mutate`（**没有 `register`**） | loader 按 schema 校验后把 Config 作为**活引用**传进 `apply(ctx, config)`；只有 `schema.meta.volatile` 为真的字段可投影、可写 | `settings.update(<loader 条目 id>, patch, revision)` |

旧代码 `settings.register('agents-pixe', …)` 在新宿主直接抛 `is not a function` → `scope=null` → `registerFace()` 早退 → 工具永不注册，且 UI 上完全静默。

### 修复（照 memory-eternal 的 `bindSettings` 做法）

- **宿主 `lib/index.js`**：
  - 新增 `export const Config`（`enabled` / `cardMode`），并逐字段打 `meta.volatile`（**不用链式 `.volatile()`**——schemastery 3.18.1 没有该方法，链式调用会在 import 期打挂整包）。
  - 新增跨版本 `bindSettings(ctx, schema, config)`：有 `register` 走老路；否则用「活引用 + `plainConfig` 深解 volatile 引用 + `loader/volatile-update` 订阅 + `settings.update` 乐观重试」，对外仍是 `get()/watch()` 两个方法。
  - 调 `settings.configure({auto:false}, ctx.fiber)`：本插件自带「角色办公室」设置页，避免宿主再自动生成一张重复表单。
  - 新增 `GET/POST /agents-pixe/config`：客户端唯一可用的配置读写通道（GET 返回 live 值 + revision；POST 走 `settings.update`，revision 冲突自动取新值重试一次，并带 `localOnly` 跨源闸门）。
  - 写成功后立刻 `syncFace()` 对一次开关，不等宿主 volatile 回流的时序。
  - `/agents-pixe/settings` 诊断新增 `settingsLegacy` / `settingsEntryId` / `settingsWritable`。
- **客户端 `src/client.main.js`**：`_PIXE_FALLBACK_SCOPE` 由「纯 localStorage」改为**宿主 HTTP 支撑**（读 `/agents-pixe/config`、写 `settings.update`），localStorage 降级为离线镜像；`settingsScope` 客户端服务在 dsh ≥0.1.7 已不存在，缺失不再按错误打印。`lib/client.js` 已重新构建。

### 测试

新增 `test/settings-compat.test.mjs`（11 项）：无 `register` 时 `apply` 不抛；`configure({auto:false})` 被调用；`enabled=true` 注册 8 工具、默认 false 时 0 工具；Config 全字段 volatile；GET/POST `/agents-pixe/config` 的 ns 必须是 loader 条目 id；revision 过期自动重试；跨源 403；写成功后工具立刻注册；**老宿主（有 `register`）行为完全不变**。

## [0.2.1] - DSH 0.2.0-rc.2 兼容修复（门禁 + 挂载）

### 修复（更新后插件「整体消失」的三个根因）

- **peer 区间被 DSH 兼容门禁判死（主因）**：DSH 在安装/激活前用 `@deepseek-ai/dsh-app-boot` 的 `evaluatePluginCompatibility()` 对 `peerDependencies` 里所有 `@deepseek-ai/dsh*` 条目跑 `semver.satisfies(runtimeVersion, range, { includePrerelease: true })`。旧声明 `^0.1.0-rc.7 || ^0.1.1-rc.2` 的 caret 上界被规范化成 `<0.2.0-0`，**永远不满足 `0.2.0-rc.*`**，因此更新到 0.2.0-rc.2 后直接被拒。改为 `>=0.1.0-rc.2 <0.2.0 || >=0.2.0-rc.1 <0.3.0`（显式覆盖 0.2.0 的预发布 tuple，同时不牺牲 0.1.x），并补 `@deepseek-ai/cordis: ^4.0.1`。
- **没挂进活跃 profile 的 bundles**：当前宿主是桌面壳（`desktopVersion 0.2.0-rc.2`），其 profile 是 `~/.dsh/profiles/desktop`，而本插件只出现在 `profiles/web` 的 `dependencies` 里、且 web 的 `bundles` 也漏了它。DSH 插件树完全由 `dsh.profile.bundles` 组合（`cordis.yml` 恒为 `[]`），不在 bundles 里就是**完全不存在**（装载记录 195 条里没有本插件行）。
- **manifest 缺少商店/市场元数据**：补齐 `engines.dsh`、`dsh.compatibility`（含 `dshReleases` 兼容清单，显式声明 `0.2.0-rc.2` 兼容）、`dsh.marketplace`、`dsh.permissions`、`dsh.lifecycle`。

### 新增

- **原生 Agent Teams 共存路由**：宿主侧探测 `ctx.get('agentTeams')`（DSH 0.2.0-rc.2 起 `@deepseek-ai/dsh-experimental-agent-team` 真的挂载了，0.1.2 时「仅声明契约、未真正挂载」的前提已过时）。检测到原生能力时，系统提示段改为「**团队协作默认优先原生工具**」（点名 `spawn_teammate` / `send_message` / `list_agents` / `wait_agent` / `interrupt_agent` / `team_task_*`），并限定本项目只负责 4 项独有能力：508 张角色卡人格、29 个预设中文团队、像素办公室可视化、按章节取卡与自定义角色；明确要求**同一次编排两套不混用**。探测不到时行为与 0.1.x 一致；`ctx.get('agentTeams')` 抛错也不影响 `apply`。
- **诊断端点扩充**：`/agents-pixe/settings` 新增 `nativeAgentTeams` / `nativeAgentTeamsTools` / `teamEngine` / `subagentsStart` / `subagentsContinuable`，用于区分「没挂进 profile」与「挂了但引擎降级」。
- **兼容回归门禁 `test/dsh-0.2-compat.test.mjs`（8 项）**：按 DSH 同款规则复算全部 `@deepseek-ai/dsh*` peer 区间；用旧写法作为**反面锚点**（断言它必须不满足 0.2.0-rc.2，防回潮）；校验 `engines.dsh` / `dsh.compatibility.dsh` / `dshReleases` / `dsh.bundle.patch` 自洽；断言插件工具名与原生 Agent Teams 工具**零冲突**、且全部 `agents_pixe_` 前缀；断言原生在场时提示段给出「原生优先」路由。
- **文档**：新增 [docs/dsh-0.2-compat.md](docs/dsh-0.2-compat.md)（根因、实测区间表、API 漂移核查、验证与部署命令、防复发 checklist）与 [docs/agent-teams-comparison.md](docs/agent-teams-comparison.md)（**三方对比**：DSH 原生 Agent Teams ↔ `dsh-agent-teams` ↔ 本项目，含 23 项能力、兼容策略对照、两种劣势分列、场景选型与收敛路线）。

### 核查结论

用真实的 `@deepseek-ai/dsh-llm@0.2.0-rc.2` + `@deepseek-ai/dsh-tools@0.2.0-rc.2` + `@deepseek-ai/cordis@4.0.4` 替换开发依赖后，**原有 78 项测试全绿**——`defineTool` / `BlockAssembler` / `createUserMessage` / `ctx.subagents.start|startContinuable|sendMessage|listChildren|getProvider` / `shell.overlay` / `settings.section` 全部仍在。本次「更新后问题」的性质是**门禁 + 挂载**，不是 API 断层。

### 更正

- 0.1.2 条目里声称的 `agents_pixe_team` 参数 `plan_only`（计划先行）在当前代码中**已不存在**（0.1.9-rc.1 的 host 重构中移除）。该条目仅作历史记录，**勿再按它调用**；如需人工闸门请用 `/agents-pixe/teams/halt` 暂停派单。

## [0.1.4] - 2026-09-06

### 稳定版

汇总 rc1→rc5 修复，正式发布：

- 设置“角色办公室”入口稳定显示，刷新不再消失；
- 右侧浮层 ⚙️ 在浮层内直接打开角色办公室设置面板，不依赖 DSH 设置导航；
- 角色工具开关即时反馈，宿主只在 `enabled` 变化时重注册工具；
- 中英切换：客户端注入 `locale` 服务，`safeT` 兜底异常翻译，语言切换跟随；
- 修复像素人消失、+选人空白、浮层空白等问题。

## [0.1.3-rc5] - 2026-09-06

### 变更

- **右侧浮层 ⚙️ 不再依赖 DSH 设置导航 DOM**：改为在浮层内部直接打开“角色办公室”设置面板（复用 `PixeSettingsSection`，带 ✕ 关闭按钮），不再尝试点击“通用设置”/“角色办公室”等 DSH 菜单项，彻底绕开跳转失效问题。

## [0.1.3-rc4] - 2026-09-06

### 修复

- **右侧浮层设置按钮仍未跳转 Role Office**：`openPixeSettings` 改为遍历全部 DOM 节点查找“角色办公室 / Role Office / agent-teams-pixel / 像素办公室”，并自动向上找可点击元素（button/role=button/a/nav cell），不再局限于固定选择器。

## [0.1.3-rc3] - 2026-09-06

### 修复

- **右侧浮层设置按钮跳错**：`openPixeSettings` 扩大搜索范围（`nav button` / `role="button"` / 各类 nav cell / 普通 button / a），同时匹配“角色办公室 / Role Office / agent-teams-pixel / 像素办公室”，并把等待次数从 15 提升到 50，避免跳回“通用设置”。
- **+选人按钮空白/隐藏浮窗**：`RolePicker` 补上缺失的 `t` 变量（`safeT`），不再因 `t is not defined` 让选人面板渲染失败。

## [0.1.3-rc2] - 2026-09-06

### 修复

- **角色工具开关无反应**：客户端显式声明 `settingsScope` 依赖，确保设置页写入的是 DSH 真实 scope，而不是 localStorage 兜底；开关点击后乐观更新 UI，并让宿主 `scope.watch` 感知 `enabled` 变化。
- **中英切换英文无效**：客户端 bundle 重新导出 `inject = ['settingsScope', 'slots', 'locale']`，确保 `locale` 服务注入到 `apply(ctx)`；`useSystemLang` 订阅与画布重绘链路因此能真正收到语言切换。

## [0.1.3-rc1] - 2026-09-06

### 修复

- **角色工具切换卡顿**：宿主 `settingsScope.watch` 原来在任意设置变化时都重注册 `agents_pixe_roles` / `agents_pixe_team` 工具；改为只在 `enabled` 开关真正变化时重注册，调 zoom/头像条等设置不再卡顿。
- **中英适配**：设置页与浮层文案统一走 `safeT`，DSH 的 `props.t` 返回 raw key / undefined / 抛错时自动回退内部 zh/en 词典；语言切换会触发布局与画布重绘。

## [0.1.3] - 2026-09-06

### 修复

- **客户端 i18n 中英切换**：按 dsh-market 的 locale 用法，先 `locale.register` 再 `locale.bind`，并通过 slot `inject` 把 `t` 传给组件；补上 `useSystemLang` 订阅与 OfficeCanvas 重绘依赖，切换语言时标题/按钮/角色名/聊天气泡跟随切换。
- **设置“角色办公室”入口消失**：`settingsScope` 改为延迟/安全获取（`scoped.settingsScope` / `scoped.get` / `ctx.get` 三种途径），避免因服务未就绪或 scoped 属性缺失导致设置分区不注册。
- **像素人消失**：`OfficeCanvas` 中 `t` 恢复为画布动画时间 `(now - start) / 1000`，不再被翻译函数覆盖。
- **错误边界兼容**：`PixErrorBoundary` 不再在模块加载期强制依赖 `React.Component`；当前 `pixBoundary` 先透传子节点，避免宿主 React 兼容性问题导致浮层空白。

## [0.1.2] - 2026-09-01

### 新增：真·团队协助引擎（基于宿主 `subagents` 续聊原语 + 文件态自建）

把 agent-teams-pixel 的团队协作从「一轮到底的一次性编排」升级为「真正团队协助」——**当前会话创建团队并成为领袖，成员是驻留可续聊子 Agent，目标拆成带显式依赖的任务，共享调度器按真实 running/idle/ready 原子领取 + 唤醒，attempt(CAS) 生命周期 + 冷恢复，邮箱直投，文件快照落盘 + 活动面板**。设计参考 dsh-agent-teams 上游；不移植其独立文件引擎，也**不依赖宿主 `agentTeams` 服务**（该服务在若干 dsh 版本里仅声明契约、未真正挂载，会导致引擎整体降级）——改为**基于 `subagents` 续聊原语（startContinuable/sendMessage/listChildren）+ 文件态团队/任务/attempt 模型**自建，最稳、可复现。

- **引擎模块 `lib/team-engine.js`**：纯服务注入、仅 `node:fs` 落盘，逻辑可单测——依赖 `ready` 计算 / attempt 状态机 / 停驻检测 / 冷停恢复 / CAS 冲突 / 归档。
- **宿主 `lib/index.js`**：检测 `ctx.get('subagents')`；注册 6 个协调工具 `agents_pixe_team_create` / `agents_pixe_task_create` / `agents_pixe_task_update` / `agents_pixe_team_step` / `agents_pixe_team_message` / `agents_pixe_team_report`；`agents_pixe_team` 升级为真引擎便捷入口（创建→拆依赖任务→派单→汇总），旧一次性逻辑作降级；新增 `GET /agents-pixe/teams/view`（磁盘快照优先）。
- **确定性「对话中唤醒」**：注册 `/agent-teams` 斜杠命令（`recordInput` 保留输入为可见用户消息）+ 强化系统提示段「`/agent-teams` 或团队协作请求 → **必须**调用 `agents_pixe_team` 启动团队协议」——像参考 dsh-agent-teams 一样，命中即令模型在对话里自动跑团队（建团→拆依赖→调度→汇总），工具调用卡片可见。
- **计划先行（Plan before execution）**：`agents_pixe_team` 默认 `plan_only=true` 只出「团队计划草案」（roster + 任务 DAG + 依赖，不建团不调度）；用户评审确认后传 `plan_only=false` 执行（Approve & Run）——建团→拆依赖任务→调度→汇总。可用 `plan_tasks` 回传调整后的任务 JSON 覆盖草案。
- **团队大小与像素办公室对齐**：`agents_pixe_team`/`/agent-teams` 默认用**当前会话办公室选中角色**作团队成员（读 `<DSH_HOME>/agents-pixe/persist.json` 的 `agents-pixe.state.v4` → `sessions[<sid>].active`），先「选人」再发任务，团队大小=办公室选人数；办公室无该会话选人时退回预设/自定义。
- **客户端 `src/client.main.js`**：像素办公室标题栏新增「🤝 团队」按钮，切出 `TeamPanel`（roster 状态徽章 + 任务板 + 进度分段 + 归档标记），轮询 `/agents-pixe/teams/view?lead=<sid>`。
- **落盘**：`<DSH_HOME>/agents-pixe/teams/<leadId>.json`（磁盘真相快照）+ `<leadId>.inbox.json`（成员成果）+ `archive/`（完整团队记录）。
- **降级**：宿主无 `agentTeams`（老版本）时引擎工具不注册、`agents_pixe_team` 沿用原一次性逻辑、面板返回 `available:false`，均不报错。
- **修复**：冷停恢复（`team-engine.js` `step`）在**无空闲成员可接手**时改为**先释放死属主**（任务落回 pending、不再卡在 `in_progress`），留待后续认领——避免冷停任务永久卡死。
- **强化**：`agents_pixe_team` 便捷编排新增**依赖防护**（`team-engine.js` `resolvePlanDeps`）——拆解出的自依赖/前向引用/非法依赖一律剔除并记 warning，保证任务 DAG 无环；`report` 在**存在未完成任务**时归档为**草稿**（不合成最终报告、标记未完成项），全部完成才合成正式汇总；**拆解失败兜底**（`decomposeFallback`）——目标拆不出子任务时退化到各成员并行处理同一整体任务，避免建团后无任务可做。
- **测试**：`lib/team-engine.test.mjs`（24 项）+ `lib/team-engine-stress.test.mjs`（高保真 harness 硬压 15 项：冷恢复有/无空闲成员、转派 CAS、停驻、多依赖串行顺序、多依赖并行分支、max 成员并发上限、空闲自动续领、report 草稿归档/正式汇总、resolvePlanDeps 无环防护、decomposeFallback 兜底、同一步不重复领任务、跨步幂等、CAS 防并发双领）+ `lib/register-face.test.mjs`（registerFace 重入不重复注册引擎工具），共 **42 项全过**；`node scripts/build-client.mjs` 产出 `lib/client.js`（268.5 KB）。
- **文档**：新增 `docs/usage.md`（标准 7 步 + 一键 3 步配方、工具参考、attempt/依赖/冷恢复语义、token 防爆、活动面板、验收、已知边界）。

## [0.1.1] - 2026-08-28

### 修复

- **`dsh.client.inject` 缺失导致客户端 UI 不渲染**：`package.json` 的 `dsh.client.inject` 此前为 `[]`，dsh-client-modules 不会把这些客户端服务排在我的 entry 之前装载，`apply(ctx)` 被调用时 `ctx.get('slots')` 仍为 `undefined`，插件直接 return 而不渲染工作角色页签与像素办公室浮层。补齐 6 个客户端服务依赖：`@deepseek-ai/dsh-client-runtime` / `-connection` / `-locale` / `-ui-settings` / `-ui-slots` / `-ui-session`。

## [0.1.0] - 2026-08-28

### 变更

- **包名重命名**：`dsh-ui-agents-pixe` → **`agent-teams-pixel`**。`package.json` 的 `name` / `repository.url` / `homepage`、README 安装命令与文档引用、`cordis.patch.yml` 的 `id`/`name`、客户端 prelude 与编译产物的 `id`、`scripts/build-client.mjs` 与 `scripts/gen-roles.mjs` 注释路径、冒烟测试断言均同步更新。
- **文档**:README 推荐插件段「驯兽师内核」改称「智子内核」。

## [1.0.18] - 2026-08-28

### 变更

- **assets/screen 二次瘦身**：`demo.gif` 480px 压缩至 1700KB（↓17%），`workspace-pixe.png` 缩至 1200px/765KB（↓32%），`workspace-roles.png` 缩至 1200px/590KB（↓26%），总大小从 4.5MB 降至 ~3.2MB。
- **新增 `.npmignore`**：明确排除 `assets/`、`docs/`、`scripts/`、`src/` 等开发资源，npm 包更干净。
- **scripts 精简**：`scripts/names.mjs` 内联至 `gen-roles.mjs`，删除独立文件。

## [1.0.17] - 2026-08-24

### 变更

- **npm 包瘦身**：`package.json` 的 `files` 移除 `assets/`——运行代码不再携带展示截图/壁纸；`assets/screen` 仅随 Git（GitHub/Gitee 展示），README 界面预览指向 `assets/screen` 真实抓屏。
- **展示图优化瘦身**：`assets/screen` 大图缩到最大宽 1500px（`workspace-pixe` 2341→1500、`workspace-roles` 3840→1500），体积各降约 40%。
- **精简开发脚本**：删除 `scripts/add-names.mjs`、`scripts/verify-presets.mjs`（构建链路仅需 `build-client` / `gen-roles` / `names`）。

## [1.0.16] - 2026-08-24

### 变更

- **选人面板宽度贴合像素办公室**：改为与画布同宽（`Math.max(360, 520*zoom)`，不超出浮层），推荐团队/已保存团队 chips 用 `flexGrow` 均匀铺满整行——既不留白、也不超出浮层（此前 640 太宽、auto 又留白）。
- **README 截图更新**：界面预览改用 `assets/screen/` 目录，新增「点击像素人查看完整角色卡」「设置 → 像素办公室（角色工具/取卡粒度）」两张真实抓屏，删除旧 assets/ 根目录图。
- 修正含空格文件名 `workspace-roles .png` → `workspace-roles.png`。

## [1.0.15] - 2026-08-24

### 修复（角色工具无法开启 · 根因解除）

- **根因**：`settings.register('agents-pixe', …, { base: (ctx.config && …) ? ctx.config : {} })` 访问了 `ctx.config`，但插件 `inject` 数组从未声明 `'config'` → cordis 抛 `cannot get property "config" without inject` → `settings.register` 失败 → `scope=null` → 开关绑定不到可写 namespace → **角色工具/取卡粒度纹丝不动**。
- **修复**：`base` 改传 `{}`（不再访问 `ctx.config`，schema 自带默认值足够），register 不再抛；角色工具可正常开启并写盘。
- **选人面板**：推荐团队/已保存团队 chips 加 `flexGrow:1, textAlign:'center'`（铺满整行防右侧留白）。

## [1.0.14] - 2026-08-24

### 修复

- **一键编排按钮 ReferenceError**：办公室浮层版 `oneClickTeam` 引用了未声明的 `inputActions`（那是「工作角色页签」才有的）→ 点击即 `ReferenceError` 崩溃、毫无反馈。改为**复制指令到剪贴板 + 填草稿 + 跳转对话 + 弹提示**「✅ 已生成并复制，黏贴后补任务发送」。
- host `cardMode` 改 `z.union(['full','rules','deliverables']).default('full')`（对齐 dsh-ui-three-body）+ catch 写完整 stack。

## [1.0.13] - 2026-08-24

### 变更

- **选人面板内容宽度扩展**：推荐团队区 340px → 440px，一行显示更多团队，不再拥挤。
- **一键团队编排按钮修复**：办公室浮层拿不到 dsh `setDraft`（React 受控 textarea 会被覆盖导致点了没反应），改为**复制指令到剪贴板 + 跳转对话 + 提示**（可靠有反馈）；工作角色页签的「🚀 一键编排」仍走 `setDraft` 可靠路径。
- **角色工具无法开启诊断**：host `settings.register` 失败时不再静默吞异常，改 `console.error('[agents-pixe] settings.register 失败: …')` 暴露原因；新增 `GET /agents-pixe/settings` 诊断端点（返回 `hasScope/value/settingsAvailable`），用于定位「角色工具无法开启」的宿主侧根因。

## [1.0.12] - 2026-08-24

### 变更

- 角色卡详情弹窗支持**点击遮罩空白处关闭**（外层 onClick 关闭 + 内层卡片 stopPropagation），除 ✕ 按钮外也能一键收起。

## [1.0.11] - 2026-08-24

### 移除（不再注入内核）

- **移除本插件全部内核注入**：删除客户端内核设置 UI（开启内核模式/档位/语气/人设/覆盖）、`shortInstruction` 附 `【内核】`、`kernelText/currentKernel`，删除 host schema 内核字段与 `registerKernel` 常驻注入，删除 `lib/kernel.js`（及 build 的 `KERNEL_DATA` 注入）。**内核改用第三方插件**：README 新增推荐 [dsh-ui-three-body](https://github.com/EternalNight996/dsh-ui-three-body) 并介绍。

### 新增

- **像素人左键点击 → 打开角色卡详情**：办公室浮层点击任一像素人，弹出该角色**完整角色卡**（定位/使命/关键规则/交付物/沟通风格/工作流程全章节，1:1 上游），分段展示可滚动。host 新增 `GET /agents-pixe/role?key=` 端点返回完整卡。
- README 补充：像素人点击功能说明、内核推荐 three-body、后续待办（新增编排多轮协作/成员传递中间产物/provider 混合、角色卡详情快捷键、自定义角色表单编辑器等）。

### 变更

- build-client 移除 kernel 数据注入；`package.json` `files` 去掉 `lib/kernel.js`。

## [1.0.10] - 2026-08-24

### 变更（内核注入方式改用「随行携带」）

- **内核不再常驻 system prompt**（移除 host `registerKernel` 每次对话注入）——改为**随「应用到对话」一起注入**：「开启内核模式」时，`shortInstruction` 生成的指令末尾附一段 `【内核】`（第一性原理 + 五步纲领），随角色/团队信息一起进对话框；**你点发送才调取内核**，不碰角色时内核零 token 成本。
- 内核文本单源：`lib/kernel.js` 导出 `ZH/EN/TONE_LINE`，`build-client` 注入客户端 `KERNEL_DATA`（宿主 / 浏览器文本同源，不会漂移）。
- 客户端新增 `kernelText()` 生成器 + `currentKernel()` 读设置分区 `kernelOn/mode/lang/tone/self/master/override`；应用到对话（`shortInstruction`、一键编排）都随指令携带。改档位/语气/人设实时生效（无需重启）。
- host `settings` schema 保留内核字段（`kernelOn/kernelMode/...`）供客户端读取；宿主不再注入。

## [1.0.9] - 2026-08-19

### 新增

- **智子内核（kernel）**：新增 `lib/kernel.js`（三档 × 两语 × 三语气 + 人设占位），设置 → 像素办公室 → 「开启内核模式」开关 + 档位/语气/语言/自称/称呼/内核覆盖。开启后在每次对话的 system prompt 注入「第一性原理 + 五步纲领（问清→方案→章程→执行→交付）」，团队/角色协作用上它；自定义覆盖文本优先级最高。
- host `settings` schema 增加 `kernelOn/kernelMode/kernelLang/kernelTone/kernelSelf/kernelMaster/kernelOverride`；`registerKernel` 独立于角色工具开关，`scope.watch` 动态生效。

### 修复

- **一键团队编排按钮**：工作角色页签新增「🚀 一键编排」（走 `inputActions.setDraft` 可靠路径，`应用到对话` 同款）；办公室浮层的按钮加点击反馈（成功提示/失败提示）——原先浮层拿不到 `inputActions`，只能靠脆弱的 textarea DOM setter，导致点了像"没反应"。

## [1.0.8] - 2026-08-19

### 新增

- **设置 → 像素办公室「取卡粒度」按钮**：完整卡 / 仅规则 / 仅交付物（三选一，默认完整卡）——作为 `agents_pixe_roles` 的全局默认，不用每次口头交代；单次仍可用 `sections` 覆盖。
- **办公室选人面板「🚀 一键团队编排」按钮**：一点就把当前选中团队送进 `agents_pixe_team` 编排指令（预填「让『XX』团队并行完成：」到草稿），补一句任务即可发送——不再手打团队名/角色名。
- README 新增「内核纲领（团队协作）」章节，明确三段式编排内核（领袖拆解→成员子代理独立执行→领袖汇总）与成本/质量取舍。

### 变更

- **办公室浮层 token 行升级**：`🖥️ 像素办公室（5）| 40 轮 · 464 步 | 缓存命中 96% | 输入↑72.8K | 输出↓214.6K`——新增轮数/步数（sessionStats 投影）与缓存命中率（cacheRead/(uncachedInput+cacheRead)）。
- host settings schema 增加 `cardMode` 字段（默认 `full`）。

## [1.0.7] - 2026-08-19

### 新增

- **`agents_pixe_team` 真·团队编排工具（闭环）**：领袖视角拆解任务 → 每位成员开独立子代理（种子=完整角色卡，上下文互不挤占；provider 自动选 spawn/fork）并行执行 → 领袖汇总最终报告。支持 29 个预设团队名直传或角色名列表；成员上限默认 4（最大 6）；拆解失败自动退化为「各成员按自身专业并行处理」。
- **`agents_pixe_roles` 新增 `sections` 参数**：`full`（默认，完整卡）/ `rules`（仅关键规则节）/ `deliverables`（仅技术交付物节）——单章节上限 4K 字符，按需取可省一个数量级 token。
- **办公室浮层标题栏实时 token 计量**：显示当前会话全局 token（↑输入 ↓输出，含缓存读写，读 dsh `tokenUsage` 真实 provider 用量投影，非仅插件闲聊用量）。
- 角色名支持 `division/role-id` 形式（如 `engineering/engineering-ai-engineer`），lookup 优先命中 id。

### 变更（破坏性：角色卡返回策略）

- **`agents_pixe_roles` 默认返回完整角色卡**（取代旧版 ≤500 字符精简卡）：内容 1:1 上游 508 张卡；单次调用总量上限 100K 字符（约 5 万 token），超出跳过后续角色并在结果中说明。
- 修复章节抓取正则被卡内 `###` 子标题截断的问题（旧版 zh 仅 31% 卡能取到关键规则节，修复后 98%）。
- 宿主 `inject` 增加 `subagents`；系统提示段同步说明两个工具的适用场景。

## [1.0.6] - 2026-08-19

### 变更

- README 重排：**「⚡ 安装」章节提前到最前**（标题与简介之后、功能列表之前），打开即见 `dsh plugin --profile web add dsh-ui-agents-pixe`。
- 「待办 / 欠账」扩写为「待办 / 后续开发方向」，按 5 个方向补全 14 项：数据与持久化、角色工具（agent 侧）、像素办公室表现层、AI 闲聊、工程化。

## [1.0.5] - 2026-08-19

### 变更

- README 安装段**移除 npx 备选命令**，统一为 `dsh plugin --profile web add dsh-ui-agents-pixe`，并加注「不要用 npx（每次重新下载 dsh）」——与 dsh-desktop 桌面壳指引一致。
- 「推荐 dsh-desktop 桌面壳」段落理顺：桌面壳推荐与可视化插件市场（`dshmarket`）安装命令分开表述。

## [1.0.4] - 2026-08-19

### 变更

- **对齐最新版 dsh 生态**：peerDependencies 升级为 `^0.1.0-rc.7 || ^0.1.1-rc.2`，同时兼容 dsh `0.1.0-rc.x` 运行时（dsh-desktop 内置）与最新 `0.1.1-rc.2` 生态。
- README 安装命令改为推荐 `dsh plugin --profile web add dsh-ui-agents-pixe`（npx 作为等价备选），并新增 **dsh-desktop 桌面壳推荐**（https://github.com/EternalNight996/dsh-desktop）。
- README 桌面壳链接由旧名 deepseek-desktop-harness 全部更正为 dsh-desktop。

## [1.0.3] - 2026-08-19

### 修复

- 设置 → 像素办公室「角色工具」开关点击无反应的**完整根因**：
  1. **宿主半边 `inject` 数组缺少 `settings` 服务**，导致 `settings.register('agents-pixe', …)` 不可用/时序不稳，namespace 从未在宿主侧生效——客户端 `describe()` 读不到、写入被拒。已补上 `'settings'` 声明（这是 v1.0.2 只修客户端、仍无效的原因）。
  2. 客户端 `settingsScope.bind` 改为在 `apply()` 中只绑定一次（v1.0.2 已做）。

### 变更

- 工作角色页签与像素办公室浮层顶部的 **🤖 AI 按钮已移除**，AI 配置统一收拢到设置 → 像素办公室分区的「🤖 像素人 AI 闲聊」（AI 开关 / 台词频率 / 思考模式），单一入口管控。
- 像素办公室标题栏按钮（选人 / 缩小 / 放大 / 设置 / 折叠）**全部加大**，更清晰易点。

### 文档

- README 新增「🆕 更新日志」章节，记录本版本修复与零成本确认。

## [1.0.2] - 2026-08-18

### 修复

- 设置 → 像素办公室分区的开关点击无反应：`settingsScope.bind` 原先在分区渲染函数里每次调用，导致每次渲染都新建 controller、订阅与写入的不是同一个 scope；改为在 `apply()` 中绑定一次（参考 dsh-ui-three-body 的写法）。

### 新增

- 设置 → 像素办公室分区新增「🤖 像素人 AI 闲聊」：AI 聊天开关、台词频率（低/中/高）、思考模式。

### 变更

- 悬浮窗标题栏的 ⚙️ 设置按钮加大（padding 2x7→4x12、字号 12→16），更易点击。

## [1.0.1] - 2026-08-18

### 文档

- 新增 `CHANGELOG.md`（Keep a Changelog 格式），并随包发布，保证 npm 包与 GitHub 仓库内容同步。

## [1.0.0] - 2026-08-17

首个独立 npm 包发布版本（从 deepseek-desktop-harness/plugins 拆出）。

### 新增

- `agents_pixe_roles` 工具：宿主半边注册，agent 按角色名取回完整角色卡（定位 + 规则 + 清单 + 语气），「以某个角色/团队身份回应」时自动调用。
- 工作角色页签：内置 The Agency（en 255）+ agency-agents-zh（zh 253）共 508 张完整角色卡，支持搜索 / 中英切换 / 分部分类选人。
- 像素办公室浮层：Canvas 2D 程序化像素小人（站立 / 打字 / 踱步 + 四态徽章），可拖动、折叠、缩放，选人即入列。
- 聊天接入 AI：内置 AI（走 dsh 宿主 `ctx.llm` 模型，按角色 + 实时状态生成 20 字内中文闲聊）+ 可插拔外部接口（`window.__AGENTS_PIXE_CHAT__`），由 🤖 AI 开关统一控制。
- 持久客户端插件：npm 双面包 + 组合补丁层（`dsh.bundle.patch`），安装即生效，重启不丢。

### 变更

- 包名改为无 scope 的 `dsh-ui-agents-pixe`（避开 @deepseek-ai 组织 scope 发布权限）。
- 测试脚本改用 `node --test` 自动发现（Node 24 下 `--test test/` 目录解析失败）。

### 性能

- 角色卡按预算截断（单卡 1.5K 字符 / 总量 6K，省 5-7K token/卡）；闲聊走便宜快模型、maxTokens 200→120、system 限 20~40 字。
- 深度 token 管控：滚动小时预算（60 次 / 60K token 硬顶）+ 台词去重缓存 + 估算 token 统计 + 默认低频 + 输入硬化；设置卡片显示用量。
- AI 模式硬门：未开启 AI 时服务端直接拒绝 token 调用（aiEnabled 授权标记），开启后才走预算管控。

### 文档

- README 提取桌面壳真实 screen/gif 素材（demo.gif 压缩至 2MB），界面预览改为桌面壳同款排版并引用其 README。
- 桌面壳不再内置本插件，README 关系段改为按需安装。
- `prepublishOnly` 发布前自动跑测试门禁。

[1.0.0]: https://github.com/EternalNight996/dsh-ui-agents-pixe/releases/tag/v1.0.0
