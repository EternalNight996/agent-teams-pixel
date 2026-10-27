# 🐉 dsh-pixel-team — 给 AI 团队的像素修仙洞府

[![GitHub stars](https://img.shields.io/github/stars/EternalNight996/dsh-pixel-team?style=flat)](https://github.com/EternalNight996/dsh-pixel-team/stargazers)
[![npm](https://img.shields.io/npm/v/dsh-pixel-team)](https://www.npmjs.com/package/dsh-pixel-team)
[![release](https://img.shields.io/badge/release-v0.3.0--rc.2-FF7A45)](https://github.com/EternalNight996/dsh-pixel-team/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-Web%20%2B%20Headless-5B4CF0)](https://github.com/deepseek-ai/deepseek-harness)

[English](README.md) · **简体中文**

<p align="center">
  <a href="https://github.com/EternalNight996/dsh-pixel-team"><img src="https://raw.githubusercontent.com/EternalNight996/dsh-pixel-team/main/assets/readme/social-preview.png" width="100%" alt="dsh-pixel-team：给 AI 智能体团队的像素修仙洞府" /></a>
</p>

> **一个 DSH 会话，变成一座宗门。掌门派活，修士伏案，洞府真的可以点。**
>
> 持久化子智能体、依赖感知的任务、质量门禁，加上十五重境界的修炼层——本地优先、MIT、不需要额外工作流引擎。

- 🏯 **不是列表，是一座洞府**：六件可点击墙面设施、七个底栏动作，掌门与修士都在同一个像素场景里。
- 🧠 **真正的团队协议**：持久子会话、自动派发、邮箱、重试、冷恢复、独立审查。
- ⚔️ **专业角色**：前端、后端、合契、验证、审查、安全；每个角色有边界契约与证据规则。
- 🌱 **看得见的修炼**：任务与挂机共同喂养十五重境界；法器、坐骑、技能直接画进洞府。
- 📜 **封神榜 + 宗门志**：本宗留名、境界谱、修为卡、赞助/交流群/关于/反馈，一个面板收齐。
- 🔒 **本地优先**：宗门状态在你的工作区，不需要云账号。

<p align="center"><strong>⭐ 如果这座像素洞府让你的智能体更好用，点一个 Star 就是最大的支持。</strong><br/><sub>一条命令：<strong>dsh plugin --profile desktop add dsh-pixel-team</strong></sub></p>

## ⚡ 快速开始

**DeepSeek Harness（桌面 / Web）**

    dsh plugin --profile desktop add dsh-pixel-team
    # 重开 DSH → 打开 山门 · 名册

**从 GitHub 安装**

    git clone https://github.com/EternalNight996/dsh-pixel-team
    dsh plugin --profile desktop add ./dsh-pixel-team

**CLI / Headless**

    dsh --profile desktop
    # 直接说：用 AgentTeams 开一个团队做 …

当前版本：**0.3.0-rc.4**。推荐宿主：DeepSeek Harness **0.2.1-rc.3**（Web + Headless），精确矩阵见 [compatibility.json](compatibility.json)。

## 🏯 洞府里有什么

| 设施 | 作用 |
|---|---|
| **山门 · 名册** | 当前宗门、历史宗门与团队入口 |
| **藏经阁 · 道统** | 成员、任务契约、开宗草案与向导 |
| **功德碑 · 进度** | 任务依赖、派发进度、验证证据 |
| **封神榜** | 本宗留名、十五重境界、修为卡、升级提示、宗门故事 |
| **天机阁** | 法器 / 坐骑 / 技能物品栏，选择后洞府即时预览 |
| **宗门志** | 赞助、交流群、关于、隐私受限的反馈表单 |
| **收件** | 掌门收件箱，键盘可达、文本转义 |

墙面和底栏是同一套面板的两个入口。单击修士进入对话；单击头顶等级牌打开装备。

## 🐉 为什么做成洞府

大部分智能体面板是列表。这里是一个**地方**：掌门案、山门、功德碑、封神榜。你不用翻日志，就能看到谁在干活、谁闲着、什么被卡住、交付了什么。

像素下面是真正的团队运行时：

- 掌门带队的任务 DAG，依赖满足才派发；
- 持久成员会话、邮箱、attempt 所有权；
- 质量契约：目标、范围、验收、验证命令、审查结论；
- 独立验证/审查门禁、修复轮次、冷恢复；
- 前端/后端/合契/验证/审查的角色契约，写入范围互不重叠。

## 🖼️ 当前界面

<p align="center">
  <img src="https://raw.githubusercontent.com/EternalNight996/dsh-pixel-team/main/assets/readme/hall.png" width="90%" alt="DSH Pixel Team 洞府：六件墙面设施、居中的山门名册与伏案修士" />
</p>
<p align="center"><sub>当前洞府：六件墙面设施、居中的山门 · 名册，以及正在工作的团队。</sub></p>

## 🧩 角色与模板

| 模板 | 默认角色 | 适合 |
|---|---|---|
| **全栈** | 合契师 · 灵绘师 · 地脉师 · 验证 · 审查 | 契约先行、前后端并行 |
| **安全加固** | 巡查使 · 镇魔师 · 验证 · 审查 | 先复现、最小修复、残余风险 |
| **修 Bug / 新功能 / 调研 / 构建 / 文档 / 论道** | 小规模角色组 | 日常团队任务 |
| **架构重构** | 阵法师 · 实现 · 验证 · 审查 | 边界与迁移 |

每个专业角色都有固定契约：ownership、must / must not、done、五条 Report、Working budget。全栈刻意压到五人：合契师同时拥有契约与最终联调，少一次交接。

## 🔬 证据，而不是感觉

- 全量 **pnpm verify** exit 0
- 浏览器侧契约 **56/56**
- 发布包 smoke：tarball 含运行时与支持二维码，排除源码/测试/文档
- 真实模型团队跑通过一次“掌门派发 → 成员写文件 → 独立审查 → 汇总”的交付；见 [docs/agent-teams-real-model-verification.json](docs/agent-teams-real-model-verification.json)

这是一个追求**并行墙钟 + 独立验证**的工具，不承诺所有任务更省 token。小任务通常单 agent 更合适。

## ⚙️ 配置

    # cordis.patch.yml 默认值
    stateDir: .agent-teams
    memberProvider: spawn

宗门状态位于工作区 .agent-teams/<teamId>/。不要直接改 team.json/inbox，使用 agent_teams_* 工具。

## 🛡️ 边界

- 不做隐藏云同步：修炼与反馈诊断都留在本地。
- 批准才开工：staged 计划必须由你批准。
- 部署必须显式确认；智能体不会静默替换正在运行的宗门。
- 审查独立：实现者不能批准自己的实现。

## 🧑‍💻 开发

    pnpm install
    pnpm typecheck
    pnpm build
    pnpm verify
    pnpm verify:web-routes

文档：[发布清单](docs/release-checklist.md)、[维护流程](docs/maintenance-workflow.md)、[IP 与归属](docs/IP-AND-ATTRIBUTION.md)。

## 💛 社区与支持

- 安装后可在 **宗门志** 查看 QQ 群、微信支持码与产品更新。
- 赞助完全自愿，MIT 始终免费；见 [SPONSOR.md](SPONSOR.md)。
- Issues：https://github.com/EternalNight996/dsh-pixel-team/issues
- 由 **惠州市梦游科技有限公司** 维护与发布。

## 📄 许可

MIT © 2026 惠州市梦游科技有限公司。归属与许可全文见 [NOTICE.md](NOTICE.md) 与 [LICENSE](LICENSE)。像素洞府、修炼体系、装备、封神榜与宗门志为本项目原创。

<p align="center"><strong>⭐ 想让这座洞府继续长大，就点一个 Star。</strong></p>
