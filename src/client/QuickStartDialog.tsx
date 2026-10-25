/** Click-to-dispatch entry: a header button that stages a plan from a small form. */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './QuickStartDialog.module.css'

type TplKey = 'quickstart.tplFix' | 'quickstart.tplFeat' | 'quickstart.tplResearch' | 'quickstart.tplAudit'
  | 'quickstart.tplBuild' | 'quickstart.tplArray' | 'quickstart.tplDocs' | 'quickstart.tplDebate'

interface QuickTemplate {
  readonly id: string
  readonly labelKey: TplKey
  readonly descKey: string
  readonly roles: readonly string[]
}

const TEMPLATES: readonly QuickTemplate[] = [
  { id: 'fix', labelKey: 'quickstart.tplFix', descKey: 'quickstart.desc.fix', roles: ['implementer', 'verifier', 'reviewer'] },
  { id: 'feat', labelKey: 'quickstart.tplFeat', descKey: 'quickstart.desc.feat', roles: ['planner', 'implementer', 'verifier', 'reviewer'] },
  { id: 'research', labelKey: 'quickstart.tplResearch', descKey: 'quickstart.desc.research', roles: ['researcher', 'analyst', 'writer', 'reviewer'] },
  { id: 'audit', labelKey: 'quickstart.tplAudit', descKey: 'quickstart.desc.audit', roles: ['auditor', 'reviewer'] },
  { id: 'build', labelKey: 'quickstart.tplBuild', descKey: 'quickstart.desc.build', roles: ['implementer', 'verifier', 'operator'] },
  { id: 'array', labelKey: 'quickstart.tplArray', descKey: 'quickstart.desc.array', roles: ['architect', 'implementer', 'verifier', 'reviewer'] },
  { id: 'docs', labelKey: 'quickstart.tplDocs', descKey: 'quickstart.desc.docs', roles: ['writer', 'documenter', 'reviewer'] },
  { id: 'debate', labelKey: 'quickstart.tplDebate', descKey: 'quickstart.desc.debate', roles: ['researcher', 'analyst', 'reviewer'] },
]

interface RoleMeta {
  readonly id: string
  readonly nameKey: string
  readonly abilityKey: string
}

const ROLE_META: readonly RoleMeta[] = [
  { id: 'planner', nameKey: 'role.planner.name', abilityKey: 'role.planner.ability' },
  { id: 'implementer', nameKey: 'role.implementer.name', abilityKey: 'role.implementer.ability' },
  { id: 'verifier', nameKey: 'role.verifier.name', abilityKey: 'role.verifier.ability' },
  { id: 'reviewer', nameKey: 'role.reviewer.name', abilityKey: 'role.reviewer.ability' },
  { id: 'researcher', nameKey: 'role.researcher.name', abilityKey: 'role.researcher.ability' },
  { id: 'analyst', nameKey: 'role.analyst.name', abilityKey: 'role.analyst.ability' },
  { id: 'writer', nameKey: 'role.writer.name', abilityKey: 'role.writer.ability' },
  { id: 'auditor', nameKey: 'role.auditor.name', abilityKey: 'role.auditor.ability' },
  { id: 'architect', nameKey: 'role.architect.name', abilityKey: 'role.architect.ability' },
  { id: 'tester', nameKey: 'role.tester.name', abilityKey: 'role.tester.ability' },
  { id: 'documenter', nameKey: 'role.documenter.name', abilityKey: 'role.documenter.ability' },
  { id: 'operator', nameKey: 'role.operator.name', abilityKey: 'role.operator.ability' },
]

function templateOf(id: string): QuickTemplate {
  return TEMPLATES.find(entry => entry.id === id) ?? TEMPLATES[0] as QuickTemplate
}

