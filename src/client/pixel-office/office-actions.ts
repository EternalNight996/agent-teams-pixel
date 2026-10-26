/**
 * Interactive facilities painted on the sect-hall wall.
 *
 * The wall is the workspace's menu: every facility is a fixed scene-space
 * rectangle that maps to one panel. The renderer draws the pixels, React owns
 * the copy and the panel, and this module keeps both sides on the same rects so
 * the hit area can never drift away from the art.
 */

/** One panel a wall facility can open. */
export type SceneAction = 'teams' | 'board' | 'config' | 'inbox' | 'gear' | 'ranks' | 'about'

/** Scene-space rectangle (the renderer draws in a 520-wide world). */
export interface FacilityRect {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

/** Fixed wall layout: bookshelf, gate, merit stele and message rack. */
export const FACILITIES: Readonly<Record<SceneAction, FacilityRect>> = {
  config: { x: 8, y: 10, w: 80, h: 60 },
  // 名册居中：山门是洞府的主入口，放在 520 宽世界的中轴（中心 260）。
  board: { x: 96, y: 10, w: 70, h: 60 },
  teams: { x: 198, y: 6, w: 124, h: 66 },
  ranks: { x: 330, y: 10, w: 64, h: 60 },
  gear: { x: 402, y: 10, w: 62, h: 60 },
  // 宗门志：墙最右侧的一方石志，点开关于/赞助/交流群/反馈。
  about: { x: 472, y: 10, w: 48, h: 60 },
  // 传音阁入口已移除；保留矩形仅为类型兼容，不在 FACILITY_ORDER 中绘制/命中。
  inbox: { x: 466, y: 10, w: 60, h: 60 },
}

/** The wall band reserved for facilities; desks start below it. */
export const WALL_HEIGHT = 96

/** Order used by the rail and by tests (left to right on the wall). */
export const FACILITY_ORDER: readonly SceneAction[] = ['config', 'board', 'teams', 'ranks', 'gear', 'about']

/** A scene hit from `hitTest`: a cultivator desk or a wall facility. */
export type SceneHit =
  | { readonly kind: 'member'; readonly id: string }
  | { readonly kind: 'action'; readonly action: SceneAction }
  | { readonly kind: 'settings' }
  /** Clicking a cultivator's overhead level badge opens their equipment sheet. */
  | { readonly kind: 'level'; readonly id: string }

/** Resolve a scene-space point to a facility. */
export function facilityAt(x: number, y: number): SceneAction | undefined {
  for (const action of FACILITY_ORDER) {
    const rect = FACILITIES[action]
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return action
  }
  return undefined
}

/** Human-readable panel title for a facility (the scene itself has no copy). */
export function facilityCentre(action: SceneAction): { x: number; y: number } {
  const rect = FACILITIES[action]
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h }
}
