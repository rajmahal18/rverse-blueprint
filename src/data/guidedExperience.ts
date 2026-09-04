import {
  configSections,
  configSettings,
  effectiveConfigValue,
  formatConfigValue,
  isScopeSetting,
  resolveScope,
  scopeChoice,
  type ProjectConfig,
} from './configurator'
import { projectContextReviewSignals, type ProjectContextReviewSignal } from './intelligence'
import { configReviewSignals, type ReviewSignal } from './reviewSignals'
import type { ProjectContext } from './projectContext'

export type GuidedDecisionPriority = 'required' | 'recommended' | 'review'
export type GuidedDecisionState = 'attention' | 'acknowledged' | 'review'

export type GuidedDecision = {
  id: string
  source: 'project_context' | 'app_setup'
  priority: GuidedDecisionPriority
  state: GuidedDecisionState
  title: string
  detail: string
  why: string
  impact: string
  settingIds: string[]
  actionableSettingIds: string[]
  targetSection?: string
  suggestedFixId?: string
}

export type GuidedBuildStatus = {
  state: 'blocked' | 'attention' | 'ready'
  label: string
  detail: string
  next: 'setup' | 'preview' | 'build'
  unresolvedRequired: number
  unresolvedTotal: number
}

export type GuidedSearchEntry = {
  id: string
  settingId: string
  label: string
  sectionId: string
  sectionLabel: string
  description: string
  keywords: string
  currentValue: string
  scope: boolean
  scopeState?: 'off' | 'suggested' | 'on' | 'required'
  scopeChoice?: 'Auto' | 'On' | 'Off'
}

const goalCriticalSignals = new Set([
  'context-recommended-setup-incomplete',
  'context-booking-mismatch',
  'context-payment-mismatch',
  'context-commerce-mismatch',
  'context-subscriptions-mismatch',
  'context-inventory-mismatch',
  'context-reporting-mismatch',
  'context-directory-mismatch',
  'context-tournament-mismatch',
  'context-government-workflow-mismatch',
  'context-clinic-mismatch',
  'context-hrms-structured-scope-mismatch',
])

const signalCopy: Record<string, { title: string; impact: string }> = {
  'context-recommended-setup-incomplete': {
    title: 'Your public website setup is missing an important content surface',
    impact: 'Visitors may not get the product/location experience you described.',
  },
  'context-booking-mismatch': {
    title: 'Booking is off, but your stated goal requires booking',
    impact: 'Customers will not be able to reserve real court/time availability.',
  },
  'context-payment-mismatch': {
    title: 'Payments are off, but your stated goal includes online payment',
    impact: 'The implementation contract will not include money collection or payment verification.',
  },
  'context-commerce-mismatch': {
    title: 'Commerce is off, but your stated goal includes online purchasing',
    impact: 'Cart, checkout, orders, and purchasing workflows will remain out of scope.',
  },
  'context-subscriptions-mismatch': {
    title: 'Subscriptions are off, but your stated goal includes recurring billing',
    impact: 'Plans, trials, recurring charges, and billing recovery will remain out of scope.',
  },
  'context-inventory-mismatch': {
    title: 'Inventory is off, but your stated goal includes stock operations',
    impact: 'Stock balances, movements, locations, purchasing, and inventory controls will remain out of scope.',
  },
  'context-reporting-mismatch': {
    title: 'Reporting is off, but your stated goal requires reports or analytics',
    impact: 'Operational reports, analytics, exports, and governed metrics will remain out of scope.',
  },
  'context-directory-mismatch': {
    title: 'Directory scope is off, but your stated goal includes listings or discovery',
    impact: 'Listings, search/discovery, claims, moderation, and directory workflows will remain out of scope.',
  },
  'context-tournament-mismatch': {
    title: 'Tournament scope is off, but your stated goal includes competition management',
    impact: 'Matches, scoring, standings, brackets, lineups, and live-result workflows will remain out of scope.',
  },
  'context-government-workflow-mismatch': {
    title: 'Document workflow is off, but your stated goal includes routing or tracking',
    impact: 'Document intake, routing, signatories, turnaround tracking, and public/internal tracking will remain out of scope.',
  },
  'context-clinic-mismatch': {
    title: 'Clinic & EMR is off, but your stated goal includes patient or clinical records',
    impact: 'Patient encounters, vitals, clinical notes, orders, medicines, referrals, and restricted record workflows will remain out of scope.',
  },
  'context-hrms-structured-scope-mismatch': {
    title: 'Your HRMS intent is not represented by structured scope yet',
    impact: 'Blueprint will refuse to invent HR modules until you explicitly select the intended capabilities.',
  },
  'context-reusable-product-mismatch': {
    title: 'Your reuse goal and current product architecture disagree',
    impact: 'A single-purpose setup may create avoidable per-client forks later.',
  },
}

