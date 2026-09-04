import {
  appTypes,
  configSettings,
  effectiveConfigValue,
  isRedundantSetting,
  isScopeSetting,
  recommendedValue,
  resolveScope,
  resolvedOperationalScale,
  scopeChoice,
  settingIsActive,
  type AppType,
  type ConfigSetting,
  type ConfigValue,
  type ProjectConfig,
} from './configurator'
import { projectContextEntries, type ProjectContext } from './projectContext'
import { configReviewSignals, reviewSignalCounts, type ReviewCategory, type ReviewSeverity } from './reviewSignals'


export type ConfigAction = {
  id: string
  title: string
  detail: string
  changes: { id: string; value: ConfigValue }[]
}

export type ConfigSuggestion = ConfigAction & {
  tone: 'Useful' | 'Automation' | 'Quality'
}

export type AppTypeMatch = {
  appType: AppType
  score: number
  reason: string
}

export type ReadinessDimension = {
  label: string
  score: number
  note: string
}

export type ReadinessReport = {
  score: number
  label: 'Ready' | 'Ready with review' | 'Needs review' | 'Not ready'
  coverage: number
  warnings: number
  signals: number
  blockers: number
  important: number
  review: number
  advisory: number
  dimensions: ReadinessDimension[]
}

export type RecommendationSource = 'Explicit' | 'Required' | 'Suggested' | 'App type' | 'Profile' | 'Operational scale' | 'Baseline' | 'Inactive'

export type RecommendationProvenance = {
  source: RecommendationSource
  reason: string
  expected: ConfigValue
  current: ConfigValue
}

const value = (config: ProjectConfig, id: string) => effectiveConfigValue(config, id)
const active = (config: ProjectConfig, id: string) => settingIsActive(id, config)

const severityPenalty: Record<ReviewSeverity, number> = {
  advisory: 2,
  review: 7,
  important: 15,
  blocker: 32,
}

const dimensionCategories: Record<string, ReviewCategory[]> = {
  Coherence: ['scope', 'architecture'],
  Safety: ['security', 'privacy'],
  Resilience: ['reliability', 'data', 'operations'],
  Usability: ['usability', 'accessibility', 'testing'],
}

export function configReadiness(config: ProjectConfig): ReadinessReport {
  const signals = configReviewSignals(config)
  const counts = reviewSignalCounts(signals)
  const activeSettings = configSettings.filter((setting) => settingIsActive(setting, config))
  const valued = activeSettings.filter((setting) => config.values[setting.id] !== undefined && config.values[setting.id] !== null).length
  const coverage = activeSettings.length ? Math.round((valued / activeSettings.length) * 100) : 100

  const dimensions = Object.entries(dimensionCategories).map(([label, categories]): ReadinessDimension => {
    const relevant = signals.filter((signal) => categories.includes(signal.category))
    const penalty = relevant.reduce((sum, signal) => sum + severityPenalty[signal.severity], 0)
    return {
      label,
      score: Math.max(20, 100 - penalty),
      note: relevant.length ? `${relevant.length} typed signal${relevant.length > 1 ? 's' : ''}` : label === 'Coherence'
        ? 'No scope or architecture conflict'
        : label === 'Safety'
          ? 'Security and privacy posture are internally aligned'
          : label === 'Resilience'
            ? 'Failure, data, and operating posture are aligned'
            : 'No obvious usability, accessibility, or test-coverage tension',
    }
  })

  const riskPenalty = signals.reduce((sum, signal) => sum + severityPenalty[signal.severity], 0)
  const score = Math.max(20, Math.min(100, Math.round((coverage * 0.2) + ((100 - Math.min(80, riskPenalty)) * 0.8))))
  const label: ReadinessReport['label'] = counts.blocker > 0
    ? 'Not ready'
    : counts.important >= 3
      ? 'Needs review'
      : signals.length > 0
        ? 'Ready with review'
        : 'Ready'

  return {
    score,
    coverage,
    warnings: signals.length,
    signals: signals.length,
    blockers: counts.blocker,
    important: counts.important,
    review: counts.review,
    advisory: counts.advisory,
    label,
    dimensions,
  }
}

