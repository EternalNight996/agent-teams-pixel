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
- Tall panes paint the hall floor to the bottom edge instead of floating the
  world in dead bands; rows spread and centre themselves, an incomplete last row
  is centred, and a faint 聚灵阵 gives the courtyard floor structure.

### Added
- `office.facility.*`, `office.action.*Hint`, `office.sceneAria`, `office.rail`
  and `office.closePanel` locale keys (zh/en).
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
