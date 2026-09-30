# agent-teams-pixel · 更华丽、更有创意的 UI 设计方案

> 状态：设计规范 + 展示图，不执行（不改 `lib/` `src/` `team-engine`）。
> 展示图：`design/creative.html`（光之星座旗舰版），功能版基线为 `design/index.html`。

## 0. 一句话定版

把团队活动面板从「功能驾驶舱」升级为「会发光的工作星图」：数据状态翻译成光，深空氛围 + 玻璃材质 + 像素小人三层叠加，单一紫强调 + 状态 LED，依赖链在聚焦时像星光一样流动。

---

## 1. 剖析：华丽 / 创意的本质（不是堆特效）

### 1.1 五个真杠杆

| 杠杆 | 是什么 | 反例（廉价感） |
|---|---|---|
| **深度层次** | 前景(信息) / 中景(材质) / 背景(氛围) 三层分离，用「暗」制造贵 | 全屏同亮度，扁平贴片 |
| **材质** | 一种统一材质：玻璃折射 / 光漫射 / 粒子，让界面有物理感 | 玻璃+金属+发光+噪点全上 |
| **光即语义** | 数据状态 = 光：运行=流动、完成=冷光、阻塞=熄灭、失败=红脉冲 | 状态用文字标签硬编码，光只做装饰 |
| **一个签名动作** | 记住一个动作：依赖链像星光在流动 | 十个没人记得的微动效 |
| **克制** | 单一强调色、语义色只给状态、动效只传达变化 | 紫色霓虹遍地、玻璃滥用、无限循环 |

**结论：华丽 = 深层次 + 统一材质 + 光即语义 + 一个签名 + 克制。** 缺任何一个，就会滑向「AI 味」。

### 1.2 现状诊断

当前像素驾驶舱（`design/index.html`）已经做到：像素 DNA、DSH token、单一紫强调、状态四色、一键切视图、点击固定、三态闭环。**它「独特且正确」，但偏「功能」，缺三层里的「氛围层」和「材质层」，也没有「签名动作」。**

### 1.3 华丽化的三条路径（按性价比排序）

1. **氛围层**：深空底 + 星尘（CSS 径向渐变，0 成本，立即拉开层次）。
2. **材质层**：面板/节点改半透明玻璃（`backdrop-filter` + 内高光 + 1px 内描边，诚实标注为 web 近似）。
3. **光即语义 + 签名动作**：状态顶边改 LED；聚焦时依赖链紫光流动；运行中的边带绿色流光。

---

## 2. 三个创意方向（审美锚点 + 反 AI 味纪律）

| 方向 | 锚点 | 一句话 | 签名动作 | 风险 |
|---|---|---|---|---|
| **A 光之星座** | 星图 / 神经网 | 任务=发光节点，依赖=光流，成员=像素小人站星图 | 聚焦时依赖链光在流 | 低 |
| **B 液态玻璃** | Apple Liquid Glass（web 近似） | 全玻璃面板 + 折射内高光，深景深 | 玻璃折射层次 | 中（易滥用） |
| **C 微缩办公室** | 等距小世界 / 沙盘 | 像素办公室立体化，任务=房间，进度=灯逐一亮 | 会动的 diorama | 高（工程量大） |

### 2.1 推荐：方向 A「光之星座」

理由：① 与「任务 DAG + 依赖」功能天然同构（图 = 星座）；② 最「华丽」（光的层次最足）；③ 保留像素小人品牌；④ AI 味风险最低（单紫强调 + 状态 LED + 光只用于语义）。

方向 B / C 的 token 与组件规范见附录，可作后续皮肤，不在本次展示图落地。

---

## 3. 设计 Token（光之星座）

> 全部定义于 `:root` 单点，业务只引变量。DSH 别名映射深空，发光调色板为 `--px-*`。

```css
:root {
  /* DSH 别名（chrome 深空） */
  --dsw-alias-bg-base: #0a0c14;
  --dsw-alias-bg-layer-1: #12151f;
  --dsw-alias-bg-layer-2: #181c28;
  --dsw-alias-bg-overlay: rgba(16, 18, 28, 0.82);
  --dsw-alias-label-primary: #e8ecf6;
  --dsw-alias-label-secondary: #8b94a8;
  --dsw-alias-border-l1: #262c3a;
  --dsw-alias-border-l2: #1a1f2b;
  /* 发光调色板 */
  --px-violet: #7c5cff;                 /* 唯一强调色 */
  --px-glow: rgba(124, 92, 255, 0.55);  /* 聚焦辉光 */
  --px-line: #2c3346;                   /* 依赖边（中性） */
  --px-glass: rgba(24, 28, 40, 0.72);   /* 玻璃节点 */
  /* 语义 LED（状态专用，非装饰） */
  --px-green: #16a34a; --px-blue: #3b82f6; --px-amber: #f59e0b;
  --px-red: #ef4444;  --px-slate: #64748b;
  /* 材质 */
  --px-inner-hi: inset 0 1px 0 rgba(255,255,255,0.07);
  --px-inner-ring: 1px solid rgba(255,255,255,0.09);
}
```

