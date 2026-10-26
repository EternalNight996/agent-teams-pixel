import type { ActivityTeam } from './activity-monitor.ts';
export declare function subscribeCultivation(listener: () => void): () => void;
export declare function cultivationVersion(): number;
/** 全局修为查询；组件通过 useCultivationVersion 订阅后调用。 */
export declare function xpOf(key: string): number;
/** 直接设置某个角色修为（调试/提级用）；会立即持久化并通知界面。 */
export declare function setCultivationXp(key: string, xp: number): void;
export declare function useCultivationVersion(): number;
/**
 * 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话角色的挂机修为。
 * @param teams - 所有实时队伍（同一份 activity 快照）。
 * @param currentSessionId - 当前前台会话，用于确定挂机角色。
 */
export declare function ingestCultivation(teams: readonly ActivityTeam[], currentSessionId?: string): void;
