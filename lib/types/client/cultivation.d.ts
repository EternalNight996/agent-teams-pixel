/**
 * 修炼体系：修为全局持久化，任务完成快、挂机慢；等级上限 9999。
 *
 * 这里负责“修为 -> 等级/境界/装备/技能解锁”，修为累积由 cultivation-store 负责。
 */
export declare const CULTIVATION_REALMS: readonly ["realm.mortal", "realm.qi", "realm.foundation", "realm.golden", "realm.nascent", "realm.spirit", "realm.void", "realm.integration", "realm.mahayana", "realm.tribulation", "realm.trueImmortal", "realm.goldenImmortal", "realm.taiyi", "realm.daluo", "realm.dao"];
export type CultivationRealmKey = (typeof CULTIVATION_REALMS)[number];
export type CultivationSkillKey = 'skill.aura' | 'skill.shield' | 'skill.swordArray' | 'skill.gale' | 'skill.law' | 'skill.swordQi' | 'skill.pillFire' | 'skill.infantFire' | 'skill.divinePower' | 'skill.domain' | 'skill.dharma' | 'skill.immortalArt' | 'skill.daoArt';
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
/** 境界带宽：炼气/筑基/…一路扩到 9999。 */
export declare const REALM_BANDS: readonly [4, 49, 149, 349, 699, 1199, 1899, 2799, 3899, 5199, 6699, 7999, 8999, 9799, 9999];
/** 等级落在第几重境界（0 起，对应 CULTIVATION_REALMS）。 */
export declare function realmIndexForLevel(level: number): number;
/** 升级特效时长（ms）；跨境界的「破境」特效更长，给足视觉反馈。 */
export declare const LEVEL_UP_FX_MS = 1400;
export declare const REALM_BREAK_FX_MS = 3200;
/** 这次升级是否跨过了境界带（例如 4 → 5、49 → 50）。 */
export declare function isRealmBreak(previousLevel: number, level: number): boolean;
/** 升级横幅/金环的持续时间：普通升级 1.4 秒，破境拉长到 3.2 秒。 */
export declare function levelUpFxDuration(previousLevel: number, level: number): number;
/** 升到下一级还需要的修为（随等级线性增长）。 */
export declare function xpNeed(level: number): number;
/** 完成任务获得的修为：等级越高收益越高；任务收益整体 ×5（相对旧曲线 +500%）。 */
export declare function taskXpFor(level: number): number;
/** 掌门带队完成任务获得的修为；同样 ×5。 */
export declare function captainTaskXpFor(level: number): number;
/**
 * 每 10 秒挂机修为。
 *
 * 目标曲线：1 级 2 点；整体速度为旧版的 1/5（挂机升级慢 80%）。
 * 任务完成收益则提升到 5 倍，形成「交付驱动、挂机养生」的节奏。
 */
export declare function idleXpPer10s(level: number): number;
/** 连续挂机加成：每 1 分钟 +0.5 倍，最高 3 倍（离线补结按基础值）。 */
export declare function idleStreakMultiplier(streakTicks: number): number;
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
export declare function memberKey(name: string): string;
/**
 * 宗门稳定名：去掉开宗时自动追加的 6 位时间后缀。
 * 例如「魔宗·045343」「魔宗-045343」都归到「魔宗」，这样重新开宗能继承掌门等级。
 */
export declare function sectBaseName(teamName: string): string;
export declare function captainKey(teamName: string): string;
