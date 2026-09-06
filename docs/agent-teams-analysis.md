# dsh-agent-teams 前后端学习分析

> 面向：`agent-teams-pixel` 插件「真正团队协助」改造。分析对象 = [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams)（AgentTeams plugin for DeepSeek Harness）。结论：**pixel 不移植其独立文件引擎，也不依赖宿主 `agentTeams`（实测为声明未挂载的幽灵服务）**，改为**基于宿主 `subagents` 续聊原语 + 文件态**自建，把上游设计逐条落地到 pixel。

## 1. 一句话定位

`dsh-agent-teams` 把「一个 DeepSeek Harness 会话」变成一个**领袖（captain）+ 多名驻留可续聊成员**的多智能体团队：用自然语言拆目标，自动生成**带显式依赖的任务 DAG**，靠**共享调度器**把任务派给空闲成员，全程**文件持久化**，Web 面板**实时看 status**。它自己实现了一套完整引擎（11 个协调工具 + `.agent-teams/` 文件态 + 自带调度器）。

## 2. 后端（引擎）核心

### 2.1 角色与成员模型
- **领袖（captain/lead）**：当前会话。创建团队、给成员分工、汇总最终结果、归档团队记录。
- **成员（teammate）**：**驻留可续聊 DSH 子 Agent**（continuable sub-agent），可被唤醒做一轮针对性的续聊，上下文不丢失。
- 一领袖**同一时间只带一个活动团队**。

### 2.2 任务与状态机（attempt 语义）
- 任务由领袖拆解，含**显式依赖**（`blockedBy`）；`ready = 所有依赖均完成`。
- 状态：`pending → in_progress → completed`（可 `reopen`；`release` 回到 pending；`reassign` 换负责人；`delete` 删）。
- **attempt 模型**：每次状态迁移都是 **compare-and-set**（CAS）。携带**最新的 `expected_revision`（attempt_id 的体现）**，防并发覆盖。转派或领袖接管 = 先撤销旧 attempt（release）→ 等原成员归静 → 再 claim 新 attempt（同一个 `expected_revision` 校验保证原子）。

### 2.3 共享调度器
依据**真实 `running` / `idle` / `ready` 状态**：
- 有空闲成员（`idle` 且未持有开放 attempt）→ 原子领取一项**就绪未认领**任务（`claim`，CAS）→ **唤醒**该成员（`wakeup` 消息）→ `waitForChange` 等团队变更。
- 仍持有开放 attempt 的空闲成员 → **停驻（parked）**，可被**直发消息**续用原 attempt，或显式转派。
- **冷进程重启**后的遗留任务：属主已非 `running`（`inactive`/`failed`）→ 释放并重新 claim，生成**新 attempt**恢复。有界等待（10s～1h）。

### 2.4 邮箱直投（direct messaging）
成员↔领袖/队友用**持久邮箱**消息（`quiet`/`wakeup`）。无法立即投递的消息**持久化**并在后续状态边界**重投**。

### 2.5 持久化
团队状态存 `<workspace>/.agent-teams/`；单 DSH 进程内**串行**操作；多进程同时改同一团队不保证一致。

### 2.6 工具面
注册 `agent_teams_*` 系列协调工具（create / add_member / create_task / update_task / send_message / …）。`/agent-teams` 斜杠命令为入口。

## 3. 前端（Web 活动面板）

- **分段的进度条**（完成任务数/总数）。
- **可折叠的名册（roster）**：每个成员 = 状态徽章（running 绿 / idle 灰 / inactive 淡 / provisioning 琥珀 / failed 红）+ 名字 + 角色（👑 领袖）+ 模型路由；运行中的任务显示该成员所用模型。
- **可交互任务 DAG**：任务状态、负责人、依赖、就绪标记。
- **归档标记**：完成后保留完整成员与任务历史。
- 界面用 DSH 官方 locale，跟随中英切换。

## 4. 与宿主原生引擎的关系（关键判断，实测修正）

**结论修正**：宿主 **`agentTeams` 是「声明未挂载」的幽灵服务**——它出现在 Inspect 能力目录（契约在 `dsh-tool-cordis/lib/index.js` 定义），但本 dsh（0.1.2-alpha.4）**没有任何 provider 包把它真正 mount**（全局 dsh 无 `@deepseek-ai/dsh-team`，web profile 也无）。据此设计的引擎整体降级。

| 上游概念 | 宿主 `subagents` 服务（真挂载，pixel 用它自建） |
|---|---|
| 驻留可续聊成员 | `startContinuable({provider,label,request:{prompt,parent},signal})` → 续聊子会话 |
| 成员状态 | `listChildren(parentId)` → `running/inactive`；注册表失踪=`inactive` |
| 唤醒 / 邮件直投 | `sendMessage(sender,targetId,content)`（父↔子邻接直投） |
| 中断 / 释放 | `interrupt`、`drainContinuableChildren` |
| 运行后端 | `list()`/`getProvider(name)`（spawn/fork）|

