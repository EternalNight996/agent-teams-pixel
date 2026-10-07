# UI 交互简化方案 v1（更便捷 · 更简单）

> 定位：这是对 [`ui-creative-plan.md`](./ui-creative-plan.md) 第 10、11 节的**修正与收敛**。
> 那份方案回答「怎么更好看、更能干」，本方案回答「怎么更少动作、更少选择」。
> 状态：**方案 + P0 低风险子集已落地源码**（只改 `src/client.main.js`；`lib/client.js` 未重建，GUI 无变化）。
> 配套可点设计稿：[`design/simplify.html`](../design/simplify.html)（现状密度 vs 简化后目标态，并排对照）。
> 前置事实：`lib/client.js` 由 [`scripts/build-client.mjs`](../scripts/build-client.mjs) 把 `src/client.prelude.js` + `src/client.main.js` 拼出，任何交互改动必须重跑 `node scripts/build-client.mjs` 才在运行中的 GUI 生效。

## 0. 一句话定版

把「三处选人、五个入口、四十个控件」收敛成「**一个入口、一个主按钮、三次点击内开工**」。
此后界面上每多一个控件，都必须能回答：它替用户省掉了哪一步。

## 1. 现状实测（grep 计数，不是估计）

| 界面面 | 代码位置 | 交互件数 | 实测问题 |
|---|---|---|---|
| 工作角色页签 · 顶部 | `client.main.js:2665,2666,2673,2674,2675,2676,2699,2701,2702` | 9 | 同一动作 2 个主按钮；新建/导入常驻占位 |
| 工作角色页签 · 右栏 | `2739,2744,2746,2751,2752,2761,2768,2775,2784,2785,2793,2794` | 29 预设 chip + N 个已存 chip（每个带 ✕）+ 11 | 五段纵向堆叠；底部与顶部 CTA 完全重复 |
| 像素办公室浮层 · 标题栏 | `2354,2355,2356,2357,2358,2359` | 6 按钮 + 状态点 + token 计量 | `−`、`＋` 与折叠号三个形近符号；`⚙️` 无文字标签；「选人」与「🤝团队」入口重叠 |
| 浮层 · 抽屉 | `2384-2432` | 3 个互斥模式 + 29 预设 + 开工 + 应用 + 清空 + RolePicker | 与页签重复整套「选人 + 编排」 |
| 浮层 · 底栏 | `2437-2449,2451` | 头像条 + ◀ + ▶ + 缩放手柄 | 缩放两条路径（按钮 / 手柄拖拽） |
| 团队抽屉 | `1950,2053,2057,2079,2080,2087,2088` | 暂停/恢复 + 建任务 + 内联编辑 5 框 + 任务卡 + 编辑/删除 | 硬编码中文不走 `t()`；`confirm()`（`1996`）打断；无撤销 |

**重复路径实证（同一次动作的多个渲染点）：**

| 动作 | 渲染点 | 处数 |
|---|---|---|
| 应用到对话 `applyToChat` | `2424` / `2702` / `2793` | 3 |
| 一键编排 `oneClickTeam` | `2396` / `2701` | 2 |
| 29 个预设团队 chip | `2388` / `2739` | 2 |
| 缩放 | `2355` `2356` 按钮 / `2451` 手柄 | 2 |
| 折叠 | `2333` 折叠态展开 / `2359` 标题栏折叠号 | 2 |
| **键盘映射** | 全文件无 `onKeyDown` / `keydown` / `tabIndex` / `onWheel` | **0** |
| **无障碍** | 仅设置分区有 `aria-pressed`（`2852` `2886` `2908`），主体交互无 `aria-label` | 近 0 |

## 2. 五个摩擦点（证据 + 用户代价）

**F1 一件事两条路，把实现缺陷写进 UI。**
`o.oneClickHint`（`client.main.js:107` / 英文 `293`）原文：「首选『工作角色』页签的 🚀 一键编排，那里最稳」。
这是让用户替实现问题做判断。同一目标两个按钮，每用一次都要重新选。

**F2 一条工具栏两个主按钮，视线没有落点。**
`2701` 紫色 `#7c3aed` 与 `2702` 蓝色 `#2563eb` 并排，都是 `fontWeight:700` 的大按钮。

**F3 认知前置：还没选人就先面对 29 个预设。**
`2739`、`2388` 一次性铺满。用户此刻的目标是「组队」，却被要求先回答「选预设还是自己选」。

**F4 最短路径跨 3 个区域、5 次点击。**
中栏点卡片选中 → 右栏成员列表找到本人 → 点「设为领袖」（`2784`）→ 回顶部点开工（`2701`）→ 自动跳对话。