export function TeamQuickStart({ sessionId, t }: PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'agentTeams'>) {
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState('')
  const [template, setTemplate] = useState<string>(TEMPLATES[0]?.id ?? 'fix')
  const [roles, setRoles] = useState<string[]>([...(TEMPLATES[0]?.roles ?? [])])
  const [customRole, setCustomRole] = useState('')
  const [rolesOpen, setRolesOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [created, setCreated] = useState<string | undefined>()
  const multiRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!rolesOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      if (multiRef.current === null) return
      if (!multiRef.current.contains(event.target as Node)) setRolesOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown) }
  }, [rolesOpen])

  const reset = (): void => {
    setGoal('')
    setError('')
    setBlocked(false)
    setCreated(undefined)
    setBusy(false)
    setRolesOpen(false)
  }
  const chooseTemplate = (id: string): void => {
    setTemplate(id)
    setRoles([...templateOf(id).roles])
  }
  const toggleRole = (role: string): void => {
    setRoles((current) => current.includes(role) ? current.filter(entry => entry !== role) : [...current, role])
  }
  const roleName = (id: string): string => {
    const meta = ROLE_META.find(entry => entry.id === id)
    return meta === undefined ? id : t(meta.nameKey as Parameters<typeof t>[0])
  }
  const addCustomRole = (): void => {
    const trimmed = customRole.trim()
    if (trimmed === '') return
    setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed])
    setCustomRole('')
  }
  const submit = async (replace: boolean): Promise<void> => {
    const trimmed = goal.trim()
    if (trimmed === '') { setError(t('quickstart.goalRequired')); return }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/plugins/dsh-agent-teams/quick-start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, goal: trimmed, template, roles, replace }),
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; teamId?: string; error?: string } | null
      if (!response.ok || body?.ok !== true) {
        const raw = body?.error ?? `HTTP ${response.status}`
        const existing = /already lead team/i.test(raw)
        setBlocked(existing)
        throw new Error(existing ? t('quickstart.teamExists') : raw)
      }
      setCreated(body.teamId ?? '')
      setGoal('')
      window.setTimeout(() => { setOpen(false); reset() }, 1400)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={css.entry} data-quick-start-entry title={t('quickstart.entryTitle')} onClick={() => { setOpen(true); setError(''); setBlocked(false); setCreated(undefined) }}>
        <span aria-hidden>⛩</span>{t('quickstart.entry')}
      </button>
      <Modal
        open={open}
        onClose={() => { if (!busy) { setOpen(false); reset() } }}
        title={t('quickstart.title')}
        closeLabel={t('quickstart.cancel')}
        footer={(
          <span className={css.actions}>
            <button type="button" disabled={busy} onClick={() => { setOpen(false); reset() }}>{t('quickstart.cancel')}</button>
            <button type="button" disabled={busy} data-primary onClick={() => { void submit(false) }}>
              {busy ? t('quickstart.busy') : t('quickstart.submit')}
            </button>
          </span>
        )}
      >
        <div className={css.form}>
          <p className={css.hint}>{t('quickstart.desc')}</p>
          <label className={css.field}>
            <span>{t('quickstart.template')}</span>
            <select value={template} disabled={busy} onChange={(event) => { chooseTemplate(event.target.value) }}>
              {TEMPLATES.map(entry => <option key={entry.id} value={entry.id}>{t(entry.labelKey)}</option>)}
            </select>
            <small className={css.templateDesc}>{t(templateOf(template).descKey as Parameters<typeof t>[0])}</small>
          </label>
          <label className={css.field}>
            <span>{t('quickstart.goal')}</span>
            <textarea
              value={goal}
              rows={3}
              autoFocus
              disabled={busy}
              placeholder={t('quickstart.goalPlaceholder')}
              onChange={(event) => { setGoal(event.target.value) }}
            />
          </label>
          <div className={css.field}>
            <span>{t('quickstart.roles')}</span>
            <div className={css.multi} ref={multiRef}>
              <button
                type="button"
                className={css.multiTrigger}
                data-control="quickstart-roles"
                aria-expanded={rolesOpen}
                aria-haspopup="listbox"
                disabled={busy}
                onClick={() => { setRolesOpen((current) => !current) }}
              >
                <span className={css.chips}>
                  {roles.length === 0
                    ? <span className={css.placeholder}>{t('quickstart.rolesEmpty')}</span>
                    : roles.map(role => <span key={role} className={css.chip}>{roleName(role)}</span>)}
                </span>
                <span className={css.caret} aria-hidden>▾</span>
              </button>
              {rolesOpen && (
                <div className={css.multiPanel} role="listbox" aria-multiselectable="true" aria-label={t('quickstart.roles')}>
                  {ROLE_META.map(meta => (
                    <label key={meta.id} className={css.option}>
                      <input type="checkbox" checked={roles.includes(meta.id)} onChange={() => { toggleRole(meta.id) }} />
                      <span className={css.optionName}>{t(meta.nameKey as Parameters<typeof t>[0])}</span>
                      <span className={css.optionId}>{meta.id}</span>
                      <span className={css.optionAbility}>{t(meta.abilityKey as Parameters<typeof t>[0])}</span>
                    </label>
                  ))}
                  <div className={css.customRow}>
                    <input
                      value={customRole}
                      placeholder={t('quickstart.customRole')}
                      onChange={(event) => { setCustomRole(event.target.value) }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') { event.preventDefault(); addCustomRole() }
                      }}
                    />
                    <button type="button" disabled={customRole.trim() === ''} onClick={addCustomRole}>{t('quickstart.addRole')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {error !== '' && <p className={css.error} role="alert">{error}</p>}
          {blocked && (
            <p className={css.replaceRow}>
              <span>{t('quickstart.replaceHint')}</span>
              <button type="button" disabled={busy} onClick={() => { void submit(true) }}>{t('quickstart.replace')}</button>
            </p>
          )}
          {created !== undefined && <p className={css.success} role="status">{t('quickstart.created', { team: created })}</p>}
        </div>
      </Modal>
    </>
  )
}
