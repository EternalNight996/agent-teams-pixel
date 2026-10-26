# Changelog

## [Unreleased]

### Changed
- Added the 封神榜 board (bottom bar 榜): sect roll by cultivation, the 15-realm
  ladder with per-realm level ranges and descriptions, the current speaker's
  cultivation card, leveling tips (task/captain/idle formulas, first-seen
  back-pay, mount cadence) and the three-part sect story. Realm ranges and copy
  are derived from shared cultivation/data modules, with 1..9999 coverage tests.
- Cultivators, desks, focus artifacts, name plates, level badges, hit areas and
  floating effects were miniaturized (~56px figures, 72×17 desks) while keeping
  the hanfu details; non-crowned cultivators now default to long hair.
- Removed the 天机阁 level-test jump buttons (and the xpForLevel/setCultivationXp
  backdoor); progression comes only from tasks and idle cultivation.
- Fixed desk-front leg clipping, the floating incense burner, oversized props
  after scaling, and flying label/badge/hit-area alignment.
- Mounted cultivators keep their legs still (walking gait only plays on foot);
  every mount family now has its own model: spirit beast, crane, qilin, jiao,
  dragon, phoenix and dao beast, selected from the 天机阁 item.
- Cultivator clothing was reworked toward Chinese hanfu: cross-collar 交领右衽,
  wide sleeves with contrast cuffs, sash with ribbons and jade pendant, cloth
  boots with pale soles, and a gold hair crown/hairpin.
- Progression is level-scaled and avoids both runaway and stalled leveling:
  xpNeed = round(60 × level^1.2), task xp = 60 + 15×level, idle xp per 10s =
  1 + floor(level/10), with captain task xp scaled similarly.
- 传音阁 is removed from the wall menu and the bottom bar (four facilities now:
  藏经阁 / 山门 / 功德碑 / 天机阁). Captain↔member messages still appear live in the
  conversation team card.
- XP is shown as integers only (no decimal tail), and idle cultivation now settles
  once every 10 seconds (+1 XP) instead of ticking continuously; each settlement
  pops the green +1 above the open character. Offline idle is capped at 1 hour.
- 名册的历史宗门列表 now includes a green 当前 entry for the live sect (selectable,
  marked 当前); historical runs remain selectable for their historic roster, while
  the live detail stays in 宗门进度 to avoid duplicating it again.
- 法器、坐骑、技能 now equip independently in the inventory (three separate
  selections instead of one global slot).
- Added the 天机阁 wall facility (and a bottom-bar entry) that opens the gear
  sheet; the wall now holds five facilities inside the same 520px world.
- Selected mounts are always rendered for idle cultivators (even at their desk),
  and equipped artifacts/skills add visible floating-blade / spirit-ring effects.
- 归栏 and 配置 objects moved upward on the courtyard so they no longer sit on
  top of the cultivators.
- The cultivation ladder now follows the full 凡人流 hierarchy across the 9999
  level cap: 凡人 → 炼气 → 筑基 → 结丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫
  → 真仙 → 金仙 → 太乙 → 大罗 → 道祖.
- Inventory unlocks extend through every realm: 法宝/灵宝/仙器/真仙器/道器,
  蛟龙/仙鹤/麒麟/真龙/凤凰/道兽, and skills 剑气/丹火/婴火/神通/领域/法相/仙术/
  道法. Level-test presets now jump to the realm boundaries.
- Clicking a cultivator's overhead level badge (or the hall's identity chip) opens
  an equipment sheet with a game-style inventory grid: 法器 / 坐骑 / 技能 slots
  show their unlock level, a 🔒 when locked and a golden ✓ when equipped.
- Selecting an unlocked 坐骑 immediately switches the scene form; 法器/技能 are
  passive but show as equipped in the grid.
- The level cap is now 9999 with wider realm bands; level-test presets cover
  Lv.1/3/5/8/10/15/20/50/100/500/9999.
- Items unlock throughout the progression: 桃木剑/灵剑/灵宝/仙器/神器, 飞剑/灵兽/
  仙鹤/麒麟/神龙, and skills 灵光/灵盾/剑阵/御风/法相.
- Creating a sect while another exists no longer auto-deletes the current team:
  the wizard asks to replace, and replacement is refused while any task is
  pending/running, so a live run (and its trail) can no longer be wiped by a
  surprise archive.
- Idle/completed cultivators keep moving even in short panels: without a
  courtyard they pace beside their desks instead of standing still.
- Cultivation is now global and persistent: XP is stored per member name and per
  sect captain in localStorage, so 魔修's level follows them across sects/sessions
  while different sect captains keep separate levels.
- XP sources: completing a task gives 60 (historical completions settle once),
  the captain earns 40 per completed sect task, and idling gives 0.25/min — but
  only for the character whose conversation is currently open.
- Full progression added: 20 levels, seven realms (炼气→筑基→金丹→元婴→化神→炼虚→
  大乘), and unlock milestones at Lv.2 灵光护体, Lv.3 本命法器, Lv.5 御剑术,
  Lv.7 护体灵盾, Lv.8 驭兽术, Lv.10 灵宝 (shown in the level-chip tooltip).
- Gaining XP pops a green "+N" above the head; levelling up adds a golden ring,
  sparks and an "升级！Lv.N" banner.
