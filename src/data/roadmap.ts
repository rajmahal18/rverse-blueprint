import {
  effectiveConfigValue,
  normalizeProjectConfig,
  resolveScope,
  resolvedOperationalScale,
  settingIsActive,
  type ProjectConfig,
} from './configurator'
import { coreFlowQuality, type CoreFlow } from './coreFlows'
import { configReviewSignals } from './reviewSignals'

export type RoadmapPhaseKind = 'preflight' | 'foundation' | 'access' | 'productization' | 'domain' | 'integration' | 'journey' | 'operations' | 'hardening' | 'release'

export type RoadmapPhase = {
  id: string
  kind: RoadmapPhaseKind
  title: string
  objective: string
  deliverables: string[]
  proof: string[]
  sources: string[]
  dependsOn: string[]
  blocking?: boolean
}

export type ImplementationRoadmap = {
  phases: RoadmapPhase[]
  summary: string
  principles: string[]
  authoredFlowCount: number
  incompleteFlowCount: number
}

type DomainTemplate = {
  scopeId: string
  title: string
  objective: string
  deliverables: string[]
  proof: string[]
}

const cleanList = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
const scopeOn = (config: ProjectConfig, id: string) => resolveScope(config, id).active
const active = (config: ProjectConfig, id: string) => settingIsActive(id, config)
const value = (config: ProjectConfig, id: string) => effectiveConfigValue(config, id)

const domainTemplates: DomainTemplate[] = [
  {
    scopeId: 'pack.booking',
    title: 'Availability & booking domain',
    objective: 'Build the authoritative availability, reservation, conflict, and booking-state model before polishing booking screens.',
    deliverables: ['Resource/schedule availability model', 'Authoritative booking write path and lifecycle', 'Conflict/hold/cancellation behavior required by App Setup'],
    proof: ['Concurrent requests cannot both confirm the same exclusive slot', 'Availability shown to users reconciles with authoritative booking state'],
  },
  {
    scopeId: 'pack.commerce',
    title: 'Catalog, cart & order domain',
    objective: 'Establish product selection, pricing, cart, checkout, and order-state rules as one coherent transaction model.',
    deliverables: ['Catalog/product or variant model', 'Cart and pricing calculation boundary', 'Durable order lifecycle and fulfillment state'],
    proof: ['Order totals and line items remain internally consistent', 'Duplicate checkout attempts do not create duplicate fulfillment'],
  },
  {
    scopeId: 'pack.inventory',
    title: 'Inventory ledger & stock operations',
    objective: 'Implement stock as traceable movements and authoritative balances rather than editable counters.',
    deliverables: ['Item/location stock model', 'Auditable stock movement ledger', 'Adjustment/reorder/transfer behavior that is actually active'],
    proof: ['Concurrent stock-changing actions cannot silently corrupt balances', 'Every stock mutation has an attributable movement/reason'],
  },
  {
    scopeId: 'pack.directory',
    title: 'Listings, discovery & freshness',
    objective: 'Build the listing model and discovery path around trustworthy searchable data and explicit freshness rules.',
    deliverables: ['Listing/profile data model', 'Search/filter/discovery path', 'Freshness, ownership, moderation, or verification behavior that is active'],
    proof: ['Discovery results obey visibility/status rules', 'Stale or restricted listings do not masquerade as current public truth'],
  },
  {
    scopeId: 'pack.government',
    title: 'Document routing & accountability',
    objective: 'Implement government/document state transitions with durable receipt, routing, visibility, and audit semantics.',
    deliverables: ['Document/record identity and lifecycle', 'Routing/receipt/return relationships', 'Actor/time audit history and public/internal visibility boundaries'],
    proof: ['Routing changes are attributable and replayable from history', 'Public tracking cannot expose restricted internal routing detail'],
  },
  {
    scopeId: 'pack.clinic',
    title: 'Clinical record & encounter domain',
    objective: 'Build patient/encounter/clinical-record boundaries with role-aware access before layering convenience features.',
    deliverables: ['Patient identity and encounter model', 'Clinical/operational record boundaries', 'Authorized update and audit behavior'],
    proof: ['Clinical records remain inaccessible to unauthorized roles', 'Important record/access changes preserve audit context'],
  },
  {
    scopeId: 'pack.tournament',
    title: 'Tournament structure & scoring',
    objective: 'Establish event structure, participants, matches, scoring, standings, and progression as deterministic domain rules.',
    deliverables: ['Event/division/participant model', 'Match and scoring lifecycle', 'Standings/progression rules required by the configured tournament shape'],
    proof: ['The same result set produces deterministic standings/progression', 'Completed results cannot be accidentally duplicated or applied twice'],
  },
  {
    scopeId: 'pack.subscriptions',
    title: 'Subscription lifecycle',
    objective: 'Implement plan, entitlement, billing-state, renewal, and cancellation semantics without conflating provider state with product access.',
    deliverables: ['Plan/subscription data model', 'Entitlement/access lifecycle', 'Renewal/cancellation/past-due reconciliation rules'],
    proof: ['Entitlement state is derived consistently from trusted subscription state', 'Repeated provider events do not duplicate lifecycle side effects'],
  },
  {
    scopeId: 'pack.portfolio',
    title: 'Public content & conversion path',
    objective: 'Build the public information hierarchy and primary conversion/contact path before decorative polish.',
    deliverables: ['Core public page/content structure', 'Selected work/proof content model where applicable', 'Primary contact/conversion path'],
    proof: ['The primary visitor path is obvious on mobile and desktop', 'Public content remains usable without unnecessary account or operational scope'],
  },
]

