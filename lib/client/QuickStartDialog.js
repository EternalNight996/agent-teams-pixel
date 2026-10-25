import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Click-to-dispatch entry: a header button that stages a plan from a small form. */
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './QuickStartDialog.module.css';
const TEMPLATES = [
    { id: 'fix', labelKey: 'quickstart.tplFix', roles: ['implementer', 'verifier', 'reviewer'] },
    { id: 'feat', labelKey: 'quickstart.tplFeat', roles: ['planner', 'implementer', 'verifier', 'reviewer'] },
    { id: 'research', labelKey: 'quickstart.tplResearch', roles: ['researcher', 'analyst', 'writer', 'reviewer'] },
    { id: 'audit', labelKey: 'quickstart.tplAudit', roles: ['auditor', 'reviewer'] },
];
/** Roles offered by the multi-select; custom names can be added on top. */
const ROLE_OPTIONS = [
    'planner', 'implementer', 'verifier', 'reviewer',
    'researcher', 'analyst', 'writer', 'auditor',
    'architect', 'tester', 'documenter', 'operator',
];
function templateOf(id) {
    return TEMPLATES.find(entry => entry.id === id) ?? TEMPLATES[0];
}
export function TeamQuickStart({ sessionId, t }) {
    const [open, setOpen] = useState(false);
    const [goal, setGoal] = useState('');
    const [template, setTemplate] = useState(TEMPLATES[0]?.id ?? 'fix');
    const [roles, setRoles] = useState([...(TEMPLATES[0]?.roles ?? [])]);
    const [customRole, setCustomRole] = useState('');
    const [rolesOpen, setRolesOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState();
    const multiRef = useRef(null);
    useEffect(() => {
        if (!rolesOpen)
            return;
        const onPointerDown = (event) => {
            if (multiRef.current === null)
                return;
            if (!multiRef.current.contains(event.target))
                setRolesOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => { document.removeEventListener('pointerdown', onPointerDown); };
    }, [rolesOpen]);
    const reset = () => {
        setGoal('');
        setError('');
        setCreated(undefined);
        setBusy(false);
        setRolesOpen(false);
    };
    const chooseTemplate = (id) => {
        setTemplate(id);
        setRoles([...templateOf(id).roles]);
    };
    const toggleRole = (role) => {
        setRoles((current) => current.includes(role) ? current.filter(entry => entry !== role) : [...current, role]);
    };
    const addCustomRole = () => {
        const trimmed = customRole.trim();
        if (trimmed === '')
            return;
        setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed]);
        setCustomRole('');
    };
    const submit = async () => {
        const trimmed = goal.trim();
        if (trimmed === '') {
            setError(t('quickstart.goalRequired'));
            return;
        }
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/plugins/dsh-agent-teams/quick-start', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    goal: trimmed,
                    template,
                    roles,
                }),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok || body?.ok !== true) {
                const raw = body?.error ?? `HTTP ${response.status}`;
                throw new Error(/already lead team/i.test(raw) ? t('quickstart.teamExists') : raw);
            }
            setCreated(body.teamId ?? '');
            setGoal('');
            window.setTimeout(() => { setOpen(false); reset(); }, 1400);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", className: css.entry, "data-quick-start-entry": true, title: t('quickstart.entryTitle'), onClick: () => { setOpen(true); setError(''); setCreated(undefined); }, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('quickstart.entry')] }), _jsx(Modal, { open: open, onClose: () => { if (!busy) {
                    setOpen(false);
                    reset();
                } }, title: t('quickstart.title'), closeLabel: t('quickstart.cancel'), footer: (_jsxs("span", { className: css.actions, children: [_jsx("button", { type: "button", disabled: busy, onClick: () => { setOpen(false); reset(); }, children: t('quickstart.cancel') }), _jsx("button", { type: "button", disabled: busy, "data-primary": true, onClick: () => { void submit(); }, children: busy ? t('quickstart.busy') : t('quickstart.submit') })] })), children: _jsxs("div", { className: css.form, children: [_jsx("p", { className: css.hint, children: t('quickstart.desc') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('quickstart.template') }), _jsx("select", { value: template, disabled: busy, onChange: (event) => { chooseTemplate(event.target.value); }, children: TEMPLATES.map(entry => _jsx("option", { value: entry.id, children: t(entry.labelKey) }, entry.id)) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('quickstart.goal') }), _jsx("textarea", { value: goal, rows: 3, autoFocus: true, disabled: busy, placeholder: t('quickstart.goalPlaceholder'), onChange: (event) => { setGoal(event.target.value); } })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { children: t('quickstart.roles') }), _jsxs("div", { className: css.multi, ref: multiRef, children: [_jsxs("button", { type: "button", className: css.multiTrigger, "data-control": "quickstart-roles", "aria-expanded": rolesOpen, "aria-haspopup": "listbox", disabled: busy, onClick: () => { setRolesOpen((current) => !current); }, children: [_jsx("span", { className: css.chips, children: roles.length === 0
                                                        ? _jsx("span", { className: css.placeholder, children: t('quickstart.rolesEmpty') })
                                                        : roles.map(role => _jsx("span", { className: css.chip, children: role }, role)) }), _jsx("span", { className: css.caret, "aria-hidden": true, children: "\u25BE" })] }), rolesOpen && (_jsxs("div", { className: css.multiPanel, role: "listbox", "aria-multiselectable": "true", "aria-label": t('quickstart.roles'), children: [ROLE_OPTIONS.map(role => (_jsxs("label", { className: css.option, children: [_jsx("input", { type: "checkbox", checked: roles.includes(role), onChange: () => { toggleRole(role); } }), _jsx("span", { children: role })] }, role))), _jsxs("div", { className: css.customRow, children: [_jsx("input", { value: customRole, placeholder: t('quickstart.customRole'), onChange: (event) => { setCustomRole(event.target.value); }, onKeyDown: (event) => {
                                                                if (event.key === 'Enter') {
                                                                    event.preventDefault();
                                                                    addCustomRole();
                                                                }
                                                            } }), _jsx("button", { type: "button", disabled: customRole.trim() === '', onClick: addCustomRole, children: t('quickstart.addRole') })] })] }))] })] }), error !== '' && _jsx("p", { className: css.error, role: "alert", children: error }), created !== undefined && _jsx("p", { className: css.success, role: "status", children: t('quickstart.created', { team: created }) })] }) })] }));
}
