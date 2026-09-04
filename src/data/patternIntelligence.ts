import type { Pattern } from './catalog'
import { patternApplicability } from './consistency'
import type { ProjectConfig } from './configurator'
import { normalizeDna, type Dna } from './visualDna'
import { reconcileVisualConstraints, type VisualDirectorOutput } from './visualDirector'
import { applyFullDirection, rankedVisualDirections, type SuggestionContext, type VisualDirection } from './visualSuggestions'

export type RecommendationTier = 'best_match' | 'good_fit' | 'alternative'
export type CompatibilityState = 'compatible' | 'warning' | 'conflict'
export type OriginalityEstimate = 'Familiar' | 'Moderately distinct' | 'Distinct' | 'Bold / niche'

export type PatternCompatibility = {
  compatible: boolean
  state: CompatibilityState
  reason: string
}

export type PatternBundle = {
  id: string
  name: string
  rationale: string
  patternIds: string[]
  patterns: Pattern[]
  omitted: { id: string; name: string; reason: string }[]
}

export type DirectionRecommendation = {
  id: string
  tier: RecommendationTier
  name: string
  sourceDirectionId: string
  description: string
  whyItFits: string
  drawback: string
  originality: OriginalityEstimate
  compatibility: CompatibilityState
  compatibilityNotes: string[]
  proposedDna: Dna
  bundle: PatternBundle
}

export type VisualHistoryEntry = {
  id: string
  name: string
  dna: Dna
  selectedPatternIds: string[]
  directionName?: string
}

export type AntiHomogeneityReport = {
  level: 'LOW' | 'MODERATE' | 'HIGH'
  closestProjectName?: string
  similarity: number | null
  repeatedTraits: string[]
  diversification: string[]
  summary: string
}

export type PatternExplorerIntelligence = {
  recommendations: DirectionRecommendation[]
  antiHomogeneity: AntiHomogeneityReport
}

export type PatternExplorerInput = {
  patterns: Pattern[]
  config: ProjectConfig
  context: SuggestionContext
  director: VisualDirectorOutput
  selectedPatternIds: string[]
  history?: VisualHistoryEntry[]
}

const bundleCandidates: Record<string, string[]> = {
  'automotive-retail': ['editorial-grid', 'no-card', 'display-sans', 'compact-header', 'hero-header', 'top-action-bar'],
  'clinic-operations': ['outlined-panels', 'progressive-disclosure', 'compact-header', 'timeline', 'sectioned-form', 'master-detail'],
  'government-workforce': ['outlined-panels', 'progressive-disclosure', 'full-sidebar', 'data-table-sticky', 'master-detail', 'compact-header'],
  'booking-consumer': ['sticky-cta', 'compact-header', 'segmented-nav', 'bottom-sheet', 'bottom-full', 'progressive-disclosure'],
  'sports-event': ['metric-strip', 'top-action-bar', 'compact-header', 'no-card', 'bento', 'layout-reflow'],
  'portfolio-creative': ['editorial-grid', 'editorial-type', 'no-card', 'hero-header', 'mask-reveal', 'compact-header'],
  'performance-editorial': ['editorial-grid', 'no-card', 'display-sans', 'compact-header', 'hero-header', 'top-action-bar'],
  'premium-product-catalog': ['editorial-grid', 'no-card', 'editorial-type', 'hero-header', 'sticky-cta', 'compact-header'],
  'technical-control': ['outlined-panels', 'progressive-disclosure', 'compact-header', 'data-table-sticky', 'master-detail', 'top-action-bar'],
  'civic-clarity': ['outlined-panels', 'progressive-disclosure', 'compact-header', 'full-sidebar', 'top-action-bar', 'single-column'],
  'calm-service': ['outlined-panels', 'progressive-disclosure', 'compact-header', 'sectioned-form', 'timeline', 'single-column'],
  'friendly-consumer': ['sticky-cta', 'compact-header', 'segmented-nav', 'bottom-sheet', 'bottom-full', 'progressive-disclosure'],
  'event-energy': ['metric-strip', 'top-action-bar', 'compact-header', 'no-card', 'bento', 'layout-reflow'],
  'editorial-minimal': ['editorial-grid', 'editorial-type', 'no-card', 'hero-header', 'mask-reveal', 'compact-header'],
  general: ['compact-header', 'progressive-disclosure', 'outlined-panels', 'no-card', 'top-action-bar'],
}

