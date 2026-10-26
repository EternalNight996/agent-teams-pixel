import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
 *
 * 由 shell.overlay 的常驻监视器渲染；墙面设施、剑盒、名册等在浮层内部展开
 * （内容气泡贴在面板左侧）。展开时像右侧栏一样给对话让位；收起成一枚可拖动的
 * 令牌；「归栏」收起浮层并在右侧栏打开洞府页面。
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TeamSection } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import { QuickStartWizard } from "./QuickStartDialog.js";
import { OPEN_HALL_SHEET_EVENT } from "./hall-events.js";
import { hallSheetPlacement, hallYieldWidth } from "./hall-geometry.js";
import css from './SectHallOverlay.module.css';
const COLLAPSED_KEY = 'agent-teams-pixel.hallCollapsed';
const DOCKED_KEY = 'agent-teams-pixel.hallDocked';
const PANEL_RECT_KEY = 'agent-teams-pixel.hallRect';
const TOKEN_KEY = 'agent-teams-pixel.hallToken';
/** 展开的面板给对话让位：写在 html 上的属性与位移变量（与右侧栏同一手法）。 */
const HALL_OPEN_ATTRIBUTE = 'data-agent-teams-hall-open';
const HALL_SHIFT_PROPERTY = '--agent-teams-hall-shift';
/** 收起后的令牌基准尺寸（标准面板），实际按面板大小缩放。 */
const TOKEN_SIZE = { w: 38, h: 68 };
/** 把令牌夹在窗口内；留 8px 边缘，拖不出屏。 */
function clampToken(x, y, w, h) {
    const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
    return {
        x: Math.max(8, Math.min(x, vw - w - 8)),
        y: Math.max(8, Math.min(y, vh - h - 8)),
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
                return clampToken(parsed.x, parsed.y, TOKEN_SIZE.w, TOKEN_SIZE.h);
            }
        }
    }
    catch { /* private mode */ }
    // 默认停在右下角：与展开面板同一处，收起时不跳。
    return clampToken(window.innerWidth - TOKEN_SIZE.w - 16, window.innerHeight - TOKEN_SIZE.h - 16, TOKEN_SIZE.w, TOKEN_SIZE.h);
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
/** 面板预设尺寸：初始给大一些。 */
const PANEL_SIZES = {
    compact: { w: 460, h: 380 },
    normal: { w: 620, h: 500 },
    large: { w: 820, h: 640 },
    huge: { w: 1040, h: 760 },
};
export function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember, sidebar, tabKind, }) {
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
    // 令牌随面板配置缩放：标准 620×500 = 1.0，超大面板最多 1.8 倍。
    const tokenScale = Math.min(1.8, Math.max(0.8, size.h / PANEL_SIZES.normal.h));
    const tokenSize = {
        w: Math.round(TOKEN_SIZE.w * tokenScale),
        h: Math.round(TOKEN_SIZE.h * tokenScale),
    };
    const tokenAt = clampToken(token.x, token.y, tokenSize.w, tokenSize.h);
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
        if (panel === null)
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
    // 右侧栏里洞府页面的开关（宿主没有注册页面类型时安静降级）。
    const openSidebarPage = () => {
        if (sidebar === undefined || tabKind === undefined)
            return;
        try {
            sidebar.openTab(tabKind);
        }
        catch { /* 页面类型未注册：只保留令牌 */ }
    };
    const closeSidebarPage = () => {
        if (sidebar === undefined || tabKind === undefined || sessionId === undefined)
            return;
        const withTabs = sidebar;
        const page = (withTabs.tabsIn?.(sessionId) ?? []).find((tab) => tab.kind === tabKind);
        if (page === undefined)
            return;
        try {
            sidebar.close(page.id);
        }
        catch { /* 已经关掉 */ }
    };
    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeBool(COLLAPSED_KEY, next);
        if (next) {
            // 收起成一枚令牌时，内容气泡也一并收起，避免令牌旁边挂着一块面板。
            setSheet(undefined);
            return;
        }
        // 展开即回到浮空：退出归栏，并关掉右侧栏里的洞府页面。
        if (docked) {
            setDocked(false);
            writeBool(DOCKED_KEY, false);
            closeSidebarPage();
        }
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
            baseX: tokenAt.x,
            baseY: tokenAt.y,
            lastX: tokenAt.x,
            lastY: tokenAt.y,
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
            const next = clampToken(drag.baseX + dx, drag.baseY + dy, tokenSize.w, tokenSize.h);
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
    // 面板尺寸变化 → 令牌跟着变大/变小，并夹回可视区。
    useEffect(() => {
        setToken((current) => {
            const next = clampToken(current.x, current.y, tokenSize.w, tokenSize.h);
            return next.x === current.x && next.y === current.y ? current : next;
        });
    }, [tokenSize.w, tokenSize.h]);
    // 归栏：收起成令牌 + 在右侧栏打开洞府页面。
    const dockToSidebar = () => {
        setDocked(true);
        writeBool(DOCKED_KEY, true);
        setCollapsed(true);
        writeBool(COLLAPSED_KEY, true);
        setSheet(undefined);
        openSidebarPage();
    };
    // 展开的洞府像右侧栏一样让对话内容向左收，避免被面板盖住。
    useEffect(() => {
        const root = document.documentElement;
        const apply = () => {
            if (collapsed) {
                root.removeAttribute(HALL_OPEN_ATTRIBUTE);
                root.style.removeProperty(HALL_SHIFT_PROPERTY);
                return;
            }
            const vw = window.innerWidth;
            // 让位宽度 = 洞府宽度的 2/3；窄窗口至少给对话留 360px。
            const shift = hallYieldWidth(size.w, vw);
            root.setAttribute(HALL_OPEN_ATTRIBUTE, '');
            root.style.setProperty(HALL_SHIFT_PROPERTY, `${shift}px`);
        };
        apply();
        window.addEventListener('resize', apply);
        return () => {
            window.removeEventListener('resize', apply);
            root.removeAttribute(HALL_OPEN_ATTRIBUTE);
            root.style.removeProperty(HALL_SHIFT_PROPERTY);
        };
    }, [collapsed, size.w]);
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
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: `${size.w}px`,
        height: `${size.h}px`,
    };
    // 开宗：和功德碑/进度一样在面板左侧的内容气泡里展示，不弹独立窗口。
    const startSect = () => {
        setSheet(current => current === 'start' ? undefined : 'start');
    };
    const renderSheet = () => {
        if (sheet === undefined || sheetAnchor === undefined)
            return null;
        // 无队伍时墙面设施 / 名册仍然可点：给出「尚未开宗」的提示与开宗入口。
        const noTeamHint = (_jsxs("div", { className: css.settings, children: [_jsx("p", { className: css.settingsHint, children: t('workspace.emptyTitle') }), _jsx("p", { className: css.settingsMeta, children: t('workspace.emptyBody') }), _jsxs("button", { type: "button", className: css.settingsButton, "data-control": "hall-start", onClick: startSect, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), " ", t('quickstart.entry')] })] }));
        const title = sheet === 'settings' ? t('office.panelConfig')
            : sheet === 'start' ? t('quickstart.title')
                : sheet === 'inbox' ? t('workspace.inbox')
                    : sheet === 'teams' ? t('office.facility.teams')
                        : sheet === 'board' ? t('workspace.tabBoard')
                            : t('workspace.tabConfig');
        return createPortal((_jsxs("aside", { className: css.sheet, "data-sheet": sheet, style: { left: sheetAnchor.left, bottom: sheetAnchor.bottom, width: sheetAnchor.width, height: size.h }, role: "dialog", "aria-modal": "false", "aria-label": title, children: [_jsxs("header", { className: css.sheetHead, children: [_jsx("span", { className: css.sheetTitle, children: title }), _jsx("button", { type: "button", className: css.sheetClose, onClick: () => { setSheet(undefined); }, "aria-label": t('office.closePanel'), children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheet === 'settings' ? (_jsxs("div", { className: css.settings, children: [_jsx("p", { className: css.settingsHint, children: t('office.panelSizeHint') }), _jsx("div", { className: css.sizeRow, children: Object.keys(PANEL_SIZES).map((id) => {
                                    const preset = PANEL_SIZES[id];
                                    const active = size.w === preset.w && size.h === preset.h;
                                    return (_jsx("button", { type: "button", className: css.sizeChip, "data-active": active || undefined, onClick: () => { applySize(preset); }, children: t(`office.panelSize.${id}`) }, id));
                                }) }), _jsxs("p", { className: css.settingsMeta, children: [size.w, " \u00D7 ", size.h, " px"] }), _jsx("button", { type: "button", className: css.settingsButton, onClick: () => { setRect({ x: 0, y: 0 }); writePanelRect({ x: 0, y: 0, ...size }); }, children: t('office.resetPosition') })] })) : sheet === 'start' ? (sessionId === undefined
                        ? _jsx("p", { className: css.settingsHint, children: t('workspace.emptyTitle') })
                        : _jsx(QuickStartWizard, { sessionId: sessionId, t: t, onDone: () => { setSheet(undefined); } })) : sheet === 'inbox' ? (hall.captainInbox.length === 0
                        ? _jsx("p", { className: css.settingsHint, children: t('workspace.inboxEmpty') })
                        : (_jsx("ul", { className: css.inboxList, children: hall.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxRow, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxText, children: message.content })] }, `${index}:${message.from}`))) }))) : sheet === 'config' ? (!hasTeam
                        ? noTeamHint
                        : staged && sessionId !== undefined
                            ? _jsx(StagingPlanEditor, { team: hall, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); }, t: t })
                            : _jsx(TeamConfigPanel, { team: hall, t: t })) : (!hasTeam
                        ? noTeamHint
                        : (_jsx(TeamSection, { team: hall, t: t, workspace: true, onNavigate: (_parent, child) => { if (sessionId !== undefined)
                                openMember(sessionId, child); }, onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); } }))) })] })), document.body);
    };
    const tokenTitle = hasTeam
        ? `${hall.name} · ${done}/${total}`
        : `${hall.name} · ${t('office.hallNoTeam')}`;
    return (_jsxs(_Fragment, { children: [collapsed ? createPortal((
            // 收起：整座洞府缩成一枚可拖动的令牌，点一下展开。
            _jsx("button", { type: "button", className: css.token, "data-hall-token": true, style: { left: tokenAt.x, top: tokenAt.y, width: tokenSize.w, height: tokenSize.h }, onPointerDown: beginTokenDrag, onClick: (event) => { if (event.detail === 0)
                    toggleCollapsed(); }, "aria-label": t('office.expand'), "aria-expanded": false, title: `${t('office.expand')} · ${tokenTitle}`, children: _jsxs("span", { className: css.tokenInner, style: { transform: `scale(${tokenScale})` }, "aria-hidden": true, children: [_jsx("span", { className: css.tokenBody, children: _jsx("span", { className: css.tokenGlyph, "aria-hidden": true, children: "\u5C71" }) }), _jsx("span", { className: css.tokenTassel, "aria-hidden": true })] }) })), document.body) : createPortal((_jsxs("section", { ref: panelRef, className: css.window, "data-hall-window": true, style: panelStyle, "aria-label": t('office.sceneAria', { name: hall.name }), children: [_jsxs("header", { className: css.head, onPointerDown: beginDrag, children: [_jsx("span", { className: css.caret, "aria-hidden": true, children: "\u25BE" }), _jsxs("span", { className: css.title, children: ["\u26E9 ", hall.name] }), _jsx("span", { className: css.meta, children: hasTeam ? `${done}/${total}` : t('office.hallNoTeam') }), _jsx("button", { type: "button", className: css.headButton, "data-control": "hall-collapse", "aria-expanded": true, onClick: toggleCollapsed, children: t('office.collapse') })] }), _jsx("div", { className: css.canvas, children: _jsx(PixelOffice, { team: hall, t: t, activeAction: sheet === 'settings' || sheet === 'start' ? null : sheet ?? null, onAction: (action) => {
                                // 无队伍时山门就是开宗入口（与底部「开宗」双向对应）；有队伍时开名册。
                                if (action === 'teams' && !hasTeam) {
                                    startSect();
                                    return;
                                }
                                toggleSheet(action);
                            }, onOpenMember: (memberId) => { if (sessionId !== undefined)
                                openMember(sessionId, memberId); }, onUnavailable: () => { }, onDock: dockToSidebar, onSettings: () => { toggleSheet('settings'); }, settingsOpen: sheet === 'settings', teamless: !hasTeam }) }), _jsxs("footer", { className: css.floor, children: [!hasTeam && (_jsxs("button", { type: "button", className: `${css.floorButton} ${css.startButton}`, "data-control": "hall-start", onClick: startSect, title: t('quickstart.entryTitle'), children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('quickstart.entry')] })), _jsxs("button", { type: "button", className: css.portal, "data-control": "hall-dock", onClick: dockToSidebar, title: t('office.dockSidebar'), children: [_jsx("span", { className: css.portalGlyph, "aria-hidden": true, children: "\u2725" }), _jsx("span", { children: t('office.dockSidebar') })] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-roster", "data-active": sheet === 'teams' || undefined, onClick: () => { toggleSheet('teams'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u5C71" }), t('office.roster')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-doctrine", "data-active": sheet === 'config' || undefined, onClick: () => { toggleSheet('config'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u7ECF" }), t('office.floorDoctrine')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-progress", "data-active": sheet === 'board' || undefined, onClick: () => { toggleSheet('board'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u7891" }), t('office.floorProgress')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-inbox", "data-active": sheet === 'inbox' || undefined, onClick: () => { toggleSheet('inbox'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u4FE1" }), t('office.floorInbox')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-settings", "data-active": sheet === 'settings' || undefined, onClick: () => { toggleSheet('settings'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2699" }), t('office.floorSettings')] })] })] })), document.body), renderSheet()] }));
}
