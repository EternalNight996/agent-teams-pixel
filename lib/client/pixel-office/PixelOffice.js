import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPixelScene } from "./PixelOfficeScene.js";
import css from './PixelOffice.module.css';
function sceneLabel(activity, t) {
    if (activity === 'working')
        return t('office.working');
    if (activity === 'unknown')
        return t('office.unknown');
    return t('office.idle');
}
export function PixelOffice({ team, t, onOpenMember, onShowBoard, onCollapse }) {
    const canvasRef = useRef(null);
    const hostRef = useRef(null);
    const sceneRef = useRef(null);
    const [hover, setHover] = useState();
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
    const sceneMembers = useMemo(() => new Map(model.members.map(member => [member.id, member])), [model]);
    const hitAt = (event) => {
        const canvas = canvasRef.current;
        if (canvas === null)
            return undefined;
        const rect = canvas.getBoundingClientRect();
        return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
    };
    const onPointerMove = (event) => {
        const id = hitAt(event);
        const canvas = canvasRef.current;
        if (id === undefined) {
            if (hover !== undefined)
                setHover(undefined);
            if (canvas !== null)
                canvas.style.cursor = 'default';
            return;
        }
        if (canvas !== null)
            canvas.style.cursor = 'pointer';
        const member = sceneMembers.get(id);
        if (member === undefined)
            return;
        const rect = event.currentTarget.getBoundingClientRect();
        setHover({
            id,
            name: member.name,
            role: member.role,
            activity: member.activity,
            task: member.currentTask ?? '',
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };
    const onPointerLeave = () => {
        setHover(undefined);
        if (canvasRef.current !== null)
            canvasRef.current.style.cursor = 'default';
    };
    const onClick = (event) => {
        const id = hitAt(event);
        if (id !== undefined)
            onOpenMember?.(id);
    };
    return (_jsxs("section", { className: css.office, "data-pixel-office": true, "data-phase": team.phase, "data-halted": team.halted === true || undefined, "aria-label": t('office.title'), children: [_jsxs("header", { className: css.head, children: [_jsxs("span", { className: css.title, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('office.title'), _jsx("span", { className: css.count, children: t('office.members', { count: live.length }) })] }), _jsx("span", { className: css.meta, "data-working": working > 0 || undefined, children: team.halted === true
                            ? t('office.stalled')
                            : team.phase === 'staged'
                                ? t('office.awaiting')
                                : t('office.progress', { done, total }) }), onShowBoard !== undefined && (_jsx("button", { type: "button", className: css.viewButton, onClick: onShowBoard, title: t('office.showBoard'), children: t('office.showBoard') })), onCollapse !== undefined && (_jsx("button", { type: "button", className: css.viewButton, "data-control": "office-collapse", onClick: onCollapse, title: t('office.collapse'), "aria-label": t('office.collapse'), children: _jsx("span", { "aria-hidden": true, children: "\u25BE" }) }))] }), _jsxs("div", { ref: hostRef, className: css.canvasHost, children: [_jsx("canvas", { ref: canvasRef, className: css.canvas, role: "img", "aria-label": t('office.title'), title: t('office.hint'), onPointerMove: onPointerMove, onPointerLeave: onPointerLeave, onClick: onClick }), hover !== undefined && (_jsxs("div", { className: css.tooltip, style: { left: hover.x, top: hover.y }, role: "tooltip", children: [_jsx("strong", { children: hover.name }), _jsx("span", { children: hover.role }), _jsxs("span", { "data-activity": hover.activity, children: [sceneLabel(hover.activity, t), hover.task === '' ? '' : ` · ${hover.task}`] })] }))] }), live.length > 0 && (_jsx("ul", { className: css.chips, "aria-label": t('office.members', { count: live.length }), children: live.map((member) => (_jsx("li", { children: _jsxs("button", { type: "button", className: css.chip, "data-activity": member.activity, "data-unread": member.unread > 0 || undefined, disabled: onOpenMember === undefined, onClick: () => { onOpenMember?.(member.id); }, title: `${member.name} · ${member.role} · ${sceneLabel(member.activity, t)}`, children: [_jsx("span", { className: css.dot, "aria-hidden": true }), _jsx("span", { className: css.chipName, children: member.name }), member.currentTask !== '' && _jsx("span", { className: css.chipTask, children: member.currentTask })] }) }, member.id))) }))] }));
}