- The overhead level badge is now a light-green chip with a small XP bar toward
  the next level, instead of the old dark pill.
- Completed/idle cultivators keep their cultivation state (wandering, sword or
  beast): once tasks are done, double-clicking an eligible cultivator cycles
  auto → 御剑 → 坐骑 → 步行; low-level or busy cultivators still hop instead.
- 山门·名册 keeps an 开宗立派 entry even after the sect has run tasks: opening it
  stages a new sect, and the wizard's replace flow takes over when a team already
  exists, so a finished run no longer dead-ends the hall.
- Every pixel person now shows a small "Lv.N 境界" badge above their head; task
  and chatter bubbles shift up so the badge never covers them.
- The active-conversation marker is now much louder: a floating 对话中 tag beside
  the character, a stronger teal/gold aura and a glowing name plate.
- Double-clicking a pixel person makes them hop in place (single-click still
  opens their conversation).
- Idle cultivators wander the courtyard; from Lv.5 they ride a flying sword and
  from Lv.8 a divine beast, driven by the same cultivation levels.
- Removed the redundant 查看宗门 entries (header button and conversation-card
  button); 开宗立派 stays as the only header action.
- The active cultivator is now marked with a soft teal (member) / gold (captain)
  aura and a glowing name plate instead of the previous brackets/rings, and the
  宗门进度 member/captain cards show 对话中 for the open conversation.
- Added a cultivation system: completed tasks and days in the sect accumulate
  XP; each member (and the captain) shows Lv.N + 境界 on their card, with
  XP/next-level in the tooltip.
- The cultivator whose conversation is currently open is now marked in the scene:
  a breathing teal (member) or gold (captain) foot ring plus corner brackets,
  and the name plate state reads 对话中 instead of 静修. Clicking another pixel
  person moves the marker with the conversation.
- Status labels agree again: when every task is completed, 道统 shows 已完成 and the
  captain in the scene stops showing 修炼中 (both used to follow phase=running).
- The 宗门进度 sheet header now has a ＋新建任务 button: it returns to the main
  conversation and focuses the composer, where telling the captain the task is
  the supported way to add one.
- The hall header shows whose conversation is open: a gold 掌门·主对话 chip or a
  teal {name}·修士对话 chip.
- 山门·名册 marks the live sect with a green 当前 banner and tags archived runs
  as 历史; selecting a past run shows its historic roster/state.
- Clicking the 掌门 in the hall scene (or the 掌门 card in 宗门进度) now returns to
  the captain's main conversation instead of opening a member transcript.
- The main-chat team card also lists the latest task start/completion events
  alongside the captain↔member messages, so a task starting is visible in the
  conversation in real time.
- 山门·名册 no longer duplicates the live 宗门进度 member cards: it is now a
  history sheet listing archived sect runs (with their historic roster) plus the
  current sect's finished tasks.
- The team card in the main conversation now streams recent captain↔member
  mailbox messages (latest 12, refreshed by the one-second activity snapshot), so
  the interaction between the captain and the cultivators shows up live in the
  chat instead of only inside the hall.
- 宗门进度 no longer draws the separate task-dependency graph: each member card
  now carries its own progress bar and a "交给 {name} · {task}" handoff line, so
  the panel content itself shows who works on what, how far along it is and who
  receives the result next (the scene above already shows the live activity).
- Closing the post-founding 道统配置 review with × now jumps straight to the
  宗门进度 sheet (opening another facility simply leaves review mode).
- A 修士 child session no longer shows an empty hall: the overlay resolves the
  team that owns the session by member session id and keeps showing that team's
  task progress; member navigation uses the captain session as the parent, so
  clicking another cultivator from a child session still opens the right
  transcript.
- After 开宗立派 succeeds, the hall waits for the new team to land and then opens
  the 道统配置 (team config) sheet automatically, so the founder can review the
  roster and doctrine right away instead of the wizard just closing.
- The 开宗 wizard's 修士 chips now show the embedded pixel portrait for each
  role (preset roster, selected roles, the role picker and the oath summary);
  custom roles fall back to an initial-letter badge.
- The wizard's decision bar (取消 / 上一步 / 下一步) is pinned flush to the bottom
  edge of the sheet; the sheet keeps a fixed height equal to the hall panel, so
  switching steps never resizes it.
- 开宗立派 now renders inline in the hall's left-hand content sheet, exactly like
  功德碑/进度 — the header 开宗 button opens that sheet too, and there is no
  standalone quick-start modal any more.
- The 开宗 doorway transmission gained layered counter-rotating arcs, spiralling
  pixel motes, a soft membrane and a bright core, so it reads as a portal with
  depth instead of a flat spinner.
- All hall content sheets open at the hall panel's top-left and share its fixed
  height (viewport-bounded), so 面板配置 / 名册 / 道统 / 进度 / 收信 / 开宗 line up with
  the panel instead of shrinking per content. Sheet text is scaled up (zoom 1.3,
  15px title) and the 道统 template grid stretches to fill the remaining height
  instead of leaving a dead band above the decision bar.
- The 开宗 gate is back to the wooden 山门 silhouette; its doorway now carries a
  rotating transmission (two counter-rotating rune rings plus a pulsing centre).
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
