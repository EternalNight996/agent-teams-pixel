# Changelog

本项目所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
