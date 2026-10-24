# Harness 0.2.1-rc.1 适配

目标为官方 `dsh-v0.2.1-rc.1`，commit `1600d8a1e140dcde43a1a0941940a0480712c011`。对照基线为 `dsh-v0.2.0-rc.2`。用户提供的本地 Harness checkout 与目标 tag 一致，工作树干净；本次未修改该参考仓库。

插件起点为 `1094b84add6f2fb19edf659367fe2fd5f7f14154` / `0.1.23`。适配版本为 `0.1.24-rc.1`，已发布到 npm `next`。发布源码为 `33f29cd`，完整 CI 验收与 registry 产物记录见[发布记录](publication.json)。

## 已核实的变化及处理

- `packages/subagent/subagent/src/index.ts` 删除 `startContinuable`，以 `startActivation` 管理执行；适配层按能力选择精确已支持宿主的创建 API。统一使用 `delivery: parent`，保持旧版本的缺报告/异常结束通知，成功报告继续由插件 mailbox 去重。
- `manager.ts` 创建新 descriptor 时不再保存 `persona` / `toolFilter`。插件在 `agent/created`、首个请求前安装 scoped 角色和工具限制，将精确配置保存为成员 `runtimeSetup`，冷恢复及插件热重载时按成员身份还原；重新挂载在插件工具注册完成后枚举存活 Agent，去重安装配置，恢复失败时拒绝后续请求。新式成员缺少配置时拒绝无约束恢复；旧 descriptor 的配置仍由 Harness 恢复。
- `drainContinuableChildren` 改为 `drainChildren`，归档/停止/重派继续等待目标成员及后代清理。委派深度 guard 同时覆盖新 `startActivation` 和旧创建 API。
- 宿主新增必需的 `workingDirectory` 服务，测试装配补齐。宿主删除 `both` 工具展示模式，测试按已支持版本选择模式；插件本身不配置该模式。
- npm 开发闭包精确锁定 `0.2.1-rc.1`，同步 Cordis `4.0.5`、Schemastery `3.18.5`、cordis-plugin-group `1.0.5`，避免同版本 DSH 分包因不一致 peer 解析成重复实例。

独立只读审查核对了模型选择、生命周期事件、host FIFO/steer Symbol、工具注册限制和 Web 注入/slots。后续审查复现了热重载丢失存活成员角色与自定义工具限制的问题；已补上存活成员恢复，并通过真实 Loader 配置重载复核。会话格式仍为 4。此结论不代表全面审计宿主所有新功能，也不保证将新版创建的会话降级到旧宿主。

## 验证与边界

最初工作树无 node_modules，类型检查因缺少本地 TypeScript/Node 类型失败。安装原锁定依赖后，旧基线类型检查和完整 `pnpm verify` 通过。

候选执行 `pnpm typecheck`、`pnpm build`、`pnpm verify`；新增回归覆盖新创建 API、首次/冷恢复角色及工具配置、缺失配置拒绝、初始化失败回滚、委派限制及取消适配。doctor 校验开发宿主版本与解析实例。

真实 npm 宿主由 `scripts/harness-runtime-verify.mjs` 在隔离 HOME/profile 中加载打包插件，固定整个依赖闭包；只有 LLM 使用确定性 fixture。最终运行摘要另附 `runtime-*.json`。

未验证真实模型服务、交互式浏览器、Electron 桌面安装、其他操作系统和真实用户数据迁移。更早的历史宿主仍保留兼容分支和 CI 矩阵，本次本地实测范围以运行摘要为准。

## 本地候选验收结果（2026-10-17）

- `pnpm typecheck`、`pnpm build`、完整 `pnpm verify` 全部通过；无跳过的已失败基线检查。
- 新宿主：293 个精确 DSH 包，10/10 真实 CLI 场景通过，见 [运行摘要](runtime-0.2.1-rc.1.json) 与 [依赖闭包](cohort-0.2.1-rc.1.json)。
- 上一推荐宿主：10/10 同组场景通过，见 [运行摘要](runtime-0.2.0-rc.2.json) 与 [依赖闭包](cohort-0.2.0-rc.2.json)。
- 真实 Loader 配置重载后，同一存活 Agent 保留角色提示，自定义禁用工具的执行仍在工具准入层被拒绝；stability 的 `hmr` 断言及 `hmr-*.json` 保存证据。
- fresh/reload/cold 的真实工具调用均拒绝队长专用工具；两个版本的 `tool-denial-*.json` 保留对应事件。模型请求同时断言成员角色、工具可见性和推理力度。
- 新版第一次 Web probe 因 headless 禁用 credentials 而未激活 connection；测试配置显式启用隔离凭据服务后重跑全部场景通过，没有将未激活视为业务通过。
- 两个版本使用同一不可变候选包，SHA-256：`df6170794fc56214f256d813efbc2d2abb5e58efb6ea9bd3e0c2ce5176924bd7`。

产物本地路径为 `artifacts/harness-0.2.1-rc.1/nanmicoder-dsh-agent-teams-0.1.24-rc.1.tgz`（gitignored）。重现命令：

```sh
pnpm install --frozen-lockfile
pnpm typecheck && pnpm build && pnpm verify
pnpm pack --out /tmp/agent-teams-candidate.tgz
node scripts/harness-runtime-verify.mjs --host-version 0.2.1-rc.1 --artifact /tmp/agent-teams-candidate.tgz --report-dir /tmp/agent-teams-new-run
```

用新的 report-dir 隔离每轮状态，不能复用有旧团队/trace 的场景目录。该本地候选之后仅调整发布文档及 Windows 测试初始文件时间。正式发布流水线完成 Ubuntu/Windows 检查和全部 9 个宿主的 CLI 验收；npm 包逐字节匹配 CI 产物，`latest` 仍为 `0.1.23`。真实模型、交互式浏览器及 Electron 的限制仍适用。

从官方 registry 下载发布包并安装到隔离 Harness `0.2.1-rc.1` 后，stability 场景通过，覆盖热重载、工具准入、消息续接、重派与归档，见[发布后消费者复验](published-consumer.json)。
