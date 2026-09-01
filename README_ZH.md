# agent-teams-pixel

DeepSeek Harness 插件：把 [`@nanmicoder/dsh-agent-teams`](https://github.com/NanmiCoder/dsh-agent-teams) 的船长带队多 agent 后端，跟 [`dsh-ui-agents-pixe`](https://github.com/EternalNight996/dsh-ui-agents-pixe) 的 508 张角色像素办公室，融合成一个端到端可用的多 agent 协同包。

船长读懂目标 → 拆任务（按角色专长派发）→ 看像素办公室里的实时状态 → 满足交付则汇总上交，否则继续拆或申请增配。**全程主上零介入**。

## 安装

```sh
dsh plugin --profile web add agent-teams-pixel
```

需要 DeepSeek Harness **0.1.2-alpha.2**（与 `dsh-agent-teams` 同基线）。

## 能力

- **船长带队**：当前会话即船长；一个目标，一个团队。
- **508 张角色卡**：随包 `assets/agent-teams-pixel/roles-full.json`，包含 The Agency + agency-agents-zh 全量。
- **像素办公室浮层**：右侧 `shell.overlay`，Canvas 2D 程序化像素人 + 5 态（idle/typing/walking/done/error）。状态来源：每 5s 轮询 agent-teams 的持久 `team.json`。
- **工作角色页签**：`conversation.view` 槽位，搜索 + 详情弹窗 + 一键"加入团队"。
- **链式分工**：成员按 `dependencies` 排队；空闲成员自动领取 ready 任务；阻塞任务等待前置完成。
- **申请增配**：浮层右上 `➕ 申请增配` 按钮 → host 端 `/request-help` 接单 → 船长下一轮触发 `agent_teams_add_member` 加人。
- **跨重启持久**：`<workspace>/.agent-teams/<teamId>/team.json` + `inbox/*.jsonl`。

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                       DSH Web (browser)                         │
│  ┌────────────────────────────┐  ┌───────────────────────────┐   │
│  │  working-roles tab          │  │  shell.overlay (像素       │   │
│  │  (conversation.view)        │  │  办公室浮层 + 详情弹窗)     │   │
│  └─────────────┬──────────────┘  └─────────────┬─────────────┘   │
│                │  GET /plugins/.../roles        │  每 5s poll    │
│                │  GET /plugins/.../team         │                │
└────────────────┼─────────────────────────────────┼───────────────┘
                 │                                 │
┌────────────────▼─────────────────────────────────▼───────────────┐
│                       DSH Host (node)                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  agent-teams host layer (13 tools + scheduler + state)     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  pixel-integration layer (/roles /state /team /request-help)│ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 船长领导协议

1. **拆任务**：读目标，按角色专长分配 `assignee`（工程师→实现、评审员→review），构造 `dependencies` 图。
2. **派任务**：调度器把 ready 任务分给空闲成员；阻塞任务排队。
3. **监控**：通过 `agent_teams_status` + 像素办公室观察每个成员的 `agent-teams/*` 事件流。
4. **判交付**：所有必做任务 completed 才交付；否则开新任务或重启失败的。
5. **交付或返工**：满足则汇总交给主人，`agent_teams_delete` 收尾；若人手不足，调用 `agent_teams_add_member` 加角色。

主上不介入全部流程，除非 quality-gates 给出 `needs_revision` 判定，船长升级到主人处定夺。

## 验证

```sh
node --test test/leader-loop.test.mjs \
            test/pixel-mapping.test.mjs \
            test/persistence.test.mjs \
            test/e2e-demo.test.mjs
```

15 / 15 通过，覆盖：船长分配算法 + 拓扑序、6 种任务态 → 5 种像素态、team.json/inbox.jsonl 往返、端到端 demo 协议。

## 构建

```sh
pnpm install && pnpm build
```

产出 `lib/index.js` `lib/client.js` `lib/types/` `cordis.patch.yml`。

## 许可

MIT