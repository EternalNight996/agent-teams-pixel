/** Click-to-dispatch entry: a header button that stages a plan from a small form. */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './QuickStartDialog.module.css'

interface QuickTemplate {
  readonly id: string
  readonly labelKey: 'quickstart.tplFix' | 'quickstart.tplFeat' | 'quickstart.tplResearch' | 'quickstart.tplAudit'
  readonly roles: readonly string[]
}

const TEMPLATES: readonly QuickTemplate[] = [
  { id: 'fix', labelKey: 'quickstart.tplFix', roles: ['implementer', 'verifier', 'reviewer'] },
  { id: 'feat', labelKey: 'quickstart.tplFeat', roles: ['planner', 'implementer', 'verifier', 'reviewer'] },
  { id: 'research', labelKey: 'quickstart.tplResearch', roles: ['researcher', 'analyst', 'writer', 'reviewer'] },
  { id: 'audit', labelKey: 'quickstart.tplAudit', roles: ['auditor', 'reviewer'] },
]

/** Roles offered by the multi-select; custom names can be added on top. */
const ROLE_OPTIONS: readonly string[] = [
  'planner', 'implementer', 'verifier', 'reviewer',
  'researcher', 'analyst', 'writer', 'auditor',
  'architect', 'tester', 'documenter', 'operator',
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
  const addCustomRole = (): void => {
    const trimmed = customRole.trim()
    if (trimmed === '') return
    setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed])
    setCustomRole('')
  }
  const submit = async (): Promise<void> => {
    const trimmed = goal.trim()
    if (trimmed === '') { setError(t('quickstart.goalRequired')); return }
    setBusy(true)
    setError('')
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
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; teamId?: string; error?: string } | null
      if (!response.ok || body?.ok !== true) {
        const raw = body?.error ?? `HTTP ${response.status}`
        throw new Error(/already lead team/i.test(raw) ? t('quickstart.teamExists') : raw)
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
      <button type="button" className={css.entry} data-quick-start-entry title={t('quickstart.entryTitle')} onClick={() => { setOpen(true); setError(''); setCreated(undefined) }}>
        <span aria-hidden>＋</span>{t('quickstart.entry')}
      </button>
      <Modal
        open={open}
        onClose={() => { if (!busy) { setOpen(false); reset() } }}
        title={t('quickstart.title')}
        closeLabel={t('quickstart.cancel')}
        footer={(
          <span className={css.actions}>
            <button type="button" disabled={busy} onClick={() => { setOpen(false); reset() }}>{t('quickstart.cancel')}</button>
            <button type="button" disabled={busy} data-primary onClick={() => { void submit() }}>
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
                    : roles.map(role => <span key={role} className={css.chip}>{role}</span>)}
                </span>
                <span className={css.caret} aria-hidden>▾</span>
              </button>
              {rolesOpen && (
                <div className={css.multiPanel} role="listbox" aria-multiselectable="true" aria-label={t('quickstart.roles')}>
                  {ROLE_OPTIONS.map(role => (
                    <label key={role} className={css.option}>
                      <input type="checkbox" checked={roles.includes(role)} onChange={() => { toggleRole(role) }} />
                      <span>{role}</span>
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
          {created !== undefined && <p className={css.success} role="status">{t('quickstart.created', { team: created })}</p>}
        </div>
      </Modal>
    </>
  )
}
