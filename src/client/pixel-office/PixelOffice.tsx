/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { ActivityTeam } from '../activity-monitor.ts'
import type { AgentTeamsLocaleKey, AgentTeamsTranslate } from '../locales.ts'
import { realmKey } from '../realm.ts'
import { roleLabel } from '../role-labels.ts'
import { createPixelScene, type SceneFacility, type SceneMember, type SceneModel } from './PixelOfficeScene.ts'
import { FACILITY_ORDER, type SceneAction, type SceneHit } from './office-actions.ts'
import css from './PixelOffice.module.css'

export type { SceneAction } from './office-actions.ts'

export interface PixelOfficeProps {
  readonly team: ActivityTeam
  /** Translation bound by the panel; keys are owned by the AgentTeams namespace. */
  readonly t: AgentTeamsTranslate
  /** Open one member's subagent transcript. */
  readonly onOpenMember?: (memberId: string) => void
  /** A member without a conversation was clicked (nothing to open yet). */
  readonly onUnavailable?: (name: string) => void
  /** A wall facility was picked: the parent decides which panel to open. */
  readonly onAction?: (action: SceneAction) => void
  /** Facility whose panel is currently open (painted as selected). */
  readonly activeAction?: SceneAction | null
  /** Facilities this surface can actually open (the floater only has the board). */
  readonly enabledActions?: readonly SceneAction[]
}

const FACILITY_LABEL: Readonly<Record<SceneAction, AgentTeamsLocaleKey>> = {
  teams: 'office.facility.teams',
  board: 'office.facility.board',
  config: 'office.facility.config',
  inbox: 'office.facility.inbox',
}

const FACILITY_HINT: Readonly<Record<SceneAction, AgentTeamsLocaleKey>> = {
  teams: 'office.action.teamsHint',
  board: 'office.action.boardHint',
  config: 'office.action.configHint',
  inbox: 'office.action.inboxHint',
}

/** Single-character rail glyphs keep the floating toolbar tiny. */
const FACILITY_GLYPH: Readonly<Record<SceneAction, string>> = {
  teams: '山',
  board: '碑',
  config: '经',
  inbox: '信',
}

const ALL_ACTIONS: readonly SceneAction[] = FACILITY_ORDER

function sceneLabel(activity: SceneMember['activity'], t: AgentTeamsTranslate): string {
  if (activity === 'working') return t('office.working')
  if (activity === 'unknown') return t('office.unknown')
  return t('office.idle')
}

type Hover =
  | {
    readonly kind: 'member'
    readonly name: string
    readonly role: string
    readonly activity: SceneMember['activity']
    readonly realm: string
    readonly task: string
    readonly x: number
    readonly y: number
  }
  | { readonly kind: 'action'; readonly action: SceneAction; readonly label: string; readonly hint: string; readonly x: number; readonly y: number }