function inactiveScopeSettings(signal: ProjectContextReviewSignal, config: ProjectConfig) {
  return signal.affectedSettings.filter((id) => {
    const setting = configSettings.find((item) => item.id === id)
    return Boolean(setting && isScopeSetting(id) && !resolveScope(config, id).active)
  })
}

function explicitlyRejectedScopeSettings(signal: ProjectContextReviewSignal, config: ProjectConfig) {
  const scopeIds = signal.affectedSettings.filter((id) => isScopeSetting(id))
  if (!scopeIds.length) return false
  const inactive = scopeIds.filter((id) => !resolveScope(config, id).active)
  return inactive.length > 0 && inactive.every((id) => scopeChoice(config, id) === 'Off')
}

function contextDecision(signal: ProjectContextReviewSignal, config: ProjectConfig): GuidedDecision {
  const actionableSettingIds = inactiveScopeSettings(signal, config).filter((id) => scopeChoice(config, id) !== 'Off')
  const rejected = explicitlyRejectedScopeSettings(signal, config)
  const mapped = signalCopy[signal.id]
  const priority: GuidedDecisionPriority = goalCriticalSignals.has(signal.id) || signal.severity === 'important' ? 'required' : 'recommended'
  return {
    id: signal.id,
    source: 'project_context',
    priority,
    state: actionableSettingIds.length ? 'attention' : rejected ? 'acknowledged' : 'review',
    title: mapped?.title ?? signal.title,
    detail: signal.detail,
    why: 'Blueprint noticed a mismatch between what you described and the product scope you explicitly selected.',
    impact: mapped?.impact ?? 'The implementation contract may not fully match the outcome you described.',
    settingIds: signal.affectedSettings,
    actionableSettingIds,
    targetSection: signal.targetSection,
  }
}

function reviewDecision(signal: ReviewSignal): GuidedDecision {
  return {
    id: `review-${signal.id}`,
    source: 'app_setup',
    priority: signal.severity === 'blocker' ? 'required' : 'review',
    state: 'review',
    title: signal.title,
    detail: signal.detail,
    why: `Blueprint's ${signal.category} review found a ${signal.severity}-level setup issue.`,
    impact: signal.severity === 'blocker'
      ? 'Resolve this before implementation handoff.'
      : 'Review this deliberately before treating the setup as final.',
    settingIds: signal.affectedSettings,
    actionableSettingIds: [],
    targetSection: signal.affectedSettings.map((id) => configSettings.find((item) => item.id === id)?.section).find(Boolean),
    suggestedFixId: signal.suggestedFixId,
  }
}

/**
 * Derives the small set of decisions a human should see first.
 * This function is read-only: recommendations never mutate ProjectConfig.
 */
export function guidedSetupDecisions(context: ProjectContext, config: ProjectConfig): GuidedDecision[] {
  const contextItems = projectContextReviewSignals(context, config).map((signal) => contextDecision(signal, config))
  const setupItems = configReviewSignals(config)
    .filter((signal) => signal.severity === 'blocker' || signal.severity === 'important')
    .map(reviewDecision)

  const rank = (item: GuidedDecision) => {
    const state = item.state === 'attention' ? 0 : item.state === 'review' ? 1 : 2
    const priority = item.priority === 'required' ? 0 : item.priority === 'recommended' ? 1 : 2
    return (state * 10) + priority
  }

  return [...contextItems, ...setupItems].sort((a, b) => rank(a) - rank(b))
}



/** A guided decision is unresolved until the user explicitly resolves or rejects it. */
export function guidedDecisionIsUnresolved(item: GuidedDecision) {
  return item.state !== 'acknowledged'
}

/** Single source of truth for every guided queue, badge, banner, export, and all-clear state. */
export function guidedUnresolvedDecisions(decisions: GuidedDecision[]) {
  return decisions.filter(guidedDecisionIsUnresolved)
}

export function recommendedScopeIds(decisions: GuidedDecision[]) {
  return Array.from(new Set(decisions
    .filter((item) => item.state === 'attention' && (item.priority === 'required' || item.priority === 'recommended'))
    .flatMap((item) => item.actionableSettingIds)))
}

