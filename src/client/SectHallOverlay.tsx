/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
 *
 * 由 shell.overlay 的常驻监视器渲染，所以不依赖右侧栏标签页；墙面设施、剑盒、
 * 名册等在浮层内部展开（内容气泡贴在面板上方），传送阵在地板上切换「浮空 / 归栏」。
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ActivityTeam } from './activity-monitor.ts'
import type { AgentTeamsTranslate } from './locales.ts'
import { TeamSection } from './ActivityPanel.tsx'
import { StagingPlanEditor } from './StagingPlanEditor.tsx'
import { TeamConfigPanel } from './TeamConfigPanel.tsx'
import { PixelOffice, type SceneAction } from './pixel-office/PixelOffice.tsx'
import css from './SectHallOverlay.module.css'

const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed'
const DOCKED_KEY = 'agent-teams-pixel.hallDocked'
const PANEL_RECT_KEY = 'agent-teams-pixel.hallRect'

interface PanelRect {
  readonly x: number
  readonly y: number
  readonly w?: number
  readonly h?: number
}

function readBool(key: string): boolean {
  if (typeof window === 'undefined') return false
  try { return window.localStorage.getItem(key) === '1' } catch { return false }
}

function writeBool(key: string, value: boolean): void {
  try { window.localStorage.setItem(key, value ? '1' : '0') } catch { /* private mode */ }
}

function readPanelRect(): PanelRect {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  try {
    const raw = window.localStorage.getItem(PANEL_RECT_KEY)
    if (raw === null) return { x: 0, y: 0 }
    const parsed = JSON.parse(raw) as Partial<PanelRect>
    return {
      x: typeof parsed.x === 'number' && Number.isFinite(parsed.x) ? parsed.x : 0,
      y: typeof parsed.y === 'number' && Number.isFinite(parsed.y) ? parsed.y : 0,
      w: typeof parsed.w === 'number' && parsed.w > 240 ? parsed.w : undefined,
      h: typeof parsed.h === 'number' && parsed.h > 160 ? parsed.h : undefined,
    }
  } catch { return { x: 0, y: 0 } }
}

function writePanelRect(rect: PanelRect): void {
  try { window.localStorage.setItem(PANEL_RECT_KEY, JSON.stringify(rect)) } catch { /* private mode */ }
}

/** 常驻洞府浮层里的墙面设施被点击时广播的事件（供监视器等复用）。 */
export const OPEN_HALL_SHEET_EVENT = 'agent-teams:open-sheet'

