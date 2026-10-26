/**
 * AgentTeams activity panel: the top-right floater monitoring every team.
 *
 * Modeled on the Claude Code desktop SessionActivityPanel: a shell-overlay
 * panel that docks at the conversation's top-right edge by default, can be
 * dragged into a floating window, resized, and folded into an activity badge.
 * On wide viewports the docked panel makes the conversation column yield
 * space; narrow viewports keep a simple inset overlay. It
 * polls the host `/plugins/dsh-pixel-team/state` route for
 * server-side snapshots (durable files + live subagent activity), with a
 * collapsed badge that auto-expands once when activity appears. Archived
 * teams stay available for the owning conversation after live work ends.
 *
 * The floater mounts in ui-layout's additive `shell.overlay`; it is not a
 * conversation node — the in-conversation panel was removed in favor of this
 * always-available monitor.
 * @module dsh-agent-teams/client/activity
 */

import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore,
  type CSSProperties, type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  IconBranchOutline16, IconChevronDownOutline14, IconPanelLeftOutline16,
  IconStopFill16, IconWarningOutline16,
} from './icons.tsx'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { PixelOffice } from './pixel-office/PixelOffice.tsx'
import { currentSessionId } from './session-navigation.ts'
import { roleLabel } from './role-labels.ts'
import { realmPaletteForLevel } from './realm-colors.ts'
import type { ModelDirectory, ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import {
  activityPanelExpandedForSession,
  activityPanelShouldAutoExpand,
  compactDagLayout,
  compactModelLabel,
  COMPACT_DAG_NODE_HEIGHT,
  COMPACT_DAG_NODE_WIDTH,
  dependencyFocusTaskId,
  memberRouteLabel,
  orderDelegationMembers,
  relatedTaskIds,
  taskModelLabel,
  teamIsActive,
  usesParallelTaskGrid,
} from './activity-model.ts'
import {
  ACTIVITY_HALT_URL,
  ACTIVITY_RESUME_URL,
  getActivityMonitorTargetsSnapshot,
  getActivitySnapshotsSnapshot,
  startActivityPolling,
  subscribeActivityMonitorTargets,
  subscribeActivitySnapshots,
  type ActivityMember,
  type ActivityTask,
  type ActivityTeam,
} from './activity-monitor.ts'
import { ACTION_ART, LEAD_ART, memberArtUrl } from './artwork.ts'
import { captainKey, cultivationFromXp, memberKey } from './cultivation.ts'
import { useCultivationVersion, xpOf } from './cultivation-store.ts'
import { OPEN_PANEL_EVENT } from './AgentTeamsCard.tsx'
import { StagingPlanEditor } from './StagingPlanEditor.tsx'
import type { AgentTeamsCardData } from './agent-teams-card-definition.ts'
import type { AgentTeamsLocaleKey, AgentTeamsTranslate } from './locales.ts'
import {
  DEFAULT_PANEL_LAYOUT,
  PANEL_LAYOUT_STORAGE_KEY,
  compactPanelForBounds,
  dockPanelLayout,
  floatPanelLayout,
  movePanelLayout,
  panelMaximumHeight,
  panelUsesAutoHeight,
  parsePanelLayout,
  resizePanelLayout,
  resolvePanelGeometry,
  type PanelBounds,
  type PanelLayout,
  type PanelResizeEdge,
} from './panel-geometry.ts'
import css from './ActivityPanel.module.css'

/** Grace before the panel collapses once no team remains. */
const AUTOCLOSE_GRACE_MS = 2000
/**
 * Page-settle window after mount: activity restored on page load only shows
 * the collapsed badge, so the panel never yanks the conversation column
 * right after load. New activity after this window auto-expands as usual.
 */
const AUTO_OPEN_SETTLE_MS = 4000
/** Root marker shared with the panel CSS while the shell overlay is expanded. */
const PANEL_OPEN_ATTRIBUTE = 'data-agent-teams-panel-open'
/** Shared width concession consumed by the conversation root CSS. */
const PANEL_SHIFT_PROPERTY = '--agent-teams-panel-shift'
const PANEL_CONVERSATION_GAP = 14
const MOVE_THRESHOLD = 4
const CAPTAIN_ASSIGNEE = 'captain'

/** 等级牌用境界色：底色/文字/描边与洞府场景共用一套调色板。 */
function realmChipStyle(level: number): CSSProperties {
  const palette = realmPaletteForLevel(level)
  return {
    background: palette.background,
    color: palette.text,
    boxShadow: `inset 0 0 0 1px ${palette.border}`,
  }
}

type PanelGesture = {
  readonly kind: 'move' | 'resize'
  readonly edge?: PanelResizeEdge
  readonly pointerId: number
  readonly originX: number
  readonly originY: number
  readonly start: PanelLayout
  activated: boolean
}

/** Persisted floater preference: board view vs pixel-office view. */
const OFFICE_VIEW_KEY = 'dsh-pixel-team.officeView'
/** Persisted dependency rendering: the original DAT map or the vertical flow. */
const DEPENDENCY_VIEW_KEY = 'dsh-pixel-team.dependencyView'

function initialPanelLayout(): PanelLayout {
  if (typeof window === 'undefined') return DEFAULT_PANEL_LAYOUT
  return parsePanelLayout(window.localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY))
}

function initialPanelBounds(): PanelBounds {
  if (typeof window === 'undefined') return { width: 1440, height: 900, anchorRight: 1440 }
  return { width: window.innerWidth, height: window.innerHeight, anchorRight: window.innerWidth }
}

/** Initial-letter fallback for unmatched roles. */
function memberInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

