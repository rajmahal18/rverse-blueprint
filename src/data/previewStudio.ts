import { normalizeDna, type Dna } from './visualDna'
import type { DirectionRecommendation, PatternExplorerIntelligence } from './patternIntelligence'
import type { PageComposition, PageCompositionIntelligence, QualityStatus } from './pageComposition'
import type { VisualDirectorOutput } from './visualDirector'

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
export type PreviewWarningSeverity = 'info' | 'review' | 'risk'

export type PreviewDirection = {
  slot: 'A' | 'B' | 'C'
  id: string
  name: string
  description: string
  dna: Dna
  recommendation: DirectionRecommendation
}

export type PlaceholderMedia = {
  enabled: boolean
  kind: 'automotive' | 'clinical' | 'institutional' | 'court' | 'sports' | 'portfolio' | 'general'
  label: string
  detail: string
}

export type PreviewWarning = {
  id: string
  severity: PreviewWarningSeverity
  title: string
  detail: string
}

export type ResponsivePreviewPlan = {
  device: PreviewDevice
  mode: 'wide-composition' | 'adaptive-composition' | 'mobile-recomposition'
  rules: string[]
}

export type PreviewStudioIntelligence = {
  directions: PreviewDirection[]
  media: PlaceholderMedia
  warnings: PreviewWarning[]
  scopeGuardrail: string
}

const mediaByDirector: Record<string, Omit<PlaceholderMedia, 'enabled'>> = {
  'automotive-retail': { kind: 'automotive', label: 'Automotive product / installation detail', detail: 'Use cropped product hardware, vehicle-detail, storefront, or installation context rather than software screenshots.' },
  'clinic-operations': { kind: 'clinical', label: 'Clinical record / care context', detail: 'Operational clinical previews favor records, timelines, queues, and medically relevant attachments over decorative stock photography.' },
  'government-workforce': { kind: 'institutional', label: 'Institutional workforce context', detail: 'Use restrained official context, record structure, and seal/grid-derived geometry; imagery remains secondary to information.' },
  'booking-consumer': { kind: 'court', label: 'Venue / court context', detail: 'Use venue or court context to orient users while keeping availability and the current booking selection dominant.' },
  'sports-event': { kind: 'sports', label: 'Event identity / competition context', detail: 'Use event branding, score rails, venue detail, or competition media without obscuring live data.' },
  'portfolio-creative': { kind: 'portfolio', label: 'Real project media', detail: 'Use screenshots, project artifacts, and case-study evidence as the main visual proof rather than generic decorative imagery.' },
}

export function previewDirections(intelligence: PatternExplorerIntelligence): PreviewDirection[] {
  return intelligence.recommendations.slice(0, 3).map((recommendation, index) => ({
    slot: (['A', 'B', 'C'] as const)[index],
    id: recommendation.id,
    name: recommendation.name,
    description: recommendation.description,
    dna: normalizeDna(recommendation.proposedDna),
    recommendation,
  }))
}

export function placeholderMediaFor(director: VisualDirectorOutput): PlaceholderMedia {
  const base = mediaByDirector[director.id] ?? { kind: 'general' as const, label: 'Context-appropriate placeholder media', detail: 'Use media only where it clarifies product context or supports the active visual direction.' }
  return { ...base, enabled: !/^Do not generate placeholder imagery/i.test(director.mediaDirection) }
}

const severityForQuality = (status: QualityStatus): PreviewWarningSeverity => status === 'risk' ? 'risk' : status === 'review' ? 'review' : 'info'

export function previewWarnings(input: {
  pageIntel: PageCompositionIntelligence
  patternIntel: PatternExplorerIntelligence
  selectedPage?: PageComposition
  visualContradictions?: string[]
}): PreviewWarning[] {
  const warnings: PreviewWarning[] = []
  const page = input.selectedPage ?? input.pageIntel.pages[0]
  if (page?.scopeState === 'advisory') warnings.push({
    id: `advisory-${page.id}`,
    severity: 'review',
    title: 'Advisory page — not implementation scope',
    detail: page.scopeReason,
  })

  for (const detail of input.visualContradictions ?? []) warnings.push({
    id: `contradiction-${warnings.length}`,
    severity: 'risk',
    title: 'Visual contradiction',
    detail,
  })

  const riskyDimensions = input.pageIntel.visualQualityReview.dimensions.filter((item) => item.status !== 'clear')
  riskyDimensions.slice(0, 4).forEach((item) => warnings.push({
    id: `quality-${item.id}`,
    severity: severityForQuality(item.status),
    title: item.label,
    detail: item.observation,
  }))

  if (input.patternIntel.antiHomogeneity.level !== 'LOW') warnings.push({
    id: 'anti-homogeneity',
    severity: input.patternIntel.antiHomogeneity.level === 'HIGH' ? 'risk' : 'review',
    title: `${input.patternIntel.antiHomogeneity.level} similarity risk`,
    detail: input.patternIntel.antiHomogeneity.summary,
  })

  return warnings
}

export function responsivePreviewPlan(page: PageComposition, device: PreviewDevice): ResponsivePreviewPlan {
  if (device === 'mobile') return {
    device,
    mode: 'mobile-recomposition',
    rules: page.mobileRecomposition.length ? page.mobileRecomposition : ['Prioritize the primary task and stack secondary regions after it.'],
  }
  if (device === 'tablet') return {
    device,
    mode: 'adaptive-composition',
    rules: [
      `Keep “${page.visualAnchor}” visually dominant while reducing side-by-side density.`,
      'Collapse tertiary metadata before changing primary content order.',
      'Preserve touch targets and avoid desktop-only hover dependencies.',
    ],
  }
  return {
    device,
    mode: 'wide-composition',
    rules: [
      `Use the full composition width to express: ${page.contentRhythm}`,
      `Keep the primary interaction obvious: ${page.primaryInteraction}`,
    ],
  }
}

export function previewStudioIntelligence(input: {
  dna: Dna
  director: VisualDirectorOutput
  patternIntel: PatternExplorerIntelligence
  pageIntel: PageCompositionIntelligence
  selectedPage?: PageComposition
  visualContradictions?: string[]
}): PreviewStudioIntelligence {
  return {
    directions: previewDirections(input.patternIntel),
    media: placeholderMediaFor(input.director),
    warnings: previewWarnings({ pageIntel: input.pageIntel, patternIntel: input.patternIntel, selectedPage: input.selectedPage, visualContradictions: input.visualContradictions }),
    scopeGuardrail: 'Preview Studio has visual/presentational authority only. Comparing, resizing, or previewing advisory pages cannot activate optional functional scope.',
  }
}
