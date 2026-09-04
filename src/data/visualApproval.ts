import { effectiveConfigValue, type ProjectConfig } from './configurator'
import { normalizeDna, type Dna, type VisualDecisionSource } from './visualDna'
import type { DirectionRecommendation, PatternExplorerIntelligence } from './patternIntelligence'
import type { FrontendQualityContract, PageComposition, PageCompositionIntelligence } from './pageComposition'
import type { DesignDNA, VisualDirectorOutput } from './visualDirector'

export type VisualApprovalStatus = 'unapproved' | 'approved' | 'stale'

export type ApprovalMaterialHashes = {
  dna: string
  patterns: string
  synthesis: string
  composition: string
  context: string
  copyMedia: string
}

export type ApprovedInteractionState = {
  id: string
  label: string
  intent: string
}

export type ApprovedVisualDirection = {
  id: string
  name: string
  sourceDirectionId?: string
  source: 'saved_blueprint' | 'pattern_explorer'
}

export type ApprovedVisualContract = {
  version: 1
  id: string
  approvedAt: string
  provenance: Extract<VisualDecisionSource, 'approved_preview'>
  direction: ApprovedVisualDirection
  visualThesis: string
  designDNA: DesignDNA
  dna: Dna
  pageCompositions: PageComposition[]
  typography: string[]
  colorBehavior: string[]
  imageryMediaDirection: string[]
  motion: string[]
  hardVisualConstraints: string[]
  signatureElement: string
  signaturePlacements: string[]
  responsiveRules: string[]
  interactionStates: ApprovedInteractionState[]
  frontendQualityContract: FrontendQualityContract
  copyDirection: string[]
  selectedPatternIds: string[]
  antiHomogeneity: PatternExplorerIntelligence['antiHomogeneity']
  scopeGuardrail: string
  materialHashes: ApprovalMaterialHashes
}

export type VisualApprovalEvaluation = {
  status: VisualApprovalStatus
  label: string
  detail: string
  changedAreas: string[]
  contract?: ApprovedVisualContract
  currentHashes: ApprovalMaterialHashes
}

export type VisualApprovalInput = {
  dna: Dna
  config: ProjectConfig
  projectContext: string
  selectedPatternIds: string[]
  director: VisualDirectorOutput
  patternIntel: PatternExplorerIntelligence
  pageIntel: PageCompositionIntelligence
}

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => [key, stableValue(item)]))
}

const stableJson = (value: unknown) => JSON.stringify(stableValue(value))

const hash = (value: unknown) => {
  const text = stableJson(value)
  let result = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    result ^= text.charCodeAt(index)
    result = Math.imul(result, 0x01000193)
  }
  return (result >>> 0).toString(16).padStart(8, '0')
}

export function copyDirectionFromConfig(config: ProjectConfig): string[] {
  return [
    `Public copy guardrails: ${String(effectiveConfigValue(config, 'content.publicCopyGuardrails'))}.`,
    `Writing tone: ${String(effectiveConfigValue(config, 'content.tone'))}.`,
    `AI-slop tolerance: ${String(effectiveConfigValue(config, 'content.aiSlop'))}.`,
    `Labels: ${String(effectiveConfigValue(config, 'content.labels'))}.`,
    `Actions: ${String(effectiveConfigValue(config, 'content.cta'))}.`,
    `Helper text: ${String(effectiveConfigValue(config, 'content.helperText'))}.`,
  ]
}

export function mediaDirectionFromConfig(config: ProjectConfig): string[] {
  const enabled = Boolean(effectiveConfigValue(config, 'media.generatePlaceholders'))
  if (!enabled) return ['Placeholder media: Off. Use only user-supplied/final media or intentionally empty media regions.']
  return [
    'Placeholder media: Enabled when it makes an approved surface feel complete and realistic.',
    `Placeholder style: ${String(effectiveConfigValue(config, 'media.placeholderStyle'))}.`,
    `Placeholder coverage: ${String(effectiveConfigValue(config, 'media.placeholderCoverage'))}.`,
  ]
}

