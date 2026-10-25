/** Native workspace content; discovery remains mounted independently of tab lifetime. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent as ReactMouseEvent } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ISidebarRight } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { ActivityPanel, TeamSection, historicCardTeam, type ActivityPanelProps } from './ActivityPanel.tsx'
import { StagingPlanEditor } from './StagingPlanEditor.tsx'
import { TeamConfigPanel } from './TeamConfigPanel.tsx'
import { PixelOffice } from './pixel-office/PixelOffice.tsx'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { OPEN_PANEL_EVENT } from './AgentTeamsCard.tsx'
import type { AgentTeamsCardData } from './agent-teams-card-definition.ts'
import { currentSessionId } from './session-navigation.ts'
import { getActivityMonitorTargetsSnapshot, getActivitySnapshotsSnapshot, startActivityPolling, subscribeActivityMonitorTargets, subscribeActivitySnapshots, updateActivitySnapshots } from './activity-monitor.ts'
import { createTeamDiscovery, type WorkspaceActivityState } from './workspace-state.ts'
import { LEAD_ART } from './artwork.ts'
import css from './WorkspaceActivity.module.css'

export const TEAM_TAB_KIND = 'agent-teams'
export const TEAM_TAB_ID = 'agent-teams-pixel/activity'

/** Persisted workspace-tab preference: progress board vs setup page. */
const WORKSPACE_VIEW_KEY = 'agent-teams-pixel.workspaceView'
/** Persisted pixel-office collapsed state (bottom bar when closed). */
const OFFICE_OPEN_KEY = 'agent-teams-pixel.officeOpen'
/** Persisted pixel-office pane height (px); unset uses the CSS default. */
const WORKSPACE_OFFICE_HEIGHT_KEY = 'agent-teams-pixel.workspaceOfficeHeight'
const OFFICE_MIN_HEIGHT = 140

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
        if (added !== undefined && sidebar.mounted.getSnapshot() === current && !sidebar.isExpanded()) {
          state.select(current, added)
          sidebar.openTab(TEAM_TAB_KIND)
        }
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
  return null
}

export type WorkspaceActivityProps = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'agentTeams'> & {
  state: WorkspaceActivityState
  modelDirectories: ActivityPanelProps['modelDirectories']
  openMember: ActivityPanelProps['openMember']
}