export function settingRecommendationProvenance(setting: ConfigSetting, config: ProjectConfig): RecommendationProvenance {
  const expected = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
  const current = effectiveConfigValue(config, setting.id)

  if (isScopeSetting(setting.id)) {
    const resolution = resolveScope(config, setting.id)
    const source: RecommendationSource = resolution.source === 'Suggested' ? 'Suggested' : resolution.source
    const expectedScopeValue = resolution.state === 'suggested' ? expected : resolution.effectiveValue
    return { source, reason: resolution.reason, expected: expectedScopeValue, current }
  }

  if (!settingIsActive(setting, config)) {
    return { source: 'Inactive', reason: 'This decision is dormant because its parent scope or dependency is inactive.', expected, current }
  }

  if (config.overrides.includes(setting.id)) {
    return { source: 'Explicit', reason: `Customized from the current recommendation (${String(expected)}).`, expected, current }
  }

  if (config.profile !== 'Recommended' && setting.profileDefaults?.[config.profile as Exclude<typeof config.profile, 'Recommended'>] !== undefined) {
    return { source: 'Profile', reason: `${config.profile} recommendation posture supplies this default inside active scope.`, expected, current }
  }

  const resolvedScale = resolvedOperationalScale(config)
  const scaleVariants = (['Lean', 'Standard', 'High scale', 'Mission critical'] as const)
    .map((scale) => recommendedValue(setting, config.appType, config.profile, scale))
  if (new Set(scaleVariants.map((item) => JSON.stringify(item))).size > 1) {
    return { source: 'Operational scale', reason: `${resolvedScale} operational scale supplies this proportional implementation default${config.operationalScale === 'Auto' ? ' through Auto inference' : ''} without changing product scope.`, expected, current }
  }

  if (setting.appDefaults?.[config.appType] !== undefined) {
    return { source: 'App type', reason: `Recommended for ${config.appType} inside the resolved active scope.`, expected, current }
  }

  return { source: 'Baseline', reason: 'Blueprint baseline recommendation for this active decision.', expected, current }
}

const signalIds = new Set([
  'app.accessShape', 'app.audience', 'app.primarySurface', 'app.shell', 'app.startDestination', 'app.pageDepth',
  'login.enabled', 'admin.enabled', 'workflow.status', 'notifications.level', 'platform.api', 'platform.deployment',
  'platform.pwa', 'platform.offline', 'integration.email', 'integration.calendar', 'integration.maps', 'integration.externalAutomation',
])

function appTypeMatchReason(appType: AppType, config: ProjectConfig) {
  const packs = configSettings
    .filter((setting) => setting.section === 'business' && resolveScope(config, setting.id).active)
    .map((setting) => setting.label)
  if (packs.length) return `Matches the current ${packs.slice(0, 2).join(' + ')} product shape.`
  const access = String(config.values['app.accessShape'] ?? '')
  const surface = String(config.values['app.primarySurface'] ?? '')
  return `${access} · ${surface}; closest to ${appType}.`
}