const directionDrawbacks: Record<string, string> = {
  'performance-editorial': 'Can become visually aggressive if display type, contrast, and asymmetry are all pushed at once.',
  'premium-product-catalog': 'Can drift into generic luxury-commerce styling if imagery and brand-specific details are weak.',
  'technical-control': 'Can feel too utilitarian or software-heavy for public-facing brands and low-density experiences.',
  'civic-clarity': 'Can become institutional and visually conservative if hierarchy is not paired with a project-specific motif.',
  'calm-service': 'Can feel overly quiet or generic if every surface is softened and visual contrast is reduced too far.',
  'friendly-consumer': 'Can become overly rounded or app-template-like if friendly geometry replaces actual brand character.',
  'event-energy': 'Can overwhelm usability if high contrast, motion, and live-data density all compete for attention.',
  'editorial-minimal': 'Can look sparse or self-consciously designed if content quality and typographic discipline are weak.',
}

const visualPatternConflict = (pattern: Pattern, dnaInput: Dna): PatternCompatibility | null => {
  const dna = normalizeDna(dnaInput)
  const anti = new Set(dna.visualAntiPatterns)
  if (pattern.id === 'glass-panel' && anti.has('Glassmorphism')) return { compatible: false, state: 'conflict', reason: 'Localized Glass Panel conflicts with the explicit Glassmorphism exclusion.' }
  if (pattern.id === 'bottom-pill' && anti.has('Excessive pills')) return { compatible: true, state: 'warning', reason: 'Pill navigation is usable, but the project explicitly warns against excessive pills. Keep this isolated if selected.' }
  if (pattern.id === 'soft-cards' && anti.has('Excessive rounded corners')) return { compatible: true, state: 'warning', reason: 'Soft card geometry can conflict with the project’s rounded-corner exclusion if used as the dominant surface language.' }
  if (['staggered-enter', 'mask-reveal', 'shared-element', 'layout-reflow', 'spring-feedback'].includes(pattern.id) && anti.has('Excessive animations')) return { compatible: true, state: 'warning', reason: 'This motion pattern is compatible only as a restrained, selective moment because excessive animation is explicitly excluded.' }
  if (pattern.id === 'editorial-type' && dna.typographyCharacter === 'Monospace-led') return { compatible: true, state: 'warning', reason: 'Editorial Type Pairing pulls against the current technical typography direction. Use only if deliberately changing that layer.' }
  if (pattern.id === 'technical-type' && ['Editorial serif', 'High-contrast serif', 'Transitional serif'].includes(dna.typographyCharacter)) return { compatible: true, state: 'warning', reason: 'Technical Mono Accent may create a mixed typographic voice with the current editorial/luxury direction.' }
  return null
}

export function patternCompatibility(pattern: Pattern, dna: Dna, config: ProjectConfig): PatternCompatibility {
  const scope = patternApplicability(pattern, config)
  if (!scope.compatible) return { compatible: false, state: 'conflict', reason: scope.reason }
  return visualPatternConflict(pattern, dna) ?? { compatible: true, state: 'compatible', reason: 'Compatible with active App Setup and current hard visual constraints.' }
}

