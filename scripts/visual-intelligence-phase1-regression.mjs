import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v026-test-build')
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
  'src/data/promptCompiler.ts',
  'src/data/catalog.ts',
  'src/data/visualDna.ts',
  'src/data/visualReview.ts',
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
const compiler = require(join(buildDir, 'promptCompiler.js'))
const catalog = require(join(buildDir, 'catalog.js'))
const visual = require(join(buildDir, 'visualDna.js'))
const visualReview = require(join(buildDir, 'visualReview.js'))

const {
  createProjectConfig,
  effectiveConfigValue,
  normalizeProjectConfig,
  resolveScope,
  setConfigValue,
  setScopeChoice,
} = engine
const { contextGapDecisions, projectContextReviewSignals } = intelligence
const { implementationConfigContractPrompt, mediaDirectionPrompt, copyDirectionPrompt } = compiler
const { normalizeDna, visualDnaContract } = visual
const { visualContradictionSignals } = visualReview

const adwContext = {
  building: 'A public website for ADW Banawe car accessories shop.',
  audience: 'Customers looking for car accessories and upgrades.',
  outcomes: 'Visitors should view products, find the shop location, get directions, and contact the store.',
  priorities: 'Visual impact, usefulness, and easy mobile use.',
  nonNegotiables: 'Do not invent checkout or accounts.',
  avoid: 'Generic SaaS copy and irrelevant tech screenshots.',
  dependencies: '',
  done: 'A convincing real-business website ready to deploy.',
}

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}

console.log('\nBlueprint v0.26 Intelligence Cleanup regression suite\n')

check('ADW context triggers Recommended setup incomplete without activating marketing scope', () => {
  const config = createProjectConfig('Custom / General')
  const signal = projectContextReviewSignals(adwContext, config).find((item) => item.id === 'context-recommended-setup-incomplete')
  assert.ok(signal)
  assert.equal(signal.severity, 'important')
  assert.equal(resolveScope(config, 'pack.portfolio').active, false)
  assert.equal(resolveScope(config, 'landing.enabled').active, false)
  assert.equal(resolveScope(config, 'pack.commerce').active, false)
})

check('Balanced context completion is provenance-bearing and held until public scope exists', () => {
  const config = createProjectConfig('Custom / General')
  const decisions = contextGapDecisions(adwContext, config)
  assert.ok(decisions.length >= 3)
  assert.ok(decisions.every((item) => item.source === 'context_completion'))
  assert.ok(decisions.every((item) => item.status === 'held_for_scope'))
  assert.equal(resolveScope(config, 'pack.commerce').active, false)
  assert.equal(resolveScope(config, 'pack.payments').active, false)
  assert.equal(resolveScope(config, 'admin.enabled').active, false)
})

check('Strict context completion infers nothing', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'intelligence.contextGapMode', 'Strict')
  assert.deepEqual(contextGapDecisions(adwContext, config), [])
})

check('Explicit public marketing scope releases presentation gaps without adding functional modules', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'pack.portfolio', 'On')
  const decisions = contextGapDecisions(adwContext, config)
  assert.ok(decisions.length >= 3)
  assert.ok(decisions.every((item) => item.status === 'applied'))
  assert.equal(resolveScope(config, 'pack.commerce').active, false)
  assert.equal(resolveScope(config, 'pack.payments').active, false)
})

check('Proactive mode may add presentation detail but still cannot create checkout/payments/admin scope', () => {
  let config = createProjectConfig('Custom / General')
  config = setConfigValue(config, 'intelligence.contextGapMode', 'Proactive')
  const decisions = contextGapDecisions(adwContext, config)
  assert.ok(decisions.some((item) => item.id === 'context-gap-placeholder-content'))
  for (const id of ['pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled']) assert.equal(resolveScope(config, id).active, false)
})

check('Media Assistance persists and compiles with scope-safe imagery language', () => {
  let config = createProjectConfig('Portfolio / Marketing')
  config = setConfigValue(config, 'media.placeholderStyle', 'Studio product')
  config = setConfigValue(config, 'media.placeholderCoverage', 'Rich presentation')
  config = normalizeProjectConfig(config)
  assert.equal(effectiveConfigValue(config, 'media.generatePlaceholders'), true)
  assert.equal(effectiveConfigValue(config, 'media.placeholderStyle'), 'Studio product')
  assert.match(mediaDirectionPrompt(config), /Studio product/)
  assert.match(mediaDirectionPrompt(config), /Rich presentation/)
  assert.match(mediaDirectionPrompt(config), /Do not invent new product modules/i)
  assert.match(implementationConfigContractPrompt(config), /MEDIA DIRECTION/)
})

check('Audience-aware copy guardrails compile explicit customer/developer separation', () => {
  const config = createProjectConfig('Portfolio / Marketing')
  const output = copyDirectionPrompt(config)
  assert.match(output, /Customer-facing headings/i)
  assert.match(output, /current scope/)
  assert.match(output, /implementation foundation/)
  assert.match(output, /Internal Blueprint, developer/i)
})

check('Typography weights normalize, persist, and export all three roles', () => {
  const dna = normalizeDna({ headingWeight: 800, bodyWeight: 400, uiWeight: 600, headingWeightPreference: 'Extra Bold', bodyWeightPreference: 'Regular', uiWeightPreference: 'Semibold', weightContrast: 'Strong' })
  assert.equal(dna.headingWeight, 800)
  assert.equal(dna.bodyWeight, 400)
  assert.equal(dna.uiWeight, 600)
  const contract = visualDnaContract(dna)
  assert.match(contract, /Heading weight: 800 · Extra Bold/)
  assert.match(contract, /Body weight: 400 · Regular/)
  assert.match(contract, /UI \/ control weight: 600 · Semibold/)
  assert.match(contract, /Weight contrast: Strong/)
})

check('Glass exclusion + Localized Glass Panel produces a deterministic contradiction', () => {
  const glass = catalog.patterns.find((item) => item.id === 'glass-panel')
  assert.ok(glass)
  const dna = normalizeDna({ visualAntiPatterns: ['Glassmorphism'], glassUsage: 'None' })
  const signals = visualContradictionSignals(dna, [glass])
  assert.ok(signals.some((item) => item.id === 'visual-conflict-glass-exclusion'))
})

check('Physical automotive retail + product screenshots produces imagery contradiction', () => {
  const dna = normalizeDna({ imageryMode: 'Product screenshots' })
  const signals = visualContradictionSignals(dna, [], adwContext)
  assert.ok(signals.some((item) => item.id === 'visual-conflict-physical-retail-screenshots'))
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Intelligence Cleanup regression checks passed.\n`)
