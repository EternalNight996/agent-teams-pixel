/** Read-only configuration view: roster, routing and task contracts. */
import type { AgentTeamsTranslate } from './locales.ts'
import type { ActivityTeam } from './activity-monitor.ts'
import { cultivationFromXp, memberKey } from './cultivation.ts'
import { useCultivationVersion, xpOf } from './cultivation-store.ts'
import { roleLabel } from './role-labels.ts'
import css from './TeamConfigPanel.module.css'

function memberRoute(member: ActivityTeam['members'][number]): string {
  const parts = [member.provider, member.model].filter((part): part is string => typeof part === 'string' && part !== '')
  return parts.length > 0 ? parts.join(' / ') : '—'
}

const STATUS_KEYS: Record<string, Parameters<AgentTeamsTranslate>[0]> = {
  pending: 'task.status.pending',
  claimed: 'task.status.claimed',
  running: 'task.status.inProgress',
  in_progress: 'task.status.inProgress',
  completed: 'task.status.completed',
  failed: 'task.status.failed',
  cancelled: 'task.status.cancelled',
}

const KIND_KEYS: Record<string, Parameters<AgentTeamsTranslate>[0]> = {
  work: 'config.kind.work',
  requirements: 'config.kind.requirements',
  implementation: 'config.kind.implementation',
  verification: 'config.kind.verification',
  review: 'config.kind.review',
  repair: 'config.kind.repair',
  integration: 'config.kind.integration',
}

function statusLabel(status: string, t: AgentTeamsTranslate): string {
  const key = STATUS_KEYS[status]
  return key === undefined ? status : t(key)
}

function kindLabel(kind: string | undefined, t: AgentTeamsTranslate): string {
  if (kind === undefined) return ''
  const key = KIND_KEYS[kind]
  return key === undefined ? kind : t(key)
}

export function TeamConfigPanel({ team, t }: { team: ActivityTeam; t: AgentTeamsTranslate }) {
  useCultivationVersion()
  const completed = team.tasks.filter(task => task.status === 'completed').length
  // 进度页已显示“已完成”时，道统页的阶段也必须一致，不能还写“进行中”。
  const allCompleted = team.tasks.length > 0 && completed === team.tasks.length
  const facts = [
    { label: t('config.team'), value: team.name, sub: team.teamId },
    { label: t('config.phase'), value: team.halted === true
      ? t('config.halted')
      : t(team.phase === 'staged' ? 'config.phaseStaged' : allCompleted ? 'config.phaseCompleted' : 'config.phaseRunning') },
    { label: t('config.members'), value: String(team.members.length) },
    { label: t('config.tasks'), value: `${completed}/${team.tasks.length}` },
  ]
  return (
    <section className={css.panel} data-team-config>
      <div className={css.facts}>
        {facts.map(fact => (
          <div key={fact.label} className={css.fact}>
            <span className={css.label}>{fact.label}</span>
            <strong className={css.value}>{fact.value}</strong>
            {fact.sub !== undefined && <span className={css.sub}>{fact.sub}</span>}
          </div>
        ))}
      </div>
      <h3 className={css.heading}>{t('config.members')}</h3>
      <div className={css.tableWrap}>
        <table className={css.table}>
          <thead><tr><th>{t('config.name')}</th><th>{t('config.role')}</th><th>{t('config.realm')}</th><th>{t('config.model')}</th><th>{t('config.effort')}</th></tr></thead>
          <tbody>
            {team.members.map(member => {
              const cultivation = cultivationFromXp(xpOf(memberKey(member.name)))
              return (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{roleLabel(member.role, member.name, t)}</td>
                  <td>{`Lv.${cultivation.level} ${t(cultivation.rankKey)}`}</td>
                  <td className={css.mono}>{memberRoute(member)}</td>
                  <td>{member.reasoningEffort ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <h3 className={css.heading}>{t('config.tasks')}</h3>
      <div className={css.tableWrap}>
        <table className={css.table}>
          <thead><tr><th>{t('config.task')}</th><th>{t('config.assignee')}</th><th>{t('config.status')}</th><th>{t('config.deps')}</th></tr></thead>
          <tbody>
            {team.tasks.map(task => (
              <tr key={task.id}>
                <td>{task.subject}</td>
                <td>{task.assignee === '' ? t('config.unassigned') : task.assignee}</td>
                <td>{task.kind === undefined ? statusLabel(task.status, t) : `${kindLabel(task.kind, t)} · ${statusLabel(task.status, t)}`}</td>
                <td className={css.mono}>{task.dependencies.length === 0 ? '—' : task.dependencies.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={css.hint}>{team.phase === 'staged' ? t('config.stagedHint') : t('config.hint')}</p>
    </section>
  )
}
