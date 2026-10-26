/**
 * 修炼体系：修为是全局的（按修士身份持久化），任务完成快、挂机慢。
 *
 * 这里只负责“修为 -> 等级/境界/解锁”，修为的累积由 cultivation-store 负责。
 */
export declare const CULTIVATION_REALMS: readonly ["realm.qi", "realm.foundation", "realm.golden", "realm.nascent", "realm.spirit", "realm.void", "realm.mahayana"];
export type CultivationRealmKey = (typeof CULTIVATION_REALMS)[number];
export type CultivationSkillKey = 'skill.aura' | 'skill.weapon' | 'skill.sword' | 'skill.shield' | 'skill.beast' | 'skill.treasure';
/** 等级上限与法器/技能解锁表。 */
export declare const LEVEL_CAP = 20;
export declare const SKILL_UNLOCKS: ReadonlyArray<{
    readonly level: number;
    readonly key: CultivationSkillKey;
}>;
/** 升到下一级还需要的修为（随等级线性增长）。 */
export declare function xpNeed(level: number): number;
/** 指定等级所需的累计修为（用于调试/直接提级）。 */
export declare function xpForLevel(level: number): number;
export interface Cultivation {
    readonly level: number;
    readonly xp: number;
    readonly floor: number;
    readonly next: number;
    /** 当前等级内的进度（0..1）。 */
    readonly ratio: number;
    readonly rankKey: CultivationRealmKey;
    readonly skills: readonly CultivationSkillKey[];
}
export declare function cultivationFromXp(xp: number): Cultivation;
/** 挂机修为：每分钟只涨一点点，主要靠任务。 */
export declare const IDLE_XP_PER_MINUTE = 0.25;
/** 完成一个任务获得的修为。 */
export declare const TASK_XP = 60;
/** 掌门因宗门任务完成获得的带队修为。 */
export declare const CAPTAIN_TASK_XP = 40;
/** 修士身份：按名字跨宗门共享等级。 */
export declare function memberKey(name: string): string;
/** 掌门身份：按宗门区分不同门派的掌门。 */
export declare function captainKey(teamName: string): string;