**纪律（反 AI 味硬门）：**
- 全页强调色只一个：紫 `#7c5cff`；绿/蓝/琥珀/红只作为**状态 LED 语义色**。
- 辉光只出现在：聚焦/固定（紫）+ 运行中（绿脉冲）。默认节点无辉光。
- 玻璃只用一层（面板 + 节点），不叠加金属/噪点。
- 形状锁：锐角 2px（保留像素 DNA），全页不混圆角。

---

## 4. 组件规范

### 4.1 氛围层（背景）
- 深空底 `#0a0c14` + 两团极低透明度径向渐变（紫 14% / 蓝 10%）。
- 星尘：`body::before` 固定层，4 组 1px 白色径向点，`opacity .5`，`pointer-events:none`，`z-index:0`，内容 `z-index:1`。

### 4.2 材质层（面板 chrome）
- `.panel` / `.panel-head` / `.panel-toolbar`：半透明玻璃 `backdrop-filter: blur(12px)` + `inset 0 1px 0 rgba(255,255,255,0.07)` 内高光 + `1px solid rgba(255,255,255,0.08)` 内描边。

### 4.3 信息层（任务节点 = 玻璃芯片 + LED）
- 节点：玻璃底 `--px-glass` + 1px 内描边 + 顶部 2px 状态 LED 条（语义色）。
- 运行中节点：额外一圈绿辉光 + 2s 呼吸（`@keyframes`，`prefers-reduced-motion` 下关闭）。
- 聚焦/固定（`.is-lit` / `.is-pinned`）：紫辉光 `box-shadow: 0 0 0 1px var(--px-violet), 0 0 18px var(--px-glow)` + 右上角紫色方形标记。

### 4.4 依赖边（光流 = 签名动作）
- 默认：中性细线 `--px-line`。
- 聚焦链（`.is-lit`）：紫色 + `stroke-dasharray: 6 6` + `dashoffset` 流动动画（光沿链流）。
- 运行中的边（`.is-active`，JS 按端点状态打标）：绿色静态 tint（语义「活」）。
- `prefers-reduced-motion`：关闭所有流动动画，改纯静态紫/绿线。

### 4.5 成员（像素小人站星图）
- 头像沿用现有 SVG 像素小人（品牌不动），领袖头像加一圈淡紫辉光，状态点 = 语义 LED。

---

## 5. 动效规范（motivated，非装饰）

| 动效 | 动机 | 实现 | 减动效 |
|---|---|---|---|
| 聚焦链光流 | 展示依赖上下游 | `stroke-dasharray` + `dashoffset` | 静态紫线 |
| 运行中节点呼吸 | 传达「工作中」 | `box-shadow` 2s 循环 | 静态绿辉光 |
| 视图切换淡入 | 状态变化反馈 | `opacity/transform` 160ms | 立即 |
| 骨架屏 | 加载反馈 | 脉冲透明度 | 静态 |

**禁用项（不碰）：** 无限循环 marquee、鼠标跟随粒子、滚动劫持、`window.addEventListener('scroll')`、自定义光标。

---

## 6. 状态闭环 + 可访问性

- **加载**：骨架屏（形状贴合最终布局）。
- **空态**：无团队 → 引导「去工作角色页签选人 + 一键编排」。
- **错误**：渲染失败 → 红框 + 原因。
- **固定**：点击任务固定，跨视图保留（沿用现有 `applyPinned`）。
- **键盘**：切换器/节点可 Tab 聚焦，带 `aria-label`；1-4 键切视图。
- **对比度**：label-primary `#e8ecf6` vs bg `#0a0c14` ≈ 14:1（AA 达标）。
- **减动效**：所有辉光/流动/呼吸在 `prefers-reduced-motion` 下静态化。

---

## 7. 验收（可执行断言）

- `node --check` 展示图 JS 全过（0 退出）。
- headless Chrome 断言：节点 = 7、依赖边 = 7、4 视图切换、点击固定跨视图保留（`is-pinned`）。
- 强调色唯一性：grep CSS，语义色（绿/蓝/琥珀/红）只出现在 `--px-green/blue/amber/red` 与状态 class 内，紫 `#7c5cff` 为唯一强调。
- 零 em-dash：grep 展示图与文档，em dash 字符计数 = 0。
- `prefers-reduced-motion` 下：无 `animation` 生效。

---

## 8. 不执行边界

