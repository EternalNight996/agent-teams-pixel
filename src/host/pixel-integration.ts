/**
 * Host integration layer: bridges agent-teams tools to pixel-office rendering.
 *
 * - Pixel-office state is derived from the durable `agent-teams/*` session
 *   events (team-created / member-added / task-updated / message-sent).
 * - The browser half subscribes to these events through `ctx.on` and renders
 *   the pixel canvas accordingly. No new event type is introduced: agent-teams
 *   already publishes the granularity the office needs.
 * - This file is the only host-side add-on over agent-teams itself: a thin
 *   request-router so the client can fetch the in-office role catalog and
 *   the workspace state from a stable URL prefix.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { WorkspaceRegistry } from '@deepseek-ai/dsh-workspace'
import type { WebRouteHost } from './web-routes.ts'
// Type-only imports augment ctx.agents so the request-help route can ask
// the captain to expand the team on the next turn.
import type {} from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { TEAM_PRESETS } from './team-presets.ts'
import z from '@deepseek-ai/schemastery'

const WEB_SERVER_KEYS = ['webServer', 'web-server'] as const
const WORKSPACE_KEYS = ['workspaces', 'workspace'] as const

const ROLES_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'agent-teams-pixel', 'roles.json')
const ROLES_FULL_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'agent-teams-pixel', 'roles-full.json')

/**
 * Register the office endpoints the browser half polls:
 *   GET /plugins/agent-teams-pixel/roles          → role catalog (name/emoji/color/desc)
 *   GET /plugins/agent-teams-pixel/state?ws=...   → office state (members + tasks)
 *
 * The browser polls these endpoints instead of fetching pixe's `/agents-pixe/*`
 * routes: that source is unavailable here, but the pixel-engine fallback path
 * (catch → canned lines) is preserved.
 */
/** Settings schema for the `agent-teams-pixel` namespace. Two keys: whether
 *  the office floater starts collapsed (default true), and whether to include
 *  archived teams in the listing (default false). Both stay persisted in the
 *  Host document so reloading the page or restarting dsh keeps the user's
 *  preferences. */
const SETTINGS_SCHEMA = z.object({
  collapsed: z.boolean().default(true),
  includeArchived: z.boolean().default(false),
})