const integrationSettings = [
  ['integration.email', 'Email'],
  ['integration.sms', 'SMS'],
  ['integration.push', 'Push notifications'],
  ['integration.calendar', 'Calendar'],
  ['integration.maps', 'Maps / geocoding'],
  ['integration.storage', 'External storage'],
  ['integration.collaboration', 'Collaboration / team chat'],
  ['integration.crm', 'CRM'],
  ['integration.accounting', 'Accounting'],
  ['integration.externalAutomation', 'External automation'],
] as const

function phase(id: string, kind: RoadmapPhaseKind, title: string, objective: string, deliverables: string[], proof: string[], sources: string[], dependsOn: string[] = [], blocking = false): RoadmapPhase {
  return { id, kind, title, objective, deliverables: cleanList(deliverables), proof: cleanList(proof), sources: cleanList(sources), dependsOn: cleanList(dependsOn), ...(blocking ? { blocking: true } : {}) }
}

function domainPhases(config: ProjectConfig, foundationDependency: string, accessDependency?: string): RoadmapPhase[] {
  const dependencies = cleanList([foundationDependency, accessDependency ?? ''])
  return domainTemplates.filter((template) => scopeOn(config, template.scopeId)).map((template) => phase(
    `domain-${template.scopeId.replace('pack.', '')}`,
    'domain',
    template.title,
    template.objective,
    template.deliverables,
    template.proof,
    [`App Setup: ${template.scopeId}`],
    dependencies,
  ))
}

function integrationPhase(config: ProjectConfig, dependencies: string[]): RoadmapPhase | null {
  const integrations = integrationSettings.filter(([id]) => scopeOn(config, id)).map(([, label]) => label)
  const payments = scopeOn(config, 'pack.payments')
  const webhooks = scopeOn(config, 'platform.webhooks')
  const ai = scopeOn(config, 'ai.enabled')
  if (!integrations.length && !payments && !webhooks && !ai) return null

  const deliverables: string[] = []
  const proof: string[] = []
  const sources: string[] = []
  if (payments) {
    deliverables.push('Trusted payment initiation, verification, reconciliation, and internal transaction-state boundary')
    proof.push('Browser return/redirect alone can never mark money movement authoritative', 'Duplicate/delayed payment callbacks reconcile idempotently')
    sources.push('App Setup: pack.payments')
  }
  if (integrations.length) {
    deliverables.push(`Provider adapters and failure/retry behavior for: ${integrations.join(', ')}`)
    proof.push('A provider outage does not silently corrupt the core business transaction')
    sources.push(...integrations.map((label) => `App Setup integration: ${label}`))
  }
  if (webhooks) {
    deliverables.push('Incoming/outgoing webhook trust boundary, signature/verification behavior, retry, and idempotency controls')
    proof.push('Repeated or out-of-order webhook delivery cannot duplicate side effects')
    sources.push('App Setup: platform.webhooks')
  }
  if (ai) {
    deliverables.push('Permission-aware AI boundary, provider failure behavior, structured/grounded output controls required by App Setup')
    proof.push('AI output cannot bypass caller authorization or directly create unvalidated high-impact state')
    sources.push('App Setup: ai.enabled')
  }

  return phase('integrations', 'integration', 'Transactional & external integrations', 'Connect external systems only after the internal domain has an authoritative state model to protect.', deliverables, proof, sources, dependencies)
}

