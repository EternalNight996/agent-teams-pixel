/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起。
 *
 * 由 shell.overlay 的常驻监视器渲染；墙面设施、剑盒、名册等在浮层内部展开
 * （内容气泡贴在面板左侧）。展开时给对话让位，收起成一枚可拖动的令牌。
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ActivityTeam } from './activity-monitor.ts'
import type { AgentTeamsTranslate } from './locales.ts'
import { TeamSection } from './ActivityPanel.tsx'
import { HallInbox } from './HallInbox.tsx'
import { StagingPlanEditor } from './StagingPlanEditor.tsx'
import { TeamConfigPanel } from './TeamConfigPanel.tsx'
import { PixelOffice, type SceneAction } from './pixel-office/PixelOffice.tsx'
import { QuickStartWizard } from './QuickStartDialog.tsx'
import { CULTIVATION_ITEMS, captainKey, cultivationFromXp, idleXpPer10s, memberKey } from './cultivation.ts'
import { useCultivationVersion, xpOf } from './cultivation-store.ts'
import { OPEN_HALL_SHEET_EVENT, type HallSheetAction } from './hall-events.ts'
import { ASCENSION_RANKS, ASCENSION_STORY, ASCENSION_TIPS, rankAtLevel } from './immortals.ts'
import { realmPaletteForLevel } from './realm-colors.ts'
import { PLUGIN_REPO, buildAgentPrompt, buildIssueUrl, collectDiagnostics } from './feedback.ts'
import { PLUGIN_VERSION } from './version.ts'
import { hallSheetPlacement, hallYieldWidth } from './hall-geometry.ts'
import css from './SectHallOverlay.module.css'

/** 交流群 / 赞助码由宿主插件路由提供（assets/support）。 */
const SUPPORT_BASE = '/plugins/dsh-pixel-team/support'
const supportAsset = (file: string): string => `${SUPPORT_BASE}/${file}`

/** 复制到剪贴板：Clipboard API 失败时退回 execCommand，保持一次点击能复制。 */
async function copyText(text: string): Promise<boolean> {
  if (text === '') return false
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* 落到 execCommand */ }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

const COLLAPSED_KEY = 'dsh-pixel-team.hallCollapsed'
const PANEL_RECT_KEY = 'dsh-pixel-team.hallRect'
const TOKEN_KEY = 'dsh-pixel-team.hallToken'
/** 名册历史列表里的“当前宗门”哨兵。 */
const CURRENT_TEAM_SENTINEL = '__current__'

/** 展开的面板给对话让位：写在 html 上的属性与位移变量（与右侧栏同一手法）。 */
const HALL_OPEN_ATTRIBUTE = 'data-agent-teams-hall-open'
const HALL_SHIFT_PROPERTY = '--agent-teams-hall-shift'

/** 收起后的令牌基准尺寸（标准面板），实际按面板大小缩放。 */
const TOKEN_SIZE = { w: 38, h: 68 } as const

interface TokenPoint {
  readonly x: number
  readonly y: number
}

/** 把令牌夹在窗口内；留 8px 边缘，拖不出屏。 */
function clampToken(x: number, y: number, w: number, h: number): TokenPoint {
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight
  return {
    x: Math.max(8, Math.min(x, vw - w - 8)),
    y: Math.max(8, Math.min(y, vh - h - 8)),
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
        return clampToken(parsed.x, parsed.y, TOKEN_SIZE.w, TOKEN_SIZE.h)
      }
    }
  } catch { /* private mode */ }
  // 默认停在右下角：与展开面板同一处，收起时不跳。
  return clampToken(window.innerWidth - TOKEN_SIZE.w - 16, window.innerHeight - TOKEN_SIZE.h - 16, TOKEN_SIZE.w, TOKEN_SIZE.h)
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

type SheetKind = HallSheetAction | 'character'

/** 「宗门志」里的四个页签（赞助排第一）。 */
type AboutTab = 'sponsor' | 'group' | 'about' | 'feedback'

/** 物品品阶：按解锁等级着色，越晚解锁越贵气（纯展示，不参与数值）。 */
function itemTier(level: number): 'mortal' | 'rare' | 'epic' | 'legendary' {
  if (level >= 2800) return 'legendary'
  if (level >= 350) return 'epic'
  if (level >= 20) return 'rare'
  return 'mortal'
}

/** 面板预设尺寸：初始给大一些。 */
const PANEL_SIZES = {
  compact: { w: 460, h: 380 },
  normal: { w: 620, h: 500 },
  large: { w: 820, h: 640 },
  huge: { w: 1040, h: 760 },
} as const

