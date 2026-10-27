import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起。
 *
 * 由 shell.overlay 的常驻监视器渲染；墙面设施、剑盒、名册等在浮层内部展开
 * （内容气泡贴在面板左侧）。展开时给对话让位，收起成一枚可拖动的令牌。
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TeamSection } from "./ActivityPanel.js";
import { HallInbox } from "./HallInbox.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import { QuickStartWizard } from "./QuickStartDialog.js";
import { CULTIVATION_ITEMS, captainKey, cultivationFromXp, idleXpPer10s, memberKey } from "./cultivation.js";
import { useCultivationVersion, xpOf } from "./cultivation-store.js";
import { OPEN_HALL_SHEET_EVENT } from "./hall-events.js";
import { ASCENSION_RANKS, ASCENSION_STORY, ASCENSION_TIPS, rankAtLevel } from "./immortals.js";
import { realmPaletteForLevel } from "./realm-colors.js";
import { PLUGIN_REPO, buildAgentPrompt, buildIssueUrl, collectDiagnostics } from "./feedback.js";
import { PLUGIN_VERSION } from "./version.js";
import { hallSheetPlacement, hallYieldWidth } from "./hall-geometry.js";
import css from './SectHallOverlay.module.css';
/** 交流群 / 赞助码由宿主插件路由提供（assets/support）。 */
const SUPPORT_BASE = '/plugins/dsh-pixel-team/support';
const supportAsset = (file) => `${SUPPORT_BASE}/${file}`;
/** 复制到剪贴板：Clipboard API 失败时退回 execCommand，保持一次点击能复制。 */
async function copyText(text) {
    if (text === '')
        return false;
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch { /* 落到 execCommand */ }
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
    }
    catch {
        return false;
    }
}
const COLLAPSED_KEY = 'dsh-pixel-team.hallCollapsed';
const PANEL_RECT_KEY = 'dsh-pixel-team.hallRect';
const TOKEN_KEY = 'dsh-pixel-team.hallToken';
/** 名册历史列表里的“当前宗门”哨兵。 */
const CURRENT_TEAM_SENTINEL = '__current__';
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
/** 物品品阶：按解锁等级着色，越晚解锁越贵气（纯展示，不参与数值）。 */
function itemTier(level) {
    if (level >= 2800)
        return 'legendary';
    if (level >= 350)
        return 'epic';
    if (level >= 20)
        return 'rare';
    return 'mortal';
}
/** 面板预设尺寸：初始给大一些。 */
const PANEL_SIZES = {
    compact: { w: 460, h: 380 },
    normal: { w: 620, h: 500 },
    large: { w: 820, h: 640 },
    huge: { w: 1040, h: 760 },
};
export function SectHallOverlay({ team, history = [], t, sessionId, modelDirectories, openMember, openCaptain, }) {
    const [collapsed, setCollapsed] = useState(() => readBool(COLLAPSED_KEY));
    const [sheet, setSheet] = useState();
    // 开宗成功后等新队伍落地，再自动打开道统配置让掌门审核；审核完跳到宗门进度。
    const [pendingReview, setPendingReview] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [historyTeamId, setHistoryTeamId] = useState();
    const [characterId, setCharacterId] = useState();
    const previousSessionRef = useRef(sessionId);
    const [equippedByCharacter, setEquippedByCharacter] = useState({});
    const equipped = characterId === undefined ? {} : (equippedByCharacter[characterId] ?? {});
    useCultivationVersion();
    // 宗门志：页签 + 反馈草稿 + 复制结果提示。
    const [aboutTab, setAboutTab] = useState('sponsor');
    const [feedbackText, setFeedbackText] = useState('');
    const [aboutNotice, setAboutNotice] = useState('');
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
    // 在修士子会话里洞府展示的是主队伍，成员跳转必须用主会话 id 作为 parent。
    const ownerSessionId = (team?.captainSessionId ?? sessionId);
    useEffect(() => {
        if (!pendingReview || !hasTeam)
            return;
        setPendingReview(false);
        setReviewing(true);
        setSheet('config');
    }, [pendingReview, hasTeam]);
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
    // 天机阁打开时，切换修士对话后装备页实时跟随当前角色；仅会话变化时触发。
    useEffect(() => {
        if (sheet !== 'character') {
            previousSessionRef.current = sessionId;
            return;
        }
        if (previousSessionRef.current === sessionId)
            return;
        previousSessionRef.current = sessionId;
        if (sessionId === undefined)
            return;
        if (sessionId === hall.captainSessionId) {
            setCharacterId(hall.captainSessionId);
            return;
        }
        const member = hall.members.find(item => item.id === sessionId);
        if (member !== undefined)
            setCharacterId(member.id || member.name);
    }, [sheet, sessionId, hall.captainSessionId, hall.members]);
    // 点击掌门：回到他所在的主对话（而不是打开一个“成员子会话”）。
    const goHome = () => {
        if (openCaptain !== undefined && hall.captainSessionId !== '')
            openCaptain(hall.captainSessionId);
    };
    // 当前对话框属于谁：掌门主对话还是某位修士的子对话。
    const viewingCaptain = sessionId !== undefined && sessionId === hall.captainSessionId;
    const viewingMember = sessionId === undefined
        ? undefined
        : hall.members.find(member => member.id === sessionId);
    // 新建任务由掌门（主对话）执行：回到主对话并聚焦输入框，用户直接说要建什么。
    const startNewTask = () => {
        setSheet(undefined);
        goHome();
        window.setTimeout(() => {
            document.querySelector('[data-composer-card] [contenteditable="true"][role="textbox"], [data-composer-card] textarea')?.focus();
        }, 160);
    };
    // 天机阁：打开当前角色（或掌门）的装备页。
    const openGear = () => {
        const memberRef = viewingMember === undefined ? undefined : (viewingMember.id || viewingMember.name);
        const target = viewingCaptain ? hall.captainSessionId : memberRef ?? hall.captainSessionId;
        if (target !== '') {
            setCharacterId(target);
            setSheet('character');
        }
    };
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
            // 内容气泡统一贴面板左上角（用户习惯），并留出视口内的高度上限。
            const top = Math.max(8, bounds.top);
            const maxHeight = Math.max(160, window.innerHeight - top - 8);
            setSheetAnchor({ ...hallSheetPlacement(bounds.left, window.innerWidth), top, maxHeight });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [sheet, collapsed, rect, size]);
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
    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeBool(COLLAPSED_KEY, next);
        if (next) {
            // 收起成一枚令牌时，内容气泡也一并收起，避免令牌旁边挂着一块面板。
            setSheet(undefined);
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
    // 关掉“审核道统”这一步时直接去宗门进度，而不是回到空洞府。
    const finishSheet = () => {
        if (reviewing) {
            setReviewing(false);
            setSheet('board');
            return;
        }
        setSheet(undefined);
    };
    const toggleSheet = (kind) => {
        if (sheet === kind) {
            finishSheet();
            return;
        }
        setReviewing(false);
        setSheet(kind);
    };
    // 自由缩放：拖右下角改大小，尺寸记在 localStorage。
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
    // 宗门志里的复制结果：2.4 秒后自动消失。
    const flashAbout = (text) => {
        setAboutNotice(text);
        window.setTimeout(() => setAboutNotice(current => (current === text ? '' : current)), 2400);
    };
    const renderSheet = () => {
        if (sheet === undefined || sheetAnchor === undefined)
            return null;
        // 无队伍时墙面设施 / 名册仍然可点：给出「尚未开宗」的提示与开宗入口。
        const noTeamHint = (_jsxs("div", { className: css.settings, children: [_jsx("p", { className: css.settingsHint, children: t('workspace.emptyTitle') }), _jsx("p", { className: css.settingsMeta, children: t('workspace.emptyBody') }), _jsxs("button", { type: "button", className: css.settingsButton, "data-control": "hall-start", onClick: startSect, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), " ", t('quickstart.entry')] })] }));
        const viewingCurrent = hasTeam && (historyTeamId === undefined || historyTeamId === CURRENT_TEAM_SENTINEL);
        const selectedHistory = history.find(team => team.teamId === historyTeamId);
        const historyTasks = hall.tasks.filter(task => task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled');
        const taskStatusLabel = (status) => status === 'completed'
            ? t('task.status.completed')
            : status === 'failed' ? t('task.status.failed') : t('task.status.cancelled');
        const character = characterId === undefined
            ? undefined
            : characterId === hall.captainSessionId
                ? { id: hall.captainSessionId, name: t('office.captain'), key: captainKey(hall.name), isCaptain: true }
                : (() => {
                    const member = hall.members.find(item => item.id === characterId || item.name === characterId);
                    return member === undefined
                        ? undefined
                        : { id: member.id || member.name, name: member.name, key: memberKey(member.name), isCaptain: false };
                })();
        const characterCultivation = character === undefined ? undefined : cultivationFromXp(xpOf(character.key));
        // 封神榜跟着「当前打开的对话」走：掌门看掌门，修士看修士。
        const viewerKey = viewingCaptain
            ? captainKey(hall.name)
            : viewingMember === undefined ? undefined : memberKey(viewingMember.name);
        const viewerCultivation = viewerKey === undefined ? undefined : cultivationFromXp(xpOf(viewerKey));
        const viewerName = viewingCaptain ? t('office.captain') : viewingMember?.name;
        const viewerRank = viewerCultivation === undefined ? undefined : rankAtLevel(viewerCultivation.level);
        // 封神榜先看「本宗谁在榜上」：按修为从高到低排。
        const roster = !hasTeam
            ? []
            : [
                { key: captainKey(hall.name), name: t('office.captain'), cultivation: cultivationFromXp(xpOf(captainKey(hall.name))) },
                ...hall.members.map(member => ({
                    key: memberKey(member.name),
                    name: member.name,
                    cultivation: cultivationFromXp(xpOf(memberKey(member.name))),
                })),
            ].sort((left, right) => right.cultivation.level - left.cultivation.level
                || right.cultivation.xp - left.cultivation.xp);
        // 宗门志：反馈诊断（只在打开该页时采样）。
        const diagnostics = sheet === 'about' && aboutTab === 'feedback'
            ? collectDiagnostics({
                version: PLUGIN_VERSION,
                team: hasTeam
                    ? {
                        name: hall.name,
                        phase: hall.phase,
                        members: hall.members.length,
                        tasks: {
                            total: hall.tasks.length,
                            done,
                            failed: hall.tasks.filter(task => task.status === 'failed').length,
                            running: hall.tasks.filter(task => task.state === 'running').length,
                        },
                    }
                    : undefined,
            })
            : '';
        const openIssue = () => {
            if (feedbackText.trim() === '') {
                flashAbout(t('about.feedbackNeedText'));
                return;
            }
            const url = buildIssueUrl({ description: feedbackText, diagnostics, version: PLUGIN_VERSION });
            try {
                window.open(url, '_blank', 'noopener');
            }
            catch {
                flashAbout(t('about.feedbackOpenFail'));
            }
        };
        const copyDiagnostics = async () => {
            const ok = await copyText(diagnostics);
            flashAbout(t(ok ? 'about.feedbackCopied' : 'about.feedbackCopyFail'));
        };
        const copyPrompt = async () => {
            const locale = typeof navigator !== 'undefined' && String(navigator.language ?? '').toLowerCase().startsWith('en') ? 'en' : 'zh';
            const ok = await copyText(buildAgentPrompt({ description: feedbackText, diagnostics, locale }));
            flashAbout(t(ok ? 'about.feedbackCopied' : 'about.feedbackCopyFail'));
        };
        const title = sheet === 'settings' ? t('office.panelConfig')
            : sheet === 'start' ? t('quickstart.title')
                : sheet === 'character' ? t('office.equipment')
                    : sheet === 'ranks' ? t('office.ascension')
                        : sheet === 'about' ? t('office.aboutTitle')
                            : sheet === 'inbox' ? t('workspace.inbox')
                                : sheet === 'teams' ? t('office.facility.teams')
                                    : sheet === 'board' ? t('workspace.tabBoard')
                                        : t('workspace.tabConfig');
        return createPortal((_jsxs("aside", { className: css.sheet, "data-sheet": sheet, style: {
                left: sheetAnchor.left,
                top: sheetAnchor.top,
                width: sheetAnchor.width,
                // 所有内容气泡统一与山门洞府同高，窗口更矮时按可用高度封顶。
                height: Math.min(size.h, sheetAnchor.maxHeight),
                maxHeight: sheetAnchor.maxHeight,
                ['--hall-sheet-max']: `${size.h}px`,
            }, role: "dialog", "aria-modal": "false", "aria-label": title, children: [_jsxs("header", { className: css.sheetHead, children: [_jsx("span", { className: css.sheetTitle, children: title }), sheet === 'board' && hasTeam && (_jsxs("button", { type: "button", className: css.sheetAction, onClick: startNewTask, title: t('office.newTaskHint'), children: ["\uFF0B ", t('office.newTask')] })), _jsx("button", { type: "button", className: css.sheetClose, onClick: finishSheet, "aria-label": t('office.closePanel'), children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheet === 'ranks' ? (_jsxs("div", { className: css.ranks, children: [_jsx("p", { className: css.settingsHint, children: t('office.ascensionIntro') }), viewerCultivation !== undefined && viewerName !== undefined && (_jsxs("div", { className: css.rankHero, children: [_jsxs("span", { className: css.rankHeroName, children: [viewerName, " \u00B7 ", _jsxs("span", { style: { color: realmPaletteForLevel(viewerCultivation.level).border }, children: ["Lv.", viewerCultivation.level, " ", t(viewerCultivation.rankKey)] })] }), _jsx("div", { className: css.xpTrack, children: _jsx("span", { style: { width: `${Math.round(viewerCultivation.ratio * 100)}%`, background: realmPaletteForLevel(viewerCultivation.level).bar } }) }), _jsxs("span", { className: css.settingsMeta, children: [viewerCultivation.xp, " / ", viewerCultivation.next, " XP \u00B7 ", t('office.ascensionCurrent')] })] })), roster.length > 0 && (_jsxs(_Fragment, { children: [_jsx("span", { className: css.historyTitle, children: t('office.ascensionSect') }), _jsx("ol", { className: css.rosterList, children: roster.map((entry, index) => (_jsxs("li", { className: css.rosterRow, children: [_jsx("span", { className: css.rosterIndex, children: index + 1 }), _jsx("span", { className: css.rosterName, children: entry.name }), _jsxs("span", { className: css.rosterLevel, style: { color: realmPaletteForLevel(entry.cultivation.level).border }, children: ["Lv.", entry.cultivation.level, " \u00B7 ", t(entry.cultivation.rankKey)] })] }, entry.key))) })] })), _jsx("span", { className: css.historyTitle, children: t('office.ascensionRealmList') }), _jsx("ol", { className: css.rankList, children: ASCENSION_RANKS.map(rank => {
                                    const current = viewerRank?.realm === rank.realm;
                                    return (_jsxs("li", { className: css.rankRow, "data-current": current || undefined, children: [_jsxs("div", { className: css.rankTop, children: [_jsx("span", { className: css.rankName, children: t(rank.realm) }), _jsxs("span", { className: css.rankRange, style: { color: realmPaletteForLevel(rank.levelMin).border }, children: ["Lv.", rank.levelMin, "\u2013", rank.levelMax] }), current && _jsx("span", { className: css.rankCurrent, children: t('office.ascensionYouAre') })] }), _jsx("p", { className: css.rankDesc, children: t(rank.descKey) })] }, rank.realm));
                                }) }), _jsx("span", { className: css.historyTitle, children: t('office.ascensionFast') }), _jsx("ul", { className: css.tips, children: ASCENSION_TIPS.map(key => _jsx("li", { className: css.tip, children: t(key) }, key)) }), _jsx("span", { className: css.historyTitle, children: t('office.ascensionStory') }), _jsx("div", { className: css.story, children: ASCENSION_STORY.map(key => _jsx("p", { children: t(key) }, key)) })] })) : sheet === 'about' ? (_jsxs("div", { className: css.about, children: [_jsx("div", { className: css.aboutTabs, role: "tablist", children: [
                                    ['sponsor', 'about.tab.sponsor'],
                                    ['group', 'about.tab.group'],
                                    ['about', 'about.tab.about'],
                                    ['feedback', 'about.tab.feedback'],
                                ].map(([id, key]) => (_jsx("button", { type: "button", role: "tab", className: css.aboutTab, "data-active": aboutTab === id || undefined, onClick: () => { setAboutTab(id); setAboutNotice(''); }, children: t(key) }, id))) }), aboutTab === 'group' ? (_jsxs("div", { className: css.aboutSection, children: [_jsx("p", { className: css.settingsHint, children: t('about.groupHint') }), _jsxs("figure", { className: css.qrCard, children: [_jsx("img", { src: supportAsset('group-qr.jpg'), alt: t('about.groupCaption'), loading: "lazy" }), _jsx("figcaption", { children: t('about.groupCaption') })] }), _jsx("p", { className: css.settingsHint, children: t('about.groupNote') }), _jsx("p", { className: css.settingsMeta, children: t('about.groupFallback') }), _jsx("div", { className: css.aboutActions, children: _jsxs("a", { className: css.aboutLink, href: PLUGIN_REPO, target: "_blank", rel: "noreferrer", children: ["\u2302 ", t('about.repo'), " \u2197"] }) })] })) : aboutTab === 'sponsor' ? (_jsxs("div", { className: css.aboutSection, children: [_jsx("p", { className: css.settingsHint, children: t('about.sponsorHint') }), _jsxs("div", { className: css.qrGrid, children: [_jsxs("figure", { className: css.qrCard, children: [_jsx("img", { src: supportAsset('wechat-pay.jpg'), alt: t('about.sponsorPay'), loading: "lazy" }), _jsx("figcaption", { children: t('about.sponsorPay') })] }), _jsxs("figure", { className: css.qrCard, children: [_jsx("img", { src: supportAsset('wechat-reward.jpg'), alt: t('about.sponsorReward'), loading: "lazy" }), _jsx("figcaption", { children: t('about.sponsorReward') })] })] }), _jsx("p", { className: css.settingsHint, children: t('about.sponsorNote') }), _jsx("div", { className: css.aboutActions, children: _jsxs("a", { className: css.aboutLink, href: PLUGIN_REPO + '/blob/main/SPONSOR.md', target: "_blank", rel: "noreferrer", children: ["\u2615 ", t('about.sponsorLink'), " \u2197"] }) })] })) : aboutTab === 'about' ? (_jsxs("div", { className: css.aboutSection, children: [_jsx("p", { className: css.settingsHint, children: t('about.intro') }), _jsxs("div", { className: css.aboutMeta, children: [_jsxs("span", { children: [t('about.version'), ": ", PLUGIN_VERSION] }), _jsxs("span", { children: [t('about.author'), ": \u60E0\u5DDE\u5E02\u68A6\u6E38\u79D1\u6280\u6709\u9650\u516C\u53F8"] }), _jsxs("span", { children: [t('about.license'), ": MIT"] })] }), _jsx("p", { className: css.settingsHint, children: t('about.companyNote') }), _jsxs("div", { className: css.aboutActions, children: [_jsxs("a", { className: css.aboutLink, href: PLUGIN_REPO, target: "_blank", rel: "noreferrer", children: ["\u2302 ", t('about.repo'), " \u2197"] }), _jsxs("a", { className: css.aboutLink, href: PLUGIN_REPO + '/issues', target: "_blank", rel: "noreferrer", children: ["\uD83D\uDC1E ", t('about.issues'), " \u2197"] }), _jsxs("a", { className: css.aboutLink, href: PLUGIN_REPO + '/releases', target: "_blank", rel: "noreferrer", children: ["\uD83C\uDFF7 ", t('about.releases'), " \u2197"] })] })] })) : (_jsxs("div", { className: css.aboutSection, children: [_jsx("p", { className: css.settingsHint, children: t('about.feedbackWhy') }), _jsx("textarea", { className: css.feedbackText, value: feedbackText, onChange: (event) => setFeedbackText(event.target.value), placeholder: t('about.feedbackPlaceholder'), rows: 4 }), _jsxs("div", { className: css.feedbackDiagHead, children: [_jsx("span", { children: t('about.feedbackDiag') }), _jsx("button", { type: "button", className: css.sheetAction, onClick: () => { void copyDiagnostics(); }, children: t('about.feedbackCopyDiag') })] }), _jsx("pre", { className: css.feedbackDiag, children: diagnostics }), _jsx("p", { className: css.settingsMeta, children: t('about.feedbackPrivacy') }), _jsxs("div", { className: css.aboutActions, children: [_jsxs("button", { type: "button", className: css.sheetAction, onClick: openIssue, children: ["\uD83D\uDE80 ", t('about.feedbackOpenIssue')] }), _jsxs("button", { type: "button", className: css.sheetAction, onClick: () => { void copyPrompt(); }, children: ["\uD83E\uDD16 ", t('about.feedbackCopyPrompt')] })] }), aboutNotice !== '' && _jsx("p", { className: css.aboutNotice, children: aboutNotice })] }))] })) : sheet === 'settings' ? (_jsxs("div", { className: css.settings, children: [_jsx("p", { className: css.settingsHint, children: t('office.panelSizeHint') }), _jsx("div", { className: css.sizeRow, children: Object.keys(PANEL_SIZES).map((id) => {
                                    const preset = PANEL_SIZES[id];
                                    const active = size.w === preset.w && size.h === preset.h;
                                    return (_jsx("button", { type: "button", className: css.sizeChip, "data-active": active || undefined, onClick: () => { applySize(preset); }, children: t(`office.panelSize.${id}`) }, id));
                                }) }), _jsxs("p", { className: css.settingsMeta, children: [size.w, " \u00D7 ", size.h, " px"] }), _jsx("button", { type: "button", className: css.settingsButton, onClick: () => { setRect({ x: 0, y: 0 }); writePanelRect({ x: 0, y: 0, ...size }); }, children: t('office.resetPosition') })] })) : sheet === 'start' ? (sessionId === undefined
                        ? _jsx("p", { className: css.settingsHint, children: t('workspace.emptyTitle') })
                        : _jsx(QuickStartWizard, { sessionId: sessionId, t: t, onDone: () => { setSheet(undefined); }, onFounded: () => { setPendingReview(true); } })) : sheet === 'character' ? (character === undefined || characterCultivation === undefined ? (_jsx("p", { className: css.settingsHint, children: t('workspace.emptyTitle') })) : (_jsxs("div", { className: css.character, children: [_jsxs("div", { className: css.characterHead, children: [_jsx("span", { className: css.characterName, children: character.name }), _jsxs("span", { className: css.characterLevel, style: { color: realmPaletteForLevel(characterCultivation.level).border }, children: ["Lv.", characterCultivation.level, " ", t(characterCultivation.rankKey)] })] }), _jsx("div", { className: css.xpTrack, children: _jsx("span", { style: { width: `${Math.round(characterCultivation.ratio * 100)}%`, background: realmPaletteForLevel(characterCultivation.level).bar } }) }), _jsxs("p", { className: css.settingsMeta, children: [characterCultivation.xp, " / ", characterCultivation.next, " XP"] }), _jsx("p", { className: css.settingsMeta, children: t('office.levelEarnHint') }), _jsx("p", { className: css.settingsMeta, children: t('office.equipLiveHint') }), _jsx("p", { className: css.settingsMeta, children: t('office.idleGain', { xp: idleXpPer10s(characterCultivation.level) }) }), [
                                { kind: 'weapon', title: t('office.weapon'), hint: undefined },
                                { kind: 'mount', title: t('office.mounts'), hint: t('office.mountHint') },
                                { kind: 'skill', title: t('office.skills'), hint: undefined },
                            ].map(section => {
                                const items = CULTIVATION_ITEMS.filter(item => item.kind === section.kind);
                                const unlocked = items.filter(item => characterCultivation.level >= item.level).length;
                                // 未选坐骑时默认步行：装备栏要如实反映场景里的形态。
                                const equippedMount = equipped.mount ?? 'mount-walk';
                                return (_jsxs("section", { className: css.inventorySection, "data-kind": section.kind, children: [_jsxs("header", { className: css.sectionHead, children: [_jsx("span", { className: css.historyTitle, children: section.title }), _jsxs("span", { className: css.sectionCount, children: [unlocked, "/", items.length] })] }), section.hint !== undefined && _jsx("p", { className: css.sectionHint, children: section.hint }), _jsx("div", { className: css.inventory, children: items.map(item => {
                                                const locked = characterCultivation.level < item.level;
                                                const isEquipped = section.kind === 'mount'
                                                    ? equippedMount === item.id
                                                    : equipped[item.kind] === item.id;
                                                return (_jsxs("button", { type: "button", className: css.item, "data-kind": item.kind, "data-tier": itemTier(item.level), "data-locked": locked || undefined, "data-equipped": isEquipped || undefined, disabled: locked, "aria-pressed": isEquipped, title: `${t(item.key)} · Lv.${item.level}`, onClick: () => {
                                                        if (locked)
                                                            return;
                                                        setEquippedByCharacter(current => ({
                                                            ...current,
                                                            [character.id]: { ...current[character.id], [item.kind]: item.id },
                                                        }));
                                                        const label = t(item.key);
                                                        if (item.kind === 'mount') {
                                                            window.dispatchEvent(new CustomEvent('agent-teams:mount', {
                                                                detail: { id: character.id, form: item.form ?? 'off', mountId: item.id, label },
                                                            }));
                                                        }
                                                        else {
                                                            window.dispatchEvent(new CustomEvent('agent-teams:equip', {
                                                                detail: { id: character.id, kind: item.kind, tier: item.level, itemId: item.id, label },
                                                            }));
                                                        }
                                                    }, children: [_jsx("span", { className: css.itemIcon, "aria-hidden": true, children: item.icon }), _jsx("span", { className: css.itemName, children: t(item.key) }), _jsxs("span", { className: css.itemFoot, children: [_jsxs("span", { className: css.itemLevel, children: ["Lv.", item.level] }), locked
                                                                    ? _jsx("span", { className: css.itemBadge, "data-tone": "locked", children: t('office.locked') })
                                                                    : isEquipped ? _jsx("span", { className: css.itemBadge, children: t('office.equipped') }) : null] })] }, item.id));
                                            }) })] }, section.kind));
                            })] }))) : sheet === 'inbox' ? (_jsx(HallInbox, { messages: hall.captainInbox, t: t })) : sheet === 'config' ? (!hasTeam
                        ? noTeamHint
                        : staged && sessionId !== undefined
                            ? _jsx(StagingPlanEditor, { team: hall, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); }, t: t })
                            : _jsx(TeamConfigPanel, { team: hall, t: t })) : sheet === 'teams' ? (_jsxs("div", { className: css.history, children: [_jsxs("button", { type: "button", className: css.historyStart, onClick: startSect, title: t('quickstart.entryTitle'), children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('quickstart.entry')] }), !hasTeam && history.length === 0 && historyTasks.length === 0 && (_jsx("p", { className: css.settingsHint, children: t('office.historyEmpty') })), (hasTeam || history.length > 0) && (_jsxs("div", { className: css.historyBlock, children: [_jsx("span", { className: css.historyTitle, children: t('office.historyTeams') }), _jsxs("div", { className: css.historyList, children: [hasTeam && (_jsxs("button", { type: "button", className: css.historyItem, "data-current": "true", "data-active": viewingCurrent || undefined, onClick: () => { setHistoryTeamId(CURRENT_TEAM_SENTINEL); }, children: [_jsxs("span", { className: css.historyName, children: [_jsx("span", { className: css.historyCurrentDot, "aria-hidden": true }), hall.name, _jsx("span", { className: css.historyCurrentBadge, children: t('office.historyCurrent') })] }), _jsxs("span", { className: css.historyMeta, children: [done, "/", total, " \u00B7 ", t('team.stats.members', { count: hall.members.length })] })] })), history.map(team => {
                                                const done = team.tasks.filter(task => task.status === 'completed').length;
                                                return (_jsxs("button", { type: "button", className: css.historyItem, "data-active": !viewingCurrent && selectedHistory?.teamId === team.teamId || undefined, onClick: () => { setHistoryTeamId(team.teamId); }, children: [_jsxs("span", { className: css.historyName, children: [_jsx("span", { className: css.historyPastDot, "aria-hidden": true }), team.name, _jsx("span", { className: css.historyPastBadge, children: t('office.historyPast') })] }), _jsxs("span", { className: css.historyMeta, children: [done, "/", team.tasks.length, " \u00B7 ", t('team.stats.members', { count: team.members.length })] })] }, team.teamId));
                                            })] }), selectedHistory !== undefined ? (_jsx("div", { className: css.historyDetail, children: _jsx(TeamSection, { team: selectedHistory, t: t, historic: true, workspace: true, onOpenCaptain: openCaptain === undefined ? undefined : () => { openCaptain(selectedHistory.captainSessionId); }, onNavigate: (_parent, child) => { if (ownerSessionId !== undefined)
                                                openMember(ownerSessionId, child); } }) })) : null] })), historyTasks.length > 0 && (_jsxs("div", { className: css.historyBlock, children: [_jsx("span", { className: css.historyTitle, children: t('office.taskHistory') }), _jsx("ul", { className: css.historyTasks, children: historyTasks.map(task => (_jsxs("li", { className: css.historyTask, children: [_jsx("span", { className: css.historyTaskId, children: task.id }), _jsx("span", { className: css.historyTaskSubject, title: task.subject, children: task.subject }), _jsx("span", { className: css.historyTaskWho, children: task.assignee || '—' }), _jsx("span", { className: css.historyTaskState, "data-state": task.state, children: taskStatusLabel(task.status) })] }, task.id))) })] }))] })) : (!hasTeam
                        ? noTeamHint
                        : (_jsx(TeamSection, { team: hall, t: t, workspace: true, onOpenCaptain: goHome, viewingSessionId: sessionId, onNavigate: (_parent, child) => { if (ownerSessionId !== undefined)
                                openMember(ownerSessionId, child); }, onContinuePlanning: () => { setSheet(undefined); }, onDiscarded: () => { setSheet(undefined); } }))) })] })), document.body);
    };
    const tokenTitle = hasTeam
        ? `${hall.name} · ${done}/${total}`
        : `${hall.name} · ${t('office.hallNoTeam')}`;
    return (_jsxs(_Fragment, { children: [collapsed ? createPortal((
            // 收起：整座洞府缩成一枚可拖动的令牌，点一下展开。
            _jsx("button", { type: "button", className: css.token, "data-hall-token": true, style: { left: tokenAt.x, top: tokenAt.y, width: tokenSize.w, height: tokenSize.h }, onPointerDown: beginTokenDrag, onClick: (event) => { if (event.detail === 0)
                    toggleCollapsed(); }, "aria-label": t('office.expand'), "aria-expanded": false, title: `${t('office.expand')} · ${tokenTitle}`, children: _jsxs("span", { className: css.tokenInner, style: { transform: `scale(${tokenScale})` }, "aria-hidden": true, children: [_jsx("span", { className: css.tokenBody, children: _jsx("span", { className: css.tokenGlyph, "aria-hidden": true, children: "\u5C71" }) }), _jsx("span", { className: css.tokenTassel, "aria-hidden": true })] }) })), document.body) : createPortal((_jsxs("section", { ref: panelRef, className: css.window, "data-hall-window": true, style: panelStyle, "aria-label": t('office.sceneAria', { name: hall.name }), children: [_jsxs("header", { className: css.head, onPointerDown: beginDrag, children: [_jsx("span", { className: css.caret, "aria-hidden": true, children: "\u25BE" }), _jsxs("span", { className: css.title, children: ["\u26E9 ", hall.name] }), _jsx("span", { className: css.meta, children: hasTeam ? `${done}/${total}` : t('office.hallNoTeam') }), hasTeam && (viewingCaptain || viewingMember !== undefined) && (_jsx("button", { type: "button", className: css.viewer, "data-kind": viewingCaptain ? 'captain' : 'member', title: t('office.equipment'), onClick: () => {
                                    const id = viewingCaptain ? hall.captainSessionId : (viewingMember?.id || viewingMember?.name);
                                    if (id !== undefined && id !== '') {
                                        setCharacterId(id);
                                        setSheet('character');
                                    }
                                }, children: viewingCaptain
                                    ? `👑 ${t('office.viewingCaptain')}`
                                    : `◈ ${t('office.viewingMember', { name: viewingMember?.name ?? '' })}` })), _jsx("button", { type: "button", className: css.headButton, "data-control": "hall-collapse", "aria-expanded": true, onClick: toggleCollapsed, children: t('office.collapse') })] }), _jsx("div", { className: css.canvas, children: _jsx(PixelOffice, { team: hall, t: t, activeAction: sheet === 'character' ? 'gear'
                                : sheet === 'settings' || sheet === 'start' ? null
                                    : sheet ?? null, onAction: (action) => {
                                // 无队伍时山门就是开宗入口（与底部「开宗」双向对应）；有队伍时开名册。
                                if (action === 'teams' && !hasTeam) {
                                    startSect();
                                    return;
                                }
                                if (action === 'gear') {
                                    openGear();
                                    return;
                                }
                                toggleSheet(action);
                            }, onOpenMember: (memberId) => { if (ownerSessionId !== undefined)
                                openMember(ownerSessionId, memberId); }, onOpenCaptain: goHome, onOpenCharacter: (memberId) => { setCharacterId(memberId); setSheet('character'); }, viewingSessionId: sessionId, onUnavailable: () => { }, onSettings: () => { toggleSheet('settings'); }, settingsOpen: sheet === 'settings', teamless: !hasTeam }) }), _jsxs("footer", { className: css.floor, children: [!hasTeam && (_jsxs("button", { type: "button", className: `${css.floorButton} ${css.startButton}`, "data-control": "hall-start", onClick: startSect, title: t('quickstart.entryTitle'), children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('quickstart.entry')] })), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-doctrine", "data-active": sheet === 'config' || undefined, onClick: () => { toggleSheet('config'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u7ECF" }), t('office.floorDoctrine')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-progress", "data-active": sheet === 'board' || undefined, onClick: () => { toggleSheet('board'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u7891" }), t('office.floorProgress')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-ranks", "data-active": sheet === 'ranks' || undefined, onClick: () => { toggleSheet('ranks'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u699C" }), t('office.floorRanks')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-roster", "data-active": sheet === 'teams' || undefined, onClick: () => { toggleSheet('teams'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u5C71" }), t('office.roster')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-about", "data-active": sheet === 'about' || undefined, onClick: () => { toggleSheet('about'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u5FD7" }), t('office.floorAbout')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-gear", "data-active": sheet === 'character' || undefined, onClick: openGear, children: [_jsx("span", { "aria-hidden": true, children: "\u9601" }), t('office.floorGear')] }), _jsxs("button", { type: "button", className: css.floorButton, "data-control": "hall-settings", "data-active": sheet === 'settings' || undefined, onClick: () => { toggleSheet('settings'); }, children: [_jsx("span", { "aria-hidden": true, children: "\u2699" }), t('office.floorSettings')] })] })] })), document.body), renderSheet()] }));
}
