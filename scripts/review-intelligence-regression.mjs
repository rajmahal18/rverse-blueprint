import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-review-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []

rmSync(buildDir, { recursive: true, force: true })
execFileSync(compilerCommand, [
  ...compilerPrefix,
  'src/data/configurator.ts',
  'src/data/reviewSignals.ts',
  'src/data/intelligence.ts',
  'src/data/projectContext.ts',
  '--target', 'ES2022',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--skipLibCheck',
  '--strict',
  '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const engine = require(join(buildDir, 'configurator.js'))
const review = require(join(buildDir, 'reviewSignals.js'))
const intelligence = require(join(buildDir, 'intelligence.js'))

const { appTypes, configSettings, createProjectConfig, setConfigValue, setScopeChoice } = engine
const { configReviewSignals, reviewSignalFromWarning, reviewSignalCounts } = review
const { configReadiness, projectContextReviewSignals, settingRecommendationProvenance } = intelligence

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}
const setting = (id) => {
  const found = configSettings.find((item) => item.id === id)
  assert.ok(found, `Missing setting ${id}`)
  return found
}

console.log('\nBlueprint v0.21 review-intelligence regression suite\n')

check('all recommended app-type baselines remain free of typed App Setup signals', () => {
  for (const { value: appType } of appTypes) {
    const signals = configReviewSignals(createProjectConfig(appType))
    assert.deepEqual(signals, [], `${appType} unexpectedly produced ${signals.map((item) => item.id).join(', ')}`)
  }
})

check('admin without login is a security blocker linked to its quick fix', () => {
  let config = createProjectConfig('Internal / Operations')
  config = setScopeChoice(config, 'login.enabled', 'Off')
  const signal = configReviewSignals(config).find((item) => item.id === 'admin-without-login')
  assert.ok(signal)
  assert.equal(signal.severity, 'blocker')
  assert.equal(signal.category, 'security')
  assert.equal(signal.suggestedFixId, 'protect-admin')
  assert.ok(signal.affectedSettings.includes('login.enabled'))
  assert.equal(configReadiness(config).label, 'Not ready')
})

check('booking conflict UI-only is a reliability blocker', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setConfigValue(config, 'booking.conflictPolicy', 'UI check only')
  const signal = configReviewSignals(config).find((item) => item.id === 'booking-conflict-ui-only')
  assert.ok(signal)
  assert.equal(signal.severity, 'blocker')
  assert.equal(signal.category, 'reliability')
})

check('password-manager-hostile behavior is review-level usability rather than a blocker', () => {
  let config = createProjectConfig('SaaS / Client Portal')
  config = setConfigValue(config, 'password.paste', false)
  const signal = configReviewSignals(config).find((item) => item.id === 'password-manager-hostile')
  assert.ok(signal)
  assert.equal(signal.severity, 'review')
  assert.equal(signal.category, 'usability')
  assert.equal(configReadiness(config).label, 'Ready with review')
})

check('typed severity counts are deterministic', () => {
  const signals = [
    reviewSignalFromWarning('Admin panel is enabled while login is disabled. Protect administrative routes with authentication.'),
    reviewSignalFromWarning('Push permission is requested on first visit. Ask contextually after the user understands what notifications will provide.'),
  ]
  assert.deepEqual(reviewSignalCounts(signals), { advisory: 1, review: 0, important: 0, blocker: 1 })
})

check('blockers reduce readiness more than review-only signals', () => {
  let reviewConfig = createProjectConfig('SaaS / Client Portal')
  reviewConfig = setConfigValue(reviewConfig, 'password.paste', false)
  let blockerConfig = createProjectConfig('Booking / Scheduling')
  blockerConfig = setConfigValue(blockerConfig, 'booking.conflictPolicy', 'UI check only')
  assert.ok(configReadiness(blockerConfig).score < configReadiness(reviewConfig).score)
})

check('app-type recommendation provenance explains contextual defaults', () => {
  const config = createProjectConfig('Booking / Scheduling')
  const provenance = settingRecommendationProvenance(setting('app.primarySurface'), config)
  assert.equal(provenance.source, 'App type')
  assert.match(provenance.reason, /Booking \/ Scheduling/)
})


check('Auto operational-scale provenance identifies scale-driven defaults', () => {
  const config = createProjectConfig('Government System')
  const provenance = settingRecommendationProvenance(setting('recovery.rpo'), config)
  assert.equal(provenance.source, 'Operational scale')
  assert.match(provenance.reason, /Mission critical/) 
  assert.match(provenance.reason, /Auto inference/)
})

check('profile provenance identifies deliberate recommendation posture defaults', () => {
  const config = createProjectConfig('Custom / General', 'Advanced')
  const provenance = settingRecommendationProvenance(setting('app.pageDepth'), config)
  assert.equal(provenance.source, 'Profile')
  assert.match(provenance.reason, /Advanced/)
})

check('explicit behavior overrides are labeled Explicit and remember the expected recommendation', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setConfigValue(config, 'booking.conflictPolicy', 'UI check only')
  const provenance = settingRecommendationProvenance(setting('booking.conflictPolicy'), config)
  assert.equal(provenance.source, 'Explicit')
  assert.equal(provenance.expected, 'Atomic conflict rejection')
  assert.equal(provenance.current, 'UI check only')
})

check('scope provenance preserves Required/Inferred reasons rather than flattening them to Recommended', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const admin = settingRecommendationProvenance(setting('admin.enabled'), config)
  assert.ok(['Required', 'Inferred'].includes(admin.source), `Unexpected source: ${admin.source}`)
  assert.ok(admin.reason.length > 10)
})

check('Project Context review signals are typed advisory scope signals', () => {
  const config = createProjectConfig('Custom / General')
  const signals = projectContextReviewSignals({
    building: 'A court booking app.',
    audience: 'Players and court staff.',
    outcomes: 'Let customers book a court online.',
    priorities: '', nonNegotiables: '', avoid: '', dependencies: '', done: '',
  }, config)
  assert.equal(signals.length, 1)
  assert.equal(signals[0].severity, 'advisory')
  assert.equal(signals[0].category, 'scope')
  assert.deepEqual(signals[0].affectedSettings, ['pack.booking'])
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} review-intelligence regression checks passed.\n`)
