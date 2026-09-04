import {
  configSections,
  configSettings,
  effectiveConfigValue,
  formatConfigValue,
  isRedundantSetting,
  isScopeSetting,
  recommendedValue,
  resolveScope,
  resolvedOperationalScale,
  scopeIntegrityDiagnostics,
  settingIsActive,
  type ConfigSetting,
  type ProjectConfig,
} from './configurator'

export type CompiledScopeContract = {
  build: string[]
  required: string[]
  suggested: string[]
  excluded: string[]
}

const sectionLabel = (id: string) => configSections.find((section) => section.id === id)?.label ?? id
const settingLabel = (id: string) => configSettings.find((setting) => setting.id === id)?.label ?? id

const highSignalSuggestionSections = new Set([
  'business', 'access', 'permissions', 'organizations', 'pages', 'public', 'dashboard', 'records', 'workflow', 'collaboration', 'operations', 'integrations', 'seo', 'support',
])

function suggestionScore(setting: ConfigSetting, config: ProjectConfig): number {
  if (setting.section === 'business') return 100
  if (setting.appDefaults?.[config.appType] !== undefined) return 80
  if (['login.enabled', 'roles.level', 'records.crud', 'forms.enabled', 'search.level', 'workflow.enabled', 'attachments.enabled', 'admin.enabled'].includes(setting.id)) return 60
  return 10
}

export function compileScopeContract(config: ProjectConfig): CompiledScopeContract {
  const scoped = configSettings
    .filter((setting) => isScopeSetting(setting.id) && !isRedundantSetting(setting.id))
    .map((setting) => ({ setting, resolution: resolveScope(config, setting.id) }))

  const build = scoped
    .filter(({ resolution }) => resolution.state === 'on')
    .map(({ setting }) => setting.label)

  const required = scoped
    .filter(({ resolution }) => resolution.state === 'required')
    .map(({ setting, resolution }) => `${setting.label}${resolution.requiredBy.length ? ` — required by ${resolution.requiredBy.join(', ')}` : ''}`)

  const suggestedCandidates = scoped
    .filter(({ setting, resolution }) => resolution.state === 'suggested' && highSignalSuggestionSections.has(setting.section))
    .sort((a, b) => suggestionScore(b.setting, config) - suggestionScore(a.setting, config) || a.setting.label.localeCompare(b.setting.label))
  const suggested = suggestedCandidates.slice(0, 12).map(({ setting }) => setting.label)
  if (suggestedCandidates.length > suggested.length) suggested.push(`…and ${suggestedCandidates.length - suggested.length} more advisory suggestion${suggestedCandidates.length - suggested.length === 1 ? '' : 's'} in the full Blueprint reference`)

  const excluded = scoped
    .filter(({ resolution }) => resolution.choice === 'Off')
    .map(({ setting }) => setting.label)

  return { build, required, suggested, excluded }
}

