import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-roadmap-test-build')
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
const flows = require(join(buildDir, 'coreFlows.js'))
const roadmap = require(join(buildDir, 'roadmap.js'))
const { createProjectConfig, setScopeChoice, setConfigValue } = engine
const { createCoreFlow, coreFlowFromTemplate, suggestedCoreFlowTemplates } = flows
const { deriveImplementationRoadmap, implementationRoadmapMarkdown, implementationRoadmapPrompt } = roadmap

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}
const phaseIds = (result) => result.phases.map((item) => item.id)
const phaseById = (result, id) => result.phases.find((item) => item.id === id)

console.log('\nBlueprint v0.23 Implementation Roadmap regression suite\n')

check('neutral Custom / General gets only cross-cutting phases and invents no product domain', () => {
  const result = deriveImplementationRoadmap(createProjectConfig('Custom / General'), [])
  assert.ok(phaseIds(result).includes('foundation'))
  assert.ok(phaseIds(result).includes('hardening'))
  assert.ok(phaseIds(result).includes('release'))
  assert.deepEqual(phaseIds(result), ['foundation', 'hardening', 'release'])
  assert.ok(!phaseById(result, 'foundation').deliverables.some((item) => /data model|migration/i.test(item)))
})

check('Government recommendation never creates a document-routing roadmap phase', () => {
  const config = createProjectConfig('Government System')
  const result = deriveImplementationRoadmap(config, [])
  assert.equal(phaseIds(result).includes('domain-government'), false)
  assert.equal(result.phases.some((phase) => /document routing|government document/i.test(`${phase.title} ${phase.deliverables.join(' ')}`)), false)
})

check('explicit Booking scope derives booking domain before integration and release', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'On')
  const result = deriveImplementationRoadmap(config, [])
  const ids = phaseIds(result)
  assert.ok(ids.includes('domain-booking'))
  assert.ok(ids.includes('integrations'))
  assert.ok(ids.indexOf('domain-booking') < ids.indexOf('integrations'))
  assert.ok(ids.indexOf('integrations') < ids.indexOf('hardening'))
  assert.equal(ids.at(-1), 'release')
})

check('explicit Payments Off removes payment integration proof without removing booking domain', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'Off')
  const result = deriveImplementationRoadmap(config, [])
  assert.ok(phaseIds(result).includes('domain-booking'))
  const integrations = phaseById(result, 'integrations')
  if (integrations) assert.ok(!integrations.sources.includes('App Setup: pack.payments'))
})

check('single-location inventory roadmap does not invent an inter-location transfer phase', () => {
  let config = createProjectConfig('Inventory / POS')
  config = setScopeChoice(config, 'pack.inventory', 'On')
  config = setConfigValue(config, 'inventory.locations', 'Single location')
  const result = deriveImplementationRoadmap(config, [])
  const inventory = phaseById(result, 'domain-inventory')
  assert.ok(inventory)
  assert.ok(!inventory.deliverables.some((item) => /inter-location/i.test(item)))
})

check('an authored complete Core Flow becomes a journey phase with ordered user-authored steps', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const template = suggestedCoreFlowTemplates(config).find((item) => item.templateId === 'booking-customer')
  assert.ok(template)
  const flow = coreFlowFromTemplate(template)
  const result = deriveImplementationRoadmap(config, [flow])
  const journey = phaseById(result, `journey-${flow.id}`)
  assert.ok(journey)
  assert.equal(journey.title, 'Implement: Customer booking')
  assert.equal(journey.deliverables[0], flow.steps[0])
  assert.ok(journey.proof.some((item) => item.includes(flow.successState)))
})

check('incomplete Core Flows are blocking clarification gates rather than silently treated as complete implementation truth', () => {
  const flow = createCoreFlow({ title: 'Thin flow', actor: 'User', steps: ['Only one step'] })
  const result = deriveImplementationRoadmap(createProjectConfig('Custom / General'), [flow])
  const journey = phaseById(result, `journey-${flow.id}`)
  assert.ok(journey)
  assert.equal(journey.blocking, true)
  assert.match(journey.title, /^Clarify & implement:/)
  assert.ok(journey.proof.some((item) => item.startsWith('Preflight gap:')))
  assert.equal(result.incompleteFlowCount, 1)
})

