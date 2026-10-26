import type { ActivityTeam } from './activity-monitor.ts';
export declare function subscribeCultivation(listener: () => void): () => void;
export declare function cultivationVersion(): number;
/** 全局修为查询；组件通过 useCultivationVersion 订阅后调用。 */
export declare function xpOf(key: string): number;
export declare function useCultivationVersion(): number;
/**
 * 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话面板内全队的挂机修为。
 * @param teams - 所有实时队伍（同一份 activity 快照）。
 * @param currentSessionId - 当前前台会话；只有它所属宗门的面板会获得挂机修为。
 */
export declare function ingestCultivation(teams: readonly ActivityTeam[], currentSessionId?: string): void;