function reusableProductPhase(config: ProjectConfig, dependencies: string[]): RoadmapPhase | null {
  const reuseIntent = String(value(config, 'product.reuseIntent'))
  if (reuseIntent === 'Single-purpose application') return null

  const deployment = String(value(config, 'product.deploymentModel'))
  const moduleModel = String(value(config, 'product.moduleModel'))
  const deliverables = [
    `Shared-core boundary: ${String(value(config, 'product.sharedCore'))}`,
    `Organization deployment model: ${deployment}`,
    `Module/entitlement model: ${moduleModel}`,
    `Configuration resolution: ${String(value(config, 'product.configScope'))}`,
    `Repeatable organization provisioning: ${String(value(config, 'product.provisioning'))}`,
  ]
  const proof = [
    'A second representative organization can be provisioned without cloning the repository or hardcoding organization-specific business logic.',
    'One organization can change allowed configuration without changing another organization’s effective configuration.',
    'An application upgrade can be applied to the maintained product core without reconciling permanent tenant forks.',
  ]
  const sources = [
    'App Setup: product.reuseIntent',
    'App Setup: product.sharedCore',
    'App Setup: product.deploymentModel',
    'App Setup: product.moduleModel',
    'App Setup: product.configScope',
  ]

  if (['Configurable modules per organization', 'Entitlement-based modules / editions'].includes(moduleModel)) {
    deliverables.push(`Module dependency/activation contract: ${String(value(config, 'product.moduleDependencies'))}`)
    proof.push('A disabled module disappears from tenant navigation/actions/jobs and cannot execute hidden side effects through an undeclared dependency.')
    sources.push('App Setup: product.moduleDependencies')
  }
  if (['Shared multi-tenant runtime', 'Hybrid shared + isolated'].includes(deployment)) {
    deliverables.push(`Authoritative tenant data boundary: ${String(value(config, 'product.isolationStrategy'))}`)
    proof.push('Cross-tenant reads/writes/exports/background jobs fail closed when tenant context is missing, stale, or intentionally tampered with.')
    sources.push('App Setup: product.isolationStrategy', 'App Setup: org.mode / tenant boundary')
  }
  if (String(value(config, 'product.terminology')) !== 'Fixed product vocabulary') deliverables.push(`Tenant vocabulary resolver: ${String(value(config, 'product.terminology'))}`)
  if (String(value(config, 'product.customFields')) !== 'Fixed schema only') deliverables.push(`Governed tenant metadata/custom-field boundary: ${String(value(config, 'product.customFields'))}`)
  if (String(value(config, 'product.workflowCustomization')) !== 'Fixed workflows') deliverables.push(`Tenant workflow policy boundary: ${String(value(config, 'product.workflowCustomization'))}`)
  if (String(value(config, 'product.roleCustomization')) !== 'Global fixed roles') deliverables.push(`Tenant role model with platform invariants: ${String(value(config, 'product.roleCustomization'))}`)
  if (String(value(config, 'product.brandingDepth')) !== 'Product brand only') deliverables.push(`Tenant presentation identity: ${String(value(config, 'product.brandingDepth'))}`)
  deliverables.push(`Extension boundary: ${String(value(config, 'product.extensionStrategy'))}`)
  deliverables.push(`Tenant rollout/version compatibility: ${String(value(config, 'product.rollout'))} · ${String(value(config, 'product.versioning'))}`)

  return phase(
    'productization',
    'productization',
    'Reusable product & tenant architecture',
    `Establish the build-once architecture for “${reuseIntent}” before domain modules accumulate organization-specific assumptions.`,
    deliverables,
    proof,
    sources,
    dependencies,
  )
}

