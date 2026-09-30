# ADR-001：agent-teams-pixel 团队引擎 —— 基于宿主 `subagents` 续聊原语 + 文件态自建

## Status
**已采纳（Accepted）**。引擎已落地并通过验证：`node --test` 42/42 通过，`scripts/build-client.mjs` 成功产出 `lib/client.js`。若后续宿主挂载了真正的 `agentTeams` provider，本 ADR 可重新审议（见「风险 · 跨版本漂移」）。

## Context

agent-teams-pixel 要让「一个 DeepSeek Harness 会话」变成**领袖 + 多名驻留可续聊成员**的多智能体团队：自然语言拆目标 → 生成带显式依赖的任务 DAG → 共享调度器把任务派给空闲成员 → 成员回传成果 → 领袖汇总归档，Web 面板实时看状态。

参考对象是上游 [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams)。它的做法是**自带一套完整引擎**（11 个协调工具 + `.agent-teams/` 文件态 + 自己的调度器）。

三条候选路线摆在面前时，必须先用**实测事实**排除掉一条路：

- **`agentTeams` 是「声明未挂载」的幽灵服务**。它的契约声明在 `dsh-tool-cordis/lib/index.js`（Inspect 能力目录能查到），但本 dsh（0.1.2-alpha.4）**没有任何 provider 真正 mount 它**——全局 dsh 无 `@deepseek-ai/dsh-team`，web profile 也无。用动态 Cordis 插件现场 `ctx.get('agentTeams')` 探测：为空。
- **`subagents` 是真正挂载的**。像素旧一次性工具已 `inject` 它并真实跑通；`startContinuable` / `sendMessage` / `listChildren` 三项原语均可调用。

## Decision

**不移植 dsh-agent-teams 的独立文件引擎，也不依赖宿主 `agentTeams`（幽灵）。改为基于宿主 `subagents` 续聊原语 + 文件态，自建团队/任务/attempt 模型。**

拆解为四个可执行的子决策：

1. **成员模型**：驻留可续聊子 Agent = `subagents.startContinuable({provider, label, request:{prompt, parent}})`，状态经 `subagents.listChildren(leadId)` 刷新为 `running/idle/inactive`。
2. **协调面**：宿主 `lib/index.js` 检测 `ctx.get('subagents')`，注册 6 个细粒度工具（`agents_pixe_team_create` / `agents_pixe_task_create` / `agents_pixe_task_update` / `agents_pixe_team_step` / `agents_pixe_team_message` / `agents_pixe_team_report`）；`agents_pixe_team` 升级为真引擎便捷入口；注册 `/teams` 斜杠命令（确定性唤醒）+ 系统提示段。
   > ⚠️ 本节原文声称「默认 `plan_only=true` 先出计划草案」——**该能力从未在代码中实现**（`git show fee1174:lib/index.js` 的 `agents_pixe_team` 参数块可证），属文档虚报，2026-09-30 核对后更正。当前唯一人工闸门是 `GET /agents-pixe/teams/halt`（暂停派单）。
3. **持久化模型**：文件态 = `<DSH_HOME>/agents-pixe/teams/<leadId>.json`（团队/任务快照 = 磁盘真相）+ `<leadId>.inbox.json`（成员成果）+ `archive/`（完整团队记录）。
4. **一致性模型**：任务用 `revision` + `expectedRevision` 做 **compare-and-set**（CAS），状态迁移走 **attempt 状态机**（`pending → in_progress → completed`，可 `reopen`/`release`/`reassign`/`delete`）；共享调度器按真实 `running/idle` 状态**原子领取**并唤醒空闲成员。**单 DSH 进程内串行**，不承诺跨进程一致。

## 选项与取舍

### 选项 A：基于宿主 `subagents` 续聊原语 + 文件态自建（✅ 采纳）

- **得**：与宿主解耦——引擎模块 `lib/team-engine.js` 纯服务注入、仅 `node:fs` 落盘、**逻辑可单测**（依赖就绪/状态机/停驻/冷停/CAS 冲突/归档全部被测）；磁盘快照即真相，可读、可 debug、可跨重启恢复；不背负一个**未被挂载的服务**。
- **失**：`subagents` 是**低级原语**，团队/任务/attempt 这一层全靠自己造，代码量更大；孩子生命周期粒度比理想团队服务粗（只有 running/inactive）。

### 选项 B：驱动宿主 `agentTeams` 服务（❌ 否决）

- **得**：理论上接口最省事、最贴近「官方多智能体」。
- **失**：它是**幽灵服务**——只有契约没有实现。依赖它等于整个功能在部分 dsh 里**静默降级**，且这种降级不可诊断（`ctx.get` 返回空，无报错）。这是最致命的取舍：一个你无法探测其真伪的服务，不能作为系统支柱。