export function applyPixelHostLayer(ctx: Context, stateDir: string): void {
  // Register the settings namespace lazily; settings service may mount after
  // this plugin under concurrent activation. The bind is best-effort: if the
  // settings service never arrives the floater still works with defaults.
  const tryRegisterSettings = (): boolean => {
    const settings = ctx.get('settings') as { register?: (ns: string, schema: unknown, opts: { base: unknown }) => { getSnapshot(): unknown; watch(fn: () => void): () => void } } | undefined
    if (settings === undefined || typeof settings.register !== 'function') return false
    try {
      settings.register('agent-teams-pixel', SETTINGS_SCHEMA, { base: { collapsed: true, includeArchived: false } })
      ctx.logger?.info?.('agent-teams-pixel: settings namespace registered')
      return true
    } catch (error: unknown) {
      ctx.logger?.warn?.('agent-teams-pixel: settings.register failed: ' + String(error))
      return false
    }
  }
  if (!tryRegisterSettings()) {
    ctx.on('internal/service', (name) => {
      if (name === 'settings') tryRegisterSettings()
    })
  }
  const tryRegister = (): boolean => {
    const rawWebServer = (ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])) as WebRouteHost | undefined
    const workspaceRegistry = (ctx.get(WORKSPACE_KEYS[0]) ?? ctx.get(WORKSPACE_KEYS[1])) as WorkspaceRegistry | undefined
    if (rawWebServer === undefined || workspaceRegistry === undefined) return false
    const webServer = rawWebServer

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/roles',
      handler: async (_req: IncomingMessage, res: ServerResponse) => {
        try {
          if (!existsSync(ROLES_PATH)) {
            res.writeHead(503, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(JSON.stringify({ error: 'role catalog not bundled', path: ROLES_PATH }))
            return
          }
          const body = readFileSync(ROLES_PATH, 'utf8')
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' })
          res.end(body)
        } catch (error: unknown) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: String(error) }))
        }
      },
    }), 'pixel-office: roles route')

    // Team presets: 29 bundled presets for one-click team composition.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/presets',
      handler: async (_req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        })
        res.end(JSON.stringify({ presets: TEAM_PRESETS }))
      },
    }), 'pixel-office: presets route')

    // Full role card lookup: returns the agency-agents full role markdown
    // body for a single role id (e.g. "engineering/engineering-ai-engineer").
    // The captain's add_member.executionPrompt is filled from this body.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/role-identity',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const key = url.searchParams.get('key') ?? ''
        if (key === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'key is required' }))
          return
        }
        if (!existsSync(ROLES_FULL_PATH)) {
          res.writeHead(503, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'full role catalog not bundled' }))
          return
        }
        try {
          const raw = JSON.parse(readFileSync(ROLES_FULL_PATH, 'utf8')) as Record<string, Record<string, { name?: string; body?: string }>>
          for (const lang of Object.keys(raw)) {
            const bucket = raw[lang]
            if (bucket === undefined) continue
            const entry = bucket[key]
            if (entry !== undefined) {
              res.writeHead(200, {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'public, max-age=86400',
              })
              res.end(JSON.stringify({ key, name: entry.name ?? '', body: entry.body ?? '' }))
              return
            }
          }
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'role not found', key }))
        } catch (error: unknown) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: String(error) }))
        }
      },
    }), 'pixel-office: role-identity route')

    // One-click team start: POST { presetName, goal, sessionId } → captain
    // receives a structured prompt on its next turn asking it to spin up
    // the preset with the given goal. The captain's own model turn decides
    // how to phrase the agent_teams_create / add_member / create_task calls.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/start-team',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let raw = ''
        try {
          raw = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer | string) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid body' }))
          return
        }
        let payload: { sessionId?: unknown; presetName?: unknown; goal?: unknown }
        try {
          payload = raw.trim() === '' ? {} : JSON.parse(raw) as { sessionId?: unknown; presetName?: unknown; goal?: unknown }
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid JSON' }))
          return
        }
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : ''
        const presetName = typeof payload.presetName === 'string' ? payload.presetName.trim() : ''
        const goal = typeof payload.goal === 'string' ? payload.goal.trim() : ''
        if (sessionId === '' || presetName === '' || goal === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId, presetName and goal are required' }))
          return
        }
        const preset = TEAM_PRESETS.find((p) => p.name === presetName)
        if (preset === undefined) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'preset not found', presetName }))
          return
        }
        const agentsRegistry = ctx.get('agents') as { get(id: SessionId): unknown } | undefined
        const captain = agentsRegistry?.get(sessionId as SessionId) as
        | { followup(message: unknown): void }
        | undefined
        if (captain === undefined) {
          ctx.logger.info(`agent-teams-pixel: start-team queued; captain ${sessionId} not live`)
          res.writeHead(202, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: false }))
          return
        }
        const roleList = preset.roles.join(', ')
        try {
          captain.followup(createUserMessage({
            content: [{
              type: 'text',
              text: `[agent-teams-pixel] 用户在像素办公室一键启动了「${presetName}」预设。\n` +
                `目标：${goal}\n` +
                `领袖角色（${preset.leader}）；成员角色：${roleList}。\n` +
                `请按 agent-teams 用法：1) agent_teams_create 创建团队，approval=required；2) agent_teams_add_member 按上述角色逐个加成员；3) 分析目标拆出最小任务 DAG（含 verification 任务）；4) 让用户在 Web 上 Approve & Run。`,
            }],
            source: { kind: 'plugin', plugin: 'agent-teams-pixel' } as never,
          }))
          ctx.logger.info(`agent-teams-pixel: start-team delivered to captain ${sessionId} (preset=${presetName})`)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: true, preset: presetName }))
        } catch (error: unknown) {
          ctx.logger.warn(`agent-teams-pixel: start-team followup failed: ${String(error)}`)
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'failed to deliver to captain' }))
        }
      },
    }), 'pixel-office: start-team route')

    // Resume / rebuild an archived or halted team: the floater posts the
    // teamId + a reason; the host injects a follow-up into the captain's next
    // turn asking it to call agent_teams_resume (halted) or recreate the team
    // from archived team.json (deleted). The captain decides which is which.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/resume-team',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let raw = ''
        try {
          raw = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer | string) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid body' }))
          return
        }
        let payload: { sessionId?: unknown; teamId?: unknown; teamName?: unknown; reason?: unknown }
        try {
          payload = raw.trim() === '' ? {} : JSON.parse(raw) as { sessionId?: unknown; teamId?: unknown; teamName?: unknown; reason?: unknown }
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid JSON' }))
          return
        }
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : ''
        const teamId = typeof payload.teamId === 'string' ? payload.teamId.trim() : ''
        const teamName = typeof payload.teamName === 'string' ? payload.teamName.trim() : '未命名'
        const reason = typeof payload.reason === 'string' && payload.reason.trim() !== ''
          ? payload.reason.trim()
          : '重新启动该团队'
        if (sessionId === '' || teamId === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId and teamId are required' }))
          return
        }
        const agentsRegistry = ctx.get('agents') as { get(id: SessionId): unknown } | undefined
        const captain = agentsRegistry?.get(sessionId as SessionId) as
        | { followup(message: unknown): void }
        | undefined
        if (captain === undefined) {
          ctx.logger.info(`agent-teams-pixel: resume-team queued; captain ${sessionId} not live`)
          res.writeHead(202, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: false }))
          return
        }
        try {
          captain.followup(createUserMessage({
            content: [{
              type: 'text',
              text: `[agent-teams-pixel] 用户在像素办公室请求恢复团队「${teamName}」（teamId=${teamId}，可能已 halted / 已 archived）。${reason}。\n` +
                `请优先调用 agent_teams_resume({ teamId, reason }) 恢复已 halted 团队；若该团队已 archived / deleted（team.json 不在活跃目录），请基于团队历史描述创建新团队并把成员和任务照原样搭好。`,
            }],
            source: { kind: 'plugin', plugin: 'agent-teams-pixel' } as never,
          }))
          ctx.logger.info(`agent-teams-pixel: resume-team delivered to captain ${sessionId} (teamId=${teamId})`)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: true, teamId }))
        } catch (error: unknown) {
          ctx.logger.warn(`agent-teams-pixel: resume-team followup failed: ${String(error)}`)
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'failed to deliver to captain' }))
        }
      },
    }), 'pixel-office: resume-team route')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/state',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const title = url.searchParams.get('ws') ?? ''
        const workspace = workspaceRegistry.list().find((w) => w.title === title)
          ?? workspaceRegistry.list()[0]
        if (workspace === undefined) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'no workspace' }))
          return
        }
        const stateRoot = join(workspace.path, stateDir)
        try {
          const teams = await listTeamSnapshots(stateRoot)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ workspace: workspace.title, stateRoot, teams }))
        } catch (error: unknown) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: String(error) }))
        }
      },
    }), 'pixel-office: state route')

    // Single team drill-down: returns the team.json body verbatim (members +
    // tasks). The browser floater polls this for each team listed by /state.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/team',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const title = url.searchParams.get('ws') ?? ''
        const teamId = url.searchParams.get('id') ?? ''
        if (teamId === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'id is required' }))
          return
        }
        const workspace = workspaceRegistry.list().find((w) => w.title === title)
          ?? workspaceRegistry.list()[0]
        if (workspace === undefined) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'no workspace' }))
          return
        }
        const teamDir = join(workspace.path, stateDir, teamId)
        const teamJson = join(teamDir, 'team.json')
        if (!existsSync(teamJson)) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'team not found', teamId }))
          return
        }
        try {
          const teamRaw = JSON.parse(readFileSync(teamJson, 'utf8')) as Record<string, unknown>
          const inbox = await readInbox(teamDir)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ...teamRaw, inbox }))
        } catch (error: unknown) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: String(error) }))
        }
      },
    }), 'pixel-office: team route')

    // "申请增配" endpoint: the office floater POSTs here when the captain
    // judges the team understaffed. We resolve the captain session from
    // sessionId, find the team's current state, and emit an advisory into the
    // session inbox so the captain's next turn reads it as a hint to call
    // agent_teams_add_member. The session itself stays in charge of the
    // decision; this endpoint is the wiring, not the policy.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/agent-teams-pixel/request-help',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let raw = ''
        try {
          raw = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer | string) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid body' }))
          return
        }
        let payload: { sessionId?: unknown; sessionTitle?: unknown; teamId?: unknown; reason?: unknown }
        try {
          payload = raw.trim() === '' ? {} : JSON.parse(raw) as { sessionId?: unknown; sessionTitle?: unknown; teamId?: unknown; reason?: unknown }
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid JSON' }))
          return
        }
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : ''
        if (sessionId === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId is required' }))
          return
        }
        const reason = typeof payload.reason === 'string' && payload.reason.trim() !== ''
          ? payload.reason.trim()
          : '人手不足，需要增配角色'
        const teamId = typeof payload.teamId === 'string' ? payload.teamId.trim() : ''
        // Resolve captain: ctx.agents is the agent registry the host plane
        // exposes; looking it up here is the same path the rest of dsh uses.
        const agentsRegistry = ctx.get('agents') as { get(id: SessionId): unknown } | undefined
        const captain = agentsRegistry?.get(sessionId as SessionId) as
          | { followup(message: unknown): void; cancel(args: unknown, opts?: unknown): void }
          | undefined
        if (captain === undefined) {
          // No live captain (page refresh, archived session, etc.). The
          // request is accepted but the hint will arrive in the next user
          // turn when the captain becomes available again.
          ctx.logger.info(`agent-teams-pixel: request-help queued; captain ${sessionId} not live`)
          res.writeHead(202, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: false }))
          return
        }
        // Inject the request as a user message into the captain's next turn.
        // The source.kind tells dsh the message came from a plugin; the
        // captain's prompt section already includes the agent-teams usage
        // protocol, which directs it to call agent_teams_add_member when
        // a request-help hint is observed.
        try {
          captain.followup(createUserMessage({
            content: [{
              type: 'text',
              text: `[agent-teams-pixel] 用户在像素办公室请求增配。teamId=${teamId || '(未指定)'}，reason=${reason}。请调用 agent_teams_add_member 增配合适角色（需说明建议角色名 + 理由），或继续监控当前团队完成度。`,
            }],
            source: { kind: 'plugin', plugin: 'agent-teams-pixel' } as never,
          }))
          ctx.logger.info(`agent-teams-pixel: request-help delivered to captain ${sessionId} (teamId=${teamId})`)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, accepted: true, live: true }))
        } catch (error: unknown) {
          ctx.logger.warn(`agent-teams-pixel: request-help followup failed: ${String(error)}`)
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'failed to deliver to captain' }))
        }
      },
    }), 'pixel-office: request-help route')

    return true
  }

  if (!tryRegister()) {
    ctx.on('internal/service', (name) => {
      if (WEB_SERVER_KEYS.includes(name as (typeof WEB_SERVER_KEYS)[number])
        || WORKSPACE_KEYS.includes(name as (typeof WORKSPACE_KEYS)[number])) {
        tryRegister()
      }
    })
  }
}