const buildBundle = (id: string, name: string, directorId: string, patterns: Pattern[], dna: Dna, config: ProjectConfig): PatternBundle => {
  const candidates = bundleCandidates[directorId] ?? bundleCandidates.general
  const included: Pattern[] = []
  const omitted: PatternBundle['omitted'] = []
  for (const patternId of candidates) {
    const pattern = patterns.find((item) => item.id === patternId)
    if (!pattern) continue
    const compatibility = patternCompatibility(pattern, dna, config)
    if (compatibility.compatible && compatibility.state !== 'conflict' && included.length < 4) included.push(pattern)
    else omitted.push({ id: pattern.id, name: pattern.name, reason: compatibility.reason })
  }
  return {
    id,
    name,
    rationale: included.length
      ? `A small coherent bundle supporting ${name}; patterns remain explicit visual selections and never create functional scope.`
      : `No bundled pattern is currently safe to recommend without contradicting App Setup or hard visual constraints.`,
    patternIds: included.map((item) => item.id),
    patterns: included,
    omitted,
  }
}

const constraintsNotes = (original: Dna, proposed: Dna) => {
  const notes: string[] = []
  if (original.headingWeightPreference !== 'Auto / Recommended') notes.push(`Explicit heading weight ${original.headingWeight} is preserved.`)
  if (original.bodyWeightPreference !== 'Auto / Recommended') notes.push(`Explicit body weight ${original.bodyWeight} is preserved.`)
  if (original.uiWeightPreference !== 'Auto / Recommended') notes.push(`Explicit UI/control weight ${original.uiWeight} is preserved.`)
  if (original.visualAntiPatterns.length) notes.push(`Hard exclusions reconciled: ${original.visualAntiPatterns.join(', ')}.`)
  if (original.easePriority === 'Non-negotiable') notes.push('Ease of use remains a hard constraint over visual novelty.')
  if (proposed.reducedMotionFallback) notes.push('Reduced-motion fallback remains required.')
  return notes.length ? notes : ['No hard visual conflict detected.']
}

const originalityFor = (dna: Dna, tier: RecommendationTier, direction: VisualDirection | null, historySimilarity: number | null): OriginalityEstimate => {
  if (historySimilarity !== null && historySimilarity >= 0.72) return 'Familiar'
  if (dna.visualOriginality === 'Experimental') return 'Bold / niche'
  if (dna.visualOriginality === 'Bold') return tier === 'best_match' ? 'Distinct' : 'Bold / niche'
  if (tier === 'alternative' && direction && ['event-energy', 'editorial-minimal', 'performance-editorial'].includes(direction.id)) return 'Distinct'
  if (dna.visualOriginality === 'Safe') return 'Familiar'
  return tier === 'best_match' ? 'Distinct' : 'Moderately distinct'
}

const dimensionValues = (dnaInput: Dna) => {
  const dna = normalizeDna(dnaInput)
  return [
    ['Typography', `${dna.headingTypography} / ${dna.headingWeight}`],
    ['Heading scale', `${Math.round(dna.headingScale)}`],
    ['Grid / alignment', `${dna.gridCharacter} / ${dna.alignmentTendency}`],
    ['Section rhythm', `${dna.sectionStrategy} / ${dna.whitespacePriority}`],
    ['Surface language', `${dna.surfaceLanguage} / card ${Math.round(dna.cardWeight)}`],
    ['Geometry', `${dna.shapeLanguage} / radius ${Math.round(dna.surfaceRadius)}`],
    ['Imagery', `${dna.imageryMode} / ${dna.imagePresentation} / ${dna.imageCharacter}`],
    ['Color behavior', `${dna.accentUsage} / ${dna.colorSchemeOrigin || dna.palette.accent}`],
    ['Motion', `${dna.motionAmount} / ${dna.motionCharacter}`],
    ['Icon treatment', `${dna.iconStyle} / ${dna.iconGeometry}`],
  ] as const
}

