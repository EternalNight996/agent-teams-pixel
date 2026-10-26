import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cultivationFromXp, memberKey } from "./cultivation.js";
import { useCultivationVersion, xpOf } from "./cultivation-store.js";
import { roleLabel } from "./role-labels.js";
import css from './TeamConfigPanel.module.css';
function memberRoute(member) {
    const parts = [member.provider, member.model].filter((part) => typeof part === 'string' && part !== '');
    return parts.length > 0 ? parts.join(' / ') : '—';
}
const STATUS_KEYS = {
    pending: 'task.status.pending',
    claimed: 'task.status.claimed',
    running: 'task.status.inProgress',
    in_progress: 'task.status.inProgress',
    completed: 'task.status.completed',
    failed: 'task.status.failed',
    cancelled: 'task.status.cancelled',
};
const KIND_KEYS = {
    work: 'config.kind.work',
    requirements: 'config.kind.requirements',
    implementation: 'config.kind.implementation',
    verification: 'config.kind.verification',
    review: 'config.kind.review',
    repair: 'config.kind.repair',
    integration: 'config.kind.integration',
};
function statusLabel(status, t) {
    const key = STATUS_KEYS[status];
    return key === undefined ? status : t(key);
}
function kindLabel(kind, t) {
    if (kind === undefined)
        return '';
    const key = KIND_KEYS[kind];
    return key === undefined ? kind : t(key);
}
export function TeamConfigPanel({ team, t }) {
    useCultivationVersion();
    const completed = team.tasks.filter(task => task.status === 'completed').length;
    // 进度页已显示“已完成”时，道统页的阶段也必须一致，不能还写“进行中”。
    const allCompleted = team.tasks.length > 0 && completed === team.tasks.length;
    const facts = [
        { label: t('config.team'), value: team.name, sub: team.teamId },
        { label: t('config.phase'), value: team.halted === true
                ? t('config.halted')
                : t(team.phase === 'staged' ? 'config.phaseStaged' : allCompleted ? 'config.phaseCompleted' : 'config.phaseRunning') },
        { label: t('config.members'), value: String(team.members.length) },
        { label: t('config.tasks'), value: `${completed}/${team.tasks.length}` },
    ];
    return (_jsxs("section", { className: css.panel, "data-team-config": true, children: [_jsx("div", { className: css.facts, children: facts.map(fact => (_jsxs("div", { className: css.fact, children: [_jsx("span", { className: css.label, children: fact.label }), _jsx("strong", { className: css.value, children: fact.value }), fact.sub !== undefined && _jsx("span", { className: css.sub, children: fact.sub })] }, fact.label))) }), _jsx("h3", { className: css.heading, children: t('config.members') }), _jsx("div", { className: css.tableWrap, children: _jsxs("table", { className: css.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('config.name') }), _jsx("th", { children: t('config.role') }), _jsx("th", { children: t('config.realm') }), _jsx("th", { children: t('config.model') }), _jsx("th", { children: t('config.effort') })] }) }), _jsx("tbody", { children: team.members.map(member => {
                                const cultivation = cultivationFromXp(xpOf(memberKey(member.name)));
                                return (_jsxs("tr", { children: [_jsx("td", { children: member.name }), _jsx("td", { children: roleLabel(member.role, member.name, t) }), _jsx("td", { children: `Lv.${cultivation.level} ${t(cultivation.rankKey)}` }), _jsx("td", { className: css.mono, children: memberRoute(member) }), _jsx("td", { children: member.reasoningEffort ?? '—' })] }, member.id));
                            }) })] }) }), _jsx("h3", { className: css.heading, children: t('config.tasks') }), _jsx("div", { className: css.tableWrap, children: _jsxs("table", { className: css.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('config.task') }), _jsx("th", { children: t('config.assignee') }), _jsx("th", { children: t('config.status') }), _jsx("th", { children: t('config.deps') })] }) }), _jsx("tbody", { children: team.tasks.map(task => (_jsxs("tr", { children: [_jsx("td", { children: task.subject }), _jsx("td", { children: task.assignee === '' ? t('config.unassigned') : task.assignee }), _jsx("td", { children: task.kind === undefined ? statusLabel(task.status, t) : `${kindLabel(task.kind, t)} · ${statusLabel(task.status, t)}` }), _jsx("td", { className: css.mono, children: task.dependencies.length === 0 ? '—' : task.dependencies.join(', ') })] }, task.id))) })] }) }), _jsx("p", { className: css.hint, children: team.phase === 'staged' ? t('config.stagedHint') : t('config.hint') })] }));
}
