# Bundled role catalog

This directory ships the full role catalog from The Agency (`msitarzewski/agency-agents`)
+ `agency-agents-zh` (`jnMetaCode/agency-agents-zh`), 508 cards in total.

| File | Size | Format | Purpose |
| --- | --- | --- | --- |
| `roles.json` | ~190 KB | `{ id, name, emoji, color, desc, div }` per card | Compact catalog the floater loads to render member cards and the role grid. |
| `roles-full.json` | ~7.1 MB | `{ id, name, emoji, color, desc, identity, mission, criticalRules, deliverables, communicationStyle, workflow }` per card | Full markdown body that the captain passes to `agent_teams_add_member.executionPrompt` so each spawned sub-agent boots with the role's identity baked in. |

The host serves `roles.json` via `/plugins/agent-teams-pixel/roles` and
`roles-full.json` via `/plugins/agent-teams-pixel/role-identity?key=...`.
Both files are loaded once at floater startup; no per-card round trips.

To regenerate the catalog (e.g. upstream merged new roles):

```sh
# en — github.com/msitarzewski/agency-agents
git clone https://github.com/msitarzewski/agency-agents /tmp/agency-agents
# zh — github.com/jnMetaCode/agency-agents-zh
git clone https://github.com/jnMetaCode/agency-agents-zh /tmp/agency-agents-zh
AGENTS_PIXE_EN_ROOT=/tmp/agency-agents \
AGENTS_PIXE_ZH_ROOT=/tmp/agency-agents-zh \
  node scripts/regenerate-catalog.mjs
```

(The regeneration script is intentionally not bundled — we follow the
`dsh-ui-agents-pixe` release cadence for upstream catalog updates, which
has not changed in v0.1.x. If upstream ships new roles we will refresh
in a patch release.)