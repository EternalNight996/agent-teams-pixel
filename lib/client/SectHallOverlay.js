import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 常驻的洞府浮层：整个洞府场景浮在 DSH 窗口上，可收起成一条。
 *
 * 它由 shell.overlay 里的常驻监视器渲染，所以离开右侧栏、切到对话页也一直在；
 * 墙面设施只负责「打开协作看板」，内容面板由看板页的浮窗承载。
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import css from './SectHallOverlay.module.css';
const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed';
function readCollapsed() {
    if (typeof window === 'undefined')
        return false;
    try {
        return window.localStorage.getItem(COLLAPSED_KEY) === '1';
    }
    catch {
        return false;
    }
}
function writeCollapsed(value) {
    try {
        window.localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0');
    }
    catch { /* private mode */ }
}
/** 贴住主内容区右下角：避开右侧栏（协作看板所在栏）。 */
function readInset() {
    if (typeof document === 'undefined')
        return 16;
    const pane = document.querySelector('[data-agent-teams-workspace]');
    const left = pane === null ? window.innerWidth : pane.getBoundingClientRect().left;
    return Math.max(16, Math.round(window.innerWidth - left + 16));
}
export function SectHallOverlay({ team, t, onOpenMember, onAction }) {
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [inset, setInset] = useState(readInset);
    useEffect(() => {
        const measure = () => { setInset(readInset()); };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, []);
    const done = team.tasks.filter(task => task.status === 'completed').length;
    const total = team.tasks.length;
    if (typeof document === 'undefined')
        return null;
    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeCollapsed(next);
    };
    return createPortal((_jsxs("section", { className: css.window, "data-hall-window": true, "data-collapsed": collapsed || undefined, style: { right: inset }, "aria-label": t('office.sceneAria', { name: team.name }), children: [_jsx("header", { className: css.head, children: _jsxs("button", { type: "button", className: css.headButton, "data-control": "hall-toggle", "aria-expanded": !collapsed, title: t('office.hintShort'), onClick: toggle, children: [_jsx("span", { className: css.caret, "aria-hidden": true, children: collapsed ? '▴' : '▾' }), _jsxs("span", { className: css.title, children: ["\u26E9 ", team.name] }), _jsx("span", { className: css.meta, children: t('team.stats.completed', { completed: done, total }) })] }) }), !collapsed && (_jsx("div", { className: css.canvas, children: _jsx(PixelOffice, { team: team, t: t, onAction: onAction, onOpenMember: (memberId) => { onOpenMember(memberId); } }) }))] })), document.body);
}
export const OPEN_HALL_SHEET_EVENT = 'agent-teams:open-sheet';
