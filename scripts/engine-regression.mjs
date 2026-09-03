import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []

const compile = () => {
  rmSync(buildDir, { recursive: true, force: true })
  execFileSync(compilerCommand, [
    ...compilerPrefix,
    'src/data/configurator.ts',
    'src/data/intelligence.ts',
    'src/data/projectContext.ts',
    'src/data/capabilities.ts',
    'src/data/catalog.ts',
    'src/data/consistency.ts',
    '--target', 'ES2022',
    '--module', 'commonjs',
    '--moduleResolution', 'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--strict',
    '--outDir', buildDir,
    '--noEmitOnError', 'false',
  ], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
  writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')
}

compile()
const require = createRequire(import.meta.url)
const engine = require(join(buildDir, 'configurator.js'))
const intelligence = require(join(buildDir, 'intelligence.js'))
const capabilityData = require(join(buildDir, 'capabilities.js'))
const patternData = require(join(buildDir, 'catalog.js'))
const consistency = require(join(buildDir, 'consistency.js'))

const {
  appTypes,
  configSections,
  configSettings,
  changeConfigContext,
  configWarnings,
  createProjectConfig,
  effectiveConfigValue,
  inferredOperationalScale,
  isRedundantSetting,
  isScopeSetting,
  normalizeProjectConfig,
  recommendedValue,
  resetAllConfig,
  resolveScope,
  scopeConflicts,
  setConfigValue,
  setScopeChoice,
  settingIncludedInContract,
  settingIsActive,
} = engine
const { appTypeMatches, configQuickFixes, configReadiness } = intelligence
const { capabilities } = capabilityData
const { patterns } = patternData
const { capabilityApplicability, crossLayerSignals, patternApplicability } = consistency

const failures = []
let passed = 0
function check(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.error(`✗ ${name}`)
    console.error(`  ${error instanceof Error ? error.message : String(error)}`)
  }
}

const scopeOn = (config, id) => resolveScope(config, id).active
const value = (config, id) => effectiveConfigValue(config, id)
const setting = (id) => {
  const found = configSettings.find((item) => item.id === id)
  assert.ok(found, `Missing setting ${id}`)
  return found
}
const expectScope = (config, on = [], off = []) => {
  for (const id of on) assert.equal(scopeOn(config, id), true, `${id} should be active`)
  for (const id of off) assert.equal(scopeOn(config, id), false, `${id} should be inactive`)
}
const expectValue = (config, id, expected) => assert.deepEqual(value(config, id), expected, `${id} should resolve to ${String(expected)}`)

console.log('\nBlueprint engine regression suite\n')

check('catalog has unique setting ids and section ids', () => {
  assert.equal(new Set(configSettings.map((item) => item.id)).size, configSettings.length)
  assert.equal(new Set(configSections.map((item) => item.id)).size, configSections.length)
})

check('every setting belongs to a real section and every dependency target exists', () => {
  const sections = new Set(configSections.map((item) => item.id))
  const ids = new Set(configSettings.map((item) => item.id))
  for (const item of configSettings) {
    assert.ok(sections.has(item.section), `${item.id} uses unknown section ${item.section}`)
    if (item.dependsOn) assert.ok(ids.has(item.dependsOn.id), `${item.id} depends on unknown ${item.dependsOn.id}`)
  }
})

check('declared defaults are valid for their setting kind/options', () => {
  const appTypeValues = appTypes.map((item) => item.value)
  for (const item of configSettings) {
    const candidates = [item.defaultValue, ...Object.values(item.appDefaults ?? {}), ...Object.values(item.profileDefaults ?? {})]
    for (const candidate of candidates) {
      if (item.kind === 'boolean') assert.equal(typeof candidate, 'boolean', `${item.id} has non-boolean default`)
      if (item.kind === 'choice') assert.ok(item.options?.some((option) => option.value === candidate), `${item.id} has invalid choice default ${String(candidate)}`)
    }
    for (const appType of Object.keys(item.appDefaults ?? {})) assert.ok(appTypeValues.includes(appType), `${item.id} has unknown app type default ${appType}`)
  }
})

