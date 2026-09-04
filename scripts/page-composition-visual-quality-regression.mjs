import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v029-test-build')
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
  'src/data/pageComposition.ts',
  '--target', 'ES2022',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--skipLibCheck',
  '--strict',
  '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const { normalizeDna } = require(join(buildDir, 'visualDna.js'))
const { synthesizeVisualDirector } = require(join(buildDir, 'visualDirector.js'))
const { patternExplorerIntelligence } = require(join(buildDir, 'patternIntelligence.js'))
const { pageCompositionIntelligence, pageCompositionPrompt } = require(join(buildDir, 'pageComposition.js'))
const { createProjectConfig, setScopeChoice, resolveScope } = require(join(buildDir, 'configurator.js'))
const { patterns } = require(join(buildDir, 'catalog.js'))

function sample(appType, projectContext, dnaPatch = {}, explicitPacks = []) {
  let config = createProjectConfig(appType)
  explicitPacks.forEach((id) => { config = setScopeChoice(config, id, 'On') })
  const dna = normalizeDna(dnaPatch)
  const context = { appType, activePacks: explicitPacks, projectContext, dna }
  const director = synthesizeVisualDirector({ ...context, media: { generatePlaceholders: true, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage' } })
  const patternIntelligence = patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: [], history: [] })
  return {
    config,
    director,
    patternIntelligence,
    result: pageCompositionIntelligence({ config, dna, director, patternIntelligence, projectContext, selectedPatternIds: [], visualContradictionCount: 0 }),
  }
}

let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`✓ ${name}`) }
console.log('\nBlueprint v0.29 Page Composition Intelligence + Visual Quality Review regression suite\n')

const adw = sample('Custom / General', 'ADW Banawe car accessories physical shop website. Customers should view products and upgrades, find the shop location, get directions, and contact the store.')
const clinic = sample('Clinic / EMR', 'Operational clinic EMR for patient intake, encounters, orders, results, medicines, referrals, and staff.', {}, ['pack.clinic'])
const hrms = sample('Government System', 'Government HRMS for personnel records, workforce actions, ministry staff, approvals, and employment history.', {}, ['pack.government'])
const booking = sample('Booking / Scheduling', 'Mobile pickleball court booking. Customers pick a court, date, and time slot quickly.', {}, ['pack.booking'])
const sports = sample('Tournament / Event', 'Live pickleball tournament with current scores, standings, schedules, brackets, and event identity.', {}, ['pack.tournament'])
const portfolio = sample('Portfolio / Marketing', 'Developer portfolio with real projects, case studies, authored interactions, and contact.', {}, ['pack.portfolio'])

check('ADW receives automotive storefront composition rather than a generic marketing template', () => {
  const home = adw.result.pages.find((page) => page.id === 'home')
  assert.ok(home)
  assert.match(home.visualAnchor, /automotive|product/i)
  assert.deepEqual(home.sections.slice(0, 3).map((item) => item.id), ['hero', 'categories', 'featured'])
  assert.ok(home.sections.some((item) => item.id === 'location'))
  assert.ok(home.avoid.some((item) => /Hero.*3 cards.*About.*Testimonials.*CTA/i.test(item)))
})

check('ADW visual page proposal remains advisory when Portfolio/Marketing scope is inactive', () => {
  assert.equal(resolveScope(adw.config, 'pack.portfolio').active, false)
  assert.ok(adw.result.pages.every((page) => page.scopeState === 'advisory'))
  assert.match(adw.result.scopeGuardrail, /do not activate App Setup scope/i)
})

check('Explicit Portfolio/Marketing scope turns the same visual planning into implementation guidance without inventing commerce', () => {
  const active = sample('Custom / General', 'ADW Banawe automotive shop website with products, location, directions, and contact.', {}, ['pack.portfolio'])
  assert.ok(active.result.pages.every((page) => page.scopeState === 'implementation'))
  assert.equal(resolveScope(active.config, 'pack.commerce').active, false)
  assert.equal(resolveScope(active.config, 'pack.payments').active, false)
  assert.ok(active.result.pages.find((page) => page.id === 'products').avoid.some((item) => /Checkout assumptions/i.test(item)))
})

check('Clinic composition is operational and structurally different from ADW', () => {
  assert.deepEqual(clinic.result.pages.map((page) => page.id), ['clinical-home', 'patient-record'])
  assert.match(clinic.result.pages[0].visualAnchor, /queue|state/i)
  assert.ok(clinic.result.pages[0].avoid.some((item) => /Marketing hero/i.test(item)))
  assert.notDeepEqual(clinic.result.pages[0].sections.map((item) => item.id), adw.result.pages[0].sections.map((item) => item.id))
})

check('Government HRMS composition is information-first and not clinic-shaped', () => {
  assert.deepEqual(hrms.result.pages.map((page) => page.id), ['workforce-home', 'employee-record'])
  assert.match(hrms.result.pages[0].primaryInteraction, /person|record|workforce/i)
  assert.ok(hrms.result.pages[0].sections.some((item) => item.id === 'people'))
  assert.notDeepEqual(hrms.result.pages[0].sections.map((item) => item.id), clinic.result.pages[0].sections.map((item) => item.id))
})

