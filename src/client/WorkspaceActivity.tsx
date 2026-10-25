/** Native workspace content; discovery remains mounted independently of tab lifetime. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ISidebarRight } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { ActivityPanel, TeamSection, historicCardTeam, type ActivityPanelProps } from './ActivityPanel.tsx'
import { StagingPlanEditor } from './StagingPlanEditor.tsx'
import { TeamConfigPanel } from './TeamConfigPanel.tsx'
import { PixelOffice, type SceneAction } from './pixel-office/PixelOffice.tsx'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { OPEN_PANEL_EVENT } from './AgentTeamsCard.tsx'
import type { AgentTeamsCardData } from './agent-teams-card-definition.ts'
import { currentSessionId } from './session-navigation.ts'
import { TEAM_CREATED_EVENT, shouldRevealTeam } from './team-reveal.ts'
import { getActivityMonitorTargetsSnapshot, getActivitySnapshotsSnapshot, startActivityPolling, subscribeActivityMonitorTargets, subscribeActivitySnapshots, updateActivitySnapshots } from './activity-monitor.ts'
import { createTeamDiscovery, type WorkspaceActivityState } from './workspace-state.ts'
import { LEAD_ART } from './artwork.ts'
import css from './WorkspaceActivity.module.css'

export const TEAM_TAB_KIND = 'agent-teams'
export const TEAM_TAB_ID = 'agent-teams-pixel/activity'

/** Persisted history-page preference: progress board vs setup page. */
const WORKSPACE_VIEW_KEY = 'agent-teams-pixel.workspaceView'
/** One-time coach line pointing at the wall menu (dismissed once, then never again). */
const HALL_GUIDE_KEY = 'agent-teams-pixel.hallGuide'

/** Optional host integration is observable so installing/removing it also switches the fallback. */
export function createWorkspaceBridge() {
  let sidebar: ISidebarRight | undefined
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => sidebar,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    set(value: ISidebarRight | undefined) { sidebar = value; for (const listener of listeners) listener() },
  }
}

export function ActivitySurface({ bridge, state, ...props }: ActivityPanelProps & {
  bridge: ReturnType<typeof createWorkspaceBridge>
  state: WorkspaceActivityState
}) {
  const sidebar = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot)
  return sidebar === undefined ? <ActivityPanel {...props} /> : <WorkspaceMonitor {...props} sidebar={sidebar} state={state} />
}

function WorkspaceMonitor({ sessionsList, sidebar, state }: ActivityPanelProps & {
  sidebar: ISidebarRight
  state: WorkspaceActivityState
}) {
  const current = currentSessionId(useSyncExternalStore(sessionsList.subscribe, sessionsList.getSnapshot))
  const targets = useSyncExternalStore(subscribeActivityMonitorTargets, getActivityMonitorTargetsSnapshot)
  const currentTargets = useMemo(() => targets.filter(target => target.sessionId === current), [targets, current])
  // One discovery tracker per visit, outside polling effects restarted by card registration.
  const discover = useMemo(() => createTeamDiscovery(), [current])
  useEffect(() => {
    if (current === undefined) return
    state.status(current, 'loading')
    const controller = startActivityPolling(currentTargets, {
      discoverySessionId: current,
      onStatus(status) {
        state.status(current, status)
      },
      publishSnapshots(update) {
        updateActivitySnapshots(update)
        if (update.teams === undefined) return
        const added = discover(update.teams.filter(team => team.captainSessionId === current))
        // Do not replace a file/terminal, or navigate a session whose surface is not bound.
        if (added === undefined) return
        if (!shouldRevealTeam({
          source: 'discovered',
          sessionId: current,
          onScreenSessionId: sidebar.mounted.getSnapshot(),
          teamId: added,
          expanded: sidebar.isExpanded(),
        })) return
        state.select(current, added)
        sidebar.openTab(TEAM_TAB_KIND)
      },
    })
    return () => { controller.stop() }
  }, [current, currentTargets, discover, sidebar, state])
  useEffect(() => {
    const open = (event: Event): void => {
      if (current === undefined || sidebar.mounted.getSnapshot() !== current) return
      const data = (event as CustomEvent<AgentTeamsCardData>).detail
      if (data?.captainSessionId && data.captainSessionId !== current) return
      if (data?.teamId) state.remember(current, data)
      sidebar.openTab(TEAM_TAB_KIND)
    }
    window.addEventListener(OPEN_PANEL_EVENT, open)
    return () => { window.removeEventListener(OPEN_PANEL_EVENT, open) }
  }, [current, sidebar, state])
  // The quick-start dialog stages a plan from the conversation header, where the
  // tab's own listener is not mounted. Reveal the tab from this always-mounted
  // monitor so "生成草案" never ends in silence — with the column already open on
  // another page (the discard button closes the tab but keeps the column), the
  // event is the only signal that gets the user to the plan review.
  useEffect(() => {
    const reveal = (event: Event): void => {
      if (current === undefined) return
      const teamId = (event as CustomEvent<{ teamId?: string }>).detail?.teamId
      if (teamId === undefined) return
      if (!shouldRevealTeam({
        source: 'created',
        sessionId: current,
        onScreenSessionId: sidebar.mounted.getSnapshot(),
        teamId,
        expanded: sidebar.isExpanded(),
      })) return
      state.select(current, teamId)
      sidebar.openTab(TEAM_TAB_KIND)
    }
    window.addEventListener(TEAM_CREATED_EVENT, reveal)
    return () => { window.removeEventListener(TEAM_CREATED_EVENT, reveal) }
  }, [current, sidebar, state])
  return null
}