function journeyPhases(flows: CoreFlow[], dependencies: string[]): RoadmapPhase[] {
  return flows.map((flow, index) => {
    const quality = coreFlowQuality(flow)
    const title = flow.title.trim() || `Core flow ${index + 1}`
    const deliverables = flow.steps.filter((step) => step.trim()).map((step) => step.trim())
    if (!deliverables.length) deliverables.push('Complete the main-path sequence before implementation')
    const proof = [flow.successState ? `Success state: ${flow.successState.trim()}` : 'Define a durable success state before calling this flow complete']
    proof.push(...flow.failureStates.filter((item) => item.trim()).map((item) => `Recovery: ${item.trim()}`))
    if (!quality.complete) proof.unshift(`Preflight gap: complete ${quality.missing.join(', ')}`)
    return phase(
      `journey-${flow.id}`,
      'journey',
      `${quality.complete ? 'Implement' : 'Clarify & implement'}: ${title}`,
      flow.goal.trim() ? `${flow.actor.trim() || 'The intended actor'} must be able to ${flow.goal.trim()} from ${flow.startingPoint.trim() || 'the defined starting point'} without bypassing resolved App Setup scope.` : 'Turn the authored flow into one coherent, recoverable user journey inside resolved App Setup scope.',
      deliverables,
      proof,
      [`Core Flow: ${title}`],
      dependencies,
      !quality.complete,
    )
  })
}

