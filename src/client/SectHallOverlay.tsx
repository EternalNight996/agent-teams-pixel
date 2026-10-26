/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
 *
 * 由 shell.overlay 的常驻监视器渲染，所以不依赖右侧栏标签页；墙面设施、剑盒、
 * 名册等在浮层内部展开（内容气泡贴在面板左侧），传送阵在地板上切换「浮空 / 归栏」。
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
import { hallSheetPlacement } from './hall-geometry.ts'
import css from './SectHallOverlay.module.css'

const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed'
const DOCKED_KEY = 'agent-teams-pixel.hallDocked'
const PANEL_RECT_KEY = 'agent-teams-pixel.hallRect'
const TOKEN_KEY = 'agent-teams-pixel.hallToken'

/** 收起后的令牌尺寸（含流苏上方的牌身）。 */
const TOKEN_SIZE = { w: 38, h: 68 } as const

interface TokenPoint {
  readonly x: number
  readonly y: number
}

/** 把令牌夹在窗口内；留 8px 边缘，拖不出屏。 */
function clampToken(x: number, y: number): TokenPoint {
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight
  return {
    x: Math.max(8, Math.min(x, vw - TOKEN_SIZE.w - 8)),
    y: Math.max(8, Math.min(y, vh - TOKEN_SIZE.h - 8)),
  }
}

function readTokenPoint(): TokenPoint {
  if (typeof window === 'undefined') return { x: 16, y: 16 }
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<TokenPoint>
      if (typeof parsed.x === 'number' && Number.isFinite(parsed.x)
        && typeof parsed.y === 'number' && Number.isFinite(parsed.y)) {
        return clampToken(parsed.x, parsed.y)
      }
    }
  } catch { /* private mode */ }
  // 默认停在右下角：与展开面板同一处，收起时不跳。
  return clampToken(window.innerWidth - TOKEN_SIZE.w - 16, window.innerHeight - TOKEN_SIZE.h - 16)
}

function writeTokenPoint(point: TokenPoint): void {
  try { window.localStorage.setItem(TOKEN_KEY, JSON.stringify(point)) } catch { /* private mode */ }
}

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

type SheetKind = SceneAction | 'settings'

/** 面板预设尺寸：初始给大一些。 */
const PANEL_SIZES = {
  compact: { w: 460, h: 380 },
  normal: { w: 620, h: 500 },
  large: { w: 820, h: 640 },
} as const