function stableHash(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

const ACCENTS = [
  'var(--dsw-alias-state-business-primary)',
  'var(--dsw-alias-state-success-primary)',
  'var(--dsw-alias-state-error-primary)',
  'var(--dsw-alias-state-warn-primary)',
  'var(--dsw-alias-label-tertiary)',
] as const

function accentOf(id: string): string {
  return ACCENTS[stableHash(id) % ACCENTS.length] ?? ACCENTS[0]
}

/** Badge text follows the raw task status:
 * claimed/pending/failed/cancelled keep their own labels and colors. */
const TASK_STATUS_LABEL: Record<string, AgentTeamsLocaleKey> = {
  pending: 'task.status.pending',
  claimed: 'task.status.claimed',
  in_progress: 'task.status.inProgress',
  completed: 'task.status.completed',
  failed: 'task.status.failed',
  cancelled: 'task.status.cancelled',
}

function taskStatusLabel(status: string, t: AgentTeamsTranslate): string {
  const key = TASK_STATUS_LABEL[status]
  return key === undefined ? status : t(key)
}

function formatTaskIds(ids: readonly string[], t: AgentTeamsTranslate): string {
  return ids.join(t('format.listSeparator'))
}

function taskTitle(task: ActivityTask, model: string): string {
  const extras = [
    task.kind,
    task.round === undefined ? undefined : `r${task.round}`,
    task.verdict,
    // Never show a bare pass: the audited verdict may no longer describe the
    // bytes currently on disk (issue #161).
    task.verdictStale === undefined ? undefined : `⚠ ${task.verdictStale}`,
    model === '' ? undefined : model,
  ].filter((item): item is string => item !== undefined)
  return extras.length === 0 ? `${task.id} · ${task.subject}` : `${task.id} · ${task.subject} · ${extras.join(' · ')}`
}

/** Badge/bar coloring key: visual state, widened for terminal statuses. */
function taskTone(state: ActivityTask['state'], status: string): string {
  if (status === 'failed') return 'failed'
  if (status === 'cancelled') return 'cancelled'
  return state
}

function Chevron({ open }: { readonly open: boolean }) {
  return (
    <svg className={css.chevron} data-open={open} width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M3.5 2l3 3-3 3" />
    </svg>
  )
}

function WorkGlyph({ active }: { readonly active: boolean }) {
  return (
    <svg className={css.workGlyph} data-active={active} width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
      {[[0, 0], [4.2, 0], [8.4, 0], [0, 4.2], [4.2, 4.2], [8.4, 4.2]].map(([x, y], index) => (
        <rect key={`${x}:${y}`} x={x} y={y} width="2.6" height="2.6" rx=".6" style={{ animationDelay: `${index * 0.15}s` }} />
      ))}
    </svg>
  )
}

/** Collapsed badge: an always-visible corner pill while any team exists. */
function CollapsedBadge({ count, busy, onClick, t }: {
  readonly count: number
  readonly busy: boolean
  readonly onClick: () => void
  readonly t: AgentTeamsTranslate
}) {
  return (
    <button type="button" className={css.badge} data-agent-teams-collapsed data-busy={busy} onClick={onClick} aria-label={t('activity.badgeAria', { count })}>
      <span className={css.badgeDot} data-busy={busy} aria-hidden />
      <span className={css.badgeCount}>{count}</span>
    </button>
  )
}

function memberStateLabel(
  member: ActivityMember,
  tasks: readonly ActivityTask[],
  historic: boolean,
  t: AgentTeamsTranslate,
): string {
  const owned = tasks.filter((task) => task.assignee === member.name)
  if (member.activity === 'working') return t('member.state.working')
  if (owned.some((task) => task.status === 'failed')) return t('member.state.failed')
  if (owned.some((task) => task.state === 'blocked')) return t('member.state.waiting')
  if (owned.length > 0 && owned.every((task) => task.status === 'completed')) return t('member.state.delivered')
  if (member.status === 'removed') return t(historic ? 'member.state.left' : 'member.state.removed')
  if (owned.length > 0) return t('member.state.pending')
  return t('member.state.unassigned')
}

function memberStatusText(
  member: ActivityMember,
  tasks: readonly ActivityTask[],
  t: AgentTeamsTranslate,
): string {
  const owned = tasks.filter((task) => task.assignee === member.name)
  const current = owned.find((task) => task.id === member.currentTask)
  const blocked = owned.find((task) => task.state === 'blocked')
  if (member.activity === 'working' && current !== undefined) {
    const model = taskModelLabel(current, [member])
    return model === ''
      ? t('member.status.executing', { taskId: current.id })
      : t('member.status.executingModel', { taskId: current.id, model })
  }
  if (member.activity === 'working') return t('member.status.working')
  if (blocked !== undefined) {
    const dependency = tasks.find((task) => blocked.dependencies.includes(task.id) && task.state !== 'completed')
    if (dependency !== undefined) {
      return t('member.status.waitingOn', {
        taskId: dependency.id,
        assignee: dependency.assignee || t('task.assignee.unclaimed'),
      })
    }
    return t('member.status.waitingPrerequisite')
  }
  if (member.total === 0) return t('member.status.waitingAssignment')
  if (member.done === member.total) return t('member.status.delivered')
  if (owned.some((task) => task.status === 'failed')) return t('task.detail.failed')
  if (owned.length > 0 && owned.every((task) => task.status === 'completed' || task.status === 'cancelled')) return t('member.status.settled')
  return t(member.activity === 'idle' ? 'member.status.idle' : 'member.status.unknown')
}

function compactTaskLabel(subject: string): string {
  const withoutVerb = subject.replace(/^开发\s*/u, '').replace(/^\d+[-_.、\s]*/u, '')
  const head = withoutVerb.split(/[（(·：:]/u)[0]?.trim() ?? withoutVerb
  return head.length > 18 ? `${head.slice(0, 17)}…` : head
}

function taskSummary(team: ActivityTeam, t: AgentTeamsTranslate, discarded = false): string {
  const completed = team.tasks.filter((task) => task.status === 'completed')
  const cancelled = team.tasks.filter((task) => task.status === 'cancelled')
  const running = team.tasks.filter((task) => task.state === 'running')
  const claimed = team.tasks.filter((task) => task.state === 'claimed')
  const blocked = team.tasks.filter((task) => task.state === 'blocked')
  const ready = team.tasks.filter((task) => task.state === 'open' && task.status !== 'completed' && task.status !== 'failed' && task.status !== 'cancelled')
  const failed = team.tasks.filter((task) => task.status === 'failed')
  if (discarded) return t('task.summary.discarded', { count: team.tasks.length })
  if (team.tasks.length === 0) return t('task.summary.waitingBreakdown')
  if (team.phase === 'staged') return t('task.summary.staged', { count: team.tasks.length })
  if (completed.length === team.tasks.length) return t('task.summary.allDelivered', { count: completed.length })
  if (completed.length + cancelled.length + failed.length === team.tasks.length) {
    return t('task.summary.ended', {
      completed: completed.length,
      cancelled: cancelled.length,
      failed: failed.length,
    })
  }
  if (failed.length > 0 && running.length === 0 && claimed.length === 0 && ready.length === 0 && blocked.length === 0) {
    return t('task.summary.failedSettled', { count: failed.length })
  }
  if (blocked.length > 0 && running.length > 0) {
    return t('task.summary.blockedAndRunning', {
      tasks: formatTaskIds(blocked.slice(0, 3).map((task) => task.id), t),
      more: blocked.length > 3 ? t('task.summary.more', { count: blocked.length - 3 }) : '',
    })
  }
  if (running.length > 0) return t('task.summary.running', { tasks: formatTaskIds(running.map((task) => task.id), t) })
  if (claimed.length > 0) return t('task.summary.claimed', { tasks: formatTaskIds(claimed.map((task) => task.id), t) })
  if (ready.length > 0) return t('task.summary.ready', { tasks: formatTaskIds(ready.map((task) => task.id), t) })
  if (blocked.length > 0) return t('task.summary.blocked', { tasks: formatTaskIds(blocked.map((task) => task.id), t) })
  return t('task.summary.waitingSchedule')
}

function ProgressOverview({ team, t, discarded = false }: { readonly team: ActivityTeam; readonly t: AgentTeamsTranslate; readonly discarded?: boolean }) {
  const running = discarded ? 0 : team.tasks.filter((task) => task.state === 'running').length
  const claimed = discarded ? 0 : team.tasks.filter((task) => task.state === 'claimed').length
  const blocked = discarded ? 0 : team.tasks.filter((task) => task.state === 'blocked').length
  const completed = discarded ? 0 : team.tasks.filter((task) => task.status === 'completed').length
  const settled = !discarded && team.tasks.length > 0 && team.tasks.every((task) => (
    task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
  ))
  const summaryTone = discarded ? 'discarded' : blocked > 0 || team.tasks.some(task => task.status === 'failed' || task.status === 'cancelled') ? 'warning' : settled ? 'completed' : 'running'
  return (
    <section className={css.progressOverview} aria-label={t('progress.aria')} data-progress-summary>
      <span className={css.progressTitle}>{t('progress.title')}</span>
      {team.tasks.length > 0 ? (
        <span className={css.progressSegments} aria-hidden>
          {team.tasks.map((task) => <span key={task.id} data-state={discarded ? 'cancelled' : taskTone(task.state, task.status)} />)}
        </span>
      ) : <span className={css.progressEmpty} />}
      <span className={css.progressLegend}>
        <span data-state="running">{t('progress.running', { count: running })}</span>
        {claimed > 0 && <span data-state="claimed">{t('progress.claimed', { count: claimed })}</span>}
        <span data-state="blocked">{t('progress.blocked', { count: blocked })}</span>
        <span data-state="completed">{t('progress.delivered', { count: completed })}</span>
      </span>
      <span className={css.progressSummary} data-state={summaryTone}>
        <span className={css.progressSummaryDot} />
        <span>{taskSummary(team, t, discarded)}</span>
      </span>
    </section>
  )
}

function DependencyMap({ tasks, members, t, discarded = false, workspace = false, onSelectTask }: {
  readonly tasks: readonly ActivityTask[]
  readonly members: readonly ActivityMember[]
  readonly t: AgentTeamsTranslate
  readonly discarded?: boolean
  readonly workspace?: boolean
  readonly onSelectTask?: (id: string | null) => void
}) {
  const [open, setOpen] = useState(true)
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null)
  const [keyboardTaskId, setKeyboardTaskId] = useState<string | null>(null)
  const [pinnedTaskId, setPinnedTaskId] = useState<string | null>(null)
  // 依赖图两种呈现：DAT 版（原横向连线）与纵向拓扑 flow（带修士像素人）。
  const [dependencyView, setDependencyView] = useState<'dat' | 'flow'>(() => {
    if (typeof window === 'undefined') return 'flow'
    try { return window.localStorage.getItem(DEPENDENCY_VIEW_KEY) === 'dat' ? 'dat' : 'flow' } catch { return 'flow' }
  })
  const chooseDependencyView = (next: 'dat' | 'flow'): void => {
    setDependencyView(next)
    try { window.localStorage.setItem(DEPENDENCY_VIEW_KEY, next) } catch { /* private mode */ }
  }
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusedTaskId = dependencyFocusTaskId(pinnedTaskId, keyboardTaskId, hoverTaskId)
  // 工作台可选「DAT 版横向连线」或「纵向拓扑 flow」；浮窗保持紧凑横向。
  const flow = workspace && dependencyView === 'flow'
  const nodeWidth = flow ? 190 : workspace ? 164 : COMPACT_DAG_NODE_WIDTH
  const nodeHeight = workspace ? 76 : COMPACT_DAG_NODE_HEIGHT
  const layout = useMemo(() => {
    if (flow) return compactDagLayout(tasks, { nodeWidth: 190, nodeHeight: 76, columnGap: 24, rowGap: 28, direction: 'vertical' })
    if (workspace) return compactDagLayout(tasks, { nodeWidth: 164, nodeHeight: 76, columnGap: 36, rowGap: 16 })
    return compactDagLayout(tasks)
  }, [tasks, flow, workspace])
  const parallel = useMemo(() => usesParallelTaskGrid(tasks), [tasks])
  const memberByName = useMemo(() => new Map(members.map((member) => [member.name, member])), [members])
  const related = useMemo(
    () => focusedTaskId === null ? null : relatedTaskIds(focusedTaskId, tasks),
    [focusedTaskId, tasks],
  )
  const scheduleHover = (id: string | null): void => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    if (id === null) {
      setHoverTaskId(null)
      return
    }
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null
      setHoverTaskId(id)
    }, 180)
  }
  useEffect(() => () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') { setPinnedTaskId(null); onSelectTask?.(null) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [onSelectTask])
  if (tasks.length === 0) return null
  const fallbackTask = tasks.find((task) => task.state === 'blocked')
    ?? tasks.find((task) => task.state === 'running')
    ?? tasks.find((task) => task.state === 'claimed')
    ?? tasks[0]!
  const detailTask = tasks.find((task) => task.id === focusedTaskId) ?? fallbackTask
  const detailModel = taskModelLabel(detailTask, members)
  const waitingOn = detailTask.dependencies.filter((dependency) => (
    tasks.find((task) => task.id === dependency)?.status !== 'completed'
  ))
  const dependents = tasks.filter((task) => task.dependencies.includes(detailTask.id))
  return (
    <section className={css.dependencySection} aria-label={t('dependency.aria')} data-dependency-map>
      <header className={css.sectionHead}>
        <button type="button" className={css.sectionToggleTitle} onClick={() => { setOpen((current) => !current) }} aria-expanded={open}>
          <Chevron open={open} /><IconBranchOutline16 /> {t(parallel ? 'dependency.parallel' : 'dependency.title')}
        </button>
        <span className={css.sectionHeadRight}>
          <span className={css.sectionHint}>{pinnedTaskId === null
            ? t(parallel ? 'dependency.hint.parallel' : workspace ? 'workspace.dependencies' : 'dependency.hint.chain')
            : t('dependency.hint.pinned', { taskId: pinnedTaskId })}</span>
          {workspace && (
            <span className={css.dependencyViews} role="group" aria-label={t('dependency.viewAria')}>
              <button type="button" data-control="dependency-view-dat" aria-pressed={dependencyView === 'dat'} onClick={() => { chooseDependencyView('dat') }}>{t('dependency.viewDat')}</button>
              <button type="button" data-control="dependency-view-flow" aria-pressed={dependencyView === 'flow'} onClick={() => { chooseDependencyView('flow') }}>{t('dependency.viewFlow')}</button>
            </span>
          )}
        </span>
      </header>
      {open && (
        <>
          <div className={css.dagViewport}>
            <div
              className={css.dagCanvas}
              data-layout={parallel ? 'parallel' : 'dependency'}
              style={parallel ? undefined : { width: layout.width, height: layout.height }}
            >
              {!parallel && <svg className={css.dagEdges} width={layout.width} height={layout.height} aria-hidden>
                {layout.edges.map((edge) => {
                  const active = related !== null && related.has(edge.from) && related.has(edge.to)
                  return <path key={`${edge.from}:${edge.to}`} d={edge.path} data-active={active} data-dimmed={related !== null && !active} />
                })}
              </svg>}
              {layout.nodes.map(({ task, x, y }) => {
                const model = taskModelLabel(task, members)
                const member = flow ? memberByName.get(task.assignee) : undefined
                const art = flow ? memberArtUrl(task.assignee, member?.role ?? '') : null
                return (
                  <button
                    key={task.id}
                    type="button"
                    className={css.dagNode}
                    style={parallel
                      ? { height: nodeHeight }
                      : { left: x, top: y, width: nodeWidth, height: nodeHeight }}
                    data-task-id={task.id}
                    data-state={discarded ? 'cancelled' : taskTone(task.state, task.status)}
                    data-verdict-stale={task.verdictStale === undefined ? undefined : 'true'}
                    data-task-model={model || undefined}
                    data-portrait={art !== null || undefined}
                    data-focused={related?.has(task.id) ?? false}
                    data-dimmed={related !== null && !related.has(task.id)}
                    aria-pressed={pinnedTaskId === task.id}
                    title={taskTitle(task, model)}
                    onClick={() => { const next = pinnedTaskId === task.id ? null : task.id; setPinnedTaskId(next); onSelectTask?.(next) }}
                    onMouseEnter={() => { scheduleHover(task.id) }}
                    onMouseLeave={() => { scheduleHover(null) }}
                    onFocus={() => { setKeyboardTaskId(task.id) }}
                    onBlur={() => { setKeyboardTaskId(null) }}
                  >
                    <span className={css.dagNodeHead}><span className={css.dagNodeDot} />{task.id}{workspace && <span className={css.dagOwner}>{task.assignee || t('task.assignee.unclaimed')}</span>}</span>
                    <span className={css.dagNodeLabel}>
                      {workspace ? task.subject : compactTaskLabel(task.subject)}
                    </span>
                    {art !== null && <img className={css.dagPortrait} src={art} alt="" aria-hidden />}
                    {!discarded && task.state === 'claimed' && <span className={css.dagClaimedState}>{t('task.status.claimed')}</span>}
                    {task.state === 'running' && (
                      <span className={css.dagRunningState} aria-label={t('task.runningAria')}>
                        <WorkGlyph active />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <section className={css.taskDetail} data-task-detail={detailTask.id}>
            <span className={css.taskDetailHead}>
              <span className={css.taskDetailId}>{detailTask.id}</span>
              <span className={css.taskDetailSubject} title={detailTask.subject}>{detailTask.subject.replace(/^开发\s*/u, '')}</span>
              <span className={css.taskDetailBadge} data-state={discarded ? 'cancelled' : taskTone(detailTask.state, detailTask.status)}>
                {discarded ? t('task.status.notRun') : taskStatusLabel(detailTask.status, t)}
              </span>
            </span>
            <span className={css.taskDetailLine}>
              {detailTask.assignee || t('task.assignee.unclaimed')} · {discarded
                ? t('task.detail.notRun')
                : detailTask.status === 'completed'
                ? t('task.detail.completed')
                : detailTask.status === 'cancelled'
                  ? t('task.detail.cancelled')
                : detailTask.status === 'failed'
                  ? t('task.detail.failed')
                : detailTask.dependencies.length === 0
                ? t('task.detail.noPrerequisite')
                : waitingOn.length === 0
                  ? t('task.detail.ready')
                  : t('task.detail.waitingOn', { tasks: formatTaskIds(waitingOn, t) })}
            </span>
            {detailModel !== '' && (
              <span className={css.taskDetailModel} data-task-model={detailModel}>
                {t('task.model', { model: detailModel })}
              </span>
            )}
            <span className={css.taskDetailMeta}>{dependents.length === 0
              ? t('task.detail.noDownstream')
              : t('task.detail.unlocks', { tasks: formatTaskIds(dependents.map((task) => task.id), t) })}</span>
          </section>
        </>
      )}
    </section>
  )
}

export function TeamSection({ team, modelDirectory, onContinuePlanning, onDiscarded, onNavigate, onOpenCaptain, viewingSessionId, t, historic = false, workspace = false }: {
  readonly team: ActivityTeam
  readonly modelDirectory?: ModelDirectory
  readonly onContinuePlanning?: () => void
  readonly onDiscarded?: () => void
  /** Clicking the captain card returns to the main conversation. */
  readonly onOpenCaptain?: () => void
  /** Session whose conversation is open; the member card shows 对话中. */
  readonly viewingSessionId?: string
  /** Navigate to a member transcript (floater hides immediately). */
  readonly onNavigate: (parentId: SessionId, childId: SessionId) => void
  readonly t: AgentTeamsTranslate
  readonly historic?: boolean
  readonly workspace?: boolean
}) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const selectedAssignee = team.tasks.find(task => task.id === selectedTaskId)?.assignee
  const [membersOpen, setMembersOpen] = useState(workspace)
  const [stopOpen, setStopOpen] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stopError, setStopError] = useState('')
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const discarded = historic && team.phase === 'staged'
  const stopped = !historic && team.halted === true
  const busyCount = team.members.filter((member) => member.activity === 'working').length
  const captainViewing = viewingSessionId !== undefined && viewingSessionId === team.captainSessionId
  useCultivationVersion()
  const captainCultivation = cultivationFromXp(xpOf(captainKey(team.name)))
  const assignedCount = team.tasks.filter((task) => task.assignee !== '' && task.assignee !== CAPTAIN_ASSIGNEE).length
  const captainOwned = team.tasks.filter((task) => task.assignee === CAPTAIN_ASSIGNEE
    && task.status !== 'completed' && task.status !== 'failed' && task.status !== 'cancelled')
  const captainBusy = captainOwned.length > 0
  const captainTaskIds = formatTaskIds(captainOwned.map((task) => task.id), t)
  const completedCount = team.tasks.filter((task) => task.status === 'completed').length
  const allCompleted = team.tasks.length > 0 && completedCount === team.tasks.length
  const allSettled = team.tasks.length > 0 && team.tasks.every((task) => (
    task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
  ))
  const unfinishedCount = team.tasks.filter((task) => (
    task.status !== 'completed' && task.status !== 'failed' && task.status !== 'cancelled'
  )).length
  // 全部完成即「已完成」终态：不再提供停止/重新开始。
  const canStop = !historic && team.phase === 'running' && team.halted !== true && !allCompleted && teamIsActive(team)
  // 停止后从面板重新开始：与掌门工具 agent_teams_resume 同一条宿主路径。
  const resumeTeam = async (): Promise<void> => {
    if (resuming) return
    setResuming(true)
    setResumeError('')
    try {
      const response = await fetch(ACTIVITY_RESUME_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: team.captainSessionId, reason: t('team.resumeReason') }),
      })
      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const body = await response.json() as { error?: unknown }
          if (typeof body.error === 'string' && body.error.trim() !== '') message = body.error
        } catch {}
        throw new Error(message)
      }
    } catch (error: unknown) {
      setResumeError(t('team.resumeFailed', { message: error instanceof Error ? error.message : String(error) }))
    } finally {
      setResuming(false)
    }
  }
  const stopTeam = async (): Promise<void> => {
    if (stopping) return
    setStopping(true)
    setStopError('')
    try {
      const response = await fetch(ACTIVITY_HALT_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: team.captainSessionId, teamId: team.teamId }),
      })
      if (!response.ok) {
        let message = t('team.stopRequestFailed')
        try {
          const body = await response.json() as { error?: unknown }
          if (typeof body.error === 'string' && body.error.trim() !== '') message = body.error
        } catch {}
        throw new Error(message)
      }
      setStopOpen(false)
    } catch (error: unknown) {
      setStopError(t('team.stopFailed', { message: error instanceof Error ? error.message : String(error) }))
    } finally {
      setStopping(false)
    }
  }
  return (
    <>
      <section className={css.team} data-team-id={team.teamId} data-workspace-team={workspace || undefined}>
        <header className={css.teamHead}>
          <span className={css.teamName} title={team.name}>{team.name}</span>
          {!historic && team.phase === 'running' && !stopped && (
            <span className={css.statePill} data-state={allCompleted ? 'completed' : 'running'}>
              {t(allCompleted ? 'team.state.completed' : 'team.state.running')}
            </span>
          )}
          {historic && <span className={css.historicPill}>{t(discarded ? 'team.discarded' : 'team.ended')}</span>}
          {stopped && <span className={css.historicPill}>{t('team.stopped')}</span>}
          {stopped && (
            <button
              type="button"
              className={css.teamResumeButton}
              data-control="team-resume"
              disabled={resuming}
              onClick={() => { void resumeTeam() }}
              title={t('team.resume')}
            >
              <span aria-hidden>▶</span>
              {resuming ? t('team.resuming') : t('team.resume')}
            </button>
          )}
          <span className={css.teamStats}>
            <span data-stat="members">{t('team.stats.members', { count: team.members.length })}</span>
            <span data-stat="tasks">{t('team.stats.completed', { completed: completedCount, total: team.tasks.length })}</span>
            <span data-stat="messages">{t('team.stats.messages', { count: team.messageCount })}</span>
          </span>
          {canStop && (
            <button
              type="button"
              className={css.teamStopButton}
              aria-label={t('team.stop')}
              title={t('team.stop')}
              onClick={() => { setStopError(''); setStopOpen(true) }}
            >
              <IconStopFill16 />
            </button>
          )}
        </header>

        {resumeError !== '' && <p className={css.teamResumeError} role="alert">{resumeError}</p>}

        {team.phase === 'staged' && !historic && modelDirectory !== undefined && onContinuePlanning !== undefined && onDiscarded !== undefined && (
          <StagingPlanEditor
            team={team}
            modelDirectory={modelDirectory}
            onContinuePlanning={onContinuePlanning}
            onDiscarded={onDiscarded}
            t={t}
          />
        )}

      <section className={css.delegationSection} aria-label={t('delegation.aria')} data-delegation-map>
        <div
          className={css.captainNode}
          data-clickable={onOpenCaptain === undefined ? undefined : 'true'}
          data-viewing={captainViewing || undefined}
          role={onOpenCaptain === undefined ? undefined : 'button'}
          tabIndex={onOpenCaptain === undefined ? undefined : 0}
          onClick={onOpenCaptain}
          onKeyDown={onOpenCaptain === undefined ? undefined : (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenCaptain() }
          }}
        >
          <span className={css.captainAvatar}>
            <img className={css.leadAvatar} src={LEAD_ART} alt="" aria-hidden />
          </span>
          <span className={css.captainInfo}>
            <span className={css.captainLine}>
              <span className={css.captainName}>{t('captain.name')}</span>
              <span className={css.captainRole}>{t('captain.role')}</span>
              <span
                className={css.memberLevel}
                style={realmChipStyle(captainCultivation.level)}
                title={`${captainCultivation.xp} / ${captainCultivation.next} XP · ${captainCultivation.skills.length === 0 ? t('skill.none') : captainCultivation.skills.map(key => t(key)).join(' / ')}`}
              >
                Lv.{captainCultivation.level} {t(captainCultivation.rankKey)}
              </span>
              {captainViewing && <span className={css.viewingBadge}>{t('office.viewingState')}</span>}
            </span>
            <span className={css.captainSummary}>{discarded
              ? t('captain.summary.discarded', { tasks: team.tasks.length, members: team.members.length })
              : captainBusy
                ? t('captain.summary.withTakeover', { tasks: assignedCount, captainTasks: captainTaskIds })
              : team.phase === 'staged'
                ? t(team.planReviewState === 'awaiting_feedback'
                  ? 'captain.summary.awaitingFeedback'
                  : 'captain.summary.staged', { tasks: team.tasks.length, members: team.members.length })
                : t('captain.summary', { tasks: assignedCount, members: team.members.length })}</span>
          </span>
          <span className={css.captainState} data-busy={captainBusy || busyCount > 0}>
            <WorkGlyph active={captainBusy || busyCount > 0} />
            {discarded
              ? t('captain.state.discarded')
              : captainBusy
                ? t('captain.state.takeover', { tasks: captainTaskIds })
              : team.phase === 'staged'
                ? t(team.planReviewState === 'awaiting_feedback'
                  ? 'captain.state.awaitingFeedback'
                  : 'captain.state.staged')
              : busyCount > 0
                ? t('captain.state.working', { count: busyCount })
                : t(allCompleted
                  ? 'captain.state.collected'
                  : allSettled
                    ? 'captain.state.settled'
                    : 'captain.state.waiting')}
          </span>
        </div>

        {!workspace && <ProgressOverview team={team} t={t} discarded={discarded} />}

        {(() => {
          const orderedMembers = orderDelegationMembers(team.members, team.tasks)
          const runningMembers = orderedMembers.filter((member) => (
            member.activity === 'working' || member.status === 'working'
            || team.tasks.some((task) => task.assignee === member.name
              && (task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress'))
          ))
          const visibleMembers = membersOpen ? orderedMembers : runningMembers
          const hiddenFinishedCount = orderedMembers.length - visibleMembers.length
          const expandLabel = membersOpen
            ? t('members.collapse')
            : hiddenFinishedCount > 0
              ? t('members.expandFinished', { count: hiddenFinishedCount })
              : t('members.expand')
          return (
            <>
              <button type="button" className={css.membersToggle} onClick={() => { setMembersOpen((current) => !current) }} aria-expanded={membersOpen} data-members-toggle>
                <span><Chevron open={membersOpen} />{t('members.toggle', { count: team.members.length })}</span>
                <span>{expandLabel}</span>
              </button>

              {(membersOpen || visibleMembers.length > 0) && <div className={css.delegationTree}>
                {team.members.length === 0 && <span className={css.emptyHint}>{t('members.empty')}</span>}
                {visibleMembers.map((member) => {
                  const owned = team.tasks.filter((task) => task.assignee === member.name)
                  const memberModel = memberRouteLabel(member)
                  // 进度与协作都直接写进成员卡：完成比例条 + 交给下一个修士的任务。
                  const progressTotal = member.total ?? 0
                  const progressDone = member.done ?? 0
                  const progressPct = progressTotal > 0
                    ? Math.round((progressDone / progressTotal) * 100)
                    : Math.max(0, Math.min(100, member.progress ?? 0))
                  const viewing = viewingSessionId !== undefined && member.id === viewingSessionId
                  const cultivation = cultivationFromXp(xpOf(memberKey(member.name)))
                  const progressState = progressTotal > 0 && progressDone >= progressTotal
                    ? 'completed'
                    : owned.some((task) => task.state === 'failed') ? 'failed' : undefined
                  const handoff = team.tasks.find((task) => (
                    task.status !== 'completed'
                    && task.assignee !== member.name
                    && task.dependencies.some((id) => owned.some((own) => own.id === id && own.status === 'completed'))
                  ))
                  return (
              <div key={member.id || member.name} className={css.memberBlock} data-activity={member.activity} data-realm={(member.progress ?? 0) >= 40 ? 'high' : undefined} data-viewing={viewing || undefined} data-selected-member={workspace && selectedAssignee === member.name || undefined}>
                <span className={css.memberBranch} aria-hidden><span /></span>
                <button
                  type="button"
                  className={css.memberRow}
                  data-activity={member.activity}
                  onClick={() => {
                    if (member.id !== '') {
                      onNavigate(team.captainSessionId as SessionId, member.id as SessionId)
                    }
                  }}
                >
                  <span className={css.memberAvatar} data-unread={member.unread > 0}>
                    {memberArtUrl(member.name, member.role) !== null ? (
                      <img className={css.memberArt} src={memberArtUrl(member.name, member.role) ?? ''} alt="" aria-hidden />
                    ) : (
                      <span className={css.memberInitial} style={{ background: accentOf(member.id) }}>{memberInitial(member.name)}</span>
                    )}
                    <img className={css.stateArt} data-activity={member.activity} src={ACTION_ART[member.activity]} alt="" aria-hidden />
                  </span>
                  <span className={css.memberInfo}>
                    <span className={css.memberLine}>
                      <span className={css.memberName}>{member.name}</span>
                      {member.role !== '' && <span className={css.memberRole}>{roleLabel(member.role, member.name, t)}</span>}
                      <span
                        className={css.memberLevel}
                        style={realmChipStyle(cultivation.level)}
                        title={`${cultivation.xp} / ${cultivation.next} XP · ${cultivation.skills.length === 0 ? t('skill.none') : cultivation.skills.map(key => t(key)).join(' / ')}`}
                      >
                        Lv.{cultivation.level} {t(cultivation.rankKey)}
                      </span>
                      {/* Inline member model badge: compact visible label, full route in
                          title/aria-label (accessible tooltip) and the data-member-model
                          DOM probe; noninteractive span, no tab stop. */}
                      {memberModel !== '' && (
                        <span className={css.memberModel} role="img" data-member-model={memberModel} title={memberModel} aria-label={memberModel}>
                          {compactModelLabel(memberModel)}
                        </span>
                      )}
                      <span className={css.memberState} data-activity={member.activity} data-viewing={viewing || undefined}>
                        <WorkGlyph active={member.activity === 'working'} />
                        {viewing
                          ? t('office.viewingState')
                          : discarded
                            ? t('member.state.notCreated')
                            : stopped
                              ? t('member.state.stopped')
                              : team.phase === 'staged'
                                ? t('member.state.staged')
                                : memberStateLabel(member, team.tasks, historic, t)}
                      </span>
                    </span>
                    <span className={css.memberStatusLine}>{discarded
                      ? t('member.status.discarded')
                      : stopped
                        ? t('member.status.stopped')
                        : team.phase === 'staged'
                          ? t('member.status.staged')
                      : historic && owned.length > 0 && owned.every((task) => (
                        task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
                      ))
                        ? t('member.status.settled')
                      : memberStatusText(member, team.tasks, t)}</span>
                    <span className={css.memberProgress} data-state={progressState}>
                      <span className={css.memberProgressTrack}>
                        <span className={css.memberProgressFill} data-state={progressState} style={{ width: `${progressPct}%` }} />
                      </span>
                    </span>
                    {handoff !== undefined && (
                      <span className={css.memberRel}>
                        <span aria-hidden>→</span>{t('member.rel.handoff', { name: handoff.assignee || t('task.assignee.unclaimed'), taskId: handoff.id })}
                      </span>
                    )}
                  </span>
                  <span className={css.memberCount}>{member.done}/{member.total}</span>
                </button>
                <div className={css.assignmentLine}>
                  <span className={css.assignmentLabel}>{t(discarded
                    ? 'assignment.discarded'
                    : team.phase === 'staged'
                      ? 'assignment.staged'
                      : 'assignment.label')}</span>
                  <span className={css.assignmentTasks}>
                    {owned.length === 0
                      ? <span className={css.taskEmpty}>{t('assignment.empty')}</span>
                      : owned.map((task) => {
                          const model = taskModelLabel(task, team.members)
                          const shortModel = compactModelLabel(model)
                          return (
                            <span
                              key={task.id}
                              className={css.assignmentChip}
                              data-state={discarded ? 'cancelled' : taskTone(task.state, task.status)}
                              data-verdict-stale={task.verdictStale === undefined ? undefined : 'true'}
                              data-task-model={model || undefined}
                              title={taskTitle(task, model)}
                            >
                              {task.state === 'running' && shortModel !== '' ? `${task.id} · ${shortModel}` : task.id}
                            </span>
                          )
                        })}
                  </span>
                </div>
                  </div>
                )
              })}
                </div>}
            </>
          )
        })()}
      </section>

      {/* 宗门进度页不再画独立的依赖图：交互关系与进度写在成员卡里，避免和上方像素人重复。 */}
      {!workspace && <DependencyMap tasks={team.tasks} members={team.members} t={t} discarded={discarded} workspace={workspace} onSelectTask={setSelectedTaskId} />}
      </section>
      <Modal
        open={stopOpen}
        onClose={() => { if (!stopping) setStopOpen(false) }}
        title={t('team.stopTitle', { team: team.name })}
        closeLabel={t('plan.cancel')}
        description={t('team.stopDescription', { tasks: unfinishedCount, members: busyCount })}
        footer={(
          <span className={css.stopModalActions}>
            <button type="button" disabled={stopping} onClick={() => { setStopOpen(false) }}>{t('team.stopCancel')}</button>
            <button type="button" data-danger disabled={stopping} onClick={() => { void stopTeam() }}>
              <IconStopFill16 />
              {stopping ? t('team.stopping') : t('team.stopConfirm')}
            </button>
          </span>
        )}
      >
        {stopError !== '' && <p className={css.stopModalError} role="alert"><IconWarningOutline16 />{stopError}</p>}
      </Modal>
    </>
  )
}

