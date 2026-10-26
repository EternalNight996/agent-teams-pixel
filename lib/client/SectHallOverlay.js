import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
 *
 * 由 shell.overlay 的常驻监视器渲染，所以不依赖右侧栏标签页；墙面设施、剑盒、
 * 名册等在浮层内部展开（内容气泡贴在面板左侧），传送阵在地板上切换「浮空 / 归栏」。
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TeamSection } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import { hallSheetPlacement } from "./hall-geometry.js";
import css from './SectHallOverlay.module.css';
const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed';
const DOCKED_KEY = 'agent-teams-pixel.hallDocked';
const PANEL_RECT_KEY = 'agent-teams-pixel.hallRect';
const TOKEN_KEY = 'agent-teams-pixel.hallToken';
/** 收起后的令牌尺寸（含流苏上方的牌身）。 */
const TOKEN_SIZE = { w: 38, h: 68 };
/** 把令牌夹在窗口内；留 8px 边缘，拖不出屏。 */
function clampToken(x, y) {
    const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
    return {
        x: Math.max(8, Math.min(x, vw - TOKEN_SIZE.w - 8)),
        y: Math.max(8, Math.min(y, vh - TOKEN_SIZE.h - 8)),
    };
}
function readTokenPoint() {
    if (typeof window === 'undefined')
        return { x: 16, y: 16 };
    try {
        const raw = window.localStorage.getItem(TOKEN_KEY);
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.x === 'number' && Number.isFinite(parsed.x)
                && typeof parsed.y === 'number' && Number.isFinite(parsed.y)) {
                return clampToken(parsed.x, parsed.y);
            }
        }
    }
    catch { /* private mode */ }
    // 默认停在右下角：与展开面板同一处，收起时不跳。
    return clampToken(window.innerWidth - TOKEN_SIZE.w - 16, window.innerHeight - TOKEN_SIZE.h - 16);
}
function writeTokenPoint(point) {
    try {
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(point));
    }
    catch { /* private mode */ }
}
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
/** 面板预设尺寸：初始给大一些。 */
const PANEL_SIZES = {
    compact: { w: 460, h: 380 },
    normal: { w: 620, h: 500 },
    large: { w: 820, h: 640 },
};
export function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember }) {
    const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY));
    const [docked, setDocked] = useState(() => readBool(DOCKED_KEY));
    const [sheet, setSheet] = useState();
    const [sheetAnchor, setSheetAnchor] = useState();
    const [rect, setRect] = useState(() => readPanelRect());
    const [token, setToken] = useState(() => readTokenPoint());
    const tokenDrag = useRef(null);
    const [size, setSize] = useState(() => {
        const stored = readPanelRect();
        return { w: stored.w ?? PANEL_SIZES.normal.w, h: stored.h ?? PANEL_SIZES.normal.h };
    });
    const panelRef = useRef(null);
    const dragRef = useRef(null);
    const latestRect = useRef(rect);
    latestRect.current = rect;
    // 洞府常驻：即使当前会话还没有队伍，也保留浮层（空洞府里只有掌门）。
    const hasTeam = team !== undefined;
    const hall = team ?? {
        workspace: '',
        teamId: '',
        name: t('office.hallEmptyName'),
        captainSessionId: '',
        phase: 'running',
        members: [],
        tasks: [],
        messageCount: 0,
        captainInbox: [],
    };
    const done = hall.tasks.filter(task => task.status === 'completed').length;
    const total = hall.tasks.length;
    const staged = hall.phase === 'staged';
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
    // 内容气泡贴在面板左侧：右缘 = 面板左缘 − 8px，面板越大越靠左；再夹在窗口内。
    useEffect(() => {
        if (sheet === undefined)
            return;
        const measure = () => {
            const panel = panelRef.current;
            if (panel === null)
                return;
            const bounds = panel.getBoundingClientRect();
            setSheetAnchor({ ...hallSheetPlacement(bounds.left, window.innerWidth), bottom: 16 });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [sheet, docked, collapsed, rect, size]);
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
        // 收起成一枚令牌时，内容气泡也一并收起，避免令牌旁边挂着一块面板。
        if (next)
            setSheet(undefined);
    };
    // 令牌可拖动：拖到任意角落，位置记在 localStorage；没拖动就是点击展开。
    const beginTokenDrag = (event) => {
        if (event.button !== 0)
            return;
        event.preventDefault();
        event.currentTarget.focus();
        const drag = {
            startX: event.clientX,
            startY: event.clientY,
            baseX: token.x,
            baseY: token.y,
            lastX: token.x,
            lastY: token.y,
            moved: false,
        };
        tokenDrag.current = drag;
        const cleanup = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancel);
        };
        const move = (moveEvent) => {
            if (tokenDrag.current !== drag)
                return;
            const dx = moveEvent.clientX - drag.startX;
            const dy = moveEvent.clientY - drag.startY;
            if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4)
                return;
            drag.moved = true;
            const next = clampToken(drag.baseX + dx, drag.baseY + dy);
            drag.lastX = next.x;
            drag.lastY = next.y;
            setToken(next);
        };
        const up = () => {
            cleanup();
            if (tokenDrag.current !== drag)
                return;
            tokenDrag.current = null;
            if (drag.moved) {
                writeTokenPoint({ x: drag.lastX, y: drag.lastY });
                return;
            }
            toggleCollapsed();
        };
        const cancel = () => {
            cleanup();
            if (tokenDrag.current === drag)
                tokenDrag.current = null;
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
    };
    // 窗口缩小时把令牌夹回可视区。
    useEffect(() => {
        const clamp = () => {
            setToken((current) => {
                const next = clampToken(current.x, current.y);
                return next.x === current.x && next.y === current.y ? current : next;
            });
        };
        window.addEventListener('resize', clamp);
        return () => { window.removeEventListener('resize', clamp); };
    }, []);
    const toggleDocked = () => {
        const next = !docked;
        setDocked(next);
        writeBool(DOCKED_KEY, next);
        setSheet(undefined);
    };
    const applySize = (next) => {
        setSize(next);
        writePanelRect({ ...rect, ...next });
    };
    const toggleSheet = (kind) => {
        setSheet(current => (current === kind ? undefined : kind));
    };
    // 自由缩放：浮空与归栏窗口都能拖右下角改大小，尺寸记在 localStorage。
    useEffect(() => {
        if (collapsed)
            return;
        const panel = panelRef.current;
        if (panel === null || typeof ResizeObserver === 'undefined')
            return;
        let timer;
        const observer = new ResizeObserver(() => {
            if (timer !== undefined)
                window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                const bounds = panel.getBoundingClientRect();
                const next = { w: Math.round(bounds.width), h: Math.round(bounds.height) };
                setSize(current => (Math.abs(current.w - next.w) > 1 || Math.abs(current.h - next.h) > 1 ? next : current));
                writePanelRect({ ...latestRect.current, ...next });
            }, 300);
        });
        observer.observe(panel);
        return () => {
            if (timer !== undefined)
                window.clearTimeout(timer);
            observer.disconnect();
        };
    }, [collapsed]);
    if (typeof document === 'undefined')
        return null;
    const panelStyle = {
        transform: docked ? undefined : `translate(${rect.x}px, ${rect.y}px)`,
        width: `${size.w}px`,
        height: `${size.h}px`,
    };
    const renderSheet = () => {
        if (sheet === undefined || sheetAnchor === undefined)
            return null;
        // 尚未开宗时只有面板配置可用；队伍内容要等快照到达后再渲染。
        if (!hasTeam && sheet !== 'settings')
            return null;
        const title = sheet === 'settings' ? t('office.panelConfig')
            : sheet === 'inbox' ? t('workspace.inbox')
                : sheet === 'teams' ? t('office.facility.teams')
                    : sheet === 'board' ? t('workspace.tabBoard')
                        : t('workspace.tabConfig');
        return createPortal((_jsxs("aside", { className: css.sheet, "data-sheet": sheet, style: { left: sheetAnchor.left, bottom: sheetAnchor.bottom, width: sheetAnchor.width }, role: "dialog", "aria-modal": "false", "aria-label": title, children: [_jsxs("header", { className: css.sheetHead, children: [_jsx("span", { className: css.sheetTitle, children: title }), _jsx("button", { type: "button", className: css.sheetClose, onClick: () => { setSheet(undefined); }, "aria-label": t('office.closePanel'), children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheet === 'settings' ? (_jsxs("div", { className: css.settings, children: [_jsx("p", { className: css.settingsHint, children: t('office.panelSizeHint') }), _jsx("div", { className: css.sizeRow, children: Object.keys(PANEL_SIZES).map((id) => {
                                    const preset = PANEL_SIZES[id];
                                    const active = size.w === preset.w && size.h === preset.h;
                                    return (_jsx("button", { type: "button", className: css.sizeChip, "data-active": active || undefined, onClick: () => { applySize(preset); }, children: t(`office.panelSize.${id}`) }, id));
                                }) }), _jsxs("p", { className: css.settingsMeta, children: [size.w, " \u00D7 ", size.h, " px"] }), _jsx("button", { type: "button", className: css.settingsButton, onClick: () => { setRect({ x: 0, y: 0 }); writePanelRect({ x: 0, y: 0, ...size }); }, children: t('office.resetPosition') })] })) : sheet === 'inbox' ? (_jsx("ul", { className: css.inboxList, children: hall.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxRow, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxText, children: message.content })] }, `${index}:${message.from}`))) })) : sheet === 'config' ? (staged && sessionId !== undefined
                        ? _jsx(StagingPlanEditor, { team: hall, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); }, t: t })
                        : _jsx(TeamConfigPanel, { team: hall, t: t })) : (_jsx(TeamSection, { team: hall, t: t, workspace: true, onNavigate: (_parent, child) => { if (sessionId !== undefined)
                            openMember(sessionId, child); }, onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); } })) })] })), document.body);
    };
    const tokenTitle = hasTeam
        ? `${hall.name} · ${done}/${total}`
        : `${hall.name} · ${t('office.hallNoTeam')}`;
    return (_jsxs(_Fragment, { children: [collapsed ? createPortal((
            // 收起：整座洞府缩成一枚可拖动的令牌，点一下展开。
            _jsxs("button", { type: "button", className: css.token, "data-hall-token": true, style: { left: token.x, top: token.y }, onPointerDown: beginTokenDrag, onClick: (event) => { if (event.detail === 0)
                    toggleCollapsed(); }, "aria-label": t('office.expand'), "aria-expanded": false, title: `${t('office.expand')} · ${tokenTitle}`, children: [_jsx("span", { className: css.tokenBody, "aria-hidden": true, children: _jsx("span", { className: css.tokenGlyph, "aria-hidden": true, children: "\u5C71" }) }), _jsx("span", { className: css.tokenTassel, "aria-hidden": true })] })), document.body) : createPortal((_jsxs("section", { ref: panelRef, className: css.window, "data-hall-window": true, "data-docked": docked || undefined, style: panelStyle, "aria-label": t('office.sceneAria', { name: hall.name }), children: [_jsxs("header", { className: css.head, onPointerDown: beginDrag, children: [_jsx("span", { className: css.caret, "aria-hidden": true, children: "\u25BE" }), _jsxs("span", { className: css.title, children: ["\u26E9 ", hall.name] }), _jsx("span", { className: css.meta, children: hasTeam ? `${done}/${total}` : t('office.hallNoTeam') }), _jsx("button", { type: "button", className: css.headButton, "data-control": "hall-collapse", "aria-expanded": true, onClick: toggleCollapsed, children: t('office.collapse') })] }), _jsx("div", { className: css.canvas, children: _jsx(PixelOffice, { team: hall, t: t, enabledActions: hasTeam ? undefined : [], activeAction: sheet === 'settings' ? null : sheet ?? null, onAction: (action) => { toggleSheet(action); }, onOpenMember: (memberId) => { if (sessionId !== undefined)
                                openMember(sessionId, memberId); }, onUnavailable: () => { } }) }), _jsxs("footer", { className: css.floor, children: [_jsxs("button", { type: "button", className: css.portal, "data-control": "hall-dock", "data-mode": docked ? 'docked' : 'floating', onClick: toggleDocked, title: docked ? t('office.dockFloating') : t('office.dockSidebar'), children: [_jsx("span", { className: css.portalGlyph, "aria-hidden": true, children: "\u2725" }), _jsx("span", { children: docked ? t('office.dockFloating') : t('office.dockSidebar') })] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-settings", "data-active": sheet === 'settings' || undefined, onClick: () => { toggleSheet('settings'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2699" }), t('office.panelConfig')] }), hasTeam && (_jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-roster", "data-active": sheet === 'teams' || undefined, onClick: () => { toggleSheet('teams'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2630" }), t('office.roster')] }))] })] })), document.body), renderSheet()] }));
}
