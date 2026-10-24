# 便利调度设计（Dispatch UX）

> 目标：把「开团 → 分工 → 派单 → 推进 → 交付」从**聊天里反复描述**变成**三次点击或一行命令**，同时不牺牲现有的计划闸门与质量门。
> 落地对象：本仓库 `0.3.0-rc.1`（右栏上下分栏：配置/交互 + 像素办公室；工具 `agent_teams_*`；看板与调度器已存在）。

---

## 0. 现状盘点：卡在哪

| 已有能力（上游 0.1.26 / 我们） | 缺的「便利」 |
|---|---|
| 计划草案 + Web 审批（`create(approval:"required")` + StagingPlanEditor） | 必须先用自然语言把团队、角色、任务讲清楚；**没有一键模板/预设** |
| 命名多角色团队配置（`profiles`）+ 我们的 29 个预设团队 | 配置在 YAML 里，**UI 里看不到、选不了**；508 角色卡更没入口 |
| 自动调度器（批准后 ready→idle 原子领取） | 不会**建议**给谁；没有「批量派单/立即派单」入口；队长只能等 |
| 任务 kinds / acceptance / verify / inScope 契约 | 写契约要背字段；**没有任务模板**（修 bug/新功能/调研/审计） |
| 像素办公室 + 任务板 + 收件箱 | 运行中「谁卡住、下一步该点哪」不直观；**没有待办队列** |
| 队长协议（人工 10 条） | 队长每轮都要 `status` 查、手工 `reassign`；**没有 next_action / digest**，token 与轮次都浪费 |

一句话：**机制齐全，入口与引导缺失**。便利化的核心 = 「默认给一个好草案」+「随时告诉人/队长下一步」。

---

## 1. 设计原则

1. **一键出草案，不绕过闸门**：任何快捷入口只产生 `staged` 计划，仍需人点批准（自动批准只由用户显式要求）。
2. **默认值要好**：按任务意图自动选模板（修 bug / 新功能 / 调研 / 审计）、自动挑角色、自动写 acceptance/verify 占位。
3. **建议可一键采纳，也可无视**：调度建议只是 UI 提示 + 一个按钮，不替用户做不可逆决定。
4. **把「下一步」变成数据**：`next_action` 给人和队长同一个答案，减少状态查询与空转。
5. **零新概念**：复用现有 team/task/attempt/profile/quality contract，不引入第二套状态。

---

## 2. 三层设计

### 层 1：开团（1 步）

**1.1 合成框快捷命令**（已有 `/agent-teams` 的扩展）

```
/team fix  登录接口偶发 500，测试在 tests/auth
/team feat 支持导出 CSV（前后端）
/team research 三家竞品的定价页
```

- `/team <template> <目标>`：模板前缀决定任务 DAG 与 quality kinds；目标原文作为团队 description。
- 没有模板时按关键词启发：`bug/修复/500` → `fix`；`调研/对比` → `research`；`实现/新增` → `feat`；否则 `generic`。
- 命令只**生成 staged 草案**并打开右栏 StagingPlanEditor。

**1.2 右栏「调度台」卡片**（新增，位于上面板顶部）

```
┌ 调度台 ───────────────────────────────────────────┐
│ 团队：[研发核心 ▾] [上次：登录修复] [+ 新建]        │
│ 模板：(● 修 Bug) (○ 新功能) (○ 调研) (○ 审计)      │
│ 角色： 前端 × 审查 × 测试   [选人…]  (508 卡可搜)  │
│ 目标： [____________________________________]      │
│ [生成草案]           预估：3 任务 / 3 成员 / 4 轮  │
└────────────────────────────────────────────────────┘
```

- 团队下拉：`profiles`（命名团队）+ 最近使用 + 我们的 29 预设。
- 选人弹层：搜索 508 角色卡（按部门分组），显示「角色 → 默认工具策略/判据来源」。
- 「生成草案」= 工具 `agent_teams_quick_start({goal, template, personas, preset})`，返回 staged 计划。

**1.3 任务模板（内置 4 个）**

| 模板 | DAG（含 kind） | 默认 acceptance / verify |
|---|---|---|
| `fix` | implementation → verification → review | 复现步骤消失；`verify` 取仓库测试命令（自动探测 npm/pytest/cargo） |
| `feat` | requirements → implementation → verification → review → integration | 需求条目覆盖；`inScope` 来自目标目录；集成验收 |
| `research` | 3×work（并行）→ synthesis(work) → review | 结论含来源链接；互相不重叠的取证线 |
| `audit` | N×work（并行）→ review | 每条结论附 `file:line`；不得改动被审文件 |

- 模板只写**契约骨架**（objective/acceptance/verify 占位），队长仍可 `edit_plan` 改。
- 自动探测 verify 命令：读仓库 `package.json` / `pyproject.toml` / `Cargo.toml` / `Makefile`，找不到就留空并在草案里标注「需补 verify」。

### 层 2：编排（草案里 30 秒改完）

- **建议分工**：每个任务行右侧给建议 owner（角色名匹配 + 当前负载 + 历史 verdict），点一下即 `edit_plan` 批量设 assignee。
- **批量操作**：全选任务 → 加依赖/设写域/套判据；成员行 → 一键套工具策略（已有 `tool_policy`）。
- **冲突提示**：同一人多个 ready 任务、写域重叠、自审（implementation owner 被指派 review）→ 黄条警告（不阻止）。
- **预估**：任务数 / 成员数 / 预计轮次（现状 token 经济性数据可复用）。

### 层 3：运行中（人只看「待办」，不盯状态）

**3.1 待办队列（上面板顶部固定条）**

```
需要你：[批准计划 1]  [决定阻塞 2]  [处理交付确认 1]    自动派单：开
```

