import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v030-test-build')
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
  'src/data/previewStudio.ts',
  '--target', 'ES2022',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--skipLibCheck',
  '--strict',
  '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const { normalizeDna, visualDnaContract } = require(join(buildDir, 'visualDna.js'))
const { synthesizeVisualDirector } = require(join(buildDir, 'visualDirector.js'))
const { patternExplorerIntelligence } = require(join(buildDir, 'patternIntelligence.js'))
const { pageCompositionIntelligence } = require(join(buildDir, 'pageComposition.js'))
const { previewDirections, placeholderMediaFor, previewWarnings, responsivePreviewPlan, previewStudioIntelligence } = require(join(buildDir, 'previewStudio.js'))
const { createProjectConfig, setScopeChoice, resolveScope } = require(join(buildDir, 'configurator.js'))
const { patterns } = require(join(buildDir, 'catalog.js'))

function sample(appType, projectContext, packs = [], history = [], dnaPatch = {}) {
  let config = createProjectConfig(appType)
  packs.forEach((id) => { config = setScopeChoice(config, id, 'On') })
  const dna = normalizeDna(dnaPatch)
  const context = { appType, activePacks: packs, projectContext, dna }
  const director = synthesizeVisualDirector({ ...context, media: { generatePlaceholders: true, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage' } })
  const patternIntel = patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: [], history })
  const pageIntel = pageCompositionIntelligence({ config, dna, director, patternIntelligence: patternIntel, projectContext, selectedPatternIds: [], visualContradictionCount: 0 })
  return { config, dna, director, patternIntel, pageIntel }
}

let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`✓ ${name}`) }
console.log('\nBlueprint v0.30 Visual Preview Studio MVP regression suite\n')

const adw = sample('Custom / General', 'ADW Banawe car accessories physical shop website. Customers view products, find the shop, get directions, and contact the store.')
const clinic = sample('Clinic / EMR', 'Operational clinic EMR for patient intake, encounters, orders, results, and staff.', ['pack.clinic'])
const hrms = sample('Government System', 'Government HRMS for personnel records, workforce actions, approvals, and ministry staff.', ['pack.government'])
const booking = sample('Booking / Scheduling', 'Mobile pickleball court booking where customers choose court, date, and time.', ['pack.booking'])
const sports = sample('Tournament / Event', 'Live pickleball tournament with current scores, standings, schedule, and brackets.', ['pack.tournament'])
const portfolio = sample('Portfolio / Marketing', 'Developer portfolio with project case studies and authored interactions.', ['pack.portfolio'])

check('Preview Studio consumes exactly the first three Pattern Explorer recommendations as A/B/C directions', () => {
  const directions = previewDirections(adw.patternIntel)
  assert.equal(directions.length, 3)
  assert.deepEqual(directions.map((item) => item.slot), ['A', 'B', 'C'])
  assert.deepEqual(directions.map((item) => item.id), adw.patternIntel.recommendations.slice(0, 3).map((item) => item.id))
})

check('ADW A/B/C directions are meaningful alternatives rather than three labels for one DNA', () => {
  const directions = previewDirections(adw.patternIntel)
  assert.equal(new Set(directions.map((item) => item.name)).size, 3)
  assert.ok(directions.some((item) => item.dna.typographyCharacter !== directions[0].dna.typographyCharacter || item.dna.gridCharacter !== directions[0].dna.gridCharacter))
})

check('Domain-aware placeholder media differs across canonical project families', () => {
  const kinds = [adw, clinic, hrms, booking, sports, portfolio].map((item) => placeholderMediaFor(item.director).kind)
  assert.deepEqual(kinds, ['automotive', 'clinical', 'institutional', 'court', 'sports', 'portfolio'])
  assert.equal(new Set(kinds).size, 6)
})

