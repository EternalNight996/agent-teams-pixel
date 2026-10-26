/**
 * 修炼体系：修为全局持久化，任务完成快、挂机慢；等级上限 9999。
 *
 * 这里负责“修为 -> 等级/境界/装备/技能解锁”，修为累积由 cultivation-store 负责。
 */
export const CULTIVATION_REALMS = [
    'realm.mortal',
    'realm.qi',
    'realm.foundation',
    'realm.golden',
    'realm.nascent',
    'realm.spirit',
    'realm.void',
    'realm.integration',
    'realm.mahayana',
    'realm.tribulation',
    'realm.trueImmortal',
    'realm.goldenImmortal',
    'realm.taiyi',
    'realm.daluo',
    'realm.dao',
];
/** 装备物品栏：等级里程碑解锁。 */
export const CULTIVATION_ITEMS = [
    { id: 'weapon-tao', kind: 'weapon', level: 1, key: 'item.weapon.tao', icon: '🗡' },
    { id: 'weapon-spirit', kind: 'weapon', level: 3, key: 'item.weapon.spirit', icon: '⚔' },
    { id: 'weapon-treasure', kind: 'weapon', level: 10, key: 'item.weapon.treasure', icon: '🔮' },
    { id: 'weapon-immortal', kind: 'weapon', level: 50, key: 'item.weapon.immortal', icon: '🪄' },
    { id: 'weapon-divine', kind: 'weapon', level: 500, key: 'item.weapon.divine', icon: '⚡' },
    { id: 'weapon-core', kind: 'weapon', level: 150, key: 'item.weapon.core', icon: '🔱' },
    { id: 'weapon-spirit-treasure', kind: 'weapon', level: 700, key: 'item.weapon.spiritTreasure', icon: '🔮' },
    { id: 'weapon-immortal-high', kind: 'weapon', level: 2800, key: 'item.weapon.immortalHigh', icon: '🪄' },
    { id: 'weapon-true-immortal', kind: 'weapon', level: 5200, key: 'item.weapon.trueImmortal', icon: '🌟' },
    { id: 'weapon-dao', kind: 'weapon', level: 9000, key: 'item.weapon.dao', icon: '🪐' },
    { id: 'mount-walk', kind: 'mount', level: 1, key: 'office.mountWalk', icon: '🚶', form: 'off' },
    { id: 'mount-sword', kind: 'mount', level: 5, key: 'item.mount.sword', icon: '🗡', form: 'sword' },
    { id: 'mount-beast', kind: 'mount', level: 8, key: 'item.mount.beast', icon: '🐉', form: 'beast' },
    { id: 'mount-crane', kind: 'mount', level: 20, key: 'item.mount.crane', icon: '🕊', form: 'beast' },
    { id: 'mount-qilin', kind: 'mount', level: 50, key: 'item.mount.qilin', icon: '🦄', form: 'beast' },
    { id: 'mount-dragon', kind: 'mount', level: 100, key: 'item.mount.dragon', icon: '🐲', form: 'beast' },
    { id: 'mount-jiao', kind: 'mount', level: 350, key: 'item.mount.jiao', icon: '🐍', form: 'beast' },
    { id: 'mount-immortal-crane', kind: 'mount', level: 1200, key: 'item.mount.immortalCrane', icon: '🕊', form: 'beast' },
    { id: 'mount-kirin', kind: 'mount', level: 2800, key: 'item.mount.kirin', icon: '🦄', form: 'beast' },
    { id: 'mount-true-dragon', kind: 'mount', level: 5200, key: 'item.mount.trueDragon', icon: '🐉', form: 'beast' },
    { id: 'mount-phoenix', kind: 'mount', level: 8000, key: 'item.mount.phoenix', icon: '🔥', form: 'beast' },
    { id: 'mount-dao-beast', kind: 'mount', level: 9800, key: 'item.mount.daoBeast', icon: '🦣', form: 'beast' },
    { id: 'skill-aura', kind: 'skill', level: 2, key: 'skill.aura', icon: '✨' },
    { id: 'skill-shield', kind: 'skill', level: 7, key: 'skill.shield', icon: '🛡' },
    { id: 'skill-swordarray', kind: 'skill', level: 15, key: 'skill.swordArray', icon: '🌀' },
    { id: 'skill-gale', kind: 'skill', level: 30, key: 'skill.gale', icon: '🌪' },
    { id: 'skill-law', kind: 'skill', level: 100, key: 'skill.law', icon: '🪷' },
    { id: 'skill-swordqi', kind: 'skill', level: 50, key: 'skill.swordQi', icon: '🗡' },
    { id: 'skill-pillfire', kind: 'skill', level: 150, key: 'skill.pillFire', icon: '🔥' },
    { id: 'skill-infantfire', kind: 'skill', level: 350, key: 'skill.infantFire', icon: '👶' },
    { id: 'skill-divinepower', kind: 'skill', level: 700, key: 'skill.divinePower', icon: '✨' },
    { id: 'skill-domain', kind: 'skill', level: 1200, key: 'skill.domain', icon: '🌌' },
    { id: 'skill-dharma', kind: 'skill', level: 2800, key: 'skill.dharma', icon: '🪷' },
    { id: 'skill-immortalart', kind: 'skill', level: 5200, key: 'skill.immortalArt', icon: '🌟' },
    { id: 'skill-daoart', kind: 'skill', level: 9000, key: 'skill.daoArt', icon: '🪐' },
];
/** 等级上限：9999。 */
export const LEVEL_CAP = 9999;
/** 境界带宽：炼气/筑基/…一路扩到 9999。 */
export const REALM_BANDS = [4, 49, 149, 349, 699, 1199, 1899, 2799, 3899, 5199, 6699, 7999, 8999, 9799, 9999];
/** 等级落在第几重境界（0 起，对应 CULTIVATION_REALMS）。 */
export function realmIndexForLevel(level) {
    const index = REALM_BANDS.findIndex(band => level <= band);
    return index < 0 ? REALM_BANDS.length - 1 : index;
}
/** 升到下一级还需要的修为（随等级线性增长）。 */
export function xpNeed(level) {
    return Math.round(60 * Math.pow(Math.max(1, level), 1.2));
}
/** 完成任务获得的修为：等级越高收益越高。 */
export function taskXpFor(level) {
    return 60 + Math.max(1, Math.floor(level)) * 15;
}
/** 掌门带队完成任务获得的修为。 */
export function captainTaskXpFor(level) {
    return 40 + Math.max(1, Math.floor(level)) * 8;
}
/** 挂机整体速度：0.5 = 在加速曲线上再砍一半（1 级保底 10 点不变）。 */
const IDLE_XP_SCALE = 0.5;
/** 高等级缓速指数：等级越高，每级耗时涨得越明显。 */
const IDLE_TAPER = 0.8;
/**
 * 每 10 秒挂机修为。
 *
 * 目标曲线：1 级正好 10 点（20 秒一级）；其余等级在加速曲线上整体减半。
 * 2 级后逐步加快，100 级约 20 秒一级（满连击），1→100 约 45 分钟；
 * 之后每级耗时按 (lv/100)^0.8 拉长（1000 级约 2 分钟、封顶约 13 分钟），越高越慢。
 */
