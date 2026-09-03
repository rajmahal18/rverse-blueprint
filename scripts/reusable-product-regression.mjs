import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-productization-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []

rmSync(buildDir, { recursive: true, force: true })
execFileSync(compilerCommand, [
  ...compilerPrefix,
  'src/data/configurator.ts',
  'src/data/coreFlows.ts',
  'src/data/reviewSignals.ts',
  'src/data/intelligence.ts',
  'src/data/projectContext.ts',
  'src/data/roadmap.ts',
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
const roadmap = require(join(buildDir, 'roadmap.js'))
const {
  configSections,
  configSettings,
  createProjectConfig,
  effectiveConfigValue,
  resolveScope,
  setConfigValue,
  setScopeChoice,
  isScopeSetting,
  settingIncludedInContract,
  settingIsActive,
} = engine
const { configReviewSignals } = review
const { acceptanceCriteria, edgeCases, configQuickFixes, projectContextReviewSignals } = intelligence
const { deriveImplementationRoadmap } = roadmap

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}
const value = (config, id) => effectiveConfigValue(config, id)
const phaseById = (result, id) => result.phases.find((item) => item.id === id)
const applyFix = (config, fix) => fix.changes.reduce((next, change) => {
  const setting = configSettings.find((item) => item.id === change.id)
  if (setting && isScopeSetting(change.id)) {
    if (setting.kind === 'boolean') return setScopeChoice(next, change.id, change.value === true ? 'On' : 'Off')
    const enabled = setScopeChoice(next, change.id, 'On')
    return setConfigValue(enabled, change.id, change.value)
  }
  return setConfigValue(next, change.id, change.value)
}, config)

console.log('\nBlueprint v0.24 Reusable Product Architecture regression suite\n')

check('catalog exposes a dedicated reusable-product architecture section with the expected build-once decisions', () => {
  assert.ok(configSections.some((section) => section.id === 'productization'))
  const ids = configSettings.filter((setting) => setting.section === 'productization').map((setting) => setting.id)
  assert.ok(ids.length >= 17)
  for (const required of ['product.reuseIntent', 'product.deploymentModel', 'product.sharedCore', 'product.moduleModel', 'product.configScope', 'product.provisioning', 'product.isolationStrategy', 'product.extensionStrategy', 'product.rollout', 'product.versioning']) assert.ok(ids.includes(required), `missing ${required}`)
})

check('a normal project remains single-purpose and does not gain reusable-product roadmap work', () => {
  const config = createProjectConfig('Government System')
  assert.equal(value(config, 'product.reuseIntent'), 'Single-purpose application')
  assert.equal(settingIsActive('product.moduleModel', config), false)
  assert.equal(phaseById(deriveImplementationRoadmap(config, []), 'productization'), undefined)
})

check('selecting reusable intent does not activate business packs or organization scope behind the user', () => {
  let config = createProjectConfig('Custom / General')
  const beforePacks = ['pack.booking', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.government', 'pack.clinic'].map((id) => [id, resolveScope(config, id).active])
  const beforeOrg = resolveScope(config, 'org.mode').active
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  assert.deepEqual(['pack.booking', 'pack.payments', 'pack.commerce', 'pack.inventory', 'pack.government', 'pack.clinic'].map((id) => [id, resolveScope(config, id).active]), beforePacks)
  assert.equal(resolveScope(config, 'org.mode').active, beforeOrg)
})

check('shared tenant runtime without multi-tenant organizations is a blocker with a direct fix', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  const signal = configReviewSignals(config).find((item) => item.id === 'product-shared-runtime-org-boundary')
  assert.ok(signal)
  assert.equal(signal.severity, 'blocker')
  const fix = configQuickFixes(config).find((item) => item.id === 'product-multi-tenant-boundary')
  assert.ok(fix)
  config = applyFix(config, fix)
  assert.equal(value(config, 'org.mode'), 'Multi-tenant organizations')
  assert.ok(!configReviewSignals(config).some((item) => item.id === 'product-shared-runtime-org-boundary'))
})

check('explicit Organization Off is not silently overridden when reusable shared runtime is selected', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'org.mode', 'Off')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  assert.equal(resolveScope(config, 'org.mode').active, false)
  assert.ok(configReviewSignals(config).some((item) => item.id === 'product-shared-runtime-org-boundary'))
  const fix = configQuickFixes(config).find((item) => item.id === 'product-multi-tenant-boundary')
  assert.ok(fix)
  config = applyFix(config, fix)
  assert.equal(resolveScope(config, 'org.mode').active, true)
  assert.equal(value(config, 'org.mode'), 'Multi-tenant organizations')
  assert.ok(!configReviewSignals(config).some((item) => item.id === 'product-shared-runtime-org-boundary'))
})

check('isolated deployment per organization supports shared-code reuse without requiring multi-tenant org scope', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  assert.equal(resolveScope(config, 'org.mode').active, false)
  assert.ok(!configReviewSignals(config).some((item) => item.id === 'product-shared-runtime-org-boundary'))
  assert.ok(!settingIsActive('product.isolationStrategy', config))
})

