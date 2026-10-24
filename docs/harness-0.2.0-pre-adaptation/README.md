# Harness 0.2.0 发布前适配

基于官方 `deepseek-ai/deepseek-harness` master `21638c56315ae6a2b552d6091945d3144c9af32e` 完成预适配，日期 2026-09-28。对照基线为 `dsh-v0.1.7-rc.2`（`477b4f420553e8a52c2fbccc464d7561b239c443`）。当前官方源码的包版本仍为 0.1.7-rc.2；0.2.0 是本次预适配目标。

## 要改什么，已经怎样改

| 发布接入点 | 官方实现要求 | 本次改动 |
| --- | --- | --- |
| 版本门禁 | app-boot 检查所有 DSH peer；optional 不豁免 | 所有 DSH peer 精确加入 `0.2.0`，不放开未知后续版本 |
| 源码候选与npm矩阵 | master 可构建，但预计版本尚不能从registry下载 | compatibility.json 增加 sourceCandidates，记录完整SHA和本报告；已发布矩阵保持独立 |
| Git安装 | plugin-manager 调用pnpm add，不代替插件生成lib | Git提交包含完整host/client/types产物；源码修改后由维护者构建并校验，用户安装不执行构建 |
| 桌面包管理器 | apps/desktop/package.json 捆绑pnpm 11.7.0；pnpm 11不再读取package.json中的pnpm设置 | overrides迁至pnpm-workspace.yaml，保留原273项精确版本；使用JSON格式合法YAML，使发布包诊断不需额外解析依赖 |
| 依赖构建批准 | pnpm 11通过allowBuilds进行脚本授权，但Git prepare拒绝不会生成宿主UI可批准记录 | 不使用Git安装构建脚本；开发构建依赖中的5个非编译所需脚本显式禁用 |
| 桌面安装入口 | desktop独立profile，由应用内插件管理器管理 | 中英文README新增桌面操作说明，区分npm包名、npm网页和Git源码 |
| 发布后复验 | 必须识别实际源码、闭包、插件产物 | 新增源码验收工具，复用npm验收的同一套运行场景 |

本次没有重写子代理、消息投递、模型与推理力度、前端槽位和会话恢复：逐项比较官方实现及实跑结果显示这些调用已匹配。详见 [后端源码核验](backend-audit.md)；[改动前桌面审计](desktop-before-adaptation.md) 是历史问题记录，其中版本门禁和Git缺产物问题由本次代码处理。

## 已完成验证

- 修改前 `pnpm verify` 基线、最终 `pnpm build` 与完整 `pnpm verify` 均通过；Git产物检查和新增工具回归均已接入verify。
- 官方原版 evaluator 拒绝旧产物的0.2.0版本，接受新增声明后的候选，均未使用版本豁免。见 [旧包门禁](previous-artifact-gate.json) 与 [候选门禁](candidate-gate.json)。
- 当前官方master的真实built CLI加载候选，10/10场景通过：队员执行回报、忙时FIFO、再次唤醒、失败收尾、fallback、模型与推理力度、冷恢复、HTTP审批、协议与稳定性。只有LLM为确定性fixture。见 [运行结果](source-runtime-result.json) 和 [实际解析闭包](source-cohort-summary.json)。
- Git安装的独立产物/脚本测试见 [Git安装记录](git-install.md)。真实UI候选验收见 [UI记录](ui-install.md)。

旧的已发布npm 0.1.21不包含这些未发布改动。当前工作树中的版本号未替换已发布产物；正式发布本次修改时必须使用新的插件版本。

## 可复现源码验收

先按官方仓库自身说明安装并构建host和client；不要混用旧构建产物。在本插件仓库构建候选：

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify
pnpm pack --out /tmp/agentteams-candidate.tgz
node scripts/harness-source-verify.mjs \
  --host-dir /absolute/path/to/deepseek-harness \
  --artifact /tmp/agentteams-candidate.tgz \
  --report-dir /tmp/agentteams-source-check-new \
  --candidate-version 0.2.0
```

报告目录须为空或不存在。工具要求官方checkout的完整SHA匹配sourceCandidates且跟踪文件干净，拒绝将registry DSH副本混入source闭包。它分别记录“指定候选版本的真实官方门禁检查”和“当前实际源码版本的运行场景”，不修改宿主版本号。构建产物是否对应checkout由调用者保证，并记录CLI/app-boot产物哈希。`--prepare-only`只检查产物和门禁，不能作为10项场景成功证据。

`pnpm verify:source-runner` 检查工具的输入、源码身份和依赖解析；`pnpm test:git-install` 检查Git分发产物校验行为。doctor接受源码预适配目标时标为source-preview，明确 `sourceCommitVerified: false`，不会把按版本匹配当作核验了安装的源码SHA。

## 正式发布时的增量动作

1. 比较正式release SHA与本报告固定SHA；只审阅新增的API、profile、插件管理和分发变化。
2. 更新开发DSH依赖与全部overrides到实际发布的精确版本，核验完整npm分包闭包；将通过验收的0.2.0从sourceCandidates移至supportedHosts，再调整recommendedHost。
3. 用正式桌面包和同一插件候选重跑安装、启用及团队场景。源码预适配已经完成，正式产物验证用于发现打包或最终增量差异。
4. 提升插件版本并走现有发布流程，更新README精确安装版本；不能覆盖已经发布的0.1.21。

本轮未推送或发布。当前证据来自macOS arm64、本地官方master；其他系统、正式Electron安装包与真实模型行为不在本轮验证范围。

最终待发布产物 SHA-256：`fa01db4c5e243814491e3200d53cbad87f42203780a711200b2a91efc1bb1fa0`。该产物的完整十项复验日志保留在 `/tmp/agentteams-source-final-21638c`；项目最终校验日志在 `/tmp/agentteams-pre020-final-verify.log`。
