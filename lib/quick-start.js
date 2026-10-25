/**
 * Server-side quick-start plans for the click-to-dispatch entry.
 *
 * The Web dialog collects a goal plus an optional template and roster; this
 * module turns that into the same staged plan shape the captain tool accepts,
 * so the host never invents a second team model.
 */
export const QUICK_START_TEMPLATES = [
    {
        id: 'fix',
        label: '修 Bug',
        roles: ['implementer', 'verifier', 'reviewer'],
        tasks: [
            { id: 'impl', subject: '实现修复', role: 'implementer', description: '复现问题、定位根因并给出最小修复，必要时补测试。' },
            { id: 'verify', subject: '验证修复', role: 'verifier', description: '运行相关测试与回归，确认问题消失且无新增失败。', dependencies: ['impl'] },
            { id: 'review', subject: '审查修复', role: 'reviewer', description: '审查改动的正确性、范围与风险，给出结论。', dependencies: ['verify'] },
        ],
    },
    {
        id: 'feat',
        label: '新功能',
        roles: ['planner', 'implementer', 'verifier', 'reviewer'],
        tasks: [
            { id: 'req', subject: '明确需求与验收', role: 'planner', description: '把目标拆成可验收的需求条目，列出边界与非目标。' },
            { id: 'impl', subject: '实现功能', role: 'implementer', description: '按需求实现，保持改动范围可审查。', dependencies: ['req'] },
            { id: 'verify', subject: '验证功能', role: 'verifier', description: '运行测试并覆盖新增路径，记录证据。', dependencies: ['impl'] },
            { id: 'review', subject: '审查功能', role: 'reviewer', description: '对照需求逐条验收，指出缺口与风险。', dependencies: ['verify'] },
        ],
    },
    {
        id: 'research',
        label: '调研',
        roles: ['researcher', 'analyst', 'writer', 'reviewer'],
        tasks: [
            { id: 'r1', subject: '第一条取证线', role: 'researcher', description: '从一手来源收集证据，给出链接与原文摘录。' },
            { id: 'r2', subject: '第二条取证线', role: 'analyst', description: '与第一条不重叠的角度补充证据。' },
            { id: 'r3', subject: '第三条取证线', role: 'writer', description: '补充边界情况与反例。' },
            { id: 'synth', subject: '汇总结论', role: 'analyst', description: '合并三条取证线，标注冲突与不确定性。', dependencies: ['r1', 'r2', 'r3'] },
            { id: 'review', subject: '审查结论', role: 'reviewer', description: '核对每条结论是否都有证据支撑。', dependencies: ['synth'] },
        ],
    },
    {
        id: 'audit',
        label: '审计',
        roles: ['auditor', 'reviewer'],
        tasks: [
            { id: 'a1', subject: '审计（只读）', role: 'auditor', description: '只读审计并逐条给出 file:line 证据，禁止修改被审文件。' },
            { id: 'a2', subject: '交叉复核', role: 'auditor', description: '复核前一条结论，补充遗漏与反例。', dependencies: ['a1'] },
            { id: 'review', subject: '审查审计结论', role: 'reviewer', description: '检查每条结论的证据强度与可复现性。', dependencies: ['a2'] },
        ],
    },
];
function templateOf(id) {
    return QUICK_START_TEMPLATES.find(template => template.id === id) ?? QUICK_START_TEMPLATES[0];
}
function shortGoal(goal, max) {
    const flat = goal.replace(/\s+/g, ' ').trim();
    return flat.length <= max ? flat : `${flat.slice(0, Math.max(1, max - 1))}…`;
}
/** Build the staged plan a quick-start request turns into. */
export function buildQuickStartPlan(goal, templateId, requestedRoles) {
    const template = templateOf(templateId);
    const cleaned = [...new Set((requestedRoles ?? []).map(role => role.trim()).filter(role => role !== ''))];
    const roles = cleaned.length > 0 ? cleaned : [...template.roles];
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const members = roles.map(role => ({ name: role, role }));
    const tasks = template.tasks.map((task, index) => ({
        id: task.id,
        subject: `${task.subject}：${shortGoal(goal, 40)}`,
        description: `${task.description}\n\n目标：${goal}`,
        assignee: roles.includes(task.role) ? task.role : roles[index % roles.length],
        dependencies: [...(task.dependencies ?? [])],
    }));
    return { teamName: `quick-${template.id}-${stamp}`, template: template.id, members, tasks };
}
