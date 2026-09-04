import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v031-test-build')
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
  'src/data/visualApproval.ts',
  '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--skipLibCheck', '--strict', '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const { normalizeDna } = require(join(buildDir, 'visualDna.js'))
const { synthesizeVisualDirector } = require(join(buildDir, 'visualDirector.js'))
const { patternExplorerIntelligence } = require(join(buildDir, 'patternIntelligence.js'))
const { pageCompositionIntelligence } = require(join(buildDir, 'pageComposition.js'))
const { createProjectConfig, setScopeChoice, setConfigValue, resolveScope } = require(join(buildDir, 'configurator.js'))
const { patterns } = require(join(buildDir, 'catalog.js'))
const {
  approvalInteractionStates,
  approvedVisualContractPrompt,
  createApprovedVisualContract,
  evaluateVisualApproval,
  normalizeApprovedVisualContract,
  staleVisualApprovalPrompt,
} = require(join(buildDir, 'visualApproval.js'))

function sample(appType, projectContext, packs = [], history = [], dnaPatch = {}, configMutator) {
  let config = createProjectConfig(appType)
  packs.forEach((id) => { config = setScopeChoice(config, id, 'On') })
  if (configMutator) config = configMutator(config)
  const dna = normalizeDna(dnaPatch)
  const context = { appType, activePacks: packs, projectContext, dna }
  const director = synthesizeVisualDirector({ ...context, media: { generatePlaceholders: true, placeholderStyle: 'Auto / Recommended', placeholderCoverage: 'Appropriate coverage' } })
  const patternIntel = patternExplorerIntelligence({ patterns, config, context, director, selectedPatternIds: [], history })
  const pageIntel = pageCompositionIntelligence({ config, dna, director, patternIntelligence: patternIntel, projectContext, selectedPatternIds: [], visualContradictionCount: 0 })
  return { dna, config, director, patternIntel, pageIntel, projectContext, selectedPatternIds: [] }
}

const approvalInput = (item, patch = {}) => ({
  dna: patch.dna ?? item.dna,
  config: patch.config ?? item.config,
  projectContext: patch.projectContext ?? item.projectContext,
  selectedPatternIds: patch.selectedPatternIds ?? item.selectedPatternIds,
  director: patch.director ?? item.director,
  patternIntel: patch.patternIntel ?? item.patternIntel,
  pageIntel: patch.pageIntel ?? item.pageIntel,
})

let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`✓ ${name}`) }
console.log('\nBlueprint v0.31 Interactive Approval + Visual Contract regression suite\n')

const adw = sample('Custom / General', 'ADW Banawe car accessories physical shop website. Customers view products, find the shop, get directions, and contact the store.')
const clinic = sample('Clinic / EMR', 'Operational clinic EMR for patient intake, encounters, orders, results, and staff.', ['pack.clinic'])
const hrms = sample('Government System', 'Government HRMS for personnel records, workforce actions, approvals, and ministry staff.', ['pack.government'])
const booking = sample('Booking / Scheduling', 'Mobile pickleball court booking where customers choose court, date, and time.', ['pack.booking'])
const sports = sample('Tournament / Event', 'Live pickleball tournament with current scores, standings, schedule, and brackets.', ['pack.tournament'])
const portfolio = sample('Portfolio / Marketing', 'Developer portfolio with project case studies and authored interactions.', ['pack.portfolio'])

const adwContract = createApprovedVisualContract({ ...approvalInput(adw), approvedAt: '2026-09-04T05:00:00.000Z', id: 'approval-adw' })

check('Explicit approval creates a persisted approved_preview snapshot contract', () => {
  assert.equal(adwContract.provenance, 'approved_preview')
  assert.equal(adwContract.version, 1)
  assert.equal(adwContract.id, 'approval-adw')
  assert.ok(adwContract.pageCompositions.length >= 2)
  assert.ok(adwContract.frontendQualityContract.criteria.length > 0)
})

check('Fresh contract evaluates as approved when material visual inputs still match', () => {
  const result = evaluateVisualApproval(adwContract, approvalInput(adw))
  assert.equal(result.status, 'approved')
  assert.equal(result.changedAreas.length, 0)
})

check('Material Visual DNA edit marks approval stale', () => {
  const changed = normalizeDna({ ...adw.dna, density: adw.dna.density + 7 })
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { dna: changed }))
  assert.equal(result.status, 'stale')
  assert.ok(result.changedAreas.includes('Visual DNA'))
})

check('Pattern bundle change marks approval stale', () => {
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { selectedPatternIds: ['pattern.fake-new'] }))
  assert.equal(result.status, 'stale')
  assert.ok(result.changedAreas.some((item) => /Pattern Explorer/.test(item)))
})

check('Project Context change marks approval stale', () => {
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { projectContext: `${adw.projectContext} Also emphasize installation services.` }))
  assert.equal(result.status, 'stale')
  assert.ok(result.changedAreas.some((item) => /project context/.test(item)))
})

check('Media/copy direction change marks approval stale', () => {
  const nextConfig = setConfigValue(adw.config, 'media.generatePlaceholders', false)
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { config: nextConfig }))
  assert.equal(result.status, 'stale')
  assert.ok(result.changedAreas.some((item) => /media/.test(item)))
})

check('Functional scope change marks visual approval stale without being caused by approval', () => {
  const before = resolveScope(adw.config, 'pack.commerce').active
  const nextConfig = setScopeChoice(adw.config, 'pack.commerce', 'On')
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { config: nextConfig }))
  assert.equal(before, false)
  assert.equal(result.status, 'stale')
  assert.equal(resolveScope(adw.config, 'pack.commerce').active, false)
  assert.equal(resolveScope(nextConfig, 'pack.commerce').active, true)
})

