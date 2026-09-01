/**
 * Pixel office canvas: draws one Canvas 2D pixel-art person per team member
 * with a 5-state animation (idle / typing / walking / done / error). State
 * is fed by the office state poller (see index.tsx), which itself reads the
 * agent-teams session events from the host state route.
 *
 * Implementation note: this is a deliberately compact (~180 LoC) take on the
 * pixel engine inside dsh-ui-agents-pixe's 1935-line client.main.js. It
 * supports what v1 needs (5 states, role-color skin, click-to-show role
 * card) and skips pixe's AI chatter / custom role generator / settings
 * panel — those belong to other plugins and would only inflate the bundle.
 */
import React, { useEffect, useRef } from 'react'

export type PixelState = 'idle' | 'typing' | 'walking' | 'done' | 'error'

export interface PixelMember {
  /** Stable member id from agent-teams state. */
  readonly id: string
  readonly name: string
  readonly role: string
  /** Hex `#rrggbb` (role card `color` field). */
  readonly color: string
  readonly state: PixelState
  /** Task subject the member is currently working on, for badge display. */
  readonly taskSubject?: string
  /** Optional emoji badge (role card `emoji` field). */
  readonly emoji?: string
}

export interface PixelCanvasProps {
  readonly members: readonly PixelMember[]
  readonly width?: number
  readonly height?: number
  readonly onMemberClick?: (member: PixelMember) => void
}

const SKIN_SHADE = 0.78
const SKIN_TRIM = 0.55

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = String(hex || '').replace('#', '')
  if (h.length !== 6) return { r: 0x3b, g: 0x82, b: 0xf6 }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function shade(rgb: { r: number; g: number; b: number }, factor: number): string {
  return `rgb(${Math.round(rgb.r * factor)},${Math.round(rgb.g * factor)},${Math.round(rgb.b * factor)})`
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  member: PixelMember,
  frame: number,
): void {
  const rgb = hexToRgb(member.color)
  const base = shade(rgb, 1)
  const dark = shade(rgb, SKIN_SHADE)
  const trim = shade(rgb, SKIN_TRIM)
  // Subtle vertical bob per state.
  const bob = member.state === 'typing' ? Math.sin(frame * 0.6) * 1
    : member.state === 'walking' ? Math.sin(frame * 0.4) * 2
    : member.state === 'idle' ? Math.sin(frame * 0.05) * 0.5
    : 0
  const arm = member.state === 'typing' ? Math.sin(frame * 0.9) * 2 : 0
  // Body.
  ctx.fillStyle = base
  ctx.fillRect(x - 4, y - 8 + bob, 8, 8)
  ctx.fillStyle = trim
  ctx.fillRect(x - 4, y - 8 + bob, 8, 1)
  // Arms.
  ctx.fillStyle = dark
  ctx.fillRect(x - 5, y - 6 + bob, 1, 4 + arm)
  ctx.fillRect(x + 4, y - 6 + bob, 1, 4 - arm)
  // Legs.
  ctx.fillStyle = dark
  const legSwing = member.state === 'walking' ? Math.sin(frame * 0.5) * 1.5 : 0
  ctx.fillRect(x - 3, y, 2, 4 + legSwing)
  ctx.fillRect(x + 1, y, 2, 4 - legSwing)
  // Head.
  ctx.fillStyle = '#fde7c5'
  ctx.fillRect(x - 3, y - 13 + bob, 6, 5)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(x - 2, y - 12 + bob, 1, 1)
  ctx.fillRect(x + 1, y - 12 + bob, 1, 1)
  // State badge above head.
  const badge = member.state === 'typing' || member.state === 'walking'
    ? '●' : member.state === 'done' ? '✓' : member.state === 'error' ? '✕' : '·'
  const badgeColor = member.state === 'error' ? '#ef4444'
    : member.state === 'done' ? '#22c55e'
    : member.state === 'idle' ? '#9ca3af' : '#f59e0b'
  ctx.fillStyle = badgeColor
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(badge, x, y - 16 + bob)
}

export function PixelCanvas({ members, width = 320, height = 220, onMemberClick }: PixelCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    const g = canvas.getContext('2d')
    if (g === null) return undefined
    const draw = (): void => {
      frameRef.current += 1
      const frame = frameRef.current
      g.fillStyle = '#0f172a'
      g.fillRect(0, 0, width, height)
      // Floor line.
      g.fillStyle = '#1e293b'
      g.fillRect(0, height - 20, width, 1)
      g.fillStyle = '#334155'
      g.fillRect(0, height - 19, width, 1)
      // Member placement: row layout, 32 px stride.
      const stride = 32
      const startX = 24
      const baseY = height - 26
      members.forEach((m, i) => {
        const x = startX + (i % Math.max(1, Math.floor((width - startX) / stride))) * stride
        const y = baseY - Math.floor(i / Math.max(1, Math.floor((width - startX) / stride))) * 38
        drawPerson(g, x, y, m, frame)
        // Name tag.
        g.fillStyle = '#e2e8f0'
        g.font = '7px sans-serif'
        g.textAlign = 'center'
        g.fillText(m.name.slice(0, 6), x, baseY + 12 - Math.floor(i / Math.max(1, Math.floor((width - startX) / stride))) * 38)
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [members, width, height])

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (onMemberClick === undefined) return
    const canvas = canvasRef.current
    if (canvas === null) return
    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const stride = 32
    const startX = 24
    const baseY = (height - 26)
    const perRow = Math.max(1, Math.floor((width - startX) / stride))
    for (let i = 0; i < members.length; i += 1) {
      const x = startX + (i % perRow) * stride
      const y = baseY - Math.floor(i / perRow) * 38
      if (Math.abs(clickX - x) < 12 && Math.abs(clickY - y) < 14) {
        const member = members[i]
        if (member !== undefined) onMemberClick(member)
        return
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ display: 'block', width: '100%', height: 'auto', imageRendering: 'pixelated' }}
    />
  )
}