export function approvalInteractionStates(domain: string): ApprovedInteractionState[] {
  switch (domain) {
    case 'automotive-retail': return [
      { id: 'nav-active', label: 'Active navigation', intent: 'Show the current destination clearly without turning the header into a pill-heavy app nav.' },
      { id: 'cta-pressed', label: 'Primary CTA pressed', intent: 'Use a restrained pressed/hover response that feels mechanical and immediate.' },
    ]
    case 'clinic-operations': return [
      { id: 'selected-patient', label: 'Selected patient / queue row', intent: 'Make the selected clinical record obvious while preserving queue scanability and calm information density.' },
      { id: 'focus-control', label: 'Keyboard focus', intent: 'Show an unmistakable focus state on operational controls without relying on color alone.' },
    ]
    case 'government-workforce': return [
      { id: 'selected-record', label: 'Selected workforce record', intent: 'Keep record selection visible across list/detail context without obscuring official hierarchy.' },
      { id: 'nav-active', label: 'Active workspace navigation', intent: 'Use clear institutional active-state treatment and retain keyboard/touch discoverability.' },
    ]
    case 'booking-consumer': return [
      { id: 'selected-slot', label: 'Selected time slot', intent: 'The chosen slot and booking summary must remain unmistakably connected, especially on mobile.' },
      { id: 'unavailable-slot', label: 'Unavailable slot', intent: 'Disabled/unavailable states remain understandable without color alone and cannot be mistaken for selectable inventory.' },
    ]
    case 'sports-event': return [
      { id: 'selected-match', label: 'Selected / live match', intent: 'Keep live/selected competition state highly visible while secondary schedule rows remain scannable.' },
      { id: 'nav-active', label: 'Active event view', intent: 'Differentiate standings/schedule/live destinations without competing with the scoreboard hierarchy.' },
    ]
    case 'portfolio-creative': return [
      { id: 'project-hover', label: 'Project hover / focus', intent: 'Reveal useful project affordance without hiding essential case-study information behind hover.' },
      { id: 'nav-active', label: 'Active section', intent: 'Keep authored navigation treatment expressive but accessible and unambiguous.' },
    ]
    default: return [
      { id: 'nav-active', label: 'Active navigation', intent: 'Expose the current destination clearly.' },
      { id: 'focus-control', label: 'Keyboard focus', intent: 'Use a visible accessible focus indicator for interactive controls.' },
    ]
  }
}

export function approvalMaterialHashes(input: VisualApprovalInput): ApprovalMaterialHashes {
  const dna = normalizeDna(input.dna)
  const copyDirection = copyDirectionFromConfig(input.config)
  const mediaDirection = mediaDirectionFromConfig(input.config)
  const pageContract = {
    domain: input.pageIntel.domain,
    pages: input.pageIntel.pages,
    responsiveRules: input.pageIntel.responsiveRules,
    qualityContract: input.pageIntel.frontendQualityContract,
  }
  return {
    dna: hash(dna),
    patterns: hash([...input.selectedPatternIds].sort()),
    synthesis: hash({
      id: input.director.id,
      directionName: input.director.directionName,
      thesis: input.director.thesis,
      designDNA: input.director.designDNA,
      signatureElement: input.director.signatureElement,
      hardConstraints: input.director.hardConstraints,
      typographyDirection: input.director.typographyDirection,
      mediaDirection: input.director.mediaDirection,
    }),
    composition: hash(pageContract),
    context: hash(input.projectContext.trim()),
    copyMedia: hash({ appType: input.config.appType, scopeChoices: input.config.scopeChoices, copyDirection, mediaDirection }),
  }
}

const changedLabels: Record<keyof ApprovalMaterialHashes, string> = {
  dna: 'Visual DNA',
  patterns: 'selected Pattern Explorer patterns/bundle',
  synthesis: 'Visual Director synthesis / hard constraints',
  composition: 'page composition / responsive rules',
  context: 'project context used by visual intelligence',
  copyMedia: 'scope, media, or audience-copy direction',
}