check('Stale compiler warning explicitly removes old contract authority', () => {
  const result = evaluateVisualApproval(adwContract, approvalInput(adw, { projectContext: `${adw.projectContext} New visual brief.` }))
  const prompt = staleVisualApprovalPrompt(result)
  assert.match(prompt, /MUST NOT be treated as current implementation authority/)
  assert.match(prompt, /re-approv/i)
})

check('Approved Visual Contract prompt contains every required implementation section', () => {
  const prompt = approvedVisualContractPrompt(adwContract)
  for (const heading of ['VISUAL THESIS','APPROVED DESIGN DNA','TYPOGRAPHY','COLOR BEHAVIOR','PAGE COMPOSITION','SIGNATURE DESIGN ELEMENT','HARD VISUAL CONSTRAINTS','RESPONSIVE BEHAVIOR','INTERACTION STATES TO PROVE','MEDIA DIRECTION','MOTION','COPY DIRECTION','FRONTEND QUALITY CONTRACT','ANTI-HOMOGENEITY CHECK']) assert.match(prompt, new RegExp(heading))
})

check('Interactive proof states differ by product domain', () => {
  assert.deepEqual(approvalInteractionStates(adw.pageIntel.domain).map((item) => item.id), ['nav-active','cta-pressed'])
  assert.deepEqual(approvalInteractionStates(booking.pageIntel.domain).map((item) => item.id), ['selected-slot','unavailable-slot'])
  assert.deepEqual(approvalInteractionStates(sports.pageIntel.domain).map((item) => item.id), ['selected-match','nav-active'])
})

check('Approval does not mutate or activate optional functional scope', () => {
  const ids = ['pack.portfolio','pack.commerce','pack.payments','pack.booking','admin.enabled']
  const before = ids.map((id) => resolveScope(adw.config, id).active)
  createApprovedVisualContract(approvalInput(adw))
  const after = ids.map((id) => resolveScope(adw.config, id).active)
  assert.deepEqual(after, before)
  assert.ok(after.every((value) => value === false))
})

check('Six canonical benchmark contracts remain materially differentiated', () => {
  const contracts = [adw, clinic, hrms, booking, sports, portfolio].map((item) => createApprovedVisualContract(approvalInput(item)))
  assert.equal(new Set(contracts.map((item) => item.direction.name)).size, 6)
  assert.ok(new Set(contracts.map((item) => item.pageCompositions[0].sections.map((section) => section.id).join('|'))).size >= 5)
  assert.ok(new Set(contracts.map((item) => item.designDNA.archetype)).size >= 5)
})

check('Anti-homogeneity diagnostic is snapshotted but never blocks approval', () => {
  const base = sample('Custom / General', 'Automotive retail site with products and location.')
  const repeated = sample('Custom / General', 'Automotive retail site with products and location.', [], [{ id: 'old', name: 'Old auto', dna: base.director.proposedDna, selectedPatternIds: [], directionName: base.director.directionName }])
  const contract = createApprovedVisualContract(approvalInput(repeated))
  assert.ok(['LOW','MODERATE','HIGH'].includes(contract.antiHomogeneity.level))
  assert.equal(contract.provenance, 'approved_preview')
})

check('Approved contract normalizes safely through persistence import', () => {
  const normalized = normalizeApprovedVisualContract(JSON.parse(JSON.stringify(adwContract)))
  assert.ok(normalized)
  assert.equal(normalized.id, adwContract.id)
  assert.equal(normalized.provenance, 'approved_preview')
  assert.equal(normalizeApprovedVisualContract({ version: 99 }), undefined)
})

check('Preview-only device/page/interaction controls are absent from freshness hashes', () => {
  assert.deepEqual(Object.keys(adwContract.materialHashes).sort(), ['composition','context','copyMedia','dna','patterns','synthesis'])
  assert.equal(Object.prototype.hasOwnProperty.call(adwContract.materialHashes, 'device'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(adwContract.materialHashes, 'pageId'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(adwContract.materialHashes, 'interactionId'), false)
})

check('Preview Studio exposes explicit approve/re-approve and preview-only invalidation semantics', () => {
  const source = readFileSync(join(root, 'src/components/PreviewStudio.tsx'), 'utf8')
  assert.match(source, /Approve for implementation/)
  assert.match(source, /Re-approve current preview/)
  assert.match(source, /approved_preview/)
  assert.match(source, /Device\/page\/interaction tabs are preview-only and never invalidate approval/)
})

check('Primary compiler gives fresh Approved Visual Contract priority before product capabilities', () => {
  const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const approved = source.indexOf('VISUAL AUTHORITY — APPROVED VISUAL CONTRACT')
  const capabilities = source.indexOf('PRODUCT CAPABILITIES', approved)
  assert.ok(approved > -1 && capabilities > approved)
  assert.match(source, /stale approval is audit history only/i)
  assert.match(source, /BLUEPRINT_REFERENCE\.md for audit\/debugging only/)
})

check('v0.31 persistence/export metadata and structured JSON versions are advanced', () => {
  const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.31.0')
  assert.match(source, /version: 14/)
  assert.match(source, /blueprintVersion: '0\.31\.0'/)
  assert.match(source, /version: 19/)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Interactive Approval + Visual Contract regression checks passed.\n`)
