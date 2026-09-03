import type { Capability } from './capabilities'
import type { Pattern } from './catalog'
import { effectiveConfigValue, resolveScope, type ProjectConfig } from './configurator'

export type LayerApplicability = {
  compatible: boolean
  reason: string
}

const on = (config: ProjectConfig, id: string) => resolveScope(config, id).active
const value = (config: ProjectConfig, id: string) => effectiveConfigValue(config, id)
const notOff = (input: unknown) => {
  const text = String(input ?? '').trim().toLowerCase()
  return !['off', 'none', 'no', 'disabled', 'manual only', 'no special support'].includes(text)
}

export function capabilityApplicability(capability: Capability, config: ProjectConfig): LayerApplicability {
  const requireScope = (id: string, label: string): LayerApplicability => on(config, id)
    ? { compatible: true, reason: `${label} is active in App Setup.` }
    : { compatible: false, reason: `${label} is inactive in App Setup.` }

  switch (capability.id) {
    case 'auth': return requireScope('login.enabled', 'Authentication')
    case 'rbac': return requireScope('roles.level', 'Roles & permissions')
    case 'fine-permissions': return String(value(config, 'roles.level')) === 'Fine-grained permissions'
      ? { compatible: true, reason: 'Fine-grained permissions are active in App Setup.' }
      : { compatible: false, reason: `Roles & permissions is set to ${String(value(config, 'roles.level'))}.` }
    case 'sso': return on(config, 'login.enabled') && notOff(value(config, 'login.enterpriseSso'))
      ? { compatible: true, reason: 'Enterprise SSO is active in App Setup.' }
      : { compatible: false, reason: 'Enterprise SSO is Off in App Setup.' }
    case 'user-invites': return ['Invite only', 'Admin created'].includes(String(value(config, 'registration.mode')))
      ? { compatible: true, reason: 'Invite-based registration is active.' }
      : { compatible: false, reason: `Registration is ${String(value(config, 'registration.mode'))}.` }
    case 'crud': return requireScope('records.crud', 'Record CRUD')
    case 'search': return requireScope('search.level', 'Search')
    case 'filters':
    case 'sorting':
    case 'pagination': return requireScope('records.crud', 'Record collections')
    case 'bulk-actions': return on(config, 'records.crud') && value(config, 'records.bulkActions') === true
      ? { compatible: true, reason: 'Bulk actions are enabled in App Setup.' }
      : { compatible: false, reason: 'Bulk actions are disabled in App Setup.' }
    case 'soft-delete': return on(config, 'records.crud') && notOff(value(config, 'data.softDelete'))
      ? { compatible: true, reason: 'Recoverable deletion is active.' }
      : { compatible: false, reason: 'Soft-delete behavior is Off or records are inactive.' }
    case 'version-history': return on(config, 'records.crud') && notOff(value(config, 'data.versionHistory'))
      ? { compatible: true, reason: 'Record history is active.' }
      : { compatible: false, reason: 'Record version history is Off or records are inactive.' }
    case 'status-workflow': return requireScope('workflow.enabled', 'Workflow')
    case 'approval': return requireScope('approval.enabled', 'Approvals')
    case 'assignment': return on(config, 'workflow.enabled') && notOff(value(config, 'workflow.assignment'))
      ? { compatible: true, reason: 'Workflow assignment is active.' }
      : { compatible: false, reason: 'Workflow assignment is Off or workflow is inactive.' }
    case 'state-machine': return on(config, 'workflow.enabled') && value(config, 'workflow.model') === 'Rules-based state machine'
      ? { compatible: true, reason: 'Rules-based workflow is active.' }
      : { compatible: false, reason: 'App Setup does not request a formal rules-based state machine.' }
    case 'sla': return on(config, 'workflow.enabled') && notOff(value(config, 'workflow.sla'))
      ? { compatible: true, reason: 'SLA/aging tracking is active.' }
      : { compatible: false, reason: 'SLA / turnaround tracking is Off.' }
    case 'file-upload':
    case 'image-processing': return requireScope('attachments.enabled', 'File attachments')
    case 'rich-text': return on(config, 'forms.enabled') && notOff(value(config, 'forms.richText'))
      ? { compatible: true, reason: 'Rich text is active in App Setup.' }
      : { compatible: false, reason: 'Rich-text editing is Off or forms are inactive.' }
    case 'pdf-generation': return (notOff(value(config, 'views.print')) || String(value(config, 'views.exportCurrent')).includes('PDF') || String(value(config, 'reporting.export')).includes('PDF') || notOff(value(config, 'government.printSlip')) || notOff(value(config, 'tournament.print')) || String(value(config, 'clinic.prescriptions')).includes('printable'))
      ? { compatible: true, reason: 'Printable/PDF output is active in App Setup.' }
      : { compatible: false, reason: 'No active App Setup decision requests printable/PDF output.' }
    case 'notifications': return requireScope('notifications.level', 'Notifications')
    case 'email-notify': return requireScope('integration.email', 'Email integration')
    case 'realtime': return ((on(config, 'pack.booking') && ['Near real-time', 'Real-time'].includes(String(value(config, 'booking.liveAvailability')))) || (on(config, 'pack.tournament') && ['Near real-time public updates', 'Live scoring + auto standings/bracket'].includes(String(value(config, 'tournament.live')))))
      ? { compatible: true, reason: 'An active booking/event surface explicitly requests near-real-time or real-time updates.' }
      : { compatible: false, reason: 'No active App Setup surface currently requires realtime updates.' }
    case 'comments': return requireScope('comments.enabled', 'Record comments')
    case 'dashboard': return requireScope('dashboard.enabled', 'Dashboard')
    case 'reports': return requireScope('pack.reporting', 'Reports & analytics')
    case 'audit-log': return notOff(value(config, 'quality.audit'))
      ? { compatible: true, reason: 'Audit logging is active.' }
      : { compatible: false, reason: 'Audit trail is disabled in App Setup.' }
    case 'event-analytics': return requireScope('platform.analytics', 'Analytics')
    case 'csv-import': return requireScope('imports.enabled', 'Bulk import')
    case 'export': return (on(config, 'pack.reporting') || (on(config, 'records.crud') && notOff(value(config, 'views.exportCurrent'))))
      ? { compatible: true, reason: 'Export behavior is active in App Setup.' }
      : { compatible: false, reason: 'No active export/reporting scope exists in App Setup.' }
    case 'rest-api': return requireScope('platform.api', 'API surface')
    case 'webhooks': return ['Outgoing', 'Incoming + outgoing'].includes(String(value(config, 'platform.webhooks')))
      ? { compatible: true, reason: 'Outgoing webhook delivery is active in App Setup.' }
      : { compatible: false, reason: `Outbound webhooks are not requested; Webhooks is ${String(value(config, 'platform.webhooks'))}.` }
    case 'payment': return requireScope('pack.payments', 'Payments')
    case 'background-jobs': return (on(config, 'platform.automation') || on(config, 'platform.webhooks') || on(config, 'pack.payments') || on(config, 'integration.email'))
      ? { compatible: true, reason: 'The resolved product has asynchronous/retryable work.' }
      : { compatible: false, reason: 'No active async/automation/payment/email scope requires background jobs.' }
    case 'scheduled-jobs': return (on(config, 'platform.automation') || String(value(config, 'reporting.schedule')) !== 'Off')
      ? { compatible: true, reason: 'Scheduled work is active in App Setup.' }
      : { compatible: false, reason: 'Scheduled automation/reporting is Off.' }
    case 'workflow-automation': return (on(config, 'integration.externalAutomation') || on(config, 'platform.automation'))
      ? { compatible: true, reason: 'Automation scope is active.' }
      : { compatible: false, reason: 'Automation is inactive in App Setup.' }
    case 'idempotency': return (on(config, 'pack.payments') || on(config, 'pack.booking') || (on(config, 'records.crud') && notOff(value(config, 'data.idempotency'))))
      ? { compatible: true, reason: 'Retry-safe/idempotent operations are relevant to active scope.' }
      : { compatible: false, reason: 'No active scope currently requires idempotent mutation handling.' }
    case 'pwa': return requireScope('platform.pwa', 'PWA')
    case 'offline': return notOff(value(config, 'platform.offline'))
      ? { compatible: true, reason: 'Offline behavior is active.' }
      : { compatible: false, reason: 'Offline support is disabled in App Setup.' }
    case 'feature-flags': return notOff(value(config, 'eng.featureFlags'))
      ? { compatible: true, reason: 'Feature flags are active.' }
      : { compatible: false, reason: 'Feature flags are Off in App Setup.' }
    case 'multitenancy': return on(config, 'org.mode')
      ? { compatible: true, reason: 'Organization/team scope is active.' }
      : { compatible: false, reason: 'Organization / team model is Off.' }
    case 'validation': return (on(config, 'forms.enabled') || on(config, 'platform.api') || on(config, 'records.crud'))
      ? { compatible: true, reason: 'Active data-entry/API scope requires validation.' }
      : { compatible: false, reason: 'No active forms/API/record scope currently needs this capability.' }
    case 'rate-limit': return notOff(value(config, 'quality.rateLimit'))
      ? { compatible: true, reason: 'Abuse protection is active.' }
      : { compatible: false, reason: 'Rate limiting / abuse protection is Off.' }
    case 'observability': return notOff(value(config, 'quality.logging'))
      ? { compatible: true, reason: 'Operational logging/observability is active.' }
      : { compatible: false, reason: 'Operational logging is disabled.' }
    case 'backups': return requireScope('quality.backups', 'Backups')
    case 'tests': return notOff(value(config, 'quality.testing'))
      ? { compatible: true, reason: 'Testing is active.' }
      : { compatible: false, reason: 'Testing is disabled.' }
    case 'accessibility': return notOff(value(config, 'quality.accessibility'))
      ? { compatible: true, reason: 'Accessibility requirements are active.' }
      : { compatible: false, reason: 'Accessibility requirements are disabled.' }
    default: return { compatible: true, reason: 'No structured App Setup contradiction is defined for this reusable capability.' }
  }
}