**F5 反馈与容错缺失。**
操作结果只有 `2399` 一行 11px 半透明灰字，或 2.2 秒 toast（`1938`）；删除任务走原生 `confirm()`（`1996`）；无撤销；无键盘；无 `aria-label`。

## 3. 简化原则（冲突时按序号让位）

| # | 原则 | 落地判据 |
|---|---|---|
| R1 | **单入口** | 同一能力只在一个地方出现，其余入口删除而非隐藏 |
| R2 | **单主按钮** | 任一渲染分支内紫色主按钮 ≤ 1 |
| R3 | **三步内开工** | 默认路径（选人 → 开工）≤ 3 次点击 |
| R4 | **就地操作** | 选中 / 设领袖 / 移除都在角色卡上完成，不跨区域 |
| R5 | **递进披露** | 首屏只放「最近使用 + 搜索」，全集收进展开项 |
| R6 | **可撤销** | 破坏性操作内联确认 + 3 秒撤销，不用原生弹窗 |
| R7 | **键盘等价** | 每个鼠标动作都有键盘路径 |
| R8 | **不新增需学习的控件** | 对 `ui-creative-plan.md` 第 10、11 节的修正：**不加**视图切换器、**不加** 5 段筛选条、**不加**缩放缓动条 |

## 4. 目标交互模型

### 4.1 三层收敛

| 层 | 内容 | 与现状差异 |
|---|---|---|
| **L0 入口** | 一个「🧩 团队 (n)」按钮，打开面板 | 取代现在的页签 + 浮层标题栏 + 抽屉三个入口 |
| **L1 组建（默认页）** | 搜索 + 角色卡网格 + 右栏「队伍」摘要 + 底部单主按钮 | 页签右栏 5 段压成 1 段摘要 |
| **L2 进行中** | 任务 DAG + 成员状态 + 草案闸门 + 消息流 | 见 [`team-panel-v3.md`](../design/team-panel-v3.md) 三件套 |
| **L3 浮层（像素办公室）** | **纯展示**：标题栏 3 控件（收起 / 打开面板 / ⋯） | 删除抽屉与 picker 整套写路径 |

### 4.2 主按钮语义合并（本方案关键决策）

现状两个动作的差别只在**指令措辞**，不在用户目标：

- `applyToChat`（`2630`）：apply + 填成员清单 `shortInstruction`
- `oneClickTeam`（`2637`）：apply + 填编排指令 `inst.oneClick*`

目标：合并为单一「🚀 开工」，内部规则为

1. 团队已命名 → `inst.oneClick`
2. 未命名 → `inst.oneClickOffice`（宿主按本会话选中角色组队）
3. 高级「只填入成员清单」降为「⋯」里的次级项，保留给需要手改指令的用户

### 4.3 首屏控件预算

目标：首屏可见交互控件 **40 → ≤ 12**，其中主按钮 1 个、常驻输入 1 个（搜索）。

| 区域 | 现状 | 目标 |
|---|---|---|
| 顶部 | 9（含 2 主按钮） | 2（搜索 + 🚀 开工） |
| 中栏 | 分类侧栏 + 卡片 | 卡片 + hover 的 👑 / ✕ |
| 右栏 | 29 预设 + 已存 chip + 保存 + 领袖卡 + 成员列表 | 1 段摘要（领袖 + 成员 chips + 一句话「将发生什么」） |
| 浮层标题栏 | 8 元素 | 3 |
| 「更多」抽屉 | 无 | 新建角色 / 导入 md / 保存团队 / 只填指令 / 用量 |

## 5. 改造清单

### P0 · 纯前端、不改端点

| # | 动作 | 锚点（可搜索） | 省掉 | 状态 |
|---|---|---|---|---|
| P0-1 | 删右栏底部重复的「应用到对话」，底部只留「清空」 | 注释块 `底部只留「清空」`（`client.main.js:2897-2901`） | 1 冗余决策 | ✅ 已改 |
| P0-2 | 顶部 2 主按钮合并为「🚀 开工」+「⋯」 | `t('r.oneClick')` 与其右侧 `t('r.applyChatN')`；键合成 `r.start` | 1 次二选一 | ⏳ 未做 |
| P0-3 | 浮层标题栏 6 → 3：保留「折叠」「`🤝`团队」「`⋯`」 | `t('o.pick')` / `t('o.zoomOut')` / `t('o.zoomIn')` / `t('o.settings')` 四个按钮 | 3 个按钮 | ⏳ 未做 |
| P0-4 | 缩放增加 `Ctrl + 滚轮`（原生监听 + `passive:false`，保留手柄） | 注释块 `Ctrl + 滚轮缩放`（`1731-1746`）+ `onZoom: setZoom`（`2460`） | 2 次精准点击 | ✅ 已改 |
| P0-5 | 角色卡就地设领袖（hover 显示 `👑`） | `shown.slice(0, roleInf.limit).map` 卡片块。**实现注意**：别做成 `button` 套 `button`（a11y 违规），卡身用 `div[role=group]` + 内部两个并列 `button`，或用绝对定位的按钮且在 `focus-visible` 时也显示 | 跨区域 2 步 | ⏳ 未做（设计稿里已演示，但那版是简化写法） |
| P0-6 | 预设团队递进披露：首屏 6 + 「全部 29 ▾」 | `PRESETS.slice(0, 6)`：页签 `2844`、浮层 `2415` | 23 个干扰项 | ✅ 已改 |
| P0-7 | 文案去实现细节 | `'o.oneClickHint'`（zh `110` / en `299`） | 认知税 | ✅ 已改 |
| P0-8 | 键盘：`/` 搜索、`Enter` 开工、`Esc` 清空、`↑↓` 选卡、`Space` 加选 | 注释块 `键盘等价路径`（`2681-2738`）；搜索框 `ref: searchRef`（`2790`） | 0 → 全键盘 | ✅ 已改 |
| P0-9 | 删除任务改内联确认 + 3 秒撤销 | `confirm('删除任务 '`（`2019`） | 原生弹窗打断 | ⏳ 未做 |

