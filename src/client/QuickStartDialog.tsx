/** Click-to-dispatch entry: a header button that stages a plan from a small form. */
import { useState } from 'react'
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

function templateOf(id: string): QuickTemplate {
  return TEMPLATES.find(entry => entry.id === id) ?? TEMPLATES[0] as QuickTemplate
}

export function TeamQuickStart({ sessionId, t }: PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'agentTeams'>) {
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState('')
  const [template, setTemplate] = useState<string>(TEMPLATES[0]?.id ?? 'fix')
  const [rolesText, setRolesText] = useState<string>(TEMPLATES[0]?.roles.join(', ') ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<string | undefined>()

  const reset = (): void => {
    setGoal('')
    setError('')
    setCreated(undefined)
    setBusy(false)
  }
  const chooseTemplate = (id: string): void => {
    setTemplate(id)
    setRolesText(templateOf(id).roles.join(', '))
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
          roles: rolesText.split(/[,，\s]+/).map(role => role.trim()).filter(role => role !== ''),
        }),
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; teamId?: string; error?: string } | null
      if (!response.ok || body?.ok !== true) throw new Error(body?.error ?? `HTTP ${response.status}`)
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
          <label className={css.field}>
            <span>{t('quickstart.roles')}</span>
            <input value={rolesText} disabled={busy} onChange={(event) => { setRolesText(event.target.value) }} />
          </label>
          {error !== '' && <p className={css.error} role="alert">{error}</p>}
          {created !== undefined && <p className={css.success} role="status">{t('quickstart.created', { team: created })}</p>}
        </div>
      </Modal>
    </>
  )
}
