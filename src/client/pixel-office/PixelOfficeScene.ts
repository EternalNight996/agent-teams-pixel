/**
 * Deterministic pixel-office canvas renderer for one AgentTeams snapshot.
 *
 * The scene is framework-agnostic: React owns the canvas element, sizing and
 * the model, while this module owns the animation loop and all drawing. Every
 * frame is defensive — a drawing error degrades to a plain backdrop and keeps
 * the loop alive so a single bad model can never blank the office.
 *
 * Layout contract: characters and desks are drawn in the first pass and every
 * label/bubble in a second pass, so badges never get painted over by a later
 * row. The world grows taller with the row count instead of squeezing rows.
 */

/** One character shown at a desk. */
export interface SceneMember {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly activity: 'working' | 'idle' | 'unknown'
  readonly currentTask?: string
  readonly progress?: number
  readonly done?: number
  readonly total?: number
  readonly model?: string
  readonly unread?: number
  readonly isLeader?: boolean
}

/** Copy the scene needs but must not translate itself. */
export interface SceneLabels {
  readonly captain?: string
  readonly stalled?: string
  readonly awaiting?: string
  readonly empty?: string
  /** 常驻状态词：修炼中 / 静修 / 未知，显示在名牌上并驱动灵气颜色。 */
  readonly working?: string
  readonly idle?: string
  readonly unknownState?: string
}

/** 墙面数据碑：宗门气运的关键数字，已由调用方本地化。 */
export interface SceneWall {
  readonly title: string
  readonly running: string
  readonly waiting: string
  readonly done: string
  readonly stats: string
  readonly doneCount: number
  readonly total: number
  readonly failedCount: number
}

/** One immutable snapshot of the office to draw. */
export interface SceneModel {
  readonly teamName: string
  readonly phase: 'staged' | 'running'
  readonly halted?: boolean
  readonly members: readonly SceneMember[]
  readonly labels?: SceneLabels
  readonly wall?: SceneWall
}

export interface SceneHandle {
  /** Replace the model; the running loop picks it up on the next frame. */
  render(model: SceneModel): void
  /** Resize in CSS pixels; devicePixelRatio is handled internally. */
  resize(width: number, height: number): void
  /** Hit-test a pointer in CSS pixels; returns the member id under it. */
  hitTest(x: number, y: number): string | undefined
  /** Cancel the loop and release the context. */
  dispose(): void
}

import { roleVisual, type RoleVisual } from '../role-visuals.ts'

const WORLD_W = 520
const WORLD_MIN_H = 300
const CELL_H = 150
const TOP_PAD = 104
const MAX_COLUMNS = 4
const DESK_W = 92

const COLORS = {
  wall: '#2f3b33',
  wallShade: '#27322b',
  floor: '#e2d6b8',
  floorLine: '#d3c5a2',
  desk: '#7c5b3a',
  deskTop: '#a67c4f',
  monitor: '#8a6a3a',
  screen: '#7fd4ff',
  screenIdle: '#39445a',
  label: '#e8eef8',
  labelBg: 'rgba(20, 24, 32, 0.82)',
  bubble: 'rgba(24, 30, 42, 0.92)',
  captain: '#f2c14e',
  alert: '#ef6b6b',
  good: '#67d9a5',
  idle: '#8fa0bb',
}

const SKIN = ['#f3c9a3', '#e8b48b', '#d79a70', '#c68862', '#a96f4d']
const SHIRT = ['#5b8def', '#8a6ff0', '#3fbf9a', '#e6a94d', '#e06b8d', '#63b5d8', '#9bbf57', '#c77dbf']

function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length] ?? list[0] as T
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1))}…`
}

/** Rounded rectangle helper (canvas has no built-in one). */
function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2)
  g.beginPath()
  g.moveTo(x + radius, y)
  g.arcTo(x + w, y, x + w, y + h, radius)
  g.arcTo(x + w, y + h, x, y + h, radius)
  g.arcTo(x, y + h, x, y, radius)
  g.arcTo(x, y, x + w, y, radius)
  g.closePath()
}

/** Hex color + alpha as a CSS rgba() string (canvas gradients). */
function rgba(hex: string, alpha: number): string {
  return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`
}

function stateTone(activity: SceneMember['activity']): string {
  if (activity === 'working') return COLORS.good
  if (activity === 'unknown') return COLORS.alert
  return COLORS.idle
}