export function WorkspaceActivity({ sessionId, useTabInfo, t, state, modelDirectories, openMember }: WorkspaceActivityProps) {
  const { tab } = useTabInfo()
  const snapshots = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot)
  const local = useSyncExternalStore(state.subscribe, state.getSnapshot)
  const [retry, setRetry] = useState(0)
  // Two pages above the fixed pixel office: setup (edit/approve, read the
  // roster and task contracts) and the progress board.
  const [view, setView] = useState<'board' | 'config'>(() => {
    if (typeof window === 'undefined') return 'board'
    try { return window.localStorage.getItem(WORKSPACE_VIEW_KEY) === 'config' ? 'config' : 'board' } catch { return 'board' }
  })
  const setWorkspaceView = (next: 'board' | 'config'): void => {
    setView(next)
    try { window.localStorage.setItem(WORKSPACE_VIEW_KEY, next) } catch { /* private mode */ }
  }
  // The office dock sits at the very bottom and can be collapsed to a slim bar.
  const [officeOpen, setOfficeOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try { return window.localStorage.getItem(OFFICE_OPEN_KEY) !== '0' } catch { return true }
  })
  const setOfficeOpenPersist = (next: boolean): void => {
    setOfficeOpen(next)
    try { window.localStorage.setItem(OFFICE_OPEN_KEY, next ? '1' : '0') } catch { /* private mode */ }
  }
  const containerRef = useRef<HTMLDivElement | null>(null)
  const officePaneRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const [officeHeight, setOfficeHeight] = useState<number | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    try {
      const raw = Number(window.localStorage.getItem(WORKSPACE_OFFICE_HEIGHT_KEY))
      return Number.isFinite(raw) && raw >= OFFICE_MIN_HEIGHT ? raw : undefined
    } catch { return undefined }
  })
  const beginSplit = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const pane = officePaneRef.current
    const container = containerRef.current
    if (pane === null || container === null || event.button !== 0) return
    event.preventDefault()
    dragRef.current = { startY: event.clientY, startHeight: pane.getBoundingClientRect().height }
    const move = (moveEvent: MouseEvent): void => {
      const drag = dragRef.current
      if (drag === null) return
      const containerHeight = container.getBoundingClientRect().height
      const next = Math.min(Math.max(180, containerHeight - 180), Math.max(OFFICE_MIN_HEIGHT, drag.startHeight + (drag.startY - moveEvent.clientY)))
      setOfficeHeight(next)
    }
    const up = (): void => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      dragRef.current = null
      setOfficeHeight((value) => {
        if (value !== undefined) {
          try { window.localStorage.setItem(WORKSPACE_OFFICE_HEIGHT_KEY, String(Math.round(value))) } catch { /* private mode */ }
        }
        return value
      })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
  const live = snapshots.teams.filter(team => team.captainSessionId === sessionId)
  const archived = snapshots.archivedTeams.filter(team => team.captainSessionId === sessionId && !live.some(item => item.teamId === team.teamId))
  const historic = [...local.history.values()].filter(team => team.captainSessionId === sessionId
    && !live.some(item => item.teamId === team.teamId) && !archived.some(item => item.teamId === team.teamId))
    .map(team => historicCardTeam(team, sessionId))
  const records = [...live, ...archived, ...historic]
  const selected = records.find(team => team.teamId === local.selected.get(sessionId)) ?? records[0]
  const history = selected !== undefined && !live.includes(selected)
  const status = local.statuses.get(sessionId) ?? 'loading'
  useEffect(() => {
    const onCreated = (event: Event): void => {
      const detail = (event as CustomEvent<{ teamId?: string }>).detail
      if (detail?.teamId === undefined) return
      state.select(sessionId, detail.teamId)
      setWorkspaceView('config')
    }
    window.addEventListener('agent-teams:team-created', onCreated)
    return () => { window.removeEventListener('agent-teams:team-created', onCreated) }
  }, [sessionId, state])

  // Auto page: a freshly staged team opens Setup (review/approve); once the
  // plan is approved and the team starts running, flip to the progress board.
  const lastTeamRef = useRef<string | undefined>(undefined)
  const lastPhaseRef = useRef<'staged' | 'running' | undefined>(undefined)
  useEffect(() => {
    if (selected === undefined || !live.includes(selected)) return
    if (lastTeamRef.current !== selected.teamId) {
      if (selected.phase === 'staged') setWorkspaceView('config')
    } else if (lastPhaseRef.current === 'staged' && selected.phase === 'running') {
      setWorkspaceView('board')
    }
    lastTeamRef.current = selected.teamId
    lastPhaseRef.current = selected.phase
  }, [selected?.teamId, selected?.phase])
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
  return (
    <div ref={containerRef} className={css.root} data-agent-teams-workspace data-session-id={sessionId}>
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
                value={selected?.teamId ?? ''}
                aria-label={t('workspace.switchTeam')}
                data-control="team-picker"
                data-current={live.includes(selected)}
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
          {selected !== undefined && (
            <div className={css.viewTabs} role="tablist" data-control="workspace-views">
              <button type="button" role="tab" aria-selected={view === 'board'} data-view="board" onClick={() => { setWorkspaceView('board') }}>{t('workspace.tabBoard')}</button>
              <button type="button" role="tab" aria-selected={view === 'config'} data-view="config" onClick={() => { setWorkspaceView('config') }}>{t('workspace.tabConfig')}</button>
            </div>
          )}
        </header>
        {status === 'error' && <div className={css.error} role="alert"><span>{t('workspace.error')}</span><button onClick={() => setRetry(value => value + 1)}>{t('workspace.retry')}</button></div>}
        {selected === undefined ? status === 'loading' ? <div className={css.skeleton} role="status" aria-label={t('workspace.loading')}><i /><i /><i /></div> : <section className={css.empty}>
          <span className={css.emptyMark} aria-hidden>↳</span>
          <h3>{t('workspace.emptyTitle')}</h3><p>{t('workspace.emptyBody')}</p>
          <button onClick={backToChat}>{t('workspace.back')}</button>
        </section> : (
          <>
            {view === 'config'
              ? (live.includes(selected) && selected.phase === 'staged'
                  ? <StagingPlanEditor team={selected} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={backToChat} onDiscarded={backToChat} t={t} />
                  : <TeamConfigPanel team={selected} t={t} />)
              : (live.includes(selected) && selected.phase === 'staged'
                  ? <section className={css.stagedNotice} data-staged-notice>
                      <h3>{t('config.stagedTitle')}</h3>
                      <p>{t('config.stagedBody')}</p>
                      <button type="button" onClick={() => { setWorkspaceView('config') }}>{t('config.openConfig')}</button>
                    </section>
                  : <TeamSection key={`${sessionId}:${selected.teamId}`} team={selected} workspace historic={history}
                      modelDirectory={selected.phase === 'staged' ? modelDirectories.directoryFor(sessionId) : undefined}
                      onContinuePlanning={backToChat} onDiscarded={backToChat} onNavigate={openMember} t={t} />)}
          </>
        )}
      </div>
      {selected !== undefined && live.includes(selected) && (
        officeOpen ? (
          <>
            <div
              className={css.splitter}
              data-control="office-splitter"
              role="separator"
              aria-orientation="horizontal"
              aria-label={t('office.resize')}
              title={t('office.resize')}
              onMouseDown={beginSplit}
            />
            <section
              ref={officePaneRef}
              className={css.officePane}
              data-office-pane
              aria-label={t('office.title')}
              style={officeHeight === undefined ? undefined : { height: `${Math.round(officeHeight)}px`, flex: '0 0 auto' }}
            >
              <PixelOffice
                team={selected}
                t={t}
                onCollapse={() => { setOfficeOpenPersist(false) }}
                onOpenMember={(memberId) => { openMember(selected.captainSessionId as SessionId, memberId as SessionId) }}
              />
            </section>
          </>
        ) : (
          <div className={css.officeBar}>
            <button
              type="button"
              className={css.officeBarButton}
              data-control="office-expand"
              aria-label={t('office.expand')}
              title={t('office.expand')}
              onClick={() => { setOfficeOpenPersist(true) }}
            >
              <span aria-hidden>⛩</span>
              {t('office.expand')}
            </button>
          </div>
        )
      )}
    </div>
  )
}