### 选项 C：移植 dsh-agent-teams 的独立文件引擎（❌ 否决）

- **得**：上游引擎与其自身的文件态/调度器是**自洽闭环**，直接搬可少写代码。
- **失**：它绑定了**它自己的会话/工具模型（11 个工具 + 自己的 `.agent-teams/` 状态 + 自己的调度语义）**，与像素的 `subagents` 会话/工具约定不吻合；移植意味着一次性引入 11 个协调工具与独立状态目录，**重复造了 `subagents` 已经提供的「可续聊孩子 + 唤醒」原语**，且与像素现有一次性 `agents_pixe_*` 工具面冲突。成本远大于增量收益。

## 关键权衡

### 权衡 1：文件态 vs 宿主服务
用扁平 JSON 快照作为**磁盘真相**，而非某个宿主状态服务。
- **+**：零耦合（引擎不 import 任何 DSH 包）、可单测、可观测、可跨重启巡检。
- **−**：**单写者**——无锁、无跨进程事务；**多进程同时改同一团队不保证一致**；文件读写延迟 + 无内建事件，变更只能靠 `step` 的有界轮询感知。

### 权衡 2：单进程串行
所有状态迁移在**同一 DSH 进程内串行**执行。
- **+**：无需引入锁管理器，CAS 语义简单可推理，符合桌面单操作者 DSH 的现实。
- **−**：**不能扩展**到多个 DSH 进程并行驱动同一团队；进程中途崩溃会留下 `in_progress` 但属主已死的**冷停遗留**——引擎用「先释放死属主落回 pending，再重新 claim」恢复，代价是任务被打回重做一次。

### 权衡 3：attempt/CAS 状态机
`revision` + `expectedRevision` CAS + 显式状态机合法迁移。
- **+**：防**丢失更新/双人抢单**（`CONFLICT` 拒绝并发覆盖）；迁移规则成文（`claim/complete/release/reopen/reassign/edit/delete`），非法跳跃直接抛 `ILLEGAL`。
- **−**：调用方**必须先取最新 revision** 再更新 → 多一次交互 + 可能遇到过期报错；**转派/reassign 非原子**（先 `release` 等原成员归静 → 再 `claim`，中间存在任务短暂无属主的窗口）；revision 只到**任务整体**粒度，不区分字段级。

## 风险

### 风险 1：`subagents` 续聊驱动可用性
`startContinuable`/`listChildren`/`sendMessage` 必须已挂载、且所选 provider（spawn/fork）可用，否则建团失败。
- **现状**：本 dsh 已挂载并跑通；`createTeam` 在无人可用成员时抛 `ENGINE_UNAVAILABLE`/`NO_MEMBERS`（含明确指引）。
- **缓解**：入口做存在性检查；错误消息自解释。若部署环境缺 `subagents`，整个引擎优雅关闭而非崩溃。

### 风险 2：跨进程一致性
文件态多写者不保证一致；CAS 只能**降低**不能**根除**「两进程同读旧文件 → 同时写」的丢失更新。
- **缓解**：明确**单进程串行**的运维前提（单操作者桌面 DSH）；文档明示边界。生产多写者场景不在本设计目标内——这是明说的取舍，不是遗漏。

### 风险 3：token 成本
每个成员都是一条**独立 LLM 上下文**的续聊子 Agent；每唤醒一次 = 一轮完整 LLM 推理。N 名成员 × M 轮 ≈ N×M 次推理 + 汇总合成。
- **缓解**（2026-09-30 更正：原写的 `plan_only` 从未实现）：`report` 仅在**全部任务完成**时调用 LLM 汇总；引擎闲聊走**便宜快速模型 + 滚动小时预算门**（预算耗尽回退罐头台词）；`max_roles` 上限 8、默认 4；`GET /agents-pixe/teams/halt` 可随时暂停派单。**真正的「计划先行」需重新实现**（见下方决策复审 P4）。
- **代价**：并行能力与 token 成本**线性正相关**——这是团队模式的固有物理约束，只能靠预算与计划先行缓解，不能消除。

## 验收（可执行断言）

全部可复现，已在当前仓库跑通：

```bash
node --test                                    # 98/98 通过（引擎 42 + 兼容门禁 9 + 设置兼容 11 + 冒烟/渲染/工具面等）
node --test test/team-engine-stress.test.mjs   # 高保真压测：冷恢复、转派 CAS、停驻、依赖串并联、max 并发、空闲续领、report 归档、resolvePlanDeps 无环、decomposeFallback 兜底、同一步不重复领、跨步幂等、CAS 防双领
node --test test/register-face.test.mjs        # registerFace 重入不重复注册引擎工具（6 个稳定，无叠加）
node --test test/dsh-0.2-compat.test.mjs       # DSH 0.2.0-rc.2 兼容门禁（peer 区间/元数据/与原生零撞名）
node --test test/settings-compat.test.mjs      # 设置服务跨版本兼容（无 register 的新宿主行为）
node scripts/build-client.mjs                  # 成功产出 lib/client.js（375 KB）
```

