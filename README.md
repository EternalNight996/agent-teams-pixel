# agent-teams-pixel

A DeepSeek Harness plugin that fuses [`@nanmicoder/dsh-agent-teams`](https://github.com/NanmiCoder/dsh-agent-teams)' captain-led multi-agent backend with [`dsh-ui-agents-pixe`](https://github.com/EternalNight996/dsh-ui-agents-pixe)' 508-role pixel office. The captain decomposes work, dispatches members, watches their live state in the pixel canvas, and loops back when delivery is incomplete — without the user lifting a finger.

[![npm version](https://img.shields.io/npm/v/agent-teams-pixel)](https://www.npmjs.com/package/agent-teams-pixel)
[![npm package size](https://img.shields.io/npm/unpacked-size/agent-teams-pixel)](https://www.npmjs.com/package/agent-teams-pixel)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

```
┌─────────────────────────────────────────────────────────────────┐
│                       DSH Web (browser)                         │
│  ┌───────────────────────────┐  ┌────────────────────────────┐ │
│  │  工作角色 tab               │  │  像素办公室浮层              │ │
│  │  · 508 角色卡              │  │  · Canvas 2D 像素人          │ │
│  │  · 一键组队 (29 预设)       │  │  · 任务 DAG                  │ │
│  │  · 最近使用预设             │  │  · Captain inbox             │ │
│  │  · 详情弹窗                 │  │  · 任务产出折叠              │ │
│  └─────────────┬─────────────┘  └─────────────┬─────────────┘ │
│                │  ⌨ Alt+R                  ⌨ Alt+O              │
└────────────────┼─────────────────────────────┼─────────────────┘
                 │                             │
                 ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DSH Host (node)                           │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  agent-teams (13 tools, scheduler, durable state)         ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │  pixel-integration                                          ││
│  │  · /roles /presets /role-identity /team /state               ││
│  │  · /start-team /request-help /resume-team                   ││
│  │  · settings.register('agent-teams-pixel', ...)              ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Install

```sh
dsh plugin --profile web add agent-teams-pixel
```

Or directly with npm (used by `dsh plugin add` under the hood):

```sh
npm install -g agent-teams-pixel
```

From a local checkout:

```sh
dsh plugin --profile web add F:\MyApp\eternal\agent-teams-pixel
```

> Listing on [npm registry](https://www.npmjs.com/package/agent-teams-pixel) — current published version: `0.1.8`.

Requires **DeepSeek Harness `0.1.2-alpha.2`** (same baseline as `dsh-agent-teams`).

## What it does

### Captain-led delegation

The active session becomes the captain of a multi-agent team. One goal, one team. The captain reads its `agent-teams:usage` system prompt, decomposes the goal, dispatches members, monitors progress, and ships the final report.

### 29 one-click team presets

`研发 / 科学 / 航天科研 / 营销 / 安全 / 设计 / 财务 / 游戏开发 / 供应链 / 测试质量 / 产品 / 销售 / 地理信息 / 空间计算 / 医疗 / 付费媒体 / 支持 / 法律 / 运营 / 数据 / DevOps / AI 研究 / 网络安全 / 移动开发 / 前端 / 后端 / 写作 / 教学 / 区块链` — mirrored from upstream `@dsh-ui-agents-pixe`.

### Live pixel office

A right-side floater with a Canvas 2D pixel person per member. 5 states: `idle / typing / walking / done / error`. Live data polled from `@nanmicoder/dsh-agent-teams`' `/plugins/dsh-agent-teams/state` route (falls back to our own).

### Request more help

The `➕ 申请增配` button POSTs to `/plugins/agent-teams-pixel/request-help`; the host resolves the captain from `ctx.agents` and injects a follow-up message that prompts the captain to call `agent_teams_add_member`. If the captain is offline (page refresh, archived session) the request queues with `live: false`.

### Resume / rebuild archived teams

The `📦 含归档` toggle surfaces teams whose state was archived. The `↻ 恢复运行` button POSTs to `/plugins/agent-teams-pixel/resume-team`; the captain calls `agent_teams_resume` (halted) or recreates the team from the archived `team.json`.

### Dependency-aware tasks

Members run in parallel where their dependencies allow. The captain controls dispatch via `dependencies` on each task; the office renders a live SVG DAG so the user sees *why* something is blocked.

### Persistent across restarts

- **Team state**: `<workspace>/.agent-teams/<teamId>/team.json` + `inbox/*.jsonl` (captain handles).
- **Settings**: `agent-teams-pixel` namespace (`{ collapsed, includeArchived }`) — the host settings document; survives reloads and restarts.
- **Recent presets**: `localStorage['agent-teams-pixel:recent-presets:v1']` (cap 5).

## Keyboard shortcuts

- `Alt+O` — toggle the pixel office floater.
- `Alt+R` — jump to the working-roles tab.

The bindings ignore Cmd / Ctrl / Shift combos and skip when the focused element is a text input.

## Settings panel

`设置 → 像素办公室` exposes the two persisted toggles (default-collapsed floater, include-archived teams) plus a "clear recent presets" action.

## Tests

```sh
node --test test/leader-loop.test.mjs \
            test/pixel-mapping.test.mjs \
            test/persistence.test.mjs \
            test/e2e-demo.test.mjs \
            test/pixel-routes.test.mjs \
            test/captain-wiring.test.mjs \
            test/presets-wiring.test.mjs \
            test/session-integration.test.mjs \
            test/dag-inbox.test.mjs \
            test/shortcuts-settings.test.mjs \
            test/resume-archive.test.mjs
```

**63 / 63 passing** (current). Covers: leader-loop assignment + topological order, 5 pixel states, team.json / inbox.jsonl round-trip, end-to-end demo, all host routes' payload shapes, captain follow-up wiring, preset catalog, live session binding, Task DAG layout, keyboard shortcuts + settings round-trip, archived team resume.

## Build

```sh
pnpm install --legacy-peer-deps   # alpha.2 peers require legacy
pnpm build
```

Produces:
- `lib/index.js` — host-side plugin entry (registers tools + endpoints + settings namespace).
- `lib/client.js` — 52 KB IIFE bundle, registered as `window.__ModuleLoader__.load({ id: '@eternal-night/agent-teams-pixel' })`.
- `lib/types/**/*.d.ts` — TypeScript declarations.
- `lib/client/{index,office-state,pixel-canvas}.js` — per-file ESM mirror of the IIFE entry.

## Architecture notes

The plugin is a relay between two upstream projects:

- `@nanmicoder/dsh-agent-teams` owns the durable team state machine (captain, members, tasks, dependencies, messages, quality gates). The pixel office reads `team.json` and inbox JSONL through the same files agent-teams writes.
- `dsh-ui-agents-pixe` owns the 508-role catalog and the pixel-canvas concept. The office borrows the catalog (`assets/agent-teams-pixel/roles-full.json`) and the visual language (Canvas 2D + status badges), but the implementation is a compact ~7 KB `pixel-canvas.tsx` written for v0.1.0.

The plugin deliberately avoids duplicating tool/endpoint surface from either upstream. Where pixe already had `/agents-pixe/chat`, that route is *not* re-implemented here — clients that need AI chatter run the upstream plugin alongside.

## Risks & known limits

- **alpha.2 only.** DeepSeek Harness `0.1.2-alpha.2` is the only verified host. Older / newer release trains may have slot names, settings APIs, or session-controller shapes that don't match — install will appear to succeed but the floater will silently fail to render. Pin the host explicitly.
- **Peer install requires `--legacy-peer-deps`.** The 0.1.2-alpha.2 peer set predates npm 7's stricter peer resolution; `pnpm install` or `npm install` both need `--legacy-peer-deps`. The bundled `cordis.patch.yml` does not depend on this, so `dsh plugin add` works regardless.
- **Pixel office polls, not streams.** The floater refreshes team state every 5 s through HTTP polling (mirroring upstream agent-teams' ActivityPanel pattern). For real-time sub-second updates the host would need to expose a WebSocket or SSE route — out of scope for v0.1.x.
- **508 role cards are bundled, not fetched.** `assets/agent-teams-pixel/roles-full.json` ships with the package (~7.1 MB). Upstream catalog refreshes require a patch release; the regeneration script is intentionally not bundled (see `assets/agent-teams-pixel/README.md`).
- **AI chatter route is not re-implemented.** pixe's `/agents-pixe/chat` endpoint is intentionally absent — install `dsh-ui-agents-pixe` alongside if you want pixel-people to talk back to the LLM.
- **Archival recovery is one-shot.** The `↻ 恢复运行` button asks the captain to call `agent_teams_resume` once. If that call fails (e.g. team.json no longer matches the schema), the user gets a normal captain followup and can drive the conversation from chat.
- **No rendered screenshots yet.** The plugin ships without bundled images; see [`assets/readme/VISUAL.md`](./assets/readme/VISUAL.md) for the textual reference of what the floater looks like.

## License

MIT — see [LICENSE](./LICENSE).