const baselineScenarios = [
  {
    name: 'Custom / General stays neutral', appType: 'Custom / General', scale: 'Standard',
    on: [],
    off: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'workflow.enabled', 'pack.booking', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.directory', 'pack.government', 'pack.clinic', 'pack.tournament'],
  },
  {
    name: 'Booking / Scheduling is transactional but lean in collaboration', appType: 'Booking / Scheduling', scale: 'Standard',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'pack.booking', 'pack.payments', 'pack.reporting', 'quality.backups'],
    off: ['workflow.enabled', 'approval.enabled', 'attachments.enabled', 'integration.externalAutomation'],
    values: { 'booking.conflictPolicy': 'Atomic conflict rejection', 'payments.verification': 'Server/webhook verified', 'payments.webhookIdempotency': true },
  },
  {
    name: 'Internal / Operations enables controlled workflow', appType: 'Internal / Operations', scale: 'Standard',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'workflow.enabled', 'approval.enabled', 'attachments.enabled', 'pack.reporting'],
    off: ['pack.booking', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.directory'],
  },
  {
    name: 'SaaS / Client Portal enables subscriptions without generic workflow', appType: 'SaaS / Client Portal', scale: 'Standard',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'pack.payments', 'pack.subscriptions', 'pack.reporting'],
    off: ['workflow.enabled', 'approval.enabled', 'attachments.enabled', 'pack.commerce'],
  },
  {
    name: 'E-commerce enables checkout and single-location inventory baseline', appType: 'E-commerce', scale: 'Lean',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.reporting'],
    off: ['workflow.enabled', 'approval.enabled', 'pack.subscriptions'],
    values: { 'inventory.locations': 'Single location' },
  },
  {
    name: 'Directory / Marketplace does not assume transactions', appType: 'Directory / Marketplace', scale: 'Lean',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'search.level', 'pack.directory', 'pack.reporting'],
    off: ['pack.payments', 'pack.commerce', 'workflow.enabled', 'approval.enabled'],
  },
  {
    name: 'Portfolio / Marketing remains public and non-operational', appType: 'Portfolio / Marketing', scale: 'Lean',
    on: [],
    off: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'workflow.enabled', 'pack.payments', 'pack.reporting', 'quality.backups', 'eng.dbEngine'],
  },
  {
    name: 'Government System resolves mission-critical workflow safeguards', appType: 'Government System', scale: 'Mission critical',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'workflow.enabled', 'approval.enabled', 'attachments.enabled', 'pack.government', 'pack.reporting', 'quality.backups'],
    off: ['pack.payments', 'pack.commerce'],
    values: { 'login.mfa': 'Required for admins', 'permissions.enforcement': 'Server enforced + UI reflects access' },
  },
  {
    name: 'Clinic / EMR resolves mission-critical clinical safeguards', appType: 'Clinic / EMR', scale: 'Mission critical',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'workflow.enabled', 'attachments.enabled', 'pack.clinic', 'pack.reporting', 'quality.backups'],
    off: ['approval.enabled', 'pack.payments', 'pack.commerce'],
    values: { 'login.mfa': 'Required for admins', 'permissions.enforcement': 'Server enforced + UI reflects access' },
  },
  {
    name: 'Inventory / POS supports multi-location operations', appType: 'Inventory / POS', scale: 'Standard',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'pack.inventory', 'pack.payments', 'pack.reporting', 'quality.backups'],
    off: ['workflow.enabled', 'approval.enabled'],
    values: { 'inventory.locations': 'Multiple locations', 'inventory.transfers': 'Transfer + receive' },
  },
  {
    name: 'Tournament / Event enables event operations without generic workflow', appType: 'Tournament / Event', scale: 'Lean',
    on: ['login.enabled', 'admin.enabled', 'records.crud', 'forms.enabled', 'pack.tournament', 'pack.reporting'],
    off: ['workflow.enabled', 'approval.enabled', 'attachments.enabled', 'pack.payments'],
  },
]