check('application-query-only isolation is a blocker for shared tenant runtimes and can be fixed', () => {
  let config = createProjectConfig('SaaS / Client Portal')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  config = setConfigValue(config, 'org.mode', 'Multi-tenant organizations')
  config = setConfigValue(config, 'product.isolationStrategy', 'Application query filters only')
  assert.ok(configReviewSignals(config).some((item) => item.id === 'product-query-filter-isolation'))
  const fix = configQuickFixes(config).find((item) => item.id === 'product-data-boundary')
  assert.ok(fix)
  config = applyFix(config, fix)
  assert.equal(value(config, 'product.isolationStrategy'), 'Database-enforced tenant context / RLS')
})

check('per-tenant source forks are an important architecture signal, not an accepted plug-and-play default', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  config = setConfigValue(config, 'product.sharedCore', 'Per-tenant code forks allowed')
  const signal = configReviewSignals(config).find((item) => item.id === 'product-tenant-forks')
  assert.ok(signal)
  assert.equal(signal.severity, 'important')
})

check('tenant-version branches are an important upgrade-drift signal', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  config = setConfigValue(config, 'product.versioning', 'Tenant-version branches allowed')
  assert.ok(configReviewSignals(config).some((item) => item.id === 'product-version-branches' && item.severity === 'important'))
})

check('white-label intent conflicts with product-only branding and is surfaced for review', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'White-label product')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  config = setConfigValue(config, 'product.brandingDepth', 'Product brand only')
  assert.ok(configReviewSignals(config).some((item) => item.id === 'product-white-label-branding'))
})

check('runtime plugin loading is treated as an explicit architecture review boundary', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  config = setConfigValue(config, 'product.extensionStrategy', 'Runtime plugin loading')
  assert.ok(configReviewSignals(config).some((item) => item.id === 'product-runtime-plugins'))
})

check('reusable architecture derives one productization phase before domain implementation', () => {
  let config = createProjectConfig('Government System')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  config = setConfigValue(config, 'org.mode', 'Multi-tenant organizations')
  const result = deriveImplementationRoadmap(config, [])
  const ids = result.phases.map((item) => item.id)
  assert.ok(ids.includes('productization'))
  assert.ok(ids.indexOf('productization') < ids.indexOf('domain-government'))
  assert.deepEqual(phaseById(result, 'domain-government').dependsOn, ['productization'])
})

check('productization roadmap encodes modules, configuration, provisioning, tenant isolation, and anti-fork proof', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  config = setConfigValue(config, 'org.mode', 'Multi-tenant organizations')
  const item = phaseById(deriveImplementationRoadmap(config, []), 'productization')
  assert.ok(item)
  assert.ok(item.deliverables.some((entry) => /module/i.test(entry)))
  assert.ok(item.deliverables.some((entry) => /configuration/i.test(entry)))
  assert.ok(item.deliverables.some((entry) => /provision/i.test(entry)))
  assert.ok(item.deliverables.some((entry) => /tenant data boundary/i.test(entry)))
  assert.ok(item.proof.some((entry) => /without cloning the repository/i.test(entry)))
})

check('reusable acceptance criteria require code-free onboarding and tenant module safety', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  const criteria = acceptanceCriteria(config)
  assert.ok(criteria.some((item) => /onboarded by configuration\/provisioning without cloning/i.test(item)))
  assert.ok(criteria.some((item) => /Disabling a tenant module/i.test(item)))
})

check('shared reusable architecture adds cross-tenant failure cases including jobs, exports, and configuration leakage', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'product.reuseIntent', 'Multi-organization platform')
  config = setConfigValue(config, 'org.mode', 'Multi-tenant organizations')
  const cases = edgeCases(config)
  assert.ok(cases.some((item) => /configuration must not leak/i.test(item)))
  assert.ok(cases.some((item) => /background job, report\/export, cache key/i.test(item)))
})

check('Project Context can flag multi-ministry reuse intent without mutating structured architecture', () => {
  const config = createProjectConfig('Custom / General')
  const before = JSON.stringify(config)
  const context = {
    building: 'One HRMS platform for multiple ministries with plug-and-play onboarding.',
    audience: 'Ministry HR teams', outcomes: '', priorities: '', nonNegotiables: '', avoid: '', dependencies: '', done: '',
  }
  const signal = projectContextReviewSignals(context, config).find((item) => item.id === 'context-reusable-product-mismatch')
  assert.ok(signal)
  assert.equal(signal.targetSection, 'productization')
  assert.equal(signal.severity, 'advisory')
  assert.equal(JSON.stringify(config), before)
})

check('productization settings enter the contract only when their reuse dependencies are active', () => {
  let config = createProjectConfig('Custom / General')
  const moduleSetting = configSettings.find((item) => item.id === 'product.moduleModel')
  assert.ok(moduleSetting)
  assert.equal(settingIncludedInContract(moduleSetting, config), false)
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  assert.equal(settingIncludedInContract(moduleSetting, config), true)
})

check('deriving reusable-product guidance is deterministic and does not mutate configuration', () => {
  let config = createProjectConfig('Internal / Operations')
  config = setConfigValue(config, 'product.reuseIntent', 'Reusable for similar organizations')
  config = setConfigValue(config, 'product.deploymentModel', 'Isolated deployment per organization')
  const before = JSON.stringify(config)
  const first = deriveImplementationRoadmap(config, [])
  const second = deriveImplementationRoadmap(config, [])
  assert.deepEqual(first, second)
  assert.equal(JSON.stringify(config), before)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Reusable Product Architecture regression checks passed.\n`)
