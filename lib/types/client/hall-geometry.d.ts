/**
 * 洞府浮层 / 内容气泡的纯几何计算。
 *
 * 抽成无 DOM 依赖的模块，便于用 node:test 固定两条验收行为：
 * - 气泡右缘 = 面板左缘 − 8px（面板越大，气泡越往左，右侧空间让给面板）；
 * - 气泡始终夹在窗口内，窄窗口也不会跑出屏幕。
 */
/** 窗口内边距（面板与气泡离窗口边缘的最小距离）。 */
export declare const HALL_WINDOW_INSET = 16;
/** 气泡与面板之间的固定间隙。 */
export declare const HALL_SHEET_GAP = 8;
/** 气泡宽度上限。 */
export declare const HALL_SHEET_MAX_WIDTH = 480;
/** 气泡在当前窗口下的实际宽度：不超过 480，也不超出窗口（两侧各留 16）。 */
export declare function hallSheetWidth(viewportWidth: number): number;
/** 面板给对话让出的宽度：面板宽度的三分之二，且至少给对话留 360px。 */
export declare function hallYieldWidth(panelWidth: number, viewportWidth: number): number;
/** 气泡的落点：左缘 + 宽度。右缘严格等于面板左缘 − 8px，除非被窗口夹取。 */
export declare function hallSheetPlacement(panelLeft: number, viewportWidth: number): {
    left: number;
    width: number;
};