export function evaluateVisualApproval(contract: ApprovedVisualContract | undefined, input: VisualApprovalInput): VisualApprovalEvaluation {
  const currentHashes = approvalMaterialHashes(input)
  if (!contract) return {
    status: 'unapproved',
    label: 'Not approved',
    detail: 'Preview and refinements remain mutable until you explicitly approve a visual direction for implementation.',
    changedAreas: [],
    currentHashes,
  }

  const changedAreas = (Object.keys(currentHashes) as (keyof ApprovalMaterialHashes)[])
    .filter((key) => contract.materialHashes[key] !== currentHashes[key])
    .map((key) => changedLabels[key])

  if (changedAreas.length) return {
    status: 'stale',
    label: 'Approval stale',
    detail: `The approved Visual Contract no longer matches the current Blueprint. Re-approve after reviewing: ${changedAreas.join(', ')}.`,
    changedAreas,
    currentHashes,
    contract,
  }

  return {
    status: 'approved',
    label: 'Approved for implementation',
    detail: `Approved ${new Date(contract.approvedAt).toLocaleString()} with provenance approved_preview. Preview-only device/page/interaction state does not invalidate this approval.`,
    changedAreas: [],
    currentHashes,
    contract,
  }
}

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)))

export function createApprovedVisualContract(input: VisualApprovalInput & {
  direction?: DirectionRecommendation
  approvedAt?: string
  id?: string
}): ApprovedVisualContract {
  const dna = normalizeDna(input.dna)
  const direction: ApprovedVisualDirection = input.direction ? {
    id: input.direction.id,
    name: input.direction.name,
    sourceDirectionId: input.direction.sourceDirectionId,
    source: 'pattern_explorer',
  } : {
    id: input.director.id,
    name: input.director.directionName,
    sourceDirectionId: input.director.baseDirectionId,
    source: 'saved_blueprint',
  }
  const signaturePlacements = unique(input.pageIntel.pages.map((page) => page.signaturePlacement).filter(Boolean))
  const typography = [
    input.director.typographyDirection,
    `Heading: ${dna.headingTypography}, weight ${dna.headingWeight}, scale ${dna.headingScale}%.`,
    `Body: ${dna.bodyTypography}, weight ${dna.bodyWeight}, ${dna.bodyFontSize}px / ${dna.lineHeight}% line-height. UI/control weight ${dna.uiWeight}.`,
    `Weight contrast: ${dna.weightContrast}. Text measure: ${dna.textMeasure}ch.`,
  ]
  const colorBehavior = [
    input.director.designDNA.colorBehavior,
    `Theme: ${dna.themeMode}; default ${dna.defaultTheme}. Accent usage: ${dna.accentUsage}.`,
    `Semantic palette — ink ${dna.palette.ink}; background ${dna.palette.background}; surface ${dna.palette.surface}; accent ${dna.palette.accent}; muted ${dna.palette.muted}; positive ${dna.palette.positive}.`,
  ]
  const imageryMediaDirection = unique([
    input.director.designDNA.imagery,
    input.director.mediaDirection,
    ...mediaDirectionFromConfig(input.config),
    `Image treatment: ${dna.imageTreatment}; presentation: ${dna.imagePresentation}.`,
  ])
  const motion = [
    input.director.designDNA.motion,
    `${dna.motionAmount} ${dna.motionCharacter.toLowerCase()} motion; nominal duration ${dna.motionDuration}ms; page transition ${dna.pageTransition}.`,
    dna.reducedMotionFallback ? 'Reduced-motion fallback is required.' : 'No explicit reduced-motion fallback was selected; accessibility hard constraints still apply where motion is meaningful.',
  ]

  return {
    version: 1,
    id: input.id ?? `visual-approval-${Date.now().toString(36)}`,
    approvedAt: input.approvedAt ?? new Date().toISOString(),
    provenance: 'approved_preview',
    direction,
    visualThesis: input.director.thesis,
    designDNA: input.director.designDNA,
    dna,
    pageCompositions: structuredClone(input.pageIntel.pages),
    typography,
    colorBehavior,
    imageryMediaDirection,
    motion,
    hardVisualConstraints: unique(input.director.hardConstraints),
    signatureElement: input.director.signatureElement,
    signaturePlacements,
    responsiveRules: unique(input.pageIntel.responsiveRules),
    interactionStates: approvalInteractionStates(input.pageIntel.domain),
    frontendQualityContract: structuredClone(input.pageIntel.frontendQualityContract),
    copyDirection: copyDirectionFromConfig(input.config),
    selectedPatternIds: [...input.selectedPatternIds].sort(),
    antiHomogeneity: structuredClone(input.patternIntel.antiHomogeneity),
    scopeGuardrail: 'Approved visual direction has visual/presentational authority only. Advisory pages and visual recommendations cannot activate optional functional scope; explicit App Setup and true hard dependencies remain authoritative.',
    materialHashes: approvalMaterialHashes(input),
  }
}

