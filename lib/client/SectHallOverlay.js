import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
 *
 * 由 shell.overlay 的常驻监视器渲染，所以不依赖右侧栏标签页；墙面设施、剑盒、
 * 名册等在浮层内部展开（内容气泡贴在面板上方），传送阵在地板上切换「浮空 / 归栏」。
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TeamSection } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import css from './SectHallOverlay.module.css';
const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed';
const DOCKED_KEY = 'agent-teams-pixel.hallDocked';
const PANEL_RECT_KEY = 'agent-teams-pixel.hallRect';
function readBool(key) {
    if (typeof window === 'undefined')
        return false;
    try {
        return window.localStorage.getItem(key) === '1';
    }
    catch {
        return false;
    }
}
function writeBool(key, value) {
    try {
        window.localStorage.setItem(key, value ? '1' : '0');
    }
    catch { /* private mode */ }
}
function readPanelRect() {
    if (typeof window === 'undefined')
        return { x: 0, y: 0 };
    try {
        const raw = window.localStorage.getItem(PANEL_RECT_KEY);
        if (raw === null)
            return { x: 0, y: 0 };
        const parsed = JSON.parse(raw);
        return {
            x: typeof parsed.x === 'number' && Number.isFinite(parsed.x) ? parsed.x : 0,
            y: typeof parsed.y === 'number' && Number.isFinite(parsed.y) ? parsed.y : 0,
            w: typeof parsed.w === 'number' && parsed.w > 240 ? parsed.w : undefined,
            h: typeof parsed.h === 'number' && parsed.h > 160 ? parsed.h : undefined,
        };
    }
    catch {
        return { x: 0, y: 0 };
    }
}
function writePanelRect(rect) {
    try {
        window.localStorage.setItem(PANEL_RECT_KEY, JSON.stringify(rect));
    }
    catch { /* private mode */ }
}
/** 常驻洞府浮层里的墙面设施被点击时广播的事件（供监视器等复用）。 */
export const OPEN_HALL_SHEET_EVENT = 'agent-teams:open-sheet';
export function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember }) {
    const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY));
    const [docked, setDocked] = useState(() => readBool(DOCKED_KEY));
    const [sheet, setSheet] = useState();
    const [sheetAnchor, setSheetAnchor] = useState();
    const [rect, setRect] = useState(() => readPanelRect());
    const panelRef = useRef(null);
    const dragRef = useRef(null);
    const latestRect = useRef(rect);
    latestRect.current = rect;
    const done = team.tasks.filter(task => task.status === 'completed').length;
    const total = team.tasks.length;
    const staged = team.phase === 'staged';
    // 墙面设施/剑盒/名册 → 面板上方的内容气泡。
    useEffect(() => {
        const open = (event) => {
            const action = event.detail?.action;
            if (action !== undefined)
                setSheet(action);
        };
        window.addEventListener(OPEN_HALL_SHEET_EVENT, open);
        return () => { window.removeEventListener(OPEN_HALL_SHEET_EVENT, open); };
    }, []);
    // 内容气泡贴在面板上方（归栏时贴在栏的左侧），随面板移动/窗口缩放重新测量。
    useEffect(() => {
        if (sheet === undefined)
            return;
        const measure = () => {
            const panel = panelRef.current;
            if (panel === null)
                return;
            const bounds = panel.getBoundingClientRect();
            setSheetAnchor(docked
                ? { bottom: 16, right: Math.max(16, window.innerWidth - bounds.left + 16) }
                : { bottom: Math.max(16, window.innerHeight - bounds.top + 8), right: Math.max(16, window.innerWidth - bounds.right) });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [sheet, docked, collapsed, rect]);
    const beginDrag = (event) => {
        if (event.target.closest('button') !== null)
            return;
        const panel = panelRef.current;
        if (panel === null || docked)
            return;
        event.preventDefault();
        dragRef.current = { startX: event.clientX, startY: event.clientY, baseX: rect.x, baseY: rect.y };
        const move = (moveEvent) => {
            const drag = dragRef.current;
            if (drag === null)
                return;
            // 夹在窗口内，拖不丢。
            const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
            const next = {
                ...latestRect.current,
                x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), 16 - window.innerWidth, 0),
                y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), -(window.innerHeight - 96), 0),
            };
            latestRect.current = next;
            setRect(next);
        };
        const up = () => {
            dragRef.current = null;
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            writePanelRect(latestRect.current);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    };
    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeBool(COLLAPSED_KEY, next);
    };
    const toggleDocked = () => {
        const next = !docked;
        setDocked(next);
        writeBool(DOCKED_KEY, next);
        setSheet(undefined);
    };
    if (typeof document === 'undefined')
        return null;
    const transform = docked ? undefined : `translate(${rect.x}px, ${rect.y}px)`;
    const panelStyle = docked
        ? undefined
        : { transform, ...(rect.w === undefined ? {} : { width: `${rect.w}px` }), ...(rect.h === undefined ? {} : { height: `${rect.h}px` }) };
    const renderSheet = () => {
        if (sheet === undefined || sheetAnchor === undefined)
            return null;
        const title = sheet === 'inbox'
            ? t('workspace.inbox')
            : sheet === 'teams' ? t('office.facility.teams')
                : sheet === 'board' ? t('workspace.tabBoard')
                    : t('workspace.tabConfig');
        return createPortal((_jsxs("aside", { className: css.sheet, "data-sheet": sheet, style: { bottom: sheetAnchor.bottom, right: sheetAnchor.right }, role: "dialog", "aria-modal": "false", "aria-label": title, children: [_jsxs("header", { className: css.sheetHead, children: [_jsx("span", { className: css.sheetTitle, children: title }), _jsx("button", { type: "button", className: css.sheetClose, onClick: () => { setSheet(undefined); }, "aria-label": t('office.closePanel'), children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheet === 'inbox' ? (_jsx("ul", { className: css.inboxList, children: team.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxRow, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxText, children: message.content })] }, `${index}:${message.from}`))) })) : sheet === 'config' ? (staged
                        ? _jsx(StagingPlanEditor, { team: team, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); }, t: t })
                        : _jsx(TeamConfigPanel, { team: team, t: t })) : (_jsx(TeamSection, { team: team, t: t, workspace: true, onNavigate: (_parent, child) => { openMember(sessionId, child); }, onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); } })) })] })), document.body);
    };
    return (_jsxs(_Fragment, { children: [createPortal((_jsxs("section", { ref: panelRef, className: css.window, "data-hall-window": true, "data-collapsed": collapsed || undefined, "data-docked": docked || undefined, style: panelStyle, "aria-label": t('office.sceneAria', { name: team.name }), children: [_jsxs("header", { className: css.head, onPointerDown: beginDrag, children: [_jsx("span", { className: css.caret, "aria-hidden": true, children: collapsed ? '▸' : '▾' }), _jsxs("span", { className: css.title, children: ["\u26E9 ", team.name] }), _jsxs("span", { className: css.meta, children: [done, "/", total] }), _jsx("button", { type: "button", className: css.headButton, "data-control": "hall-collapse", "aria-expanded": !collapsed, onClick: toggleCollapsed, children: collapsed ? t('office.expand') : t('office.collapse') })] }), !collapsed && (_jsxs(_Fragment, { children: [_jsx("div", { className: css.canvas, children: _jsx(PixelOffice, { team: team, t: t, activeAction: sheet ?? null, onAction: (action) => { setSheet(action); }, onOpenMember: (memberId) => { openMember(sessionId, memberId); }, onUnavailable: () => { } }) }), _jsxs("footer", { className: css.floor, children: [_jsxs("button", { type: "button", className: css.portal, "data-control": "hall-dock", "data-mode": docked ? 'docked' : 'floating', onClick: toggleDocked, title: docked ? t('office.dockFloating') : t('office.dockSidebar'), children: [_jsx("span", { className: css.portalGlyph, "aria-hidden": true, children: "\u2725" }), _jsx("span", { children: docked ? t('office.dockFloating') : t('office.dockSidebar') })] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-sword", onClick: () => { setSheet('config'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2694" }), t('office.swordBox')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-roster", onClick: () => { setSheet('teams'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2630" }), t('office.roster')] })] })] }))] })), document.body), renderSheet()] }));
}
