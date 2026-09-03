import { configSettings, configWarnings, type ProjectConfig } from './configurator'

export type ReviewSeverity = 'advisory' | 'review' | 'important' | 'blocker'
export type ReviewCategory = 'scope' | 'security' | 'reliability' | 'data' | 'privacy' | 'accessibility' | 'usability' | 'architecture' | 'operations' | 'testing'

export type ReviewSignal = {
  id: string
  severity: ReviewSeverity
  category: ReviewCategory
  title: string
  detail: string
  affectedSettings: string[]
  suggestedFixId?: string
}

type ReviewRule = {
  id: string
  match: RegExp
  severity: ReviewSeverity
  category: ReviewCategory
  title: string
  affectedSettings?: string[]
  suggestedFixId?: string
}

/**
 * v0.21 compatibility bridge.
 *
 * The existing warning predicates remain in configurator.ts so v0.20 backups/tests and
 * downstream callers keep working. This module turns those predicates into a typed,
 * severity-aware contract. Readiness and exports consume ReviewSignal from here instead
 * of trying to infer risk directly from free-form text.
 *
 * New review rules should be added here with explicit severity/category metadata. A
 * fallback remains intentionally conservative for older warning text that has not yet
 * received dedicated metadata.
 */
const rules: ReviewRule[] = [
  { id: 'scope-required-off', match: /explicitly Off but required by/i, severity: 'blocker', category: 'scope', title: 'Required scope is explicitly disabled' },
  { id: 'admin-without-login', match: /Admin panel is enabled while login is disabled/i, severity: 'blocker', category: 'security', title: 'Admin surface has no authentication boundary', affectedSettings: ['admin.enabled', 'login.enabled'], suggestedFixId: 'protect-admin' },
  { id: 'permissions-ui-only', match: /Permissions are configured as UI-only checks/i, severity: 'blocker', category: 'security', title: 'Authorization is enforced only in the UI', affectedSettings: ['permissions.enforcement'], suggestedFixId: 'server-authz' },
  { id: 'tenant-isolation-cosmetic', match: /Multi-tenant mode is using shared\/cosmetic tenant scope/i, severity: 'blocker', category: 'security', title: 'Tenant isolation is cosmetic', affectedSettings: ['org.mode', 'org.tenantIsolation'] },
  { id: 'product-shared-runtime-org-boundary', match: /Shared multi-tenant deployment is selected, but Organization \/ team model is not Multi-tenant organizations/i, severity: 'blocker', category: 'architecture', title: 'Shared runtime lacks a first-class tenant boundary', affectedSettings: ['product.reuseIntent', 'product.deploymentModel', 'org.mode'], suggestedFixId: 'product-multi-tenant-boundary' },
  { id: 'product-query-filter-isolation', match: /Reusable shared-tenant architecture relies on application query filters only/i, severity: 'blocker', category: 'security', title: 'Tenant isolation relies on application query discipline', affectedSettings: ['product.deploymentModel', 'product.isolationStrategy'], suggestedFixId: 'product-data-boundary' },
  { id: 'reporting-bypasses-permissions', match: /Reports are configured to bypass source permissions/i, severity: 'blocker', category: 'security', title: 'Reports bypass source authorization', affectedSettings: ['reporting.permissions'] },
  { id: 'booking-conflict-ui-only', match: /Booking conflict prevention is UI-only/i, severity: 'blocker', category: 'reliability', title: 'Booking conflicts are not enforced atomically', affectedSettings: ['booking.conflictPolicy'], suggestedFixId: 'booking-atomic' },
  { id: 'booking-payment-scope-mismatch', match: /Booking requires payment, but the Payments & money pack is disabled/i, severity: 'blocker', category: 'scope', title: 'Booking requires a disabled payment capability', affectedSettings: ['booking.paymentPolicy', 'pack.payments'] },
  { id: 'payment-browser-authority', match: /Payment success trusts the browser return\/redirect/i, severity: 'blocker', category: 'reliability', title: 'Payment success trusts the browser', affectedSettings: ['payments.verification'], suggestedFixId: 'payment-authority' },
  { id: 'payment-webhook-not-idempotent', match: /payment confirmation is enabled without duplicate-event protection/i, severity: 'blocker', category: 'reliability', title: 'Payment confirmation is not idempotent', affectedSettings: ['payments.verification', 'payments.webhookIdempotency'] },
  { id: 'subscriptions-without-payments', match: /Subscriptions & SaaS billing is enabled while Payments & money is disabled/i, severity: 'blocker', category: 'scope', title: 'Subscription billing has no payment capability', affectedSettings: ['pack.subscriptions', 'pack.payments'] },
  { id: 'clinic-public-boundary', match: /Clinic & EMR is enabled while the overall product is Public/i, severity: 'blocker', category: 'privacy', title: 'Clinical scope crosses a public boundary', affectedSettings: ['pack.clinic', 'app.accessShape'] },
  { id: 'clinic-broad-access', match: /Clinical records are broadly visible to staff/i, severity: 'blocker', category: 'privacy', title: 'Clinical record access is too broad', affectedSettings: ['clinic.recordAccess'] },
  { id: 'protected-files-public', match: /Protected operational files are configured with permanent public URLs/i, severity: 'blocker', category: 'security', title: 'Protected files use permanent public URLs', affectedSettings: ['storage.access'] },
  { id: 'collab-trust-channel', match: /Chat-triggered actions trust channel membership/i, severity: 'blocker', category: 'security', title: 'External chat membership substitutes for authorization', affectedSettings: ['collab.actionsAuth'] },
  { id: 'automation-system-wide', match: /Automations run with system-wide privileges/i, severity: 'blocker', category: 'security', title: 'Automations have system-wide privileges', affectedSettings: ['automation.permissionModel'] },
  { id: 'automation-secrets-config', match: /Automation credentials are stored in workflow configuration values/i, severity: 'blocker', category: 'security', title: 'Automation secrets are stored in workflow config', affectedSettings: ['automation.credentials'] },
  { id: 'ai-client-boundary', match: /AI provider calls are configured outside a trusted server boundary/i, severity: 'blocker', category: 'security', title: 'AI provider calls leave the trusted server boundary', affectedSettings: ['ai.serverSide'] },
  { id: 'ai-broad-service-account', match: /AI tools run through a broad service account/i, severity: 'blocker', category: 'security', title: 'AI tools bypass caller-scoped authorization', affectedSettings: ['ai.permissionBoundary'] },
  { id: 'ai-destructive-actions', match: /AI is allowed to perform destructive actions directly/i, severity: 'blocker', category: 'security', title: 'AI can perform destructive actions directly', affectedSettings: ['ai.destructiveActions'] },
  { id: 'csrf-disabled', match: /CSRF protection is disabled/i, severity: 'blocker', category: 'security', title: 'Authenticated mutations have no CSRF defense', affectedSettings: ['security.csrf'], suggestedFixId: 'enable-csrf' },
  { id: 'security-ui-validation', match: /Security input validation is UI-only/i, severity: 'blocker', category: 'security', title: 'Security validation trusts the client', affectedSettings: ['security.inputValidation'] },
  { id: 'production-sensitive-test-data', match: /Production sensitive data may be copied into nonproduction testing/i, severity: 'blocker', category: 'privacy', title: 'Sensitive production data can enter nonproduction', affectedSettings: ['test.testData'] },

  { id: 'password-no-restrictions', match: /Password policy is set to “No restrictions/i, severity: 'important', category: 'security', title: 'Password policy has no baseline restrictions', affectedSettings: ['login.passwordPolicy'] },
  { id: 'password-blocklist-off', match: /Common\/compromised password blocking is disabled/i, severity: 'important', category: 'security', title: 'Compromised-password blocking is disabled', affectedSettings: ['password.blocklist'] },
  { id: 'security-questions', match: /Security questions are enabled for account recovery/i, severity: 'important', category: 'security', title: 'Weak knowledge-based recovery is enabled', affectedSettings: ['recovery.securityQuestions'] },
  { id: 'login-risky-throttling', match: /Failed sign-in protection is set to a risky mode/i, severity: 'important', category: 'security', title: 'Sign-in abuse protection is risky', affectedSettings: ['login.rateLimit'] },
  { id: 'allow-by-default', match: /Authorization is configured to allow by default/i, severity: 'important', category: 'security', title: 'Authorization defaults to allow', affectedSettings: ['permissions.defaultPolicy'], suggestedFixId: 'deny-default' },
  { id: 'temporary-password-no-change', match: /temporary passwords are allowed without a first-login replacement/i, severity: 'important', category: 'security', title: 'Temporary passwords do not force replacement', affectedSettings: ['password.temporary'] },
  { id: 'sensitive-audit-off', match: /normally needs an audit trail/i, severity: 'important', category: 'operations', title: 'Sensitive operations lack an audit trail', affectedSettings: ['quality.audit'] },
  { id: 'sensitive-hard-delete', match: /Hard delete is risky for this app type/i, severity: 'important', category: 'data', title: 'Sensitive records use destructive deletion', affectedSettings: ['records.delete'], suggestedFixId: 'safe-delete' },
  { id: 'server-validation-off', match: /Server-side form validation is disabled/i, severity: 'important', category: 'security', title: 'Forms trust client-side validation', affectedSettings: ['forms.serverValidation'] },
  { id: 'db-uniqueness-missing', match: /Uniqueness is enforced only in application validation/i, severity: 'important', category: 'data', title: 'Uniqueness is not enforced at the data boundary', affectedSettings: ['data.uniqueRules'] },
  { id: 'operational-last-write-wins', match: /Concurrent edits use last-write-wins for an operational app/i, severity: 'important', category: 'data', title: 'Concurrent edits can silently overwrite work', affectedSettings: ['data.optimisticLock'] },
  { id: 'workflow-unrestricted', match: /Workflow transitions are unrestricted/i, severity: 'important', category: 'data', title: 'Workflow state transitions are not constrained', affectedSettings: ['workflow.restrictedTransitions'] },
  { id: 'import-no-preview', match: /Bulk import is enabled without a validation preview/i, severity: 'important', category: 'data', title: 'Bulk imports commit without review', affectedSettings: ['imports.preview'] },
  { id: 'inventory-negative-silent', match: /Inventory can go negative silently/i, severity: 'important', category: 'data', title: 'Inventory can become negative silently', affectedSettings: ['inventory.negative'] },
  { id: 'listing-instant-claim', match: /Listings can be claimed instantly without owner verification/i, severity: 'important', category: 'security', title: 'Listing ownership can be claimed without verification', affectedSettings: ['directory.claim', 'directory.verification'] },
  { id: 'public-internal-routing', match: /Public tracking is configured to expose internal routing details/i, severity: 'important', category: 'privacy', title: 'Public tracking exposes internal routing', affectedSettings: ['government.publicTracking'] },
  { id: 'api-idempotency-off', match: /External API mutations are not idempotent/i, severity: 'important', category: 'reliability', title: 'Retryable API mutations can duplicate side effects', affectedSettings: ['api.idempotency'] },
  { id: 'webhook-unsigned', match: /Outgoing webhooks are unsigned/i, severity: 'important', category: 'security', title: 'Outgoing webhook authenticity is unverifiable', affectedSettings: ['webhook.signing'], suggestedFixId: 'sign-webhooks' },
  { id: 'webhook-unverified', match: /Incoming webhook signature verification is disabled/i, severity: 'important', category: 'security', title: 'Incoming webhooks are not authenticated', affectedSettings: ['webhook.verifyIncoming'], suggestedFixId: 'verify-webhooks' },
  { id: 'webhook-not-idempotent', match: /Incoming webhooks are not idempotent/i, severity: 'important', category: 'reliability', title: 'Webhook retries can duplicate side effects', affectedSettings: ['webhook.idempotency'], suggestedFixId: 'idempotent-webhooks' },
  { id: 'webhook-no-retry', match: /Outgoing webhooks are configured with no retry/i, severity: 'important', category: 'reliability', title: 'Transient webhook delivery failures are permanent', affectedSettings: ['webhook.retry'] },
  { id: 'sensitive-email', match: /Sensitive workflow details are configured to appear directly in email/i, severity: 'important', category: 'privacy', title: 'Sensitive details are exposed in email', affectedSettings: ['email.sensitiveContent'] },
  { id: 'sensitive-sms', match: /Sensitive workflow details are configured to appear directly in SMS/i, severity: 'important', category: 'privacy', title: 'Sensitive details are exposed in SMS', affectedSettings: ['sms.sensitiveContent'] },
  { id: 'automation-no-approval', match: /Automation can perform broad actions without a human-approval policy/i, severity: 'important', category: 'security', title: 'Broad automation has no approval boundary', affectedSettings: ['automation.approval', 'automation.actions'] },
  { id: 'automation-no-dedupe', match: /Side-effecting automations have no event deduplication/i, severity: 'important', category: 'reliability', title: 'Automation retries can duplicate actions', affectedSettings: ['automation.dedupe'] },
  { id: 'ai-sensitive-data', match: /AI may send normal authorized application data to external models/i, severity: 'important', category: 'privacy', title: 'Sensitive app data may be sent to external AI', affectedSettings: ['ai.dataPolicy'] },
  { id: 'ai-full-prompt-logging', match: /Full AI prompts\/responses are logged in a sensitive app type/i, severity: 'important', category: 'privacy', title: 'Sensitive AI content is duplicated into logs', affectedSettings: ['ai.promptLogging'] },
  { id: 'ai-autonomous-no-approval', match: /AI can act autonomously while human approval is disabled/i, severity: 'important', category: 'security', title: 'Autonomous AI has no human-approval boundary', affectedSettings: ['ai.actionMode', 'ai.humanApproval'] },
  { id: 'ai-prompt-injection-basic', match: /AI has action capability with only basic prompt-injection handling/i, severity: 'important', category: 'security', title: 'Action-capable AI has weak prompt-injection controls', affectedSettings: ['ai.promptInjection', 'ai.actionMode'] },
  { id: 'csp-off', match: /Content Security Policy is disabled/i, severity: 'important', category: 'security', title: 'Content Security Policy is disabled', affectedSettings: ['security.csp'], suggestedFixId: 'enable-csp' },
  { id: 'cors-wildcard', match: /CORS allows any origin while an API surface exists/i, severity: 'important', category: 'security', title: 'API CORS policy trusts any origin', affectedSettings: ['security.cors', 'platform.api'] },
  { id: 'upload-extension-only', match: /File uploads are validated by extension only/i, severity: 'important', category: 'security', title: 'Upload validation trusts filename extensions', affectedSettings: ['security.uploadValidation'] },
  { id: 'production-detailed-errors', match: /Production errors expose detailed internal information/i, severity: 'important', category: 'security', title: 'Production errors disclose internal details', affectedSettings: ['security.errorDisclosure'] },
  { id: 'privacy-analytics-fields', match: /Analytics may receive normal application fields/i, severity: 'important', category: 'privacy', title: 'Analytics can receive application data', affectedSettings: ['privacy.analyticsData'] },
  { id: 'backup-same-failure-domain', match: /All backups remain in the same service\/failure domain as production/i, severity: 'important', category: 'reliability', title: 'Backups share the production failure domain', affectedSettings: ['recovery.offsite'] },
  { id: 'restore-untested', match: /Restore capability is untested until a real incident/i, severity: 'important', category: 'reliability', title: 'Backup restoration has never been proven', affectedSettings: ['recovery.restoreTest'] },
  { id: 'backup-admin-delete', match: /Normal administrators can delete recovery copies/i, severity: 'important', category: 'reliability', title: 'Routine admins can delete recovery copies', affectedSettings: ['recovery.deleteProtection'] },
  { id: 'rpo-seven-days', match: /recovery point allows up to seven days of data loss/i, severity: 'important', category: 'reliability', title: 'Recovery point allows excessive data loss', affectedSettings: ['recovery.rpo'] },
  { id: 'shared-production-credentials', match: /Environment credentials are shared/i, severity: 'important', category: 'security', title: 'Production credentials are shared with nonproduction', affectedSettings: ['eng.secretSeparation'], suggestedFixId: 'separate-secrets' },
  { id: 'manual-production-schema', match: /Production schema changes are manual/i, severity: 'important', category: 'operations', title: 'Production schema changes are not versioned', affectedSettings: ['eng.migrations'] },
  { id: 'sensitive-direct-push', match: /Direct pushes are allowed to the production branch for a sensitive app/i, severity: 'important', category: 'operations', title: 'Sensitive production code can bypass review checks', affectedSettings: ['eng.branchProtection'] },
  { id: 'offline-silent-overwrite', match: /Offline writes can overwrite newer server data silently/i, severity: 'important', category: 'data', title: 'Offline sync can silently overwrite newer data', affectedSettings: ['eng.offlineConflict'] },
  { id: 'authz-manual-tests', match: /Authorization is protected only by manual spot checks/i, severity: 'important', category: 'testing', title: 'Authorization boundaries lack automated regression tests', affectedSettings: ['test.authz'] },
  { id: 'payment-happy-path-tests', match: /Payments are tested only on the happy path/i, severity: 'important', category: 'testing', title: 'Payment failure modes are untested', affectedSettings: ['test.payment'] },
  { id: 'migration-production-first', match: /Database migrations are applied to production before a representative test database/i, severity: 'important', category: 'testing', title: 'Database migrations are proven in production first', affectedSettings: ['test.migrations'] },
  { id: 'sensitive-lean-scale', match: /(Government System|Clinic \/ EMR) is using Lean operational scale/i, severity: 'important', category: 'operations', title: 'Operational scale may understate real-world impact' },
  { id: 'product-tenant-forks', match: /Reusable product architecture allows per-tenant code forks/i, severity: 'important', category: 'architecture', title: 'Tenant-specific code forks undermine product reuse', affectedSettings: ['product.sharedCore'], suggestedFixId: 'product-shared-core' },
  { id: 'product-version-branches', match: /Reusable product architecture allows tenant-version branches/i, severity: 'important', category: 'operations', title: 'Tenant-specific versions create upgrade drift', affectedSettings: ['product.versioning'], suggestedFixId: 'product-shared-version' },

  { id: 'product-runtime-plugins', match: /Runtime tenant plugin loading is selected/i, severity: 'review', category: 'architecture', title: 'Runtime plugins add a new trust and compatibility boundary', affectedSettings: ['product.extensionStrategy'] },
  { id: 'product-manual-provisioning', match: /multi-organization product still requires developer\/manual setup/i, severity: 'review', category: 'operations', title: 'Tenant onboarding still depends on developer work', affectedSettings: ['product.provisioning'] },
  { id: 'product-fixed-modules', match: /Reusable product architecture uses one fixed module set/i, severity: 'review', category: 'architecture', title: 'Reusable product has no tenant module flexibility', affectedSettings: ['product.moduleModel'] },
  { id: 'product-white-label-branding', match: /White-label product intent is selected while branding remains product-only/i, severity: 'review', category: 'scope', title: 'White-label intent conflicts with branding depth', affectedSettings: ['product.reuseIntent', 'product.brandingDepth'] },
  { id: 'password-legacy-policy', match: /Legacy password composition rules|Password character-composition rules|Periodic or scheduled password rotation/i, severity: 'review', category: 'security', title: 'Password policy uses a legacy/compliance pattern' },
  { id: 'password-manager-hostile', match: /Password-manager compatibility is disabled|Paste is disabled in password fields/i, severity: 'review', category: 'usability', title: 'Password flow interferes with password managers' },
  { id: 'account-enumeration', match: /Login errors reveal specific account state/i, severity: 'review', category: 'security', title: 'Login responses reveal account state', affectedSettings: ['login.genericErrors'] },
  { id: 'accessibility-below-aa', match: /configured below the recommended WCAG AA accessibility target/i, severity: 'review', category: 'accessibility', title: 'Accessibility target is below the app baseline', affectedSettings: ['quality.accessibility'] },
  { id: 'offline-without-pwa', match: /Offline write \+ sync is selected without an installable PWA/i, severity: 'review', category: 'architecture', title: 'Offline-write architecture needs explicit support', affectedSettings: ['platform.offline', 'platform.pwa'] },
  { id: 'private-public-landing', match: /marked Private but still has a dedicated public landing page/i, severity: 'review', category: 'scope', title: 'Private product includes a public landing surface', affectedSettings: ['app.accessShape', 'landing.enabled'] },
  { id: 'public-seo-auto-off', match: /public website but search-engine discoverability is still Auto → Off/i, severity: 'review', category: 'scope', title: 'Public website is not discoverable by default', affectedSettings: ['seo.enabled'] },
  { id: 'entry-destination-disabled', match: /Default entry destination is .* but .* is disabled/i, severity: 'review', category: 'scope', title: 'Start destination points to a disabled surface', affectedSettings: ['app.startDestination'] },
  { id: 'modal-policy-conflict', match: /Modal policy says to avoid modals/i, severity: 'review', category: 'usability', title: 'Form presentation conflicts with modal policy', affectedSettings: ['ux.modalPolicy', 'ux.formOverlay'] },
  { id: 'synthetic-proof', match: /Synthetic proof placeholders are allowed/i, severity: 'review', category: 'usability', title: 'Synthetic proof must remain visibly non-production', affectedSettings: ['content.fakeProof'] },
  { id: 'pwa-cue-disabled', match: /Landing page shows a PWA install cue/i, severity: 'review', category: 'scope', title: 'Install cue points to a disabled PWA', affectedSettings: ['landing.appBadges', 'platform.pwa'] },
  { id: 'fees-not-itemized', match: /Additional fees are enabled but are not itemized early/i, severity: 'review', category: 'usability', title: 'Additional fees are disclosed too late', affectedSettings: ['payments.feeDisplay', 'payments.fees'] },
  { id: 'push-first-visit', match: /Push permission is requested on first visit/i, severity: 'advisory', category: 'usability', title: 'Push permission is requested before user intent', affectedSettings: ['push.permissionTiming'] },
  { id: 'location-on-load', match: /Location permission is requested on page load/i, severity: 'advisory', category: 'privacy', title: 'Location permission is requested before user intent', affectedSettings: ['maps.permissionTiming'] },
  { id: 'accessibility-family', match: /accessibility|form labels|color alone|Reduced-motion|dragging with no alternative|chart information has no accessible/i, severity: 'review', category: 'accessibility', title: 'Accessibility behavior needs review' },
  { id: 'seo-family', match: /SEO\/indexing|robots\.txt|HTTP 404\/410|noindex/i, severity: 'review', category: 'architecture', title: 'Public/private indexing behavior needs review' },
  { id: 'availability-family', match: /availability expectation|Health checks|uptime check|dashboard checking for incidents/i, severity: 'review', category: 'reliability', title: 'Operational availability controls need review' },
  { id: 'privacy-family', match: /Sensitive|privacy|personal|clinical context|data retention|outbound payloads|cookie\/tracker/i, severity: 'review', category: 'privacy', title: 'Privacy boundary needs review' },
  { id: 'ai-family', match: /^AI |AI is |AI source|Machine-consumed AI/i, severity: 'review', category: 'architecture', title: 'AI safety or grounding behavior needs review' },
  { id: 'security-family', match: /password|authorization|security|CSP|framing|clickjacking|CORS|CSRF|malware|debug mode|query safety/i, severity: 'review', category: 'security', title: 'Security posture needs review' },
  { id: 'reliability-family', match: /retry|webhook|backup|restore|recovery|incident|deployment|zero downtime|migration|offline|availability/i, severity: 'review', category: 'reliability', title: 'Reliability or recovery posture needs review' },
  { id: 'testing-family', match: /tested|testing|test database|browser/i, severity: 'review', category: 'testing', title: 'Validation coverage needs review' },
  { id: 'data-family', match: /data|record|inventory|workflow|duplicate|concurrent|import|transaction/i, severity: 'review', category: 'data', title: 'Data integrity behavior needs review' },
  { id: 'operations-family', match: /production|deploy|environment|operational scale|schema/i, severity: 'review', category: 'operations', title: 'Operational posture needs review' },
]