- 队列只收**需要人/队长动作**的项：待批准、被阻塞、review 判 needs_revision 但无可用修复者、交付待签收。
- 点条目 → 右栏定位到对应任务/成员；像素办公室同步高亮该成员工位。

**3.2 一键调度**

- 「立即派单」按钮：对 ready 且 unowned 的任务执行批量 `reassign_task`（调用新工具 `agent_teams_dispatch`）。
- 「自动派单」开关（默认开）：已有调度器负责；关闭后只给建议，不自动唤醒（适合观察/教学场景）。
- 建议算法（确定性，可解释）：
  1. 角色/技能关键词匹配（任务 subject+description vs member role/executionPrompt）
  2. 过滤：不能自审（implementation owner ≠ review assignee）、不能超 `maxMembers`、写域冲突警告
  3. 负载：当前 open attempt 少的优先
  4. 平手按创建顺序，避免抖动

**3.3 成员干预（像素办公室直接操作）**

- 点击工位 → 弹出小而全的卡片：`发消息 / 转派任务 / 中断 / 打开会话`（全部走现有工具）。
- 工位角标：`running` 绿点、`idle` 灰、`blocked` 红、`unread` 数字（已有数据）。
- 任务完成/失败在工位上方播放 1.5s 动画（完成=冒星，失败=红闪），比读日志直观。

**3.4 交付**

- 全部任务终态 → 待办队列出现「交付确认」；点开显示：覆盖矩阵、verdict、artifact 漂移、风险清单。
- 「确认交付」写归档 + 生成 `delivery.md`（后续接我们的交付包）。

---

## 3. 接口设计（新增，向后兼容）

### 3.1 队长侧工具（4 个）

| 工具 | 作用 | 关键返回 |
|---|---|---|
| `agent_teams_quick_start({goal, template?, preset?, personas?, approval:'required'})` | 生成 staged 草案（团队+任务+契约骨架） | `teamId, plan, warnings` |
| `agent_teams_dispatch({teamId?, mode:'auto'\|'suggest', limit?})` | 批量派单或只给建议 | `assignments[]`（taskId→member 理由） |
| `agent_teams_next_action({teamId?})` | 下一步该干什么 | `{action:'approve'\|'dispatch'\|'wait'\|'fix'\|'deliver', targets, reason}` |
| `agent_teams_digest({teamId?, since?})` | 摘要（省 token） | 进度/阻塞/收件箱/建议 |

> 全部遵守现有 captain 协议：`next_action` 只是建议；`dispatch.mode=auto` 仍受 `maxMembers`、自审禁令、审批状态约束。

### 3.2 Web 路由（2 个，先读后写）

- `GET /plugins/dsh-agent-teams/presets` → `{profiles, roleCardsIndex, templates, recents}`（角色索引复用我们 `roles.json`）
- `POST /plugins/dsh-agent-teams/quick-start` → 与工具等价（给 UI 用；同样受 Connection 认证栅栏）

### 3.3 配置

```yaml
- id: agent-teams
  config:
    dispatchMode: auto        # auto | suggest
    templates: default        # 可覆盖/禁用内置模板
    quickStart: true
```

---

## 4. 交互细节（可直接实现）

- **键盘**：`Ctrl/⌘+Enter` 在「调度台」= 生成草案；团队下拉支持输入过滤；Esc 关闭选人弹层。
- **空态**：没有团队时，右栏显示「调度台 + 一行示例」（`/team research 三家竞品定价`），不再显示空看板。
- **记住**：上次团队、模板、选人、办公室高度（已实现）都持久化。
- **移动/窄栏**：右栏 < 420px 时调度台折叠为一行（团队+模板），Office 高度降为 180px。
- **失败兜底**：`quick_start` 失败（模板探测不到 verify）→ 返回可批准的草案 + 明确 warning，不抛裸错误。

---

## 5. 分期与验收

| 阶段 | 内容 | 工作量 | 验收 |
|---|---|---|---|
| **M1（1 周）** | `quick_start` + 4 模板 + 调度台卡片 + 空态示例 | 4–5 天 | 一行 `/team fix …` 或点「生成草案」→ staged 计划；模板字段齐全 |
| **M2（1 周）** | `dispatch`（suggest/auto）+ `next_action` + 待办队列 | 4–5 天 | ready 任务一键派给正确成员；自审被拦截；队列 0 误报 |
| **M3（1 周）** | 工位点击卡片 + 完成/失败动画 + `digest` + 交付确认 | 5 天 | 从像素办公室完成一次「发消息→转派→交付」闭环 |
| M4 | 508 角色卡索引接入选人弹层（角色卡最后） | 3 天 | 搜索 508 卡 → 一键成成员 persona |

**指标（M1-M3 后测）**

- 从「想开团」到「计划可批准」：≤ 3 次点击 / ≤ 1 行命令（现在 5+ 轮对话）
- 计划编辑轮次 ≤ 1（模板默认值命中率 ≥ 60%）
- 队长每轮 `status` 调用下降 ≥ 50%（由 `next_action`/`digest` 替代）
- 成员空转时间（ready 任务无 owner 的时长）≤ 1 个调度周期
- 交付前人工动作数 ≤ 2（确认 + 签收）

---

## 6. 风险

1. **模板误判**：关键词启发选错模板 → 草案里高亮「已选模板」并要求确认；失败不阻止手改。
2. **自动派单错配**：算法只做建议时风险低；`auto` 模式仍保留「不能自审」「不能超限」硬规则。
3. **模板与契约强绑**：模板必须能一键退回 `generic`（不写 acceptance/verify 以外的假设）。
4. **UI 挤压**：上面板新增调度台后更矮；默认折叠调度台为一行，展开才占高。