export function PixelOffice({
  team, t, onOpenMember, onUnavailable, onAction, activeAction, enabledActions,
}: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<ReturnType<typeof createPixelScene> | null>(null)
  const [hover, setHover] = useState<Hover | undefined>()
  const actions = enabledActions ?? ALL_ACTIONS

  const live = useMemo(() => team.members.filter(member => member.status !== 'removed'), [team.members])
  const done = team.tasks.filter(task => task.status === 'completed').length
  const running = team.tasks.filter(task => task.state === 'running').length
  const waiting = team.tasks.filter(task => task.state === 'blocked').length
  const failed = team.tasks.filter(task => task.status === 'failed').length

  const model = useMemo<SceneModel>(() => {
    const captain: SceneMember = {
      id: team.captainSessionId,
      name: t('office.captain'),
      role: 'captain',
      activity: team.phase === 'running' ? 'working' : 'idle',
      unread: team.captainInbox.length,
      isLeader: true,
    }
    const members: SceneMember[] = [captain, ...live.map((member): SceneMember => ({
      id: member.id,
      name: member.name,
      role: member.role,
      activity: member.activity,
      currentTask: member.currentTask,
      progress: member.progress,
      done: member.done,
      total: member.total,
      model: member.model,
      unread: member.unread,
    }))]
    const facilities: SceneFacility[] = onAction === undefined
      ? []
      : actions.map(action => ({
        action,
        label: t(FACILITY_LABEL[action]),
        badge: action === 'inbox' ? team.captainInbox.length : undefined,
      }))
    return {
      teamName: team.name,
      phase: team.phase,
      halted: team.halted,
      members,
      activeAction: activeAction ?? undefined,
      facilities,
      labels: {
        captain: t('office.captain'),
        stalled: t('office.stalled'),
        awaiting: t('office.awaiting'),
        empty: t('office.empty'),
        working: t('office.working'),
        idle: t('office.idle'),
        unknownState: t('office.unknown'),
      },
      // 墙面功德碑：把「宗门气运」的关键数字搬进洞府，点碑看完整进度。
      wall: {
        title: t('progress.title'),
        doneCount: done,
        total: team.tasks.length,
        runningCount: running,
        waitingCount: waiting,
        failedCount: failed,
      },
    }
  }, [actions, activeAction, done, failed, live, onAction, running, t, team, waiting])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (canvas === null || host === null) return
    const scene = createPixelScene(canvas)
    sceneRef.current = scene
    const measure = (): void => {
      const rect = host.getBoundingClientRect()
      scene.resize(rect.width, rect.height)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(host)
    if (observer === undefined) window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.render(model)
  }, [model])

  const sceneMembers = useMemo(() => new Map(model.members.map(member => [member.id, member])), [model])
  const hitAt = (event: ReactPointerEvent<HTMLCanvasElement>): SceneHit | undefined => {
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    const rect = canvas.getBoundingClientRect()
    return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top)
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const hit = hitAt(event)
    sceneRef.current?.setHover(hit)
    const canvas = canvasRef.current
    if (hit === undefined) {
      if (hover !== undefined) setHover(undefined)
      if (canvas !== null) canvas.style.cursor = 'default'
      return
    }
    if (canvas !== null) canvas.style.cursor = 'pointer'
    const rect = event.currentTarget.getBoundingClientRect()
    // Keep the tooltip inside the canvas: half of its max width plus a margin.
    const x = Math.max(110, Math.min(event.clientX - rect.left, Math.max(110, rect.width - 110)))
    const y = event.clientY - rect.top
    if (hit.kind === 'action') {
      setHover({ kind: 'action', action: hit.action, label: t(FACILITY_LABEL[hit.action]), hint: t(FACILITY_HINT[hit.action]), x, y })
      return
    }
    const member = sceneMembers.get(hit.id)
    if (member === undefined) return
    setHover({
      kind: 'member',
      name: member.name,
      role: member.role,
      activity: member.activity,
      realm: t(realmKey(member.progress ?? 0)),
      task: member.currentTask ?? '',
      x,
      y,
    })
  }
  const onPointerLeave = (): void => {
    setHover(undefined)
    sceneRef.current?.setHover(undefined)
    if (canvasRef.current !== null) canvasRef.current.style.cursor = 'default'
  }
  const onClick = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const hit = hitAt(event)
    if (hit === undefined) return
    if (hit.kind === 'action') {
      onAction?.(hit.action)
      return
    }
    const member = sceneMembers.get(hit.id)
    if (member === undefined) return
    // 还没有对话（未创建会话的修士）不跳转，只提示。
    if (member.id === '') { onUnavailable?.(member.name); return }
    onOpenMember?.(member.id)
  }
  const statusLine = team.halted === true
    ? t('office.stalled')
    : team.phase === 'staged'
      ? t('office.awaiting')
      : t('office.progress', { done, total: team.tasks.length })

  return (
    <section
      className={css.office}
      data-pixel-office
      data-phase={team.phase}
      data-halted={team.halted === true || undefined}
      aria-label={t('office.sceneAria', { name: team.name })}
    >
      <span className={css.srOnly}>{statusLine} · {t('office.members', { count: live.length })}</span>
      <div ref={hostRef} className={css.canvasHost}>
        <canvas
          ref={canvasRef}
          className={css.canvas}
          role="img"
          aria-label={t('office.sceneAria', { name: team.name })}
          title={t('office.hint')}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
        />
        {hover !== undefined && (
          <div
            className={css.tooltip}
            data-placement={hover.kind === 'action' ? 'below' : 'above'}
            style={{ left: hover.x, top: hover.y }}
            role="tooltip"
          >
            {hover.kind === 'member' ? (
              <>
                <strong>{hover.name}</strong>
                <span>{hover.role === 'captain' ? hover.realm : `${roleLabel(hover.role, hover.name, t)} · ${hover.realm}`}</span>
                <span data-activity={hover.activity}>{sceneLabel(hover.activity, t)}{hover.task === '' ? '' : ` · ${hover.task}`}</span>
              </>
            ) : (
              <>
                <strong>{hover.label}</strong>
                <span>{hover.hint}</span>
              </>
            )}
          </div>
        )}
        {onAction !== undefined && actions.length > 0 && (
          <div className={css.rail} role="toolbar" aria-label={t('office.rail')} data-office-rail>
            {actions.map(action => (
              <button
                key={action}
                type="button"
                className={css.railButton}
                data-control={`office-${action}`}
                aria-pressed={activeAction === action}
                aria-label={t(FACILITY_LABEL[action])}
                title={`${t(FACILITY_LABEL[action])} · ${t(FACILITY_HINT[action])}`}
                onClick={() => { onAction(action) }}
              >
                <span aria-hidden>{FACILITY_GLYPH[action]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
