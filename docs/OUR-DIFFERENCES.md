# 本衍生版与上游 dsh-agent-teams 的关系与差异

## 定位

本仓库是 `dsh-agent-teams@0.1.26`（MIT）的**衍生版**，目标是在其团队流水线
（计划审批 / 依赖任务 / 自动调度 / 质量门 / 交付声明）之上，做三件上游没有的事：

1. **DSH 0.2.1-rc.3 正式支持**（上游当前只声明到 rc.2）。
2. **508 张角色卡 + 领域验收判据**（上游只有通用 acceptance；角色内容留在最后接入）。
3. **像素办公室可视化 + 交付包**（上游只有工作台/树形监控）。

## 当前状态（0.3.0-datbase.1）

- ✅ 代码基座 = 上游 0.1.26（`src/` + `lib/`），包身份/插件 id/兼容矩阵已改为本项目。
- ✅ 上游 baseline 已在 rc.3 实测跑通：staged plan → 审批 → spawn → 调度 → 成员完成 → delivery ok（10 秒）。
- ✅ 像素办公室 v1 已接入：`src/client/pixel-office/`（Canvas 场景 + React 视图），数据源 = 团队快照（members/tasks/activity/inbox）。右侧「团队协作」页签从上到下：**「进度看板 / 操作配置」两个页面 + 固定的动画像素办公室**（不隐藏，分隔条可调高度）。
- ⏳ 未做：调度便利（quick_start / dispatch / next_action / 待办队列，设计见 `docs/dispatch-ux.md`）、角色卡接入、像素 UI 增强、交付包增强、与原生 `agentTeams` 的兼容策略。

## 接入顺序（约定）

1. rc.3 正式支持与回归（本版）
2. 角色判据 → 映射到任务 `acceptance`/`verify`（第二阶段）
3. 像素办公室视图（第三阶段）
4. **508 角色卡**（最后，避免过早绑定数据格式）

## 许可

MIT。上游版权声明保留在 `LICENSE`，衍生说明见 `NOTICE.md`。
