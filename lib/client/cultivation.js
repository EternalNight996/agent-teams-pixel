/** 修炼体系：任务完成数 + 入宗时长累积修为，换算等级与境界。 */
import { REALM_KEYS } from "./realm.js";
/** 完成任务 + 在宗时长（天）累积修为；时间部分封顶 30 天，避免挂机膨胀。 */
export function cultivationOf(done, total, createdAt, now = Date.now()) {
    const tasks = Math.max(0, done) * 40 + Math.max(0, total) * 8;
    const days = createdAt === undefined ? 0 : Math.min(30, Math.max(0, (now - createdAt) / 86_400_000));
    const xp = Math.round(tasks + days * 8);
    let level = 1;
    let floor = 0;
    let need = 60;
    while (xp >= floor + need) {
        floor += need;
        level += 1;
        need = 60 + (level - 1) * 40;
    }
    const rankIndex = Math.min(REALM_KEYS.length - 1, Math.floor((level - 1) / 2));
    return { level, xp, floor, next: floor + need, rankKey: REALM_KEYS[rankIndex] };
}