- 不改 `lib/index.js`、`src/client.main.js`、`lib/team-engine.js`、`cordis.patch.yml`。
- 不接入真实 `subagents` / 事件流 / 磁盘快照。
- 本方案只产出 `docs/ui-creative-plan.md` + `design/creative.html` + `design/creative.css`。

---

## 附录：方向 B / C 规范摘要（后续皮肤）

**B 液态玻璃**：token 换 `--px-glass-strong: rgba(255,255,255,0.06)` + 双层内描边 + `backdrop-filter: blur(24px) saturate(160%)`；节点圆角锁 16px（打破像素锐角，走精致路线）；签名 = 玻璃折射高光；风险 = 玻璃滥用，需 `prefers-reduced-transparency` 兜底。

**C 微缩办公室**：把 DAG 映射到等距网格（`transform: rotateX/rotateZ` 或 SVG isometric），任务 = 房间块，成员 = 会移动的像素小人，进度 = 房间灯逐一亮起；签名 = 会动的 diorama；风险 = 布局/交互工程量最大，建议 Canvas 2D 而非 DOM。

---

## 9. 定位方案（DSH Slot 实测，据实定义）

> 依据：`cordis_inspect_query` 实测 DSH Web Client 的 Slot 树。

| Slot | kind | scope | replaceRisk | 结论 |
|---|---|---|---|---|
| `shell.overlay` | list | root | none | 悬浮层板挂载点，允许多条目、frame 级、在滚动容器外 |
| `details` | single | session | shadows-shipped-ui | 右侧详情栏，single 单座，已被工具详情占用 |
| `sidebar` | single | root | shadows-shipped-ui | 左栏会话浏览器 |
| `conversation.view` | list | session | none | 会话视图（工作角色 tab 即此），可加 tab 但会切掉聊天 |
| `conversation.session.header.utilities` | list | session | none | 会话头右对齐工具，放「团队」开关按钮 |
| `conversation.input.dock` | list | session | none | composer 上方 ambient，放紧凑进度条 |

**决策：用 `shell.overlay` 悬浮层板，右缘吸边 + 折叠成窄条，等效「右侧栏收放」。**

理由：DSH 没有可自由挂载的第二右侧栏（`details` 是 single 单座、被 shipped 工具详情占用，替换会 shadow 系统 UI）；`shell.overlay` 是 list + none 风险，允许多条目、跨会话常驻、可拖拽/折叠/缩放，且现有像素办公室已在用同一个 slot（同构一致）。「收放」由 overlay 组件自身实现：拖到右缘吸边，折叠成 40px 窄条只留「展开」按钮。

**入口与状态条**：`session.header.utilities` 放「团队」开关按钮（开/关 overlay）；`conversation.input.dock` 放一条「团队进行中 N 项」紧凑进度条（不占主面板）。

---

## 10. 单一主视图 + 空间优化

- 只保留**泳道 DAG 一个「主视图」**，删除 4 视图切换器（去掉冗余选择，聚焦一个高价值视图）。
- 空间优化：
  - 右侧成员栏默认**可折叠**，折叠后 DAG 占满宽度。
  - 工具栏腾出的空间放**状态筛选**（5 段）+ 缩放 + 折叠开关。
  - 面板整体可**折叠成窄条**（等效右侧栏收放），把聊天区还给主对话。
  - DAG 支持**缩放**，大团队（50+ 任务）不挤压。

---

## 11. 可控交互清单（提升 UX）

| # | 交互 | 动机 | 实现 |
|---|---|---|---|
| 1 | 状态筛选（全部/进行中/阻塞/待办/完成） | 只看关心的状态 | 5 段 segmented，隐藏不匹配任务与边 |
| 2 | 点击成员 → 只看该成员任务 | 快速定位责任人 | 切换高亮，其余变暗 |
| 3 | 折叠成员栏 | 回收宽度给 DAG | 一键 toggle |
| 4 | 缩放 DAG | 大团队不挤压 | `transform: scale` |
| 5 | 点击任务固定 + 详情卡 | 深看单任务 | 右侧详情卡：负责人/模型/依赖完成态 |
| 6 | 面板折叠成窄条 | 等效右侧栏收放 | header「收起/展开」 |
| 7 | 键盘：←→ 切任务焦点，Enter 固定，Esc 清除，1-5 状态筛选 | 不摸鼠标也能用 | keydown 映射 |
| 8 | （后续）暂停/恢复团队、阶段切换（草稿/运行） | 映射引擎 `halt`/`resume` | 接 `agents_pixe_team_*` 工具 |

**原则**：每个控件都对应一个真实功能（筛选=状态字段、固定=任务详情、折叠=空间、缩放=规模），不造「好看但没用的按钮」。
