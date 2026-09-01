/**
 * Maps agent-teams durable state → pixel office view state.
 *
 * The browser half polls `/plugins/agent-teams-pixel/state` every pollMs;
 * the host replies with the per-workspace list of teams whose `team.json`
 * exists. Member & task state is read straight from team.json by the host's
 * snapshot module, and the pixel office derives the rendering state here.
 *
 * Why not subscribe to `agent-teams/*` SessionEvent directly? Because the
 * browser does not see those events (they are host-side), and the durable
 * team.json is the canonical source of truth on restart anyway. Polling
 * 5s keeps the office live without flooding the wire.
 */
import type { PixelMember, PixelState } from './pixel-canvas.js'

/** One member projection from team.json, plus its active task. */
export interface RawMember {
  readonly id: string
  readonly name: string
  readonly role?: string
  readonly status: 'idle' | 'working' | 'removed'
  readonly taskSubject?: string
  readonly taskKind?: string
}

/** Active task statuses that put the member into `working`. */
const WORKING_STATUSES = new Set(['claimed', 'in_progress'])

/** Map (member.status, task.status, task.kind) → 5-state pixel state. */
export function deriveState(member: RawMember): PixelState {
  if (member.status === 'removed') return 'error'
  if (member.taskKind === 'error' || member.taskKind === 'failed') return 'error'
  if (member.status === 'working' || (member.taskSubject !== undefined && member.taskKind !== undefined && WORKING_STATUSES.has(member.taskKind))) {
    return 'typing'
  }
  if (member.taskKind === 'completed') return 'done'
  if (member.taskKind === 'pending' || member.taskKind === undefined) return 'idle'
  return 'idle'
}

/** Convert raw members into PixelMember projections for the canvas. */
export function projectMembers(raws: readonly RawMember[], roleColors: Map<string, string>): PixelMember[] {
  return raws.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role ?? 'member',
    color: roleColors.get(m.role ?? m.name) ?? '#3b82f6',
    state: deriveState(m),
    taskSubject: m.taskSubject,
  }))
}

/** Stable palette for unknown roles; deterministic by member id. */
export function fallbackColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `hsl(${hue},65%,55%)`
}