check('Booking composition makes availability the dominant task and explicitly recomposes mobile', () => {
  const page = booking.result.pages.find((item) => item.id === 'availability')
  assert.ok(page)
  assert.equal(page.sections[1].id, 'availability')
  assert.match(page.visualAnchor, /availability/i)
  assert.ok(page.mobileRecomposition.some((item) => /Never make users horizontally zoom/i.test(item)))
})

check('Booking review does not include payment UI when payment scope is inactive', () => {
  const review = booking.result.pages.find((item) => item.id === 'review')
  assert.ok(review)
  assert.equal(resolveScope(booking.config, 'pack.payments').active, false)
  assert.equal(review.sections.some((item) => item.id === 'payment'), false)
})

check('Sports composition prioritizes live state, standings, and score hierarchy', () => {
  const page = sports.result.pages[0]
  assert.deepEqual(page.sections.slice(0, 3).map((item) => item.id), ['live', 'next', 'standings'])
  assert.match(page.visualAnchor, /live|competitive/i)
  assert.ok(page.signaturePlacement.toLowerCase().includes('score'))
})

check('Portfolio composition uses authored storytelling and real work instead of identical card rows', () => {
  const page = portfolio.result.pages[0]
  assert.deepEqual(page.sections.map((item) => item.id), ['intro', 'work', 'proof', 'contact'])
  assert.match(page.visualAnchor, /work|project/i)
  assert.ok(page.avoid.some((item) => /Generic SaaS cards/i.test(item)))
})

check('Every canonical benchmark has explicit responsive recomposition rules', () => {
  for (const item of [adw, clinic, hrms, booking, sports, portfolio]) {
    assert.ok(item.result.pages.every((page) => page.mobileRecomposition.length >= 2))
    assert.ok(item.result.responsiveRules.some((rule) => /recomposed/i.test(rule)))
  }
})

check('Frontend quality contract forbids design-system-demo feel and generic premium clichés', () => {
  const criteria = adw.result.frontendQualityContract.criteria.join(' ')
  assert.match(criteria, /finished real product\/business surface/i)
  assert.match(criteria, /design-system demo/i)
  assert.match(criteria, /Premium.*composition.*typography.*spacing/i)
  assert.match(criteria, /Customer-facing copy/i)
})

check('Anti-AI-slop review is qualitative rather than fake numeric certainty', () => {
  const review = adw.result.visualQualityReview
  assert.ok(['CLEAR', 'REVIEW', 'HIGH RISK'].includes(review.status))
  assert.ok(review.dimensions.length >= 9)
  assert.ok(review.dimensions.every((item) => ['clear', 'review', 'risk'].includes(item.status)))
  assert.equal(Object.prototype.hasOwnProperty.call(review, 'score'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(review, 'confidence'), false)
})

check('Physical automotive screenshots produce an imagery/content quality warning', () => {
  const weak = sample('Custom / General', 'Automotive car accessories shop website with products and location.', { imageryMode: 'Product screenshots' })
  const imagery = weak.result.visualQualityReview.dimensions.find((item) => item.id === 'imagery')
  assert.ok(imagery)
  assert.equal(imagery.status, 'risk')
  assert.match(imagery.observation, /does not match the domain/i)
})

check('Originality above Safe requires a project-specific signature moment in the quality contract', () => {
  const criteria = portfolio.result.frontendQualityContract.criteria.join(' ')
  assert.match(criteria, /project-specific signature visual moment/i)
})

check('Composition prompt serializes page hierarchy, mobile recomposition, review, and quality contract', () => {
  const prompt = pageCompositionPrompt(adw.result)
  assert.match(prompt, /PAGE COMPOSITION INTELLIGENCE/)
  assert.match(prompt, /Section hierarchy:/)
  assert.match(prompt, /Mobile recomposition:/)
  assert.match(prompt, /ANTI-AI-SLOP \/ VISUAL QUALITY REVIEW/)
  assert.match(prompt, /FRONTEND QUALITY CONTRACT/)
  assert.match(prompt, /Advisory pages or sections do not activate App Setup scope/i)
})

check('Page composition intelligence cannot mutate optional functional scope', () => {
  const before = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'pack.clinic', 'pack.government', 'pack.tournament'].map((id) => resolveScope(adw.config, id).active)
  pageCompositionIntelligence({ config: adw.config, dna: normalizeDna({}), director: adw.director, patternIntelligence: adw.patternIntelligence, projectContext: 'Automotive retail website.' })
  const after = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'pack.clinic', 'pack.government', 'pack.tournament'].map((id) => resolveScope(adw.config, id).active)
  assert.deepEqual(after, before)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Page Composition Intelligence / Visual Quality Review regression checks passed.\n`)
