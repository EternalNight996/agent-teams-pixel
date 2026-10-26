import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { captainKey, cultivationFromXp, memberKey } from "../cultivation.js";
import { useCultivationVersion, xpOf } from "../cultivation-store.js";
import { roleLabel } from "../role-labels.js";
import { createPixelScene } from "./PixelOfficeScene.js";
import { FACILITY_ORDER } from "./office-actions.js";
import css from './PixelOffice.module.css';
const FACILITY_LABEL = {
    teams: 'office.facility.teams',
    board: 'office.facility.board',
    ranks: 'office.facility.ranks',
    config: 'office.facility.config',
    gear: 'office.facility.gear',
    about: 'office.facility.about',
    inbox: 'office.facility.inbox',
};
const FACILITY_HINT = {
    teams: 'office.action.teamsHint',
    board: 'office.action.boardHint',
    ranks: 'office.action.ranksHint',
    config: 'office.action.configHint',
    gear: 'office.action.gearHint',
    about: 'office.action.aboutHint',
    inbox: 'office.action.inboxHint',
};
/** Single-character rail glyphs keep the floating toolbar tiny. */
const FACILITY_GLYPH = {
    teams: '山',
    board: '碑',
    ranks: '榜',
    config: '经',
    gear: '阁',
    about: '志',
    inbox: '信',
};
const ALL_ACTIONS = FACILITY_ORDER;
/** 闲置修士的随机闲聊：短句、与任务无关，按角色口吻写。 */
const CHATTER_KEYS = [
    'office.chatter.1', 'office.chatter.2', 'office.chatter.3', 'office.chatter.4',
    'office.chatter.5', 'office.chatter.6', 'office.chatter.7', 'office.chatter.8',
];
function sceneLabel(activity, t) {
    if (activity === 'working')
        return t('office.working');
    if (activity === 'unknown')
        return t('office.unknown');
    return t('office.idle');
}
export function PixelOffice({ team, t, onOpenMember, onOpenCaptain, onOpenCharacter, viewingSessionId, onUnavailable, onAction, activeAction, enabledActions, onSettings, settingsOpen, teamless, }) {
    const canvasRef = useRef(null);
    const hostRef = useRef(null);
    const sceneRef = useRef(null);
    const clickTimer = useRef(undefined);
    const cultivationVersion = useCultivationVersion();
    const [hover, setHover] = useState();
    const actions = enabledActions ?? ALL_ACTIONS;
    // 没有队伍时，山门就是开宗入口：墙上的标签/提示与底部「开宗」保持一致。
    const labelFor = (action) => (action === 'teams' && teamless === true ? t('quickstart.entry') : t(FACILITY_LABEL[action]));
    const hintFor = (action) => (action === 'teams' && teamless === true ? t('quickstart.entryTitle') : t(FACILITY_HINT[action]));
    const live = useMemo(() => team.members.filter(member => member.status !== 'removed'), [team.members]);
    const done = team.tasks.filter(task => task.status === 'completed').length;
    const running = team.tasks.filter(task => task.state === 'running').length;
    const waiting = team.tasks.filter(task => task.state === 'blocked').length;
    const failed = team.tasks.filter(task => task.status === 'failed').length;
    const model = useMemo(() => {
        // 全部任务了结后掌门不再显示“修炼中”，与进度页的“已完成”保持一致。
        const allCompleted = team.tasks.length > 0 && team.tasks.every(task => task.status === 'completed');
        const captainCultivation = cultivationFromXp(xpOf(captainKey(team.name)));
        const captainActive = team.phase === 'running' && team.halted !== true && !allCompleted
            && team.tasks.some(task => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress');
        const captain = {
            id: team.captainSessionId,
            name: t('office.captain'),
            role: 'captain',
            activity: captainActive ? 'working' : 'idle',
            unread: team.captainInbox.length,
            isLeader: true,
            viewing: viewingSessionId !== undefined && viewingSessionId === team.captainSessionId,
            level: captainCultivation.level,
            realm: t(captainCultivation.rankKey),
            xp: captainCultivation.xp,
            xpRatio: captainCultivation.ratio,
        };
        const members = [captain, ...live.map((member) => {
                const cultivation = cultivationFromXp(xpOf(memberKey(member.name)));
                return {
                    id: member.id,
                    name: member.name,
                    role: member.role,
                    activity: member.activity,
                    currentTask: member.currentTask,
                    progress: member.progress,
                    done: member.done,
                    total: member.total,
                    model: member.model,
                    unread: member.unread,
                    viewing: viewingSessionId !== undefined && viewingSessionId === member.id,
                    level: cultivation.level,
                    realm: t(cultivation.rankKey),
                    xp: cultivation.xp,
                    xpRatio: cultivation.ratio,
                };
            })];
        const facilities = onAction === undefined
            ? []
            : actions.map(action => ({
                action,
                label: labelFor(action),
                badge: action === 'inbox' ? team.captainInbox.length : undefined,
            }));
        return {
            teamName: team.name,
            phase: team.phase,
            halted: team.halted,
            members,
            activeAction: activeAction ?? undefined,
            facilities,
            // 中庭里的可点物件：配置水晶。
            sceneObjects: {
                settings: onSettings !== undefined,
                settingsActive: settingsOpen === true,
            },
            sceneLabels: {
                settings: t('office.floorSettings'),
            },
            // 闲置闲聊：设定好的短句，由场景按 seed 随机挑一句冒泡。
            chatter: CHATTER_KEYS.map(key => t(key)),
            labels: {
                captain: t('office.captain'),
                stalled: t('office.stalled'),
                awaiting: t('office.awaiting'),
                empty: t('office.empty'),
                working: t('office.working'),
                idle: t('office.idle'),
                unknownState: t('office.unknown'),
                viewing: t('office.viewingState'),
                levelUp: t('office.levelUp'),
            },
            // 墙面功德碑：把「宗门气运」的关键数字搬进洞府，点碑看完整进度。
            wall: {
                title: t('progress.title'),
                doneCount: done,
                total: team.tasks.length,
                runningCount: running,
                waitingCount: waiting,
                failedCount: failed,
            },
        };
    }, [actions, activeAction, cultivationVersion, done, failed, live, onAction, onSettings, running, settingsOpen, t, team, teamless, waiting]);
    useEffect(() => {
        const canvas = canvasRef.current;
        const host = hostRef.current;
        if (canvas === null || host === null)
            return;
        const scene = createPixelScene(canvas);
        sceneRef.current = scene;
        const measure = () => {
            const rect = host.getBoundingClientRect();
            scene.resize(rect.width, rect.height);
        };
        measure();
        const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
        observer?.observe(host);
        if (observer === undefined)
            window.addEventListener('resize', measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
            scene.dispose();
            sceneRef.current = null;
            if (clickTimer.current !== undefined)
                window.clearTimeout(clickTimer.current);
        };
    }, []);
    useEffect(() => {
        sceneRef.current?.render(model);
    }, [model]);
    useEffect(() => {
        const onMount = (event) => {
            const detail = event.detail;
            if (detail?.id !== undefined && detail.form !== undefined) {
                sceneRef.current?.setMount(detail.id, detail.form, detail.mountId, detail.label);
            }
        };
        window.addEventListener('agent-teams:mount', onMount);
        return () => { window.removeEventListener('agent-teams:mount', onMount); };
    }, []);
    useEffect(() => {
        const onEquip = (event) => {
            const detail = event.detail;
            if (detail?.id !== undefined && detail.kind !== undefined && detail.tier !== undefined) {
                sceneRef.current?.setEquip(detail.id, detail.kind, detail.tier, detail.itemId, detail.label);
            }
        };
        window.addEventListener('agent-teams:equip', onEquip);
        return () => { window.removeEventListener('agent-teams:equip', onEquip); };
    }, []);
    const sceneMembers = useMemo(() => new Map(model.members.map(member => [member.id, member])), [model]);
    const hitAt = (event) => {
        const canvas = canvasRef.current;
        if (canvas === null)
            return undefined;
        const rect = canvas.getBoundingClientRect();
        return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
    };
    const onPointerMove = (event) => {
        const rawHit = hitAt(event);
        // 等级框等同修士热区：悬停显示修士信息。
        const hit = rawHit?.kind === 'level' ? { kind: 'member', id: rawHit.id } : rawHit;
        sceneRef.current?.setHover(hit);
        const canvas = canvasRef.current;
        if (hit === undefined) {
            if (hover !== undefined)
                setHover(undefined);
            if (canvas !== null)
                canvas.style.cursor = 'default';
            return;
        }
        if (canvas !== null)
            canvas.style.cursor = 'pointer';
        const rect = event.currentTarget.getBoundingClientRect();
        // Keep the tooltip inside the canvas: half of its max width plus a margin.
        const x = Math.max(110, Math.min(event.clientX - rect.left, Math.max(110, rect.width - 110)));
        const y = event.clientY - rect.top;
        if (hit.kind === 'action') {
            setHover({ kind: 'action', action: hit.action, label: labelFor(hit.action), hint: hintFor(hit.action), x, y });
            return;
        }
        if (hit.kind === 'settings') {
            setHover({ kind: 'settings', label: t('office.floorSettings'), hint: t('office.scene.settingsHint'), x, y });
            return;
        }
        const member = sceneMembers.get(hit.id);
        if (member === undefined)
            return;
        setHover({
            kind: 'member',
            name: member.name,
            role: member.role,
            activity: member.activity,
            realm: member.isLeader === true
                ? `Lv.${cultivationFromXp(xpOf(captainKey(team.name))).level} ${t(cultivationFromXp(xpOf(captainKey(team.name))).rankKey)}`
                : `Lv.${cultivationFromXp(xpOf(memberKey(member.name))).level} ${t(cultivationFromXp(xpOf(memberKey(member.name))).rankKey)}`,
            task: member.currentTask ?? '',
            x,
            y,
        });
    };
    const onPointerLeave = () => {
        setHover(undefined);
        sceneRef.current?.setHover(undefined);
        if (canvasRef.current !== null)
            canvasRef.current.style.cursor = 'default';
    };
    const onClick = (event) => {
        const hit = hitAt(event);
        if (hit === undefined)
            return;
        if (hit.kind === 'level') {
            onOpenCharacter?.(hit.id);
            return;
        }
        if (hit.kind === 'action') {
            onAction?.(hit.action);
            return;
        }
        if (hit.kind === 'settings') {
            onSettings?.();
            return;
        }
        const member = sceneMembers.get(hit.id);
        if (member === undefined)
            return;
        // 双击：原地跳一下，不切换对话。
        if (event.detail >= 2) {
            if (clickTimer.current !== undefined) {
                window.clearTimeout(clickTimer.current);
                clickTimer.current = undefined;
            }
            // 能御剑/骑兽的修士双击切换形态；其余仍用弹跳反馈。
            if ((member.level ?? 0) >= 5 && member.activity !== 'working')
                sceneRef.current?.cycleMount(member.id || member.name);
            else
                sceneRef.current?.jump(member.id || member.name);
            return;
        }
        if (clickTimer.current !== undefined)
            window.clearTimeout(clickTimer.current);
        clickTimer.current = window.setTimeout(() => {
            clickTimer.current = undefined;
            // 掌门没有成员子会话：点他回到主对话。
            if (member.isLeader) {
                onOpenCaptain?.();
                return;
            }
            // 未派工/未建会话的修士：点开装备页，给明确反馈。
            if (member.id === '') {
                if (onOpenCharacter !== undefined)
                    onOpenCharacter(member.name);
                else
                    onUnavailable?.(member.name);
                return;
            }
            onOpenMember?.(member.id);
        }, 240);
    };
    const statusLine = team.halted === true
        ? t('office.stalled')
        : team.phase === 'staged'
            ? t('office.awaiting')
            : t('office.progress', { done, total: team.tasks.length });
    return (_jsxs("section", { className: css.office, "data-pixel-office": true, "data-phase": team.phase, "data-halted": team.halted === true || undefined, "aria-label": t('office.sceneAria', { name: team.name }), children: [_jsxs("span", { className: css.srOnly, children: [statusLine, " \u00B7 ", t('office.members', { count: live.length })] }), _jsxs("div", { ref: hostRef, className: css.canvasHost, children: [_jsx("canvas", { ref: canvasRef, className: css.canvas, role: "img", "aria-label": t('office.sceneAria', { name: team.name }), title: t('office.hint'), onPointerMove: onPointerMove, onPointerLeave: onPointerLeave, onClick: onClick }), hover !== undefined && (_jsx("div", { className: css.tooltip, "data-placement": hover.kind === 'member' ? 'above' : 'below', style: { left: hover.x, top: hover.y }, role: "tooltip", children: hover.kind === 'member' ? (_jsxs(_Fragment, { children: [_jsx("strong", { children: hover.name }), _jsx("span", { children: hover.role === 'captain' ? hover.realm : `${roleLabel(hover.role, hover.name, t)} · ${hover.realm}` }), _jsxs("span", { "data-activity": hover.activity, children: [sceneLabel(hover.activity, t), hover.task === '' ? '' : ` · ${hover.task}`] })] })) : (_jsxs(_Fragment, { children: [_jsx("strong", { children: hover.label }), _jsx("span", { children: hover.hint })] })) })), onAction !== undefined && actions.length > 0 && (_jsx("div", { className: css.rail, role: "toolbar", "aria-label": t('office.rail'), "data-office-rail": true, children: actions.map(action => (_jsx("button", { type: "button", className: css.railButton, "data-control": `office-${action}`, "aria-pressed": activeAction === action, "aria-label": labelFor(action), title: `${labelFor(action)} · ${hintFor(action)}`, onClick: () => { onAction(action); }, children: _jsx("span", { "aria-hidden": true, children: FACILITY_GLYPH[action] }) }, action))) }))] })] }));
}