const pagePrompt = (page: PageComposition) => `### ${page.name} — ${page.scopeState.toUpperCase()}
- Purpose: ${page.purpose}
- Visual anchor: ${page.visualAnchor}
- Section hierarchy: ${page.sections.map((section, index) => `${index + 1}. ${section.label}`).join(' | ')}
- Content rhythm: ${page.contentRhythm}
- CTA strategy: ${page.ctaStrategy}
- Imagery: ${page.imageryPlacement}
- Primary interaction: ${page.primaryInteraction}
- Mobile recomposition: ${page.mobileRecomposition.join(' ')}
- Signature placement: ${page.signaturePlacement}
- Avoid: ${page.avoid.join('; ')}
- Scope note: ${page.scopeReason}`

export function approvedVisualContractPrompt(contract: ApprovedVisualContract, headingPrefix = ''): string {
  const title = (value: string) => `${headingPrefix}${value}`
  return `${title('VISUAL CONTRACT — APPROVED FOR IMPLEMENTATION')}
Approval state: APPROVED
Provenance: ${contract.provenance}
Approved at: ${contract.approvedAt}
Approved direction: ${contract.direction.name} (${contract.direction.source})
Scope guardrail: ${contract.scopeGuardrail}

${title('VISUAL THESIS')}
${contract.visualThesis}

${title('APPROVED DESIGN DNA')}
- Archetype: ${contract.designDNA.archetype}
- Visual tension: ${contract.designDNA.visualTension ?? 'Not specified'}
- Character: ${contract.designDNA.primaryCharacter.join(', ')}
- Composition: ${contract.designDNA.composition}
- Geometry: ${contract.designDNA.geometry}
- Density: ${contract.designDNA.density}
- Avoid: ${contract.designDNA.avoid.join('; ')}

${title('TYPOGRAPHY')}
${contract.typography.map((item) => `- ${item}`).join('\n')}

${title('COLOR BEHAVIOR')}
${contract.colorBehavior.map((item) => `- ${item}`).join('\n')}

${title('PAGE COMPOSITION')}
${contract.pageCompositions.map(pagePrompt).join('\n\n')}

${title('SIGNATURE DESIGN ELEMENT')}
- Element: ${contract.signatureElement}
- Placement: ${contract.signaturePlacements.length ? contract.signaturePlacements.join(' | ') : 'Use only where the approved composition calls for it; do not add decorative filler.'}

${title('HARD VISUAL CONSTRAINTS')}
${contract.hardVisualConstraints.length ? contract.hardVisualConstraints.map((item) => `- ${item}`).join('\n') : '- No additional project-specific visual hard constraints beyond scope, usability, accessibility, and reduced-motion requirements.'}

${title('RESPONSIVE BEHAVIOR')}
${contract.responsiveRules.map((item) => `- ${item}`).join('\n')}

${title('INTERACTION STATES TO PROVE')}
${contract.interactionStates.map((item) => `- ${item.label}: ${item.intent}`).join('\n')}

${title('MEDIA DIRECTION')}
${contract.imageryMediaDirection.map((item) => `- ${item}`).join('\n')}

${title('MOTION')}
${contract.motion.map((item) => `- ${item}`).join('\n')}

${title('COPY DIRECTION')}
${contract.copyDirection.map((item) => `- ${item}`).join('\n')}

${title('FRONTEND QUALITY CONTRACT')}
Applies to: ${contract.frontendQualityContract.appliesTo}
${contract.frontendQualityContract.criteria.map((item) => `- ${item}`).join('\n')}

${title('ANTI-HOMOGENEITY CHECK')}
- Similarity risk at approval: ${contract.antiHomogeneity.level}
- ${contract.antiHomogeneity.summary}
${contract.antiHomogeneity.repeatedTraits.length ? `- Repeated traits: ${contract.antiHomogeneity.repeatedTraits.join('; ')}` : '- No dominant repeated traits detected at approval.'}
`
}

