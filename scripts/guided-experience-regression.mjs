import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const buildDir = join(root, '.blueprint-v032-test-build')
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
  'src/data/guidedExperience.ts',
  '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--skipLibCheck', '--strict', '--outDir', buildDir,
], { cwd: root, stdio: 'inherit', shell: !hasLocalTsc && process.platform === 'win32' })
writeFileSync(join(buildDir, 'package.json'), '{"type":"commonjs"}\n')

const require = createRequire(import.meta.url)
const { createProjectConfig, resolveScope, scopeChoice, setScopeChoice } = require(join(buildDir, 'configurator.js'))
const { guidedBuildStatus, guidedSearchEntries, guidedSearchMatches, guidedSetupDecisions, guidedUnresolvedDecisions, recommendedScopeIds } = require(join(buildDir, 'guidedExperience.js'))

const context = (building, outcomes = '', priorities = 'Ease of use') => ({
  building,
  audience: 'Customers and staff',
  outcomes,
  priorities,
  nonNegotiables: '',
  avoid: '',
  dependencies: '',
  done: '',
})

let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`✓ ${name}`) }
console.log('\nBlueprint v0.32 Guided Experience / Anti-Dumb UX regression suite\n')

check('Booking intent becomes a goal-critical Guided Setup decision without activating booking', () => {
  const config = createProjectConfig('Booking / Scheduling')
  const before = resolveScope(config, 'pack.booking')
  const decision = guidedSetupDecisions(context('A highly customized pickleball court booking system', 'Players should book a court and reserve available time slots.'), config)
    .find((item) => item.id === 'context-booking-mismatch')
  assert.ok(decision)
  assert.equal(decision.priority, 'required')
  assert.equal(decision.state, 'attention')
  assert.deepEqual(decision.actionableSettingIds, ['pack.booking'])
  assert.match(decision.title, /Booking is off/i)
  assert.match(decision.impact, /will not be able to reserve/i)
  assert.deepEqual(resolveScope(config, 'pack.booking'), before)
  assert.equal(resolveScope(config, 'pack.booking').active, false)
})

check('Apply Recommended Setup helper returns scope ids but never mutates ProjectConfig itself', () => {
  const config = createProjectConfig('Booking / Scheduling')
  const decisions = guidedSetupDecisions(context('Pickleball booking website', 'Customers book a court and pay online through the site.'), config)
  const ids = recommendedScopeIds(decisions)
  assert.ok(ids.includes('pack.booking'))
  assert.ok(ids.includes('pack.payments'))
  assert.equal(resolveScope(config, 'pack.booking').active, false)
  assert.equal(resolveScope(config, 'pack.payments').active, false)
})

check('Explicit user inclusion resolves the booking helper decision', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  const decisions = guidedSetupDecisions(context('Pickleball court booking system', 'Players reserve a court time slot.'), config)
  assert.equal(decisions.some((item) => item.id === 'context-booking-mismatch' && item.state === 'attention'), false)
  assert.equal(resolveScope(config, 'pack.booking').active, true)
})

check('Explicit Not needed is remembered as acknowledged rather than nagging forever', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'Off')
  const ctx = context('A site that mentions court booking', 'Visitors may ask about booking a court slot, but booking will be handled manually.')
  const decision = guidedSetupDecisions(ctx, config).find((item) => item.id === 'context-booking-mismatch')
  assert.ok(decision)
  assert.equal(decision.state, 'acknowledged')
  assert.equal(decision.actionableSettingIds.length, 0)
  assert.equal(scopeChoice(config, 'pack.booking'), 'Off')
})

check('Online payment intent surfaces Payments & money directly', () => {
  const config = createProjectConfig('Custom / General')
  const decision = guidedSetupDecisions(context('Customer website', 'Customers should pay online through PayMongo.'), config).find((item) => item.id === 'context-payment-mismatch')
  assert.ok(decision)
  assert.deepEqual(decision.settingIds, ['pack.payments'])
  assert.match(decision.title, /Payments are off/i)
})

check('Online purchasing intent surfaces E-commerce directly', () => {
  const config = createProjectConfig('Custom / General')
  const decision = guidedSetupDecisions(context('Online store', 'Customers should add products to cart and checkout online.'), config).find((item) => item.id === 'context-commerce-mismatch')
  assert.ok(decision)
  assert.deepEqual(decision.settingIds, ['pack.commerce'])
})

check('Goal-critical mismatch blocks build readiness until the user resolves it', () => {
  const config = createProjectConfig('Booking / Scheduling')
  const status = guidedBuildStatus(context('Pickleball booking app', 'Players should book a court slot.'), config, 'approved')
  assert.equal(status.state, 'blocked')
  assert.equal(status.next, 'setup')
  assert.ok(status.unresolvedRequired >= 1)
})


check('App Setup blockers are part of the same unresolved guided queue and can never coexist with all-clear state', () => {
  let config = createProjectConfig('Custom / General')
  config = setScopeChoice(config, 'admin.enabled', 'On')
  config = setScopeChoice(config, 'login.enabled', 'Off')
  const decisions = guidedSetupDecisions(context('Internal admin tool', 'Staff manage records through an admin panel.'), config)
  const blocker = decisions.find((item) => item.title === 'Admin surface has no authentication boundary')
  assert.ok(blocker)
  assert.equal(blocker.priority, 'required')
  assert.equal(blocker.state, 'review')
  assert.equal(blocker.suggestedFixId, 'protect-admin')
  assert.ok(guidedUnresolvedDecisions(decisions).some((item) => item.id === blocker.id))
  const status = guidedBuildStatus(context('Internal admin tool', 'Staff manage records through an admin panel.'), config, 'approved')
  assert.equal(status.state, 'blocked')
  assert.ok(status.unresolvedTotal >= 1)
})