export function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember }: {
  readonly team: ActivityTeam
  readonly t: AgentTeamsTranslate
  readonly sessionId: SessionId
  readonly modelDirectories: ModelDirectoryResolver
  readonly openMember: (parentId: SessionId, childId: SessionId) => void
}) {
  const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY))
  const [docked, setDocked] = useState(() => readBool(DOCKED_KEY))
  const [sheet, setSheet] = useState<SceneAction | undefined>()
  const [sheetAnchor, setSheetAnchor] = useState<{ bottom: number; right: number } | undefined>()
  const [rect, setRect] = useState<PanelRect>(() => readPanelRect())
  const panelRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)
  const latestRect = useRef(rect)
  latestRect.current = rect

  const done = team.tasks.filter(task => task.status === 'completed').length
  const total = team.tasks.length
  const staged = team.phase === 'staged'

  // 墙面设施/剑盒/名册 → 面板上方的内容气泡。
  useEffect(() => {
    const open = (event: Event): void => {
      const action = (event as CustomEvent<{ action?: SceneAction }>).detail?.action
      if (action !== undefined) setSheet(action)
    }
    window.addEventListener(OPEN_HALL_SHEET_EVENT, open)
    return () => { window.removeEventListener(OPEN_HALL_SHEET_EVENT, open) }
  }, [])

  // 内容气泡贴在面板上方（归栏时贴在栏的左侧），随面板移动/窗口缩放重新测量。
  useEffect(() => {
    if (sheet === undefined) return
    const measure = (): void => {
      const panel = panelRef.current
      if (panel === null) return
      const bounds = panel.getBoundingClientRect()
      setSheetAnchor(docked
        ? { bottom: 16, right: Math.max(16, window.innerWidth - bounds.left + 16) }
        : { bottom: Math.max(16, window.innerHeight - bounds.top + 8), right: Math.max(16, window.innerWidth - bounds.right) })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure) }
  }, [sheet, docked, collapsed, rect])

  const beginDrag = (event: React.PointerEvent<HTMLElement>): void => {
    if ((event.target as HTMLElement).closest('button') !== null) return
    const panel = panelRef.current
    if (panel === null || docked) return
    event.preventDefault()
    dragRef.current = { startX: event.clientX, startY: event.clientY, baseX: rect.x, baseY: rect.y }
    const move = (moveEvent: PointerEvent): void => {
      const drag = dragRef.current
      if (drag === null) return
      // 夹在窗口内，拖不丢。
      const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value))
      const next = {
        ...latestRect.current,
        x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), 16 - window.innerWidth, 0),
        y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), -(window.innerHeight - 96), 0),
      }
      latestRect.current = next
      setRect(next)
    }
    const up = (): void => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      writePanelRect(latestRect.current)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const toggleCollapsed = (): void => {
    const next = !collapsed
    setCollapsed(next)
    writeBool(COLLAPSED_KEY, next)
  }

  const toggleDocked = (): void => {
    const next = !docked
    setDocked(next)
    writeBool(DOCKED_KEY, next)
    setSheet(undefined)
  }

  if (typeof document === 'undefined') return null

  const transform = docked ? undefined : `translate(${rect.x}px, ${rect.y}px)`
  const panelStyle = docked
    ? undefined
    : { transform, ...(rect.w === undefined ? {} : { width: `${rect.w}px` }), ...(rect.h === undefined ? {} : { height: `${rect.h}px` }) }

  const renderSheet = (): React.ReactNode => {
    if (sheet === undefined || sheetAnchor === undefined) return null
    const title = sheet === 'inbox' ? t('workspace.inbox') : sheet === 'teams' ? t('workspace.switchTeam') : t('workspace.tabConfig')
    return createPortal((
      <aside
        className={css.sheet}
        data-sheet={sheet}
        style={{ bottom: sheetAnchor.bottom, right: sheetAnchor.right }}
        role="dialog"
        aria-modal="false"
        aria-label={title}
      >
        <header className={css.sheetHead}>
          <span className={css.sheetTitle}>{title}</span>
          <button type="button" className={css.sheetClose} onClick={() => { setSheet(undefined) }} aria-label={t('office.closePanel')}>×</button>
        </header>
        <div className={css.sheetBody}>
          {sheet === 'inbox' ? (
            <ul className={css.inboxList}>
              {team.captainInbox.map((message, index) => (
                <li key={`${index}:${message.from}`} className={css.inboxRow}>
                  <span className={css.inboxFrom}>{message.from}</span>
                  <span className={css.inboxText}>{message.content}</span>
                </li>
              ))}
            </ul>
          ) : sheet === 'config' || sheet === 'board' ? (
            staged
              ? <StagingPlanEditor team={team} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={() => { setSheet(undefined) }} onDiscarded={() => { setSheet(undefined) }} t={t} />
              : <TeamConfigPanel team={team} t={t} />
          ) : (
            <TeamSection
              team={team}
              t={t}
              workspace
              onNavigate={(_parent, child) => { openMember(sessionId, child) }}
              onContinuePlanning={() => { setSheet(undefined) }}
              onDiscarded={() => { setSheet(undefined) }}
            />
          )}
        </div>
      </aside>
    ), document.body)
  }

  return (
    <>
      {createPortal((
        <section
          ref={panelRef}
          className={css.window}
          data-hall-window
          data-collapsed={collapsed || undefined}
          data-docked={docked || undefined}
          style={panelStyle}
          aria-label={t('office.sceneAria', { name: team.name })}
        >
          <header className={css.head} onPointerDown={beginDrag}>
            <span className={css.caret} aria-hidden>{collapsed ? '▸' : '▾'}</span>
            <span className={css.title}>⛩ {team.name}</span>
            <span className={css.meta}>{done}/{total}</span>
            <button type="button" className={css.headButton} data-control="hall-collapse" aria-expanded={!collapsed} onClick={toggleCollapsed}>
              {collapsed ? t('office.expand') : t('office.collapse')}
            </button>
          </header>
          {!collapsed && (
            <>
              <div className={css.canvas}>
                <PixelOffice
                  team={team}
                  t={t}
                  activeAction={sheet ?? null}
                  onAction={(action) => { setSheet(action) }}
                  onOpenMember={(memberId) => { openMember(sessionId, memberId as SessionId) }}
                  onUnavailable={() => { /* 无会话修士：由场景内提示承担 */ }}
                />
              </div>
              <footer className={css.floor}>
                <button
                  type="button"
                  className={css.portal}
                  data-control="hall-dock"
                  data-mode={docked ? 'docked' : 'floating'}
                  onClick={toggleDocked}
                  title={docked ? t('office.dockFloating') : t('office.dockSidebar')}
                >
                  <span className={css.portalGlyph} aria-hidden>✥</span>
                  <span>{docked ? t('office.dockFloating') : t('office.dockSidebar')}</span>
                </button>
                <button type="button" className={css.floorButton} data-control="hall-sword" onClick={() => { setSheet('config') }}>
                  <span aria-hidden>⚔</span>{t('office.swordBox')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-roster" onClick={() => { setSheet('teams') }}>
                  <span aria-hidden>☰</span>{t('office.roster')}
                </button>
              </footer>
            </>
          )}
        </section>
      ), document.body)}
      {renderSheet()}
    </>
  )
}
