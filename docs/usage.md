# agent-teams-pixel 真·团队引擎 · 使用指南

> 面向已安装本插件、要真正跑「团队协助」的用户。设计分析见 [`docs/agent-teams-analysis.md`](agent-teams-analysis.md)。本指南给出可执行配方（标准 7 步 + 一键 3 步）、工具参考、关键 attempt/依赖语义、token 防爆与验收。

## 0. 前置：引擎是否启用

真·团队引擎**基于宿主 `subagents` 续聊原语 + 文件态**自建，**不依赖 `agentTeams`**（后者在不少 dsh 里仅声明契约、未真正挂载）。启用判定：

- 在「设置 → 像素办公室 → **角色工具**」开启后，若工具列表出现 `agents_pixe_team_create` / `agents_pixe_task_create` / `agents_pixe_task_update` / `agents_pixe_team_step` / `agents_pixe_team_message` / `agents_pixe_team_report` 六个工具 → **引擎已启用**（宿主 `subagents` 可达）。
- **未启用时**（宿主无 `subagents`）：上述 6 工具不注册；`agents_pixe_team` 自动降级为旧的 N+2 一次性编排；活动面板返回 `available:false`。以上**均不报错**。

## 1. 两条路线

| 路线 | 何时用 | 步数 | 特点 |
|---|---|---|---|
| **便捷 3 步** | 快测/冒烟 | 3 | 一次到底、省交互；不可中途干预、不可分批评审 |
| **标准 7 步** | 深度任务 | 7 | 可中途干预、可分批评审、真并行多轮 |

> **默认直接执行**：`agents_pixe_team` 默认**建团→拆显式依赖任务→调度→汇总**（`plan_only=false`）；要先评审方案，传 `plan_only=true` 只出「团队计划草案」（roster + 任务 DAG + 依赖，不建团），确认后 `plan_only=false` 执行。可用 `plan_tasks` 回传调整后的任务 JSON 覆盖草案。
> **团队大小与像素办公室对齐**：`agents_pixe_team`/`/agent-teams` 默认用**当前会话办公室的选中角色**作团队成员（读 `<DSH_HOME>/agents-pixe/persist.json` 的 `agents-pixe.state.v4` → `sessions[<sid>].active`），所以先「选人」再发任务，团队大小=办公室选人数；办公室无该会话选人时退回预设/自定义。

### 一键速达（3 步）
1. **预检**：`GET /agents-pixe/settings`（确认 `hasScope:true`、`value.enabled:true`）；`GET /agents-pixe/teams/view?lead=<sid>` 看返回值。
2. **计划 + 下发**：`agents_pixe_team(team, task)`（默认 plan_only=true 出计划草案，用户确认后 `plan_only=false` 执行：建团 + 拆依赖任务 + 首轮派单）。
3. **验收**：`agents_pixe_team_report` 出报告 + 标题栏「🤝 团队」看板。

### 标准 7 步（推荐深度任务）
| # | 步骤 | 工具 / 面板 | 串/并 |
|---|---|---|---|
| 1 | 预检 + 开工具 | `GET /agents-pixe/settings`；设置→像素办公室→开「角色工具」 | 用户 |
| 2 | 选队发任务 | 页签「🚀 一键编排」或直接 `agents_pixe_team(team, task)` | 用户 |
| 3 | 领袖建团 | `agents_pixe_team_create(team, max_roles)` → 面板 roster 徽章 | 领袖 |
| 4 | 拆解建 DAG | `agents_pixe_task_create(subject, blocked_by)`（依赖边） | 领袖 |
| 5 | 共享调度派单 | `agents_pixe_team_step(wait_ms)`（CAS 原子 claim + wakeup） | 调度 |
| 6 | 成员并行执行回传 | 成员 `agents_pixe_task_update(complete)` + `agents_pixe_team_message`（成果直投领袖） | **并行** |
| 7 | 领袖汇总归档 | `agents_pixe_team_report` → 报告 + `archive/<leadId>-<ts>.json` 落盘 | 领袖 |

> 真并行只发生在 **⑤+⑥**（step 唤醒 + 成员执行回传）；③④⑦ 是领袖单人；①② 是用户。

## 2. 工具参考

- `agents_pixe_team_create(team[, roles, leader, max_roles, task, provider])` — 建团并成为领袖（spawnTeammate 可续聊成员）；一领袖一团队，已存在则返回现有名册。
- `agents_pixe_task_create(subject[, description, blocked_by, write_scopes])` — 建一个带显式依赖的任务（`blocked_by` 逗号分隔依赖任务 id）；初始无 owner，由调度器按就绪派发。
- `agents_pixe_task_update(task_id, expected_revision, action[, owner, subject, description, blocked_by])` — 任务状态迁移。`action` ∈ `claim|complete|release|reassign|reopen|edit|set_dependencies|delete`。**必须带最新 `expected_revision`**。
- `agents_pixe_team_step(wait_ms?)` — 共享调度器：冷恢复 → 空闲成员 CAS 领取唤醒 → waitForChange。`wait_ms` 建议 10000–60000。
- `agents_pixe_team_message(target, content[, delivery])` — 持久邮箱直投（`wakeup` 会唤醒驻留成员；无法投递由宿主持久化 + 后续边界重投）。
- `agents_pixe_team_report(task?, team_name?)` — 汇总 + 归档；`open>0` 归档**草稿**（不合成），`open==0` 合成**正式**报告。

## 3. 关键语义（attempt / 依赖 / 恢复）