export function deriveImplementationRoadmap(inputConfig: ProjectConfig, flows: CoreFlow[] = []): ImplementationRoadmap {
  const config = normalizeProjectConfig(inputConfig)
  const phases: RoadmapPhase[] = []
  const signals = configReviewSignals(config)
  const blockers = signals.filter((signal) => signal.severity === 'blocker')
  const important = signals.filter((signal) => signal.severity === 'important')
  const incompleteFlows = flows.filter((flow) => !coreFlowQuality(flow).complete)

  if (blockers.length) {
    phases.push(phase(
      'preflight',
      'preflight',
      'Resolve blueprint blockers',
      'Do not begin irreversible implementation work while the structured blueprint contains blocker-level contradictions.',
      blockers.map((signal) => `${signal.title}: ${signal.detail}`),
      ['Re-run Blueprint review until no blocker-level App Setup signals remain'],
      blockers.map((signal) => `Review signal: ${signal.id}`),
      [],
      true,
    ))
  }

  const preflightDependency = phases.some((item) => item.id === 'preflight') ? ['preflight'] : []
  const foundationDeliverables = [
    'Project structure, environment/configuration boundaries, and shared conventions',
    'Responsive application shell and baseline design tokens from Visual Studio',
  ]
  const persistentData = scopeOn(config, 'records.crud') || domainTemplates.some((template) => template.scopeId !== 'pack.portfolio' && scopeOn(config, template.scopeId))
  if (persistentData) foundationDeliverables.push('Authoritative data model and migration strategy for active product scope')
  if (scopeOn(config, 'forms.enabled') || scopeOn(config, 'records.crud')) foundationDeliverables.push('Shared server/data validation boundary for structured writes')
  const foundation = phase(
    'foundation',
    'foundation',
    'Foundation & architecture',
    'Create the smallest stable technical foundation justified by the resolved product scope and operational scale.',
    foundationDeliverables,
    ['Application starts reliably in the intended environments', 'Core data/config boundaries are reproducible rather than hand-edited'],
    [`App type: ${config.appType}`, `Operational scale: ${resolvedOperationalScale(config)}`],
    preflightDependency,
  )
  phases.push(foundation)

  const needsAccess = scopeOn(config, 'login.enabled') || scopeOn(config, 'admin.enabled')
  let accessPhase: RoadmapPhase | null = null
  if (needsAccess) {
    const accessDeliverables = ['Authentication/session boundary for every protected surface', 'Server-enforced authorization that matches the configured role/permission model']
    if (scopeOn(config, 'admin.enabled')) accessDeliverables.push('Protected administrative route/action boundary')
    if (active(config, 'login.mfa') && String(value(config, 'login.mfa')).toLowerCase() !== 'off') accessDeliverables.push(`MFA/step-up behavior: ${String(value(config, 'login.mfa'))}`)
    accessPhase = phase('access', 'access', 'Identity, access & authorization', 'Establish who can reach or mutate protected data before implementing sensitive workflows on top of it.', accessDeliverables, ['UI visibility is never the only authorization control', 'Expired sessions and permission changes fail closed without losing safe user work'], ['App Setup: login/admin/permissions'], ['foundation'])
    phases.push(accessPhase)
  }

  const productizationDependencies = cleanList(['foundation', ...(accessPhase ? ['access'] : [])])
  const productization = reusableProductPhase(config, productizationDependencies)
  if (productization) phases.push(productization)

  const domainFoundationDependency = productization?.id ?? 'foundation'
  const domains = domainPhases(config, domainFoundationDependency, productization ? undefined : accessPhase?.id)
  phases.push(...domains)
  const domainDependencies = domains.length ? domains.map((item) => item.id) : cleanList([productization?.id ?? 'foundation', ...(!productization && accessPhase ? ['access'] : [])])

  const integrations = integrationPhase(config, domainDependencies)
  if (integrations) phases.push(integrations)

  const journeyDependencies = cleanList([...(integrations ? [integrations.id] : []), ...domainDependencies, ...(accessPhase ? [accessPhase.id] : [])])
  const journeys = journeyPhases(flows, journeyDependencies)
  phases.push(...journeys)

  const notificationsActive = active(config, 'notifications.level') && String(value(config, 'notifications.level')) !== 'Off'
  const needsOperations = scopeOn(config, 'admin.enabled') || scopeOn(config, 'pack.reporting') || scopeOn(config, 'workflow.enabled') || scopeOn(config, 'approval.enabled')
  let operations: RoadmapPhase | null = null
  if (needsOperations) {
    const operationDeliverables = []
    if (scopeOn(config, 'admin.enabled')) operationDeliverables.push('Admin/staff operational surfaces for the active domain only')
    if (scopeOn(config, 'workflow.enabled') || scopeOn(config, 'approval.enabled')) operationDeliverables.push('Traceable workflow/approval operations and state-transition controls')
    if (scopeOn(config, 'pack.reporting')) operationDeliverables.push('Reports/analytics based on authoritative domain data')
    if (notificationsActive) operationDeliverables.push('User-facing notification behavior for meaningful state changes')
    if (active(config, 'obs.logs')) operationDeliverables.push('Structured operational logging/diagnostics appropriate to the configured scale')
    const operationDeps = journeys.length ? journeys.map((item) => item.id) : integrations ? [integrations.id] : domainDependencies
    operations = phase('operations', 'operations', 'Admin & operational tooling', 'Add staff visibility, controls, reporting, and diagnostics after the underlying domain paths behave correctly.', operationDeliverables, ['Operational screens use the same authorization and domain rules as primary user flows', 'Reports and dashboards reconcile to authoritative records rather than parallel counters'], ['App Setup: admin/workflow/reporting/observability'], operationDeps)
    phases.push(operations)
  }

  const hardeningDependencies = operations ? [operations.id] : journeys.length ? journeys.map((item) => item.id) : integrations ? [integrations.id] : domainDependencies
  const hardeningDeliverables = [
    'Critical-path automated tests and regression coverage proportional to configured operational impact',
    'Explicit loading/empty/error/retry behavior for primary workflows',
    'Concurrency, duplicate-submit, timeout, and partial-failure handling for state-changing operations',
  ]
  if (scopeOn(config, 'quality.backups')) hardeningDeliverables.push('Backup/restore/recovery behavior and recovery drill appropriate to the configured data importance')
  if (String(value(config, 'product.reuseIntent')) !== 'Single-purpose application') hardeningDeliverables.push('Regression matrix across at least two representative organization profiles covering module enablement, tenant configuration isolation, authorization, and upgrade compatibility')
  if (important.length) hardeningDeliverables.push(...important.map((signal) => `Resolve important review signal — ${signal.title}`))
  if (incompleteFlows.length) hardeningDeliverables.push(`Close ${incompleteFlows.length} incomplete Core Flow contract${incompleteFlows.length > 1 ? 's' : ''} before final acceptance`)
  const hardening = phase('hardening', 'hardening', 'Reliability, recovery & proof', 'Prove the product behaves safely under failure and concurrency instead of treating the happy path as completion.', hardeningDeliverables, ['No blocker-level Blueprint review signal remains', 'Critical acceptance criteria and captured recovery states have executable or repeatable proof'], ['App Setup quality/testing/recovery', ...(flows.length ? ['Core Flow recovery states'] : [])], hardeningDependencies)
  phases.push(hardening)

  const releaseDeliverables = ['Run the project’s build/typecheck/test/lint gates that actually exist', 'Validate representative mobile and desktop workflows against the structured visual/product contract', 'Update selected project docs so repository guidance matches the implemented system']
  if (String(value(config, 'product.reuseIntent')) !== 'Single-purpose application') releaseDeliverables.push('Provision or configure a second representative organization from the same release artifact without repository cloning or tenant-specific source edits')
  if (active(config, 'platform.deployment')) releaseDeliverables.push(`Deploy using the configured target/strategy: ${String(value(config, 'platform.deployment'))}`)
  const release = phase('release', 'release', 'Release & operational verification', 'Ship only after the implementation, generated proof, documentation, and deployment behavior agree with the same resolved Blueprint.', releaseDeliverables, ['Production/release candidate passes the project validation gates', 'A representative end-to-end path succeeds in the target environment', 'Rollback/recovery path is understood for the configured operational scale'], ['App Setup delivery/testing/operations'], ['hardening'])
  phases.push(release)

  return {
    phases,
    summary: `${phases.length} derived phase${phases.length === 1 ? '' : 's'} from ${config.appType}, ${flows.length} authored Core Flow${flows.length === 1 ? '' : 's'}, and the currently resolved App Setup scope.`,
    principles: [
      'The roadmap sequences implementation; it never creates product scope.',
      'App Setup remains authoritative. A roadmap item must be dropped or narrowed when its underlying scope is Off/inactive.',
      'Core Flows shape journey phases only inside resolved scope; they do not authorize excluded capabilities.',
      'Reusable-product settings shape tenant/module/configuration architecture only after the user deliberately selects a reuse intent; they never activate business packs.',
      'Dependencies express a recommended build order, not a mandatory waterfall. Parallelize only when shared contracts are stable.',
    ],
    authoredFlowCount: flows.length,
    incompleteFlowCount: incompleteFlows.length,
  }
}