export function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember }: {
  /** 无队伍时缺省：浮层仍常驻，渲染一座只有掌门的空洞府。 */
  readonly team?: ActivityTeam
  readonly t: AgentTeamsTranslate
  /** 当前会话；应用级浮层在个别宿主上可能拿不到，此时只能渲染空洞府。 */
  readonly sessionId?: SessionId
  readonly modelDirectories: ModelDirectoryResolver
  readonly openMember: (parentId: SessionId, childId: SessionId) => void
}) {
  const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY))
  const [docked, setDocked] = useState(() => readBool(DOCKED_KEY))
  const [sheet, setSheet] = useState<SheetKind | undefined>()
  const [sheetAnchor, setSheetAnchor] = useState<{ left: number; bottom: number; width: number } | undefined>()
  const [rect, setRect] = useState<PanelRect>(() => readPanelRect())
  const [token, setToken] = useState<TokenPoint>(() => readTokenPoint())
  const tokenDrag = useRef<{
    startX: number; startY: number; baseX: number; baseY: number; lastX: number; lastY: number; moved: boolean
  } | null>(null)
  const [size, setSize] = useState(() => {
    const stored = readPanelRect()
    return { w: stored.w ?? PANEL_SIZES.normal.w, h: stored.h ?? PANEL_SIZES.normal.h }
  })
  const panelRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)
  const latestRect = useRef(rect)
  latestRect.current = rect

  // 洞府常驻：即使当前会话还没有队伍，也保留浮层（空洞府里只有掌门）。
  const hasTeam = team !== undefined
  const hall: ActivityTeam = team ?? {
    workspace: '',
    teamId: '',
    name: t('office.hallEmptyName'),
    captainSessionId: '',
    phase: 'running',
    members: [],
    tasks: [],
    messageCount: 0,
    captainInbox: [],
  }
  const done = hall.tasks.filter(task => task.status === 'completed').length
  const total = hall.tasks.length
  const staged = hall.phase === 'staged'

  // 墙面设施/剑盒/名册 → 面板上方的内容气泡。
  useEffect(() => {
    const open = (event: Event): void => {
      const action = (event as CustomEvent<{ action?: SceneAction }>).detail?.action
      if (action !== undefined) setSheet(action)
    }
    window.addEventListener(OPEN_HALL_SHEET_EVENT, open)
    return () => { window.removeEventListener(OPEN_HALL_SHEET_EVENT, open) }
  }, [])

  // 内容气泡贴在面板左侧：右缘 = 面板左缘 − 8px，面板越大越靠左；再夹在窗口内。
  useEffect(() => {
    if (sheet === undefined) return
    const measure = (): void => {
      const panel = panelRef.current
      if (panel === null) return
      const bounds = panel.getBoundingClientRect()
      setSheetAnchor({ ...hallSheetPlacement(bounds.left, window.innerWidth), bottom: 16 })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure) }
  }, [sheet, docked, collapsed, rect, size])

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
    // 收起成一枚令牌时，内容气泡也一并收起，避免令牌旁边挂着一块面板。
    if (next) setSheet(undefined)
  }

  // 令牌可拖动：拖到任意角落，位置记在 localStorage；没拖动就是点击展开。
  const beginTokenDrag = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    const drag = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: token.x,
      baseY: token.y,
      lastX: token.x,
      lastY: token.y,
      moved: false,
    }
    tokenDrag.current = drag
    const cleanup = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
    const move = (moveEvent: PointerEvent): void => {
      if (tokenDrag.current !== drag) return
      const dx = moveEvent.clientX - drag.startX
      const dy = moveEvent.clientY - drag.startY
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return
      drag.moved = true
      const next = clampToken(drag.baseX + dx, drag.baseY + dy)
      drag.lastX = next.x
      drag.lastY = next.y
      setToken(next)
    }
    const up = (): void => {
      cleanup()
      if (tokenDrag.current !== drag) return
      tokenDrag.current = null
      if (drag.moved) {
        writeTokenPoint({ x: drag.lastX, y: drag.lastY })
        return
      }
      toggleCollapsed()
    }
    const cancel = (): void => {
      cleanup()
      if (tokenDrag.current === drag) tokenDrag.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }

  // 窗口缩小时把令牌夹回可视区。
  useEffect(() => {
    const clamp = (): void => {
      setToken((current) => {
        const next = clampToken(current.x, current.y)
        return next.x === current.x && next.y === current.y ? current : next
      })
    }
    window.addEventListener('resize', clamp)
    return () => { window.removeEventListener('resize', clamp) }
  }, [])

  const toggleDocked = (): void => {
    const next = !docked
    setDocked(next)
    writeBool(DOCKED_KEY, next)
    setSheet(undefined)
  }

  const applySize = (next: { w: number; h: number }): void => {
    setSize(next)
    writePanelRect({ ...rect, ...next })
  }

  const toggleSheet = (kind: SheetKind): void => {
    setSheet(current => (current === kind ? undefined : kind))
  }

  // 自由缩放：浮空与归栏窗口都能拖右下角改大小，尺寸记在 localStorage。
  useEffect(() => {
    if (collapsed) return
    const panel = panelRef.current
    if (panel === null || typeof ResizeObserver === 'undefined') return
    let timer: number | undefined
    const observer = new ResizeObserver(() => {
      if (timer !== undefined) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const bounds = panel.getBoundingClientRect()
        const next = { w: Math.round(bounds.width), h: Math.round(bounds.height) }
        setSize(current => (Math.abs(current.w - next.w) > 1 || Math.abs(current.h - next.h) > 1 ? next : current))
        writePanelRect({ ...latestRect.current, ...next })
      }, 300)
    })
    observer.observe(panel)
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [collapsed])

  if (typeof document === 'undefined') return null

  const panelStyle = {
    transform: docked ? undefined : `translate(${rect.x}px, ${rect.y}px)`,
    width: `${size.w}px`,
    height: `${size.h}px`,
  }

  const renderSheet = (): React.ReactNode => {
    if (sheet === undefined || sheetAnchor === undefined) return null
    // 尚未开宗时只有面板配置可用；队伍内容要等快照到达后再渲染。
    if (!hasTeam && sheet !== 'settings') return null
    const title = sheet === 'settings' ? t('office.panelConfig')
      : sheet === 'inbox' ? t('workspace.inbox')
        : sheet === 'teams' ? t('office.facility.teams')
          : sheet === 'board' ? t('workspace.tabBoard')
            : t('workspace.tabConfig')
    return createPortal((
      <aside
        className={css.sheet}
        data-sheet={sheet}
        style={{ left: sheetAnchor.left, bottom: sheetAnchor.bottom, width: sheetAnchor.width }}
        role="dialog"
        aria-modal="false"
        aria-label={title}
      >
        <header className={css.sheetHead}>
          <span className={css.sheetTitle}>{title}</span>
          <button type="button" className={css.sheetClose} onClick={() => { setSheet(undefined) }} aria-label={t('office.closePanel')}>×</button>
        </header>
        <div className={css.sheetBody}>
          {sheet === 'settings' ? (
            <div className={css.settings}>
              <p className={css.settingsHint}>{t('office.panelSizeHint')}</p>
              <div className={css.sizeRow}>
                {(Object.keys(PANEL_SIZES) as (keyof typeof PANEL_SIZES)[]).map((id) => {
                  const preset = PANEL_SIZES[id]
                  const active = size.w === preset.w && size.h === preset.h
                  return (
                    <button key={id} type="button" className={css.sizeChip} data-active={active || undefined} onClick={() => { applySize(preset) }}>
                      {t(`office.panelSize.${id}`)}
                    </button>
                  )
                })}
              </div>
              <p className={css.settingsMeta}>{size.w} × {size.h} px</p>
              <button type="button" className={css.settingsButton} onClick={() => { setRect({ x: 0, y: 0 }); writePanelRect({ x: 0, y: 0, ...size }) }}>
                {t('office.resetPosition')}
              </button>
            </div>
          ) : sheet === 'inbox' ? (
            <ul className={css.inboxList}>
              {hall.captainInbox.map((message, index) => (
                <li key={`${index}:${message.from}`} className={css.inboxRow}>
                  <span className={css.inboxFrom}>{message.from}</span>
                  <span className={css.inboxText}>{message.content}</span>
                </li>
              ))}
            </ul>
          ) : sheet === 'config' ? (
            staged && sessionId !== undefined
              ? <StagingPlanEditor team={hall} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={() => { setSheet(undefined) }} onDiscarded={() => { setSheet(undefined) }} t={t} />
              : <TeamConfigPanel team={hall} t={t} />
          ) : (
            <TeamSection
              team={hall}
              t={t}
              workspace
              onNavigate={(_parent, child) => { if (sessionId !== undefined) openMember(sessionId, child) }}
              onContinuePlanning={() => { setSheet(undefined) }}
              onDiscarded={() => { setSheet(undefined) }}
            />
          )}
        </div>
      </aside>
    ), document.body)
  }

  const tokenTitle = hasTeam
    ? `${hall.name} · ${done}/${total}`
    : `${hall.name} · ${t('office.hallNoTeam')}`

  return (
    <>
      {collapsed ? createPortal((
        // 收起：整座洞府缩成一枚可拖动的令牌，点一下展开。
        <button
          type="button"
          className={css.token}
          data-hall-token
          style={{ left: token.x, top: token.y }}
          onPointerDown={beginTokenDrag}
          onClick={(event) => { if (event.detail === 0) toggleCollapsed() }}
          aria-label={t('office.expand')}
          aria-expanded={false}
          title={`${t('office.expand')} · ${tokenTitle}`}
        >
          <span className={css.tokenBody} aria-hidden>
            <span className={css.tokenGlyph} aria-hidden>山</span>
          </span>
          <span className={css.tokenTassel} aria-hidden />
        </button>
      ), document.body) : createPortal((
        <section
          ref={panelRef}
          className={css.window}
          data-hall-window
          data-docked={docked || undefined}
          style={panelStyle}
          aria-label={t('office.sceneAria', { name: hall.name })}
        >
          <header className={css.head} onPointerDown={beginDrag}>
            <span className={css.caret} aria-hidden>▾</span>
            <span className={css.title}>⛩ {hall.name}</span>
            <span className={css.meta}>{hasTeam ? `${done}/${total}` : t('office.hallNoTeam')}</span>
            <button type="button" className={css.headButton} data-control="hall-collapse" aria-expanded onClick={toggleCollapsed}>
              {t('office.collapse')}
            </button>
          </header>
          <div className={css.canvas}>
                <PixelOffice
                  team={hall}
                  t={t}
                  enabledActions={hasTeam ? undefined : []}
                  activeAction={sheet === 'settings' ? null : sheet ?? null}
                  onAction={(action) => { toggleSheet(action) }}
                  onOpenMember={(memberId) => { if (sessionId !== undefined) openMember(sessionId, memberId as SessionId) }}
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
                <button type="button" className={css.floorButton} data-control="hall-settings" data-active={sheet === 'settings' || undefined} onClick={() => { toggleSheet('settings') }}>
                  <span aria-hidden>⚙</span>{t('office.panelConfig')}
                </button>
                {hasTeam && (
                  <button type="button" className={css.floorButton} data-control="hall-roster" data-active={sheet === 'teams' || undefined} onClick={() => { toggleSheet('teams') }}>
                    <span aria-hidden>☰</span>{t('office.roster')}
                  </button>
                )}
              </footer>
        </section>
      ), document.body)}
      {renderSheet()}
    </>
  )
}