export function createPixelScene(
  canvas: HTMLCanvasElement,
  options: { readonly zoom?: number } = {},
): SceneHandle {
  const context = canvas.getContext('2d')
  if (context === null) {
    return { render() {}, resize() {}, dispose() {}, hitTest() { return undefined } }
  }
  const g = context
  let model: SceneModel | undefined
  let disposed = false
  let raf: number | undefined
  let width = WORLD_W
  let height = WORLD_MIN_H
  let worldH = WORLD_MIN_H
  let dpr = 1
  let scale = 1
  let offsetX = 0
  let offsetY = 0
  let hitAreas: { id: string; x: number; y: number; w: number; h: number }[] = []
  const zoom = options.zoom ?? 1

  function fit(): void {
    const ratio = Math.min(width / WORLD_W, height / worldH)
    scale = Math.max(0.2, ratio) * zoom
    offsetX = (width - WORLD_W * scale) / 2
    offsetY = (height - worldH * scale) / 2
  }

  /** 墙面实时数据碑：宗门气运的关键数字（柱状条 + 三色图例 + 汇总）。 */
  function paintWallBoard(wall: SceneWall | undefined, time: number): void {
    const x = 366
    const y = 14
    const w = 142
    const h = 72
    // 青石外框 + 暗色板面
    g.fillStyle = '#243a33'
    roundRect(g, x, y, w, h, 6)
    g.fill()
    g.fillStyle = '#16211d'
    roundRect(g, x + 3, y + 3, w - 6, h - 6, 4)
    g.fill()
    // 实时脉冲点
    const pulse = 0.45 + Math.abs(Math.sin(time / 620)) * 0.55
    g.fillStyle = `rgba(103, 217, 165, ${pulse.toFixed(2)})`
    g.beginPath(); g.arc(x + w - 10, y + 10, 2.4, 0, Math.PI * 2); g.fill()
    if (wall === undefined) return
    // 标题
    g.fillStyle = '#d4af37'
    g.font = 'bold 9px "Segoe UI", sans-serif'
    g.fillText(wall.title, x + 8, y + 14)
    // 气运条
    const ratio = wall.total === 0 ? 0 : Math.min(1, wall.doneCount / wall.total)
    g.fillStyle = 'rgba(255, 255, 255, 0.16)'
    g.fillRect(x + 8, y + 19, w - 16, 6)
    g.fillStyle = '#67d9a5'
    g.fillRect(x + 8, y + 19, Math.round((w - 16) * ratio), 6)
    if (wall.failedCount > 0) {
      g.fillStyle = '#ef6b6b'
      g.fillRect(x + 8 + Math.round((w - 16) * ratio) - 2, y + 19, 2, 6)
    }
    // 三色图例
    const rows: ReadonlyArray<readonly [string, string]> = [
      ['#5b8def', wall.running],
      ['#e0a94a', wall.waiting],
      ['#67d9a5', wall.done],
    ]
    g.font = '8px "Segoe UI", sans-serif'
    rows.forEach(([tone, label], index) => {
      const rowY = y + 36 + index * 10
      g.fillStyle = tone
      g.fillRect(x + 8, rowY - 5, 4, 4)
      g.fillStyle = '#c9d5e3'
      g.fillText(label.replace(/^■\s*/u, ''), x + 16, rowY)
    })
    // 汇总
    g.fillStyle = '#8fa3b8'
    g.font = '8px "Segoe UI", sans-serif'
    g.fillText(wall.stats, x + 8, y + h - 8)
  }

  function paintRoom(time: number, wall: SceneWall | undefined): void {
    g.fillStyle = COLORS.wall
    g.fillRect(0, 0, WORLD_W, 96)
    g.fillStyle = COLORS.wallShade
    g.fillRect(0, 84, WORLD_W, 12)
    g.fillStyle = COLORS.floor
    g.fillRect(0, 96, WORLD_W, worldH - 96)
    g.strokeStyle = COLORS.floorLine
    g.lineWidth = 1
    for (let x = 0; x < WORLD_W; x += 32) {
      g.beginPath(); g.moveTo(x, 96); g.lineTo(x, worldH); g.stroke()
    }
    for (let y = 120; y < worldH; y += 32) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(WORLD_W, y); g.stroke()
    }
    // 藏经阁书架（左）与香案
    for (const wx of [44, 196]) {
      g.fillStyle = '#4a3524'
      roundRect(g, wx, 16, 62, 48, 4)
      g.fill()
      g.fillStyle = '#2a1d12'
      g.fillRect(wx + 5, 22, 52, 34)
      const bookColors = ['#a34b3f', '#3f6aa3', '#a3873f', '#3f8a6a', '#7a3f8a']
      for (let i = 0; i < 14; i += 1) {
        g.fillStyle = bookColors[i % bookColors.length]!
        g.fillRect(wx + 7 + (i % 7) * 7, 24 + Math.floor(i / 7) * 16, 5, 13)
      }
    }
    // 山门牌匾（宗门名）与红灯笼
    g.fillStyle = '#6b4a2a'
    roundRect(g, 276, 6, 84, 26, 4)
    g.fill()
    g.fillStyle = '#d4af37'
    roundRect(g, 281, 11, 74, 16, 3)
    g.fill()
    if (model !== undefined) {
      const name = truncate(model.teamName, 8)
      g.fillStyle = '#3a2410'
      g.font = 'bold 10px "Segoe UI", sans-serif'
      const nameW = g.measureText(name).width
      g.fillText(name, 318 - nameW / 2, 24)
    }
    for (const lx of [340, 148]) {
      const swing = Math.sin(time / 720 + lx) * 2
      g.fillStyle = '#8a1c1c'
      g.beginPath(); g.ellipse(lx + swing, 44, 8, 11, 0, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#d4af37'
      g.fillRect(lx + swing - 1, 28, 2, 5)
    }
    g.fillStyle = '#7a5b3c'
    g.fillRect(14, 216, 22, 26)
    g.fillStyle = '#4f8f54'
    for (const [px, py, pw, ph] of [[8, 186, 30, 18], [14, 172, 18, 18], [2, 200, 16, 12]] as const) {
      g.fillRect(px, py, pw, ph)
    }
    paintWallBoard(wall, time)
  }

  /** 境界：按任务完成度映射五境（与 realm.ts 一致），剑修的光剑随境界增强。 */
  function realmIndex(progress: number | undefined): number {
    return Math.min(4, Math.floor(Math.max(0, Math.min(100, progress ?? 0)) / 20))
  }

  /** 本命法器：摆在矮案上方，与道途立绘一致。 */
  function paintWeapon(visual: RoleVisual, cx: number, deskY: number, realm: number, working: boolean, time: number): void {
    const base = deskY - 22
    const accent = visual.accent
    const trim = visual.trim
    // 结丹以上：本命法器自发灵光；元婴以上再加绕器灵屑。
    if (realm >= 2) {
      const radius = 18 + realm * 5
      const halo = g.createRadialGradient(cx, base - 16, 2, cx, base - 16, radius)
      halo.addColorStop(0, rgba(accent, 0.2 + realm * 0.05))
      halo.addColorStop(0.6, rgba(accent, 0.08 + realm * 0.02))
      halo.addColorStop(1, rgba(accent, 0))
      g.fillStyle = halo
      g.beginPath(); g.arc(cx, base - 16, radius, 0, Math.PI * 2); g.fill()
      g.save()
      g.shadowColor = rgba(accent, 0.9)
      g.shadowBlur = 4 + realm * 2
      g.fillStyle = rgba(accent, 0.55)
      g.fillRect(cx - 1, base - 24, 2, 2)
      g.restore()
    }
    if (realm >= 3) {
      g.fillStyle = rgba(accent, 0.9)
      for (let i = 0; i < 3; i += 1) {
        const angle = time / 900 + i * 2.1
        g.fillRect(cx + Math.cos(angle) * 16 - 1, base - 16 + Math.sin(angle) * 9 - 1, 2, 2)
      }
    }
    switch (visual.weapon) {
      case 'sword': {
        // 剑架
        g.fillStyle = '#6b4a2a'
        g.fillRect(cx - 22, base - 16, 3, 16)
        g.fillRect(cx + 19, base - 16, 3, 16)
        g.fillStyle = '#8a6a3a'
        g.fillRect(cx - 22, base - 18, 44, 2)
        // 光剑：境界越高剑光越盛
        const length = 17 + realm * 2
        const pulse = working ? 0.82 + Math.sin(time / 90) * 0.18 : 0.66
        g.save()
        g.shadowColor = 'rgba(126, 232, 255, ' + pulse.toFixed(2) + ')'
        g.shadowBlur = 6 + realm * 4
        g.strokeStyle = 'rgba(150, 240, 255, ' + pulse.toFixed(2) + ')'
        g.lineWidth = 5
        g.lineCap = 'round'
        g.beginPath(); g.moveTo(cx - length, base - 15); g.lineTo(cx + length, base - 15); g.stroke()
        g.strokeStyle = '#ffffff'
        g.lineWidth = 2
        g.beginPath(); g.moveTo(cx - length + 2, base - 15); g.lineTo(cx + length - 2, base - 15); g.stroke()
        g.restore()
        // 剑柄与剑首
        g.fillStyle = '#333a46'
        g.fillRect(cx - length - 10, base - 18, 10, 6)
        g.fillStyle = '#d4af37'
        g.fillRect(cx - length - 2, base - 19, 2, 8)
        if (working) {
          g.fillStyle = 'rgba(180, 245, 255, 0.95)'
          g.fillRect(cx + length + 2, base - 18 - Math.round(Math.sin(time / 140) * 2), 2, 2)
          g.fillRect(cx - length - 4, base - 12 - Math.round(Math.cos(time / 170) * 2), 2, 2)
        }
        break
      }
      case 'fan': {
        g.fillStyle = '#8a5a3a'
        g.fillRect(cx - 2, base - 8, 3, 12)
        g.fillStyle = accent
        g.fillRect(cx - 12, base - 23, 20, 3)
        g.fillRect(cx - 14, base - 20, 24, 3)
        g.fillRect(cx - 12, base - 17, 20, 3)
        g.fillStyle = trim
        g.fillRect(cx - 14, base - 20, 24, 1)
        break
      }
      case 'pill': {
        g.fillStyle = accent
        g.fillRect(cx - 8, base - 18, 16, 12)
        g.fillStyle = trim
        g.fillRect(cx - 3, base - 22, 6, 4)
        g.fillStyle = '#ffffff'
        g.fillRect(cx - 5, base - 16, 3, 6)
        if (working) {
          g.fillStyle = 'rgba(230, 217, 255, 0.85)'
          g.fillRect(cx + 10, base - 26 - Math.round(Math.sin(time / 300) * 2), 2, 2)
        }
        break
      }
      case 'scroll': {
        g.fillStyle = accent
        g.fillRect(cx - 14, base - 18, 28, 10)
        g.fillStyle = '#8a6a3a'
        g.fillRect(cx - 16, base - 20, 3, 14)
        g.fillRect(cx + 13, base - 20, 3, 14)
        g.fillStyle = '#8a1c1c'
        g.fillRect(cx - 2, base - 18, 4, 2)
        break
      }
      case 'gourd': {
        g.fillStyle = accent
        g.beginPath(); g.ellipse(cx, base - 8, 9, 7, 0, 0, Math.PI * 2); g.fill()
        g.beginPath(); g.ellipse(cx, base - 19, 5, 5, 0, 0, Math.PI * 2); g.fill()
        g.fillStyle = trim
        g.fillRect(cx - 3, base - 24, 6, 2)
        break
      }
      case 'compass': {
        g.fillStyle = '#2f4a4a'
        g.beginPath(); g.arc(cx, base - 12, 10, 0, Math.PI * 2); g.fill()
        g.fillStyle = trim
        g.beginPath(); g.arc(cx, base - 12, 6, 0, Math.PI * 2); g.fill()
        g.fillStyle = '#d4af37'
        g.fillRect(cx - 1, base - 18, 2, 8)
        break
      }
      case 'brush': {
        g.fillStyle = '#4a3a2a'
        g.fillRect(cx - 8, base - 10, 16, 10)
        g.fillStyle = '#8a5a3a'
        g.fillRect(cx - 1, base - 26, 2, 18)
        g.fillStyle = accent
        g.fillRect(cx - 2, base - 30, 4, 5)
        break
      }
      case 'lantern': {
        g.fillStyle = trim
        g.fillRect(cx - 1, base - 30, 2, 6)
        g.fillStyle = accent
        g.fillRect(cx - 7, base - 24, 14, 12)
        g.fillStyle = 'rgba(255, 242, 196, 0.95)'
        g.fillRect(cx - 5, base - 22, 10, 8)
        if (working) {
          g.fillStyle = 'rgba(255, 220, 140, 0.22)'
          g.beginPath(); g.arc(cx, base - 18, 12, 0, Math.PI * 2); g.fill()
        }
        break
      }
      case 'array': {
        g.fillStyle = '#1f3a3a'
        g.fillRect(cx - 12, base - 20, 24, 14)
        g.fillStyle = accent
        for (const dot of [[-8, -16], [0, -16], [8, -16], [-4, -11], [4, -11]] as const) {
          g.fillRect(cx + dot[0] - 1, base + dot[1] - 1, 2, 2)
        }
        break
      }
      case 'fist': {
        g.fillStyle = accent
        g.fillRect(cx - 10, base - 12, 9, 8)
        g.fillRect(cx + 2, base - 12, 9, 8)
        g.fillStyle = trim
        g.fillRect(cx - 10, base - 12, 9, 2)
        g.fillRect(cx + 2, base - 12, 9, 2)
        break
      }
      case 'book': {
        g.fillStyle = accent
        g.fillRect(cx - 12, base - 10, 24, 5)
        g.fillStyle = trim
        g.fillRect(cx - 10, base - 16, 22, 5)
        g.fillStyle = '#8a6a3a'
        g.fillRect(cx - 12, base - 10, 2, 5)
        break
      }
      case 'hammer': {
        g.fillStyle = '#8a5a3a'
        g.fillRect(cx - 1, base - 18, 3, 18)
        g.fillStyle = accent
        g.fillRect(cx - 9, base - 24, 18, 8)
        g.fillStyle = trim
        g.fillRect(cx - 9, base - 24, 18, 2)
        break
      }
      case 'crown': {
        // 掌门令旗：旗杆 + 宗门旗
        g.fillStyle = '#6b4a2a'
        g.fillRect(cx - 16, base - 30, 2, 30)
        g.fillStyle = '#d4af37'
        g.fillRect(cx - 17, base - 31, 4, 3)
        g.fillStyle = accent
        g.fillRect(cx - 14, base - 29, 16, 9)
        g.fillStyle = '#8a1c1c'
        g.fillRect(cx - 14, base - 25, 16, 2)
        g.fillStyle = '#1b1510'
        g.fillRect(cx - 8, base - 27, 4, 4)
        break
      }
      case 'talisman': {
        // 符箓：黄纸朱印
        g.fillStyle = '#f2e6c4'
        g.fillRect(cx - 6, base - 30, 12, 18)
        g.fillStyle = '#fff6dd'
        g.fillRect(cx - 5, base - 29, 10, 16)
        g.fillStyle = trim
        g.fillRect(cx - 5, base - 26, 10, 1)
        g.fillRect(cx - 5, base - 23, 6, 1)
        g.fillStyle = '#c23a3a'
        g.fillRect(cx - 3, base - 20, 6, 5)
        g.fillStyle = '#f2d97a'
        g.fillRect(cx - 1, base - 18, 2, 1)
        break
      }
      case 'needle': {
        // 银针与针囊
        g.fillStyle = '#dfe9f2'
        g.fillRect(cx - 7, base - 30, 1, 16)
        g.fillRect(cx - 1, base - 28, 1, 14)
        g.fillRect(cx + 5, base - 30, 1, 16)
        g.fillStyle = '#ffffff'
        g.fillRect(cx - 7, base - 30, 1, 2)
        g.fillRect(cx + 5, base - 30, 1, 2)
        g.fillStyle = trim
        g.fillRect(cx - 6, base - 14, 12, 4)
        g.fillStyle = accent
        g.fillRect(cx - 2, base - 13, 4, 2)
        break
      }
      case 'whistle': {
        // 兽骨哨
        g.fillStyle = accent
        g.fillRect(cx - 9, base - 20, 12, 7)
        g.fillStyle = '#ffffff'
        g.fillRect(cx - 9, base - 20, 12, 1)
        g.fillStyle = trim
        g.fillRect(cx - 12, base - 22, 3, 11)
        g.fillRect(cx + 5, base - 18, 2, 5)
        g.fillStyle = visual.robeDark
        g.fillRect(cx - 5, base - 18, 2, 2)
        g.fillRect(cx - 1, base - 18, 2, 2)
        break
      }
      case 'puppet': {
        // 傀儡与提线
        g.fillStyle = '#d8d2c8'
        g.fillRect(cx - 3, base - 34, 1, 9)
        g.fillRect(cx + 2, base - 34, 1, 9)
        g.fillStyle = accent
        g.fillRect(cx - 4, base - 25, 8, 7)
        g.fillStyle = visual.robeDark
        g.fillRect(cx - 2, base - 23, 1, 1)
        g.fillRect(cx + 1, base - 23, 1, 1)
        g.fillStyle = visual.robeLight
        g.fillRect(cx - 5, base - 17, 10, 7)
        g.fillStyle = accent
        g.fillRect(cx - 5, base - 10, 3, 3)
        g.fillRect(cx + 2, base - 10, 3, 3)
        break
      }
      case 'flute': {
        // 竹笛
        g.fillStyle = '#8a6a3a'
        g.fillRect(cx - 14, base - 22, 28, 4)
        g.fillStyle = '#b07a52'
        g.fillRect(cx - 14, base - 22, 28, 1)
        g.fillStyle = trim
        g.fillRect(cx - 16, base - 23, 2, 6)
        g.fillRect(cx + 14, base - 23, 2, 6)
        g.fillStyle = visual.robeDark
        g.fillRect(cx - 8, base - 21, 2, 2)
        g.fillRect(cx - 1, base - 21, 2, 2)
        g.fillRect(cx + 6, base - 21, 2, 2)
        break
      }
      case 'vial': {
        // 毒瓶
        g.fillStyle = accent
        g.fillRect(cx - 7, base - 20, 14, 10)
        g.fillStyle = '#ffffff'
        g.fillRect(cx - 7, base - 20, 14, 1)
        g.fillStyle = trim
        g.fillRect(cx - 3, base - 25, 6, 5)
        g.fillStyle = visual.robeDark
        g.fillRect(cx - 4, base - 17, 2, 2)
        if (working) {
          g.fillStyle = 'rgba(212, 255, 154, 0.85)'
          g.fillRect(cx + 9, base - 26 - Math.round(Math.sin(time / 280) * 2), 2, 2)
        }
        break
      }
      case 'beads': {
        // 佛珠
        g.fillStyle = accent
        for (let i = 0; i < 8; i += 1) {
          const angle = i / 8 * Math.PI * 2
          g.fillRect(cx + Math.round(Math.cos(angle) * 9) - 1, base - 18 + Math.round(Math.sin(angle) * 7) - 1, 3, 3)
        }
        g.fillStyle = trim
        g.fillRect(cx - 1, base - 10, 2, 6)
        break
      }
      case 'blade': {
        // 魔剑：宽阔锯齿剑身 + 品红锋焰 + 地面法阵（高阶）
        if (realm >= 2) {
          g.save()
          g.strokeStyle = 'rgba(95, 208, 168, 0.55)'
          g.lineWidth = 1.5
          g.beginPath(); g.ellipse(cx + 2, deskY - 10, 16 + realm * 2, 5, 0, 0, Math.PI * 2); g.stroke()
          g.strokeStyle = 'rgba(95, 208, 168, 0.25)'
          g.beginPath(); g.ellipse(cx + 2, deskY - 10, 11 + realm * 2, 3.5, 0, 0, Math.PI * 2); g.stroke()
          g.restore()
        }
        g.save()
        g.shadowColor = 'rgba(255, 79, 176, 0.9)'
        g.shadowBlur = 7 + realm * 3
        g.fillStyle = '#4a1f9a'
        g.fillRect(cx + 2, base - 54, 9, 11)
        g.fillRect(cx + 1, base - 43, 9, 9)
        g.fillRect(cx, base - 34, 8, 8)
        g.fillRect(cx - 1, base - 26, 6, 6)
        g.fillStyle = '#ff4fb0'
        g.fillRect(cx + 10, base - 54, 2, 11)
        g.fillRect(cx + 9, base - 43, 2, 9)
        g.fillRect(cx + 7, base - 34, 2, 8)
        g.fillRect(cx + 4, base - 26, 2, 6)
        g.restore()
        // 剑身符纹
        g.fillStyle = '#ffd27a'
        g.fillRect(cx + 5, base - 49, 2, 2)
        g.fillRect(cx + 6, base - 39, 2, 2)
        g.fillRect(cx + 4, base - 30, 2, 2)
        // 护手 + 剑柄 + 剑首
        g.fillStyle = '#f2c14e'
        g.fillRect(cx - 9, base - 20, 15, 3)
        g.fillStyle = '#ffe9a8'
        g.fillRect(cx - 9, base - 20, 15, 1)
        g.fillStyle = '#2a1a2a'
        g.fillRect(cx - 4, base - 17, 4, 10)
        g.fillStyle = '#7a3f52'
        g.fillRect(cx - 3, base - 17, 1, 10)
        g.fillStyle = '#c23a3a'
        g.fillRect(cx - 5, base - 7, 6, 4)
        g.fillStyle = '#ff9aa8'
        g.fillRect(cx - 4, base - 6, 2, 2)
        if (working) {
          g.fillStyle = 'rgba(255, 79, 176, 0.95)'
          g.fillRect(cx + 12, base - 58 - Math.round(Math.sin(time / 160) * 3), 2, 2)
          g.fillRect(cx + 2, base - 62 - Math.round(Math.cos(time / 200) * 2), 2, 2)
        }
        break
      }
      default: break
    }
  }

  /** Character + desk + 本命法器 + monitor. Overlays are painted by paintOverlay. */
  function paintDesk(cx: number, deskY: number, member: SceneMember, time: number): void {
    const seed = hash(member.id || member.name)
    const visual = roleVisual(member.isLeader === true ? 'captain' : member.role)
    const skin = visual?.skin ?? pick(SKIN, seed)
    const robe = visual?.robe ?? (member.isLeader ? COLORS.captain : pick(SHIRT, seed >> 3))
    const trim = visual?.trim ?? '#e8eef8'
    const hair = visual?.hair ?? '#2a2f3a'
    const realm = realmIndex(member.progress)
    const working = member.activity === 'working'
    const bob = working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1)
    const deskX = cx - DESK_W / 2

    const headY = deskY - 92 + bob
    const bodyY = headY + 16

    // 灵气：以颜色常驻标示状态（修炼/静修/异常），修炼中带上升灵屑。
    const tone = stateTone(member.activity)
    const auraPulse = 0.5 + Math.abs(Math.sin(time / (working ? 420 : 900))) * 0.5
    const auraY = bodyY + 8
    const auraR = (member.isLeader ? 40 : 34) + auraPulse * 4
    const aura = g.createRadialGradient(cx, auraY, 4, cx, auraY, auraR)
    aura.addColorStop(0, rgba(tone, 0.26 + (working ? 0.1 : 0.02)))
    aura.addColorStop(0.55, rgba(tone, 0.12))
    aura.addColorStop(1, rgba(tone, 0))
    g.fillStyle = aura
    g.beginPath(); g.arc(cx, auraY, auraR, 0, Math.PI * 2); g.fill()
    if (working) {
      for (let i = 0; i < 3; i += 1) {
        const phase = (time / 1200 + i / 3) % 1
        g.fillStyle = rgba(tone, 0.75 * (1 - phase))
        g.fillRect(cx - 16 + i * 12, Math.round(auraY + 14 - phase * 46), 2, 2)
      }
    }

    // 落影 + 轮廓（1px 深色边，和立绘同一套画法）
    g.fillStyle = 'rgba(56, 44, 30, 0.16)'
    g.beginPath(); g.ellipse(cx, deskY - 6, 24, 8, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#1b1510'
    g.fillRect(cx - 10, bodyY - 1, 20, 20)
    g.fillRect(cx - 7, headY - 1, 14, 15)

    // 道袍（亮/中/暗三档）
    g.fillStyle = robe
    g.fillRect(cx - 9, bodyY, 18, 18)
    g.fillStyle = visual?.robeLight ?? 'rgba(255, 255, 255, 0.16)'
    g.fillRect(cx - 9, bodyY, 3, 18)
    g.fillStyle = visual?.robeDark ?? 'rgba(0, 0, 0, 0.22)'
    g.fillRect(cx + 5, bodyY, 4, 18)
    g.fillStyle = trim
    g.fillRect(cx - 9, bodyY + 12, 18, 2)
    g.fillRect(cx - 1, bodyY, 2, 12)

    // 头部与发式
    g.fillStyle = skin
    g.fillRect(cx - 6, headY, 12, 13)
    g.fillStyle = hair
    g.fillRect(cx - 6, headY - 2, 12, 4)
    if (visual?.hairStyle === 'long') {
      g.fillRect(cx - 8, headY, 2, 12)
      g.fillRect(cx + 6, headY, 2, 12)
    }
    if (visual?.hairStyle === 'topknot') {
      g.fillRect(cx - 2, headY - 6, 4, 4)
      g.fillStyle = trim
      g.fillRect(cx - 1, headY - 7, 2, 1)
    }
    if (visual?.beard === true) {
      g.fillStyle = '#d8d2c8'
      g.fillRect(cx - 3, headY + 9, 6, 3)
    }
    // 眼
    g.fillStyle = '#24303f'
    g.fillRect(cx - 3, headY + 5, 2, 2)
    g.fillRect(cx + 2, headY + 5, 2, 2)

    g.fillStyle = skin
    if (working) {
      const arm = Math.round(Math.sin(time / 90 + seed) * 2)
      g.fillRect(cx - 13, bodyY + 8 + arm, 5, 4)
      g.fillRect(cx + 8, bodyY + 8 - arm, 5, 4)
    } else {
      g.fillRect(cx - 13, bodyY + 12, 5, 6)
      g.fillRect(cx + 8, bodyY + 12, 5, 6)
    }
    if (member.isLeader) {
      g.fillStyle = COLORS.captain
      g.beginPath()
      g.moveTo(cx - 8, headY - 3)
      g.lineTo(cx - 8, headY - 9)
      g.lineTo(cx - 4, headY - 5)
      g.lineTo(cx, headY - 10)
      g.lineTo(cx + 4, headY - 5)
      g.lineTo(cx + 8, headY - 9)
      g.lineTo(cx + 8, headY - 3)
      g.closePath()
      g.fill()
    }
    if (member.activity === 'idle') {
      g.fillStyle = 'rgba(232, 238, 248, 0.75)'
      g.font = '8px monospace'
      g.fillText('z', cx + 12, headY - 2 - Math.round(Math.sin(time / 500) * 3))
    }

    // 矮案与蒲团
    g.fillStyle = COLORS.desk
    roundRect(g, deskX, deskY - 18, DESK_W, 18, 3)
    g.fill()
    g.fillStyle = COLORS.deskTop
    g.fillRect(deskX, deskY - 21, DESK_W, 4)
    g.fillStyle = '#8a6a4a'
    g.beginPath(); g.ellipse(cx, deskY - 6, 26, 9, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#b08a5a'
    g.beginPath(); g.ellipse(cx, deskY - 8, 22, 7, 0, 0, Math.PI * 2); g.fill()
    // 案上香炉
    g.fillStyle = '#8a6a3a'
    g.beginPath(); g.ellipse(cx + 30, deskY - 38, 7, 4, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = working ? '#e0a94a' : '#7a6a4a'
    g.fillRect(cx + 27, deskY - 43, 6, 3)
    if (working) {
      g.fillStyle = 'rgba(222, 226, 238, 0.35)'
      g.beginPath(); g.arc(cx + 30, deskY - 52, 4, 0, Math.PI * 2); g.fill()
      g.beginPath(); g.arc(cx + 34, deskY - 60, 3, 0, Math.PI * 2); g.fill()
    }
    // 本命法器
    if (visual !== undefined) paintWeapon(visual, cx, deskY, realm, working, time)
  }

  /** Name plate, state dot, progress bar, task bubble and unread badge. */
  function paintOverlay(cx: number, deskY: number, member: SceneMember, time: number): void {
    const seed = hash(member.id || member.name)
    const working = member.activity === 'working'
    const bob = working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1)
    const headY = deskY - 92 + bob

    // Name plate under the desk edge: name + persistent state word.
    const labels = model?.labels
    const stateText = member.activity === 'working'
      ? labels?.working
      : member.activity === 'idle' ? labels?.idle : labels?.unknownState
    const label = stateText === undefined || stateText === ''
      ? truncate(member.name, 10)
      : `${truncate(member.name, 8)} · ${stateText}`
    g.font = '9px "Segoe UI", monospace'
    const textW = g.measureText(label).width
    g.fillStyle = COLORS.labelBg
    roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3)
    g.fill()
    g.fillStyle = member.isLeader ? COLORS.captain : COLORS.label
    g.fillText(label, cx - textW / 2, deskY + 13)

    // State dot.
    g.fillStyle = stateTone(member.activity)
    g.beginPath(); g.arc(cx - textW / 2 - 10, deskY + 10, 2.6, 0, Math.PI * 2); g.fill()

    // Per-member progress bar.
    if (member.total !== undefined && member.total > 0) {
      const ratio = Math.min(1, Math.max(0, (member.done ?? 0) / member.total))
      g.fillStyle = 'rgba(255,255,255,0.18)'
      g.fillRect(cx - 18, deskY + 20, 36, 3)
      g.fillStyle = COLORS.good
      g.fillRect(cx - 18, deskY + 20, Math.round(36 * ratio), 3)
    }

    // Task bubble above the head.
    if (member.currentTask !== undefined && member.currentTask !== '') {
      const text = truncate(member.currentTask, 15)
      g.font = '8px "Segoe UI", monospace'
      const bw = g.measureText(text).width + 12
      const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2))
      const by = Math.max(4, headY - 26)
      g.fillStyle = COLORS.bubble
      roundRect(g, bx, by, bw, 15, 4)
      g.fill()
      g.beginPath()
      g.moveTo(cx - 3, by + 15)
      g.lineTo(cx + 1, by + 19)
      g.lineTo(cx + 4, by + 15)
      g.closePath()
      g.fill()
      g.fillStyle = COLORS.label
      g.fillText(text, bx + 6, by + 11)
    }

    // Unread badge.
    if ((member.unread ?? 0) > 0) {
      g.fillStyle = COLORS.alert
      g.beginPath(); g.arc(cx + 16, headY - 2, 6.5, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#fff'
      g.font = 'bold 7px "Segoe UI", monospace'
      g.fillText(String(Math.min(9, member.unread ?? 0)), cx + 13, headY + 1)
    }
  }

  function paint(time: number): void {
    const members = model?.members ?? []
    // A wide, short pane (the right-side team tab) gains a lot from fewer rows:
    // pick the column count whose world fits the canvas with the largest scale.
    let columns = 1
    let worldHeight = WORLD_MIN_H
    let bestScale = -1
    const maxColumns = members.length === 0 ? 1 : Math.min(MAX_COLUMNS, members.length)
    for (let candidate = 1; candidate <= maxColumns; candidate++) {
      const candidateRows = Math.max(1, Math.ceil(members.length / candidate))
      const candidateHeight = Math.max(WORLD_MIN_H, TOP_PAD + candidateRows * CELL_H + 8)
      const candidateScale = Math.min(width / WORLD_W, height / candidateHeight)
      if (candidateScale > bestScale + 1e-6) {
        bestScale = candidateScale
        columns = candidate
        worldHeight = candidateHeight
      }
    }
    worldH = worldHeight
    scale = Math.max(0.2, bestScale) * zoom
    offsetX = (width - WORLD_W * scale) / 2
    offsetY = (height - worldH * scale) / 2

    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, width, height)
    g.save()
    g.translate(offsetX, offsetY)
    g.scale(scale, scale)
    g.imageSmoothingEnabled = false

    paintRoom(time, model?.wall)

    const cellW = WORLD_W / columns
    const layout = members.map((member, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const cx = cellW * (column + 0.5)
      const deskY = TOP_PAD + CELL_H * row + 128
      return { member, cx, deskY }
    })
    hitAreas = layout.map(item => ({ id: item.member.id, x: item.cx - 62, y: item.deskY - 78, w: 124, h: 98 }))

    if (layout.length === 0) {
      g.fillStyle = COLORS.label
      g.font = '12px "Segoe UI", sans-serif'
      const text = model?.labels?.empty ?? 'No members yet'
      g.fillText(text, 24, 150)
    } else {
      for (const item of layout) paintDesk(item.cx, item.deskY, item.member, time)
      for (const item of layout) paintOverlay(item.cx, item.deskY, item.member, time)
    }

    if (model?.phase === 'staged') {
      g.fillStyle = 'rgba(16, 20, 28, 0.55)'
      g.fillRect(0, 0, WORLD_W, worldH)
      g.fillStyle = '#f6f8ff'
      g.font = 'bold 13px "Segoe UI", sans-serif'
      const text = model.labels?.awaiting ?? 'Waiting for approval'
      const textW = g.measureText(text).width
      g.fillText(text, (WORLD_W - textW) / 2, worldH / 2)
    }
    if (model?.halted === true) {
      g.fillStyle = COLORS.alert
      g.fillRect(0, 0, WORLD_W, 18)
      g.fillStyle = '#1a1010'
      g.font = 'bold 10px "Segoe UI", sans-serif'
      const text = model.labels?.stalled ?? 'Team stopped'
      const textW = g.measureText(text).width
      g.fillText(text, (WORLD_W - textW) / 2, 13)
    }
    g.restore()
  }

  function fallback(error: unknown): void {
    try {
      g.setTransform(1, 0, 0, 1, 0, 0)
      g.fillStyle = '#1b2029'
      g.fillRect(0, 0, canvas.width, canvas.height)
      g.fillStyle = '#f0a0a0'
      g.font = '12px monospace'
      g.fillText(`office render error: ${String(error)}`, 12, 24)
    } catch {
      // Nothing else can be drawn.
    }
  }

  function loop(time: number): void {
    if (disposed) return
    try {
      paint(time)
    } catch (error) {
      fallback(error)
    }
    raf = window.requestAnimationFrame(loop)
  }

  fit()
  raf = window.requestAnimationFrame(loop)

  return {
    render(next) {
      model = next
    },
    resize(nextWidth, nextHeight) {
      width = Math.max(1, Math.floor(nextWidth))
      height = Math.max(1, Math.floor(nextHeight))
      dpr = typeof window === 'undefined' ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      fit()
    },
    hitTest(x, y) {
      const wx = (x - offsetX) / scale
      const wy = (y - offsetY) / scale
      for (let index = hitAreas.length - 1; index >= 0; index--) {
        const area = hitAreas[index]!
        if (wx >= area.x && wx <= area.x + area.w && wy >= area.y && wy <= area.y + area.h) return area.id
      }
      return undefined
    },
    dispose() {
      disposed = true
      if (raf !== undefined) window.cancelAnimationFrame(raf)
      raf = undefined
    },
  }
}