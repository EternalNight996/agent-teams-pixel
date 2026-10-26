/**
 * Server-side quick-start plans for the click-to-dispatch entry.
 *
 * The Web dialog collects a goal plus an optional template and roster; this
 * module turns that into the same staged plan shape the captain tool accepts,
 * so the host never invents a second team model.
 */
/** One built-in template: default roles and a small task DAG. */
export declare const SECT_NAMES: Record<string, string>;
export declare const ROLE_NAMES: Record<string, string>;
export interface QuickStartTemplate {
    readonly id: string;
    readonly label: string;
    readonly roles: readonly string[];
    readonly tasks: readonly {
        readonly id: string;
        readonly subject: string;
        readonly role: string;
        readonly description: string;
        /** Expected artifact/acceptance, appended to the staged task description. */
        readonly expected?: string;
        readonly dependencies?: readonly string[];
    }[];
}
export declare const QUICK_START_TEMPLATES: readonly QuickStartTemplate[];
export interface QuickStartPlan {
    readonly teamName: string;
    readonly template: string;
    readonly members: readonly {
        name: string;
        role: string;
    }[];
    readonly tasks: readonly {
        id: string;
        subject: string;
        description: string;
        assignee: string;
        dependencies: string[];
    }[];
}
/** Build the staged plan a quick-start request turns into. */
export declare function buildQuickStartPlan(goal: string, templateId: string, requestedRoles?: readonly string[]): QuickStartPlan;
