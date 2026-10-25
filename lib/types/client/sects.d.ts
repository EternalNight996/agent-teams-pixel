/**
 * 门派：开宗时给一套预设道途（或让系统随机分配）。
 *
 * 门派只是「一队道途的预设」，不改变任务模板的语义，也不发明新的角色 id：
 * 选中门派后道途照常进入计划，自定义模式仍可手选 20 个道途中的任意组合。
 */
import type { AgentTeamsLocaleKey } from './locales.ts';
/** 一个门派：名称/说明的 locale key + 默认道途（角色 id）。 */
export interface SectPreset {
    readonly id: string;
    readonly nameKey: AgentTeamsLocaleKey;
    readonly descKey: AgentTeamsLocaleKey;
    readonly roles: readonly string[];
}
/** 内置门派；新增门派只改这里。 */
export declare const SECT_PRESETS: readonly SectPreset[];
/** 按 id 找门派（未知 id 返回 undefined）。 */
export declare function sectPreset(id: string): SectPreset | undefined;
/** 随机抽一个门派（「系统动态分配」）。 */
export declare function randomSect(current?: string): SectPreset;
