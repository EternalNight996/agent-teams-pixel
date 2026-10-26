/** Click-to-dispatch entry: a header button that stages a plan from a small wizard. */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import css from './QuickStartDialog.module.css'
import { memberArtUrl } from './artwork.ts'
import { OPEN_HALL_SHEET_EVENT } from './hall-events.ts'
import type { AgentTeamsTranslate } from './locales.ts'
import { TEAM_CREATED_EVENT } from './team-reveal.ts'
import { ROLE_META } from './role-labels.ts'
import { SECT_PRESETS, randomSect, sectPreset } from './sects.ts'

type TplKey = 'quickstart.tplFix' | 'quickstart.tplFeat' | 'quickstart.tplResearch' | 'quickstart.tplAudit' | 'quickstart.tplFullstack'
  | 'quickstart.tplHardening' | 'quickstart.tplBuild' | 'quickstart.tplArray' | 'quickstart.tplDocs' | 'quickstart.tplDebate'

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
  { id: 'fullstack', labelKey: 'quickstart.tplFullstack', descKey: 'quickstart.desc.fullstack', roles: ['integrator', 'frontend', 'backend', 'verifier', 'reviewer'] },
  { id: 'hardening', labelKey: 'quickstart.tplHardening', descKey: 'quickstart.desc.hardening', roles: ['auditor', 'security', 'verifier', 'reviewer'] },
  { id: 'audit', labelKey: 'quickstart.tplAudit', descKey: 'quickstart.desc.audit', roles: ['auditor', 'reviewer'] },
  { id: 'build', labelKey: 'quickstart.tplBuild', descKey: 'quickstart.desc.build', roles: ['implementer', 'verifier', 'operator'] },
  { id: 'array', labelKey: 'quickstart.tplArray', descKey: 'quickstart.desc.array', roles: ['architect', 'implementer', 'verifier', 'reviewer'] },
  { id: 'docs', labelKey: 'quickstart.tplDocs', descKey: 'quickstart.desc.docs', roles: ['writer', 'documenter', 'reviewer'] },
  { id: 'debate', labelKey: 'quickstart.tplDebate', descKey: 'quickstart.desc.debate', roles: ['researcher', 'analyst', 'reviewer'] },
]

/** 开宗四步：道统 → 立派之志 → 宗门 → 立誓。 */
const STEPS = ['doctrine', 'vow', 'sect', 'oath'] as const
type Step = typeof STEPS[number]
const STEP_LABEL: Record<Step, 'quickstart.stepDoctrine' | 'quickstart.stepVow' | 'quickstart.stepSect' | 'quickstart.stepOath'> = {
  doctrine: 'quickstart.stepDoctrine',
  vow: 'quickstart.stepVow',
  sect: 'quickstart.stepSect',
  oath: 'quickstart.stepOath',
}

function templateOf(id: string): QuickTemplate {
  return TEMPLATES.find(entry => entry.id === id) ?? TEMPLATES[0] as QuickTemplate
}

