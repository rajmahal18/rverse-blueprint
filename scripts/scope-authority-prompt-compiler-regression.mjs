import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-scope-compiler-test-build')
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
  'src/data/coreFlows.ts',
  'src/data/roadmap.ts',
  'src/data/promptCompiler.ts',
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
const intelligence = require(join(buildDir, 'intelligence.js'))
const roadmap = require(join(buildDir, 'roadmap.js'))
const compiler = require(join(buildDir, 'promptCompiler.js'))

const {
  configSettings,
  createProjectConfig,
  isScopeSetting,
  resolveScope,
  scopeIntegrityDiagnostics,
  setConfigValue,
  setScopeChoice,
} = engine
const { acceptanceCriteria, edgeCases, projectContextReviewSignals } = intelligence
const { deriveImplementationRoadmap } = roadmap
const { compileScopeContract, fullBlueprintReferencePrompt, implementationConfigContractPrompt, scopeContractPrompt } = compiler

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}

console.log('\nBlueprint v0.25 Scope Authority + Prompt Compiler regression suite\n')

check('Government app recommends document workflow but does not activate it', () => {
  const config = createProjectConfig('Government System', 'Recommended')
  const resolution = resolveScope(config, 'pack.government')
  assert.equal(resolution.state, 'suggested')
  assert.equal(resolution.active, false)
  assert.ok(['app_type_default', 'recommendation'].includes(resolution.activationSource))
  assert.equal(deriveImplementationRoadmap(config, []).phases.some((phase) => phase.id === 'domain-government'), false)
  assert.equal(acceptanceCriteria(config).some((item) => /document routing|public tracking/i.test(item)), false)
  assert.equal(edgeCases(config).some((item) => /document routing|routing slip|tracking number/i.test(item)), false)
})

check('explicit document workflow becomes ON with explicit provenance', () => {
  let config = createProjectConfig('Government System')
  config = setScopeChoice(config, 'pack.government', 'On')
  const resolution = resolveScope(config, 'pack.government')
  assert.equal(resolution.state, 'on')
  assert.equal(resolution.active, true)
  assert.equal(resolution.activationSource, 'explicit_user_selection')
  assert.ok(deriveImplementationRoadmap(config, []).phases.some((phase) => phase.id === 'domain-government'))
})

check('private signed-in product can require authentication as a hard dependency', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'app.accessShape', 'Private')
  const resolution = resolveScope(config, 'login.enabled')
  assert.equal(resolution.state, 'required')
  assert.equal(resolution.active, true)
  assert.equal(resolution.activationSource, 'required_dependency')
  assert.match(resolution.reason, /identity boundary|Protected access shape/i)
})

check('Project Context can flag HRMS intent without creating HR or government workflow scope', () => {
  const config = createProjectConfig('Government System')
  const context = {
    building: 'BARMM ministries/agencies HRMS',
    audience: 'BARMM employees',
    outcomes: 'Employee records, leave, attendance and payroll across ministries.',
    priorities: 'Ease of use', nonNegotiables: '', avoid: '', dependencies: '', done: '',
  }
  const signal = projectContextReviewSignals(context, config).find((item) => item.id === 'context-hrms-structured-scope-mismatch')
  assert.ok(signal)
  assert.equal(signal.severity, 'important')
  assert.equal(resolveScope(config, 'pack.government').active, false)
})

check('Recommended profile may suggest quality/scope choices but never activates optional business packs', () => {
  const config = createProjectConfig('Government System', 'Recommended')
  const business = configSettings.filter((item) => item.section === 'business' && isScopeSetting(item.id))
  assert.equal(business.some((item) => resolveScope(config, item.id).active), false)
  assert.ok(business.some((item) => resolveScope(config, item.id).state === 'suggested'))
})

check('every active scope item has valid implementation authority', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setConfigValue(config, 'booking.paymentPolicy', 'Deposit required')
  const valid = new Set(['explicit_user_selection', 'persisted_explicit_selection', 'required_dependency'])
  for (const item of configSettings.filter((setting) => isScopeSetting(setting.id))) {
    const resolution = resolveScope(config, item.id)
    if (resolution.active) assert.ok(valid.has(resolution.activationSource), `${item.id} activated from ${resolution.activationSource}`)
  }
  assert.deepEqual(scopeIntegrityDiagnostics(config), [])
})

check('explicitly excluded Government workflow cannot be resurrected downstream', () => {
  let config = createProjectConfig('Government System')
  config = setScopeChoice(config, 'pack.government', 'Off')
  const roadmapResult = deriveImplementationRoadmap(config, [])
  assert.equal(roadmapResult.phases.some((phase) => phase.id === 'domain-government'), false)
  assert.equal(acceptanceCriteria(config).some((item) => /document routing|public tracking/i.test(item)), false)
  assert.equal(edgeCases(config).some((item) => /document routing|routing slip|tracking number/i.test(item)), false)
  const implementation = implementationConfigContractPrompt(config)
  assert.match(implementation, /EXPLICITLY EXCLUDED — DO NOT BUILD/)
  assert.match(implementation, /Government & document workflow/)
  assert.doesNotMatch(implementation, /Document routing & accountability/)
})

check('compiled implementation contract is substantially shorter than full Blueprint reference', () => {
  let config = createProjectConfig('Government System')
  for (const id of ['pack.government', 'pack.reporting', 'admin.enabled']) config = setScopeChoice(config, id, 'On')
  config = setConfigValue(config, 'app.accessShape', 'Private')
  config = setConfigValue(config, 'nav.primary', 'Top navigation')
  config = setConfigValue(config, 'nav.mobile', 'Drawer')
  config = setConfigValue(config, 'content.aiSlop', 'None')
  const compact = implementationConfigContractPrompt(config)
  const full = fullBlueprintReferencePrompt(config)
  const compactLines = compact.split('\n').length
  const fullLines = full.split('\n').length
  assert.ok(fullLines > 300, `Expected detailed reference, got ${fullLines} lines`)
  assert.ok(compactLines < fullLines * 0.35, `Compiler did not compress enough: ${compactLines}/${fullLines} lines`)
  assert.match(scopeContractPrompt(config), /SUGGESTED BUT NOT INCLUDED/)
})

check('explicit non-default choices survive prompt compression', () => {
  let config = createProjectConfig('Government System')
  config = setScopeChoice(config, 'login.enabled', 'On')
  config = setConfigValue(config, 'session.timeout', 'Relaxed')
  config = setConfigValue(config, 'nav.primary', 'Top navigation')
  config = setConfigValue(config, 'nav.mobile', 'Drawer')
  config = setConfigValue(config, 'content.aiSlop', 'None')
  const output = implementationConfigContractPrompt(config)
  assert.match(output, /Session timeout: Relaxed/)
  assert.match(output, /Primary app navigation: Top navigation/)
  assert.match(output, /Mobile navigation: Drawer/)
  assert.match(output, /AI-slop tolerance: None/)
  const scope = compileScopeContract(config)
  assert.ok(scope.build.includes('Login page'))
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Scope Authority + Prompt Compiler regression checks passed.\n`)
