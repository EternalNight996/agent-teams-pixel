/**
 * Client entry: registers the working-roles tab and the collapsible
 * pixel-office overlay.
 *
 * - Working-roles tab (`conversation.view` slot): role catalog browser
 *   that opens when the captain's session is the active one. The tab
 *   shows the bundled 508-role list and a quick "use in this session"
 *   button that asks the captain to add the role as a member.
 *
 * - Pixel-office overlay (`shell.overlay` slot): a right-side floater
 *   with the canvas, the team roster, and a "+ request more hands"
 *   button that asks the captain to spawn another role. The floater is
 *   collapsible via the title-bar chevron; default state is collapsed
 *   so the first impression matches the host page.
 *
 * The pixel state derives from agent-teams durable team.json: every 5s
 * the floater fetches `/plugins/agent-teams-pixel/state` and renders.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { PixelCanvas, type PixelMember } from './pixel-canvas.js'
import { projectMembers, fallbackColor, type RawMember } from './office-state.js'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionListSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'

/** Office state shape returned by the host route.
 *  Compatible with both @nanmicoder/dsh-agent-teams'
 *  `/plugins/dsh-agent-teams/state` (full snapshot per team)
 *  and our own `/plugins/agent-teams-pixel/state` (list-only fallback). */
interface OfficeStatePayload {
  readonly workspace?: string
  readonly stateRoot?: string
  readonly teams: readonly {
    teamId: string
    name: string
    members?: RawMember[]
    tasks?: TaskRow[]
    /** Set when an automatic review/repair loop hit its configured ceiling.
     *  Pixel office surfaces a red "needs you" dot for the captain. */
    escalated?: boolean
  }[]
}

interface RoleRecord {
  readonly name: string
  readonly emoji?: string
  readonly color?: string
  readonly desc?: string
}

interface TeamPreset {
  readonly name: string
  readonly leader: string
  readonly roles: readonly string[]
}

// `settingsScope` is intentionally NOT in inject: the host profile may not
// ship the dsh-client-ui-settings peer (the floater degrades to defaults).
// The other four are platform slots every web shell exposes.
export const inject = ['slots', 'sessions', 'locale', 'uiConversation']

const POLL_MS = 5000

/** Stable empty SessionListSnapshot for tab renders without a live store. */
const EMPTY_SNAPSHOT: SessionListSnapshot = {
  items: [],
  current: undefined,
  state: 'idle',
  phase: 'pending',
  error: null,
  subagentsByParent: {},
  jobsBySession: {},
  currentAddress: undefined,
}
function EMPTY_SNAPSHOT_GETTER(): SessionListSnapshot { return EMPTY_SNAPSHOT }
function NOOP_SUBSCRIBE(): () => void { return () => undefined }

const RECENT_PRESETS_KEY = 'agent-teams-pixel:recent-presets:v1'
const RECENT_PRESETS_MAX = 5

function useOfficeState(workspace: string | undefined, includeArchived: boolean = false): {
  state: OfficeStatePayload | null
  members: PixelMember[]
  reload: () => void
} {
  const [state, setState] = useState<OfficeStatePayload | null>(null)
  const [members, setMembers] = useState<PixelMember[]>([])
  const [roleColors, setRoleColors] = useState<Map<string, string>>(new Map())
  const reloadRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    let cancelled = false
    void fetch('/plugins/agent-teams-pixel/roles')
      .then((r) => (r.ok ? r.json() as Promise<{ roles?: Record<string, RoleRecord> }> : null))
      .then((data) => {
        if (cancelled || data === null) return
        const map = new Map<string, string>()
        const roles = data.roles ?? {}
        for (const id of Object.keys(roles)) {
          const r = roles[id]
          if (r && r.color !== undefined) map.set(r.name, r.color)
        }
        setRoleColors(map)
      })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  const reload = useCallback((): void => {
    if (workspace === undefined) return
    let cancelled = false
    // Prefer @nanmicoder/dsh-agent-teams's live snapshot — its /state route
    // already merges everything; the office gets real-time data without a
    // second round trip. Fall back to our list-only route when the upstream
    // is not mounted.
    const upstreamQS = includeArchived ? '?archived=1' : '?archived=0'
    const candidates = [
      `/plugins/dsh-agent-teams/state${upstreamQS}`,
      `/plugins/agent-teams-pixel/state?ws=${encodeURIComponent(workspace)}&archived=${includeArchived ? '1' : '0'}`,
    ]
    const tryNext = (i: number): void => {
      if (i >= candidates.length) return
      fetch(candidates[i] as string)
        .then((r) => (r.ok ? r.json() as Promise<{ teams?: OfficeStatePayload['teams'] }> : Promise.reject(new Error('not ok'))))
        .then(async (raw) => {
          if (cancelled) return
          const teams = Array.isArray(raw.teams) ? raw.teams : []
          setState({ workspace, teams })
          const flat: RawMember[] = []
          for (const team of teams) {
            // Prefer embedded members+tasks (upstream shape); fall back to
            // a dedicated /team fetch (our shape).
            const embedMembers = (team as { members?: RawMember[] }).members
            if (Array.isArray(embedMembers)) {
              flat.push(...embedMembers)
              continue
            }
            try {
              const teamRes = await fetch(`/plugins/agent-teams-pixel/team?ws=${encodeURIComponent(workspace)}&id=${encodeURIComponent(team.teamId)}`)
              if (!teamRes.ok) continue
              const t = await teamRes.json() as { members?: RawMember[] }
              if (Array.isArray(t.members)) flat.push(...t.members)
            } catch {
              // network blip; next poll will retry
            }
          }
          if (!cancelled) setMembers(projectMembers(flat, roleColors))
        })
        .catch(() => { if (!cancelled) tryNext(i + 1) })
    }
    tryNext(0)
  }, [workspace, roleColors, includeArchived])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (workspace === undefined) return undefined
    const id = window.setInterval(reload, POLL_MS)
    return () => window.clearInterval(id)
  }, [reload, workspace])

  reloadRef.current = reload
  return { state, members, reload }
}