export function idleXpPer10s(level) {
    const lv = Math.max(1, Math.floor(level));
    const ramp = 1 + Math.min(1, lv / 100);
    const softCap = Math.pow(Math.max(1, lv / 100), IDLE_TAPER);
    return Math.max(10, Math.round((10 * Math.pow(lv, 1.2) * ramp * IDLE_XP_SCALE) / softCap));
}
/** 连续挂机加成：每 1 分钟 +0.5 倍，最高 3 倍（离线补结按基础值）。 */
export function idleStreakMultiplier(streakTicks) {
    return Math.min(3, 1 + Math.floor(Math.max(0, streakTicks) / 6) * 0.5);
}
export function cultivationFromXp(xp) {
    const safe = Math.max(0, xp);
    let level = 1;
    let floor = 0;
    let need = xpNeed(1);
    while (level < LEVEL_CAP && safe >= floor + need) {
        floor += need;
        level += 1;
        need = xpNeed(level);
    }
    const realmIndex = realmIndexForLevel(level);
    const ratio = level >= LEVEL_CAP ? 1 : Math.min(1, Math.max(0, (safe - floor) / need));
    const skills = CULTIVATION_ITEMS
        .filter(item => item.kind === 'skill' && level >= item.level)
        .map(item => item.key);
    return {
        level,
        xp: safe,
        floor,
        next: floor + need,
        ratio,
        rankKey: CULTIVATION_REALMS[realmIndex],
        skills,
    };
}
/** 当前等级下已解锁的全部装备/技能（用于物品栏与 tooltip）。 */
export function unlockedItems(level) {
    return CULTIVATION_ITEMS.filter(item => level >= item.level);
}
export function memberKey(name) {
    return `member:${name.trim()}`;
}
export function captainKey(teamName) {
    return `captain:${teamName.trim()}`;
}