export function SectHallOverlay({
  team, history = [], t, sessionId, modelDirectories, openMember, openCaptain,
}: {
  /** 无队伍时缺省：浮层仍常驻，渲染一座只有掌门的空洞府。 */
  readonly team?: ActivityTeam
  /** 本掌门会话下已归档的历史宗门（名册页展示）。 */
  readonly history?: readonly ActivityTeam[]
  readonly t: AgentTeamsTranslate
  /** 当前会话；应用级浮层在个别宿主上可能拿不到，此时只能渲染空洞府。 */
  readonly sessionId?: SessionId
  readonly modelDirectories: ModelDirectoryResolver
  readonly openMember: (parentId: SessionId, childId: SessionId) => void
  /** 回到掌门所在的主对话（点击场景里的掌门）。 */
  readonly openCaptain?: (captainSessionId: SessionId) => void
}) {
  const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY))
  const [sheet, setSheet] = useState<SheetKind | undefined>()
  // 开宗成功后等新队伍落地，再自动打开道统配置让掌门审核；审核完跳到宗门进度。
  const [pendingReview, setPendingReview] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [historyTeamId, setHistoryTeamId] = useState<string | undefined>()
  const [characterId, setCharacterId] = useState<string | undefined>()
  const previousSessionRef = useRef(sessionId)
  // 法器 / 坐骑 / 技能各选各的，互不覆盖；按角色分开记，来回切换不会丢装备。
  type EquippedSlots = { weapon?: string; mount?: string; skill?: string }
  const [equippedByCharacter, setEquippedByCharacter] = useState<Record<string, EquippedSlots>>({})
  const equipped: EquippedSlots = characterId === undefined ? {} : (equippedByCharacter[characterId] ?? {})
  useCultivationVersion()
  // 宗门志：页签 + 反馈草稿 + 复制结果提示。
  const [aboutTab, setAboutTab] = useState<AboutTab>('sponsor')
  const [feedbackText, setFeedbackText] = useState('')
  const [aboutNotice, setAboutNotice] = useState('')
  const [sheetAnchor, setSheetAnchor] = useState<{ left: number; top: number; width: number; maxHeight: number } | undefined>()
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
  // 在修士子会话里洞府展示的是主队伍，成员跳转必须用主会话 id 作为 parent。
  const ownerSessionId = (team?.captainSessionId ?? sessionId) as SessionId | undefined
  useEffect(() => {
    if (!pendingReview || !hasTeam) return
    setPendingReview(false)
    setReviewing(true)
    setSheet('config')
  }, [pendingReview, hasTeam])
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
  // 天机阁打开时，切换修士对话后装备页实时跟随当前角色；仅会话变化时触发。
  useEffect(() => {
    if (sheet !== 'character') { previousSessionRef.current = sessionId; return }
    if (previousSessionRef.current === sessionId) return
    previousSessionRef.current = sessionId
    if (sessionId === undefined) return
    if (sessionId === hall.captainSessionId) {
      setCharacterId(hall.captainSessionId)
      return
    }
    const member = hall.members.find(item => item.id === sessionId)
    if (member !== undefined) setCharacterId(member.id || member.name)
  }, [sheet, sessionId, hall.captainSessionId, hall.members])
  // 点击掌门：回到他所在的主对话（而不是打开一个“成员子会话”）。
  const goHome = (): void => {
    if (openCaptain !== undefined && hall.captainSessionId !== '') openCaptain(hall.captainSessionId as SessionId)
  }
  // 当前对话框属于谁：掌门主对话还是某位修士的子对话。
  const viewingCaptain = sessionId !== undefined && sessionId === hall.captainSessionId
  const viewingMember = sessionId === undefined
    ? undefined
    : hall.members.find(member => member.id === sessionId)
  // 新建任务由掌门（主对话）执行：回到主对话并聚焦输入框，用户直接说要建什么。
  const startNewTask = (): void => {
    setSheet(undefined)
    goHome()
    window.setTimeout(() => {
      document.querySelector<HTMLElement>('[data-composer-card] [contenteditable="true"][role="textbox"], [data-composer-card] textarea')?.focus()
    }, 160)
  }
  // 天机阁：打开当前角色（或掌门）的装备页。
  const openGear = (): void => {
    const memberRef = viewingMember === undefined ? undefined : (viewingMember.id || viewingMember.name)
    const target = viewingCaptain ? hall.captainSessionId : memberRef ?? hall.captainSessionId
    if (target !== '') {
      setCharacterId(target)
      setSheet('character')
    }
  }
  const staged = hall.phase === 'staged'
  // 令牌随面板配置缩放：标准 620×500 = 1.0，超大面板最多 1.8 倍。
  const tokenScale = Math.min(1.8, Math.max(0.8, size.h / PANEL_SIZES.normal.h))
  const tokenSize = {
    w: Math.round(TOKEN_SIZE.w * tokenScale),
    h: Math.round(TOKEN_SIZE.h * tokenScale),
  }
  const tokenAt = clampToken(token.x, token.y, tokenSize.w, tokenSize.h)

  // 墙面设施/剑盒/名册 → 面板上方的内容气泡。
  useEffect(() => {
    const open = (event: Event): void => {
      const action = (event as CustomEvent<{ action?: HallSheetAction }>).detail?.action
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
      // 内容气泡统一贴面板左上角（用户习惯），并留出视口内的高度上限。
      const top = Math.max(8, bounds.top)
      const maxHeight = Math.max(160, window.innerHeight - top - 8)
      setSheetAnchor({ ...hallSheetPlacement(bounds.left, window.innerWidth), top, maxHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure) }
  }, [sheet, collapsed, rect, size])

  const beginDrag = (event: React.PointerEvent<HTMLElement>): void => {
    if ((event.target as HTMLElement).closest('button') !== null) return
    const panel = panelRef.current
    if (panel === null) return
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
    if (next) {
      // 收起成一枚令牌时，内容气泡也一并收起，避免令牌旁边挂着一块面板。
      setSheet(undefined)
    }
  }

  // 令牌可拖动：拖到任意角落，位置记在 localStorage；没拖动就是点击展开。
  const beginTokenDrag = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    const drag = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: tokenAt.x,
      baseY: tokenAt.y,
      lastX: tokenAt.x,
      lastY: tokenAt.y,
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
      const next = clampToken(drag.baseX + dx, drag.baseY + dy, tokenSize.w, tokenSize.h)
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

  // 面板尺寸变化 → 令牌跟着变大/变小，并夹回可视区。
  useEffect(() => {
    setToken((current) => {
      const next = clampToken(current.x, current.y, tokenSize.w, tokenSize.h)
      return next.x === current.x && next.y === current.y ? current : next
    })
  }, [tokenSize.w, tokenSize.h])

  // 展开的洞府像右侧栏一样让对话内容向左收，避免被面板盖住。
  useEffect(() => {
    const root = document.documentElement
    const apply = (): void => {
      if (collapsed) {
        root.removeAttribute(HALL_OPEN_ATTRIBUTE)
        root.style.removeProperty(HALL_SHIFT_PROPERTY)
        return
      }
      const vw = window.innerWidth
      // 让位宽度 = 洞府宽度的 2/3；窄窗口至少给对话留 360px。
      const shift = hallYieldWidth(size.w, vw)
      root.setAttribute(HALL_OPEN_ATTRIBUTE, '')
      root.style.setProperty(HALL_SHIFT_PROPERTY, `${shift}px`)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('resize', apply)
      root.removeAttribute(HALL_OPEN_ATTRIBUTE)
      root.style.removeProperty(HALL_SHIFT_PROPERTY)
    }
  }, [collapsed, size.w])

  const applySize = (next: { w: number; h: number }): void => {
    setSize(next)
    writePanelRect({ ...rect, ...next })
  }

  // 关掉“审核道统”这一步时直接去宗门进度，而不是回到空洞府。
  const finishSheet = (): void => {
    if (reviewing) {
      setReviewing(false)
      setSheet('board')
      return
    }
    setSheet(undefined)
  }
  const toggleSheet = (kind: SheetKind): void => {
    if (sheet === kind) { finishSheet(); return }
    setReviewing(false)
    setSheet(kind)
  }

  // 自由缩放：拖右下角改大小，尺寸记在 localStorage。
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
    transform: `translate(${rect.x}px, ${rect.y}px)`,
    width: `${size.w}px`,
    height: `${size.h}px`,
  }

  // 开宗：和功德碑/进度一样在面板左侧的内容气泡里展示，不弹独立窗口。
  const startSect = (): void => {
    setSheet(current => current === 'start' ? undefined : 'start')
  }

  // 宗门志里的复制结果：2.4 秒后自动消失。
  const flashAbout = (text: string): void => {
    setAboutNotice(text)
    window.setTimeout(() => setAboutNotice(current => (current === text ? '' : current)), 2400)
  }

  const renderSheet = (): React.ReactNode => {
    if (sheet === undefined || sheetAnchor === undefined) return null
    // 无队伍时墙面设施 / 名册仍然可点：给出「尚未开宗」的提示与开宗入口。
    const noTeamHint = (
      <div className={css.settings}>
        <p className={css.settingsHint}>{t('workspace.emptyTitle')}</p>
        <p className={css.settingsMeta}>{t('workspace.emptyBody')}</p>
        <button type="button" className={css.settingsButton} data-control="hall-start" onClick={startSect}>
          <span aria-hidden>⛩</span> {t('quickstart.entry')}
        </button>
      </div>
    )
    const viewingCurrent = hasTeam && (historyTeamId === undefined || historyTeamId === CURRENT_TEAM_SENTINEL)
    const selectedHistory = history.find(team => team.teamId === historyTeamId)
    const historyTasks = hall.tasks.filter(task => task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled')
    const taskStatusLabel = (status: string): string => status === 'completed'
      ? t('task.status.completed')
      : status === 'failed' ? t('task.status.failed') : t('task.status.cancelled')
    const character = characterId === undefined
      ? undefined
      : characterId === hall.captainSessionId
        ? { id: hall.captainSessionId, name: t('office.captain'), key: captainKey(hall.name), isCaptain: true }
        : (() => {
            const member = hall.members.find(item => item.id === characterId || item.name === characterId)
            return member === undefined
              ? undefined
              : { id: member.id || member.name, name: member.name, key: memberKey(member.name), isCaptain: false }
          })()
    const characterCultivation = character === undefined ? undefined : cultivationFromXp(xpOf(character.key))
    // 封神榜跟着「当前打开的对话」走：掌门看掌门，修士看修士。
    const viewerKey = viewingCaptain
      ? captainKey(hall.name)
      : viewingMember === undefined ? undefined : memberKey(viewingMember.name)
    const viewerCultivation = viewerKey === undefined ? undefined : cultivationFromXp(xpOf(viewerKey))
    const viewerName = viewingCaptain ? t('office.captain') : viewingMember?.name
    const viewerRank = viewerCultivation === undefined ? undefined : rankAtLevel(viewerCultivation.level)
    // 封神榜先看「本宗谁在榜上」：按修为从高到低排。
    const roster = !hasTeam
      ? []
      : [
          { key: captainKey(hall.name), name: t('office.captain'), cultivation: cultivationFromXp(xpOf(captainKey(hall.name))) },
          ...hall.members.map(member => ({
            key: memberKey(member.name),
            name: member.name,
            cultivation: cultivationFromXp(xpOf(memberKey(member.name))),
          })),
        ].sort((left, right) => right.cultivation.level - left.cultivation.level
          || right.cultivation.xp - left.cultivation.xp)
    // 宗门志：反馈诊断（只在打开该页时采样）。
    const diagnostics = sheet === 'about' && aboutTab === 'feedback'
      ? collectDiagnostics({
          version: PLUGIN_VERSION,
          team: hasTeam
            ? {
                name: hall.name,
                phase: hall.phase,
                members: hall.members.length,
                tasks: {
                  total: hall.tasks.length,
                  done,
                  failed: hall.tasks.filter(task => task.status === 'failed').length,
                  running: hall.tasks.filter(task => task.state === 'running').length,
                },
              }
            : undefined,
        })
      : ''
    const openIssue = (): void => {
      if (feedbackText.trim() === '') {
        flashAbout(t('about.feedbackNeedText'))
        return
      }
      const url = buildIssueUrl({ description: feedbackText, diagnostics, version: PLUGIN_VERSION })
      try {
        window.open(url, '_blank', 'noopener')
      } catch {
        flashAbout(t('about.feedbackOpenFail'))
      }
    }
    const copyDiagnostics = async (): Promise<void> => {
      const ok = await copyText(diagnostics)
      flashAbout(t(ok ? 'about.feedbackCopied' : 'about.feedbackCopyFail'))
    }
    const copyPrompt = async (): Promise<void> => {
      const locale = typeof navigator !== 'undefined' && String(navigator.language ?? '').toLowerCase().startsWith('en') ? 'en' : 'zh'
      const ok = await copyText(buildAgentPrompt({ description: feedbackText, diagnostics, locale }))
      flashAbout(t(ok ? 'about.feedbackCopied' : 'about.feedbackCopyFail'))
    }
    const title = sheet === 'settings' ? t('office.panelConfig')
      : sheet === 'start' ? t('quickstart.title')
        : sheet === 'character' ? t('office.equipment')
          : sheet === 'ranks' ? t('office.ascension')
            : sheet === 'about' ? t('office.aboutTitle')
              : sheet === 'inbox' ? t('workspace.inbox')
              : sheet === 'teams' ? t('office.facility.teams')
                : sheet === 'board' ? t('workspace.tabBoard')
                  : t('workspace.tabConfig')
    return createPortal((
      <aside
        className={css.sheet}
        data-sheet={sheet}
        style={{
          left: sheetAnchor.left,
          top: sheetAnchor.top,
          width: sheetAnchor.width,
          // 所有内容气泡统一与山门洞府同高，窗口更矮时按可用高度封顶。
          height: Math.min(size.h, sheetAnchor.maxHeight),
          maxHeight: sheetAnchor.maxHeight,
          ['--hall-sheet-max' as string]: `${size.h}px`,
        } as React.CSSProperties}
        role="dialog"
        aria-modal="false"
        aria-label={title}
      >
        <header className={css.sheetHead}>
          <span className={css.sheetTitle}>{title}</span>
          {sheet === 'board' && hasTeam && (
            <button type="button" className={css.sheetAction} onClick={startNewTask} title={t('office.newTaskHint')}>
              ＋ {t('office.newTask')}
            </button>
          )}
          <button type="button" className={css.sheetClose} onClick={finishSheet} aria-label={t('office.closePanel')}>×</button>
        </header>
        <div className={css.sheetBody}>
          {sheet === 'ranks' ? (
            <div className={css.ranks}>
              <p className={css.settingsHint}>{t('office.ascensionIntro')}</p>
              {viewerCultivation !== undefined && viewerName !== undefined && (
                <div className={css.rankHero}>
                  <span className={css.rankHeroName}>
                    {viewerName} · <span style={{ color: realmPaletteForLevel(viewerCultivation.level).border }}>Lv.{viewerCultivation.level} {t(viewerCultivation.rankKey)}</span>
                  </span>
                  <div className={css.xpTrack}><span style={{ width: `${Math.round(viewerCultivation.ratio * 100)}%`, background: realmPaletteForLevel(viewerCultivation.level).bar }} /></div>
                  <span className={css.settingsMeta}>{viewerCultivation.xp} / {viewerCultivation.next} XP · {t('office.ascensionCurrent')}</span>
                </div>
              )}
              {roster.length > 0 && (
                <>
                  <span className={css.historyTitle}>{t('office.ascensionSect')}</span>
                  <ol className={css.rosterList}>
                    {roster.map((entry, index) => (
                      <li key={entry.key} className={css.rosterRow}>
                        <span className={css.rosterIndex}>{index + 1}</span>
                        <span className={css.rosterName}>{entry.name}</span>
                        <span className={css.rosterLevel} style={{ color: realmPaletteForLevel(entry.cultivation.level).border }}>
                          Lv.{entry.cultivation.level} · {t(entry.cultivation.rankKey)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              <span className={css.historyTitle}>{t('office.ascensionRealmList')}</span>
              <ol className={css.rankList}>
                {ASCENSION_RANKS.map(rank => {
                  const current = viewerRank?.realm === rank.realm
                  return (
                    <li key={rank.realm} className={css.rankRow} data-current={current || undefined}>
                      <div className={css.rankTop}>
                        <span className={css.rankName}>{t(rank.realm)}</span>
                        <span className={css.rankRange} style={{ color: realmPaletteForLevel(rank.levelMin).border }}>
                          Lv.{rank.levelMin}–{rank.levelMax}
                        </span>
                        {current && <span className={css.rankCurrent}>{t('office.ascensionYouAre')}</span>}
                      </div>
                      <p className={css.rankDesc}>{t(rank.descKey)}</p>
                    </li>
                  )
                })}
              </ol>
              <span className={css.historyTitle}>{t('office.ascensionFast')}</span>
              <ul className={css.tips}>
                {ASCENSION_TIPS.map(key => <li key={key} className={css.tip}>{t(key)}</li>)}
              </ul>
              <span className={css.historyTitle}>{t('office.ascensionStory')}</span>
              <div className={css.story}>
                {ASCENSION_STORY.map(key => <p key={key}>{t(key)}</p>)}
              </div>
            </div>
          ) : sheet === 'about' ? (
            <div className={css.about}>
              <div className={css.aboutTabs} role="tablist">
                {([
                  ['sponsor', 'about.tab.sponsor'],
                  ['group', 'about.tab.group'],
                  ['about', 'about.tab.about'],
                  ['feedback', 'about.tab.feedback'],
                ] as const).map(([id, key]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    className={css.aboutTab}
                    data-active={aboutTab === id || undefined}
                    onClick={() => { setAboutTab(id); setAboutNotice('') }}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              {aboutTab === 'group' ? (
                <div className={css.aboutSection}>
                  <p className={css.settingsHint}>{t('about.groupHint')}</p>
                  <figure className={css.qrCard}>
                    <img src={supportAsset('group-qr.jpg')} alt={t('about.groupCaption')} loading="lazy" />
                    <figcaption>{t('about.groupCaption')}</figcaption>
                  </figure>
                  <p className={css.settingsHint}>{t('about.groupNote')}</p>
                  <p className={css.settingsMeta}>{t('about.groupFallback')}</p>
                  <div className={css.aboutActions}>
                    <a className={css.aboutLink} href={PLUGIN_REPO} target="_blank" rel="noreferrer">⌂ {t('about.repo')} ↗</a>
                  </div>
                </div>
              ) : aboutTab === 'sponsor' ? (
                <div className={css.aboutSection}>
                  <p className={css.settingsHint}>{t('about.sponsorHint')}</p>
                  <div className={css.qrGrid}>
                    <figure className={css.qrCard}>
                      <img src={supportAsset('wechat-pay.jpg')} alt={t('about.sponsorPay')} loading="lazy" />
                      <figcaption>{t('about.sponsorPay')}</figcaption>
                    </figure>
                    <figure className={css.qrCard}>
                      <img src={supportAsset('wechat-reward.jpg')} alt={t('about.sponsorReward')} loading="lazy" />
                      <figcaption>{t('about.sponsorReward')}</figcaption>
                    </figure>
                  </div>
                  <p className={css.settingsHint}>{t('about.sponsorNote')}</p>
                  <div className={css.aboutActions}>
                    <a className={css.aboutLink} href={PLUGIN_REPO + '/blob/main/SPONSOR.md'} target="_blank" rel="noreferrer">☕ {t('about.sponsorLink')} ↗</a>
                  </div>
                </div>
              ) : aboutTab === 'about' ? (
                <div className={css.aboutSection}>
                  <p className={css.settingsHint}>{t('about.intro')}</p>
                  <div className={css.aboutMeta}>
                    <span>{t('about.version')}: {PLUGIN_VERSION}</span>
                    <span>{t('about.author')}: 惠州市梦游科技有限公司</span>
                    <span>{t('about.license')}: MIT</span>
                  </div>
                  <p className={css.settingsHint}>{t('about.companyNote')}</p>
                  <div className={css.aboutActions}>
                    <a className={css.aboutLink} href={PLUGIN_REPO} target="_blank" rel="noreferrer">⌂ {t('about.repo')} ↗</a>
                    <a className={css.aboutLink} href={PLUGIN_REPO + '/issues'} target="_blank" rel="noreferrer">🐞 {t('about.issues')} ↗</a>
                    <a className={css.aboutLink} href={PLUGIN_REPO + '/releases'} target="_blank" rel="noreferrer">🏷 {t('about.releases')} ↗</a>
                  </div>
                </div>
              ) : (
                <div className={css.aboutSection}>
                  <p className={css.settingsHint}>{t('about.feedbackWhy')}</p>
                  <textarea
                    className={css.feedbackText}
                    value={feedbackText}
                    onChange={(event) => setFeedbackText(event.target.value)}
                    placeholder={t('about.feedbackPlaceholder')}
                    rows={4}
                  />
                  <div className={css.feedbackDiagHead}>
                    <span>{t('about.feedbackDiag')}</span>
                    <button type="button" className={css.sheetAction} onClick={() => { void copyDiagnostics() }}>{t('about.feedbackCopyDiag')}</button>
                  </div>
                  <pre className={css.feedbackDiag}>{diagnostics}</pre>
                  <p className={css.settingsMeta}>{t('about.feedbackPrivacy')}</p>
                  <div className={css.aboutActions}>
                    <button type="button" className={css.sheetAction} onClick={openIssue}>🚀 {t('about.feedbackOpenIssue')}</button>
                    <button type="button" className={css.sheetAction} onClick={() => { void copyPrompt() }}>🤖 {t('about.feedbackCopyPrompt')}</button>
                  </div>
                  {aboutNotice !== '' && <p className={css.aboutNotice}>{aboutNotice}</p>}
                </div>
              )}
            </div>
          ) : sheet === 'settings' ? (
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
          ) : sheet === 'start' ? (
            sessionId === undefined
              ? <p className={css.settingsHint}>{t('workspace.emptyTitle')}</p>
              : <QuickStartWizard
                  sessionId={sessionId}
                  t={t}
                  onDone={() => { setSheet(undefined) }}
                  onFounded={() => { setPendingReview(true) }}
                />
          ) : sheet === 'character' ? (
            character === undefined || characterCultivation === undefined ? (
              <p className={css.settingsHint}>{t('workspace.emptyTitle')}</p>
            ) : (
              <div className={css.character}>
                <div className={css.characterHead}>
                  <span className={css.characterName}>{character.name}</span>
                  <span className={css.characterLevel} style={{ color: realmPaletteForLevel(characterCultivation.level).border }}>
                    Lv.{characterCultivation.level} {t(characterCultivation.rankKey)}
                  </span>
                </div>
                <div className={css.xpTrack}><span style={{ width: `${Math.round(characterCultivation.ratio * 100)}%`, background: realmPaletteForLevel(characterCultivation.level).bar }} /></div>
                <p className={css.settingsMeta}>{characterCultivation.xp} / {characterCultivation.next} XP</p>
                <p className={css.settingsMeta}>{t('office.levelEarnHint')}</p>
                <p className={css.settingsMeta}>{t('office.equipLiveHint')}</p>
                <p className={css.settingsMeta}>{t('office.idleGain', { xp: idleXpPer10s(characterCultivation.level) })}</p>
                {([
                  { kind: 'weapon', title: t('office.weapon'), hint: undefined },
                  { kind: 'mount', title: t('office.mounts'), hint: t('office.mountHint') },
                  { kind: 'skill', title: t('office.skills'), hint: undefined },
                ] as const).map(section => {
                  const items = CULTIVATION_ITEMS.filter(item => item.kind === section.kind)
                  const unlocked = items.filter(item => characterCultivation.level >= item.level).length
                  // 未选坐骑时默认步行：装备栏要如实反映场景里的形态。
                  const equippedMount = equipped.mount ?? 'mount-walk'
                  return (
                    <section key={section.kind} className={css.inventorySection} data-kind={section.kind}>
                      <header className={css.sectionHead}>
                        <span className={css.historyTitle}>{section.title}</span>
                        <span className={css.sectionCount}>{unlocked}/{items.length}</span>
                      </header>
                      {section.hint !== undefined && <p className={css.sectionHint}>{section.hint}</p>}
                      <div className={css.inventory}>
                        {items.map(item => {
                          const locked = characterCultivation.level < item.level
                          const isEquipped = section.kind === 'mount'
                            ? equippedMount === item.id
                            : equipped[item.kind] === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={css.item}
                              data-kind={item.kind}
                              data-tier={itemTier(item.level)}
                              data-locked={locked || undefined}
                              data-equipped={isEquipped || undefined}
                              disabled={locked}
                              aria-pressed={isEquipped}
                              title={`${t(item.key as Parameters<typeof t>[0])} · Lv.${item.level}`}
                              onClick={() => {
                                if (locked) return
                                setEquippedByCharacter(current => ({
                                  ...current,
                                  [character.id]: { ...current[character.id], [item.kind]: item.id },
                                }))
                                const label = t(item.key as Parameters<typeof t>[0])
                                if (item.kind === 'mount') {
                                  window.dispatchEvent(new CustomEvent('agent-teams:mount', {
                                    detail: { id: character.id, form: item.form ?? 'off', mountId: item.id, label },
                                  }))
                                } else {
                                  window.dispatchEvent(new CustomEvent('agent-teams:equip', {
                                    detail: { id: character.id, kind: item.kind, tier: item.level, itemId: item.id, label },
                                  }))
                                }
                              }}
                            >
                              <span className={css.itemIcon} aria-hidden>{item.icon}</span>
                              <span className={css.itemName}>{t(item.key as Parameters<typeof t>[0])}</span>
                              <span className={css.itemFoot}>
                                <span className={css.itemLevel}>Lv.{item.level}</span>
                                {locked
                                  ? <span className={css.itemBadge} data-tone="locked">{t('office.locked')}</span>
                                  : isEquipped ? <span className={css.itemBadge}>{t('office.equipped')}</span> : null}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )
          ) : sheet === 'inbox' ? (
            <HallInbox messages={hall.captainInbox} t={t} />
          ) : sheet === 'config' ? (
            !hasTeam
              ? noTeamHint
              : staged && sessionId !== undefined
                ? <StagingPlanEditor team={hall} modelDirectory={modelDirectories.directoryFor(sessionId)} onContinuePlanning={() => { setSheet(undefined) }} onDiscarded={() => { setSheet(undefined) }} t={t} />
                : <TeamConfigPanel team={hall} t={t} />
          ) : sheet === 'teams' ? (
            <div className={css.history}>
              {/* 已开宗并跑过任务后，山门→名册仍然保留开宗入口；已有宗门时向导会提示替换。 */}
              <button type="button" className={css.historyStart} onClick={startSect} title={t('quickstart.entryTitle')}>
                <span aria-hidden>⛩</span>{t('quickstart.entry')}
              </button>
              {!hasTeam && history.length === 0 && historyTasks.length === 0 && (
                <p className={css.settingsHint}>{t('office.historyEmpty')}</p>
              )}
              {(hasTeam || history.length > 0) && (
                <div className={css.historyBlock}>
                  <span className={css.historyTitle}>{t('office.historyTeams')}</span>
                  <div className={css.historyList}>
                    {hasTeam && (
                      <button
                        type="button"
                        className={css.historyItem}
                        data-current="true"
                        data-active={viewingCurrent || undefined}
                        onClick={() => { setHistoryTeamId(CURRENT_TEAM_SENTINEL) }}
                      >
                        <span className={css.historyName}>
                          <span className={css.historyCurrentDot} aria-hidden />
                          {hall.name}
                          <span className={css.historyCurrentBadge}>{t('office.historyCurrent')}</span>
                        </span>
                        <span className={css.historyMeta}>{done}/{total} · {t('team.stats.members', { count: hall.members.length })}</span>
                      </button>
                    )}
                    {history.map(team => {
                      const done = team.tasks.filter(task => task.status === 'completed').length
                      return (
                        <button
                          key={team.teamId}
                          type="button"
                          className={css.historyItem}
                          data-active={!viewingCurrent && selectedHistory?.teamId === team.teamId || undefined}
                          onClick={() => { setHistoryTeamId(team.teamId) }}
                        >
                          <span className={css.historyName}>
                            <span className={css.historyPastDot} aria-hidden />
                            {team.name}
                            <span className={css.historyPastBadge}>{t('office.historyPast')}</span>
                          </span>
                          <span className={css.historyMeta}>{done}/{team.tasks.length} · {t('team.stats.members', { count: team.members.length })}</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedHistory !== undefined ? (
                    <div className={css.historyDetail}>
                      <TeamSection
                        team={selectedHistory}
                        t={t}
                        historic
                        workspace
                        onOpenCaptain={openCaptain === undefined ? undefined : () => { openCaptain(selectedHistory.captainSessionId as SessionId) }}
                        onNavigate={(_parent, child) => { if (ownerSessionId !== undefined) openMember(ownerSessionId, child) }}
                      />
                    </div>
                  ) : null}
                </div>
              )}
              {historyTasks.length > 0 && (
                <div className={css.historyBlock}>
                  <span className={css.historyTitle}>{t('office.taskHistory')}</span>
                  <ul className={css.historyTasks}>
                    {historyTasks.map(task => (
                      <li key={task.id} className={css.historyTask}>
                        <span className={css.historyTaskId}>{task.id}</span>
                        <span className={css.historyTaskSubject} title={task.subject}>{task.subject}</span>
                        <span className={css.historyTaskWho}>{task.assignee || '—'}</span>
                        <span className={css.historyTaskState} data-state={task.state}>{taskStatusLabel(task.status)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            !hasTeam
              ? noTeamHint
              : (
                <TeamSection
                  team={hall}
                  t={t}
                  workspace
                  onOpenCaptain={goHome}
                  viewingSessionId={sessionId}
                  onNavigate={(_parent, child) => { if (ownerSessionId !== undefined) openMember(ownerSessionId, child) }}
                  onContinuePlanning={() => { setSheet(undefined) }}
                  onDiscarded={() => { setSheet(undefined) }}
                />
              )
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
          style={{ left: tokenAt.x, top: tokenAt.y, width: tokenSize.w, height: tokenSize.h }}
          onPointerDown={beginTokenDrag}
          onClick={(event) => { if (event.detail === 0) toggleCollapsed() }}
          aria-label={t('office.expand')}
          aria-expanded={false}
          title={`${t('office.expand')} · ${tokenTitle}`}
        >
          <span className={css.tokenInner} style={{ transform: `scale(${tokenScale})` }} aria-hidden>
            <span className={css.tokenBody}>
              <span className={css.tokenGlyph} aria-hidden>山</span>
            </span>
            <span className={css.tokenTassel} aria-hidden />
          </span>
        </button>
      ), document.body) : createPortal((
        <section
          ref={panelRef}
          className={css.window}
          data-hall-window
          style={panelStyle}
          aria-label={t('office.sceneAria', { name: hall.name })}
        >
          <header className={css.head} onPointerDown={beginDrag}>
            <span className={css.caret} aria-hidden>▾</span>
            <span className={css.title}>⛩ {hall.name}</span>
            <span className={css.meta}>{hasTeam ? `${done}/${total}` : t('office.hallNoTeam')}</span>
            {hasTeam && (viewingCaptain || viewingMember !== undefined) && (
              <button
                type="button"
                className={css.viewer}
                data-kind={viewingCaptain ? 'captain' : 'member'}
                title={t('office.equipment')}
                onClick={() => {
                  const id = viewingCaptain ? hall.captainSessionId : (viewingMember?.id || viewingMember?.name)
                  if (id !== undefined && id !== '') { setCharacterId(id); setSheet('character') }
                }}
              >
                {viewingCaptain
                  ? `👑 ${t('office.viewingCaptain')}`
                  : `◈ ${t('office.viewingMember', { name: viewingMember?.name ?? '' })}`}
              </button>
            )}
            <button type="button" className={css.headButton} data-control="hall-collapse" aria-expanded onClick={toggleCollapsed}>
              {t('office.collapse')}
            </button>
          </header>
          <div className={css.canvas}>
                <PixelOffice
                  team={hall}
                  t={t}
                  activeAction={
                    sheet === 'character' ? 'gear'
                      : sheet === 'settings' || sheet === 'start' ? null
                        : sheet ?? null
                  }
                  onAction={(action) => {
                    // 无队伍时山门就是开宗入口（与底部「开宗」双向对应）；有队伍时开名册。
                    if (action === 'teams' && !hasTeam) { startSect(); return }
                    if (action === 'gear') { openGear(); return }
                    toggleSheet(action)
                  }}
                  onOpenMember={(memberId) => { if (ownerSessionId !== undefined) openMember(ownerSessionId, memberId as SessionId) }}
                  onOpenCaptain={goHome}
                  onOpenCharacter={(memberId) => { setCharacterId(memberId); setSheet('character') }}
                  viewingSessionId={sessionId}
                  onUnavailable={() => { /* 无会话修士：由场景内提示承担 */ }}
                  onSettings={() => { toggleSheet('settings') }}
                  settingsOpen={sheet === 'settings'}
                  teamless={!hasTeam}
                />
              </div>
              <footer className={css.floor}>
                {!hasTeam && (
                  <button
                    type="button"
                    className={`${css.floorButton} ${css.startButton}`}
                    data-control="hall-start"
                    onClick={startSect}
                    title={t('quickstart.entryTitle')}
                  >
                    <span aria-hidden>⛩</span>{t('quickstart.entry')}
                  </button>
                )}
                <button type="button" className={css.floorButton} data-control="hall-doctrine" data-active={sheet === 'config' || undefined} onClick={() => { toggleSheet('config') }}>
                  <span aria-hidden>经</span>{t('office.floorDoctrine')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-progress" data-active={sheet === 'board' || undefined} onClick={() => { toggleSheet('board') }}>
                  <span aria-hidden>碑</span>{t('office.floorProgress')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-ranks" data-active={sheet === 'ranks' || undefined} onClick={() => { toggleSheet('ranks') }}>
                  <span aria-hidden>榜</span>{t('office.floorRanks')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-roster" data-active={sheet === 'teams' || undefined} onClick={() => { toggleSheet('teams') }}>
                  <span aria-hidden>山</span>{t('office.roster')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-about" data-active={sheet === 'about' || undefined} onClick={() => { toggleSheet('about') }}>
                  <span aria-hidden>志</span>{t('office.floorAbout')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-gear" data-active={sheet === 'character' || undefined} onClick={openGear}>
                  <span aria-hidden>阁</span>{t('office.floorGear')}
                </button>
                <button type="button" className={css.floorButton} data-control="hall-settings" data-active={sheet === 'settings' || undefined} onClick={() => { toggleSheet('settings') }}>
                  <span aria-hidden>⚙</span>{t('office.floorSettings')}
                </button>
              </footer>
        </section>
      ), document.body)}
      {renderSheet()}
    </>
  )
}
