import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { ISidebarRight } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ActivityTeam } from './activity-monitor.ts';
import type { AgentTeamsTranslate } from './locales.ts';
export declare function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember, sidebar, tabKind, }: {
    /** 无队伍时缺省：浮层仍常驻，渲染一座只有掌门的空洞府。 */
    readonly team?: ActivityTeam;
    readonly t: AgentTeamsTranslate;
    /** 当前会话；应用级浮层在个别宿主上可能拿不到，此时只能渲染空洞府。 */
    readonly sessionId?: SessionId;
    readonly modelDirectories: ModelDirectoryResolver;
    readonly openMember: (parentId: SessionId, childId: SessionId) => void;
    /** 右侧栏服务：归栏时在这里打开洞府页面；缺失时只收成令牌。 */
    readonly sidebar?: ISidebarRight;
    /** 洞府页面在右侧栏的 kind。 */
    readonly tabKind?: string;
}): import("react").JSX.Element | null;