const titleForFallback = (detail: string) => {
  const first = detail.split(/[.!?](?:\s|$)/)[0]?.trim() || 'Configuration needs review'
  return first.length <= 72 ? first : `${first.slice(0, 69).trimEnd()}…`
}

const stableHash = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

const inferredAffectedSettings = (detail: string) => {
  const normalized = detail.toLowerCase()
  return configSettings
    .filter((setting) => setting.label.length >= 5 && normalized.includes(setting.label.toLowerCase()))
    .map((setting) => setting.id)
}

const scopeConflictSetting = (detail: string) => {
  if (!/explicitly Off but required by/i.test(detail)) return []
  const setting = configSettings.find((item) => detail.toLowerCase().startsWith(item.label.toLowerCase()))
  return setting ? [setting.id] : []
}

export function reviewSignalFromWarning(detail: string): ReviewSignal {
  const rule = rules.find((candidate) => candidate.match.test(detail))
  const affectedSettings = Array.from(new Set([
    ...(rule?.affectedSettings ?? []),
    ...scopeConflictSetting(detail),
    ...inferredAffectedSettings(detail),
  ]))

  return {
    id: rule?.id ?? `review-${stableHash(detail)}`,
    severity: rule?.severity ?? 'review',
    category: rule?.category ?? 'architecture',
    title: rule?.title ?? titleForFallback(detail),
    detail,
    affectedSettings,
    ...(rule?.suggestedFixId ? { suggestedFixId: rule.suggestedFixId } : {}),
  }
}

export function configReviewSignals(config: ProjectConfig): ReviewSignal[] {
  const seen = new Set<string>()
  return configWarnings(config).map(reviewSignalFromWarning).filter((signal) => {
    const key = `${signal.id}:${signal.detail}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function reviewSignalCounts(signals: ReviewSignal[]) {
  return signals.reduce((counts, signal) => {
    counts[signal.severity] += 1
    return counts
  }, { advisory: 0, review: 0, important: 0, blocker: 0 } as Record<ReviewSeverity, number>)
}
