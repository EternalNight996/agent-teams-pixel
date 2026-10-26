import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Native workspace content; discovery remains mounted independently of tab lifetime. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { TeamSection, historicCardTeam } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { SectHallOverlay } from "./SectHallOverlay.js";
import { OPEN_HALL_SHEET_EVENT } from "./hall-events.js";
import { OPEN_PANEL_EVENT } from "./AgentTeamsCard.js";
import { currentSessionId } from "./session-navigation.js";
import { TEAM_CREATED_EVENT, shouldRevealTeam } from "./team-reveal.js";
import { getActivityMonitorTargetsSnapshot, getActivitySnapshotsSnapshot, startActivityPolling, subscribeActivityMonitorTargets, subscribeActivitySnapshots, updateActivitySnapshots } from "./activity-monitor.js";
import { createTeamDiscovery } from "./workspace-state.js";
import { ingestCultivation } from "./cultivation-store.js";
import { LEAD_ART } from "./artwork.js";
import css from './WorkspaceActivity.module.css';
export const TEAM_TAB_KIND = 'agent-teams';
export const TEAM_TAB_ID = 'dsh-pixel-team/activity';
/** Persisted history-page preference: progress board vs setup page. */
const WORKSPACE_VIEW_KEY = 'dsh-pixel-team.workspaceView';
/** Floating panel geometry remembered across opens: offset + user-resized size. */
const SHEET_RECT_KEY = 'dsh-pixel-team.sheetRect';
function readSheetRect() {
    if (typeof window === 'undefined')
        return { x: 0, y: 0 };
    try {
        const raw = window.localStorage.getItem(SHEET_RECT_KEY);
        if (raw === null)
            return { x: 0, y: 0 };
        const parsed = JSON.parse(raw);
        return {
            x: typeof parsed.x === 'number' && Number.isFinite(parsed.x) ? parsed.x : 0,
            y: typeof parsed.y === 'number' && Number.isFinite(parsed.y) ? parsed.y : 0,
            w: typeof parsed.w === 'number' && parsed.w > 200 ? parsed.w : undefined,
            h: typeof parsed.h === 'number' && parsed.h > 120 ? parsed.h : undefined,
        };
    }
    catch {
        return { x: 0, y: 0 };
    }
}
function writeSheetRect(rect) {
    try {
        window.localStorage.setItem(SHEET_RECT_KEY, JSON.stringify(rect));
    }
    catch { /* private mode */ }
}
/** Optional host integration is observable so installing/removing it also switches the fallback. */
export function createWorkspaceBridge() {
    let sidebar;
    const listeners = new Set();
    return {
        getSnapshot: () => sidebar,
        subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        set(value) { sidebar = value; for (const listener of listeners)
            listener(); },
    };
}
export function ActivitySurface({ bridge, state, ...props }) {
    const sidebar = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
    // 洞府不再依赖右侧栏服务：右侧栏关闭/被宿主回收时，浮层仍然常驻。
    return _jsx(WorkspaceMonitor, { ...props, sidebar: sidebar, state: state });
}
function WorkspaceMonitor({ sessionsList, sidebar, state, t, openMember, openCaptain, modelDirectories, conversationVisible = true }) {
    const current = currentSessionId(useSyncExternalStore(sessionsList.subscribe, sessionsList.getSnapshot));
    const snapshots = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
    const local = useSyncExternalStore(state.subscribe, state.getSnapshot);
    const sessionTeams = current === undefined ? [] : snapshots.teams.filter(team => team.captainSessionId === current);
    const wanted = current === undefined ? undefined : local.selected.get(current);
    // 修士子会话里没有自己的队伍：按成员会话 id 反查它所属的主队伍，
    // 这样点进子进程也能继续看到主任务的进度，而不是一座空洞府。
    // 全局修为结算：任务完成照常结算；只有当前可见对话的角色才获得挂机修为。
    useEffect(() => {
        ingestCultivation(snapshots.teams, conversationVisible ? current : undefined);
    }, [snapshots, current, conversationVisible]);
    const linkedTeam = current === undefined
        ? undefined
        : [...snapshots.teams, ...snapshots.archivedTeams].find(team => team.members.some(member => member.id === current));
    // 洞府常驻：只要会话里还有队伍，浮层就保持存在——即使队伍 0 任务、
    // 或任务全部已弃（已停止），也不自动收起（用户明确要求）。
    const hallTeam = sessionTeams.find(team => team.teamId === wanted) ?? sessionTeams[0] ?? linkedTeam;
    // 名册页看历史：同一掌门会话下已经归档的宗门。
    const ownerCaptain = hallTeam?.captainSessionId ?? current;
    const historyTeams = ownerCaptain === undefined
        ? []
        : snapshots.archivedTeams.filter(team => team.captainSessionId === ownerCaptain);
    const targets = useSyncExternalStore(subscribeActivityMonitorTargets, getActivityMonitorTargetsSnapshot);
    const currentTargets = useMemo(() => targets.filter(target => target.sessionId === current), [targets, current]);
    // One discovery tracker per visit, outside polling effects restarted by card registration.
    const discover = useMemo(() => createTeamDiscovery(), [current]);
    useEffect(() => {
        if (current === undefined)
            return;
        state.status(current, 'loading');
        const controller = startActivityPolling(currentTargets, {
            discoverySessionId: current,
            onStatus(status) {
                state.status(current, status);
            },
            publishSnapshots(update) {
                updateActivitySnapshots(update);
                if (update.teams === undefined)
                    return;
                const added = discover(update.teams.filter(team => team.captainSessionId === current));
                // Do not replace a file/terminal, or navigate a session whose surface is not bound.
                if (added === undefined)
                    return;
                if (!shouldRevealTeam({
                    source: 'discovered',
                    sessionId: current,
                    onScreenSessionId: sidebar?.mounted.getSnapshot() ?? current,
                    teamId: added,
                    expanded: sidebar?.isExpanded() ?? false,
                }))
                    return;
                state.select(current, added);
            },
        });
        return () => { controller.stop(); };
    }, [current, currentTargets, discover, sidebar, state]);
    useEffect(() => {
        const open = (event) => {
            if (current === undefined)
                return;
            if (sidebar !== undefined && sidebar.mounted.getSnapshot() !== current)
                return;
            const data = event.detail;
            if (data?.captainSessionId && data.captainSessionId !== current)
                return;
            if (data?.teamId)
                state.remember(current, data);
        };
        window.addEventListener(OPEN_PANEL_EVENT, open);
        return () => { window.removeEventListener(OPEN_PANEL_EVENT, open); };
    }, [current, sidebar, state]);
    // The quick-start dialog stages a plan from the conversation header, where the
    // tab's own listener is not mounted. Reveal the tab from this always-mounted
    // monitor so "生成草案" never ends in silence — with the column already open on
    // another page (the discard button closes the tab but keeps the column), the
    // event is the only signal that gets the user to the plan review.
    useEffect(() => {
        const reveal = (event) => {
            if (current === undefined)
                return;
            const teamId = event.detail?.teamId;
            if (teamId === undefined)
                return;
            if (!shouldRevealTeam({
                source: 'created',
                sessionId: current,
                onScreenSessionId: sidebar?.mounted.getSnapshot() ?? current,
                teamId,
                expanded: sidebar?.isExpanded() ?? false,
            }))
                return;
            state.select(current, teamId);
            // 新草案：在浮层里直接打开「藏经阁」内容气泡，策划审阅。
            window.dispatchEvent(new CustomEvent(OPEN_HALL_SHEET_EVENT, { detail: { action: 'config' } }));
        };
        window.addEventListener(TEAM_CREATED_EVENT, reveal);
        return () => { window.removeEventListener(TEAM_CREATED_EVENT, reveal); };
    }, [current, sidebar, state]);
    // 洞府作为窗口级浮层常驻：切到对话/别的页面也在，即使会话里还没有队伍、
    // 甚至宿主暂时没有 current 会话，也保留一座空洞府（只有掌门）。
    return (_jsx(SectHallOverlay, { team: hallTeam, history: historyTeams, t: t, sessionId: current, modelDirectories: modelDirectories, openMember: openMember, openCaptain: openCaptain }));
}
/** The team tab: the sect hall is the page, its wall facilities are the menu. */
export function WorkspaceActivity({ sessionId, useTabInfo, t, state, modelDirectories, openMember }) {
    const { tab } = useTabInfo();
    const snapshots = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
    const local = useSyncExternalStore(state.subscribe, state.getSnapshot);
    const [retry, setRetry] = useState(0);
    // History pages (ended teams have no hall) keep the old board/setup switch.
    const [view, setView] = useState(() => {
        if (typeof window === 'undefined')
            return 'board';
        try {
            return window.localStorage.getItem(WORKSPACE_VIEW_KEY) === 'config' ? 'config' : 'board';
        }
        catch {
            return 'board';
        }
    });
    const setWorkspaceView = (next) => {
        setView(next);
        try {
            window.localStorage.setItem(WORKSPACE_VIEW_KEY, next);
        }
        catch { /* private mode */ }
    };
    // The wall facility whose panel is open. One floating panel at a time keeps the hall visible.
    const [sheet, setSheet] = useState();
    const sheetRef = useRef(null);
    // 悬浮面板：可拖动（拖标题栏）、可拖右下角改大小，位置/大小记在 localStorage。
    const rootRef = useRef(null);
    // 悬浮窗贴住「主内容区」右下角：右侧栏（本插件所在栏）不参与，避免看起来像栏内面板。
    const [sheetRight, setSheetRight] = useState(16);
    useEffect(() => {
        if (sheet === undefined)
            return;
        const measure = () => {
            const root = rootRef.current;
            const paneLeft = root === null ? window.innerWidth : root.getBoundingClientRect().left;
            setSheetRight(Math.max(16, Math.round(window.innerWidth - paneLeft + 16)));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [sheet]);
    const [sheetOffset, setSheetOffset] = useState(() => {
        const rect = readSheetRect();
        return { x: rect.x, y: rect.y };
    });
    const [sheetSize, setSheetSize] = useState(() => {
        const rect = readSheetRect();
        return { w: rect.w, h: rect.h };
    });
    const sheetOffsetRef = useRef(sheetOffset);
    sheetOffsetRef.current = sheetOffset;
    const sheetSizeRef = useRef(sheetSize);
    sheetSizeRef.current = sheetSize;
    const sheetDrag = useRef(null);
    const beginSheetDrag = (event) => {
        if (event.target.closest('button') !== null)
            return;
        const panel = sheetRef.current;
        if (panel === null)
            return;
        event.preventDefault();
        const pr = panel.getBoundingClientRect();
        // The panel floats over the DSH viewport, so bounds are the window, not the tab.
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const relLeft = pr.left;
        const relTop = pr.top;
        const minX = sheetOffset.x + (8 - relLeft);
        const maxX = sheetOffset.x + (viewportWidth - 8 - (relLeft + pr.width));
        const minY = sheetOffset.y + (8 - relTop);
        const maxY = sheetOffset.y + (viewportHeight - 8 - (relTop + pr.height));
        const clampAxis = (low, high, base) => high < low ? [base, base] : [low, high];
        const [clampedMinX, clampedMaxX] = clampAxis(minX, maxX, sheetOffset.x);
        const [clampedMinY, clampedMaxY] = clampAxis(minY, maxY, sheetOffset.y);
        sheetDrag.current = {
            startX: event.clientX,
            startY: event.clientY,
            baseX: sheetOffset.x,
            baseY: sheetOffset.y,
            minX: clampedMinX,
            maxX: clampedMaxX,
            minY: clampedMinY,
            maxY: clampedMaxY,
        };
        const onMove = (moveEvent) => {
            const drag = sheetDrag.current;
            if (drag === null)
                return;
            const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
            setSheetOffset({
                x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), drag.minX, drag.maxX),
                y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), drag.minY, drag.maxY),
            });
        };
        const onUp = () => {
            sheetDrag.current = null;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            writeSheetRect({ ...sheetOffsetRef.current, ...sheetSizeRef.current });
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };
    // 打开时把面板夹回洞府范围内（窗口变小或上次拖到边缘也安全）。
    useEffect(() => {
        if (sheet === undefined)
            return;
        const frame = window.requestAnimationFrame(() => {
            const panel = sheetRef.current;
            if (panel === null)
                return;
            const pr = panel.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            // 兜底：万一记住的几何把面板推到窗口外，直接回到右下角的默认位置。
            const visible = pr.bottom > 0 && pr.top < vh && pr.right > 0 && pr.left < vw;
            if (!visible) {
                setSheetOffset({ x: 0, y: 0 });
                return;
            }
            setSheetOffset((current) => {
                const lowX = current.x + (8 - pr.left);
                const highX = current.x + (vw - 8 - pr.right);
                const lowY = current.y + (8 - pr.top);
                const highY = current.y + (vh - 8 - pr.bottom);
                return {
                    x: highX < lowX ? current.x : Math.min(highX, Math.max(lowX, current.x)),
                    y: highY < lowY ? current.y : Math.min(highY, Math.max(lowY, current.y)),
                };
            });
        });
        return () => { window.cancelAnimationFrame(frame); };
    }, [sheet]);
    // 用户改过大小后记住尺寸（ResizeObserver 去抖，不参与渲染循环）。
    useEffect(() => {
        const panel = sheetRef.current;
        if (sheet === undefined || panel === null || typeof ResizeObserver === 'undefined')
            return;
        let timer;
        const observer = new ResizeObserver(() => {
            if (timer !== undefined)
                window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                const rect = panel.getBoundingClientRect();
                const next = { w: Math.round(rect.width), h: Math.round(rect.height) };
                setSheetSize((current) => (Math.abs((current.w ?? 0) - next.w) > 1 || Math.abs((current.h ?? 0) - next.h) > 1 ? next : current));
                writeSheetRect({ ...sheetOffsetRef.current, ...next });
            }, 400);
        });
        observer.observe(panel);
        return () => {
            if (timer !== undefined)
                window.clearTimeout(timer);
            observer.disconnect();
        };
    }, [sheet]);
    // First visit: one floating line explains what on the wall is clickable.
    useEffect(() => {
        if (sheet === undefined)
            return;
        // Focus the dialog itself (not the ×) so mouse users do not get a heavy
        // focus ring; Tab then reaches the close button like any dialog.
        const frame = window.requestAnimationFrame(() => { sheetRef.current?.focus(); });
        return () => { window.cancelAnimationFrame(frame); };
    }, [sheet]);
    useEffect(() => {
        if (sheet === undefined)
            return;
        const close = (event) => {
            if (event.key === 'Escape')
                setSheet(undefined);
        };
        window.addEventListener('keydown', close);
        return () => { window.removeEventListener('keydown', close); };
    }, [sheet]);
    // 常驻洞府浮层里的墙面设施被点击：在这里打开对应的内容浮窗。
    useEffect(() => {
        const open = (event) => {
            const action = event.detail?.action;
            if (action !== undefined)
                setSheet(action);
        };
        window.addEventListener(OPEN_HALL_SHEET_EVENT, open);
        return () => { window.removeEventListener(OPEN_HALL_SHEET_EVENT, open); };
    }, []);
    const live = snapshots.teams.filter(team => team.captainSessionId === sessionId);
    const archived = snapshots.archivedTeams.filter(team => team.captainSessionId === sessionId && !live.some(item => item.teamId === team.teamId));
    const historic = [...local.history.values()].filter(team => team.captainSessionId === sessionId
        && !live.some(item => item.teamId === team.teamId) && !archived.some(item => item.teamId === team.teamId))
        .map(team => historicCardTeam(team, sessionId));
    const records = [...live, ...archived, ...historic];
    // 子会话（修士进程）没有自己的队伍时，展示它所属主队伍的同一条进度。
    const linked = records.length === 0
        ? [...snapshots.teams, ...snapshots.archivedTeams].find(team => team.members.some(member => member.id === sessionId))
        : undefined;
    const candidates = linked === undefined ? records : [linked];
    const selected = candidates.find(team => team.teamId === local.selected.get(sessionId)) ?? candidates[0];
    const liveSelected = selected !== undefined
        && (live.includes(selected) || snapshots.teams.some(team => team.teamId === selected.teamId));
    const history = selected !== undefined && !liveSelected;
    const status = local.statuses.get(sessionId) ?? 'loading';
    const completedCount = selected === undefined ? 0 : selected.tasks.filter(task => task.status === 'completed').length;
    useEffect(() => {
        const onCreated = (event) => {
            const detail = event.detail;
            if (detail?.teamId === undefined)
                return;
            state.select(sessionId, detail.teamId);
            setSheet('config');
        };
        window.addEventListener(TEAM_CREATED_EVENT, onCreated);
        return () => { window.removeEventListener(TEAM_CREATED_EVENT, onCreated); };
    }, [sessionId, state]);
    // A newly staged plan opens the 藏经阁 sheet (review/approve); once the plan
    // is approved the sheet closes so the hall plus moving cultivators is the view.
    const lastTeamRef = useRef(undefined);
    const lastPhaseRef = useRef(undefined);
    useEffect(() => {
        if (selected === undefined || !liveSelected)
            return;
        if (lastTeamRef.current !== selected.teamId) {
            lastTeamRef.current = selected.teamId;
            setSheet(selected.phase === 'staged' ? 'config' : undefined);
        }
        else if (lastPhaseRef.current === 'staged' && selected.phase === 'running') {
            setSheet(undefined);
        }
        lastPhaseRef.current = selected.phase;
    }, [liveSelected, selected?.teamId, selected?.phase]);
    // Explicit reconnect is bounded and cleaned up; ordinary polling is owned by the monitor.
    useEffect(() => {
        if (retry === 0 || !tab.visible)
            return;
        const controller = startActivityPolling([], { discoverySessionId: sessionId, onStatus: value => state.status(sessionId, value) });
        void controller.firstTick.finally(() => { controller.stop(); });
        return () => { controller.stop(); };
    }, [retry, sessionId, state, tab.visible]);
    const backToChat = () => {
        // Closing this occurrence does not cancel a team or destroy other workspace tabs.
        tab.actions.close();
        requestAnimationFrame(() => document.querySelector('[data-composer-card] [contenteditable="true"][role="textbox"], [data-composer-card] textarea')?.focus());
    };
    const sheetTitle = (kind) => t(kind === 'board' ? 'workspace.tabBoard'
        : kind === 'config' ? 'workspace.tabConfig'
            : kind === 'teams' ? 'workspace.switchTeam'
                : 'workspace.inbox');
    const sheetBody = (kind, team) => {
        if (team === undefined)
            return null;
        if (kind === 'config') {
            return live.includes(team) && team.phase === 'staged'
                ? _jsx(StagingPlanEditor, { team: team, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: backToChat, onDiscarded: backToChat, t: t })
                : _jsx(TeamConfigPanel, { team: team, t: t });
        }
        if (kind === 'board') {
            if (live.includes(team) && team.phase === 'staged') {
                return (_jsxs("section", { className: css.stagedNotice, "data-staged-notice": true, children: [_jsx("h3", { children: t('config.stagedTitle') }), _jsx("p", { children: t('config.stagedBody') }), _jsx("button", { type: "button", onClick: () => { setSheet('config'); }, children: t('config.openConfig') })] }));
            }
            return (_jsx(TeamSection, { team: team, workspace: true, viewingSessionId: sessionId, historic: !live.includes(team), modelDirectory: team.phase === 'staged' ? modelDirectories.directoryFor(sessionId) : undefined, onContinuePlanning: backToChat, onDiscarded: backToChat, onNavigate: openMember, t: t }, `${sessionId}:${team.teamId}`));
        }
        if (kind === 'teams') {
            return (_jsxs("div", { className: css.sheetSection, children: [_jsx("p", { className: css.sheetHint, children: t('office.teamsHint') }), _jsx("ul", { className: css.teamList, children: records.map(team => {
                            const current = selected !== undefined && team.teamId === selected.teamId;
                            const isLive = live.includes(team);
                            const done = team.tasks.filter(task => task.status === 'completed').length;
                            const stateLabel = isLive
                                ? t(team.phase === 'staged'
                                    ? 'captain.state.staged'
                                    : team.halted === true
                                        ? 'team.stopped'
                                        : done === team.tasks.length && team.tasks.length > 0 ? 'team.state.completed' : 'team.state.running')
                                : t('workspace.history');
                            return (_jsx("li", { children: _jsxs("button", { type: "button", className: css.teamRow, "data-current": current || undefined, "aria-current": current ? 'true' : undefined, onClick: () => { state.select(sessionId, team.teamId); setSheet(undefined); }, children: [_jsx("span", { className: css.teamRowName, children: team.name }), _jsx("span", { className: css.teamRowState, children: stateLabel }), _jsx("span", { className: css.teamRowCount, children: t('team.stats.completed', { completed: done, total: team.tasks.length }) })] }) }, team.teamId));
                        }) }), _jsx("button", { type: "button", className: css.sheetBack, onClick: backToChat, children: t('workspace.back') })] }));
        }
        // inbox
        if (team.captainInbox.length === 0) {
            return _jsx("p", { className: css.sheetEmpty, children: t('workspace.inboxEmpty') });
        }
        return (_jsxs("div", { className: css.sheetSection, children: [_jsx("p", { className: css.sheetHint, children: t('office.inboxCount', { count: team.captainInbox.length }) }), _jsx("ul", { className: css.inboxList, children: team.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxRow, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxText, children: message.content })] }, `${index}:${message.from}`))) })] }));
    };
    return (_jsxs("div", { ref: rootRef, className: css.root, "data-agent-teams-workspace": true, "data-session-id": sessionId, children: [selected !== undefined && liveSelected && status === 'error' && (_jsxs("div", { className: css.stageError, role: "alert", children: [_jsx("span", { children: t('workspace.error') }), _jsx("button", { onClick: () => setRetry(value => value + 1), children: t('workspace.retry') })] })), selected === undefined ? (status === 'loading' ? (_jsx("div", { className: css.content, children: _jsxs("div", { className: css.skeleton, role: "status", "aria-label": t('workspace.loading'), children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }) })) : (_jsx("div", { className: css.content, children: _jsxs("section", { className: css.empty, children: [_jsx("span", { className: css.emptyMark, "aria-hidden": true, children: "\u21B3" }), _jsx("h3", { children: t('workspace.emptyTitle') }), _jsx("p", { children: t('workspace.emptyBody') }), _jsx("button", { onClick: backToChat, children: t('workspace.back') })] }) }))) : liveSelected ? (_jsx("div", { className: css.content, "data-workspace-board": true, children: _jsx(TeamSection, { team: selected, t: t, workspace: true, viewingSessionId: sessionId, onNavigate: (_parent, child) => { openMember(selected.captainSessionId, child); }, onContinuePlanning: backToChat, onDiscarded: backToChat }) })) : (_jsxs("div", { className: css.content, children: [_jsxs("header", { className: css.heading, children: [_jsx("img", { src: LEAD_ART, alt: "", "aria-hidden": true }), _jsx("h2", { children: t('app.title') }), _jsx("span", { children: t('workspace.title') }), records.length > 0 && (_jsxs("label", { className: css.teamPicker, children: [_jsx("span", { className: css.teamPickerCaption, children: t('workspace.switchTeam') }), _jsx("select", { className: css.teamPickerSelect, value: selected.teamId, "aria-label": t('workspace.switchTeam'), "data-control": "team-picker", "data-current": history ? undefined : 'true', onChange: (event) => { state.select(sessionId, event.target.value); }, children: records.map(team => (_jsx("option", { value: team.teamId, children: live.includes(team) ? team.name : `${team.name} · ${t('workspace.history')}` }, team.teamId))) })] })), _jsxs("div", { className: css.viewTabs, role: "tablist", "data-control": "workspace-views", children: [_jsx("button", { type: "button", role: "tab", "aria-selected": view === 'board', "data-view": "board", onClick: () => { setWorkspaceView('board'); }, children: t('workspace.tabBoard') }), _jsx("button", { type: "button", role: "tab", "aria-selected": view === 'config', "data-view": "config", onClick: () => { setWorkspaceView('config'); }, children: t('workspace.tabConfig') })] })] }), status === 'error' && _jsxs("div", { className: css.error, role: "alert", children: [_jsx("span", { children: t('workspace.error') }), _jsx("button", { onClick: () => setRetry(value => value + 1), children: t('workspace.retry') })] }), view === 'config'
                        ? (selected.phase === 'staged'
                            ? _jsx(StagingPlanEditor, { team: selected, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: backToChat, onDiscarded: backToChat, t: t })
                            : _jsx(TeamConfigPanel, { team: selected, t: t }))
                        : (selected.phase === 'staged'
                            ? _jsxs("section", { className: css.stagedNotice, "data-staged-notice": true, children: [_jsx("h3", { children: t('config.stagedTitle') }), _jsx("p", { children: t('config.stagedBody') }), _jsx("button", { type: "button", onClick: () => { setWorkspaceView('config'); }, children: t('config.openConfig') })] })
                            : _jsx(TeamSection, { team: selected, historic: history, viewingSessionId: sessionId, onContinuePlanning: backToChat, onDiscarded: backToChat, onNavigate: openMember, t: t }, `${sessionId}:${selected.teamId}`))] })), selected !== undefined && sheet !== undefined && typeof document !== 'undefined' && createPortal((_jsxs("aside", { ref: sheetRef, className: css.sheet, "data-sheet": sheet, role: "dialog", "aria-modal": "false", "aria-label": sheetTitle(sheet), tabIndex: -1, style: {
                    '--sheet-dx': `${sheetOffset.x}px`,
                    '--sheet-dy': `${sheetOffset.y}px`,
                    right: `${sheetRight}px`,
                    ...(sheetSize.w === undefined ? {} : { width: `${sheetSize.w}px` }),
                    ...(sheetSize.h === undefined ? {} : { height: `${sheetSize.h}px` }),
                }, children: [_jsxs("header", { className: css.sheetHead, onPointerDown: beginSheetDrag, children: [_jsx("span", { className: css.sheetGrip, "aria-hidden": true, children: "\u283F" }), _jsx("span", { className: css.sheetTitle, children: sheetTitle(sheet) }), _jsxs("span", { className: css.sheetMeta, children: [selected.name, " \u00B7 ", t('team.stats.completed', { completed: completedCount, total: selected.tasks.length })] }), _jsx("button", { type: "button", className: css.sheetClose, "data-control": "sheet-close", "aria-label": t('office.closePanel'), title: t('office.closePanel'), onClick: () => { setSheet(undefined); }, children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheetBody(sheet, selected) })] })), document.body)] }));
}
