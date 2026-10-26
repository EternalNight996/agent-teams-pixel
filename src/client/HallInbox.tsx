/**
 * 掌门收件箱：洞府「收信」页的消息列表。
 *
 * 从 SectHallOverlay 里抽出来，一是集中处理空状态与键盘可达性，二是能在
 * SSR 测试里验证消息按文本渲染（不会被当成 HTML 执行）。
 */
import type { ActivityMessage } from './activity-monitor.ts'
import type { AgentTeamsTranslate } from './locales.ts'
import css from './SectHallOverlay.module.css'

export function HallInbox({ messages, t }: {
  readonly messages: readonly ActivityMessage[]
  readonly t: AgentTeamsTranslate
}) {
  if (messages.length === 0) {
    return <p className={css.settingsHint}>{t('workspace.inboxEmpty')}</p>
  }
  return (
    <ul className={css.inboxList} tabIndex={0} aria-label={t('workspace.inbox')}>
      {messages.map((message, index) => (
        <li key={`${index}:${message.from}`} className={css.inboxRow}>
          <span className={css.inboxFrom}>{message.from}</span>
          <span className={css.inboxText}>{message.content}</span>
        </li>
      ))}
    </ul>
  )
}