for (const scenario of baselineScenarios) {
  check(`scenario: ${scenario.name}`, () => {
    const config = createProjectConfig(scenario.appType, 'Recommended', 'Auto')
    assert.equal(inferredOperationalScale(scenario.appType), scenario.scale)
    expectScope(config, scenario.on, scenario.off)
    for (const [id, expected] of Object.entries(scenario.values ?? {})) expectValue(config, id, expected)
    assert.deepEqual(configWarnings(config), [], `${scenario.appType} default baseline should have no warnings`)
    assert.equal(configReadiness(config).label, 'Ready')
  })
}

check('all recommended app types are warning-free by default', () => {
  for (const { value: appType } of appTypes) {
    const warnings = configWarnings(createProjectConfig(appType, 'Recommended', 'Auto'))
    assert.deepEqual(warnings, [], `${appType} has baseline warnings: ${warnings.join(' | ')}`)
  }
})

check('explicit Off is authoritative for every scope setting across every app type', () => {
  for (const { value: appType } of appTypes) {
    const base = createProjectConfig(appType)
    for (const item of configSettings.filter((candidate) => isScopeSetting(candidate.id) && !isRedundantSetting(candidate.id))) {
      const config = setScopeChoice(base, item.id, 'Off')
      const resolution = resolveScope(config, item.id)
      assert.equal(resolution.choice, 'Off', `${appType}/${item.id}: explicit Off choice was lost`)
      assert.equal(resolution.active, false, `${appType}/${item.id}: explicit Off was silently re-enabled`)
      assert.equal(settingIncludedInContract(item, config), true, `${appType}/${item.id}: deliberate Off must remain visible in the contract`)
    }
  }
})

check('changing app type preserves explicit scope intent', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'attachments.enabled', 'On')
  config = setScopeChoice(config, 'pack.payments', 'Off')
  config = changeConfigContext(config, 'Internal / Operations', 'Recommended', 'Auto')
  assert.equal(resolveScope(config, 'attachments.enabled').choice, 'On')
  assert.equal(resolveScope(config, 'pack.payments').choice, 'Off')
})

check('real-world scenario: a custom cash-only booking app can keep Payments explicitly out of scope', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setConfigValue(config, 'booking.paymentPolicy', 'No payment')
  config = setScopeChoice(config, 'pack.payments', 'Off')
  expectScope(config, ['pack.booking', 'admin.enabled', 'records.crud', 'forms.enabled'], ['pack.payments'])
  assert.ok(!configWarnings(config).some((warning) => warning.includes('Booking requires payment')))
})

check('intentional scale mismatches produce review signals instead of silently changing product scope', () => {
  const portfolio = createProjectConfig('Portfolio / Marketing', 'Recommended', 'Mission critical')
  expectScope(portfolio, [], ['login.enabled', 'admin.enabled', 'records.crud', 'pack.payments'])
  assert.ok(configWarnings(portfolio).some((warning) => warning.includes('Mission critical operational scale')))

  const clinic = createProjectConfig('Clinic / EMR', 'Recommended', 'Lean')
  assert.equal(scopeOn(clinic, 'pack.clinic'), true)
  assert.ok(configWarnings(clinic).some((warning) => warning.includes('Lean operational scale')))
})

check('behavioral defaults never create product scope by themselves', () => {
  const config = createProjectConfig('Custom / General')
  assert.equal(value(config, 'booking.conflictPolicy'), 'Atomic conflict rejection')
  assert.equal(scopeOn(config, 'pack.booking'), false)
  assert.equal(settingIncludedInContract(setting('booking.conflictPolicy'), config), false)
})

check('explicit Off wins over inference and surfaces a dependency conflict', () => {
  const booking = createProjectConfig('Booking / Scheduling')
  const config = setScopeChoice(booking, 'pack.payments', 'Off')
  const resolution = resolveScope(config, 'pack.payments')
  assert.equal(resolution.active, false)
  assert.equal(resolution.choice, 'Off')
  assert.ok(resolution.requiredBy.length > 0)
  assert.ok(scopeConflicts(config).some((warning) => warning.includes('Payments')))
  assert.ok(configWarnings(config).some((warning) => warning.includes('Booking requires payment')))
})

