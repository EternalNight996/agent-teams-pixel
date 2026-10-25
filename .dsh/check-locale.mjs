import { readFileSync } from 'node:fs'

const source = readFileSync('src/client/index.tsx', 'utf8')
console.log('inject:', source.includes("'uiConversation', 'slots', 'sessions', 'locale', 'modelDirectories'"))
console.log('events:', source.includes('ctx.uiConversation.events.register(agentTeamsCardDefinition)'))
console.log('locale.register:', source.includes('ctx.locale.register(AGENT_TEAMS_LOCALE_NAMESPACE, { zh, en })'))
console.log('count:', source.match(/locale:\s*AGENT_TEAMS_LOCALE_NAMESPACE/gu)?.length)