const patternJaccard = (leftIds: string[], rightIds: string[]) => {
  const left = new Set(leftIds), right = new Set(rightIds)
  const union = new Set([...left, ...right])
  if (!union.size) return 0
  let same = 0
  left.forEach((id) => { if (right.has(id)) same += 1 })
  return same / union.size
}

const compareHistory = (dna: Dna, selectedPatternIds: string[], entry: VisualHistoryEntry) => {
  const current = dimensionValues(dna)
  const other = new Map(dimensionValues(entry.dna))
  const repeated = current.filter(([label, value]) => other.get(label) === value).map(([label, value]) => `${label}: ${value}`)
  const dimensionScore = repeated.length / current.length
  const patternScore = patternJaccard(selectedPatternIds, entry.selectedPatternIds)
  return { entry, score: dimensionScore * 0.82 + patternScore * 0.18, repeated }
}

const diversificationFor = (repeated: string[], recommendations: DirectionRecommendation[]) => {
  const advice: string[] = []
  if (repeated.some((item) => item.startsWith('Typography'))) advice.push('Vary the typography category or heading/body contrast while preserving the project archetype.')
  if (repeated.some((item) => item.startsWith('Grid / alignment'))) advice.push('Change the composition grammar—symmetry, grid character, or alignment—not merely the accent color.')
  if (repeated.some((item) => item.startsWith('Surface language')) || repeated.some((item) => item.startsWith('Geometry'))) advice.push('Diversify containment and geometry: reduce repeated card/radius habits before adding decorative effects.')
  if (repeated.some((item) => item.startsWith('Imagery'))) advice.push('Shift image prominence, crop behavior, or media character in a way that matches this domain.')
  if (repeated.some((item) => item.startsWith('Motion'))) advice.push('Use a domain-appropriate motion profile rather than reusing the same transition character.')
  const alt = recommendations.find((item) => item.tier !== 'best_match' && item.compatibility !== 'conflict')
  if (alt) advice.push(`If the Best Match still feels too familiar, compare it with “${alt.name}” as a context-safe diversification route.`)
  return advice.slice(0, 4)
}

function buildAntiHomogeneity(dna: Dna, selectedPatternIds: string[], history: VisualHistoryEntry[], recommendations: DirectionRecommendation[]): AntiHomogeneityReport {
  if (!history.length) return { level: 'LOW', similarity: null, repeatedTraits: [], diversification: ['No prior project history yet. Build a second direction before treating novelty as a problem.'], summary: 'No comparison history yet; anti-homogeneity will become more useful as Blueprint accumulates distinct projects.' }
  const ranked = history.map((entry) => compareHistory(dna, selectedPatternIds, entry)).sort((a, b) => b.score - a.score)
  const closest = ranked[0]
  const level: AntiHomogeneityReport['level'] = closest.score >= 0.72 ? 'HIGH' : closest.score >= 0.5 ? 'MODERATE' : 'LOW'
  const diversification = level === 'LOW'
    ? ['Current direction is already materially distinct. Preserve contextual coherence instead of forcing novelty.']
    : diversificationFor(closest.repeated, recommendations)
  return {
    level,
    closestProjectName: closest.entry.name,
    similarity: Math.round(closest.score * 100),
    repeatedTraits: closest.repeated.slice(0, 7),
    diversification,
    summary: level === 'HIGH'
      ? `Current recommended direction is visually close to “${closest.entry.name}”. Diversify repeated structural traits before implementation.`
      : level === 'MODERATE'
        ? `Some visual habits overlap with “${closest.entry.name}”, but the direction can be differentiated without random restyling.`
        : `The direction is meaningfully distinct from the closest saved project, “${closest.entry.name}”.`,
  }
}