export function implementationRoadmapMarkdown(roadmap: ImplementationRoadmap, headingLevel = 3): string {
  const heading = '#'.repeat(Math.max(1, Math.min(6, headingLevel)))
  return roadmap.phases.map((item, index) => {
    const deps = item.dependsOn.length ? `\n- Depends on: ${item.dependsOn.join(', ')}` : ''
    const blocking = item.blocking ? '\n- Gate: Blocking — resolve before irreversible implementation work.' : ''
    return `${heading} Phase ${index + 1} — ${item.title}\n${item.objective}${blocking}${deps}\n- Deliverables:\n${item.deliverables.map((entry) => `  - ${entry}`).join('\n')}\n- Proof:\n${item.proof.map((entry) => `  - ${entry}`).join('\n')}\n- Derived from: ${item.sources.join(' · ')}`
  }).join('\n\n')
}

export function implementationRoadmapPrompt(roadmap: ImplementationRoadmap): string {
  return roadmap.phases.map((item, index) => `PHASE ${index + 1} — ${item.title}${item.blocking ? ' [BLOCKING GATE]' : ''}\nObjective: ${item.objective}\nDependencies: ${item.dependsOn.length ? item.dependsOn.join(', ') : 'None'}\nDeliverables:\n${item.deliverables.map((entry) => `- ${entry}`).join('\n')}\nProof before advancing:\n${item.proof.map((entry) => `- ${entry}`).join('\n')}`).join('\n\n')
}
