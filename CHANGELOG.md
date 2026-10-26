# Changelog

## [Unreleased]

### Changed
- The 山门洞府 is now the team tab itself: the wall's four facilities (藏经阁 /
  山门 / 功德碑 / 传音阁) open the setup, roster, progress and inbox sheets, so the
  permanent header, board column, member chips and inbox row no longer consume
  page height. History pages keep the old board/setup switch.
- The wall is a real menu: facilities get hover outlines, labelled wooden tags,
  live counts (progress on 功德碑, unread badge on 传音阁) and pointer cursors. The
  floater only enables the 功德碑 (board) facility.
- The wall tags now carry a trailing › and a hover cursor; hovering a cultivator
  draws gold corner brackets around the desk, and the action tooltip opens below
  the pointer so it cannot be clipped at the wall.
- Tall panes paint the hall floor to the bottom edge instead of floating the
  world in dead bands; rows anchor under the wall, an incomplete last row is
  centred, and a faint 聚灵阵, stone lanterns, an incense burner, drifting qi
  motes and a lotus pond (with koi, ripples and reeds) give the courtyard floor
  structure.
- The hall stops at a 640px-tall card and centres in the tab instead of
  stretching into an endless canvas.
- Facility panels are now one floating dialog: it floats over the still-visible
  hall, is dragged by its title bar (⠿ grip, clamped to the stage), resized from
  the bottom-right corner, and reopens centred each time. A light scrim still
  closes it on an outside click, and Esc/× work as before. Content size no
  longer has to fight the canvas size.
- The floating dialog is portaled to `document.body` and fixed to the
  **bottom-right corner of the whole DSH window** (560px wide, 16px inset,
  z-index 12000) — it is no longer confined to the right-pane tab, stays above
  the hall, is dragged by its title bar, resized from the corner, and remembers
  its offset/size in localStorage (`agent-teams-pixel.sheetRect`, re-clamped to
  the viewport on every open).
- Sheets animate in, take focus as a dialog on open (not the ×), close on Esc /
  the scrim / ×, and the plan/setup sheet hugs its content instead of leaving a
  blank column.

### Added
- 开宗立派改为**四步向导**：道统（8 个模板卡）→ 立派之志（目标 + 字数 +
  Ctrl/⌘+Enter 快捷进入下一步）→ 宗门（随机重抽 / 预设 / 自定道途）→ 立誓（道统、
  宗门、首批修士、立派之志的名录预览 + 立誓说明）。步骤条可回看已完成步骤，
  上一步/下一步按步校验（志向至少 2 字、自定道途至少 1 名修士），立誓后仍只生成
  草案，批准才开工。洞府里的两处「开宗」入口与对话头部按钮共用同一个弹窗与事件。
- The 宗门协作 tab is gone: the hall is the single surface. The floating panel now
  drags by its header, collapses to a compact one-line container, and carries a
  floor bar with a 传送阵 (dock to the right sidebar), a 面板配置 button (size
  presets: 紧凑/标准/宽大/超大, live size readout, reset position) and a 名册
  toggle. Floor buttons toggle their popover on second click.
- The panel is freely resizable from its bottom-right corner (size persisted in
  `agent-teams-pixel.hallRect`) and starts larger (620×500). Popovers open fully to
  the **left of the panel** with their right edge exactly 8px from the panel's left
  edge (clamped inside the viewport), treating the panel as reserved right-side
  space: a wider panel pushes the dialog further left.
- The hall now carries its own 开宗 entry before a team exists: a primary floor
  button (left of 归栏) and a 开宗 button inside the teamless sheet hint both open
  the conversation's 开宗立派 dialog through a shared window event
  (`agent-teams:open-quickstart`).
- The courtyard now paints the panel-level actions into the pixel scene itself: a
  glowing 传送阵 (left of the array, clear of the tree) docks the hall into the
  right sidebar, and a jade 阵盘 (right) opens panel settings and lights up while
  that sheet is open. Both carry the same › labels as the wall tags and are
  hit-tested ahead of desk areas. Without a team the wall gate reads 开宗 and
  opens the founding wizard, matching the floor button.
- The floor bar mirrors the wall menu: next to 归栏 it now also carries 名册,
  道统, 进度, 收信 and 配置 (config last). A wall fixture and its floor button open
  the same sheet and light each other up; while no team exists, the gate doubles
  as the 开宗 entry. The bar wraps when the panel is narrow.
- The hall chrome reads larger: floor buttons use 14px text with 6px × 12px
  padding and 15–16px glyphs; the header title/meta/collapse control grew too.
