import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v028-test-build')
const localTsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const hasLocalTsc = existsSync(localTsc)
const compilerCommand = hasLocalTsc ? process.execPath : (process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const compilerPrefix = hasLocalTsc ? [localTsc] : []

rmSync(buildDir, { recursive: true, force: true })
execFileSync(compilerCommand, [
  ...compilerPrefix,
  'src/data/visualDna.ts',
  'src/data/visualSuggestions.ts',
  'src/data/visualDirector.ts',
  'src/data/configurator.ts',
  'src/data/catalog.ts',
  'src/data/consistency.ts',
  'src/data/patternIntelligence.ts',
  '--target', 'ES2022',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--skipLibCheck',
  '--strict',
  '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const visual = require(join(buildDir, 'visualDna.js'))
const directorModule = require(join(buildDir, 'visualDirector.js'))
const intelligenceModule = require(join(buildDir, 'patternIntelligence.js'))
const engine = require(join(buildDir, 'configurator.js'))
const catalog = require(join(buildDir, 'catalog.js'))
const { normalizeDna } = visual
const { synthesizeVisualDirector } = directorModule
const { patternExplorerIntelligence, patternCompatibility, patternIntelligencePrompt } = intelligenceModule
const { createProjectConfig, resolveScope } = engine
const { patterns } = catalog

const input = (appType, projectContext, dna = {}) => {
  const normalized = normalizeDna(dna)
  const context = { appType, activePacks: [], projectContext, dna: normalized }
  return { context, director: synthesizeVisualDirector({ ...context, media: { generatePlaceholders: true, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage' } }) }
}

const explore = (appType, projectContext, dna = {}, history = []) => {
  const { context, director } = input(appType, projectContext, dna)
  const config = createProjectConfig(appType)
  return { config, director, result: patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: [], history }) }
}

let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`✓ ${name}`) }
console.log('\nBlueprint v0.28 Pattern Explorer 2.0 + Anti-Homogeneity regression suite\n')

const adw = explore('Custom / General', 'ADW Banawe automotive car accessories retail website with product imagery, shop location, directions, and contact.')
const clinic = explore('Clinic / EMR', 'Operational clinic EMR for patient intake, encounters, orders, labs, medicines, and staff.')
const hrms = explore('Government System', 'Government HRMS for workforce records, personnel actions, approvals, and ministry staff.')
const booking = explore('Booking / Scheduling', 'Mobile pickleball court booking where customers pick courts and time slots quickly.')
const sports = explore('Tournament / Event', 'Live pickleball tournament with schedules, scores, standings, brackets, and event identity.')
const portfolio = explore('Portfolio / Marketing', 'Developer portfolio with project case studies, authored interactions, and controlled experimentation.')

check('Best Match is the Visual Director synthesis rather than a disconnected preset', () => {
  const best = adw.result.recommendations[0]
  assert.equal(best.tier, 'best_match')
  assert.equal(best.name, 'Mechanical Editorial')
  assert.equal(best.sourceDirectionId, adw.director.baseDirectionId)
})

check('Pattern Explorer returns Best Match plus coherent alternatives with rationale and drawback', () => {
  assert.equal(adw.result.recommendations.length, 4)
  assert.equal(adw.result.recommendations.filter((item) => item.tier === 'good_fit').length, 2)
  adw.result.recommendations.forEach((item) => {
    assert.ok(item.whyItFits.length > 30)
    assert.ok(item.drawback.length > 25)
    assert.ok(['Familiar', 'Moderately distinct', 'Distinct', 'Bold / niche'].includes(item.originality))
  })
})

check('Canonical benchmark domains do not collapse into one Best Match family', () => {
  const names = [adw, clinic, hrms, booking, sports, portfolio].map((item) => item.result.recommendations[0].name)
  assert.equal(new Set(names).size, 6)
})

check('Pattern bundles are small and only contain currently compatible patterns', () => {
  for (const sample of [adw, clinic, hrms, booking, sports, portfolio]) {
    const best = sample.result.recommendations[0]
    assert.ok(best.bundle.patterns.length <= 4)
    best.bundle.patterns.forEach((pattern) => assert.equal(patternCompatibility(pattern, best.proposedDna, sample.config).compatible, true))
  }
})

check('Glass pattern conflicts deterministically with explicit Glassmorphism exclusion', () => {
  const glass = patterns.find((item) => item.id === 'glass-panel')
  assert.ok(glass)
  const compat = patternCompatibility(glass, normalizeDna({ visualAntiPatterns: ['Glassmorphism'] }), createProjectConfig())
  assert.equal(compat.compatible, false)
  assert.equal(compat.state, 'conflict')
  assert.match(compat.reason, /Glassmorphism/i)
})

check('Excessive-animation exclusion surfaces motion caveats instead of pretending perfect compatibility', () => {
  const motion = patterns.find((item) => item.id === 'mask-reveal')
  assert.ok(motion)
  const compat = patternCompatibility(motion, normalizeDna({ visualAntiPatterns: ['Excessive animations'] }), createProjectConfig())
  assert.equal(compat.compatible, true)
  assert.equal(compat.state, 'warning')
})

check('Anti-Homogeneity reports HIGH when structural dimensions repeat a previous project', () => {
  const { context, director } = input('Custom / General', 'Automotive retail website.')
  const config = createProjectConfig('Custom / General')
  const result = patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: ['editorial-grid', 'no-card'], history: [{ id: 'old', name: 'Old automotive-like site', dna: director.proposedDna, selectedPatternIds: ['editorial-grid', 'no-card'] }] })
  assert.equal(result.antiHomogeneity.level, 'HIGH')
  assert.ok((result.antiHomogeneity.similarity ?? 0) >= 72)
  assert.ok(result.antiHomogeneity.repeatedTraits.length >= 5)
  assert.ok(result.antiHomogeneity.diversification.length > 0)
})

check('Anti-Homogeneity avoids random variation when current direction is already distinct', () => {
  const history = [{ id: 'clinic', name: 'Clinical system', dna: clinic.director.proposedDna, selectedPatternIds: [] }]
  const result = explore('Tournament / Event', 'Live competitive sports tournament.', {}, history).result
  assert.equal(result.antiHomogeneity.level, 'LOW')
  assert.match(result.antiHomogeneity.diversification[0], /Preserve contextual coherence/i)
})

check('Best Match preserves explicit typography weights through recommendation application', () => {
  const sample = explore('Custom / General', 'Automotive retail site.', { headingWeightPreference: 'Black', headingWeight: 900, bodyWeightPreference: 'Medium', bodyWeight: 500, uiWeightPreference: 'Bold', uiWeight: 700 })
  const best = sample.result.recommendations[0]
  assert.equal(best.proposedDna.headingWeight, 900)
  assert.equal(best.proposedDna.bodyWeight, 500)
  assert.equal(best.proposedDna.uiWeight, 700)
  assert.ok(best.compatibilityNotes.some((note) => /heading weight 900/i.test(note)))
})

check('Alternative directions are reconciled against hard anti-pattern constraints', () => {
  const sample = explore('Portfolio / Marketing', 'Expressive portfolio.', { designAutonomy: 'Art Director', visualAntiPatterns: ['Glassmorphism', 'Gradient-heavy UI', 'Excessive pills', 'Excessive animations'] })
  sample.result.recommendations.forEach((item) => {
    assert.equal(item.proposedDna.glassUsage, 'None')
    assert.equal(item.proposedDna.gradientUsage, 'None')
    assert.notEqual(item.proposedDna.pillUsage, 'Frequent')
    assert.notEqual(item.proposedDna.motionAmount, 'High')
  })
})

check('Pattern intelligence prompt carries recommendation + anti-homogeneity guidance', () => {
  const prompt = patternIntelligencePrompt(adw.result)
  assert.match(prompt, /PATTERN EXPLORER 2.0/)
  assert.match(prompt, /Recommended direction: Mechanical Editorial/)
  assert.match(prompt, /ANTI-HOMOGENEITY REVIEW/)
  assert.match(prompt, /never authorize functional scope/i)
})

check('Pattern recommendation intelligence cannot mutate functional scope', () => {
  const config = createProjectConfig('Custom / General')
  const before = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled'].map((id) => resolveScope(config, id).active)
  const { context, director } = input('Custom / General', 'Automotive retail website with products and location.')
  patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: [] })
  const after = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled'].map((id) => resolveScope(config, id).active)
  assert.deepEqual(after, before)
  assert.ok(after.every((active) => active === false))
})

check('Functional pattern incompatibility is omitted from bundle instead of changing App Setup', () => {
  const best = adw.result.recommendations[0]
  assert.ok(best.bundle.omitted.some((item) => item.id === 'hero-header'))
  assert.equal(resolveScope(adw.config, 'landing.enabled').active, false)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Pattern Explorer 2.0 / Anti-Homogeneity regression checks passed.\n`)
