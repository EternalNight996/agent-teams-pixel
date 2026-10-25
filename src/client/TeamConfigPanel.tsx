/** Read-only configuration view: roster, routing and task contracts. */
import type { AgentTeamsTranslate } from './locales.ts'
import type { ActivityTeam } from './activity-monitor.ts'
import css from './TeamConfigPanel.module.css'

function memberRoute(member: ActivityTeam['members'][number]): string {
  const parts = [member.provider, member.model].filter((part): part is string => typeof part === 'string' && part !== '')
  return parts.length > 0 ? parts.join(' / ') : '—'
}

export function TeamConfigPanel({ team, t }: { team: ActivityTeam; t: AgentTeamsTranslate }) {
  const completed = team.tasks.filter(task => task.status === 'completed').length
  const facts = [
    { label: t('config.team'), value: team.name, sub: team.teamId },
    { label: t('config.phase'), value: team.halted === true ? t('config.halted') : team.phase },
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
          <thead><tr><th>{t('config.name')}</th><th>{t('config.role')}</th><th>{t('config.model')}</th><th>{t('config.effort')}</th></tr></thead>
          <tbody>
            {team.members.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td className={css.mono}>{memberRoute(member)}</td>
                <td>{member.reasoningEffort ?? '—'}</td>
              </tr>
            ))}
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
                <td>{task.kind === undefined ? task.status : `${task.kind} · ${task.status}`}</td>
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
