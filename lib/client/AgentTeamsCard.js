import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AgentTeams conversation card: the lightweight in-conversation summary for
 * one team — the captain's portrait and name, the member roster as
 * clickable 道途 portraits (opening the member's subagent transcript), and
 * an "activity panel" button that re-activates the top-right floater.
 *
 * The floater and this card share the `agent-teams:open-panel` window event
 * so the card can summon the panel even after it was closed (or when an old
 * session is re-opened for review).
 * @module dsh-agent-teams/client/card
 */
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { getActivitySnapshotsSnapshot, monitorAgentTeam, subscribeActivitySnapshots, } from "./activity-monitor.js";
import { LEAD_ART, memberArtUrl } from "./artwork.js";
import css from './AgentTeamsCard.module.css';
/** Window event name the floater listens for to open itself. */
export const OPEN_PANEL_EVENT = 'agent-teams:open-panel';
/** Open the matching team view, carrying this team's summary
 * so the panel can show it even when the team no longer exists on disk
 * (historical session review). */
export function openActivityPanel(data) {
    window.dispatchEvent(new CustomEvent(OPEN_PANEL_EVENT, {
        detail: {
            teamId: data.teamId,
            captainSessionId: data.captainSessionId,
            teamName: data.teamName,
            members: data.members,
        },
    }));
}
/** Render one durable team as a compact conversation card. */
const noWorkspace = () => undefined;
const noSubscription = () => () => { };
export function AgentTeamsCard({ node, openMember, sessionId, t, workspaceBridge }) {
    const native = useSyncExternalStore(workspaceBridge?.subscribe ?? noSubscription, workspaceBridge?.getSnapshot ?? noWorkspace);
    const location = node.location;
    // Closed turns render their card through the official, non-folding turn tail.
    if (native && (location.kind === 'turn' || location.kind === 'step') && location.turn.status === 'closed')
        return null;
    return _jsx(AgentTeamsSummary, { data: node.data, openMember: openMember, sessionId: sessionId, t: t });
}
export function AgentTeamsSummary({ data, openMember, sessionId, t }) {
    // `conversation.chat.node` is session-scoped, so its framework-owned id is
    // a stable owner even while another conversation becomes current.
    const owner = data.captainSessionId || sessionId;
    const { teams, archivedTeams } = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
    useEffect(() => {
        return monitorAgentTeam(owner, data.teamId);
    }, [data.teamId, owner]);
    const snapshot = teams.find((team) => team.teamId === data.teamId && (owner === '' || team.captainSessionId === owner))
        ?? archivedTeams.find((team) => team.teamId === data.teamId && (owner === '' || team.captainSessionId === owner));
    const resolved = useMemo(() => ({
        ...data,
        captainSessionId: snapshot?.captainSessionId ?? owner,
        teamName: snapshot?.name ?? data.teamName,
        members: snapshot?.members.map((member) => ({ id: member.id, name: member.name, role: member.role })) ?? data.members,
    }), [data, owner, snapshot]);
    const messages = (snapshot?.messages ?? []).slice(-8);
    // 任务开始/完成也同步进主对话卡片，而不只是修士之间的消息。
    const taskEvents = [...(snapshot?.tasks ?? [])]
        .filter(task => task.updatedAt !== undefined)
        .sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
        .slice(0, 3);
    return (_jsxs("section", { className: css.root, "data-agent-teams-card": true, "data-team-id": resolved.teamId, children: [_jsxs("header", { className: css.head, children: [_jsx("img", { className: css.leadAvatar, src: LEAD_ART, alt: "", "aria-hidden": true }), _jsx("span", { className: css.teamName, title: resolved.teamName, children: resolved.teamName }), _jsx("span", { className: css.memberCount, children: t('card.memberCount', { count: resolved.members.length }) })] }), (messages.length > 0 || taskEvents.length > 0) && (_jsxs("div", { className: css.comms, "data-team-comms": true, children: [_jsx("span", { className: css.commsTitle, children: t('card.comms') }), taskEvents.length > 0 && (_jsx("div", { className: css.commsTasks, "data-team-comms-tasks": true, children: taskEvents.map((task) => {
                            const state = task.status === 'completed'
                                ? 'completed'
                                : task.status === 'failed' || task.status === 'cancelled' ? 'failed' : 'start';
                            const key = state === 'completed'
                                ? 'card.task.completed'
                                : state === 'failed' ? 'card.task.failed' : 'card.task.start';
                            const glyph = state === 'completed' ? '✓' : state === 'failed' ? '✕' : '▶';
                            return (_jsxs("span", { className: css.commsTask, "data-state": state, children: [_jsx("span", { "aria-hidden": true, children: glyph }), t(key, { taskId: task.id, assignee: task.assignee || t('task.assignee.unclaimed') })] }, task.id));
                        }) })), _jsx("ul", { className: css.commsList, children: messages.map((message) => {
                            const fromCaptain = message.from === 'captain' || message.from === '';
                            const role = fromCaptain ? '' : snapshot?.members.find((member) => member.name === message.from)?.role ?? '';
                            const art = fromCaptain ? LEAD_ART : memberArtUrl(message.from, role);
                            return (_jsxs("li", { className: css.commsRow, "data-from": fromCaptain ? 'captain' : 'member', children: [_jsx("img", { className: css.commsAvatar, src: art ?? '', alt: "", "aria-hidden": true }), _jsxs("span", { className: css.commsText, children: [_jsxs("span", { className: css.commsMeta, children: [message.from, " \u2192 ", message.to ?? 'captain'] }), _jsx("span", { className: css.commsBody, title: message.content, children: message.content })] })] }, message.id ?? `${message.ts ?? 0}:${message.from}`));
                        }) })] })), resolved.members.length > 0 && (_jsx("div", { className: css.members, children: resolved.members.map((member) => (_jsxs("button", { type: "button", className: css.member, onClick: () => {
                        if (member.id !== '')
                            openMember(owner, member.id);
                    }, title: member.role === '' ? member.name : `${member.name} · ${member.role}`, children: [memberArtUrl(member.name, member.role) !== null ? (_jsx("img", { className: css.memberArt, src: memberArtUrl(member.name, member.role) ?? '', alt: "", "aria-hidden": true })) : (_jsx("span", { className: css.memberInitial, children: member.name.trim().slice(0, 1).toUpperCase() || '?' })), _jsx("span", { className: css.memberName, children: member.name })] }, member.id || member.name))) }))] }));
}