check('an explicit child decision can require its neutral Custom parent', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'booking.conflictPolicy', 'UI check only')
  const resolution = resolveScope(config, 'pack.booking')
  assert.equal(resolution.active, true)
  assert.equal(resolution.source, 'Required')
  assert.ok(resolution.requiredBy.length > 0)
})

check('changing app type preserves deliberate behavioral overrides', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'content.aiSlop', 'None')
  assert.ok(config.overrides.includes('content.aiSlop'))
  config = changeConfigContext(config, 'Booking / Scheduling', 'Recommended', 'Auto')
  assert.equal(value(config, 'content.aiSlop'), 'None')
  assert.ok(config.overrides.includes('content.aiSlop'))
})

check('changing Operational Scale never creates business scope', () => {
  const neutral = createProjectConfig('Custom / General', 'Recommended', 'Mission critical')
  const packIds = ['pack.booking', 'pack.payments', 'pack.subscriptions', 'pack.commerce', 'pack.inventory', 'pack.reporting', 'pack.directory', 'pack.tournament', 'pack.government', 'pack.clinic']
  expectScope(neutral, [], packIds)
  assert.equal(recommendedValue(setting('login.mfa'), 'Custom / General', 'Recommended', 'Mission critical'), 'Required for admins')
  assert.equal(scopeOn(neutral, 'login.enabled'), false)
  assert.equal(scopeOn(neutral, 'login.mfa'), false)
})

check('single-location inventory excludes inter-location transfer behavior from the contract', () => {
  const config = createProjectConfig('E-commerce')
  assert.equal(value(config, 'inventory.locations'), 'Single location')
  assert.equal(settingIsActive('inventory.transfers', config), false)
  assert.equal(settingIncludedInContract(setting('inventory.transfers'), config), false)
})

check('admin defaults always have a protected login and server-side authorization boundary', () => {
  for (const { value: appType } of appTypes) {
    const config = createProjectConfig(appType)
    if (!scopeOn(config, 'admin.enabled')) continue
    assert.equal(scopeOn(config, 'login.enabled'), true, `${appType}: admin requires login`)
    assert.notEqual(value(config, 'permissions.enforcement'), 'UI checks only', `${appType}: authorization cannot be UI-only`)
  }
})

check('unsafe payment verification produces a review signal and a deterministic quick fix', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setConfigValue(config, 'payments.verification', 'Client return / redirect only')
  assert.ok(configWarnings(config).some((warning) => warning.includes('browser return/redirect')))
  const fix = configQuickFixes(config).find((item) => item.id === 'payment-authority')
  assert.ok(fix)
  for (const change of fix.changes) config = setConfigValue(config, change.id, change.value)
  assert.equal(value(config, 'payments.verification'), 'Server/webhook verified')
  assert.ok(!configWarnings(config).some((warning) => warning.includes('browser return/redirect')))
})

check('unsafe booking conflict handling produces a quick fix', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setConfigValue(config, 'booking.conflictPolicy', 'UI check only')
  assert.ok(configWarnings(config).some((warning) => warning.includes('double booking')))
  const fix = configQuickFixes(config).find((item) => item.id === 'booking-atomic')
  assert.ok(fix)
  assert.deepEqual(fix.changes, [{ id: 'booking.conflictPolicy', value: 'Atomic conflict rejection' }])
})

check('explicitly disabling login while admin is active never gets silently overridden', () => {
  let config = createProjectConfig('Internal / Operations')
  config = setScopeChoice(config, 'login.enabled', 'Off')
  assert.equal(scopeOn(config, 'login.enabled'), false)
  assert.equal(scopeOn(config, 'admin.enabled'), true)
  assert.ok(scopeConflicts(config).some((warning) => warning.includes('Sign-in')) || configWarnings(config).some((warning) => warning.includes('login is disabled')))
})

check('scope On/Off toggles preserve deliberate choice behavior for choice settings', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'search.level', 'Full-text + fuzzy')
  assert.equal(scopeOn(config, 'search.level'), true)
  config = setScopeChoice(config, 'search.level', 'Off')
  assert.equal(scopeOn(config, 'search.level'), false)
  config = setScopeChoice(config, 'search.level', 'On')
  assert.equal(scopeOn(config, 'search.level'), true)
  assert.equal(value(config, 'search.level'), 'Full-text + fuzzy')
})

