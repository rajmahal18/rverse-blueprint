import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-core-flow-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []


rmSync(buildDir, { recursive: true, force: true })
execFileSync(compilerCommand, [
  ...compilerPrefix,
  'src/data/configurator.ts',
  'src/data/coreFlows.ts',
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
const { createProjectConfig, setScopeChoice } = engine
const { coreFlowAcceptanceCriteria, coreFlowFailureCases, coreFlowFromTemplate, coreFlowMarkdown, coreFlowsPrompt, coreFlowQuality, createCoreFlow, normalizeCoreFlows, suggestedCoreFlowTemplates } = flows

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}
const starter = (config, templateId) => suggestedCoreFlowTemplates(config).find((item) => item.templateId === templateId)

console.log('\nBlueprint v0.22 Core Flows regression suite\n')

check('neutral Custom / General does not invent workflow starters', () => {
  const config = createProjectConfig('Custom / General')
  assert.deepEqual(suggestedCoreFlowTemplates(config), [])
})

check('booking starters are suggestions derived only from already-active scope', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'On')
  const ids = suggestedCoreFlowTemplates(config).map((item) => item.templateId)
  assert.ok(ids.includes('booking-customer'))
  assert.ok(ids.includes('payment-checkout'))
})

check('explicit payment Off removes the payment starter without affecting booking', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'Off')
  const ids = suggestedCoreFlowTemplates(config).map((item) => item.templateId)
  assert.ok(ids.includes('booking-customer'))
  assert.ok(!ids.includes('payment-checkout'))
})

check('creating a starter does not mutate the source configuration', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const before = JSON.stringify(config)
  const template = starter(config, 'booking-customer')
  assert.ok(template)
  const flow = coreFlowFromTemplate(template)
  assert.equal(JSON.stringify(config), before)
  assert.equal(flow.title, 'Customer booking')
  assert.notEqual(flow.id, template.templateId)
})

check('flow normalization trims user content and removes blank list items', () => {
  const [flow] = normalizeCoreFlows([{
    id: ' flow-a ', title: ' Test flow ', actor: ' Staff ', goal: ' Do work ', startingPoint: ' Start ',
    steps: [' One ', ' ', ' Two '], successState: ' Done ', failureStates: ['', ' Retry '], notes: ' Note ', createdAt: '2026-09-03T00:00:00.000Z', updatedAt: '2026-09-03T00:00:00.000Z',
  }])
  assert.equal(flow.id, 'flow-a')
  assert.deepEqual(flow.steps, ['One', 'Two'])
  assert.deepEqual(flow.failureStates, ['Retry'])
  assert.equal(flow.actor, 'Staff')
})

check('flow quality requires actor, goal, starting point, two steps, success state, and title', () => {
  const incomplete = createCoreFlow({ title: 'Thin flow', actor: 'User', steps: ['Only step'] })
  const result = coreFlowQuality(incomplete)
  assert.equal(result.complete, false)
  assert.ok(result.missing.includes('goal'))
  assert.ok(result.missing.includes('starting point'))
  assert.ok(result.missing.includes('at least 2 main steps'))
  assert.ok(result.missing.includes('success state'))
})

check('booking starter is implementation-ready and includes recovery behavior', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const template = starter(config, 'booking-customer')
  assert.ok(template)
  const flow = coreFlowFromTemplate(template)
  const quality = coreFlowQuality(flow)
  assert.equal(quality.complete, true)
  assert.ok(flow.failureStates.length >= 1)
})

check('Markdown output preserves ordered main path and recovery states', () => {
  const flow = createCoreFlow({
    title: 'Submit record', actor: 'Staff', goal: 'Submit a valid record', startingPoint: 'Draft is open',
    steps: ['Review fields', 'Submit record'], successState: 'Record is accepted', failureStates: ['Validation fails → return to invalid fields'], notes: 'Server validation wins.',
  })
  const output = coreFlowMarkdown(flow)
  assert.match(output, /1\. Review fields/)
  assert.match(output, /2\. Submit record/)
  assert.match(output, /Failure \/ recovery states:/)
  assert.match(output, /Server validation wins\./)
})

check('AI flow prompt refuses to invent major workflow when no flows are authored', () => {
  assert.match(coreFlowsPrompt([]), /Do not invent major workflow steps/)
})

check('AI flow prompt includes actor, goal, main path, success, and recovery for authored flows', () => {
  let config = createProjectConfig('Clinic / EMR')
  config = setScopeChoice(config, 'pack.clinic', 'On')
  const template = starter(config, 'clinic-encounter')
  assert.ok(template)
  const output = coreFlowsPrompt([coreFlowFromTemplate(template)])
  assert.match(output, /FLOW 1 — Patient encounter/)
  assert.match(output, /Actor: Authorized clinical staff/)
  assert.match(output, /Main path:/)
  assert.match(output, /Success state:/)
  assert.match(output, /Failure\/recovery:/)
})


check('authored flows extend acceptance criteria without changing App Setup scope', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const template = starter(config, 'booking-customer')
  assert.ok(template)
  const flow = coreFlowFromTemplate(template)
  const before = JSON.stringify(config)
  const criteria = coreFlowAcceptanceCriteria([flow])
  assert.equal(criteria.length, 1)
  assert.match(criteria[0], /Core flow “Customer booking”/)
  assert.equal(JSON.stringify(config), before)
})

check('failure/recovery states become explicit edge-case proof obligations', () => {
  const flow = createCoreFlow({ title: 'External sync', actor: 'Staff', goal: 'Sync a record', startingPoint: 'Record is ready', steps: ['Submit sync', 'Receive result'], successState: 'Record is synced', failureStates: ['Provider timeout → retain retryable pending state', 'Duplicate callback → reconcile idempotently'] })
  const cases = coreFlowFailureCases([flow])
  assert.equal(cases.length, 2)
  assert.match(cases[0], /External sync — Provider timeout/)
  assert.match(cases[1], /Duplicate callback/)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Core Flows regression checks passed.\n`)
