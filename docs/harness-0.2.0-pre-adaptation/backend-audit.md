# AgentTeams 后端独立审计

审计日期：2026-09-28。来源模式：本地 Git 源码比较。宿主目录：`/Users/nanmi/workspace/github/deepseek-harness`；插件目录：`/Users/nanmi/.codex/worktrees/e986/dsh-agent-teams`。

- Before：`dsh-v0.1.7-rc.2`，`477b4f420553e8a52c2fbccc464d7561b239c443`。
- After：master 快照 `21638c56315ae6a2b552d6091945d3144c9af32e`。
- After 不是已发布 0.2.0 产物；结论不覆盖此 SHA 之后的变化。
- 本子审计未修改源码，未运行 mock 测试，也未将 mock 测试作为宿主运行证据。报告内插件行号指审计时工作区源码；宿主行号指 After 源码。

## 结论

相对上述 Before，未发现 AgentTeams 后端新增不兼容点。Continuation、模型配置和初始化契约保持不变；新增工具调用恢复仍保留最终失败事件。这个结论不能替代桌面组合、真实插件加载、模型执行及冷恢复验收。

## REMOVED

在重点审计的子代理和模型配置触点中没有发现移除。`git diff --name-only <before> <after> -- packages/subagent packages/core/agent packages/llm/llm` 输出为空，进一步读取当前实现确认插件确实使用这些未变化契约。没有把函数仍然存在单独当成兼容证明。

## CHANGED

### 工具调用异常恢复：补录结果后继续失败

影响面：session data、model-visible、子代理失败收尾。

Before：`packages/core/agent-loop/src/agent.ts` 的 step 执行只有 finally 追加 step/end，执行器异常可能留下没有结果的工具调用。After：该文件 328–356 行安装 `ToolCallRecovery`，捕获 step 异常时追加保守的 error tool/result，再抛出原错误；350–351 行在补录本身失败时抛 AggregateError。相关实现新增在 `packages/core/session/src/repair.ts`，并由 `src/index.ts` 导出。

After `agent.ts:366–385` 仍执行原有最终错误和 turn/end 路径；`agent.ts:248` 发出 agent/error。插件 `src/members.ts:407–442` 监听最终 agent/error，捕获当前任务 attempt、记录失败、等待真实 idle，再调度；没有依赖 tool/result 将任务视为成功。

实际影响：恢复后的 session 不再留下同类悬空工具调用，没有发现它破坏 AgentTeams 任务失败收尾。补录失败时原 LlmError 会被 AggregateError 包装，插件会按 UNKNOWN 记录，可能损失结构化错误码；失败本身不会被吞掉。此项为实现对照结论，尚未在本子审计中运行真实异常注入。

## ADDED

新增公开 ToolCallRecovery 导出及上述保守 error tool/result；插件没有导入新导出，不需要为了加载而适配。

## RENAMED

重点审计的 continuation、模型配置、session 格式触点没有发现重命名。

## 确认未变化的契约

| 触点 | Before → After | 宿主与插件证据 | 影响 |
| --- | --- | --- | --- |
| Continuable 创建、冷恢复 | packages/subagent 整目录无差异 | 插件 src/members.ts:628–659 调 startContinuable | 无新增迁移要求 |
| Host queue/steer symbol | 同一 Symbol.for('dsh.subagent.deliverPrompt')，参数顺序及返回值不变 | 宿主 packages/subagent/subagent/src/internal.ts:42–53；插件 src/harness-compat.ts:28,146–171 | 任务 queue、协调 steer 区分仍有效 |
| 模型消息权限 | exact live sender、直接父子关系不变 | 宿主 packages/subagent/subagent/src/continuation.ts:204–233；插件 src/members.ts:677–690 以 captain 投递 | 不应改用任意成员直接发兄弟消息 |
| 初始化生命周期 | 串行 agent/created 携 source、Agent 不变 | 宿主 packages/core/agent/src/index.ts:537–554；插件 src/harness-compat.ts:64–68,104 | 首请求前安装模型与 admission 检查仍成立 |
| 模型选择 | core/agent、llm/llm 整目录无差异 | 宿主 packages/core/agent/src/model-selection.ts:81–110；插件 src/members.ts:310–343,448–468 | resolve、reasoning effort、fallback 无新增迁移要求 |
| Session 格式 | SESSION_FORMAT_VERSION 4 → 4 | 两树 packages/core/session/src/types.ts，After:89 | 本区间无格式版本跳跃 |
| Storage SQLite | STORAGE_SQLITE_SCHEMA_VERSION 1 → 1 | 两树 packages/storage/storage-sqlite/src/schema.ts，After:20 | 本区间无 schema guard 变化 |
| Session 查询 SQLite | SESSION_QUERY_SQLITE_SCHEMA_VERSION 8 → 8 | 两树 packages/session-query/session-query-sqlite/src/schema.ts，After:8 | 本区间无 schema guard 变化 |

旧审计 skill 提到的 `packages/session/session-persistence-sqlite/src/schema.ts` 在当前树不存在；本报告使用实际存在的两个 SQLite schema。不存在的旧路径不是本区间移除的证据。

## 反例与限制

1. 插件仍依赖内部 symbol API。本次值及签名一致不构成未来版本保证；正式 0.2.0 SHA 和包闭包需重新核对。
2. Host sendMessage 只允许 exact live sender 与直接父子关系。当前 AgentTeams 通过 live captain 路由满足约束；任意兄弟成员互调不满足。
3. 后端无变化不能证明桌面 profile 挂载了插件需要的 continuable/persona/toolFilter provider，也不能证明前端菜单、页面、插件安装与重载适配。
4. session 格式常量不变不是所有日志消费兼容的充分条件；本区间新补录沿用既有 tool/result 类型，未发现插件依赖结果数量或必须无补录的前提。
5. 未进行真实 API 请求、桌面交互或冷恢复运行，本报告不能单独支持“已全面适配”表述。

## 后续验收

1. 固定实际桌面构建 SHA 与依赖闭包，验证插件在该组合中激活。
2. 真实宿主运行成员创建、queue 后续任务、steer 协调、最终回报、成员 idle 和冷恢复。
3. 验证模型 provider/model/reasoning effort 和 fallback 在首次请求、重试及恢复时一致。
4. 运行工具失败及终态错误路径，确认任务失败记录和后续调度不受恢复补录影响。
5. 正式发布提交及产物出现后，对本快照再做增量核验。
