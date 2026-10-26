/**
 * 封神榜：十五重境界的档案、升级指南与宗门故事。
 *
 * 数据与文案分离：这里只放结构（境界、等级区间、文案 key），中文/英文由
 * locales.ts 提供，保证双语字典键始终对齐。
 */
import { CULTIVATION_REALMS, REALM_BANDS } from "./cultivation.js";
/** 每个境界的描述文案 key（显式列出，避免字符串拼接漏键）。 */
const RANK_DESC = {
    'realm.mortal': 'rank.desc.mortal',
    'realm.qi': 'rank.desc.qi',
    'realm.foundation': 'rank.desc.foundation',
    'realm.golden': 'rank.desc.golden',
    'realm.nascent': 'rank.desc.nascent',
    'realm.spirit': 'rank.desc.spirit',
    'realm.void': 'rank.desc.void',
    'realm.integration': 'rank.desc.integration',
    'realm.mahayana': 'rank.desc.mahayana',
    'realm.tribulation': 'rank.desc.tribulation',
    'realm.trueImmortal': 'rank.desc.trueImmortal',
    'realm.goldenImmortal': 'rank.desc.goldenImmortal',
    'realm.taiyi': 'rank.desc.taiyi',
    'realm.daluo': 'rank.desc.daluo',
    'realm.dao': 'rank.desc.dao',
};
/** 由境界带推导出的完整榜文：等级区间首尾相接、覆盖 1..9999。 */
export const ASCENSION_RANKS = CULTIVATION_REALMS.map((realm, index) => ({
    realm,
    levelMin: index === 0 ? 1 : REALM_BANDS[index - 1] + 1,
    levelMax: REALM_BANDS[index],
    descKey: RANK_DESC[realm],
}));
/** 快速升级的五条正路（本地化 key，按收益从高到低排）。 */
export const ASCENSION_TIPS = [
    'ascension.tip.tasks',
    'ascension.tip.captain',
    'ascension.tip.idle',
    'ascension.tip.first',
    'ascension.tip.gear',
];
/** 宗门故事：三段，从开山讲到当下。 */
export const ASCENSION_STORY = [
    'ascension.story.1',
    'ascension.story.2',
    'ascension.story.3',
];
/** 某等级落在哪一重境界（1..9999，越界夹紧）。 */
export function rankAtLevel(level) {
    const safe = Number.isFinite(level) ? Math.min(9999, Math.max(1, Math.floor(level))) : 1;
    const index = REALM_BANDS.findIndex(band => safe <= band);
    return ASCENSION_RANKS[index < 0 ? ASCENSION_RANKS.length - 1 : index];
}