**结论**：pixel **不依赖 `agentTeams`**（幽灵）；改为**基于 `subagents` 续聊原语 + 文件态**自建团队/任务/attempt 模型（状态文件持久化、单进程串行、面板读磁盘真相快照）。参考 dsh-agent-teams 不用 `agentTeams`、靠 `subagents` 自建——正是同一成熟做法。

## 5. pixel 落地区（本次改造）

- 引擎模块 `lib/team-engine.js`：纯服务注入、仅 `node:fs` 落盘、**逻辑可单测**（依赖就绪 / 状态机 / 停驻 / 冷停 / CAS 冲突 / 归档）。
- 宿主 `lib/index.js`：检测 `ctx.get('subagents')`，注册 6 个协调工具（`agents_pixe_team_create` / `agents_pixe_task_create` / `agents_pixe_task_update` / `agents_pixe_team_step` / `agents_pixe_team_message` / `agents_pixe_team_report`）；`agents_pixe_team` 升级为真引擎便捷入口（默认 `plan_only=true` 先出计划草案，`plan_only=false` 执行建团→拆依赖任务→派单→汇总），旧一次性逻辑作降级；注册 `/agent-teams` 命令（确定性唤醒）+ 系统提示段「`/agent-teams` 或团队协作 → 必须调用 `agents_pixe_team`，先计划后执行」；新增 `GET /agents-pixe/teams/view`（磁盘快照优先）。
- 客户端 `src/client.main.js`：像素办公室标题栏加「🤝 团队」按钮，切出 `TeamPanel`（roster 状态徽章 + 任务板 + 进度分段 + 归档标记），轮询 `/agents-pixe/teams/view?lead=<sid>`。
- 落盘：`<DSH_HOME>/agents-pixe/teams/<leadId>.json`（快照，磁盘真相）+ `<leadId>.inbox.json`（成员成果）+ `archive/`（完整团队记录）。

## 6. 验收（可执行断言，已跑通）

- `node --test` → **42/42 通过**。
- `node scripts/build-client.mjs` → 成功产出 `lib/client.js`（268.5 KB）。
- 引擎单测覆盖：依赖 ready 计算、CAS 冲突拒绝、转派/释放、状态机合法迁移、停驻检测、冷停恢复、报告归档落盘。
- 高保真 harness 硬压 `test/team-engine-stress.test.mjs`（忠实复刻宿主 `subagents` 原语 + 文件态的 CAS/状态机/依赖/唤醒语义）：**冷恢复（有/无空闲成员）、转派 CAS、停驻、多依赖串行顺序、多依赖并行分支、max 成员并发上限、空闲自动续领、report 草稿归档/正式汇总、resolvePlanDeps 无环防护、decomposeFallback 拆解失败兜底、同一步不重复领任务、跨步幂等、CAS 防并发双领** 共 15 项全过。
- 工程级回归 `test/register-face.test.mjs`：mock ctx 驱动真 `apply()`，验证 **registerFace 重入不重复注册引擎工具**（6 个稳定，无叠加）。
- **压测暴露并修复的缺口**：① 冷停恢复原先在无空闲成员接手时直接跳过，任务卡在 `in_progress`（死属主未释放），已改为**先释放死属主**（落回 pending）再尝试认领；② `agents_pixe_team` 拆解出的**自依赖/前向引用/非法依赖**原被静默滤掉，已加 `resolvePlanDeps` 剔除 + warning（保证 DAG 无环）；③ 便捷编排**拆解失败**原只建团队不建任务（死胡同），已加 `decomposeFallback` 退化到各成员并行处理整体任务。均已被测试锁定。

### 6.1 现场验证状态（真实 DSH 会话）

用动态 Cordis 插件（`harness.defineTool`+`harness.registerTool`）在本会话探测宿主服务，结论（**实测修正**）：

- **`agentTeams` 服务并未真正挂载**：它只见于 Inspect 能力目录（契约在 `dsh-tool-cordis`），无 provider 包 mount；据此设计的引擎整体降级（`ctx.get('agentTeams')` 空 → `agents_pixe_team` 走旧一次性 N+2）。此前「已挂载」判断不成立（动态插件 apply 可能走了 `at === undefined` 早退分支）。
- **改用 `subagents`**：该服务真挂载（像素已 `inject`，旧一次性工具也用它、真实跑通）；引擎改为基于它自建（`startContinuable`/`sendMessage`/`listChildren` + 文件态团队/任务/attempt 模型）。
- **未能由本会话完成全流程 e2e 触发**：动态注册的工具不会中途加入当前 turn 的模型可调函数目录，我无法用函数调用触发它；且本会话挂载的像素插件是旧版，新引擎需编辑后的插件重载（重建客户端 + 重启 DSH web）才能生效。
- **全流程现场验证的可行路径**（用户侧）：在安装本插件的 DSH 会话里，设置 → 像素办公室 → 开启「角色工具」，然后对会话说「用研发团队协助：<任务>」或输入 `/agent-teams <目标>`（确定性唤醒，先出计划再确认执行），或逐步调用 `agents_pixe_team_create / agents_pixe_task_create / agents_pixe_team_step / agents_pixe_task_update / agents_pixe_team_report`；像素办公室标题栏「🤝 团队」按钮实时看活动面板。