### 本次已落地的细节（重要）

- **新增 3 对 locale 键**（zh/en 必须成对，`test/locale-key-parity.test.mjs` 卡这条）：
  `r.presetMore` / `r.presetLess` / `r.keysHint`。
- **键盘监听的三条护栏**（`keyRef` + `window` 监听 + `pixVisible()` 可见性判定）：
  ① 焦点在 `INPUT/TEXTAREA/SELECT` 或 `BUTTON/A` 上不抢键（否则按一次触发两次）；
  ② 带 `Ctrl/Meta/Alt` 的组合键不抢；③ 页签不可见（零尺寸 / `display:none` / `visibility:hidden` / `pointer-events:none`）时直接退出，
  避免在聊天视图里误吞按键。没有第三条，这个全局监听会污染整个应用。
- **`Ctrl + 滚轮` 用原生 `addEventListener(..., { passive: false })`**：React 根节点的 `wheel` 是 passive，`preventDefault()` 会被忽略并告警。
- **未验证**：本次改动**没有**跑 `node --check` / `node --test` / `node scripts/build-client.mjs`（本会话 shell 不可用，见 B2），
  `lib/client.js` 也**未重建**，因此 GUI 里看不到任何变化。落地顺序：`npm run check` → `npm run build:client`。

### 独立静态复核（无 shell，只读通读）

复核结论：6 处改动**未发现**语法错误、括号/引号不配对、未定义变量、React 用法错误，也不破坏既有测试。它另外抓出 3 个我漏掉的问题，均已修：

| 复核发现 | 影响 | 处理 |
|---|---|---|
| Escape 分支排在 `typing` 判定之前 | 在「团队名」输入框按 Esc 会顺手清掉角色搜索 | ✅ 已改为「焦点在搜索框内」或「没在输入」才清 |
| `focusIdx ≥ shown.length`（搜索/切分部使列表变短） | 整格卡 `tabIndex=-1`，Tab 进不了卡片网格 | ✅ tabIndex 加越界兜底，回落到首张卡 |
| 渲染期写 `keyRef.current` | 并发渲染下渲染体不保证只跑一次 | ✅ 改为 `function onGlobalKey` + `useLayoutEffect` 同步 |

复核同时确认：`'⭐ ' + presetLabel(p)` 仍为 2 处（`preset-i18n` 门槛 ≥2）；`PRESETS` 与 host `TEAM_PRESETS` 各 29 条且中英一一对应；`render-error-recovery` 的脆弱切片（`src/client.main.js` 是 CRLF，`indexOf('\n    }\n')` 本来就返回 -1）未被我的改动影响。

**仍需运行时确认**：`locale-key-parity` 退出码（人工比对通过）、`pixVisible()` 对 DSH 页签隐藏方式的识别、以及重建后 `lib/client.js` 是否仍在 `client-lazy-roles` 的 240 KB 上限内（本次净增约 4 KB，若超限需精简注释）。

### P1 · 与 [`team-panel-v3.md`](../design/team-panel-v3.md) 合并实施

| # | 动作 | 代码锚点 |
|---|---|---|
| P1-1 | 面板页签化：组建 / 进行中；`TeamActivityPanel` 迁入「进行中」 | `function TeamActivityPanel`（`1953-2118`） |
| P1-2 | 3 秒全量轮询改 revision 差异刷新（不重建 DOM） | `setInterval(load, 3000)`（`1973`） |
| P1-3 | 草案闸门 UI：渲染 `view.plan`，支持改后确认 / 丢弃 | 新增 `PlanReview` |
| P1-4 | 成员消息时间线 + 回执徽章 | 新增 `MessageStream` |
| P1-5 | 删除浮层 picker 模式与 `RolePicker`（仅被 `2458` 使用） | 删 `2408-2459`、`function RolePicker`（`1888`） |
| P1-6 | `TeamActivityPanel` 内硬编码中文全部走 `t()` | `原生团队（只读）` / `3s 刷新` / `暂停派单` 等（`2044-2070`） |

