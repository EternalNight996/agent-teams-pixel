# DSH 原生 Agent Teams ↔ dsh-agent-teams ↔ agent-teams-pixel 三方对比

> 对比基线：DSH 桌面壳 `0.2.0-rc.2`（`@deepseek-ai/dsh*@0.2.0-rc.2`）× `agent-teams-pixel@0.2.2`
> 三方定义：
> - **原生**：DeepSeek 官方内置 `@deepseek-ai/dsh-experimental-agent-team-profile`（`ctx.agentTeams` 服务 + 工具 + UI）
> - **dsh-agent-teams**：社区插件 [`NanmiCoder/dsh-agent-teams`](https://github.com/NanmiCoder/dsh-agent-teams)，npm [`@nanmicoder/dsh-agent-teams@0.1.22`](https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams)
> - **本项目**：`agent-teams-pixel`（508 张角色卡 + 29 预设团队 + 像素办公室 + 文件态自建团队引擎）
>
> 证据来源：运行中的宿主（`plugin_manager.list_plugins`、`cordis_inspect_query` 的 `Service/Tool/Slots` 只读查询）+ `resources/app.asar` 内 `@deepseek-ai/dsh-experimental-*` 包清单与 `dsh-app-boot` 兼容校验实现 + dsh-agent-teams 仓库的 [README_ZH](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/README_ZH.md) / [docs/usage.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/docs/usage.md) / [compatibility.json](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/compatibility.json) / [package.json](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/package.json)。
> ⚠️ dsh-agent-teams 一列**基于其仓库文档与清单**整理，未在本机实机运行；本项目与原生两列均为本机实机取证。

## 0. 一句话结论

| 位置 | 结论 |
| --- | --- |
| **原生** | 官方内置、默认开启、与宿主同版本演进，是「团队协作」的**默认答案**；角色库/预设/表现力仍是空白。 |
| **dsh-agent-teams** | 三方里**编排能力最完整、宿主兼容做得最工程化**的一个；能力面基本覆盖并超过本项目自建引擎（成员互发消息、写域、质量门禁、原生「团队协作」标签页）。 |
| **本项目** | 独占护城河是**508 张角色卡 + 29 个预设中文团队 + 像素办公室 + 自定义角色**。经 **0.2.3 P0** 后，token 成本（-66.3%）、成员模型档、成员互通、成员工具裁剪已**追平到可比区间**；仍缺的是**计划闸门、质量门禁、写域硬拦、会话日志真相源**。 |

**直白建议**：如果你要「多智能体协作」，选 **原生**（默认）或 **dsh-agent-teams**（要质量门禁/成员互通/计划审批）；本项目定位已收敛为「**角色人格 + 权限/判据层 + 可视化**」——0.2.3 之后它已经能作为这一层**无缝叠加**在上面两者之上（工具名 `agents_pixe_*` 与 `agent_teams_*` / 原生工具零撞名）。

## 1. 事实基线

| 维度 | 原生 | dsh-agent-teams | 本项目 |
| --- | --- | --- | --- |
| 版本 | `0.2.0-rc.2`（随宿主） | `0.1.22`（npm `latest`） | `0.2.2` |
| 组成 | `dsh-experimental-agent-team`（roster/邮箱/任务 DAG，服务键 `agentTeams`）<br>`-tool-agent-team`（模型可见工具）<br>`-client-ui-agent-team`（Web UI）<br>`-agent-team-profile`（bundle） | 单包双半边（TS 构建：`tsc` + `tsdown`），宿主 `lib/index.js` + 客户端 `lib/client.js` + 类型产物 | 单包双半边（`lib/index.js` + `lib/client.js`（esbuild 产出）+ `lib/team-engine.js`） |
| 默认是否加载 | ✅ 已在 desktop profile 的 `dsh.profile.bundles` | ❌ 需自行安装（桌面端「插件→添加插件」或 `dsh plugin add`） | ❌ 需自行安装（本轮已重新挂载） |
| 维护方 | DeepSeek 上游 | 社区（程序员阿江 / Relakkes），MIT | 社区（本项目），MIT |
| 平台 | Web + 桌面壳 | **Web + Headless** | Web + 桌面壳（`profiles: ["web","desktop"]`） |
| 模型可见工具 | 9 个：`spawn_teammate` `send_message` `list_agents` `wait_agent` `interrupt_agent` `team_task_create/list/get/update` | **14 个业务工具**（README 口径；`usage.md` 中核到 12 个）：`agent_teams_create` `add_member` `remove_member` `create_task` `reassign_task` `claim_task` `update_task` `amend_task` `send_message` `status` `resume` `delete` | 8 个：`agents_pixe_roles` `agents_pixe_team` + `agents_pixe_team_create` `task_create` `task_update` `team_step` `team_message` `team_report`，外加 `/teams` 斜杠命令 |
| 服务接口 | `ctx.get('agentTeams')`：`membership` `tryMembership` `listMembers` `spawnTeammate` `sendMessage` `createTask` `getTask` `listTasks` `updateTask` `waitForChange` `interrupt` | 走模型工具面（自身不依赖宿主 `agentTeams` 服务） | 自建 facade，仅依赖 `ctx.subagents`（`start` / `startContinuable` / `sendMessage` / `listChildren`） |
| 落盘真相源 | **领袖会话日志** | `<workspace>/.agent-teams/`（工作区级） | `~/.dsh/agents-pixe/teams/<leadId>.json` + `.inbox.json` + `archive/`（原子 rename） |
| 激活方式 | 模型直接调原生工具 | `/agent-teams`（封闭命名空间命令 + pre-step 手势边界）+ 自然语言 | `/teams` 斜杠命令 + `agents_pixe_team` 工具 |

## 2. 主对比表（能力逐项）

判定列：**原生** = 原生更好；**DAT** = dsh-agent-teams 更好；**本项目** = 本项目更好；**≈** = 基本对等；**—** = 只有部分方有。

| # | 维度 | 原生 | dsh-agent-teams | 本项目 | 判定 |
| --- | --- | --- | --- | --- | --- |
| 1 | 角色人格注入 | teammate 只带 `name/description/prompt`，人格靠现场写 | 成员 persona（`add_member` 带 role），无角色库 | **508 张角色卡做种子**（0.2.3 起默认只注专业核心三章，省 66% token） | **本项目** |
| 2 | 开箱团队模板 | 无 | 命名多角色团队模板（`profiles`，含 `taskPlanning: captain/seed`），无中文行业预设概念 | **29 个预设中文行业团队**一键成军 | **本项目**（中文行业）/ DAT（模板可编排性） |
| 3 | 成员 ↔ 成员 | ✅ 持久 peer 邮箱直达 | ✅ 任意成员→任意成员/队长**直达邮箱并唤醒对方**，拒绝冒名 `from` | ✅ **0.2.3 起已直达**：引擎用「领袖 Agent 引用」做邻接代理投递（带来源标注、记入 `messages`、不占领袖 LLM 轮次）。传输拓扑仍走父节点、且需领袖曾在本进程调用过引擎工具 | ≈（语义已补齐；原生/DAT 的传输层更直接） |
| 4 | 依赖 DAG | `blockedBy` + `ready` 派生 | `dependencies` 支持**前向引用并校验环**，`assignee` 指派 | 依赖 + `resolvePlanDeps` 剔自依赖/前向/非法引用 | DAT（环校验）/ ≈ |
| 5 | 并发安全 | `revision` CAS | `attempt_id` + CAS；转派先撤旧 attempt；**迟到结果不能覆盖** | `revision` CAS + attempt 数组 | **DAT** |
| 6 | 写域冲突防护 | ✅ `writeScopes` + `writeScopeWarnings`（**仅 advisory 提示**） | 有合同字段（`inScope/outOfScope/changedPaths`），偏质量门禁口径 | ✅ **0.2.5 起确定性硬拦**：任务声明 `writeScopes` 后，完成必须上报 `changed_paths` 且全部在域内，否则 `SCOPE_UNVERIFIED`/`SCOPE_VIOLATION` 拒绝完成并点名越界文件；领袖可 `edit` 显式放宽 | **本项目 ✅**（超出原生：它只提示、我们**拦**；DAT 是事后质量口径） |
| 7 | 等活/调度 | `waitForChange` 10s–1h 事件驱动 | 「共享调度器 + 原子领取 + 唤醒」，空闲自动续领 | `step(waitMs)` ≤60s 轮询 | **原生 / DAT** |
| 8 | 冷恢复 | 靠会话日志 + `provisioning/failed` + `diagnostics[]` | 冷重启遗留任务**才生成新 attempt**（不误伤被中断的驻留成员） | 属主冷则释放回 pending；无空闲成员时只释放 | **DAT** |
| 9 | 成员模型/推理档 | `provider` + `context: fresh/fork` | **默认快照队长路由与思考强度**；可显式 `provider`+`model`+`reasoning_effort`；不弹窗 | ✅ **0.2.3 起可配**：`memberProvider/memberModel/memberReasoningEffort`（留空=快照领袖），经宿主同一套 `resolveChildAgentOptions` 解析 → 与 DAT 同语义 | ≈ DAT（宿主同一解析器；我方默认不弹窗、也缺逐成员覆盖的 UI） |
| 10 | 成员深度限制 | 未在契约中暴露 | `memberMaxDepth` 默认 **0**（成员不能再开子代理），可设 1 | 无限制 | **DAT** |
| 11 | 工具可见性 | 作用域化（仅 Team 成员可见） | 队长首轮即带精简固定协议 + 14 工具；成员带 4 个团队工具 | ✅ **0.2.3 起可裁剪**：`memberToolAllow/memberToolDeny` → 宿主在**子会话 ctx 内 `tools.restrict`**（角色→权限的物理层，含必需工具防呆）。默认仍全量、且所有会话可见 | ≈（能裁剪了；作用域默认粒度仍不如原生） |
| 12 | 人工闸门（计划先行） | ❌ 无 | ✅ **`approval: "required"`**：只落盘可编辑草案（成员占位 + DAG），GUI 确认才建会话/派单；`"automatic"` 走旧的立即执行 | ❌（0.1.2/0.1.3 的 CHANGELOG 与 docs 宣称过 `plan_only`，但**从未在 `lib/index.js` 实现**：`git show fee1174:lib/index.js` 的参数块可证；文档已更正） | **DAT** |
| 13 | 质量门禁闭环 | ❌ 无 | ✅ 默认序 需求→实现→验证→审查→集成；失败不解锁下游、自动 repair/re-review；`kind=review` 复审；`amend_task` 队长专用改合同 + revisions ledger + 审查后冻结 | ✅ **0.2.6 起有「专业门禁」**：`kind="review"` + `review_of` 从**角色卡**抽「关键规则/技术交付物」生成验收清单；完成必须逐条判定（漏判/越界判定被拒），任一 fail → 被判任务**自动打回 in_progress**（下游继续阻塞） | **本项目 ✅**（判据来自 508 张卡的领域知识，两家只有通用流程）/ DAT ✅（有自动 repair 与 revisions 账本） |
| 14 | 暂停/恢复 | ❌ 无 halt 语义 | ✅ `halt` + `resume`（必须带非空 reason），不重建已取消任务 | ✅ `/teams/halt` `resume` + 面板按钮 | **DAT**（带 reason/语义更严）/ 本项目 ✅（更轻） |
| 15 | 可视化 | 原生 UI（列表 + 状态） | ✅ 原生**「团队协作」标签页**：分段进度、可折叠成员树、**可交互 DAG**、点击任务定位成员、成员名开对应会话、归档保留 | Canvas 2D **像素办公室**浮层（走动/打字/徽章/团队面板） | **本项目**（表现力/氛围）/ DAT（信息密度与可用性） |
| 16 | 中英双语 | 跟随宿主 locale | 接入宿主官方多语言服务，实时切换 | 预设团队/成员名/界面 zh+en 双路 | ≈ |
| 17 | 自定义角色 | ❌ | ❌ | ✅ AI 生成角色卡 / 导入 md / 删除；按章节取卡省 token | **本项目** |
| 18 | 角色卡 token 成本 | 0 | 低（persona 简述） | ✅ **0.2.3 起默认只注「专业核心三章」**：实测 508 张卡压缩 **66.3%**（平均 10,391→3,505 字符；4 成员团队单次编排 ≈31.2K→10.5K token），可切 `full` | ≈（仍非 0，但已与「低」同量级） |
| 19 | 状态一致性（多进程） | 会话日志（宿主托管） | 文件持久化，**单进程内串行**；多进程同时改同一团队不保证一致（作者已声明） | 文件 + 原子 rename；同进程串行 | ≈（原生最优） |
| 20 | 已知边界（作者声明） | 实验性（`experimental-*`） | 一队长一活动团队；多进程不一致；早期版本删团队未留归档无法重建 | 一领袖一活动团队；`report` 未完成为草稿 | ≈ |
| 21 | 安装/构建脚本 | 随宿主 | **无需 prepare/构建审批**（产物已提交 Git），另有 `dsh-agent-teams-doctor` 自检 bin | 无 install/postinstall、无下载、无原生编译（`dsh.lifecycle` 已声明） | ≈ |
| 22 | 老宿主兼容 | 只在新版 | ✅ 显式支持 8 个宿主版本（含 `0.1.2-alpha.2` 起） | ✅ 无 `agentTeams` 时降级（但设置层本次需 ≥0.1.7） | **DAT** |
| 23 | 自检/可观测 | 宿主 Inspect（`Service/Tool/Slots`） | `doctor.mjs`（`compatibility.mjs --verify`）、`compatibility.json` 真相源 | `/agents-pixe/settings` 诊断端点（scope/引擎/原生探测） | **DAT**（更成体系） |

### 2.1 三方「宿主兼容策略」对照（本轮踩坑的正面教材）

这一列很值得单看——`dsh-agent-teams` 把「DSH 更新就挂」这件事工程化了，本项目是被门禁挡死之后才补的。

| 维度 | 原生 | dsh-agent-teams | 本项目（0.2.2 修复后） |
| --- | --- | --- | --- |
| `peerDependencies` 写法 | 不适用 | **逐版本枚举**：`"0.2.0-rc.2 \|\| 0.1.7-rc.2 \|\| … \|\| 0.1.2-alpha.2"`（每个 `@deepseek-ai/dsh-*` 都写全） | **范围区间**：`">=0.1.0-rc.2 <0.2.0 \|\| >=0.2.0-rc.1 <0.3.0"` |
| 是否会被 caret 陷阱（`^0.1.x` → `<0.2.0-0`）害到 | — | ✅ 不会（全精确版本，无 caret） | ✅ 不会（显式区间 + 覆盖 0.2.0 预发布 tuple） |
| 宿主兼容清单 | 不适用 | ✅ `compatibility.json`：`recommendedHost` / `previewTag` / `supportedHosts[]`（`recommended`/`legacy`/`preview` 三轨） | ✅ `dsh.compatibility.dshReleases`（5 个版本标 `compatible`） |
| 自动校验 | 宿主门禁 | ✅ `pnpm verify:compatibility` = `compatibility.mjs` + 单测 + `doctor.mjs` | ✅ `test/dsh-0.2-compat.test.mjs`（按 DSH 同款规则复算 peer，含旧写法反面锚点） |
| `peerDependenciesMeta.optional` | — | ✅ 全部标 `optional: true`（避免 profile 解析不到 peer 时装不上）⚠️ 注意：DSH 的 `evaluatePluginCompatibility()` **只看 `peerDependencies`，不理 optional**，所以 optional 不能当豁免用 | ❌ 未标 |
| 新增宿主版本的成本 | 随宿主 | **高**：20+ 个 peer 条目都要改（有脚本 `compatibility.mjs` 兜） | **低**：改 2 个 peer 区间 + `dshReleases` |
| 覆盖面 | 同版本 | 宽（8 个宿主版本） | 窄（0.1.0-rc.2 → 0.2.x） |
| 构建产物 | — | 提交进 Git，Git 安装无需 build/审批 | `lib/client.js` 随包发布，无 build 审批 |

**取舍**：逐版本枚举**不可能被门禁误判**，但每次宿主升级都要动清单（作者用脚本+清单+doctor 把成本压下来了）；范围区间**升级零改动**，代价是要自己证明区间语义（本项目就吃过 caret 的亏，所以补了反面锚点测试）。**两者都对**，关键是别用「跨 minor 的 caret」。

## 3. 本项目优势（在两强夹击下还剩什么）

| 优势 | 原生缺口 | dsh-agent-teams 缺口 | 本项目做法 | 保质期风险 |
| --- | --- | --- | --- | --- |
| **508 张角色卡人格** | 无角色库 | 只有 persona 简述/role，无角色库 | 整卡注入 + `sections` 按章取 | 低（上游数据即资产） |
| **29 个预设中文行业团队** | 无预设 | 有命名模板但无中文行业预设 | `TEAM_PRESETS` + `nameEn` 双语 | 低 |
| **像素办公室可视化** | 只有列表/状态 | 原生标签页（信息密度高、无氛围） | Canvas 2D 浮层：走动/打字/徽章/拖动折叠 | 中（偏装饰） |
| **自定义角色** | 无 | 无 | AI 生成卡 / 导入 md / 删除 | 低 |
| **轻量暂停/恢复** | 无 | 有（带 reason、语义更严） | 一键 halt/resume + 面板 | 中（被 DAT 覆盖） |
| AI 闲聊（60 次/60K token 硬预算） | 无 | 无 | 端点硬门 + 去重缓存 | 低 |
| 老宿主降级可用 | 只在新版 | 支持面更宽 | 能力探测 + 静默降级 | 低 |

## 4. 本项目劣势（分「对照原生」与「对照 dsh-agent-teams」）

### 4.1 对照原生

| 劣势 | 原生已提供 | 影响 |
| --- | --- | --- |
| 功能重复（自建 roster/邮箱/DAG 引擎） | 完整服务 + 工具 + UI，且默认开启 | 维护成本翻倍，用户面对两套「团队」概念 |
| 第二真相源（文件 vs 会话日志） | 任务在领袖会话日志，可回放审计 | 状态可能不一致、不可跨设备回放 |
| ~~无写域冲突提示~~ | `writeScopes` / `writeScopeWarnings` | ✅ **0.2.5 已补，且做得更硬**：声明写域的任务完成时对账 `changed_paths`，越界直接拒绝完成（原生只提示） | 已不再是劣势 |
| 成员通信被迫星型 | peer 邮箱 | 领袖成瓶颈 |
| 调度精度 / 工具作用域 / token 成本 | 事件驱动等活、作用域化工具、零角色卡开销 | 空转延迟、非团队会话背 8 个工具定义、每成员多花数万 token |

### 4.2 对照 dsh-agent-teams（更严峻的一组）

| 劣势 | DAT 已有 | 本项目现状 | 差距性质 |
| --- | --- | --- | --- |
| **计划先行 / 人工闸门** | `approval:"required"` 草案落盘 → GUI 编辑 → 确认才建会话 | **文档宣称过、代码从未实现**（文档已更正）；当前只有 `halt` 暂停派单 | **能力缺失**（不是「倒退」），且 DAT 的草案是「可编辑占用 + DAG」而非一句文本 |
| **质量门禁闭环** | 需求→实现→验证→审查→集成 + 自动 repair/re-review + `kind=review` + `amend_task` revisions ledger | 无 | **完全空白**，这正是「团队产出能不能信」的关键 |
| **成员直达消息** | 任意成员↔任意成员，持久邮箱 + 唤醒 + 防冒名 | 必须经领袖转达 | 架构性差距 |
| **attempt 语义** | 转派撤销旧 attempt、迟到结果不能覆盖、只有冷重启才新建 attempt | 有 attempt 但语义较粗 | 一致性/正确性差距 |
| **成员模型/推理档** | 默认快照队长路由，支持异构分工与 `reasoning_effort`，不弹窗 | 无 | 可用性与成本控制差距 |
| **成员深度限制** | `memberMaxDepth` 默认 0 | 无 | 防递归爆炸 |
| **可视化信息密度** | 分段进度 + 可折叠成员树 + **可交互 DAG** + 点击定位 | 像素办公室（表现力强、信息密度低） | 定位不同，但 DAT 的面板是「能干活」的 |
| **兼容工程化** | `compatibility.json` + `doctor` + `verify:compatibility` + 8 宿主版本 | 本轮才补双门禁 | 成熟度差距 |
| **成员广度** | `maxMembers` 默认 8 | `max_roles` 默认 4、上限 8 | 略弱 |
| 提交/测试规模 | 大型 `verify` 矩阵（harness 契约、lifecycle、stress、release、readme 校验…） | 98 项测试 | 工程投入量级差距 |

## 5. 场景选型

| 场景 | 首选 | 备选 | 理由 |
| --- | --- | --- | --- |
| 「多智能体并行干活，拆任务、互发消息、等活」 | **原生** | dsh-agent-teams | 原生默认开启、与宿主同版本；要更强能力再上 DAT |
| 「要质量门禁：必须验证/审查通过才允许集成」 | **dsh-agent-teams** | — | 三方只有它有验收闭环与 `amend_task` 账本 |
| 「先看计划再批准执行」（人工闸门） | **dsh-agent-teams** | — | `approval:"required"` 草案可编辑；本项目该能力已丢失 |
| 「成员之间要直接对话」 | **dsh-agent-teams** / 原生 | — | 本项目星型转发是架构限制 |
| 「角色异构：后端用 A 模型、前端用 B 模型」 | **dsh-agent-teams** | 原生（按 teammate 指定） | DAT 默认快照队长路由、显式传参才异构，且不弹窗 |
| 「要一个『资深安全工程师』人格来评审」 | **本项目 `agents_pixe_roles`** | — | 508 张卡，比现场编人设稳定且省心 |
| 「一键组一支中文行业团队（短视频/跨境电商/航天…）」 | **本项目** | — | 29 个预设是另两方都没有的 |
| 「想看见像素办公室、要氛围和可玩性」 | **本项目** | — | 另两方只有功能性面板 |
| 「老版本 DSH / 没有 agent-team-profile」 | **dsh-agent-teams**（支持面最宽） | 本项目 | DAT 显式支持 8 个宿主版本 |
| 「Headless / CLI 环境」 | **dsh-agent-teams** | 原生 | DAT 明确支持 Web + Headless；本项目是 Web 平台插件 |
| 「成本敏感，只要个多视角结论」 | 本项目 `agents_pixe_team`（一次性编排） | 原生小团队 | 一次性 N+2 次调用、不驻留子代理 |

## 6. 共存策略（已落地）

从 `0.2.1` 起，宿主侧探测 `ctx.get('agentTeams')`：

- **检测到原生**：系统提示段改为「**默认优先原生工具**」并点名 9 个原生工具，限定本项目只负责 4 项独有能力，明确要求**同一次编排两套不混用**（避免双份团队/双份 token）。
- **检测不到**：退回「走 `agents_pixe_*`」，行为与 0.1.x 一致。
- **工具名零冲突**：`agents_pixe_*` 前缀 + 测试断言；`ctx.get('agentTeams')` 抛错也不影响 `apply`。
- `/agents-pixe/settings` 诊断新增 `nativeAgentTeams` / `nativeAgentTeamsTools` / `teamEngine` / `subagentsStart` / `subagentsContinuable` / `settingsLegacy` / `settingsWritable`。
- **与 dsh-agent-teams 无冲突**（工具前缀 `agent_teams_*` vs `agents_pixe_*`，命令 `/agent-teams` vs `/teams`），可以同时装；但**不要在同一次编排里混用两套引擎**，同理适用于原生。

> 注：dsh-agent-teams 注册的是 `/agent-teams`，本项目 0.1.9-rc.3 已把命令从 `/agent-teams` 改名为 `/teams` —— 这次改名正好避开了撞名。

## 7. 如何逐项「超越」——14 项决策路径矩阵

### 7.0 先定性：三种超越姿势（别用错）

| 姿势 | 含义 | 适用行 | 风险 |
| --- | --- | --- | --- |
| **A 借力补齐** | 宿主/原生**已经把原语给了**，本项目只是没接线。补上即可追平甚至局部超过 | 3 成员互通、6 写域、7 等活、9 成员模型、11 工具作用域 | 低（照契约接线） |
| **B 换维超越** | 不跟它们比机制，而是提供它们**结构上没有的东西**：人格、判据、权限绑定 | 1 角色卡、2 预设、12 计划闸门、13 质量判据、17 自定义角色、18 人格 token | 中（要证明有效，否则只是"可爱"） |
| **C 放弃正面** | 架构性赢不了，改为**只读消费**或**让位** | 真相源、默认加载、平台广度、兼容工程化 | 低（止损） |

> 关键认知：**A 类只能追平，C 类是止损，只有 B 类能"严格超过"**——因为原生与 DAT 都没有「角色身份」这一层。它们能给的是「通用子代理 + 一句 description」；本项目能给的是「这个成员**必须**按该专业的关键规则工作，且**只**被授予该专业需要的工具」。

### 7.1 14 项路径矩阵

| # | 维度 | 现状差距 | 超越动作 | 依赖的宿主原语（**本轮已实测存在**） | 成本 | 值得吗 |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | 成员↔成员 | 星型转发，领袖瓶颈 | ✅ **0.2.3 已落地**：引擎用领袖 Agent 引用做**邻接代理投递**（不占领袖 LLM 轮次、带来源标注、记入 `messages`）。⚠️ 上一版本文档在此处断言「用 `subagents.sendMessage` 接线即可」是**错的** —— 实测该 API 只支持父↔直系子（契约原文 "direct continuable child or … direct parent"），兄弟不邻接 | `subagents.sendMessage(leadAgentRef, memberId, …)`（领袖是成员的父，邻接成立）；`createTeam`/`step`/`report`/`createTask`/`view` 任一处由领袖调用即自愈登记 | **实测：~70 行** | ✅ **已完成** |
| 6 | 写域冲突 | 无写域概念 | ✅ **0.2.5 已落地（协议层硬拦）**：任务声明 `writeScopes` → `complete` 必须带 `changed_paths` 且全在域内，越界拒绝并点名违例；领袖 `edit` 可显式放宽。**未做**：执行期 `ctx.tools.guard`（在成员会话内直接拒绝越界编辑） | 已用：任务字段 + CAS 状态机兜底（不可绕过）；待用：`ctx.tools.guard(...)`（经 `agent.ctx` 注册只作用于该 agent，返回字符串即拒绝）+ 成员 live Agent 引用 | **实测 ~90 行** | ✅ **已完成（协议层）**；执行期 guard 留待后续 |
| 7 | 等活调度 | ≤60s 轮询空转 | 换事件驱动有界等待；自建则订阅子代理状态事件，用原生则直接 `waitForChange` | `agentTeams.waitForChange(caller, timeoutMs, signal)`：**10s–1h** | 中 | ✅ 省 token + 降延迟 |
| 9 | 成员模型/推理档 | 无按成员模型 | ✅ **0.2.3 已落地**：`memberProvider/memberModel/memberReasoningEffort`（留空=快照领袖），成员上如实记 `model/provider/reasoningEffort` 供面板展示 | `subagents.startContinuable({ request: { agentOptions } })` / `subagents.start({ agentOptions })`；宿主 `resolveChildAgentOptions` 负责「provider/model 变了就回退目标模型默认档」（= DAT 同语义，白捡） | **实测：~40 行** | ✅ **已完成** |
| 11 | 工具作用域 | 全局注册，非团队会话也背 8 个工具 | 🟡 **0.2.3 已完成「可裁剪」**：`memberToolAllow/memberToolDeny` → 宿主在**子会话 ctx 内 `tools.restrict`**（角色→权限的物理层，含必需工具防呆）。**未做**：按 `tryMembership` 判断「只给团队成员装工具」 | 已用：`request.toolFilter`（宿主 `applyChildComposition` 里 `childCtx.tools.restrict(toolFilter)`）；待用：`ctx.tools.register(def)`「Register globally **or in the calling agent scope**」+ `agentTeams.tryMembership(agent)`（文档原话「used by **scoped-tool installation** and observers」）+ `activation.handle.agent` | 已用 ~30 行；剩余 ~中 | 🟡 **P1**（同时解决重叠与 token） |
| 1 | 508 张角色卡 | 只当"人格装饰"用 | 升级为**能力绑定层**（见 §7.2） | 角色卡数据（已有）+ 上面 5 个原语 | 中 | ✅ **唯一护城河** |
| 2 | 29 预设中文团队 | 只是选人快捷方式 | 让预设同时携带**阵容 + 权限 + 验收清单**（= 可执行的团队契约，而非名单） | `restrict`/`guard` + 任务字段 | 低（复用现有预设表） | ✅ |
| 12 | 计划先行 | 缺失（文档虚报过） | 从零实现：`agents_pixe_team(plan_only=true)` 只出**可编辑草案**（成员占位 + DAG）落盘 → 用户在像素面板确认 → 再建会话/派单；`plan_tasks` 回传覆盖 | 结构照 DAT 的 `approval:"required"`；本项目已有 `halt`/草案落盘/`view` 端点可复用 | 中 | ✅ 补上唯一"信任闸门" |
| 13 | 质量门禁 | 完全空白 | ✅ **0.2.6 已落地（专业门禁）**：`kind="review"` + `review_of` → 从角色卡抽「关键规则/技术交付物」成验收清单；`complete` 必须逐条判定（漏判/越界被拒），任一 fail → 被审任务**自动打回**并记 `lastReviewFailures`。**未做**：自动 repair 任务生成、revisions 账本（DAT 的 `amend_task` 那套） | 复用已有：任务字段 + CAS 状态机 + `cardAcceptance()`（从 508 张卡抽判据）；待用：可再补「fail 自动开 repair 任务」 | **实测 ~150 行** | ✅ **已完成**（判据维度**超过两家**） |
| 17 | 自定义角色 | 已有 | 加上「生成时同时产出验收清单 + 工具白名单」 | 同 13 | 低 | ✅ |
| 18 | 人格 token 成本 | 每成员整卡 | 默认只注入「关键规则 + 交付物」两章（现成 `sections=rules`），整卡转为**按需检索**；成本即可与原生比肩 | 已有 `sectionOf` 实现 | **低** | ✅ 必做（当前最大性价比空间） |
| — | 真相源 / 默认加载 / 平台广度 / 兼容工程化 | 架构性落后 | **只读消费 + 让位**：面板改读原生 `TeamTaskView`/`TeamMemberView`（或 DAT 的 `.agent-teams/`）做投影；提供 headless 可用（无 slots 时只装宿主半边）；兼容策略向 DAT 对齐（`compatibility.json` + doctor） | `agentTeams.listMembers/membership`；`plugin_manager`/`dsh.compatibility` | 低 | ⚠️ 止损，不追 |

### 7.2 核心论点：把「角色卡」升级为「能力绑定层」

现在角色卡只影响 **prompt 文本**（人格）。把它同时绑定到另外三处，就形成原生与 DAT 都没有的结构：

| 绑定 | 由什么承载 | 产出 | 为什么它们做不到 |
| --- | --- | --- | --- |
| **人格** | 角色卡 → 成员 prompt 种子 | 该专家的工作视角与沟通风格 | 原生只有 `description`；DAT 只有 persona 简述 |
| **权限** | 角色卡 → `tools.restrict({allow, deny})` | 只读角色（审查员/审计员）**拿不到写工具**；安全角色拿不到 shell | 两家都是"通用成员 + 通用工具集"，无角色→权限映射 |
| **权界** | 角色卡 → 任务 `writeScopes` + `tools.guard` | 越界改文件被**确定性拒绝/判失败** | 原生只做 advisory 警告；DAT 是事后质量口径 |
| **判据** | 角色卡「关键规则/交付物」→ review 任务 `acceptance` | 验收**按专业清单逐条判**，而不是通用「需求→实现→验证→审查→集成」 | 两家都只有通用流程，没有专业判据 |

**一句话**：原生/DAT 提供「**怎么协作**」的机制；本项目提供「**谁在做、能做什么、做到什么算合格**」。把两者组合，结果**严格优于**任何单独一方——这才是"超越"的正确形态，而不是重写一份更差的引擎。

### 7.3 三条路线对比（选哪条）

| 路线 | 内容 | 投入 | 收益 | 是否被下一代覆盖 | 建议 |
| --- | --- | --- | --- | --- | --- |
| **路线 1：人格层** | 只做角色卡/预设/可视化，编排全让位（原生或 DAT） | 低 | 立刻零重叠、可长期存活 | **不会**（它们不打算做角色库） | ✅ 立刻做 |
| **路线 2：超集引擎** | 补齐 A 类 5 项 + 计划闸门 + 通用门禁，追平 DAT | **高**（远超本轮） | 追平，但不领先 | **会**（DAT 迭代更快） | ❌ 不建议 |
| **路线 3：叠加（推荐）** | 机制用原生/DAT；本项目出**人格 + 权限 + 权界 + 专业判据**；面板只读投影 | 中 | **严格优于**两者单独使用 | 不会（判据来自 508 张卡的领域知识） | ✅ 主路线 |

### 7.4 怎么证明"真的超越了"（可证伪的验收）

不要用"像素人很可爱"当优势。用同一任务做三组对照：

- 任务：`审查 v0.5.3 之后的提交，从性能/安全/产品分工，出汇总报告`（DAT README 的原例）
- 三组：② 原生裸成员 ② DAT 默认 ③ **DAT 机制 + 本项目角色卡人格/权限/判据**
- 指标（可量化）：
  1. **专业检查项覆盖率** —— 以角色卡「关键规则」章节为 rubric，逐条判定是否被检查
  2. **越界率** —— 修改文件数落在 `writeScopes` 外的比例（本项目应显著更低，因为硬拦）
  3. **越权工具调用数** —— 只读角色是否尝试过写操作（本项目应为 0，因为 `restrict` 移除了写工具）
  4. **token 成本** —— 若默认只注入两章，应接近原生
  5. **人工返工次数** —— 报告是否需要人工补关键项
- 通过标准：③ 在 1/2/3/5 上显著优于 ① 与 ②，在 4 上不劣于 ②。

### 7.5 落地清单（按性价比排序）

| 优先级 | 动作 | 改动量预估 | 依赖 |
| --- | --- | --- | --- |
| **P0 ✅ 已完成（0.2.3）** | 角色卡默认只注专业核心三章（实测省 **66.3%**）；`memberCardMode=full` 可回退 | ~70 行（含测试） | 已有 |
| **P0 ✅ 已完成（0.2.3）** | 成员模型/推理档配置（默认快照领袖路由） | ~40 行 | `agentOptions`（已验证 in-process advertise true） |
| **P0 ✅ 已完成（0.2.3）** | 成员↔成员直达（**引擎以领袖引用代理投递**，非直连兄弟） | ~70 行 | `subagents.sendMessage` 邻接语义（实测只支持父↔直系子） |
| **P0 ✅ 已完成（0.2.3）** | 成员工具白名单 `toolFilter`（含必需工具防呆） | ~30 行 | 宿主 `childCtx.tools.restrict`（已验证） |
| **P1** | 任务 `writeScopes` + `complete` 时对账硬拦 | ~80 行 | 引擎已有 attempt/task 模型 |
| **P1** | `tools.restrict` 角色→工具白名单（只读角色无写权） | ~60 行 + 角色卡映射表 | `ctx.tools.restrict` / `tryMembership`（已验证） |
| **P2** | 角色卡「关键规则/交付物」→ review 任务 `acceptance` 专业判据 | ~120 行 | 角色卡数据 |
| **P2** | 计划先行（草案落盘 + 面板确认 + `plan_tasks` 回传） | ~150 行 | 复用 `halt`/草案/`view` 端点 |
| **P3** | 面板改「只读投影」原生任务板（去掉第二真相源） | ~200 行 | `agentTeams.listMembers/listTasks` |
| **P3** | 编排让位：新宿主引导原生/DAT，`agents_pixe_team` 仅留老宿主兜底 | ~30 行 + 提示文案 | 已有探测 |
| **P4** | 兼容策略对齐 DAT：`compatibility.json` 单一真相源 + `doctor` bin | ~120 行 | 已有双门禁测试 |

## 8. 收敛路线（建议）

| 阶段 | 动作 | 收益 |
| --- | --- | --- |
| **P0（已完成 · 0.2.3）** | ① 角色卡默认只注专业核心三章（实测省 **66.3%**）② 成员模型/推理档配置 ③ 成员↔成员直达 ④ 成员工具白名单（能力绑定物理层） | ✅ 追平两家的 token 与互通，且未改架构；`full` 可一键回退 |
| **P0（已完成 · 0.2.2）** | 设置服务迁移 + 兼容双门禁 + 重新挂进 profile | ✅ 更新后不再「整体消失」，也不再「装了但没功能」 |
| **P1 🟡 部分完成（0.2.5）** | ✅ 任务 `writeScopes` + 完成对账**硬拦**（超过原生）；❌ 执行期 `guard` / 作用域化工具 —— **被宿主契约挡住**（`startContinuable` 不暴露成员 live Agent，取证见 CHANGELOG 0.2.6） | 写域维度已超过原生；执行期拦截待宿主开放 childId→Agent |
| **P2 ✅ 已完成（0.2.6）** | 角色卡「关键规则/交付物」→ review 任务**验收判据** + 逐条判定门禁 + fail 自动打回 | 完成度最高：判据维度两家都没有 |
| **P2（剩余）** | 计划先行草案（对齐 DAT 的 `approval:"required"`）；fail 自动开 repair 任务 | 补齐「信任闸门」与自动修复闭环 |
| **P2 ✅ 已完成（0.2.6）** | 角色卡 → **专业验收判据**（review 任务 acceptance + 逐条判定 + fail 自动打回） | ✅ 形成两家都没有的「专业门禁」 |
| ⬜ **P1 被宿主契约挡住（已取证）** | `ctx.tools.guard` 执行期拦截 / `tryMembership` 作用域化工具：`startContinuable` 只返回 `{childId,messageId}`，拿不到成员 live Agent → `agent.ctx.tools.*` 不可达 | 已有替代：协议层硬拦（写域 + 专业门禁，不可绕过）+ 成员 `toolFilter` 裁剪 |
| **P3 ✅ 已完成（0.2.9）** | 面板改**只读投影**原生任务板（`view` 端点优先原生 `listMembers/listTasks`，无原生团队才回落引擎；原生生效时写端点拒绝）；`agents_pixe_team` 保留给老宿主 | 去掉第二真相源 |
| **P4** | 兼容策略对齐 DAT（`compatibility.json` 单一真相源 + `doctor` bin） | 把「升级就挂」变成可验证流程 |
| **P5** | 若上游把角色库纳入 `agent-preset-registry`，评估以 preset 形式贡献上游 | 长期免维护 |

## 9. 来源

- [NanmiCoder/dsh-agent-teams（GitHub）](https://github.com/NanmiCoder/dsh-agent-teams) · [README_ZH.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/README_ZH.md) · [docs/usage.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/docs/usage.md) · [compatibility.json](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/compatibility.json) · [package.json](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/package.json)
- npm：[`@nanmicoder/dsh-agent-teams`](https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams)
- 本项目本轮兼容取证：[dsh-0.2-compat.md](./dsh-0.2-compat.md)
