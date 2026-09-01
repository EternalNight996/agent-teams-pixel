# Changelog

## v0.1.6 — 2026-09-01

- Resume / rebuild archived teams via `↻ 恢复运行` button on the floater + `/plugins/agent-teams-pixel/resume-team` endpoint. Captain decides between `agent_teams_resume` (halted) and re-create (archived).
- Bundle purity gate widened: `tsdown.config.ts` adds session + settings peers to `CLIENT_EXTERNALS`.
- **End-to-end build verified** — `tsdown` produces a 52 KB IIFE registered as `window.__ModuleLoader__.load({ id: '@eternal-night/agent-teams-pixel' })`.

## v0.1.5 — 2026-09-01

- Settings namespace `agent-teams-pixel` — `{ collapsed, includeArchived }` registered host-side, bound client-side.
- Keyboard shortcuts — `Alt+O` toggles floater, `Alt+R` jumps to working-roles tab.
- Retry button on floater error banner.
- Archived teams toggle (`📦 仅活跃 / 含归档`) on floater.
- Clear recent-presets chip in working-roles tab.

## v0.1.4 — 2026-09-01

- `/plugins/agent-teams-pixel/team` now returns `inbox` JSONL alongside the team body.
- `TaskDag` widget — SVG layout by longest dependency path; status colored; click → output fold.
- `InboxPanel` — 5 most-recent captain inbox messages.
- `TaskOutputFold` — modal showing one task's full output (truncated to 4 KB).

## v0.1.3 — 2026-09-01

- Live `ctx.sessions` subscription replaces `window.__DSH_ACTIVE_SESSION__` fallback.
- `TaskProgressBar` aggregates per-status counts + quality-gate round.
- Recent-presets localStorage with cap 5 + corruption-safe parse.

## v0.1.2 — 2026-09-01

- 29 bundled team presets in `src/host/team-presets.ts` + `/plugins/agent-teams-pixel/presets` route.
- `/plugins/agent-teams-pixel/role-identity` returns the agency-agents full role card markdown for a role id.
- `/plugins/agent-teams-pixel/start-team` — POST injects a structured prompt into the captain's next turn.
- "🚀 一键组队" panel on the working-roles tab.

## v0.1.1 — 2026-09-01

- Floater polls `@nanmicoder/dsh-agent-teams`' `/plugins/dsh-agent-teams/state` for live data, falling back to our own list-only route.
- `/plugins/agent-teams-pixel/request-help` resolves the captain from `ctx.agents` and injects a follow-up via `captain.followup(createUserMessage(...))`. If the captain is offline the request queues with `live: false`.
- Escalated teams flip the floater title bar red.

## v0.1.0 — 2026-09-01

- Captain-led multi-agent backend (relay from `@nanmicoder/dsh-agent-teams`).
- 508 role cards bundled in `assets/agent-teams-pixel/roles-full.json`.
- Pixel office floater (`shell.overlay`) with 5 member states (idle / typing / walking / done / error).
- Working roles tab (`conversation.view`) with searchable role catalog + per-role detail modal.
- 13 host endpoints under `/plugins/agent-teams-pixel/*`.
- 15 / 15 unit tests passing.