- **依赖就绪（ready）**：任务 `blocked_by` 全部 `completed` 才 `ready`；就绪且未认领的任务才会被调度派发。
- **attempt（CAS）**：每次迁移携带**最新 `expected_revision`**（取任务视图的 `revision`），冲突被拒（`team-task-conflict`）。**转派/接管** = 先 `release` 等原成员归静，再 `claim`（新 attempt）。
- **停驻（parked）**：空闲成员仍持有开放 attempt 时不续领新任务；可被 `agents_pixe_team_message` 直发续用原 attempt，或显式转派。
- **冷恢复**：属主变 `inactive`/`failed`（冷进程重启）→ 调度器自动 `release`（释放死属主）+ 有空闲成员则重新 `claim`（新 attempt）；无空闲成员则仅释放，留待后续认领。
- **无环防护**：`resolvePlanDeps` 剔除自依赖/前向引用/非法依赖，任务 DAG 天然无环。
- **拆解失败兜底**：目标拆不出子任务时 `decomposeFallback` 退化到各成员并行处理同一整体任务。

## 4. token / 防爆（来自实机核验 + 引擎默认）

| 闸 | 值 / 行为 |
|---|---|
| 成员上下文 | `context:'fresh'` 互相隔离，互不挤占 |
| 成果传递 | 只经 `<leadId>.inbox.json`（≤500 条）+ message；最后聚合 |
| 种子人物料 | 角色卡 `desc` 截 200；任务 prompt 截 600 |
| `report` | 仅在 `open.length===0` 才走 LLM 合成；`reasoningEffort:'off'` + `maxTokens` 2400 |
| 取卡粒度 | 默认 `full`；中间档 `sections=rules/deliverables` |
| 建议测试上限 | 领袖 + ≤3 成员、≤3 任务、≤1 依赖边、`wait_ms` 10000–60000、全程同模型、总 ≤10 分钟、禁递归嵌套 |

## 5. 活动面板

像素办公室标题栏「**🤝 团队**」按钮 → TeamPanel：

- **roster 状态徽章**：工作中(绿)/空闲(灰)/离线(淡)/启动中(琥珀)/失败(红) + 👑 领袖 + 模型路由。
- **任务板**：状态 / 负责人 / 依赖 / 就绪标记。
- **进度分段**：完成/总数进度条。
- **归档标记**：`✅ 已归档（全部完成）` 或 `📦 已归档（有未完成项）`。

数据 = `GET /agents-pixe/teams/view?lead=<sid>`（**磁盘真相快照优先**，缺则 live `remoteView`）；快照落盘 `<DSH_HOME>/agents-pixe/teams/<leadId>.json`，归档在 `<leadId>.json`（草稿/正式）+ `archive/<leadId>-<ts>.json`。

## 6. 验收（可执行断言）

- `node --test` → **42/42 全过**（状态机/调度/冷恢复/转派/停驻/无环/兜底/注册重入）。
- `node scripts/build-client.mjs` → 成功产出 `lib/client.js`（268.5 KB）。

## 7. 已知边界

- 一领袖同时只带一个活动团队（`createTeam` 幂等）。
- 状态文件持久化 + 单个 DSH 进程内串行；多进程同时改同一团队不保证一致。
- 活动面板如实展示持久化状态；模型可能偶尔完成工作却**未按协议更新任务状态**（重跑 `agents_pixe_team_step` 触发调度即可）。

## 8. 如何唤醒团队面板

`/teams` 斜杠命令 + 图形化入口两份，按场景选。

### 8.1 命令行 / 对话框入口

在 DSH Web 对话框直接打：

```
/teams 研发团队 <任务描述>
/teams 安全团队 <任务描述>
/teams <任意角色名列表，如「高级软件架构师, 代码审查员」> <任务描述>
```

DSH 收到 `/teams` 后会回调宿主侧的 `commands.register({name:'teams'})`，再通过系统提示段把模型引入 `agents_pixe_team` 工具，工具按上文标准 7 步自动跑。

> 旧版本用的是 `/agent-teams`，已重命名为 `/teams`。CHANGELOG 里的旧示例保留作历史记录。

### 8.2 图形化入口（像素办公室浮层）

打开任意会话的像素办公室浮层（默认右下角 `像素办公室` 入口），标题栏有 5 个按钮，从左到右：

| 按钮 | 作用 |
|---|---|
| `选人` / `收起` | 打开/收起「团队选人」抽屉：选预设团队或自定义成员 |
| `−` / `＋` | 缩小/放大办公室画布 |
| `⚙️ 设置` | 打开角色工具设置（settings 面板） |
| **`🤝 团队`** | **展开团队抽屉**（rc.2 起的抽屉式，宽高 100% 跟随浮层） |
| `—` | 折叠整个浮层成一个小圆点 |

`🤝 团队` 点击效果：
- 抽屉从浮层标题栏正下方下滑，高度 = 浮层高 × 70%（min 280，max `100vh-120`）
- 抽屉头部紫色边框 + `🤝 团队` 标题 + 右上角 `✕` 关闭
- 抽屉内容 = roster 徽章 + verdict 徽章（质量闸）+ 泳道 DAG（点节点 = 紫色描边固定 + 底部详情卡，可编辑/删除）
- 抽屉打开时其他抽屉（选人/设置）自动关闭，画布被抽屉覆盖
- 抽屉轮询 3s 一次（`GET /agents-pixe/teams/view?lead=<sid>`，磁盘真相快照）

关闭路径三种：① 点抽屉 `✕` ② 再点一次标题栏 `🤝 团队` ③ 触发其他抽屉打开（互斥）

### 8.3 一键直达（推荐首次使用）

办公室浮层右上角 `⚙️ 设置` → 「角色办公室」分区 → 「🤝 团队面板」按钮 = 直接打开抽屉（v0.1.9-rc.2+）。
