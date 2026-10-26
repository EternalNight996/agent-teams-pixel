/** Version-tolerant navigation into durable AgentTeams member transcripts. */
/** Newer sessions retain view ownership instead of publishing list.current. */
export function currentSessionId(state) {
    if ('current' in state) {
        const current = state.current;
        if (current === undefined)
            return undefined;
        // Some hosts keep the parent as `current` while the user is reading a
        // durable subagent transcript. If that child owns mainView, it is the panel
        // the user is actually looking at (and the one idle XP belongs to).
        const child = Object.values(state.byId).find(row => row.id !== current
            && (row.retainedBy?.mainView ?? 0) > 0
            && (row.parentId === current || row.origin === 'subagent'));
        return child?.id ?? current;
    }
    const retained = Object.values(state.byId).filter(row => (row.retainedBy?.mainView ?? 0) > 0);
    const child = retained.find(row => row.parentId !== undefined || row.origin === 'subagent');
    return (child ?? retained[0])?.id;
}
/**
 * Return from a member transcript to the team's main conversation.
 * Falls back to the workspace navigator when the legacy `open` action is absent.
 */
export function openAgentTeamCaptain(sessions, sessionId, layout, workspace) {
    if (sessions.open !== undefined) {
        sessions.open(sessionId);
        layout?.selectPanel?.(null);
        return;
    }
    if (workspace !== undefined) {
        workspace.openSession(sessionId);
        layout?.selectPanel?.(null);
        return;
    }
    throw new Error('Harness does not expose session navigation');
}
/**
 * Open one member's persisted transcript.
 *
 * Harness rc.8 intentionally removed cold subagents from the ordinary session
 * list. They must first be rediscovered in their parent's catalog, then opened
 * with the exact parent/child/mode address. Older runtimes have only `open()`;
 * the fallback preserves ordinary-session navigation. New layouts also select
 * the Conversation panel and cancel catalog refreshes superseded by navigation.
 */
export async function openAgentTeamMember(sessions, parentSessionId, childSessionId, layout, workspace) {
    if (sessions.open === undefined && workspace !== undefined) {
        workspace.openSession({ parentSessionId, childSessionId, mode: 'continuable' });
        return 'subagent';
    }
    const navigation = layout?.beginNavigation?.();
    if (sessions.openSubagent === undefined || sessions.refreshSubagents === undefined) {
        if (sessions.open === undefined)
            throw new Error('Harness does not expose session navigation');
        sessions.open(childSessionId);
        layout?.selectPanel?.(null);
        return 'session';
    }
    await sessions.refreshSubagents(parentSessionId);
    if (navigation?.aborted)
        return 'cancelled';
    const retained = sessions.subagentAddress?.(childSessionId);
    sessions.openSubagent(retained?.parentSessionId === parentSessionId
        ? retained
        : { parentSessionId, childSessionId, mode: 'continuable' });
    layout?.selectPanel?.(null);
    return 'subagent';
}
