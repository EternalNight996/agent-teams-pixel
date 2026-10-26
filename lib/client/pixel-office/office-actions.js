/**
 * Interactive facilities painted on the sect-hall wall.
 *
 * The wall is the workspace's menu: every facility is a fixed scene-space
 * rectangle that maps to one panel. The renderer draws the pixels, React owns
 * the copy and the panel, and this module keeps both sides on the same rects so
 * the hit area can never drift away from the art.
 */
/** Fixed wall layout: bookshelf, gate, merit stele and message rack. */
export const FACILITIES = {
    config: { x: 8, y: 10, w: 80, h: 60 },
    teams: { x: 96, y: 6, w: 124, h: 66 },
    board: { x: 228, y: 10, w: 70, h: 60 },
    ranks: { x: 306, y: 10, w: 70, h: 60 },
    gear: { x: 384, y: 10, w: 74, h: 60 },
    // 传音阁入口已移除；保留矩形仅为类型兼容，不在 FACILITY_ORDER 中绘制/命中。
    inbox: { x: 466, y: 10, w: 60, h: 60 },
};
/** The wall band reserved for facilities; desks start below it. */
export const WALL_HEIGHT = 96;
/** Order used by the rail and by tests (left to right on the wall). */
export const FACILITY_ORDER = ['config', 'teams', 'board', 'ranks', 'gear'];
/** Resolve a scene-space point to a facility. */
export function facilityAt(x, y) {
    for (const action of FACILITY_ORDER) {
        const rect = FACILITIES[action];
        if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h)
            return action;
    }
    return undefined;
}
/** Human-readable panel title for a facility (the scene itself has no copy). */
export function facilityCentre(action) {
    const rect = FACILITIES[action];
    return { x: rect.x + rect.w / 2, y: rect.y + rect.h };
}
