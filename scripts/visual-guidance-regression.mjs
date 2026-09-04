import assert from 'node:assert/strict'
import { readFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
const guidance = readFileSync(join(root, 'src/components/Guidance.tsx'), 'utf8')
const visualStudio = readFileSync(join(root, 'src/components/VisualStudio.tsx'), 'utf8')
const previewStudio = readFileSync(join(root, 'src/components/PreviewStudio.tsx'), 'utf8')
const styles = readFileSync(join(root, 'src/styles.css'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
let passed = 0

function check(name, fn) {
  try { fn(); passed += 1; console.log(`✓ ${name}`) }
  catch (error) { console.error(`✗ ${name}`); throw error }
}

console.log('\nBlueprint v0.33 Visual Guidance / TL;DR regression suite\n')

check('TL;DR mode is an explicit persisted preference and defaults to normal detail', () => {
  assert.match(app, /tldr: 'blueprint:tldr-mode:v1'/)
  assert.match(app, /safeParse<boolean>\(STORAGE\.tldr, false\)/)
  assert.match(app, /safeStorePreference\(STORAGE\.tldr, tldrMode\)/)
})

check('TL;DR control is accessible and available in desktop and mobile guidance surfaces', () => {
  assert.match(guidance, /aria-pressed=\{active\}/)
  assert.match(guidance, /TL;DR mode/)
  assert.ok((app.match(/<GuidanceToggle/g) ?? []).length >= 2)
})

check('TL;DR is a reusable context rather than page-specific hide flags', () => {
  assert.match(guidance, /GuidanceProvider/)
  assert.match(guidance, /useGuidanceMode/)
  assert.match(guidance, /TldrSummary/)
  assert.match(guidance, /VerboseOnly/)
})

check('concept help uses a real circular i trigger with an accessible explanation label', () => {
  assert.match(guidance, /className="concept-info"/)
  assert.match(guidance, /aria-label=\{`What is \$\{label\}\?`\}/)
  assert.match(guidance, /<span aria-hidden="true">i<\/span>/)
  assert.match(styles, /\.concept-info > summary[^\{]*\{[^}]*border-radius:\s*50%/s)
})

check('concept help is keyboard/mobile usable instead of hover-only tooltip text', () => {
  assert.match(guidance, /<details className="concept-info">/)
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.concept-popover \{ position: fixed;/)
  assert.match(styles, /summary:focus-visible/)
})

check('Setup has a strong Describe → Resolve → Tune visual path', () => {
  assert.match(app, /aria-label="Guided setup path"/)
  assert.match(app, />Describe</)
  assert.match(app, />Resolve</)
  assert.match(app, />Tune if needed</)
})

check('required and recommended guided decisions have stronger visual severity rails', () => {
  assert.match(styles, /guided-setup-item\.priority-required/)
  assert.match(styles, /guided-setup-item\.priority-recommended/)
  assert.match(styles, /global-guide-banner\.blocked/)
})

check('dense guided pages provide purpose-written TL;DR summaries', () => {
  const summaries = app.match(/<TldrSummary/g) ?? []
  assert.ok(summaries.length >= 6, `expected at least 6 TL;DR summaries, got ${summaries.length}`)
  assert.match(app, /spec-tldr-overview/)
})

check('Review & Build keeps readiness and actions visible before verbose detail is folded', () => {
  const readiness = app.indexOf('build-readiness-banner')
  const verboseSpec = app.indexOf('<VerboseOnly><div className="spec-layout">')
  assert.ok(readiness >= 0 && verboseSpec > readiness)
  assert.match(app, /Copy AI prompt/)
})

check('TL;DR Review & Build has a concise handoff dashboard rather than an empty collapsed page', () => {
  assert.match(app, /className="spec-tldr-overview"/)
  assert.match(app, /Build status/)
  assert.match(app, /Product scope/)
  assert.match(app, /Visual authority/)
  assert.match(app, /Delivery plan/)
  assert.match(app, /Handoff/)
})

check('advanced and technical settings can automatically receive concept explainers', () => {
  assert.match(app, /const needsExplainer = settingDepth\(setting\) !== 'Quick'/)
  assert.match(app, /CSP\|WCAG\|CI\\\/CD/)
  assert.match(app, /<ConceptInfo label=\{setting\.label\}>/)
})

check('Visual Studio explains unfamiliar visual-authority concepts from one reusable vocabulary', () => {
  assert.match(visualStudio, /const visualConceptHelp/)
  for (const label of ['Design autonomy', 'Visual originality', 'Signature brand moment', 'Information density', 'Section strategy']) {
    assert.ok(visualStudio.includes(`'${label}'`), `missing explainer for ${label}`)
  }
  assert.match(visualStudio, /ConceptInfo label="Visual Director"/)
})

check('Visual Studio TL;DR keeps high-impact controls while folding suggestion/detail anatomy', () => {
  assert.match(visualStudio, /const \{ tldrMode \} = useGuidanceMode\(\)/)
  assert.match(visualStudio, /<TldrSummary title="Direction in one line">/)
  assert.match(visualStudio, /<VerboseOnly><VisualSuggestions/)
  assert.match(visualStudio, /<TldrOnly><details className=\"tldr-on-demand\">/)
  assert.match(visualStudio, /visual-director-controls/)
})

check('Preview Studio explains visual approval and scope authority without weakening the approval gate', () => {
  assert.match(previewStudio, /ConceptInfo label="Visual approval"/)
  assert.match(previewStudio, /ConceptInfo label="Preview authority"/)
  assert.match(previewStudio, /Approve for implementation/)
  assert.match(previewStudio, /<TldrSummary title="Preview loop">/)
})

check('v0.33 guidance remains presentation-only and does not gain product-scope mutation authority', () => {
  assert.doesNotMatch(guidance, /setScopeChoice|setConfigValue|onChange\(.*scope/i)
  assert.match(app, /GuidanceProvider tldrMode=\{tldrMode\}/)
  assert.match(app, /type BackupBundle = \{\s*version: 14/)
})

check('v0.33 advances package/export metadata without a backup schema migration', () => {
  assert.equal(pkg.version, '0.33.0')
  assert.match(app, /blueprintVersion: '0\.33\.0'/)
  assert.match(app, /version: 20/)
  assert.match(app, /type BackupBundle = \{\s*version: 14/)
})

rmSync(join(root, '.tmp-v033'), { recursive: true, force: true })
console.log(`\n${passed} Visual Guidance regression checks passed.\n`)
