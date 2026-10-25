import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './TeamConfigPanel.module.css';
function memberRoute(member) {
    const parts = [member.provider, member.model].filter((part) => typeof part === 'string' && part !== '');
    return parts.length > 0 ? parts.join(' / ') : '—';
}
export function TeamConfigPanel({ team, t }) {
    const completed = team.tasks.filter(task => task.status === 'completed').length;
    const facts = [
        { label: t('config.team'), value: team.name, sub: team.teamId },
        { label: t('config.phase'), value: team.halted === true ? t('config.halted') : team.phase },
        { label: t('config.members'), value: String(team.members.length) },
        { label: t('config.tasks'), value: `${completed}/${team.tasks.length}` },
    ];
    return (_jsxs("section", { className: css.panel, "data-team-config": true, children: [_jsx("div", { className: css.facts, children: facts.map(fact => (_jsxs("div", { className: css.fact, children: [_jsx("span", { className: css.label, children: fact.label }), _jsx("strong", { className: css.value, children: fact.value }), fact.sub !== undefined && _jsx("span", { className: css.sub, children: fact.sub })] }, fact.label))) }), _jsx("h3", { className: css.heading, children: t('config.members') }), _jsx("div", { className: css.tableWrap, children: _jsxs("table", { className: css.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('config.name') }), _jsx("th", { children: t('config.role') }), _jsx("th", { children: t('config.model') }), _jsx("th", { children: t('config.effort') })] }) }), _jsx("tbody", { children: team.members.map(member => (_jsxs("tr", { children: [_jsx("td", { children: member.name }), _jsx("td", { children: member.role }), _jsx("td", { className: css.mono, children: memberRoute(member) }), _jsx("td", { children: member.reasoningEffort ?? '—' })] }, member.id))) })] }) }), _jsx("h3", { className: css.heading, children: t('config.tasks') }), _jsx("div", { className: css.tableWrap, children: _jsxs("table", { className: css.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('config.task') }), _jsx("th", { children: t('config.assignee') }), _jsx("th", { children: t('config.status') }), _jsx("th", { children: t('config.deps') })] }) }), _jsx("tbody", { children: team.tasks.map(task => (_jsxs("tr", { children: [_jsx("td", { children: task.subject }), _jsx("td", { children: task.assignee === '' ? t('config.unassigned') : task.assignee }), _jsx("td", { children: task.kind === undefined ? task.status : `${task.kind} · ${task.status}` }), _jsx("td", { className: css.mono, children: task.dependencies.length === 0 ? '—' : task.dependencies.join(', ') })] }, task.id))) })] }) }), _jsx("p", { className: css.hint, children: team.phase === 'staged' ? t('config.stagedHint') : t('config.hint') })] }));
}