export function QuickStartWizard({ sessionId, t, onDone, onFounded }: {
  readonly sessionId: SessionId
  readonly t: AgentTeamsTranslate
  readonly onDone?: () => void
  readonly onFounded?: () => void
}) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [template, setTemplate] = useState<string>(TEMPLATES[0]?.id ?? 'fix')
  const [roles, setRoles] = useState<string[]>([...(TEMPLATES[0]?.roles ?? [])])
  // 门派有两种玩法：用户选一个预设，或让系统随机动态分配（再点一次重抽）。
  const [sectMode, setSectMode] = useState<'random' | 'custom' | string>('random')
  const [rolledSect, setRolledSect] = useState<string>(() => randomSect().id)
  const [customRole, setCustomRole] = useState('')
  const [rolesOpen, setRolesOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [created, setCreated] = useState<string | undefined>()
  const multiRef = useRef<HTMLDivElement | null>(null)
  const goalRef = useRef<HTMLTextAreaElement | null>(null)
  const foundedTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => {
    if (foundedTimer.current !== undefined) window.clearTimeout(foundedTimer.current)
  }, [])

  useEffect(() => {
    if (!rolesOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      if (multiRef.current === null) return
      if (!multiRef.current.contains(event.target as Node)) setRolesOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown) }
  }, [rolesOpen])

  const close = (): void => {
    if (busy) return
    onDone?.()
  }
  const activeSect = sectMode === 'custom' ? undefined : sectPreset(sectMode === 'random' ? rolledSect : sectMode)
  const sectRoles = activeSect?.roles ?? roles
  const chooseTemplate = (id: string): void => {
    setTemplate(id)
    // 门派已经配好道途时，换模板不再覆盖这套道途（自定义模式才跟随模板）。
    if (sectMode === 'custom') setRoles([...templateOf(id).roles])
  }
  const chooseSect = (id: string): void => {
    setSectMode(id)
    const preset = sectPreset(id)
    if (preset !== undefined) setRoles([...preset.roles])
  }
  const rollSect = (): void => {
    const next = randomSect(rolledSect)
    setRolledSect(next.id)
    setSectMode('random')
    setRoles([...next.roles])
  }
  const chooseCustom = (): void => {
    setSectMode('custom')
    if (roles.length === 0) setRoles([...templateOf(template).roles])
  }
  const toggleRole = (role: string): void => {
    setRoles((current) => current.includes(role) ? current.filter(entry => entry !== role) : [...current, role])
  }
  const roleName = (id: string): string => {
    const meta = ROLE_META.find(entry => entry.id === id)
    return meta === undefined ? id : t(meta.nameKey)
  }
  /** 一枚修士 chip：优先用像素人立绘，找不到对应道途时退回首字徽记。 */
  const personChip = (role: string) => {
    const label = roleName(role)
    const art = memberArtUrl(label, role)
    return (
      <span key={role} className={css.chip} title={role}>
        {art === null
          ? <span className={css.chipLetter} aria-hidden>{label.slice(0, 1)}</span>
          : <img className={css.chipAvatar} src={art} alt="" />}
        {label}
      </span>
    )
  }
  const addCustomRole = (): void => {
    const trimmed = customRole.trim()
    if (trimmed === '') return
    setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed])
    setCustomRole('')
  }

  const goalTrimmed = goal.trim()
  const currentStep: Step = STEPS[step] ?? STEPS[0] as Step
  const canAdvance = useMemo(() => {
    if (busy) return false
    switch (currentStep) {
      case 'vow': return goalTrimmed.length >= 2
      case 'sect': return sectMode !== 'custom' || sectRoles.length > 0
      default: return true
    }
  }, [busy, currentStep, goalTrimmed, sectMode, sectRoles.length])

  const submit = async (replace: boolean): Promise<void> => {
    if (goalTrimmed === '') { setError(t('quickstart.goalRequired')); setStep(1); return }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/plugins/dsh-pixel-team/quick-start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, goal: goalTrimmed, template, roles: sectMode === 'custom' ? roles : [...(activeSect?.roles ?? roles)], replace }),
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; teamId?: string; error?: string } | null
      if (!response.ok || body?.ok !== true) {
        const raw = body?.error ?? ('HTTP ' + response.status)
        const existing = /already lead team/i.test(raw)
        setBlocked(existing)
        throw new Error(existing ? t('quickstart.teamExists') : raw)
      }
      setCreated(t('quickstart.created', {
        team: body.teamId ?? '',
        sect: activeSect === undefined ? t('quickstart.sectCustomPicked') : t(activeSect.nameKey),
      }))
      if (body.teamId !== undefined) window.dispatchEvent(new CustomEvent(TEAM_CREATED_EVENT, { detail: { teamId: body.teamId } }))
      setGoal('')
      foundedTimer.current = window.setTimeout(() => { onFounded?.() }, 1400)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const goTo = (next: number): void => {
    if (busy) return
    setError('')
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)))
  }
  const next = (): void => {
    if (step === STEPS.length - 1) { void submit(false); return }
    if (!canAdvance) return
    goTo(step + 1)
  }
  const doctrineName = t(templateOf(template).labelKey)
  const sectName = activeSect === undefined ? t('quickstart.sectCustom') : t(activeSect.nameKey)
  const roster = sectMode === 'custom' ? roles : [...sectRoles]

  return (
    <div className={css.wizard}>
      <div className={css.form}>
          <ol className={css.steps} aria-label={t('quickstart.title')}>
            {STEPS.map((entry, index) => {
              const state = index === step ? 'current' : index < step ? 'done' : 'todo'
              return (
                <li key={entry} className={css.stepItem} data-state={state}>
                  <button
                    type="button"
                    className={css.stepButton}
                    data-control={'quickstart-step-' + index}
                    aria-current={state === 'current' ? 'step' : undefined}
                    disabled={busy || index > step}
                    onClick={() => { goTo(index) }}
                  >
                    <span className={css.stepDot}>{index < step ? '✓' : index + 1}</span>
                    <span className={css.stepLabel}>{t(STEP_LABEL[entry])}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          {currentStep === 'doctrine' && (
            <section className={css.stepPane} data-step="doctrine">
              <p className={css.hint}>{t('quickstart.doctrineHint')}</p>
              <div className={css.templates} role="radiogroup" aria-label={t('quickstart.template')}>
                {TEMPLATES.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={template === entry.id}
                    className={css.templateCard}
                    data-control={'quickstart-template-' + entry.id}
                    disabled={busy}
                    onClick={() => { chooseTemplate(entry.id) }}
                  >
                    <span className={css.templateName}>{t(entry.labelKey)}</span>
                    <span className={css.templateDesc}>{t(entry.descKey as Parameters<typeof t>[0])}</span>
                    <span className={css.templateMeta}>{entry.roles.length} {t('quickstart.roleCount')}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {currentStep === 'vow' && (
            <section className={css.stepPane} data-step="vow">
              <p className={css.hint}>{t('quickstart.vowHint')}</p>
              <label className={css.field}>
                <span>{t('quickstart.goal')}</span>
                <textarea
                  ref={goalRef}
                  value={goal}
                  rows={5}
                  autoFocus
                  disabled={busy}
                  placeholder={t('quickstart.goalPlaceholder')}
                  onChange={(event) => { setGoal(event.target.value) }}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); next() }
                  }}
                />
              </label>
              <p className={css.goalMeta}>
                <span>{t('quickstart.goalLength', { count: goalTrimmed.length })}</span>
                <span>{t('quickstart.goalShortcut')}</span>
              </p>
            </section>
          )}

          {currentStep === 'sect' && (
            <section className={css.stepPane} data-step="sect">
              <p className={css.hint}>{t('quickstart.sectHint')}</p>
              <div className={css.field}>
                <span>{t('quickstart.sect')}</span>
                <div className={css.sectRow}>
                  <button type="button" className={css.sectChip} data-active={sectMode === 'random' || undefined} disabled={busy} onClick={rollSect}>
                    <span aria-hidden>🎲</span>{t('quickstart.sectRandom')}
                  </button>
                  {SECT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={css.sectChip}
                      data-active={sectMode === preset.id || undefined}
                      disabled={busy}
                      onClick={() => { chooseSect(preset.id) }}
                    >
                      {t(preset.nameKey)}
                    </button>
                  ))}
                  <button type="button" className={css.sectChip} data-active={sectMode === 'custom' || undefined} disabled={busy} onClick={chooseCustom}>
                    {t('quickstart.sectCustom')}
                  </button>
                </div>
                <small className={css.templateDesc}>
                  {sectMode === 'custom'
                    ? t('quickstart.sectCustomHint')
                    : sectMode === 'random'
                      ? t('quickstart.sectRolled', { sect: activeSect === undefined ? '' : t(activeSect.nameKey) })
                      : activeSect === undefined ? '' : t(activeSect.descKey)}
                </small>
                {sectMode !== 'custom' && (
                  <span className={css.sectRoster}>
                    {sectRoles.map(personChip)}
                  </span>
                )}
              </div>
              {sectMode === 'custom' && (
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
                          : roles.map(personChip)}
                      </span>
                      <span className={css.caret} aria-hidden>▾</span>
                    </button>
                    {rolesOpen && (
                      <div className={css.multiPanel} role="listbox" aria-multiselectable="true" aria-label={t('quickstart.roles')}>
                        {ROLE_META.map(meta => (
                          <label key={meta.id} className={css.option}>
                            <input type="checkbox" checked={roles.includes(meta.id)} onChange={() => { toggleRole(meta.id) }} />
                            {(() => {
                              const art = memberArtUrl(t(meta.nameKey), meta.id)
                              return art === null ? null : <img className={css.optionAvatar} src={art} alt="" />
                            })()}
                            <span className={css.optionName}>{t(meta.nameKey)}</span>
                            <span className={css.optionId}>{meta.id}</span>
                            <span className={css.optionAbility}>{t(meta.abilityKey)}</span>
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
              )}
            </section>
          )}

          {currentStep === 'oath' && (
            <section className={css.stepPane} data-step="oath">
              <p className={css.hint}>{t('quickstart.oathHint')}</p>
              <dl className={css.summary}>
                <div className={css.summaryRow}><dt>{t('quickstart.summaryDoctrine')}</dt><dd>{doctrineName}</dd></div>
                <div className={css.summaryRow}><dt>{t('quickstart.summarySect')}</dt><dd>{sectName}</dd></div>
                <div className={css.summaryRow}><dt>{t('quickstart.summaryRoster')}</dt><dd><span className={css.chips}>{roster.map(personChip)}</span></dd></div>
                <div className={css.summaryRow}><dt>{t('quickstart.summaryVow')}</dt><dd>{goalTrimmed}</dd></div>
              </dl>
              <p className={css.oath}>{t('quickstart.oathNotice')}</p>
            </section>
          )}

          {error !== '' && <p className={css.error} role="alert">{error}</p>}
          {blocked && (
            <p className={css.replaceRow}>
              <span>{t('quickstart.replaceHint')}</span>
              <button type="button" disabled={busy} onClick={() => { void submit(true) }}>{t('quickstart.replace')}</button>
            </p>
          )}
          {created !== undefined && <p className={css.success} role="status">{created}</p>}
      </div>
      <div className={css.wizardActions}>
        <button type="button" disabled={busy} onClick={close}>{t('quickstart.cancel')}</button>
        {step > 0 && (
          <button type="button" data-control="quickstart-back" disabled={busy} onClick={() => { goTo(step - 1) }}>{t('quickstart.back')}</button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" data-primary data-control="quickstart-next" disabled={!canAdvance} onClick={next}>
            {t('quickstart.next')}
          </button>
        ) : (
          <button type="button" data-primary data-control="quickstart-submit" disabled={busy || !canAdvance} onClick={() => { void submit(false) }}>
            {busy ? t('quickstart.busy') : t('quickstart.found')}
          </button>
        )}
      </div>
    </div>
  )
}

/** 对话头部的开宗入口：统一打开洞府里的内容气泡，不再弹独立窗口。 */
export function TeamQuickStart({ t }: PropsLocale<'agentTeams'>) {
  return (
    <button
      type="button"
      className={css.entry}
      data-quick-start-entry
      title={t('quickstart.entryTitle')}
      onClick={() => { window.dispatchEvent(new CustomEvent(OPEN_HALL_SHEET_EVENT, { detail: { action: 'start' } })) }}
    >
      <span aria-hidden>⛩</span>{t('quickstart.entry')}
    </button>
  )
}
