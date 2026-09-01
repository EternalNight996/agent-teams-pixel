/**
 * Bundled team presets. Each preset picks one leader role and a roster of
 * supporting roles; the captain uses this as a starting point when the user
 * asks "一键组队" or the captain itself decides a preset matches the goal.
 *
 * The catalog mirrors the upstream @dsh-ui-agents-pixe TEAM_PRESETS so
 * existing muscle memory works the same. Keys reference role ids in
 * `assets/agent-teams-pixel/roles-full.json` (agency-agents en + zh).
 */

export interface TeamPreset {
  /** Display name shown in the working-roles tab and the office floater. */
  readonly name: string
  /** Role id used as the leader. */
  readonly leader: string
  /** Role ids the captain should add as members when starting this preset. */
  readonly roles: readonly string[]
}

/** The 29 bundled presets. Keep in sync with upstream only on add/remove. */
export const TEAM_PRESETS: readonly TeamPreset[] = [
  { name: '研发团队', leader: 'project-management/project-manager-senior', roles: ['project-management/project-manager-senior', 'engineering/engineering-software-architect', 'engineering/engineering-backend-architect', 'engineering/engineering-frontend-developer', 'engineering/engineering-code-reviewer'] },
  { name: '科学团队', leader: 'academic/academic-study-planner', roles: ['academic/academic-study-planner', 'academic/academic-psychologist', 'academic/academic-historian', 'academic/academic-geographer'] },
  { name: '航天科研团队', leader: 'engineering/engineering-mechanical-design-engineer', roles: ['engineering/engineering-mechanical-design-engineer', 'engineering/engineering-embedded-firmware-engineer', 'engineering/engineering-fpga-digital-design-engineer', 'engineering/engineering-incident-response-commander'] },
  { name: '营销团队', leader: 'marketing/marketing-social-media-strategist', roles: ['marketing/marketing-social-media-strategist', 'marketing/marketing-content-creator', 'marketing/marketing-seo-specialist', 'marketing/marketing-xiaohongshu-operator'] },
  { name: '安全团队', leader: 'engineering/engineering-security-engineer', roles: ['engineering/engineering-security-engineer', 'engineering/engineering-threat-detection-engineer', 'specialized/data-privacy-officer', 'legal/legal-contract-reviewer'] },
  { name: '设计团队', leader: 'design/design-ux-architect', roles: ['design/design-ux-architect', 'design/design-ui-designer', 'design/design-ux-researcher', 'design/design-visual-storyteller'] },
  { name: '财务团队', leader: 'finance/finance-financial-analyst', roles: ['finance/finance-financial-analyst', 'finance/finance-financial-forecaster', 'finance/finance-fpa-analyst', 'finance/finance-fraud-detector'] },
  { name: '游戏开发团队', leader: 'game-development/game-designer', roles: ['game-development/game-designer', 'game-development/level-designer', 'game-development/narrative-designer', 'game-development/technical-artist', 'game-development/game-audio-engineer'] },
  { name: '供应链团队', leader: 'supply-chain/supply-chain-strategist', roles: ['supply-chain/supply-chain-strategist', 'supply-chain/supply-chain-inventory-forecaster', 'supply-chain/supply-chain-route-optimizer', 'supply-chain/supply-chain-vendor-evaluator'] },
  { name: '测试质量团队', leader: 'testing/testing-reality-checker', roles: ['testing/testing-reality-checker', 'testing/testing-api-tester', 'testing/testing-performance-benchmarker', 'testing/testing-accessibility-auditor'] },
  { name: '产品团队', leader: 'product/product-manager', roles: ['product/product-manager', 'product/product-sprint-prioritizer', 'product/product-feedback-synthesizer', 'product/product-trend-researcher'] },
  { name: '销售团队', leader: 'sales/sales-deal-strategist', roles: ['sales/sales-deal-strategist', 'sales/sales-account-strategist', 'sales/sales-pipeline-analyst', 'sales/sales-outbound-strategist'] },
  { name: '地理信息团队', leader: 'gis/gis-analyst', roles: ['gis/gis-analyst', 'gis/gis-cartography-designer', 'gis/gis-geoai-ml-engineer', 'gis/gis-3d-scene-developer'] },
  { name: '空间计算团队', leader: 'spatial-computing/spatial-computing-architect', roles: ['spatial-computing/spatial-computing-architect', 'spatial-computing/spatial-computing-3d-graphics-engineer', 'spatial-computing/spatial-computing-immersive-UX-designer', 'spatial-computing/spatial-computing-spatial-audio-engineer'] },
  { name: '医疗团队', leader: 'healthcare/healthcare-medical-researcher', roles: ['healthcare/healthcare-medical-researcher', 'healthcare/healthcare-clinical-pharmacist', 'healthcare/healthcare-medical-technologist', 'healthcare/healthcare-public-health-analyst'] },
  { name: '付费媒体团队', leader: 'paid-media/paid-media-strategist', roles: ['paid-media/paid-media-strategist', 'paid-media/paid-media-bid-manager', 'paid-media/paid-media-creative-director', 'paid-media/paid-media-analytics-engineer'] },
  { name: '支持团队', leader: 'support/support-customer-success', roles: ['support/support-customer-success', 'support/support-tech-support-specialist', 'support/support-community-manager', 'support/support-knowledge-base-manager'] },
  { name: '法律团队', leader: 'legal/legal-contract-reviewer', roles: ['legal/legal-contract-reviewer', 'legal/legal-compliance-officer', 'legal/legal-corporate-counsel', 'legal/legal-ip-counsel'] },
  { name: '运营团队', leader: 'specialized/operations-operations-manager', roles: ['specialized/operations-operations-manager', 'specialized/operations-process-optimizer', 'specialized/operations-vendor-manager', 'specialized/operations-facilities-manager'] },
  { name: '数据团队', leader: 'specialized/data-engineer', roles: ['specialized/data-engineer', 'specialized/data-data-scientist', 'specialized/data-data-analyst', 'specialized/data-database-administrator'] },
  { name: 'DevOps 团队', leader: 'engineering/engineering-devops-engineer', roles: ['engineering/engineering-devops-engineer', 'engineering/engineering-sre', 'engineering/engineering-cloud-architect', 'engineering/engineering-platform-engineer'] },
  { name: 'AI 研究团队', leader: 'engineering/engineering-ai-engineer', roles: ['engineering/engineering-ai-engineer', 'engineering/engineering-ml-engineer', 'engineering/engineering-research-scientist', 'engineering/engineering-prompt-engineer'] },
  { name: '网络安全团队', leader: 'security/security-threat-detection-engineer', roles: ['security/security-threat-detection-engineer', 'security/security-incident-responder', 'security/security-penetration-tester', 'security/security-compliance-officer'] },
  { name: '移动开发团队', leader: 'engineering/engineering-mobile-ios-developer', roles: ['engineering/engineering-mobile-ios-developer', 'engineering/engineering-mobile-android-developer', 'engineering/engineering-react-native-developer', 'engineering/engineering-mobile-ux-designer'] },
  { name: '前端团队', leader: 'engineering/engineering-frontend-developer', roles: ['engineering/engineering-frontend-developer', 'design/design-ui-designer', 'engineering/engineering-accessibility-engineer', 'engineering/engineering-performance-engineer'] },
  { name: '后端团队', leader: 'engineering/engineering-backend-architect', roles: ['engineering/engineering-backend-architect', 'engineering/engineering-database-engineer', 'engineering/engineering-api-designer', 'engineering/engineering-microservices-architect'] },
  { name: '写作团队', leader: 'specialized/writing-content-writer', roles: ['specialized/writing-content-writer', 'specialized/writing-editor', 'specialized/writing-copywriter', 'specialized/writing-translator'] },
  { name: '教学团队', leader: 'academic/academic-study-planner', roles: ['academic/academic-study-planner', 'academic/academic-tutor', 'academic/academic-curriculum-designer', 'academic/academic-educational-researcher'] },
  { name: '区块链团队', leader: 'engineering/engineering-blockchain-engineer', roles: ['engineering/engineering-blockchain-engineer', 'engineering/engineering-smart-contract-auditor', 'engineering/engineering-defi-protocol-designer', 'engineering/engineering-crypto-economist'] },
]