/**
 * 全局修为仓库：按“修士名字 / 宗门掌门”持久化累计修为。
 *
 * - 任务完成：给对应修士加较多修为（历史已完成任务在首次见到时结算一次）；
 * - 掌门：按宗门已完成任务获得带队修为；
 * - 挂机：当前对话面板所属宗门的所有修士一起结算；正在对话的角色额外享受连击；
 * - 数据落在 localStorage，跨宗门、跨会话共享。
 */
import { useSyncExternalStore } from 'react';
import { captainKey, captainTaskXpFor, cultivationFromXp, idleStreakMultiplier, idleXpPer10s, memberKey, taskXpFor, } from "./cultivation.js";
const STORAGE_KEY = 'dsh-pixel-team.cultivation.v1';
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
            lastTeam: typeof parsed.lastTeam === 'string' ? parsed.lastTeam : undefined,
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
/** 当前前台会话对应的修为键（掌门或成员）；找不到返回 undefined。 */
function resolveCurrentKey(teams, sessionId) {
    const team = teams.find(item => item.captainSessionId === sessionId)
        ?? teams.find(item => item.members.some(member => member.id === sessionId));
    if (team === undefined)
        return undefined;
    if (team.captainSessionId === sessionId)
        return captainKey(team.name);
    const member = team.members.find(item => item.id === sessionId);
    return member === undefined ? undefined : memberKey(member.name);
}
/**
 * 结算一个角色的挂机修为：每满 10 秒一笔。
 * 当前对话面板内的角色都会调用；只有正在对话的那位吃连续在线倍率。
 * 离线批量补结按基础值，最多补 8 小时。
 */
function settleIdleXp(key, now, active) {
    const last = state.idleAt[key] ?? now;
    const gap = now - last;
    const intervals = Math.min(2880, Math.floor(gap / 10_000));
    if (intervals <= 0) {
        if (state.idleAt[key] === undefined) {
            state.idleAt[key] = now;
            state.streak[key] = 0;
        }
        return false;
    }
    const online = gap <= 30_000;
    const prior = online ? (state.streak[key] ?? 0) : 0;
    const multiplier = active && online && intervals === 1 ? idleStreakMultiplier(prior) : 1;
    const level = cultivationFromXp(xpOf(key)).level;
    const gained = addXp(key, Math.round(intervals * idleXpPer10s(level) * multiplier));
    state.idleAt[key] = last + intervals * 10_000;
    if (active)
        state.streak[key] = prior + intervals;
    return gained;
}
/**
 * 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话面板内全队的挂机修为。
 * @param teams - 所有实时队伍（同一份 activity 快照）。
 * @param currentSessionId - 当前前台会话；只有它所属宗门的面板会获得挂机修为。
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
    // 挂机：当前对话面板所属宗门内的所有修士一起结算；当前正在对话的角色额外吃连击。
    // 切换宗门面板时从切换那一刻重新起算，不把别的面板停留时间补记进来。
    const currentTeam = currentSessionId === undefined || currentSessionId === ''
        ? undefined
        : teams.find(team => team.captainSessionId === currentSessionId
            || team.members.some(member => member.id === currentSessionId));
    const currentKey = currentTeam === undefined
        ? undefined
        : (currentTeam.captainSessionId === currentSessionId
            ? captainKey(currentTeam.name)
            : memberKey(currentTeam.members.find(member => member.id === currentSessionId)?.name ?? ''));
    if (currentTeam !== undefined) {
        const keys = [captainKey(currentTeam.name), ...currentTeam.members.map(member => memberKey(member.name))];
        if (state.lastTeam !== currentTeam.teamId) {
            for (const key of keys) {
                state.idleAt[key] = now;
                state.streak[key] = 0;
            }
            state.lastTeam = currentTeam.teamId;
            changed = true;
        }
        for (const key of keys) {
            changed = settleIdleXp(key, now, key === currentKey) || changed;
        }
    }
    else if (state.lastTeam !== undefined) {
        state.lastTeam = undefined;
        changed = true;
    }
    state.tick = now;
    if (changed) {
        persist();
        notify();
    }
}