/** Legacy conversation cards may outlive their host archive. Project their
 * durable roster through the same rebuilt panel instead of a second UI. */
export function historicCardTeam(data: AgentTeamsCardData, owner: string): ActivityTeam {
  return {
    workspace: '',
    teamId: data.teamId,
    name: data.teamName,
    captainSessionId: data.captainSessionId || owner,
    phase: 'running',
    members: data.members.map((member) => ({
      ...member,
      status: 'removed',
      activity: 'idle',
      progress: 0,
      done: 0,
      total: 0,
      currentTask: '',
      unread: 0,
    })),
    tasks: [],
    messageCount: 0,
    captainInbox: [],
  }
}

/** The top-right activity floater. Teams follow the current session: live
 * snapshots and historic card summaries are only shown while their captain
 * session is the one currently open. */
export type ActivityPanelProps = {
  readonly conversationVisible?: boolean
  readonly sessionsList: ObservableSnapshot<SessionListState>
  readonly modelDirectories: ModelDirectoryResolver
  readonly openMember: (parentId: SessionId, childId: SessionId) => void
  /** Return to the team's main conversation (captain session). */
  readonly openCaptain?: (captainSessionId: SessionId) => void
} & PropsLocale<'agentTeams'>

export function ActivityPanel({ sessionsList, modelDirectories, openMember, t, conversationVisible = true }: ActivityPanelProps) {
  // Navigating to a member's subagent transcript is an explicit departure:
  // hide the floater immediately instead of waiting out the autocollapse
  // grace, so the panel never lingers over the member session.
  const navigateToSession = (parentId: SessionId, childId: SessionId): void => {
    setOpen(false)
    setWasActive(false)
    openMember(parentId, childId)
  }
  const [open, setOpen] = useState(false)
  const [openOwner, setOpenOwner] = useState<SessionId | undefined>()
  const [autoOpened, setAutoOpened] = useState(false)
  const [wasActive, setWasActive] = useState(false)
  const [historic, setHistoric] = useState<ReadonlyMap<string, { data: AgentTeamsCardData; owner: string }>>(new Map())
  const [officeMode, setOfficeMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return window.localStorage.getItem(OFFICE_VIEW_KEY) === '1' } catch { return false }
  })
  const setOfficeView = useCallback((next: boolean): void => {
    setOfficeMode(next)
    try { window.localStorage.setItem(OFFICE_VIEW_KEY, next ? '1' : '0') } catch { /* private mode */ }
  }, [])
  const [layout, setLayout] = useState<PanelLayout>(initialPanelLayout)
  const [bounds, setBounds] = useState<PanelBounds>(initialPanelBounds)
  const [interaction, setInteraction] = useState<'dragging' | 'resizing' | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const boundsRef = useRef(bounds)
  const gestureRef = useRef<PanelGesture | null>(null)
  const frameRef = useRef<number | null>(null)
  const pendingLayoutRef = useRef<PanelLayout | null>(null)
  const current = currentSessionId(useSyncExternalStore(
    sessionsList.subscribe,
    sessionsList.getSnapshot,
  ))
  const autoOpenTrackerRef = useRef<{
    sessionId: SessionId | undefined
    restoreComplete: boolean
    liveTeamIds: ReadonlySet<string>
  }>({ sessionId: current, restoreComplete: false, liveTeamIds: new Set() })
  const monitorTargets = useSyncExternalStore(
    subscribeActivityMonitorTargets,
    getActivityMonitorTargetsSnapshot,
  )
  const returnToComposer = (): void => {
    setOpen(false)
    setOpenOwner(undefined)
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(
        '[data-composer-card] [contenteditable="true"][role="textbox"], [data-composer-card] textarea',
      )?.focus()
    })
  }
  const { teams, archivedTeams } = useSyncExternalStore(
    subscribeActivitySnapshots,
    getActivitySnapshotsSnapshot,
  )
  const currentTargets = useMemo(
    () => current === undefined ? [] : monitorTargets.filter((target) => target.sessionId === current),
    [current, monitorTargets],
  )
  const currentRef = useRef(current)
  useEffect(() => { currentRef.current = current }, [current])
  const mountedAtRef = useRef(performance.now())
  const expanded = conversationVisible && activityPanelExpandedForSession(open, openOwner, current)
  const geometry = useMemo(() => resolvePanelGeometry(layout, bounds), [layout, bounds])
  const compact = compactPanelForBounds(bounds)

  const commitLayout = useCallback((next: PanelLayout): void => {
    setLayout(next)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(PANEL_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  // The slot sits inside AppFrame, so all geometry is measured against the
  // shell overlay rather than the browser viewport. The conversation's real
  // right edge is the dock anchor and naturally follows sidebar/details
  // concessions without importing their hashed implementation classes.
  useLayoutEffect(() => {
    const overlay = document.querySelector<HTMLElement>('[data-shell-overlay]')
    if (overlay === null) return
    const conversation = document.querySelector<HTMLElement>("[data-phase='active']")
    let frame: number | null = null
    const measure = (): void => {
      frame = null
      const overlayRect = overlay.getBoundingClientRect()
      const conversationRect = conversation?.getBoundingClientRect()
      const next: PanelBounds = {
        width: overlayRect.width,
        height: overlayRect.height,
        anchorRight: conversationRect === undefined
          ? overlayRect.width
          : Math.min(Math.max(conversationRect.right - overlayRect.left, 0), overlayRect.width),
      }
      const previous = boundsRef.current
      if (previous.width === next.width
        && previous.height === next.height
        && previous.anchorRight === next.anchorRight) return
      boundsRef.current = next
      setBounds(next)
    }
    const scheduleMeasure = (): void => {
      frame ??= requestAnimationFrame(measure)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure)
    observer?.observe(overlay)
    if (conversation !== null) observer?.observe(conversation)
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [current])

  // This shell overlay survives conversation route changes. Gate expansion by its
  // owning session during render, then clear stale state before paint. This
  // removes the old panel immediately instead of waiting for the no-team
  // autoclose grace period on the destination page.
  useLayoutEffect(() => {
    const tracker = autoOpenTrackerRef.current
    if (tracker.sessionId !== current) {
      tracker.sessionId = current
      tracker.restoreComplete = false
      tracker.liveTeamIds = new Set()
      setWasActive(false)
      setAutoOpened(false)
    }
    if (openOwner === undefined || openOwner === current) return
    setOpen(false)
    setOpenOwner(undefined)
  }, [current, openOwner])

  // Only the wide docked mode asks the conversation column to yield. Floating
  // and compact modes are intentionally true overlays. The width is written as
  // one shared variable so the panel and the concession cannot drift apart.
  useLayoutEffect(() => {
    const root = document.documentElement
    const shouldYield = expanded && geometry.mode === 'docked' && !compact
    if (shouldYield) {
      root.setAttribute(PANEL_OPEN_ATTRIBUTE, '')
      root.style.setProperty(PANEL_SHIFT_PROPERTY, `${geometry.width + PANEL_CONVERSATION_GAP + 18}px`)
    } else {
      root.removeAttribute(PANEL_OPEN_ATTRIBUTE)
      root.style.removeProperty(PANEL_SHIFT_PROPERTY)
    }
    return () => {
      root.removeAttribute(PANEL_OPEN_ATTRIBUTE)
      root.style.removeProperty(PANEL_SHIFT_PROPERTY)
    }
  }, [compact, expanded, geometry.mode, geometry.width])

  useEffect(() => {
    if (current === undefined) return
    // Cards keep live teams on the normal cadence. The current-session scope
    // also performs one cold-start discovery pass so archived/cardless teams
    // survive a browser or `dsh web` restart.
    const controller = startActivityPolling(currentTargets, { discoverySessionId: current })
    let active = true
    const tracker = autoOpenTrackerRef.current
    if (tracker.sessionId === current && !tracker.restoreComplete) {
      void controller.firstTick.then(() => {
        const latest = autoOpenTrackerRef.current
        if (!active || latest.sessionId !== current || latest.restoreComplete) return
        latest.liveTeamIds = new Set(getActivitySnapshotsSnapshot().teams
          .filter((team) => team.captainSessionId === current)
          .map((team) => team.teamId))
        latest.restoreComplete = true
      })
    }
    return () => {
      active = false
      controller.stop()
    }
  }, [current, currentTargets])

  useEffect(() => {
    const onOpenPanel = (event: Event): void => {
      const activeSession = currentRef.current
      if (activeSession === undefined) return
      setOpenOwner(activeSession)
      setOpen(true)
      const detail = (event as CustomEvent<AgentTeamsCardData>).detail
      if (detail?.teamId !== undefined) {
        // A card from a log that predates captainSessionId belongs to the
        // session that activated it (the current one at injection time).
        const owner = detail.captainSessionId !== '' ? detail.captainSessionId : currentRef.current ?? ''
        const teamKey = `${owner}:${detail.teamId}`
        setHistoric((previous) => {
          const next = new Map(previous)
          next.set(teamKey, { data: detail, owner })
          return next
        })
      }
    }
    window.addEventListener(OPEN_PANEL_EVENT, onOpenPanel)
    return () => {
      window.removeEventListener(OPEN_PANEL_EVENT, onOpenPanel)
    }
  }, [])

  // Teams follow the current session: live snapshots and historic card
  // summaries are visible only while their captain session is current.
  const visibleTeams = useMemo(
    // No current session (initial load): show nothing until one is picked,
    // so cross-session teams never leak into the floater.
    () => (current === undefined ? [] : teams.filter((team) => team.captainSessionId === current)),
    [teams, current],
  )
  const visibleHistoric = useMemo(
    () => (current === undefined ? [] : [...historic.values()].filter(({ data, owner }) =>
      owner === current && !teams.some((live) =>
        live.captainSessionId === current && live.teamId === data.teamId,
      ) && !archivedTeams.some((archived) =>
        archived.captainSessionId === current && archived.teamId === data.teamId,
      ),
    )),
    [historic, current, teams, archivedTeams],
  )
  const visibleArchived = useMemo(
    () => (current === undefined ? [] : archivedTeams.filter((team) =>
      team.captainSessionId === current && !teams.some((live) =>
        live.captainSessionId === current && live.teamId === team.teamId,
      ),
    )),
    [archivedTeams, current, teams],
  )
  const visibleCount = visibleTeams.length + visibleArchived.length + visibleHistoric.length
  const officeTeam = visibleTeams[0]
  const visibleLiveTeamIds = useMemo(
    () => visibleTeams.map((team) => team.teamId).sort(),
    [visibleTeams],
  )
  const visibleLiveTeamKey = visibleLiveTeamIds.join('\u0000')

  useEffect(() => {
    const tracker = autoOpenTrackerRef.current
    const settled = performance.now() - mountedAtRef.current >= AUTO_OPEN_SETTLE_MS
    const shouldAutoExpand = tracker.sessionId === current && activityPanelShouldAutoExpand({
      alreadyAutoOpened: autoOpened,
      pageSettled: settled,
      restoreComplete: tracker.restoreComplete,
      previousLiveTeamIds: tracker.liveTeamIds,
      currentLiveTeamIds: visibleLiveTeamIds,
    })
    if (tracker.sessionId === current && tracker.restoreComplete) {
      tracker.liveTeamIds = new Set(visibleLiveTeamIds)
    }
    if (visibleCount > 0) {
      setWasActive(true)
      // Existing state restored for a reopened conversation stays collapsed.
      // Only a live team that appears after the restore pass may auto-expand.
      if (shouldAutoExpand) {
        setOpenOwner(current)
        setOpen(true)
        setAutoOpened(true)
      }
      return
    }
    if (!wasActive) return
    const timer = setTimeout(() => {
      setOpen(false)
      setOpenOwner(undefined)
      setWasActive(false)
      // Re-arm auto-expand: a later activity (new team, new session) may
      // open the panel on its own again.
      setAutoOpened(false)
    }, AUTOCLOSE_GRACE_MS)
    return () => { clearTimeout(timer) }
  }, [visibleCount, visibleLiveTeamKey, autoOpened, wasActive, current])

  const busy = useMemo(
    () => visibleTeams.some((team) => team.members.some((member) => member.activity === 'working')),
    [visibleTeams],
  )
  const hasTeams = visibleCount > 0

  // Auto-height panels do not store their live content height. Capture the
  // rendered box when a pointer gesture starts so movement and a first manual
  // resize clamp against what the user actually sees.
  const panelGeometryForGesture = useCallback((): PanelLayout => {
    const measuredHeight = panelRef.current?.getBoundingClientRect().height
    if (measuredHeight === undefined || measuredHeight <= 0) return geometry
    return { ...geometry, height: measuredHeight }
  }, [geometry])

  const flushScheduledLayout = useCallback((): void => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    const pending = pendingLayoutRef.current
    pendingLayoutRef.current = null
    if (pending !== null) commitLayout(pending)
  }, [commitLayout])

  const scheduleLayout = useCallback((next: PanelLayout): void => {
    pendingLayoutRef.current = next
    frameRef.current ??= requestAnimationFrame(() => {
      frameRef.current = null
      const pending = pendingLayoutRef.current
      pendingLayoutRef.current = null
      if (pending !== null) commitLayout(pending)
    })
  }, [commitLayout])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const beginMove = useCallback((event: ReactPointerEvent<HTMLElement>): void => {
    if (compact || event.button !== 0 || (event.target as Element).closest('button') !== null) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      kind: 'move',
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      start: panelGeometryForGesture(),
      activated: false,
    }
  }, [compact, panelGeometryForGesture])

  const beginResize = useCallback((edge: PanelResizeEdge, event: ReactPointerEvent<HTMLDivElement>): void => {
    if (compact || event.button !== 0 || (geometry.mode === 'docked' && edge !== 'left')) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      kind: 'resize',
      edge,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      start: panelGeometryForGesture(),
      activated: true,
    }
    setInteraction('resizing')
  }, [compact, geometry.mode, panelGeometryForGesture])

  const updateGesture = useCallback((event: ReactPointerEvent<HTMLElement>): void => {
    const gesture = gestureRef.current
    if (gesture === null || gesture.pointerId !== event.pointerId
      || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const dx = event.clientX - gesture.originX
    const dy = event.clientY - gesture.originY
    const activeBounds = boundsRef.current
    if (gesture.kind === 'move') {
      if (!gesture.activated && Math.hypot(dx, dy) < MOVE_THRESHOLD) return
      if (!gesture.activated) {
        gesture.activated = true
        setInteraction('dragging')
      }
      scheduleLayout(movePanelLayout(
        floatPanelLayout(gesture.start, activeBounds),
        dx,
        dy,
        activeBounds,
      ))
      return
    }
    scheduleLayout(resizePanelLayout(
      gesture.start,
      gesture.edge ?? 'left',
      dx,
      dy,
      activeBounds,
    ))
  }, [scheduleLayout])

  const endGesture = useCallback((event: ReactPointerEvent<HTMLElement>): void => {
    const gesture = gestureRef.current
    if (gesture === null || gesture.pointerId !== event.pointerId) return
    updateGesture(event)
    flushScheduledLayout()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    gestureRef.current = null
    setInteraction(null)
  }, [flushScheduledLayout, updateGesture])

  const cancelGesture = useCallback((event: ReactPointerEvent<HTMLElement>): void => {
    const gesture = gestureRef.current
    if (gesture === null || gesture.pointerId !== event.pointerId) return
    flushScheduledLayout()
    gestureRef.current = null
    setInteraction(null)
  }, [flushScheduledLayout])

  const toggleDock = useCallback((): void => {
    const liveGeometry = panelGeometryForGesture()
    commitLayout(liveGeometry.mode === 'docked'
      ? floatPanelLayout(liveGeometry, boundsRef.current)
      : dockPanelLayout(liveGeometry, boundsRef.current))
  }, [commitLayout, panelGeometryForGesture])

  const autoHeight = panelUsesAutoHeight(geometry, bounds)

  const panelStyle: CSSProperties = {
    width: geometry.width,
    height: autoHeight ? 'auto' : geometry.height,
    maxHeight: panelMaximumHeight(geometry, bounds),
    transform: `translate3d(${geometry.x}px, ${geometry.y}px, 0)`,
  }

  if (!conversationVisible || (!hasTeams && !expanded)) return null

  return (
    <>
      {!expanded && (
        <CollapsedBadge count={visibleCount} busy={busy} t={t} onClick={() => {
          if (current === undefined) return
          setOpenOwner(current)
          setOpen(true)
        }} />
      )}
      {expanded && (
        <aside
          ref={panelRef}
          className={css.panel}
          style={panelStyle}
          data-agent-teams-activity
          data-panel-mode={geometry.mode}
          data-height-mode={autoHeight ? 'auto' : 'manual'}
          data-compact={compact || undefined}
          data-dragging={interaction === 'dragging' || undefined}
          data-resizing={interaction === 'resizing' || undefined}
          aria-label={t('activity.panelAria')}
        >
          <header
            className={css.panelHead}
            onPointerDown={beginMove}
            onPointerMove={updateGesture}
            onPointerUp={endGesture}
            onPointerCancel={cancelGesture}
            data-drag-handle={!compact || undefined}
          >
            <span className={css.panelTitle}>
              {t('activity.title')}
              <span className={css.panelDot} data-busy={busy} aria-hidden />
            </span>
            <span className={css.panelControls}>
              {hasTeams && (
                <button
                  type="button"
                  className={css.iconButton}
                  data-control="office"
                  aria-pressed={officeMode}
                  onClick={() => { setOfficeView(!officeMode) }}
                  aria-label={t(officeMode ? 'office.showBoard' : 'office.showOffice')}
                  title={t(officeMode ? 'office.showBoard' : 'office.showOffice')}
                >
                  <span aria-hidden>{officeMode ? '☰' : '🏢'}</span>
                </button>
              )}
              {!compact && (
                <button
                  type="button"
                  className={css.iconButton}
                  data-control="dock"
                  data-mode={geometry.mode}
                  onClick={toggleDock}
                  aria-label={t(geometry.mode === 'docked' ? 'activity.float' : 'activity.dockRight')}
                  title={t(geometry.mode === 'docked' ? 'activity.float' : 'activity.dockRight')}
                >
                  <IconPanelLeftOutline16 />
                </button>
              )}
              <button
                type="button"
                className={css.iconButton}
                data-control="collapse"
                onClick={() => {
                  setOpen(false)
                  setOpenOwner(undefined)
                }}
                aria-label={t('activity.collapse')}
                title={t('activity.collapse')}
              >
                <IconChevronDownOutline14 />
              </button>
            </span>
          </header>
          <div className={css.teams} data-view={officeMode && officeTeam !== undefined ? 'office' : 'board'}>
            {officeMode && officeTeam !== undefined
              ? (
                <PixelOffice
                  team={officeTeam}
                  t={t}
                  enabledActions={['board']}
                  onAction={(action) => { if (action === 'board') setOfficeView(false) }}
                  onOpenMember={(memberId) => {
                    navigateToSession(officeTeam.captainSessionId as SessionId, memberId as SessionId)
                  }}
                />
              )
              : visibleCount === 0
              ? <span className={css.emptyHint}>{t('activity.empty')}</span>
              : (
                <>
                  {visibleTeams.map((team) => (
                    <TeamSection
                      key={team.teamId}
                      team={team}
                      modelDirectory={team.phase === 'staged'
                        ? modelDirectories.directoryFor(team.captainSessionId as SessionId)
                        : undefined}
                      onContinuePlanning={returnToComposer}
                      onDiscarded={returnToComposer}
                      onNavigate={navigateToSession}
                      t={t}
                    />
                  ))}
                  {visibleArchived.map((team) => (
                    <div key={`${team.captainSessionId}:${team.teamId}`} data-team-id={team.teamId} data-historic className={css.archivedWrap}>
                      <span className={css.archiveLabel}>{t(team.phase === 'staged' ? 'archive.discardedLabel' : 'archive.label')}</span>
                      <TeamSection team={team} onNavigate={navigateToSession} t={t} historic />
                    </div>
                  ))}
                  {visibleHistoric.map(({ data: team, owner }) => {
                    const teamKey = `${owner}:${team.teamId}`
                    return (
                      <TeamSection key={teamKey} team={historicCardTeam(team, owner)} onNavigate={navigateToSession} t={t} historic />
                    )
                  })}
                </>
              )}
          </div>
          {!compact && (
            <div
              className={css.resizeHandle}
              data-resize-edge="left"
              onPointerDown={(event) => { beginResize('left', event) }}
              onPointerMove={updateGesture}
              onPointerUp={endGesture}
              onPointerCancel={cancelGesture}
              aria-hidden
            />
          )}
          {!compact && geometry.mode === 'floating' && (
            <>
              <div
                className={css.resizeHandle}
                data-resize-edge="bottom"
                onPointerDown={(event) => { beginResize('bottom', event) }}
                onPointerMove={updateGesture}
                onPointerUp={endGesture}
                onPointerCancel={cancelGesture}
                aria-hidden
              />
              <div
                className={css.resizeHandle}
                data-resize-edge="corner"
                onPointerDown={(event) => { beginResize('corner', event) }}
                onPointerMove={updateGesture}
                onPointerUp={endGesture}
                onPointerCancel={cancelGesture}
                aria-hidden
              />
            </>
          )}
        </aside>
      )}
    </>
  )
}