interface OfficeOverlayProps {
  /** Live session list subscription; may be undefined if the host profile
   *  does not ship the sessions peer — the overlay renders with an empty
   *  list and the start-team button is disabled. */
  readonly sessions?: ObservableSnapshot<SessionListSnapshot>
  readonly workspace?: string
  /** Holder ref that reads the latest settings snapshot from the bound scope.
   *  We use a ref instead of the snapshot itself because the floater is
   *  registered once into `shell.overlay` and survives settings writes
   *  through subscription, not re-registration. */
  readonly settings?: { value: { collapsed?: boolean; includeArchived?: boolean } | undefined }
}

interface TaskRow {
  readonly id: string
  readonly subject: string
  readonly status: string
  readonly assignee?: string
  readonly dependencies?: readonly string[]
  readonly kind?: string
  readonly round?: number
}

function OfficeOverlay({ sessions, workspace, settings }: OfficeOverlayProps): React.ReactElement {
  // Initialize from the persisted settings snapshot; fall back to defaults.
  const [collapsed, setCollapsed] = useState(settings?.value?.collapsed ?? true)
  const [includeArchived, setIncludeArchived] = useState(settings?.value?.includeArchived ?? false)
  const [activeTeam, setActiveTeam] = useState<{ teamId: string; name: string } | null>(null)
  const [activeTeamDetail, setActiveTeamDetail] = useState<{ tasks: TaskRow[]; inbox: Record<string, unknown>[] }>({ tasks: [], inbox: [] })
  const [pickedMember, setPickedMember] = useState<PixelMember | null>(null)
  const [pickedTask, setPickedTask] = useState<TaskRow | null>(null)
  const [lastStartError, setLastStartError] = useState<string>('')
  const { state, members, reload } = useOfficeState(workspace, includeArchived)
  // Subscribe to the live session list so the floater always knows which
  // captain to address when the user presses 一键组队 / 申请增配. Falls
  // back to the no-sessions stub when the host profile lacks the peer.
  const sessionSnapshot = useSyncExternalStore(
    sessions?.subscribe ?? NOOP_SUBSCRIBE,
    sessions?.getSnapshot ?? EMPTY_SNAPSHOT_GETTER,
    sessions?.getSnapshot ?? EMPTY_SNAPSHOT_GETTER,
  )
  const activeSessionId = sessionSnapshot.current

  // Keyboard shortcut listener: Alt+O toggles the floater. Bound via a
  // window CustomEvent so apply() owns the global listener registration
  // (one handler, one disposal path) and OfficeOverlay only listens for
  // its own event.
  useEffect(() => {
    const handler = (): void => setCollapsed((c) => !c)
    window.addEventListener('agent-teams-pixel:toggle-floater', handler)
    return () => window.removeEventListener('agent-teams-pixel:toggle-floater', handler)
  }, [])

  // Persist the user's preferences back to the settings scope so they survive
  // page reload and dsh restarts. Settings writes are queued behind a
  // revision fence; failures are swallowed because local state is the source
  // of truth for the in-progress session.
  useEffect(() => {
    if (settingsScope === undefined) return
    settingsScope.set('collapsed', collapsed).catch(() => undefined)
  }, [collapsed])
  useEffect(() => {
    if (settingsScope === undefined) return
    settingsScope.set('includeArchived', includeArchived).catch(() => undefined)
  }, [includeArchived])

  const containerStyle: React.CSSProperties = useMemo(() => ({
    position: 'fixed',
    right: 16,
    bottom: 16,
    width: collapsed ? 220 : 360,
    maxHeight: collapsed ? 56 : '70vh',
    background: 'rgba(15, 23, 42, 0.94)',
    color: '#e2e8f0',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
    zIndex: 999,
    overflow: 'hidden',
    transition: 'width 0.18s ease, max-height 0.18s ease',
  }), [collapsed])

  const escalated = state?.teams.some((t) => t.escalated === true) === true
  const titleBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: escalated ? 'rgba(220,38,38,0.85)' : 'rgba(30, 41, 59, 0.85)',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: 13,
  }
  const toggle = (): void => { setCollapsed((c) => !c) }

  // Lazy-load the full team detail (tasks with output + inbox JSONL) when
  // the user picks a team. Polled every 5s as long as a team is selected.
  useEffect(() => {
    if (activeTeam === null || workspace === undefined) {
      setActiveTeamDetail({ tasks: [], inbox: [] })
      return undefined
    }
    let cancelled = false
    const load = async (): Promise<void> => {
      try {
        const r = await fetch(`/plugins/agent-teams-pixel/team?ws=${encodeURIComponent(workspace)}&id=${encodeURIComponent(activeTeam.teamId)}`)
        if (!r.ok) return
        const data = await r.json() as { tasks?: TaskRow[]; inbox?: Record<string, unknown>[] }
        if (cancelled) return
        setActiveTeamDetail({
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
          inbox: Array.isArray(data.inbox) ? data.inbox : [],
        })
      } catch {
        // network blip; next poll retries
      }
    }
    void load()
    const id = window.setInterval(load, 5000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [activeTeam, workspace])

  return (
    <div style={containerStyle}>
      <div style={titleBarStyle} onClick={toggle} role="button" aria-expanded={!collapsed}>
        <span>
          🏢 像素办公室 {state === null ? '' : `· ${state.teams.length}`}
          {escalated && <span style={{ marginLeft: 6, color: '#fecaca', fontSize: 11 }}>· ⚠️ 需主人裁决</span>}
        </span>
        <span>{collapsed ? '▶' : '▼'}</span>
      </div>
      {!collapsed && (
        <div style={{ padding: 12, fontSize: 12 }}>
          <PixelCanvas
            members={members}
            width={336}
            height={Math.max(180, 80 + members.length * 18)}
            onMemberClick={(m) => setPickedMember(m)}
          />
          <TaskProgressBar teams={state?.teams ?? []} />
          <div style={{ marginTop: 8 }}>
            {state?.teams.length === 0 && <div style={{ color: '#94a3b8' }}>暂无团队。让船长在右侧栏输入「用 AgentTeams 做 X」即可启动。</div>}
            {state?.teams.map((t) => (
              <div
                key={t.teamId}
                onClick={() => setActiveTeam(t)}
                style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  marginTop: 4,
                  borderRadius: 6,
                  background: activeTeam?.teamId === t.teamId ? 'rgba(59,130,246,0.25)' : 'rgba(51,65,85,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {t.escalated === true && <span style={{ color: '#f87171', fontSize: 10 }}>⚠️</span>}
                <span>{t.name}</span>
                {t.tasks !== undefined && t.tasks.length > 0 && (
                  <TaskProgressInline tasks={t.tasks} />
                )}
              </div>
            ))}
          </div>
          {activeTeam !== null && activeTeamDetail.tasks.length > 0 && (
            <TaskDag tasks={activeTeamDetail.tasks} onSelect={setPickedTask} />
          )}
          {activeTeam !== null && activeTeamDetail.inbox.length > 0 && (
            <InboxPanel messages={activeTeamDetail.inbox} />
          )}
          {includeArchived && activeTeam !== null && (
            <button
              type="button"
              onClick={() => {
                if (activeSessionId === undefined) {
                  setLastStartError('当前没有活动的会话，无法恢复归档团队。')
                  return
                }
                const reason = window.prompt('说明恢复该归档团队的理由：', '继续上次的任务') ?? ''
                void fetch('/plugins/agent-teams-pixel/resume-team', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    sessionId: activeSessionId,
                    teamId: activeTeam.teamId,
                    teamName: activeTeam.name,
                    reason,
                  }),
                })
                  .then(async (r) => {
                    if (r.ok) {
                      const data = await r.json() as { live?: boolean }
                      setLastStartError('')
                      window.alert(data.live === false
                        ? '已排队：船长下次上线时会收到恢复请求。'
                        : '船长已收到恢复请求，下一轮会调用 agent_teams_resume。')
                    } else {
                      setLastStartError(`恢复失败 (HTTP ${r.status})`)
                    }
                  })
                  .catch((e) => setLastStartError('网络错误：' + String(e)))
              }}
              style={{
                marginTop: 8,
                padding: '6px 10px',
                background: 'rgba(99,102,241,0.85)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ↻ 恢复运行
            </button>
          )}
          <button
            type="button"
            onClick={reload}
            style={{
              marginTop: 8,
              padding: '6px 10px',
              background: 'rgba(59,130,246,0.85)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🔄 刷新办公室
          </button>
          <button
            type="button"
            onClick={() => setIncludeArchived((v) => !v)}
            style={{
              marginTop: 8,
              marginLeft: 6,
              padding: '4px 8px',
              background: includeArchived ? 'rgba(99,102,241,0.85)' : 'rgba(51,65,85,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer',
            }}
            title={includeArchived ? '当前含归档团队，再点一次只看活跃' : '当前只看活跃团队，再点一次看归档'}
          >
            {includeArchived ? '📦 含归档' : '📦 仅活跃'}
          </button>
          {lastStartError !== '' && (
            <div style={{
              marginTop: 8, padding: '6px 8px', borderRadius: 6,
              background: 'rgba(127,29,29,0.45)', color: '#fee2e2', fontSize: 11,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ flex: 1 }}>⚠ {lastStartError}</span>
              <button
                type="button"
                onClick={() => { setLastStartError(''); void reload() }}
                style={{ border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
              >重试</button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              const id = activeSessionId
              if (id === undefined) {
                window.alert('当前没有活动的会话。')
                return
              }
              const sessionTitle = sessionSnapshot.items.find((s) => s.sessionId === id)?.title ?? ''
              const reason = window.prompt('说明申请增配的理由（可选）：', '当前任务人手不足') ?? ''
              void fetch('/plugins/agent-teams-pixel/request-help', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  sessionId: id,
                  sessionTitle,
                  teamId: activeTeam?.teamId ?? null,
                  reason,
                }),
              })
                .then(async (r) => {
                  if (r.ok) window.alert('已向船长发送「人手不足」请求。')
                  else window.alert(`船长当前未在线（HTTP ${r.status}）。下次开会话时仍会被读到。`)
                })
                .catch(() => window.alert('网络错误。'))
            }}
            style={{
              marginTop: 8,
              marginLeft: 8,
              padding: '6px 10px',
              background: 'rgba(245,158,11,0.9)',
              color: '#1f2937',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ➕ 申请增配
          </button>
        </div>
      )}
      {pickedTask !== null && (
        <TaskOutputFold task={pickedTask} onClose={() => setPickedTask(null)} />
      )}
      {pickedMember !== null && (
        <div
          role="dialog"
          aria-label="成员详情"
          onClick={() => setPickedMember(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', color: '#0f172a', borderRadius: 12, padding: 20,
              maxWidth: 380, boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: pickedMember.color }} />
              <h3 style={{ margin: 0 }}>{pickedMember.name}</h3>
              <button
                type="button"
                onClick={() => setPickedMember(null)}
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}
              >✕</button>
            </div>
            <div style={{ color: '#475569', marginBottom: 8 }}>角色：{pickedMember.role}</div>
            <div style={{ marginBottom: 8 }}>
              状态：
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11, marginLeft: 4,
                background: pickedMember.state === 'error' ? '#fee2e2'
                  : pickedMember.state === 'done' ? '#dcfce7'
                  : pickedMember.state === 'typing' ? '#fef3c7' : '#e2e8f0',
              }}>{pickedMember.state}</span>
            </div>
            {pickedMember.taskSubject !== undefined && (
              <div style={{ fontSize: 12, color: '#64748b' }}>
                当前任务：{pickedMember.taskSubject}
              </div>
            )}
            <button
              type="button"
              onClick={() => setPickedMember(null)}
              style={{ marginTop: 12, padding: '8px 14px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >关闭</button>
          </div>
        </div>
      )}
    </div>
  )
}

interface WorkingRolesProps {
  readonly setView?: (view: string) => void
  readonly sessionId?: SessionId
  readonly sessions?: ObservableSnapshot<SessionListSnapshot>
}

function WorkingRolesTab({ setView, sessions }: WorkingRolesProps): React.ReactElement {
  const [roles, setRoles] = useState<{ id: string; name: string; emoji?: string; color?: string; desc?: string }[]>([])
  const [presets, setPresets] = useState<TeamPreset[]>([])
  const [recentPresets, setRecentPresets] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const [detail, setDetail] = useState<{ id: string; name: string; emoji?: string; color?: string; desc?: string } | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [goal, setGoal] = useState('')
  const [starting, setStarting] = useState(false)
  const [startMsg, setStartMsg] = useState('')
  // Hook order must be unconditional; always subscribe (the snapshot getter
  // tolerates an undefined inner store via a stub). The active session id is
  // used as the captain to address when the user presses 启动团队.
  const liveSnapshot: SessionListSnapshot = useSyncExternalStore(
    sessions?.subscribe ?? NOOP_SUBSCRIBE,
    sessions?.getSnapshot ?? EMPTY_SNAPSHOT_GETTER,
    sessions?.getSnapshot ?? EMPTY_SNAPSHOT_GETTER,
  )
  const activeSessionId: SessionId | undefined = liveSnapshot.current

  useEffect(() => {
    let cancelled = false
    // Listen for the Alt+R jump-roles event; the apply() keyboard handler
    // dispatches it from anywhere in the page.
    const jumpHandler = (): void => { if (setView !== undefined) setView('agent-teams-pixel-roles') }
    window.addEventListener('agent-teams-pixel:jump-roles', jumpHandler)
    void fetch('/plugins/agent-teams-pixel/roles')
      .then((r) => (r.ok ? r.json() as Promise<{ roles: Record<string, RoleRecord> }> : null))
      .then((data) => {
        if (cancelled || data === null) return
        const list: { id: string; name: string; emoji?: string; color?: string; desc?: string }[] = []
        const map = data.roles ?? {}
        for (const id of Object.keys(map)) {
          const r = map[id]
          if (r === undefined) continue
          list.push({ id, name: r.name, emoji: r.emoji, color: r.color, desc: r.desc })
        }
        setRoles(list)
      })
      .catch(() => undefined)
    void fetch('/plugins/agent-teams-pixel/presets')
      .then((r) => (r.ok ? r.json() as Promise<{ presets: TeamPreset[] }> : null))
      .then((data) => {
        if (cancelled || data === null) return
        setPresets(Array.isArray(data.presets) ? data.presets : [])
      })
      .catch(() => undefined)
    try {
      const raw = window.localStorage.getItem(RECENT_PRESETS_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) setRecentPresets(parsed.filter((s): s is string => typeof s === 'string').slice(0, RECENT_PRESETS_MAX))
      }
    } catch {
      // ignore corrupt localStorage; recent presets re-memorize on next start
    }
    return () => { cancelled = true; window.removeEventListener('agent-teams-pixel:jump-roles', jumpHandler) }
  }, [setView])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return roles.slice(0, 60)
    return roles.filter((r) => r.name.toLowerCase().includes(q) || (r.desc ?? '').toLowerCase().includes(q)).slice(0, 60)
  }, [roles, query])

  const startTeam = async (): Promise<void> => {
    if (selectedPreset === '' || goal.trim() === '' || starting) return
    if (activeSessionId === undefined) {
      setStartMsg('❌ 当前没有活动的会话。请先在 DSH 里打开一个会话再一键组队。')
      return
    }
    setStarting(true)
    setStartMsg('🚀 已发送一键组队指令给船长，等待其下一轮执行…')
    try {
      const r = await fetch('/plugins/agent-teams-pixel/start-team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId, presetName: selectedPreset, goal: goal.trim() }),
      })
      if (r.ok) {
        const data = await r.json() as { live?: boolean }
        setStartMsg(data.live === false
          ? '✅ 船长当前离线，请求已排队，下次开会话时送达。'
          : '✅ 船长已收到一键组队指令，下一轮会启动「' + selectedPreset + '」。')
        if (setView !== undefined) setView('chat')
        // Memorize the preset (most-recent-first, capped at RECENT_PRESETS_MAX).
        const next = [selectedPreset, ...recentPresets.filter((p) => p !== selectedPreset)].slice(0, RECENT_PRESETS_MAX)
        setRecentPresets(next)
        try { window.localStorage.setItem(RECENT_PRESETS_KEY, JSON.stringify(next)) } catch { /* quota or privacy mode */ }
      } else {
        setStartMsg(`❌ 启动失败 (HTTP ${r.status})`)
      }
    } catch (error) {
      setStartMsg('❌ ' + String(error))
    } finally {
      setStarting(false)
    }
  }

  return (
    <div style={{ padding: 16, fontSize: 13 }}>
      <div style={{
        marginBottom: 16, padding: 12, borderRadius: 10,
        background: 'linear-gradient(135deg, #eff6ff, #ecfeff)',
        border: '1px solid #bae6fd',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>🚀 一键组队</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            style={{ flex: 1, minWidth: 180, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          >
            <option value="">— 选择团队预设 —</option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.roles.length} 角色)
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="目标（例：搭建一个内部 wiki 搜索 demo）"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', resize: 'vertical' }}
        />
        {recentPresets.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>最近使用：</span>
            {recentPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPreset(p)}
                style={{
                  padding: '3px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                  border: '1px solid #cbd5e1', background: 'white', color: '#0f172a',
                }}
              >{p}</button>
            ))}
            <button
              type="button"
              onClick={() => {
                setRecentPresets([])
                try { window.localStorage.removeItem(RECENT_PRESETS_KEY) } catch { /* ignore */ }
              }}
              style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 10, borderRadius: 8, cursor: 'pointer', border: '1px solid #fecaca', background: '#fff1f2', color: '#9f1239' }}
              title="清空最近使用预设历史"
            >清空</button>
          </div>
        )}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={startTeam}
            disabled={selectedPreset === '' || goal.trim() === '' || starting}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              background: selectedPreset === '' || goal.trim() === '' ? '#cbd5e1' : '#2563eb',
              color: 'white', cursor: selectedPreset === '' || goal.trim() === '' ? 'not-allowed' : 'pointer',
            }}
          >启动团队</button>
          {startMsg !== '' && (
            <span style={{ fontSize: 12, color: startMsg.startsWith('❌') ? '#dc2626' : '#0f766e' }}>{startMsg}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="🔍 搜索角色"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <button
          type="button"
          onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white' }}
        >
          {lang === 'zh' ? '中' : 'EN'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {filtered.map((r) => (
          <div
            key={r.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 10,
              background: 'white',
              cursor: 'pointer',
            }}
            onClick={() => setDetail(r)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: r.color ?? fallbackColor(r.name) }} />
              <strong>{r.emoji ?? '🧑'} {r.name}</strong>
            </div>
            <div style={{ marginTop: 4, color: '#64748b', fontSize: 11 }}>{r.desc ?? ''}</div>
          </div>
        ))}
      </div>
      {detail !== null && (
        <div
          role="dialog"
          aria-label="角色详情"
          onClick={() => setDetail(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 12, padding: 20, maxWidth: 480,
              boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: detail.color ?? fallbackColor(detail.name) }} />
              <h3 style={{ margin: 0 }}>{detail.emoji ?? '🧑'} {detail.name}</h3>
              <button
                type="button"
                onClick={() => setDetail(null)}
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}
              >✕</button>
            </div>
            <p style={{ color: '#475569' }}>{detail.desc ?? '（暂无描述）'}</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  if (setView !== undefined) setView('chat')
                  window.alert(`把「${detail.name}」作为成员请直接对船长说：用 AgentTeams 起一个团队，第一个角色是 ${detail.name}。`)
                  setDetail(null)
                }}
                style={{ padding: '8px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >加入团队</button>
              <button
                type="button"
                onClick={() => setDetail(null)}
                style={{ padding: '8px 14px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Pixel-office task progress widget: aggregates per-task statuses into a
 * compact bar so the user sees at a glance whether the captain is making
 * progress, blocked, or has finished. Quality-gate rounds surface as a
 * separate badge so the user knows review/repair is iterating.
 */
function TaskProgressBar({ teams }: { readonly teams: readonly { name: string; tasks?: TaskRow[]; escalated?: boolean }[] }): React.ReactElement | null {
  const allTasks = teams.flatMap((t) => t.tasks ?? [])
  if (allTasks.length === 0) return null
  const counts = {
    completed: allTasks.filter((t) => t.status === 'completed').length,
    in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
    pending: allTasks.filter((t) => t.status === 'pending' || t.status === 'claimed').length,
    failed: allTasks.filter((t) => t.status === 'failed' || t.status === 'cancelled').length,
  }
  const total = allTasks.length
  const blockedRatio = counts.pending / Math.max(1, total)
  const qualityRounds = allTasks.reduce((max, t) => Math.max(max, t.round ?? 0), 0)
  const escalated = teams.some((t) => t.escalated === true)
  return (
    <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(15,23,42,0.65)', borderRadius: 6 }}>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#1e293b' }}>
        <div style={{ flex: counts.completed, background: '#22c55e' }} />
        <div style={{ flex: counts.in_progress, background: '#f59e0b' }} />
        <div style={{ flex: counts.pending, background: '#475569' }} />
        <div style={{ flex: counts.failed, background: '#ef4444' }} />
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: '#cbd5e1', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span>✅ {counts.completed}</span>
        <span>🔧 {counts.in_progress}</span>
        <span>⏳ {counts.pending}</span>
        {counts.failed > 0 && <span style={{ color: '#fca5a5' }}>✕ {counts.failed}</span>}
        {blockedRatio > 0.5 && counts.in_progress === 0 && <span style={{ color: '#fbbf24' }}>⚠ 多数阻塞</span>}
        {qualityRounds > 0 && <span>🔁 第 {qualityRounds} 轮</span>}
        {escalated && <span style={{ color: '#fca5a5' }}>⚠ 已升级</span>}
      </div>
    </div>
  )
}

function TaskProgressInline({ tasks }: { readonly tasks: readonly TaskRow[] }): React.ReactElement {
  const completed = tasks.filter((t) => t.status === 'completed').length
  return (
    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>
      {completed}/{tasks.length}
    </span>
  )
}

/**
 * Compact task DAG: nodes laid out in level-order (depth = max depth of any
 * dependency), edges drawn as straight lines, status colored. Clicking a
 * node shows the task output fold.
 */
function TaskDag({ tasks, onSelect }: {
  readonly tasks: readonly TaskRow[]
  readonly onSelect: (task: TaskRow) => void
}): React.ReactElement | null {
  if (tasks.length === 0) return null
  // Compute depth per task via longest dependency path.
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const depth = new Map<string, number>()
  const compute = (id: string, seen = new Set<string>()): number => {
    if (seen.has(id)) return 0
    if (depth.has(id)) return depth.get(id) ?? 0
    seen.add(id)
    const t = byId.get(id)
    if (t === undefined || (t.dependencies ?? []).length === 0) {
      depth.set(id, 0)
      return 0
    }
    const d = 1 + Math.max(...(t.dependencies ?? []).map((dep) => compute(dep, seen)))
    depth.set(id, d)
    return d
  }
  for (const t of tasks) compute(t.id)
  // Group by depth.
  const byLevel = new Map<number, TaskRow[]>()
  for (const t of tasks) {
    const d = depth.get(t.id) ?? 0
    const list = byLevel.get(d) ?? []
    list.push(t)
    byLevel.set(d, list)
  }
  const maxLevel = Math.max(...byLevel.keys())
  const nodeW = 78
  const nodeH = 26
  const colGap = 26
  const rowGap = 6
  const levelWidths: number[] = []
  for (let i = 0; i <= maxLevel; i += 1) {
    levelWidths.push((byLevel.get(i)?.length ?? 0) * (nodeH + rowGap))
  }
  const totalW = levelWidths.reduce((s, w) => s + nodeW + colGap, -colGap)
  const totalH = Math.max(...levelWidths) + 4
  // Position map id → { x, y }.
  const pos = new Map<string, { x: number; y: number }>()
  for (let lv = 0; lv <= maxLevel; lv += 1) {
    const col = byLevel.get(lv) ?? []
    const colHeight = levelWidths[lv] ?? 0
    let y = (totalH - colHeight) / 2
    for (const t of col) {
      pos.set(t.id, { x: lv * (nodeW + colGap), y })
      y += nodeH + rowGap
    }
  }
  const statusColor = (s: string): string => {
    if (s === 'completed') return '#22c55e'
    if (s === 'in_progress') return '#f59e0b'
    if (s === 'failed' || s === 'cancelled') return '#ef4444'
    return '#475569'
  }
  return (
    <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(15,23,42,0.65)', borderRadius: 6, overflowX: 'auto' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>🧭 任务拓扑</div>
      <svg width={Math.max(totalW, 200)} height={totalH} style={{ display: 'block' }}>
        {tasks.flatMap((t) => (t.dependencies ?? []).map((dep) => {
          const from = pos.get(dep)
          const to = pos.get(t.id)
          if (from === undefined || to === undefined) return null
          return (
            <line
              key={`${dep}->${t.id}`}
              x1={from.x + nodeW} y1={from.y + nodeH / 2}
              x2={to.x} y2={to.y + nodeH / 2}
              stroke="#475569" strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
          )
        }))}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
          </marker>
        </defs>
        {tasks.map((t) => {
          const p = pos.get(t.id)
          if (p === undefined) return null
          return (
            <g key={t.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(t)}>
              <rect x={p.x} y={p.y} width={nodeW} height={nodeH} rx={4} fill={statusColor(t.status)} opacity={0.85} />
              <text x={p.x + nodeW / 2} y={p.y + nodeH / 2 + 4} textAnchor="middle" fontSize={10} fill="#0f172a" fontWeight={600}>
                {t.id.slice(0, 4)}
              </text>
              <title>{t.subject} · {t.status}{(t.round ?? 0) > 0 ? ` · 第${t.round}轮` : ''}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Captain inbox messages, newest first. Renders up to 5. */
function InboxPanel({ messages }: { readonly messages: readonly Record<string, unknown>[] }): React.ReactElement | null {
  const recent = useMemo(() => {
    const sorted = [...messages].sort((a, b) => Number(b.ts ?? 0) - Number(a.ts ?? 0))
    return sorted.slice(0, 5)
  }, [messages])
  if (recent.length === 0) return null
  return (
    <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(15,23,42,0.65)', borderRadius: 6, maxHeight: 120, overflowY: 'auto' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>📨 团队消息（最近 5 条）</div>
      {recent.map((m, i) => {
        const from = typeof m.from === 'string' ? m.from : '?'
        const content = typeof m.content === 'string' ? m.content.slice(0, 80) : ''
        return (
          <div key={String(m.id ?? i)} style={{ fontSize: 10, color: '#e2e8f0', marginBottom: 2 }}>
            <span style={{ color: '#60a5fa' }}>{from}</span>: {content}
          </div>
        )
      })}
    </div>
  )
}

/** Collapsible panel showing a single task's output text. */
function TaskOutputFold({ task, onClose }: {
  readonly task: TaskRow | null
  readonly onClose: () => void
}): React.ReactElement | null {
  if (task === null) return null
  const out = (task as { output?: unknown }).output
  return (
    <div
      role="dialog"
      aria-label="任务产出"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', color: '#0f172a', borderRadius: 12, padding: 20, maxWidth: 480, maxHeight: '70vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0 }}>{task.subject}</h3>
          <span style={{ fontSize: 11, color: '#64748b' }}>· {task.status}</span>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 12, color: '#1e293b' }}>
          {typeof out === 'string' && out.length > 0 ? out : '（暂无产出）'}
        </pre>
      </div>
    </div>
  )
}

/** Stable settings scope for the `agent-teams-pixel` namespace. Bound once
 *  per apply() to keep the disposer reference stable (see
 *  dsh-ui-three-body / dsh-ui-agents-pixe for the canonical pattern). */
let settingsScope: SettingsScope<{ collapsed?: boolean; includeArchived?: boolean }> | undefined
let settingsSnapshotRef: { value: { collapsed?: boolean; includeArchived?: boolean } | undefined } = { value: undefined }
function bindSettingsScope(ctx: ClientContext): void {
  if (settingsScope !== undefined) return
  const binder = ctx.get('settingsScope') as { bind: <T>(spec: { namespace: string }) => SettingsScope<T> } | undefined
  if (binder === undefined) return
  try {
    settingsScope = binder.bind<{ collapsed?: boolean; includeArchived?: boolean }>({ namespace: 'agent-teams-pixel' })
  } catch {
    settingsScope = undefined
    return
  }
  const refresh = (): void => {
    settingsSnapshotRef.value = settingsScope?.getSnapshot().value
  }
  refresh()
  if (settingsScope !== undefined) {
    const scope = settingsScope
    ctx.effect(() => scope.subscribe(refresh), 'pixel-office: settings subscribe')
  }
}

export function apply(ctx: ClientContext): void {
  // Hardening: every dependent service lookup is fail-open. If the profile
  // does not ship a peer, we skip the corresponding slot registration
  // instead of throwing — which would otherwise leave dsh-desktop with no
  // plugin rows mounted (the symptom of a hidden inject missing).
  const slots = ctx.get('slots')
  if (slots === undefined) {
    if (typeof console !== 'undefined') console.warn('[agent-teams-pixel] no slots service — plugin row will not render')
    return
  }
  const sessions = ctx.get('sessions') as ObservableSnapshot<SessionListSnapshot> | undefined
  bindSettingsScope(ctx)
  if (sessions === undefined) {
    if (typeof console !== 'undefined') console.warn('[agent-teams-pixel] no sessions service — overlay renders empty list, working-roles tab disabled')
  }

  // Keyboard shortcuts: Alt+O toggles the floater, Alt+R jumps to the
  // working-roles tab. Register globally on the window so the shortcut
  // works no matter which input is focused (other than textareas, where
  // we skip to avoid hijacking typing).
  const onKey = (event: KeyboardEvent): void => {
    if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return
    const target = event.target as HTMLElement | null
    if (target !== null) {
      const tag = target.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || (target.isContentEditable ?? false)) return
    }
    if (event.key === 'o' || event.key === 'O') {
      window.dispatchEvent(new CustomEvent('agent-teams-pixel:toggle-floater'))
      event.preventDefault()
    } else if (event.key === 'r' || event.key === 'R') {
      window.dispatchEvent(new CustomEvent('agent-teams-pixel:jump-roles'))
      event.preventDefault()
    }
  }
  ctx.effect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, 'pixel-office: keyboard shortcuts')

  slots.inject('conversation.view', () => slots.register(
    {
      name: 'conversation.view',
      id: 'agent-teams-pixel-roles',
      order: 25,
      label: '工作角色',
      inject: (sessionId: SessionId, actions: { setView?: (view: string) => void }) => ({
        setView: typeof actions.setView === 'function' ? actions.setView : undefined,
        sessionId,
      }),
    },
    (props: { setView?: (view: string) => void; sessionId?: SessionId }) => React.createElement(WorkingRolesTab, { ...props, sessions }),
  ))

  slots.inject('shell.overlay', () => slots.register(
    {
      name: 'shell.overlay',
      id: 'agent-teams-pixel-office',
      order: 60,
      label: '像素办公室',
    },
    () => React.createElement(OfficeOverlay, { sessions, workspace: undefined, settings: settingsSnapshotRef }),
  ))

  // Settings panel: collapsible from "设置 → 像素办公室". Exposes the two
  // persisted toggles (collapsed default + includeArchived default) and the
  // "clear recent presets" action so the user has a non-floating way to
  // change them. Reuses the bound settings scope so writes are revision-
  // fenced through the same wire as the floater.
  if (settingsScope !== undefined) {
    slots.inject('settings.section', () => slots.register(
      {
        name: 'settings.section',
        id: 'agent-teams-pixel',
        order: 30,
        label: '像素办公室',
        inject: () => {
          const s = settingsScope
          return s === undefined ? {} : { scope: s }
        },
      },
      (props: { scope?: SettingsScope<{ collapsed?: boolean; includeArchived?: boolean }> }) => {
        const scope = props.scope ?? settingsScope
        if (scope === undefined) return React.createElement('div', null, '（设置尚不可用）')
        return React.createElement(PixelOfficeSettingsSection, { scope })
      },
    ))
  }
}

/** Settings page body for the `agent-teams-pixel` namespace. */
function PixelOfficeSettingsSection({ scope }: { readonly scope: SettingsScope<{ collapsed?: boolean; includeArchived?: boolean }> }): React.ReactElement {
  const snap = useSyncExternalStore(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot(),
    () => scope.getSnapshot(),
  )
  const value = snap.value ?? { collapsed: true, includeArchived: false }
  const update = (field: string, v: unknown): void => { scope.set(field, v).catch(() => undefined) }
  const clearRecent = (): void => {
    try { window.localStorage.removeItem(RECENT_PRESETS_KEY) } catch { /* ignore */ }
    window.alert('已清空最近使用预设。')
  }
  const toggle = (field: 'collapsed' | 'includeArchived'): void => {
    update(field, !value[field])
  }
  return React.createElement('div', { style: { padding: 16, fontSize: 13 } },
    React.createElement('h3', { style: { marginTop: 0 } }, '🏢 像素办公室'),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 } },
      React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('input', {
          type: 'checkbox', checked: value.collapsed === true,
          onChange: () => toggle('collapsed'),
        }),
        React.createElement('span', null, '默认收起浮层'),
      ),
      React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('input', {
          type: 'checkbox', checked: value.includeArchived === true,
          onChange: () => toggle('includeArchived'),
        }),
        React.createElement('span', null, '含归档团队'),
      ),
      React.createElement('div', { style: { color: '#64748b', fontSize: 11 } },
        '快捷键：Alt+O 切换浮层，Alt+R 跳到工作角色页签。',
      ),
      React.createElement('button', {
        type: 'button', onClick: clearRecent,
        style: { padding: '6px 12px', background: '#fff1f2', color: '#9f1239', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', alignSelf: 'flex-start' },
      }, '清空最近使用预设'),
    ),
  )
}