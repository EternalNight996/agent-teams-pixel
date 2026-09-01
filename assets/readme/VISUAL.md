# Visual reference

The plugin ships without rendered screenshots; the reference images live on the
[dshfind listing](https://dshfind.com/en/plugins/eternal-night/agent-teams-pixel)
once the package is published.

What you should see on first install (described top-to-bottom in the right
floater):

1. **Title bar** — `🏢 像素办公室 · 1` (collapsed) or `· 1` (expanded). Red
   background when any team has `escalated === true`.
2. **Canvas** — a row of pixel-art people, one per member. Heads bob / arms
   wave on `typing / walking` state. A badge above the head shows `●` for
   active, `✓` for done, `✕` for error.
3. **Progress bar** — 4 segments coloured green / amber / slate / red. A
   summary line below lists `✅ N 🔧 N ⏳ N ✕ N` plus quality-gate round
   indicator `🔁 第 N 轮` when applicable.
4. **Team list** — click to load that team's Task DAG and inbox panel.
5. **Task DAG** — SVG layout by longest dependency path. Status-colored
   nodes; click to open the output fold.
6. **Inbox panel** — 5 most-recent captain inbox messages, newest first.
7. **Action buttons** — `🔄 刷新办公室`, `📦 仅活跃 / 含归档`, `↻ 恢复运行`
   (only when archived toggle is on), `➕ 申请增配`.

The working-roles tab (Alt+R):

1. **🚀 一键组队 panel** — preset dropdown + goal textarea + `启动团队`
   button. Below the textarea the 5 most-recent presets are chips with a
   `清空` button on the right.
2. **Role grid** — 60 cards per page, name + emoji + colour swatch + one-
   line description. Click a card to open the role detail modal.
3. **Search box** — filters by name or description; `中 / EN` button to
   toggle locale.

The settings section (`设置 → 像素办公室`):

1. **默认收起浮层** — checkbox, defaults to true.
2. **含归档团队** — checkbox, defaults to false.
3. **快捷键提示** — `Alt+O 切换浮层，Alt+R 跳到工作角色页签`.
4. **清空最近使用预设** — pink button.