export function appTypeMatches(config: ProjectConfig): AppTypeMatch[] {
  const allSignals = configSettings.filter((setting) => setting.section === 'business' || signalIds.has(setting.id))
  const signalSettings = config.appType === 'Custom / General'
    ? allSignals.filter((setting) => config.overrides.includes(setting.id) || scopeChoice(config, setting.id) !== 'Auto')
    : allSignals.filter((setting) => !isRedundantSetting(setting.id))
  if (!signalSettings.length) return []
  const candidates = appTypes.map((item) => item.value).filter((item) => item !== 'Custom / General')
  return candidates.map((appType) => {
    let earned = 0
    let total = 0
    for (const setting of signalSettings) {
      const weight = setting.section === 'business' ? 8 : setting.section === 'identity' ? 3 : 2
      total += weight
      if (effectiveConfigValue(config, setting.id) === recommendedValue(setting, appType, 'Recommended')) earned += weight
    }
    return { appType, score: Math.round((earned / total) * 100), reason: appTypeMatchReason(appType, config) }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
}

export function settingGuidance(setting: ConfigSetting, config: ProjectConfig): 'Recommended' | 'Suggested' | 'Optional' | 'Advanced' | 'Not recommended' | 'Required' | 'Inactive' {
  if (isScopeSetting(setting.id)) {
    const resolution = resolveScope(config, setting.id)
    if (resolution.choice === 'Off' && resolution.requiredBy.length) return 'Not recommended'
    if (resolution.source === 'Required') return 'Required'
    if (resolution.source === 'Suggested') return 'Suggested'
    if (!resolution.active) return 'Inactive'
    if (resolution.choice === 'On') return 'Recommended'
  }
  const expected = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
  const overridden = config.overrides.includes(setting.id)
  if (overridden && setting.caution) return 'Not recommended'
  if (setting.advanced) return 'Advanced'
  if (expected === false) return 'Optional'
  if (typeof expected === 'string' && /^(off|none|no |no$|manual only|decide later)/i.test(expected)) return 'Optional'
  return 'Recommended'
}

export function configQuickFixes(config: ProjectConfig): ConfigAction[] {
  const fixes: ConfigAction[] = []
  const add = (fix: ConfigAction) => fixes.push(fix)
  if (value(config, 'admin.enabled') === true && value(config, 'login.enabled') === false) add({ id: 'protect-admin', title: 'Protect the admin surface', detail: 'Enable login so administrative routes have an authentication boundary.', changes: [{ id: 'login.enabled', value: true }] })
  if (active(config, 'permissions.defaultPolicy') && value(config, 'permissions.defaultPolicy') === 'Allow by default') add({ id: 'deny-default', title: 'Use deny-by-default authorization', detail: 'New routes/actions should not become accessible unless permission is explicitly granted.', changes: [{ id: 'permissions.defaultPolicy', value: 'Deny by default' }] })
  if (active(config, 'permissions.enforcement') && value(config, 'permissions.enforcement') === 'UI checks only') add({ id: 'server-authz', title: 'Enforce permissions on the server', detail: 'Keep UI hiding as convenience, but make the server/action boundary authoritative.', changes: [{ id: 'permissions.enforcement', value: 'Server enforced + UI reflects access' }] })
  if (['Shared multi-tenant runtime', 'Hybrid shared + isolated'].includes(String(value(config, 'product.deploymentModel'))) && value(config, 'product.reuseIntent') !== 'Single-purpose application' && value(config, 'org.mode') !== 'Multi-tenant organizations') add({ id: 'product-multi-tenant-boundary', title: 'Make organizations first-class tenants', detail: 'Use the multi-tenant organization model before sharing one runtime across independent organizations.', changes: [{ id: 'org.mode', value: 'Multi-tenant organizations' }, { id: 'org.tenantIsolation', value: 'Strict tenant scope' }] })
  if (active(config, 'product.isolationStrategy') && value(config, 'product.isolationStrategy') === 'Application query filters only') add({ id: 'product-data-boundary', title: 'Enforce tenant isolation at the data boundary', detail: 'Use database-enforced tenant context/RLS so one missed query filter cannot cross organization boundaries.', changes: [{ id: 'product.isolationStrategy', value: 'Database-enforced tenant context / RLS' }] })
  if (active(config, 'product.sharedCore') && value(config, 'product.sharedCore') === 'Per-tenant code forks allowed') add({ id: 'product-shared-core', title: 'Keep one upgradeable product core', detail: 'Represent tenant differences as configuration or controlled adapters rather than permanent repository forks.', changes: [{ id: 'product.sharedCore', value: 'One shared core — no tenant forks' }] })
  if (active(config, 'product.versioning') && value(config, 'product.versioning') === 'Tenant-version branches allowed') add({ id: 'product-shared-version', title: 'Keep tenants on one product line', detail: 'Use one compatible version or backward-compatible staged migrations instead of tenant-specific version branches.', changes: [{ id: 'product.versioning', value: 'Backward-compatible staged migrations' }] })
  if (active(config, 'booking.conflictPolicy') && value(config, 'booking.conflictPolicy') === 'UI check only') add({ id: 'booking-atomic', title: 'Make booking conflicts atomic', detail: 'Reject concurrent conflicts at the authoritative write boundary.', changes: [{ id: 'booking.conflictPolicy', value: 'Atomic conflict rejection' }] })
  if (active(config, 'payments.verification') && value(config, 'payments.verification') === 'Client return / redirect only') add({ id: 'payment-authority', title: 'Verify payments server-side', detail: 'Use provider/server verification before marking a payment complete or fulfilling it.', changes: [{ id: 'payments.verification', value: 'Server/webhook verified' }] })
  if (active(config, 'webhook.signing') && value(config, 'webhook.signing') === 'Unsigned') add({ id: 'sign-webhooks', title: 'Sign outgoing webhooks', detail: 'Add an HMAC signature and timestamp so consumers can verify authenticity.', changes: [{ id: 'webhook.signing', value: 'HMAC signature + timestamp' }] })
  if (active(config, 'webhook.verifyIncoming') && value(config, 'webhook.verifyIncoming') === false) add({ id: 'verify-webhooks', title: 'Verify incoming webhooks', detail: 'Reject unauthenticated provider callbacks before side effects occur.', changes: [{ id: 'webhook.verifyIncoming', value: true }] })
  if (active(config, 'webhook.idempotency') && value(config, 'webhook.idempotency') === false) add({ id: 'idempotent-webhooks', title: 'Deduplicate incoming webhook events', detail: 'Repeated provider deliveries should resolve to one business result.', changes: [{ id: 'webhook.idempotency', value: true }] })
  if (active(config, 'security.csp') && value(config, 'security.csp') === 'Off') add({ id: 'enable-csp', title: 'Restore a CSP baseline', detail: 'Start with report-only or enforced policy rather than shipping with CSP disabled.', changes: [{ id: 'security.csp', value: 'Report-only first' }] })
  if (active(config, 'security.csrf') && value(config, 'security.csrf') === 'Off') add({ id: 'enable-csrf', title: 'Restore CSRF protection', detail: 'Cookie-authenticated state changes need framework/origin/token protection.', changes: [{ id: 'security.csrf', value: 'Framework + origin/token checks' }] })
  if (active(config, 'eng.secretSeparation') && value(config, 'eng.secretSeparation') === 'Shared credentials') add({ id: 'separate-secrets', title: 'Separate production credentials', detail: 'Keep dev/staging mistakes or compromise from directly reaching production.', changes: [{ id: 'eng.secretSeparation', value: 'Separate production credentials' }] })
  if (active(config, 'records.delete') && value(config, 'records.delete') === 'Hard delete' && ['Government System', 'Clinic / EMR'].includes(config.appType)) add({ id: 'safe-delete', title: 'Use recoverable record handling', detail: 'Sensitive operational records should not disappear through routine hard deletion.', changes: [{ id: 'records.delete', value: config.appType === 'Clinic / EMR' ? 'No user deletion' : 'Soft delete + restore' }] })
  return fixes.slice(0, 6)
}

export function domainSuggestions(config: ProjectConfig): ConfigSuggestion[] {
  const suggestions: ConfigSuggestion[] = []
  const add = (item: ConfigSuggestion) => suggestions.push(item)
  if (value(config, 'pack.booking') === true && value(config, 'integration.email') === false) add({ id: 'booking-email', tone: 'Useful', title: 'Send booking confirmations automatically', detail: 'Transactional email removes screenshot/manual confirmation work and gives customers durable booking details.', changes: [{ id: 'integration.email', value: true }] })
  if (value(config, 'pack.directory') === true && value(config, 'directory.freshness') !== 'Owner revalidation reminders') add({ id: 'directory-freshness', tone: 'Automation', title: 'Let owners revalidate stale listings', detail: "Use the directory's own freshness workflow before adding external automation. This reduces manual upkeep without expanding integration scope.", changes: [{ id: 'directory.freshness', value: 'Owner revalidation reminders' }] })
  if (value(config, 'pack.inventory') === true && value(config, 'inventory.reorder') === 'Off') add({ id: 'inventory-reorder', tone: 'Automation', title: 'Track reorder thresholds', detail: 'Low-stock decisions should come from thresholds rather than repeated manual inspection.', changes: [{ id: 'inventory.reorder', value: 'Per item/location' }] })
  if (value(config, 'pack.clinic') === true && value(config, 'clinic.inventoryLink') !== 'Off' && value(config, 'pack.inventory') === false) add({ id: 'clinic-inventory', tone: 'Quality', title: 'Enable the Inventory pack', detail: 'Clinical stock deduction needs an authoritative stock ledger instead of an isolated medicine counter.', changes: [{ id: 'pack.inventory', value: true }] })
  if (value(config, 'quality.testing') === 'Smoke only' && ['Government System', 'Clinic / EMR', 'E-commerce', 'Booking / Scheduling'].includes(config.appType)) add({ id: 'testing-depth', tone: 'Quality', title: 'Raise critical-path test depth', detail: 'Transactional or sensitive workflows deserve more than a basic smoke pass.', changes: [{ id: 'quality.testing', value: config.appType === 'Clinic / EMR' ? 'Critical-path heavy' : 'Thorough' }] })
  return suggestions.filter((item) => item.changes.some((change) => effectiveConfigValue(config, change.id) !== change.value)).slice(0, 4)
}

function pushUnique(target: string[], text: string) {
  if (!target.includes(text)) target.push(text)
}

export function acceptanceCriteria(config: ProjectConfig): string[] {
  const items: string[] = []
  const scopeOn = (id: string) => resolveScope(config, id).active
  const anyIntegration = ['integration.email', 'integration.sms', 'integration.push', 'integration.calendar', 'integration.maps', 'integration.storage', 'integration.collaboration', 'integration.crm', 'integration.accounting', 'integration.externalAutomation']
    .some(scopeOn)

  pushUnique(items, 'Common user paths are obvious on mobile and desktop; advanced/irrelevant controls remain progressively disclosed.')
  if (scopeOn('login.enabled')) pushUnique(items, 'Protected routes and sensitive actions require authenticated, server-enforced authorization; UI visibility alone never grants access.')
  if (scopeOn('forms.enabled')) pushUnique(items, 'Forms preserve user input on validation failure, identify actionable errors clearly, and enforce authoritative validation at the server/data boundary.')
  if (scopeOn('pack.booking')) pushUnique(items, 'Two concurrent booking attempts for the same resource/time cannot both confirm; the authoritative write path rejects or resolves the conflict atomically.')
  if (scopeOn('pack.payments')) pushUnique(items, 'Payment success/failure/pending states are derived from provider/server evidence, duplicate callbacks are safe, and fulfillment never trusts a browser redirect alone.')
  if (scopeOn('workflow.enabled')) pushUnique(items, 'Invalid workflow transitions are rejected, valid transitions are traceable, and users can understand the current state and next allowed action.')
  if (scopeOn('attachments.enabled')) pushUnique(items, 'Uploads enforce authorization, allowed type/size rules, safe filenames/storage, and a clear failure/retry experience.')
  if (scopeOn('pack.inventory')) pushUnique(items, 'Stock-changing actions preserve an auditable movement history and prevent silent negative/duplicate/partial inventory mutations.')
  if (scopeOn('pack.clinic')) pushUnique(items, 'Clinical records are visible only to authorized care/operational roles and important access/change events are auditable.')
  if (scopeOn('pack.government')) pushUnique(items, 'Document routing/receipt/status changes preserve actor/time history and public tracking never exposes internal or restricted routing detail.')
  if (scopeOn('integration.externalAutomation')) pushUnique(items, 'External automations are retry-safe, observable, permission-scoped, and can fail without corrupting the core business state.')
  if (scopeOn('ai.enabled')) pushUnique(items, 'AI output never bypasses caller permissions; structured/grounded tasks validate output and high-impact actions require the configured human-control boundary.')
  if (value(config, 'product.reuseIntent') !== 'Single-purpose application') {
    pushUnique(items, 'A new organization can be onboarded by configuration/provisioning without cloning the repository or editing tenant-specific business logic into the shared core.')
    if (['Configurable modules per organization', 'Entitlement-based modules / editions'].includes(String(value(config, 'product.moduleModel')))) pushUnique(items, 'Disabling a tenant module removes its navigation/actions/jobs without corrupting shared data or activating hidden module dependencies.')
    if (['Shared multi-tenant runtime', 'Hybrid shared + isolated'].includes(String(value(config, 'product.deploymentModel')))) pushUnique(items, 'Every tenant-owned read/write/export/job is constrained by an authoritative tenant context, including privileged and background execution paths.')
  }
  if (String(value(config, 'quality.accessibility')).includes('WCAG')) pushUnique(items, 'Representative workflows are keyboard-operable, have visible focus and programmatic labels, do not rely on color alone, and remain usable at mobile/high zoom.')
  if (scopeOn('landing.enabled') || scopeOn('dashboard.enabled') || scopeOn('records.crud') || anyIntegration) pushUnique(items, 'Loading, empty, permission, network, and server-error states give users a clear next action and never silently discard completed work.')
  return items.slice(0, 14)
}

export function edgeCases(config: ProjectConfig): string[] {
  const items: string[] = []
  const scopeOn = (id: string) => resolveScope(config, id).active
  const hasEditableWork = scopeOn('forms.enabled') || scopeOn('records.crud') || scopeOn('workflow.enabled')
  const hasTransactionalWork = hasEditableWork || ['pack.booking', 'pack.payments', 'pack.inventory', 'pack.commerce', 'pack.government', 'pack.clinic'].some(scopeOn)
  const anyIntegration = ['integration.email', 'integration.sms', 'integration.push', 'integration.calendar', 'integration.maps', 'integration.storage', 'integration.collaboration', 'integration.crm', 'integration.accounting', 'integration.externalAutomation'].some(scopeOn)

  if (hasEditableWork) pushUnique(items, 'User refreshes, navigates back, or loses the network while editing/submitting important work.')
  if (hasTransactionalWork) pushUnique(items, 'A request times out after the server may already have completed the action, then the user retries.')
  if (scopeOn('login.enabled')) pushUnique(items, 'Session expires or permissions change while a protected page/action is open.')
  if (scopeOn('pack.booking')) pushUnique(items, 'Two customers choose the last available slot at nearly the same time; one payment/hold is delayed or abandoned.')
  if (scopeOn('pack.payments')) pushUnique(items, 'Provider webhook is delayed, duplicated, arrives out of order, or succeeds after the customer closes the browser.')
  if (scopeOn('platform.webhooks')) pushUnique(items, 'A webhook endpoint times out or returns intermittent errors; retries must not duplicate side effects.')
  if (scopeOn('pack.inventory')) {
    pushUnique(items, 'Two users adjust/sell the last stock concurrently; stock must never silently go negative or duplicate a movement.')
    if (value(config, 'inventory.locations') !== 'Single location') pushUnique(items, 'An inter-location stock transfer partially fails between transfer and receipt; inventory must remain reconcilable.')
  }
  if (scopeOn('approval.enabled')) pushUnique(items, 'A record is reassigned, rejected, or edited while another user is approving it.')
  else if (scopeOn('workflow.enabled')) pushUnique(items, 'Two users attempt conflicting status transitions or edit the same workflow record at nearly the same time.')
  if (scopeOn('attachments.enabled')) pushUnique(items, 'Upload is too large, wrong type, interrupted, duplicated, or references a record the user can no longer access.')
  if (value(config, 'platform.offline') === 'Offline write + sync') pushUnique(items, 'Offline edits conflict with newer server state when connectivity returns.')
  if (value(config, 'product.reuseIntent') !== 'Single-purpose application') {
    pushUnique(items, 'One organization changes modules, terminology, workflow policy, or branding while another organization is actively using the same product; tenant configuration must not leak across boundaries.')
    if (['Shared multi-tenant runtime', 'Hybrid shared + isolated'].includes(String(value(config, 'product.deploymentModel')))) pushUnique(items, 'A background job, report/export, cache key, or platform-support action runs with the wrong/missing tenant context and must fail closed rather than expose another organization.')
    if (value(config, 'product.rollout') !== 'All organizations together') pushUnique(items, 'A staged feature or migration is enabled for one tenant while another remains on the previous compatible behavior; both must continue to operate safely.')
  }
  if (scopeOn('ai.enabled')) pushUnique(items, 'AI provider times out, returns malformed/unsupported output, lacks enough evidence, or receives prompt-injection content from a document/tool result.')
  if (scopeOn('pack.clinic')) pushUnique(items, 'Patient identity is duplicated/merged incorrectly or a staff member loses clinical access during an active encounter.')
  if (scopeOn('pack.government')) pushUnique(items, 'Document is routed twice, returned to a prior office, superseded by a child/related document, or tracked publicly after its visibility changes.')
  if (anyIntegration) pushUnique(items, 'An enabled external provider is unavailable while the core transaction still needs to complete safely.')
  if (scopeOn('records.crud') || ['pack.directory', 'pack.reporting', 'pack.inventory', 'pack.government', 'pack.clinic', 'pack.tournament'].some(scopeOn) || value(config, 'search.level') === 'Full-text + fuzzy') pushUnique(items, 'Large datasets, slow devices, or poor mobile connections turn an otherwise-correct page into an unusable workflow.')
  return items.slice(0, 14)
}


export type ContextGapMode = 'Strict' | 'Balanced' | 'Proactive'
export type ContextGapDecision = {
  id: string
  decision: string
  reason: string
  confidence: 'High' | 'Medium'
  source: 'context_completion'
  mode: ContextGapMode
  status: 'applied' | 'held_for_scope'
  relatedScope: string[]
}

function contextText(context: ProjectContext): string {
  return projectContextEntries(context).map((entry) => entry.value).join(' ').toLowerCase()
}

function publicPresentationScopeActive(config: ProjectConfig): boolean {
  return ['pack.portfolio', 'landing.enabled', 'pages.about', 'pages.features', 'pages.contact'].some((id) => {
    const setting = configSettings.find((item) => item.id === id)
    return Boolean(setting && isScopeSetting(setting.id) && resolveScope(config, setting.id).active)
  })
}

/**
 * Context completion may only resolve presentation/content/implementation-detail gaps.
 * It deliberately has no path to set scopeChoices, values, or resolve a functional module active.
 */
export function contextGapDecisions(context: ProjectContext, config: ProjectConfig): ContextGapDecision[] {
  const mode = String(effectiveConfigValue(config, 'intelligence.contextGapMode') ?? 'Balanced') as ContextGapMode
  if (mode === 'Strict') return []
  const text = contextText(context)
  if (!text.trim()) return []

  const has = (...patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text))
  const presentationReady = publicPresentationScopeActive(config)
  const status: ContextGapDecision['status'] = presentationReady ? 'applied' : 'held_for_scope'
  const relatedScope = ['pack.portfolio', 'landing.enabled']
  const decisions: ContextGapDecision[] = []
  const add = (id: string, decision: string, reason: string, confidence: 'High' | 'Medium' = 'High') => decisions.push({ id, decision, reason, confidence, source: 'context_completion', mode, status, relatedScope })

  const physicalLocationIntent = has(/\b(?:shop|store|branch|office|clinic|venue) location\b/, /\bfind (?:the |our )?(?:shop|store|branch|office|location)\b/, /\bdirections?\b/, /\baddress\b/, /\bvisit (?:the |our )?(?:shop|store|branch|office)\b/)
  const browseProductsIntent = has(/\bview (?:our )?products?\b/, /\bbrowse (?:our )?products?\b/, /\bshow(?:case)? (?:our )?products?\b/, /\bproduct categories\b/, /\bcar accessories\b/, /\bproducts? (?:and|or) services?\b/)
  const contactIntent = has(/\bcontact (?:us|the shop|the store)\b/, /\breach (?:us|the shop|the store)\b/, /\bcall (?:us|the shop|the store)\b/, /\bdirections?\b/)
  const websiteIntent = has(/\bwebsite\b/, /\bweb site\b/, /\bhomepage\b/, /\blanding page\b/, /\bpublic[- ]facing\b/, /\bmarketing site\b/)

  if (physicalLocationIntent) add('context-gap-location-prominence', 'Give the physical location/store information a prominent place in the public presentation.', 'Finding the physical location is an explicit customer goal.')
  if (browseProductsIntent) add('context-gap-product-imagery', 'Use image-led presentation for products/services instead of abstract or software-oriented imagery.', 'The context asks visitors to understand physical products/services visually.')
  if (contactIntent || physicalLocationIntent) add('context-gap-contact-directions', 'Keep contact and directions actions easy to reach, including on mobile.', 'Contact/location is an explicit visitor task and should not be buried.')
  if (websiteIntent && (browseProductsIntent || physicalLocationIntent)) add('context-gap-homepage-order', 'Infer a sensible homepage section order around the stated visitor goals rather than requiring every presentational section to be manually specified.', 'The intended public-site journey is clear enough to sequence low-risk presentation details.')
  if (mode === 'Proactive' && websiteIntent) add('context-gap-placeholder-content', 'Create realistic placeholder copy/media for active public sections when final assets are missing, clearly treating them as placeholders.', 'Proactive mode may complete presentation detail so the interface can be judged as a finished composition.', 'Medium')

  return decisions
}

export type ProjectContextReviewSignal = {
  id: string
  title: string
  detail: string
  targetSection: string
  severity: 'advisory' | 'important'
  category: 'scope'
  affectedSettings: string[]
}

/**
 * Lower-authority Project Context may reveal a likely mismatch, but it never mutates
 * structured App Setup. These signals are review prompts only.
 */
export function projectContextReviewSignals(context: ProjectContext, config: ProjectConfig): ProjectContextReviewSignal[] {
  const text = contextText(context)
  if (!text.trim()) return []
  const signals: ProjectContextReviewSignal[] = []
  const has = (...patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text))

  const publicWebsiteIntent = has(/\bwebsite\b/, /\bweb site\b/, /\bhomepage\b/, /\blanding page\b/, /\bmarketing site\b/, /\bpublic[- ]facing (?:site|website)\b/)
  const publicBusinessContentIntent = has(
    /\bcar accessories\b/, /\bphysical (?:shop|store)\b/, /\b(?:shop|store) location\b/, /\bfind (?:the |our )?(?:shop|store|location)\b/,
    /\bview (?:our )?products?\b/, /\bbrowse (?:our )?products?\b/, /\bproduct categories\b/, /\bproducts? (?:and|or) services?\b/, /\bdirections?\b/
  )
  if ((publicWebsiteIntent && publicBusinessContentIntent) && !publicPresentationScopeActive(config)) {
    signals.push({
      id: 'context-recommended-setup-incomplete',
      title: 'Recommended setup incomplete',
      detail: 'Project intent may not be fully represented. You described a public business/marketing website where visitors should view offerings and/or find the physical location, but no corresponding public marketing/content scope is active. Review Portfolio & marketing and the public-site capabilities before implementation. Nothing has been activated automatically.',
      targetSection: 'business',
      severity: 'important',
      category: 'scope',
      affectedSettings: ['pack.portfolio', 'landing.enabled', 'pages.contact'],
    })
  }

  const commerceIntent = has(
    /\bonline shop(?:ping)?\b/, /\bonline store\b/, /\be-?commerce\b/, /\bshopping cart\b/, /\badd to cart\b/,
    /\bcheckout\b/, /\bcustomer(?:s)? (?:can|should|will|must) (?:buy|purchase|shop|order)\b/,
    /\b(?:buy|purchase|order) (?:products?|items?) (?:online|on the site|through the site)\b/
  )
  if (commerceIntent && !resolveScope(config, 'pack.commerce').active) {
    signals.push({
      id: 'context-commerce-mismatch',
      title: 'Possible commerce scope mismatch',
      detail: 'Project Context describes customers shopping, ordering, or checking out online, but E-commerce is not active. Review the commerce pack if purchasing is truly in scope; otherwise keep the current structured scope.',
      targetSection: 'business',
      severity: 'advisory',
      category: 'scope',
      affectedSettings: ['pack.commerce'],
    })
  }

  const bookingIntent = has(
    /\bbook(?:ing|ings)? (?:a |an )?(?:slot|court|room|appointment|service|schedule)\b/, /\b(?:make|create|manage|accept) reservations?\b/,
    /\breserve (?:a |an )?(?:slot|court|room|appointment|service|time)\b/, /\bappointment booking\b/, /\bschedule (?:an )?appointment\b/, /\bavailable time slots?\b/
  )
  if (bookingIntent && !resolveScope(config, 'pack.booking').active) {
    signals.push({
      id: 'context-booking-mismatch',
      title: 'Possible booking scope mismatch',
      detail: 'Project Context describes reservations, appointments, or bookable time slots, but Booking & scheduling is not active. Review that pack if users must reserve real availability.',
      targetSection: 'business',
      severity: 'advisory',
      category: 'scope',
      affectedSettings: ['pack.booking'],
    })
  }

  const paymentIntent = has(
    /\bonline payment(?:s)?\b/, /\bpay (?:online|through the site|in the app)\b/, /\bpayment gateway\b/,
    /\bpaymongo\b/, /\bstripe\b/, /\bgcash\b/, /\bmaya\b/, /\bcard payment(?:s)?\b/
  )
  if (paymentIntent && !resolveScope(config, 'pack.payments').active) {
    signals.push({
      id: 'context-payment-mismatch',
      title: 'Possible payment scope mismatch',
      detail: 'Project Context explicitly mentions collecting or processing payments, but Payments & money is not active. Review the payments pack if money movement belongs in the product.',
      targetSection: 'business',
      severity: 'advisory',
      category: 'scope',
      affectedSettings: ['pack.payments'],
    })
  }

  const hrmsIntent = has(
    /\bhrms\b/, /\bhuman resources? (?:management )?system\b/, /\bhuman resource information system\b/, /\bhris\b/
  )
  if (hrmsIntent) {
    const hrSignals = [
      ['employee', /\bemployee records?\b|\bemployee profiles?\b|\bpersonnel records?\b/],
      ['leave', /\bleave management\b|\bleave requests?\b|\bleave credits?\b/],
      ['attendance', /\battendance\b|\btimekeeping\b|\btimesheets?\b/],
      ['payroll', /\bpayroll\b|\bcompensation\b/],
      ['recruitment', /\brecruitment\b|\bapplicant tracking\b|\bhiring\b/],
      ['performance', /\bperformance management\b|\bperformance review\b|\bappraisal\b/],
    ] as const
    const hrCapabilityPattern = /employee|leave|attendance|payroll|recruit|performance|human.?resources|hrms|hris/i
    const hrRepresented = configSettings.some((setting) => {
      const descriptor = `${setting.id} ${setting.label} ${(setting.keywords ?? []).join(' ')}`
      if (!hrCapabilityPattern.test(descriptor)) return false
      return isScopeSetting(setting.id) ? resolveScope(config, setting.id).active : config.overrides.includes(setting.id)
    })
    const mentionedModules = hrSignals.filter(([, pattern]) => pattern.test(text)).map(([label]) => label)
    if (!hrRepresented) {
      signals.push({
        id: 'context-hrms-structured-scope-mismatch',
        title: 'Product intent may not be represented',
        detail: `Project Context describes an HRMS${mentionedModules.length ? ` (${mentionedModules.join(', ')})` : ''}, but the current structured scope does not contain an explicit HR capability selection. Do not invent HR modules. Add/select the intended HR capabilities before implementation.`,
        targetSection: 'business',
        severity: 'important',
        category: 'scope',
        affectedSettings: [],
      })
    }
  }

  const reusableProductIntent = has(
    /\bmultiple ministr(?:y|ies)\b/, /\bmultiple organizations?\b/, /\bmultiple agencies\b/, /\bwhite[- ]?label\b/,
    /\bplug[- ]?and[- ]?play\b/, /\breuse (?:the )?(?:same )?(?:app|system|platform|codebase)\b/,
    /\bone (?:app|system|platform|codebase) (?:for|across) (?:many|multiple|different)\b/, /\btenant[- ]configurable\b/
  )
  if (reusableProductIntent && value(config, 'product.reuseIntent') === 'Single-purpose application') {
    signals.push({
      id: 'context-reusable-product-mismatch',
      title: 'Possible reusable-product architecture mismatch',
      detail: 'Project Context describes one product serving multiple ministries/organizations or a white-label/reusable deployment model, but Product reuse intent is still Single-purpose application. Review Reusable product architecture; do not change business packs automatically.',
      targetSection: 'productization',
      severity: 'advisory',
      category: 'scope',
      affectedSettings: ['product.reuseIntent'],
    })
  }

  return signals
}