export type WorkspaceActivityProps = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'agentTeams'> & {
  state: WorkspaceActivityState
  modelDirectories: ActivityPanelProps['modelDirectories']
  openMember: ActivityPanelProps['openMember']
}

/** The team tab: the sect hall is the page, its wall facilities are the menu. */
export function WorkspaceActivity({ sessionId, useTabInfo, t, state, modelDirectories, openMember }: WorkspaceActivityProps) {
  const { tab } = useTabInfo()
  const snapshots = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot)
  const local = useSyncExternalStore(state.subscribe, state.getSnapshot)
  const [retry, setRetry] = useState(0)
  // History pages (ended teams have no hall) keep the old board/setup switch.
  const [view, setView] = useState<'board' | 'config'>(() => {
    if (typeof window === 'undefined') return 'board'
    try { return window.localStorage.getItem(WORKSPACE_VIEW_KEY) === 'config' ? 'config' : 'board' } catch { return 'board' }
  })
  const setWorkspaceView = (next: 'board' | 'config'): void => {
    setView(next)
    try { window.localStorage.setItem(WORKSPACE_VIEW_KEY, next) } catch { /* private mode */ }
  }
  // The wall facility whose panel is open. One floating panel at a time keeps the hall visible.
  const [sheet, setSheet] = useState<SceneAction | undefined>()
  const sheetRef = useRef<HTMLElement | null>(null)
  // 悬浮面板：可拖动（拖标题栏）、可拖右下角改大小，位置只作会话内记忆。
  const [sheetOffset, setSheetOffset] = useState({ x: 0, y: 0 })
  const sheetDrag = useRef<{
    startX: number; startY: number; baseX: number; baseY: number
    minX: number; maxX: number; minY: number; maxY: number
  } | null>(null)
  const beginSheetDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if ((event.target as HTMLElement).closest('button') !== null) return
    const panel = sheetRef.current
    const stage = panel?.parentElement
    if (panel === null || stage === null || stage === undefined) return
    event.preventDefault()
    const pr = panel.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()
    // Offsets are relative to the current position, so the clamp works for any
    // anchor (bottom-right by default, or wherever the user last dragged it).
    const relLeft = pr.left - sr.left
    const relTop = pr.top - sr.top
    const minX = sheetOffset.x + (8 - relLeft)
    const maxX = sheetOffset.x + (sr.width - 8 - (relLeft + pr.width))
    const minY = sheetOffset.y + (8 - relTop)
    const maxY = sheetOffset.y + (sr.height - 8 - (relTop + pr.height))
    const clampAxis = (low: number, high: number, base: number): readonly [number, number] =>
      high < low ? [base, base] : [low, high]
    const [clampedMinX, clampedMaxX] = clampAxis(minX, maxX, sheetOffset.x)
    const [clampedMinY, clampedMaxY] = clampAxis(minY, maxY, sheetOffset.y)
    sheetDrag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: sheetOffset.x,
      baseY: sheetOffset.y,
      minX: clampedMinX,
      maxX: clampedMaxX,
      minY: clampedMinY,
      maxY: clampedMaxY,
    }
    const onMove = (moveEvent: PointerEvent): void => {
      const drag = sheetDrag.current
      if (drag === null) return
      const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value))
      setSheetOffset({
        x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), drag.minX, drag.maxX),
        y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), drag.minY, drag.maxY),
      })
    }
    const onUp = (): void => {
      sheetDrag.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  useEffect(() => { setSheetOffset({ x: 0, y: 0 }) }, [sheet])
  // First visit: one floating line explains what on the wall is clickable.
  const [guide, setGuide] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return window.localStorage.getItem(HALL_GUIDE_KEY) !== '1' } catch { return false }
  })
  const dismissGuide = (): void => {
    setGuide(false)
    try { window.localStorage.setItem(HALL_GUIDE_KEY, '1') } catch { /* private mode */ }
  }
  useEffect(() => {
    if (!guide) return
    const timer = window.setTimeout(dismissGuide, 12000)
    return () => { window.clearTimeout(timer) }
  }, [guide])
  useEffect(() => {
    if (sheet === undefined) return
    // Focus the dialog itself (not the ×) so mouse users do not get a heavy
    // focus ring; Tab then reaches the close button like any dialog.
    const frame = window.requestAnimationFrame(() => { sheetRef.current?.focus() })
    return () => { window.cancelAnimationFrame(frame) }
  }, [sheet])
  // 点击没有会话的修士时给一条短暂提示，而不是跳转到空对话。
  const [officeHint, setOfficeHint] = useState('')
  const officeHintTimer = useRef<number | undefined>(undefined)
  const showOfficeHint = (name: string): void => {
    setOfficeHint(name)
    if (officeHintTimer.current !== undefined) window.clearTimeout(officeHintTimer.current)
    officeHintTimer.current = window.setTimeout(() => { setOfficeHint('') }, 2600)
  }
  useEffect(() => () => {
    if (officeHintTimer.current !== undefined) window.clearTimeout(officeHintTimer.current)
  }, [])
  useEffect(() => {
    if (sheet === undefined) return
    const close = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setSheet(undefined)
    }
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('keydown', close) }
  }, [sheet])
  const live = snapshots.teams.filter(team => team.captainSessionId === sessionId)
  const archived = snapshots.archivedTeams.filter(team => team.captainSessionId === sessionId && !live.some(item => item.teamId === team.teamId))
  const historic = [...local.history.values()].filter(team => team.captainSessionId === sessionId
    && !live.some(item => item.teamId === team.teamId) && !archived.some(item => item.teamId === team.teamId))
    .map(team => historicCardTeam(team, sessionId))
  const records = [...live, ...archived, ...historic]
  const selected = records.find(team => team.teamId === local.selected.get(sessionId)) ?? records[0]
  const liveSelected = selected !== undefined && live.includes(selected)
  const history = selected !== undefined && !liveSelected
  const status = local.statuses.get(sessionId) ?? 'loading'
  const completedCount = selected === undefined ? 0 : selected.tasks.filter(task => task.status === 'completed').length
  useEffect(() => {
    const onCreated = (event: Event): void => {
      const detail = (event as CustomEvent<{ teamId?: string }>).detail
      if (detail?.teamId === undefined) return
      state.select(sessionId, detail.teamId)
      setSheet('config')
    }
    window.addEventListener(TEAM_CREATED_EVENT, onCreated)
    return () => { window.removeEventListener(TEAM_CREATED_EVENT, onCreated) }
  }, [sessionId, state])

  // A newly staged plan opens the 藏经阁 sheet (review/approve); once the plan
  // is approved the sheet closes so the hall plus moving cultivators is the view.
  const lastTeamRef = useRef<string | undefined>(undefined)
  const lastPhaseRef = useRef<'staged' | 'running' | undefined>(undefined)
  useEffect(() => {
    if (selected === undefined || !liveSelected) return
    if (lastTeamRef.current !== selected.teamId) {
      lastTeamRef.current = selected.teamId
      setSheet(selected.phase === 'staged' ? 'config' : undefined)
    } else if (lastPhaseRef.current === 'staged' && selected.phase === 'running') {
      setSheet(undefined)
    }
    lastPhaseRef.current = selected.phase
  }, [liveSelected, selected?.teamId, selected?.phase])
  // Explicit reconnect is bounded and cleaned up; ordinary polling is owned by the monitor.
  useEffect(() => {
    if (retry === 0 || !tab.visible) return
    const controller = startActivityPolling([], { discoverySessionId: sessionId, onStatus: value => state.status(sessionId, value) })
    void controller.firstTick.finally(() => { controller.stop() })
    return () => { controller.stop() }
  }, [retry, sessionId, state, tab.visible])
  const backToChat = (): void => {
    // Closing this occurrence does not cancel a team or destroy other workspace tabs.
    tab.actions.close()
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-composer-card] [contenteditable="true"][role="textbox"], [data-composer-card] textarea')?.focus())
  }
  const sheetTitle = (kind: SceneAction): string => t(
    kind === 'board' ? 'workspace.tabBoard'
      : kind === 'config' ? 'workspace.tabConfig'
        : kind === 'teams' ? 'workspace.switchTeam'
          : 'workspace.inbox',
  )
  const sheetBody = (kind: SceneAction, team: typeof selected): ReactNode => {
    if (team === undefined) return null
    if (kind === 'config') {
      return live.includes(team) && team.phase === 'staged'
        ? <StagingPlanEditor team={team} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={backToChat} onDiscarded={backToChat} t={t} />
        : <TeamConfigPanel team={team} t={t} />
    }
    if (kind === 'board') {
      if (live.includes(team) && team.phase === 'staged') {
        return (
          <section className={css.stagedNotice} data-staged-notice>
            <h3>{t('config.stagedTitle')}</h3>
            <p>{t('config.stagedBody')}</p>
            <button type="button" onClick={() => { setSheet('config') }}>{t('config.openConfig')}</button>
          </section>
        )
      }
      return (
        <TeamSection
          key={`${sessionId}:${team.teamId}`}
          team={team}
          workspace
          historic={!live.includes(team)}
          modelDirectory={team.phase === 'staged' ? modelDirectories.directoryFor(sessionId) : undefined}
          onContinuePlanning={backToChat}
          onDiscarded={backToChat}
          onNavigate={openMember}
          t={t}
        />
      )
    }
    if (kind === 'teams') {
      return (
        <div className={css.sheetSection}>
          <p className={css.sheetHint}>{t('office.teamsHint')}</p>
          <ul className={css.teamList}>
            {records.map(team => {
              const current = selected !== undefined && team.teamId === selected.teamId
              const isLive = live.includes(team)
              const done = team.tasks.filter(task => task.status === 'completed').length
              const stateLabel = isLive
                ? t(team.phase === 'staged'
                  ? 'captain.state.staged'
                  : team.halted === true
                    ? 'team.stopped'
                    : done === team.tasks.length && team.tasks.length > 0 ? 'team.state.completed' : 'team.state.running')
                : t('workspace.history')
              return (
                <li key={team.teamId}>
                  <button
                    type="button"
                    className={css.teamRow}
                    data-current={current || undefined}
                    aria-current={current ? 'true' : undefined}
                    onClick={() => { state.select(sessionId, team.teamId); setSheet(undefined) }}
                  >
                    <span className={css.teamRowName}>{team.name}</span>
                    <span className={css.teamRowState}>{stateLabel}</span>
                    <span className={css.teamRowCount}>{t('team.stats.completed', { completed: done, total: team.tasks.length })}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className={css.sheetBack} onClick={backToChat}>{t('workspace.back')}</button>
        </div>
      )
    }
    // inbox
    if (team.captainInbox.length === 0) {
      return <p className={css.sheetEmpty}>{t('workspace.inboxEmpty')}</p>
    }
    return (
      <div className={css.sheetSection}>
        <p className={css.sheetHint}>{t('office.inboxCount', { count: team.captainInbox.length })}</p>
        <ul className={css.inboxList}>
          {team.captainInbox.map((message, index) => (
            <li key={`${index}:${message.from}`} className={css.inboxRow}>
              <span className={css.inboxFrom}>{message.from}</span>
              <span className={css.inboxText}>{message.content}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div className={css.root} data-agent-teams-workspace data-session-id={sessionId}>
      {selected !== undefined && liveSelected && status === 'error' && (
        <div className={css.stageError} role="alert">
          <span>{t('workspace.error')}</span>
          <button onClick={() => setRetry(value => value + 1)}>{t('workspace.retry')}</button>
        </div>
      )}
      {selected === undefined ? (
        status === 'loading' ? (
          <div className={css.content}><div className={css.skeleton} role="status" aria-label={t('workspace.loading')}><i /><i /><i /></div></div>
        ) : (
          <div className={css.content}>
            <section className={css.empty}>
              <span className={css.emptyMark} aria-hidden>↳</span>
              <h3>{t('workspace.emptyTitle')}</h3><p>{t('workspace.emptyBody')}</p>
              <button onClick={backToChat}>{t('workspace.back')}</button>
            </section>
          </div>
        )
      ) : liveSelected ? (
        <section className={css.stage} data-office-stage>
          <PixelOffice
            team={selected}
            t={t}
            activeAction={sheet ?? null}
            onAction={(action) => { setSheet(action) }}
            onOpenMember={(memberId) => { openMember(selected.captainSessionId as SessionId, memberId as SessionId) }}
            onUnavailable={showOfficeHint}
          />
          <p className={css.hallHint} data-hall-hint>{t('office.hintShort')}</p>
          {guide && sheet === undefined && (
            <div className={css.hallGuide} role="note" data-hall-guide>
              <span>{t('office.guide')}</span>
              <button type="button" onClick={dismissGuide}>{t('office.guideDismiss')}</button>
            </div>
          )}
          {selected.phase === 'staged' && sheet !== 'config' && (
            <div className={css.stagedRibbon} data-staged-ribbon>
              <span>{t('office.awaiting')}</span>
              <button type="button" onClick={() => { setSheet('config') }}>{t('office.stagedReview')}</button>
            </div>
          )}
          {sheet !== undefined && (
            <>
              <button
                type="button"
                className={css.scrim}
                aria-label={t('office.closePanel')}
                tabIndex={-1}
                onClick={() => { setSheet(undefined) }}
              />
              <aside
                ref={sheetRef}
                className={css.sheet}
                data-sheet={sheet}
                role="dialog"
                aria-modal="false"
                aria-label={sheetTitle(sheet)}
                tabIndex={-1}
                style={{ '--sheet-dx': `${sheetOffset.x}px`, '--sheet-dy': `${sheetOffset.y}px` } as CSSProperties}
              >
                <header className={css.sheetHead} onPointerDown={beginSheetDrag}>
                  <span className={css.sheetGrip} aria-hidden>⠿</span>
                  <span className={css.sheetTitle}>{sheetTitle(sheet)}</span>
                  <span className={css.sheetMeta}>{selected.name} · {t('team.stats.completed', { completed: completedCount, total: selected.tasks.length })}</span>
                  <button
                    type="button"
                    className={css.sheetClose}
                    data-control="sheet-close"
                    aria-label={t('office.closePanel')}
                    title={t('office.closePanel')}
                    onClick={() => { setSheet(undefined) }}
                  >×</button>
                </header>
                <div className={css.sheetBody}>{sheetBody(sheet, selected)}</div>
              </aside>
            </>
          )}
          {officeHint !== '' && (
            <div className={css.officeHint} role="status">{t('office.noConversation', { name: officeHint })}</div>
          )}
        </section>
      ) : (
        <div className={css.content}>
          <header className={css.heading}>
            <img src={LEAD_ART} alt="" aria-hidden />
            <h2>{t('app.title')}</h2>
            <span>{t('workspace.title')}</span>
            {records.length > 0 && (
              <label className={css.teamPicker}>
                <span className={css.teamPickerCaption}>{t('workspace.switchTeam')}</span>
                <select
                  className={css.teamPickerSelect}
                  value={selected.teamId}
                  aria-label={t('workspace.switchTeam')}
                  data-control="team-picker"
                  data-current={history ? undefined : 'true'}
                  onChange={(event) => { state.select(sessionId, event.target.value) }}
                >
                  {records.map(team => (
                    <option key={team.teamId} value={team.teamId}>
                      {live.includes(team) ? team.name : `${team.name} · ${t('workspace.history')}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className={css.viewTabs} role="tablist" data-control="workspace-views">
              <button type="button" role="tab" aria-selected={view === 'board'} data-view="board" onClick={() => { setWorkspaceView('board') }}>{t('workspace.tabBoard')}</button>
              <button type="button" role="tab" aria-selected={view === 'config'} data-view="config" onClick={() => { setWorkspaceView('config') }}>{t('workspace.tabConfig')}</button>
            </div>
          </header>
          {status === 'error' && <div className={css.error} role="alert"><span>{t('workspace.error')}</span><button onClick={() => setRetry(value => value + 1)}>{t('workspace.retry')}</button></div>}
          {view === 'config'
            ? (selected.phase === 'staged'
              ? <StagingPlanEditor team={selected} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={backToChat} onDiscarded={backToChat} t={t} />
              : <TeamConfigPanel team={selected} t={t} />)
            : (selected.phase === 'staged'
              ? <section className={css.stagedNotice} data-staged-notice>
                <h3>{t('config.stagedTitle')}</h3>
                <p>{t('config.stagedBody')}</p>
                <button type="button" onClick={() => { setWorkspaceView('config') }}>{t('config.openConfig')}</button>
              </section>
              : <TeamSection key={`${sessionId}:${selected.teamId}`} team={selected} historic={history}
                onContinuePlanning={backToChat} onDiscarded={backToChat} onNavigate={openMember} t={t} />)}
        </div>
      )}
    </div>
  )
}
