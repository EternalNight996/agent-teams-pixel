/**
 * 全局修为仓库：按“修士名字 / 宗门掌门”持久化累计修为。
 *
 * - 任务完成：给对应修士加较多修为（历史已完成任务在首次见到时结算一次）；
 * - 掌门：按宗门已完成任务获得带队修为；
 * - 挂机：只给“当前打开对话”的那个角色少量修为；
 * - 数据落在 localStorage，跨宗门、跨会话共享。
 */
import { useSyncExternalStore } from 'react';
import { captainKey, captainTaskXpFor, cultivationFromXp, idleStreakMultiplier, idleXpPer10s, memberKey, taskXpFor, } from "./cultivation.js";
const STORAGE_KEY = 'agent-teams-pixel.cultivation.v1';
function emptyState() {
    return { xp: {}, seen: {}, idleAt: {}, streak: {}, tick: Date.now() };
}
function load() {
    if (typeof localStorage === 'undefined')
        return emptyState();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null)
            return emptyState();
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null)
            return emptyState();
        return {
            xp: typeof parsed.xp === 'object' && parsed.xp !== null ? parsed.xp : {},
            seen: typeof parsed.seen === 'object' && parsed.seen !== null ? parsed.seen : {},
            idleAt: typeof parsed.idleAt === 'object' && parsed.idleAt !== null ? parsed.idleAt : {},
            streak: typeof parsed.streak === 'object' && parsed.streak !== null ? parsed.streak : {},
            tick: typeof parsed.tick === 'number' ? parsed.tick : Date.now(),
        };
    }
    catch {
        return emptyState();
    }
}
let state = load();
let version = 0;
const listeners = new Set();
function persist() {
    if (typeof localStorage === 'undefined')
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch {
        // Storage may be disabled/full; levels simply stop persisting.
    }
}
function notify() {
    version += 1;
    for (const listener of listeners)
        listener();
}
function addXp(key, amount) {
    if (!(amount > 0))
        return false;
    state.xp[key] = (state.xp[key] ?? 0) + amount;
    return true;
}
export function subscribeCultivation(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
export function cultivationVersion() {
    return version;
}
/** 全局修为查询；组件通过 useCultivationVersion 订阅后调用。 */
export function xpOf(key) {
    // 修为只显示整数，避免挂机出现小数点。
    return Math.round(state.xp[key] ?? 0);
}
export function useCultivationVersion() {
    return useSyncExternalStore(subscribeCultivation, cultivationVersion, cultivationVersion);
}
/**
 * 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话角色的挂机修为。
 * @param teams - 所有实时队伍（同一份 activity 快照）。
 * @param currentSessionId - 当前前台会话，用于确定挂机角色。
 */
export function ingestCultivation(teams, currentSessionId) {
    const now = Date.now();
    let changed = false;
    for (const team of teams) {
        for (const member of team.members) {
            const key = memberKey(member.name);
            const seenKey = `${team.teamId}:member:${member.name}`;
            const previous = state.seen[seenKey];
            if (previous === undefined) {
                // 首次见到这个修士：把历史已完成任务一次性结修为，让“用得多”立刻体现在等级上。
                state.seen[seenKey] = member.done;
                if (member.done > 0)
                    changed = addXp(key, member.done * taskXpFor(cultivationFromXp(xpOf(key)).level)) || changed;
            }
            else if (member.done > previous) {
                changed = addXp(key, (member.done - previous) * taskXpFor(cultivationFromXp(xpOf(key)).level)) || changed;
                state.seen[seenKey] = member.done;
            }
            else if (member.done < previous) {
                state.seen[seenKey] = member.done;
            }
        }
        const teamDone = team.tasks.filter(task => task.status === 'completed').length;
        const captainSeenKey = `${team.teamId}:captain`;
        const captainPrevious = state.seen[captainSeenKey];
        if (captainPrevious === undefined) {
            state.seen[captainSeenKey] = teamDone;
            if (teamDone > 0)
                changed = addXp(captainKey(team.name), teamDone * captainTaskXpFor(cultivationFromXp(xpOf(captainKey(team.name))).level)) || changed;
        }
        else if (teamDone > captainPrevious) {
            changed = addXp(captainKey(team.name), (teamDone - captainPrevious) * captainTaskXpFor(cultivationFromXp(xpOf(captainKey(team.name))).level)) || changed;
            state.seen[captainSeenKey] = teamDone;
        }
        else if (teamDone < captainPrevious) {
            state.seen[captainSeenKey] = teamDone;
        }
    }
    // 挂机：只给当前对话里的那个角色，慢速累积。
    if (currentSessionId !== undefined && currentSessionId !== '') {
        const team = teams.find(item => item.captainSessionId === currentSessionId)
            ?? teams.find(item => item.members.some(member => member.id === currentSessionId));
        if (team !== undefined) {
            const isCaptain = team.captainSessionId === currentSessionId;
            const member = team.members.find(item => item.id === currentSessionId);
            const key = isCaptain ? captainKey(team.name) : member === undefined ? undefined : memberKey(member.name);
            if (key !== undefined) {
                // 每满 10 秒结算一次；连续在线每 2 分钟 +0.5 倍，最高 3 倍；离线最多补 8 小时。
                const last = state.idleAt[key] ?? now;
                const gap = now - last;
                const intervals = Math.min(2880, Math.floor(gap / 10_000));
                if (intervals > 0) {
                    const online = gap <= 30_000;
                    const prior = online ? (state.streak[key] ?? 0) : 0;
                    // 离线批量补结按基础值，不叠连续挂机倍率。
                    const multiplier = online && intervals === 1 ? idleStreakMultiplier(prior) : 1;
                    const level = cultivationFromXp(xpOf(key)).level;
                    changed = addXp(key, Math.round(intervals * idleXpPer10s(level) * multiplier)) || changed;
                    state.idleAt[key] = last + intervals * 10_000;
                    state.streak[key] = prior + intervals;
                }
                else if (state.idleAt[key] === undefined) {
                    state.idleAt[key] = now;
                    state.streak[key] = 0;
                }
            }
        }
    }
    state.tick = now;
    if (changed) {
        persist();
        notify();
    }
}
