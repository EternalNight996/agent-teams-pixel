import type { ActivityTeam } from './activity-monitor.ts';
import { type CultivationRealmKey } from './cultivation.ts';
/** 一次境界突破记录（修仙历史里展示）。 */
export interface CultivationMilestone {
    /** 记录时间（毫秒时间戳）。 */
    readonly at: number;
    /** 修为键：member:名字 / captain:宗门。 */
    readonly key: string;
    /** 突破后的等级。 */
    readonly level: number;
    /** 突破后的境界。 */
    readonly realm: CultivationRealmKey;
}
/** 修仙历史最多保留的条目数，避免 localStorage 无限增长。 */
export declare const CULTIVATION_HISTORY_LIMIT = 200;
export declare function subscribeCultivation(listener: () => void): () => void;
export declare function cultivationVersion(): number;
/** 全局修为查询；组件通过 useCultivationVersion 订阅后调用。 */
export declare function xpOf(key: string): number;
export declare function useCultivationVersion(): number;
/** 修仙历史快照（最新的在前，最多 CULTIVATION_HISTORY_LIMIT 条）。 */
export declare function readCultivationHistory(): readonly CultivationMilestone[];
/** 历史记录的显示名：把内部键还原成人能读的名字。 */
export declare function milestoneName(key: string): string;
/**
 * 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话角色的挂机修为。
 * @param teams - 所有实时队伍（同一份 activity 快照）。
 * @param currentSessionId - 当前前台会话，用于确定挂机角色。
 */
export declare function ingestCultivation(teams: readonly ActivityTeam[], currentSessionId?: string): void;