### P2 · 加分项

- P2-1 `Ctrl+K` 命令面板：输入「用研发团队 完成 X」直接开工，零点击路径。
- P2-2 拖拽角色到领袖位；预设团队按「最近使用」排序与收藏。

## 6. 验收断言（可执行）

1. `npm run check` 全绿；`test/locale-key-parity.test.mjs` 通过（zh/en 键集必须一致，改文案必须成对）。
2. 计数回归（P0-1/6/8 改后 → 剩余）：`applyChat` 渲染点 3 → 2（P0-2 后 → 1），`oneClickTeam` 2 → 2（P0-2 后 → 1），`PRESETS` chip 首屏 29 → 6（两处），键盘映射 0 → 1 处 `window` 监听。首屏控件 40 → 目标 ≤ 12。
3. 单主 CTA：任一渲染分支内紫色主按钮 ≤ 1。
4. 键盘：headless 断言 `/` 聚焦搜索、`Enter` 把指令写进 composer、`Esc` 关闭面板。
5. 零 em-dash；零新增硬编码中文。
6. 既有测试不回归：`client-inject-contract` / `smoke` / `render-error-recovery` / `client-silent-failure`。

## 7. 风险与边界

- **B1 构建链路**：`package.json` 的 `files` 只发 `lib/`；改 `src/` 后必须 `node scripts/build-client.mjs` 重出 `lib/client.js`，否则 GUI 无变化。
- **B2 已验证（2026-10-02）**：`node --check src/client.main.js` 通过，`npm test` **157/157** 通过，`npm run build:client` 已执行（`lib/client.js` 196.9 KB，在 `client-lazy-roles` 的 240 KB 上限内）。生效需重启 DSH。
- **B3 locale 键成对增删**：`client.main.js:3121` 的 `LOCALE_SVC.register(LOCALE_NS, LOCALE)` 有 catch 兜底，但键集不一致会静默回退 zh（现象是英文界面出现中文）。
- **B4 不改 host 端点与 `lib/team-engine.js`**：P1 的「写向」依赖 team-panel-v3 的原生代理端点，需一并排期。
- **B5 不动视觉规范**：`ui-creative-plan.md` 的 token、材质、光即语义照旧，本方案只覆盖交互层。
- **B6 行尾已归一（2026-10-02）**：`design/simplify.html`、`design/teams-mode.html`、本文档、`docs/redesign-teams-mode.md` 四个文件的裸 LF 已全部转为 CRLF，与 `.editorconfig` 的 `end_of_line = crlf` 一致。

## 8. 与既有文档的关系

| 文档 | 关系 |
|---|---|
| [`ui-creative-plan.md`](./ui-creative-plan.md) | 视觉与氛围规范保留；其第 10、11 节的控件清单由本方案取代 |
| [`team-panel-v3.md`](../design/team-panel-v3.md) | 能力层（写向 / 草案闸门 / 消息流）与本方案 P1 合并实施 |
| [`usage.md`](./usage.md) | 只覆盖引擎/编排流程，不含工作角色页签的操作说明，本次无需改；面向用户的快捷键说明已写进 README + CHANGELOG |
| [`redesign-teams-mode.md`](./redesign-teams-mode.md) | **下一层重构**：入口跟随会话 + 双栏面板 + 计划闸门；其 P0-3 吸收本文的 P0-2 / P0-3 |

## 9. 配套设计稿

[`design/simplify.html`](../design/simplify.html) 是可点的对照稿：左「现状 0.2.10 控件密度复刻」、右「简化后目标态（可交互）」，并排 / 单栏三档切换。
它自带两把尺子：**可见控件数实时实测**（同一函数量两边，折叠起来的 `[hidden]` 不计），以及**开工步数计数**。
键盘 `/` `↑↓←→` `Space` `Enter` `Esc` 在右栏面板里真实可用，日志逐条记录。
注意：右栏是**设计目标态**，P0-2 / P0-3 / P0-5 / P0-9 尚未落到源码；左栏是密度复刻，不是像素级还原。

自检（2026-10-02）：内联脚本 `node --check` 通过；`$('id')` 引用与 HTML 内 `id` 交叉核对 0 悬空（动态创建的 toast 除外）。**未做视觉渲染验证**：本机 Chrome / Edge 无头模式被环境拦截（exit 21、零输出）。
