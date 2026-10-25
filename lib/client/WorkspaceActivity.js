import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Native workspace content; discovery remains mounted independently of tab lifetime. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityPanel, TeamSection, historicCardTeam } from "./ActivityPanel.js";
import { StagingPlanEditor } from "./StagingPlanEditor.js";
import { TeamConfigPanel } from "./TeamConfigPanel.js";
import { PixelOffice } from "./pixel-office/PixelOffice.js";
import { OPEN_PANEL_EVENT } from "./AgentTeamsCard.js";
import { currentSessionId } from "./session-navigation.js";
import { getActivityMonitorTargetsSnapshot, getActivitySnapshotsSnapshot, startActivityPolling, subscribeActivityMonitorTargets, subscribeActivitySnapshots, updateActivitySnapshots } from "./activity-monitor.js";
import { createTeamDiscovery } from "./workspace-state.js";
import { LEAD_ART } from "./artwork.js";
import css from './WorkspaceActivity.module.css';
export const TEAM_TAB_KIND = 'agent-teams';
export const TEAM_TAB_ID = 'agent-teams-pixel/activity';
/** Persisted workspace-tab preference: progress board vs setup page. */
const WORKSPACE_VIEW_KEY = 'agent-teams-pixel.workspaceView';
/** Persisted pixel-office collapsed state (bottom bar when closed). */
const OFFICE_OPEN_KEY = 'agent-teams-pixel.officeOpen';
/** Persisted pixel-office pane height (px); unset uses the CSS default. */
const WORKSPACE_OFFICE_HEIGHT_KEY = 'agent-teams-pixel.workspaceOfficeHeight';
const OFFICE_MIN_HEIGHT = 140;
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
                if (added !== undefined && sidebar.mounted.getSnapshot() === current && !sidebar.isExpanded()) {
                    state.select(current, added);
                    sidebar.openTab(TEAM_TAB_KIND);
                }
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
    return null;
}
export function WorkspaceActivity({ sessionId, useTabInfo, t, state, modelDirectories, openMember }) {
    const { tab } = useTabInfo();
    const snapshots = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
    const local = useSyncExternalStore(state.subscribe, state.getSnapshot);
    const [retry, setRetry] = useState(0);
    // Two pages above the fixed pixel office: setup (edit/approve, read the
    // roster and task contracts) and the progress board.
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
    // The office dock sits at the very bottom and can be collapsed to a slim bar.
    const [officeOpen, setOfficeOpen] = useState(() => {
        if (typeof window === 'undefined')
            return true;
        try {
            return window.localStorage.getItem(OFFICE_OPEN_KEY) !== '0';
        }
        catch {
            return true;
        }
    });
    const setOfficeOpenPersist = (next) => {
        setOfficeOpen(next);
        try {
            window.localStorage.setItem(OFFICE_OPEN_KEY, next ? '1' : '0');
        }
        catch { /* private mode */ }
    };
    const containerRef = useRef(null);
    const officePaneRef = useRef(null);
    const dragRef = useRef(null);
    const [officeHeight, setOfficeHeight] = useState(() => {
        if (typeof window === 'undefined')
            return undefined;
        try {
            const raw = Number(window.localStorage.getItem(WORKSPACE_OFFICE_HEIGHT_KEY));
            return Number.isFinite(raw) && raw >= OFFICE_MIN_HEIGHT ? raw : undefined;
        }
        catch {
            return undefined;
        }
    });
    const beginSplit = (event) => {
        const pane = officePaneRef.current;
        const container = containerRef.current;
        if (pane === null || container === null || event.button !== 0)
            return;
        event.preventDefault();
        dragRef.current = { startY: event.clientY, startHeight: pane.getBoundingClientRect().height };
        const move = (moveEvent) => {
            const drag = dragRef.current;
            if (drag === null)
                return;
            const containerHeight = container.getBoundingClientRect().height;
            const next = Math.min(Math.max(180, containerHeight - 180), Math.max(OFFICE_MIN_HEIGHT, drag.startHeight + (drag.startY - moveEvent.clientY)));
            setOfficeHeight(next);
        };
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            dragRef.current = null;
            setOfficeHeight((value) => {
                if (value !== undefined) {
                    try {
                        window.localStorage.setItem(WORKSPACE_OFFICE_HEIGHT_KEY, String(Math.round(value)));
                    }
                    catch { /* private mode */ }
                }
                return value;
            });
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };
    const live = snapshots.teams.filter(team => team.captainSessionId === sessionId);
    const archived = snapshots.archivedTeams.filter(team => team.captainSessionId === sessionId && !live.some(item => item.teamId === team.teamId));
    const historic = [...local.history.values()].filter(team => team.captainSessionId === sessionId
        && !live.some(item => item.teamId === team.teamId) && !archived.some(item => item.teamId === team.teamId))
        .map(team => historicCardTeam(team, sessionId));
    const records = [...live, ...archived, ...historic];
    const selected = records.find(team => team.teamId === local.selected.get(sessionId)) ?? records[0];
    const history = selected !== undefined && !live.includes(selected);
    const status = local.statuses.get(sessionId) ?? 'loading';
    useEffect(() => {
        const onCreated = (event) => {
            const detail = event.detail;
            if (detail?.teamId === undefined)
                return;
            state.select(sessionId, detail.teamId);
            setWorkspaceView('config');
        };
        window.addEventListener('agent-teams:team-created', onCreated);
        return () => { window.removeEventListener('agent-teams:team-created', onCreated); };
    }, [sessionId, state]);
    // Auto page: a freshly staged team opens Setup (review/approve); once the
    // plan is approved and the team starts running, flip to the progress board.
    const lastTeamRef = useRef(undefined);
    const lastPhaseRef = useRef(undefined);
    useEffect(() => {
        if (selected === undefined || !live.includes(selected))
            return;
        if (lastTeamRef.current !== selected.teamId) {
            if (selected.phase === 'staged')
                setWorkspaceView('config');
        }
        else if (lastPhaseRef.current === 'staged' && selected.phase === 'running') {
            setWorkspaceView('board');
        }
        lastTeamRef.current = selected.teamId;
        lastPhaseRef.current = selected.phase;
    }, [selected?.teamId, selected?.phase]);
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
    return (_jsxs("div", { ref: containerRef, className: css.root, "data-agent-teams-workspace": true, "data-session-id": sessionId, children: [_jsxs("div", { className: css.content, children: [_jsxs("header", { className: css.heading, children: [_jsx("img", { src: LEAD_ART, alt: "", "aria-hidden": true }), _jsx("h2", { children: t('app.title') }), _jsx("span", { children: t('workspace.title') }), records.length > 0 && (_jsxs("label", { className: css.teamPicker, children: [_jsx("span", { className: css.teamPickerCaption, children: t('workspace.switchTeam') }), _jsx("select", { className: css.teamPickerSelect, value: selected?.teamId ?? '', "aria-label": t('workspace.switchTeam'), "data-control": "team-picker", onChange: (event) => { state.select(sessionId, event.target.value); }, children: records.map(team => (_jsx("option", { value: team.teamId, children: live.includes(team) ? team.name : `${team.name} · ${t('workspace.history')}` }, team.teamId))) })] })), selected !== undefined && (_jsxs("div", { className: css.viewTabs, role: "tablist", "data-control": "workspace-views", children: [_jsx("button", { type: "button", role: "tab", "aria-selected": view === 'board', "data-view": "board", onClick: () => { setWorkspaceView('board'); }, children: t('workspace.tabBoard') }), _jsx("button", { type: "button", role: "tab", "aria-selected": view === 'config', "data-view": "config", onClick: () => { setWorkspaceView('config'); }, children: t('workspace.tabConfig') })] }))] }), status === 'error' && _jsxs("div", { className: css.error, role: "alert", children: [_jsx("span", { children: t('workspace.error') }), _jsx("button", { onClick: () => setRetry(value => value + 1), children: t('workspace.retry') })] }), selected === undefined ? status === 'loading' ? _jsxs("div", { className: css.skeleton, role: "status", "aria-label": t('workspace.loading'), children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }) : _jsxs("section", { className: css.empty, children: [_jsx("span", { className: css.emptyMark, "aria-hidden": true, children: "\u21B3" }), _jsx("h3", { children: t('workspace.emptyTitle') }), _jsx("p", { children: t('workspace.emptyBody') }), _jsx("button", { onClick: backToChat, children: t('workspace.back') })] }) : (_jsx(_Fragment, { children: view === 'config'
                            ? (live.includes(selected) && selected.phase === 'staged'
                                ? _jsx(StagingPlanEditor, { team: selected, modelDirectory: modelDirectories.directoryFor(sessionId), onContinuePlanning: backToChat, onDiscarded: backToChat, t: t })
                                : _jsx(TeamConfigPanel, { team: selected, t: t }))
                            : (live.includes(selected) && selected.phase === 'staged'
                                ? _jsxs("section", { className: css.stagedNotice, "data-staged-notice": true, children: [_jsx("h3", { children: t('config.stagedTitle') }), _jsx("p", { children: t('config.stagedBody') }), _jsx("button", { type: "button", onClick: () => { setWorkspaceView('config'); }, children: t('config.openConfig') })] })
                                : _jsx(TeamSection, { team: selected, workspace: true, historic: history, modelDirectory: selected.phase === 'staged' ? modelDirectories.directoryFor(sessionId) : undefined, onContinuePlanning: backToChat, onDiscarded: backToChat, onNavigate: openMember, t: t }, `${sessionId}:${selected.teamId}`)) }))] }), selected !== undefined && live.includes(selected) && (officeOpen ? (_jsxs(_Fragment, { children: [_jsx("div", { className: css.splitter, "data-control": "office-splitter", role: "separator", "aria-orientation": "horizontal", "aria-label": t('office.resize'), title: t('office.resize'), onMouseDown: beginSplit }), _jsx("section", { ref: officePaneRef, className: css.officePane, "data-office-pane": true, "aria-label": t('office.title'), style: officeHeight === undefined ? undefined : { height: `${Math.round(officeHeight)}px`, flex: '0 0 auto' }, children: _jsx(PixelOffice, { team: selected, t: t, onCollapse: () => { setOfficeOpenPersist(false); }, onOpenMember: (memberId) => { openMember(selected.captainSessionId, memberId); } }) })] })) : (_jsx("div", { className: css.officeBar, children: _jsxs("button", { type: "button", className: css.officeBarButton, "data-control": "office-expand", "aria-label": t('office.expand'), title: t('office.expand'), onClick: () => { setOfficeOpenPersist(true); }, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('office.expand')] }) })))] }));
}