check('Preview placeholder media respects Media Assistance Off', () => {
  const context = { appType: 'Custom / General', activePacks: [], projectContext: 'Automotive shop site', dna: adw.dna }
  const director = synthesizeVisualDirector({ ...context, media: { generatePlaceholders: false, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage' } })
  assert.equal(placeholderMediaFor(director).enabled, false)
})

check('Advisory ADW composition stays visibly advisory in Preview Studio', () => {
  assert.ok(adw.pageIntel.pages.every((page) => page.scopeState === 'advisory'))
  const warnings = previewWarnings({ pageIntel: adw.pageIntel, patternIntel: adw.patternIntel, selectedPage: adw.pageIntel.pages[0] })
  assert.ok(warnings.some((item) => item.id.startsWith('advisory-') && item.severity === 'review'))
  assert.equal(resolveScope(adw.config, 'pack.portfolio').active, false)
})

check('Implementation pages do not get an advisory-scope warning once their explicit pack is active', () => {
  const warnings = previewWarnings({ pageIntel: booking.pageIntel, patternIntel: booking.patternIntel, selectedPage: booking.pageIntel.pages[0] })
  assert.equal(booking.pageIntel.pages[0].scopeState, 'implementation')
  assert.equal(warnings.some((item) => item.id.startsWith('advisory-')), false)
})

check('Mobile preview uses the page-specific recomposition plan rather than desktop scaling language', () => {
  const page = booking.pageIntel.pages[0]
  const mobile = responsivePreviewPlan(page, 'mobile')
  assert.equal(mobile.mode, 'mobile-recomposition')
  assert.deepEqual(mobile.rules, page.mobileRecomposition)
  assert.ok(mobile.rules.some((rule) => /touch|sticky|zoom|first meaningful/i.test(rule)))
})

check('Desktop, tablet, and mobile preview plans are intentionally distinct', () => {
  const page = clinic.pageIntel.pages[0]
  const modes = ['desktop', 'tablet', 'mobile'].map((device) => responsivePreviewPlan(page, device).mode)
  assert.deepEqual(modes, ['wide-composition', 'adaptive-composition', 'mobile-recomposition'])
})

check('Preview warnings surface deterministic visual contradictions as risk without a numeric score', () => {
  const warnings = previewWarnings({ pageIntel: adw.pageIntel, patternIntel: adw.patternIntel, selectedPage: adw.pageIntel.pages[0], visualContradictions: ['Glass treatment conflicts with the explicit Glassmorphism exclusion.'] })
  const conflict = warnings.find((item) => item.title === 'Visual contradiction')
  assert.ok(conflict)
  assert.equal(conflict.severity, 'risk')
  assert.equal(Object.prototype.hasOwnProperty.call(conflict, 'score'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(conflict, 'confidence'), false)
})

check('Anti-homogeneity warning is surfaced when the current direction resembles project history', () => {
  const base = sample('Custom / General', 'Automotive retail site with products and location.')
  const repeated = sample('Custom / General', 'Automotive retail site with products and location.', [], [{ id: 'old', name: 'Previous site', dna: base.director.proposedDna, selectedPatternIds: [], directionName: base.director.directionName }])
  const intel = previewStudioIntelligence({ dna: repeated.dna, director: repeated.director, patternIntel: repeated.patternIntel, pageIntel: repeated.pageIntel, selectedPage: repeated.pageIntel.pages[0] })
  if (repeated.patternIntel.antiHomogeneity.level !== 'LOW') assert.ok(intel.warnings.some((item) => item.id === 'anti-homogeneity'))
})

check('Preview intelligence never mutates optional functional scope', () => {
  const ids = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled']
  const before = ids.map((id) => resolveScope(adw.config, id).active)
  previewStudioIntelligence({ dna: adw.dna, director: adw.director, patternIntel: adw.patternIntel, pageIntel: adw.pageIntel, selectedPage: adw.pageIntel.pages[0] })
  const after = ids.map((id) => resolveScope(adw.config, id).active)
  assert.deepEqual(after, before)
  assert.ok(after.every((active) => active === false))
})

check('Navigation variant is now a normalized persistent Visual DNA decision', () => {
  const dna = normalizeDna({ navigationVariant: 'Bottom dock' })
  assert.equal(dna.navigationVariant, 'Bottom dock')
  assert.match(visualDnaContract(dna), /Navigation variant: Bottom dock/)
  assert.equal(normalizeDna({ navigationVariant: 'nonsense' }).navigationVariant, 'Auto / Recommended')
})

check('Canonical preview pages remain structurally different across product domains', () => {
  const signatures = [adw, clinic, hrms, booking, sports, portfolio].map((item) => item.pageIntel.pages[0].sections.map((section) => section.id).join('|'))
  assert.ok(new Set(signatures).size >= 5)
})

check('Multi-page preview data is available for the operational benchmarks', () => {
  assert.ok(adw.pageIntel.pages.length >= 2)
  assert.ok(clinic.pageIntel.pages.length >= 2)
  assert.ok(hrms.pageIntel.pages.length >= 2)
  assert.ok(booking.pageIntel.pages.length >= 2)
})

check('Preview Studio source contains explicit commit controls but no Phase 6 approval contract semantics', () => {
  const source = readFileSync(join(root, 'src/components/PreviewStudio.tsx'), 'utf8')
  assert.match(source, /Save refinement to Blueprint/)
  assert.match(source, /Use this direction|Direction/)
  assert.doesNotMatch(source, /Approved Visual Contract|immutable Approved|approve visual/i)
})

check('Preview Studio renders distinct canonical domain surfaces and explicit mobile branches', () => {
  const source = readFileSync(join(root, 'src/components/PreviewStudio.tsx'), 'utf8')
  for (const name of ['AutomotivePreview', 'ClinicPreview', 'GovernmentPreview', 'BookingPreview', 'SportsPreview', 'PortfolioPreview']) assert.match(source, new RegExp(`function ${name}`))
  assert.match(source, /device === 'mobile'/)
  assert.match(source, /mobileRecomposition|responsivePreviewPlan/)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Visual Preview Studio MVP regression checks passed.\n`)