- 收起 now shrinks the whole hall into a jade-and-gold 宗门令牌 (gate glyph,
  engraved frame, red tassel). The token scales with the panel preset/resized
  panel: a 460×380 compact panel gives a smaller token, a 1040×760 超大 panel a
  token almost twice the standard one. It can be dragged anywhere in the window —
  its position is remembered separately (`agent-teams-pixel.hallToken`) — and a
  click (not a drag) expands the hall again. Collapsing closes any open popover.
- An expanded hall reserves **two thirds of its width** in the conversation
  column, like the right sidebar does: `html[data-agent-teams-hall-open]` plus
  `--agent-teams-hall-shift` pads `[data-phase='active']`, so changing the panel
  size reflows the chat content instead of covering it. When the right sidebar is
  open, the yield moves to the whole shell frame instead, so the gap sits at the
  far right and the sidebar slides left with the layout.
- The floating hall is persistent by design: it keeps existing for any team in
  the session even when the team has no tasks or every task was cancelled (a
  stopped team still shows its hall), and it is there before any team exists —
  an empty hall with only the captain and a 未开宗 badge. In that teamless hall the
  four wall fixtures and the 名册 button stay actionable: each opens its sheet
  with a 尚未开宗 hint (inbox shows its empty copy) instead of silently doing
  nothing. It no longer depends on the right-sidebar service: closing/reclaiming
  the right column no longer replaces the hall with the legacy panel or drops it.
- 归栏 now minimizes the floating hall to the token and opens the hall page in the
  right sidebar (`sidebar.right.pane.tab`, kind `agent-teams`); clicking the token
  brings the floating hall back and closes that sidebar page.
- The sect hall itself is now a **window-level floating layer**: mounted from the
  shell overlay (so it survives leaving the tab), anchored bottom-right of the
  main content area, collapsible to a one-line bar (state remembered in
  `agent-teams-pixel.hallCollapsed`), with the team name and completion count in
  its header. The 宗门协作 tab now hosts the board (captain / member tree /
  dependency map); wall facilities in the floating hall open the matching
  content dialog at the main area's bottom-right.
- Idle cultivators leave their desks: they stroll the courtyard on a reproducible
  per-seed loop (62% walking, the rest pausing) and return to the desk the moment
  a task starts; desks, incense burners and 本命法器 stay behind.
- Idle cultivators occasionally speak a preset line in a small bubble (eight
  short zh/en lines, one every ~11–18 s per member, never while a task bubble is
  showing).
- A persistent one-line hall hint (bottom-left) plus the first-visit coach line:
  "点修士看会话 · 点墙上设施开面板".
- `office.facility.*`, `office.action.*Hint`, `office.sceneAria`, `office.rail`,
  `office.closePanel`, `office.guide`, `office.teamsHint` and `office.inboxCount`
  locale keys (zh/en).
- A one-time floating coach line (localStorage `agent-teams-pixel.hallGuide`)
  names the four wall facilities and the cultivator desks on first visit.
- `src/client/pixel-office/office-actions.ts`: one shared facility layout for the
  renderer and the React hit surface, with a unit test for non-overlap and
  centre hit-testing.

## [0.3.0-rc.1] - 2026-10-25

Derivative baseline: imported `@nanmicoder/dsh-agent-teams@0.1.26` (MIT) as the
v0.3 code base, then rebuilt the browser half around the pixel office.

### Added
- Pixel-office view (`src/client/pixel-office/`): canvas scene driven by the live
  team snapshot (members / tasks / activity / inbox), with desk layout, working /
  idle / unknown states, task bubble, per-member progress, unread badge and the
  captain crown.
- Right-side AgentTeams pane is a split view: configuration & interaction on top,
  the animated pixel office below; 🏢 collapses the office, and a draggable
  divider resizes it (height persisted).
- `office.*` locale keys (zh/en) for the new surface.

### Changed
- Package identity: `@nanmicoder/dsh-agent-teams` → `agent-teams-pixel` (bundle id
  `agent-teams-pixel`); doctor bin renamed.
- Compatibility: `compatibility.json` recommended host `0.2.1-rc.3`; peer ranges
  extended with `|| 0.2.1-rc.3`; development baseline and pnpm overrides moved to
  `0.2.1-rc.3`.
- README/CHANGELOG/NOTICE: derivative attribution added; upstream badges removed.

### Fixed
- Pixel-office rows overlapped and the last row was clipped: per-frame fit plus a
  two-pass desk/overlay draw order.
- The office was unreachable from the Web GUI: it now lives in the team workspace
  tab, which is the actual Web entry point.

### Verified
- Upstream team lifecycle smoke-tested on DSH 0.2.1-rc.3 (plan → approve → spawn →
  dispatch → complete → delivery).
- In-app screenshots via a headless browser against the running GUI (team pane,
  split layout, office rendering, splitter drag).
- `pnpm build`, host/client typecheck, `doctor`, `compatibility`, `readme-version`
  and the release-metadata suite all pass on the rc.3 baseline.