check('normalization rebases untouched values and discards unknown overrides', () => {
  const legacy = createProjectConfig('Booking / Scheduling')
  legacy.values['booking.conflictPolicy'] = 'UI check only'
  legacy.overrides = ['does.not.exist']
  const normalized = normalizeProjectConfig(legacy)
  assert.equal(value(normalized, 'booking.conflictPolicy'), recommendedValue(setting('booking.conflictPolicy'), 'Booking / Scheduling', 'Recommended', 'Auto'))
  assert.ok(!normalized.overrides.includes('does.not.exist'))
})

check('reset all keeps the selected operational scale while clearing deliberate choices', () => {
  let config = createProjectConfig('Booking / Scheduling', 'Recommended', 'High scale')
  config = setConfigValue(config, 'content.aiSlop', 'None')
  config = setScopeChoice(config, 'attachments.enabled', 'On')
  const reset = resetAllConfig(config)
  assert.equal(reset.operationalScale, 'High scale')
  assert.deepEqual(reset.overrides, [])
  assert.deepEqual(reset.scopeChoices, {})
})

check('neutral Custom app type does not claim an app-type match without meaningful signals', () => {
  const config = createProjectConfig('Custom / General')
  assert.deepEqual(appTypeMatches(config), [])
})

check('cross-layer payment capability follows resolved payment scope', () => {
  const payment = capabilities.find((item) => item.id === 'payment')
  assert.ok(payment)
  assert.equal(capabilityApplicability(payment, createProjectConfig('Booking / Scheduling')).compatible, true)
  assert.equal(capabilityApplicability(payment, createProjectConfig('Portfolio / Marketing')).compatible, false)
})

check('cross-layer dashboard patterns are excluded when dashboard scope is inactive', () => {
  const commandCenter = patterns.find((item) => item.id === 'command-center')
  assert.ok(commandCenter)
  const config = createProjectConfig('Portfolio / Marketing')
  assert.equal(patternApplicability(commandCenter, config).compatible, false)
  const signals = crossLayerSignals([], [commandCenter], config)
  assert.equal(signals.length, 1)
  assert.ok(signals[0].includes('excluded'))
})

check('inactive Auto scope stays out of the implementation contract', () => {
  const config = createProjectConfig('Portfolio / Marketing')
  for (const item of configSettings) {
    if (isRedundantSetting(item.id)) {
      assert.equal(settingIncludedInContract(item, config), false, `${item.id} is a compatibility alias and must be excluded`)
      continue
    }
    if (isScopeSetting(item.id)) {
      const resolution = resolveScope(config, item.id)
      if (!resolution.active && resolution.choice === 'Auto') assert.equal(settingIncludedInContract(item, config), false, `${item.id} inactive Auto scope leaked into contract`)
    }
  }
})

check('all supported profiles and scales can be resolved for every app type', () => {
  const profiles = ['Recommended', 'Minimal', 'Standard', 'Advanced']
  const scales = ['Auto', 'Lean', 'Standard', 'High scale', 'Mission critical']
  for (const { value: appType } of appTypes) {
    for (const profile of profiles) {
      for (const scale of scales) {
        const config = createProjectConfig(appType, profile, scale)
        for (const item of configSettings) {
          const resolved = value(config, item.id)
          if (item.kind === 'boolean') assert.equal(typeof resolved, 'boolean', `${appType}/${profile}/${scale}/${item.id}`)
          if (item.kind === 'choice') assert.ok(item.options?.some((option) => option.value === resolved), `${appType}/${profile}/${scale}/${item.id} resolved invalid value ${String(resolved)}`)
        }
      }
    }
  }
})

rmSync(buildDir, { recursive: true, force: true })

console.log(`\n${passed} regression checks passed.`)
if (failures.length) {
  console.error(`${failures.length} check${failures.length === 1 ? '' : 's'} failed.`)
  process.exitCode = 1
} else {
  console.log('Engine baseline is stable.\n')
}