export function patternApplicability(pattern: Pattern, config: ProjectConfig): LayerApplicability {
  switch (pattern.id) {
    case 'command-palette': return notOff(value(config, 'nav.commandPalette'))
      ? { compatible: true, reason: 'Command palette is active in App Setup.' }
      : { compatible: false, reason: 'Command palette is Off in App Setup.' }
    case 'bottom-full':
    case 'bottom-dock':
    case 'bottom-pill': return String(value(config, 'nav.mobile')) === 'Bottom navigation'
      ? { compatible: true, reason: 'Mobile navigation uses bottom navigation.' }
      : { compatible: false, reason: `Mobile navigation is ${String(value(config, 'nav.mobile'))}, not bottom navigation.` }
    case 'side-rail':
    case 'full-sidebar': return ['Sidebar', 'Hybrid'].includes(String(value(config, 'nav.primary')))
      ? { compatible: true, reason: 'Primary navigation supports a sidebar/rail.' }
      : { compatible: false, reason: `Primary navigation is ${String(value(config, 'nav.primary'))}.` }
    case 'bento':
    case 'command-center': return on(config, 'dashboard.enabled')
      ? { compatible: true, reason: 'Dashboard/overview scope is active.' }
      : { compatible: false, reason: 'Dashboard is inactive in App Setup.' }
    case 'master-detail':
    case 'data-table-sticky':
    case 'row-actions': return on(config, 'records.crud')
      ? { compatible: true, reason: 'Record/list scope is active.' }
      : { compatible: false, reason: 'Record CRUD is inactive in App Setup.' }
    case 'metric-strip': return (on(config, 'dashboard.enabled') || on(config, 'pack.reporting'))
      ? { compatible: true, reason: 'Dashboard/reporting scope can support meaningful metrics.' }
      : { compatible: false, reason: 'Neither dashboard nor reporting is active.' }
    case 'timeline': return (on(config, 'workflow.enabled') || on(config, 'records.crud'))
      ? { compatible: true, reason: 'Record/workflow history can support a timeline.' }
      : { compatible: false, reason: 'No record/workflow history surface is active.' }
    case 'wizard': return on(config, 'forms.enabled') && String(value(config, 'forms.longFlow')) === 'Multi-step wizard'
      ? { compatible: true, reason: 'Long-form behavior uses a multi-step wizard.' }
      : { compatible: false, reason: 'App Setup does not request multi-step wizard forms.' }
    case 'sectioned-form': return on(config, 'forms.enabled')
      ? { compatible: true, reason: 'Forms are active.' }
      : { compatible: false, reason: 'Forms are inactive in App Setup.' }
    case 'inline-form': return on(config, 'forms.enabled') && !String(value(config, 'ux.inlineEdit')).toLowerCase().startsWith('off')
      ? { compatible: true, reason: 'Inline editing is allowed.' }
      : { compatible: false, reason: 'Inline editing is Off in App Setup.' }
    case 'fab-cluster': return notOff(value(config, 'nav.quickActions'))
      ? { compatible: true, reason: 'Quick actions are active.' }
      : { compatible: false, reason: 'Global quick actions are Off.' }
    case 'swipe-actions': return notOff(value(config, 'mobile.gestures'))
      ? { compatible: true, reason: 'Gesture shortcuts are enabled.' }
      : { compatible: false, reason: 'Gesture shortcuts are Off.' }
    case 'hero-header': return on(config, 'landing.enabled')
      ? { compatible: true, reason: 'Landing/public site is active.' }
      : { compatible: false, reason: 'Landing page is inactive.' }
    case 'onboarding-checklist': return ['Checklist', 'Guided setup'].includes(String(value(config, 'content.onboarding')))
      ? { compatible: true, reason: 'Onboarding uses a checklist/guided setup.' }
      : { compatible: false, reason: `Product onboarding is ${String(value(config, 'content.onboarding'))}.` }
    case 'progressive-disclosure': return value(config, 'ux.progressiveDisclosure') === true
      ? { compatible: true, reason: 'Progressive disclosure is enabled.' }
      : { compatible: false, reason: 'Progressive disclosure is disabled.' }
    default: return { compatible: true, reason: 'This visual pattern does not contradict a structured App Setup decision.' }
  }
}

export function activeCapabilities(selected: Capability[], config: ProjectConfig) {
  return selected.filter((capability) => capabilityApplicability(capability, config).compatible)
}

export function activePatterns(selected: Pattern[], config: ProjectConfig) {
  return selected.filter((pattern) => patternApplicability(pattern, config).compatible)
}

export function crossLayerSignals(selectedCapabilities: Capability[], selectedPatterns: Pattern[], config: ProjectConfig): string[] {
  const signals: string[] = []
  for (const capability of selectedCapabilities) {
    const result = capabilityApplicability(capability, config)
    if (!result.compatible) signals.push(`Capability “${capability.name}” is selected but excluded from generated scope: ${result.reason}`)
  }
  for (const pattern of selectedPatterns) {
    const result = patternApplicability(pattern, config)
    if (!result.compatible) signals.push(`Visual pattern “${pattern.name}” is selected but excluded from generated direction: ${result.reason}`)
  }
  return signals
}
