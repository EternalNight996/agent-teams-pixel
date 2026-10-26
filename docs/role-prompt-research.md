# 角色提示词调研与适配（2026-10-27）

目标：把“流程型成员”升级为“能做软件项目的专业角色”，同时不破坏 AgentTeams 的缓存友好前缀。

## 1. 参考项目（高星/常用，按公开仓库）

| 项目 | 角色/提示词模式 | 可借鉴点 | 不直接照搬的点 |
|---|---|---|---|
| [MetaGPT](https://github.com/geekan/MetaGPT) | 软件公司 SOP：产品经理、架构师、项目经理、工程师、QA；每个角色有明确职责与结构化产出 | 角色负责一层；上游文档是下游输入；QA 独立 | 完整公司流程太重，个人插件不需要多级管理层 |
| [ChatDev](https://github.com/OpenBMB/ChatDev) | 角色扮演 + 评审/测试闭环，程序员/审查员/测试员对话式纠错 | 审查与测试必须独立；用对话暴露幻觉 | 长对话成本高，不适合每次任务重复 |
| [LangGPT](https://github.com/langgptai/LangGPT) | 结构化提示词：Role / Profile / Skills / Rules / Workflow / Initialization | “角色 + 边界 + 流程 + 输出”四件套 | 模板偏长，需压缩成固定短前缀 |
| [CrewAI](https://github.com/crewAIInc/crewAI) | Agent(role, goal, backstory) + Task(expected_output) | 目标与预期产出显式化；角色可委派 | backstory 容易膨胀，改为职责/非目标 |
| [wshobson/agents](https://github.com/wshobson/agents) | 前端、后端、安全、审查等子代理，各自有工具边界与清单 | 前端/后端分层的具体检查项 | 不复制其长清单，只保留验收必需项 |
| [contains-studio/agents](https://github.com/contains-studio/agents) | 按部门拆分的角色与交付物 | 角色对应可验收交付物 | 组织角色多，按需裁剪 |
| [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | 按技术栈的前端/后端规则 | 栈相关约定放在执行提示，而非全局人格 | 规则随项目变化，不能硬编码到所有任务 |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) / [SWE-agent](https://github.com/SWE-agent/SWE-agent) | 仓库级代理，强调复现、测试、最小 diff | 先复现/定位，再小步改；证据驱动 | 通用工程流程已在现有 persona 中 |

说明：以上为公开仓库与常见模式分析，未逐字复制提示词；star 数只作“社区常用”的定性参考，不代表质量证明。

## 2. 共性结论

高星项目真正有效的不是“角色名”，而是五件事：

1. **唯一 ownership**：这个角色拥有哪一层，明确不拥有什么；
2. **输入/契约**：上游给什么（需求、API/schema、设计），下游消费什么；
3. **工作流/SOP**：先契约/复现，再实现，再验证；
4. **可验收输出**：命令、测试、截图、迁移、证据路径；
5. **handoff**：契约变更通知谁，失败如何阻断下游。

前端/后端的差异主要来自**边界与检查项**，不是“你是一个资深工程师”这类形容词。

## 3. 本项目的适配

新增 [src/role-guidance.ts](../src/role-guidance.ts)：

- 只对软件角色追加一段固定 Role contract，不膨胀全局 persona；
- 每个角色 300–1400 字符，包含 Ownership / Must / Must not / Done；
- 前端：UI 状态、键盘/读屏、响应式、浏览器证据、只消费契约、不改服务端/迁移；
- 后端：先复述契约、迁移+回滚、校验/鉴权/幂等/结构化错误、集成测试、不改 UI；
- 联调：对齐字段/类型/错误码、E2E smoke、记录契约差异与风险；
- 验证/审查：独立、风险矩阵、findings、证据不足即失败；
- 未识别角色（如 researcher）不追加，保持原 token 成本。

新增 fullstack 快速模板：

    contract (integrator, owns the contract)
      ├─ frontend (frontend) ─┐
      └─ backend  (backend)  ─┴─ integrate (same integrator)
                                    └─ verify (verifier) └─ review (reviewer)

模板在 [src/quick-start.ts](../src/quick-start.ts)，UI 入口在 QuickStartDialog。
五人是刻意压过的编制：architect 不再单列，契约与最终联调都由 integrator 拥有，
少一个成员前缀和一次跨角色交接。

另有一个可选的「安全加固」四角色模板（吸收 wshobson/agents 的 security-auditor 模式）：

    audit (auditor, read-only) → fix (security, minimal)
      → verify (exploit repro + regression) → review (reviewer)

它不默认进入 fullstack，避免普通功能任务为安全角色多付前缀；需要时单独选。

## 4. 成本与收益（当前实测）

角色 contract 实测（字符 / 约 tokens）：

| 角色 | chars | ~tokens |
|---|---:|---:|
| integrator | 953 | 238 |
| frontend | 1,025 | 256 |
| backend | 931 | 233 |
| verifier | 878 | 220 |
| reviewer | 889 | 222 |
| **fullstack 合计** | **4,676** | **~1,169** |
| security（可选） | 1,032 | 258 |

- 每个成员只看到自己那一段（约 190–225 tokens），不是五段全付；前缀固定，缓存不受影响。
- 新增 Working budget：只读范围内文件、不复述任务/不粘贴大文件、证据化汇报、同一阻塞两次失败即停下报告；用于压返工与长输出。
- 新增 Report 约定：只报 changed paths、命令/证据、契约缺口，最多 5 条；产物写文件，不把内容粘进汇报（MetaGPT 文档交接 / CrewAI expected_output 的轻量版）。
- fullstack 模板：6 个任务、5 名成员、DAG 深度 5、最大并行宽度 2（frontend/backend 并行）；契约与联调同一人，少一次交接。
- 每个 fullstack 任务在描述里带「交付/验收」：契约文件、截图/控制台证据、迁移/测试、E2E 命令与结果、风险矩阵、findings+verdict，减少“做完但不知道交什么”。
- 对比上一版 6 人（architect + frontend + backend + integrator + verifier + reviewer）：少一个成员前缀、少一次跨角色交接。真实模型基准里成员 system prompt 约 9.1k chars（~2.3k tokens/请求）；少一个成员在 12–16 个请求量级上可省约 2.8–3.7 万输入 tokens（多数为缓存读），但**这是结构估算，不是 A/B 实测**。
- 收益应体现在“少返工、少跨层误改、验收证据齐”，而不是单次 token 更少；
- 需要真实模型 A/B 验证：单 agent vs 团队、前端/后端角色有无专用 contract，比较墙钟、token、一次通过率。

## 5. 尚未验证

- 没有真实模型跑“前端+后端+联调”完整业务；
- 没有浏览器 E2E 与打包 profile 冷启动；
- 角色 contract 的长度/措辞仍需按真实失败案例迭代，避免变成新的“长提示词税”。
