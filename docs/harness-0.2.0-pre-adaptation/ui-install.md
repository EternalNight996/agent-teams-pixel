# 修复后真实 Web UI 安装验收

2026-09-28，官方master `21638c56315ae6a2b552d6091945d3144c9af32e`，本地built Web，Ego Lite实际操作。包管理器PATH前置官方checkout的pnpm 11.7.0，与apps/desktop/package.json所固定的版本相同。未运行打包Electron应用。

修复候选未推送远端，使用临时Git镜像模拟GitHub源码分发：

```text
git+file:///var/folders/sx/hl8zlmxd7gx9b58_1t2zhp5r0000gn/T/agent-teams-git-candidate-rumpmyr8/source#8105e993d0808d788071489ecc0e8b4c45f454fc
```

该临时commit包含最终预构建lib与校验stamp，没有prepare/install/postinstall。此处验证真实Git取包、安装器、Loader和前端，网络GitHub传输曾在改动前实测成功；不能宣称尚未推送的公开仓库已包含修复。

## 操作与结果

1. 插件 → 添加插件，输入上述未缓存Git spec。
2. 页面显示“已安装”，没有脚本批准步骤。
3. 点击“立即启用”，详情显示“共1个 · 1运行中”。
4. 刷新页面后，输入 `/agent-teams`，可见插件指令候选。
5. 状态接口返回HTTP200、`{"teams":[]}`；这是全新隔离工作区，无历史团队干扰。

证据：[运行中截图](git-ui-running.png)、[组件状态快照](git-ui-running.snapshot.txt)、[刷新后指令入口](git-ui-command.snapshot.txt)、[空工作区状态接口](git-ui-state.json)。此次没有在UI发送真实模型请求；团队行为由同一源码宿主的十项fixture场景验证。

## 测试隔离

HOME、DSH_HOME、cwd均位于 `/tmp/agentteams-pre020-ui`。额外通过官方 `workspace-controller.config.documentsDirectory` 指向该目录的documents，避免macOS默认目录查询绕过HOME读取真实用户Documents。没有编辑真实用户profile、安装或团队数据。测试服务与浏览器在验收后关闭，隔离产物和日志保留。

首次prepare方案在纯pnpm11下得到 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，而UI没有批准按钮，这促成预构建方案。最终profile没有手工添加allowBuilds豁免。原始日志见 `/tmp/agentteams-pre020-ui/server11.log`。

此前对已发布0.1.21的原始安装矩阵：npm包名和官方registry tgz成功；npm网页URL被拒绝；GitHub仓库下载成功但缺lib导致启用失败。最终候选修复的是最后一项以及未来0.2.0版本门禁；npm网页URL仍不是官方安装器支持的输入格式，因此文档推荐包名。
