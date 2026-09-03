export type AppType =
  | 'Custom / General'
  | 'Booking / Scheduling'
  | 'Internal / Operations'
  | 'SaaS / Client Portal'
  | 'E-commerce'
  | 'Directory / Marketplace'
  | 'Portfolio / Marketing'
  | 'Government System'
  | 'Clinic / EMR'
  | 'Inventory / POS'
  | 'Tournament / Event'

export type ConfigProfile = 'Recommended' | 'Minimal' | 'Standard' | 'Advanced'
export type ConfigDepth = 'Quick' | 'Standard' | 'Advanced'
export type OperationalScale = 'Auto' | 'Lean' | 'Standard' | 'High scale' | 'Mission critical'
export type ResolvedOperationalScale = Exclude<OperationalScale, 'Auto'>
export type ConfigValue = string | boolean | number
export type ScopeChoice = 'On' | 'Off'

export type ConfigCondition = {
  id: string
  equals: ConfigValue | ConfigValue[]
}

export type ConfigOption = {
  value: string
  label?: string
  note?: string
}

export type ConfigSetting = {
  id: string
  section: string
  label: string
  description: string
  kind: 'boolean' | 'choice'
  options?: ConfigOption[]
  defaultValue: ConfigValue
  appDefaults?: Partial<Record<AppType, ConfigValue>>
  profileDefaults?: Partial<Record<Exclude<ConfigProfile, 'Recommended'>, ConfigValue>>
  dependsOn?: ConfigCondition
  advanced?: boolean
  caution?: string
  group?: string
  keywords?: string[]
}

export type ConfigSection = {
  id: string
  label: string
  description: string
}

export type ProjectConfig = {
  appType: AppType
  profile: ConfigProfile
  operationalScale: OperationalScale
  values: Record<string, ConfigValue>
  overrides: string[]
  /** Explicit scope intent only. Missing means Auto. */
  scopeChoices: Record<string, ScopeChoice>
}

export const appTypes: { value: AppType; description: string }[] = [
  { value: 'Custom / General', description: 'Use only when no existing app type fits; major scope stays neutral until you choose it.' },
  { value: 'Booking / Scheduling', description: 'Appointments, courts, rooms, services, schedules, and availability.' },
  { value: 'Internal / Operations', description: 'Staff-facing systems, queues, records, approvals, and daily operations.' },
  { value: 'SaaS / Client Portal', description: 'Account-based products and client workspaces; workflow, collaboration, billing, and integrations stay optional until needed.' },
  { value: 'E-commerce', description: 'Public catalog, customer accounts, checkout, orders, and transactions.' },
  { value: 'Directory / Marketplace', description: 'Searchable listings, discovery, submissions, and owner/admin workflows. Commerce/payments are separate if transactions happen in-app.' },
  { value: 'Portfolio / Marketing', description: 'Public-facing business, brand, project, service, portfolio, or campaign websites without transactional checkout.' },
  { value: 'Government System', description: 'Role-heavy internal/public workflows with auditability and operational safeguards.' },
  { value: 'Clinic / EMR', description: 'Restricted clinical records, appointments, services, and traceable staff actions.' },
  { value: 'Inventory / POS', description: 'Items, stock movement, transactions, branches, and operational reporting.' },
  { value: 'Tournament / Event', description: 'Public event information with protected organizer/admin workflows.' },
]

export const configProfiles: { value: ConfigProfile; description: string }[] = [
  { value: 'Recommended', description: 'App-aware defaults tuned by Operational Scale. Best starting point.' },
  { value: 'Minimal', description: 'Prefer fewer optional behaviors while preserving required safety and scope.' },
  { value: 'Standard', description: 'Prefer conventional product behavior; Operational Scale still controls engineering intensity.' },
  { value: 'Advanced', description: 'Prefer deeper controls and safeguards where available; this does not change product scale by itself.' },
]

export const configDepths: { value: ConfigDepth; label: string; description: string }[] = [
  { value: 'Quick', label: 'Quick', description: 'Essentials only. Let Blueprint handle the detailed defaults.' },
  { value: 'Standard', label: 'Standard', description: 'Important product behavior without deep engineering controls.' },
  { value: 'Advanced', label: 'Advanced', description: 'Every applicable setting, including engineering and edge-case detail.' },
]


export const operationalScales: { value: OperationalScale; label: string; description: string }[] = [
  { value: 'Auto', label: 'Auto', description: 'Infer a proportional operating posture from the app type; this is the recommended default.' },
  { value: 'Lean', label: 'Lean', description: 'Small-business and focused products: production-safe without enterprise operations machinery.' },
  { value: 'Standard', label: 'Standard', description: 'Growing products with normal operational safeguards and room to expand.' },
  { value: 'High scale', label: 'High scale', description: 'Higher traffic, stronger release/observability expectations, and tighter recovery targets.' },
  { value: 'Mission critical', label: 'Mission critical', description: 'Outages or data loss materially disrupt essential operations; stronger controls are justified.' },
]

export function inferredOperationalScale(appType: AppType): ResolvedOperationalScale {
  if (['Government System', 'Clinic / EMR'].includes(appType)) return 'Mission critical'
  if (['SaaS / Client Portal', 'Booking / Scheduling', 'Internal / Operations', 'Inventory / POS'].includes(appType)) return 'Standard'
  if (appType === 'Custom / General') return 'Standard'
  return 'Lean'
}

export function resolvedOperationalScale(config: Pick<ProjectConfig, 'appType' | 'operationalScale'>): ResolvedOperationalScale {
  return config.operationalScale === 'Auto' ? inferredOperationalScale(config.appType) : config.operationalScale
}

export const configSections: ConfigSection[] = [
  { id: 'identity', label: 'Product shape', description: 'High-level structure: audience, public/private shape, app shell, and where users begin.' },
  { id: 'access', label: 'Authentication', description: 'Sign-in, registration, credentials, verification, recovery, MFA, and session behavior.' },
  { id: 'accounts', label: 'Accounts & profiles', description: 'Profile shape, account states, identity changes, invitations, and account lifecycle.' },
  { id: 'permissions', label: 'Roles & permissions', description: 'Authorization model, role structure, permission scope, ownership rules, and privileged access.' },
  { id: 'organizations', label: 'Organizations & teams', description: 'Workspaces, departments, memberships, invitations, tenant boundaries, and organization administration.' },
  { id: 'pages', label: 'Page inventory', description: 'Common public and account pages that should exist without forcing a custom sitemap from scratch.' },
  { id: 'public', label: 'Landing & public site', description: 'Landing-page composition, public proof, calls-to-action, and marketing/supporting sections.' },
  { id: 'navigation', label: 'Navigation & orientation', description: 'How users move, recover context, search globally, and reach frequent actions.' },
  { id: 'dashboard', label: 'Dashboard', description: 'Signed-in home behavior, operational summaries, widgets, and role-specific starting views.' },
  { id: 'experience', label: 'Everyday UX', description: 'Defaults that make routine use forgiving, clear, efficient, and low-effort.' },
  { id: 'states', label: 'States & recovery', description: 'Loading, empty, error, offline, permission, maintenance, and long-running task behavior.' },
  { id: 'mobile', label: 'Mobile behavior', description: 'Phone-specific interaction rules instead of shrinking desktop behavior and hoping it works.' },
  { id: 'records', label: 'Records & forms', description: 'Common record lifecycle defaults kept for backward compatibility with earlier Blueprint projects.' },
  { id: 'data', label: 'Data model & integrity', description: 'Entity relationships, identifiers, validation boundaries, concurrency, history, and retention behavior.' },
  { id: 'forms', label: 'Forms & input', description: 'Form structure, field behavior, validation, drafts, autosave, submission safety, and complex input patterns.' },
  { id: 'views', label: 'Tables, search & views', description: 'How records are browsed, filtered, sorted, grouped, searched, saved, exported, and handled at scale.' },
  { id: 'workflow', label: 'Workflow & approvals', description: 'Statuses, transitions, assignments, approvals, SLAs, escalations, tasks, and operational queues.' },
  { id: 'collaboration', label: 'Files & collaboration', description: 'Attachments, comments, mentions, activity history, record locking, and team collaboration behavior.' },
  { id: 'business', label: 'Business packs', description: 'Turn domain packs on or off. The selected app type activates the relevant packs automatically; everything else stays hidden until needed.' },
  { id: 'booking', label: 'Booking & scheduling', description: 'Resources, availability, slots, holds, rescheduling, cancellations, waitlists, and check-in behavior.' },
  { id: 'payments', label: 'Payments & money', description: 'Payment collection, verification, fees, deposits, refunds, receipts, disputes, and settlement behavior.' },
  { id: 'subscriptions', label: 'Subscriptions & SaaS billing', description: 'Plans, trials, seats, usage, plan changes, invoices, dunning, and customer billing self-service.' },
  { id: 'commerce', label: 'E-commerce', description: 'Catalog, cart, checkout, fulfillment, promotions, order lifecycle, returns, and customer shopping behavior.' },
  { id: 'inventory', label: 'Inventory & POS', description: 'Stock, locations, movement, lots/serials, purchasing, counts, reservations, and operational controls.' },
  { id: 'reporting', label: 'Reports & analytics', description: 'Operational reports, dashboards, comparisons, drill-down, exports, scheduling, permissions, and data freshness.' },
  { id: 'directory', label: 'Directory & marketplace', description: 'Listings, submissions, claims, verification, maps, discovery, freshness, featured placement, reviews, and owner workflows.' },
  { id: 'tournament', label: 'Tournament & event', description: 'Registration, divisions, groups, schedules, scoring, standings, brackets, lineups, live results, and awards.' },
  { id: 'government', label: 'Government & document workflow', description: 'Document intake, routing, office hierarchy, references, signatories, turnaround tracking, printed slips, QR, and public tracking.' },
  { id: 'clinic', label: 'Clinic & EMR', description: 'Patients, encounters, appointments, vitals, clinical notes, orders, labs, medicines, referrals, consent, and restricted records.' },
  { id: 'portfolio', label: 'Portfolio & marketing', description: 'Projects, case studies, media, services, profile content, contact, proof, and interactive work showcases.' },
  { id: 'operations', label: 'Admin & workflow', description: 'Administrative control, roles, approvals, notifications, and reporting.' },
  { id: 'content', label: 'Content rules', description: 'Writing tone, AI-slop tolerance, labels, claims, helper copy, and product language.' },
  { id: 'support', label: 'Onboarding & help', description: 'First-use guidance, contextual help, feedback, support, and self-service troubleshooting.' },
  { id: 'quality', label: 'Security & quality', description: 'Security posture, accessibility, auditability, recovery, and validation.' },
  { id: 'delivery', label: 'Platform & delivery', description: 'High-level API, automation, offline, analytics, and deployment expectations retained as compatibility anchors.' },
  { id: 'integrations', label: 'Integration hub', description: 'Choose which external channels and connected-service families exist. Detailed sections stay hidden until a family is enabled.' },
  { id: 'api', label: 'APIs & webhooks', description: 'API contracts, authentication, versioning, quotas, webhook security, retries, delivery history, and replay behavior.' },
  { id: 'channels', label: 'Connected channels', description: 'Email, SMS, push, calendar, maps, storage, collaboration, CRM/accounting, and other provider-facing behavior.' },
  { id: 'automation', label: 'Automation & jobs', description: 'Triggers, rules, external automation, queues, background jobs, retries, approvals, observability, and failure recovery.' },
  { id: 'ai', label: 'AI & intelligence', description: 'AI use cases, provider/model strategy, grounding, privacy, human approval, tool permissions, cost controls, evaluation, and fallback behavior.' },
  { id: 'security', label: 'Security hardening', description: 'Browser/transport defenses, request trust, validation, uploads, abuse protection, secrets, dependencies, and production exposure.' },
  { id: 'privacy', label: 'Privacy & data governance', description: 'Data minimization, classification, encryption, masking, consent, retention, user rights, third parties, and sensitive-access accountability.' },
  { id: 'accessibility', label: 'Accessibility & inclusive UX', description: 'Keyboard/focus, semantics, forms, contrast, zoom/reflow, touch targets, motion/media, data presentation, and accessibility verification.' },
  { id: 'seo', label: 'SEO & web quality', description: 'Public indexing, metadata, canonical URLs, sitemaps, robots, structured data, sharing, redirects, and technical search quality.' },
  { id: 'performance', label: 'Performance & reliability', description: 'Performance targets, caching, database/query discipline, frontend assets, timeouts/retries, graceful degradation, health, capacity, and availability.' },
  { id: 'observability', label: 'Observability & incidents', description: 'Structured logs, redaction, request tracing, error tracking, metrics, uptime, alerts, dependency health, releases, and incident communication.' },
  { id: 'recovery', label: 'Backup & disaster recovery', description: 'Backup scope/frequency/retention/security, restore verification, RPO/RTO, runbooks, pre-change snapshots, and backup failure protection.' },
  { id: 'engineering', label: 'Deployment & engineering', description: 'Environments, secrets, database operations, migrations, deployment/rollback, regions, CI/CD, release safety, PWA, and offline conflict handling.' },
  { id: 'testing', label: 'Testing & compatibility', description: 'Unit/integration/E2E/security/accessibility/performance/domain tests plus browser, device, network, print, migration, and restore compatibility.' },
]




const phase4Settings: ConfigSetting[] = [
  // Data model & integrity
  { id: 'data.modelDepth', section: 'data', group: 'Model shape', label: 'Data-model detail', description: 'How explicitly Blueprint should define entities, relationships, constraints, and lifecycle rules.', kind: 'choice', defaultValue: 'Detailed', options: [{ value: 'Light' }, { value: 'Detailed' }, { value: 'Strict / domain-driven' }], appDefaults: { 'Portfolio / Marketing': 'Light', 'Government System': 'Strict / domain-driven', 'Clinic / EMR': 'Strict / domain-driven', 'Inventory / POS': 'Strict / domain-driven' }, profileDefaults: { Minimal: 'Light', Advanced: 'Strict / domain-driven' } },
  { id: 'data.identifiers', section: 'data', group: 'Model shape', label: 'Primary identifiers', description: 'Default identifier strategy for persisted records.', kind: 'choice', defaultValue: 'UUID / opaque IDs', options: [{ value: 'UUID / opaque IDs' }, { value: 'Sequential IDs' }, { value: 'Human-readable IDs + internal ID' }, { value: 'Domain-specific IDs' }], appDefaults: { 'Government System': 'Human-readable IDs + internal ID', 'Clinic / EMR': 'Human-readable IDs + internal ID', 'Inventory / POS': 'Domain-specific IDs' } },
  { id: 'data.humanRef', section: 'data', group: 'Model shape', label: 'Human-readable reference numbers', description: 'Generate stable references that staff can read aloud, print, or search without exposing database IDs.', kind: 'choice', defaultValue: 'For important records only', options: [{ value: 'Off' }, { value: 'For important records only' }, { value: 'For most operational records' }], appDefaults: { 'Government System': 'For most operational records', 'Clinic / EMR': 'For most operational records', 'Booking / Scheduling': 'For important records only', 'E-commerce': 'For important records only' } },
  { id: 'data.relationships', section: 'data', group: 'Model shape', label: 'Relationship strictness', description: 'How strongly parent/child and cross-entity relationships should be enforced.', kind: 'choice', defaultValue: 'Explicit foreign-key relationships', options: [{ value: 'Loose references' }, { value: 'Explicit foreign-key relationships' }, { value: 'Strict + documented cardinality' }], appDefaults: { 'Government System': 'Strict + documented cardinality', 'Clinic / EMR': 'Strict + documented cardinality', 'Inventory / POS': 'Strict + documented cardinality' }, profileDefaults: { Minimal: 'Loose references', Advanced: 'Strict + documented cardinality' } },
  { id: 'data.auditFields', section: 'data', group: 'Model shape', label: 'Standard audit fields', description: 'Track created/updated timestamps and actors on important mutable records.', kind: 'choice', defaultValue: 'createdAt + updatedAt + actor where relevant', options: [{ value: 'Timestamps only' }, { value: 'createdAt + updatedAt + actor where relevant' }, { value: 'Full creator/editor provenance' }], appDefaults: { 'Government System': 'Full creator/editor provenance', 'Clinic / EMR': 'Full creator/editor provenance' } },
  { id: 'data.uniqueRules', section: 'data', group: 'Integrity', label: 'Uniqueness constraints', description: 'Enforce true uniqueness in the database, not only in client-side validation.', kind: 'choice', defaultValue: 'Database-enforced where required', options: [{ value: 'Application validation only' }, { value: 'Database-enforced where required' }, { value: 'Strict + normalized uniqueness' }], profileDefaults: { Minimal: 'Database-enforced where required', Advanced: 'Strict + normalized uniqueness' } },
  { id: 'data.requiredRelations', section: 'data', group: 'Integrity', label: 'Required relationships', description: 'Prevent orphaned records when a relationship is mandatory to the domain.', kind: 'boolean', defaultValue: true },
  { id: 'data.deleteRelations', section: 'data', group: 'Integrity', label: 'Related-record deletion policy', description: 'Default behavior when deleting a parent that still has dependent records.', kind: 'choice', defaultValue: 'Restrict + explain dependencies', options: [{ value: 'Cascade automatically' }, { value: 'Restrict + explain dependencies' }, { value: 'Soft-delete graph' }, { value: 'Domain-specific' }], appDefaults: { 'Portfolio / Marketing': 'Cascade automatically', 'Government System': 'Restrict + explain dependencies', 'Clinic / EMR': 'Restrict + explain dependencies' } },
  { id: 'data.softDelete', section: 'data', group: 'Lifecycle', label: 'Soft-delete strategy', description: 'Whether recoverable deletion should be a first-class data-model behavior.', kind: 'choice', defaultValue: 'Important records only', options: [{ value: 'Off' }, { value: 'Important records only' }, { value: 'Default for mutable records' }, { value: 'Archive instead of delete' }], appDefaults: { 'Government System': 'Archive instead of delete', 'Clinic / EMR': 'Default for mutable records', 'Internal / Operations': 'Important records only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Default for mutable records' } },
  { id: 'data.restore', section: 'data', group: 'Lifecycle', label: 'Restore deleted records', description: 'Provide recovery for soft-deleted records when deletion is reversible.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'data.softDelete', equals: ['Important records only', 'Default for mutable records'] } },
  { id: 'data.archive', section: 'data', group: 'Lifecycle', label: 'Archive lifecycle', description: 'Support an explicit inactive/archive state separate from deletion.', kind: 'choice', defaultValue: 'Available when useful', options: [{ value: 'Off' }, { value: 'Available when useful' }, { value: 'Primary retirement mechanism' }], appDefaults: { 'Government System': 'Primary retirement mechanism', 'Clinic / EMR': 'Available when useful' } },
  { id: 'data.versionHistory', section: 'data', group: 'History & concurrency', label: 'Record version history', description: 'Preserve meaningful prior values for records where historical reconstruction matters.', kind: 'choice', defaultValue: 'Important records only', options: [{ value: 'Off' }, { value: 'Important records only' }, { value: 'Most editable records' }, { value: 'Immutable event history' }], appDefaults: { 'Government System': 'Most editable records', 'Clinic / EMR': 'Most editable records' }, profileDefaults: { Minimal: 'Off', Advanced: 'Most editable records' } },
  { id: 'data.optimisticLock', section: 'data', group: 'History & concurrency', label: 'Concurrent-edit protection', description: 'Prevent silent overwrites when two people edit the same record at the same time.', kind: 'choice', defaultValue: 'Detect stale edits', options: [{ value: 'Last write wins' }, { value: 'Detect stale edits' }, { value: 'Lock while editing' }, { value: 'Merge-aware workflow' }], appDefaults: { 'Government System': 'Detect stale edits', 'Clinic / EMR': 'Detect stale edits', 'Internal / Operations': 'Detect stale edits' }, profileDefaults: { Minimal: 'Last write wins', Advanced: 'Detect stale edits' } },
  { id: 'data.transactions', section: 'data', group: 'Integrity', label: 'Transactional writes', description: 'Group multi-record operations atomically when partial success would corrupt business state.', kind: 'choice', defaultValue: 'Required for multi-record business actions', options: [{ value: 'Best effort' }, { value: 'Required for multi-record business actions' }, { value: 'Strict transactional boundaries documented' }], appDefaults: { 'Inventory / POS': 'Strict transactional boundaries documented', 'Clinic / EMR': 'Strict transactional boundaries documented', 'E-commerce': 'Strict transactional boundaries documented' }, profileDefaults: { Minimal: 'Best effort', Advanced: 'Strict transactional boundaries documented' } },
  { id: 'data.idempotency', section: 'data', group: 'Integrity', label: 'Duplicate-write protection', description: 'Make retryable high-impact actions idempotent so repeated requests do not create duplicates.', kind: 'choice', defaultValue: 'High-impact actions', options: [{ value: 'Off' }, { value: 'High-impact actions' }, { value: 'All retryable mutations' }], appDefaults: { 'Booking / Scheduling': 'All retryable mutations', 'E-commerce': 'All retryable mutations', 'Inventory / POS': 'High-impact actions' }, profileDefaults: { Minimal: 'Off', Advanced: 'All retryable mutations' } },
  { id: 'data.retention', section: 'data', group: 'Retention', label: 'Data retention policy', description: 'Define whether records are kept indefinitely, archived, or removed according to a retention rule.', kind: 'choice', defaultValue: 'Document by data class', options: [{ value: 'Indefinite by default' }, { value: 'Document by data class' }, { value: 'Explicit retention + purge schedule' }], appDefaults: { 'Government System': 'Explicit retention + purge schedule', 'Clinic / EMR': 'Explicit retention + purge schedule' }, profileDefaults: { Minimal: 'Indefinite by default', Advanced: 'Explicit retention + purge schedule' }, advanced: true },
  { id: 'data.seed', section: 'data', group: 'Development data', label: 'Seed / demo data', description: 'Provide safe deterministic seed data for development and testing without mixing it with production.', kind: 'choice', defaultValue: 'Development seed only', options: [{ value: 'Off' }, { value: 'Development seed only' }, { value: 'Development + demo workspace' }], appDefaults: { 'Portfolio / Marketing': 'Off' } },

  // Forms & input
  { id: 'forms.enabled', section: 'forms', group: 'Structure', label: 'Forms / data entry', description: 'Whether users create or edit meaningful structured data through forms.', kind: 'boolean', defaultValue: true, appDefaults: { 'Portfolio / Marketing': false } },
  { id: 'forms.layout', section: 'forms', group: 'Structure', label: 'Default form layout', description: 'Default visual structure for ordinary forms.', kind: 'choice', defaultValue: 'Single column + sections', options: [{ value: 'Single column' }, { value: 'Single column + sections' }, { value: 'Responsive two-column' }, { value: 'Dense operational' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Internal / Operations': 'Dense operational', 'Government System': 'Single column + sections', 'Clinic / EMR': 'Single column + sections' } },
  { id: 'forms.longFlow', section: 'forms', group: 'Structure', label: 'Long-form behavior', description: 'How lengthy forms should be broken down when one screen becomes cognitively heavy.', kind: 'choice', defaultValue: 'Sections on one page', options: [{ value: 'One continuous form' }, { value: 'Sections on one page' }, { value: 'Multi-step wizard' }, { value: 'Task-based subforms' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'Sections on one page', 'Clinic / EMR': 'Task-based subforms', 'SaaS / Client Portal': 'Multi-step wizard' } },
  { id: 'forms.reviewStep', section: 'forms', group: 'Submission', label: 'Review before submit', description: 'Show a human-readable confirmation summary before irreversible or high-impact submissions.', kind: 'choice', defaultValue: 'High-impact forms only', options: [{ value: 'Off' }, { value: 'High-impact forms only' }, { value: 'Most multi-step forms' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'Most multi-step forms', 'Clinic / EMR': 'High-impact forms only' } },
  { id: 'forms.drafts', section: 'forms', group: 'Persistence', label: 'Save draft', description: 'Let users preserve incomplete work without pretending it is a final submission.', kind: 'choice', defaultValue: 'For long / important forms', options: [{ value: 'Off' }, { value: 'For long / important forms' }, { value: 'Available on most forms' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'Available on most forms', 'Clinic / EMR': 'Available on most forms' }, profileDefaults: { Minimal: 'Off' } },
  { id: 'forms.autosave', section: 'forms', group: 'Persistence', label: 'Autosave', description: 'Persist editing progress automatically where data-loss risk is greater than surprise-update risk.', kind: 'choice', defaultValue: 'Draft forms only', options: [{ value: 'Off' }, { value: 'Draft forms only' }, { value: 'Most editable forms' }, { value: 'Explicit per workflow' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Clinic / EMR': 'Explicit per workflow', 'Government System': 'Draft forms only' } },
  { id: 'forms.unsaved', section: 'forms', group: 'Persistence', label: 'Unsaved-changes protection', description: 'Warn before navigation would discard meaningful edits.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.resume', section: 'forms', group: 'Persistence', label: 'Resume later', description: 'Allow users to leave and return to incomplete multi-step work.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'forms.drafts', equals: ['For long / important forms', 'Available on most forms'] }, appDefaults: { 'Portfolio / Marketing': false } },
  { id: 'forms.validationTiming', section: 'forms', group: 'Validation', label: 'Validation timing', description: 'When users should receive validation feedback.', kind: 'choice', defaultValue: 'On blur + submit', options: [{ value: 'Submit only' }, { value: 'On blur + submit' }, { value: 'Live for safe/simple fields' }], dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.serverValidation', section: 'forms', group: 'Validation', label: 'Server-side validation', description: 'Revalidate all security/business-critical rules at the trusted server boundary.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.errorSummary', section: 'forms', group: 'Validation', label: 'Error summary for long forms', description: 'Summarize validation failures and link users directly to fields needing attention.', kind: 'choice', defaultValue: 'Long / multi-section forms', options: [{ value: 'Off' }, { value: 'Long / multi-section forms' }, { value: 'All forms with multiple errors' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'All forms with multiple errors' } },
  { id: 'forms.preserveErrors', section: 'forms', group: 'Validation', label: 'Preserve entered values on error', description: 'Never wipe valid user input because another field or server action failed.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.requiredMarkers', section: 'forms', group: 'Fields', label: 'Required / optional labeling', description: 'Use a consistent convention so users know what must be completed before submission.', kind: 'choice', defaultValue: 'Mark optional when most fields are required', options: [{ value: 'Mark required' }, { value: 'Mark optional when most fields are required' }, { value: 'Explicit on every field' }], dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.helperText', section: 'forms', group: 'Fields', label: 'Field helper text', description: 'Show concise examples or constraints only when they reduce uncertainty.', kind: 'choice', defaultValue: 'Only when useful', options: [{ value: 'Minimal' }, { value: 'Only when useful' }, { value: 'Detailed guidance' }], dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.conditional', section: 'forms', group: 'Dynamic fields', label: 'Conditional fields', description: 'Allow later fields or sections to appear based on prior answers.', kind: 'choice', defaultValue: 'Supported', options: [{ value: 'Off' }, { value: 'Supported' }, { value: 'Advanced branching' }], dependsOn: { id: 'forms.enabled', equals: true }, profileDefaults: { Minimal: 'Off', Advanced: 'Advanced branching' } },
  { id: 'forms.repeatable', section: 'forms', group: 'Dynamic fields', label: 'Repeatable field groups', description: 'Support adding multiple items such as contacts, line items, medicines, attendees, or attachments.', kind: 'choice', defaultValue: 'When domain requires', options: [{ value: 'Off' }, { value: 'When domain requires' }, { value: 'Supported broadly' }], dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.dynamicSchema', section: 'forms', group: 'Dynamic fields', label: 'Admin-defined custom fields', description: 'Let administrators change form schemas without a code deployment.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Limited custom fields' }, { value: 'Full form builder' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Limited custom fields' }, profileDefaults: { Advanced: 'Limited custom fields' }, advanced: true },
  { id: 'forms.address', section: 'forms', group: 'Field types', label: 'Structured address input', description: 'Use structured address fields only when search, shipping, reporting, or jurisdiction rules need them.', kind: 'choice', defaultValue: 'As needed', options: [{ value: 'Off' }, { value: 'As needed' }, { value: 'Structured + autocomplete' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'E-commerce': 'Structured + autocomplete', 'Directory / Marketplace': 'Structured + autocomplete' } },
  { id: 'forms.dateTime', section: 'forms', group: 'Field types', label: 'Date/time input behavior', description: 'Use locale-aware controls and make timezone interpretation explicit where relevant.', kind: 'choice', defaultValue: 'Locale-aware', options: [{ value: 'Basic browser controls' }, { value: 'Locale-aware' }, { value: 'Timezone-explicit' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Booking / Scheduling': 'Timezone-explicit', 'Tournament / Event': 'Timezone-explicit' } },
  { id: 'forms.currency', section: 'forms', group: 'Field types', label: 'Currency / numeric formatting', description: 'Display units, currency, percentage, precision, and separators consistently.', kind: 'choice', defaultValue: 'Typed + formatted', options: [{ value: 'Plain numeric' }, { value: 'Typed + formatted' }, { value: 'Locale + domain rules' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'E-commerce': 'Locale + domain rules', 'Inventory / POS': 'Locale + domain rules' } },
  { id: 'forms.richText', section: 'forms', group: 'Field types', label: 'Rich-text editing', description: 'Use rich text only where formatting is truly part of the content model.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Basic formatting' }, { value: 'Rich editor' }, { value: 'Markdown' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Portfolio / Marketing': 'Rich editor' } },
  { id: 'forms.signature', section: 'forms', group: 'Field types', label: 'Signature capture', description: 'Capture acknowledgment/signature only when workflow or policy actually requires it.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Typed acknowledgment' }, { value: 'Drawn signature' }, { value: 'External e-signature' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'Typed acknowledgment' }, advanced: true },
  { id: 'forms.doubleSubmit', section: 'forms', group: 'Submission', label: 'Duplicate-submit protection', description: 'Disable/reconcile repeat submissions while a request is already processing.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'forms.enabled', equals: true } },
  { id: 'forms.success', section: 'forms', group: 'Submission', label: 'Successful-submit feedback', description: 'Make success explicit and show what happened or what users should do next.', kind: 'choice', defaultValue: 'Inline confirmation + next action', options: [{ value: 'Toast only' }, { value: 'Inline confirmation + next action' }, { value: 'Dedicated confirmation page' }], dependsOn: { id: 'forms.enabled', equals: true }, appDefaults: { 'Government System': 'Dedicated confirmation page', 'Booking / Scheduling': 'Dedicated confirmation page', 'E-commerce': 'Dedicated confirmation page' } },

  // Tables, search & views
  { id: 'views.primary', section: 'views', group: 'List presentation', label: 'Primary record view', description: 'Default way users browse collections of records.', kind: 'choice', defaultValue: 'Table', options: [{ value: 'Table' }, { value: 'List' }, { value: 'Cards' }, { value: 'Kanban' }, { value: 'Calendar' }], appDefaults: { 'Portfolio / Marketing': 'Cards', 'Directory / Marketplace': 'Cards', 'Booking / Scheduling': 'Calendar', 'Tournament / Event': 'List' } },
  { id: 'views.alternates', section: 'views', group: 'List presentation', label: 'Alternate views', description: 'Allow switching presentation only when the same records genuinely benefit from another perspective.', kind: 'choice', defaultValue: 'One alternate when useful', options: [{ value: 'Off' }, { value: 'One alternate when useful' }, { value: 'Multiple selectable views' }] },
  { id: 'views.density', section: 'views', group: 'List presentation', label: 'Operational table density', description: 'Balance scanability and information density for frequent record work.', kind: 'choice', defaultValue: 'Comfortable', options: [{ value: 'Spacious' }, { value: 'Comfortable' }, { value: 'Compact' }, { value: 'User selectable' }], appDefaults: { 'Internal / Operations': 'Compact', 'Government System': 'Comfortable', 'Inventory / POS': 'Compact' } },
  { id: 'views.columns', section: 'views', group: 'Tables', label: 'Column customization', description: 'Whether users can hide, reorder, or resize table columns.', kind: 'choice', defaultValue: 'Hide/show columns', options: [{ value: 'Fixed columns' }, { value: 'Hide/show columns' }, { value: 'Hide + reorder' }, { value: 'Hide + reorder + resize' }], profileDefaults: { Minimal: 'Fixed columns', Advanced: 'Hide + reorder + resize' } },
  { id: 'views.stickyHeader', section: 'views', group: 'Tables', label: 'Sticky table header', description: 'Keep column labels visible while scanning long tables.', kind: 'boolean', defaultValue: true },
  { id: 'views.rowSelect', section: 'views', group: 'Tables', label: 'Row selection', description: 'Allow one or many records to be selected for context-aware bulk operations.', kind: 'choice', defaultValue: 'When bulk actions exist', options: [{ value: 'Off' }, { value: 'When bulk actions exist' }, { value: 'Always available' }] },
  { id: 'views.inlineEdit', section: 'views', group: 'Tables', label: 'Inline editing', description: 'Edit simple fields in place only when it is faster and less error-prone than opening a full form.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple fields only' }, { value: 'Broad inline editing' }], appDefaults: { 'Inventory / POS': 'Simple fields only', 'Internal / Operations': 'Simple fields only' }, advanced: true },
  { id: 'views.rowExpand', section: 'views', group: 'Tables', label: 'Expandable rows', description: 'Reveal secondary detail without navigating away when context is lightweight.', kind: 'choice', defaultValue: 'When useful', options: [{ value: 'Off' }, { value: 'When useful' }, { value: 'Primary detail pattern' }] },
  { id: 'views.paginationMode', section: 'views', group: 'Scale', label: 'Result loading', description: 'Choose a predictable collection-loading strategy based on scale and workflow.', kind: 'choice', defaultValue: 'Pagination', options: [{ value: 'Pagination' }, { value: 'Load more' }, { value: 'Infinite scroll' }, { value: 'Virtualized scrolling' }], appDefaults: { 'Directory / Marketplace': 'Load more', 'Portfolio / Marketing': 'Load more' } },
  { id: 'views.pageSize', section: 'views', group: 'Scale', label: 'Rows per page', description: 'Allow users to adjust page size when they routinely scan or process many records.', kind: 'choice', defaultValue: 'Selectable', options: [{ value: 'Fixed' }, { value: 'Selectable' }, { value: 'Adaptive' }], dependsOn: { id: 'views.paginationMode', equals: 'Pagination' } },
  { id: 'views.sorting', section: 'views', group: 'Find records', label: 'Sorting', description: 'Default support for ordering collection results.', kind: 'choice', defaultValue: 'Single + common presets', options: [{ value: 'Fixed default only' }, { value: 'Single + common presets' }, { value: 'Multi-column sorting' }] },
  { id: 'views.filters', section: 'views', group: 'Find records', label: 'Filtering', description: 'How much filtering power users should receive without overwhelming the default view.', kind: 'choice', defaultValue: 'Quick filters + advanced drawer', options: [{ value: 'Basic filters' }, { value: 'Quick filters + advanced drawer' }, { value: 'Full query builder' }], appDefaults: { 'Portfolio / Marketing': 'Basic filters', 'Government System': 'Quick filters + advanced drawer', 'Inventory / POS': 'Quick filters + advanced drawer' }, profileDefaults: { Minimal: 'Basic filters', Advanced: 'Full query builder' } },
  { id: 'views.filterChips', section: 'views', group: 'Find records', label: 'Active filter chips', description: 'Keep current filters visible and individually removable.', kind: 'boolean', defaultValue: true },
  { id: 'views.savedViews', section: 'views', group: 'Saved views', label: 'Saved filters / views', description: 'Save frequently reused combinations of filters, sort order, columns, and grouping.', kind: 'choice', defaultValue: 'Personal views', options: [{ value: 'Off' }, { value: 'Personal views' }, { value: 'Personal + shared views' }, { value: 'Admin-defined default views' }], appDefaults: { 'Government System': 'Personal + shared views', 'Internal / Operations': 'Personal + shared views' }, profileDefaults: { Minimal: 'Off', Advanced: 'Personal + shared views' } },
  { id: 'views.urlState', section: 'views', group: 'Saved views', label: 'Filters reflected in URL', description: 'Keep shareable/reload-safe list state in the URL when it improves navigation and support.', kind: 'boolean', defaultValue: true },
  { id: 'search.level', section: 'views', group: 'Search', label: 'Search capability', description: 'Search depth for operational collections and public directories.', kind: 'choice', defaultValue: 'Entity search', options: [{ value: 'Off' }, { value: 'Exact / prefix' }, { value: 'Entity search' }, { value: 'Full-text + fuzzy' }], appDefaults: { 'Portfolio / Marketing': 'Exact / prefix', 'Directory / Marketplace': 'Full-text + fuzzy', 'Government System': 'Entity search' } },
  { id: 'search.autocomplete', section: 'views', group: 'Search', label: 'Search suggestions', description: 'Offer useful matching records or query suggestions while typing when datasets justify it.', kind: 'choice', defaultValue: 'Record suggestions', options: [{ value: 'Off' }, { value: 'Record suggestions' }, { value: 'Records + recent searches' }, { value: 'Records + query suggestions' }], dependsOn: { id: 'search.level', equals: ['Exact / prefix', 'Entity search', 'Full-text + fuzzy'] }, appDefaults: { 'Portfolio / Marketing': 'Off' } },
  { id: 'search.noResults', section: 'views', group: 'Search', label: 'No-results recovery', description: 'Suggest clearing filters, correcting terms, or broader actions instead of showing a dead end.', kind: 'choice', defaultValue: 'Recovery suggestions', options: [{ value: 'Simple empty state' }, { value: 'Recovery suggestions' }, { value: 'Recovery + related results' }], dependsOn: { id: 'search.level', equals: ['Exact / prefix', 'Entity search', 'Full-text + fuzzy'] } },
  { id: 'views.grouping', section: 'views', group: 'Organize results', label: 'Grouping', description: 'Group records by status, owner, date, category, or another useful dimension.', kind: 'choice', defaultValue: 'Optional when useful', options: [{ value: 'Off' }, { value: 'Optional when useful' }, { value: 'User-selectable grouping' }] },
  { id: 'views.exportCurrent', section: 'views', group: 'Actions', label: 'Export current view', description: 'Export only the records/columns matching the current authorized view where appropriate.', kind: 'choice', defaultValue: 'CSV / spreadsheet', options: [{ value: 'Off' }, { value: 'CSV / spreadsheet' }, { value: 'CSV + spreadsheet + PDF' }], appDefaults: { 'Portfolio / Marketing': 'Off' }, profileDefaults: { Minimal: 'Off' } },
  { id: 'views.print', section: 'views', group: 'Actions', label: 'Print-friendly record views', description: 'Provide intentionally formatted print output when paper workflows still matter.', kind: 'choice', defaultValue: 'Selected reports / records', options: [{ value: 'Off' }, { value: 'Selected reports / records' }, { value: 'Broad print support' }], appDefaults: { 'Government System': 'Broad print support', 'Clinic / EMR': 'Broad print support' } },

  // Workflow & approvals
  { id: 'workflow.enabled', section: 'workflow', group: 'Status model', label: 'Workflow engine', description: 'Whether records move through explicit statuses and controlled transitions.', kind: 'boolean', defaultValue: true, appDefaults: { 'Portfolio / Marketing': false, 'Directory / Marketplace': false, 'E-commerce': false, 'Booking / Scheduling': false, 'SaaS / Client Portal': false, 'Inventory / POS': false, 'Tournament / Event': false } },
  { id: 'workflow.model', section: 'workflow', group: 'Status model', label: 'Workflow complexity', description: 'How much state-machine behavior the product should explicitly define.', kind: 'choice', defaultValue: 'Explicit statuses + transitions', options: [{ value: 'Simple status field' }, { value: 'Explicit statuses + transitions' }, { value: 'Rules-based state machine' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'Rules-based state machine', 'Clinic / EMR': 'Explicit statuses + transitions', 'Internal / Operations': 'Explicit statuses + transitions' }, profileDefaults: { Minimal: 'Simple status field', Advanced: 'Rules-based state machine' } },
  { id: 'workflow.history', section: 'workflow', group: 'Status model', label: 'Status history', description: 'Record who changed status, when it changed, and optionally why.', kind: 'choice', defaultValue: 'Actor + timestamp', options: [{ value: 'Current state only' }, { value: 'Actor + timestamp' }, { value: 'Actor + timestamp + reason' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'Actor + timestamp + reason', 'Clinic / EMR': 'Actor + timestamp + reason' } },
  { id: 'workflow.restrictedTransitions', section: 'workflow', group: 'Status model', label: 'Restricted transitions', description: 'Prevent invalid jumps between states and document who can perform each transition.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'workflow.enabled', equals: true } },
  { id: 'workflow.reason', section: 'workflow', group: 'Status model', label: 'Reason on exceptional transitions', description: 'Require a reason for rejection, cancellation, reopening, reversal, or similarly consequential changes.', kind: 'choice', defaultValue: 'High-impact transitions', options: [{ value: 'Off' }, { value: 'High-impact transitions' }, { value: 'Most non-routine transitions' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'Most non-routine transitions' } },
  { id: 'workflow.assignment', section: 'workflow', group: 'Ownership & queues', label: 'Record assignment', description: 'Assign actionable records to a person, team, role, or queue.', kind: 'choice', defaultValue: 'Person or team', options: [{ value: 'Off' }, { value: 'Person only' }, { value: 'Person or team' }, { value: 'Queue + person/team' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'Queue + person/team', 'Clinic / EMR': 'Person or team', 'Internal / Operations': 'Queue + person/team' } },
  { id: 'workflow.reassign', section: 'workflow', group: 'Ownership & queues', label: 'Reassignment', description: 'Allow controlled handoff with ownership history instead of silently changing assignee.', kind: 'choice', defaultValue: 'Allowed + history', options: [{ value: 'Off' }, { value: 'Allowed' }, { value: 'Allowed + history' }, { value: 'Reason required' }], dependsOn: { id: 'workflow.assignment', equals: ['Person only', 'Person or team', 'Queue + person/team'] }, appDefaults: { 'Government System': 'Reason required' } },
  { id: 'workflow.autoAssign', section: 'workflow', group: 'Ownership & queues', label: 'Automatic assignment', description: 'Route new work by rules, workload, branch, category, geography, or round-robin when beneficial.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple routing rules' }, { value: 'Round robin / workload-aware' }, { value: 'Advanced routing' }], dependsOn: { id: 'workflow.assignment', equals: ['Person only', 'Person or team', 'Queue + person/team'] }, appDefaults: { 'Internal / Operations': 'Simple routing rules' }, profileDefaults: { Advanced: 'Simple routing rules' }, advanced: true },
  { id: 'approval.enabled', section: 'workflow', group: 'Approvals', label: 'Approvals', description: 'Whether selected records/actions require explicit approval before proceeding.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Portfolio / Marketing': false, 'Directory / Marketplace': false, 'E-commerce': false, 'Booking / Scheduling': false, 'SaaS / Client Portal': false, 'Clinic / EMR': false, 'Inventory / POS': false, 'Tournament / Event': false } },
  { id: 'approval.structure', section: 'workflow', group: 'Approvals', label: 'Approval structure', description: 'Default approval topology.', kind: 'choice', defaultValue: 'Single approver', options: [{ value: 'Single approver' }, { value: 'Sequential levels' }, { value: 'Parallel approvers' }, { value: 'Any-one approver' }, { value: 'Majority / quorum' }], dependsOn: { id: 'approval.enabled', equals: true }, appDefaults: { 'Government System': 'Sequential levels', 'Clinic / EMR': 'Single approver' }, profileDefaults: { Advanced: 'Sequential levels' } },
  { id: 'approval.delegation', section: 'workflow', group: 'Approvals', label: 'Approval delegation', description: 'Allow time-bound delegation when an approver is unavailable.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Time-bound delegation' }, { value: 'Delegation + audit + limits' }], dependsOn: { id: 'approval.enabled', equals: true }, appDefaults: { 'Government System': 'Delegation + audit + limits' }, advanced: true },
  { id: 'approval.return', section: 'workflow', group: 'Approvals', label: 'Return for correction', description: 'Let reviewers send work back with actionable feedback instead of forcing reject-and-recreate.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'approval.enabled', equals: true } },
  { id: 'approval.comments', section: 'workflow', group: 'Approvals', label: 'Approval comments / reason', description: 'Capture reviewer context, especially for rejection or return.', kind: 'choice', defaultValue: 'Required on reject / return', options: [{ value: 'Optional' }, { value: 'Required on reject / return' }, { value: 'Required on every decision' }], dependsOn: { id: 'approval.enabled', equals: true }, appDefaults: { 'Government System': 'Required on every decision' } },
  { id: 'approval.attachments', section: 'workflow', group: 'Approvals', label: 'Approval attachments', description: 'Allow supporting evidence to accompany a decision when the domain needs it.', kind: 'choice', defaultValue: 'Optional', options: [{ value: 'Off' }, { value: 'Optional' }, { value: 'Supported + categorized' }], dependsOn: { id: 'approval.enabled', equals: true }, appDefaults: { 'Government System': 'Supported + categorized' } },
  { id: 'workflow.dueDates', section: 'workflow', group: 'Time & SLA', label: 'Due dates', description: 'Attach deadlines to actionable records or tasks.', kind: 'choice', defaultValue: 'Optional per item', options: [{ value: 'Off' }, { value: 'Optional per item' }, { value: 'Required for tracked work' }, { value: 'Derived from SLA' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'Derived from SLA', 'Internal / Operations': 'Optional per item' } },
  { id: 'workflow.sla', section: 'workflow', group: 'Time & SLA', label: 'SLA / turnaround tracking', description: 'Measure expected completion windows and identify aging work.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple aging' }, { value: 'SLA targets' }, { value: 'Business-hours SLA engine' }], dependsOn: { id: 'workflow.enabled', equals: true }, appDefaults: { 'Government System': 'SLA targets', 'Internal / Operations': 'Simple aging' }, profileDefaults: { Advanced: 'SLA targets' } },
  { id: 'workflow.escalation', section: 'workflow', group: 'Time & SLA', label: 'Escalation', description: 'Escalate overdue or blocked work using predictable rules.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Notify owner' }, { value: 'Notify + escalate manager' }, { value: 'Rule-based escalation chain' }], dependsOn: { id: 'workflow.sla', equals: ['Simple aging', 'SLA targets', 'Business-hours SLA engine'] }, appDefaults: { 'Government System': 'Notify + escalate manager' }, advanced: true },
  { id: 'tasks.enabled', section: 'workflow', group: 'Tasks', label: 'Tasks / action items', description: 'Create discrete work items attached to records or workflows.', kind: 'boolean', defaultValue: false, appDefaults: { 'Internal / Operations': true, 'Government System': true, 'SaaS / Client Portal': true } },
  { id: 'tasks.subtasks', section: 'workflow', group: 'Tasks', label: 'Subtasks / checklist', description: 'Break larger work into smaller completion items without creating a full project-management product.', kind: 'choice', defaultValue: 'Checklist', options: [{ value: 'Off' }, { value: 'Checklist' }, { value: 'Nested subtasks' }], dependsOn: { id: 'tasks.enabled', equals: true } },
  { id: 'tasks.priority', section: 'workflow', group: 'Tasks', label: 'Task priority', description: 'Use a small consistent priority scale only when it changes work ordering.', kind: 'choice', defaultValue: 'Low / Normal / High', options: [{ value: 'Off' }, { value: 'Low / Normal / High' }, { value: 'Four-level priority' }], dependsOn: { id: 'tasks.enabled', equals: true } },
  { id: 'tasks.dependencies', section: 'workflow', group: 'Tasks', label: 'Task dependencies', description: 'Represent blocked-by relationships when task order genuinely matters.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple blocked-by' }, { value: 'Dependency graph' }], dependsOn: { id: 'tasks.enabled', equals: true }, profileDefaults: { Advanced: 'Simple blocked-by' }, advanced: true },
  { id: 'tasks.recurring', section: 'workflow', group: 'Tasks', label: 'Recurring tasks', description: 'Generate repeated operational tasks from a schedule.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple recurrence' }, { value: 'Advanced recurrence rules' }], dependsOn: { id: 'tasks.enabled', equals: true }, advanced: true },

  // Files & collaboration
  { id: 'attachments.enabled', section: 'collaboration', group: 'Attachments', label: 'File attachments', description: 'Allow users to attach supporting files to appropriate records.', kind: 'boolean', defaultValue: true, appDefaults: { 'Portfolio / Marketing': false, 'Booking / Scheduling': false, 'E-commerce': false, 'Directory / Marketplace': false, 'SaaS / Client Portal': false, 'Inventory / POS': false, 'Tournament / Event': false } },
  { id: 'files.multiple', section: 'collaboration', group: 'Attachments', label: 'Multiple attachments', description: 'Allow multiple files per field/record where evidence or documentation can be plural.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'attachments.enabled', equals: true } },
  { id: 'files.preview', section: 'collaboration', group: 'Attachments', label: 'Inline file preview', description: 'Preview safe common file types without requiring a download.', kind: 'choice', defaultValue: 'Images + PDFs', options: [{ value: 'Off' }, { value: 'Images only' }, { value: 'Images + PDFs' }, { value: 'Common documents where safe' }], dependsOn: { id: 'attachments.enabled', equals: true } },
  { id: 'files.versioning', section: 'collaboration', group: 'Attachments', label: 'Attachment versioning', description: 'Replace a document while preserving prior versions when document history matters.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Manual versions' }, { value: 'Automatic version history' }], dependsOn: { id: 'attachments.enabled', equals: true }, appDefaults: { 'Government System': 'Automatic version history' }, advanced: true },
  { id: 'files.metadata', section: 'collaboration', group: 'Attachments', label: 'File metadata', description: 'Capture title, category, description, date, or source when filenames alone are insufficient.', kind: 'choice', defaultValue: 'Basic title/category when useful', options: [{ value: 'Filename only' }, { value: 'Basic title/category when useful' }, { value: 'Structured metadata' }], dependsOn: { id: 'attachments.enabled', equals: true }, appDefaults: { 'Government System': 'Structured metadata' } },
  { id: 'files.permissions', section: 'collaboration', group: 'Attachments', label: 'Attachment permissions', description: 'Inherit record authorization by default and support narrower access only when necessary.', kind: 'choice', defaultValue: 'Inherit record permissions', options: [{ value: 'Public within record' }, { value: 'Inherit record permissions' }, { value: 'Per-file restrictions' }], dependsOn: { id: 'attachments.enabled', equals: true }, appDefaults: { 'Clinic / EMR': 'Per-file restrictions', 'Government System': 'Inherit record permissions' } },
  { id: 'files.delete', section: 'collaboration', group: 'Attachments', label: 'Attachment deletion', description: 'Choose whether removed files remain recoverable/auditable.', kind: 'choice', defaultValue: 'Soft delete', options: [{ value: 'Hard delete' }, { value: 'Soft delete' }, { value: 'Retain immutable history' }], dependsOn: { id: 'attachments.enabled', equals: true }, appDefaults: { 'Government System': 'Retain immutable history', 'Clinic / EMR': 'Soft delete' } },
  { id: 'comments.enabled', section: 'collaboration', group: 'Comments', label: 'Record comments', description: 'Allow contextual discussion without moving operational decisions into external chat.', kind: 'boolean', defaultValue: true, appDefaults: { 'Portfolio / Marketing': false, 'E-commerce': false, 'Booking / Scheduling': false, 'Directory / Marketplace': false, 'SaaS / Client Portal': false, 'Clinic / EMR': false, 'Inventory / POS': false, 'Tournament / Event': false } },
  { id: 'comments.threads', section: 'collaboration', group: 'Comments', label: 'Threaded replies', description: 'Support nested replies only when discussions are likely to become multi-party or long-lived.', kind: 'choice', defaultValue: 'Flat comments', options: [{ value: 'Flat comments' }, { value: 'One-level replies' }, { value: 'Threaded discussions' }], dependsOn: { id: 'comments.enabled', equals: true } },
  { id: 'comments.mentions', section: 'collaboration', group: 'Comments', label: '@mentions', description: 'Mention teammates and generate targeted notifications.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'comments.enabled', equals: true } },
  { id: 'comments.attachments', section: 'collaboration', group: 'Comments', label: 'Comment attachments', description: 'Allow supporting files directly in discussion when useful.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'comments.enabled', equals: true }, advanced: true },
  { id: 'comments.internal', section: 'collaboration', group: 'Comments', label: 'Internal vs external comments', description: 'Separate staff-only notes from customer/public discussion where both audiences share a record.', kind: 'choice', defaultValue: 'Single internal stream', options: [{ value: 'Single internal stream' }, { value: 'Public + internal notes' }, { value: 'Audience-scoped comments' }], dependsOn: { id: 'comments.enabled', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Public + internal notes', 'Booking / Scheduling': 'Public + internal notes' } },
  { id: 'activity.feed', section: 'collaboration', group: 'Activity', label: 'Record activity timeline', description: 'Show important state changes, assignments, comments, files, and key edits in chronological context.', kind: 'choice', defaultValue: 'Important events', options: [{ value: 'Off' }, { value: 'Important events' }, { value: 'Detailed activity timeline' }], appDefaults: { 'Government System': 'Detailed activity timeline', 'Clinic / EMR': 'Detailed activity timeline', 'Internal / Operations': 'Important events' } },
  { id: 'collab.presence', section: 'collaboration', group: 'Concurrent work', label: 'Editing presence', description: 'Indicate when another user is currently viewing or editing the same record.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Viewing presence' }, { value: 'Editing presence' }], appDefaults: { 'Internal / Operations': 'Editing presence' }, advanced: true },
  { id: 'collab.locking', section: 'collaboration', group: 'Concurrent work', label: 'Record editing lock', description: 'Coordinate concurrent edits when merge behavior would be unsafe or confusing.', kind: 'choice', defaultValue: 'Optimistic conflict warning', options: [{ value: 'Off' }, { value: 'Optimistic conflict warning' }, { value: 'Temporary edit lock' }], appDefaults: { 'Clinic / EMR': 'Optimistic conflict warning', 'Government System': 'Optimistic conflict warning' }, advanced: true },
  { id: 'imports.enabled', section: 'collaboration', group: 'Import & export', label: 'Bulk import', description: 'Support controlled ingestion of many records from structured files.', kind: 'choice', defaultValue: 'CSV / spreadsheet with preview', options: [{ value: 'Off' }, { value: 'CSV only' }, { value: 'CSV / spreadsheet with preview' }, { value: 'Advanced mapped import' }], appDefaults: { 'Portfolio / Marketing': 'Off', 'Booking / Scheduling': 'Off', 'E-commerce': 'Off', 'SaaS / Client Portal': 'Off', 'Clinic / EMR': 'Off', 'Tournament / Event': 'CSV / spreadsheet with preview', 'Government System': 'CSV / spreadsheet with preview', 'Inventory / POS': 'Advanced mapped import' }, profileDefaults: { Minimal: 'Off' } },
  { id: 'imports.mapping', section: 'collaboration', group: 'Import & export', label: 'Import field mapping', description: 'Map uploaded columns to system fields instead of requiring one exact template.', kind: 'choice', defaultValue: 'Known templates only', options: [{ value: 'Known templates only' }, { value: 'User field mapping' }, { value: 'Reusable import mappings' }], dependsOn: { id: 'imports.enabled', equals: ['CSV / spreadsheet with preview', 'Advanced mapped import'] }, appDefaults: { 'Inventory / POS': 'Reusable import mappings' } },
  { id: 'imports.preview', section: 'collaboration', group: 'Import & export', label: 'Import validation preview', description: 'Show valid, invalid, duplicate, and skipped rows before committing the import.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'imports.enabled', equals: ['CSV / spreadsheet with preview', 'Advanced mapped import'] } },
  { id: 'imports.duplicates', section: 'collaboration', group: 'Import & export', label: 'Import duplicate handling', description: 'Make duplicate behavior explicit rather than silently overwriting records.', kind: 'choice', defaultValue: 'Flag for review', options: [{ value: 'Skip duplicates' }, { value: 'Flag for review' }, { value: 'Update matched records' }, { value: 'Per-import choice' }], dependsOn: { id: 'imports.enabled', equals: ['CSV only', 'CSV / spreadsheet with preview', 'Advanced mapped import'] } },
  { id: 'imports.atomic', section: 'collaboration', group: 'Import & export', label: 'Import failure strategy', description: 'Decide whether valid rows may commit when some rows fail validation.', kind: 'choice', defaultValue: 'Partial import + downloadable error report', options: [{ value: 'All-or-nothing' }, { value: 'Partial import + downloadable error report' }, { value: 'Admin chooses per import' }], dependsOn: { id: 'imports.enabled', equals: ['CSV only', 'CSV / spreadsheet with preview', 'Advanced mapped import'] }, appDefaults: { 'Government System': 'All-or-nothing' } },
]


const phase5Settings: ConfigSetting[] = [
  // Business pack hub. These parent toggles are intentionally always visible.
  { id: 'pack.booking', section: 'business', group: 'Domain packs', label: 'Booking & scheduling', description: 'Enable scheduling-specific decisions for appointments, courts, rooms, staff, services, or other reservable resources.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': true }, keywords: ['appointment', 'reservation', 'calendar', 'court', 'room'] },
  { id: 'pack.payments', section: 'business', group: 'Domain packs', label: 'Payments & money', description: 'Enable payment collection, fee, refund, settlement, and transaction-confirmation decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': true, 'SaaS / Client Portal': true, 'E-commerce': true, 'Inventory / POS': true }, keywords: ['paymongo', 'stripe', 'checkout', 'gcash', 'maya', 'card', 'cash'] },
  { id: 'pack.subscriptions', section: 'business', group: 'Domain packs', label: 'Subscriptions & SaaS billing', description: 'Enable recurring plans, trials, seats, usage, plan changes, and dunning decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'SaaS / Client Portal': true }, keywords: ['billing', 'recurring', 'trial', 'plan', 'seat', 'usage'] },
  { id: 'pack.commerce', section: 'business', group: 'Domain packs', label: 'E-commerce', description: 'Enable product catalog, cart, checkout, fulfillment, order, return, and promotion decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'E-commerce': true }, keywords: ['store', 'shop', 'cart', 'checkout', 'order', 'product'] },
  { id: 'pack.inventory', section: 'business', group: 'Domain packs', label: 'Inventory & POS', description: 'Enable stock, warehouse/branch, item movement, purchasing, count, and point-of-sale operational decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'E-commerce': true, 'Inventory / POS': true }, keywords: ['stock', 'warehouse', 'sku', 'barcode', 'pos'] },
  { id: 'pack.reporting', section: 'business', group: 'Cross-domain packs', label: 'Reports & analytics', description: 'Enable operational reports, dashboards, exports, scheduled delivery, drill-down, and metric-governance decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': true, 'Internal / Operations': true, 'SaaS / Client Portal': true, 'E-commerce': true, 'Directory / Marketplace': true, 'Government System': true, 'Clinic / EMR': true, 'Inventory / POS': true, 'Tournament / Event': true }, keywords: ['reports', 'analytics', 'metrics', 'dashboard', 'export'] },
  { id: 'pack.directory', section: 'business', group: 'Domain packs', label: 'Directory & marketplace', description: 'Enable listing, discovery, owner claim, verification, moderation, map, review, and featured-placement decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Directory / Marketplace': true }, keywords: ['listing', 'marketplace', 'directory', 'claim', 'featured'] },
  { id: 'pack.tournament', section: 'business', group: 'Domain packs', label: 'Tournament & event', description: 'Enable participant, division, schedule, scoring, standings, bracket, lineup, live-result, and awards decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Tournament / Event': true }, keywords: ['match', 'bracket', 'standings', 'team', 'score', 'event'] },
  { id: 'pack.government', section: 'business', group: 'Domain packs', label: 'Government & document workflow', description: 'Enable government/document intake, routing, signatory, turnaround, printed-slip, tracking, and retention decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Government System': true }, keywords: ['document', 'routing', 'office', 'division', 'signatory', 'tracking'] },
  { id: 'pack.clinic', section: 'business', group: 'Domain packs', label: 'Clinic & EMR', description: 'Enable patient, encounter, appointment, vitals, clinical note, orders, medicine, referral, and record-access decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Clinic / EMR': true }, keywords: ['patient', 'medical', 'emr', 'clinical', 'clinic'] },
  { id: 'pack.portfolio', section: 'business', group: 'Domain packs', label: 'Portfolio & marketing', description: 'Enable project showcase, case study, service, contact, proof, and interactive portfolio decisions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Portfolio / Marketing': true }, keywords: ['portfolio', 'case study', 'projects', 'marketing', 'services'] },

  // Booking & scheduling
  { id: 'booking.resourceModel', section: 'booking', group: 'What gets booked', label: 'Bookable resource model', description: 'Define whether customers reserve one resource type or combinations such as court + coach, room + equipment, or service + staff.', kind: 'choice', defaultValue: 'Single resource type', options: [{ value: 'Single resource type' }, { value: 'Multiple resource types' }, { value: 'Composite booking' }], dependsOn: { id: 'pack.booking', equals: true }, profileDefaults: { Advanced: 'Composite booking' } },
  { id: 'booking.customerAccess', section: 'booking', group: 'Booking access', label: 'Who can book', description: 'Control whether bookings are available to guests, signed-in customers, members, staff, or a combination.', kind: 'choice', defaultValue: 'Guests + signed-in users', options: [{ value: 'Guests + signed-in users' }, { value: 'Signed-in users only' }, { value: 'Members only' }, { value: 'Staff only' }], dependsOn: { id: 'pack.booking', equals: true }, appDefaults: { 'Booking / Scheduling': 'Guests + signed-in users' } },
  { id: 'booking.slotModel', section: 'booking', group: 'Availability', label: 'Slot model', description: 'Choose whether availability is built from fixed slots, free-form durations, or service-defined durations.', kind: 'choice', defaultValue: 'Fixed slots', options: [{ value: 'Fixed slots' }, { value: 'Variable duration' }, { value: 'Service-defined duration' }, { value: 'Mixed by resource' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.durationRules', section: 'booking', group: 'Availability', label: 'Duration rules', description: 'How minimum, maximum, and increment rules should constrain booking length.', kind: 'choice', defaultValue: 'Min + max + increments', options: [{ value: 'Fixed only' }, { value: 'Min + max' }, { value: 'Min + max + increments' }, { value: 'Resource-specific rules' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.buffers', section: 'booking', group: 'Availability', label: 'Buffers between bookings', description: 'Reserve cleanup, travel, setup, or turnover time before/after bookings where needed.', kind: 'choice', defaultValue: 'Optional per resource', options: [{ value: 'Off' }, { value: 'Global buffer' }, { value: 'Optional per resource' }, { value: 'Before + after separately' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.hours', section: 'booking', group: 'Availability', label: 'Operating hours', description: 'Define recurring availability globally or per resource/staff member.', kind: 'choice', defaultValue: 'Per resource + recurring schedule', options: [{ value: 'Global schedule' }, { value: 'Per resource + recurring schedule' }, { value: 'Staff/resource layered availability' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.closures', section: 'booking', group: 'Availability', label: 'Closures & exceptions', description: 'Handle holidays, maintenance blocks, special hours, closures, and one-off unavailable periods.', kind: 'choice', defaultValue: 'Holidays + blackout blocks + special hours', options: [{ value: 'Blackout dates only' }, { value: 'Holidays + blackout blocks + special hours' }, { value: 'Layered exception calendar' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.liveAvailability', section: 'booking', group: 'Availability', label: 'Availability freshness', description: 'How quickly confirmed or blocked slots should disappear from customer availability.', kind: 'choice', defaultValue: 'Real-time', options: [{ value: 'Refresh on page load' }, { value: 'Near real-time' }, { value: 'Real-time' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.hold', section: 'booking', group: 'Reservation safety', label: 'Temporary slot hold', description: 'Prevent two customers from attempting the same slot while one is completing required steps such as payment.', kind: 'choice', defaultValue: 'Short expiring hold', options: [{ value: 'Off' }, { value: 'Short expiring hold' }, { value: 'Configurable hold by flow' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.conflictPolicy', section: 'booking', group: 'Reservation safety', label: 'Conflict prevention', description: 'Define the authoritative behavior when concurrent requests target the same resource/time.', kind: 'choice', defaultValue: 'Atomic conflict rejection', options: [{ value: 'UI check only' }, { value: 'Atomic conflict rejection' }, { value: 'Atomic check + admin override' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.confirmation', section: 'booking', group: 'Lifecycle', label: 'Booking confirmation', description: 'Decide whether a booking confirms immediately, waits for payment, or requires staff approval.', kind: 'choice', defaultValue: 'Confirm after required conditions', options: [{ value: 'Immediate confirmation' }, { value: 'Confirm after required conditions' }, { value: 'Staff approval required' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.paymentPolicy', section: 'booking', group: 'Lifecycle', label: 'Payment requirement', description: 'Whether payment is unrelated, optional, a deposit, or required before final confirmation.', kind: 'choice', defaultValue: 'Required before confirmation', options: [{ value: 'No payment' }, { value: 'Pay later / optional' }, { value: 'Deposit required' }, { value: 'Required before confirmation' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.reschedule', section: 'booking', group: 'Lifecycle', label: 'Rescheduling', description: 'Allow customers or staff to move an existing booking subject to rules and availability.', kind: 'choice', defaultValue: 'Customer within policy + staff anytime', options: [{ value: 'Staff only' }, { value: 'Customer within policy + staff anytime' }, { value: 'Customer self-service with fee/rule support' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.cancellation', section: 'booking', group: 'Lifecycle', label: 'Cancellation policy', description: 'Make cancellation windows, fees/refunds, and no-refund cutoffs explicit.', kind: 'choice', defaultValue: 'Policy window + refund rules', options: [{ value: 'Staff only' }, { value: 'Simple customer cancellation' }, { value: 'Policy window + refund rules' }, { value: 'Tiered cancellation policy' }], dependsOn: { id: 'pack.booking', equals: true } },
  { id: 'booking.waitlist', section: 'booking', group: 'Capacity', label: 'Waitlist', description: 'Allow customers to queue for unavailable slots/resources and optionally receive an offer when availability opens.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Manual waitlist' }, { value: 'Auto-notify waitlist' }, { value: 'Expiring slot offers' }], dependsOn: { id: 'pack.booking', equals: true }, profileDefaults: { Advanced: 'Auto-notify waitlist' } },
  { id: 'booking.recurring', section: 'booking', group: 'Capacity', label: 'Recurring bookings', description: 'Support repeated reservations such as weekly court time, recurring appointments, or standing room reservations.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple repeat' }, { value: 'Recurring series with exceptions' }], dependsOn: { id: 'pack.booking', equals: true }, profileDefaults: { Advanced: 'Recurring series with exceptions' }, advanced: true },
  { id: 'booking.checkin', section: 'booking', group: 'Operations', label: 'Check-in / attendance', description: 'Track arrival, attendance, no-show, or resource usage when operations need it.', kind: 'choice', defaultValue: 'Optional staff check-in', options: [{ value: 'Off' }, { value: 'Optional staff check-in' }, { value: 'QR/customer check-in + staff override' }], dependsOn: { id: 'pack.booking', equals: true } },

  // Payments & money
  { id: 'payments.collection', section: 'payments', group: 'Collection', label: 'Payment collection model', description: 'Define whether payments are manual, online, or a mixed channel workflow.', kind: 'choice', defaultValue: 'Online + manual fallback', options: [{ value: 'Manual only' }, { value: 'Online only' }, { value: 'Online + manual fallback' }, { value: 'Multiple channels' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'Inventory / POS': 'Multiple channels' } },
  { id: 'payments.methods', section: 'payments', group: 'Collection', label: 'Payment methods', description: 'Breadth of payment-method support expected from the payment layer.', kind: 'choice', defaultValue: 'Cards + local e-wallets / bank methods', options: [{ value: 'Single online method' }, { value: 'Cards + local e-wallets / bank methods' }, { value: 'Provider-supported methods' }, { value: 'Cash + online + custom methods' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'Inventory / POS': 'Cash + online + custom methods' } },
  { id: 'payments.timing', section: 'payments', group: 'Collection', label: 'When payment happens', description: 'Support immediate payment, pay-later, deposits, or domain-specific timing.', kind: 'choice', defaultValue: 'Immediate / before fulfillment', options: [{ value: 'Immediate / before fulfillment' }, { value: 'Pay later' }, { value: 'Deposit then balance' }, { value: 'Mixed by transaction' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'Inventory / POS': 'Mixed by transaction' } },
  { id: 'payments.verification', section: 'payments', group: 'Confirmation', label: 'Payment verification authority', description: 'What evidence is trusted before a transaction is marked paid and downstream fulfillment proceeds.', kind: 'choice', defaultValue: 'Server/webhook verified', options: [{ value: 'Manual proof only' }, { value: 'Client return / redirect only' }, { value: 'Server/webhook verified' }, { value: 'Server verified + reconciliation' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.webhookIdempotency', section: 'payments', group: 'Confirmation', label: 'Webhook duplicate protection', description: 'Make provider event processing idempotent so retries cannot double-confirm or double-fulfill.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.pending', section: 'payments', group: 'Confirmation', label: 'Pending-payment state', description: 'Keep a clear pending state for asynchronous or delayed payment methods instead of assuming immediate success/failure.', kind: 'choice', defaultValue: 'Explicit pending + expiry/recheck', options: [{ value: 'Simple pending' }, { value: 'Explicit pending + expiry/recheck' }, { value: 'Provider-specific pending states' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.retry', section: 'payments', group: 'Confirmation', label: 'Failed payment retry', description: 'Allow safe retries without creating duplicate orders/bookings/subscriptions.', kind: 'choice', defaultValue: 'Retry same transaction intent', options: [{ value: 'Start over' }, { value: 'Retry same transaction intent' }, { value: 'Provider recovery flow' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.fees', section: 'payments', group: 'Fees & totals', label: 'Additional fees', description: 'Support convenience, platform, service, booking, or other legitimate fees separately from the base amount.', kind: 'choice', defaultValue: 'Optional named fees', options: [{ value: 'Off' }, { value: 'Optional named fees' }, { value: 'Multiple fee components' }, { value: 'Dynamic fee rules' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.feeDisplay', section: 'payments', group: 'Fees & totals', label: 'Fee transparency', description: 'When and how users see fees before committing to a transaction.', kind: 'choice', defaultValue: 'Itemized before final confirmation', options: [{ value: 'Total only' }, { value: 'Added at final step only' }, { value: 'Itemized before final confirmation' }, { value: 'Itemized throughout checkout' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.discounts', section: 'payments', group: 'Fees & totals', label: 'Discounts / promo codes', description: 'Allow controlled discounts, vouchers, or promotional codes where the business model needs them.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple promo code' }, { value: 'Rules + validity limits' }, { value: 'Stacking / advanced promotions' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'E-commerce': 'Rules + validity limits' } },
  { id: 'payments.tax', section: 'payments', group: 'Fees & totals', label: 'Tax handling', description: 'Whether tax is irrelevant, included, separately calculated, or delegated to a tax/provider integration.', kind: 'choice', defaultValue: 'Configurable / jurisdiction-aware later', options: [{ value: 'Not applicable' }, { value: 'Tax inclusive' }, { value: 'Tax exclusive / calculated' }, { value: 'Configurable / jurisdiction-aware later' }], dependsOn: { id: 'pack.payments', equals: true }, advanced: true },
  { id: 'payments.refunds', section: 'payments', group: 'Refunds', label: 'Refund support', description: 'Support no refunds, full refunds, partial refunds, or policy-driven refunds.', kind: 'choice', defaultValue: 'Full + partial refunds', options: [{ value: 'Off' }, { value: 'Full refunds only' }, { value: 'Full + partial refunds' }, { value: 'Policy-driven refunds' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.refundApproval', section: 'payments', group: 'Refunds', label: 'Refund approval', description: 'Decide whether authorized staff can refund directly or higher-value/sensitive refunds require approval.', kind: 'choice', defaultValue: 'Permission-based direct refund', options: [{ value: 'Permission-based direct refund' }, { value: 'Approval above threshold' }, { value: 'All refunds require approval' }], dependsOn: { id: 'payments.refunds', equals: ['Full refunds only', 'Full + partial refunds', 'Policy-driven refunds'] } },
  { id: 'payments.receipts', section: 'payments', group: 'Records', label: 'Receipts / transaction proof', description: 'Generate a durable customer-visible record after successful payment.', kind: 'choice', defaultValue: 'In-app + email receipt', options: [{ value: 'In-app confirmation only' }, { value: 'In-app + email receipt' }, { value: 'Downloadable receipt + email' }], dependsOn: { id: 'pack.payments', equals: true } },
  { id: 'payments.disputes', section: 'payments', group: 'Operations', label: 'Dispute / chargeback tracking', description: 'Track provider disputes or payment reversals when card/online methods make them relevant.', kind: 'choice', defaultValue: 'Provider status only', options: [{ value: 'Off' }, { value: 'Provider status only' }, { value: 'Internal dispute case workflow' }], dependsOn: { id: 'pack.payments', equals: true }, advanced: true },
  { id: 'payments.settlement', section: 'payments', group: 'Operations', label: 'Settlement / reconciliation', description: 'Compare internal paid transactions against provider or cashier settlement records.', kind: 'choice', defaultValue: 'Daily summary', options: [{ value: 'Off' }, { value: 'Daily summary' }, { value: 'Reconciliation report' }, { value: 'Exception-based reconciliation queue' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'Inventory / POS': 'Reconciliation report' } },
  { id: 'payments.split', section: 'payments', group: 'Operations', label: 'Split / platform payout model', description: 'Represent platform fees or multi-party settlement only when the payment provider/business arrangement supports it.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Track split internally' }, { value: 'Provider-supported split payments' }, { value: 'Marketplace payout ledger' }], dependsOn: { id: 'pack.payments', equals: true }, advanced: true },

  // Subscription / SaaS billing
  { id: 'subscriptions.planModel', section: 'subscriptions', group: 'Plans', label: 'Plan model', description: 'Define whether the product has one paid plan, multiple tiers, or custom/enterprise plans.', kind: 'choice', defaultValue: 'Multiple tiers', options: [{ value: 'Single paid plan' }, { value: 'Multiple tiers' }, { value: 'Tiers + custom enterprise' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.cadence', section: 'subscriptions', group: 'Plans', label: 'Billing cadence', description: 'Supported recurring billing periods.', kind: 'choice', defaultValue: 'Monthly + annual', options: [{ value: 'Monthly' }, { value: 'Annual' }, { value: 'Monthly + annual' }, { value: 'Custom cadence by plan' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.trial', section: 'subscriptions', group: 'Acquisition', label: 'Free trial', description: 'Offer a trial before paid billing begins.', kind: 'choice', defaultValue: 'Optional by plan', options: [{ value: 'Off' }, { value: 'Global trial' }, { value: 'Optional by plan' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.trialPaymentMethod', section: 'subscriptions', group: 'Acquisition', label: 'Payment method for trial', description: 'Whether a payment method is required up front before a trial starts.', kind: 'choice', defaultValue: 'No card required by default', options: [{ value: 'No card required by default' }, { value: 'Card required' }, { value: 'Plan-specific' }], dependsOn: { id: 'subscriptions.trial', equals: ['Global trial', 'Optional by plan'] } },
  { id: 'subscriptions.seats', section: 'subscriptions', group: 'Pricing model', label: 'Seat-based billing', description: 'Charge or limit based on organization members/seats.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Included seat limit' }, { value: 'Per-seat pricing' }, { value: 'Base + seats' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.usage', section: 'subscriptions', group: 'Pricing model', label: 'Usage-based billing', description: 'Meter activity such as requests, transactions, storage, or credits for billing/limits.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Usage limits only' }, { value: 'Metered billing' }, { value: 'Credits / prepaid usage' }], dependsOn: { id: 'pack.subscriptions', equals: true }, advanced: true },
  { id: 'subscriptions.entitlements', section: 'subscriptions', group: 'Pricing model', label: 'Plan entitlements', description: 'Tie feature access, limits, or quotas explicitly to the active plan.', kind: 'choice', defaultValue: 'Feature + limit entitlements', options: [{ value: 'Feature flags only' }, { value: 'Feature + limit entitlements' }, { value: 'Entitlements service / policy layer' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.upgrade', section: 'subscriptions', group: 'Plan changes', label: 'Upgrade behavior', description: 'When upgraded limits/features and billing changes take effect.', kind: 'choice', defaultValue: 'Immediate + prorated', options: [{ value: 'Next billing period' }, { value: 'Immediate no proration' }, { value: 'Immediate + prorated' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.downgrade', section: 'subscriptions', group: 'Plan changes', label: 'Downgrade behavior', description: 'Protect users from destructive limit changes when moving to a lower plan.', kind: 'choice', defaultValue: 'Next period + limit checks', options: [{ value: 'Immediate' }, { value: 'Next period' }, { value: 'Next period + limit checks' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.cancel', section: 'subscriptions', group: 'Plan changes', label: 'Cancellation', description: 'Support immediate cancellation, end-of-period cancellation, or both with explicit consequences.', kind: 'choice', defaultValue: 'End of period by default', options: [{ value: 'Immediate only' }, { value: 'End of period by default' }, { value: 'User chooses immediate or period end' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.pause', section: 'subscriptions', group: 'Plan changes', label: 'Pause subscription', description: 'Allow temporary suspension without full cancellation.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Admin only' }, { value: 'Customer self-service' }], dependsOn: { id: 'pack.subscriptions', equals: true }, advanced: true },
  { id: 'subscriptions.dunning', section: 'subscriptions', group: 'Billing recovery', label: 'Failed-payment recovery', description: 'Define retries, grace periods, and access consequences after recurring payment failure.', kind: 'choice', defaultValue: 'Retry + grace period', options: [{ value: 'Immediate suspension' }, { value: 'Retry + grace period' }, { value: 'Retry + grace + staged restrictions' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.invoices', section: 'subscriptions', group: 'Billing records', label: 'Invoices', description: 'Generate and expose recurring billing records for customers/admins.', kind: 'choice', defaultValue: 'Automatic invoice history', options: [{ value: 'Receipts only' }, { value: 'Automatic invoice history' }, { value: 'Invoices + custom business details' }], dependsOn: { id: 'pack.subscriptions', equals: true } },
  { id: 'subscriptions.portal', section: 'subscriptions', group: 'Self-service', label: 'Customer billing portal', description: 'Let customers manage payment methods, invoices, plan changes, and cancellation without staff intervention.', kind: 'choice', defaultValue: 'Provider/custom self-service', options: [{ value: 'Off / staff managed' }, { value: 'Provider/custom self-service' }, { value: 'Full in-app billing center' }], dependsOn: { id: 'pack.subscriptions', equals: true } },

  // E-commerce
  { id: 'commerce.catalog', section: 'commerce', group: 'Catalog', label: 'Catalog structure', description: 'How products are grouped and browsed.', kind: 'choice', defaultValue: 'Categories + collections', options: [{ value: 'Flat catalog' }, { value: 'Categories + collections' }, { value: 'Hierarchical catalog + merchandising' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.variants', section: 'commerce', group: 'Catalog', label: 'Product variants', description: 'Support product options such as size/color and distinct SKU/stock/price combinations.', kind: 'choice', defaultValue: 'Variants + SKU', options: [{ value: 'No variants' }, { value: 'Simple options' }, { value: 'Variants + SKU' }, { value: 'Complex configurable products' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.cart', section: 'commerce', group: 'Shopping', label: 'Cart behavior', description: 'Persistence and recovery of items before checkout.', kind: 'choice', defaultValue: 'Persistent guest/account cart', options: [{ value: 'Session cart' }, { value: 'Persistent guest/account cart' }, { value: 'Saved carts + restore' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.guestCheckout', section: 'commerce', group: 'Checkout', label: 'Guest checkout', description: 'Allow purchase without forcing account creation.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.checkout', section: 'commerce', group: 'Checkout', label: 'Checkout complexity', description: 'Choose a short checkout or a richer multi-step flow where shipping/billing requirements justify it.', kind: 'choice', defaultValue: 'Focused multi-step', options: [{ value: 'Single page' }, { value: 'Focused multi-step' }, { value: 'Express + full checkout' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.addresses', section: 'commerce', group: 'Checkout', label: 'Saved addresses', description: 'Let signed-in customers reuse shipping/billing details.', kind: 'choice', defaultValue: 'Address book', options: [{ value: 'Off' }, { value: 'Single saved address' }, { value: 'Address book' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.fulfillment', section: 'commerce', group: 'Fulfillment', label: 'Fulfillment methods', description: 'Supported ways customers receive orders.', kind: 'choice', defaultValue: 'Shipping', options: [{ value: 'Shipping' }, { value: 'Pickup' }, { value: 'Shipping + pickup' }, { value: 'Shipping + pickup + local delivery' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.shippingRates', section: 'commerce', group: 'Fulfillment', label: 'Shipping rates', description: 'How delivery cost is calculated.', kind: 'choice', defaultValue: 'Rule-based rates', options: [{ value: 'Flat rate' }, { value: 'Rule-based rates' }, { value: 'Carrier/provider calculated' }, { value: 'Free / included' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.promotions', section: 'commerce', group: 'Merchandising', label: 'Promotions', description: 'Promotion complexity beyond simple payment-level discounts.', kind: 'choice', defaultValue: 'Codes + automatic rules', options: [{ value: 'Off' }, { value: 'Promo codes' }, { value: 'Codes + automatic rules' }, { value: 'Bundles + tiered promotions' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.wishlist', section: 'commerce', group: 'Shopping', label: 'Wishlist / favorites', description: 'Allow customers to save products for later.', kind: 'choice', defaultValue: 'Account wishlist', options: [{ value: 'Off' }, { value: 'Local wishlist' }, { value: 'Account wishlist' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.reviews', section: 'commerce', group: 'Trust', label: 'Product reviews', description: 'Collect and moderate customer ratings/reviews.', kind: 'choice', defaultValue: 'Verified-purchase reviews', options: [{ value: 'Off' }, { value: 'Open reviews + moderation' }, { value: 'Verified-purchase reviews' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.orderStatus', section: 'commerce', group: 'Orders', label: 'Order lifecycle', description: 'Depth of order statuses visible to staff and customers.', kind: 'choice', defaultValue: 'Operational + customer statuses', options: [{ value: 'Simple pending/completed/cancelled' }, { value: 'Operational + customer statuses' }, { value: 'Fulfillment events + shipment tracking' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.cancellation', section: 'commerce', group: 'Orders', label: 'Order cancellation', description: 'Allow customer cancellation while fulfillment has not progressed beyond safe points.', kind: 'choice', defaultValue: 'Customer before fulfillment + staff override', options: [{ value: 'Staff only' }, { value: 'Customer before fulfillment + staff override' }, { value: 'Rule-based cancellation window' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.returns', section: 'commerce', group: 'After purchase', label: 'Returns / exchanges', description: 'Support return requests, exchange workflows, and resolution tracking.', kind: 'choice', defaultValue: 'Return request workflow', options: [{ value: 'Off' }, { value: 'Return request workflow' }, { value: 'Returns + exchanges + reason codes' }], dependsOn: { id: 'pack.commerce', equals: true } },
  { id: 'commerce.abandonedCart', section: 'commerce', group: 'Retention', label: 'Abandoned-cart recovery', description: 'Track/recover carts only if there is a legitimate notification/marketing workflow to support it.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Saved cart only' }, { value: 'Reminder workflow with consent' }], dependsOn: { id: 'pack.commerce', equals: true }, advanced: true },
  { id: 'commerce.recommendations', section: 'commerce', group: 'Merchandising', label: 'Related products', description: 'Recommend alternatives/add-ons without requiring AI.', kind: 'choice', defaultValue: 'Rule-based related products', options: [{ value: 'Off' }, { value: 'Manual related products' }, { value: 'Rule-based related products' }, { value: 'Personalized recommendations' }], dependsOn: { id: 'pack.commerce', equals: true } },

  // Inventory & POS
  { id: 'inventory.locations', section: 'inventory', group: 'Structure', label: 'Stock locations', description: 'Number and structure of warehouses, branches, stores, or stock rooms.', kind: 'choice', defaultValue: 'Multiple locations', options: [{ value: 'Single location' }, { value: 'Multiple locations' }, { value: 'Locations + bins/zones' }], dependsOn: { id: 'pack.inventory', equals: true }, appDefaults: { 'Inventory / POS': 'Multiple locations', 'E-commerce': 'Single location' } },
  { id: 'inventory.identifiers', section: 'inventory', group: 'Items', label: 'Item identifiers', description: 'How SKUs, barcodes, and internal IDs are used.', kind: 'choice', defaultValue: 'SKU + barcode optional', options: [{ value: 'Internal ID only' }, { value: 'SKU' }, { value: 'SKU + barcode optional' }, { value: 'SKU + barcode required' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.units', section: 'inventory', group: 'Items', label: 'Units of measure', description: 'Support one unit per item or conversions such as box-to-piece.', kind: 'choice', defaultValue: 'Single unit per item', options: [{ value: 'Single unit per item' }, { value: 'Multiple units / conversions' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.movements', section: 'inventory', group: 'Stock movement', label: 'Stock movement ledger', description: 'Track every stock-in/out/transfer/adjustment as a traceable movement rather than only storing current quantity.', kind: 'choice', defaultValue: 'Immutable movement ledger', options: [{ value: 'Quantity updates only' }, { value: 'Movement history' }, { value: 'Immutable movement ledger' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.transfers', section: 'inventory', group: 'Stock movement', label: 'Inter-location transfers', description: 'Move stock between branches/warehouses with traceable in-transit and receipt states.', kind: 'choice', defaultValue: 'Transfer + receive', options: [{ value: 'Off' }, { value: 'Immediate transfer' }, { value: 'Transfer + receive' }, { value: 'Approval + in-transit workflow' }], dependsOn: { id: 'inventory.locations', equals: ['Multiple locations', 'Locations + bins/zones'] } },
  { id: 'inventory.adjustments', section: 'inventory', group: 'Stock movement', label: 'Stock adjustments', description: 'Record correction, damage, loss, found stock, and other non-sale adjustments with reasons.', kind: 'choice', defaultValue: 'Reason required', options: [{ value: 'Simple adjustment' }, { value: 'Reason required' }, { value: 'Reason + approval above threshold' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.negative', section: 'inventory', group: 'Integrity', label: 'Negative stock', description: 'What happens when an operation would reduce available stock below zero.', kind: 'choice', defaultValue: 'Block + explain', options: [{ value: 'Allow silently' }, { value: 'Warn but allow' }, { value: 'Block + explain' }, { value: 'Role-based override' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.reservations', section: 'inventory', group: 'Integrity', label: 'Stock reservation', description: 'Reserve stock for pending orders/bookings so availability reflects committed-but-not-yet-fulfilled units.', kind: 'choice', defaultValue: 'Reserve for confirmed commitments', options: [{ value: 'Off' }, { value: 'Reserve for confirmed commitments' }, { value: 'Reserve during checkout/hold too' }], dependsOn: { id: 'pack.inventory', equals: true }, appDefaults: { 'E-commerce': 'Reserve during checkout/hold too' } },
  { id: 'inventory.reorder', section: 'inventory', group: 'Replenishment', label: 'Reorder points', description: 'Track target/reorder thresholds per item/location.', kind: 'choice', defaultValue: 'Per item/location', options: [{ value: 'Off' }, { value: 'Global/default threshold' }, { value: 'Per item/location' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.lowStock', section: 'inventory', group: 'Replenishment', label: 'Low-stock alerts', description: 'Notify or surface actionable low-stock conditions.', kind: 'choice', defaultValue: 'Dashboard + notification', options: [{ value: 'Dashboard only' }, { value: 'Dashboard + notification' }, { value: 'Task/replenishment queue' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.lots', section: 'inventory', group: 'Traceability', label: 'Lot / batch tracking', description: 'Track inventory by lot/batch where source/expiry/traceability matters.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Optional by item' }, { value: 'Required for tracked categories' }], dependsOn: { id: 'pack.inventory', equals: true }, appDefaults: { 'Clinic / EMR': 'Required for tracked categories' } },
  { id: 'inventory.expiry', section: 'inventory', group: 'Traceability', label: 'Expiry tracking', description: 'Track expiry dates and prioritize/alert stock nearing expiry.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Expiry date + alerts' }, { value: 'FEFO + alerts' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.serials', section: 'inventory', group: 'Traceability', label: 'Serial numbers', description: 'Track individual serialized units where needed.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Optional by item' }, { value: 'Required for serialized categories' }], dependsOn: { id: 'pack.inventory', equals: true }, advanced: true },
  { id: 'inventory.costing', section: 'inventory', group: 'Valuation', label: 'Cost / valuation method', description: 'Expected inventory cost tracking for reports and margin calculations.', kind: 'choice', defaultValue: 'Average cost', options: [{ value: 'Last cost only' }, { value: 'Average cost' }, { value: 'FIFO' }, { value: 'Domain/accounting-specific' }], dependsOn: { id: 'pack.inventory', equals: true }, advanced: true },
  { id: 'inventory.purchasing', section: 'inventory', group: 'Replenishment', label: 'Purchase orders & receiving', description: 'Manage supplier purchase orders and staged receiving instead of direct stock adjustments.', kind: 'choice', defaultValue: 'Basic PO + receiving', options: [{ value: 'Off' }, { value: 'Basic PO + receiving' }, { value: 'PO approval + partial receiving' }], dependsOn: { id: 'pack.inventory', equals: true } },
  { id: 'inventory.counts', section: 'inventory', group: 'Control', label: 'Physical stock counts', description: 'Support cycle/physical counts with variance review.', kind: 'choice', defaultValue: 'Count + variance review', options: [{ value: 'Off' }, { value: 'Count + variance review' }, { value: 'Scheduled cycle counts + approval' }], dependsOn: { id: 'pack.inventory', equals: true } },

  // Reports & analytics
  { id: 'reporting.dashboard', section: 'reporting', group: 'Report surface', label: 'Reporting home', description: 'How users reach operational metrics and reports.', kind: 'choice', defaultValue: 'Dashboard + report library', options: [{ value: 'Report library only' }, { value: 'Dashboard + report library' }, { value: 'Role-specific analytics workspaces' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.standard', section: 'reporting', group: 'Report surface', label: 'Standard reports', description: 'Ship curated domain reports for common decisions rather than requiring users to build everything.', kind: 'choice', defaultValue: 'Core domain report set', options: [{ value: 'Minimal summaries' }, { value: 'Core domain report set' }, { value: 'Comprehensive operational report set' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.custom', section: 'reporting', group: 'Report surface', label: 'Custom report builder', description: 'Allow power users to compose reusable reports from authorized fields.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Saved custom filters/views' }, { value: 'Visual report builder' }, { value: 'Advanced query/report builder' }], dependsOn: { id: 'pack.reporting', equals: true }, profileDefaults: { Advanced: 'Visual report builder' }, advanced: true },
  { id: 'reporting.dateFilters', section: 'reporting', group: 'Analysis', label: 'Date filtering', description: 'Provide useful preset and custom date ranges.', kind: 'choice', defaultValue: 'Presets + custom range', options: [{ value: 'Basic range' }, { value: 'Presets + custom range' }, { value: 'Fiscal/operational periods + custom' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.comparison', section: 'reporting', group: 'Analysis', label: 'Period comparison', description: 'Compare current metrics against previous periods or targets where meaningful.', kind: 'choice', defaultValue: 'Previous period', options: [{ value: 'Off' }, { value: 'Previous period' }, { value: 'Previous period + prior year' }, { value: 'Targets + historical comparisons' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.grouping', section: 'reporting', group: 'Analysis', label: 'Grouping / segmentation', description: 'Break metrics down by relevant dimensions such as branch, service, resource, role, category, or status.', kind: 'choice', defaultValue: 'Core domain dimensions', options: [{ value: 'Fixed grouping' }, { value: 'Core domain dimensions' }, { value: 'User-selectable dimensions' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.drilldown', section: 'reporting', group: 'Analysis', label: 'Drill-down to records', description: 'Let authorized users move from a metric to the underlying filtered records that produced it.', kind: 'choice', defaultValue: 'Supported on operational metrics', options: [{ value: 'Off' }, { value: 'Supported on operational metrics' }, { value: 'Broad drill-through' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.charts', section: 'reporting', group: 'Presentation', label: 'Charts', description: 'Use charts only where they improve interpretation over a table/KPI.', kind: 'choice', defaultValue: 'KPI + essential charts', options: [{ value: 'Tables only' }, { value: 'KPI + essential charts' }, { value: 'Rich charting' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.export', section: 'reporting', group: 'Distribution', label: 'Report export', description: 'Supported export formats for authorized report data.', kind: 'choice', defaultValue: 'CSV / spreadsheet + PDF', options: [{ value: 'Off' }, { value: 'CSV / spreadsheet' }, { value: 'CSV / spreadsheet + PDF' }, { value: 'Multiple formatted outputs' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.schedule', section: 'reporting', group: 'Distribution', label: 'Scheduled reports', description: 'Automatically generate/deliver recurring reports when people otherwise repeat the same manual export.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Admin schedules' }, { value: 'User-managed schedules' }], dependsOn: { id: 'pack.reporting', equals: true }, profileDefaults: { Advanced: 'Admin schedules' }, advanced: true },
  { id: 'reporting.delivery', section: 'reporting', group: 'Distribution', label: 'Scheduled delivery', description: 'Where recurring reports are delivered.', kind: 'choice', defaultValue: 'Email link / attachment', options: [{ value: 'In-app only' }, { value: 'Email link / attachment' }, { value: 'Email + integration/webhook' }], dependsOn: { id: 'reporting.schedule', equals: ['Admin schedules', 'User-managed schedules'] } },
  { id: 'reporting.permissions', section: 'reporting', group: 'Governance', label: 'Report data permissions', description: 'Ensure reports inherit row/field/tenant permissions instead of becoming a data-exfiltration shortcut.', kind: 'choice', defaultValue: 'Inherit source permissions', options: [{ value: 'Unrestricted report dataset' }, { value: 'Inherit source permissions' }, { value: 'Dedicated report permission policies' }], dependsOn: { id: 'pack.reporting', equals: true } },
  { id: 'reporting.audit', section: 'reporting', group: 'Governance', label: 'Report/export audit', description: 'Log high-value report generation or exports where sensitive/operational data is involved.', kind: 'choice', defaultValue: 'Log exports', options: [{ value: 'Off' }, { value: 'Log exports' }, { value: 'Log reports + exports + scheduled delivery' }], dependsOn: { id: 'pack.reporting', equals: true }, appDefaults: { 'Government System': 'Log reports + exports + scheduled delivery', 'Clinic / EMR': 'Log reports + exports + scheduled delivery' } },
  { id: 'reporting.freshness', section: 'reporting', group: 'Governance', label: 'Metric freshness', description: 'Tell users whether numbers are live, delayed, cached, or based on a specific cutoff.', kind: 'choice', defaultValue: 'Live where practical + visible cutoff', options: [{ value: 'No freshness indicator' }, { value: 'Visible last updated' }, { value: 'Live where practical + visible cutoff' }], dependsOn: { id: 'pack.reporting', equals: true } },

  // Directory & marketplace
  { id: 'directory.listingModel', section: 'directory', group: 'Listings', label: 'Listing ownership model', description: 'Who creates and maintains listings.', kind: 'choice', defaultValue: 'Admin + owner-managed', options: [{ value: 'Admin managed only' }, { value: 'User submissions + admin moderation' }, { value: 'Admin + owner-managed' }, { value: 'Open marketplace sellers' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.submission', section: 'directory', group: 'Listings', label: 'New listing submission', description: 'How new listings enter the directory.', kind: 'choice', defaultValue: 'Submission + moderation', options: [{ value: 'Admin only' }, { value: 'Submission + moderation' }, { value: 'Verified owner direct publish' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.claim', section: 'directory', group: 'Ownership', label: 'Claim existing listing', description: 'Allow a real-world owner to request control of a listing created by the platform/admin.', kind: 'choice', defaultValue: 'Claim request + verification', options: [{ value: 'Off' }, { value: 'Instant claim' }, { value: 'Claim request + verification' }, { value: 'Manual owner onboarding' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.verification', section: 'directory', group: 'Ownership', label: 'Listing / owner verification', description: 'Verification depth before trusted/owner privileges are granted.', kind: 'choice', defaultValue: 'Evidence + admin approval', options: [{ value: 'Off' }, { value: 'Email/domain check' }, { value: 'Evidence + admin approval' }, { value: 'Tiered verification badges' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.location', section: 'directory', group: 'Discovery', label: 'Location data', description: 'Depth of address, coordinates, distance, and service-area support.', kind: 'choice', defaultValue: 'Address + map coordinates + distance', options: [{ value: 'Text location only' }, { value: 'Address + map coordinates' }, { value: 'Address + map coordinates + distance' }, { value: 'Location + service areas' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.map', section: 'directory', group: 'Discovery', label: 'Map experience', description: 'Map/list integration for geographic discovery.', kind: 'choice', defaultValue: 'Map + synced listing results', options: [{ value: 'Off' }, { value: 'Simple map pins' }, { value: 'Map + synced listing results' }, { value: 'Map clusters + viewport search' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.search', section: 'directory', group: 'Discovery', label: 'Directory search', description: 'Search behavior tuned to public listing discovery.', kind: 'choice', defaultValue: 'Full-text + location-aware', options: [{ value: 'Basic keyword' }, { value: 'Full-text + filters' }, { value: 'Full-text + location-aware' }, { value: 'Semantic/enhanced discovery later' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.filters', section: 'directory', group: 'Discovery', label: 'Listing filters', description: 'Filter depth for categories, amenities, availability, price, rating, or other domain facets.', kind: 'choice', defaultValue: 'Category + domain facets', options: [{ value: 'Category only' }, { value: 'Category + domain facets' }, { value: 'Faceted filters + quick chips' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.ownerEdits', section: 'directory', group: 'Ownership', label: 'Owner edits', description: 'How owner changes to public listing data are published.', kind: 'choice', defaultValue: 'Direct low-risk edits + moderation for sensitive fields', options: [{ value: 'All edits moderated' }, { value: 'Direct low-risk edits + moderation for sensitive fields' }, { value: 'Verified owner direct edit' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.freshness', section: 'directory', group: 'Quality', label: 'Listing freshness', description: 'Make stale information visible and create a path to reverify/update it.', kind: 'choice', defaultValue: 'Last updated + stale threshold', options: [{ value: 'No freshness indicator' }, { value: 'Last updated' }, { value: 'Last updated + stale threshold' }, { value: 'Owner revalidation reminders' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.featured', section: 'directory', group: 'Monetization', label: 'Featured / sponsored listings', description: 'Support paid/promoted placement while keeping the distinction from organic results explicit.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Featured listings' }, { value: 'Sponsored + featured with labels' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.reviews', section: 'directory', group: 'Trust', label: 'Ratings & reviews', description: 'Whether users can rate/review listings and how moderation is handled.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Ratings only' }, { value: 'Ratings + moderated reviews' }, { value: 'Verified interaction reviews' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.contact', section: 'directory', group: 'Conversion', label: 'Contact / conversion actions', description: 'Primary action from a listing.', kind: 'choice', defaultValue: 'Call/message/website links', options: [{ value: 'External links only' }, { value: 'Call/message/website links' }, { value: 'Lead form' }, { value: 'On-platform booking/purchase' }], dependsOn: { id: 'pack.directory', equals: true } },
  { id: 'directory.moderation', section: 'directory', group: 'Quality', label: 'Listing moderation queue', description: 'Provide a staff queue for submissions, claims, flagged edits, and reported content.', kind: 'choice', defaultValue: 'Unified moderation queue', options: [{ value: 'Simple approve/reject' }, { value: 'Unified moderation queue' }, { value: 'Risk/priority-based moderation' }], dependsOn: { id: 'pack.directory', equals: true } },

  // Tournament & event
  { id: 'tournament.registration', section: 'tournament', group: 'Participants', label: 'Registration model', description: 'How participants/teams enter the event.', kind: 'choice', defaultValue: 'Admin + participant registration', options: [{ value: 'Admin entry only' }, { value: 'Participant registration' }, { value: 'Admin + participant registration' }, { value: 'Registration + approval/payment' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.entities', section: 'tournament', group: 'Participants', label: 'Competition entities', description: 'Whether competition is individual, pair, team, or mixed across divisions.', kind: 'choice', defaultValue: 'Teams + players/pairs', options: [{ value: 'Individuals' }, { value: 'Pairs' }, { value: 'Teams + players/pairs' }, { value: 'Mixed by division' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.divisions', section: 'tournament', group: 'Structure', label: 'Divisions / categories', description: 'Support multiple competition divisions with independent rules/visibility.', kind: 'choice', defaultValue: 'Multiple divisions', options: [{ value: 'Single competition' }, { value: 'Multiple divisions' }, { value: 'Divisions + categories/tiers' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.groups', section: 'tournament', group: 'Structure', label: 'Group stage', description: 'Round-robin group support before knockout/playoff stages.', kind: 'choice', defaultValue: 'Optional group stage', options: [{ value: 'Off' }, { value: 'Optional group stage' }, { value: 'Multiple groups + qualification rules' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.scheduling', section: 'tournament', group: 'Scheduling', label: 'Match scheduling', description: 'How matches are assigned times/courts/venues and reordered operationally.', kind: 'choice', defaultValue: 'Time + court assignment', options: [{ value: 'Ordered match list' }, { value: 'Time + court assignment' }, { value: 'Dynamic court stacking / next-up queue' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.scoring', section: 'tournament', group: 'Competition rules', label: 'Scoring model', description: 'Score-entry depth and support for multi-game/multi-set matches.', kind: 'choice', defaultValue: 'Domain rules + validation', options: [{ value: 'Winner only' }, { value: 'Score + winner' }, { value: 'Domain rules + validation' }, { value: 'Multi-game/set scoring engine' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.standings', section: 'tournament', group: 'Competition rules', label: 'Standings calculation', description: 'Automatically calculate group/league standings from configured result metrics.', kind: 'choice', defaultValue: 'Automatic standings', options: [{ value: 'Manual standings' }, { value: 'Automatic standings' }, { value: 'Automatic + configurable metrics' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.tiebreak', section: 'tournament', group: 'Competition rules', label: 'Tiebreakers', description: 'Explicit ordered tiebreak rules to avoid ad-hoc decisions at the end of a stage.', kind: 'choice', defaultValue: 'Ordered configurable tiebreakers', options: [{ value: 'Manual decision' }, { value: 'Fixed tiebreak rule' }, { value: 'Ordered configurable tiebreakers' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.bracket', section: 'tournament', group: 'Structure', label: 'Knockout bracket', description: 'Support semifinals/finals or larger seeded knockout brackets.', kind: 'choice', defaultValue: 'Bracket after qualification', options: [{ value: 'Off' }, { value: 'Simple finals' }, { value: 'Bracket after qualification' }, { value: 'Seeded configurable bracket' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.lineups', section: 'tournament', group: 'Team operations', label: 'Team lineups / roster lock', description: 'Allow managers/captains to submit lineups with lock timing and admin override.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Roster only' }, { value: 'Per-match lineup + lock' }, { value: 'Lineup + substitutions/eligibility' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.live', section: 'tournament', group: 'Public experience', label: 'Live results', description: 'How quickly public scores/standings/brackets reflect organizer updates.', kind: 'choice', defaultValue: 'Near real-time public updates', options: [{ value: 'Publish after completion' }, { value: 'Near real-time public updates' }, { value: 'Live scoring + auto standings/bracket' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.visibility', section: 'tournament', group: 'Public experience', label: 'Division visibility', description: 'Allow public, private, and embargoed competition data to coexist safely.', kind: 'choice', defaultValue: 'Per-division public/private', options: [{ value: 'All public' }, { value: 'Per-division public/private' }, { value: 'Per-stage visibility controls' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.print', section: 'tournament', group: 'Operations', label: 'Printable scorecards / sheets', description: 'Generate event-friendly print layouts for courts, officials, or manual fallback.', kind: 'choice', defaultValue: 'Printable scorecards', options: [{ value: 'Off' }, { value: 'Printable scorecards' }, { value: 'Scorecards + schedules + standings sheets' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.awards', section: 'tournament', group: 'Awards', label: 'Awards / placements', description: 'Track champions, podium placements, special awards, and final recognition.', kind: 'choice', defaultValue: 'Placements + awards', options: [{ value: 'Placements only' }, { value: 'Placements + awards' }, { value: 'Awards + public voting' }], dependsOn: { id: 'pack.tournament', equals: true } },
  { id: 'tournament.simulation', section: 'tournament', group: 'Operations', label: 'Safe simulation / dry-run tools', description: 'Allow organizers to test schedules/scoring flows without contaminating public competition data.', kind: 'choice', defaultValue: 'Private test mode', options: [{ value: 'Off' }, { value: 'Private test mode' }, { value: 'Per-division simulation + reset' }], dependsOn: { id: 'pack.tournament', equals: true }, advanced: true },

  // Government/document workflow
  { id: 'government.documentTypes', section: 'government', group: 'Document model', label: 'Document types / classifications', description: 'Classify incoming/outgoing/internal documents with type-specific metadata and workflow where needed.', kind: 'choice', defaultValue: 'Configurable document types', options: [{ value: 'Single generic record' }, { value: 'Configurable document types' }, { value: 'Types + type-specific fields/workflows' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.direction', section: 'government', group: 'Document model', label: 'Incoming / outgoing direction', description: 'Represent document direction and origin/destination explicitly.', kind: 'choice', defaultValue: 'Incoming + outgoing + internal', options: [{ value: 'Incoming only' }, { value: 'Incoming + outgoing' }, { value: 'Incoming + outgoing + internal' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.officeHierarchy', section: 'government', group: 'Organization', label: 'Office hierarchy', description: 'Model office/division/section or equivalent routing hierarchy.', kind: 'choice', defaultValue: 'Office > division > section', options: [{ value: 'Flat offices' }, { value: 'Office > division > section' }, { value: 'Configurable hierarchy' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.routing', section: 'government', group: 'Routing', label: 'Document routing', description: 'Track transfers between responsible units/users with timestamps and remarks.', kind: 'choice', defaultValue: 'Unit routing + recipient + remarks', options: [{ value: 'Status only' }, { value: 'Unit routing + recipient + remarks' }, { value: 'Multi-recipient routing + action requirements' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.receipt', section: 'government', group: 'Routing', label: 'Receive / acknowledge step', description: 'Require receiving units/users to acknowledge custody instead of treating send as received.', kind: 'choice', defaultValue: 'Explicit receive acknowledgement', options: [{ value: 'Auto-received on route' }, { value: 'Explicit receive acknowledgement' }, { value: 'Receive + return/refuse reason' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.references', section: 'government', group: 'Document model', label: 'Tracking / reference numbers', description: 'Generate human-readable references suitable for communication, print, and search.', kind: 'choice', defaultValue: 'Type/year sequence + internal ID', options: [{ value: 'Simple sequence' }, { value: 'Type/year sequence + internal ID' }, { value: 'Office/type/year configurable format' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.family', section: 'government', group: 'Document model', label: 'Related / child documents', description: 'Connect continuations, responses, amendments, endorsements, and related records into a navigable family.', kind: 'choice', defaultValue: 'Parent/child + related links', options: [{ value: 'Related links only' }, { value: 'Parent/child + related links' }, { value: 'Document family tree' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.signatories', section: 'government', group: 'Approval', label: 'Signatories / action officers', description: 'Track responsible signatories or approving officers without confusing routing custody and approval authority.', kind: 'choice', defaultValue: 'Named signatory + approval status', options: [{ value: 'Free-text signatory' }, { value: 'Named signatory + approval status' }, { value: 'Signatory chain / delegation' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.turnaround', section: 'government', group: 'Monitoring', label: 'Turnaround time', description: 'Measure elapsed/working time and identify aging/delayed documents.', kind: 'choice', defaultValue: 'Aging + configurable due/SLA', options: [{ value: 'Elapsed age only' }, { value: 'Aging + configurable due/SLA' }, { value: 'Per-stage SLA + delay reasons' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.delayReason', section: 'government', group: 'Monitoring', label: 'Delay / return reasons', description: 'Capture structured reasons when documents exceed targets, are returned, or cannot proceed.', kind: 'choice', defaultValue: 'Reason codes + remarks', options: [{ value: 'Free-text only' }, { value: 'Reason codes + remarks' }, { value: 'Reason codes + escalation analytics' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.printSlip', section: 'government', group: 'Physical interoperability', label: 'Printable routing / continuation slips', description: 'Support paper/physical handoff fallback or offices that still require printed transaction artifacts.', kind: 'choice', defaultValue: 'Printable routing slip', options: [{ value: 'Off' }, { value: 'Printable routing slip' }, { value: 'Routing + continuation/receipt slips' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.qr', section: 'government', group: 'Physical interoperability', label: 'QR document tracking', description: 'Place a QR on printed artifacts to open the authorized tracking/record view quickly.', kind: 'choice', defaultValue: 'Internal authorized QR', options: [{ value: 'Off' }, { value: 'Internal authorized QR' }, { value: 'Public tracking token + internal QR' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.publicTracking', section: 'government', group: 'Public service', label: 'Public status tracking', description: 'Expose a bounded external status lookup without revealing internal routing, attachments, or sensitive metadata.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Minimal public status + reference' }, { value: 'Public milestone timeline' }, { value: 'Show internal routing detail' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.recordsRetention', section: 'government', group: 'Records management', label: 'Records retention classification', description: 'Attach retention/disposition categories where policy requires different lifecycles.', kind: 'choice', defaultValue: 'Retention category on records', options: [{ value: 'General retention only' }, { value: 'Retention category on records' }, { value: 'Retention + disposition review workflow' }], dependsOn: { id: 'pack.government', equals: true } },
  { id: 'government.receiptProof', section: 'government', group: 'Physical interoperability', label: 'Release / receipt proof', description: 'Record when outgoing documents are released or received outside the system.', kind: 'choice', defaultValue: 'Recipient + timestamp + optional proof', options: [{ value: 'Timestamp only' }, { value: 'Recipient + timestamp + optional proof' }, { value: 'Signed/attached proof + receipt details' }], dependsOn: { id: 'pack.government', equals: true } },

  // Clinic & EMR
  { id: 'clinic.patientRegistry', section: 'clinic', group: 'Patient identity', label: 'Patient registry', description: 'Maintain a longitudinal patient identity separate from individual visits/encounters.', kind: 'choice', defaultValue: 'Longitudinal patient record', options: [{ value: 'Visit-only records' }, { value: 'Longitudinal patient record' }, { value: 'Patient + household/relationship context' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.patientNumber', section: 'clinic', group: 'Patient identity', label: 'Patient number', description: 'Generate a stable human-readable patient identifier in addition to the internal database ID.', kind: 'choice', defaultValue: 'Generated unique patient number', options: [{ value: 'Internal ID only' }, { value: 'Generated unique patient number' }, { value: 'Facility-specific patient numbering rules' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.encounters', section: 'clinic', group: 'Encounters', label: 'Encounter / visit model', description: 'Structure clinical activity into visits with date, provider, services, notes, and linked orders/results.', kind: 'choice', defaultValue: 'Visit-centered clinical record', options: [{ value: 'Simple consultation record' }, { value: 'Visit-centered clinical record' }, { value: 'Encounter types + episode linkage' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.appointments', section: 'clinic', group: 'Scheduling', label: 'Appointments', description: 'Support clinic appointment scheduling alongside walk-ins.', kind: 'choice', defaultValue: 'Appointments + walk-ins', options: [{ value: 'Walk-ins only' }, { value: 'Appointments only' }, { value: 'Appointments + walk-ins' }, { value: 'Appointments + queue/check-in' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.vitals', section: 'clinic', group: 'Clinical workflow', label: 'Vital signs', description: 'Capture structured vitals early in the encounter with timestamps and responsible staff.', kind: 'choice', defaultValue: 'Structured vital signs', options: [{ value: 'Off' }, { value: 'Structured vital signs' }, { value: 'Structured + trend view' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.chiefComplaint', section: 'clinic', group: 'Clinical workflow', label: 'Chief complaint / reason for visit', description: 'Capture the primary reason for the encounter before deeper assessment.', kind: 'choice', defaultValue: 'Structured + free text', options: [{ value: 'Free text' }, { value: 'Structured + free text' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.assessment', section: 'clinic', group: 'Clinical workflow', label: 'Clinical assessment', description: 'Provide clinician assessment/documentation appropriate to the clinic scope.', kind: 'choice', defaultValue: 'Structured sections + narrative', options: [{ value: 'Narrative only' }, { value: 'Structured sections + narrative' }, { value: 'Templates + structured sections + narrative' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.diagnosis', section: 'clinic', group: 'Clinical workflow', label: 'Diagnosis / impression', description: 'Record assessment outcomes using free text, coded terminology, or both as appropriate.', kind: 'choice', defaultValue: 'Coded/searchable + narrative', options: [{ value: 'Free text' }, { value: 'Coded/searchable + narrative' }, { value: 'Multiple diagnoses + status' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.orders', section: 'clinic', group: 'Orders & results', label: 'Doctors / clinical orders', description: 'Create traceable orders for labs, procedures, medicines, referrals, or other services.', kind: 'choice', defaultValue: 'Structured orders + status', options: [{ value: 'Free-text order' }, { value: 'Structured orders + status' }, { value: 'Order sets + status + result linkage' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.labs', section: 'clinic', group: 'Orders & results', label: 'Laboratory requests & results', description: 'Track requested tests and resulting values/files linked to the encounter.', kind: 'choice', defaultValue: 'Requests + structured/file results', options: [{ value: 'Off' }, { value: 'Request tracking only' }, { value: 'Requests + structured/file results' }, { value: 'Result trends + reference context' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.medicines', section: 'clinic', group: 'Medication', label: 'Medicine requests / dispensing', description: 'Track medicine requests/allowances/dispensing and connect them to available stock where applicable.', kind: 'choice', defaultValue: 'Request + dispense tracking', options: [{ value: 'Medication note only' }, { value: 'Request + dispense tracking' }, { value: 'Request + approval + dispense tracking' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.prescriptions', section: 'clinic', group: 'Medication', label: 'Prescription record', description: 'Capture prescribed medicines, dosage instructions, and clinician attribution.', kind: 'choice', defaultValue: 'Structured prescription', options: [{ value: 'Free-text prescription' }, { value: 'Structured prescription' }, { value: 'Structured + printable prescription' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.referrals', section: 'clinic', group: 'Continuity', label: 'Referrals', description: 'Track referral destination, reason, schedule/status, and follow-up where relevant.', kind: 'choice', defaultValue: 'Referral + schedule/status', options: [{ value: 'Referral note only' }, { value: 'Referral + schedule/status' }, { value: 'Referral + follow-up outcome' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.services', section: 'clinic', group: 'Clinical workflow', label: 'Services availed / performed', description: 'Summarize services delivered during each visit for clinical/operational reporting.', kind: 'choice', defaultValue: 'Structured service list per visit', options: [{ value: 'Free-text summary' }, { value: 'Structured service list per visit' }, { value: 'Service requests + completion status' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.vaccines', section: 'clinic', group: 'Continuity', label: 'Vaccination / immunization records', description: 'Track vaccine requests/administration details if part of the clinic scope.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Request/administration tracking' }, { value: 'Longitudinal immunization history' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.inventoryLink', section: 'clinic', group: 'Medication', label: 'Clinical inventory integration', description: 'Link medicine/supply dispensing to the inventory ledger without making clinical notes depend on stock UI.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Medicine/supply deduction on dispense' }, { value: 'Requests + reservation + dispense deduction' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.recordAccess', section: 'clinic', group: 'Privacy & access', label: 'Clinical record access scope', description: 'Restrict clinical information to staff with a care/operational need rather than treating every staff account equally.', kind: 'choice', defaultValue: 'Role + care/department scope', options: [{ value: 'Broad staff access' }, { value: 'Role-based access' }, { value: 'Role + care/department scope' }, { value: 'Highly granular record/field policy' }], dependsOn: { id: 'pack.clinic', equals: true } },
  { id: 'clinic.consent', section: 'clinic', group: 'Privacy & access', label: 'Consent / acknowledgements', description: 'Record relevant patient consent/acknowledgement artifacts where the clinic workflow requires them.', kind: 'choice', defaultValue: 'Configurable consent records', options: [{ value: 'Off' }, { value: 'Simple acknowledgement' }, { value: 'Configurable consent records' }, { value: 'Versioned consent + withdrawal history' }], dependsOn: { id: 'pack.clinic', equals: true } },

  // Portfolio & marketing
  { id: 'portfolio.projects', section: 'portfolio', group: 'Work showcase', label: 'Projects / work entries', description: 'Core structure for showcasing completed or ongoing work.', kind: 'choice', defaultValue: 'Selected work + full archive', options: [{ value: 'Selected work only' }, { value: 'Selected work + full archive' }, { value: 'Case-study driven portfolio' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.caseStudies', section: 'portfolio', group: 'Work showcase', label: 'Case studies', description: 'Depth of project detail beyond a title/card.', kind: 'choice', defaultValue: 'Structured project pages', options: [{ value: 'Short detail pages' }, { value: 'Structured project pages' }, { value: 'Deep case studies with process/results' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.media', section: 'portfolio', group: 'Work showcase', label: 'Project media', description: 'Screenshots, videos, diagrams, or other visual proof of work.', kind: 'choice', defaultValue: 'Curated screenshots/media', options: [{ value: 'Minimal / optional media' }, { value: 'Curated screenshots/media' }, { value: 'Rich galleries/video' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.links', section: 'portfolio', group: 'Work showcase', label: 'Live / repository links', description: 'Expose live product and source links selectively, depending on project privacy and usefulness.', kind: 'choice', defaultValue: 'Per-project optional links', options: [{ value: 'No external links' }, { value: 'Per-project optional links' }, { value: 'Live + repository where available' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.services', section: 'portfolio', group: 'Professional profile', label: 'Services / capabilities', description: 'Present what the person/company can build or provide without turning the site into generic agency copy.', kind: 'choice', defaultValue: 'Concise capabilities', options: [{ value: 'Off' }, { value: 'Concise capabilities' }, { value: 'Detailed services with examples' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.about', section: 'portfolio', group: 'Professional profile', label: 'About/profile depth', description: 'How much personal/company context appears outside the project work itself.', kind: 'choice', defaultValue: 'Concise profile + working style', options: [{ value: 'Minimal bio' }, { value: 'Concise profile + working style' }, { value: 'Detailed story/credentials' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.resume', section: 'portfolio', group: 'Professional profile', label: 'Resume / CV', description: 'Whether visitors can view/download a resume or credential summary.', kind: 'choice', defaultValue: 'Download/view resume', options: [{ value: 'Off' }, { value: 'Download/view resume' }, { value: 'Interactive experience + downloadable resume' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.contact', section: 'portfolio', group: 'Conversion', label: 'Contact path', description: 'Primary way visitors can reach the owner/company.', kind: 'choice', defaultValue: 'Contact details + simple form', options: [{ value: 'Contact details only' }, { value: 'Contact details + simple form' }, { value: 'Project inquiry form' }, { value: 'Booking / calendar CTA' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.updates', section: 'portfolio', group: 'Content', label: 'Blog / notes / changelog', description: 'Ongoing content should exist only if there is a real intention to maintain it.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Occasional notes' }, { value: 'Blog/articles' }, { value: 'Build log/changelog' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.proof', section: 'portfolio', group: 'Trust', label: 'Proof / testimonials', description: 'How credibility is shown without fabricated social proof.', kind: 'choice', defaultValue: 'Real project evidence only', options: [{ value: 'Real project evidence only' }, { value: 'Verified testimonials + project evidence' }, { value: 'Client logos + verified testimonials + evidence' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.projectFilters', section: 'portfolio', group: 'Work showcase', label: 'Project filtering', description: 'Filter by type/technology/status only when the archive is large enough to need it.', kind: 'choice', defaultValue: 'Off', options: [{ value: 'Off' }, { value: 'Simple categories' }, { value: 'Category + technology filters' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.interactive', section: 'portfolio', group: 'Distinctive experience', label: 'Interactive experiments', description: 'Allow small signature interactions/tools that demonstrate personality or technical ability without obstructing navigation.', kind: 'choice', defaultValue: 'One restrained signature interaction', options: [{ value: 'Off' }, { value: 'One restrained signature interaction' }, { value: 'Dedicated experiments/lab area' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.metrics', section: 'portfolio', group: 'Trust', label: 'Project metrics / outcomes', description: 'Show measurable outcomes only when sourced from real project data and context.', kind: 'choice', defaultValue: 'Only verified/contextual metrics', options: [{ value: 'Off' }, { value: 'Only verified/contextual metrics' }, { value: 'Outcome metrics + methodology/context' }], dependsOn: { id: 'pack.portfolio', equals: true } },
  { id: 'portfolio.status', section: 'portfolio', group: 'Work showcase', label: 'Project status metadata', description: 'Show live/archived/in-development/internal status where it helps visitors interpret the work correctly.', kind: 'choice', defaultValue: 'Per-project status', options: [{ value: 'Off' }, { value: 'Per-project status' }, { value: 'Status + date/version metadata' }], dependsOn: { id: 'pack.portfolio', equals: true } },
]


const phase6Settings: ConfigSetting[] = [
  // Integration hub
  { id: 'integration.strategy', section: 'integrations', group: 'Connection posture', label: 'Integration strategy', description: 'How strongly implementation should separate product logic from third-party providers.', kind: 'choice', defaultValue: 'Provider-neutral adapters', options: [{ value: 'Direct provider integrations' }, { value: 'Provider-neutral adapters' }, { value: 'Integration service layer' }], appDefaults: { 'Portfolio / Marketing': 'Direct provider integrations', 'Government System': 'Provider-neutral adapters', 'Clinic / EMR': 'Provider-neutral adapters', 'SaaS / Client Portal': 'Integration service layer' }, profileDefaults: { Minimal: 'Direct provider integrations', Advanced: 'Integration service layer' } },
  { id: 'integration.failureUx', section: 'integrations', group: 'Connection posture', label: 'Third-party failure UX', description: 'Expected user experience when a connected provider is unavailable or slow.', kind: 'choice', defaultValue: 'Graceful fallback + retry', options: [{ value: 'Generic error' }, { value: 'Graceful fallback + retry' }, { value: 'Queue/recover + status detail' }], appDefaults: { 'Government System': 'Queue/recover + status detail', 'Clinic / EMR': 'Queue/recover + status detail', 'Inventory / POS': 'Queue/recover + status detail' }, profileDefaults: { Minimal: 'Graceful fallback + retry', Advanced: 'Queue/recover + status detail' } },
  { id: 'integration.adminConfig', section: 'integrations', group: 'Connection posture', label: 'Integration administration', description: 'Where enabled integrations, health, credentials metadata, and disconnect actions are managed.', kind: 'choice', defaultValue: 'Admin settings', options: [{ value: 'Environment/config only' }, { value: 'Admin settings' }, { value: 'Admin settings + health center' }], appDefaults: { 'Portfolio / Marketing': 'Environment/config only', 'Government System': 'Admin settings + health center', 'SaaS / Client Portal': 'Admin settings + health center' }, profileDefaults: { Minimal: 'Environment/config only', Advanced: 'Admin settings + health center' } },
  { id: 'integration.health', section: 'integrations', group: 'Connection posture', label: 'Connection health visibility', description: 'Expose enough status to distinguish product errors from provider outages without leaking secrets.', kind: 'choice', defaultValue: 'Admin health status', options: [{ value: 'Off' }, { value: 'Admin health status' }, { value: 'Admin status + last success/failure' }], appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Admin status + last success/failure', 'Clinic / EMR': 'Admin status + last success/failure' }, profileDefaults: { Minimal: 'Off', Advanced: 'Admin status + last success/failure' }, advanced: true },
  { id: 'integration.email', section: 'integrations', group: 'Communication channels', label: 'Email integration', description: 'Enable transactional or notification email behavior.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': true, 'SaaS / Client Portal': true, 'E-commerce': true, 'Directory / Marketplace': true, 'Government System': true, 'Clinic / EMR': true, 'Tournament / Event': true }, keywords: ['mail', 'smtp', 'resend', 'sendgrid', 'postmark'] },
  { id: 'integration.sms', section: 'integrations', group: 'Communication channels', label: 'SMS integration', description: 'Enable text-message notifications or verification where the value justifies cost and consent requirements.', kind: 'boolean', defaultValue: false, keywords: ['text', 'twilio', 'otp', 'phone'] },
  { id: 'integration.push', section: 'integrations', group: 'Communication channels', label: 'Push notifications', description: 'Enable browser/app push notifications for time-sensitive or recurring product events.', kind: 'boolean', defaultValue: false, appDefaults: { 'SaaS / Client Portal': false, 'Inventory / POS': false }, keywords: ['web push', 'firebase', 'fcm'] },
  { id: 'integration.calendar', section: 'integrations', group: 'Connected services', label: 'Calendar integration', description: 'Enable Google/Outlook/ICS-style calendar interoperability where schedules leave the product.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': false }, keywords: ['google calendar', 'outlook', 'ics', 'ical'] },
  { id: 'integration.maps', section: 'integrations', group: 'Connected services', label: 'Maps & geocoding', description: 'Enable map display, address lookup, geocoding, distance, or route integrations.', kind: 'boolean', defaultValue: false, appDefaults: { 'Directory / Marketplace': true }, keywords: ['map', 'geocode', 'location', 'mapbox', 'google maps', 'maplibre'] },
  { id: 'integration.storage', section: 'integrations', group: 'Connected services', label: 'External/cloud storage', description: 'Enable external object/document storage beyond the app server or primary database.', kind: 'boolean', defaultValue: false, appDefaults: { 'SaaS / Client Portal': true }, keywords: ['s3', 'r2', 'blob', 'drive', 'storage'] },
  { id: 'integration.collaboration', section: 'integrations', group: 'Connected services', label: 'Team chat / collaboration', description: 'Enable Slack, Teams, Discord, or similar operational notifications/actions.', kind: 'boolean', defaultValue: false, appDefaults: { 'Internal / Operations': false }, keywords: ['slack', 'teams', 'discord', 'chat'] },
  { id: 'integration.crm', section: 'integrations', group: 'Business systems', label: 'CRM / customer-system sync', description: 'Enable synchronization with a CRM or external customer-record system.', kind: 'boolean', defaultValue: false, appDefaults: { 'SaaS / Client Portal': false }, keywords: ['crm', 'hubspot', 'salesforce', 'customer sync'] },
  { id: 'integration.accounting', section: 'integrations', group: 'Business systems', label: 'Accounting / finance sync', description: 'Enable transaction/invoice synchronization to an accounting or finance system.', kind: 'boolean', defaultValue: false, appDefaults: { 'E-commerce': false, 'Inventory / POS': false }, keywords: ['accounting', 'quickbooks', 'xero', 'invoice sync'] },
  { id: 'integration.externalAutomation', section: 'integrations', group: 'Automation connections', label: 'External automation platform', description: 'Enable n8n, Make, Zapier, or a custom automation orchestrator for workflows better kept outside core product code.', kind: 'boolean', defaultValue: false, appDefaults: { 'Booking / Scheduling': false }, profileDefaults: { Minimal: false }, keywords: ['n8n', 'make', 'zapier', 'workflow'] },
  { id: 'ai.enabled', section: 'integrations', group: 'Intelligence', label: 'AI features', description: 'Enable the AI & intelligence section. Keep off unless AI solves a real workflow or information problem.', kind: 'boolean', defaultValue: false, keywords: ['llm', 'openai', 'anthropic', 'gemini', 'assistant', 'ai'] },

  // APIs
  { id: 'api.style', section: 'api', group: 'API contract', label: 'API style', description: 'Primary external/internal API shape when an API surface exists.', kind: 'choice', defaultValue: 'REST / resource-oriented', options: [{ value: 'REST / resource-oriented' }, { value: 'GraphQL' }, { value: 'RPC / action-oriented' }, { value: 'Mixed by use case' }], dependsOn: { id: 'platform.api', equals: ['Internal only', 'Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'REST / resource-oriented' } },
  { id: 'api.versioning', section: 'api', group: 'API contract', label: 'API versioning', description: 'How breaking changes are isolated once consumers exist.', kind: 'choice', defaultValue: 'Version only when external', options: [{ value: 'No explicit versioning' }, { value: 'Version only when external' }, { value: 'Explicit version from v1' }], dependsOn: { id: 'platform.api', equals: ['Internal only', 'Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'Explicit version from v1' }, profileDefaults: { Advanced: 'Explicit version from v1' } },
  { id: 'api.docs', section: 'api', group: 'API contract', label: 'API documentation', description: 'Documentation expected for the callable API contract.', kind: 'choice', defaultValue: 'Generated internal docs', options: [{ value: 'Code-only/internal' }, { value: 'Generated internal docs' }, { value: 'OpenAPI / consumer docs' }, { value: 'Developer portal' }], dependsOn: { id: 'platform.api', equals: ['Internal only', 'Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'OpenAPI / consumer docs' }, profileDefaults: { Minimal: 'Code-only/internal', Advanced: 'OpenAPI / consumer docs' } },
  { id: 'api.auth', section: 'api', group: 'Access', label: 'API authentication', description: 'Primary credential model for non-browser API callers.', kind: 'choice', defaultValue: 'Session/service auth by context', options: [{ value: 'Session/service auth by context' }, { value: 'API keys' }, { value: 'OAuth / delegated access' }, { value: 'Signed service credentials' }], dependsOn: { id: 'platform.api', equals: ['Internal only', 'Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'API keys', 'Government System': 'Signed service credentials' } },
  { id: 'api.scopes', section: 'api', group: 'Access', label: 'API scopes / permissions', description: 'Apply explicit scopes/permissions to machine or delegated credentials rather than granting full account access.', kind: 'choice', defaultValue: 'Reuse app permissions', options: [{ value: 'Reuse app permissions' }, { value: 'Explicit API scopes' }, { value: 'Resource + action scopes' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'Explicit API scopes' }, profileDefaults: { Advanced: 'Resource + action scopes' } },
  { id: 'api.keyLifecycle', section: 'api', group: 'Access', label: 'API-key lifecycle', description: 'Creation, display, rotation, revocation, and last-used metadata for API keys.', kind: 'choice', defaultValue: 'Create/revoke + last used', options: [{ value: 'Basic create/revoke' }, { value: 'Create/revoke + last used' }, { value: 'Rotation + expiry + last used' }], dependsOn: { id: 'api.auth', equals: 'API keys' }, profileDefaults: { Advanced: 'Rotation + expiry + last used' } },
  { id: 'api.pagination', section: 'api', group: 'Data access', label: 'API pagination', description: 'Bound collection responses so API consumers cannot accidentally request unbounded data.', kind: 'choice', defaultValue: 'Cursor or stable pagination', options: [{ value: 'Page/offset' }, { value: 'Cursor or stable pagination' }, { value: 'Endpoint-specific bounded pagination' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] } },
  { id: 'api.filtering', section: 'api', group: 'Data access', label: 'API filtering & sorting', description: 'Expose only deliberate, documented filter/sort fields rather than arbitrary query access.', kind: 'choice', defaultValue: 'Allowlisted fields', options: [{ value: 'Minimal fixed queries' }, { value: 'Allowlisted fields' }, { value: 'Rich documented query contract' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] } },
  { id: 'api.errors', section: 'api', group: 'Contract behavior', label: 'API error schema', description: 'Return stable machine-readable errors without exposing stack traces or sensitive internals.', kind: 'choice', defaultValue: 'Stable code + safe message', options: [{ value: 'HTTP status + message' }, { value: 'Stable code + safe message' }, { value: 'Structured errors + field details + trace ID' }], dependsOn: { id: 'platform.api', equals: ['Internal only', 'Partner API', 'Public API'] }, appDefaults: { 'Government System': 'Structured errors + field details + trace ID' }, profileDefaults: { Advanced: 'Structured errors + field details + trace ID' } },
  { id: 'api.idempotency', section: 'api', group: 'Contract behavior', label: 'Mutation idempotency', description: 'Protect retryable create/payment/action endpoints from duplicate side effects.', kind: 'choice', defaultValue: 'Critical mutations only', options: [{ value: 'Off' }, { value: 'Critical mutations only' }, { value: 'All retryable mutations' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] }, appDefaults: { 'E-commerce': 'All retryable mutations', 'Booking / Scheduling': 'All retryable mutations' }, profileDefaults: { Advanced: 'All retryable mutations' } },
  { id: 'api.ratePolicy', section: 'api', group: 'Abuse & capacity', label: 'API rate limits', description: 'Protect availability and cost while allowing legitimate integration bursts.', kind: 'choice', defaultValue: 'Per credential + endpoint class', options: [{ value: 'Global only' }, { value: 'Per credential + endpoint class' }, { value: 'Tiered quotas + burst allowance' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] }, appDefaults: { 'SaaS / Client Portal': 'Tiered quotas + burst allowance' } },
  { id: 'api.quotaHeaders', section: 'api', group: 'Abuse & capacity', label: 'Rate-limit feedback', description: 'Tell API consumers enough about retry timing/limits to recover without hammering the service.', kind: 'choice', defaultValue: 'Retry guidance', options: [{ value: 'Status only' }, { value: 'Retry guidance' }, { value: 'Limit/remaining/reset metadata' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] }, advanced: true },
  { id: 'api.cors', section: 'api', group: 'Browser/API boundary', label: 'CORS policy', description: 'Cross-origin browser access should be explicit and allowlisted rather than broadly open.', kind: 'choice', defaultValue: 'Explicit allowed origins', options: [{ value: 'Same-origin only' }, { value: 'Explicit allowed origins' }, { value: 'Public cross-origin API' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] } },
  { id: 'api.deprecation', section: 'api', group: 'Lifecycle', label: 'API deprecation policy', description: 'How external consumers learn about and migrate from deprecated contracts.', kind: 'choice', defaultValue: 'Documented notice window', options: [{ value: 'Ad hoc' }, { value: 'Documented notice window' }, { value: 'Version lifecycle + migration guide' }], dependsOn: { id: 'platform.api', equals: ['Partner API', 'Public API'] }, advanced: true },

  // Webhooks
  { id: 'webhook.catalog', section: 'api', group: 'Webhooks', label: 'Webhook event catalog', description: 'Name and version meaningful business events instead of exposing arbitrary database changes.', kind: 'choice', defaultValue: 'Curated business events', options: [{ value: 'Minimal key events' }, { value: 'Curated business events' }, { value: 'Versioned event catalog' }], dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] }, profileDefaults: { Advanced: 'Versioned event catalog' } },
  { id: 'webhook.signing', section: 'api', group: 'Webhook security', label: 'Outgoing webhook signing', description: 'Sign outgoing deliveries so consumers can verify authenticity and integrity.', kind: 'choice', defaultValue: 'HMAC signature + timestamp', options: [{ value: 'Unsigned' }, { value: 'Shared token' }, { value: 'HMAC signature + timestamp' }], dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] } },
  { id: 'webhook.verifyIncoming', section: 'api', group: 'Webhook security', label: 'Verify incoming webhook signatures', description: 'Verify provider signatures/tokens before accepting incoming webhook side effects.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'platform.webhooks', equals: ['Incoming', 'Incoming + outgoing'] } },
  { id: 'webhook.replayWindow', section: 'api', group: 'Webhook security', label: 'Replay protection', description: 'Use timestamps/nonces/event IDs to reject stale or replayed incoming webhook requests.', kind: 'choice', defaultValue: 'Timestamp + event dedupe', options: [{ value: 'Event ID dedupe only' }, { value: 'Timestamp + event dedupe' }, { value: 'Provider-specific strongest verification' }], dependsOn: { id: 'platform.webhooks', equals: ['Incoming', 'Incoming + outgoing'] }, appDefaults: { 'E-commerce': 'Provider-specific strongest verification' } },
  { id: 'webhook.secretRotation', section: 'api', group: 'Webhook security', label: 'Webhook secret rotation', description: 'Allow safe key/secret rotation without dropping deliveries during the transition.', kind: 'choice', defaultValue: 'Manual rotation with overlap', options: [{ value: 'Replace immediately' }, { value: 'Manual rotation with overlap' }, { value: 'Managed dual-secret rotation' }], dependsOn: { id: 'platform.webhooks', equals: ['Incoming', 'Outgoing', 'Incoming + outgoing'] }, advanced: true },
  { id: 'webhook.retry', section: 'api', group: 'Delivery reliability', label: 'Outgoing delivery retry', description: 'Retry transient webhook failures with bounded backoff instead of dropping events immediately.', kind: 'choice', defaultValue: 'Exponential backoff', options: [{ value: 'No retry' }, { value: 'Fixed limited retry' }, { value: 'Exponential backoff' }, { value: 'Backoff + dead-letter state' }], dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] }, appDefaults: { 'SaaS / Client Portal': 'Backoff + dead-letter state' }, profileDefaults: { Advanced: 'Backoff + dead-letter state' } },
  { id: 'webhook.deliveryLog', section: 'api', group: 'Delivery reliability', label: 'Webhook delivery history', description: 'Show event, endpoint, attempt, response class, and final status without exposing secrets.', kind: 'choice', defaultValue: 'Admin delivery log', options: [{ value: 'Error log only' }, { value: 'Admin delivery log' }, { value: 'Detailed attempts + payload preview/redaction' }], dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] }, profileDefaults: { Advanced: 'Detailed attempts + payload preview/redaction' } },
  { id: 'webhook.resend', section: 'api', group: 'Delivery reliability', label: 'Manual webhook resend', description: 'Allow authorized operators to retry a failed delivery safely without generating a new business event.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] } },
  { id: 'webhook.idempotency', section: 'api', group: 'Delivery reliability', label: 'Incoming event idempotency', description: 'Repeated provider deliveries must resolve to the same result instead of duplicating side effects.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'platform.webhooks', equals: ['Incoming', 'Incoming + outgoing'] } },
  { id: 'webhook.disableFailing', section: 'api', group: 'Delivery reliability', label: 'Repeated-failure endpoint policy', description: 'Stop or quarantine endpoints that repeatedly fail so queues cannot grow without bound.', kind: 'choice', defaultValue: 'Alert + temporary pause', options: [{ value: 'Keep retrying' }, { value: 'Alert + temporary pause' }, { value: 'Quarantine + manual resume' }], dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] }, advanced: true },
  { id: 'webhook.testDelivery', section: 'api', group: 'Developer experience', label: 'Test webhook delivery', description: 'Provide a safe test event or dry-run path for integration setup.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'platform.webhooks', equals: ['Outgoing', 'Incoming + outgoing'] } },

  // Email
  { id: 'email.mode', section: 'channels', group: 'Email', label: 'Email purpose', description: 'Define whether email is transactional only or also used for product/marketing communication.', kind: 'choice', defaultValue: 'Transactional + operational', options: [{ value: 'Transactional only' }, { value: 'Transactional + operational' }, { value: 'Transactional + marketing' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'Government System': 'Transactional + operational', 'Clinic / EMR': 'Transactional + operational', 'E-commerce': 'Transactional + marketing' } },
  { id: 'email.provider', section: 'channels', group: 'Email', label: 'Email delivery strategy', description: 'Keep provider choice explicit but avoid coupling product behavior to one vendor unless intentionally simple.', kind: 'choice', defaultValue: 'Transactional email provider', options: [{ value: 'SMTP' }, { value: 'Transactional email provider' }, { value: 'Provider adapter / swappable' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'Government System': 'Provider adapter / swappable' }, profileDefaults: { Advanced: 'Provider adapter / swappable' } },
  { id: 'email.templates', section: 'channels', group: 'Email', label: 'Email templates', description: 'Control whether notifications are code-defined or editable/versioned templates.', kind: 'choice', defaultValue: 'Versioned code templates', options: [{ value: 'Inline/simple templates' }, { value: 'Versioned code templates' }, { value: 'Admin-managed templates' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Admin-managed templates' } },
  { id: 'email.branding', section: 'channels', group: 'Email', label: 'Email branding', description: 'How closely transactional email follows product/organization branding.', kind: 'choice', defaultValue: 'Branded transactional shell', options: [{ value: 'Plain functional email' }, { value: 'Branded transactional shell' }, { value: 'Per-organization branding' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Per-organization branding' } },
  { id: 'email.retry', section: 'channels', group: 'Email', label: 'Email failure handling', description: 'Retry transient delivery failures without blocking the user-facing transaction.', kind: 'choice', defaultValue: 'Async retry + log', options: [{ value: 'Best effort only' }, { value: 'Async retry + log' }, { value: 'Retry + operator failure queue' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'Government System': 'Retry + operator failure queue' }, profileDefaults: { Advanced: 'Retry + operator failure queue' } },
  { id: 'email.deliveryLog', section: 'channels', group: 'Email', label: 'Email delivery log', description: 'Track queued/sent/failed state and message category without unnecessarily retaining message bodies.', kind: 'choice', defaultValue: 'Status + recipient + category', options: [{ value: 'Errors only' }, { value: 'Status + recipient + category' }, { value: 'Detailed provider events with redaction' }], dependsOn: { id: 'integration.email', equals: true }, advanced: true },
  { id: 'email.unsubscribe', section: 'channels', group: 'Email', label: 'Marketing unsubscribe', description: 'Give users a clear opt-out when nonessential/marketing email is enabled.', kind: 'choice', defaultValue: 'Per-category preferences', options: [{ value: 'Global unsubscribe' }, { value: 'Per-category preferences' }, { value: 'Preference center + suppression list' }], dependsOn: { id: 'email.mode', equals: 'Transactional + marketing' } },
  { id: 'email.sensitiveContent', section: 'channels', group: 'Email', label: 'Sensitive data in email', description: 'Limit sensitive information in message bodies because email may be forwarded, synced, or shown on lock screens.', kind: 'choice', defaultValue: 'Minimal details + secure link', options: [{ value: 'Full contextual details' }, { value: 'Minimal details + secure link' }, { value: 'Generic notification only' }], dependsOn: { id: 'integration.email', equals: true }, appDefaults: { 'Clinic / EMR': 'Generic notification only', 'Government System': 'Minimal details + secure link' } },

  // SMS
  { id: 'sms.purpose', section: 'channels', group: 'SMS', label: 'SMS purpose', description: 'Keep SMS focused on high-value events because it adds cost, consent, and delivery constraints.', kind: 'choice', defaultValue: 'Time-sensitive transactional', options: [{ value: 'Verification only' }, { value: 'Time-sensitive transactional' }, { value: 'Transactional + opted-in marketing' }], dependsOn: { id: 'integration.sms', equals: true } },
  { id: 'sms.consent', section: 'channels', group: 'SMS', label: 'SMS consent / opt-out', description: 'Persist consent and honor opt-out for nonessential SMS categories.', kind: 'choice', defaultValue: 'Category-aware consent', options: [{ value: 'Basic opt-out' }, { value: 'Category-aware consent' }, { value: 'Consent history + suppression' }], dependsOn: { id: 'integration.sms', equals: true } },
  { id: 'sms.retry', section: 'channels', group: 'SMS', label: 'SMS retry policy', description: 'Retry transient provider failures without sending repeated duplicate messages.', kind: 'choice', defaultValue: 'Limited retry + dedupe', options: [{ value: 'No retry' }, { value: 'Limited retry + dedupe' }, { value: 'Provider-aware retry + status' }], dependsOn: { id: 'integration.sms', equals: true } },
  { id: 'sms.costControl', section: 'channels', group: 'SMS', label: 'SMS cost control', description: 'Bound unexpected usage with category/rate/budget controls.', kind: 'choice', defaultValue: 'Per-user/event rate controls', options: [{ value: 'Provider account limit only' }, { value: 'Per-user/event rate controls' }, { value: 'Rate controls + monthly budget alert' }], dependsOn: { id: 'integration.sms', equals: true }, advanced: true },
  { id: 'sms.sensitiveContent', section: 'channels', group: 'SMS', label: 'Sensitive data in SMS', description: 'Keep SMS content minimal because messages can appear on lock screens and carrier systems.', kind: 'choice', defaultValue: 'Generic notification + secure link', options: [{ value: 'Contextual details' }, { value: 'Generic notification + secure link' }, { value: 'No sensitive workflow SMS' }], dependsOn: { id: 'integration.sms', equals: true }, appDefaults: { 'Clinic / EMR': 'No sensitive workflow SMS' } },

  // Push
  { id: 'push.permissionTiming', section: 'channels', group: 'Push', label: 'Push permission timing', description: 'Ask for notification permission only after the user understands the concrete value.', kind: 'choice', defaultValue: 'Contextual opt-in', options: [{ value: 'Ask on first visit' }, { value: 'Contextual opt-in' }, { value: 'Settings-only opt-in' }], dependsOn: { id: 'integration.push', equals: true } },
  { id: 'push.categories', section: 'channels', group: 'Push', label: 'Push categories', description: 'Let users control meaningful notification categories instead of all-or-nothing noise.', kind: 'choice', defaultValue: 'Essential + optional categories', options: [{ value: 'Single toggle' }, { value: 'Essential + optional categories' }, { value: 'Detailed per-event preferences' }], dependsOn: { id: 'integration.push', equals: true } },
  { id: 'push.deepLinks', section: 'channels', group: 'Push', label: 'Push deep links', description: 'Open the exact relevant record/action when a notification is tapped, with normal authorization checks.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'integration.push', equals: true } },
  { id: 'push.quietHours', section: 'channels', group: 'Push', label: 'Push quiet hours', description: 'Respect user/organization quiet hours except for explicitly critical categories.', kind: 'choice', defaultValue: 'User-configurable', options: [{ value: 'Off' }, { value: 'User-configurable' }, { value: 'User + organization policy' }], dependsOn: { id: 'integration.push', equals: true } },
  { id: 'push.tokenCleanup', section: 'channels', group: 'Push', label: 'Invalid device-token cleanup', description: 'Remove expired/invalid push subscriptions so repeated failures do not accumulate.', kind: 'choice', defaultValue: 'Automatic on provider feedback', options: [{ value: 'Manual cleanup' }, { value: 'Automatic on provider feedback' }, { value: 'Automatic + device management UI' }], dependsOn: { id: 'integration.push', equals: true }, advanced: true },

  // Calendar
  { id: 'calendar.mode', section: 'channels', group: 'Calendar', label: 'Calendar sync mode', description: 'How product schedules exchange data with external calendars.', kind: 'choice', defaultValue: 'One-way product → calendar', options: [{ value: 'ICS/export only' }, { value: 'One-way product → calendar' }, { value: 'Two-way synchronization' }], dependsOn: { id: 'integration.calendar', equals: true }, appDefaults: { 'Booking / Scheduling': 'One-way product → calendar' } },
  { id: 'calendar.providers', section: 'channels', group: 'Calendar', label: 'Calendar provider scope', description: 'Expected external calendar interoperability.', kind: 'choice', defaultValue: 'Google + Outlook + ICS fallback', options: [{ value: 'ICS only' }, { value: 'Google only' }, { value: 'Google + Outlook' }, { value: 'Google + Outlook + ICS fallback' }], dependsOn: { id: 'integration.calendar', equals: true } },
  { id: 'calendar.sourceOfTruth', section: 'channels', group: 'Calendar', label: 'Schedule source of truth', description: 'Define which system wins when synchronized calendar data conflicts.', kind: 'choice', defaultValue: 'Product owns bookable availability', options: [{ value: 'Product owns bookable availability' }, { value: 'External calendar blocks availability' }, { value: 'Two-way conflict resolution' }], dependsOn: { id: 'integration.calendar', equals: true } },
  { id: 'calendar.externalPrivacy', section: 'channels', group: 'Calendar', label: 'External event detail', description: 'Limit what private/customer information is copied into third-party calendar event titles/descriptions.', kind: 'choice', defaultValue: 'Minimal safe details', options: [{ value: 'Full booking/context details' }, { value: 'Minimal safe details' }, { value: 'Generic busy block' }], dependsOn: { id: 'integration.calendar', equals: true }, appDefaults: { 'Clinic / EMR': 'Generic busy block' } },
  { id: 'calendar.timezone', section: 'channels', group: 'Calendar', label: 'Calendar timezone handling', description: 'Store authoritative instants and render/sync in explicit user/resource time zones.', kind: 'choice', defaultValue: 'Explicit user/resource timezone', options: [{ value: 'Single app timezone' }, { value: 'Explicit user/resource timezone' }, { value: 'Multi-timezone with DST tests' }], dependsOn: { id: 'integration.calendar', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Multi-timezone with DST tests' } },
  { id: 'calendar.disconnect', section: 'channels', group: 'Calendar', label: 'Disconnect behavior', description: 'Define whether disconnecting a provider removes external events, keeps them, or only stops future sync.', kind: 'choice', defaultValue: 'Stop future sync; preserve history', options: [{ value: 'Stop future sync only' }, { value: 'Stop future sync; preserve history' }, { value: 'Guided cleanup choice' }], dependsOn: { id: 'integration.calendar', equals: true }, advanced: true },

  // Maps
  { id: 'maps.capability', section: 'channels', group: 'Maps & location', label: 'Map capability', description: 'Primary reason location services exist.', kind: 'choice', defaultValue: 'Map + geocoding', options: [{ value: 'Static map only' }, { value: 'Map + geocoding' }, { value: 'Nearby/distance search' }, { value: 'Routing / directions' }], dependsOn: { id: 'integration.maps', equals: true }, appDefaults: { 'Directory / Marketplace': 'Nearby/distance search' } },
  { id: 'maps.locationPrecision', section: 'channels', group: 'Maps & location', label: 'User location precision', description: 'Request only the precision necessary for the feature.', kind: 'choice', defaultValue: 'Approximate until precision is needed', options: [{ value: 'No user location' }, { value: 'Approximate until precision is needed' }, { value: 'Precise location for explicit task' }], dependsOn: { id: 'integration.maps', equals: true } },
  { id: 'maps.permissionTiming', section: 'channels', group: 'Maps & location', label: 'Location permission timing', description: 'Ask for browser/device location only when the user invokes a location-dependent feature.', kind: 'choice', defaultValue: 'On explicit action', options: [{ value: 'On page load' }, { value: 'On explicit action' }, { value: 'Use coarse/manual location first' }], dependsOn: { id: 'integration.maps', equals: true } },
  { id: 'maps.geocodeCache', section: 'channels', group: 'Maps & location', label: 'Geocoding cache', description: 'Avoid repeated paid/slow geocoding calls when provider terms and data freshness allow it.', kind: 'choice', defaultValue: 'Cache stable address results', options: [{ value: 'No cache' }, { value: 'Cache stable address results' }, { value: 'Cache + refresh policy' }], dependsOn: { id: 'integration.maps', equals: true }, advanced: true },
  { id: 'maps.providerAbstraction', section: 'channels', group: 'Maps & location', label: 'Map provider coupling', description: 'Choose whether map/search logic assumes one provider or uses an adapter boundary.', kind: 'choice', defaultValue: 'Provider-neutral location model', options: [{ value: 'Single provider directly' }, { value: 'Provider-neutral location model' }, { value: 'Swappable provider adapter' }], dependsOn: { id: 'integration.maps', equals: true } },

  // Storage
  { id: 'storage.model', section: 'channels', group: 'External storage', label: 'Storage model', description: 'How files are stored outside the primary application process.', kind: 'choice', defaultValue: 'Private object storage', options: [{ value: 'Public object storage' }, { value: 'Private object storage' }, { value: 'Private storage + document connector' }], dependsOn: { id: 'integration.storage', equals: true }, appDefaults: { 'Government System': 'Private storage + document connector', 'Clinic / EMR': 'Private object storage' } },
  { id: 'storage.access', section: 'channels', group: 'External storage', label: 'File access delivery', description: 'Serve protected files through authorized application checks or short-lived signed access.', kind: 'choice', defaultValue: 'Short-lived signed URLs', options: [{ value: 'Permanent public URLs' }, { value: 'Short-lived signed URLs' }, { value: 'App-proxied authorized downloads' }], dependsOn: { id: 'integration.storage', equals: true }, appDefaults: { 'Clinic / EMR': 'App-proxied authorized downloads', 'Government System': 'App-proxied authorized downloads' } },
  { id: 'storage.pathPrivacy', section: 'channels', group: 'External storage', label: 'Storage path privacy', description: 'Avoid meaningful PII/secret values in object keys and externally visible file paths.', kind: 'choice', defaultValue: 'Opaque generated keys', options: [{ value: 'Human-readable paths' }, { value: 'Opaque generated keys' }, { value: 'Opaque keys + metadata index' }], dependsOn: { id: 'integration.storage', equals: true } },
  { id: 'storage.providerFailure', section: 'channels', group: 'External storage', label: 'Storage outage behavior', description: 'Define what users can still do when storage is temporarily unavailable.', kind: 'choice', defaultValue: 'Keep records usable; retry file action', options: [{ value: 'Block entire record flow' }, { value: 'Keep records usable; retry file action' }, { value: 'Queue uploads + surface pending state' }], dependsOn: { id: 'integration.storage', equals: true }, appDefaults: { 'Government System': 'Queue uploads + surface pending state' } },

  // Collaboration connectors
  { id: 'collab.channelMode', section: 'channels', group: 'Team collaboration', label: 'Collaboration connector mode', description: 'How operational events reach Slack/Teams/Discord-like tools.', kind: 'choice', defaultValue: 'Outbound notifications', options: [{ value: 'Outbound notifications' }, { value: 'Notifications + deep links' }, { value: 'Interactive commands/actions' }], dependsOn: { id: 'integration.collaboration', equals: true } },
  { id: 'collab.eventScope', section: 'channels', group: 'Team collaboration', label: 'Collaboration event scope', description: 'Avoid mirroring every event into chat; send only actionable or high-signal events.', kind: 'choice', defaultValue: 'Actionable events only', options: [{ value: 'Most activity' }, { value: 'Actionable events only' }, { value: 'Admin-configured subscriptions' }], dependsOn: { id: 'integration.collaboration', equals: true } },
  { id: 'collab.actionsAuth', section: 'channels', group: 'Team collaboration', label: 'Chat-triggered action authorization', description: 'Interactive chat actions must re-check product permissions instead of trusting channel membership.', kind: 'choice', defaultValue: 'Re-check app permissions', options: [{ value: 'Trust channel membership' }, { value: 'Re-check app permissions' }, { value: 'Require signed command + app permission' }], dependsOn: { id: 'collab.channelMode', equals: 'Interactive commands/actions' } },

  // CRM / accounting
  { id: 'crm.syncDirection', section: 'channels', group: 'CRM / customer systems', label: 'CRM sync direction', description: 'Define whether product data pushes out, pulls in, or synchronizes both ways.', kind: 'choice', defaultValue: 'Product → CRM', options: [{ value: 'Product → CRM' }, { value: 'CRM → product' }, { value: 'Two-way sync' }], dependsOn: { id: 'integration.crm', equals: true } },
  { id: 'crm.sourceOfTruth', section: 'channels', group: 'CRM / customer systems', label: 'CRM source of truth', description: 'Choose authoritative ownership per field/entity so two-way sync does not oscillate or overwrite good data.', kind: 'choice', defaultValue: 'Field-level ownership map', options: [{ value: 'Product wins' }, { value: 'CRM wins' }, { value: 'Field-level ownership map' }], dependsOn: { id: 'integration.crm', equals: true } },
  { id: 'crm.mapping', section: 'channels', group: 'CRM / customer systems', label: 'CRM field mapping', description: 'Keep external field mappings explicit and reviewable rather than buried in transformation code.', kind: 'choice', defaultValue: 'Configured mapping', options: [{ value: 'Hardcoded mapping' }, { value: 'Configured mapping' }, { value: 'Admin-managed mapping' }], dependsOn: { id: 'integration.crm', equals: true } },
  { id: 'crm.reconciliation', section: 'channels', group: 'CRM / customer systems', label: 'CRM sync reconciliation', description: 'Surface failed/conflicting sync records for retry or operator resolution.', kind: 'choice', defaultValue: 'Retry + failed-sync queue', options: [{ value: 'Log only' }, { value: 'Retry + failed-sync queue' }, { value: 'Retry + conflict resolution UI' }], dependsOn: { id: 'integration.crm', equals: true }, advanced: true },
  { id: 'accounting.syncDirection', section: 'channels', group: 'Accounting / finance', label: 'Accounting sync direction', description: 'Usually product transactions/invoices are exported while accounting remains authoritative for ledger treatment.', kind: 'choice', defaultValue: 'Product → accounting', options: [{ value: 'Product → accounting' }, { value: 'Accounting → product' }, { value: 'Two-way selected records' }], dependsOn: { id: 'integration.accounting', equals: true } },
  { id: 'accounting.postingState', section: 'channels', group: 'Accounting / finance', label: 'Accounting posting timing', description: 'Define which product state is safe to sync as an accounting transaction.', kind: 'choice', defaultValue: 'Confirmed/settled transactions only', options: [{ value: 'On order/booking creation' }, { value: 'On payment confirmation' }, { value: 'Confirmed/settled transactions only' }], dependsOn: { id: 'integration.accounting', equals: true } },
  { id: 'accounting.reconciliation', section: 'channels', group: 'Accounting / finance', label: 'Accounting reconciliation', description: 'Track external IDs/status and surface mismatches instead of assuming every sync succeeded.', kind: 'choice', defaultValue: 'External IDs + mismatch report', options: [{ value: 'External ID only' }, { value: 'External IDs + mismatch report' }, { value: 'Scheduled reconciliation workflow' }], dependsOn: { id: 'integration.accounting', equals: true }, advanced: true },

  // External automation and built-in automation
  { id: 'automation.provider', section: 'automation', group: 'External automation', label: 'Automation platform', description: 'Preferred external orchestrator when the external automation family is enabled.', kind: 'choice', defaultValue: 'n8n', options: [{ value: 'n8n' }, { value: 'Make' }, { value: 'Zapier' }, { value: 'Custom orchestrator' }, { value: 'Provider-neutral webhooks/API' }], dependsOn: { id: 'integration.externalAutomation', equals: true }, keywords: ['n8n', 'make', 'zapier'] },
  { id: 'automation.ownership', section: 'automation', group: 'Architecture', label: 'Workflow ownership', description: 'Keep critical invariants in product code while delegating replaceable orchestration to external automation.', kind: 'choice', defaultValue: 'Core invariants in app; orchestration external', options: [{ value: 'Mostly external workflows' }, { value: 'Core invariants in app; orchestration external' }, { value: 'Mostly built-in automation' }], dependsOn: { id: 'platform.automation', equals: ['Automation-ready', 'Built-in rules', 'External automation first'] }, appDefaults: { 'Government System': 'Core invariants in app; orchestration external', 'Booking / Scheduling': 'Core invariants in app; orchestration external' } },
  { id: 'automation.triggers', section: 'automation', group: 'Rules', label: 'Automation triggers', description: 'Trigger families the system should support without inventing separate one-off mechanisms.', kind: 'choice', defaultValue: 'Events + schedules + manual', options: [{ value: 'Events only' }, { value: 'Events + schedules' }, { value: 'Events + schedules + manual' }, { value: 'Events + schedules + manual + webhook' }], dependsOn: { id: 'platform.automation', equals: ['Automation-ready', 'Built-in rules', 'External automation first'] }, appDefaults: { 'Booking / Scheduling': 'Events + schedules + manual + webhook' } },
  { id: 'automation.conditions', section: 'automation', group: 'Rules', label: 'Conditions & branching', description: 'Support explicit conditions/branches so automations do not require duplicated near-identical workflows.', kind: 'choice', defaultValue: 'Simple conditions', options: [{ value: 'No branching' }, { value: 'Simple conditions' }, { value: 'Nested conditions + branches' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, profileDefaults: { Advanced: 'Nested conditions + branches' } },
  { id: 'automation.delays', section: 'automation', group: 'Rules', label: 'Delay / wait steps', description: 'Allow scheduled waits for reminders/follow-ups without long-running request processes.', kind: 'choice', defaultValue: 'Scheduled delay', options: [{ value: 'Off' }, { value: 'Scheduled delay' }, { value: 'Delay + wait-until-condition' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] } },
  { id: 'automation.actions', section: 'automation', group: 'Rules', label: 'Automation action scope', description: 'Common action surface exposed to automation.', kind: 'choice', defaultValue: 'Notifications + safe record updates', options: [{ value: 'Notifications only' }, { value: 'Notifications + safe record updates' }, { value: 'Broad permission-aware actions' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, appDefaults: { 'Government System': 'Notifications + safe record updates' } },
  { id: 'automation.permissionModel', section: 'automation', group: 'Safety', label: 'Automation permissions', description: 'Automations should run under an explicit service/owner identity and never inherit unrestricted system power by accident.', kind: 'choice', defaultValue: 'Scoped service identity', options: [{ value: 'System-wide privileges' }, { value: 'Owner/user permissions' }, { value: 'Scoped service identity' }], dependsOn: { id: 'platform.automation', equals: ['Automation-ready', 'Built-in rules', 'External automation first'] } },
  { id: 'automation.approval', section: 'automation', group: 'Safety', label: 'Human approval for high-impact actions', description: 'Require review before automations perform consequential or irreversible actions.', kind: 'choice', defaultValue: 'High-impact actions only', options: [{ value: 'Off' }, { value: 'High-impact actions only' }, { value: 'Configurable per automation' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, appDefaults: { 'Government System': 'Configurable per automation', 'Clinic / EMR': 'Configurable per automation' } },
  { id: 'automation.dryRun', section: 'automation', group: 'Safety', label: 'Automation test / dry-run', description: 'Preview trigger matching and actions before enabling a workflow on production data.', kind: 'choice', defaultValue: 'Test with sample event', options: [{ value: 'Off' }, { value: 'Test with sample event' }, { value: 'Dry-run + action preview' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, profileDefaults: { Advanced: 'Dry-run + action preview' } },
  { id: 'automation.dedupe', section: 'automation', group: 'Reliability', label: 'Automation event deduplication', description: 'Avoid duplicate side effects when the same trigger/event is delivered or retried more than once.', kind: 'choice', defaultValue: 'Idempotency for side-effecting runs', options: [{ value: 'Off' }, { value: 'Basic event dedupe' }, { value: 'Idempotency for side-effecting runs' }], dependsOn: { id: 'platform.automation', equals: ['Automation-ready', 'Built-in rules', 'External automation first'] } },
  { id: 'automation.retry', section: 'automation', group: 'Reliability', label: 'Automation retry', description: 'Retry transient external/provider failures with bounded backoff.', kind: 'choice', defaultValue: 'Backoff by action type', options: [{ value: 'No automatic retry' }, { value: 'Fixed retry' }, { value: 'Backoff by action type' }, { value: 'Backoff + dead-letter state' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, profileDefaults: { Advanced: 'Backoff + dead-letter state' } },
  { id: 'automation.failureNotification', section: 'automation', group: 'Reliability', label: 'Automation failure notification', description: 'Notify the right operator when an automation exhausts retries or needs human intervention.', kind: 'choice', defaultValue: 'Owner/admin on final failure', options: [{ value: 'Logs only' }, { value: 'Owner/admin on final failure' }, { value: 'Severity-routed operational alerts' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] } },
  { id: 'automation.runLog', section: 'automation', group: 'Operations', label: 'Automation run history', description: 'Record trigger, status, attempts, duration, action summary, and safe error detail.', kind: 'choice', defaultValue: 'Run history + action summary', options: [{ value: 'Failures only' }, { value: 'Run history + action summary' }, { value: 'Detailed trace with redaction' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, profileDefaults: { Advanced: 'Detailed trace with redaction' } },
  { id: 'automation.pause', section: 'automation', group: 'Operations', label: 'Pause / disable automation', description: 'Allow an operator to stop a problematic automation without deploying code.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] } },
  { id: 'automation.replay', section: 'automation', group: 'Operations', label: 'Replay failed runs', description: 'Allow authorized replay after fixing a dependency while preserving idempotency and audit context.', kind: 'choice', defaultValue: 'Manual retry failed run', options: [{ value: 'Off' }, { value: 'Manual retry failed run' }, { value: 'Replay from selected step/event' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, advanced: true },
  { id: 'automation.retention', section: 'automation', group: 'Operations', label: 'Automation history retention', description: 'Retain enough run history for debugging/audit without storing sensitive payloads indefinitely.', kind: 'choice', defaultValue: 'Operational retention window', options: [{ value: 'Short debug window' }, { value: 'Operational retention window' }, { value: 'Audit-aligned retention' }], dependsOn: { id: 'platform.automation', equals: ['Built-in rules', 'External automation first'] }, appDefaults: { 'Government System': 'Audit-aligned retention' }, advanced: true },
  { id: 'automation.credentials', section: 'automation', group: 'External automation', label: 'Automation credential handling', description: 'Keep provider/API credentials in protected server/orchestrator secret storage instead of workflow text or browser state.', kind: 'choice', defaultValue: 'Secret store / credential vault', options: [{ value: 'Workflow config values' }, { value: 'Environment secrets' }, { value: 'Secret store / credential vault' }], dependsOn: { id: 'integration.externalAutomation', equals: true } },
  { id: 'automation.contracts', section: 'automation', group: 'External automation', label: 'Automation payload contracts', description: 'Version/document webhook/API payloads consumed by external workflows so app changes do not silently break automation.', kind: 'choice', defaultValue: 'Documented stable payloads', options: [{ value: 'Ad hoc payloads' }, { value: 'Documented stable payloads' }, { value: 'Versioned contracts + compatibility tests' }], dependsOn: { id: 'integration.externalAutomation', equals: true }, profileDefaults: { Advanced: 'Versioned contracts + compatibility tests' } },

  // Background jobs
  { id: 'jobs.enabled', section: 'automation', group: 'Background jobs', label: 'Background job queue', description: 'Move slow/retryable work out of request/response flows when users should not wait synchronously.', kind: 'choice', defaultValue: 'As needed for slow/retryable work', options: [{ value: 'Off' }, { value: 'As needed for slow/retryable work' }, { value: 'Dedicated queue/workers' }], dependsOn: { id: 'platform.automation', equals: ['Automation-ready', 'Built-in rules', 'External automation first'] }, appDefaults: { 'Government System': 'Dedicated queue/workers', 'SaaS / Client Portal': 'Dedicated queue/workers' }, profileDefaults: { Minimal: 'Off', Advanced: 'Dedicated queue/workers' } },
  { id: 'jobs.longTaskUx', section: 'automation', group: 'Background jobs', label: 'Long-running task UX', description: 'For user-triggered background work, show accepted/running/succeeded/failed state instead of a frozen button.', kind: 'choice', defaultValue: 'Status + completion notice', options: [{ value: 'Spinner until done' }, { value: 'Status + completion notice' }, { value: 'Persistent job status + retry/download' }], dependsOn: { id: 'jobs.enabled', equals: ['As needed for slow/retryable work', 'Dedicated queue/workers'] } },
  { id: 'jobs.retry', section: 'automation', group: 'Background jobs', label: 'Job retry policy', description: 'Retry transient failures with a bounded strategy and classify permanent failures.', kind: 'choice', defaultValue: 'Exponential backoff', options: [{ value: 'No retry' }, { value: 'Fixed retry' }, { value: 'Exponential backoff' }, { value: 'Per-job retry policy' }], dependsOn: { id: 'jobs.enabled', equals: ['As needed for slow/retryable work', 'Dedicated queue/workers'] }, profileDefaults: { Advanced: 'Per-job retry policy' } },
  { id: 'jobs.deadLetter', section: 'automation', group: 'Background jobs', label: 'Dead-letter / failed job state', description: 'Preserve exhausted jobs for inspection/retry instead of silently discarding them.', kind: 'choice', defaultValue: 'Failed queue/state', options: [{ value: 'Log only' }, { value: 'Failed queue/state' }, { value: 'Failed queue + operator actions' }], dependsOn: { id: 'jobs.enabled', equals: 'Dedicated queue/workers' }, profileDefaults: { Advanced: 'Failed queue + operator actions' } },
  { id: 'jobs.concurrency', section: 'automation', group: 'Background jobs', label: 'Job concurrency controls', description: 'Prevent workers from overloading providers/resources or racing on the same logical record.', kind: 'choice', defaultValue: 'Global + provider limits', options: [{ value: 'Worker count only' }, { value: 'Global + provider limits' }, { value: 'Global + provider + per-key locking' }], dependsOn: { id: 'jobs.enabled', equals: 'Dedicated queue/workers' }, advanced: true },
  { id: 'jobs.cronTimezone', section: 'automation', group: 'Scheduled jobs', label: 'Scheduled-job timezone', description: 'Make schedule timezone/DST behavior explicit rather than relying on server local time.', kind: 'choice', defaultValue: 'Explicit application timezone', options: [{ value: 'Server timezone' }, { value: 'UTC only' }, { value: 'Explicit application timezone' }, { value: 'Per-organization timezone' }], dependsOn: { id: 'automation.triggers', equals: ['Events + schedules', 'Events + schedules + manual', 'Events + schedules + manual + webhook'] }, appDefaults: { 'SaaS / Client Portal': 'Per-organization timezone' } },
  { id: 'jobs.monitoring', section: 'automation', group: 'Background jobs', label: 'Job monitoring', description: 'Track queue depth, age, failure rate, and worker health when background processing is operationally important.', kind: 'choice', defaultValue: 'Failures + queue health', options: [{ value: 'Logs only' }, { value: 'Failures + queue health' }, { value: 'Queue metrics + alert thresholds' }], dependsOn: { id: 'jobs.enabled', equals: 'Dedicated queue/workers' }, profileDefaults: { Advanced: 'Queue metrics + alert thresholds' } },

  // AI use cases
  { id: 'ai.assistant', section: 'ai', group: 'Use cases', label: 'Conversational assistant', description: 'User-facing chat/assistant for finding, explaining, or acting on product information.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.summarization', section: 'ai', group: 'Use cases', label: 'Summarization', description: 'Summarize documents, records, activity, or long text while preserving links to source material.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Internal / Operations': true, 'Government System': true } },
  { id: 'ai.extraction', section: 'ai', group: 'Use cases', label: 'Structured extraction', description: 'Extract defined fields/entities from text or documents into reviewable structured output.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Internal / Operations': true } },
  { id: 'ai.classification', section: 'ai', group: 'Use cases', label: 'Classification / tagging', description: 'Classify, categorize, or tag records with confidence-aware review behavior.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.drafting', section: 'ai', group: 'Use cases', label: 'Draft generation', description: 'Draft replies, remarks, descriptions, reports, or other content for human review.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Internal / Operations': true, 'Government System': true } },
  { id: 'ai.translation', section: 'ai', group: 'Use cases', label: 'AI translation', description: 'Translate content where machine translation is acceptable and review expectations are explicit.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.recommendations', section: 'ai', group: 'Use cases', label: 'Recommendations / next action', description: 'Suggest relevant records, next steps, or options without silently making consequential choices.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.semanticSearch', section: 'ai', group: 'Use cases', label: 'Semantic search / RAG', description: 'Search documents/records by meaning and ground answers in retrieved authorized sources.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Internal / Operations': true } },
  { id: 'ai.documentAnalysis', section: 'ai', group: 'Use cases', label: 'Document/image analysis', description: 'Analyze uploaded documents/images for extraction or assistance, subject to file/privacy rules.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.dataInsights', section: 'ai', group: 'Use cases', label: 'Data analysis / insights', description: 'Generate explanations, anomalies, or summaries from authorized structured product data.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.routing', section: 'ai', group: 'Use cases', label: 'AI-assisted routing / triage', description: 'Suggest assignments, categories, priorities, or workflows while respecting deterministic constraints.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Internal / Operations': true } },

  // AI architecture
  { id: 'ai.providerStrategy', section: 'ai', group: 'Provider & model', label: 'AI provider strategy', description: 'How tightly AI behavior couples to one model/provider.', kind: 'choice', defaultValue: 'Configurable provider/model', options: [{ value: 'Single fixed provider/model' }, { value: 'Configurable provider/model' }, { value: 'Provider adapter + fallback' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Provider adapter + fallback' }, profileDefaults: { Advanced: 'Provider adapter + fallback' } },
  { id: 'ai.modelRouting', section: 'ai', group: 'Provider & model', label: 'Model routing', description: 'Use the cheapest/smallest capable model by task rather than defaulting every request to the largest model.', kind: 'choice', defaultValue: 'One approved model per capability', options: [{ value: 'One model for everything' }, { value: 'One approved model per capability' }, { value: 'Task-based model routing' }], dependsOn: { id: 'ai.enabled', equals: true }, profileDefaults: { Advanced: 'Task-based model routing' } },
  { id: 'ai.serverSide', section: 'ai', group: 'Provider & model', label: 'AI calls from trusted server boundary', description: 'Keep provider secrets and privileged context out of browser/client code.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.temperaturePolicy', section: 'ai', group: 'Provider & model', label: 'Generation variability', description: 'Use lower variability for extraction/factual workflows and higher creativity only where appropriate.', kind: 'choice', defaultValue: 'Task-specific', options: [{ value: 'One global setting' }, { value: 'Task-specific' }, { value: 'Deterministic where possible' }], dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.structuredOutput', section: 'ai', group: 'Provider & model', label: 'Structured output enforcement', description: 'For machine-consumed AI output, validate against a schema instead of parsing free-form prose.', kind: 'choice', defaultValue: 'Schema for machine-consumed output', options: [{ value: 'Free-form parsing' }, { value: 'Schema for machine-consumed output' }, { value: 'Schema + validation/retry' }], dependsOn: { id: 'ai.enabled', equals: true }, profileDefaults: { Advanced: 'Schema + validation/retry' } },

  // AI grounding & truthfulness
  { id: 'ai.grounding', section: 'ai', group: 'Grounding & trust', label: 'Grounding policy', description: 'When answers depend on project data/documents, retrieve authorized sources rather than relying on model memory.', kind: 'choice', defaultValue: 'Ground factual product answers', options: [{ value: 'Model knowledge allowed broadly' }, { value: 'Ground factual product answers' }, { value: 'Source-grounded by default' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Source-grounded by default', 'Clinic / EMR': 'Source-grounded by default' } },
  { id: 'ai.citations', section: 'ai', group: 'Grounding & trust', label: 'Source citations / traceability', description: 'Show source records/documents for grounded answers so users can verify important claims.', kind: 'choice', defaultValue: 'Citations for document/data answers', options: [{ value: 'Off' }, { value: 'Citations for document/data answers' }, { value: 'Citations required for factual claims' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Citations required for factual claims', 'Clinic / EMR': 'Citations required for factual claims' } },
  { id: 'ai.uncertainty', section: 'ai', group: 'Grounding & trust', label: 'Uncertainty behavior', description: 'When evidence is missing/ambiguous, prefer explicit uncertainty or escalation instead of inventing an answer.', kind: 'choice', defaultValue: 'Say uncertain + suggest next step', options: [{ value: 'Always return best guess' }, { value: 'Say uncertain + suggest next step' }, { value: 'Refuse/route when confidence is insufficient' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Refuse/route when confidence is insufficient', 'Clinic / EMR': 'Refuse/route when confidence is insufficient' } },
  { id: 'ai.confidence', section: 'ai', group: 'Grounding & trust', label: 'Confidence threshold behavior', description: 'For classification/extraction/routing, define what happens when confidence is below a useful threshold.', kind: 'choice', defaultValue: 'Flag for human review', options: [{ value: 'Accept best result' }, { value: 'Flag for human review' }, { value: 'Route to manual queue' }], dependsOn: { id: 'ai.enabled', equals: true } },

  // AI privacy
  { id: 'ai.dataPolicy', section: 'ai', group: 'Privacy & data', label: 'AI data policy', description: 'Control what application/user data may be sent to external AI services.', kind: 'choice', defaultValue: 'Minimize/redact sensitive data', options: [{ value: 'Normal authorized data may be sent' }, { value: 'Minimize/redact sensitive data' }, { value: 'No sensitive data to external models' }, { value: 'Approved private/self-hosted AI only' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'No sensitive data to external models', 'Clinic / EMR': 'No sensitive data to external models' } },
  { id: 'ai.providerRetention', section: 'ai', group: 'Privacy & data', label: 'Provider retention / training posture', description: 'Prefer provider/API modes whose retention and training behavior match the application privacy requirement.', kind: 'choice', defaultValue: 'Business/API privacy controls required', options: [{ value: 'Provider default acceptable' }, { value: 'Business/API privacy controls required' }, { value: 'Zero/minimal retention contract required' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Zero/minimal retention contract required', 'Clinic / EMR': 'Zero/minimal retention contract required' } },
  { id: 'ai.promptLogging', section: 'ai', group: 'Privacy & data', label: 'Prompt/response logging', description: 'Balance debugging/evaluation needs against retention of private user or record content.', kind: 'choice', defaultValue: 'Metadata + redacted samples', options: [{ value: 'Full prompts/responses' }, { value: 'Metadata + redacted samples' }, { value: 'Metadata only' }, { value: 'No content logging' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Metadata only', 'Clinic / EMR': 'No content logging' } },
  { id: 'ai.userDisclosure', section: 'ai', group: 'Privacy & data', label: 'AI disclosure', description: 'Tell users when content/actions are AI-assisted where that context affects trust, review, or accountability.', kind: 'choice', defaultValue: 'Contextual disclosure', options: [{ value: 'No special disclosure' }, { value: 'Contextual disclosure' }, { value: 'Always label AI-generated output' }], dependsOn: { id: 'ai.enabled', equals: true } },

  // AI actions and safety
  { id: 'ai.actionMode', section: 'ai', group: 'Actions & approval', label: 'AI action authority', description: 'How much the model may change product state instead of only suggesting.', kind: 'choice', defaultValue: 'Suggest only', options: [{ value: 'Suggest only' }, { value: 'Human-confirmed actions' }, { value: 'Autonomous bounded actions' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Suggest only', 'Clinic / EMR': 'Suggest only' } },
  { id: 'ai.humanApproval', section: 'ai', group: 'Actions & approval', label: 'Human approval policy', description: 'Require confirmation for consequential AI-generated actions or outputs before they take effect.', kind: 'choice', defaultValue: 'Consequential actions always', options: [{ value: 'Off' }, { value: 'Consequential actions always' }, { value: 'Configurable per capability' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Consequential actions always', 'Clinic / EMR': 'Consequential actions always' } },
  { id: 'ai.permissionBoundary', section: 'ai', group: 'Actions & approval', label: 'AI permission boundary', description: 'AI tools/actions must obey the same user/tenant/record permissions as the requesting context.', kind: 'choice', defaultValue: 'Caller permissions + tool allowlist', options: [{ value: 'Broad service account' }, { value: 'Caller permissions' }, { value: 'Caller permissions + tool allowlist' }], dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.toolScope', section: 'ai', group: 'Actions & approval', label: 'AI tool scope', description: 'Bound which system tools/actions the model can invoke.', kind: 'choice', defaultValue: 'Read + limited reversible actions', options: [{ value: 'Read-only' }, { value: 'Read + limited reversible actions' }, { value: 'Broad permission-aware tools' }], dependsOn: { id: 'ai.actionMode', equals: ['Human-confirmed actions', 'Autonomous bounded actions'] }, appDefaults: { 'Government System': 'Read-only', 'Clinic / EMR': 'Read-only' } },
  { id: 'ai.promptInjection', section: 'ai', group: 'Actions & approval', label: 'Prompt-injection / untrusted-content handling', description: 'Treat retrieved/user-provided content as data, not trusted instructions, especially when tools/actions are available.', kind: 'choice', defaultValue: 'Instruction hierarchy + tool allowlist', options: [{ value: 'Basic prompt instruction' }, { value: 'Instruction hierarchy + tool allowlist' }, { value: 'Isolate untrusted content + policy checks' }], dependsOn: { id: 'ai.enabled', equals: true }, profileDefaults: { Advanced: 'Isolate untrusted content + policy checks' } },
  { id: 'ai.destructiveActions', section: 'ai', group: 'Actions & approval', label: 'AI destructive actions', description: 'Deletion, irreversible financial, credential, or other destructive actions should stay outside autonomous model control.', kind: 'choice', defaultValue: 'Never autonomous', options: [{ value: 'Allowed within permissions' }, { value: 'Human confirmation required' }, { value: 'Never autonomous' }], dependsOn: { id: 'ai.actionMode', equals: ['Human-confirmed actions', 'Autonomous bounded actions'] } },

  // AI cost/reliability
  { id: 'ai.costBudget', section: 'ai', group: 'Cost & capacity', label: 'AI cost budget', description: 'Set product-appropriate limits/alerts so one feature or user cannot create unbounded model cost.', kind: 'choice', defaultValue: 'Per-user/capability limits + alert', options: [{ value: 'Provider account limit only' }, { value: 'Per-user/capability limits + alert' }, { value: 'Budget + quotas + model routing' }], dependsOn: { id: 'ai.enabled', equals: true }, profileDefaults: { Advanced: 'Budget + quotas + model routing' } },
  { id: 'ai.rateLimit', section: 'ai', group: 'Cost & capacity', label: 'AI rate limiting', description: 'Protect provider capacity/cost and prevent accidental request loops.', kind: 'choice', defaultValue: 'Per user + capability', options: [{ value: 'Global only' }, { value: 'Per user + capability' }, { value: 'Per user + capability + organization quota' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'SaaS / Client Portal': 'Per user + capability + organization quota' } },
  { id: 'ai.cache', section: 'ai', group: 'Cost & capacity', label: 'AI result caching', description: 'Cache safe repeatable outputs only when data freshness/privacy semantics allow it.', kind: 'choice', defaultValue: 'Selective deterministic/grounded results', options: [{ value: 'Off' }, { value: 'Selective deterministic/grounded results' }, { value: 'Capability-specific cache policy' }], dependsOn: { id: 'ai.enabled', equals: true }, advanced: true },
  { id: 'ai.timeout', section: 'ai', group: 'Reliability', label: 'AI timeout UX', description: 'Avoid indefinite waits; provide clear retry/fallback when model requests are slow.', kind: 'choice', defaultValue: 'Bounded timeout + retry', options: [{ value: 'Wait until provider returns' }, { value: 'Bounded timeout + retry' }, { value: 'Async job + completion notification' }], dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.fallback', section: 'ai', group: 'Reliability', label: 'AI fallback behavior', description: 'Define what the product does when the model/provider is unavailable or refuses the request.', kind: 'choice', defaultValue: 'Graceful non-AI/manual path', options: [{ value: 'Feature unavailable' }, { value: 'Graceful non-AI/manual path' }, { value: 'Fallback provider/model + manual path' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Graceful non-AI/manual path', 'Clinic / EMR': 'Graceful non-AI/manual path' }, profileDefaults: { Advanced: 'Fallback provider/model + manual path' } },

  // AI quality
  { id: 'ai.feedback', section: 'ai', group: 'Evaluation & quality', label: 'AI user feedback', description: 'Collect lightweight useful/not-useful or correction feedback for improving prompts/workflows.', kind: 'choice', defaultValue: 'Simple useful/not useful', options: [{ value: 'Off' }, { value: 'Simple useful/not useful' }, { value: 'Feedback + reason/correction' }], dependsOn: { id: 'ai.enabled', equals: true } },
  { id: 'ai.promptVersioning', section: 'ai', group: 'Evaluation & quality', label: 'Prompt/config versioning', description: 'Track material prompt/model/config changes so output regressions can be traced.', kind: 'choice', defaultValue: 'Version production prompts/config', options: [{ value: 'No explicit versioning' }, { value: 'Version production prompts/config' }, { value: 'Version + changelog + rollback' }], dependsOn: { id: 'ai.enabled', equals: true }, profileDefaults: { Advanced: 'Version + changelog + rollback' } },
  { id: 'ai.evaluation', section: 'ai', group: 'Evaluation & quality', label: 'AI evaluation strategy', description: 'Test representative tasks and failure cases before prompt/model changes ship.', kind: 'choice', defaultValue: 'Curated regression cases', options: [{ value: 'Manual spot checks' }, { value: 'Curated regression cases' }, { value: 'Regression set + scored evaluations' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Regression set + scored evaluations', 'Clinic / EMR': 'Regression set + scored evaluations' }, profileDefaults: { Advanced: 'Regression set + scored evaluations' } },
  { id: 'ai.audit', section: 'ai', group: 'Evaluation & quality', label: 'AI action/audit trail', description: 'For important AI-assisted decisions/actions, retain actor, capability, model/config version, source references, and final human action.', kind: 'choice', defaultValue: 'Important actions/decisions', options: [{ value: 'Off' }, { value: 'Important actions/decisions' }, { value: 'Detailed AI interaction audit' }], dependsOn: { id: 'ai.enabled', equals: true }, appDefaults: { 'Government System': 'Detailed AI interaction audit', 'Clinic / EMR': 'Detailed AI interaction audit' } },
]

const phase7Settings: ConfigSetting[] = [
  // Security hardening
  { id: 'security.headers', section: 'security', group: 'Browser & transport', label: 'Security headers baseline', description: 'Apply a deliberate browser security-header baseline instead of relying on framework defaults.', kind: 'choice', defaultValue: 'Modern baseline', options: [{ value: 'Framework defaults' }, { value: 'Modern baseline' }, { value: 'Strict reviewed policy' }], appDefaults: { 'Government System': 'Strict reviewed policy', 'Clinic / EMR': 'Strict reviewed policy' }, profileDefaults: { Advanced: 'Strict reviewed policy' }, keywords: ['headers', 'security headers'] },
  { id: 'security.csp', section: 'security', group: 'Browser & transport', label: 'Content Security Policy', description: 'Constrain which scripts, styles, frames, and other resources the browser may execute or load.', kind: 'choice', defaultValue: 'Enforced nonce/hash policy', options: [{ value: 'Off' }, { value: 'Report-only first' }, { value: 'Enforced nonce/hash policy' }, { value: 'Strict-dynamic / reviewed policy' }], appDefaults: { 'Government System': 'Strict-dynamic / reviewed policy', 'Clinic / EMR': 'Strict-dynamic / reviewed policy' }, profileDefaults: { Minimal: 'Report-only first', Advanced: 'Strict-dynamic / reviewed policy' }, keywords: ['csp', 'content security policy'] },
  { id: 'security.framePolicy', section: 'security', group: 'Browser & transport', label: 'Embedding / clickjacking policy', description: 'Decide whether the application may be embedded in external frames and enforce the choice.', kind: 'choice', defaultValue: 'Deny external framing', options: [{ value: 'Allow framing' }, { value: 'Same-origin only' }, { value: 'Deny external framing' }, { value: 'Explicit partner allowlist' }], appDefaults: { 'Portfolio / Marketing': 'Same-origin only' } },
  { id: 'security.hsts', section: 'security', group: 'Browser & transport', label: 'HTTPS / HSTS policy', description: 'Require HTTPS in production and define whether strict transport security should be enforced.', kind: 'choice', defaultValue: 'HTTPS + HSTS', options: [{ value: 'HTTPS only' }, { value: 'HTTPS + HSTS' }, { value: 'HTTPS + HSTS preload-ready' }], appDefaults: { 'Government System': 'HTTPS + HSTS preload-ready', 'Clinic / EMR': 'HTTPS + HSTS preload-ready' }, advanced: true },
  { id: 'security.referrer', section: 'security', group: 'Browser & transport', label: 'Referrer policy', description: 'Limit how much URL/referrer information is sent to other origins.', kind: 'choice', defaultValue: 'Strict origin when cross-origin', options: [{ value: 'Browser default' }, { value: 'Strict origin when cross-origin' }, { value: 'No referrer' }], appDefaults: { 'Clinic / EMR': 'No referrer' }, advanced: true },
  { id: 'security.permissionsPolicy', section: 'security', group: 'Browser & transport', label: 'Browser capability policy', description: 'Restrict camera, microphone, geolocation, and other browser capabilities to features that actually need them.', kind: 'choice', defaultValue: 'Deny unused capabilities', options: [{ value: 'Browser defaults' }, { value: 'Deny unused capabilities' }, { value: 'Explicit allowlist per capability' }], profileDefaults: { Advanced: 'Explicit allowlist per capability' }, advanced: true },
  { id: 'security.cookies', section: 'security', group: 'Sessions & request trust', label: 'Session-cookie posture', description: 'Require secure, HttpOnly session cookies with an intentional SameSite strategy.', kind: 'choice', defaultValue: 'Secure + HttpOnly + SameSite=Lax', options: [{ value: 'Framework defaults' }, { value: 'Secure + HttpOnly + SameSite=Lax' }, { value: 'Secure + HttpOnly + SameSite=Strict where possible' }], appDefaults: { 'Government System': 'Secure + HttpOnly + SameSite=Strict where possible', 'Clinic / EMR': 'Secure + HttpOnly + SameSite=Strict where possible' } },
  { id: 'security.csrf', section: 'security', group: 'Sessions & request trust', label: 'CSRF protection', description: 'Protect cookie-authenticated state-changing requests from cross-site request forgery.', kind: 'choice', defaultValue: 'Framework + origin/token checks', options: [{ value: 'Off' }, { value: 'Framework defaults' }, { value: 'Framework + origin/token checks' }, { value: 'Strict per-action protection' }], appDefaults: { 'Government System': 'Strict per-action protection', 'Clinic / EMR': 'Strict per-action protection' } },
  { id: 'security.cors', section: 'security', group: 'Sessions & request trust', label: 'CORS posture', description: 'Keep cross-origin API access deny-by-default and explicitly allow only trusted origins/methods.', kind: 'choice', defaultValue: 'Explicit trusted origins', options: [{ value: 'Wildcard' }, { value: 'Explicit trusted origins' }, { value: 'Per-environment allowlist' }, { value: 'Same-origin only' }], appDefaults: { 'Government System': 'Same-origin only', 'Clinic / EMR': 'Same-origin only' }, advanced: true },
  { id: 'security.inputValidation', section: 'security', group: 'Input & output', label: 'Server input validation', description: 'Validate untrusted input at a trusted server boundary using explicit schemas and domain constraints.', kind: 'choice', defaultValue: 'Schema + domain validation', options: [{ value: 'UI validation only' }, { value: 'Server schema validation' }, { value: 'Schema + domain validation' }], appDefaults: { 'Government System': 'Schema + domain validation', 'Clinic / EMR': 'Schema + domain validation' } },
  { id: 'security.outputEncoding', section: 'security', group: 'Input & output', label: 'Output encoding / HTML safety', description: 'Escape or sanitize untrusted content according to its output context before rendering.', kind: 'choice', defaultValue: 'Context-aware escaping', options: [{ value: 'Framework defaults only' }, { value: 'Context-aware escaping' }, { value: 'Escaping + sanitizer for rich HTML' }], appDefaults: { 'Directory / Marketplace': 'Escaping + sanitizer for rich HTML', 'SaaS / Client Portal': 'Escaping + sanitizer for rich HTML' } },
  { id: 'security.sqlSafety', section: 'security', group: 'Input & output', label: 'Database query safety', description: 'Use parameterized/ORM-safe queries and prohibit string-built SQL from untrusted input.', kind: 'choice', defaultValue: 'Parameterized / ORM-only', options: [{ value: 'Developer discretion' }, { value: 'Parameterized / ORM-only' }, { value: 'Parameterized + reviewed raw-query escape hatch' }] },
  { id: 'security.uploadValidation', section: 'security', group: 'Uploads', label: 'Upload validation', description: 'Validate extension, actual content/type, size, filename handling, and authorization for uploaded files.', kind: 'choice', defaultValue: 'Allowlist + content validation', options: [{ value: 'Extension check only' }, { value: 'Allowlist + content validation' }, { value: 'Allowlist + content validation + isolated processing' }], appDefaults: { 'Government System': 'Allowlist + content validation + isolated processing', 'Clinic / EMR': 'Allowlist + content validation + isolated processing' }, dependsOn: { id: 'attachments.enabled', equals: true } },
  { id: 'security.malwareScan', section: 'security', group: 'Uploads', label: 'Malware scanning for uploads', description: 'Scan risky user-supplied files before they become broadly downloadable or processed downstream.', kind: 'choice', defaultValue: 'Risk-based', options: [{ value: 'Off' }, { value: 'Risk-based' }, { value: 'All supported uploads' }], appDefaults: { 'Government System': 'All supported uploads', 'Clinic / EMR': 'All supported uploads' }, profileDefaults: { Minimal: 'Off', Advanced: 'All supported uploads' }, advanced: true, dependsOn: { id: 'attachments.enabled', equals: true } },
  { id: 'security.filenamePolicy', section: 'security', group: 'Uploads', label: 'Stored filename strategy', description: 'Use generated opaque storage keys and retain user filenames only as metadata where needed.', kind: 'choice', defaultValue: 'Generated opaque keys', options: [{ value: 'Original filenames' }, { value: 'Sanitized original filenames' }, { value: 'Generated opaque keys' }], appDefaults: { 'Government System': 'Generated opaque keys', 'Clinic / EMR': 'Generated opaque keys' }, advanced: true, dependsOn: { id: 'attachments.enabled', equals: true } },
  { id: 'security.abuseStrategy', section: 'security', group: 'Abuse protection', label: 'Abuse-protection strategy', description: 'Coordinate endpoint rate limits, cost controls, bot defenses, and lockout behavior rather than treating each separately.', kind: 'choice', defaultValue: 'Risk-tiered controls', options: [{ value: 'Basic rate limits' }, { value: 'Risk-tiered controls' }, { value: 'Adaptive / anomaly-aware controls' }], appDefaults: { 'Government System': 'Risk-tiered controls', 'Clinic / EMR': 'Risk-tiered controls', 'SaaS / Client Portal': 'Risk-tiered controls' }, profileDefaults: { Advanced: 'Adaptive / anomaly-aware controls' } },
  { id: 'security.loginThrottle', section: 'security', group: 'Abuse protection', label: 'Authentication throttling', description: 'Throttle repeated authentication/recovery attempts without creating an easy account-denial attack.', kind: 'choice', defaultValue: 'Progressive throttling', options: [{ value: 'Fixed lockout' }, { value: 'Progressive throttling' }, { value: 'Progressive + risk signals' }], dependsOn: { id: 'login.enabled', equals: true } },
  { id: 'security.publicFormAbuse', section: 'security', group: 'Abuse protection', label: 'Public form bot protection', description: 'Protect high-abuse public forms without forcing CAPTCHA on every normal interaction.', kind: 'choice', defaultValue: 'Rate limit + hidden/risk checks', options: [{ value: 'Off' }, { value: 'Rate limit + hidden/risk checks' }, { value: 'Challenge only when suspicious' }, { value: 'Always challenge' }], appDefaults: { 'Portfolio / Marketing': 'Rate limit + hidden/risk checks', 'E-commerce': 'Challenge only when suspicious', 'Directory / Marketplace': 'Challenge only when suspicious' } },
  { id: 'security.adminBoundary', section: 'security', group: 'Privileged surfaces', label: 'Administrative boundary', description: 'Keep privileged administration explicitly separated and protected from routine public/user flows.', kind: 'choice', defaultValue: 'Protected route + role checks', options: [{ value: 'Shared UI only' }, { value: 'Protected route + role checks' }, { value: 'Dedicated admin boundary + stronger controls' }], appDefaults: { 'Government System': 'Dedicated admin boundary + stronger controls', 'Clinic / EMR': 'Dedicated admin boundary + stronger controls' } },
  { id: 'security.adminMfa', section: 'security', group: 'Privileged surfaces', label: 'Admin MFA floor', description: 'Require stronger authentication for users with privileged administrative access.', kind: 'choice', defaultValue: 'Required for privileged admins', options: [{ value: 'Follow normal MFA policy' }, { value: 'Required for privileged admins' }, { value: 'Phishing-resistant factor preferred/required' }], dependsOn: { id: 'login.enabled', equals: true }, appDefaults: { 'Government System': 'Phishing-resistant factor preferred/required', 'Clinic / EMR': 'Phishing-resistant factor preferred/required' } },
  { id: 'security.reauth', section: 'security', group: 'Privileged surfaces', label: 'Reauthentication before sensitive actions', description: 'Require recent/strong authentication before credentials, billing, permissions, exports, or other high-impact changes.', kind: 'choice', defaultValue: 'High-impact actions', options: [{ value: 'Off' }, { value: 'High-impact actions' }, { value: 'Broad privileged actions' }], appDefaults: { 'Government System': 'Broad privileged actions', 'Clinic / EMR': 'Broad privileged actions' } },
  { id: 'security.secrets', section: 'security', group: 'Secrets & dependencies', label: 'Secret storage', description: 'Keep production credentials out of source, client bundles, logs, and normal database records.', kind: 'choice', defaultValue: 'Environment / managed secret store', options: [{ value: 'Environment variables' }, { value: 'Environment / managed secret store' }, { value: 'Dedicated secrets manager with access policy' }], appDefaults: { 'Government System': 'Dedicated secrets manager with access policy', 'Clinic / EMR': 'Dedicated secrets manager with access policy' } },
  { id: 'security.secretRotation', section: 'security', group: 'Secrets & dependencies', label: 'Secret rotation', description: 'Define how API keys, webhook secrets, database credentials, and signing keys are rotated without downtime.', kind: 'choice', defaultValue: 'Rotation procedure documented', options: [{ value: 'Manual when compromised' }, { value: 'Rotation procedure documented' }, { value: 'Scheduled/automated where supported' }], profileDefaults: { Minimal: 'Manual when compromised', Advanced: 'Scheduled/automated where supported' }, advanced: true },
  { id: 'security.dependencyScan', section: 'security', group: 'Secrets & dependencies', label: 'Dependency vulnerability scanning', description: 'Check runtime dependencies for known vulnerable versions as part of normal maintenance/CI.', kind: 'choice', defaultValue: 'CI + dependency alerts', options: [{ value: 'Manual checks' }, { value: 'Dependency alerts' }, { value: 'CI + dependency alerts' }, { value: 'CI gate for severe findings' }], appDefaults: { 'Government System': 'CI gate for severe findings', 'Clinic / EMR': 'CI gate for severe findings' }, profileDefaults: { Minimal: 'Dependency alerts', Advanced: 'CI gate for severe findings' } },
  { id: 'security.staticAnalysis', section: 'security', group: 'Secrets & dependencies', label: 'Security static analysis', description: 'Run lightweight code/security analysis for common unsafe patterns before production changes merge.', kind: 'choice', defaultValue: 'Targeted CI checks', options: [{ value: 'Off' }, { value: 'Targeted CI checks' }, { value: 'Broader SAST / secret scanning' }], appDefaults: { 'Government System': 'Broader SAST / secret scanning', 'Clinic / EMR': 'Broader SAST / secret scanning' }, profileDefaults: { Minimal: 'Off', Advanced: 'Broader SAST / secret scanning' }, advanced: true },
  { id: 'security.patchCadence', section: 'security', group: 'Secrets & dependencies', label: 'Security patch cadence', description: 'Set an explicit expectation for reviewing and shipping critical framework/runtime/dependency patches.', kind: 'choice', defaultValue: 'Priority-based', options: [{ value: 'Ad hoc' }, { value: 'Priority-based' }, { value: 'Defined SLA by severity' }], appDefaults: { 'Government System': 'Defined SLA by severity', 'Clinic / EMR': 'Defined SLA by severity' } },
  { id: 'security.errorDisclosure', section: 'security', group: 'Production exposure', label: 'Production error disclosure', description: 'Show users actionable generic errors while keeping stack traces, secrets, internal paths, and query details server-side.', kind: 'choice', defaultValue: 'Generic user error + internal diagnostics', options: [{ value: 'Detailed errors' }, { value: 'Generic user error + internal diagnostics' }, { value: 'Strict redaction + request ID' }], appDefaults: { 'Government System': 'Strict redaction + request ID', 'Clinic / EMR': 'Strict redaction + request ID' } },
  { id: 'security.debugMode', section: 'security', group: 'Production exposure', label: 'Production debug mode', description: 'Prevent development/debug endpoints, verbose debug pages, or test backdoors from remaining active in production.', kind: 'choice', defaultValue: 'Disabled in production', options: [{ value: 'Developer-controlled' }, { value: 'Disabled in production' }, { value: 'Build/deploy gate enforces disabled' }], appDefaults: { 'Government System': 'Build/deploy gate enforces disabled', 'Clinic / EMR': 'Build/deploy gate enforces disabled' } },

  // Privacy & data governance
  { id: 'privacy.inventory', section: 'privacy', group: 'Data awareness', label: 'Personal-data inventory', description: 'Document which personal/sensitive fields exist, why they exist, and where they flow.', kind: 'choice', defaultValue: 'Important personal fields documented', options: [{ value: 'Informal' }, { value: 'Important personal fields documented' }, { value: 'Full data map / register' }], appDefaults: { 'Government System': 'Full data map / register', 'Clinic / EMR': 'Full data map / register' }, profileDefaults: { Minimal: 'Informal', Advanced: 'Full data map / register' } },
  { id: 'privacy.minimization', section: 'privacy', group: 'Data awareness', label: 'Data minimization', description: 'Collect only data needed for a defined product/operational purpose instead of defaulting to “maybe useful later.”', kind: 'choice', defaultValue: 'Purpose-required fields only', options: [{ value: 'Collect useful extras' }, { value: 'Purpose-required fields only' }, { value: 'Strict minimization review' }], appDefaults: { 'Government System': 'Strict minimization review', 'Clinic / EMR': 'Strict minimization review' } },
  { id: 'privacy.classification', section: 'privacy', group: 'Data awareness', label: 'Data classification', description: 'Classify public, internal, personal, sensitive, financial, clinical, credential, and secret data so controls can differ.', kind: 'choice', defaultValue: 'Basic classification', options: [{ value: 'Off' }, { value: 'Basic classification' }, { value: 'Detailed classification + handling rules' }], appDefaults: { 'Government System': 'Detailed classification + handling rules', 'Clinic / EMR': 'Detailed classification + handling rules' }, profileDefaults: { Minimal: 'Basic classification', Advanced: 'Detailed classification + handling rules' } },
  { id: 'privacy.encryptionAtRest', section: 'privacy', group: 'Protection', label: 'Encryption at rest', description: 'Use provider/database/storage encryption and identify fields that need additional application-level protection.', kind: 'choice', defaultValue: 'Provider encryption + sensitive-field review', options: [{ value: 'Provider defaults' }, { value: 'Provider encryption + sensitive-field review' }, { value: 'Additional field-level encryption where justified' }], appDefaults: { 'Clinic / EMR': 'Additional field-level encryption where justified', 'Government System': 'Provider encryption + sensitive-field review' } },
  { id: 'privacy.masking', section: 'privacy', group: 'Protection', label: 'Sensitive-data masking', description: 'Mask or partially reveal sensitive fields in lists, logs, exports, and support/admin surfaces unless full access is necessary.', kind: 'choice', defaultValue: 'Mask in secondary surfaces', options: [{ value: 'No masking' }, { value: 'Mask in secondary surfaces' }, { value: 'Role/field-specific masking' }], appDefaults: { 'Government System': 'Role/field-specific masking', 'Clinic / EMR': 'Role/field-specific masking' } },
  { id: 'privacy.analyticsData', section: 'privacy', group: 'Protection', label: 'Analytics data policy', description: 'Avoid placing raw personal/sensitive values in analytics events, URLs, or third-party telemetry.', kind: 'choice', defaultValue: 'Identifiers minimized / pseudonymous', options: [{ value: 'Normal application fields allowed' }, { value: 'Identifiers minimized / pseudonymous' }, { value: 'No personal data in third-party analytics' }], appDefaults: { 'Government System': 'No personal data in third-party analytics', 'Clinic / EMR': 'No personal data in third-party analytics' } },
  { id: 'privacy.consent', section: 'privacy', group: 'Consent & cookies', label: 'Consent model', description: 'Ask for consent only where the product/legal basis requires it and record meaningful choices.', kind: 'choice', defaultValue: 'Purpose-specific where needed', options: [{ value: 'No consent controls' }, { value: 'Simple global consent' }, { value: 'Purpose-specific where needed' }, { value: 'Granular consent center' }], appDefaults: { 'Portfolio / Marketing': 'Purpose-specific where needed', 'E-commerce': 'Purpose-specific where needed', 'SaaS / Client Portal': 'Purpose-specific where needed' } },
  { id: 'privacy.cookies', section: 'privacy', group: 'Consent & cookies', label: 'Cookie/trackers policy', description: 'Separate necessary storage from analytics/marketing trackers and delay nonessential tracking until allowed.', kind: 'choice', defaultValue: 'Necessary + categorized optional', options: [{ value: 'No explicit categories' }, { value: 'Necessary + categorized optional' }, { value: 'Consent-before-nonessential tracking' }], appDefaults: { 'Portfolio / Marketing': 'Consent-before-nonessential tracking', 'E-commerce': 'Consent-before-nonessential tracking' } },
  { id: 'privacy.consentHistory', section: 'privacy', group: 'Consent & cookies', label: 'Consent history', description: 'Retain the choice/version/timestamp needed to demonstrate and honor changing consent preferences.', kind: 'choice', defaultValue: 'Current preference + version', options: [{ value: 'Current preference only' }, { value: 'Current preference + version' }, { value: 'Historical consent events' }], profileDefaults: { Advanced: 'Historical consent events' }, advanced: true },
  { id: 'privacy.withdrawal', section: 'privacy', group: 'Consent & cookies', label: 'Consent withdrawal', description: 'Let users revisit and withdraw optional consent as easily as it was granted.', kind: 'choice', defaultValue: 'Persistent preferences entry', options: [{ value: 'Support request only' }, { value: 'Persistent preferences entry' }, { value: 'Granular preferences center' }] },
  { id: 'privacy.retention', section: 'privacy', group: 'Lifecycle & rights', label: 'Retention enforcement', description: 'Turn retention policy into actual archival/deletion behavior instead of documentation only.', kind: 'choice', defaultValue: 'Scheduled review / cleanup', options: [{ value: 'Manual only' }, { value: 'Scheduled review / cleanup' }, { value: 'Automated per data class with hold exceptions' }], appDefaults: { 'Government System': 'Automated per data class with hold exceptions', 'Clinic / EMR': 'Automated per data class with hold exceptions' }, profileDefaults: { Minimal: 'Manual only', Advanced: 'Automated per data class with hold exceptions' } },
  { id: 'privacy.dataExport', section: 'privacy', group: 'Lifecycle & rights', label: 'Personal-data export', description: 'Define whether a user/admin can produce a portable copy of personal account data when appropriate.', kind: 'choice', defaultValue: 'Admin-assisted / product appropriate', options: [{ value: 'Off' }, { value: 'Admin-assisted / product appropriate' }, { value: 'Self-service export' }], appDefaults: { 'SaaS / Client Portal': 'Self-service export', 'E-commerce': 'Self-service export' } },
  { id: 'privacy.deletion', section: 'privacy', group: 'Lifecycle & rights', label: 'Personal-data deletion/anonymization', description: 'Define how valid deletion requests interact with legal/operational retention and shared records.', kind: 'choice', defaultValue: 'Anonymize/delete where allowed', options: [{ value: 'Manual case-by-case' }, { value: 'Anonymize/delete where allowed' }, { value: 'Workflow with retention/legal hold rules' }], appDefaults: { 'Government System': 'Workflow with retention/legal hold rules', 'Clinic / EMR': 'Workflow with retention/legal hold rules' } },
  { id: 'privacy.legalHold', section: 'privacy', group: 'Lifecycle & rights', label: 'Retention/legal hold override', description: 'Prevent automatic cleanup from destroying records subject to investigation, dispute, statutory, or operational hold.', kind: 'choice', defaultValue: 'Available for protected records', options: [{ value: 'Off' }, { value: 'Available for protected records' }, { value: 'Formal hold workflow + audit' }], appDefaults: { 'Government System': 'Formal hold workflow + audit', 'Clinic / EMR': 'Formal hold workflow + audit' }, advanced: true },
  { id: 'privacy.subprocessors', section: 'privacy', group: 'Third parties', label: 'Third-party / subprocessor register', description: 'Track providers that receive application data and the purpose/data categories involved.', kind: 'choice', defaultValue: 'Material providers documented', options: [{ value: 'Off' }, { value: 'Material providers documented' }, { value: 'Provider + data-flow register' }], appDefaults: { 'Government System': 'Provider + data-flow register', 'Clinic / EMR': 'Provider + data-flow register' }, advanced: true },
  { id: 'privacy.thirdPartyMin', section: 'privacy', group: 'Third parties', label: 'Third-party data minimization', description: 'Send external services only the fields required for that integration rather than whole domain objects.', kind: 'choice', defaultValue: 'Purpose-scoped payloads', options: [{ value: 'Full convenient objects' }, { value: 'Purpose-scoped payloads' }, { value: 'Purpose-scoped + sensitive-field denylist' }], appDefaults: { 'Government System': 'Purpose-scoped + sensitive-field denylist', 'Clinic / EMR': 'Purpose-scoped + sensitive-field denylist' } },
  { id: 'privacy.adminAccessAudit', section: 'privacy', group: 'Sensitive access', label: 'Sensitive-record access logging', description: 'Log privileged viewing/export of sensitive records when accountability matters, not only edits.', kind: 'choice', defaultValue: 'Sensitive exports + privileged access', options: [{ value: 'Edits only' }, { value: 'Sensitive exports + privileged access' }, { value: 'Detailed sensitive-record access audit' }], appDefaults: { 'Government System': 'Detailed sensitive-record access audit', 'Clinic / EMR': 'Detailed sensitive-record access audit' } },
  { id: 'privacy.incidentPlan', section: 'privacy', group: 'Sensitive access', label: 'Privacy incident procedure', description: 'Have a documented way to contain, assess, preserve evidence, and communicate a suspected data exposure.', kind: 'choice', defaultValue: 'Documented response path', options: [{ value: 'Ad hoc' }, { value: 'Documented response path' }, { value: 'Runbook + notification decision tree' }], appDefaults: { 'Government System': 'Runbook + notification decision tree', 'Clinic / EMR': 'Runbook + notification decision tree' }, profileDefaults: { Advanced: 'Runbook + notification decision tree' } },

  // Accessibility & inclusive UX
  { id: 'a11y.target', section: 'accessibility', group: 'Baseline', label: 'Accessibility conformance target', description: 'Translate the high-level accessibility choice into an implementation/testing target.', kind: 'choice', defaultValue: 'WCAG 2.2 AA', options: [{ value: 'Basic best practices' }, { value: 'WCAG 2.2 A' }, { value: 'WCAG 2.2 AA' }, { value: 'WCAG 2.2 AAA where practical' }], appDefaults: { 'Government System': 'WCAG 2.2 AA', 'Clinic / EMR': 'WCAG 2.2 AA' }, profileDefaults: { Minimal: 'Basic best practices', Standard: 'WCAG 2.2 AA', Advanced: 'WCAG 2.2 AA' } },
  { id: 'a11y.keyboard', section: 'accessibility', group: 'Keyboard & focus', label: 'Keyboard operation', description: 'All meaningful controls and workflows should be usable without a pointer device.', kind: 'choice', defaultValue: 'All interactive workflows', options: [{ value: 'Core navigation only' }, { value: 'All interactive workflows' }, { value: 'All workflows + documented shortcuts' }], appDefaults: { 'Government System': 'All interactive workflows', 'Clinic / EMR': 'All interactive workflows' } },
  { id: 'a11y.focus', section: 'accessibility', group: 'Keyboard & focus', label: 'Visible focus treatment', description: 'Provide a clear visible focus indicator that is not clipped/obscured by sticky UI.', kind: 'choice', defaultValue: 'Strong visible focus', options: [{ value: 'Browser default' }, { value: 'Strong visible focus' }, { value: 'Strong focus + obscuration checks' }] },
  { id: 'a11y.skipLinks', section: 'accessibility', group: 'Keyboard & focus', label: 'Skip links / bypass blocks', description: 'Let keyboard and assistive-technology users bypass repeated navigation to reach primary content.', kind: 'choice', defaultValue: 'For persistent site/app chrome', options: [{ value: 'Off' }, { value: 'For persistent site/app chrome' }, { value: 'Multiple contextual skip targets' }], profileDefaults: { Minimal: 'Off', Advanced: 'Multiple contextual skip targets' } },
  { id: 'a11y.focusManagement', section: 'accessibility', group: 'Keyboard & focus', label: 'Focus management after navigation/actions', description: 'Move/restore focus intentionally for dialogs, route changes, errors, and destructive/async actions.', kind: 'choice', defaultValue: 'Dialogs + errors + route changes', options: [{ value: 'Browser/default only' }, { value: 'Dialogs + errors + route changes' }, { value: 'Workflow-specific focus plan' }] },
  { id: 'a11y.landmarks', section: 'accessibility', group: 'Structure & semantics', label: 'Semantic landmarks', description: 'Use semantic regions/main/nav/header/footer and meaningful labels so page structure is navigable.', kind: 'choice', defaultValue: 'Semantic landmarks required', options: [{ value: 'Best effort' }, { value: 'Semantic landmarks required' }, { value: 'Landmarks + automated checks' }] },
  { id: 'a11y.headings', section: 'accessibility', group: 'Structure & semantics', label: 'Heading hierarchy', description: 'Keep headings meaningful and hierarchical instead of styling arbitrary text as headings.', kind: 'choice', defaultValue: 'Logical hierarchy required', options: [{ value: 'Visual hierarchy only' }, { value: 'Logical hierarchy required' }, { value: 'Hierarchy + page-template checks' }] },
  { id: 'a11y.labels', section: 'accessibility', group: 'Forms & errors', label: 'Form labels and instructions', description: 'Every input should have a programmatic label plus nearby instructions when the required format is not obvious.', kind: 'choice', defaultValue: 'Explicit labels + contextual instructions', options: [{ value: 'Placeholder may substitute' }, { value: 'Explicit labels' }, { value: 'Explicit labels + contextual instructions' }] },
  { id: 'a11y.errors', section: 'accessibility', group: 'Forms & errors', label: 'Accessible validation errors', description: 'Identify the field, explain the problem, preserve input, and expose error text to assistive technology.', kind: 'choice', defaultValue: 'Inline + summary for multi-field forms', options: [{ value: 'Visual field highlight' }, { value: 'Inline text' }, { value: 'Inline + summary for multi-field forms' }], appDefaults: { 'Government System': 'Inline + summary for multi-field forms', 'Clinic / EMR': 'Inline + summary for multi-field forms' } },
  { id: 'a11y.liveRegions', section: 'accessibility', group: 'Forms & errors', label: 'Async announcement strategy', description: 'Announce important async results, errors, upload progress, and state changes without flooding screen-reader output.', kind: 'choice', defaultValue: 'Important async changes only', options: [{ value: 'Off' }, { value: 'Important async changes only' }, { value: 'Workflow-specific live-region plan' }], advanced: true },
  { id: 'a11y.contrast', section: 'accessibility', group: 'Visual perception', label: 'Color contrast', description: 'Meet the selected accessibility target for text, controls, focus, and meaningful graphics.', kind: 'choice', defaultValue: 'AA contrast baseline', options: [{ value: 'Visual review only' }, { value: 'AA contrast baseline' }, { value: 'AA + automated contrast checks' }] },
  { id: 'a11y.nonColor', section: 'accessibility', group: 'Visual perception', label: 'Do not rely on color alone', description: 'Statuses, errors, charts, and selections should remain understandable without color discrimination.', kind: 'choice', defaultValue: 'Icon/text/pattern redundancy', options: [{ value: 'Color may carry meaning' }, { value: 'Icon/text/pattern redundancy' }, { value: 'Redundancy + color-blind review' }] },
  { id: 'a11y.zoomReflow', section: 'accessibility', group: 'Visual perception', label: 'Zoom and reflow', description: 'Keep content usable at high text zoom/reflow without losing actions or forcing two-dimensional scrolling for normal content.', kind: 'choice', defaultValue: 'Support high zoom/reflow', options: [{ value: 'Desktop responsive only' }, { value: 'Support high zoom/reflow' }, { value: 'High zoom/reflow regression tested' }] },
  { id: 'a11y.targetSize', section: 'accessibility', group: 'Touch & motor', label: 'Pointer/touch target sizing', description: 'Keep interactive targets large/spaced enough for touch and motor accessibility.', kind: 'choice', defaultValue: 'WCAG 2.2 AA-oriented minimums', options: [{ value: 'Visual design discretion' }, { value: 'WCAG 2.2 AA-oriented minimums' }, { value: 'Generous mobile targets' }], appDefaults: { 'Booking / Scheduling': 'Generous mobile targets', 'E-commerce': 'Generous mobile targets' } },
  { id: 'a11y.dragAlternative', section: 'accessibility', group: 'Touch & motor', label: 'Alternative to drag-only interactions', description: 'Provide buttons/menu/keyboard alternatives when drag-and-drop is used for ordering, scheduling, or moving records.', kind: 'choice', defaultValue: 'Required when drag exists', options: [{ value: 'Drag may be required' }, { value: 'Required when drag exists' }, { value: 'Alternative + keyboard reordering' }] },
  { id: 'a11y.reducedMotion', section: 'accessibility', group: 'Motion & media', label: 'Reduced-motion support', description: 'Honor reduced-motion preferences and avoid essential information being communicated only through animation.', kind: 'choice', defaultValue: 'Honor preference + simplify motion', options: [{ value: 'Ignore preference' }, { value: 'Honor preference + simplify motion' }, { value: 'Motion-off equivalent for all nonessential animation' }] },
  { id: 'a11y.media', section: 'accessibility', group: 'Motion & media', label: 'Audio/video alternatives', description: 'Provide captions/transcripts or equivalent alternatives when meaningful audio/video content exists.', kind: 'choice', defaultValue: 'Captions/transcripts when media carries meaning', options: [{ value: 'Not specified' }, { value: 'Captions/transcripts when media carries meaning' }, { value: 'Captions + transcripts + media controls review' }] },
  { id: 'a11y.tables', section: 'accessibility', group: 'Data presentation', label: 'Accessible tables', description: 'Use real table semantics, headers, captions/context, and non-table mobile alternatives where appropriate.', kind: 'choice', defaultValue: 'Semantic tables + headers', options: [{ value: 'Visual grids acceptable' }, { value: 'Semantic tables + headers' }, { value: 'Semantic + complex-table guidance' }] },
  { id: 'a11y.charts', section: 'accessibility', group: 'Data presentation', label: 'Accessible charts', description: 'Provide textual values/summary and non-color cues so charts are not the only way to obtain important information.', kind: 'choice', defaultValue: 'Summary + accessible data alternative', options: [{ value: 'Chart only' }, { value: 'Summary + accessible data alternative' }, { value: 'Full data table + narrative summary' }], appDefaults: { 'Government System': 'Full data table + narrative summary' } },
  { id: 'a11y.auth', section: 'accessibility', group: 'Authentication', label: 'Accessible authentication', description: 'Avoid authentication puzzles that depend on memory/transcription where alternatives or assistive mechanisms are appropriate.', kind: 'choice', defaultValue: 'Password managers/paste/accessible MFA supported', options: [{ value: 'Normal auth only' }, { value: 'Password managers/paste/accessible MFA supported' }, { value: 'Accessible alternatives reviewed for every factor' }], dependsOn: { id: 'login.enabled', equals: true } },
  { id: 'a11y.screenReader', section: 'accessibility', group: 'Verification', label: 'Screen-reader verification', description: 'Manually verify representative workflows with at least one mainstream screen reader, not only automated checks.', kind: 'choice', defaultValue: 'Core workflows', options: [{ value: 'Off' }, { value: 'Core workflows' }, { value: 'Representative workflows across roles' }], appDefaults: { 'Government System': 'Representative workflows across roles', 'Clinic / EMR': 'Representative workflows across roles' }, profileDefaults: { Minimal: 'Off', Advanced: 'Representative workflows across roles' } },
  { id: 'a11y.automation', section: 'accessibility', group: 'Verification', label: 'Automated accessibility checks', description: 'Run automated checks as a guardrail while recognizing they do not replace manual keyboard/screen-reader review.', kind: 'choice', defaultValue: 'CI smoke checks', options: [{ value: 'Manual only' }, { value: 'CI smoke checks' }, { value: 'CI checks across representative pages' }], profileDefaults: { Minimal: 'Manual only', Advanced: 'CI checks across representative pages' } },

  // SEO & web quality
  { id: 'seo.enabled', section: 'seo', group: 'Discoverability', label: 'Search-engine discoverability', description: 'Enable an explicit SEO/indexing contract for public pages. Private product areas should remain non-indexable.', kind: 'boolean', defaultValue: false, appDefaults: { 'Portfolio / Marketing': true, 'E-commerce': true, 'Directory / Marketplace': true, 'Tournament / Event': true, 'Booking / Scheduling': true, 'SaaS / Client Portal': true }, keywords: ['seo', 'search engine', 'indexing'] },
  { id: 'seo.metadata', section: 'seo', group: 'Discoverability', label: 'Per-page metadata', description: 'Give indexable pages unique titles/descriptions rather than one generic site-wide value.', kind: 'choice', defaultValue: 'Unique metadata for important pages', options: [{ value: 'Site-wide defaults only' }, { value: 'Unique metadata for important pages' }, { value: 'Template + editor-controlled metadata' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.canonical', section: 'seo', group: 'Discoverability', label: 'Canonical URL policy', description: 'Declare canonical URLs where query parameters, filters, aliases, or duplicate routes could produce equivalent content.', kind: 'choice', defaultValue: 'Canonicalize duplicate public routes', options: [{ value: 'Off' }, { value: 'Canonicalize duplicate public routes' }, { value: 'Explicit canonical rules per template' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.sitemap', section: 'seo', group: 'Crawling', label: 'XML sitemap', description: 'Expose indexable public URLs in a sitemap and omit private, duplicate, or intentionally non-indexed routes.', kind: 'choice', defaultValue: 'Generated sitemap', options: [{ value: 'Off' }, { value: 'Generated sitemap' }, { value: 'Dynamic segmented sitemaps' }], dependsOn: { id: 'seo.enabled', equals: true }, appDefaults: { 'Directory / Marketplace': 'Dynamic segmented sitemaps', 'E-commerce': 'Dynamic segmented sitemaps' } },
  { id: 'seo.robots', section: 'seo', group: 'Crawling', label: 'Robots policy', description: 'Use robots rules for crawl guidance while relying on authentication/noindex for actual privacy boundaries.', kind: 'choice', defaultValue: 'Explicit production robots policy', options: [{ value: 'Framework default' }, { value: 'Explicit production robots policy' }, { value: 'Environment-aware robots policy' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.privateNoindex', section: 'seo', group: 'Crawling', label: 'Private/nonpublic pages indexing', description: 'Ensure account, admin, staging, search-result, and other nonpublic pages are not accidentally indexed.', kind: 'choice', defaultValue: 'Explicit noindex + authentication where applicable', options: [{ value: 'Rely on robots only' }, { value: 'Explicit noindex + authentication where applicable' }, { value: 'Automated route/template assertions' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.urls', section: 'seo', group: 'URLs & redirects', label: 'Public URL strategy', description: 'Prefer stable readable URLs and avoid exposing implementation-only IDs when a durable slug/reference exists.', kind: 'choice', defaultValue: 'Readable stable URLs', options: [{ value: 'Implementation IDs acceptable' }, { value: 'Readable stable URLs' }, { value: 'Readable + canonical slug history' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.redirects', section: 'seo', group: 'URLs & redirects', label: 'Redirect management', description: 'Use permanent redirects for moved public content and avoid chains/loops during redesigns or slug changes.', kind: 'choice', defaultValue: 'Tracked permanent redirects', options: [{ value: 'Ad hoc redirects' }, { value: 'Tracked permanent redirects' }, { value: 'Redirect registry + validation' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.openGraph', section: 'seo', group: 'Sharing', label: 'Social/Open Graph metadata', description: 'Generate sensible link-preview title, description, image, and canonical URL for shareable public pages.', kind: 'choice', defaultValue: 'Site + key-page previews', options: [{ value: 'Off' }, { value: 'Site + key-page previews' }, { value: 'Dynamic previews per content entity' }], dependsOn: { id: 'seo.enabled', equals: true }, appDefaults: { 'Portfolio / Marketing': 'Dynamic previews per content entity', 'Directory / Marketplace': 'Dynamic previews per content entity' } },
  { id: 'seo.structuredData', section: 'seo', group: 'Structured data', label: 'Structured data / JSON-LD', description: 'Add valid schema only for content the page actually represents; never manufacture reviews, ratings, or business facts.', kind: 'choice', defaultValue: 'Relevant page types only', options: [{ value: 'Off' }, { value: 'Relevant page types only' }, { value: 'Template-specific structured data' }], dependsOn: { id: 'seo.enabled', equals: true }, appDefaults: { 'E-commerce': 'Template-specific structured data', 'Directory / Marketplace': 'Template-specific structured data' } },
  { id: 'seo.breadcrumbs', section: 'seo', group: 'Structured data', label: 'Breadcrumb structured data', description: 'For hierarchical public content, keep visible breadcrumbs and structured breadcrumb data aligned.', kind: 'choice', defaultValue: 'When hierarchy exists', options: [{ value: 'Off' }, { value: 'When hierarchy exists' }, { value: 'Required for deep public hierarchy' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.hreflang', section: 'seo', group: 'International', label: 'Language/region alternates', description: 'Use hreflang only when true localized alternates exist and keep reciprocal/canonical relationships consistent.', kind: 'choice', defaultValue: 'Off unless multilingual', options: [{ value: 'Off unless multilingual' }, { value: 'Language alternates' }, { value: 'Language + region alternates' }], dependsOn: { id: 'seo.enabled', equals: true }, advanced: true },
  { id: 'seo.image', section: 'seo', group: 'Media', label: 'Image discoverability', description: 'Use descriptive alt/text context and optimized image URLs/sizing for meaningful public images.', kind: 'choice', defaultValue: 'Meaningful images optimized', options: [{ value: 'Basic alt text' }, { value: 'Meaningful images optimized' }, { value: 'Image sitemap/advanced media SEO where useful' }], dependsOn: { id: 'seo.enabled', equals: true }, advanced: true },
  { id: 'seo.statusCodes', section: 'seo', group: 'Technical quality', label: 'HTTP status correctness', description: 'Return real 404/410/redirect/success statuses instead of rendering error content with a misleading 200 response.', kind: 'choice', defaultValue: 'Correct semantic status codes', options: [{ value: 'Client-side content only' }, { value: 'Correct semantic status codes' }, { value: 'Status-code regression tests' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.performance', section: 'seo', group: 'Technical quality', label: 'SEO performance posture', description: 'Treat public page speed, rendering stability, and mobile usability as part of discoverability rather than decoration.', kind: 'choice', defaultValue: 'Core Web Vitals monitored', options: [{ value: 'Best effort' }, { value: 'Core Web Vitals monitored' }, { value: 'Performance budgets on public templates' }], dependsOn: { id: 'seo.enabled', equals: true } },
  { id: 'seo.verification', section: 'seo', group: 'Technical quality', label: 'Search indexing verification', description: 'Have a lightweight way to inspect sitemap/indexing/canonical problems after production changes.', kind: 'choice', defaultValue: 'Search-console equivalent', options: [{ value: 'Manual search checks' }, { value: 'Search-console equivalent' }, { value: 'Automated sitemap/link checks + console review' }], dependsOn: { id: 'seo.enabled', equals: true }, profileDefaults: { Minimal: 'Manual search checks', Advanced: 'Automated sitemap/link checks + console review' }, advanced: true },

  // Performance & reliability
  { id: 'perf.posture', section: 'performance', group: 'Targets', label: 'Performance posture', description: 'Set the overall expectation for responsiveness before individual optimization choices are made.', kind: 'choice', defaultValue: 'Production optimized', options: [{ value: 'Functional first' }, { value: 'Production optimized' }, { value: 'Performance-budget driven' }], appDefaults: { 'Portfolio / Marketing': 'Performance-budget driven', 'E-commerce': 'Performance-budget driven', 'SaaS / Client Portal': 'Production optimized' }, profileDefaults: { Minimal: 'Functional first', Advanced: 'Performance-budget driven' } },
  { id: 'perf.webVitals', section: 'performance', group: 'Targets', label: 'Core Web Vitals / client metrics', description: 'Measure real-user loading, interaction, and layout stability for meaningful web surfaces.', kind: 'choice', defaultValue: 'Monitor production samples', options: [{ value: 'Off' }, { value: 'Monitor production samples' }, { value: 'Monitor + alert/regression budget' }], appDefaults: { 'Portfolio / Marketing': 'Monitor + alert/regression budget', 'E-commerce': 'Monitor + alert/regression budget' }, profileDefaults: { Minimal: 'Off', Advanced: 'Monitor + alert/regression budget' } },
  { id: 'perf.serverLatency', section: 'performance', group: 'Targets', label: 'Server/API latency target', description: 'Define a realistic latency target for common interactive requests and separately identify expensive jobs.', kind: 'choice', defaultValue: 'Explicit target for common requests', options: [{ value: 'No explicit target' }, { value: 'Explicit target for common requests' }, { value: 'Per-endpoint/service-level targets' }], appDefaults: { 'Booking / Scheduling': 'Per-endpoint/service-level targets', 'Inventory / POS': 'Per-endpoint/service-level targets' } },
  { id: 'perf.cache', section: 'performance', group: 'Caching', label: 'Caching strategy', description: 'Cache safe data deliberately by freshness/authorization semantics rather than adding cache everywhere.', kind: 'choice', defaultValue: 'Layered selective caching', options: [{ value: 'Minimal/no cache' }, { value: 'Layered selective caching' }, { value: 'Documented cache policy per data class' }], appDefaults: { 'Portfolio / Marketing': 'Documented cache policy per data class', 'Directory / Marketplace': 'Documented cache policy per data class' } },
  { id: 'perf.cdn', section: 'performance', group: 'Caching', label: 'CDN / edge delivery', description: 'Serve static/public cacheable assets close to users without caching protected personalized responses incorrectly.', kind: 'choice', defaultValue: 'Static assets at edge', options: [{ value: 'Origin only' }, { value: 'Static assets at edge' }, { value: 'Static + selected public responses at edge' }], appDefaults: { 'Portfolio / Marketing': 'Static + selected public responses at edge', 'E-commerce': 'Static + selected public responses at edge' } },
  { id: 'perf.queryDiscipline', section: 'performance', group: 'Database', label: 'Database query discipline', description: 'Identify slow/N+1 queries, select only needed fields, and keep common request query counts bounded.', kind: 'choice', defaultValue: 'Profile common workflows', options: [{ value: 'Fix when slow' }, { value: 'Profile common workflows' }, { value: 'Query budgets + slow-query monitoring' }], appDefaults: { 'Government System': 'Query budgets + slow-query monitoring', 'Clinic / EMR': 'Query budgets + slow-query monitoring', 'Inventory / POS': 'Query budgets + slow-query monitoring' } },
  { id: 'perf.indexing', section: 'performance', group: 'Database', label: 'Database indexing strategy', description: 'Create indexes for actual filter/join/order patterns and verify they still help as data grows.', kind: 'choice', defaultValue: 'Index common query patterns', options: [{ value: 'Primary/unique indexes only' }, { value: 'Index common query patterns' }, { value: 'Query-plan reviewed indexes' }], appDefaults: { 'Government System': 'Query-plan reviewed indexes', 'Clinic / EMR': 'Query-plan reviewed indexes', 'Inventory / POS': 'Query-plan reviewed indexes' } },
  { id: 'perf.pagination', section: 'performance', group: 'Large data', label: 'Large-list pagination', description: 'Avoid loading unbounded record sets into browser/server memory; use pagination/cursors appropriate to the data.', kind: 'choice', defaultValue: 'Required for unbounded lists', options: [{ value: 'Load all when convenient' }, { value: 'Required for unbounded lists' }, { value: 'Cursor/seek pagination for high-scale feeds' }] },
  { id: 'perf.virtualization', section: 'performance', group: 'Large data', label: 'UI virtualization', description: 'Virtualize very large client-side tables/lists only when pagination or windowing still leaves many rendered rows.', kind: 'choice', defaultValue: 'Only when measured necessary', options: [{ value: 'Off' }, { value: 'Only when measured necessary' }, { value: 'Expected for high-volume grids' }], appDefaults: { 'Government System': 'Only when measured necessary', 'Inventory / POS': 'Only when measured necessary' }, advanced: true },
  { id: 'perf.images', section: 'performance', group: 'Frontend assets', label: 'Image optimization', description: 'Use correctly sized responsive images, modern formats when supported, dimensions, and lazy loading below the fold.', kind: 'choice', defaultValue: 'Responsive optimized images', options: [{ value: 'Original uploads' }, { value: 'Responsive optimized images' }, { value: 'Responsive + transformation pipeline' }], appDefaults: { 'Portfolio / Marketing': 'Responsive + transformation pipeline', 'E-commerce': 'Responsive + transformation pipeline', 'Directory / Marketplace': 'Responsive + transformation pipeline' } },
  { id: 'perf.fonts', section: 'performance', group: 'Frontend assets', label: 'Font loading', description: 'Limit font variants, preload only critical faces, and avoid invisible/unstable text during font loading.', kind: 'choice', defaultValue: 'Self-host/optimized critical fonts', options: [{ value: 'Normal webfont loading' }, { value: 'Self-host/optimized critical fonts' }, { value: 'Strict font budget + fallback metric tuning' }], appDefaults: { 'Portfolio / Marketing': 'Strict font budget + fallback metric tuning' }, advanced: true },
  { id: 'perf.bundle', section: 'performance', group: 'Frontend assets', label: 'JavaScript bundle budget', description: 'Track large dependencies/chunks so feature growth does not silently make every user download unnecessary code.', kind: 'choice', defaultValue: 'Review large chunks/dependencies', options: [{ value: 'Off' }, { value: 'Review large chunks/dependencies' }, { value: 'CI bundle budget' }], appDefaults: { 'Portfolio / Marketing': 'CI bundle budget', 'E-commerce': 'CI bundle budget' }, profileDefaults: { Minimal: 'Off', Advanced: 'CI bundle budget' } },
  { id: 'perf.codeSplitting', section: 'performance', group: 'Frontend assets', label: 'Code splitting / lazy modules', description: 'Load rarely used heavy product areas on demand instead of including them in the initial critical path.', kind: 'choice', defaultValue: 'Route/feature-level splitting', options: [{ value: 'Bundler defaults' }, { value: 'Route/feature-level splitting' }, { value: 'Measured component-level splitting' }] },
  { id: 'perf.compression', section: 'performance', group: 'Network', label: 'Response compression', description: 'Compress text assets/responses at the CDN/server and avoid recompressing already-compressed binary files.', kind: 'choice', defaultValue: 'Brotli/Gzip via platform', options: [{ value: 'Platform default' }, { value: 'Brotli/Gzip via platform' }, { value: 'Compression policy verified in production' }], advanced: true },
  { id: 'perf.timeouts', section: 'performance', group: 'Failure boundaries', label: 'External request timeouts', description: 'Bound calls to databases/providers/services so one slow dependency does not hold requests indefinitely.', kind: 'choice', defaultValue: 'Explicit per dependency', options: [{ value: 'Library defaults' }, { value: 'Explicit per dependency' }, { value: 'Per-operation budgets + cancellation' }] },
  { id: 'perf.retries', section: 'performance', group: 'Failure boundaries', label: 'Retry strategy', description: 'Retry only safe transient failures with backoff/jitter and idempotency rather than retrying every error.', kind: 'choice', defaultValue: 'Bounded exponential backoff for safe operations', options: [{ value: 'No central policy' }, { value: 'Bounded exponential backoff for safe operations' }, { value: 'Dependency-specific retry budgets' }] },
  { id: 'perf.circuitBreaker', section: 'performance', group: 'Failure boundaries', label: 'Circuit breaker / dependency isolation', description: 'For repeatedly failing critical providers, fail fast/degrade rather than amplifying an outage with endless calls.', kind: 'choice', defaultValue: 'Only for critical external dependencies', options: [{ value: 'Off' }, { value: 'Only for critical external dependencies' }, { value: 'Required for unstable/critical dependencies' }], profileDefaults: { Minimal: 'Off', Advanced: 'Required for unstable/critical dependencies' }, advanced: true },
  { id: 'perf.gracefulDegradation', section: 'performance', group: 'Failure boundaries', label: 'Graceful degradation', description: 'Define which secondary features can fail closed/offline while core workflows remain usable.', kind: 'choice', defaultValue: 'Core workflows survive secondary-service failure', options: [{ value: 'Whole page may fail' }, { value: 'Core workflows survive secondary-service failure' }, { value: 'Feature-by-feature degradation plan' }], appDefaults: { 'Government System': 'Feature-by-feature degradation plan', 'Clinic / EMR': 'Feature-by-feature degradation plan' } },
  { id: 'perf.healthChecks', section: 'performance', group: 'Capacity & health', label: 'Health/readiness checks', description: 'Expose machine-usable health checks that distinguish process-up from actually ready to serve traffic.', kind: 'choice', defaultValue: 'Basic health + dependency readiness', options: [{ value: 'Process-only health' }, { value: 'Basic health + dependency readiness' }, { value: 'Liveness + readiness + degraded status' }], appDefaults: { 'Government System': 'Liveness + readiness + degraded status', 'Clinic / EMR': 'Liveness + readiness + degraded status' } },
  { id: 'perf.capacity', section: 'performance', group: 'Capacity & health', label: 'Capacity planning', description: 'Estimate expected users, concurrency, record counts, file volume, and growth before production sizing.', kind: 'choice', defaultValue: 'Basic expected-load assumptions', options: [{ value: 'No explicit estimate' }, { value: 'Basic expected-load assumptions' }, { value: 'Documented capacity + scaling thresholds' }], appDefaults: { 'SaaS / Client Portal': 'Documented capacity + scaling thresholds', 'Government System': 'Documented capacity + scaling thresholds' } },
  { id: 'perf.regionLatency', section: 'performance', group: 'Capacity & health', label: 'Region / latency placement', description: 'Place compute/database/storage close enough to primary users and each other to avoid avoidable network latency.', kind: 'choice', defaultValue: 'Same region near primary users', options: [{ value: 'Provider default region' }, { value: 'Same region near primary users' }, { value: 'Measured multi-region/edge strategy' }], appDefaults: { 'Government System': 'Same region near primary users', 'Clinic / EMR': 'Same region near primary users' } },
  { id: 'perf.availability', section: 'performance', group: 'Capacity & health', label: 'Availability expectation', description: 'Set a realistic uptime/maintenance expectation appropriate to how disruptive outages would be.', kind: 'choice', defaultValue: 'Production business-hours critical', options: [{ value: 'Best effort' }, { value: 'Production business-hours critical' }, { value: 'High availability / 24x7 critical' }], appDefaults: { 'Booking / Scheduling': 'High availability / 24x7 critical', 'E-commerce': 'High availability / 24x7 critical', 'Clinic / EMR': 'High availability / 24x7 critical' } },

  // Observability & incidents
  { id: 'obs.logs', section: 'observability', group: 'Logs', label: 'Structured application logs', description: 'Use structured searchable logs with stable fields instead of relying on ad hoc console strings.', kind: 'choice', defaultValue: 'Structured JSON/event logs', options: [{ value: 'Plain text' }, { value: 'Structured JSON/event logs' }, { value: 'Structured + centralized searchable logs' }], appDefaults: { 'Government System': 'Structured + centralized searchable logs', 'Clinic / EMR': 'Structured + centralized searchable logs' } },
  { id: 'obs.redaction', section: 'observability', group: 'Logs', label: 'Log redaction', description: 'Prevent passwords, tokens, session cookies, secrets, clinical/sensitive fields, and full payment data from reaching logs.', kind: 'choice', defaultValue: 'Sensitive-field denylist/redaction', options: [{ value: 'Developer discretion' }, { value: 'Sensitive-field denylist/redaction' }, { value: 'Allowlisted log fields for sensitive workflows' }], appDefaults: { 'Government System': 'Allowlisted log fields for sensitive workflows', 'Clinic / EMR': 'Allowlisted log fields for sensitive workflows' } },
  { id: 'obs.requestId', section: 'observability', group: 'Logs', label: 'Request/correlation IDs', description: 'Carry a correlation ID through request, job, integration, and error logs so one incident can be traced end to end.', kind: 'choice', defaultValue: 'Request + async propagation', options: [{ value: 'Off' }, { value: 'Request only' }, { value: 'Request + async propagation' }], appDefaults: { 'Government System': 'Request + async propagation', 'Clinic / EMR': 'Request + async propagation' } },
  { id: 'obs.errorTracking', section: 'observability', group: 'Errors & traces', label: 'Error tracking', description: 'Capture uncaught production errors with release/context metadata while stripping sensitive payloads.', kind: 'choice', defaultValue: 'Central error tracker', options: [{ value: 'Logs only' }, { value: 'Central error tracker' }, { value: 'Error tracker + release regression alerts' }], appDefaults: { 'SaaS / Client Portal': 'Error tracker + release regression alerts', 'E-commerce': 'Error tracker + release regression alerts' } },
  { id: 'obs.tracing', section: 'observability', group: 'Errors & traces', label: 'Distributed/request tracing', description: 'Trace slow or failing work across app, database, queue, and external calls when complexity justifies it.', kind: 'choice', defaultValue: 'Critical request traces', options: [{ value: 'Off' }, { value: 'Critical request traces' }, { value: 'Broader distributed tracing' }], profileDefaults: { Minimal: 'Off', Advanced: 'Broader distributed tracing' }, advanced: true },
  { id: 'obs.metrics', section: 'observability', group: 'Metrics', label: 'Operational metrics', description: 'Track request rates/errors/latency, queue depth, job failures, database pressure, and other service-health signals.', kind: 'choice', defaultValue: 'Core service metrics', options: [{ value: 'Logs only' }, { value: 'Core service metrics' }, { value: 'Service + business-critical technical metrics' }], appDefaults: { 'Government System': 'Service + business-critical technical metrics', 'Clinic / EMR': 'Service + business-critical technical metrics' } },
  { id: 'obs.uptime', section: 'observability', group: 'Metrics', label: 'External uptime checks', description: 'Check important public/entry endpoints from outside the hosting environment so total outages are detected.', kind: 'choice', defaultValue: 'Primary entry + health endpoint', options: [{ value: 'Off' }, { value: 'Primary entry + health endpoint' }, { value: 'Multiple critical workflow probes' }], appDefaults: { 'Booking / Scheduling': 'Multiple critical workflow probes', 'E-commerce': 'Multiple critical workflow probes' } },
  { id: 'obs.synthetic', section: 'observability', group: 'Metrics', label: 'Synthetic workflow checks', description: 'Periodically exercise a safe representative workflow when simple uptime cannot detect broken dependencies/business paths.', kind: 'choice', defaultValue: 'Off unless high criticality', options: [{ value: 'Off unless high criticality' }, { value: 'One critical synthetic journey' }, { value: 'Multiple role/workflow journeys' }], appDefaults: { 'Booking / Scheduling': 'One critical synthetic journey', 'E-commerce': 'One critical synthetic journey', 'Clinic / EMR': 'One critical synthetic journey' }, advanced: true },
  { id: 'obs.alerting', section: 'observability', group: 'Alerts', label: 'Alerting strategy', description: 'Alert on actionable symptoms/thresholds rather than sending notifications for every log line.', kind: 'choice', defaultValue: 'Actionable severity-based alerts', options: [{ value: 'Manual dashboard checking' }, { value: 'Actionable severity-based alerts' }, { value: 'Severity + escalation/on-call routing' }], appDefaults: { 'Government System': 'Severity + escalation/on-call routing', 'Clinic / EMR': 'Severity + escalation/on-call routing' } },
  { id: 'obs.alertNoise', section: 'observability', group: 'Alerts', label: 'Alert noise control', description: 'Deduplicate/group repeated incidents and include enough context so operators can act without alert fatigue.', kind: 'choice', defaultValue: 'Grouping + cooldown', options: [{ value: 'Every event alerts' }, { value: 'Grouping + cooldown' }, { value: 'Grouping + dedupe + escalation policy' }], advanced: true },
  { id: 'obs.jobMonitoring', section: 'observability', group: 'Dependencies & jobs', label: 'Background-job monitoring', description: 'Monitor stuck, retried, dead-lettered, or unusually slow jobs separately from web request errors.', kind: 'choice', defaultValue: 'Failures + queue depth', options: [{ value: 'Logs only' }, { value: 'Failures + queue depth' }, { value: 'Failures + latency + queue/dead-letter alerts' }], dependsOn: { id: 'jobs.enabled', equals: ['As needed for slow/retryable work', 'Dedicated queue/workers'] }, profileDefaults: { Advanced: 'Failures + latency + queue/dead-letter alerts' } },
  { id: 'obs.integrationMonitoring', section: 'observability', group: 'Dependencies & jobs', label: 'Integration health monitoring', description: 'Track provider/webhook failures, auth expiry, delivery backlogs, and degraded external services.', kind: 'choice', defaultValue: 'Errors + health status', options: [{ value: 'Logs only' }, { value: 'Errors + health status' }, { value: 'Errors + health + SLA/backlog alerts' }], appDefaults: { 'Booking / Scheduling': 'Errors + health + SLA/backlog alerts', 'E-commerce': 'Errors + health + SLA/backlog alerts' } },
  { id: 'obs.dbMonitoring', section: 'observability', group: 'Dependencies & jobs', label: 'Database health monitoring', description: 'Monitor connection saturation, slow queries, storage, locks, and replication/recovery health where applicable.', kind: 'choice', defaultValue: 'Connections + slow queries + storage', options: [{ value: 'Provider dashboard only' }, { value: 'Connections + slow queries + storage' }, { value: 'Detailed DB alerts + query regression review' }], appDefaults: { 'Government System': 'Detailed DB alerts + query regression review', 'Clinic / EMR': 'Detailed DB alerts + query regression review' } },
  { id: 'obs.releaseMarkers', section: 'observability', group: 'Incidents', label: 'Release/deploy markers', description: 'Record production deploy/version markers in monitoring so regressions can be correlated with a release.', kind: 'choice', defaultValue: 'Release version on errors/logs', options: [{ value: 'Off' }, { value: 'Release version on errors/logs' }, { value: 'Release markers across errors/metrics/traces' }], profileDefaults: { Advanced: 'Release markers across errors/metrics/traces' } },
  { id: 'obs.incidentRecords', section: 'observability', group: 'Incidents', label: 'Incident records/postmortems', description: 'For meaningful outages/security events, retain a short timeline, cause, impact, fix, and prevention follow-up.', kind: 'choice', defaultValue: 'Material incidents only', options: [{ value: 'Off' }, { value: 'Material incidents only' }, { value: 'Formal incident + postmortem workflow' }], appDefaults: { 'Government System': 'Formal incident + postmortem workflow', 'Clinic / EMR': 'Formal incident + postmortem workflow' } },
  { id: 'obs.statusPage', section: 'observability', group: 'Incidents', label: 'Status communication', description: 'Define whether users/staff get a status surface or targeted notice during material service degradation.', kind: 'choice', defaultValue: 'In-app/support communication', options: [{ value: 'Internal only' }, { value: 'In-app/support communication' }, { value: 'Public/private status page as appropriate' }], appDefaults: { 'SaaS / Client Portal': 'Public/private status page as appropriate', 'Booking / Scheduling': 'Public/private status page as appropriate', 'E-commerce': 'Public/private status page as appropriate' } },
  { id: 'obs.retention', section: 'observability', group: 'Logs', label: 'Observability retention', description: 'Keep logs/traces long enough for debugging/accountability without retaining sensitive telemetry forever.', kind: 'choice', defaultValue: 'Defined by log class', options: [{ value: 'Provider default' }, { value: 'Defined by log class' }, { value: 'Classified retention + archival/deletion policy' }], appDefaults: { 'Government System': 'Classified retention + archival/deletion policy', 'Clinic / EMR': 'Classified retention + archival/deletion policy' }, advanced: true },

  // Backup & disaster recovery
  { id: 'recovery.scope', section: 'recovery', group: 'Backup coverage', label: 'Backup scope', description: 'Back up every production data source needed for restoration, including files/object storage when the database alone is insufficient.', kind: 'choice', defaultValue: 'Database + durable user files', options: [{ value: 'Database only' }, { value: 'Database + durable user files' }, { value: 'Database + files + critical configuration' }], appDefaults: { 'Government System': 'Database + files + critical configuration', 'Clinic / EMR': 'Database + files + critical configuration' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.frequency', section: 'recovery', group: 'Backup coverage', label: 'Backup frequency', description: 'Set backup/PITR frequency based on how much recent data the business can realistically afford to lose.', kind: 'choice', defaultValue: 'Daily + provider snapshots', options: [{ value: 'Weekly' }, { value: 'Daily + provider snapshots' }, { value: 'Frequent / point-in-time recovery' }], appDefaults: { 'Government System': 'Frequent / point-in-time recovery', 'Clinic / EMR': 'Frequent / point-in-time recovery', 'E-commerce': 'Frequent / point-in-time recovery', 'Booking / Scheduling': 'Frequent / point-in-time recovery' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.retention', section: 'recovery', group: 'Backup coverage', label: 'Backup retention', description: 'Retain enough generations to recover from both recent mistakes and slower-discovered corruption.', kind: 'choice', defaultValue: 'Rolling multi-week retention', options: [{ value: 'Latest only' }, { value: 'Rolling multi-week retention' }, { value: 'Tiered daily/weekly/monthly retention' }], appDefaults: { 'Government System': 'Tiered daily/weekly/monthly retention', 'Clinic / EMR': 'Tiered daily/weekly/monthly retention' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.offsite', section: 'recovery', group: 'Backup coverage', label: 'Failure-domain separation', description: 'Avoid keeping every backup in the same single failure domain/account as the live system.', kind: 'choice', defaultValue: 'Provider-independent/failure-domain copy where practical', options: [{ value: 'Same service only' }, { value: 'Separate backup location/account' }, { value: 'Provider-independent/failure-domain copy where practical' }], appDefaults: { 'Government System': 'Provider-independent/failure-domain copy where practical', 'Clinic / EMR': 'Provider-independent/failure-domain copy where practical' }, advanced: true, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.encryption', section: 'recovery', group: 'Backup security', label: 'Backup encryption', description: 'Encrypt backups in transit/at rest and protect backup keys/access separately from normal application use.', kind: 'choice', defaultValue: 'Encrypted + restricted access', options: [{ value: 'Provider default encryption' }, { value: 'Encrypted + restricted access' }, { value: 'Encrypted + separate key/access controls' }], appDefaults: { 'Government System': 'Encrypted + separate key/access controls', 'Clinic / EMR': 'Encrypted + separate key/access controls' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.access', section: 'recovery', group: 'Backup security', label: 'Backup access control', description: 'Limit who can download, delete, or restore backups and audit privileged backup actions.', kind: 'choice', defaultValue: 'Restricted admin role', options: [{ value: 'Normal admin access' }, { value: 'Restricted admin role' }, { value: 'Restricted + MFA + audit' }], appDefaults: { 'Government System': 'Restricted + MFA + audit', 'Clinic / EMR': 'Restricted + MFA + audit' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.verify', section: 'recovery', group: 'Restore confidence', label: 'Backup verification', description: 'Verify jobs completed and backups are readable rather than trusting “backup scheduled” as proof of recovery.', kind: 'choice', defaultValue: 'Automated success/failure checks', options: [{ value: 'Manual spot checks' }, { value: 'Automated success/failure checks' }, { value: 'Automated integrity checks + alerts' }], appDefaults: { 'Government System': 'Automated integrity checks + alerts', 'Clinic / EMR': 'Automated integrity checks + alerts' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.restoreTest', section: 'recovery', group: 'Restore confidence', label: 'Restore testing', description: 'Regularly prove a backup can restore into a safe environment and document the actual recovery steps.', kind: 'choice', defaultValue: 'Periodic restore drill', options: [{ value: 'Only during real incident' }, { value: 'Periodic restore drill' }, { value: 'Scheduled restore drill + evidence' }], appDefaults: { 'Government System': 'Scheduled restore drill + evidence', 'Clinic / EMR': 'Scheduled restore drill + evidence' }, profileDefaults: { Minimal: 'Only during real incident', Advanced: 'Scheduled restore drill + evidence' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.rpo', section: 'recovery', group: 'Recovery objectives', label: 'Recovery point objective', description: 'State the maximum tolerable data-loss window so backup/PITR design has a concrete target.', kind: 'choice', defaultValue: 'Up to 24 hours', options: [{ value: 'Up to 7 days' }, { value: 'Up to 24 hours' }, { value: 'Up to 1 hour' }, { value: 'Minutes / near-continuous' }], appDefaults: { 'Government System': 'Up to 1 hour', 'Clinic / EMR': 'Up to 1 hour', 'Booking / Scheduling': 'Up to 1 hour', 'E-commerce': 'Up to 1 hour' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.rto', section: 'recovery', group: 'Recovery objectives', label: 'Recovery time objective', description: 'State how quickly the service should be restored after a major failure so architecture/runbooks match reality.', kind: 'choice', defaultValue: 'Within one business day', options: [{ value: 'Several days acceptable' }, { value: 'Within one business day' }, { value: 'Within a few hours' }, { value: 'High-availability / rapid failover' }], appDefaults: { 'Clinic / EMR': 'Within a few hours', 'Booking / Scheduling': 'Within a few hours', 'E-commerce': 'Within a few hours' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.runbook', section: 'recovery', group: 'Recovery objectives', label: 'Disaster-recovery runbook', description: 'Document the shortest reliable restore/failover sequence, dependencies, owners, and validation steps.', kind: 'choice', defaultValue: 'Documented restore runbook', options: [{ value: 'Tribal knowledge' }, { value: 'Documented restore runbook' }, { value: 'Runbook + rehearsed roles/escalation' }], appDefaults: { 'Government System': 'Runbook + rehearsed roles/escalation', 'Clinic / EMR': 'Runbook + rehearsed roles/escalation' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.manualSnapshot', section: 'recovery', group: 'Operational safety', label: 'Pre-change manual snapshot', description: 'Allow an intentional snapshot/export before high-risk migrations or bulk administrative changes.', kind: 'choice', defaultValue: 'Before high-risk changes', options: [{ value: 'Off' }, { value: 'Before high-risk changes' }, { value: 'Standard release/migration procedure' }], appDefaults: { 'Government System': 'Standard release/migration procedure', 'Clinic / EMR': 'Standard release/migration procedure' }, advanced: true, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.deleteProtection', section: 'recovery', group: 'Operational safety', label: 'Backup deletion protection', description: 'Prevent one compromised/accidental admin action from deleting live data and every useful backup at once.', kind: 'choice', defaultValue: 'Separate permissions / retention locks where available', options: [{ value: 'Normal admin can delete' }, { value: 'Separate permissions / retention locks where available' }, { value: 'Immutable/locked recovery copies where justified' }], appDefaults: { 'Government System': 'Immutable/locked recovery copies where justified', 'Clinic / EMR': 'Immutable/locked recovery copies where justified' }, advanced: true, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },
  { id: 'recovery.alerts', section: 'recovery', group: 'Operational safety', label: 'Backup failure alerts', description: 'Notify an operator when scheduled backup/replication jobs fail or fall behind instead of discovering it during restoration.', kind: 'choice', defaultValue: 'Alert after failed/missed backup', options: [{ value: 'Manual checking' }, { value: 'Alert after failed/missed backup' }, { value: 'Alert + escalation after repeated failure' }], appDefaults: { 'Government System': 'Alert + escalation after repeated failure', 'Clinic / EMR': 'Alert + escalation after repeated failure' }, dependsOn: { id: 'quality.backups', equals: ['Daily', 'Frequent + retention policy', 'Point-in-time recovery'] } },

  // Deployment & engineering
  { id: 'eng.environments', section: 'engineering', group: 'Environments', label: 'Environment separation', description: 'Separate development, test/staging, and production data/config so experiments cannot mutate live operations.', kind: 'choice', defaultValue: 'Development + production', options: [{ value: 'Single environment' }, { value: 'Development + production' }, { value: 'Development + staging + production' }], appDefaults: { 'Government System': 'Development + staging + production', 'Clinic / EMR': 'Development + staging + production', 'SaaS / Client Portal': 'Development + staging + production' }, profileDefaults: { Minimal: 'Development + production', Advanced: 'Development + staging + production' } },
  { id: 'eng.preview', section: 'engineering', group: 'Environments', label: 'Preview deployments', description: 'Create isolated preview builds for meaningful changes without pointing previews at production secrets/data.', kind: 'choice', defaultValue: 'Per pull request where supported', options: [{ value: 'Off' }, { value: 'Manual preview' }, { value: 'Per pull request where supported' }], appDefaults: { 'Clinic / EMR': 'Manual preview' }, profileDefaults: { Minimal: 'Off', Advanced: 'Per pull request where supported' }, advanced: true },
  { id: 'eng.envValidation', section: 'engineering', group: 'Environments', label: 'Environment-variable validation', description: 'Fail startup/build clearly when required configuration is missing or malformed instead of failing later in a user workflow.', kind: 'choice', defaultValue: 'Typed/schema validation', options: [{ value: 'Runtime undefined checks' }, { value: 'Typed/schema validation' }, { value: 'Typed validation + generated config documentation' }] },
  { id: 'eng.secretSeparation', section: 'engineering', group: 'Environments', label: 'Per-environment secrets', description: 'Use separate credentials for dev/staging/production so a lower environment cannot access production services by accident.', kind: 'choice', defaultValue: 'Separate production credentials', options: [{ value: 'Shared credentials' }, { value: 'Separate production credentials' }, { value: 'Separate credentials for every environment' }], appDefaults: { 'Government System': 'Separate credentials for every environment', 'Clinic / EMR': 'Separate credentials for every environment' } },
  { id: 'eng.dbEngine', section: 'engineering', group: 'Database', label: 'Production database class', description: 'Choose the persistence class appropriate to the product rather than defaulting every app to the same database shape.', kind: 'choice', defaultValue: 'Managed relational database', options: [{ value: 'Static/no persistent DB' }, { value: 'SQLite / embedded' }, { value: 'Managed relational database' }, { value: 'Self-managed relational database' }, { value: 'Document/NoSQL where justified' }], appDefaults: { 'Portfolio / Marketing': 'Static/no persistent DB', 'Clinic / EMR': 'Managed relational database', 'Government System': 'Managed relational database', 'Inventory / POS': 'Managed relational database' } },
  { id: 'eng.dbPooling', section: 'engineering', group: 'Database', label: 'Database connection pooling', description: 'Use connection pooling appropriate to serverless/process concurrency to avoid exhausting database connections.', kind: 'choice', defaultValue: 'Managed/application pooling', options: [{ value: 'Direct connections' }, { value: 'Managed/application pooling' }, { value: 'Pooling + connection-budget monitoring' }], appDefaults: { 'SaaS / Client Portal': 'Pooling + connection-budget monitoring', 'E-commerce': 'Pooling + connection-budget monitoring' }, advanced: true, dependsOn: { id: 'eng.dbEngine', equals: ['Managed relational database', 'Self-managed relational database', 'Document/NoSQL where justified'] } },
  { id: 'eng.migrations', section: 'engineering', group: 'Database', label: 'Schema migration strategy', description: 'Version schema changes, apply them predictably, and avoid editing production schema manually.', kind: 'choice', defaultValue: 'Versioned migrations', options: [{ value: 'Manual schema edits' }, { value: 'Versioned migrations' }, { value: 'Versioned + expand/migrate/contract for risky changes' }], appDefaults: { 'Government System': 'Versioned + expand/migrate/contract for risky changes', 'Clinic / EMR': 'Versioned + expand/migrate/contract for risky changes' }, dependsOn: { id: 'eng.dbEngine', equals: ['SQLite / embedded', 'Managed relational database', 'Self-managed relational database', 'Document/NoSQL where justified'] } },
  { id: 'eng.migrationGate', section: 'engineering', group: 'Database', label: 'Production migration gate', description: 'Require a backup/compatibility/review step before destructive or long-running production schema/data migrations.', kind: 'choice', defaultValue: 'Review risky migrations', options: [{ value: 'Deploy automatically always' }, { value: 'Review risky migrations' }, { value: 'Explicit approval + backup/rollback plan' }], appDefaults: { 'Government System': 'Explicit approval + backup/rollback plan', 'Clinic / EMR': 'Explicit approval + backup/rollback plan' }, dependsOn: { id: 'eng.dbEngine', equals: ['SQLite / embedded', 'Managed relational database', 'Self-managed relational database', 'Document/NoSQL where justified'] } },
  { id: 'eng.seedData', section: 'engineering', group: 'Database', label: 'Seed/test data strategy', description: 'Keep deterministic reference/demo/test data scripts separate from real production data.', kind: 'choice', defaultValue: 'Deterministic development/test seeds', options: [{ value: 'Manual setup' }, { value: 'Deterministic development/test seeds' }, { value: 'Seed + anonymized fixtures/factories' }], profileDefaults: { Minimal: 'Manual setup', Advanced: 'Seed + anonymized fixtures/factories' }, advanced: true, dependsOn: { id: 'eng.dbEngine', equals: ['SQLite / embedded', 'Managed relational database', 'Self-managed relational database', 'Document/NoSQL where justified'] } },
  { id: 'eng.deployStrategy', section: 'engineering', group: 'Deployment', label: 'Deployment strategy', description: 'Define how a new release replaces the old one and how in-flight users/requests are protected.', kind: 'choice', defaultValue: 'Rolling / platform atomic deploy', options: [{ value: 'Stop-build-start' }, { value: 'Rolling / platform atomic deploy' }, { value: 'Blue-green / canary where justified' }], appDefaults: { 'Booking / Scheduling': 'Blue-green / canary where justified', 'E-commerce': 'Blue-green / canary where justified', 'Clinic / EMR': 'Rolling / platform atomic deploy' } },
  { id: 'eng.zeroDowntime', section: 'engineering', group: 'Deployment', label: 'Zero-downtime expectation', description: 'Keep routine releases from requiring user-visible downtime when the product is operationally critical.', kind: 'choice', defaultValue: 'Best effort zero-downtime', options: [{ value: 'Maintenance window acceptable' }, { value: 'Best effort zero-downtime' }, { value: 'Required for routine deploys' }], appDefaults: { 'Booking / Scheduling': 'Required for routine deploys', 'E-commerce': 'Required for routine deploys', 'Clinic / EMR': 'Best effort zero-downtime' } },
  { id: 'eng.rollback', section: 'engineering', group: 'Deployment', label: 'Release rollback', description: 'Keep a fast path to restore the previous application release when smoke checks or monitoring show regression.', kind: 'choice', defaultValue: 'One-step previous-release rollback', options: [{ value: 'Rebuild/redeploy manually' }, { value: 'One-step previous-release rollback' }, { value: 'Automated rollback trigger for severe health regression' }], appDefaults: { 'SaaS / Client Portal': 'Automated rollback trigger for severe health regression', 'E-commerce': 'Automated rollback trigger for severe health regression' } },
  { id: 'eng.region', section: 'engineering', group: 'Deployment', label: 'Primary deployment region', description: 'Select region deliberately based on users, database location, data residency, latency, and operational support.', kind: 'choice', defaultValue: 'Near primary users + database', options: [{ value: 'Provider default' }, { value: 'Near primary users + database' }, { value: 'Explicit residency/latency decision documented' }], appDefaults: { 'Government System': 'Explicit residency/latency decision documented', 'Clinic / EMR': 'Explicit residency/latency decision documented' } },
  { id: 'eng.dataResidency', section: 'engineering', group: 'Deployment', label: 'Data-residency requirement', description: 'Record whether application data/backups must remain in a particular country/region/provider boundary.', kind: 'choice', defaultValue: 'No special requirement unless mandated', options: [{ value: 'No special requirement unless mandated' }, { value: 'Preferred region' }, { value: 'Strict residency boundary' }], appDefaults: { 'Government System': 'Preferred region', 'Clinic / EMR': 'Preferred region' }, advanced: true },
  { id: 'eng.cicd', section: 'engineering', group: 'CI/CD', label: 'CI/CD posture', description: 'Automate repeatable build/check/deploy steps instead of relying on an operator remembering the right sequence.', kind: 'choice', defaultValue: 'Automated checks + controlled deploy', options: [{ value: 'Manual local deploy' }, { value: 'Automated build/checks' }, { value: 'Automated checks + controlled deploy' }, { value: 'Full pipeline + gated production promotion' }], appDefaults: { 'Government System': 'Full pipeline + gated production promotion', 'Clinic / EMR': 'Full pipeline + gated production promotion' }, profileDefaults: { Minimal: 'Automated build/checks', Advanced: 'Full pipeline + gated production promotion' } },
  { id: 'eng.branchProtection', section: 'engineering', group: 'CI/CD', label: 'Protected production branch', description: 'Prevent direct accidental production-branch changes and require passing checks/review as appropriate.', kind: 'choice', defaultValue: 'Require checks before merge', options: [{ value: 'Direct pushes allowed' }, { value: 'Require checks before merge' }, { value: 'Checks + review + protected release path' }], appDefaults: { 'Government System': 'Checks + review + protected release path', 'Clinic / EMR': 'Checks + review + protected release path' } },
  { id: 'eng.buildGate', section: 'engineering', group: 'CI/CD', label: 'Production build gate', description: 'A release should not promote if type/build/schema/static checks fail.', kind: 'choice', defaultValue: 'Build + typecheck required', options: [{ value: 'Build only' }, { value: 'Build + typecheck required' }, { value: 'Build + typecheck + lint/static checks' }] },
  { id: 'eng.deployApproval', section: 'engineering', group: 'CI/CD', label: 'Production deploy approval', description: 'Decide whether passing changes deploy automatically or require an explicit human promotion step.', kind: 'choice', defaultValue: 'Manual promote for production', options: [{ value: 'Automatic after checks' }, { value: 'Manual promote for production' }, { value: 'Approval required for high-risk releases only' }], appDefaults: { 'Portfolio / Marketing': 'Automatic after checks', 'Government System': 'Manual promote for production', 'Clinic / EMR': 'Manual promote for production' } },
  { id: 'eng.smokeAfterDeploy', section: 'engineering', group: 'CI/CD', label: 'Post-deploy smoke check', description: 'Verify the deployed app, database connectivity, and one or more critical entry workflows immediately after release.', kind: 'choice', defaultValue: 'Automated health + critical smoke', options: [{ value: 'Manual page check' }, { value: 'Automated health + critical smoke' }, { value: 'Automated smoke + rollback gate' }], appDefaults: { 'Booking / Scheduling': 'Automated smoke + rollback gate', 'E-commerce': 'Automated smoke + rollback gate' } },
  { id: 'eng.featureFlags', section: 'engineering', group: 'Release safety', label: 'Feature flags', description: 'Use flags for risky/staged features when rollback via deploy alone is too coarse; avoid permanent flag clutter.', kind: 'choice', defaultValue: 'Only for risky/staged changes', options: [{ value: 'Off' }, { value: 'Only for risky/staged changes' }, { value: 'Managed rollout / percentage targeting' }], appDefaults: { 'SaaS / Client Portal': 'Managed rollout / percentage targeting' }, profileDefaults: { Minimal: 'Off', Advanced: 'Managed rollout / percentage targeting' }, advanced: true },
  { id: 'eng.maintenanceMode', section: 'engineering', group: 'Release safety', label: 'Maintenance mode', description: 'Provide a controlled maintenance/degraded mode for operations that truly require write suspension or planned downtime.', kind: 'choice', defaultValue: 'Admin-controlled maintenance mode', options: [{ value: 'Off' }, { value: 'Admin-controlled maintenance mode' }, { value: 'Read-only/degraded maintenance modes' }], appDefaults: { 'Government System': 'Read-only/degraded maintenance modes', 'Clinic / EMR': 'Read-only/degraded maintenance modes' } },
  { id: 'eng.pwaManifest', section: 'engineering', group: 'PWA & offline', label: 'PWA manifest/icons', description: 'When PWA is enabled, provide production-quality manifest metadata, icons, theme/start behavior, and installability checks.', kind: 'choice', defaultValue: 'Complete installable manifest', options: [{ value: 'Basic manifest' }, { value: 'Complete installable manifest' }, { value: 'Installability regression checked' }], dependsOn: { id: 'platform.pwa', equals: true } },
  { id: 'eng.pwaUpdates', section: 'engineering', group: 'PWA & offline', label: 'PWA update strategy', description: 'Avoid leaving users on stale app code indefinitely; define when new service-worker/app versions activate.', kind: 'choice', defaultValue: 'Prompt or safe reload for new version', options: [{ value: 'Activate immediately' }, { value: 'Prompt or safe reload for new version' }, { value: 'Version-aware update with unsaved-work protection' }], dependsOn: { id: 'platform.pwa', equals: true }, appDefaults: { 'Inventory / POS': 'Version-aware update with unsaved-work protection' } },
  { id: 'eng.offlineConflict', section: 'engineering', group: 'PWA & offline', label: 'Offline-write conflict handling', description: 'If offline writes exist, define how conflicts, stale data, duplicate submissions, and failed sync are surfaced.', kind: 'choice', defaultValue: 'Explicit conflict/retry UI', options: [{ value: 'Last write wins silently' }, { value: 'Explicit conflict/retry UI' }, { value: 'Domain-specific merge/review workflow' }], dependsOn: { id: 'platform.offline', equals: 'Offline write + sync' }, appDefaults: { 'Inventory / POS': 'Domain-specific merge/review workflow' } },

  // Testing & compatibility
  { id: 'test.strategy', section: 'testing', group: 'Test pyramid', label: 'Overall test strategy', description: 'Use a balanced set of fast focused tests plus realistic workflow tests rather than chasing one coverage number.', kind: 'choice', defaultValue: 'Unit + integration + critical E2E', options: [{ value: 'Smoke/manual only' }, { value: 'Unit + integration + critical E2E' }, { value: 'Risk-based comprehensive suite' }], appDefaults: { 'Government System': 'Risk-based comprehensive suite', 'Clinic / EMR': 'Risk-based comprehensive suite' }, profileDefaults: { Minimal: 'Smoke/manual only', Advanced: 'Risk-based comprehensive suite' } },
  { id: 'test.unit', section: 'testing', group: 'Test pyramid', label: 'Unit tests', description: 'Cover deterministic business rules, calculations, parsers, formatters, and pure permission/state logic with fast tests.', kind: 'choice', defaultValue: 'Business rules + utilities', options: [{ value: 'Minimal' }, { value: 'Business rules + utilities' }, { value: 'Broad domain logic coverage' }] },
  { id: 'test.integration', section: 'testing', group: 'Test pyramid', label: 'Integration tests', description: 'Exercise database/service boundaries for flows where mocks would hide schema, transaction, or provider-contract bugs.', kind: 'choice', defaultValue: 'Critical data/service boundaries', options: [{ value: 'Minimal' }, { value: 'Critical data/service boundaries' }, { value: 'Broad repository/API integration coverage' }], appDefaults: { 'Government System': 'Broad repository/API integration coverage', 'Clinic / EMR': 'Broad repository/API integration coverage' } },
  { id: 'test.e2e', section: 'testing', group: 'Test pyramid', label: 'End-to-end tests', description: 'Protect the small set of workflows that must work from browser/request through persisted outcome.', kind: 'choice', defaultValue: 'Critical journeys', options: [{ value: 'Smoke only' }, { value: 'Critical journeys' }, { value: 'Critical + role-specific journeys' }], appDefaults: { 'Government System': 'Critical + role-specific journeys', 'Clinic / EMR': 'Critical + role-specific journeys', 'Booking / Scheduling': 'Critical + role-specific journeys' } },
  { id: 'test.authz', section: 'testing', group: 'Security tests', label: 'Authorization tests', description: 'Test forbidden cross-role/tenant/ownership access, not only happy-path visibility in the UI.', kind: 'choice', defaultValue: 'Critical permission matrix', options: [{ value: 'Manual spot checks' }, { value: 'Critical permission matrix' }, { value: 'Systematic role/tenant/ownership matrix' }], appDefaults: { 'Government System': 'Systematic role/tenant/ownership matrix', 'Clinic / EMR': 'Systematic role/tenant/ownership matrix', 'SaaS / Client Portal': 'Systematic role/tenant/ownership matrix' } },
  { id: 'test.security', section: 'testing', group: 'Security tests', label: 'Security regression tests', description: 'Automate representative CSRF/auth/session/upload/input/rate-limit/security-header checks where they are stable and meaningful.', kind: 'choice', defaultValue: 'Critical controls', options: [{ value: 'Manual only' }, { value: 'Critical controls' }, { value: 'Critical controls + automated scanning' }], appDefaults: { 'Government System': 'Critical controls + automated scanning', 'Clinic / EMR': 'Critical controls + automated scanning' }, profileDefaults: { Minimal: 'Manual only', Advanced: 'Critical controls + automated scanning' } },
  { id: 'test.accessibility', section: 'testing', group: 'Experience tests', label: 'Accessibility regression tests', description: 'Combine automated accessibility smoke tests with manual keyboard/screen-reader checks for critical workflows.', kind: 'choice', defaultValue: 'Automated + manual critical flows', options: [{ value: 'Manual spot checks' }, { value: 'Automated smoke' }, { value: 'Automated + manual critical flows' }], appDefaults: { 'Government System': 'Automated + manual critical flows', 'Clinic / EMR': 'Automated + manual critical flows' } },
  { id: 'test.responsive', section: 'testing', group: 'Experience tests', label: 'Responsive/mobile tests', description: 'Test real phone-sized layouts and touch/keyboard behavior for the workflows users actually perform on mobile.', kind: 'choice', defaultValue: 'Representative mobile workflows', options: [{ value: 'Browser resize only' }, { value: 'Representative mobile workflows' }, { value: 'Mobile + tablet + orientation matrix' }], appDefaults: { 'Booking / Scheduling': 'Mobile + tablet + orientation matrix', 'E-commerce': 'Mobile + tablet + orientation matrix' } },
  { id: 'test.visual', section: 'testing', group: 'Experience tests', label: 'Visual regression', description: 'Use screenshot/component visual regression only where layout regressions are costly; avoid brittle snapshots everywhere.', kind: 'choice', defaultValue: 'Key templates/components only', options: [{ value: 'Off' }, { value: 'Key templates/components only' }, { value: 'Broad component/template visual suite' }], appDefaults: { 'Portfolio / Marketing': 'Broad component/template visual suite' }, profileDefaults: { Minimal: 'Off', Advanced: 'Broad component/template visual suite' }, advanced: true },
  { id: 'test.performance', section: 'testing', group: 'Performance tests', label: 'Performance regression tests', description: 'Catch unexpectedly slower pages/endpoints/bundles before production when the app has meaningful performance targets.', kind: 'choice', defaultValue: 'Critical page/API checks', options: [{ value: 'Off' }, { value: 'Critical page/API checks' }, { value: 'Budgets + regression gates' }], appDefaults: { 'Portfolio / Marketing': 'Budgets + regression gates', 'E-commerce': 'Budgets + regression gates' }, profileDefaults: { Minimal: 'Off', Advanced: 'Budgets + regression gates' } },
  { id: 'test.load', section: 'testing', group: 'Performance tests', label: 'Load/concurrency testing', description: 'Exercise concurrency-sensitive flows such as bookings, checkout, inventory reservations, queues, and reporting before peak use.', kind: 'choice', defaultValue: 'Critical concurrency flows only', options: [{ value: 'Off' }, { value: 'Critical concurrency flows only' }, { value: 'Capacity/load scenarios against target' }], appDefaults: { 'Booking / Scheduling': 'Capacity/load scenarios against target', 'E-commerce': 'Capacity/load scenarios against target', 'Inventory / POS': 'Critical concurrency flows only' }, advanced: true },
  { id: 'test.payment', section: 'testing', group: 'Domain integrations', label: 'Payment flow tests', description: 'Test success, failure, pending, cancellation, webhook delay/duplicate, refund, and reconciliation paths when payments exist.', kind: 'choice', defaultValue: 'Provider sandbox + webhook scenarios', options: [{ value: 'Happy path only' }, { value: 'Provider sandbox + webhook scenarios' }, { value: 'Full failure/refund/reconciliation matrix' }], dependsOn: { id: 'pack.payments', equals: true }, appDefaults: { 'E-commerce': 'Full failure/refund/reconciliation matrix', 'Booking / Scheduling': 'Full failure/refund/reconciliation matrix' } },
  { id: 'test.webhooks', section: 'testing', group: 'Domain integrations', label: 'Webhook contract tests', description: 'Test signature verification, duplicate events, retries, ordering assumptions, version changes, and unavailable receivers.', kind: 'choice', defaultValue: 'Signature + duplicate + retry cases', options: [{ value: 'Happy path only' }, { value: 'Signature + duplicate + retry cases' }, { value: 'Full contract/replay/failure suite' }], dependsOn: { id: 'platform.webhooks', equals: ['Incoming', 'Outgoing', 'Incoming + outgoing'] }, profileDefaults: { Advanced: 'Full contract/replay/failure suite' } },
  { id: 'test.migrations', section: 'testing', group: 'Data & recovery tests', label: 'Migration tests', description: 'Apply migrations against representative prior schema/data states and verify application compatibility before production.', kind: 'choice', defaultValue: 'Apply on test database before production', options: [{ value: 'Production first' }, { value: 'Apply on test database before production' }, { value: 'Migration regression fixtures + rollback/forward plan' }], appDefaults: { 'Government System': 'Migration regression fixtures + rollback/forward plan', 'Clinic / EMR': 'Migration regression fixtures + rollback/forward plan' } },
  { id: 'test.restore', section: 'testing', group: 'Data & recovery tests', label: 'Backup restore verification in tests', description: 'Treat restoration as a tested operational capability rather than assuming provider backups are sufficient.', kind: 'choice', defaultValue: 'Periodic operational test', options: [{ value: 'Not part of testing' }, { value: 'Periodic operational test' }, { value: 'Scheduled restore drill in isolated environment' }], appDefaults: { 'Government System': 'Scheduled restore drill in isolated environment', 'Clinic / EMR': 'Scheduled restore drill in isolated environment' } },
  { id: 'test.testData', section: 'testing', group: 'Data & recovery tests', label: 'Test-data privacy', description: 'Use synthetic/anonymized fixtures in nonproduction environments instead of copying live sensitive datasets casually.', kind: 'choice', defaultValue: 'Synthetic/seeded data', options: [{ value: 'Production copies allowed' }, { value: 'Synthetic/seeded data' }, { value: 'Synthetic + approved anonymization workflow' }], appDefaults: { 'Government System': 'Synthetic + approved anonymization workflow', 'Clinic / EMR': 'Synthetic + approved anonymization workflow' } },
  { id: 'test.browser', section: 'testing', group: 'Browser & device support', label: 'Desktop browser support', description: 'Define the mainstream desktop browsers/releases the product must support and verify before release.', kind: 'choice', defaultValue: 'Current Chrome/Edge/Firefox/Safari', options: [{ value: 'Chromium only' }, { value: 'Current Chrome/Edge/Firefox/Safari' }, { value: 'Current + previous major mainstream versions' }], appDefaults: { 'Government System': 'Current + previous major mainstream versions' } },
  { id: 'test.mobileBrowser', section: 'testing', group: 'Browser & device support', label: 'Mobile browser support', description: 'Include Safari on iOS and Chrome/Android where mobile use matters; desktop emulation alone is insufficient.', kind: 'choice', defaultValue: 'iOS Safari + Android Chrome', options: [{ value: 'Responsive layout only' }, { value: 'iOS Safari + Android Chrome' }, { value: 'Real-device smoke matrix' }], appDefaults: { 'Booking / Scheduling': 'Real-device smoke matrix', 'E-commerce': 'Real-device smoke matrix' } },
  { id: 'test.tablet', section: 'testing', group: 'Browser & device support', label: 'Tablet support', description: 'Define whether tablet layouts/rotation need explicit testing rather than inheriting phone/desktop assumptions.', kind: 'choice', defaultValue: 'Responsive best effort', options: [{ value: 'Not targeted' }, { value: 'Responsive best effort' }, { value: 'Explicit tablet workflows' }], appDefaults: { 'Clinic / EMR': 'Explicit tablet workflows', 'Inventory / POS': 'Explicit tablet workflows' } },
  { id: 'test.slowNetwork', section: 'testing', group: 'Browser & device support', label: 'Slow/unstable network testing', description: 'Verify loading, retry, duplicate-submit, offline, and recovery UX under realistic mobile/poor connectivity.', kind: 'choice', defaultValue: 'Critical flows under throttled network', options: [{ value: 'Off' }, { value: 'Critical flows under throttled network' }, { value: 'Critical + offline/reconnect scenarios' }], appDefaults: { 'Booking / Scheduling': 'Critical + offline/reconnect scenarios', 'Inventory / POS': 'Critical + offline/reconnect scenarios' } },
  { id: 'test.lowPower', section: 'testing', group: 'Browser & device support', label: 'Lower-powered device testing', description: 'Check animation-heavy, large-table, scanning, or rich UI on modest devices when the audience may use older hardware.', kind: 'choice', defaultValue: 'Spot-check representative modest device', options: [{ value: 'Off' }, { value: 'Spot-check representative modest device' }, { value: 'Explicit low-power performance profile' }], appDefaults: { 'Government System': 'Explicit low-power performance profile', 'Inventory / POS': 'Explicit low-power performance profile' }, advanced: true },
  { id: 'test.print', section: 'testing', group: 'Browser & device support', label: 'Print regression', description: 'When printable slips/reports/forms matter, test page breaks, A4/Letter sizing, hidden navigation, and print-only metadata.', kind: 'choice', defaultValue: 'Important printable outputs', options: [{ value: 'Off' }, { value: 'Important printable outputs' }, { value: 'All official printable templates' }], appDefaults: { 'Government System': 'All official printable templates', 'Clinic / EMR': 'All official printable templates' } },
  { id: 'test.releaseChecklist', section: 'testing', group: 'Release confidence', label: 'Release smoke checklist', description: 'Keep a short repeatable release check focused on critical flows, not a massive manual checklist nobody follows.', kind: 'choice', defaultValue: 'Short critical-path checklist', options: [{ value: 'Ad hoc' }, { value: 'Short critical-path checklist' }, { value: 'Automated smoke + short human checklist' }], appDefaults: { 'Government System': 'Automated smoke + short human checklist', 'Clinic / EMR': 'Automated smoke + short human checklist' } },
]


export const configSettings: ConfigSetting[] = [
  ...phase4Settings,
  ...phase5Settings,
  ...phase6Settings,
  ...phase7Settings,
  // Product shape
  {
    id: 'app.accessShape', section: 'identity', group: 'Access shape', label: 'Overall access shape', description: 'Whether the product is primarily public, private, or intentionally mixes public and protected areas.', kind: 'choice', defaultValue: 'Mixed public + private',
    options: [{ value: 'Public' }, { value: 'Mixed public + private' }, { value: 'Private' }],
    appDefaults: { 'Portfolio / Marketing': 'Public', 'Directory / Marketplace': 'Public', 'Government System': 'Private', 'Clinic / EMR': 'Private', 'Internal / Operations': 'Private', 'Inventory / POS': 'Private', 'Tournament / Event': 'Mixed public + private', 'Booking / Scheduling': 'Mixed public + private', 'E-commerce': 'Public' },
    profileDefaults: { Minimal: 'Public' }, keywords: ['public', 'private', 'protected', 'access'],
  },
  {
    id: 'app.audience', section: 'identity', group: 'Access shape', label: 'Primary audience', description: 'The audience whose workflow should win when tradeoffs appear.', kind: 'choice', defaultValue: 'Mixed users',
    options: [{ value: 'Single owner' }, { value: 'Internal team' }, { value: 'Customers / members' }, { value: 'Public visitors' }, { value: 'Mixed users' }],
    appDefaults: { 'Portfolio / Marketing': 'Public visitors', 'Internal / Operations': 'Internal team', 'Government System': 'Internal team', 'Clinic / EMR': 'Internal team', 'Inventory / POS': 'Internal team', 'SaaS / Client Portal': 'Customers / members', 'E-commerce': 'Customers / members', 'Directory / Marketplace': 'Public visitors' },
  },
  {
    id: 'app.primarySurface', section: 'identity', group: 'Product structure', label: 'Primary product surface', description: 'Whether the experience is mainly a public website, a signed-in product, or both with equal importance.', kind: 'choice', defaultValue: 'Hybrid site + app',
    options: [{ value: 'Public website' }, { value: 'Signed-in app' }, { value: 'Hybrid site + app' }],
    appDefaults: { 'Portfolio / Marketing': 'Public website', 'Directory / Marketplace': 'Public website', 'E-commerce': 'Public website', 'Government System': 'Signed-in app', 'Clinic / EMR': 'Signed-in app', 'Internal / Operations': 'Signed-in app', 'Inventory / POS': 'Signed-in app', 'Booking / Scheduling': 'Hybrid site + app', 'SaaS / Client Portal': 'Hybrid site + app', 'Tournament / Event': 'Hybrid site + app' },
  },
  {
    id: 'app.shell', section: 'identity', group: 'Product structure', label: 'Application shell', description: 'The persistent structural model developers should assume when composing pages.', kind: 'choice', defaultValue: 'Hybrid',
    options: [{ value: 'Website pages' }, { value: 'Persistent app shell' }, { value: 'Hybrid' }],
    appDefaults: { 'Portfolio / Marketing': 'Website pages', 'E-commerce': 'Website pages', 'Directory / Marketplace': 'Website pages', 'Government System': 'Persistent app shell', 'Clinic / EMR': 'Persistent app shell', 'Internal / Operations': 'Persistent app shell', 'Inventory / POS': 'Persistent app shell' },
  },
  {
    id: 'app.startDestination', section: 'identity', group: 'Entry behavior', label: 'Default entry destination', description: 'Where a normal visit should land before role- or deep-link-specific routing takes over.', kind: 'choice', defaultValue: 'Landing page',
    options: [{ value: 'Landing page' }, { value: 'Login' }, { value: 'Dashboard' }, { value: 'Last visited' }, { value: 'Role-based' }],
    appDefaults: { 'Portfolio / Marketing': 'Landing page', 'Directory / Marketplace': 'Landing page', 'E-commerce': 'Landing page', 'Booking / Scheduling': 'Landing page', 'Government System': 'Login', 'Clinic / EMR': 'Login', 'Inventory / POS': 'Login', 'Internal / Operations': 'Dashboard', 'SaaS / Client Portal': 'Dashboard', 'Tournament / Event': 'Landing page' },
  },
  {
    id: 'app.pageDepth', section: 'identity', group: 'Product structure', label: 'Expected page depth', description: 'How deep the information architecture is expected to become before search/breadcrumbs become essential.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Shallow' }, { value: 'Standard' }, { value: 'Deep / hierarchical' }],
    appDefaults: { 'Portfolio / Marketing': 'Shallow', 'Government System': 'Deep / hierarchical', 'Clinic / EMR': 'Deep / hierarchical', 'Internal / Operations': 'Deep / hierarchical' }, profileDefaults: { Minimal: 'Shallow', Advanced: 'Deep / hierarchical' },
  },
  {
    id: 'app.resumeBehavior', section: 'identity', group: 'Entry behavior', label: 'Return-visit behavior', description: 'How much prior location or workspace context should be restored when a user comes back.', kind: 'choice', defaultValue: 'Restore useful context',
    options: [{ value: 'Fresh start' }, { value: 'Restore useful context' }, { value: 'Restore exact workspace state' }],
    appDefaults: { 'Portfolio / Marketing': 'Fresh start', 'Government System': 'Restore useful context', 'Clinic / EMR': 'Restore useful context', 'Internal / Operations': 'Restore exact workspace state' }, profileDefaults: { Minimal: 'Fresh start', Advanced: 'Restore exact workspace state' }, advanced: true,
  },

  // Authentication
  {
    id: 'login.enabled', section: 'access', group: 'Sign-in surface', label: 'Login page', description: 'Require an identified sign-in flow for protected areas.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false }, keywords: ['auth', 'authentication', 'sign in', 'signin'],
  },
  {
    id: 'login.complexity', section: 'access', group: 'Sign-in surface', label: 'Login complexity', description: 'How much assistance and secondary account UI should appear on the login screen.', kind: 'choice', defaultValue: 'Simple',
    options: [{ value: 'Simple' }, { value: 'Detailed' }, { value: 'Complex' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed', 'Clinic / EMR': 'Detailed', 'SaaS / Client Portal': 'Detailed' }, profileDefaults: { Advanced: 'Detailed' },
  },
  {
    id: 'login.identifier', section: 'access', group: 'Sign-in surface', label: 'Primary login identifier', description: 'Primary identifier users enter before their credential.', kind: 'choice', defaultValue: 'Email',
    options: [{ value: 'Email' }, { value: 'Username' }, { value: 'Phone' }, { value: 'Employee ID' }, { value: 'Custom' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Username', 'Clinic / EMR': 'Username', 'Internal / Operations': 'Username' },
  },
  {
    id: 'login.alternateIdentifier', section: 'access', group: 'Sign-in surface', label: 'Alternate identifier', description: 'Allow a second identifier without making the login form ambiguous.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Email or username' }, { value: 'Email or phone' }, { value: 'Username or employee ID' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Email or username', 'E-commerce': 'Email or phone' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'login.method', section: 'access', group: 'Sign-in methods', label: 'Primary sign-in method', description: 'Main authentication method to design and implement first.', kind: 'choice', defaultValue: 'Password',
    options: [{ value: 'Password' }, { value: 'Magic link' }, { value: 'Email OTP' }, { value: 'Phone OTP' }, { value: 'Passkey' }, { value: 'SSO' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Password', 'Government System': 'Password', 'Clinic / EMR': 'Password' },
  },
  {
    id: 'login.passkeyOptional', section: 'access', group: 'Sign-in methods', label: 'Offer passkeys as an additional sign-in method', description: 'Let supported users enroll a phishing-resistant passkey without forcing migration on day one.', kind: 'boolean', defaultValue: false,
    dependsOn: { id: 'login.enabled', equals: true }, appDefaults: { 'SaaS / Client Portal': true }, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'login.magicLinkOptional', section: 'access', group: 'Sign-in methods', label: 'Offer email magic link as fallback', description: 'Provide a passwordless email fallback when it fits the audience and account risk.', kind: 'boolean', defaultValue: false,
    dependsOn: { id: 'login.enabled', equals: true }, appDefaults: { 'SaaS / Client Portal': true }, profileDefaults: { Minimal: false, Advanced: true }, advanced: true,
  },
  {
    id: 'login.social', section: 'access', group: 'Federated sign-in', label: 'Social sign-in', description: 'Allow trusted consumer identity providers in addition to the primary sign-in method.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Google only' }, { value: 'Google + Apple' }, { value: 'Multiple providers' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Google only', 'E-commerce': 'Google + Apple', 'Directory / Marketplace': 'Google only' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'login.enterpriseSso', section: 'access', group: 'Federated sign-in', label: 'Enterprise SSO', description: 'Support organization-managed identity through an external identity provider.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'OIDC' }, { value: 'SAML' }, { value: 'OIDC + SAML' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Off', 'SaaS / Client Portal': 'Off' }, profileDefaults: { Advanced: 'OIDC' }, advanced: true,
  },
  {
    id: 'login.ssoEnforcement', section: 'access', group: 'Federated sign-in', label: 'SSO enforcement', description: 'Whether SSO remains optional or can be required for managed organizations.', kind: 'choice', defaultValue: 'Optional where enabled',
    options: [{ value: 'Optional where enabled' }, { value: 'Organization can require SSO' }, { value: 'SSO-only for managed users' }], dependsOn: { id: 'login.enterpriseSso', equals: ['OIDC', 'SAML', 'OIDC + SAML'] },
    profileDefaults: { Advanced: 'Organization can require SSO' }, advanced: true,
  },
  {
    id: 'login.rememberMe', section: 'access', group: 'Sign-in surface', label: 'Remember me / stay signed in', description: 'Allow a deliberate longer-lived session on trusted personal devices.', kind: 'choice', defaultValue: 'Available',
    options: [{ value: 'Off' }, { value: 'Available' }, { value: 'On by default' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off', 'Internal / Operations': 'Off' }, profileDefaults: { Minimal: 'Available', Advanced: 'Off' },
  },
  {
    id: 'login.genericErrors', section: 'access', group: 'Abuse resistance', label: 'Login error detail', description: 'Avoid revealing whether a username/email exists during failed authentication.', kind: 'choice', defaultValue: 'Generic account-or-credential error',
    options: [{ value: 'Generic account-or-credential error' }, { value: 'Specific account state' }], dependsOn: { id: 'login.enabled', equals: true },
    caution: 'Specific “account not found” messages can make account enumeration easier.', advanced: true,
  },
  {
    id: 'login.rateLimit', section: 'access', group: 'Abuse resistance', label: 'Failed sign-in protection', description: 'Slow automated guessing without permanently locking legitimate users out after a few mistakes.', kind: 'choice', defaultValue: 'Progressive throttling',
    options: [{ value: 'Progressive throttling' }, { value: 'Temporary lockout' }, { value: 'CAPTCHA after risk signal' }, { value: 'Hard lockout' }, { value: 'Off' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Progressive throttling', 'Clinic / EMR': 'Progressive throttling' }, profileDefaults: { Minimal: 'Progressive throttling', Advanced: 'CAPTCHA after risk signal' },
    caution: 'Hard lockout can create denial-of-service and support problems; progressive throttling is usually safer.',
  },
  {
    id: 'login.newDeviceNotice', section: 'access', group: 'Abuse resistance', label: 'New-device sign-in notice', description: 'Notify users about meaningful new-device or unusual sign-ins when account value justifies it.', kind: 'choice', defaultValue: 'Important risk events only',
    options: [{ value: 'Off' }, { value: 'Important risk events only' }, { value: 'Every new device' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Every new device', 'Clinic / EMR': 'Every new device', 'SaaS / Client Portal': 'Every new device' }, profileDefaults: { Minimal: 'Off', Advanced: 'Every new device' }, advanced: true,
  },

  // Registration
  {
    id: 'registration.mode', section: 'access', group: 'Registration', label: 'Registration', description: 'Control whether and how new users can create or receive accounts.', kind: 'choice', defaultValue: 'Open',
    options: [{ value: 'Open' }, { value: 'Invite only' }, { value: 'Admin created' }, { value: 'Approval required' }, { value: 'Disabled' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Admin created', 'Clinic / EMR': 'Admin created', 'Internal / Operations': 'Invite only', 'Inventory / POS': 'Invite only', 'Tournament / Event': 'Admin created', 'Booking / Scheduling': 'Open', 'Portfolio / Marketing': 'Disabled' },
    profileDefaults: { Minimal: 'Disabled' },
  },
  {
    id: 'registration.complexity', section: 'access', group: 'Registration', label: 'Registration complexity', description: 'Keep first signup short unless identity or business rules genuinely require more information.', kind: 'choice', defaultValue: 'Minimal first step',
    options: [{ value: 'Minimal first step' }, { value: 'Standard account details' }, { value: 'Multi-step application' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'Government System': 'Multi-step application', 'SaaS / Client Portal': 'Minimal first step' }, profileDefaults: { Minimal: 'Minimal first step' },
  },
  {
    id: 'registration.profileTiming', section: 'access', group: 'Registration', label: 'Profile details timing', description: 'Collect nonessential profile data after the account exists instead of bloating signup.', kind: 'choice', defaultValue: 'Progressive after signup',
    options: [{ value: 'During signup' }, { value: 'Progressive after signup' }, { value: 'Only when feature needs it' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'Government System': 'During signup', 'Clinic / EMR': 'During signup' },
  },
  {
    id: 'registration.terms', section: 'access', group: 'Registration', label: 'Terms / policy acknowledgement', description: 'Require explicit acknowledgement during signup only when the product actually has applicable terms or policies.', kind: 'choice', defaultValue: 'Where legally / operationally needed',
    options: [{ value: 'Off' }, { value: 'Where legally / operationally needed' }, { value: 'Always require explicit checkbox' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'E-commerce': 'Always require explicit checkbox', 'SaaS / Client Portal': 'Always require explicit checkbox' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'registration.inviteCode', section: 'access', group: 'Registration', label: 'Invite / registration code', description: 'Require a code only when onboarding is intentionally controlled or cohort-based.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Optional referral / invite code' }, { value: 'Required code' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'Internal / Operations': 'Required code' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'registration.duplicateHandling', section: 'access', group: 'Registration', label: 'Existing-account handling', description: 'Guide users toward sign-in or recovery rather than silently creating duplicate identities.', kind: 'choice', defaultValue: 'Detect + route to sign in / recovery',
    options: [{ value: 'Detect + route to sign in / recovery' }, { value: 'Allow duplicate emails where model permits' }, { value: 'Admin review duplicates' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'Government System': 'Admin review duplicates', 'Clinic / EMR': 'Admin review duplicates' }, advanced: true,
  },
  {
    id: 'registration.closedState', section: 'access', group: 'Registration', label: 'Registration closed state', description: 'When signup is unavailable, explain the next valid path instead of leaving a dead form.', kind: 'choice', defaultValue: 'Explain access path',
    options: [{ value: 'Simple unavailable message' }, { value: 'Explain access path' }, { value: 'Waitlist / request access' }], dependsOn: { id: 'login.enabled', equals: true }, advanced: true,
  },

  // Passwords
  {
    id: 'login.forgotPassword', section: 'access', group: 'Passwords', label: 'Forgot password', description: 'Provide a self-service password recovery path.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' },
  },
  {
    id: 'login.showPassword', section: 'access', group: 'Passwords', label: 'Show password control', description: 'Allow users to reveal the password they are entering.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' },
  },
  {
    id: 'login.passwordPolicy', section: 'access', group: 'Passwords', label: 'Password policy', description: 'Recommended favors length, common-password blocking, and password-manager compatibility.', kind: 'choice', defaultValue: 'Modern recommended',
    options: [{ value: 'Modern recommended' }, { value: 'Moderate' }, { value: 'Legacy composition rules' }, { value: 'No restrictions' }], dependsOn: { id: 'login.method', equals: 'Password' },
    caution: 'Legacy composition rules and unrestricted passwords should be deliberate exceptions, not defaults.',
  },
  {
    id: 'password.minimumLength', section: 'access', group: 'Passwords', label: 'Minimum password length', description: 'Use a long minimum when password is the only factor; shorter minimums may be acceptable when MFA is always required.', kind: 'choice', defaultValue: '15 characters for single-factor',
    options: [{ value: '8 characters' }, { value: '12 characters' }, { value: '15 characters for single-factor' }, { value: 'Custom' }], dependsOn: { id: 'login.method', equals: 'Password' },
    appDefaults: { 'Government System': '15 characters for single-factor', 'Clinic / EMR': '15 characters for single-factor' }, profileDefaults: { Minimal: '12 characters' }, advanced: true,
  },
  {
    id: 'password.maximumLength', section: 'access', group: 'Passwords', label: 'Maximum password length', description: 'Permit long passphrases and password-manager output instead of truncating strong credentials.', kind: 'choice', defaultValue: 'At least 64 characters',
    options: [{ value: 'At least 64 characters' }, { value: '128+ characters' }, { value: 'Custom' }], dependsOn: { id: 'login.method', equals: 'Password' }, advanced: true,
  },
  {
    id: 'password.blocklist', section: 'access', group: 'Passwords', label: 'Common / compromised password blocklist', description: 'Reject passwords known to be common, expected, context-specific, or compromised.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' },
    profileDefaults: { Minimal: true },
  },
  {
    id: 'password.managers', section: 'access', group: 'Passwords', label: 'Password manager compatibility', description: 'Allow browser/password-manager generation and autofill instead of fighting user security tools.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' },
  },
  {
    id: 'password.paste', section: 'access', group: 'Passwords', label: 'Allow paste in password fields', description: 'Keep paste enabled so password managers and long generated credentials remain usable.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' },
  },
  {
    id: 'password.composition', section: 'access', group: 'Passwords', label: 'Character composition rules', description: 'Avoid arbitrary uppercase/lowercase/number/symbol requirements unless a legacy external policy mandates them.', kind: 'choice', defaultValue: 'None',
    options: [{ value: 'None' }, { value: 'Legacy character mix' }, { value: 'Custom legacy policy' }], dependsOn: { id: 'login.method', equals: 'Password' },
    caution: 'Composition rules are not the recommended modern baseline.', advanced: true,
  },
  {
    id: 'password.rotation', section: 'access', group: 'Passwords', label: 'Forced password rotation', description: 'Change passwords when compromise is suspected; avoid arbitrary recurring resets.', kind: 'choice', defaultValue: 'Compromise / reset event only',
    options: [{ value: 'Compromise / reset event only' }, { value: 'Periodic legacy rotation' }, { value: 'Admin-defined schedule' }], dependsOn: { id: 'login.method', equals: 'Password' },
    caution: 'Periodic forced changes should be a legacy/compliance exception, not a default.', advanced: true,
  },
  {
    id: 'password.history', section: 'access', group: 'Passwords', label: 'Password history', description: 'Prevent immediate reuse only when policy or threat model requires it; do not substitute history for stronger credential controls.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Block recent reuse' }, { value: 'Custom compliance policy' }], dependsOn: { id: 'login.method', equals: 'Password' }, advanced: true,
  },
  {
    id: 'password.temporary', section: 'access', group: 'Passwords', label: 'Temporary admin-issued password', description: 'If admins create accounts with temporary credentials, expire them and require replacement at first use.', kind: 'choice', defaultValue: 'Avoid; use invite/reset link',
    options: [{ value: 'Avoid; use invite/reset link' }, { value: 'Temporary + first-login change' }, { value: 'Temporary without forced change' }], dependsOn: { id: 'registration.mode', equals: 'Admin created' },
    appDefaults: { 'Government System': 'Temporary + first-login change', 'Clinic / EMR': 'Temporary + first-login change' }, advanced: true,
  },
  {
    id: 'login.strengthMeter', section: 'access', group: 'Passwords', label: 'Password guidance / strength meter', description: 'Show live, understandable password guidance during account creation or reset.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.method', equals: 'Password' }, advanced: true,
    profileDefaults: { Minimal: false },
  },

  // Verification & recovery
  {
    id: 'login.verification', section: 'access', group: 'Verification & recovery', label: 'Account verification', description: 'Verification step required before a new account becomes fully active.', kind: 'choice', defaultValue: 'Email',
    options: [{ value: 'None' }, { value: 'Email' }, { value: 'Phone' }, { value: 'Admin approval' }], dependsOn: { id: 'registration.mode', equals: ['Open', 'Invite only', 'Approval required'] },
    appDefaults: { 'Government System': 'Admin approval', 'Clinic / EMR': 'Admin approval', 'Internal / Operations': 'Email' }, profileDefaults: { Minimal: 'None' }, advanced: true,
  },
  {
    id: 'verification.blockUntilComplete', section: 'access', group: 'Verification & recovery', label: 'Access before verification', description: 'Decide whether unverified users can enter limited product areas before completing verification.', kind: 'choice', defaultValue: 'Limited access until verified',
    options: [{ value: 'Block all protected access' }, { value: 'Limited access until verified' }, { value: 'Full access + reminders' }], dependsOn: { id: 'login.verification', equals: ['Email', 'Phone'] },
    appDefaults: { 'Government System': 'Block all protected access', 'Clinic / EMR': 'Block all protected access' }, advanced: true,
  },
  {
    id: 'verification.resend', section: 'access', group: 'Verification & recovery', label: 'Verification resend', description: 'Allow self-service resend with throttling and clear expiry/replacement behavior.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.verification', equals: ['Email', 'Phone'] }, advanced: true,
  },
  {
    id: 'recovery.method', section: 'access', group: 'Verification & recovery', label: 'Primary account recovery', description: 'Recovery path when the user can no longer use their normal authenticator.', kind: 'choice', defaultValue: 'Verified email / reset link',
    options: [{ value: 'Verified email / reset link' }, { value: 'Verified phone' }, { value: 'Recovery codes' }, { value: 'Admin-assisted recovery' }, { value: 'No self-service recovery' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Admin-assisted recovery', 'Clinic / EMR': 'Admin-assisted recovery', 'Internal / Operations': 'Admin-assisted recovery' }, profileDefaults: { Minimal: 'Verified email / reset link' },
  },
  {
    id: 'recovery.securityQuestions', section: 'access', group: 'Verification & recovery', label: 'Security questions / knowledge-based recovery', description: 'Avoid questions based on personal facts that may be guessable, searchable, or reused.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'login.enabled', equals: true },
    caution: 'Knowledge-based security questions are not recommended as an account-recovery factor.', advanced: true,
  },
  {
    id: 'recovery.adminReview', section: 'access', group: 'Verification & recovery', label: 'High-risk recovery review', description: 'Escalate unusual or privileged account recovery for manual or stronger identity verification.', kind: 'choice', defaultValue: 'Privileged / suspicious cases only',
    options: [{ value: 'Off' }, { value: 'Privileged / suspicious cases only' }, { value: 'All recovery requests' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Privileged / suspicious cases only', 'Clinic / EMR': 'Privileged / suspicious cases only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Privileged / suspicious cases only' }, advanced: true,
  },
  {
    id: 'recovery.notify', section: 'access', group: 'Verification & recovery', label: 'Recovery / credential change notification', description: 'Notify the account through an existing trusted channel after password, recovery, or authenticator changes.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    profileDefaults: { Minimal: true }, advanced: true,
  },
  {
    id: 'recovery.resetExpiry', section: 'access', group: 'Verification & recovery', label: 'Reset-link expiry', description: 'Keep recovery links short-lived and single-use instead of indefinitely valid.', kind: 'choice', defaultValue: 'Short-lived + single-use',
    options: [{ value: 'Short-lived + single-use' }, { value: 'Single-use, longer window' }, { value: 'Custom' }], dependsOn: { id: 'login.forgotPassword', equals: true }, advanced: true,
  },

  // MFA & step-up
  {
    id: 'login.mfa', section: 'access', group: 'MFA & step-up', label: 'Multi-factor authentication', description: 'Additional verification after the primary credential.', kind: 'choice', defaultValue: 'Optional',
    options: [{ value: 'Off' }, { value: 'Optional' }, { value: 'Required for admins' }, { value: 'Required for everyone' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Required for admins', 'Clinic / EMR': 'Required for admins', 'Internal / Operations': 'Optional' }, profileDefaults: { Minimal: 'Off', Advanced: 'Required for admins' }, advanced: true,
  },
  {
    id: 'mfa.primaryFactor', section: 'access', group: 'MFA & step-up', label: 'Preferred second factor', description: 'Prefer phishing-resistant or authenticator-based factors over SMS when practical.', kind: 'choice', defaultValue: 'Authenticator app / TOTP',
    options: [{ value: 'Passkey / security key' }, { value: 'Authenticator app / TOTP' }, { value: 'Push approval' }, { value: 'Email OTP' }, { value: 'SMS OTP' }], dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] },
    appDefaults: { 'Government System': 'Authenticator app / TOTP', 'Clinic / EMR': 'Authenticator app / TOTP', 'SaaS / Client Portal': 'Passkey / security key' }, profileDefaults: { Advanced: 'Passkey / security key' },
  },
  {
    id: 'mfa.fallback', section: 'access', group: 'MFA & step-up', label: 'MFA fallback', description: 'Fallback path when the primary second factor is unavailable.', kind: 'choice', defaultValue: 'Recovery codes',
    options: [{ value: 'Recovery codes' }, { value: 'Alternate enrolled factor' }, { value: 'Admin-assisted recovery' }, { value: 'SMS fallback' }, { value: 'No fallback' }], dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] },
    appDefaults: { 'Government System': 'Admin-assisted recovery', 'Clinic / EMR': 'Admin-assisted recovery' }, profileDefaults: { Minimal: 'Recovery codes' }, advanced: true,
  },
  {
    id: 'mfa.backupCodes', section: 'access', group: 'MFA & step-up', label: 'Backup recovery codes', description: 'Issue one-time recovery codes when MFA could otherwise lock legitimate users out.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] }, advanced: true,
  },
  {
    id: 'mfa.enrollment', section: 'access', group: 'MFA & step-up', label: 'MFA enrollment timing', description: 'When users are prompted or required to enroll an additional factor.', kind: 'choice', defaultValue: 'Prompt after first successful sign-in',
    options: [{ value: 'During registration' }, { value: 'Prompt after first successful sign-in' }, { value: 'Just before sensitive action' }, { value: 'Admin-triggered only' }], dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] },
    appDefaults: { 'Government System': 'Prompt after first successful sign-in', 'Clinic / EMR': 'Prompt after first successful sign-in' }, advanced: true,
  },
  {
    id: 'mfa.factorChange', section: 'access', group: 'MFA & step-up', label: 'Changing an enrolled MFA factor', description: 'Treat factor replacement as a sensitive action rather than trusting the current session alone.', kind: 'choice', defaultValue: 'Reauthenticate with existing factor',
    options: [{ value: 'Reauthenticate with existing factor' }, { value: 'Step-up + notify' }, { value: 'Admin approval for privileged users' }], dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] },
    appDefaults: { 'Government System': 'Admin approval for privileged users', 'Clinic / EMR': 'Step-up + notify' }, profileDefaults: { Advanced: 'Step-up + notify' }, advanced: true,
  },
  {
    id: 'mfa.trustedDevice', section: 'access', group: 'MFA & step-up', label: 'Remember trusted device', description: 'Reduce repeat MFA prompts on explicitly trusted personal devices without weakening sensitive-action checks.', kind: 'choice', defaultValue: 'Optional + expiring trust',
    options: [{ value: 'Off' }, { value: 'Optional + expiring trust' }, { value: 'Long-lived trusted device' }], dependsOn: { id: 'login.mfa', equals: ['Optional', 'Required for admins', 'Required for everyone'] },
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off' }, profileDefaults: { Advanced: 'Off' }, advanced: true,
  },
  {
    id: 'auth.stepUp', section: 'access', group: 'MFA & step-up', label: 'Step-up authentication', description: 'Require fresh or stronger authentication for high-impact actions even within a valid session.', kind: 'choice', defaultValue: 'Sensitive actions only',
    options: [{ value: 'Off' }, { value: 'Sensitive actions only' }, { value: 'Risk-based + sensitive actions' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Risk-based + sensitive actions', 'Clinic / EMR': 'Risk-based + sensitive actions', 'SaaS / Client Portal': 'Sensitive actions only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Risk-based + sensitive actions' }, advanced: true,
  },
  {
    id: 'auth.sensitiveActions', section: 'access', group: 'MFA & step-up', label: 'Actions that require step-up', description: 'Set the breadth of actions that should demand recent/strong authentication.', kind: 'choice', defaultValue: 'Credentials + billing + privileged settings',
    options: [{ value: 'Credentials only' }, { value: 'Credentials + billing + privileged settings' }, { value: 'Broad high-impact actions' }], dependsOn: { id: 'auth.stepUp', equals: ['Sensitive actions only', 'Risk-based + sensitive actions'] },
    appDefaults: { 'Government System': 'Broad high-impact actions', 'Clinic / EMR': 'Broad high-impact actions' }, profileDefaults: { Advanced: 'Broad high-impact actions' }, advanced: true,
  },

  // Sessions
  {
    id: 'session.timeout', section: 'access', group: 'Sessions', label: 'Session timeout', description: 'How aggressively inactive signed-in sessions should expire.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Relaxed' }, { value: 'Standard' }, { value: 'Short' }, { value: 'Custom' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Short', 'Clinic / EMR': 'Short' }, profileDefaults: { Minimal: 'Relaxed', Advanced: 'Short' }, advanced: true,
  },
  {
    id: 'session.absolute', section: 'access', group: 'Sessions', label: 'Absolute session lifetime', description: 'Require full reauthentication after a maximum session age even if activity continues.', kind: 'choice', defaultValue: 'Standard maximum lifetime',
    options: [{ value: 'No explicit maximum' }, { value: 'Standard maximum lifetime' }, { value: 'Short / high assurance' }, { value: 'Custom' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Short / high assurance', 'Clinic / EMR': 'Short / high assurance' }, profileDefaults: { Minimal: 'No explicit maximum', Advanced: 'Short / high assurance' }, advanced: true,
  },
  {
    id: 'session.warning', section: 'access', group: 'Sessions', label: 'Session expiry warning', description: 'Warn before an inactivity timeout when unsaved work could otherwise be lost.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': false }, advanced: true,
  },
  {
    id: 'session.concurrent', section: 'access', group: 'Sessions', label: 'Concurrent sessions', description: 'Policy for the same account being active on multiple devices.', kind: 'choice', defaultValue: 'Allow',
    options: [{ value: 'Allow' }, { value: 'Limit' }, { value: 'Single device' }], dependsOn: { id: 'login.enabled', equals: true }, profileDefaults: { Advanced: 'Limit' }, advanced: true,
  },
  {
    id: 'session.management', section: 'access', group: 'Sessions', label: 'User session management', description: 'Let users inspect and revoke their own active sessions/devices when account value justifies it.', kind: 'choice', defaultValue: 'View + revoke sessions',
    options: [{ value: 'Off' }, { value: 'View sessions' }, { value: 'View + revoke sessions' }, { value: 'View + revoke + device labels' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'View + revoke + device labels', 'Clinic / EMR': 'View + revoke + device labels', 'SaaS / Client Portal': 'View + revoke + device labels' }, profileDefaults: { Minimal: 'Off', Advanced: 'View + revoke + device labels' }, advanced: true,
  },
  {
    id: 'session.logoutAll', section: 'access', group: 'Sessions', label: 'Logout all other sessions', description: 'Provide a one-action recovery tool after suspected compromise or credential change.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true }, advanced: true,
  },
  {
    id: 'session.rotatePrivilege', section: 'access', group: 'Sessions', label: 'Renew session after privilege change', description: 'Renew/replace the authenticated session when login state or privilege level materially changes.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true }, advanced: true,
  },
  {
    id: 'session.reauthRisk', section: 'access', group: 'Sessions', label: 'Reauthenticate after risk events', description: 'Require fresh authentication after password reset, account recovery, suspicious activity, or other high-risk events.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true }, advanced: true,
  },
  {
    id: 'access.guest', section: 'access', group: 'Guest access', label: 'Guest access', description: 'Allow selected workflows without requiring a customer account.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Booking / Scheduling': true, 'E-commerce': true, 'Directory / Marketplace': true, 'Portfolio / Marketing': true, 'Tournament / Event': true },
  },
  {
    id: 'access.guestScope', section: 'access', group: 'Guest access', label: 'Guest scope', description: 'Keep guest access narrowly scoped to intentional public/customer workflows.', kind: 'choice', defaultValue: 'Public browse + selected transactions',
    options: [{ value: 'Public browse only' }, { value: 'Public browse + selected transactions' }, { value: 'Broad guest mode' }], dependsOn: { id: 'access.guest', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Public browse only', 'Directory / Marketplace': 'Public browse + selected transactions', 'E-commerce': 'Public browse + selected transactions' }, advanced: true,
  },

  // Accounts & profiles
  {
    id: 'profile.enabled', section: 'accounts', group: 'Profile surface', label: 'User profile', description: 'Give signed-in users a dedicated place to view or manage account/profile information.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Internal / Operations': true, 'Government System': true, 'Clinic / EMR': true, 'Directory / Marketplace': false, 'Inventory / POS': false, 'Tournament / Event': false },
  },
  {
    id: 'profile.complexity', section: 'accounts', group: 'Profile surface', label: 'Profile complexity', description: 'Amount of identity/contact/preferences information presented on the profile.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Minimal' }, { value: 'Standard' }, { value: 'Detailed' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed', 'Clinic / EMR': 'Detailed' }, profileDefaults: { Minimal: 'Minimal', Advanced: 'Detailed' },
  },
  {
    id: 'profile.avatar', section: 'accounts', group: 'Profile surface', label: 'Profile avatar / photo', description: 'Allow a user image only when recognition or personalization adds real value.', kind: 'choice', defaultValue: 'Optional image + initials fallback',
    options: [{ value: 'Off / initials only' }, { value: 'Optional image + initials fallback' }, { value: 'Required image' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'Off / initials only', 'Clinic / EMR': 'Off / initials only' }, profileDefaults: { Minimal: 'Off / initials only' }, advanced: true,
  },
  {
    id: 'profile.username', section: 'accounts', group: 'Identity fields', label: 'Public/display username', description: 'Separate a user-facing username from the internal immutable account ID when the product needs handles or stable display identity.', kind: 'choice', defaultValue: 'Off unless needed',
    options: [{ value: 'Off unless needed' }, { value: 'Optional unique username' }, { value: 'Required unique username' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Directory / Marketplace': 'Optional unique username', 'SaaS / Client Portal': 'Optional unique username' }, advanced: true,
  },
  {
    id: 'profile.customFields', section: 'accounts', group: 'Identity fields', label: 'Custom profile fields', description: 'Support domain-specific user attributes without making every account schema bespoke.', kind: 'choice', defaultValue: 'A few admin-defined fields',
    options: [{ value: 'Off' }, { value: 'A few admin-defined fields' }, { value: 'Flexible custom field schema' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'Flexible custom field schema', 'Clinic / EMR': 'A few admin-defined fields' }, profileDefaults: { Minimal: 'Off', Advanced: 'Flexible custom field schema' }, advanced: true,
  },
  {
    id: 'profile.editing', section: 'accounts', group: 'Profile editing', label: 'Who can edit profile fields', description: 'Distinguish user-editable preferences from verified or administrator-controlled identity fields.', kind: 'choice', defaultValue: 'User + protected admin fields',
    options: [{ value: 'User editable' }, { value: 'User + protected admin fields' }, { value: 'Admin controlled' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'User + protected admin fields', 'Clinic / EMR': 'User + protected admin fields', 'Internal / Operations': 'User + protected admin fields' },
  },
  {
    id: 'profile.completion', section: 'accounts', group: 'Profile editing', label: 'Profile completion', description: 'Encourage missing useful fields without blocking routine work unless those fields are operationally required.', kind: 'choice', defaultValue: 'Prompt only when relevant',
    options: [{ value: 'Off' }, { value: 'Prompt only when relevant' }, { value: 'Completion indicator' }, { value: 'Block until required fields complete' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'Block until required fields complete', 'Clinic / EMR': 'Block until required fields complete' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'profile.publicVisibility', section: 'accounts', group: 'Profile visibility', label: 'Public profile visibility', description: 'Whether profile information can be viewed outside protected product areas.', kind: 'choice', defaultValue: 'Private',
    options: [{ value: 'Private' }, { value: 'Members only' }, { value: 'Public opt-in' }, { value: 'Public by design' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Directory / Marketplace': 'Public opt-in', 'Tournament / Event': 'Members only' }, profileDefaults: { Minimal: 'Private' },
  },
  {
    id: 'profile.lastLogin', section: 'accounts', group: 'Account visibility', label: 'Show last successful login', description: 'Expose useful account-security context to the user and/or administrators.', kind: 'choice', defaultValue: 'User + admins',
    options: [{ value: 'Off' }, { value: 'Admins only' }, { value: 'User + admins' }], dependsOn: { id: 'profile.enabled', equals: true },
    appDefaults: { 'Government System': 'User + admins', 'Clinic / EMR': 'User + admins' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'account.statuses', section: 'accounts', group: 'Account lifecycle', label: 'Account status model', description: 'Explicit states for controlling access without deleting account history.', kind: 'choice', defaultValue: 'Active + suspended + deactivated',
    options: [{ value: 'Active only' }, { value: 'Active + disabled' }, { value: 'Active + suspended + deactivated' }, { value: 'Detailed lifecycle states' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed lifecycle states', 'Clinic / EMR': 'Detailed lifecycle states', 'Internal / Operations': 'Active + suspended + deactivated' }, profileDefaults: { Minimal: 'Active + disabled', Advanced: 'Detailed lifecycle states' },
  },
  {
    id: 'account.suspension', section: 'accounts', group: 'Account lifecycle', label: 'Suspension behavior', description: 'Temporarily block authentication while retaining records, memberships, and audit history.', kind: 'choice', defaultValue: 'Block login + preserve history',
    options: [{ value: 'Block login + preserve history' }, { value: 'Read-only access' }, { value: 'Custom restricted state' }], dependsOn: { id: 'account.statuses', equals: ['Active + suspended + deactivated', 'Detailed lifecycle states'] }, advanced: true,
  },
  {
    id: 'account.deactivation', section: 'accounts', group: 'Account lifecycle', label: 'Deactivation behavior', description: 'Prefer reversible deactivation for operational accounts instead of deleting identity history.', kind: 'choice', defaultValue: 'Reversible + revoke sessions',
    options: [{ value: 'Reversible + revoke sessions' }, { value: 'Permanent disable' }, { value: 'Custom offboarding workflow' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Custom offboarding workflow', 'Clinic / EMR': 'Custom offboarding workflow' }, profileDefaults: { Advanced: 'Custom offboarding workflow' },
  },
  {
    id: 'account.selfDeactivate', section: 'accounts', group: 'Account lifecycle', label: 'User can deactivate own account', description: 'Allow self-service deactivation when it fits the product; internal/government identities normally remain admin-managed.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': false, 'Clinic / EMR': false, 'Internal / Operations': false, 'Inventory / POS': false }, profileDefaults: { Minimal: true }, advanced: true,
  },
  {
    id: 'account.selfDelete', section: 'accounts', group: 'Account lifecycle', label: 'Self-service account deletion request', description: 'Expose a user-initiated deletion path where legally/product-appropriate, while preserving records that must be retained.', kind: 'choice', defaultValue: 'Request / review flow',
    options: [{ value: 'Off' }, { value: 'Request / review flow' }, { value: 'Immediate where safe' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off', 'Internal / Operations': 'Off', 'SaaS / Client Portal': 'Request / review flow', 'E-commerce': 'Request / review flow' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'account.dormant', section: 'accounts', group: 'Account lifecycle', label: 'Dormant account handling', description: 'Policy for long-unused accounts when stale access materially increases risk or clutter.', kind: 'choice', defaultValue: 'No automatic action',
    options: [{ value: 'No automatic action' }, { value: 'Notify after inactivity' }, { value: 'Disable after policy threshold' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Disable after policy threshold', 'Clinic / EMR': 'Disable after policy threshold' }, profileDefaults: { Minimal: 'No automatic action', Advanced: 'Notify after inactivity' }, advanced: true,
  },
  {
    id: 'account.emailChange', section: 'accounts', group: 'Identity changes', label: 'Changing verified email', description: 'Require reauthentication and verify the new address before making it authoritative.', kind: 'choice', defaultValue: 'Reauthenticate + verify new email',
    options: [{ value: 'Reauthenticate + verify new email' }, { value: 'Verify new email only' }, { value: 'Admin managed' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Admin managed', 'Clinic / EMR': 'Admin managed' }, advanced: true,
  },
  {
    id: 'account.phoneChange', section: 'accounts', group: 'Identity changes', label: 'Changing verified phone', description: 'Protect phone-number changes when phone is used for sign-in, recovery, or MFA.', kind: 'choice', defaultValue: 'Reauthenticate + verify new phone',
    options: [{ value: 'Reauthenticate + verify new phone' }, { value: 'Verify new phone only' }, { value: 'Admin managed' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Admin managed', 'Clinic / EMR': 'Admin managed' }, advanced: true,
  },
  {
    id: 'account.connectedIdentities', section: 'accounts', group: 'Identity changes', label: 'Connected sign-in identities', description: 'Let users inspect/link/unlink social or federated identities without accidentally orphaning the account.', kind: 'choice', defaultValue: 'Manage when multiple methods exist',
    options: [{ value: 'Off' }, { value: 'View only' }, { value: 'Manage when multiple methods exist' }], dependsOn: { id: 'login.enabled', equals: true },
    profileDefaults: { Minimal: 'Off', Advanced: 'Manage when multiple methods exist' }, advanced: true,
  },
  {
    id: 'account.merge', section: 'accounts', group: 'Identity changes', label: 'Duplicate account merge', description: 'Provide a controlled merge path when the same person accidentally obtains multiple identities.', kind: 'choice', defaultValue: 'Admin-assisted only',
    options: [{ value: 'Off' }, { value: 'Admin-assisted only' }, { value: 'Verified self-service merge' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Admin-assisted only', 'Clinic / EMR': 'Admin-assisted only' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'invite.expiry', section: 'accounts', group: 'Invitations', label: 'Invitation expiry', description: 'Expire unused account invitations instead of leaving permanent bearer links active.', kind: 'choice', defaultValue: 'Expiring invite',
    options: [{ value: 'Expiring invite' }, { value: 'Short-lived invite' }, { value: 'Custom' }], dependsOn: { id: 'registration.mode', equals: ['Invite only', 'Admin created'] }, advanced: true,
  },
  {
    id: 'invite.resend', section: 'accounts', group: 'Invitations', label: 'Resend invitation', description: 'Allow authorized admins to resend or replace an expired invitation with clear status.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'registration.mode', equals: ['Invite only', 'Admin created'] }, advanced: true,
  },
  {
    id: 'invite.rolePreassign', section: 'accounts', group: 'Invitations', label: 'Pre-assign role on invitation', description: 'Allow an invite to carry a scoped initial role without granting broader permissions than intended.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'registration.mode', equals: ['Invite only', 'Admin created'] },
    appDefaults: { 'Government System': true, 'Internal / Operations': true }, advanced: true,
  },
  {
    id: 'account.approvalQueue', section: 'accounts', group: 'Invitations', label: 'Account approval queue', description: 'Operational queue for reviewing signup/access requests with reason, actor, and outcome.', kind: 'choice', defaultValue: 'Standard review queue',
    options: [{ value: 'Simple approve / reject' }, { value: 'Standard review queue' }, { value: 'Multi-stage identity review' }], dependsOn: { id: 'registration.mode', equals: 'Approval required' },
    appDefaults: { 'Government System': 'Multi-stage identity review' }, profileDefaults: { Advanced: 'Multi-stage identity review' },
  },
  {
    id: 'account.approvalReason', section: 'accounts', group: 'Invitations', label: 'Approval / rejection reason', description: 'Capture a reason for controlled account decisions when traceability matters.', kind: 'choice', defaultValue: 'Required for rejection',
    options: [{ value: 'Optional' }, { value: 'Required for rejection' }, { value: 'Required for every decision' }], dependsOn: { id: 'registration.mode', equals: 'Approval required' },
    appDefaults: { 'Government System': 'Required for every decision', 'Clinic / EMR': 'Required for every decision' }, advanced: true,
  },
  {
    id: 'account.exportSelf', section: 'accounts', group: 'Account visibility', label: 'Self-service account data export', description: 'Allow users to request/export their own account data where the product and privacy obligations call for it.', kind: 'choice', defaultValue: 'Available where applicable',
    options: [{ value: 'Off' }, { value: 'Available where applicable' }, { value: 'Always available' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off', 'SaaS / Client Portal': 'Always available', 'E-commerce': 'Always available' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },

  // Organizations & teams
  {
    id: 'org.mode', section: 'organizations', group: 'Structure', label: 'Organization / team model', description: 'How accounts are grouped beyond a single flat user list.', kind: 'choice', defaultValue: 'Off / single account space',
    options: [{ value: 'Off / single account space' }, { value: 'Teams inside one organization' }, { value: 'Branches / departments' }, { value: 'Multiple workspaces / organizations' }, { value: 'Multi-tenant organizations' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Multiple workspaces / organizations', 'Government System': 'Branches / departments', 'Internal / Operations': 'Branches / departments', 'Clinic / EMR': 'Branches / departments', 'Inventory / POS': 'Branches / departments' }, profileDefaults: { Minimal: 'Off / single account space' },
    keywords: ['tenant', 'tenancy', 'workspace', 'team', 'department', 'branch'],
  },
  {
    id: 'org.memberships', section: 'organizations', group: 'Membership', label: 'Multiple memberships per user', description: 'Allow one identity to belong to more than one team/workspace/organization.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'SaaS / Client Portal': true, 'Government System': false, 'Internal / Operations': false }, profileDefaults: { Advanced: true },
  },
  {
    id: 'org.switcher', section: 'organizations', group: 'Membership', label: 'Organization / workspace switcher', description: 'Provide an obvious context switcher when one user can actively work in multiple spaces.', kind: 'choice', defaultValue: 'When user has multiple memberships',
    options: [{ value: 'Off' }, { value: 'When user has multiple memberships' }, { value: 'Always visible' }], dependsOn: { id: 'org.memberships', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'When user has multiple memberships' },
  },
  {
    id: 'org.defaultContext', section: 'organizations', group: 'Membership', label: 'Default organization context', description: 'Choose where users land when they belong to multiple workspaces without losing a deep link.', kind: 'choice', defaultValue: 'Last active organization',
    options: [{ value: 'Last active organization' }, { value: 'Primary organization' }, { value: 'Ask on sign-in' }], dependsOn: { id: 'org.memberships', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Last active organization' }, advanced: true,
  },
  {
    id: 'org.hierarchy', section: 'organizations', group: 'Structure', label: 'Nested teams / departments', description: 'Represent organizational hierarchy only when permissions, reporting, or routing actually depend on it.', kind: 'choice', defaultValue: 'One level',
    options: [{ value: 'Flat' }, { value: 'One level' }, { value: 'Multi-level hierarchy' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Multi-level hierarchy', 'Internal / Operations': 'Multi-level hierarchy', 'Clinic / EMR': 'One level' }, profileDefaults: { Minimal: 'Flat', Advanced: 'Multi-level hierarchy' }, advanced: true,
  },
  {
    id: 'org.invites', section: 'organizations', group: 'Membership', label: 'Member invitations', description: 'Allow authorized members/admins to invite users into the current organization with scoped membership.', kind: 'choice', defaultValue: 'Admins / managers only',
    options: [{ value: 'Off' }, { value: 'Admins / managers only' }, { value: 'Members with invite permission' }, { value: 'Any member' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Admins / managers only', 'SaaS / Client Portal': 'Admins / managers only' },
  },
  {
    id: 'org.joinRequests', section: 'organizations', group: 'Membership', label: 'Join / access requests', description: 'Let users request membership instead of requiring an invitation when organization discovery is intentional.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Request by organization code/link' }, { value: 'Discover + request access' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Request by organization code/link' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'org.domainJoin', section: 'organizations', group: 'Membership', label: 'Domain-based organization discovery', description: 'Use verified email domains to suggest or route users to the correct managed organization.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Suggest organization' }, { value: 'Auto-join approved domain' }, { value: 'Require admin approval after match' }], dependsOn: { id: 'org.mode', equals: ['Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'SaaS / Client Portal': 'Suggest organization' }, profileDefaults: { Advanced: 'Require admin approval after match' }, advanced: true,
  },
  {
    id: 'org.memberRemoval', section: 'organizations', group: 'Offboarding', label: 'Removing a member', description: 'Remove organization access without necessarily deleting the underlying identity or cross-org history.', kind: 'choice', defaultValue: 'Remove membership + revoke org sessions/access',
    options: [{ value: 'Remove membership only' }, { value: 'Remove membership + revoke org sessions/access' }, { value: 'Offboarding workflow' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Offboarding workflow', 'Clinic / EMR': 'Offboarding workflow' }, profileDefaults: { Advanced: 'Offboarding workflow' },
  },
  {
    id: 'org.leave', section: 'organizations', group: 'Offboarding', label: 'User can leave organization', description: 'Allow voluntary departure only when ownership and required operational assignments are safely handled.', kind: 'choice', defaultValue: 'Allowed unless sole owner',
    options: [{ value: 'Off / admin managed' }, { value: 'Allowed unless sole owner' }, { value: 'Always allowed' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Off / admin managed', 'Internal / Operations': 'Off / admin managed' }, advanced: true,
  },
  {
    id: 'org.owner', section: 'organizations', group: 'Administration', label: 'Organization owner role', description: 'Whether each workspace has a distinguished owner for billing, membership, or ultimate administrative control.', kind: 'choice', defaultValue: 'One owner + admins',
    options: [{ value: 'No special owner' }, { value: 'One owner + admins' }, { value: 'Multiple owners' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'No special owner', 'SaaS / Client Portal': 'One owner + admins' }, profileDefaults: { Minimal: 'One owner + admins' },
  },
  {
    id: 'org.transferOwnership', section: 'organizations', group: 'Administration', label: 'Ownership transfer', description: 'Provide a protected ownership-transfer flow before the current owner leaves or loses access.', kind: 'choice', defaultValue: 'Explicit transfer + reauthentication',
    options: [{ value: 'Off' }, { value: 'Explicit transfer + reauthentication' }, { value: 'Admin-mediated transfer' }], dependsOn: { id: 'org.owner', equals: ['One owner + admins', 'Multiple owners'] },
    appDefaults: { 'SaaS / Client Portal': 'Explicit transfer + reauthentication' }, profileDefaults: { Advanced: 'Admin-mediated transfer' }, advanced: true,
  },
  {
    id: 'org.delete', section: 'organizations', group: 'Administration', label: 'Organization deletion', description: 'Treat deleting a whole workspace/tenant as a high-impact lifecycle action with explicit safeguards.', kind: 'choice', defaultValue: 'Soft close / scheduled deletion',
    options: [{ value: 'Off / support only' }, { value: 'Soft close / scheduled deletion' }, { value: 'Owner can permanently delete' }], dependsOn: { id: 'org.mode', equals: ['Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'SaaS / Client Portal': 'Soft close / scheduled deletion' }, profileDefaults: { Advanced: 'Soft close / scheduled deletion' }, advanced: true,
  },
  {
    id: 'org.memberDirectory', section: 'organizations', group: 'Membership', label: 'Member directory', description: 'Whether members can discover other people inside their organization.', kind: 'choice', defaultValue: 'Visible to members',
    options: [{ value: 'Off' }, { value: 'Visible to members' }, { value: 'Role / department scoped' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Role / department scoped', 'Clinic / EMR': 'Role / department scoped' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'org.settingsScope', section: 'organizations', group: 'Administration', label: 'Organization-level settings', description: 'Allow each organization to control appropriate local settings without changing global application behavior.', kind: 'choice', defaultValue: 'Basic organization settings',
    options: [{ value: 'Off' }, { value: 'Basic organization settings' }, { value: 'Detailed tenant configuration' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'SaaS / Client Portal': 'Detailed tenant configuration', 'Government System': 'Basic organization settings' }, profileDefaults: { Minimal: 'Off', Advanced: 'Detailed tenant configuration' }, advanced: true,
  },
  {
    id: 'org.branding', section: 'organizations', group: 'Administration', label: 'Per-organization branding', description: 'Allow a tenant/workspace identity such as logo/name/accent without duplicating the global Visual Studio system.', kind: 'choice', defaultValue: 'Name + logo only',
    options: [{ value: 'Off' }, { value: 'Name + logo only' }, { value: 'Light branding controls' }], dependsOn: { id: 'org.mode', equals: ['Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'SaaS / Client Portal': 'Name + logo only' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'org.sso', section: 'organizations', group: 'Enterprise identity', label: 'Per-organization SSO configuration', description: 'Allow managed organizations to connect their own identity provider where enterprise SSO exists.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Platform admin configured' }, { value: 'Organization admin configured' }], dependsOn: { id: 'login.enterpriseSso', equals: ['OIDC', 'SAML', 'OIDC + SAML'] },
    appDefaults: { 'SaaS / Client Portal': 'Organization admin configured' }, profileDefaults: { Advanced: 'Organization admin configured' }, advanced: true,
  },
  {
    id: 'org.directorySync', section: 'organizations', group: 'Enterprise identity', label: 'Directory provisioning / SCIM', description: 'Automate enterprise user provisioning and deprovisioning when manual membership management no longer scales.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Import / sync users' }, { value: 'SCIM provisioning' }], dependsOn: { id: 'org.mode', equals: ['Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    profileDefaults: { Advanced: 'Off' }, advanced: true,
  },
  {
    id: 'org.tenantIsolation', section: 'organizations', group: 'Tenant boundaries', label: 'Tenant data boundary', description: 'Define how strongly organization-scoped data must be isolated in application behavior and authorization.', kind: 'choice', defaultValue: 'Strict tenant scope',
    options: [{ value: 'Shared scope / labels only' }, { value: 'Strict tenant scope' }, { value: 'Dedicated tenant isolation strategy' }], dependsOn: { id: 'org.mode', equals: 'Multi-tenant organizations' },
    appDefaults: { 'SaaS / Client Portal': 'Strict tenant scope' }, profileDefaults: { Advanced: 'Dedicated tenant isolation strategy' },
    caution: 'Multi-tenant apps should not treat tenant membership as a cosmetic label; authorization must enforce tenant boundaries.',
  },
  {
    id: 'org.crossTenantAdmin', section: 'organizations', group: 'Tenant boundaries', label: 'Cross-tenant platform administration', description: 'Allow only explicitly privileged platform operators to cross tenant boundaries for support or operations.', kind: 'choice', defaultValue: 'Restricted platform admins only',
    options: [{ value: 'Off' }, { value: 'Restricted platform admins only' }, { value: 'Support role with explicit tenant entry' }], dependsOn: { id: 'org.mode', equals: 'Multi-tenant organizations' },
    appDefaults: { 'SaaS / Client Portal': 'Restricted platform admins only' }, profileDefaults: { Advanced: 'Support role with explicit tenant entry' }, advanced: true,
  },

  // Page inventory
  {
    id: 'pages.about', section: 'pages', group: 'Public pages', label: 'About page', description: 'Dedicated page for organization, product, team, or creator context when it helps trust or orientation.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Portfolio / Marketing': true, 'Directory / Marketplace': true, 'E-commerce': true, 'SaaS / Client Portal': true },
  },
  {
    id: 'pages.features', section: 'pages', group: 'Public pages', label: 'Features / services page', description: 'Dedicated public page explaining major capabilities, services, or offerings beyond the landing page.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Portfolio / Marketing': true, 'SaaS / Client Portal': true, 'E-commerce': true, 'Booking / Scheduling': true },
  },
  {
    id: 'pages.pricing', section: 'pages', group: 'Public pages', label: 'Pricing page', description: 'Dedicated public pricing or plans page.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'SaaS / Client Portal': true, 'E-commerce': false }, profileDefaults: { Minimal: false },
  },
  {
    id: 'pages.contact', section: 'pages', group: 'Public pages', label: 'Contact page', description: 'Dedicated contact or inquiry page rather than relying only on a footer address.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Government System': false, 'Clinic / EMR': false, 'Internal / Operations': false, 'Inventory / POS': false },
  },
  {
    id: 'pages.faq', section: 'pages', group: 'Public pages', label: 'FAQ page', description: 'Standalone FAQ when questions exceed what fits naturally inside the landing page.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Booking / Scheduling': true, 'SaaS / Client Portal': true, 'E-commerce': true },
  },
  {
    id: 'pages.blog', section: 'pages', group: 'Public pages', label: 'Blog / news', description: 'Publishing surface for articles, announcements, or updates.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'News / updates only' }, { value: 'Full blog / publishing' }],
    appDefaults: { 'Portfolio / Marketing': 'News / updates only', 'Government System': 'News / updates only' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'pages.changelog', section: 'pages', group: 'Trust & product pages', label: 'Changelog', description: 'Public or authenticated product-change history for users who benefit from release visibility.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'SaaS / Client Portal': true }, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'pages.status', section: 'pages', group: 'Trust & product pages', label: 'Status page', description: 'Service-health surface for products where outages or integrations materially affect users.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'SaaS / Client Portal': true }, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'pages.legal', section: 'pages', group: 'Trust & product pages', label: 'Legal / policy pages', description: 'Provide the appropriate privacy, terms, consent, refund, or other policy pages for the product.', kind: 'choice', defaultValue: 'Privacy + terms where applicable',
    options: [{ value: 'None' }, { value: 'Privacy only' }, { value: 'Privacy + terms where applicable' }, { value: 'Full policy set' }],
    appDefaults: { 'Portfolio / Marketing': 'Privacy only', 'E-commerce': 'Full policy set', 'SaaS / Client Portal': 'Privacy + terms where applicable', 'Booking / Scheduling': 'Privacy + terms where applicable' }, profileDefaults: { Minimal: 'None', Advanced: 'Full policy set' },
  },
  {
    id: 'pages.team', section: 'pages', group: 'Public pages', label: 'Team / people page', description: 'Dedicated people page when individual roles, credentials, or leadership materially matter.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Portfolio / Marketing': true }, advanced: true,
  },
  {
    id: 'pages.careers', section: 'pages', group: 'Public pages', label: 'Careers page', description: 'Hiring page for organizations actively recruiting rather than a permanent empty placeholder.', kind: 'boolean', defaultValue: false, advanced: true,
  },
  {
    id: 'pages.docs', section: 'pages', group: 'Trust & product pages', label: 'Public documentation page', description: 'Product-facing guides or technical documentation separate from the in-app help center.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Guides only' }, { value: 'Full documentation' }], appDefaults: { 'SaaS / Client Portal': 'Guides only' }, profileDefaults: { Advanced: 'Guides only' }, advanced: true,
  },
  {
    id: 'pages.roadmap', section: 'pages', group: 'Trust & product pages', label: 'Public roadmap', description: 'Expose planned work only when sharing product direction is intentional and maintainable.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'High-level roadmap' }, { value: 'Interactive roadmap / voting' }], appDefaults: { 'SaaS / Client Portal': 'High-level roadmap' }, advanced: true,
  },
  {
    id: 'pages.partners', section: 'pages', group: 'Public pages', label: 'Partners / integrations page', description: 'Dedicated public surface for real partners or integrations when they influence buying or usage decisions.', kind: 'boolean', defaultValue: false, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'pages.security', section: 'pages', group: 'Trust & product pages', label: 'Security / trust page', description: 'Explain security posture, reporting contact, or relevant safeguards for products where customers evaluate trust.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Security overview' }, { value: 'Detailed trust center' }], appDefaults: { 'SaaS / Client Portal': 'Security overview' }, profileDefaults: { Advanced: 'Security overview' }, advanced: true,
  },
  {
    id: 'pages.accessibilityStatement', section: 'pages', group: 'Trust & product pages', label: 'Accessibility statement', description: 'Public accessibility commitment/status page where organizational or regulatory context warrants it.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Government System': true }, profileDefaults: { Advanced: true }, advanced: true,
  },

  {
    id: 'pages.profile', section: 'pages', group: 'Account pages', label: 'User profile page', description: 'Allow signed-in users to view or manage their personal profile.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': true, 'Clinic / EMR': true }, profileDefaults: { Minimal: false },
  },
  {
    id: 'pages.accountSettings', section: 'pages', group: 'Account pages', label: 'Account settings page', description: 'Dedicated place for credentials, preferences, sessions, notification preferences, or account lifecycle controls.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'login.enabled', equals: true },
    profileDefaults: { Minimal: false },
  },
  {
    id: 'pages.notifications', section: 'pages', group: 'Account pages', label: 'Notification center page', description: 'Dedicated notification history/inbox when transient badges or toasts are not enough.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': true, 'Clinic / EMR': true, 'SaaS / Client Portal': true, 'Booking / Scheduling': false }, profileDefaults: { Advanced: true },
  },
  {
    id: 'pages.search', section: 'pages', group: 'Utility pages', label: 'Global search results page', description: 'Dedicated results surface for cross-module or cross-record search.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Government System': true, 'Clinic / EMR': true, 'Internal / Operations': true, 'Directory / Marketplace': true }, profileDefaults: { Advanced: true },
  },

  // Landing & public site
  {
    id: 'landing.enabled', section: 'public', group: 'Page basics', label: 'Landing page', description: 'Provide a dedicated entry/marketing page before the main application.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Internal / Operations': false, 'Government System': false, 'Clinic / EMR': false, 'Inventory / POS': false },
  },
  {
    id: 'landing.complexity', section: 'public', group: 'Page basics', label: 'Landing page detail', description: 'Amount of content and section depth on the landing page.', kind: 'choice', defaultValue: 'Simple', options: [{ value: 'Simple' }, { value: 'Detailed' }, { value: 'Complex' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Detailed', 'SaaS / Client Portal': 'Detailed', 'E-commerce': 'Detailed', 'Directory / Marketplace': 'Detailed' }, profileDefaults: { Minimal: 'Simple', Advanced: 'Detailed' },
  },
  {
    id: 'landing.heroImage', section: 'public', group: 'Hero', label: 'Hero image / media', description: 'Use a prominent visual in the first landing-page viewport.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': true, 'E-commerce': true, 'Directory / Marketplace': true, 'Tournament / Event': true },
  },
  {
    id: 'landing.heroRender', section: 'public', group: 'Hero', label: 'Hero media treatment', description: 'How the primary image or media is composed in the hero.', kind: 'choice', defaultValue: 'Split',
    options: [{ value: 'Banner' }, { value: 'Background' }, { value: 'Split' }, { value: 'Fullscreen' }, { value: 'Floating' }, { value: 'Carousel' }, { value: 'Video' }], dependsOn: { id: 'landing.heroImage', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Split', 'E-commerce': 'Banner', 'Tournament / Event': 'Background' }, advanced: true,
  },
  {
    id: 'landing.primaryCta', section: 'public', group: 'Hero', label: 'Primary call-to-action', description: 'Place one obvious next action in the landing hero.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'landing.enabled', equals: true },
  },
  {
    id: 'nav.primary', section: 'navigation', group: 'Structure', label: 'Primary app navigation', description: 'Main navigation model used after entering the product.', kind: 'choice', defaultValue: 'Top navigation',
    options: [{ value: 'Top navigation' }, { value: 'Sidebar' }, { value: 'Bottom navigation' }, { value: 'Hybrid' }, { value: 'Minimal / contextual' }],
    appDefaults: { 'Internal / Operations': 'Sidebar', 'Government System': 'Sidebar', 'Clinic / EMR': 'Sidebar', 'Inventory / POS': 'Sidebar', 'Booking / Scheduling': 'Hybrid', 'Tournament / Event': 'Hybrid', 'Portfolio / Marketing': 'Top navigation' },
  },
  {
    id: 'nav.mobile', section: 'navigation', group: 'Structure', label: 'Mobile navigation', description: 'Mobile-specific primary navigation instead of simply shrinking desktop UI.', kind: 'choice', defaultValue: 'Bottom navigation',
    options: [{ value: 'Bottom navigation' }, { value: 'Drawer' }, { value: 'Compact top navigation' }, { value: 'Same as desktop' }],
    appDefaults: { 'Portfolio / Marketing': 'Compact top navigation', 'Directory / Marketplace': 'Bottom navigation' },
  },
  {
    id: 'nav.sticky', section: 'navigation', group: 'Structure', label: 'Keep primary navigation visible', description: 'Keep navigation reachable during long scrolling or dense tasks.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false }, advanced: true,
  },
  {
    id: 'nav.breadcrumbs', section: 'navigation', group: 'Context recovery', label: 'Breadcrumbs', description: 'Show hierarchy context on deeper pages where users can lose orientation.', kind: 'choice', defaultValue: 'Auto when useful',
    options: [{ value: 'Off' }, { value: 'Auto when useful' }, { value: 'Always on deeper pages' }],
    appDefaults: { 'Portfolio / Marketing': 'Off' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'landing.footer', section: 'public', group: 'Page basics', label: 'Footer', description: 'Footer depth for public-facing pages.', kind: 'choice', defaultValue: 'Minimal', options: [{ value: 'None' }, { value: 'Minimal' }, { value: 'Detailed' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Detailed', 'E-commerce': 'Detailed', 'SaaS / Client Portal': 'Detailed' },
  },

  {
    id: 'landing.secondaryCta', section: 'public', group: 'Hero', label: 'Secondary call-to-action', description: 'Offer one secondary path only when users genuinely have two common next steps.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'landing.primaryCta', equals: true },
    appDefaults: { 'Portfolio / Marketing': true, 'SaaS / Client Portal': true }, profileDefaults: { Advanced: true },
  },
  {
    id: 'landing.heroMediaType', section: 'public', group: 'Hero', label: 'Hero media type', description: 'Content type used for the primary landing visual before its render treatment is applied.', kind: 'choice', defaultValue: 'Product / contextual image',
    options: [{ value: 'Product / contextual image' }, { value: 'Illustration' }, { value: 'Screenshot / device mockup' }, { value: 'Video' }, { value: 'Interactive demo' }], dependsOn: { id: 'landing.heroImage', equals: true }, advanced: true,
  },
  {
    id: 'landing.announcement', section: 'public', group: 'Optional public modules', label: 'Announcement banner', description: 'Temporary high-priority public announcement above or near the main navigation.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Dismissible' }, { value: 'Persistent' }], dependsOn: { id: 'landing.enabled', equals: true }, profileDefaults: { Advanced: 'Dismissible' }, advanced: true,
  },
  {
    id: 'landing.trust', section: 'public', group: 'Proof & explanation', label: 'Trust / proof section', description: 'Use real credentials, client logos, certifications, usage evidence, or other verifiable trust signals.', kind: 'choice', defaultValue: 'Only when real proof exists',
    options: [{ value: 'Off' }, { value: 'Only when real proof exists' }, { value: 'Prominent' }], dependsOn: { id: 'landing.enabled', equals: true },
  },
  {
    id: 'landing.features', section: 'public', group: 'Proof & explanation', label: 'Feature / benefit section', description: 'Explain the most important capabilities or outcomes without turning the page into a feature dump.', kind: 'choice', defaultValue: 'Focused',
    options: [{ value: 'Off' }, { value: 'Focused' }, { value: 'Detailed' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Focused', 'SaaS / Client Portal': 'Detailed', 'Booking / Scheduling': 'Focused' },
  },
  {
    id: 'landing.howItWorks', section: 'public', group: 'Proof & explanation', label: 'How it works', description: 'Short step-by-step explanation when the product flow is not self-evident.', kind: 'choice', defaultValue: 'Auto when useful',
    options: [{ value: 'Off' }, { value: 'Auto when useful' }, { value: 'Always show' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Booking / Scheduling': 'Always show', 'SaaS / Client Portal': 'Always show', 'E-commerce': 'Off' },
  },
  {
    id: 'landing.stats', section: 'public', group: 'Proof & explanation', label: 'Statistics / metrics', description: 'Show numbers only when they are meaningful, current, and verifiable.', kind: 'choice', defaultValue: 'Off unless verified',
    options: [{ value: 'Off' }, { value: 'Off unless verified' }, { value: 'Show verified metrics' }], dependsOn: { id: 'landing.enabled', equals: true },
  },
  {
    id: 'landing.testimonials', section: 'public', group: 'Proof & explanation', label: 'Testimonials', description: 'Customer/user quotes only when genuine approved testimonials actually exist.', kind: 'choice', defaultValue: 'Off unless real',
    options: [{ value: 'Off' }, { value: 'Off unless real' }, { value: 'Show verified testimonials' }], dependsOn: { id: 'landing.enabled', equals: true },
  },
  {
    id: 'landing.caseStudies', section: 'public', group: 'Proof & explanation', label: 'Case studies / selected work', description: 'Deeper proof through real work, outcomes, or implementation examples.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Preview only' }, { value: 'Dedicated section' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Dedicated section', 'SaaS / Client Portal': 'Preview only' },
  },
  {
    id: 'landing.pricingPreview', section: 'public', group: 'Conversion', label: 'Pricing preview', description: 'Show pricing or plan summary on the landing page before a dedicated pricing page or checkout.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Starting price / summary' }, { value: 'Full plan preview' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Full plan preview' },
  },
  {
    id: 'landing.faqSection', section: 'public', group: 'Conversion', label: 'Landing FAQ section', description: 'Answer high-friction questions close to the decision point even if a full FAQ page also exists.', kind: 'choice', defaultValue: 'Auto when useful',
    options: [{ value: 'Off' }, { value: 'Auto when useful' }, { value: 'Always show' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Booking / Scheduling': 'Always show', 'SaaS / Client Portal': 'Always show' },
  },
  {
    id: 'landing.newsletter', section: 'public', group: 'Conversion', label: 'Newsletter / update signup', description: 'Collect email subscriptions only when there is a real ongoing update/content program to sustain.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Footer only' }, { value: 'Dedicated section' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Footer only' }, advanced: true,
  },
  {
    id: 'landing.socialLinks', section: 'public', group: 'Page basics', label: 'Social / external profiles', description: 'Expose external profiles only when maintained and useful; keep them secondary to product tasks.', kind: 'choice', defaultValue: 'Footer only',
    options: [{ value: 'Off' }, { value: 'Footer only' }, { value: 'Footer + contact/about' }], dependsOn: { id: 'landing.enabled', equals: true },
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off' },
  },
  {
    id: 'landing.appBadges', section: 'public', group: 'Conversion', label: 'App-store / install badges', description: 'Show store or install badges only when a real installable/native product exists.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'PWA install cue' }, { value: 'Native app-store badges' }], dependsOn: { id: 'landing.enabled', equals: true }, advanced: true,
  },
  {
    id: 'landing.finalCta', section: 'public', group: 'Conversion', label: 'Final call-to-action', description: 'Repeat the primary next step after users have enough context to decide.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'landing.enabled', equals: true },
  },
  {
    id: 'landing.stickyCta', section: 'public', group: 'Conversion', label: 'Sticky conversion action', description: 'Keep the main conversion action reachable on long mobile/public pages when it materially helps completion.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Mobile only' }, { value: 'All devices' }], dependsOn: { id: 'landing.primaryCta', equals: true },
    appDefaults: { 'Booking / Scheduling': 'Mobile only', 'E-commerce': 'Mobile only' }, advanced: true,
  },


  // Navigation & orientation
  {
    id: 'nav.depth', section: 'navigation', group: 'Structure', label: 'Navigation depth', description: 'How many hierarchy levels the primary navigation should expose before switching to page-local navigation.', kind: 'choice', defaultValue: 'Two levels max',
    options: [{ value: 'One level' }, { value: 'Two levels max' }, { value: 'Deep hierarchy' }],
    appDefaults: { 'Portfolio / Marketing': 'One level', 'Government System': 'Deep hierarchy', 'Clinic / EMR': 'Deep hierarchy', 'Internal / Operations': 'Deep hierarchy' }, profileDefaults: { Minimal: 'One level', Advanced: 'Deep hierarchy' },
  },
  {
    id: 'nav.userMenu', section: 'navigation', group: 'Account navigation', label: 'User / account menu', description: 'Persistent signed-in access to profile, settings, sessions, and logout.', kind: 'choice', defaultValue: 'Compact account menu',
    options: [{ value: 'Off' }, { value: 'Compact account menu' }, { value: 'Detailed account menu' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed account menu', 'Clinic / EMR': 'Detailed account menu' }, profileDefaults: { Minimal: 'Off' },
  },
  {
    id: 'nav.globalSearch', section: 'navigation', group: 'Fast access', label: 'Global search entry', description: 'Make cross-module search reachable from the app shell when users frequently retrieve known records.', kind: 'choice', defaultValue: 'Auto when useful',
    options: [{ value: 'Off' }, { value: 'Auto when useful' }, { value: 'Always visible' }], dependsOn: { id: 'pages.search', equals: true },
    appDefaults: { 'Government System': 'Always visible', 'Clinic / EMR': 'Always visible', 'Internal / Operations': 'Always visible', 'Directory / Marketplace': 'Always visible' },
  },
  {
    id: 'nav.commandPalette', section: 'navigation', group: 'Fast access', label: 'Command palette', description: 'Keyboard-first universal launcher for navigation and safe actions; never the only way to reach essential features.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Navigation only' }, { value: 'Navigation + safe actions' }],
    appDefaults: { 'Internal / Operations': 'Navigation only', 'Government System': 'Navigation only' }, profileDefaults: { Advanced: 'Navigation + safe actions' }, advanced: true,
  },
  {
    id: 'nav.quickActions', section: 'navigation', group: 'Fast access', label: 'Global quick actions', description: 'Provide a small set of frequent create/start actions without turning the shell into a toolbar.', kind: 'choice', defaultValue: 'Contextual',
    options: [{ value: 'Off' }, { value: 'Contextual' }, { value: 'Persistent' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Internal / Operations': 'Persistent', 'Clinic / EMR': 'Persistent', 'Inventory / POS': 'Persistent' },
  },
  {
    id: 'nav.recent', section: 'navigation', group: 'Context recovery', label: 'Recent items / locations', description: 'Let users quickly return to recently visited records or modules when workflows are interruption-heavy.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Recent pages' }, { value: 'Recent records + pages' }],
    appDefaults: { 'Government System': 'Recent records + pages', 'Clinic / EMR': 'Recent records + pages', 'Internal / Operations': 'Recent records + pages' }, profileDefaults: { Advanced: 'Recent records + pages' }, advanced: true,
  },
  {
    id: 'nav.favorites', section: 'navigation', group: 'Context recovery', label: 'Favorites / pinned destinations', description: 'Allow power users to pin frequently used modules, records, or saved views.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Government System': true, 'Internal / Operations': true }, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'nav.backBehavior', section: 'navigation', group: 'Context recovery', label: 'Back behavior', description: 'Make in-app back actions respect browser history and preserve the user’s previous list/filter context.', kind: 'choice', defaultValue: 'History-aware + preserve context',
    options: [{ value: 'Browser default' }, { value: 'History-aware' }, { value: 'History-aware + preserve context' }],
    appDefaults: { 'Portfolio / Marketing': 'Browser default' }, profileDefaults: { Minimal: 'Browser default' },
  },
  {
    id: 'nav.scrollRestoration', section: 'navigation', group: 'Context recovery', label: 'Scroll restoration', description: 'Return users to their prior scroll position when navigating back to long lists or content.', kind: 'choice', defaultValue: 'Restore on back',
    options: [{ value: 'Off' }, { value: 'Restore on back' }, { value: 'Restore per page / workspace' }],
    appDefaults: { 'Portfolio / Marketing': 'Restore on back', 'Directory / Marketplace': 'Restore on back' }, profileDefaults: { Minimal: 'Off', Advanced: 'Restore per page / workspace' },
  },
  {
    id: 'nav.deepLinks', section: 'navigation', group: 'URL behavior', label: 'Deep links', description: 'Important screens, records, filters, and tabs should be directly linkable when permissions allow.', kind: 'choice', defaultValue: 'Important destinations',
    options: [{ value: 'Basic pages only' }, { value: 'Important destinations' }, { value: 'Full stateful deep links' }],
    appDefaults: { 'Government System': 'Full stateful deep links', 'Internal / Operations': 'Full stateful deep links' }, profileDefaults: { Minimal: 'Basic pages only', Advanced: 'Full stateful deep links' },
  },
  {
    id: 'nav.urlState', section: 'navigation', group: 'URL behavior', label: 'Persist useful view state in URL', description: 'Keep shareable filters, search queries, tabs, or pagination in the URL when that improves recovery and sharing.', kind: 'choice', defaultValue: 'Search / filters / tabs',
    options: [{ value: 'Off' }, { value: 'Search / filters / tabs' }, { value: 'Most non-sensitive view state' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Directory / Marketplace': 'Most non-sensitive view state' }, profileDefaults: { Minimal: 'Off', Advanced: 'Most non-sensitive view state' }, advanced: true,
  },

  // Dashboard
  {
    id: 'dashboard.enabled', section: 'dashboard', group: 'Presence', label: 'Dashboard', description: 'Provide a signed-in home surface that summarizes what needs attention or what changed.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false, 'Directory / Marketplace': false, 'E-commerce': false },
  },
  {
    id: 'dashboard.complexity', section: 'dashboard', group: 'Presence', label: 'Dashboard complexity', description: 'Amount of information and operational depth visible before users navigate into modules.', kind: 'choice', defaultValue: 'Focused',
    options: [{ value: 'Minimal' }, { value: 'Focused' }, { value: 'Detailed' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed', 'Clinic / EMR': 'Detailed', 'Internal / Operations': 'Detailed', 'Inventory / POS': 'Detailed' }, profileDefaults: { Minimal: 'Minimal', Advanced: 'Detailed' },
  },
  {
    id: 'dashboard.roleBased', section: 'dashboard', group: 'Presence', label: 'Role-specific dashboards', description: 'Show different priorities/widgets to roles with genuinely different daily responsibilities.', kind: 'choice', defaultValue: 'Auto when roles differ',
    options: [{ value: 'Off' }, { value: 'Auto when roles differ' }, { value: 'Required' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': 'Required', 'Clinic / EMR': 'Required', 'Internal / Operations': 'Required' }, profileDefaults: { Minimal: 'Off', Advanced: 'Required' },
  },
  {
    id: 'dashboard.kpis', section: 'dashboard', group: 'Core modules', label: 'KPI / summary cards', description: 'Show a small number of decision-useful metrics rather than decorative counters.', kind: 'choice', defaultValue: 'Only meaningful KPIs',
    options: [{ value: 'Off' }, { value: 'Only meaningful KPIs' }, { value: 'Expanded scorecard' }], dependsOn: { id: 'dashboard.enabled', equals: true },
  },
  {
    id: 'dashboard.quickActions', section: 'dashboard', group: 'Core modules', label: 'Dashboard quick actions', description: 'Surface common start/create actions near the signed-in home context.', kind: 'choice', defaultValue: 'Top 2–4 actions',
    options: [{ value: 'Off' }, { value: 'Top 2–4 actions' }, { value: 'Role-specific actions' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': 'Role-specific actions', 'Clinic / EMR': 'Role-specific actions', 'Internal / Operations': 'Role-specific actions' },
  },
  {
    id: 'dashboard.activity', section: 'dashboard', group: 'Core modules', label: 'Recent activity', description: 'Show meaningful recent changes, work, or history when it helps users resume context.', kind: 'choice', defaultValue: 'Relevant activity only',
    options: [{ value: 'Off' }, { value: 'Relevant activity only' }, { value: 'Detailed feed' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': 'Detailed feed', 'Clinic / EMR': 'Relevant activity only' },
  },
  {
    id: 'dashboard.workQueue', section: 'dashboard', group: 'Operational modules', label: 'Tasks / work queue', description: 'Show assigned, pending, overdue, or approval work directly when the app is operational.', kind: 'choice', defaultValue: 'Auto when workflow exists',
    options: [{ value: 'Off' }, { value: 'Auto when workflow exists' }, { value: 'Primary dashboard module' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': 'Primary dashboard module', 'Clinic / EMR': 'Primary dashboard module', 'Internal / Operations': 'Primary dashboard module', 'Inventory / POS': 'Auto when workflow exists' },
  },
  {
    id: 'dashboard.calendar', section: 'dashboard', group: 'Operational modules', label: 'Calendar / schedule preview', description: 'Show today/upcoming schedule only when time is a core organizing dimension.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Upcoming preview' }, { value: 'Embedded calendar' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Booking / Scheduling': 'Embedded calendar', 'Clinic / EMR': 'Upcoming preview', 'Tournament / Event': 'Upcoming preview' },
  },
  {
    id: 'dashboard.charts', section: 'dashboard', group: 'Operational modules', label: 'Charts / trends', description: 'Use charts only when trend or comparison is more useful than a plain number or table.', kind: 'choice', defaultValue: 'Only decision-useful charts',
    options: [{ value: 'Off' }, { value: 'Only decision-useful charts' }, { value: 'Analytics-heavy' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Inventory / POS': 'Analytics-heavy' },
  },
  {
    id: 'dashboard.customizable', section: 'dashboard', group: 'Personalization', label: 'User-customizable dashboard', description: 'Allow rearranging/hiding widgets only when users have different recurring priorities.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Hide / show widgets' }, { value: 'Reorder + hide / show' }], dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'SaaS / Client Portal': 'Hide / show widgets' }, profileDefaults: { Advanced: 'Reorder + hide / show' }, advanced: true,
  },
  {
    id: 'dashboard.savedViews', section: 'dashboard', group: 'Personalization', label: 'Saved views on dashboard', description: 'Pin saved filters/reports/queries to dashboard for repeat operational work.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'dashboard.enabled', equals: true },
    appDefaults: { 'Government System': true, 'Internal / Operations': true, 'Inventory / POS': true }, profileDefaults: { Advanced: true }, advanced: true,
  },

  // Everyday UX
  {
    id: 'ux.progressiveDisclosure', section: 'experience', group: 'Complexity management', label: 'Progressive disclosure', description: 'Keep common choices visible and place rare/advanced controls one level deeper.', kind: 'boolean', defaultValue: true,
  },
  {
    id: 'ux.autosave', section: 'experience', group: 'Editing', label: 'Autosave drafts', description: 'Preserve unfinished work when losing it would be frustrating or costly.', kind: 'choice', defaultValue: 'Where useful',
    options: [{ value: 'Off' }, { value: 'Where useful' }, { value: 'Most editable screens' }],
    appDefaults: { 'Government System': 'Where useful', 'Clinic / EMR': 'Most editable screens', 'Internal / Operations': 'Where useful' }, profileDefaults: { Minimal: 'Off', Advanced: 'Most editable screens' },
  },
  {
    id: 'ux.unsavedWarning', section: 'experience', group: 'Safety & recovery', label: 'Unsaved-changes warning', description: 'Warn before navigating away from meaningful unsaved edits.', kind: 'boolean', defaultValue: true,
    profileDefaults: { Minimal: false },
  },
  {
    id: 'ux.feedback', section: 'experience', group: 'Feedback', label: 'Action feedback', description: 'Default feedback pattern after save, update, delete, and other actions.', kind: 'choice', defaultValue: 'Inline + toast when appropriate',
    options: [{ value: 'Minimal' }, { value: 'Toast' }, { value: 'Inline' }, { value: 'Inline + toast when appropriate' }], profileDefaults: { Minimal: 'Minimal' },
  },
  {
    id: 'ux.confirmation', section: 'experience', group: 'Safety & recovery', label: 'Destructive action protection', description: 'Protection level before irreversible or high-impact actions.', kind: 'choice', defaultValue: 'Confirmation',
    options: [{ value: 'None' }, { value: 'Confirmation' }, { value: 'Type to confirm for high-risk actions' }, { value: 'Re-authenticate for high-risk actions' }],
    appDefaults: { 'Government System': 'Type to confirm for high-risk actions', 'Clinic / EMR': 'Type to confirm for high-risk actions' }, profileDefaults: { Minimal: 'Confirmation', Advanced: 'Type to confirm for high-risk actions' },
  },
  {
    id: 'ux.emptyStates', section: 'states', group: 'Empty states', label: 'Purpose-built empty states', description: 'Differentiate first-use, no-results, and filtered-empty states with a useful next action.', kind: 'boolean', defaultValue: true,
  },
  {
    id: 'ux.errorRecovery', section: 'states', group: 'Errors & recovery', label: 'User-facing recovery actions', description: 'Errors should explain what happened and provide a safe retry or next step.', kind: 'boolean', defaultValue: true,
  },
  {
    id: 'ux.loading', section: 'states', group: 'Loading & progress', label: 'Loading treatment', description: 'Preferred loading behavior for data-heavy or delayed screens.', kind: 'choice', defaultValue: 'Skeleton where useful',
    options: [{ value: 'Spinner' }, { value: 'Skeleton where useful' }, { value: 'Optimistic where safe' }, { value: 'Hybrid' }], profileDefaults: { Minimal: 'Spinner', Advanced: 'Hybrid' }, advanced: true,
  },
  {
    id: 'ux.keyboardShortcuts', section: 'experience', group: 'Efficiency', label: 'Keyboard shortcuts', description: 'Add efficiency shortcuts for frequent desktop workflows without hiding essential actions.', kind: 'choice', defaultValue: 'Core shortcuts only',
    options: [{ value: 'Off' }, { value: 'Core shortcuts only' }, { value: 'Power-user set' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Booking / Scheduling': 'Core shortcuts only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Power-user set' }, advanced: true,
  },

  {
    id: 'ux.undo', section: 'experience', group: 'Safety & recovery', label: 'Undo for reversible actions', description: 'Prefer a short undo window for low-risk reversible actions instead of repeated confirmation dialogs.', kind: 'choice', defaultValue: 'Where safe',
    options: [{ value: 'Off' }, { value: 'Where safe' }, { value: 'Aggressively prefer undo' }], profileDefaults: { Minimal: 'Off', Advanced: 'Aggressively prefer undo' }, advanced: true,
  },
  {
    id: 'ux.optimistic', section: 'experience', group: 'Speed perception', label: 'Optimistic updates', description: 'Update the interface immediately for safe reversible operations while retaining rollback/error behavior.', kind: 'choice', defaultValue: 'Safe actions only',
    options: [{ value: 'Off' }, { value: 'Safe actions only' }, { value: 'Broad use with rollback' }], profileDefaults: { Minimal: 'Off', Advanced: 'Broad use with rollback' }, advanced: true,
  },
  {
    id: 'ux.longRunning', section: 'experience', group: 'Speed perception', label: 'Long-running action feedback', description: 'Show meaningful progress/state for imports, exports, uploads, AI jobs, reports, or other non-instant actions.', kind: 'choice', defaultValue: 'Progress + completion feedback',
    options: [{ value: 'Simple busy state' }, { value: 'Progress + completion feedback' }, { value: 'Background job + return later' }], profileDefaults: { Minimal: 'Simple busy state', Advanced: 'Background job + return later' },
  },
  {
    id: 'ux.inlineEdit', section: 'experience', group: 'Editing', label: 'Inline editing', description: 'Allow direct editing inside tables/cards only for simple fields where it is faster and still clear.', kind: 'choice', defaultValue: 'Off by default',
    options: [{ value: 'Off' }, { value: 'Off by default' }, { value: 'Simple fields only' }, { value: 'Common workflow' }],
    appDefaults: { 'Inventory / POS': 'Simple fields only', 'Internal / Operations': 'Simple fields only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Simple fields only' }, advanced: true,
  },
  {
    id: 'ux.modalPolicy', section: 'experience', group: 'Overlays', label: 'Modal policy', description: 'How willing the product should be to interrupt page context with modal dialogs.', kind: 'choice', defaultValue: 'Only confirmations / tiny tasks',
    options: [{ value: 'Avoid modals' }, { value: 'Only confirmations / tiny tasks' }, { value: 'Moderate use' }, { value: 'Modal-heavy' }],
    appDefaults: { 'Portfolio / Marketing': 'Avoid modals' }, profileDefaults: { Minimal: 'Avoid modals' },
  },
  {
    id: 'ux.formOverlay', section: 'experience', group: 'Overlays', label: 'Form overlay behavior', description: 'Where short create/edit tasks should appear when they do not deserve a full page.', kind: 'choice', defaultValue: 'Drawer for medium forms',
    options: [{ value: 'Always full page' }, { value: 'Drawer for medium forms' }, { value: 'Modal for short forms' }, { value: 'Context dependent' }],
    appDefaults: { 'Government System': 'Context dependent', 'Clinic / EMR': 'Context dependent' }, profileDefaults: { Minimal: 'Always full page' },
  },
  {
    id: 'ux.mobileOverlay', section: 'experience', group: 'Overlays', label: 'Mobile overlay behavior', description: 'On small screens, convert cramped desktop dialogs into full-screen or bottom-sheet experiences.', kind: 'choice', defaultValue: 'Fullscreen for forms; sheet for quick choices',
    options: [{ value: 'Same as desktop' }, { value: 'Fullscreen for forms' }, { value: 'Fullscreen for forms; sheet for quick choices' }], profileDefaults: { Minimal: 'Fullscreen for forms' },
  },
  {
    id: 'ux.dismissOverlay', section: 'experience', group: 'Overlays', label: 'Overlay dismissal', description: 'Dismiss non-destructive overlays with Escape/backdrop when safe, but never lose meaningful unsaved work silently.', kind: 'choice', defaultValue: 'Escape + backdrop when safe',
    options: [{ value: 'Explicit close only' }, { value: 'Escape when safe' }, { value: 'Escape + backdrop when safe' }], advanced: true,
  },
  {
    id: 'ux.typeToConfirm', section: 'experience', group: 'Safety & recovery', label: 'Type-to-confirm destructive actions', description: 'Reserve typed confirmation for truly high-impact irreversible actions rather than routine deletes.', kind: 'choice', defaultValue: 'Critical actions only',
    options: [{ value: 'Off' }, { value: 'Critical actions only' }, { value: 'Most permanent deletes' }], profileDefaults: { Minimal: 'Off', Advanced: 'Most permanent deletes' }, advanced: true,
  },

  // States & recovery additions
  {
    id: 'states.firstUse', section: 'states', group: 'Empty states', label: 'First-use state', description: 'When no data exists yet, explain what this area is for and offer the best first action.', kind: 'choice', defaultValue: 'Explain + primary action',
    options: [{ value: 'Minimal message' }, { value: 'Explain + primary action' }, { value: 'Guided setup' }],
    appDefaults: { 'SaaS / Client Portal': 'Guided setup' }, profileDefaults: { Minimal: 'Minimal message' },
  },
  {
    id: 'states.noResults', section: 'states', group: 'Empty states', label: 'No-results state', description: 'Differentiate true empty data from a search/filter that simply found no matches.', kind: 'choice', defaultValue: 'Explain + clear filters / retry',
    options: [{ value: 'Simple message' }, { value: 'Explain + clear filters / retry' }, { value: 'Suggest alternatives' }],
  },
  {
    id: 'states.permission', section: 'states', group: 'Access states', label: 'Permission denied state', description: 'Explain that access is restricted without leaking sensitive information, and provide the correct recovery path.', kind: 'choice', defaultValue: 'Explain + safe next step',
    options: [{ value: 'Generic denied' }, { value: 'Explain + safe next step' }, { value: 'Request-access workflow' }],
    appDefaults: { 'Government System': 'Request-access workflow', 'Internal / Operations': 'Request-access workflow' }, profileDefaults: { Minimal: 'Generic denied', Advanced: 'Request-access workflow' },
  },
  {
    id: 'states.notFound', section: 'states', group: 'Access states', label: '404 / missing record state', description: 'Provide a branded missing-page/record state with a useful way back rather than framework-default output.', kind: 'choice', defaultValue: 'Helpful recovery page',
    options: [{ value: 'Basic' }, { value: 'Helpful recovery page' }, { value: 'Context-aware recovery' }], profileDefaults: { Minimal: 'Basic', Advanced: 'Context-aware recovery' },
  },
  {
    id: 'states.offline', section: 'states', group: 'Connectivity', label: 'Offline / network-loss state', description: 'Make network loss explicit and distinguish unavailable actions from locally safe ones.', kind: 'choice', defaultValue: 'Persistent status + retry',
    options: [{ value: 'Basic error' }, { value: 'Persistent status + retry' }, { value: 'Network-aware UI' }],
    appDefaults: { 'Portfolio / Marketing': 'Basic error', 'Inventory / POS': 'Network-aware UI' }, profileDefaults: { Minimal: 'Basic error', Advanced: 'Network-aware UI' },
  },
  {
    id: 'states.maintenance', section: 'states', group: 'Service states', label: 'Maintenance state', description: 'Intentional service-unavailable state with plain-language status and next expected action.', kind: 'choice', defaultValue: 'Simple maintenance page',
    options: [{ value: 'Generic unavailable' }, { value: 'Simple maintenance page' }, { value: 'Status + support links' }], profileDefaults: { Minimal: 'Generic unavailable', Advanced: 'Status + support links' }, advanced: true,
  },
  {
    id: 'states.sessionExpired', section: 'states', group: 'Access states', label: 'Session-expired recovery', description: 'Preserve safe context/drafts where possible, then return users to what they were doing after reauthentication.', kind: 'choice', defaultValue: 'Re-login + return',
    options: [{ value: 'Redirect to login' }, { value: 'Re-login + return' }, { value: 'Re-login + preserve draft/context' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Re-login + preserve draft/context', 'Clinic / EMR': 'Re-login + preserve draft/context' }, profileDefaults: { Minimal: 'Redirect to login', Advanced: 'Re-login + preserve draft/context' },
  },
  {
    id: 'states.thirdParty', section: 'states', group: 'Service states', label: 'Third-party failure', description: 'If payments, maps, email, AI, or other dependencies fail, show bounded fallback behavior instead of a broken screen.', kind: 'choice', defaultValue: 'Degrade gracefully + retry',
    options: [{ value: 'Generic error' }, { value: 'Degrade gracefully + retry' }, { value: 'Fallback path + status detail' }], profileDefaults: { Minimal: 'Generic error', Advanced: 'Fallback path + status detail' },
  },
  {
    id: 'states.partialSuccess', section: 'states', group: 'Service states', label: 'Partial-success feedback', description: 'When bulk or multi-step operations only partly complete, clearly separate successes, failures, and retryable items.', kind: 'choice', defaultValue: 'Summarize successes + failures',
    options: [{ value: 'Generic result' }, { value: 'Summarize successes + failures' }, { value: 'Per-item result + retry failed' }], profileDefaults: { Minimal: 'Generic result', Advanced: 'Per-item result + retry failed' }, advanced: true,
  },

  // Mobile behavior
  {
    id: 'mobile.tables', section: 'mobile', group: 'Dense data', label: 'Tables on phones', description: 'Adapt data-dense tables instead of simply squeezing desktop columns into a narrow viewport.', kind: 'choice', defaultValue: 'Priority columns + detail view',
    options: [{ value: 'Horizontal scroll' }, { value: 'Priority columns + detail view' }, { value: 'Card / list transformation' }, { value: 'Context dependent' }],
    appDefaults: { 'Government System': 'Context dependent', 'Clinic / EMR': 'Context dependent', 'Inventory / POS': 'Context dependent', 'Directory / Marketplace': 'Card / list transformation' },
  },
  {
    id: 'mobile.forms', section: 'mobile', group: 'Forms & input', label: 'Forms on phones', description: 'Reduce layout complexity, use mobile-native input affordances, and keep primary completion actions easy to reach.', kind: 'choice', defaultValue: 'Single-column + adaptive controls',
    options: [{ value: 'Desktop form reflow' }, { value: 'Single-column + adaptive controls' }, { value: 'Step-by-step on mobile' }],
    appDefaults: { 'Government System': 'Single-column + adaptive controls', 'Clinic / EMR': 'Single-column + adaptive controls' },
  },
  {
    id: 'mobile.primaryAction', section: 'mobile', group: 'Actions', label: 'Primary action placement', description: 'Keep the main action thumb-reachable for long or task-heavy mobile screens.', kind: 'choice', defaultValue: 'Sticky when task benefits',
    options: [{ value: 'Normal document flow' }, { value: 'Sticky when task benefits' }, { value: 'Persistent bottom action' }],
    appDefaults: { 'Booking / Scheduling': 'Persistent bottom action', 'E-commerce': 'Persistent bottom action' },
  },
  {
    id: 'mobile.touchTargets', section: 'mobile', group: 'Actions', label: 'Touch-target priority', description: 'Avoid tiny icon controls and tightly packed actions on touch devices.', kind: 'choice', defaultValue: 'Large touch-friendly targets',
    options: [{ value: 'Standard responsive' }, { value: 'Large touch-friendly targets' }, { value: 'Extra forgiving' }],
    appDefaults: { 'Booking / Scheduling': 'Extra forgiving' },
  },
  {
    id: 'mobile.bottomSheets', section: 'mobile', group: 'Overlays & navigation', label: 'Bottom sheets', description: 'Use bottom sheets for short mobile choice/action contexts where they are easier than centered dialogs.', kind: 'choice', defaultValue: 'Where useful',
    options: [{ value: 'Off' }, { value: 'Where useful' }, { value: 'Preferred for mobile quick actions' }], profileDefaults: { Minimal: 'Off', Advanced: 'Preferred for mobile quick actions' }, advanced: true,
  },
  {
    id: 'mobile.gestures', section: 'mobile', group: 'Overlays & navigation', label: 'Gesture shortcuts', description: 'Use swipe/gesture shortcuts only as optional accelerators with visible alternatives.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Conservative' }, { value: 'Power-user gestures' }], profileDefaults: { Advanced: 'Conservative' }, advanced: true,
  },
  {
    id: 'mobile.pullRefresh', section: 'mobile', group: 'Connectivity', label: 'Pull to refresh', description: 'Enable only on feed/list surfaces where the interaction is expected and refresh is meaningful.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Feed / list surfaces only' }, { value: 'Broad use' }],
    appDefaults: { 'Tournament / Event': 'Feed / list surfaces only', 'Directory / Marketplace': 'Feed / list surfaces only' }, advanced: true,
  },
  {
    id: 'mobile.keyboard', section: 'mobile', group: 'Forms & input', label: 'On-screen keyboard handling', description: 'Prevent focused fields and primary actions from being hidden by the mobile keyboard.', kind: 'choice', defaultValue: 'Required',
    options: [{ value: 'Standard browser behavior' }, { value: 'Required' }, { value: 'Test complex keyboard flows' }],
    appDefaults: { 'Clinic / EMR': 'Test complex keyboard flows', 'Government System': 'Test complex keyboard flows' },
  },
  {
    id: 'mobile.safeAreas', section: 'mobile', group: 'Viewport behavior', label: 'Safe-area handling', description: 'Respect notches, browser chrome, and device insets for sticky bars and edge-aligned controls.', kind: 'choice', defaultValue: 'Required for sticky UI',
    options: [{ value: 'Basic responsive' }, { value: 'Required for sticky UI' }, { value: 'Explicit device-inset testing' }], profileDefaults: { Minimal: 'Basic responsive', Advanced: 'Explicit device-inset testing' }, advanced: true,
  },
  {
    id: 'mobile.orientation', section: 'mobile', group: 'Viewport behavior', label: 'Orientation support', description: 'Whether the product must intentionally support both portrait and landscape task layouts.', kind: 'choice', defaultValue: 'Portrait-first; landscape usable',
    options: [{ value: 'Portrait only' }, { value: 'Portrait-first; landscape usable' }, { value: 'Both first-class' }],
    appDefaults: { 'Tournament / Event': 'Both first-class', 'Inventory / POS': 'Both first-class' },
  },
  {
    id: 'mobile.networkBanner', section: 'mobile', group: 'Connectivity', label: 'Network-quality indicator', description: 'Surface offline/reconnecting state on workflows where weak mobile data can cause duplicate actions or confusion.', kind: 'choice', defaultValue: 'Offline / reconnecting only',
    options: [{ value: 'Off' }, { value: 'Offline / reconnecting only' }, { value: 'Offline + degraded connection' }],
    appDefaults: { 'Inventory / POS': 'Offline + degraded connection', 'Booking / Scheduling': 'Offline / reconnecting only' }, advanced: true,
  },


  // Records & forms
  {
    id: 'records.crud', section: 'records', label: 'Record CRUD', description: 'Create, view, edit, and remove core domain records with consistent behavior.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false },
  },
  {
    id: 'records.delete', section: 'records', label: 'Default delete behavior', description: 'How routine record deletion should behave.', kind: 'choice', defaultValue: 'Soft delete + restore',
    options: [{ value: 'Hard delete' }, { value: 'Soft delete + restore' }, { value: 'Archive instead of delete' }, { value: 'No user deletion' }], dependsOn: { id: 'records.crud', equals: true },
    appDefaults: { 'Clinic / EMR': 'No user deletion', 'Government System': 'Soft delete + restore' }, profileDefaults: { Minimal: 'Hard delete', Advanced: 'Soft delete + restore' },
  },
  {
    id: 'records.search', section: 'records', label: 'Search', description: 'Search records using fields users naturally remember.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false },
  },
  {
    id: 'records.filters', section: 'records', label: 'Filters', description: 'Structured filters for growing lists and operational datasets.', kind: 'choice', defaultValue: 'Simple',
    options: [{ value: 'Off' }, { value: 'Simple' }, { value: 'Advanced' }, { value: 'Saved views' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Advanced', 'Clinic / EMR': 'Advanced', 'Inventory / POS': 'Advanced' }, profileDefaults: { Minimal: 'Off', Advanced: 'Saved views' },
  },
  {
    id: 'records.pagination', section: 'records', label: 'Large-list loading', description: 'How growing datasets should be bounded and navigated.', kind: 'choice', defaultValue: 'Pagination',
    options: [{ value: 'Load all' }, { value: 'Pagination' }, { value: 'Load more' }, { value: 'Infinite scroll' }],
    appDefaults: { 'Portfolio / Marketing': 'Load all', 'Directory / Marketplace': 'Load more' }, profileDefaults: { Minimal: 'Load all' }, advanced: true,
  },
  {
    id: 'records.bulkActions', section: 'records', label: 'Bulk actions', description: 'Allow safe actions across multiple selected records.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Internal / Operations': true, 'Government System': true, 'Clinic / EMR': true, 'Inventory / POS': true }, profileDefaults: { Minimal: false, Advanced: true }, advanced: true,
  },
  {
    id: 'forms.structure', section: 'records', label: 'Long-form structure', description: 'Default structure when a form has many fields.', kind: 'choice', defaultValue: 'Sectioned',
    options: [{ value: 'Single page' }, { value: 'Sectioned' }, { value: 'Multi-step wizard' }, { value: 'Adaptive / conditional' }],
    appDefaults: { 'Portfolio / Marketing': 'Single page', 'Government System': 'Sectioned', 'Clinic / EMR': 'Sectioned' },
  },
  {
    id: 'forms.validation', section: 'records', label: 'Validation feedback', description: 'When and where validation errors should be shown.', kind: 'choice', defaultValue: 'Inline + submit summary',
    options: [{ value: 'On submit only' }, { value: 'Inline' }, { value: 'Inline + submit summary' }, { value: 'Live where safe + submit summary' }],
    appDefaults: { 'Portfolio / Marketing': 'Inline', 'Government System': 'Inline + submit summary', 'Clinic / EMR': 'Inline + submit summary' },
  },
  {
    id: 'files.enabled', section: 'records', label: 'File attachments', description: 'Allow files or supporting documents to be attached to records.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false, 'Tournament / Event': false }, profileDefaults: { Minimal: false },
  },
  {
    id: 'files.policy', section: 'records', label: 'Upload protection', description: 'Validation and access-control expectations for uploaded files.', kind: 'choice', defaultValue: 'Restricted types + size limits',
    options: [{ value: 'Basic' }, { value: 'Restricted types + size limits' }, { value: 'Hardened + scanning' }], dependsOn: { id: 'files.enabled', equals: true },
    appDefaults: { 'Government System': 'Hardened + scanning', 'Clinic / EMR': 'Hardened + scanning' }, profileDefaults: { Minimal: 'Basic', Advanced: 'Hardened + scanning' }, advanced: true,
  },
  {
    id: 'records.importExport', section: 'records', label: 'Import / export', description: 'Data portability for CSV/Excel or equivalent operational formats.', kind: 'choice', defaultValue: 'Export only',
    options: [{ value: 'Off' }, { value: 'Export only' }, { value: 'Import + export' }, { value: 'Import + export + validation report' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Import + export + validation report', 'Inventory / POS': 'Import + export + validation report' }, profileDefaults: { Minimal: 'Off', Advanced: 'Import + export + validation report' }, advanced: true,
  },

  // Admin & workflow
  {
    id: 'admin.enabled', section: 'operations', label: 'Admin panel', description: 'Protected administration area for users, records, settings, or operations.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false },
  },
  {
    id: 'admin.complexity', section: 'operations', label: 'Admin complexity', description: 'Depth of administration and operational controls.', kind: 'choice', defaultValue: 'Standard', options: [{ value: 'Simple' }, { value: 'Standard' }, { value: 'Advanced' }], dependsOn: { id: 'admin.enabled', equals: true },
    appDefaults: { 'Government System': 'Advanced', 'Clinic / EMR': 'Advanced', 'Internal / Operations': 'Advanced', 'Inventory / POS': 'Advanced' }, profileDefaults: { Minimal: 'Simple', Advanced: 'Advanced' },
  },
  {
    id: 'roles.level', section: 'permissions', group: 'Authorization model', label: 'Roles & permissions', description: 'Authorization detail beyond a single admin/user split.', kind: 'choice', defaultValue: 'Role based',
    options: [{ value: 'Simple admin/user' }, { value: 'Role based' }, { value: 'Fine-grained permissions' }], dependsOn: { id: 'login.enabled', equals: true },
    appDefaults: { 'Government System': 'Fine-grained permissions', 'Clinic / EMR': 'Fine-grained permissions', 'Internal / Operations': 'Role based' }, profileDefaults: { Minimal: 'Simple admin/user', Advanced: 'Fine-grained permissions' },
  },
  {
    id: 'permissions.model', section: 'permissions', group: 'Authorization model', label: 'Authorization model', description: 'How permissions are conceptually decided after authentication.', kind: 'choice', defaultValue: 'RBAC',
    options: [{ value: 'Simple role checks' }, { value: 'RBAC' }, { value: 'RBAC + ownership rules' }, { value: 'Attribute / policy based' }, { value: 'Hybrid' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Hybrid', 'Clinic / EMR': 'RBAC + ownership rules', 'Internal / Operations': 'RBAC + ownership rules', 'SaaS / Client Portal': 'RBAC + ownership rules' }, profileDefaults: { Minimal: 'Simple role checks', Advanced: 'Hybrid' },
  },
  {
    id: 'permissions.defaultPolicy', section: 'permissions', group: 'Authorization model', label: 'Default authorization policy', description: 'When no explicit rule grants access, deny it rather than assuming access is allowed.', kind: 'choice', defaultValue: 'Deny by default',
    options: [{ value: 'Deny by default' }, { value: 'Allow by default' }], dependsOn: { id: 'login.enabled', equals: true },
    caution: 'Allow-by-default authorization is risky because newly added routes/actions can become exposed unless every path remembers to restrict them.',
  },
  {
    id: 'permissions.enforcement', section: 'permissions', group: 'Authorization model', label: 'Permission enforcement', description: 'UI visibility is only a convenience; sensitive authorization must also be enforced on the server/action boundary.', kind: 'choice', defaultValue: 'Server enforced + UI reflects access',
    options: [{ value: 'Server enforced + UI reflects access' }, { value: 'Server enforced only' }, { value: 'UI checks only' }], dependsOn: { id: 'login.enabled', equals: true },
    caution: 'Hiding a button is not authorization. UI-only checks are not sufficient for protected actions.',
  },
  {
    id: 'permissions.systemRoles', section: 'permissions', group: 'Role structure', label: 'Built-in system roles', description: 'Provide sensible default roles so a new project does not require designing a permission matrix from zero.', kind: 'choice', defaultValue: 'Admin + member / user',
    options: [{ value: 'Admin only' }, { value: 'Admin + member / user' }, { value: 'Admin + manager + staff + viewer' }, { value: 'Domain-specific role set' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Domain-specific role set', 'Clinic / EMR': 'Domain-specific role set', 'Internal / Operations': 'Admin + manager + staff + viewer', 'SaaS / Client Portal': 'Admin + member / user' }, profileDefaults: { Minimal: 'Admin + member / user' },
  },
  {
    id: 'permissions.customRoles', section: 'permissions', group: 'Role structure', label: 'Custom roles', description: 'Allow authorized administrators to create roles beyond the built-in defaults.', kind: 'choice', defaultValue: 'Admin configurable',
    options: [{ value: 'Off' }, { value: 'Admin configurable' }, { value: 'Admin configurable from permission template' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Admin configurable from permission template', 'Clinic / EMR': 'Admin configurable from permission template' }, profileDefaults: { Minimal: 'Off', Advanced: 'Admin configurable from permission template' }, advanced: true,
  },
  {
    id: 'permissions.multipleRoles', section: 'permissions', group: 'Role structure', label: 'Multiple roles per user', description: 'Allow one account to combine roles only when additive permissions are easier to reason about than role explosion.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': true, 'Clinic / EMR': true, 'SaaS / Client Portal': false }, profileDefaults: { Advanced: true }, advanced: true,
  },
  {
    id: 'permissions.roleHierarchy', section: 'permissions', group: 'Role structure', label: 'Role inheritance / hierarchy', description: 'Higher roles inherit lower permissions only when that relationship is stable and understandable.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Simple hierarchy' }, { value: 'Nested role inheritance' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Simple hierarchy', 'Internal / Operations': 'Simple hierarchy' }, profileDefaults: { Minimal: 'Off', Advanced: 'Simple hierarchy' }, advanced: true,
  },
  {
    id: 'permissions.scope', section: 'permissions', group: 'Permission granularity', label: 'Permission granularity', description: 'How deep the product must go beyond broad module-level access.', kind: 'choice', defaultValue: 'Module + action',
    options: [{ value: 'Module only' }, { value: 'Module + action' }, { value: 'Record / ownership aware' }, { value: 'Field-level + record-level' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Field-level + record-level', 'Clinic / EMR': 'Field-level + record-level', 'Internal / Operations': 'Record / ownership aware', 'SaaS / Client Portal': 'Record / ownership aware' }, profileDefaults: { Minimal: 'Module only', Advanced: 'Field-level + record-level' },
  },
  {
    id: 'permissions.crud', section: 'permissions', group: 'Permission granularity', label: 'CRUD action permissions', description: 'Separate view/create/edit/delete privileges instead of treating module access as all-or-nothing.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
  },
  {
    id: 'permissions.nonCrud', section: 'permissions', group: 'Permission granularity', label: 'Non-CRUD action permissions', description: 'Model domain actions such as approve, assign, publish, refund, export, print, or close separately where needed.', kind: 'choice', defaultValue: 'Important domain actions only',
    options: [{ value: 'Off' }, { value: 'Important domain actions only' }, { value: 'Fine-grained action catalog' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Fine-grained action catalog', 'Clinic / EMR': 'Fine-grained action catalog', 'Internal / Operations': 'Important domain actions only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Fine-grained action catalog' },
  },
  {
    id: 'permissions.ownership', section: 'permissions', group: 'Record access', label: 'Ownership-based access', description: 'Restrict users to records they own, created, are assigned to, or are explicitly related to.', kind: 'choice', defaultValue: 'When domain needs it',
    options: [{ value: 'Off' }, { value: 'When domain needs it' }, { value: 'Core authorization rule' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'SaaS / Client Portal': 'Core authorization rule', 'Government System': 'Core authorization rule', 'Clinic / EMR': 'Core authorization rule' }, profileDefaults: { Minimal: 'Off' },
  },
  {
    id: 'permissions.orgScope', section: 'permissions', group: 'Record access', label: 'Organization / department scope', description: 'Restrict access according to the current workspace, branch, department, or organization membership.', kind: 'choice', defaultValue: 'Follow organization membership',
    options: [{ value: 'Off' }, { value: 'Follow organization membership' }, { value: 'Role + organization scope' }, { value: 'Custom scope rules' }], dependsOn: { id: 'org.mode', equals: ['Teams inside one organization', 'Branches / departments', 'Multiple workspaces / organizations', 'Multi-tenant organizations'] },
    appDefaults: { 'Government System': 'Custom scope rules', 'Clinic / EMR': 'Role + organization scope', 'SaaS / Client Portal': 'Role + organization scope' }, profileDefaults: { Advanced: 'Custom scope rules' },
  },
  {
    id: 'permissions.fieldLevel', section: 'permissions', group: 'Record access', label: 'Field-level permissions', description: 'Hide or make specific sensitive fields read-only by role when entire-record restrictions are too coarse.', kind: 'choice', defaultValue: 'Off unless sensitive fields need it',
    options: [{ value: 'Off unless sensitive fields need it' }, { value: 'Read / edit field rules' }, { value: 'Detailed field policy' }], dependsOn: { id: 'roles.level', equals: 'Fine-grained permissions' },
    appDefaults: { 'Government System': 'Detailed field policy', 'Clinic / EMR': 'Detailed field policy' }, profileDefaults: { Advanced: 'Read / edit field rules' }, advanced: true,
  },
  {
    id: 'permissions.export', section: 'permissions', group: 'Sensitive actions', label: 'Export / bulk download permission', description: 'Treat exporting many records as a distinct sensitive capability instead of inheriting ordinary view access.', kind: 'choice', defaultValue: 'Separate permission',
    options: [{ value: 'Same as view access' }, { value: 'Separate permission' }, { value: 'Restricted roles + reason/audit' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Restricted roles + reason/audit', 'Clinic / EMR': 'Restricted roles + reason/audit' }, profileDefaults: { Minimal: 'Same as view access', Advanced: 'Restricted roles + reason/audit' },
  },
  {
    id: 'permissions.bulk', section: 'permissions', group: 'Sensitive actions', label: 'Bulk action permission', description: 'Separate mass updates/deletes/assignments from ordinary one-record actions.', kind: 'choice', defaultValue: 'Separate permission',
    options: [{ value: 'Same as single-record action' }, { value: 'Separate permission' }, { value: 'Restricted roles + confirmation' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Restricted roles + confirmation', 'Clinic / EMR': 'Restricted roles + confirmation' }, profileDefaults: { Minimal: 'Same as single-record action', Advanced: 'Restricted roles + confirmation' }, advanced: true,
  },
  {
    id: 'permissions.settings', section: 'permissions', group: 'Sensitive actions', label: 'System-settings permission', description: 'Keep application/integration/security configuration separate from routine administrative record access.', kind: 'choice', defaultValue: 'Admin-only separate permission',
    options: [{ value: 'Any admin' }, { value: 'Admin-only separate permission' }, { value: 'Superadmin / platform admin only' }], dependsOn: { id: 'admin.enabled', equals: true },
    appDefaults: { 'Government System': 'Superadmin / platform admin only', 'Clinic / EMR': 'Superadmin / platform admin only' }, profileDefaults: { Minimal: 'Any admin', Advanced: 'Superadmin / platform admin only' },
  },
  {
    id: 'permissions.roleAssignment', section: 'permissions', group: 'Privileged access', label: 'Who can assign roles', description: 'Prevent administrators from granting privileges equal to or above authority they should not control.', kind: 'choice', defaultValue: 'Privileged admins only',
    options: [{ value: 'Any admin' }, { value: 'Privileged admins only' }, { value: 'Cannot grant above own authority' }, { value: 'Approval required for privileged roles' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Approval required for privileged roles', 'Clinic / EMR': 'Cannot grant above own authority' }, profileDefaults: { Minimal: 'Any admin', Advanced: 'Cannot grant above own authority' },
  },
  {
    id: 'permissions.superadmin', section: 'permissions', group: 'Privileged access', label: 'Superadmin / break-glass role', description: 'Use an exceptional highest-privilege role only when genuinely necessary; keep assignment rare and visible.', kind: 'choice', defaultValue: 'Restricted superadmin',
    options: [{ value: 'Off' }, { value: 'Restricted superadmin' }, { value: 'Break-glass emergency access' }], dependsOn: { id: 'admin.enabled', equals: true },
    appDefaults: { 'Government System': 'Break-glass emergency access', 'Clinic / EMR': 'Restricted superadmin', 'SaaS / Client Portal': 'Restricted superadmin' }, profileDefaults: { Minimal: 'Off', Advanced: 'Break-glass emergency access' }, advanced: true,
  },
  {
    id: 'permissions.temporary', section: 'permissions', group: 'Privileged access', label: 'Temporary elevated access', description: 'Allow time-bounded additional privileges for support, duty coverage, or special tasks instead of permanent role inflation.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Time-bounded access' }, { value: 'Time-bounded + approval' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Time-bounded + approval' }, profileDefaults: { Advanced: 'Time-bounded + approval' }, advanced: true,
  },
  {
    id: 'permissions.delegatedAdmin', section: 'permissions', group: 'Privileged access', label: 'Delegated administration', description: 'Let scoped managers administer only their branch/team/organization instead of granting global admin rights.', kind: 'choice', defaultValue: 'Scoped admin where needed',
    options: [{ value: 'Off' }, { value: 'Scoped admin where needed' }, { value: 'Detailed delegated-admin policy' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Detailed delegated-admin policy', 'Clinic / EMR': 'Scoped admin where needed', 'SaaS / Client Portal': 'Scoped admin where needed' }, profileDefaults: { Minimal: 'Off', Advanced: 'Detailed delegated-admin policy' }, advanced: true,
  },
  {
    id: 'permissions.separation', section: 'permissions', group: 'Privileged access', label: 'Separation of duties', description: 'Prevent one person from both initiating and authorizing selected high-risk operations.', kind: 'choice', defaultValue: 'Only critical workflows',
    options: [{ value: 'Off' }, { value: 'Only critical workflows' }, { value: 'Broad maker-checker policy' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Broad maker-checker policy', 'Clinic / EMR': 'Only critical workflows' }, profileDefaults: { Minimal: 'Off', Advanced: 'Broad maker-checker policy' }, advanced: true,
  },
  {
    id: 'permissions.requestAccess', section: 'permissions', group: 'Access requests', label: 'Request additional access', description: 'Let users request a role/scope they need instead of relying on informal chat messages to administrators.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Simple request to admin' }, { value: 'Approval workflow + expiry' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Approval workflow + expiry', 'Internal / Operations': 'Simple request to admin' }, profileDefaults: { Advanced: 'Approval workflow + expiry' }, advanced: true,
  },
  {
    id: 'permissions.review', section: 'permissions', group: 'Access governance', label: 'Periodic access review', description: 'Prompt authorized owners to review stale or privileged access where account populations and risk justify it.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Privileged roles only' }, { value: 'All managed access' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'All managed access', 'Clinic / EMR': 'Privileged roles only' }, profileDefaults: { Advanced: 'Privileged roles only' }, advanced: true,
  },
  {
    id: 'permissions.visibility', section: 'permissions', group: 'Access governance', label: 'Permission visibility to users', description: 'Help users understand why an action is unavailable without exposing sensitive policy internals.', kind: 'choice', defaultValue: 'Explain missing access + request path',
    options: [{ value: 'Hide unavailable actions' }, { value: 'Show disabled + explain' }, { value: 'Explain missing access + request path' }], dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': 'Explain missing access + request path', 'Internal / Operations': 'Explain missing access + request path' }, profileDefaults: { Minimal: 'Hide unavailable actions' },
  },
  {
    id: 'permissions.auditChanges', section: 'permissions', group: 'Access governance', label: 'Audit role / permission changes', description: 'Record who changed access, what changed, and when for meaningful authorization changes.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'roles.level', equals: ['Role based', 'Fine-grained permissions'] },
    appDefaults: { 'Government System': true, 'Clinic / EMR': true }, advanced: true,
  },
  {
    id: 'workflow.status', section: 'operations', label: 'Status workflow', description: 'Records move through explicit named states with valid transitions.', kind: 'boolean', defaultValue: true,
    appDefaults: { 'Portfolio / Marketing': false, 'Directory / Marketplace': false }, profileDefaults: { Minimal: false },
  },
  {
    id: 'workflow.approval', section: 'operations', label: 'Approval workflow', description: 'Require review/approve/reject behavior for controlled actions or records.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Single level' }, { value: 'Multi-level' }], dependsOn: { id: 'workflow.status', equals: true },
    appDefaults: { 'Government System': 'Multi-level', 'Clinic / EMR': 'Single level', 'Internal / Operations': 'Single level' }, profileDefaults: { Minimal: 'Off', Advanced: 'Single level' }, advanced: true,
  },
  {
    id: 'notifications.level', section: 'operations', label: 'Notifications', description: 'How much event-driven notification behavior the product should provide.', kind: 'choice', defaultValue: 'Important events',
    options: [{ value: 'Off' }, { value: 'Important events' }, { value: 'User-configurable' }, { value: 'Multi-channel' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Booking / Scheduling': 'Important events', 'SaaS / Client Portal': 'User-configurable' }, profileDefaults: { Minimal: 'Off', Advanced: 'User-configurable' },
  },
  {
    id: 'reports.level', section: 'operations', label: 'Reports', description: 'Operational reporting depth expected in the first implementation.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Off' }, { value: 'Basic' }, { value: 'Standard' }, { value: 'Advanced + export' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Advanced + export', 'Clinic / EMR': 'Advanced + export', 'Inventory / POS': 'Advanced + export' }, profileDefaults: { Minimal: 'Off', Advanced: 'Advanced + export' },
  },
  {
    id: 'admin.impersonation', section: 'operations', label: 'Admin impersonation', description: 'Allow authorized support/admin users to enter a user context for troubleshooting.', kind: 'boolean', defaultValue: false, dependsOn: { id: 'admin.enabled', equals: true }, profileDefaults: { Advanced: true }, advanced: true,
    caution: 'Impersonation needs explicit authorization and audit logging.',
  },

  // Content rules
  {
    id: 'content.aiSlop', section: 'content', group: 'AI-slop guardrails', label: 'AI-slop tolerance', description: 'How aggressively generated copy should avoid generic AI/SaaS phrasing and filler.', kind: 'choice', defaultValue: 'Low',
    options: [{ value: 'None' }, { value: 'Low' }, { value: 'Moderate' }, { value: 'High' }],
    appDefaults: { 'Portfolio / Marketing': 'None', 'Government System': 'None', 'Clinic / EMR': 'None' }, profileDefaults: { Minimal: 'None' },
  },
  {
    id: 'content.tone', section: 'content', group: 'Voice', label: 'Default writing tone', description: 'Default product copy voice unless a page requires a different register.', kind: 'choice', defaultValue: 'Human / practical',
    options: [{ value: 'Human / practical' }, { value: 'Professional' }, { value: 'Formal' }, { value: 'Conversational' }, { value: 'Technical' }, { value: 'Playful' }, { value: 'Editorial' }],
    appDefaults: { 'Government System': 'Formal', 'Clinic / EMR': 'Professional', 'Portfolio / Marketing': 'Editorial', 'Tournament / Event': 'Playful' },
  },
  {
    id: 'content.density', section: 'content', group: 'Voice', label: 'Copy density', description: 'How concise labels, helper copy, and explanatory content should be.', kind: 'choice', defaultValue: 'Concise', options: [{ value: 'Very concise' }, { value: 'Concise' }, { value: 'Moderate' }, { value: 'Detailed' }],
    appDefaults: { 'Government System': 'Moderate', 'Clinic / EMR': 'Moderate' }, profileDefaults: { Minimal: 'Very concise', Advanced: 'Moderate' },
  },
  {
    id: 'content.helperText', section: 'content', group: 'Interface language', label: 'Contextual helper text', description: 'Explain unfamiliar fields/actions where confusion is likely instead of documenting everything.', kind: 'choice', defaultValue: 'Only where useful',
    options: [{ value: 'Minimal' }, { value: 'Only where useful' }, { value: 'Guided' }], appDefaults: { 'Government System': 'Guided', 'Clinic / EMR': 'Guided' }, profileDefaults: { Minimal: 'Minimal' },
  },
  {
    id: 'content.onboarding', section: 'support', group: 'First use', label: 'Product onboarding', description: 'First-use guidance for new users.', kind: 'choice', defaultValue: 'Lightweight',
    options: [{ value: 'None' }, { value: 'Lightweight' }, { value: 'Checklist' }, { value: 'Guided setup' }],
    appDefaults: { 'Portfolio / Marketing': 'None', 'Government System': 'Guided setup', 'Clinic / EMR': 'Guided setup', 'SaaS / Client Portal': 'Checklist' }, profileDefaults: { Minimal: 'None', Advanced: 'Checklist' },
  },

  {
    id: 'content.labels', section: 'content', group: 'Interface language', label: 'Label style', description: 'Prefer plain domain language over clever labels, abbreviations, or internal technical names.', kind: 'choice', defaultValue: 'Plain + domain-specific',
    options: [{ value: 'Ultra concise' }, { value: 'Plain + domain-specific' }, { value: 'Detailed / explanatory' }],
    appDefaults: { 'Government System': 'Detailed / explanatory', 'Clinic / EMR': 'Plain + domain-specific' },
  },
  {
    id: 'content.cta', section: 'content', group: 'Interface language', label: 'Action wording', description: 'Use explicit verbs that describe the actual outcome instead of generic “Continue” when context is unclear.', kind: 'choice', defaultValue: 'Specific action verbs',
    options: [{ value: 'Minimal labels' }, { value: 'Specific action verbs' }, { value: 'Action + outcome detail' }],
  },
  {
    id: 'content.errors', section: 'content', group: 'Feedback language', label: 'Error-message tone', description: 'Explain the problem and recovery path without blame, jargon, or raw developer errors.', kind: 'choice', defaultValue: 'Plain + recovery-oriented',
    options: [{ value: 'Very concise' }, { value: 'Plain + recovery-oriented' }, { value: 'Detailed + support context' }],
    appDefaults: { 'Government System': 'Detailed + support context', 'Clinic / EMR': 'Detailed + support context' },
  },
  {
    id: 'content.success', section: 'content', group: 'Feedback language', label: 'Success-message detail', description: 'Confirm what changed without celebratory noise for routine actions.', kind: 'choice', defaultValue: 'Short confirmation',
    options: [{ value: 'Silent when obvious' }, { value: 'Short confirmation' }, { value: 'Confirmation + next step' }],
  },
  {
    id: 'content.placeholders', section: 'content', group: 'Interface language', label: 'Placeholder policy', description: 'Use placeholders as examples/hints, never as the only accessible label for a field.', kind: 'choice', defaultValue: 'Examples only where useful',
    options: [{ value: 'Minimal use' }, { value: 'Examples only where useful' }, { value: 'Frequent examples + hints' }],
  },
  {
    id: 'content.emoji', section: 'content', group: 'AI-slop guardrails', label: 'Emoji usage', description: 'How much emoji should appear in permanent product copy and system feedback.', kind: 'choice', defaultValue: 'None / exceptional only',
    options: [{ value: 'None' }, { value: 'None / exceptional only' }, { value: 'Light' }, { value: 'Expressive' }],
    appDefaults: { 'Tournament / Event': 'Light' }, profileDefaults: { Minimal: 'None' },
  },
  {
    id: 'content.hype', section: 'content', group: 'AI-slop guardrails', label: 'Marketing hype tolerance', description: 'Limit generic “revolutionary / seamless / elevate / unlock” phrasing unless the claim is specific and defensible.', kind: 'choice', defaultValue: 'Low',
    options: [{ value: 'None' }, { value: 'Low' }, { value: 'Moderate' }, { value: 'High' }],
    appDefaults: { 'Portfolio / Marketing': 'Low', 'Government System': 'None', 'Clinic / EMR': 'None' },
  },
  {
    id: 'content.fakeProof', section: 'content', group: 'AI-slop guardrails', label: 'Synthetic proof', description: 'Never invent testimonials, usage counts, client logos, ratings, awards, or performance statistics.', kind: 'choice', defaultValue: 'Never fabricate',
    options: [{ value: 'Never fabricate' }, { value: 'Placeholders clearly marked in dev only' }],
    caution: 'Synthetic social proof should never ship as if it were real.',
  },
  {
    id: 'content.aiDisclosure', section: 'content', group: 'AI-slop guardrails', label: 'AI-generated output disclosure', description: 'When the product itself generates user-facing AI output, define whether and how it is labeled.', kind: 'choice', defaultValue: 'Context dependent',
    options: [{ value: 'Not applicable / off' }, { value: 'Context dependent' }, { value: 'Always label AI output' }], profileDefaults: { Minimal: 'Not applicable / off', Advanced: 'Always label AI output' }, advanced: true,
  },

  // Onboarding & help additions
  {
    id: 'onboarding.skippable', section: 'support', group: 'First use', label: 'Onboarding can be skipped', description: 'Do not trap experienced users in a tour when the product is already understandable.', kind: 'boolean', defaultValue: true, dependsOn: { id: 'content.onboarding', equals: ['Lightweight', 'Checklist', 'Guided setup'] },
  },
  {
    id: 'onboarding.checklist', section: 'support', group: 'First use', label: 'Setup checklist', description: 'Persistent checklist for products that truly require several setup steps before value appears.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Temporary first-run checklist' }, { value: 'Persistent until complete' }], dependsOn: { id: 'content.onboarding', equals: ['Checklist', 'Guided setup'] },
    appDefaults: { 'SaaS / Client Portal': 'Temporary first-run checklist' },
  },
  {
    id: 'onboarding.tour', section: 'support', group: 'First use', label: 'Product tour', description: 'Use guided spotlight tours only for unfamiliar flows; prefer contextual guidance over explaining obvious controls.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Key unfamiliar areas only' }, { value: 'Full guided tour' }], dependsOn: { id: 'content.onboarding', equals: ['Lightweight', 'Checklist', 'Guided setup'] },
    appDefaults: { 'SaaS / Client Portal': 'Key unfamiliar areas only' }, profileDefaults: { Minimal: 'Off' },
  },
  {
    id: 'onboarding.demoData', section: 'support', group: 'First use', label: 'Demo / sample data', description: 'Provide sample content only when it helps users understand an empty product without contaminating real operational data.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Optional sample data' }, { value: 'Disposable demo workspace' }],
    appDefaults: { 'SaaS / Client Portal': 'Optional sample data' }, profileDefaults: { Advanced: 'Optional sample data' }, advanced: true,
  },
  {
    id: 'help.contextual', section: 'support', group: 'In-product help', label: 'Contextual help', description: 'Place short help near unfamiliar fields/actions rather than forcing users into documentation for routine questions.', kind: 'choice', defaultValue: 'Only where confusion is likely',
    options: [{ value: 'Off' }, { value: 'Only where confusion is likely' }, { value: 'Broad contextual help' }],
  },
  {
    id: 'help.center', section: 'support', group: 'Self service', label: 'Help center / documentation', description: 'Dedicated self-service guidance surface for products with enough workflow depth to justify it.', kind: 'choice', defaultValue: 'Lightweight help page',
    options: [{ value: 'Off' }, { value: 'Lightweight help page' }, { value: 'Searchable help center' }, { value: 'Full documentation' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Searchable help center', 'Clinic / EMR': 'Searchable help center', 'SaaS / Client Portal': 'Full documentation' }, profileDefaults: { Minimal: 'Off', Advanced: 'Searchable help center' },
  },
  {
    id: 'help.contact', section: 'support', group: 'Support', label: 'Contact support path', description: 'Make the appropriate support/contact path discoverable from error/help contexts when self-service is not enough.', kind: 'choice', defaultValue: 'Contact form / email',
    options: [{ value: 'Off' }, { value: 'Contact form / email' }, { value: 'Ticket workflow' }, { value: 'Live support entry' }],
    appDefaults: { 'Portfolio / Marketing': 'Contact form / email', 'Government System': 'Ticket workflow', 'SaaS / Client Portal': 'Ticket workflow' },
  },
  {
    id: 'help.feedback', section: 'support', group: 'Support', label: 'Product feedback', description: 'Give users a low-friction way to send feedback without mixing it into urgent support.', kind: 'choice', defaultValue: 'Simple feedback form',
    options: [{ value: 'Off' }, { value: 'Simple feedback form' }, { value: 'Feedback + feature request categories' }],
    appDefaults: { 'Government System': 'Simple feedback form', 'Clinic / EMR': 'Simple feedback form' }, profileDefaults: { Minimal: 'Off' }, advanced: true,
  },
  {
    id: 'help.bugReport', section: 'support', group: 'Support', label: 'Bug-report flow', description: 'Allow users/staff to report a problem with enough page/context details to reproduce it.', kind: 'choice', defaultValue: 'Support path only',
    options: [{ value: 'Off' }, { value: 'Support path only' }, { value: 'Structured bug report' }, { value: 'Structured + diagnostics' }],
    appDefaults: { 'Government System': 'Structured bug report', 'Clinic / EMR': 'Structured bug report', 'Internal / Operations': 'Structured + diagnostics' }, profileDefaults: { Minimal: 'Off', Advanced: 'Structured + diagnostics' }, advanced: true,
  },
  {
    id: 'help.diagnostics', section: 'support', group: 'Support', label: 'Copy diagnostics / debug context', description: 'Let users copy safe technical context such as app version/request ID without exposing secrets or sensitive data.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Internal / Operations': true, 'Government System': true }, profileDefaults: { Advanced: true }, advanced: true,
  },


  // Security & quality
  {
    id: 'quality.security', section: 'quality', label: 'Security level', description: 'Overall baseline for authentication, authorization, validation, headers, rate limits, and sensitive actions.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Basic' }, { value: 'Standard' }, { value: 'Hardened' }, { value: 'High security' }],
    appDefaults: { 'Government System': 'Hardened', 'Clinic / EMR': 'High security', 'Internal / Operations': 'Hardened' }, profileDefaults: { Minimal: 'Basic', Standard: 'Standard', Advanced: 'Hardened' },
  },
  {
    id: 'quality.audit', section: 'quality', label: 'Audit trail', description: 'Track meaningful user/admin/security changes with actor and timestamp context.', kind: 'choice', defaultValue: 'Important actions',
    options: [{ value: 'Off' }, { value: 'Important actions' }, { value: 'Detailed' }, { value: 'Immutable / compliance oriented' }],
    appDefaults: { 'Portfolio / Marketing': 'Off', 'Government System': 'Immutable / compliance oriented', 'Clinic / EMR': 'Immutable / compliance oriented', 'Internal / Operations': 'Detailed' }, profileDefaults: { Minimal: 'Off', Advanced: 'Detailed' },
  },
  {
    id: 'quality.accessibility', section: 'quality', label: 'Accessibility target', description: 'Accessibility baseline that implementation and testing should target.', kind: 'choice', defaultValue: 'WCAG AA',
    options: [{ value: 'Basic' }, { value: 'WCAG A' }, { value: 'WCAG AA' }, { value: 'WCAG AAA target' }],
    appDefaults: { 'Government System': 'WCAG AA', 'Clinic / EMR': 'WCAG AA' }, profileDefaults: { Minimal: 'Basic', Standard: 'WCAG AA', Advanced: 'WCAG AA' },
  },
  {
    id: 'quality.rateLimit', section: 'quality', label: 'Rate limiting / abuse protection', description: 'Protect public auth, forms, APIs, and high-cost actions from repeated abuse.', kind: 'choice', defaultValue: 'Sensitive endpoints',
    options: [{ value: 'Off' }, { value: 'Sensitive endpoints' }, { value: 'Broad' }], appDefaults: { 'Government System': 'Broad', 'Clinic / EMR': 'Broad' }, profileDefaults: { Minimal: 'Off', Advanced: 'Broad' }, advanced: true,
  },
  {
    id: 'quality.logging', section: 'quality', label: 'Operational logging', description: 'Application, error, integration, and security logging depth.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Minimal' }, { value: 'Standard' }, { value: 'Structured + searchable' }], appDefaults: { 'Government System': 'Structured + searchable', 'Clinic / EMR': 'Structured + searchable' }, profileDefaults: { Minimal: 'Minimal', Advanced: 'Structured + searchable' }, advanced: true,
  },
  {
    id: 'quality.backups', section: 'quality', label: 'Backup expectation', description: 'Database/file backup requirement for production data.', kind: 'choice', defaultValue: 'Daily',
    options: [{ value: 'None / disposable data' }, { value: 'Daily' }, { value: 'Frequent + retention policy' }, { value: 'Point-in-time recovery' }],
    appDefaults: { 'Portfolio / Marketing': 'None / disposable data', 'Government System': 'Frequent + retention policy', 'Clinic / EMR': 'Point-in-time recovery', 'Inventory / POS': 'Frequent + retention policy' }, profileDefaults: { Minimal: 'None / disposable data', Advanced: 'Frequent + retention policy' },
  },
  {
    id: 'quality.testing', section: 'quality', label: 'Testing depth', description: 'Minimum validation expected before considering a change complete.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Smoke only' }, { value: 'Standard' }, { value: 'Thorough' }, { value: 'Critical-path heavy' }],
    appDefaults: { 'Government System': 'Thorough', 'Clinic / EMR': 'Critical-path heavy' }, profileDefaults: { Minimal: 'Smoke only', Advanced: 'Thorough' },
  },
  {
    id: 'quality.privacy', section: 'quality', label: 'Privacy posture', description: 'How deliberately the app should minimize, retain, expose, and export user data.', kind: 'choice', defaultValue: 'Standard',
    options: [{ value: 'Basic' }, { value: 'Standard' }, { value: 'Strict' }], appDefaults: { 'Government System': 'Strict', 'Clinic / EMR': 'Strict' }, profileDefaults: { Minimal: 'Basic', Advanced: 'Strict' }, advanced: true,
  },

  // Platform & delivery
  {
    id: 'platform.api', section: 'delivery', label: 'API surface', description: 'External or internal API contract expected beyond page/server actions.', kind: 'choice', defaultValue: 'Internal only',
    options: [{ value: 'None' }, { value: 'Internal only' }, { value: 'Partner API' }, { value: 'Public API' }],
    appDefaults: { 'Portfolio / Marketing': 'None', 'SaaS / Client Portal': 'Internal only' }, profileDefaults: { Minimal: 'None', Advanced: 'Partner API' },
  },
  {
    id: 'platform.webhooks', section: 'delivery', label: 'Webhooks', description: 'Event delivery for integrations, payments, automation, or external consumers.', kind: 'choice', defaultValue: 'Off',
    options: [{ value: 'Off' }, { value: 'Incoming' }, { value: 'Outgoing' }, { value: 'Incoming + outgoing' }],
    appDefaults: { 'Booking / Scheduling': 'Incoming', 'E-commerce': 'Incoming' }, profileDefaults: { Minimal: 'Off', Advanced: 'Incoming + outgoing' }, advanced: true,
  },
  {
    id: 'platform.automation', section: 'delivery', label: 'Automation readiness', description: 'Design repetitive operations so they can be triggered automatically or through n8n/webhooks later.', kind: 'choice', defaultValue: 'Automation-ready',
    options: [{ value: 'Manual only' }, { value: 'Automation-ready' }, { value: 'Built-in rules' }, { value: 'External automation first' }],
    appDefaults: { 'Government System': 'Automation-ready', 'Internal / Operations': 'Automation-ready', 'Booking / Scheduling': 'Manual only', 'Portfolio / Marketing': 'Manual only', 'E-commerce': 'Manual only', 'Directory / Marketplace': 'Manual only', 'Tournament / Event': 'Manual only', 'SaaS / Client Portal': 'Manual only' }, profileDefaults: { Minimal: 'Manual only', Advanced: 'Built-in rules' },
  },
  {
    id: 'platform.analytics', section: 'delivery', label: 'Analytics', description: 'Product/traffic measurement expected in the first release.', kind: 'choice', defaultValue: 'Basic product analytics',
    options: [{ value: 'Off' }, { value: 'Basic product analytics' }, { value: 'Detailed events' }, { value: 'Privacy-first traffic only' }],
    appDefaults: { 'Government System': 'Off', 'Clinic / EMR': 'Off', 'Portfolio / Marketing': 'Privacy-first traffic only' }, profileDefaults: { Minimal: 'Off', Advanced: 'Detailed events' },
  },
  {
    id: 'platform.pwa', section: 'delivery', label: 'Installable PWA', description: 'Allow installation-like behavior through a web app manifest and service-worker strategy.', kind: 'boolean', defaultValue: false,
    appDefaults: { 'Inventory / POS': true, 'Booking / Scheduling': false }, profileDefaults: { Minimal: false }, advanced: true,
  },
  {
    id: 'platform.offline', section: 'delivery', label: 'Offline behavior', description: 'Expected behavior when the network is unavailable or unstable.', kind: 'choice', defaultValue: 'Friendly offline state',
    options: [{ value: 'No special support' }, { value: 'Friendly offline state' }, { value: 'Read-only cache' }, { value: 'Offline write + sync' }],
    appDefaults: { 'Portfolio / Marketing': 'No special support', 'Inventory / POS': 'Read-only cache' }, profileDefaults: { Minimal: 'No special support', Advanced: 'Read-only cache' }, advanced: true,
  },
  {
    id: 'platform.deployment', section: 'delivery', label: 'Deployment target', description: 'Primary hosting/deployment shape the implementation should assume.', kind: 'choice', defaultValue: 'Cloud / serverless',
    options: [{ value: 'Static hosting' }, { value: 'Cloud / serverless' }, { value: 'VPS' }, { value: 'LAN / local server' }, { value: 'Containerized' }, { value: 'Decide later' }],
    appDefaults: { 'Portfolio / Marketing': 'Static hosting', 'Clinic / EMR': 'LAN / local server', 'Government System': 'VPS', 'Inventory / POS': 'VPS' },
  },
]

const minimalPreservesContextIds = new Set([
  'app.accessShape',
  'data.relationships',
  'data.uniqueRules',
  'data.softDelete',
  'data.versionHistory',
  'data.optimisticLock',
  'data.transactions',
  'data.idempotency',
  'data.retention',
  'records.delete',
  'login.mfa',
  'roles.level',
  'permissions.defaultPolicy',
  'permissions.enforcement',
  'quality.security',
  'quality.audit',
  'quality.accessibility',
  'quality.rateLimit',
  'quality.backups',
  'quality.logging',
  'quality.testing',
  'quality.privacy',
  'security.csp',
  'security.csrf',
  'security.uploadValidation',
  'security.malwareScan',
  'security.dependencyScan',
  'security.staticAnalysis',
  'privacy.inventory',
  'privacy.retention',
  'a11y.target',
  'a11y.screenReader',
  'recovery.restoreTest',
  'eng.environments',
  'test.strategy',
  'test.security',
])

const scaleDefaultOverrides: Record<ResolvedOperationalScale, Record<string, ConfigValue>> = {
  Lean: {
    'login.social': 'Off',
    'login.mfa': 'Required for admins',
    'session.management': 'Off',
    'session.logoutAll': false,
    'profile.complexity': 'Minimal',
    'profile.avatar': 'Off / initials only',
    'profile.customFields': 'Off',
    'profile.lastLogin': 'Off',
    'account.statuses': 'Active + disabled',
    'account.exportSelf': 'Available where applicable',
    'permissions.customRoles': 'Off',
    'permissions.multipleRoles': false,
    'permissions.export': 'Same as view access',
    'permissions.settings': 'Any admin',
    'permissions.roleAssignment': 'Any admin',
    'permissions.superadmin': 'Off',
    'permissions.delegatedAdmin': 'Off',
    'permissions.separation': 'Off',
    'permissions.visibility': 'Show disabled + explain',
    'privacy.dataExport': 'Admin-assisted / product appropriate',
    'obs.tracing': 'Off',
    'obs.synthetic': 'Off unless high criticality',
    'obs.uptime': 'Primary entry + health endpoint',
    'obs.integrationMonitoring': 'Errors + health status',
    'obs.errorTracking': 'Central error tracker',
    'perf.webVitals': 'Monitor production samples',
    'perf.bundle': 'Review large chunks/dependencies',
    'perf.availability': 'Production business-hours critical',
    'recovery.frequency': 'Daily + provider snapshots',
    'recovery.offsite': 'Separate backup location/account',
    'recovery.rpo': 'Up to 24 hours',
    'recovery.rto': 'Within one business day',
    'eng.preview': 'Off',
    'eng.deployStrategy': 'Rolling / platform atomic deploy',
    'eng.zeroDowntime': 'Best effort zero-downtime',
    'eng.rollback': 'One-step previous-release rollback',
    'eng.deployApproval': 'Automatic after checks',
    'eng.smokeAfterDeploy': 'Automated health + critical smoke',
    'eng.featureFlags': 'Off',
    'eng.maintenanceMode': 'Off',
    'test.responsive': 'Representative mobile workflows',
    'test.performance': 'Critical page/API checks',
    'test.load': 'Critical concurrency flows only',
    'test.payment': 'Provider sandbox + webhook scenarios',
  },
  Standard: {
    'login.social': 'Google only',
    'login.mfa': 'Required for admins',
    'session.management': 'View sessions',
    'permissions.customRoles': 'Off',
    'obs.tracing': 'Critical request traces',
    'obs.synthetic': 'Off unless high criticality',
    'obs.uptime': 'Primary entry + health endpoint',
    'obs.integrationMonitoring': 'Errors + health status',
    'perf.webVitals': 'Monitor production samples',
    'perf.bundle': 'Review large chunks/dependencies',
    'perf.availability': 'Production business-hours critical',
    'recovery.frequency': 'Daily + provider snapshots',
    'recovery.rpo': 'Up to 24 hours',
    'recovery.rto': 'Within one business day',
    'eng.deployStrategy': 'Rolling / platform atomic deploy',
    'eng.zeroDowntime': 'Best effort zero-downtime',
    'eng.rollback': 'One-step previous-release rollback',
    'eng.smokeAfterDeploy': 'Automated health + critical smoke',
    'test.responsive': 'Representative mobile workflows',
    'test.performance': 'Critical page/API checks',
    'test.load': 'Critical concurrency flows only',
    'test.payment': 'Provider sandbox + webhook scenarios',
  },
  'High scale': {
    'login.mfa': 'Required for admins',
    'session.management': 'View + revoke sessions',
    'obs.tracing': 'Critical request traces',
    'obs.synthetic': 'One critical synthetic journey',
    'obs.uptime': 'Multiple critical workflow probes',
    'obs.integrationMonitoring': 'Errors + health + SLA/backlog alerts',
    'perf.webVitals': 'Monitor + alert/regression budget',
    'perf.bundle': 'CI bundle budget',
    'perf.availability': 'High availability / 24x7 critical',
    'recovery.frequency': 'Frequent / point-in-time recovery',
    'recovery.rpo': 'Up to 1 hour',
    'recovery.rto': 'Within a few hours',
    'eng.deployStrategy': 'Blue-green / canary where justified',
    'eng.zeroDowntime': 'Required for routine deploys',
    'eng.rollback': 'Automated rollback trigger for severe health regression',
    'eng.deployApproval': 'Approval required for high-risk releases only',
    'eng.smokeAfterDeploy': 'Automated smoke + rollback gate',
    'eng.featureFlags': 'Only for risky/staged changes',
    'test.load': 'Capacity/load scenarios against target',
    'test.payment': 'Full failure/refund/reconciliation matrix',
  },
  'Mission critical': {
    'login.mfa': 'Required for admins',
    'session.management': 'View + revoke sessions',
    'obs.tracing': 'Broader distributed tracing',
    'obs.synthetic': 'Multiple role/workflow journeys',
    'obs.uptime': 'Multiple critical workflow probes',
    'obs.integrationMonitoring': 'Errors + health + SLA/backlog alerts',
    'perf.webVitals': 'Monitor + alert/regression budget',
    'perf.bundle': 'CI bundle budget',
    'perf.availability': 'High availability / 24x7 critical',
    'recovery.frequency': 'Frequent / point-in-time recovery',
    'recovery.rpo': 'Up to 1 hour',
    'recovery.rto': 'Within a few hours',
    'eng.deployStrategy': 'Blue-green / canary where justified',
    'eng.zeroDowntime': 'Required for routine deploys',
    'eng.rollback': 'Automated rollback trigger for severe health regression',
    'eng.deployApproval': 'Manual promote for production',
    'eng.smokeAfterDeploy': 'Automated smoke + rollback gate',
    'eng.featureFlags': 'Only for risky/staged changes',
    'test.load': 'Capacity/load scenarios against target',
    'test.payment': 'Full failure/refund/reconciliation matrix',
  },
}

export function recommendedValue(setting: ConfigSetting, appType: AppType, profile: ConfigProfile, operationalScale: OperationalScale = 'Auto'): ConfigValue {
  const hasContextualDefault = setting.appDefaults?.[appType] !== undefined
  const contextual = setting.appDefaults?.[appType] ?? setting.defaultValue
  const scale = operationalScale === 'Auto' ? inferredOperationalScale(appType) : operationalScale
  const scaled = scaleDefaultOverrides[scale]?.[setting.id] ?? contextual
  if (profile === 'Recommended') return scaled
  // Minimal removes optional machinery; it should not silently weaken an app-type-specific safety/integrity baseline.
  if (profile === 'Minimal' && hasContextualDefault && minimalPreservesContextIds.has(setting.id)) return contextual
  return setting.profileDefaults?.[profile] ?? scaled
}

export type ScopeResolution = {
  id: string
  choice: 'Auto' | ScopeChoice
  active: boolean
  source: 'Explicit' | 'Required' | 'Inferred' | 'Contextual' | 'Inactive'
  reason: string
  requiredBy: string[]
  effectiveValue: ConfigValue
}

const scopeSettingIds = new Set([
  'login.enabled', 'registration.mode', 'login.mfa', 'access.guest', 'profile.enabled', 'roles.level', 'org.mode',
  'pages.about', 'pages.features', 'pages.pricing', 'pages.contact', 'pages.faq', 'pages.blog', 'pages.changelog', 'pages.status',
  'pages.legal', 'pages.team', 'pages.careers', 'pages.docs', 'pages.roadmap', 'pages.partners', 'pages.security', 'pages.accessibilityStatement',
  'pages.profile', 'pages.accountSettings', 'pages.notifications', 'pages.search',
  'landing.enabled', 'dashboard.enabled',
  'records.crud', 'forms.enabled', 'search.level', 'workflow.enabled', 'approval.enabled', 'tasks.enabled',
  'attachments.enabled', 'comments.enabled', 'imports.enabled',
  'pack.booking', 'pack.payments', 'pack.subscriptions', 'pack.commerce', 'pack.inventory', 'pack.reporting',
  'pack.directory', 'pack.tournament', 'pack.government', 'pack.clinic', 'pack.portfolio',
  'admin.enabled', 'notifications.level',
  'integration.email', 'integration.sms', 'integration.push', 'integration.calendar', 'integration.maps', 'integration.storage',
  'integration.collaboration', 'integration.crm', 'integration.accounting', 'integration.externalAutomation', 'ai.enabled',
  'seo.enabled', 'platform.api', 'platform.webhooks', 'platform.automation', 'platform.analytics', 'platform.pwa', 'quality.backups', 'eng.dbEngine',
  'content.onboarding', 'help.center', 'help.contact', 'help.feedback', 'help.bugReport',
])

/**
 * Compatibility anchors kept for old backups, but hidden from normal UI/spec output
 * because a newer setting is the source of truth.
 */
const redundantSettingAliases: Record<string, string> = {
  'files.enabled': 'attachments.enabled',
  'workflow.status': 'workflow.enabled',
  'workflow.approval': 'approval.enabled',
  'records.search': 'search.level',
  'reports.level': 'pack.reporting',
}

const redundantSettingIds = new Set([
  ...Object.keys(redundantSettingAliases),
  'records.delete',
  'records.filters',
  'records.pagination',
  'forms.structure',
  'forms.validation',
  'files.policy',
  'records.importExport',
])

const qualitySections = new Set(['quality', 'security', 'privacy', 'accessibility', 'performance', 'observability', 'recovery', 'engineering', 'testing'])

function isOffLike(value: ConfigValue): boolean {
  if (value === false) return true
  if (value === true) return false
  const text = String(value).trim().toLowerCase()
  return text === 'off'
    || text === 'none'
    || text === 'disabled'
    || text === 'no'
    || text.startsWith('off /')
    || text.startsWith('none /')
    || text.startsWith('no ')
    || text.includes('none / disposable')
}

const scopeOffValues: Partial<Record<string, ConfigValue>> = {
  'eng.dbEngine': 'Static/no persistent DB',
  'platform.automation': 'Manual only',
  'roles.level': 'Simple admin/user',
}

function scopeValueIsActive(setting: ConfigSetting, value: ConfigValue): boolean {
  const explicitOff = scopeOffValues[setting.id]
  return explicitOff !== undefined ? value !== explicitOff : !isOffLike(value)
}

function settingOnValue(setting: ConfigSetting, appType: AppType, profile: ConfigProfile, operationalScale: OperationalScale = 'Auto'): ConfigValue {
  if (setting.kind === 'boolean') return true
  const recommended = recommendedValue(setting, appType, profile, operationalScale)
  if (scopeValueIsActive(setting, recommended)) return recommended
  const explicitOff = scopeOffValues[setting.id]
  const candidate = setting.options?.find((option) => option.value !== explicitOff && !isOffLike(option.value))
  return candidate?.value ?? recommended
}

function settingOffValue(setting: ConfigSetting): ConfigValue {
  if (setting.kind === 'boolean') return false
  const explicitOff = scopeOffValues[setting.id]
  if (explicitOff !== undefined) return explicitOff
  const candidate = setting.options?.find((option) => isOffLike(option.value))
  return candidate?.value ?? setting.defaultValue
}

function activeScopeValue(setting: ConfigSetting, config: ProjectConfig): ConfigValue {
  if (setting.kind !== 'boolean' && config.overrides.includes(setting.id)) {
    const raw = config.values[setting.id]
    if (scopeValueIsActive(setting, raw)) return raw
  }
  return settingOnValue(setting, config.appType, config.profile, config.operationalScale)
}

function dependencyChainContains(settingId: string, ancestorId: string, visited = new Set<string>()): boolean {
  if (visited.has(settingId)) return false
  visited.add(settingId)
  const setting = configSettings.find((item) => item.id === settingId)
  if (!setting?.dependsOn) return false
  if (setting.dependsOn.id === ancestorId) return true
  return dependencyChainContains(setting.dependsOn.id, ancestorId, visited)
}

function explicitChildRequires(config: ProjectConfig, scopeId: string): string | null {
  for (const id of config.overrides) {
    if (id !== scopeId && dependencyChainContains(id, scopeId)) {
      const child = configSettings.find((item) => item.id === id)
      return child?.label ?? id
    }
  }
  for (const [id] of Object.entries(config.scopeChoices ?? {})) {
    if (id !== scopeId && dependencyChainContains(id, scopeId)) {
      const child = configSettings.find((item) => item.id === id)
      return child?.label ?? id
    }
  }
  return null
}

function explicitOn(config: ProjectConfig, id: string): boolean {
  return config.scopeChoices?.[id] === 'On'
}

function explicitOff(config: ProjectConfig, id: string): boolean {
  return config.scopeChoices?.[id] === 'Off'
}

function explicitValue(config: ProjectConfig, id: string): ConfigValue | undefined {
  return config.overrides.includes(id) ? config.values[id] : undefined
}

function publicIdentitySignal(config: ProjectConfig): boolean {
  return (
    (config.overrides.includes('app.primarySurface') && ['Public website', 'Hybrid site + app'].includes(String(config.values['app.primarySurface']))) ||
    (config.overrides.includes('app.accessShape') && ['Public', 'Mixed public + private'].includes(String(config.values['app.accessShape']))) ||
    (config.overrides.includes('app.audience') && config.values['app.audience'] === 'Public visitors')
  )
}

function operationalPackIds(config: ProjectConfig, stack = new Set<string>()): string[] {
  return ['pack.booking', 'pack.payments', 'pack.subscriptions', 'pack.commerce', 'pack.inventory', 'pack.reporting', 'pack.directory', 'pack.tournament', 'pack.government', 'pack.clinic']
    .filter((id) => resolveScope(config, id, stack).active)
}

function scopeRequirements(config: ProjectConfig, id: string, stack: Set<string>): string[] {
  const requiredBy: string[] = []
  const activeScope = (scopeId: string) => resolveScope(config, scopeId, new Set(stack)).active
  const raw = (settingId: string) => config.values[settingId]
  const customizedChild = explicitChildRequires(config, id)
  if (customizedChild) requiredBy.push(customizedChild)

  if (id === 'login.enabled') {
    if (activeScope('admin.enabled')) requiredBy.push('Admin panel')
    if (config.scopeChoices?.['pages.profile'] === 'On' || config.scopeChoices?.['pages.accountSettings'] === 'On' || config.scopeChoices?.['pages.notifications'] === 'On') requiredBy.push('Protected account pages')
    const accessShape = explicitValue(config, 'app.accessShape')
    if (accessShape === 'Private' || accessShape === 'Mixed public + private') requiredBy.push('Protected access shape')
    const orgMode = explicitValue(config, 'org.mode')
    if (orgMode && !isOffLike(orgMode)) requiredBy.push('Organization / team accounts')
  }

  if (id === 'pack.payments') {
    if (activeScope('pack.subscriptions')) requiredBy.push('Subscriptions')
    if (activeScope('pack.commerce')) requiredBy.push('E-commerce checkout')
    if (activeScope('pack.booking') && raw('booking.paymentPolicy') !== 'No payment') requiredBy.push('Booking payment requirement')
  }

  if (id === 'pack.inventory' && activeScope('pack.clinic') && raw('clinic.inventoryLink') !== 'Off') requiredBy.push('Clinic stock integration')
  if (id === 'workflow.enabled' && activeScope('approval.enabled')) requiredBy.push('Approvals')
  if (id === 'notifications.level') {
    if (config.scopeChoices?.['pages.notifications'] === 'On') requiredBy.push('Notification center')
    if (activeScope('integration.email') || activeScope('integration.sms') || activeScope('integration.push')) requiredBy.push('Notification channel')
  }
  if (id === 'search.level' && config.scopeChoices?.['pages.search'] === 'On') requiredBy.push('Global search results page')
  if (id === 'attachments.enabled' && ['All supported uploads', 'Risk-based'].includes(String(raw('security.malwareScan'))) && config.overrides.includes('security.malwareScan')) requiredBy.push('Upload security customization')
  if (id === 'platform.automation' && activeScope('integration.externalAutomation')) requiredBy.push('External automation platform')
  if (id === 'platform.webhooks' && activeScope('integration.externalAutomation') && config.overrides.includes('platform.webhooks')) requiredBy.push('External automation contract')
  return requiredBy
}

function customAutoInference(config: ProjectConfig, id: string, stack: Set<string>): { active: boolean; reason: string } | null {
  const activeScope = (scopeId: string) => resolveScope(config, scopeId, new Set(stack)).active
  const child = explicitChildRequires(config, id)
  if (child) return { active: true, reason: `${child} needs this parent feature.` }

  if (config.overrides.includes(id) && !isOffLike(config.values[id])) return { active: true, reason: 'A customized behavior makes this feature intentional.' }

  if (id === 'login.enabled') {
    const accessShape = explicitValue(config, 'app.accessShape')
    if (accessShape === 'Private' || accessShape === 'Mixed public + private') return { active: true, reason: `${accessShape} access requires an identity boundary.` }
  }
  if (id === 'landing.enabled') {
    if (explicitValue(config, 'app.startDestination') === 'Landing page') return { active: true, reason: 'The selected entry destination is the landing page.' }
    if (publicIdentitySignal(config)) return { active: true, reason: 'The product is explicitly shaped as a public-facing surface.' }
  }
  if (id === 'dashboard.enabled') {
    if (['Dashboard', 'Last visited', 'Role-based'].includes(String(explicitValue(config, 'app.startDestination') ?? ''))) return { active: true, reason: 'The selected signed-in entry behavior needs an app home surface.' }
    if (explicitValue(config, 'app.primarySurface') === 'Signed-in app') return { active: true, reason: 'The product is explicitly shaped as a signed-in app.' }
  }
  if (id === 'roles.level' && activeScope('admin.enabled') && (activeScope('records.crud') || activeScope('workflow.enabled') || operationalPackIds(config, stack).length > 0)) return { active: true, reason: 'Protected operational administration needs explicit authorization roles.' }
  if (id === 'records.crud' && operationalPackIds(config, stack).some((pack) => !['pack.reporting'].includes(pack))) return { active: true, reason: 'An active business pack needs persistent domain records.' }
  if (id === 'forms.enabled' && (activeScope('records.crud') || activeScope('registration.mode'))) return { active: true, reason: 'Active records/account onboarding require structured input.' }
  if (id === 'workflow.enabled' && (activeScope('pack.government') || activeScope('pack.clinic'))) return { active: true, reason: 'The active domain pack requires explicit state transitions.' }
  if (id === 'approval.enabled' && activeScope('pack.government')) return { active: true, reason: 'Government workflow normally requires controlled approvals.' }
  if (id === 'admin.enabled' && operationalPackIds(config, stack).some((pack) => !['pack.reporting'].includes(pack))) return { active: true, reason: 'The active business pack needs protected operational administration.' }
  if (id === 'search.level' && activeScope('pack.directory')) return { active: true, reason: 'Directory discovery requires search.' }
  if (id === 'pages.profile' && activeScope('profile.enabled')) return { active: true, reason: 'An active user profile needs a dedicated account surface.' }
  if (id === 'pages.accountSettings' && activeScope('login.enabled')) return { active: true, reason: 'Signed-in users need a basic account-settings surface.' }
  if (id === 'pages.notifications' && activeScope('notifications.level') && activeScope('login.enabled')) return { active: true, reason: 'Signed-in notifications benefit from a durable inbox.' }
  if (id === 'pages.search' && activeScope('search.level')) return { active: true, reason: 'Active global search needs a results destination.' }
  if (id === 'notifications.level' && (activeScope('integration.email') || activeScope('integration.sms') || activeScope('integration.push'))) return { active: true, reason: 'An enabled delivery channel needs notification events.' }
  if (id === 'quality.backups' || id === 'eng.dbEngine') {
    const durableData = activeScope('records.crud') || operationalPackIds(config, stack).some((pack) => !['pack.portfolio', 'pack.reporting'].includes(pack))
    if (durableData) return { active: true, reason: 'The resolved scope contains durable application data owned by the product.' }
  }

  return null
}

export function isScopeSetting(id: string): boolean {
  return scopeSettingIds.has(redundantSettingAliases[id] ?? id)
}

const quickSettingIds = new Set([
  'app.accessShape', 'app.audience', 'app.primarySurface',
  'login.enabled', 'registration.mode', 'access.guest', 'profile.enabled', 'roles.level', 'org.mode',
  'pages.about', 'pages.features', 'pages.pricing', 'pages.contact', 'pages.faq',
  'landing.enabled', 'landing.complexity', 'landing.heroImage', 'landing.primaryCta',
  'nav.primary', 'nav.mobile', 'dashboard.enabled',
  'records.crud', 'forms.enabled', 'search.level', 'workflow.enabled', 'approval.enabled', 'attachments.enabled',
  'admin.enabled', 'notifications.level',
  'content.aiSlop', 'content.tone', 'content.density',
  'quality.security', 'quality.accessibility', 'quality.privacy', 'quality.testing',
  'platform.deployment',
])

export function settingDepth(setting: ConfigSetting): ConfigDepth {
  if (quickSettingIds.has(setting.id) || setting.section === 'business') return 'Quick'
  if (setting.advanced) return 'Advanced'
  return 'Standard'
}

export function settingVisibleAtDepth(setting: ConfigSetting, depth: ConfigDepth): boolean {
  if (depth === 'Advanced') return true
  const level = settingDepth(setting)
  if (depth === 'Standard') return level !== 'Advanced'
  return level === 'Quick'
}

export function isRedundantSetting(id: string): boolean {
  return redundantSettingIds.has(id)
}

export function settingRole(setting: ConfigSetting): 'Scope' | 'Behavior' | 'Quality' | 'Compatibility' {
  if (isRedundantSetting(setting.id)) return 'Compatibility'
  if (isScopeSetting(setting.id)) return 'Scope'
  if (qualitySections.has(setting.section)) return 'Quality'
  return 'Behavior'
}

export function scopeChoice(config: ProjectConfig, id: string): 'Auto' | ScopeChoice {
  const canonical = redundantSettingAliases[id] ?? id
  return config.scopeChoices?.[canonical] ?? 'Auto'
}

const scopeResolutionCache = new WeakMap<ProjectConfig, Map<string, ScopeResolution>>()

function scopeParentConditionMatches(condition: ConfigCondition, config: ProjectConfig, stack: Set<string>, visited = new Set<string>()): boolean {
  if (visited.has(condition.id)) return true
  const nextVisited = new Set(visited)
  nextVisited.add(condition.id)
  const parentSetting = configSettings.find((item) => item.id === condition.id)
  if (parentSetting?.dependsOn && !scopeParentConditionMatches(parentSetting.dependsOn, config, stack, nextVisited)) return false
  const canonical = redundantSettingAliases[condition.id] ?? condition.id
  const actual = scopeSettingIds.has(canonical)
    ? resolveScope(config, canonical, new Set(stack)).effectiveValue
    : config.values[condition.id]
  return Array.isArray(condition.equals) ? condition.equals.includes(actual) : actual === condition.equals
}

export function resolveScope(config: ProjectConfig, id: string, stack = new Set<string>()): ScopeResolution {
  const canonical = redundantSettingAliases[id] ?? id
  const cache = scopeResolutionCache.get(config) ?? new Map<string, ScopeResolution>()
  if (!scopeResolutionCache.has(config)) scopeResolutionCache.set(config, cache)
  if (!stack.has(canonical)) {
    const cached = cache.get(canonical)
    if (cached) return cached
  }
  const setting = configSettings.find((item) => item.id === canonical)
  const done = (resolution: ScopeResolution) => {
    if (!stack.has(canonical)) cache.set(canonical, resolution)
    return resolution
  }
  if (!setting || !scopeSettingIds.has(canonical)) {
    const raw = config.values[id]
    return done({ id, choice: 'Auto', active: !isOffLike(raw), source: !isOffLike(raw) ? 'Contextual' : 'Inactive', reason: 'This is not a scope-level switch.', requiredBy: [], effectiveValue: raw })
  }
  if (setting.dependsOn && !scopeParentConditionMatches(setting.dependsOn, config, stack)) {
    const choice = scopeChoice(config, canonical)
    const parent = configSettings.find((item) => item.id === setting.dependsOn?.id)
    return done({
      id: canonical,
      choice,
      active: false,
      source: choice === 'Auto' ? 'Inactive' : 'Explicit',
      reason: `${parent?.label ?? setting.dependsOn.id} is inactive, so this dependent feature cannot apply.`,
      requiredBy: choice === 'On' ? [parent?.label ?? setting.dependsOn.id] : [],
      effectiveValue: settingOffValue(setting),
    })
  }
  if (stack.has(canonical)) {
    const fallback = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
    const active = scopeValueIsActive(setting, fallback)
    return done({ id: canonical, choice: scopeChoice(config, canonical), active, source: active ? 'Contextual' : 'Inactive', reason: 'Resolved from the contextual fallback.', requiredBy: [], effectiveValue: active ? fallback : settingOffValue(setting) })
  }
  const nextStack = new Set(stack)
  nextStack.add(canonical)
  const choice = scopeChoice(config, canonical)
  const requiredBy = scopeRequirements(config, canonical, nextStack)

  if (choice === 'Off') {
    return done({
      id: canonical,
      choice,
      active: false,
      source: 'Explicit',
      reason: requiredBy.length ? `Explicitly off, but required by ${requiredBy.join(', ')}.` : 'Explicitly excluded from scope.',
      requiredBy,
      effectiveValue: settingOffValue(setting),
    })
  }
  if (choice === 'On') {
    return done({ id: canonical, choice, active: true, source: 'Explicit', reason: 'Explicitly included in scope.', requiredBy, effectiveValue: activeScopeValue(setting, config) })
  }
  if (requiredBy.length) {
    return done({ id: canonical, choice, active: true, source: 'Required', reason: `Required by ${requiredBy.join(', ')}.`, requiredBy, effectiveValue: activeScopeValue(setting, config) })
  }

  if (config.appType === 'Custom / General') {
    const inference = customAutoInference(config, canonical, nextStack)
    if (inference?.active) return done({ id: canonical, choice, active: true, source: 'Inferred', reason: inference.reason, requiredBy, effectiveValue: activeScopeValue(setting, config) })
    return done({ id: canonical, choice, active: false, source: 'Inactive', reason: 'Auto is neutral for Custom / General until another decision needs this feature.', requiredBy, effectiveValue: settingOffValue(setting) })
  }

  const contextual = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
  const active = scopeValueIsActive(setting, contextual)
  return done({
    id: canonical,
    choice,
    active,
    source: active ? 'Contextual' : 'Inactive',
    reason: active ? `Recommended for ${config.appType}.` : `Not needed by the ${config.appType} baseline.`,
    requiredBy,
    effectiveValue: active ? activeScopeValue(setting, config) : settingOffValue(setting),
  })
}

export function effectiveConfigValue(config: ProjectConfig, id: string): ConfigValue {
  const alias = redundantSettingAliases[id]
  if (alias) {
    const aliasSetting = configSettings.find((item) => item.id === id)
    const resolution = resolveScope(config, alias)
    if (!aliasSetting) return resolution.effectiveValue
    if (aliasSetting.kind === 'boolean') return resolution.active
    if (!resolution.active) return settingOffValue(aliasSetting)
    const raw = config.values[id]
    return isOffLike(raw) ? settingOnValue(aliasSetting, config.appType, config.profile, config.operationalScale) : raw
  }
  if (scopeSettingIds.has(id)) return resolveScope(config, id).effectiveValue
  return config.values[id]
}

export function settingIsActive(settingOrId: ConfigSetting | string, config: ProjectConfig): boolean {
  const setting = typeof settingOrId === 'string' ? configSettings.find((item) => item.id === settingOrId) : settingOrId
  if (!setting || isRedundantSetting(setting.id)) return false
  if (setting.dependsOn && !conditionMatches(setting.dependsOn, config)) return false
  if (isScopeSetting(setting.id)) return true

  const scopeOn = (id: string) => resolveScope(config, id).active
  const activePages = ['pages.about', 'pages.features', 'pages.pricing', 'pages.contact', 'pages.faq', 'pages.blog', 'pages.changelog', 'pages.status', 'pages.legal', 'pages.team', 'pages.careers', 'pages.docs', 'pages.roadmap', 'pages.partners', 'pages.security', 'pages.accessibilityStatement', 'pages.profile', 'pages.accountSettings', 'pages.notifications', 'pages.search'].some(scopeOn)
  const activePacks = operationalPackIds(config)
  const anyBusiness = activePacks.length > 0 || scopeOn('pack.portfolio')
  const hasAuth = scopeOn('login.enabled')
  const hasRecords = scopeOn('records.crud') || activePacks.some((pack) => !['pack.portfolio', 'pack.reporting'].includes(pack))
  const hasForms = scopeOn('forms.enabled')
  const hasWorkflow = scopeOn('workflow.enabled') || scopeOn('approval.enabled') || scopeOn('tasks.enabled')
  const hasSearch = scopeOn('search.level')
  const hasUploads = scopeOn('attachments.enabled')
  const hasCollaboration = hasRecords || hasWorkflow || hasUploads || scopeOn('comments.enabled') || scopeOn('imports.enabled')
  const publicFacing = publicIdentitySignal(config) || scopeOn('landing.enabled') || ['pack.portfolio', 'pack.directory', 'pack.commerce', 'pack.tournament'].some(scopeOn)
  const hasUserSurface = publicFacing || hasAuth || scopeOn('dashboard.enabled') || activePages || anyBusiness
  const anyIntegration = ['integration.email', 'integration.sms', 'integration.push', 'integration.calendar', 'integration.maps', 'integration.storage', 'integration.collaboration', 'integration.crm', 'integration.accounting', 'integration.externalAutomation', 'ai.enabled'].some(scopeOn)
  const hasApi = scopeOn('platform.api') || scopeOn('platform.webhooks')
  const hasAutomation = scopeOn('platform.automation') || scopeOn('integration.externalAutomation')
  const hasDurableData = hasRecords || activePacks.some((pack) => !['pack.portfolio', 'pack.reporting'].includes(pack))
  const hasDatabase = scopeOn('eng.dbEngine')
  const hasBackend = hasDurableData || hasApi || anyIntegration || hasAutomation || scopeOn('admin.enabled')
  const hasTables = hasRecords || ['pack.reporting', 'pack.inventory', 'pack.directory', 'pack.government', 'pack.clinic', 'pack.tournament'].some(scopeOn)
  const hasCharts = scopeOn('pack.reporting')
  const hasPersonalData = hasAuth || hasForms || ['pack.booking', 'pack.payments', 'pack.commerce', 'pack.directory', 'pack.government', 'pack.clinic'].some(scopeOn)
  const hasTransactionalWork = hasWorkflow || ['pack.booking', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.government', 'pack.clinic'].some(scopeOn)

  if (setting.section === 'data') return hasRecords || hasDurableData
  if (setting.section === 'views') {
    if (setting.id.startsWith('search.')) return hasSearch
    return hasTables
  }
  if (setting.section === 'workflow') return hasWorkflow
  if (setting.section === 'collaboration') return hasCollaboration
  if (setting.section === 'accounts') {
    if (setting.id.startsWith('profile.')) return scopeOn('profile.enabled')
    if (setting.id.startsWith('invite.') || setting.id.startsWith('account.approval')) return true
    if (['account.statuses', 'account.suspension', 'account.dormant', 'account.merge'].includes(setting.id)) return scopeOn('admin.enabled') || anyBusiness
    if (setting.id === 'account.phoneChange') return ['Phone', 'Email or phone'].includes(String(effectiveConfigValue(config, 'login.identifier'))) || effectiveConfigValue(config, 'login.verification') === 'Phone'
    if (setting.id === 'account.connectedIdentities') return Boolean(effectiveConfigValue(config, 'login.passkeyOptional')) || Boolean(effectiveConfigValue(config, 'login.magicLinkOptional')) || !isOffLike(effectiveConfigValue(config, 'login.social')) || !isOffLike(effectiveConfigValue(config, 'login.enterpriseSso'))
    return hasAuth
  }
  if (setting.section === 'permissions') return scopeOn('roles.level') || scopeOn('admin.enabled') || hasRecords || hasWorkflow || anyBusiness
  if (setting.section === 'navigation') return hasUserSurface
  if (setting.section === 'experience') {
    if (!hasUserSurface) return false
    if (['ux.autosave', 'ux.unsavedWarning', 'ux.formOverlay'].includes(setting.id)) return hasForms || hasRecords
    if (['ux.undo', 'ux.optimistic', 'ux.inlineEdit'].includes(setting.id)) return hasRecords || hasWorkflow
    if (['ux.confirmation', 'ux.typeToConfirm'].includes(setting.id)) return hasTransactionalWork || scopeOn('admin.enabled')
    if (setting.id === 'ux.longRunning') return hasTransactionalWork || anyIntegration || hasAutomation
    return true
  }
  if (setting.section === 'states') {
    if (!hasUserSurface) return false
    if (setting.id === 'ux.emptyStates') return hasRecords || hasSearch || scopeOn('dashboard.enabled')
    if (setting.id === 'states.firstUse') return hasAuth || scopeOn('content.onboarding') || scopeOn('dashboard.enabled')
    if (setting.id === 'states.noResults') return hasSearch || hasTables
    if (setting.id === 'states.permission' || setting.id === 'states.sessionExpired') return hasAuth || scopeOn('admin.enabled')
    if (setting.id === 'states.thirdParty') return anyIntegration
    if (setting.id === 'states.partialSuccess') return hasTransactionalWork || scopeOn('imports.enabled') || hasAutomation
    return true
  }
  if (setting.section === 'mobile') {
    if (!hasUserSurface) return false
    if (setting.id === 'mobile.tables') return hasTables
    if (setting.id === 'mobile.forms' || setting.id === 'mobile.keyboard') return hasForms || hasAuth
    return true
  }
  if (setting.section === 'integrations') return anyIntegration || hasApi
  if (setting.section === 'automation') return hasAutomation
  if (setting.section === 'ai') return scopeOn('ai.enabled')
  if (setting.section === 'support') return hasUserSurface

  if (setting.section === 'security') {
    if (setting.id === 'security.sqlSafety') return hasDatabase
    if (setting.id === 'security.csrf') return hasAuth || hasForms || hasTransactionalWork
    if (setting.id === 'security.cors') return hasApi || anyIntegration
    if (setting.id === 'security.inputValidation') return hasForms || hasApi || hasRecords || hasTransactionalWork
    if (setting.id === 'security.abuseStrategy') return publicFacing || hasAuth || hasApi
    if (setting.id === 'security.publicFormAbuse') return publicFacing && hasForms
    if (setting.id === 'security.adminBoundary') return scopeOn('admin.enabled')
    if (setting.id === 'security.reauth') return hasAuth
    if (setting.id === 'security.secrets' || setting.id === 'security.secretRotation') return hasBackend
    return hasUserSurface || hasBackend
  }

  if (setting.section === 'privacy') {
    if (setting.id === 'privacy.analyticsData') return scopeOn('platform.analytics')
    if (['privacy.cookies', 'privacy.consent', 'privacy.consentHistory', 'privacy.withdrawal'].includes(setting.id)) return publicFacing && (hasPersonalData || scopeOn('platform.analytics'))
    if (setting.id === 'privacy.subprocessors' || setting.id === 'privacy.thirdPartyMin') return anyIntegration
    if (setting.id === 'privacy.adminAccessAudit') return hasPersonalData && scopeOn('admin.enabled')
    if (setting.id === 'privacy.legalHold') return scopeOn('pack.government') || scopeOn('pack.clinic')
    if (setting.id === 'privacy.incidentPlan') return hasPersonalData || anyIntegration
    return hasPersonalData
  }

  if (setting.section === 'accessibility') {
    if (!hasUserSurface) return false
    if (setting.id === 'a11y.labels' || setting.id === 'a11y.errors') return hasForms || hasAuth
    if (setting.id === 'a11y.tables') return hasTables
    if (setting.id === 'a11y.charts') return hasCharts
    if (setting.id === 'a11y.auth') return hasAuth
    return true
  }

  if (setting.section === 'performance') {
    if (!hasUserSurface && !hasBackend) return false
    if (['perf.serverLatency', 'perf.queryDiscipline', 'perf.indexing', 'perf.pagination'].includes(setting.id)) return hasRecords || hasDatabase || hasTransactionalWork || hasApi
    if (setting.id === 'perf.virtualization') return hasTables
    if (['perf.images', 'perf.fonts', 'perf.bundle', 'perf.codeSplitting', 'perf.webVitals', 'perf.cdn'].includes(setting.id)) return hasUserSurface
    if (['perf.timeouts', 'perf.retries', 'perf.circuitBreaker', 'perf.gracefulDegradation'].includes(setting.id)) return anyIntegration || hasApi || hasTransactionalWork
    if (['perf.healthChecks', 'perf.capacity', 'perf.availability'].includes(setting.id)) return hasTransactionalWork || anyBusiness || hasApi
    return true
  }

  if (setting.section === 'observability') {
    if (!hasUserSurface && !hasBackend) return false
    if (setting.id === 'obs.jobMonitoring') return hasAutomation
    if (setting.id === 'obs.integrationMonitoring') return anyIntegration || scopeOn('platform.webhooks')
    if (setting.id === 'obs.dbMonitoring') return hasDatabase
    if (setting.id === 'obs.synthetic') return hasTransactionalWork || anyBusiness
    if (setting.id === 'obs.statusPage') return scopeOn('pages.status')
    if (setting.id === 'obs.uptime') return publicFacing || hasTransactionalWork || anyBusiness
    if (['obs.tracing', 'obs.metrics', 'obs.alerting', 'obs.alertNoise', 'obs.incidentRecords', 'obs.retention'].includes(setting.id)) return hasTransactionalWork || anyBusiness || hasApi || anyIntegration
    if (['obs.logs', 'obs.redaction', 'obs.requestId'].includes(setting.id)) return hasBackend
    return hasUserSurface || hasBackend
  }

  if (setting.section === 'recovery') return hasDurableData && scopeOn('quality.backups')

  if (setting.section === 'engineering') {
    if (['eng.dbPooling', 'eng.migrations', 'eng.migrationGate', 'eng.seedData'].includes(setting.id)) return hasDatabase
    if (setting.id === 'eng.offlineConflict') return effectiveConfigValue(config, 'platform.offline') === 'Offline write + sync'
    if (setting.id === 'eng.pwaManifest' || setting.id === 'eng.pwaUpdates') return scopeOn('platform.pwa')
    if (['eng.envValidation', 'eng.secretSeparation'].includes(setting.id)) return hasBackend
    if (['eng.zeroDowntime', 'eng.deployApproval', 'eng.featureFlags', 'eng.maintenanceMode'].includes(setting.id)) return hasTransactionalWork || anyBusiness || scopeOn('admin.enabled')
    if (setting.id === 'eng.branchProtection' || setting.id === 'eng.smokeAfterDeploy') return hasUserSurface || hasBackend
    return hasUserSurface || hasBackend || config.appType !== 'Custom / General'
  }

  if (setting.section === 'testing') {
    if (!hasUserSurface && !hasBackend) return false
    if (setting.id === 'test.unit') return hasRecords || hasTransactionalWork || anyBusiness
    if (setting.id === 'test.integration') return hasBackend || anyIntegration
    if (setting.id === 'test.e2e') return hasUserSurface
    if (setting.id === 'test.authz') return hasAuth || scopeOn('admin.enabled')
    if (setting.id === 'test.responsive' || setting.id === 'test.browser' || setting.id === 'test.mobileBrowser' || setting.id === 'test.tablet' || setting.id === 'test.slowNetwork' || setting.id === 'test.lowPower') return hasUserSurface
    if (setting.id === 'test.visual') return publicFacing || scopeOn('dashboard.enabled')
    if (setting.id === 'test.performance' || setting.id === 'test.load') return hasTransactionalWork || anyBusiness || hasApi
    if (setting.id === 'test.migrations') return hasDatabase
    if (setting.id === 'test.restore') return hasDurableData && scopeOn('quality.backups')
    if (setting.id === 'test.testData') return hasPersonalData || hasDatabase
    if (setting.id === 'test.print') return ['pack.reporting', 'pack.government', 'pack.tournament'].some(scopeOn)
    return true
  }

  if (setting.section === 'delivery') {
    if (setting.id === 'platform.offline') return hasUserSurface
    if (setting.id === 'platform.deployment') return hasUserSurface || hasBackend || config.appType !== 'Custom / General'
  }

  return true
}

export function settingIncludedInContract(setting: ConfigSetting, config: ProjectConfig): boolean {
  if (isRedundantSetting(setting.id)) return false
  if (isScopeSetting(setting.id)) {
    const resolution = resolveScope(config, setting.id)
    return resolution.active || resolution.choice !== 'Auto'
  }
  return settingIsActive(setting, config)
}

export function setScopeChoice(config: ProjectConfig, id: string, choice: 'Auto' | ScopeChoice): ProjectConfig {
  const current = normalizeProjectConfig(config)
  const canonical = redundantSettingAliases[id] ?? id
  const setting = configSettings.find((item) => item.id === canonical)
  if (!setting || !scopeSettingIds.has(canonical)) return current
  const scopeChoices = { ...current.scopeChoices }

  if (choice === 'Auto') {
    delete scopeChoices[canonical]
    if (setting.kind === 'boolean') {
      const reset = resetConfigValue(current, canonical)
      return { ...reset, scopeChoices }
    }
    // Auto removes only explicit scope intent. A deliberate behavior choice remains available
    // and can legitimately infer the feature back On; resetting behavior is a separate action.
    return { ...current, scopeChoices }
  }

  scopeChoices[canonical] = choice
  const values = { ...current.values }
  let overrides = [...current.overrides]

  if (setting.kind === 'boolean') {
    // Scope intent fully describes boolean feature existence; do not duplicate it as a raw override.
    overrides = overrides.filter((item) => item !== canonical)
  } else if (choice === 'On' && !scopeValueIsActive(setting, values[canonical])) {
    // Restore a sensible active behavior when an older/legacy config only retained the off sentinel.
    values[canonical] = settingOnValue(setting, current.appType, current.profile, current.operationalScale)
    overrides = overrides.filter((item) => item !== canonical)
  }

  // Off changes resolved scope only. Keep a non-default choice value so turning the feature back On restores its prior behavior.
  return { ...current, values, overrides, scopeChoices }
}

export function scopeConflicts(config: ProjectConfig): string[] {
  const warnings: string[] = []
  for (const id of scopeSettingIds) {
    const resolution = resolveScope(config, id)
    if (resolution.choice === 'Off' && resolution.requiredBy.length) {
      const setting = configSettings.find((item) => item.id === id)
      warnings.push(`${setting?.label ?? id} is explicitly Off but required by ${resolution.requiredBy.join(', ')}.`)
    }
  }
  return warnings
}

export function createProjectConfig(appType: AppType = 'Custom / General', profile: ConfigProfile = 'Recommended', operationalScale: OperationalScale = 'Auto'): ProjectConfig {
  return {
    appType,
    profile,
    operationalScale,
    values: Object.fromEntries(configSettings.map((setting) => [setting.id, recommendedValue(setting, appType, profile, operationalScale)])),
    overrides: [],
    scopeChoices: {},
  }
}

export function normalizeProjectConfig(input?: Partial<ProjectConfig> | null): ProjectConfig {
  const appType = appTypes.some((item) => item.value === input?.appType) ? input!.appType as AppType : 'Custom / General'
  const profile = configProfiles.some((item) => item.value === input?.profile) ? input!.profile as ConfigProfile : 'Recommended'
  const operationalScale = operationalScales.some((item) => item.value === input?.operationalScale) ? input!.operationalScale as OperationalScale : 'Auto'
  const base = createProjectConfig(appType, profile, operationalScale)
  const rawValues = input?.values ?? {}
  const explicitOverrides = Array.isArray(input?.overrides) ? input!.overrides!.filter((id) => configSettings.some((setting) => setting.id === id)) : []
  // Rebase untouched values onto the current recommendation engine. Old backups contain a full resolved
  // value map, but only ids in overrides represent deliberate behavior choices that should survive upgrades.
  const values = { ...base.values }
  for (const id of explicitOverrides) if (rawValues[id] !== undefined) values[id] = rawValues[id]
  let overrides = explicitOverrides.filter((id) => {
    const setting = configSettings.find((item) => item.id === id)
    return setting ? values[id] !== recommendedValue(setting, appType, profile, operationalScale) : false
  })
  const scopeChoices: Record<string, ScopeChoice> = {}
  for (const [id, choice] of Object.entries(input?.scopeChoices ?? {})) {
    const canonical = redundantSettingAliases[id] ?? id
    if (scopeSettingIds.has(canonical) && (choice === 'On' || choice === 'Off')) scopeChoices[canonical] = choice
  }
  // v0.11 and earlier represented scope intent only through raw overrides.
  for (const id of overrides) {
    const canonical = redundantSettingAliases[id] ?? id
    const setting = configSettings.find((item) => item.id === canonical)
    if (!scopeChoices[canonical] && setting && scopeSettingIds.has(canonical)) scopeChoices[canonical] = scopeValueIsActive(setting, values[id]) ? 'On' : 'Off'
  }
  // Migrate explicit legacy compatibility toggles into the new canonical scope intent.
  for (const [legacyId, canonical] of Object.entries(redundantSettingAliases)) {
    if (scopeChoices[canonical] || !overrides.includes(legacyId)) continue
    scopeChoices[canonical] = isOffLike(values[legacyId]) ? 'Off' : 'On'
  }

  // Scope intent is stored once. Keep a scope setting in overrides only when it carries a distinct behavior choice.
  overrides = overrides.filter((id) => {
    const canonical = redundantSettingAliases[id] ?? id
    const setting = configSettings.find((item) => item.id === canonical)
    if (!setting || !scopeChoices[canonical]) return true
    if (setting.kind === 'boolean') return false
    const raw = values[id]
    return raw !== settingOnValue(setting, appType, profile, operationalScale) && raw !== settingOffValue(setting)
  })
  return { appType, profile, operationalScale, values, overrides, scopeChoices }
}

export function changeConfigContext(config: ProjectConfig, appType: AppType, profile: ConfigProfile, operationalScale: OperationalScale = normalizeProjectConfig(config).operationalScale): ProjectConfig {
  const current = normalizeProjectConfig(config)
  const overrideSet = new Set(current.overrides)
  const values: Record<string, ConfigValue> = {}
  for (const setting of configSettings) {
    values[setting.id] = overrideSet.has(setting.id)
      ? current.values[setting.id]
      : recommendedValue(setting, appType, profile, operationalScale)
  }
  const overrides = Array.from(overrideSet).filter((id) => {
    const setting = configSettings.find((item) => item.id === id)
    return setting ? values[id] !== recommendedValue(setting, appType, profile, operationalScale) : false
  })
  return { appType, profile, operationalScale, values, overrides, scopeChoices: { ...current.scopeChoices } }
}
export function setConfigValue(config: ProjectConfig, id: string, value: ConfigValue): ProjectConfig {
  const current = normalizeProjectConfig(config)
  const setting = configSettings.find((item) => item.id === id)
  if (!setting) return current
  const values = { ...current.values, [id]: value }
  const overrideSet = new Set(current.overrides)
  if (value === recommendedValue(setting, current.appType, current.profile, current.operationalScale)) overrideSet.delete(id)
  else overrideSet.add(id)
  return { ...current, values, overrides: Array.from(overrideSet) }
}

export function resetConfigValue(config: ProjectConfig, id: string): ProjectConfig {
  const current = normalizeProjectConfig(config)
  const setting = configSettings.find((item) => item.id === id)
  if (!setting) return current
  const values = { ...current.values, [id]: recommendedValue(setting, current.appType, current.profile, current.operationalScale) }
  return { ...current, values, overrides: current.overrides.filter((item) => item !== id) }
}

export function resetConfigSection(config: ProjectConfig, sectionId: string): ProjectConfig {
  let next = normalizeProjectConfig(config)
  const ids = configSettings.filter((item) => item.section === sectionId).map((item) => item.id)
  for (const id of ids) next = resetConfigValue(next, id)
  const scopeChoices = { ...next.scopeChoices }
  for (const id of ids) delete scopeChoices[redundantSettingAliases[id] ?? id]
  return { ...next, scopeChoices }
}

export function resetAllConfig(config: ProjectConfig): ProjectConfig {
  return createProjectConfig(config.appType, config.profile, normalizeProjectConfig(config).operationalScale)
}

export function conditionMatches(condition: ConfigCondition | undefined, config: ProjectConfig, visited = new Set<string>()): boolean {
  if (!condition) return true
  if (visited.has(condition.id)) return true
  const nextVisited = new Set(visited)
  nextVisited.add(condition.id)
  const parentSetting = configSettings.find((setting) => setting.id === condition.id)
  if (parentSetting?.dependsOn && !conditionMatches(parentSetting.dependsOn, config, nextVisited)) return false
  const actual = effectiveConfigValue(config, condition.id)
  return Array.isArray(condition.equals) ? condition.equals.includes(actual) : actual === condition.equals
}

export function formatConfigValue(value: ConfigValue): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function configWarnings(config: ProjectConfig): string[] {
  const warnings: string[] = []
  const value = (id: string) => effectiveConfigValue(config, id)
  const active = (id: string) => {
    const setting = configSettings.find((item) => item.id === id)
    return setting ? settingIsActive(setting, config) : false
  }
  warnings.push(...scopeConflicts(config))
  if (value('admin.enabled') === true && value('login.enabled') === false) warnings.push('Admin panel is enabled while login is disabled. Protect administrative routes with authentication.')
  if (active('login.passwordPolicy') && value('login.passwordPolicy') === 'No restrictions') warnings.push('Password policy is set to “No restrictions.” This is intentionally outside the recommended baseline.')
  if (active('login.passwordPolicy') && value('login.passwordPolicy') === 'Legacy composition rules') warnings.push('Legacy password composition rules are selected. Prefer modern length/blocklist/password-manager-friendly requirements unless a legacy policy is mandatory.')
  if (active('password.composition') && value('password.composition') !== 'None') warnings.push('Password character-composition rules are enabled. Treat this as a legacy/compliance exception rather than the modern recommended baseline.')
  if (active('password.rotation') && value('password.rotation') !== 'Compromise / reset event only') warnings.push('Periodic or scheduled password rotation is enabled. Prefer changing passwords after compromise/reset events unless an external policy requires rotation.')
  if (active('password.blocklist') && value('password.blocklist') === false && value('login.method') === 'Password') warnings.push('Common/compromised password blocking is disabled while password sign-in is enabled.')
  if (active('password.managers') && value('password.managers') === false && value('login.method') === 'Password') warnings.push('Password-manager compatibility is disabled. This can reduce both usability and credential quality.')
  if (active('password.paste') && value('password.paste') === false && value('login.method') === 'Password') warnings.push('Paste is disabled in password fields. This interferes with password managers and long generated passwords.')
  if (active('recovery.securityQuestions') && value('recovery.securityQuestions') === true) warnings.push('Security questions are enabled for account recovery. Knowledge-based recovery is weak and should not be a recommended factor.')
  if (active('login.genericErrors') && value('login.genericErrors') === 'Specific account state') warnings.push('Login errors reveal specific account state. That can make account enumeration easier.')
  if (active('login.rateLimit') && ['Hard lockout', 'Off'].includes(String(value('login.rateLimit')))) warnings.push('Failed sign-in protection is set to a risky mode. Prefer progressive throttling or risk-triggered challenges.')
  if (active('permissions.defaultPolicy') && value('permissions.defaultPolicy') === 'Allow by default') warnings.push('Authorization is configured to allow by default. Prefer deny-by-default so new routes/actions do not become exposed accidentally.')
  if (active('permissions.enforcement') && value('permissions.enforcement') === 'UI checks only') warnings.push('Permissions are configured as UI-only checks. Protected actions must be enforced on the server/action boundary too.')
  if (active('org.tenantIsolation') && value('org.mode') === 'Multi-tenant organizations' && value('org.tenantIsolation') === 'Shared scope / labels only') warnings.push('Multi-tenant mode is using shared/cosmetic tenant scope. Enforce a real tenant data boundary in authorization and data access.')
  if (active('password.temporary') && value('password.temporary') === 'Temporary without forced change') warnings.push('Admin-issued temporary passwords are allowed without a first-login replacement requirement.')
  if (['Government System', 'Clinic / EMR'].includes(config.appType) && value('quality.audit') === 'Off') warnings.push(`${config.appType} normally needs an audit trail for important user and administrative actions.`)
  if (['Government System', 'Clinic / EMR'].includes(config.appType) && ['Basic', 'WCAG A'].includes(String(value('quality.accessibility')))) warnings.push(`${config.appType} is configured below the recommended WCAG AA accessibility target.`)
  if (value('records.delete') === 'Hard delete' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Hard delete is risky for this app type. Prefer recoverable or non-destructive record handling.')
  if (value('platform.offline') === 'Offline write + sync' && value('platform.pwa') === false) warnings.push('Offline write + sync is selected without an installable PWA. That can work, but requires an explicit caching/sync architecture.')
  if (value('app.accessShape') === 'Private' && value('landing.enabled') === true) warnings.push('This product is marked Private but still has a dedicated public landing page. Keep it only if you intentionally want a branded pre-login entry surface.')
  if (publicIdentitySignal(config) && resolveScope(config, 'seo.enabled').active === false && scopeChoice(config, 'seo.enabled') === 'Auto') warnings.push('This project is explicitly shaped as a public website but search-engine discoverability is still Auto → Off. Confirm that noindex is intentional or turn SEO On.')
  const entryDestinationIsIntentional = config.appType !== 'Custom / General' || config.overrides.includes('app.startDestination')
  if (entryDestinationIsIntentional && value('app.startDestination') === 'Landing page' && value('landing.enabled') === false) warnings.push('Default entry destination is Landing page, but the landing page is disabled.')
  if (entryDestinationIsIntentional && value('app.startDestination') === 'Login' && value('login.enabled') === false) warnings.push('Default entry destination is Login, but login is disabled.')
  if (entryDestinationIsIntentional && value('app.startDestination') === 'Dashboard' && value('dashboard.enabled') === false) warnings.push('Default entry destination is Dashboard, but the dashboard is disabled.')
  if (value('ux.modalPolicy') === 'Avoid modals' && value('ux.formOverlay') === 'Modal for short forms') warnings.push('Modal policy says to avoid modals, but short forms are configured to open in modals.')
  if (value('content.fakeProof') !== 'Never fabricate') warnings.push('Synthetic proof placeholders are allowed in development. Make sure they are visibly marked and cannot ship as real testimonials, metrics, ratings, or logos.')
  if (value('landing.appBadges') === 'PWA install cue' && value('platform.pwa') === false) warnings.push('Landing page shows a PWA install cue, but installable PWA is disabled.')
  if (active('forms.serverValidation') && value('forms.serverValidation') === false) warnings.push('Server-side form validation is disabled. Client validation alone is not a trusted enforcement boundary.')
  if (active('data.uniqueRules') && value('data.uniqueRules') === 'Application validation only') warnings.push('Uniqueness is enforced only in application validation. Race conditions can still create duplicate records without database constraints.')
  if (active('data.optimisticLock') && value('data.optimisticLock') === 'Last write wins' && ['Government System', 'Clinic / EMR', 'Internal / Operations'].includes(config.appType)) warnings.push('Concurrent edits use last-write-wins for an operational app. Consider stale-edit detection to avoid silent overwrites.')
  if (active('workflow.restrictedTransitions') && value('workflow.restrictedTransitions') === false && value('workflow.enabled') === true) warnings.push('Workflow transitions are unrestricted. Invalid status jumps can bypass intended process rules.')
  if (active('imports.preview') && value('imports.preview') === false && value('imports.enabled') !== 'Off') warnings.push('Bulk import is enabled without a validation preview. Users may commit large data problems before seeing them.')
  if (active('booking.conflictPolicy') && value('booking.conflictPolicy') === 'UI check only') warnings.push('Booking conflict prevention is UI-only. Enforce slot/resource conflicts atomically at the authoritative data boundary to prevent double booking.')
  if (active('booking.paymentPolicy') && ['Deposit required', 'Required before confirmation'].includes(String(value('booking.paymentPolicy'))) && value('pack.payments') !== true) warnings.push('Booking requires payment, but the Payments & money pack is disabled. Enable the payment pack or change the booking payment requirement.')
  if (active('payments.verification') && value('payments.verification') === 'Client return / redirect only') warnings.push('Payment success trusts the browser return/redirect. Use server/provider verification before marking a transaction paid or fulfilling it.')
  if (active('payments.webhookIdempotency') && value('payments.webhookIdempotency') === false && ['Server/webhook verified', 'Server verified + reconciliation'].includes(String(value('payments.verification')))) warnings.push('Provider/webhook payment confirmation is enabled without duplicate-event protection. Retries must not double-confirm or double-fulfill transactions.')
  if (active('payments.feeDisplay') && ['Total only', 'Added at final step only'].includes(String(value('payments.feeDisplay'))) && value('payments.fees') !== 'Off') warnings.push('Additional fees are enabled but are not itemized early. Show named fees before the user commits to payment.')
  if (value('pack.subscriptions') === true && value('pack.payments') !== true) warnings.push('Subscriptions & SaaS billing is enabled while Payments & money is disabled. Enable payments unless billing is intentionally handled completely outside this product.')
  if (active('inventory.negative') && value('inventory.negative') === 'Allow silently') warnings.push('Inventory can go negative silently. This can hide overselling, stock-entry errors, or broken movement logic.')
  if (active('reporting.permissions') && value('reporting.permissions') === 'Unrestricted report dataset') warnings.push('Reports are configured to bypass source permissions. Reporting should not expose rows, fields, or tenant data users cannot access elsewhere.')
  if (active('directory.claim') && value('directory.claim') === 'Instant claim' && value('directory.verification') === 'Off') warnings.push('Listings can be claimed instantly without owner verification. Require a verification/review step before granting listing control.')
  if (active('government.publicTracking') && value('government.publicTracking') === 'Show internal routing detail') warnings.push('Public tracking is configured to expose internal routing details. Keep external status views bounded to information safe for public disclosure.')
  if (value('pack.clinic') === true && value('app.accessShape') === 'Public') warnings.push('Clinic & EMR is enabled while the overall product is Public. Keep clinical records and staff workflows behind authenticated, authorized boundaries even if some public pages exist.')
  if (active('clinic.recordAccess') && value('clinic.recordAccess') === 'Broad staff access') warnings.push('Clinical records are broadly visible to staff. Prefer role and care/department scope so access follows operational need.')
  if (active('clinic.inventoryLink') && value('clinic.inventoryLink') !== 'Off' && value('pack.inventory') !== true) warnings.push('Clinical dispensing is configured to update inventory, but the Inventory & POS pack is disabled. Enable inventory or turn off the stock integration.')
  if (active('api.idempotency') && value('api.idempotency') === 'Off' && (value('pack.payments') === true || value('pack.booking') === true)) warnings.push('External API mutations are not idempotent while payment/booking flows exist. Retryable create/action endpoints can duplicate side effects.')
  if (active('webhook.signing') && value('webhook.signing') === 'Unsigned') warnings.push('Outgoing webhooks are unsigned. Sign deliveries so consumers can authenticate events instead of trusting source IP or payload shape.')
  if (active('webhook.verifyIncoming') && value('webhook.verifyIncoming') === false) warnings.push('Incoming webhook signature verification is disabled. Provider callbacks must be authenticated before changing application state.')
  if (active('webhook.idempotency') && value('webhook.idempotency') === false) warnings.push('Incoming webhooks are not idempotent. Provider retries can duplicate transactions, notifications, or workflow actions.')
  if (active('webhook.retry') && value('webhook.retry') === 'No retry') warnings.push('Outgoing webhooks are configured with no retry. Transient receiver failures will permanently drop events.')
  if (active('email.sensitiveContent') && value('email.sensitiveContent') === 'Full contextual details' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Sensitive workflow details are configured to appear directly in email. Prefer minimal notification content with authenticated in-app access.')
  if (active('sms.sensitiveContent') && value('sms.sensitiveContent') === 'Contextual details' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Sensitive workflow details are configured to appear directly in SMS. Keep message content minimal because SMS can appear on lock screens and carrier systems.')
  if (active('push.permissionTiming') && value('push.permissionTiming') === 'Ask on first visit') warnings.push('Push permission is requested on first visit. Ask contextually after the user understands what notifications will provide.')
  if (active('calendar.externalPrivacy') && value('calendar.externalPrivacy') === 'Full booking/context details' && config.appType === 'Clinic / EMR') warnings.push('Clinical context is configured to sync in full to external calendar events. Prefer generic busy blocks or minimal safe details.')
  if (active('maps.permissionTiming') && value('maps.permissionTiming') === 'On page load') warnings.push('Location permission is requested on page load. Ask only when the user invokes a location-dependent feature.')
  if (active('storage.access') && value('storage.access') === 'Permanent public URLs' && ['Government System', 'Clinic / EMR', 'Internal / Operations'].includes(config.appType)) warnings.push('Protected operational files are configured with permanent public URLs. Use authorized downloads or short-lived signed access.')
  if (active('collab.actionsAuth') && value('collab.actionsAuth') === 'Trust channel membership') warnings.push('Chat-triggered actions trust channel membership instead of application authorization. Re-check product permissions for every action.')
  if (value('integration.externalAutomation') === true && value('platform.automation') === 'Manual only') warnings.push('An external automation platform is enabled while the product automation posture is Manual only. Disable the connector or switch to an automation-ready posture.')
  if (active('automation.permissionModel') && value('automation.permissionModel') === 'System-wide privileges') warnings.push('Automations run with system-wide privileges. Prefer a scoped service identity or the initiating user permissions.')
  if (active('automation.approval') && value('automation.approval') === 'Off' && value('automation.actions') === 'Broad permission-aware actions') warnings.push('Automation can perform broad actions without a human-approval policy. Require review for consequential or irreversible actions.')
  if (active('automation.dedupe') && value('automation.dedupe') === 'Off' && value('automation.actions') !== 'Notifications only') warnings.push('Side-effecting automations have no event deduplication/idempotency protection. Retries may apply the same action more than once.')
  if (active('automation.credentials') && value('automation.credentials') === 'Workflow config values') warnings.push('Automation credentials are stored in workflow configuration values. Move secrets to environment/credential-vault storage.')
  if (active('automation.contracts') && value('automation.contracts') === 'Ad hoc payloads') warnings.push('External automation relies on ad hoc payloads. Document a stable webhook/API contract so routine app changes do not silently break workflows.')
  if (active('jobs.longTaskUx') && value('jobs.longTaskUx') === 'Spinner until done' && value('jobs.enabled') !== 'Off') warnings.push('Long-running background work is represented only by a spinner. Prefer an accepted/running/completed state so users can leave and return safely.')
  if (active('ai.serverSide') && value('ai.serverSide') === false) warnings.push('AI provider calls are configured outside a trusted server boundary. Do not expose provider secrets or privileged context in browser/client code.')
  if (active('ai.grounding') && value('ai.grounding') === 'Model knowledge allowed broadly' && (value('ai.semanticSearch') === true || value('ai.documentAnalysis') === true || ['Government System', 'Clinic / EMR'].includes(config.appType))) warnings.push('AI is allowed to answer broadly from model knowledge where source-grounded product/document answers are safer. Ground factual workflow answers in authorized sources.')
  if (active('ai.citations') && value('ai.citations') === 'Off' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('AI source traceability is disabled for a high-accountability app type. Show source records/documents for factual AI-assisted answers.')
  if (active('ai.dataPolicy') && value('ai.dataPolicy') === 'Normal authorized data may be sent' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('AI may send normal authorized application data to external models in a sensitive app type. Minimize/redact or require an approved private data path.')
  if (active('ai.promptLogging') && value('ai.promptLogging') === 'Full prompts/responses' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Full AI prompts/responses are logged in a sensitive app type. This can duplicate protected data into observability storage.')
  if (active('ai.actionMode') && value('ai.actionMode') === 'Autonomous bounded actions' && value('ai.humanApproval') === 'Off') warnings.push('AI can act autonomously while human approval is disabled. Consequential actions should require review or be tightly bounded and reversible.')
  if (active('ai.permissionBoundary') && value('ai.permissionBoundary') === 'Broad service account') warnings.push('AI tools run through a broad service account. Apply caller/tenant/record permissions and explicit tool allowlists.')
  if (active('ai.promptInjection') && value('ai.promptInjection') === 'Basic prompt instruction' && value('ai.actionMode') !== 'Suggest only') warnings.push('AI has action capability with only basic prompt-injection handling. Treat retrieved/user content as untrusted data and constrain tool execution.')
  if (active('ai.destructiveActions') && value('ai.destructiveActions') === 'Allowed within permissions') warnings.push('AI is allowed to perform destructive actions directly. Keep deletion, irreversible financial, credential, and similarly destructive actions behind explicit human confirmation.')
  if (active('ai.structuredOutput') && value('ai.structuredOutput') === 'Free-form parsing' && (value('ai.extraction') === true || value('ai.classification') === true || value('ai.routing') === true)) warnings.push('Machine-consumed AI output is parsed from free-form text. Use structured/schema-validated output for extraction, classification, routing, and automation inputs.')
  if (active('security.csp') && value('security.csp') === 'Off') warnings.push('Content Security Policy is disabled. Keep an enforced or staged report-only CSP unless a documented platform limitation prevents it.')
  if (active('security.framePolicy') && value('security.framePolicy') === 'Allow framing') warnings.push('External framing is allowed broadly. This can enable clickjacking or deceptive embedding unless framing is an intentional product requirement.')
  if (active('security.csrf') && value('security.csrf') === 'Off' && value('login.enabled') === true) warnings.push('CSRF protection is disabled while authenticated state-changing requests may exist. Cookie-authenticated mutations need an explicit cross-site request defense.')
  if (active('security.cors') && value('security.cors') === 'Wildcard' && value('platform.api') !== 'None') warnings.push('CORS allows any origin while an API surface exists. Use an explicit trusted-origin policy instead of a wildcard for authenticated or sensitive APIs.')
  if (active('security.inputValidation') && value('security.inputValidation') === 'UI validation only') warnings.push('Security input validation is UI-only. Untrusted input must be validated again at the trusted server/action boundary.')
  if (active('security.sqlSafety') && value('security.sqlSafety') === 'Developer discretion') warnings.push('Database query safety is left to developer discretion. Use parameterized/ORM-safe queries as the default and review any raw-query escape hatch.')
  if (active('security.uploadValidation') && value('security.uploadValidation') === 'Extension check only') warnings.push('File uploads are validated by extension only. Validate actual content/type, size, filename/storage handling, and authorization as well.')
  if (active('security.malwareScan') && value('security.malwareScan') === 'Off' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Upload malware scanning is disabled for a sensitive document-heavy app type. Use risk-based or full scanning before files are broadly consumed.')
  if (active('security.errorDisclosure') && value('security.errorDisclosure') === 'Detailed errors') warnings.push('Production errors expose detailed internal information. Keep stack traces, paths, query details, and secrets in protected diagnostics instead.')
  if (active('security.debugMode') && value('security.debugMode') === 'Developer-controlled' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Production debug mode is only developer-controlled for a sensitive app. Enforce disabled debug/test endpoints through build or deploy configuration.')
  if (active('privacy.minimization') && value('privacy.minimization') === 'Collect useful extras' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('The app is configured to collect “useful extras” in a sensitive domain. Collect only fields tied to a defined operational/legal purpose.')
  if (active('privacy.analyticsData') && value('privacy.analyticsData') === 'Normal application fields allowed') warnings.push('Analytics may receive normal application fields. Avoid sending raw personal, clinical, financial, credential, or other sensitive values to telemetry providers.')
  if (active('privacy.cookies') && value('privacy.cookies') === 'No explicit categories' && value('platform.analytics') !== 'Off') warnings.push('Analytics is enabled without an explicit necessary-vs-optional cookie/tracker policy. Separate nonessential tracking and honor the chosen consent model.')
  if (active('privacy.retention') && value('privacy.retention') === 'Manual only' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Sensitive-data retention is manual only. Turn the retention policy into a repeatable cleanup/archive process with hold exceptions.')
  if (active('privacy.thirdPartyMin') && value('privacy.thirdPartyMin') === 'Full convenient objects') warnings.push('Integrations receive whole convenient objects. Minimize outbound payloads to the fields required for each provider/purpose.')
  if (active('privacy.adminAccessAudit') && value('privacy.adminAccessAudit') === 'Edits only' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Sensitive-record viewing/export is not audited beyond edits. Consider logging privileged access to high-sensitivity records and exports.')
  if (active('a11y.target') && ['WCAG AA', 'WCAG AAA target'].includes(String(value('quality.accessibility'))) && ['Basic best practices', 'WCAG 2.2 A'].includes(String(value('a11y.target')))) warnings.push('The detailed accessibility target is below the selected high-level WCAG AA-or-better posture.')
  if (active('a11y.labels') && value('a11y.labels') === 'Placeholder may substitute') warnings.push('Placeholders are allowed to substitute for form labels. Use persistent programmatic labels so instructions remain available after users type.')
  if (active('a11y.nonColor') && value('a11y.nonColor') === 'Color may carry meaning') warnings.push('Important status/selection meaning may rely on color alone. Add text, icons, patterns, or another non-color cue.')
  if (active('a11y.reducedMotion') && value('a11y.reducedMotion') === 'Ignore preference') warnings.push('Reduced-motion preference is ignored. Respect it and provide a simpler/nonessential-motion-off presentation.')
  if (active('a11y.dragAlternative') && value('a11y.dragAlternative') === 'Drag may be required') warnings.push('Some workflows may require dragging with no alternative. Provide button/menu/keyboard alternatives for drag-based actions.')
  if (active('a11y.charts') && value('a11y.charts') === 'Chart only') warnings.push('Important chart information has no accessible data/summary alternative. Provide the underlying values or an equivalent textual summary.')
  if (active('seo.enabled') && value('seo.enabled') === true && value('app.accessShape') === 'Private') warnings.push('SEO/indexing is enabled for an overall Private product. Limit indexing to intentionally public pre-login pages and keep protected routes authenticated/noindex.')
  if (active('seo.privateNoindex') && value('seo.privateNoindex') === 'Rely on robots only') warnings.push('Private/nonpublic pages rely on robots.txt alone. Robots is crawl guidance, not an access-control or guaranteed noindex boundary.')
  if (active('seo.statusCodes') && value('seo.statusCodes') === 'Client-side content only') warnings.push('Public error/redirect pages may return misleading success responses. Use correct HTTP 404/410/redirect/success status codes.')
  if (active('perf.gracefulDegradation') && value('perf.gracefulDegradation') === 'Whole page may fail' && value('perf.availability') !== 'Best effort') warnings.push('The app has a production availability expectation but secondary dependency failure may take down whole pages. Define graceful degradation for non-core services.')
  if (active('perf.healthChecks') && value('perf.healthChecks') === 'Process-only health' && value('perf.availability') === 'High availability / 24x7 critical') warnings.push('Health checks only verify that the process exists while the app is marked high availability. Include dependency readiness/degraded-state signals.')
  if (active('obs.redaction') && value('obs.redaction') === 'Developer discretion' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Sensitive log redaction is left to developer discretion. Use explicit redaction/allowlisted telemetry fields for high-sensitivity workflows.')
  if (active('obs.uptime') && value('obs.uptime') === 'Off' && value('perf.availability') === 'High availability / 24x7 critical') warnings.push('The app is marked high availability but has no external uptime check. Add at least an external entry/health probe.')
  if (active('obs.alerting') && value('obs.alerting') === 'Manual dashboard checking' && value('perf.availability') === 'High availability / 24x7 critical') warnings.push('A high-availability product relies on manual dashboard checking for incidents. Add actionable alerts for critical failure/latency symptoms.')
  if (active('recovery.offsite') && value('recovery.offsite') === 'Same service only') warnings.push('All backups remain in the same service/failure domain as production. A provider/account-level incident could remove both live data and recovery copies.')
  if (active('recovery.restoreTest') && value('recovery.restoreTest') === 'Only during real incident' && ['Government System', 'Clinic / EMR', 'Booking / Scheduling', 'E-commerce'].includes(config.appType)) warnings.push('Restore capability is untested until a real incident. Periodically prove that production backups can actually be restored.')
  if (active('recovery.deleteProtection') && value('recovery.deleteProtection') === 'Normal admin can delete' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Normal administrators can delete recovery copies for a sensitive app. Separate backup-deletion permissions or use retention/immutability controls.')
  if (active('recovery.rpo') && value('recovery.rpo') === 'Up to 7 days' && ['Government System', 'Clinic / EMR', 'Booking / Scheduling', 'E-commerce'].includes(config.appType)) warnings.push('The recovery point allows up to seven days of data loss for an operational/transactional app. Revisit backup frequency/PITR expectations.')
  if (active('eng.environments') && value('eng.environments') === 'Single environment' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Development/testing and production share one environment for a sensitive app. Separate nonproduction work from live data/services.')
  if (active('eng.secretSeparation') && value('eng.secretSeparation') === 'Shared credentials') warnings.push('Environment credentials are shared. Use separate production credentials so a dev/staging compromise or mistake cannot directly reach production services.')
  if (active('eng.migrations') && value('eng.migrations') === 'Manual schema edits') warnings.push('Production schema changes are manual. Use versioned migrations so environments can be reproduced and reviewed consistently.')
  if (active('eng.migrationGate') && value('eng.migrationGate') === 'Deploy automatically always' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('All schema/data migrations deploy automatically in a sensitive app. Gate risky/destructive migrations with review plus backup/rollback planning.')
  if (active('eng.deployStrategy') && value('eng.deployStrategy') === 'Stop-build-start' && value('eng.zeroDowntime') === 'Required for routine deploys') warnings.push('Deployment uses stop-build-start while routine releases require zero downtime. Use an atomic/rolling/blue-green deployment strategy instead.')
  if (active('eng.branchProtection') && value('eng.branchProtection') === 'Direct pushes allowed' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Direct pushes are allowed to the production branch for a sensitive app. Require passing checks/review through a protected release path.')
  if (active('eng.offlineConflict') && value('eng.offlineConflict') === 'Last write wins silently') warnings.push('Offline writes can overwrite newer server data silently. Surface conflicts/retries or define a domain-specific merge/review rule.')
  if (active('test.authz') && value('test.authz') === 'Manual spot checks' && ['Government System', 'Clinic / EMR', 'SaaS / Client Portal'].includes(config.appType)) warnings.push('Authorization is protected only by manual spot checks in a role/tenant-sensitive app. Automate representative forbidden cross-role/tenant/ownership cases.')
  if (active('test.payment') && value('test.payment') === 'Happy path only') warnings.push('Payments are tested only on the happy path. Include failure, pending, webhook duplicate/delay, cancellation/refund, and reconciliation scenarios.')
  if (active('test.migrations') && value('test.migrations') === 'Production first') warnings.push('Database migrations are applied to production before a representative test database. Validate migrations against prior schema/data states first.')
  if (active('test.testData') && value('test.testData') === 'Production copies allowed' && ['Government System', 'Clinic / EMR'].includes(config.appType)) warnings.push('Production sensitive data may be copied into nonproduction testing. Prefer synthetic or explicitly anonymized/approved datasets.')
  if (active('test.browser') && value('test.browser') === 'Chromium only' && ['Portfolio / Marketing', 'E-commerce', 'Booking / Scheduling', 'Directory / Marketplace'].includes(config.appType)) warnings.push('A public/customer-facing web product is tested only on Chromium. Include Safari/Firefox/Edge as appropriate to the audience.')
  const scale = resolvedOperationalScale(config)
  if (['Government System', 'Clinic / EMR'].includes(config.appType) && scale === 'Lean') warnings.push(`${config.appType} is using Lean operational scale. Confirm that reduced recovery, observability, and release controls are appropriate for the real operational impact.`)
  if (['Portfolio / Marketing', 'Tournament / Event'].includes(config.appType) && ['High scale', 'Mission critical'].includes(scale)) warnings.push(`${config.appType} is using ${scale} operational scale. Confirm the stronger operations/recovery requirements are justified rather than accidental overengineering.`)
  return warnings
}

export const visibleConfigSettings = (config: ProjectConfig, includeAdvanced = true) => configSettings.filter((setting) => conditionMatches(setting.dependsOn, config) && (includeAdvanced || !setting.advanced))
