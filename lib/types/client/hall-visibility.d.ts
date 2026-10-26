/**
 * 洞府浮层是否应该存在。
 *
 * 浮层是「队伍工作」的窗口：队伍没有任何任务、或任务已经全部「已弃」时，
 * 没有可展示、可操作的活，浮层不应继续占着屏幕（它会盖住对话区）。
 */
/** 判定可见性所需的最小任务形状。 */
export interface HallTaskLike {
    /** 视觉状态：blocked / open / claimed / running / completed / failed / cancelled。 */
    readonly state: string;
}
/**
 * 队伍是否还有值得展示的工作。
 *
 * - 0 个任务 → false（新队伍还没排任务，不显示）
 * - 全部 cancelled（已弃）→ false（没有活可干）
 * - 任一 pending / claimed / running / blocked / completed / failed → true
 */
export declare function hallHasWork(tasks: readonly HallTaskLike[]): boolean;
