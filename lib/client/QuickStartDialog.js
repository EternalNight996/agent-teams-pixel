import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Click-to-dispatch entry: a header button that stages a plan from a small wizard. */
import { useEffect, useMemo, useRef, useState } from 'react';
import css from './QuickStartDialog.module.css';
import { memberArtUrl } from "./artwork.js";
import { OPEN_HALL_SHEET_EVENT } from "./hall-events.js";
import { TEAM_CREATED_EVENT } from "./team-reveal.js";
import { ROLE_META } from "./role-labels.js";
import { SECT_PRESETS, randomSect, sectPreset } from "./sects.js";
const TEMPLATES = [
    { id: 'fix', labelKey: 'quickstart.tplFix', descKey: 'quickstart.desc.fix', roles: ['implementer', 'verifier', 'reviewer'] },
    { id: 'feat', labelKey: 'quickstart.tplFeat', descKey: 'quickstart.desc.feat', roles: ['planner', 'implementer', 'verifier', 'reviewer'] },
    { id: 'research', labelKey: 'quickstart.tplResearch', descKey: 'quickstart.desc.research', roles: ['researcher', 'analyst', 'writer', 'reviewer'] },
    { id: 'fullstack', labelKey: 'quickstart.tplFullstack', descKey: 'quickstart.desc.fullstack', roles: ['integrator', 'frontend', 'backend', 'verifier', 'reviewer'] },
    { id: 'hardening', labelKey: 'quickstart.tplHardening', descKey: 'quickstart.desc.hardening', roles: ['auditor', 'security', 'verifier', 'reviewer'] },
    { id: 'audit', labelKey: 'quickstart.tplAudit', descKey: 'quickstart.desc.audit', roles: ['auditor', 'reviewer'] },
    { id: 'build', labelKey: 'quickstart.tplBuild', descKey: 'quickstart.desc.build', roles: ['implementer', 'verifier', 'operator'] },
    { id: 'array', labelKey: 'quickstart.tplArray', descKey: 'quickstart.desc.array', roles: ['architect', 'implementer', 'verifier', 'reviewer'] },
    { id: 'docs', labelKey: 'quickstart.tplDocs', descKey: 'quickstart.desc.docs', roles: ['writer', 'documenter', 'reviewer'] },
    { id: 'debate', labelKey: 'quickstart.tplDebate', descKey: 'quickstart.desc.debate', roles: ['researcher', 'analyst', 'reviewer'] },
];
/** 开宗四步：道统 → 立派之志 → 宗门 → 立誓。 */
const STEPS = ['doctrine', 'vow', 'sect', 'oath'];
const STEP_LABEL = {
    doctrine: 'quickstart.stepDoctrine',
    vow: 'quickstart.stepVow',
    sect: 'quickstart.stepSect',
    oath: 'quickstart.stepOath',
};
function templateOf(id) {
    return TEMPLATES.find(entry => entry.id === id) ?? TEMPLATES[0];
}
export function QuickStartWizard({ sessionId, t, onDone, onFounded }) {
    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState('');
    const [template, setTemplate] = useState(TEMPLATES[0]?.id ?? 'fix');
    const [roles, setRoles] = useState([...(TEMPLATES[0]?.roles ?? [])]);
    // 门派有两种玩法：用户选一个预设，或让系统随机动态分配（再点一次重抽）。
    const [sectMode, setSectMode] = useState('random');
    const [rolledSect, setRolledSect] = useState(() => randomSect().id);
    const [customRole, setCustomRole] = useState('');
    const [rolesOpen, setRolesOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [blocked, setBlocked] = useState(false);
    const [created, setCreated] = useState();
    const multiRef = useRef(null);
    const goalRef = useRef(null);
    const foundedTimer = useRef(undefined);
    useEffect(() => () => {
        if (foundedTimer.current !== undefined)
            window.clearTimeout(foundedTimer.current);
    }, []);
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
    const close = () => {
        if (busy)
            return;
        onDone?.();
    };
    const activeSect = sectMode === 'custom' ? undefined : sectPreset(sectMode === 'random' ? rolledSect : sectMode);
    const sectRoles = activeSect?.roles ?? roles;
    const chooseTemplate = (id) => {
        setTemplate(id);
        // 门派已经配好道途时，换模板不再覆盖这套道途（自定义模式才跟随模板）。
        if (sectMode === 'custom')
            setRoles([...templateOf(id).roles]);
    };
    const chooseSect = (id) => {
        setSectMode(id);
        const preset = sectPreset(id);
        if (preset !== undefined)
            setRoles([...preset.roles]);
    };
    const rollSect = () => {
        const next = randomSect(rolledSect);
        setRolledSect(next.id);
        setSectMode('random');
        setRoles([...next.roles]);
    };
    const chooseCustom = () => {
        setSectMode('custom');
        if (roles.length === 0)
            setRoles([...templateOf(template).roles]);
    };
    const toggleRole = (role) => {
        setRoles((current) => current.includes(role) ? current.filter(entry => entry !== role) : [...current, role]);
    };
    const roleName = (id) => {
        const meta = ROLE_META.find(entry => entry.id === id);
        return meta === undefined ? id : t(meta.nameKey);
    };
    /** 一枚修士 chip：优先用像素人立绘，找不到对应道途时退回首字徽记。 */
    const personChip = (role) => {
        const label = roleName(role);
        const art = memberArtUrl(label, role);
        return (_jsxs("span", { className: css.chip, title: role, children: [art === null
                    ? _jsx("span", { className: css.chipLetter, "aria-hidden": true, children: label.slice(0, 1) })
                    : _jsx("img", { className: css.chipAvatar, src: art, alt: "" }), label] }, role));
    };
    const addCustomRole = () => {
        const trimmed = customRole.trim();
        if (trimmed === '')
            return;
        setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed]);
        setCustomRole('');
    };
    const goalTrimmed = goal.trim();
    const currentStep = STEPS[step] ?? STEPS[0];
    const canAdvance = useMemo(() => {
        if (busy)
            return false;
        switch (currentStep) {
            case 'vow': return goalTrimmed.length >= 2;
            case 'sect': return sectMode !== 'custom' || sectRoles.length > 0;
            default: return true;
        }
    }, [busy, currentStep, goalTrimmed, sectMode, sectRoles.length]);
    const submit = async (replace) => {
        if (goalTrimmed === '') {
            setError(t('quickstart.goalRequired'));
            setStep(1);
            return;
        }
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/plugins/dsh-pixel-team/quick-start', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sessionId, goal: goalTrimmed, template, roles: sectMode === 'custom' ? roles : [...(activeSect?.roles ?? roles)], replace }),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok || body?.ok !== true) {
                const raw = body?.error ?? ('HTTP ' + response.status);
                const existing = /already lead team/i.test(raw);
                setBlocked(existing);
                throw new Error(existing ? t('quickstart.teamExists') : raw);
            }
            setCreated(t('quickstart.created', {
                team: body.teamId ?? '',
                sect: activeSect === undefined ? t('quickstart.sectCustomPicked') : t(activeSect.nameKey),
            }));
            if (body.teamId !== undefined)
                window.dispatchEvent(new CustomEvent(TEAM_CREATED_EVENT, { detail: { teamId: body.teamId } }));
            setGoal('');
            foundedTimer.current = window.setTimeout(() => { onFounded?.(); }, 1400);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
        }
        finally {
            setBusy(false);
        }
    };
    const goTo = (next) => {
        if (busy)
            return;
        setError('');
        setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
    };
    const next = () => {
        if (step === STEPS.length - 1) {
            void submit(false);
            return;
        }
        if (!canAdvance)
            return;
        goTo(step + 1);
    };
    const doctrineName = t(templateOf(template).labelKey);
    const sectName = activeSect === undefined ? t('quickstart.sectCustom') : t(activeSect.nameKey);
    const roster = sectMode === 'custom' ? roles : [...sectRoles];
    return (_jsxs("div", { className: css.wizard, children: [_jsxs("div", { className: css.form, children: [_jsx("ol", { className: css.steps, "aria-label": t('quickstart.title'), children: STEPS.map((entry, index) => {
                            const state = index === step ? 'current' : index < step ? 'done' : 'todo';
                            return (_jsx("li", { className: css.stepItem, "data-state": state, children: _jsxs("button", { type: "button", className: css.stepButton, "data-control": 'quickstart-step-' + index, "aria-current": state === 'current' ? 'step' : undefined, disabled: busy || index > step, onClick: () => { goTo(index); }, children: [_jsx("span", { className: css.stepDot, children: index < step ? '✓' : index + 1 }), _jsx("span", { className: css.stepLabel, children: t(STEP_LABEL[entry]) })] }) }, entry));
                        }) }), currentStep === 'doctrine' && (_jsxs("section", { className: css.stepPane, "data-step": "doctrine", children: [_jsx("p", { className: css.hint, children: t('quickstart.doctrineHint') }), _jsx("div", { className: css.templates, role: "radiogroup", "aria-label": t('quickstart.template'), children: TEMPLATES.map(entry => (_jsxs("button", { type: "button", role: "radio", "aria-checked": template === entry.id, className: css.templateCard, "data-control": 'quickstart-template-' + entry.id, disabled: busy, onClick: () => { chooseTemplate(entry.id); }, children: [_jsx("span", { className: css.templateName, children: t(entry.labelKey) }), _jsx("span", { className: css.templateDesc, children: t(entry.descKey) }), _jsxs("span", { className: css.templateMeta, children: [entry.roles.length, " ", t('quickstart.roleCount')] })] }, entry.id))) })] })), currentStep === 'vow' && (_jsxs("section", { className: css.stepPane, "data-step": "vow", children: [_jsx("p", { className: css.hint, children: t('quickstart.vowHint') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('quickstart.goal') }), _jsx("textarea", { ref: goalRef, value: goal, rows: 5, autoFocus: true, disabled: busy, placeholder: t('quickstart.goalPlaceholder'), onChange: (event) => { setGoal(event.target.value); }, onKeyDown: (event) => {
                                            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                                                event.preventDefault();
                                                next();
                                            }
                                        } })] }), _jsxs("p", { className: css.goalMeta, children: [_jsx("span", { children: t('quickstart.goalLength', { count: goalTrimmed.length }) }), _jsx("span", { children: t('quickstart.goalShortcut') })] })] })), currentStep === 'sect' && (_jsxs("section", { className: css.stepPane, "data-step": "sect", children: [_jsx("p", { className: css.hint, children: t('quickstart.sectHint') }), _jsxs("div", { className: css.field, children: [_jsx("span", { children: t('quickstart.sect') }), _jsxs("div", { className: css.sectRow, children: [_jsxs("button", { type: "button", className: css.sectChip, "data-active": sectMode === 'random' || undefined, disabled: busy, onClick: rollSect, children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFB2" }), t('quickstart.sectRandom')] }), SECT_PRESETS.map(preset => (_jsx("button", { type: "button", className: css.sectChip, "data-active": sectMode === preset.id || undefined, disabled: busy, onClick: () => { chooseSect(preset.id); }, children: t(preset.nameKey) }, preset.id))), _jsx("button", { type: "button", className: css.sectChip, "data-active": sectMode === 'custom' || undefined, disabled: busy, onClick: chooseCustom, children: t('quickstart.sectCustom') })] }), _jsx("small", { className: css.templateDesc, children: sectMode === 'custom'
                                            ? t('quickstart.sectCustomHint')
                                            : sectMode === 'random'
                                                ? t('quickstart.sectRolled', { sect: activeSect === undefined ? '' : t(activeSect.nameKey) })
                                                : activeSect === undefined ? '' : t(activeSect.descKey) }), sectMode !== 'custom' && (_jsx("span", { className: css.sectRoster, children: sectRoles.map(personChip) }))] }), sectMode === 'custom' && (_jsxs("div", { className: css.field, children: [_jsx("span", { children: t('quickstart.roles') }), _jsxs("div", { className: css.multi, ref: multiRef, children: [_jsxs("button", { type: "button", className: css.multiTrigger, "data-control": "quickstart-roles", "aria-expanded": rolesOpen, "aria-haspopup": "listbox", disabled: busy, onClick: () => { setRolesOpen((current) => !current); }, children: [_jsx("span", { className: css.chips, children: roles.length === 0
                                                            ? _jsx("span", { className: css.placeholder, children: t('quickstart.rolesEmpty') })
                                                            : roles.map(personChip) }), _jsx("span", { className: css.caret, "aria-hidden": true, children: "\u25BE" })] }), rolesOpen && (_jsxs("div", { className: css.multiPanel, role: "listbox", "aria-multiselectable": "true", "aria-label": t('quickstart.roles'), children: [ROLE_META.map(meta => (_jsxs("label", { className: css.option, children: [_jsx("input", { type: "checkbox", checked: roles.includes(meta.id), onChange: () => { toggleRole(meta.id); } }), (() => {
                                                                const art = memberArtUrl(t(meta.nameKey), meta.id);
                                                                return art === null ? null : _jsx("img", { className: css.optionAvatar, src: art, alt: "" });
                                                            })(), _jsx("span", { className: css.optionName, children: t(meta.nameKey) }), _jsx("span", { className: css.optionId, children: meta.id }), _jsx("span", { className: css.optionAbility, children: t(meta.abilityKey) })] }, meta.id))), _jsxs("div", { className: css.customRow, children: [_jsx("input", { value: customRole, placeholder: t('quickstart.customRole'), onChange: (event) => { setCustomRole(event.target.value); }, onKeyDown: (event) => {
                                                                    if (event.key === 'Enter') {
                                                                        event.preventDefault();
                                                                        addCustomRole();
                                                                    }
                                                                } }), _jsx("button", { type: "button", disabled: customRole.trim() === '', onClick: addCustomRole, children: t('quickstart.addRole') })] })] }))] })] }))] })), currentStep === 'oath' && (_jsxs("section", { className: css.stepPane, "data-step": "oath", children: [_jsx("p", { className: css.hint, children: t('quickstart.oathHint') }), _jsxs("dl", { className: css.summary, children: [_jsxs("div", { className: css.summaryRow, children: [_jsx("dt", { children: t('quickstart.summaryDoctrine') }), _jsx("dd", { children: doctrineName })] }), _jsxs("div", { className: css.summaryRow, children: [_jsx("dt", { children: t('quickstart.summarySect') }), _jsx("dd", { children: sectName })] }), _jsxs("div", { className: css.summaryRow, children: [_jsx("dt", { children: t('quickstart.summaryRoster') }), _jsx("dd", { children: _jsx("span", { className: css.chips, children: roster.map(personChip) }) })] }), _jsxs("div", { className: css.summaryRow, children: [_jsx("dt", { children: t('quickstart.summaryVow') }), _jsx("dd", { children: goalTrimmed })] })] }), _jsx("p", { className: css.oath, children: t('quickstart.oathNotice') })] })), error !== '' && _jsx("p", { className: css.error, role: "alert", children: error }), blocked && (_jsxs("p", { className: css.replaceRow, children: [_jsx("span", { children: t('quickstart.replaceHint') }), _jsx("button", { type: "button", disabled: busy, onClick: () => { void submit(true); }, children: t('quickstart.replace') })] })), created !== undefined && _jsx("p", { className: css.success, role: "status", children: created })] }), _jsxs("div", { className: css.wizardActions, children: [_jsx("button", { type: "button", disabled: busy, onClick: close, children: t('quickstart.cancel') }), step > 0 && (_jsx("button", { type: "button", "data-control": "quickstart-back", disabled: busy, onClick: () => { goTo(step - 1); }, children: t('quickstart.back') })), step < STEPS.length - 1 ? (_jsx("button", { type: "button", "data-primary": true, "data-control": "quickstart-next", disabled: !canAdvance, onClick: next, children: t('quickstart.next') })) : (_jsx("button", { type: "button", "data-primary": true, "data-control": "quickstart-submit", disabled: busy || !canAdvance, onClick: () => { void submit(false); }, children: busy ? t('quickstart.busy') : t('quickstart.found') }))] })] }));
}
/** 对话头部的开宗入口：统一打开洞府里的内容气泡，不再弹独立窗口。 */
export function TeamQuickStart({ t }) {
    return (_jsxs("button", { type: "button", className: css.entry, "data-quick-start-entry": true, title: t('quickstart.entryTitle'), onClick: () => { window.dispatchEvent(new CustomEvent(OPEN_HALL_SHEET_EVENT, { detail: { action: 'start' } })); }, children: [_jsx("span", { "aria-hidden": true, children: "\u26E9" }), t('quickstart.entry')] }));
}
