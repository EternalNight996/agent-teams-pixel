/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { ActivityTeam } from '../activity-monitor.ts'
import type { AgentTeamsTranslate } from '../locales.ts'
import { createPixelScene, type SceneMember, type SceneModel } from './PixelOfficeScene.ts'
import css from './PixelOffice.module.css'

export interface PixelOfficeProps {
  readonly team: ActivityTeam
  /** Translation bound by the panel; keys are owned by the AgentTeams namespace. */
  readonly t: AgentTeamsTranslate
  /** Open one member's subagent transcript. */
  readonly onOpenMember?: (memberId: string) => void
  /** Switch the floater back to the board view. */
  readonly onShowBoard?: () => void
  /** Collapse the office back to its bottom bar. */
  readonly onCollapse?: () => void
}

function sceneLabel(activity: SceneMember['activity'], t: AgentTeamsTranslate): string {
  if (activity === 'working') return t('office.working')
  if (activity === 'unknown') return t('office.unknown')
  return t('office.idle')
}

export function PixelOffice({ team, t, onOpenMember, onShowBoard, onCollapse }: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<ReturnType<typeof createPixelScene> | null>(null)
  const [hover, setHover] = useState<{ id: string; name: string; role: string; activity: SceneMember['activity']; task: string; x: number; y: number } | undefined>()

  const model = useMemo<SceneModel>(() => {
    const live = team.members.filter(member => member.status !== 'removed')
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
    return {
      teamName: team.name,
      phase: team.phase,
      halted: team.halted,
      members,
      labels: {
        captain: t('office.captain'),
        stalled: t('office.stalled'),
        awaiting: t('office.awaiting'),
        empty: t('office.empty'),
      },
    }
  }, [team, t])

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

  const total = team.tasks.length
  const done = team.tasks.filter(task => task.state === 'completed').length
  const live = team.members.filter(member => member.status !== 'removed')
  const working = live.filter(member => member.activity === 'working').length
  const sceneMembers = useMemo(() => new Map(model.members.map(member => [member.id, member])), [model])
  const hitAt = (event: ReactPointerEvent<HTMLCanvasElement>): string | undefined => {
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    const rect = canvas.getBoundingClientRect()
    return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top)
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const id = hitAt(event)
    const canvas = canvasRef.current
    if (id === undefined) {
      if (hover !== undefined) setHover(undefined)
      if (canvas !== null) canvas.style.cursor = 'default'
      return
    }
    if (canvas !== null) canvas.style.cursor = 'pointer'
    const member = sceneMembers.get(id)
    if (member === undefined) return
    const rect = event.currentTarget.getBoundingClientRect()
    setHover({
      id,
      name: member.name,
      role: member.role,
      activity: member.activity,
      task: member.currentTask ?? '',
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }
  const onPointerLeave = (): void => {
    setHover(undefined)
    if (canvasRef.current !== null) canvasRef.current.style.cursor = 'default'
  }
  const onClick = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const id = hitAt(event)
    if (id !== undefined) onOpenMember?.(id)
  }

  return (
    <section className={css.office} data-pixel-office data-phase={team.phase} data-halted={team.halted === true || undefined} aria-label={t('office.title')}>
      <header className={css.head}>
        <span className={css.title}>
          <span aria-hidden>⛩</span>
          {t('office.title')}
          <span className={css.count}>{t('office.members', { count: live.length })}</span>
        </span>
        <span className={css.meta} data-working={working > 0 || undefined}>
          {team.halted === true
            ? t('office.stalled')
            : team.phase === 'staged'
              ? t('office.awaiting')
              : t('office.progress', { done, total })}
        </span>
        {onShowBoard !== undefined && (
          <button type="button" className={css.viewButton} onClick={onShowBoard} title={t('office.showBoard')}>
            {t('office.showBoard')}
          </button>
        )}
        {onCollapse !== undefined && (
          <button type="button" className={css.viewButton} data-control="office-collapse" onClick={onCollapse} title={t('office.collapse')} aria-label={t('office.collapse')}>
            <span aria-hidden>▾</span>
          </button>
        )}
      </header>
      <div ref={hostRef} className={css.canvasHost}>
        <canvas
          ref={canvasRef}
          className={css.canvas}
          role="img"
          aria-label={t('office.title')}
          title={t('office.hint')}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
        />
        {hover !== undefined && (
          <div className={css.tooltip} style={{ left: hover.x, top: hover.y }} role="tooltip">
            <strong>{hover.name}</strong>
            <span>{hover.role}</span>
            <span data-activity={hover.activity}>{sceneLabel(hover.activity, t)}{hover.task === '' ? '' : ` · ${hover.task}`}</span>
          </div>
        )}
      </div>
      {live.length > 0 && (
        <ul className={css.chips} aria-label={t('office.members', { count: live.length })}>
          {live.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                className={css.chip}
                data-activity={member.activity}
                data-unread={member.unread > 0 || undefined}
                disabled={onOpenMember === undefined}
                onClick={() => { onOpenMember?.(member.id) }}
                title={`${member.name} · ${member.role} · ${sceneLabel(member.activity, t)}`}
              >
                <span className={css.dot} aria-hidden />
                <span className={css.chipName}>{member.name}</span>
                {member.currentTask !== '' && <span className={css.chipTask}>{member.currentTask}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