验证范围：`lib/team-engine.js`（引擎纯逻辑）、`lib/index.js`（工具注册 / `/teams` 命令 / 视图与配置端点）、`src/client.main.js`（TeamPanel + 轮询 + 设置面板）。

## Consequences

**变容易了**：团队模型完全自控，可在 `subagents` 之上自由演进；引擎纯逻辑 + 文件态，修 bug 可单测、看真相可读盘；不依赖幽灵服务，**不会出现「看似支持实则静默降级」**。

**变难了**：自己维护一层任务/attempt/调度模型，代码面更大，且分摊了**一致性保障的职责**（CAS 边界、冷恢复、转派非原子窗口都要自己扛）。**接受的前提**是桌面单进程操作者场景，一旦要跨进程/多写者，本设计需重议。

**遗留观察项**：假设宿主未来真的 `mount` 了 `agentTeams`，届时重新对比本自建引擎 vs 官方服务，再决定是否迁移——本 ADR 的「已采纳」状态届时失效。

---

## 决策复审（2026-09-30）：触发条件已达成，本 ADR 的「已采纳」状态失效

**触发**：宿主**已真实挂载** `ctx.agentTeams`（`@deepseek-ai/dsh-experimental-agent-team@0.2.0-rc.2`，随桌面壳 profile 默认开启）；同时社区 `dsh-agent-teams` 已到 `0.1.22` 并明确支持 `0.2.0-rc.2`。上文末尾写明的观察条件已满足，故在此复审。

**逐项重估**：

| 原判断 | 当时依据 | 现在的事实 | 复审判定 |
| --- | --- | --- | --- |
| 选项 B（驱动宿主 `agentTeams`）❌ 否决 —— 理由「**幽灵服务**」 | 该服务在部分 dsh 里只有契约、未真正挂载 | **0.2.0-rc.2 已真实挂载**：11 个方法，含 `tryMembership(agent)`（其文档明写「用于**作用域工具安装**与观察者」） | **前提失效**。不再需要「迁移或自建」的二分，而是可以**组合**：机制用宿主，人格用本项目 |
| 选项 C（移植 dsh-agent-teams 引擎）❌ 否决 —— 理由「11 个工具 + 独立状态目录 + 与像素工具面冲突」 | 移植成本 > 收益 | DAT 现为 **14 个业务工具**，另有 `compatibility.json` + doctor + 质量门禁 + 计划审批 + 原生「团队协作」标签页；本项目自建引擎在 23 项对比里落后 17 项 | **否决仍成立，但理由变了**：不是「不值得移植」，而是**没必要再自建同构能力** —— 直接用或组合，别重写 |
| 权衡 1（文件态真相源）/ 权衡 2（单进程串行） | ✅ 当时成立 | 对比原生「领袖会话日志 + 可回放」是短板；且 `reconcileProfilePlugins` 会把失联 bundle 从 `bundles` 剔除 | 降级为**老宿主/离线降级路径**，不再作为主路径 |
| 风险 3 的「计划先行」缓解 | 文档宣称，**代码从未实现** | DAT 有 `approval:"required"`（草案落盘 → GUI 编辑 → 确认才建会话） | **补实现，或直接让位给 DAT** |

**新推荐架构（三层分工，而不是三选一）**：

1. **机制层** → DSH 原生（默认）或 dsh-agent-teams（要质量门禁 / 计划审批 / 成员互通 / 异构模型）
2. **人格与判据层** → 本项目唯一护城河：508 张角色卡 → ① prompt 种子 ② 工具裁剪 ③ 写域约束 ④ **专业验收清单（质量门禁的判据）**
3. **表现层** → 本项目像素办公室 + 团队面板，数据源改为**只读投影**机制层的任务/成员状态（去掉第二真相源）

**行动项**：~~P0 追平（种子粒度 / 成员模型档 / 成员互通）~~ **已于 0.2.3 完成** → P1 写域硬拦 + 作用域化工具 → P2 角色卡能力绑定（专业验收判据）+ 计划先行 → P3 面板只读投影 → P4 兼容策略对齐 DAT（`compatibility.json` + `doctor`）。完整逐项路径见 [agent-teams-comparison.md](./agent-teams-comparison.md) §7。

**失效声明**：本 ADR 原「选项 A 已采纳」不再是最优决策，原文作为历史记录保留。
