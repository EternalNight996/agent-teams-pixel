# Git 安装预适配验证

日期：2026-09-28。候选基于 AgentTeams 0.1.21 工作区；尚未推送或发布。文中的 Git SHA 仅属于临时测试仓库。真实 Harness Web UI 结论由主审计另行记录。

## 最终方案：Git 随源码提供预构建产物

GitHub URL 安装不再依赖 prepare 或用户批准构建脚本。移除本轮试验的 prepare hook 及脚本，取消 `.gitignore` 对 lib/ 的忽略，Git 分发包含完整 host/client JS、声明、映射文件与 freshness stamp。npm 发布继续使用同一 lib/ 产物，没有增加 install/postinstall。

新增 `scripts/git-artifacts.mjs`。正常 build 完成后生成 lib/git-artifact-stamp.json，记录两个 SHA-256 摘要：

- 构建输入：src 全部文件、TypeScript/tsdown 配置、锁文件、workspace 依赖设置、clean-build 与 stamp 脚本，以及 package name/version/type/exports/devDependencies/dependencies/build 命令。
- 构建输出：lib 全部文件，排除 stamp 自身。

`pnpm verify:git-artifact` 断言源码、构建设置、输出内容同时匹配，且 host/client JS 与声明入口齐全。源码或输出变动、缺失产物、额外输出都会失败；README 等非构建输入变动不会使产物失效。verify 聚合链包括真实产物检查与 6 项针对该检查器的测试；CI 在 build 之前校验，防止自动重建掩盖 Git 中陈旧产物。

开发者改动构建输入后须 `pnpm build`，并在后续提交中包含 lib/ 更新。本次没有提交产品仓库。

## pnpm 10/11 配置

Desktop 实际捆绑 pnpm 11.7.0；pnpm 11 不再读取 package.json.pnpm.overrides。原 273 条固定版本原样迁入 JSON 格式的 `pnpm-workspace.yaml`（JSON 同时是合法 YAML），包含 `packages: ["."]` 和 `autoInstallPeers: true`，因此维护脚本无需增加 YAML 运行依赖即可读取。兼容校验器相应由主审计更新。

workspace 显式将 `@deepseek-ai/dsh-subprocess-local`、`@google/genai`、`koffi`、`node-pty`、`protobufjs` 的 allowBuilds 设为 false；这些开发依赖的安装脚本不用于编译插件。未授权运行这些脚本。最终 Git 安装不安装开发依赖，宿主自身依赖的构建策略不受该包内部配置改变。

在隔离源码树执行纯 pnpm 11 `install --frozen-lockfile --ignore-scripts --prod=false` 成功，原 lockfile 和源码 Git status 未变化。切换该临时目录已有的 pnpm 10 node_modules 时使用 CI=true，允许重建测试目录的 node_modules；没有改变真实用户 profile。

## 为什么放弃 prepare 方案

自包含 prepare 曾在隔离 Git 安装中通过 pnpm 10.33.0 与纯 11.7.0 测试，完整构建 host/client/types。但是实际 Harness Web UI 不能完成未批准 Git prepare 的流程：pnpm 11 抛 ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED，仅输出精确 allowBuilds 建议，不写宿主 readPendingBuilds 能读取的 pending 字段，因此 UI 没有批准按钮。保留该方案会迫使用户手工修改 profile；最终改用预构建产物，不修改官方宿主。

另一个测试陷阱是仅指定外层 pnpm 11 可执行路径不够：Git fetcher 内层从 PATH 找到全局 pnpm 10。所有纯 11 验证均前置 Harness node_modules/.bin 并检查日志版本，不把混用结果算作 Desktop 验收。

## 隔离验证证据

环境：Node v26.7.0，pnpm 10.33.0 与 Harness 捆绑的 pnpm 11.7.0，macOS。原始测试证据目录：

```
/var/folders/sx/hl8zlmxd7gx9b58_1t2zhp5r0000gn/T/agent-teams-git-candidate-rumpmyr8
```

独立临时 Git 仓库复制工作区源码、构建脚本和完整 lib/ 后提交；没有产品仓库提交。全新 pnpm 11 profile 只有 `autoInstallPeers: false`，没有 allowBuilds 或其他批准配置：

```sh
PATH="/Users/nanmi/workspace/github/deepseek-harness/node_modules/.bin:$PATH" \
  /Users/nanmi/workspace/github/deepseek-harness/node_modules/.bin/pnpm \
  --dir "$TASK_CANDIDATE_DIR/prebuilt11" add "$SPEC"
```

`prebuilt11.log`：未缓存的预构建 Git 候选安装成功，退出 0，982ms；日志仅下载并安装一个包，没有 prepare、编译或开发依赖安装。该候选 SHA 为 abe7510a242e66e8e0f4d84850e95bb03ab8810e，后续只修正验证器对 macOS /var → /private 路径的 CLI 识别，并重新生成 stamp。

历史 prepare 试验日志保留供排查：install.log、unapproved-fresh.log、self-contained.log、pnpm11-pure.log、pnpm11-final.log、pnpm11-final-metadata.log、pnpm11-clean.log、pnpm10-final.log、pnpm11-frozen.log。它们不代表最终安装方案，也不作为 UI 批准流程成功的证据。

自动化检查：`pnpm build`、`pnpm verify:git-artifact`、`node --test scripts/git-artifacts.test.mjs`（6/6）、`git diff --check`。Windows Git 安装未在本机实测；最终安装已不需执行插件构建脚本。远端 GitHub 尚未更新，不能宣称公开 URL 已经包含修复。

最终交给主线程真实 Web UI 的未缓存候选（已重新 build，freshness 校验通过）：

```
git+file:///var/folders/sx/hl8zlmxd7gx9b58_1t2zhp5r0000gn/T/agent-teams-git-candidate-rumpmyr8/source#8105e993d0808d788071489ecc0e8b4c45f454fc
```
