/**
 * 修炼体系：修为全局持久化，任务完成快、挂机慢；等级上限 9999。
 *
 * 这里负责“修为 -> 等级/境界/装备/技能解锁”，修为累积由 cultivation-store 负责。
 */
export declare const CULTIVATION_REALMS: readonly ["realm.qi", "realm.foundation", "realm.golden", "realm.nascent", "realm.spirit", "realm.void", "realm.mahayana"];
export type CultivationRealmKey = (typeof CULTIVATION_REALMS)[number];
export type CultivationSkillKey = 'skill.aura' | 'skill.shield' | 'skill.swordArray' | 'skill.gale' | 'skill.law';
export type CultivationItemKind = 'weapon' | 'mount' | 'skill';
export interface CultivationItem {
    readonly id: string;
    readonly kind: CultivationItemKind;
    readonly level: number;
    readonly key: string;
    readonly icon: string;
    /** 坐骑对应的场景形态。 */
    readonly form?: 'auto' | 'sword' | 'beast' | 'off';
}
/** 装备物品栏：等级里程碑解锁。 */
export declare const CULTIVATION_ITEMS: readonly CultivationItem[];
/** 等级上限：9999。 */
export declare const LEVEL_CAP = 9999;
/** 升到下一级还需要的修为（随等级线性增长）。 */
export declare function xpNeed(level: number): number;
/** 指定等级所需的累计修为（用于调试/直接提级）。 */
export declare function xpForLevel(level: number): number;
export interface Cultivation {
    readonly level: number;
    readonly xp: number;
    readonly floor: number;
    readonly next: number;
    readonly ratio: number;
    readonly rankKey: CultivationRealmKey;
    readonly skills: readonly CultivationSkillKey[];
}
export declare function cultivationFromXp(xp: number): Cultivation;
/** 当前等级下已解锁的全部装备/技能（用于物品栏与 tooltip）。 */
export declare function unlockedItems(level: number): readonly CultivationItem[];
/** 挂机修为：每分钟只涨一点点，主要靠任务。 */
export declare const IDLE_XP_PER_MINUTE = 0.25;
/** 完成一个任务获得的修为。 */
export declare const TASK_XP = 60;
/** 掌门因宗门任务完成获得的带队修为。 */
export declare const CAPTAIN_TASK_XP = 40;
export declare function memberKey(name: string): string;
export declare function captainKey(teamName: string): string;