export function patternExplorerIntelligence(input: PatternExplorerInput): PatternExplorerIntelligence {
  const original = normalizeDna(input.context.dna)
  const ranked = rankedVisualDirections({ ...input.context, dna: original })
  const base = ranked.find((item) => item.id === input.director.baseDirectionId) ?? ranked[0]
  const alternates = ranked.filter((item) => item.id !== base?.id).slice(0, 3)
  const raw: { tier: RecommendationTier; name: string; direction: VisualDirection | null; proposedDna: Dna; description: string; why: string }[] = []
  raw.push({
    tier: 'best_match',
    name: input.director.directionName,
    direction: base ?? null,
    proposedDna: input.director.proposedDna,
    description: input.director.thesis,
    why: `${input.director.designDNA.archetype} is the strongest synthesized fit for the current product context. ${input.director.rationale[0] ?? ''}`,
  })
  alternates.forEach((direction, index) => {
    const proposed = reconcileVisualConstraints(original, applyFullDirection(original, direction))
    raw.push({
      tier: index < 2 ? 'good_fit' : 'alternative',
      name: direction.name,
      direction,
      proposedDna: proposed,
      description: direction.description,
      why: `Ranks highly for the current app type, active packs, Project Context, and Visual Studio posture while offering a different visual grammar from the Best Match.`,
    })
  })

  const firstPass = raw.map((item, index): DirectionRecommendation => {
    const notes = constraintsNotes(original, item.proposedDna)
    const bundle = buildBundle(`bundle-${item.direction?.id ?? input.director.id}`, item.name, item.direction?.id ?? input.director.id, input.patterns, item.proposedDna, input.config)
    const warning = bundle.patterns.some((pattern) => patternCompatibility(pattern, item.proposedDna, input.config).state === 'warning')
    return {
      id: item.direction?.id ?? input.director.id,
      tier: item.tier,
      name: item.name,
      sourceDirectionId: item.direction?.id ?? input.director.baseDirectionId,
      description: item.description,
      whyItFits: item.why,
      drawback: item.tier === 'best_match'
        ? (directionDrawbacks[input.director.baseDirectionId] ?? 'The main risk is over-applying the direction until every section uses the same visual trick.')
        : (directionDrawbacks[item.direction?.id ?? ''] ?? 'Treat this as a coherent alternative, not a list of traits to mix indiscriminately.'),
      originality: originalityFor(original, item.tier, item.direction, null),
      compatibility: warning ? 'warning' : 'compatible',
      compatibilityNotes: notes,
      proposedDna: item.proposedDna,
      bundle,
    }
  })

  const history = input.history ?? []
  const anti = buildAntiHomogeneity(input.director.proposedDna, input.selectedPatternIds, history, firstPass)
  const recommendations = firstPass.map((item) => {
    const historySimilarity = history.length
      ? Math.max(...history.map((entry) => compareHistory(item.proposedDna, item.bundle.patternIds, entry).score))
      : null
    return {
      ...item,
      originality: originalityFor(
        original,
        item.tier,
        ranked.find((direction) => direction.id === item.sourceDirectionId) ?? null,
        historySimilarity,
      ),
    }
  })
  return { recommendations, antiHomogeneity: anti }
}

export function patternIntelligencePrompt(intelligence: PatternExplorerIntelligence) {
  const best = intelligence.recommendations.find((item) => item.tier === 'best_match')
  const anti = intelligence.antiHomogeneity
  return `PATTERN EXPLORER 2.0\n- Recommended direction: ${best?.name ?? 'No recommendation'}\n- Recommended bundle: ${best?.bundle.patterns.length ? best.bundle.patterns.map((pattern) => pattern.name).join(', ') : 'No additional patterns required'}\n- Bundle patterns are explicit visual selections only; they never authorize functional scope.\n\nANTI-HOMOGENEITY REVIEW\n- Similarity risk: ${anti.level}${anti.similarity === null ? '' : ` (${anti.similarity}% to ${anti.closestProjectName})`}\n${anti.repeatedTraits.length ? `- Repeated traits: ${anti.repeatedTraits.join('; ')}\n` : ''}${anti.diversification.map((item) => `- ${item}`).join('\n')}`
}