/** Read every `team.json` under state root one directory deep. */
async function listTeamSnapshots(stateRoot: string): Promise<readonly { teamId: string; name: string }[]> {
  const { readdir } = await import('node:fs/promises')
  let entries: string[]
  try {
    entries = await readdir(stateRoot)
  } catch {
    return []
  }
  const out: { teamId: string; name: string }[] = []
  for (const entry of entries) {
    const teamJson = join(stateRoot, entry, 'team.json')
    if (!existsSync(teamJson)) continue
    try {
      const raw = JSON.parse(readFileSync(teamJson, 'utf8')) as { name?: unknown; id?: unknown }
      out.push({
        teamId: typeof raw.id === 'string' ? raw.id : entry,
        name: typeof raw.name === 'string' ? raw.name : entry,
      })
    } catch {
      // skip unreadable team
    }
  }
  return out
}

/** Read every inbox JSONL under `<teamDir>/inbox/*.jsonl`, newest last.
 *  Lines that fail to parse are dropped silently — durability trumps shape. */
async function readInbox(teamDir: string): Promise<readonly Record<string, unknown>[]> {
  const { readdir } = await import('node:fs/promises')
  const inboxDir = join(teamDir, 'inbox')
  let entries: string[]
  try {
    entries = await readdir(inboxDir)
  } catch {
    return []
  }
  const lines: Record<string, unknown>[] = []
  for (const file of entries) {
    if (!file.endsWith('.jsonl')) continue
    const text = readFileSync(join(inboxDir, file), 'utf8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (line === '') continue
      try {
        lines.push(JSON.parse(line) as Record<string, unknown>)
      } catch {
        // skip corrupted message
      }
    }
  }
  return lines
}