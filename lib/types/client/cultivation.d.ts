/** 修炼体系：任务完成数 + 入宗时长累积修为，换算等级与境界。 */
import { REALM_KEYS } from './realm.ts';
export interface Cultivation {
    readonly level: number;
    readonly xp: number;
    /** 当前等级起点 / 下一等级所需，用于进度展示。 */
    readonly floor: number;
    readonly next: number;
    readonly rankKey: (typeof REALM_KEYS)[number];
}
/** 完成任务 + 在宗时长（天）累积修为；时间部分封顶 30 天，避免挂机膨胀。 */
export declare function cultivationOf(done: number, total: number, createdAt?: number, now?: number): Cultivation;
