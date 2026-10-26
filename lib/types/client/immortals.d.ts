/**
 * 封神榜：十五重境界的档案、升级指南与宗门故事。
 *
 * 数据与文案分离：这里只放结构（境界、等级区间、文案 key），中文/英文由
 * locales.ts 提供，保证双语字典键始终对齐。
 */
import { type CultivationRealmKey } from './cultivation.ts';
import type { AgentTeamsLocaleKey } from './locales.ts';
/** 榜上的一重境界。 */
export interface AscensionRank {
    readonly realm: CultivationRealmKey;
    readonly levelMin: number;
    readonly levelMax: number;
    /** 该境界的一句描述（本地化 key）。 */
    readonly descKey: AgentTeamsLocaleKey;
}
/** 由境界带推导出的完整榜文：等级区间首尾相接、覆盖 1..9999。 */
export declare const ASCENSION_RANKS: readonly AscensionRank[];
/** 快速升级的五条正路（本地化 key，按收益从高到低排）。 */
export declare const ASCENSION_TIPS: readonly AgentTeamsLocaleKey[];
/** 宗门故事：三段，从开山讲到当下。 */
export declare const ASCENSION_STORY: readonly AgentTeamsLocaleKey[];
/** 某等级落在哪一重境界（1..9999，越界夹紧）。 */
export declare function rankAtLevel(level: number): AscensionRank;
