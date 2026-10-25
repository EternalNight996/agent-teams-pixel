/**
 * Server-side quick-start plans for the click-to-dispatch entry.
 *
 * The Web dialog collects a goal plus an optional template and roster; this
 * module turns that into the same staged plan shape the captain tool accepts,
 * so the host never invents a second team model.
 */
/** One built-in template: default roles and a small task DAG. */
export const SECT_NAMES = {
    fix: '斗法宗', feat: '开山宗', research: '寻仙宗', audit: '巡查宗',
    build: '炼器宗', array: '布阵宗', docs: '传道宗', debate: '论道宗',
};
export const ROLE_NAMES = {
    planner: '军师', implementer: '剑修', verifier: '丹修', reviewer: '执法长老',
    researcher: '散修', analyst: '推演师', writer: '书记', auditor: '巡查使',
    architect: '阵修', tester: '体修', documenter: '传道长老', operator: '炼器师',
    // 门派预设新增的 8 个道途：缺了它们，成员名会退化成裸角色 id（demon/poisoner）。
    talisman: '符修', healer: '医修', beastmaster: '驭兽师', puppeteer: '傀儡师',
    musician: '音修', poisoner: '毒修', monk: '佛修', demon: '魔修',
};
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
        id: 'build',
        label: '构建发布',
        roles: ['implementer', 'verifier', 'operator'],
        tasks: [
            { id: 'impl', subject: '整备待发布改动', role: 'implementer', description: '收敛待发布改动，确认无未完成或冲突项。' },
            { id: 'verify', subject: '发布前验证', role: 'verifier', description: '跑通构建与测试，记录版本与产物指纹。', dependencies: ['impl'] },
            { id: 'release', subject: '打包发布', role: 'operator', description: '构建产物、打标签、输出发布说明与回滚方案。', dependencies: ['verify'] },
        ],
    },
    {
        id: 'array',
        label: '架构重构',
        roles: ['architect', 'implementer', 'verifier', 'reviewer'],
        tasks: [
            { id: 'design', subject: '画阵定界', role: 'architect', description: '给出目标结构、边界与迁移步骤，标注风险点。' },
            { id: 'refactor', subject: '依阵改构', role: 'implementer', description: '按设计小步重构，保持可回退与可审查。', dependencies: ['design'] },
            { id: 'verify', subject: '验阵', role: 'verifier', description: '验证行为不变与性能不回退，记录证据。', dependencies: ['refactor'] },
            { id: 'review', subject: '审阵', role: 'reviewer', description: '审查边界、耦合与遗留风险。', dependencies: ['verify'] },
        ],
    },
    {
        id: 'docs',
        label: '文档传道',
        roles: ['writer', 'documenter', 'reviewer'],
        tasks: [
            { id: 'outline', subject: '列纲', role: 'writer', description: '确定读者、目标与章节结构。' },
            { id: 'draft', subject: '成文', role: 'documenter', description: '按纲撰写，附示例与可运行命令。', dependencies: ['outline'] },
            { id: 'review', subject: '审阅', role: 'reviewer', description: '核对事实、命令可跑与表述一致。', dependencies: ['draft'] },
        ],
    },
    {
        id: 'debate',
        label: '方案论道',
        roles: ['researcher', 'analyst', 'reviewer'],
        tasks: [
            { id: 'prop', subject: '立论', role: 'researcher', description: '给出方案主张、依据与适用边界。' },
            { id: 'counter', subject: '驳论', role: 'analyst', description: '从反方立场找反例与成本，不重复立论依据。' },
            { id: 'synth', subject: '合论', role: 'analyst', description: '合并正反两方，给出推荐与残余风险。', dependencies: ['prop', 'counter'] },
            { id: 'review', subject: '裁断', role: 'reviewer', description: '判断论据强度与推荐是否成立。', dependencies: ['synth'] },
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
    const members = roles.map(role => ({ name: ROLE_NAMES[role] ?? role, role }));
    const tasks = template.tasks.map((task, index) => ({
        id: task.id,
        subject: `${task.subject}：${shortGoal(goal, 40)}`,
        description: `${task.description}\n\n目标：${goal}`,
        assignee: ROLE_NAMES[roles.includes(task.role) ? task.role : roles[index % roles.length]] ?? (roles.includes(task.role) ? task.role : roles[index % roles.length]),
        dependencies: [...(task.dependencies ?? [])],
    }));
    return { teamName: `${SECT_NAMES[template.id] ?? '修仙宗'}·${stamp.slice(8)}`, template: template.id, members, tasks };
}
