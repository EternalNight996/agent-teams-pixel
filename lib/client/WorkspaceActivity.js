import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Native workspace content; discovery remains mounted independently of tab lifetime. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityPanel, TeamSection, historicCardTeam } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import { OPEN_PANEL_EVENT } from "./AgentTeamsCard.js";
import { currentSessionId } from "./session-navigation.js";
import { TEAM_CREATED_EVENT, shouldRevealTeam } from "./team-reveal.js";
import { getActivityMonitorTargetsSnapshot, getActivitySnapshotsSnapshot, startActivityPolling, subscribeActivityMonitorTargets, subscribeActivitySnapshots, updateActivitySnapshots } from "./activity-monitor.js";
import { createTeamDiscovery } from "./workspace-state.js";
import { LEAD_ART } from "./artwork.js";
import css from './WorkspaceActivity.module.css';
export const TEAM_TAB_KIND = 'agent-teams';
export const TEAM_TAB_ID = 'agent-teams-pixel/activity';
/** Persisted history-page preference: progress board vs setup page. */
const WORKSPACE_VIEW_KEY = 'agent-teams-pixel.workspaceView';
/** One-time coach line pointing at the wall menu (dismissed once, then never again). */
const HALL_GUIDE_KEY = 'agent-teams-pixel.hallGuide';
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
    return sidebar === undefined ? _jsx(ActivityPanel, { ...props }) : _jsx(WorkspaceMonitor, { ...props, sidebar: sidebar, state: state });
}
function WorkspaceMonitor({ sessionsList, sidebar, state }) {
    const current = currentSessionId(useSyncExternalStore(sessionsList.subscribe, sessionsList.getSnapshot));
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
                    onScreenSessionId: sidebar.mounted.getSnapshot(),
                    teamId: added,
                    expanded: sidebar.isExpanded(),
                }))
                    return;
                state.select(current, added);
                sidebar.openTab(TEAM_TAB_KIND);
            },
        });
        return () => { controller.stop(); };
    }, [current, currentTargets, discover, sidebar, state]);
    useEffect(() => {
        const open = (event) => {
            if (current === undefined || sidebar.mounted.getSnapshot() !== current)
                return;
            const data = event.detail;
            if (data?.captainSessionId && data.captainSessionId !== current)
                return;
            if (data?.teamId)
                state.remember(current, data);
            sidebar.openTab(TEAM_TAB_KIND);
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
                onScreenSessionId: sidebar.mounted.getSnapshot(),
                teamId,
                expanded: sidebar.isExpanded(),
            }))
                return;
            state.select(current, teamId);
            sidebar.openTab(TEAM_TAB_KIND);
        };
        window.addEventListener(TEAM_CREATED_EVENT, reveal);
        return () => { window.removeEventListener(TEAM_CREATED_EVENT, reveal); };
    }, [current, sidebar, state]);
    return null;
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
    // 悬浮面板：可拖动（拖标题栏）、可拖右下角改大小，位置只作会话内记忆。
    const [sheetOffset, setSheetOffset] = useState({ x: 0, y: 0 });
    const sheetDrag = useRef(null);
    const beginSheetDrag = (event) => {
        if (event.target.closest('button') !== null)
            return;
        const panel = sheetRef.current;
        const stage = panel?.parentElement;
        if (panel === null || stage === null || stage === undefined)
            return;
        event.preventDefault();
        const pr = panel.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();
        const halfStage = sr.width / 2;
        const minX = Math.min(0, 8 - halfStage + pr.width / 2);
        const maxX = Math.max(0, halfStage - 8 - pr.width / 2);
        sheetDrag.current = {
            startX: event.clientX,
            startY: event.clientY,
            baseX: sheetOffset.x,
            baseY: sheetOffset.y,
            minX,
            maxX,
            minY: 0,
            maxY: Math.max(0, sr.height - 24 - pr.height),
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
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };
    useEffect(() => { setSheetOffset({ x: 0, y: 0 }); }, [sheet]);
    // First visit: one floating line explains what on the wall is clickable.
    const [guide, setGuide] = useState(() => {
        if (typeof window === 'undefined')
            return false;
        try {
            return window.localStorage.getItem(HALL_GUIDE_KEY) !== '1';
        }
        catch {
            return false;
        }
    });
    const dismissGuide = () => {
        setGuide(false);
        try {
            window.localStorage.setItem(HALL_GUIDE_KEY, '1');
        }
        catch { /* private mode */ }
    };
    useEffect(() => {
        if (!guide)
            return;
        const timer = window.setTimeout(dismissGuide, 12000);
        return () => { window.clearTimeout(timer); };
    }, [guide]);
    useEffect(() => {
        if (sheet === undefined)
            return;
        // Focus the dialog itself (not the ×) so mouse users do not get a heavy
        // focus ring; Tab then reaches the close button like any dialog.
        const frame = window.requestAnimationFrame(() => { sheetRef.current?.focus(); });
        return () => { window.cancelAnimationFrame(frame); };
    }, [sheet]);
    // 点击没有会话的修士时给一条短暂提示，而不是跳转到空对话。
    const [officeHint, setOfficeHint] = useState('');
    const officeHintTimer = useRef(undefined);
    const showOfficeHint = (name) => {
        setOfficeHint(name);
        if (officeHintTimer.current !== undefined)
            window.clearTimeout(officeHintTimer.current);
        officeHintTimer.current = window.setTimeout(() => { setOfficeHint(''); }, 2600);
    };
    useEffect(() => () => {
        if (officeHintTimer.current !== undefined)
            window.clearTimeout(officeHintTimer.current);
    }, []);
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
    const live = snapshots.teams.filter(team => team.captainSessionId === sessionId);
    const archived = snapshots.archivedTeams.filter(team => team.captainSessionId === sessionId && !live.some(item => item.teamId === team.teamId));
    const historic = [...local.history.values()].filter(team => team.captainSessionId === sessionId
        && !live.some(item => item.teamId === team.teamId) && !archived.some(item => item.teamId === team.teamId))
        .map(team => historicCardTeam(team, sessionId));
    const records = [...live, ...archived, ...historic];
    const selected = records.find(team => team.teamId === local.selected.get(sessionId)) ?? records[0];
    const liveSelected = selected !== undefined && live.includes(selected);
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
            return (_jsx(TeamSection, { team: team, workspace: true, historic: !live.includes(team), modelDirectory: team.phase === 'staged' ? modelDirectories.directoryFor(sessionId) : undefined, onContinuePlanning: backToChat, onDiscarded: backToChat, onNavigate: openMember, t: t }, `${sessionId}:${team.teamId}`));
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
    return (_jsxs("div", { className: css.root, "data-agent-teams-workspace": true, "data-session-id": sessionId, children: [selected !== undefined && liveSelected && status === 'error' && (_jsxs("div", { className: css.stageError, role: "alert", children: [_jsx("span", { children: t('workspace.error') }), _jsx("button", { onClick: () => setRetry(value => value + 1), children: t('workspace.retry') })] })), selected === undefined ? (status === 'loading' ? (_jsx("div", { className: css.content, children: _jsxs("div", { className: css.skeleton, role: "status", "aria-label": t('workspace.loading'), children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }) })) : (_jsx("div", { className: css.content, children: _jsxs("section", { className: css.empty, children: [_jsx("span", { className: css.emptyMark, "aria-hidden": true, children: "\u21B3" }), _jsx("h3", { children: t('workspace.emptyTitle') }), _jsx("p", { children: t('workspace.emptyBody') }), _jsx("button", { onClick: backToChat, children: t('workspace.back') })] }) }))) : liveSelected ? (_jsxs("section", { className: css.stage, "data-office-stage": true, children: [_jsx(PixelOffice, { team: selected, t: t, activeAction: sheet ?? null, onAction: (action) => { setSheet(action); }, onOpenMember: (memberId) => { openMember(selected.captainSessionId, memberId); }, onUnavailable: showOfficeHint }), _jsx("p", { className: css.hallHint, "data-hall-hint": true, children: t('office.hintShort') }), guide && sheet === undefined && (_jsxs("div", { className: css.hallGuide, role: "note", "data-hall-guide": true, children: [_jsx("span", { children: t('office.guide') }), _jsx("button", { type: "button", onClick: dismissGuide, children: t('office.guideDismiss') })] })), selected.phase === 'staged' && sheet !== 'config' && (_jsxs("div", { className: css.stagedRibbon, "data-staged-ribbon": true, children: [_jsx("span", { children: t('office.awaiting') }), _jsx("button", { type: "button", onClick: () => { setSheet('config'); }, children: t('office.stagedReview') })] })), sheet !== undefined && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.scrim, "aria-label": t('office.closePanel'), tabIndex: -1, onClick: () => { setSheet(undefined); } }), _jsxs("aside", { ref: sheetRef, className: css.sheet, "data-sheet": sheet, role: "dialog", "aria-modal": "false", "aria-label": sheetTitle(sheet), tabIndex: -1, style: { '--sheet-dx': `${sheetOffset.x}px`, '--sheet-dy': `${sheetOffset.y}px` }, children: [_jsxs("header", { className: css.sheetHead, onPointerDown: beginSheetDrag, children: [_jsx("span", { className: css.sheetGrip, "aria-hidden": true, children: "\u283F" }), _jsx("span", { className: css.sheetTitle, children: sheetTitle(sheet) }), _jsxs("span", { className: css.sheetMeta, children: [selected.name, " \u00B7 ", t('team.stats.completed', { completed: completedCount, total: selected.tasks.length })] }), _jsx("button", { type: "button", className: css.sheetClose, "data-control": "sheet-close", "aria-label": t('office.closePanel'), title: t('office.closePanel'), onClick: () => { setSheet(undefined); }, children: "\u00D7" })] }), _jsx("div", { className: css.sheetBody, children: sheetBody(sheet, selected) })] })] })), officeHint !== '' && (_jsx("div", { className: css.officeHint, role: "status", children: t('office.noConversation', { name: officeHint }) }))] })) : (_jsxs("div", { className: css.content, children: [_jsxs("header", { className: css.heading, children: [_jsx("img", { src: LEAD_ART, alt: "", "aria-hidden": true }), _jsx("h2", { children: t('app.title') }), _jsx("span", { children: t('workspace.title') }), records.length > 0 && (_jsxs("label", { className: css.teamPicker, children: [_jsx("span", { className: css.teamPickerCaption, children: t('workspace.switchTeam') }), _jsx("select", { className: css.teamPickerSelect, value: selected.teamId, "aria-label": t('workspace.switchTeam'), "data-control": "team-picker", "data-current": history ? undefined : 'true', onChange: (event) => { state.select(sessionId, event.target.value); }, children: records.map(team => (_jsx("option", { value: team.teamId, children: live.includes(team) ? team.name : `${team.name} · ${t('workspace.history')}` }, team.teamId))) })] })), _jsxs("div", { className: css.viewTabs, role: "tablist", "data-control": "workspace-views", children: [_jsx("button", { type: "button", role: "tab", "aria-selected": view === 'board', "data-view": "board", onClick: () => { setWorkspaceView('board'); }, children: t('workspace.tabBoard') }), _jsx("button", { type: "button", role: "tab", "aria-selected": view === 'config', "data-view": "config", onClick: () => { setWorkspaceView('config'); }, children: t('workspace.tabConfig') })] })] }), status === 'error' && _jsxs("div", { className: css.error, role: "alert", children: [_jsx("span", { children: t('workspace.error') }), _jsx("button", { onClick: () => setRetry(value => value + 1), children: t('workspace.retry') })] }), view === 'config'
                        ? (selected.phase === 'staged'
                            ? _jsx(StagingPlanEditor, { team: selected, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: backToChat, onDiscarded: backToChat, t: t })
                            : _jsx(TeamConfigPanel, { team: selected, t: t }))
                        : (selected.phase === 'staged'
                            ? _jsxs("section", { className: css.stagedNotice, "data-staged-notice": true, children: [_jsx("h3", { children: t('config.stagedTitle') }), _jsx("p", { children: t('config.stagedBody') }), _jsx("button", { type: "button", onClick: () => { setWorkspaceView('config'); }, children: t('config.openConfig') })] })
                            : _jsx(TeamSection, { team: selected, historic: history, onContinuePlanning: backToChat, onDiscarded: backToChat, onNavigate: openMember, t: t }, `${sessionId}:${selected.teamId}`))] }))] }));
}
