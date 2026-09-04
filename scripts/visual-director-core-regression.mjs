import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v027-test-build')
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
const engine = require(join(buildDir, 'configurator.js'))
const { normalizeDna } = visual
const { synthesizeVisualDirector, visualDirectorPrompt } = directorModule
const { createProjectConfig, resolveScope } = engine

const input = (appType, projectContext, dna = {}, media = {}) => ({
  appType,
  activePacks: [],
  projectContext,
  dna: normalizeDna(dna),
  media: { generatePlaceholders: true, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage', ...media },
})

let passed = 0
const check = (name, fn) => {
  fn()
  passed += 1
  console.log(`✓ ${name}`)
}

console.log('\nBlueprint v0.27 Visual Director Core regression suite\n')

const adw = synthesizeVisualDirector(input('Custom / General', 'ADW Banawe public car accessories shop website. Customers should view automotive products, upgrades, location, directions, and contact details.'))
const clinic = synthesizeVisualDirector(input('Clinic / EMR', 'Operational clinic EMR for patient intake, encounters, orders, labs, medicines, and staff.'))
const hrms = synthesizeVisualDirector(input('Government System', 'Government HRMS for workforce records, employees, personnel actions, approvals, and ministry staff.'))
const booking = synthesizeVisualDirector(input('Booking / Scheduling', 'Mobile pickleball court booking where customers pick courts, time slots, and confirm reservations quickly.'))
const sports = synthesizeVisualDirector(input('Tournament / Event', 'Live pickleball tournament with schedules, scores, standings, brackets, and event identity.'))
const portfolio = synthesizeVisualDirector(input('Portfolio / Marketing', 'Developer portfolio with project case studies, work media, personality, and controlled experimentation.'))

check('ADW resolves to Mechanical Editorial with automotive-specific DNA', () => {
  assert.equal(adw.directionName, 'Mechanical Editorial')
  assert.match(adw.designDNA.archetype, /automotive/i)
  assert.match(adw.signatureElement, /Mechanical grid|product-spec ruler/i)
  assert.doesNotMatch(adw.mediaDirection, /technical screenshot/i)
})

check('Clinic resolves to Clinical Calm and does not reuse ADW direction', () => {
  assert.equal(clinic.directionName, 'Clinical Calm')
  assert.notEqual(clinic.directionName, adw.directionName)
  assert.match(clinic.designDNA.visualTension, /Trust/i)
})

check('Government HRMS resolves to Institutional Workforce', () => {
  assert.equal(hrms.directionName, 'Institutional Workforce')
  assert.match(hrms.signatureElement, /Institutional|seal-derived/i)
})

check('Pickleball booking resolves to Courtline Booking with mobile task emphasis', () => {
  assert.equal(booking.directionName, 'Courtline Booking')
  assert.match(booking.designDNA.composition, /mobile|availability|booking/i)
  assert.match(booking.signatureElement, /Court-line/i)
})

check('Sports tournament resolves to Competitive Signal with live-data priority', () => {
  assert.equal(sports.directionName, 'Competitive Signal')
  assert.match(sports.designDNA.composition, /results|standings|schedules|live/i)
})

check('Portfolio resolves to Authored Portfolio rather than generic marketing cards', () => {
  assert.equal(portfolio.directionName, 'Authored Portfolio')
  assert.ok(portfolio.designDNA.avoid.some((item) => /Generic agency cards/i.test(item)))
})

check('Six canonical benchmark directions are meaningfully differentiated', () => {
  const outputs = [adw, clinic, hrms, booking, sports, portfolio]
  assert.equal(new Set(outputs.map((item) => item.directionName)).size, 6)
  assert.ok(new Set(outputs.map((item) => item.baseDirectionId)).size >= 5)
  assert.ok(new Set(outputs.map((item) => item.designDNA.archetype)).size === 6)
})

check('Strict autonomy does not replace the current visual DNA with the suggested base direction', () => {
  const strictDna = normalizeDna({ designAutonomy: 'Strict', headingTypography: 'Slab serif', bodyTypography: 'Humanist sans', shapeLanguage: 'Rounded', surfaceRadius: 24 })
  const result = synthesizeVisualDirector(input('Portfolio / Marketing', 'Creative developer portfolio.', strictDna))
  assert.equal(result.proposedDna.headingTypography, 'Slab serif')
  assert.equal(result.proposedDna.shapeLanguage, 'Rounded')
  assert.equal(result.proposedDna.surfaceRadius, 24)
})

check('Explicit typography weights survive Balanced Visual Director synthesis', () => {
  const result = synthesizeVisualDirector(input('Custom / General', 'Automotive car accessories retail website.', {
    designAutonomy: 'Balanced',
    headingWeightPreference: 'Black', headingWeight: 900,
    bodyWeightPreference: 'Medium', bodyWeight: 500,
    uiWeightPreference: 'Bold', uiWeight: 700,
  }))
  assert.equal(result.proposedDna.headingWeight, 900)
  assert.equal(result.proposedDna.bodyWeight, 500)
  assert.equal(result.proposedDna.uiWeight, 700)
})

check('Hard anti-pattern exclusions are reconciled after synthesis', () => {
  const result = synthesizeVisualDirector(input('Portfolio / Marketing', 'Expressive portfolio.', {
    designAutonomy: 'Art Director',
    visualAntiPatterns: ['Glassmorphism', 'Gradient-heavy UI', 'Excessive pills', 'Excessive rounded corners', 'Excessive animations'],
  }))
  assert.equal(result.proposedDna.glassUsage, 'None')
  assert.equal(result.proposedDna.gradientUsage, 'None')
  assert.notEqual(result.proposedDna.pillUsage, 'Frequent')
  assert.notEqual(result.proposedDna.motionAmount, 'High')
})

check('Premium semantics explicitly reject a universal luxury preset', () => {
  assert.ok(adw.quality.means.includes('deliberate composition'))
  assert.ok(adw.quality.doesNotMean.some((item) => /black\/beige/i.test(item)))
  assert.ok(adw.quality.doesNotMean.some((item) => /glassmorphism/i.test(item)))
})

check('Media synthesis respects placeholder settings and scope-safe language', () => {
  const result = synthesizeVisualDirector(input('Custom / General', 'Automotive retail website.', {}, { placeholderStyle: 'Studio product', placeholderCoverage: 'Rich presentation' }))
  assert.match(result.mediaDirection, /Studio product/)
  assert.match(result.mediaDirection, /Rich presentation/i)
  assert.match(result.mediaDirection, /never invent product modules/i)
})

check('Visual Director prompt exposes Hard / Direction / Freedom hierarchy and synthesized DNA', () => {
  const prompt = visualDirectorPrompt(adw)
  assert.match(prompt, /VISUAL THESIS/)
  assert.match(prompt, /DESIGN DNA/)
  assert.match(prompt, /HARD VISUAL CONSTRAINTS/)
  assert.match(prompt, /IMPLEMENTATION FREEDOM/)
  assert.match(prompt, /SIGNATURE DESIGN ELEMENT/)
})

check('Visual Director synthesis cannot change functional scope authority', () => {
  const config = createProjectConfig('Custom / General')
  const before = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled'].map((id) => resolveScope(config, id).active)
  synthesizeVisualDirector(input('Custom / General', 'Automotive retail website with products and store location.'))
  const after = ['pack.portfolio', 'pack.commerce', 'pack.payments', 'pack.booking', 'admin.enabled'].map((id) => resolveScope(config, id).active)
  assert.deepEqual(after, before)
  assert.ok(after.every((active) => active === false))
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Visual Director Core regression checks passed.\n`)
