/**
 * Interactive facilities painted on the sect-hall wall.
 *
 * The wall is the workspace's menu: every facility is a fixed scene-space
 * rectangle that maps to one panel. The renderer draws the pixels, React owns
 * the copy and the panel, and this module keeps both sides on the same rects so
 * the hit area can never drift away from the art.
 */
/** One panel a wall facility can open. */
export type SceneAction = 'teams' | 'board' | 'config' | 'inbox' | 'gear' | 'ranks' | 'about';
/** Scene-space rectangle (the renderer draws in a 520-wide world). */
export interface FacilityRect {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
}
/** Fixed wall layout: bookshelf, gate, merit stele and message rack. */
export declare const FACILITIES: Readonly<Record<SceneAction, FacilityRect>>;
/** The wall band reserved for facilities; desks start below it. */
export declare const WALL_HEIGHT = 96;
/** Order used by the rail and by tests (left to right on the wall). */
export declare const FACILITY_ORDER: readonly SceneAction[];
/** A scene hit from `hitTest`: a cultivator desk or a wall facility. */
export type SceneHit = {
    readonly kind: 'member';
    readonly id: string;
} | {
    readonly kind: 'action';
    readonly action: SceneAction;
} | {
    readonly kind: 'settings';
}
/** Clicking a cultivator's overhead level badge opens their equipment sheet. */
 | {
    readonly kind: 'level';
    readonly id: string;
};
/** Resolve a scene-space point to a facility. */
export declare function facilityAt(x: number, y: number): SceneAction | undefined;
/** Human-readable panel title for a facility (the scene itself has no copy). */
export declare function facilityCentre(action: SceneAction): {
    x: number;
    y: number;
};