check('a flow never mutates or activates App Setup scope while deriving roadmap', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'pack.payments', 'Off')
  const before = JSON.stringify(config)
  const flow = createCoreFlow({ title: 'Pay supplier', actor: 'Staff', goal: 'Pay a supplier', startingPoint: 'Invoice open', steps: ['Review invoice', 'Submit payment'], successState: 'Supplier paid' })
  deriveImplementationRoadmap(config, [flow])
  assert.equal(JSON.stringify(config), before)
})

check('explicit mission-critical admin scope derives access, operations, hardening, and release dependencies', () => {
  let config = createProjectConfig('Government System')
  config = setScopeChoice(config, 'admin.enabled', 'On')
  config = setScopeChoice(config, 'pack.government', 'On')
  const result = deriveImplementationRoadmap(config, [])
  const ids = phaseIds(result)
  assert.ok(ids.includes('access'))
  assert.ok(ids.includes('operations'))
  assert.ok(ids.includes('hardening'))
  assert.deepEqual(phaseById(result, 'release').dependsOn, ['hardening'])
})

check('unsafe blocker-level configuration creates a blocking preflight phase', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setConfigValue(config, 'booking.conflictPolicy', 'UI check only')
  const result = deriveImplementationRoadmap(config, [])
  const preflight = phaseById(result, 'preflight')
  assert.ok(preflight)
  assert.equal(preflight.blocking, true)
  assert.ok(preflight.deliverables.some((item) => /booking/i.test(item)))
  assert.deepEqual(phaseById(result, 'foundation').dependsOn, ['preflight'])
})

check('roadmap phase dependencies reference only real earlier phases', () => {
  let config = createProjectConfig('Clinic / EMR')
  config = setScopeChoice(config, 'pack.clinic', 'On')
  const template = suggestedCoreFlowTemplates(config).find((item) => item.templateId === 'clinic-encounter')
  const flowsForScenario = template ? [coreFlowFromTemplate(template)] : []
  const result = deriveImplementationRoadmap(config, flowsForScenario)
  const seen = new Set()
  for (const item of result.phases) {
    for (const dependency of item.dependsOn) assert.ok(seen.has(dependency), `${item.id} depends on missing/later phase ${dependency}`)
    seen.add(item.id)
  }
})

check('roadmap Markdown exposes dependencies, deliverables, proof, and derivation evidence', () => {
  let config = createProjectConfig('E-commerce')
  config = setScopeChoice(config, 'pack.commerce', 'On')
  const result = deriveImplementationRoadmap(config, [])
  const output = implementationRoadmapMarkdown(result)
  assert.match(output, /Phase 1 — Foundation & architecture/)
  assert.match(output, /- Deliverables:/)
  assert.match(output, /- Proof:/)
  assert.match(output, /- Derived from:/)
})

check('roadmap AI prompt is explicit sequencing guidance and contains proof-before-advancing gates', () => {
  let config = createProjectConfig('Tournament / Event')
  config = setScopeChoice(config, 'pack.tournament', 'On')
  const result = deriveImplementationRoadmap(config, [])
  const output = implementationRoadmapPrompt(result)
  assert.match(output, /PHASE 1 — Foundation & architecture/)
  assert.match(output, /Proof before advancing:/)
  assert.match(output, /PHASE \d+ — Release & operational verification/)
})

check('deriving a roadmap is deterministic for the same config and authored flows', () => {
  const config = createProjectConfig('Directory / Marketplace')
  const flow = createCoreFlow({ id: 'flow-stable', title: 'Find listing', actor: 'Visitor', goal: 'Find a relevant listing', startingPoint: 'Directory home', steps: ['Search', 'Filter', 'Open listing'], successState: 'Relevant listing is visible', createdAt: '2026-09-03T00:00:00.000Z', updatedAt: '2026-09-03T00:00:00.000Z' })
  const first = deriveImplementationRoadmap(config, [flow])
  const second = deriveImplementationRoadmap(config, [flow])
  assert.deepEqual(first, second)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Implementation Roadmap regression checks passed.\n`)
