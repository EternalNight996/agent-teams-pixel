/**
 * 修炼体系：修为是全局的（按修士身份持久化），任务完成快、挂机慢。
 *
 * 这里只负责“修为 -> 等级/境界/解锁”，修为的累积由 cultivation-store 负责。
 */
export const CULTIVATION_REALMS = [
    'realm.qi',
    'realm.foundation',
    'realm.golden',
    'realm.nascent',
    'realm.spirit',
    'realm.void',
    'realm.mahayana',
];
/** 等级上限与法器/技能解锁表。 */
export const LEVEL_CAP = 20;
export const SKILL_UNLOCKS = [
    { level: 2, key: 'skill.aura' },
    { level: 3, key: 'skill.weapon' },
    { level: 5, key: 'skill.sword' },
    { level: 7, key: 'skill.shield' },
    { level: 8, key: 'skill.beast' },
    { level: 10, key: 'skill.treasure' },
];
/** 升到下一级还需要的修为（随等级线性增长）。 */
export function xpNeed(level) {
    return 60 + (level - 1) * 45;
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
    const rankIndex = Math.min(CULTIVATION_REALMS.length - 1, Math.floor((level - 1) / 3));
    const ratio = level >= LEVEL_CAP ? 1 : Math.min(1, Math.max(0, (safe - floor) / need));
    const skills = SKILL_UNLOCKS.filter(unlock => level >= unlock.level).map(unlock => unlock.key);
    return {
        level,
        xp: safe,
        floor,
        next: floor + need,
        ratio,
        rankKey: CULTIVATION_REALMS[rankIndex],
        skills,
    };
}
/** 挂机修为：每分钟只涨一点点，主要靠任务。 */
export const IDLE_XP_PER_MINUTE = 0.25;
/** 完成一个任务获得的修为。 */
export const TASK_XP = 60;
/** 掌门因宗门任务完成获得的带队修为。 */
export const CAPTAIN_TASK_XP = 40;
/** 修士身份：按名字跨宗门共享等级。 */
export function memberKey(name) {
    return `member:${name.trim()}`;
}
/** 掌门身份：按宗门区分不同门派的掌门。 */
export function captainKey(teamName) {
    return `captain:${teamName.trim()}`;
}