function renderList(items: string[], empty: string) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${empty}`
}

export function scopeContractPrompt(config: ProjectConfig): string {
  const contract = compileScopeContract(config)
  return `ACTIVE PRODUCT SCOPE — IMPLEMENT\n${renderList(contract.build, 'No optional functional capabilities explicitly selected yet.')}\n\nREQUIRED SUPPORTING CAPABILITIES\n${renderList(contract.required, 'No additional hard dependencies resolved.')}\n\nSUGGESTED BUT NOT INCLUDED\n${renderList(contract.suggested, 'None.')}\n\nEXPLICITLY EXCLUDED — DO NOT BUILD\n${renderList(contract.excluded, 'None.')}`
}

const materialDomainSections = new Set(['booking', 'payments', 'subscriptions', 'commerce', 'inventory', 'reporting', 'directory', 'tournament', 'government', 'clinic'])
const materialArchitectureIds = new Set([
  'app.accessShape', 'app.audience', 'app.primarySurface', 'app.shell', 'app.startDestination',
  'product.reuseIntent', 'product.deploymentModel', 'product.sharedCore', 'product.moduleModel', 'product.moduleDependencies', 'product.configScope', 'product.provisioning', 'product.isolationStrategy',
  'permissions.model', 'permissions.defaultPolicy', 'permissions.enforcement', 'org.tenantIsolation',
  'platform.deployment', 'eng.dbEngine', 'eng.region',
])

const materialUxIds = new Set([
  'nav.primary', 'nav.mobile', 'ux.primaryActions', 'ux.progressiveDisclosure', 'ux.confirmation', 'ux.unsavedChanges', 'mobile.primaryActions', 'mobile.tableStrategy',
  'intelligence.contextGapMode', 'media.generatePlaceholders', 'media.placeholderStyle', 'media.placeholderCoverage',
  'content.aiSlop', 'content.tone', 'content.density', 'content.publicCopyGuardrails',
])

function activeDomainSection(config: ProjectConfig, section: string): boolean {
  const packId = `pack.${section}`
  return configSettings.some((setting) => setting.id === packId) && resolveScope(config, packId).active
}

function materialBehaviorSetting(setting: ConfigSetting, config: ProjectConfig): boolean {
  if (isRedundantSetting(setting.id) || isScopeSetting(setting.id) || !settingIsActive(setting, config)) return false
  if (config.overrides.includes(setting.id)) return true
  if (materialArchitectureIds.has(setting.id) || materialUxIds.has(setting.id)) return true
  if (materialDomainSections.has(setting.section) && activeDomainSection(config, setting.section) && !setting.advanced) return true
  return false
}

function behaviorLine(setting: ConfigSetting, config: ProjectConfig): string {
  const current = effectiveConfigValue(config, setting.id)
  const recommended = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
  const explicit = config.overrides.includes(setting.id)
  return `- ${setting.label}: ${formatConfigValue(current)}${explicit && current !== recommended ? ' (explicit override)' : ''}`
}

function compiledBehaviorGroups(config: ProjectConfig): string[] {
  const candidates = configSettings.filter((setting) => materialBehaviorSetting(setting, config))
  const groups = new Map<string, ConfigSetting[]>()
  for (const setting of candidates) {
    const list = groups.get(setting.section) ?? []
    list.push(setting)
    groups.set(setting.section, list)
  }

  const output: string[] = []
  for (const [section, settings] of groups) {
    const explicit = settings.filter((setting) => config.overrides.includes(setting.id))
    const baseline = settings.filter((setting) => !config.overrides.includes(setting.id))
    const baselineBudget = Math.max(0, (materialDomainSections.has(section) ? 8 : 6) - explicit.length)
    const selected = [...explicit, ...baseline.slice(0, baselineBudget)]
    if (!selected.length) continue
    output.push(`${sectionLabel(section).toUpperCase()}\n${selected.map((setting) => behaviorLine(setting, config)).join('\n')}`)
  }
  return output
}

function explicitOverridesNotAlreadyMaterial(config: ProjectConfig): string[] {
  return config.overrides
    .map((id) => configSettings.find((setting) => setting.id === id))
    .filter((setting): setting is ConfigSetting => Boolean(setting) && !isScopeSetting(setting!.id) && !isRedundantSetting(setting!.id) && settingIsActive(setting!, config))
    .filter((setting) => !materialBehaviorSetting(setting, config))
    .map((setting) => `- ${setting.label}: ${formatConfigValue(effectiveConfigValue(config, setting.id))}`)
}

export function mediaDirectionPrompt(config: ProjectConfig): string {
  const enabled = effectiveConfigValue(config, 'media.generatePlaceholders') === true
  if (!enabled) return 'MEDIA DIRECTION\n- Placeholder-image generation is disabled. Do not invent decorative media or new product modules merely to fill space.'
  const style = String(effectiveConfigValue(config, 'media.placeholderStyle'))
  const coverage = String(effectiveConfigValue(config, 'media.placeholderCoverage'))
  return `MEDIA DIRECTION\n- Generate context-appropriate placeholder imagery where needed to make active interfaces feel complete and realistic.\n- Style: ${style}. Coverage: ${coverage}.\n- Keep imagery aligned with the active scope, domain, and approved visual direction. Do not invent new product modules solely to justify additional imagery.`
}

export function copyDirectionPrompt(config: ProjectConfig): string {
  const guardrail = String(effectiveConfigValue(config, 'content.publicCopyGuardrails'))
  if (guardrail === 'Off') return 'COPY DIRECTION\n- Audience-aware public-copy guardrails are explicitly Off. Still avoid presenting developer/debug strings as production content.'
  const enforcement = guardrail === 'Enforce' ? 'MUST' : 'should be reviewed to'
  return `COPY DIRECTION\n- Customer-facing headings, subtitles, buttons, navigation, badges, empty states, footer copy, and placeholders ${enforcement} speak to the customer rather than describe implementation.\n- Do not leak Blueprint/developer/meta terms such as “current scope”, “implementation foundation”, “mobile-first architecture”, “visual system baseline”, “MVP”, or architecture/deployment language into public copy.\n- Internal Blueprint, developer, documentation, and admin contexts may still use implementation terminology where appropriate.`
}

export function implementationConfigContractPrompt(config: ProjectConfig): string {
  const integrity = scopeIntegrityDiagnostics(config)
  const groups = compiledBehaviorGroups(config)
  const residualOverrides = explicitOverridesNotAlreadyMaterial(config)
  const reuse = String(effectiveConfigValue(config, 'product.reuseIntent'))
  const quality = [
    `Operational scale: ${resolvedOperationalScale(config)}${config.operationalScale === 'Auto' ? ' (Auto inference)' : ' (explicit)'}`,
    `Security posture: ${String(effectiveConfigValue(config, 'quality.security'))}`,
    `Accessibility target: ${String(effectiveConfigValue(config, 'quality.accessibility'))}`,
    `Privacy posture: ${String(effectiveConfigValue(config, 'quality.privacy'))}`,
    `Testing posture: ${String(effectiveConfigValue(config, 'quality.testing'))}`,
  ]

  return `SCOPE AUTHORITY\n${scopeContractPrompt(config)}\n\nIMPLEMENTATION BASELINES\n- Apply secure, accessible, production-safe web defaults only where the active product scope needs them.\n- ${quality.join('\n- ')}\n- Product reuse: ${reuse}. Reuse architecture may shape packaging/isolation/configuration, but never activate business modules.\n\n${mediaDirectionPrompt(config)}\n\n${copyDirectionPrompt(config)}\n\nMATERIAL IMPLEMENTATION DECISIONS\n${groups.length ? groups.join('\n\n') : '- No additional material behavior decisions beyond active scope and baselines.'}${residualOverrides.length ? `\n\nOTHER EXPLICIT OVERRIDES — PRESERVE\n${residualOverrides.join('\n')}` : ''}${integrity.length ? `\n\nSCOPE INTEGRITY DIAGNOSTICS — BLOCKING\n${integrity.map((item) => `- ${item.detail}`).join('\n')}` : ''}`
}

export function fullBlueprintReferencePrompt(config: ProjectConfig): string {
  const groups = configSections.map((section) => {
    const settings = configSettings.filter((setting) => setting.section === section.id && !isRedundantSetting(setting.id))
    if (!settings.length) return ''
    return `${section.label.toUpperCase()}\n${settings.map((setting) => {
      if (isScopeSetting(setting.id)) {
        const scope = resolveScope(config, setting.id)
        const status = scope.state.toUpperCase()
        const recommended = scope.state === 'suggested' ? ` · ${scope.reason}` : scope.reason ? ` · ${scope.reason}` : ''
        return `- ${setting.label}: ${status}${scope.active && setting.kind !== 'boolean' ? ` · ${formatConfigValue(scope.effectiveValue)}` : ''}${recommended}`
      }
      return `- ${setting.label}: ${formatConfigValue(effectiveConfigValue(config, setting.id))}${config.overrides.includes(setting.id) ? ' (explicit override)' : ''}`
    }).join('\n')}`
  }).filter(Boolean)
  return groups.join('\n\n')
}

export function scopeStateSummary(config: ProjectConfig) {
  const resolutions = configSettings
    .filter((setting) => isScopeSetting(setting.id) && !isRedundantSetting(setting.id))
    .map((setting) => resolveScope(config, setting.id))
  return {
    active: resolutions.filter((resolution) => resolution.state === 'on').length,
    required: resolutions.filter((resolution) => resolution.state === 'required').length,
    suggested: resolutions.filter((resolution) => resolution.state === 'suggested').length,
    excluded: Object.entries(config.scopeChoices).filter(([, choice]) => choice === 'Off').length,
  }
}

export function traceScopeAuthority(config: ProjectConfig, id: string) {
  const resolution = resolveScope(config, id)
  return {
    id,
    label: settingLabel(id),
    state: resolution.state,
    active: resolution.active,
    activationSource: resolution.activationSource,
    requiredBy: resolution.requiredBy,
    reason: resolution.reason,
  }
}