export function guidedBuildStatus(context: ProjectContext, config: ProjectConfig, approvalStatus: 'approved' | 'stale' | 'unapproved'): GuidedBuildStatus {
  const decisions = guidedSetupDecisions(context, config)
  const unresolved = guidedUnresolvedDecisions(decisions)
  const unresolvedRequired = unresolved.filter((item) => item.priority === 'required').length
  const unresolvedTotal = unresolved.length
  if (unresolvedRequired > 0) {
    return {
      state: 'blocked',
      label: 'Setup needs attention',
      detail: `${unresolvedRequired} important setup decision${unresolvedRequired === 1 ? '' : 's'} still need explicit resolution before implementation handoff.`,
      next: 'setup',
      unresolvedRequired,
      unresolvedTotal,
    }
  }
  if (unresolvedTotal > 0) {
    return {
      state: 'attention',
      label: 'Review the remaining setup decisions',
      detail: `${unresolvedTotal} guided setup decision${unresolvedTotal === 1 ? '' : 's'} still deserve deliberate review.`,
      next: 'setup',
      unresolvedRequired: 0,
      unresolvedTotal,
    }
  }
  if (approvalStatus === 'stale') {
    return {
      state: 'attention',
      label: 'Re-approve the visual direction',
      detail: 'The saved Visual Contract no longer matches the current Blueprint.',
      next: 'preview',
      unresolvedRequired: 0,
      unresolvedTotal: 0,
    }
  }
  if (approvalStatus === 'unapproved') {
    return {
      state: 'attention',
      label: 'Preview and approve the design',
      detail: 'Product scope is coherent enough to continue. The visual direction is still provisional.',
      next: 'preview',
      unresolvedRequired: 0,
      unresolvedTotal: 0,
    }
  }
  return {
    state: 'ready',
    label: 'Ready to build',
    detail: 'No unresolved guided setup decision remains and the current Visual Contract is approved.',
    next: 'build',
    unresolvedRequired: 0,
    unresolvedTotal: 0,
  }
}

const normalizeSearchText = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

function boundedEditDistance(left: string, right: string, maxDistance: number) {
  if (Math.abs(left.length - right.length) > maxDistance) return maxDistance + 1
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]
    let rowMin = current[0]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
      const value = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + cost,
      )
      current.push(value)
      rowMin = Math.min(rowMin, value)
    }
    if (rowMin > maxDistance) return maxDistance + 1
    previous = current
  }
  return previous[right.length]
}

/** Plain-language search with conservative typo tolerance (e.g. bokking → booking, pasword → password). */
export function guidedSearchMatches(query: string, searchableText: string) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  const normalizedText = normalizeSearchText(searchableText)
  if (normalizedText.includes(normalizedQuery)) return true
  const words = normalizedText.split(' ').filter(Boolean)
  return normalizedQuery.split(' ').filter(Boolean).every((token) => {
    if (words.some((word) => word.includes(token))) return true
    if (token.length < 4) return false
    const maxDistance = token.length >= 8 ? 2 : 1
    return words.some((word) => Math.abs(word.length - token.length) <= maxDistance && boundedEditDistance(token, word, maxDistance) <= maxDistance)
  })
}

/** Search index intentionally contains dormant and advanced settings so users never need to know where a control lives. */
export function guidedSearchEntries(config: ProjectConfig): GuidedSearchEntry[] {
  return configSettings.map((setting) => {
    const section = configSections.find((item) => item.id === setting.section)
    const scope = isScopeSetting(setting.id)
    const resolution = scope ? resolveScope(config, setting.id) : undefined
    const optionText = (setting.options ?? []).map((option) => `${option.label ?? option.value} ${option.note ?? ''}`).join(' ')
    return {
      id: `setting:${setting.id}`,
      settingId: setting.id,
      label: setting.label,
      sectionId: setting.section,
      sectionLabel: section?.label ?? setting.section,
      description: setting.description,
      keywords: [setting.label, setting.description, setting.group, section?.label, ...(setting.keywords ?? []), optionText].filter(Boolean).join(' ').toLowerCase(),
      currentValue: formatConfigValue(effectiveConfigValue(config, setting.id)),
      scope,
      scopeState: resolution?.state,
      scopeChoice: scope ? scopeChoice(config, setting.id) : undefined,
    }
  })
}