check('Once goal scope is explicit, unapproved visual direction routes the user to Preview', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'On')
  const status = guidedBuildStatus(context('Pickleball booking app', 'Players should book a court slot.'), config, 'unapproved')
  assert.equal(status.state, 'attention')
  assert.equal(status.next, 'preview')
})

check('Approved coherent setup reaches Ready to build', () => {
  let config = createProjectConfig('Booking / Scheduling')
  config = setScopeChoice(config, 'pack.booking', 'On')
  config = setScopeChoice(config, 'pack.payments', 'On')
  const status = guidedBuildStatus(context('Pickleball booking app', 'Players should book a court slot.'), config, 'approved')
  assert.equal(status.state, 'ready')
  assert.equal(status.next, 'build')
})

check('Find Anything indexes dormant business packs even when they are inactive', () => {
  const config = createProjectConfig('Custom / General')
  const entries = guidedSearchEntries(config)
  const booking = entries.find((item) => item.settingId === 'pack.booking')
  assert.ok(booking)
  assert.equal(booking.scope, true)
  assert.ok(booking.keywords.includes('reservation'))
  assert.equal(booking.scopeState, 'off')
})

check('Find Anything indexes advanced controls without requiring Advanced view', () => {
  const config = createProjectConfig('Custom / General')
  const passkey = guidedSearchEntries(config).find((item) => item.settingId === 'login.passkeyOptional')
  assert.ok(passkey)
  assert.match(`${passkey.label} ${passkey.description}`.toLowerCase(), /passkey/)
})


check('Find Anything tolerates common one- and two-character typos without broad fuzzy noise', () => {
  const config = createProjectConfig('Custom / General')
  const entries = guidedSearchEntries(config)
  const booking = entries.find((item) => item.settingId === 'pack.booking')
  const password = entries.find((item) => item.settingId === 'login.passwordPolicy')
  assert.ok(booking && password)
  assert.equal(guidedSearchMatches('bokking', `${booking.label} ${booking.description} ${booking.keywords}`), true)
  assert.equal(guidedSearchMatches('pasword', `${password.label} ${password.description} ${password.keywords}`), true)
  assert.equal(guidedSearchMatches('zzzq', `${booking.label} ${booking.description} ${booking.keywords}`), false)
})

check('Project Context recognizes obvious domain intent beyond booking, payments, and commerce', () => {
  const cases = [
    ['Inventory system', 'Track stock movements, warehouse inventory, SKU and barcode scanning.', 'context-inventory-mismatch', 'pack.inventory'],
    ['Clinic system', 'Maintain patient records, vital signs, clinical notes and doctor orders.', 'context-clinic-mismatch', 'pack.clinic'],
    ['Document tracker', 'Route documents between offices with signatories and turnaround tracking.', 'context-government-workflow-mismatch', 'pack.government'],
    ['Tournament app', 'Manage brackets, standings, match scoring and team lineups.', 'context-tournament-mismatch', 'pack.tournament'],
    ['Court directory', 'A searchable court directory with owner claim and featured listings.', 'context-directory-mismatch', 'pack.directory'],
    ['Operations portal', 'Needs scheduled reports and an analytics dashboard for KPIs.', 'context-reporting-mismatch', 'pack.reporting'],
    ['SaaS product', 'Offer monthly subscription plans, a free trial and recurring billing.', 'context-subscriptions-mismatch', 'pack.subscriptions'],
  ]
  for (const [building, outcomes, signalId, settingId] of cases) {
    const config = createProjectConfig('Custom / General')
    const decision = guidedSetupDecisions(context(building, outcomes), config).find((item) => item.id === signalId)
    assert.ok(decision, `${signalId} should be surfaced`)
    assert.equal(decision.priority, 'required')
    assert.ok(decision.actionableSettingIds.includes(settingId))
    assert.equal(resolveScope(config, settingId).active, false)
  }
})

check('App source exposes guided-first navigation, finder, and explicit Advanced escape hatch', () => {
  const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  assert.match(source, /label: 'Home'/)
  assert.match(source, /label: 'Setup'/)
  assert.match(source, /label: 'Design'/)
  assert.match(source, /label: 'Preview'/)
  assert.match(source, /label: 'Review & build'/)
  assert.match(source, /Advanced tools/)
  assert.match(source, /Find anything/)
  assert.match(source, /Browse all settings/)
  assert.match(source, /Apply recommended setup/)
  assert.match(source, /Apply fix/)
  assert.match(source, /Recommended context/)
  assert.match(source, /guidedUnresolvedDecisions/)
  assert.doesNotMatch(source, /decisions\.filter\(\(item\) => item\.state === 'attention'\)/)
})

check('Deep links can reveal and focus the exact hidden setting instead of forcing manual browsing', () => {
  const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  assert.match(source, /setup-setting-\$\{setting\.id\}/)
  assert.match(source, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/)
  assert.match(source, /setShowFullSettings\(true\)/)
})

check('v0.32 metadata advances without inventing a backup migration', () => {
  const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const [major, minor, patch] = pkg.version.split('.').map(Number)
  assert.ok(major > 0 || minor > 32 || (minor === 32 && patch >= 1))
  assert.match(source, /type BackupBundle = \{\s*version: 14/)
  assert.ok(source.includes(`blueprintVersion: '${pkg.version}'`))
  assert.match(source, /version: 20/)
})

rmSync(buildDir, { recursive: true, force: true })
console.log(`\n${passed} Guided Experience regression checks passed.\n`)
