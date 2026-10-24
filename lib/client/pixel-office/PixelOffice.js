import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
import { useEffect, useMemo, useRef } from 'react';
import { createPixelScene } from "./PixelOfficeScene.js";
import css from './PixelOffice.module.css';
function sceneLabel(activity, t) {
    if (activity === 'working')
        return t('office.working');
    if (activity === 'unknown')
        return t('office.unknown');
    return t('office.idle');
}
export function PixelOffice({ team, t, onOpenMember, onShowBoard }) {
    const canvasRef = useRef(null);
    const hostRef = useRef(null);
    const sceneRef = useRef(null);
    const model = useMemo(() => {
        const live = team.members.filter(member => member.status !== 'removed');
        const captain = {
            id: team.captainSessionId,
            name: t('office.captain'),
            role: 'captain',
            activity: team.phase === 'running' ? 'working' : 'idle',
            unread: team.captainInbox.length,
            isLeader: true,
        };
        const members = [captain, ...live.map((member) => ({
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
            }))];
        return {
            teamName: team.name,
            phase: team.phase,
            halted: team.halted,
            members,
            labels: {
                captain: t('office.captain'),
                stalled: t('office.stalled'),
                awaiting: t('office.awaiting'),
                empty: t('office.empty'),
            },
        };
    }, [team, t]);
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
        };
    }, []);
    useEffect(() => {
        sceneRef.current?.render(model);
    }, [model]);
    const total = team.tasks.length;
    const done = team.tasks.filter(task => task.state === 'completed').length;
    const live = team.members.filter(member => member.status !== 'removed');
    const working = live.filter(member => member.activity === 'working').length;
    return (_jsxs("section", { className: css.office, "data-pixel-office": true, "data-phase": team.phase, "data-halted": team.halted === true || undefined, "aria-label": t('office.title'), children: [_jsxs("header", { className: css.head, children: [_jsxs("span", { className: css.title, children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFE2" }), t('office.title'), _jsx("span", { className: css.count, children: t('office.members', { count: live.length }) })] }), _jsx("span", { className: css.meta, "data-working": working > 0 || undefined, children: team.halted === true
                            ? t('office.stalled')
                            : team.phase === 'staged'
                                ? t('office.awaiting')
                                : t('office.progress', { done, total }) }), onShowBoard !== undefined && (_jsx("button", { type: "button", className: css.viewButton, onClick: onShowBoard, title: t('office.showBoard'), children: t('office.showBoard') }))] }), _jsx("div", { ref: hostRef, className: css.canvasHost, children: _jsx("canvas", { ref: canvasRef, className: css.canvas, role: "img", "aria-label": t('office.title') }) }), live.length > 0 && (_jsx("ul", { className: css.chips, "aria-label": t('office.members', { count: live.length }), children: live.map((member) => (_jsx("li", { children: _jsxs("button", { type: "button", className: css.chip, "data-activity": member.activity, "data-unread": member.unread > 0 || undefined, disabled: onOpenMember === undefined, onClick: () => { onOpenMember?.(member.id); }, title: `${member.name} · ${member.role} · ${sceneLabel(member.activity, t)}`, children: [_jsx("span", { className: css.dot, "aria-hidden": true }), _jsx("span", { className: css.chipName, children: member.name }), member.currentTask !== '' && _jsx("span", { className: css.chipTask, children: member.currentTask })] }) }, member.id))) }))] }));
}