export function staleVisualApprovalPrompt(evaluation: VisualApprovalEvaluation): string {
  if (evaluation.status !== 'stale' || !evaluation.contract) return ''
  return `VISUAL APPROVAL STATUS — STALE
An approved Visual Contract exists, but it no longer matches the current Blueprint and MUST NOT be treated as current implementation authority until the user re-approves it.
Changed material areas:
${evaluation.changedAreas.map((item) => `- ${item}`).join('\n')}
Previous approved direction: ${evaluation.contract.direction.name}
Previous approval timestamp: ${evaluation.contract.approvedAt}
Continue using the current synthesized visual guidance only as provisional direction and require re-approval before treating the visual contract as final.`
}

export function normalizeApprovedVisualContract(value: unknown): ApprovedVisualContract | undefined {
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Partial<ApprovedVisualContract>
  if (candidate.version !== 1 || !candidate.id || !candidate.approvedAt || candidate.provenance !== 'approved_preview' || !candidate.direction || !candidate.designDNA || !candidate.dna || !candidate.materialHashes) return undefined
  const hashKeys: (keyof ApprovalMaterialHashes)[] = ['dna', 'patterns', 'synthesis', 'composition', 'context', 'copyMedia']
  if (!hashKeys.every((key) => typeof candidate.materialHashes?.[key] === 'string')) return undefined
  return {
    version: 1,
    id: String(candidate.id),
    approvedAt: String(candidate.approvedAt),
    provenance: 'approved_preview',
    direction: {
      id: String(candidate.direction.id || 'approved-direction'),
      name: String(candidate.direction.name || 'Approved direction'),
      sourceDirectionId: candidate.direction.sourceDirectionId ? String(candidate.direction.sourceDirectionId) : undefined,
      source: candidate.direction.source === 'pattern_explorer' ? 'pattern_explorer' : 'saved_blueprint',
    },
    visualThesis: String(candidate.visualThesis || ''),
    designDNA: candidate.designDNA as DesignDNA,
    dna: normalizeDna(candidate.dna),
    pageCompositions: Array.isArray(candidate.pageCompositions) ? candidate.pageCompositions as PageComposition[] : [],
    typography: Array.isArray(candidate.typography) ? candidate.typography.map(String) : [],
    colorBehavior: Array.isArray(candidate.colorBehavior) ? candidate.colorBehavior.map(String) : [],
    imageryMediaDirection: Array.isArray(candidate.imageryMediaDirection) ? candidate.imageryMediaDirection.map(String) : [],
    motion: Array.isArray(candidate.motion) ? candidate.motion.map(String) : [],
    hardVisualConstraints: Array.isArray(candidate.hardVisualConstraints) ? candidate.hardVisualConstraints.map(String) : [],
    signatureElement: String(candidate.signatureElement || ''),
    signaturePlacements: Array.isArray(candidate.signaturePlacements) ? candidate.signaturePlacements.map(String) : [],
    responsiveRules: Array.isArray(candidate.responsiveRules) ? candidate.responsiveRules.map(String) : [],
    interactionStates: Array.isArray(candidate.interactionStates) ? candidate.interactionStates.map((item) => ({ id: String(item.id), label: String(item.label), intent: String(item.intent) })) : [],
    frontendQualityContract: candidate.frontendQualityContract && typeof candidate.frontendQualityContract === 'object'
      ? candidate.frontendQualityContract as FrontendQualityContract
      : { appliesTo: 'Approved implementation surfaces', criteria: [] },
    copyDirection: Array.isArray(candidate.copyDirection) ? candidate.copyDirection.map(String) : [],
    selectedPatternIds: Array.isArray(candidate.selectedPatternIds) ? candidate.selectedPatternIds.map(String).sort() : [],
    antiHomogeneity: candidate.antiHomogeneity && typeof candidate.antiHomogeneity === 'object'
      ? candidate.antiHomogeneity as PatternExplorerIntelligence['antiHomogeneity']
      : { level: 'LOW', similarity: null, repeatedTraits: [], diversification: [], summary: 'No approval-time anti-homogeneity diagnostic was saved.' },
    scopeGuardrail: String(candidate.scopeGuardrail || 'Approved visual direction cannot activate optional functional scope.'),
    materialHashes: candidate.materialHashes as ApprovalMaterialHashes,
  }
}
