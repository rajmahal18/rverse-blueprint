import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  FileText,
  Gauge,
  Grid3X3,
  History,
  Home,
  Image as ImageIcon,
  Layers3,
  Lightbulb,
  Link as LinkIcon,
  Menu,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react'
import PatternPreview from './components/PatternPreview'
import VisualStudio from './components/VisualStudio'
import { inspiration, patterns, type Pattern, type PatternCategory, type PatternLevel } from './data/catalog'
import { colorLuminance, contrastRatio, defaultDna, fontFamilyFor, normalizeDna, resolvedDarkPalette, visualDnaContract, type Dna } from './data/visualDna'
import { capabilities, capabilityCategories, type Capability, type CapabilityCategory, type CapabilityLevel } from './data/capabilities'
import { defaultDocIds, projectDocs, type ProjectDoc } from './data/docs'
import { activeCapabilities, activePatterns, capabilityApplicability, crossLayerSignals, patternApplicability } from './data/consistency'
import { emptyProjectContext, normalizeProjectContext, projectContextEntries, projectContextPrompt, projectContextQuestions, type ProjectContext } from './data/projectContext'
import {
  appTypes,
  changeConfigContext,
  configProfiles,
  configDepths,
  operationalScales,
  configSections,
  configSettings,
  configWarnings,
  createProjectConfig,
  effectiveConfigValue,
  formatConfigValue,
  isScopeSetting,
  normalizeProjectConfig,
  recommendedValue,
  resolveScope,
  resolvedOperationalScale,
  resetAllConfig,
  resetConfigSection,
  resetConfigValue,
  scopeChoice,
  setConfigValue,
  setScopeChoice,
  settingDepth,
  settingVisibleAtDepth,
  settingIncludedInContract,
  settingIsActive,
  type AppType,
  type ConfigProfile,
  type ConfigDepth,
  type ConfigValue,
  type OperationalScale,
  type ProjectConfig,
} from './data/configurator'
import {
  acceptanceCriteria,
  appTypeMatches,
  configQuickFixes,
  configReadiness,
  domainSuggestions,
  edgeCases,
  projectContextReviewSignals,
  settingGuidance,
  type ConfigAction,
} from './data/intelligence'

type View = 'home' | 'setup' | 'patterns' | 'compare' | 'capabilities' | 'docs' | 'dna' | 'references' | 'inspiration' | 'spec'

type ReferenceFocus = 'Navigation' | 'Layout' | 'Typography' | 'Color' | 'Motion' | 'Components' | 'Composition' | 'Other'

type ReferenceItem = {
  id: string
  title: string
  url: string
  note: string
  focus: ReferenceFocus[]
  imageData?: string
  createdAt: string
}

type Snapshot = {
  id: string
  label: string
  createdAt: string
  selected: string[]
  dna: Dna
  config?: ProjectConfig
  capabilities?: string[]
  docs?: string[]
  references?: ReferenceItem[]
  context?: ProjectContext
}

type ConfigPreset = {
  id: string
  name: string
  createdAt: string
  appType: AppType
  profile: ConfigProfile
  operationalScale?: OperationalScale
  overrides: Record<string, ConfigValue>
  scopeChoices?: Record<string, 'On' | 'Off'>
}

type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  selected: string[]
  dna: Dna
  references: ReferenceItem[]
  snapshots: Snapshot[]
  capabilities: string[]
  docs: string[]
  config: ProjectConfig
  context: ProjectContext
}

type CustomPattern = Pattern & { custom: true; sourceUrl?: string }
type CustomCapability = Capability & { custom: true }

type BackupBundle = {
  version: 10
  exportedAt: string
  activeProjectId: string
  projects: Project[]
  customPatterns: CustomPattern[]
  customCapabilities: CustomCapability[]
  configPresets?: ConfigPreset[]
}

const STORAGE = {
  projects: 'blueprint:projects:v2',
  activeProject: 'blueprint:active-project:v2',
  custom: 'blueprint:custom-patterns:v2',
  customCapabilities: 'blueprint:custom-capabilities:v3',
  learning: 'blueprint:learning-mode:v2',
  configPresets: 'blueprint:config-presets:v1',
  v1Selected: 'blueprint:selected-patterns:v1',
  v1Dna: 'blueprint:dna:v1',
  v1Custom: 'blueprint:custom-patterns:v1',
  v1Project: 'blueprint:project:v1',
}

const categories: ('All' | PatternCategory)[] = ['All', 'Navigation', 'Layout', 'Surfaces', 'Forms', 'Motion', 'Typography', 'Actions', 'Data Display', 'Feedback', 'Mobile UX', 'Content', 'Onboarding', 'Other']
const levels: ('All' | PatternLevel)[] = ['All', 'Familiar', 'Explore', 'Experimental']
const focusOptions: ReferenceFocus[] = ['Navigation', 'Layout', 'Typography', 'Color', 'Motion', 'Components', 'Composition', 'Other']

const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()

const safeStore = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (error) { console.warn(`Blueprint could not persist ${key}`, error) }
}

const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

const blankProject = (name = 'Untitled app'): Project => ({
  id: uid('project'),
  name,
  createdAt: now(),
  updatedAt: now(),
  selected: [],
  dna: structuredClone(defaultDna),
  references: [],
  snapshots: [],
  capabilities: [],
  docs: [...defaultDocIds],
  config: createProjectConfig(),
  context: structuredClone(emptyProjectContext),
})

const loadProjects = (): Project[] => {
  const v2 = safeParse<Project[]>(STORAGE.projects, [])
  if (v2.length) return v2.map((project) => ({ ...project, dna: normalizeDna(project.dna), references: project.references ?? [], snapshots: (project.snapshots ?? []).map((snapshot) => ({ ...snapshot, dna: normalizeDna(snapshot.dna), context: normalizeProjectContext(snapshot.context) })), capabilities: project.capabilities ?? [], docs: project.docs ?? [...defaultDocIds], config: normalizeProjectConfig(project.config), context: normalizeProjectContext(project.context) }))

  const legacySelected = safeParse<string[]>(STORAGE.v1Selected, [])
  const legacyDna = safeParse<Partial<Dna> & { palette?: string[] }>(STORAGE.v1Dna, {})
  const legacyName = safeParse<string>(STORAGE.v1Project, 'Untitled app')
  const migrated: Project = {
    ...blankProject(legacyName || 'Untitled app'),
    selected: legacySelected,
    dna: normalizeDna(legacyDna),
  }
  return [migrated]
}

const loadCustomCapabilities = (): CustomCapability[] => safeParse<CustomCapability[]>(STORAGE.customCapabilities, [])
const loadConfigPresets = (): ConfigPreset[] => safeParse<ConfigPreset[]>(STORAGE.configPresets, []).filter((preset) => preset && preset.id && preset.name && preset.overrides)

const loadCustomPatterns = (): CustomPattern[] => {
  const v2 = safeParse<CustomPattern[]>(STORAGE.custom, [])
  if (v2.length) return v2
  return safeParse<CustomPattern[]>(STORAGE.v1Custom, [])
}

const downloadText = (filename: string, text: string, type = 'text/plain') => {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'blueprint-project'

const imageToDataUrl = async (file: File) => {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is too large. Keep source images under 8 MB.')

  const source = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Could not read the image.'))
      image.src = source
    })
    const maxWidth = 1000
    const scale = Math.min(1, maxWidth / image.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Image processing is unavailable.')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.70)
  } finally {
    URL.revokeObjectURL(source)
  }
}

const dnaSimilarity = (a: Dna, b: Dna) => {
  const left = normalizeDna(a)
  const right = normalizeDna(b)
  const numericKeys: (keyof Dna)[] = [
    'density', 'iconWeight', 'cardWeight', 'radius', 'motion', 'bodyFontSize', 'headingScale',
    'headingWeight', 'bodyWeight', 'lineHeight', 'letterSpacing', 'textMeasure', 'contentMaxWidth',
    'pageGutters', 'sectionSpacing', 'surfaceRadius', 'controlRadius', 'buttonRadius', 'iconStrokeWeight',
    'iconSize', 'motionDuration',
  ]
  const categoricalKeys: (keyof Dna)[] = [
    'personality', 'themeMode', 'typographyCharacter', 'headingTypography', 'bodyTypography',
    'whitespacePriority', 'gridCharacter', 'alignmentTendency', 'functionalDensity', 'sectionStrategy', 'backgroundTreatment',
    'surfaceLanguage', 'shapeLanguage', 'buttonShape', 'buttonEmphasis', 'inputAppearance', 'imageryMode',
    'imageCharacter', 'imageTreatment', 'iconStyle', 'iconGeometry', 'motionAmount', 'motionCharacter',
    'pageTransition', 'accentUsage',
  ]
  const numericScore = numericKeys.reduce((sum, key) => {
    const aValue = Number(left[key])
    const bValue = Number(right[key])
    const span = key === 'bodyFontSize' ? 12 : key === 'headingScale' ? 2.2 : key === 'lineHeight' ? 1 : key === 'letterSpacing' ? 0.12 : key === 'contentMaxWidth' ? 1000 : key === 'pageGutters' || key === 'sectionSpacing' || key === 'surfaceRadius' || key === 'controlRadius' || key === 'buttonRadius' || key === 'iconSize' || key === 'motionDuration' ? 500 : 800
    return sum + Math.max(0, 1 - Math.abs(aValue - bValue) / span)
  }, 0) / numericKeys.length
  const categoricalScore = categoricalKeys.filter((key) => left[key] === right[key]).length / categoricalKeys.length
  const paletteKeys = Object.keys(left.palette) as (keyof typeof left.palette)[]
  const paletteScore = paletteKeys.filter((key) => left.palette[key] === right.palette[key]).length / Math.max(1, paletteKeys.length)
  const exclusions = jaccard(left.visualAntiPatterns, right.visualAntiPatterns)
  return numericScore * 0.34 + categoricalScore * 0.46 + paletteScore * 0.15 + exclusions * 0.05
}

const jaccard = (a: string[], b: string[]) => {
  const left = new Set(a)
  const right = new Set(b)
  const union = new Set([...left, ...right])
  if (!union.size) return 0
  let intersection = 0
  left.forEach((id) => { if (right.has(id)) intersection += 1 })
  return intersection / union.size
}

function similarityReport(project: Project, projects: Project[]) {
  const others = projects.filter((item) => item.id !== project.id)
  if (!others.length) return { score: null as number | null, project: null as Project | null, label: 'No comparison yet' }
  const ranked = others.map((other) => ({
    project: other,
    score: Math.round((jaccard(project.selected, other.selected) * 0.62 + dnaSimilarity(project.dna, other.dna) * 0.38) * 100),
  })).sort((a, b) => b.score - a.score)
  const top = ranked[0]
  return { score: top.score, project: top.project, label: top.score >= 76 ? 'Too familiar' : top.score >= 56 ? 'Related identity' : 'Distinct direction' }
}

function recommendationReason(pattern: Pattern, project: Project, projects: Project[]) {
  const otherUseCount = projects.filter((p) => p.id !== project.id && p.selected.includes(pattern.id)).length
  if (project.dna.stretch === 'Push me' && pattern.level === 'Experimental') return 'Creative stretch: intentionally outside the safest defaults.'
  if (otherUseCount === 0 && projects.length > 1) return 'Fresh for your saved workspaces.'
  if (project.dna.mobileFirst && pattern.tags.includes('mobile')) return 'Matches your mobile-first direction.'
  if (project.dna.iconWeight > 65 && pattern.tags.includes('icon-centric')) return 'Fits the current icon-led Visual Studio direction.'
  if (project.dna.density > 65 && (pattern.tags.includes('dense') || pattern.tags.includes('data'))) return 'Supports the denser information direction.'
  if (project.dna.density < 35 && (pattern.tags.includes('spacious') || pattern.tags.includes('minimal'))) return 'Supports the spacious Visual Studio direction.'
  if (project.dna.motion > 45 && pattern.category === 'Motion') return 'Matches the higher motion intensity.'
  return pattern.level === 'Explore' ? 'A useful step beyond common defaults.' : 'Compatible with the current direction.'
}

function recommendPatterns(allPatterns: Pattern[], project: Project, projects: Project[]) {
  const priorUsage = new Map<string, number>()
  projects.filter((p) => p.id !== project.id).forEach((p) => p.selected.forEach((id) => priorUsage.set(id, (priorUsage.get(id) ?? 0) + 1)))
  const config = normalizeProjectConfig(project.config)
  return allPatterns.filter((p) => !project.selected.includes(p.id) && patternApplicability(p, config).compatible).map((pattern) => {
    let score = 0
    const usage = priorUsage.get(pattern.id) ?? 0
    if (project.dna.mobileFirst && pattern.tags.includes('mobile')) score += 2
    if (project.dna.iconWeight > 65 && pattern.tags.includes('icon-centric')) score += 2
    if (project.dna.density > 65 && (pattern.tags.includes('dense') || pattern.tags.includes('data'))) score += 2
    if (project.dna.density < 35 && (pattern.tags.includes('spacious') || pattern.tags.includes('minimal'))) score += 2
    if (project.dna.motion > 45 && pattern.category === 'Motion') score += 2
    if (project.dna.stretch === 'Safe') score += pattern.level === 'Familiar' ? 3 : pattern.level === 'Explore' ? 1 : -2
    if (project.dna.stretch === 'Balanced') score += pattern.level === 'Explore' ? 3 : pattern.level === 'Familiar' ? 1 : 0
    if (project.dna.stretch === 'Push me') score += pattern.level === 'Experimental' ? 5 : pattern.level === 'Explore' ? 2 : -1
    score += Math.max(0, 3 - usage * 2)
    return { pattern, score, reason: recommendationReason(pattern, project, projects) }
  }).sort((a, b) => b.score - a.score).slice(0, 6)
}

function designSanity(input: Dna) {
  const dna = normalizeDna(input)
  const notes: string[] = []
  if (dna.iconWeight > 78 || dna.iconSize > 28) notes.push('High icon emphasis: keep text labels or tooltips for unfamiliar actions and never make icon recognition the only accessibility path.')
  if ((dna.cardWeight > 72 || dna.surfaceLanguage === 'Strong elevation') && dna.density > 62) notes.push('Dense + strongly contained surfaces can fragment hierarchy. Prefer shared sections or table/list structure for related information.')
  if ((dna.motion > 60 || dna.motionAmount === 'High') && !dna.reducedMotionFallback) notes.push('High motion requires a reduced-motion fallback. Task completion must remain independent of animation timing.')
  if (dna.density > 74 && dna.easePriority === 'Non-negotiable') notes.push('Very dense layout conflicts with non-negotiable ease. Use progressive disclosure or role-aware views before adding more persistent information.')
  if ((dna.radius > 82 || dna.shapeLanguage === 'Rounded') && dna.density > 65) notes.push('Very rounded geometry in a dense tool can consume space quickly. Keep compact controls proportionate.')
  if (dna.pillUsage === 'Frequent' && dna.visualAntiPatterns.includes('Excessive pills')) notes.push('Pill usage conflicts with the selected “Excessive pills” anti-pattern. Reserve pills for status, filters, or compact choices.')
  if ((dna.gradientUsage !== 'None' || dna.backgroundTreatment === 'Gradient') && dna.visualAntiPatterns.includes('Gradient-heavy UI')) notes.push('Gradient usage conflicts with the selected “Gradient-heavy UI” exclusion. Keep gradients isolated or turn them off.')
  if ((dna.glassUsage !== 'None' || dna.backgroundTreatment === 'Glass') && dna.visualAntiPatterns.includes('Glassmorphism')) notes.push('Glass treatment conflicts with the selected “Glassmorphism” exclusion. Prefer tonal or bordered layering.')
  if (dna.sectionStrategy === 'Strong separated sections' && dna.sectionContrast < 25) notes.push('Strong section separation paired with low contrast may read inconsistently. Increase contrast or use a subtler section strategy.')
  if (dna.bodyFontSize <= 14 && dna.textMeasure > 78) notes.push('Small body type with a very wide measure can reduce readability. Increase body size or narrow the readable line length.')

  const checkPalette = (label: string, palette: Dna['palette'], expected: 'light' | 'dark') => {
    const backgroundLuminance = colorLuminance(palette.background)
    if (expected === 'light' && backgroundLuminance < 0.28) notes.push(`${label} background is very dark. That can be intentional, but it behaves more like a dark theme and may make theme naming or auto-adaptation confusing.`)
    if (expected === 'dark' && backgroundLuminance > 0.55) notes.push(`${label} background is very light. That can be intentional, but it behaves more like a light theme.`)
    if (contrastRatio(palette.ink, palette.background) < 4.5) notes.push(`${label} primary text does not reach the 4.5:1 normal-text contrast target against the page background.`)
    if (contrastRatio(palette.muted, palette.background) < 4.5) notes.push(`${label} muted text is below 4.5:1 against the page background. Use it only for nonessential text or increase contrast.`)
    if (contrastRatio(palette.accentForeground, palette.accent) < 4.5) notes.push(`${label} accent foreground is below 4.5:1 on the accent fill, so primary button labels may be difficult to read.`)
    if (Math.max(contrastRatio(palette.focus, palette.background), contrastRatio(palette.focus, palette.surface)) < 3) notes.push(`${label} focus color may not reach 3:1 against either background or surface. Strengthen the focus indicator color or add a non-color cue.`)
    if (contrastRatio(palette.border, palette.background) < 1.35 && contrastRatio(palette.border, palette.surface) < 1.35) notes.push(`${label} border is extremely subtle against both page and surface backgrounds. Form/control boundaries may disappear.`)
  }

  const supportsLight = dna.themeMode !== 'Dark only'
  const supportsDark = dna.themeMode !== 'Light only'
  if (supportsLight) checkPalette('Light palette', dna.palette, 'light')
  if (supportsDark) checkPalette('Dark palette', resolvedDarkPalette(dna), 'dark')
  if (supportsLight && supportsDark && contrastRatio(dna.palette.background, resolvedDarkPalette(dna).background) < 1.5) notes.push('Light and dark page backgrounds are very similar, so switching themes may provide little perceptual difference.')
  if (dna.darkPaletteStrategy === 'Auto-adapted' && supportsLight && colorLuminance(dna.palette.background) < 0.28) notes.push('Auto-adapted dark mode is sourcing from an already-dark Light palette. Consider correcting the Light roles or switching to a separately curated dark palette.')

  return notes.length ? notes : ['No obvious Visual Studio tension. Validate the direction on a representative mobile and desktop screen before standardizing it.']
}

function visualReviewSignals(dna: Dna) {
  return designSanity(dna).filter((note) => !note.startsWith('No obvious Visual Studio tension.'))
}

function buildConfigLines(config: ProjectConfig) {
  return configSections.map((section) => {
    const settings = configSettings.filter((setting) => setting.section === section.id && settingIncludedInContract(setting, config))
    return {
      section,
      settings: settings.map((setting) => ({
        setting,
        value: effectiveConfigValue(config, setting.id),
        overridden: config.overrides.includes(setting.id),
        scope: isScopeSetting(setting.id) ? resolveScope(config, setting.id) : null,
      })),
    }
  }).filter((group) => group.settings.length > 0)
}

function contractValue(setting: (typeof configSettings)[number], config: ProjectConfig) {
  if (!isScopeSetting(setting.id)) return formatConfigValue(effectiveConfigValue(config, setting.id))
  const resolution = resolveScope(config, setting.id)
  if (!resolution.active) return 'Off'
  if (setting.kind === 'boolean') return resolution.source === 'Explicit' ? 'On' : `On — ${resolution.source.toLowerCase()}`
  return `${formatConfigValue(resolution.effectiveValue)}${resolution.choice === 'Auto' ? ` — ${resolution.source.toLowerCase()}` : ''}`
}

function buildConfigMarkdown(config: ProjectConfig) {
  return buildConfigLines(config).map(({ section, settings }) => `### ${section.label}\n${settings.map(({ setting, overridden, scope }) => `- ${setting.label}: ${contractValue(setting, config)}${overridden ? ' (customized)' : ''}${scope?.reason ? ` — ${scope.reason}` : ''}`).join('\n')}`).join('\n\n')
}

function buildConfigPrompt(config: ProjectConfig) {
  return buildConfigLines(config).map(({ section, settings }) => `${section.label.toUpperCase()}\n${settings.map(({ setting, scope }) => `- ${setting.label}: ${contractValue(setting, config)}.${scope?.reason ? ` ${scope.reason}` : ''}`).join('\n')}`).join('\n\n')
}

function buildConfigHighlights(config: ProjectConfig) {
  const packSettings = configSettings.filter((setting) => setting.section === 'business' && resolveScope(config, setting.id).active)
  const overrideSettings = config.overrides.map((id) => configSettings.find((setting) => setting.id === id)).filter((setting): setting is (typeof configSettings)[number] => Boolean(setting) && settingIncludedInContract(setting!, config))
  const explicitScope = Object.entries(config.scopeChoices).map(([id, choice]) => {
    const setting = configSettings.find((item) => item.id === id)
    return setting ? `- Scope — ${setting.label}: ${choice}` : null
  }).filter(Boolean) as string[]
  const lines = [
    `- App type: ${config.appType}`,
    `- Setup profile: ${config.profile}`,
    `- Operational scale: ${resolvedOperationalScale(config)}${config.operationalScale === 'Auto' ? ' (Auto-inferred)' : ' (explicit)'}`,
    `- Active business packs: ${packSettings.length ? packSettings.map((setting) => setting.label).join(', ') : 'None / general-purpose'}`,
    `- Deliberate customizations: ${config.overrides.length + Object.keys(config.scopeChoices).length}`,
  ]
  if (explicitScope.length) lines.push(...explicitScope.slice(0, 10))
  if (overrideSettings.length) lines.push(...overrideSettings.slice(0, 20).map((setting) => `- Customized — ${setting.label}: ${formatConfigValue(effectiveConfigValue(config, setting.id))}`))
  const hidden = Math.max(0, explicitScope.length + overrideSettings.length - 30)
  if (hidden) lines.push(`- …and ${hidden} more deliberate decisions in the full contract appendix.`)
  return lines.join('\n')
}

function buildMarkdown(project: Project, selectedPatterns: Pattern[], selectedCapabilities: Capability[], similarity: ReturnType<typeof similarityReport>) {
  const dna = project.dna
  const config = normalizeProjectConfig(project.config)
  const readiness = configReadiness(config)
  const criteria = acceptanceCriteria(config)
  const cases = edgeCases(config)
  const warnings = configWarnings(config)
  const contextSignals = projectContextReviewSignals(project.context, config)
  const visualSignals = visualReviewSignals(dna)
  const resolvedCapabilities = activeCapabilities(selectedCapabilities, config)
  const resolvedPatterns = activePatterns(selectedPatterns, config)
  const layerSignals = crossLayerSignals(selectedCapabilities, selectedPatterns, config)
  const references = project.references.length
    ? project.references.map((ref) => `- ${ref.title}${ref.url ? ` — ${ref.url}` : ''}\n  - Use only for: ${ref.focus.join(', ') || 'general direction'}\n  - Note: ${ref.note || 'No note supplied.'}`).join('\n')
    : '- No external references saved.'
  const docs = projectDocs.filter((doc) => project.docs.includes(doc.id))

  return `# ${project.name}\n\n## Blueprint summary\n${buildConfigHighlights(config)}\n- Readiness: ${readiness.score}% — ${readiness.label}\n- Decision coverage: ${readiness.coverage}%\n${warnings.length + contextSignals.length + visualSignals.length + layerSignals.length ? `- Review signals: ${warnings.length + contextSignals.length + visualSignals.length + layerSignals.length} (${warnings.length} App Setup, ${contextSignals.length} Project Context advisory, ${visualSignals.length} visual, ${layerSignals.length} cross-layer)` : '- Review signals: None'}\n\n## User-provided project context — optional / verbatim\n${projectContextPrompt(project.context)}\n\nThis context is interpretive guidance only. It must not create, remove, or override structured Blueprint scope.\n\n## Acceptance criteria\n${criteria.map((item) => `- ${item}`).join('\n')}\n\n## Edge cases to prove\n${cases.map((item) => `- ${item}`).join('\n')}\n\n${warnings.length ? `## App Setup review signals\n${warnings.map((warning) => `- ${warning}`).join('\n')}\n\n` : ''}${contextSignals.length ? `## Project Context review signals — advisory only\nThese signals do not change structured scope. Review them only if they reveal that App Setup does not match the user's stated intent.\n${contextSignals.map((signal) => `- ${signal.title}: ${signal.detail}`).join('\n')}\n\n` : ''}${visualSignals.length ? `## Visual review signals\n${visualSignals.map((signal) => `- ${signal}`).join('\n')}\n\n` : ''}## Product direction\n- Mobile-first: ${dna.mobileFirst ? 'Yes' : 'No'}\n- Ease-of-use priority: ${dna.easePriority}\n- Creative stretch: ${dna.stretch}\n\n## Product capabilities\n${resolvedCapabilities.length ? resolvedCapabilities.map((cap) => `### ${cap.name}\n${cap.prompt}\nBest fit: ${cap.bestFor}\nWatchout: ${cap.watchout}`).join('\n\n') : 'No active compatible product capabilities selected yet.'}\n\n## Visual Studio — structured visual contract\n- Personality: ${dna.personality}\n- Ease-of-use priority: ${dna.easePriority}\n- Creative stretch: ${dna.stretch}\n\n${visualDnaContract(dna)}\n\n## Selected visual patterns\n${resolvedPatterns.length ? resolvedPatterns.map((pattern) => `### ${pattern.name}\n${pattern.prompt}\nBest fit: ${pattern.bestFor}\nWatchout: ${pattern.watchout}`).join('\n\n') : 'No active compatible visual patterns selected yet.'}\n\n${layerSignals.length ? `## Cross-layer review\nThese saved selections are preserved but intentionally excluded from implementation direction until App Setup makes them compatible:\n${layerSignals.map((signal) => `- ${signal}`).join('\n')}\n\n` : ''}## Directional references\n${references}\n\n## MVP documentation to generate\n${docs.length ? docs.map((doc) => `- ${doc.filename} — ${doc.summary}`).join('\n') : '- No project documentation files selected.'}\n\n## Variety check\n${similarity.score === null ? 'No prior project is available for comparison yet.' : `Closest saved project: ${similarity.project?.name} (${similarity.score}% similarity). Status: ${similarity.label}.`}\n\n## Full active app-setup contract\nThis appendix is intentionally exhaustive for implementation agents. The summary above is the human review surface.\n\n${buildConfigMarkdown(config)}\n\n## Implementation principle\nInstruction authority, highest to lowest: (1) explicit App Setup scope, (2) required/inferred structured dependencies and hard Blueprint constraints, (3) user-provided Project Context as interpretive guidance only, (4) recommended behavior/quality defaults inside active scope, then (5) implementation judgment where Blueprint is silent. Never create a feature solely because a behavioral default, capability card, visual pattern, reference, or free-text context mentions it. Saved capabilities/patterns excluded by cross-layer resolution are not implementation requirements. Preserve usability, responsiveness, accessibility, data integrity, and the app's actual workflow. References are directional; do not copy external designs verbatim. Avoid generic SaaS styling, arbitrary visual effects, repetitive admin work that can reasonably be automated, and repeating the same visual language across unrelated projects.\n`
}

function buildDocsManifest(project: Project, selectedCapabilities: Capability[]) {
  const docs = projectDocs.filter((doc) => project.docs.includes(doc.id))
  const config = normalizeProjectConfig(project.config)
  const resolvedCapabilities = activeCapabilities(selectedCapabilities, config)
  const capabilityNames = resolvedCapabilities.map((cap) => cap.name).join(', ') || 'No active capabilities selected yet'
  return `# Documentation Manifest — ${project.name}\n\nGenerate and maintain these files as part of the MVP. Keep each document concise, repository-specific, and updated when implementation materially changes.\n\nSelected capabilities: ${capabilityNames}\n\n${docs.map((doc) => `## ${doc.filename}\nPurpose: ${doc.summary}\nWhy it exists: ${doc.why}\nSuggested sections:\n${doc.sections.map((section) => `- ${section}`).join('\n')}`).join('\n\n')}\n\n## Documentation rule\nDo not create filler documentation. Every selected file must contain project-specific decisions, commands, constraints, and current truth. Cross-link related docs instead of duplicating large sections.\n`
}

function buildAgentPrompt(project: Project, selectedPatterns: Pattern[], selectedCapabilities: Capability[]) {
  const dna = project.dna
  const config = normalizeProjectConfig(project.config)
  const docs = projectDocs.filter((doc) => project.docs.includes(doc.id))
  const criteria = acceptanceCriteria(config)
  const cases = edgeCases(config)
  const warnings = configWarnings(config)
  const contextSignals = projectContextReviewSignals(project.context, config)
  const visualSignals = visualReviewSignals(dna)
  const resolvedCapabilities = activeCapabilities(selectedCapabilities, config)
  const resolvedPatterns = activePatterns(selectedPatterns, config)
  const layerSignals = crossLayerSignals(selectedCapabilities, selectedPatterns, config)
  return `Build or improve “${project.name}” according to this Blueprint. Preserve working behavior unless a change is explicitly required.\n\nBLUEPRINT SUMMARY\n${buildConfigHighlights(config)}\n- Usability is non-negotiable: common paths must be obvious, advanced/irrelevant controls progressively disclosed, user work preserved, and recovery from errors clear.\n${warnings.length ? `- Resolve these App Setup review signals deliberately before calling the implementation complete:\n${warnings.map((warning) => `  - ${warning}`).join('\n')}` : '- The current Blueprint has no App Setup review signals.'}\n${contextSignals.length ? `- Project Context advisory review: ${contextSignals.length} possible scope mismatch${contextSignals.length > 1 ? 'es' : ''}. These are suggestions only and MUST NOT change scope automatically.` : '- Project Context advisory review: No obvious structured-scope mismatch detected.'}
${visualSignals.length ? `- Visual review: ${visualSignals.length} deterministic color/design sanity signal${visualSignals.length > 1 ? 's' : ''} should be resolved or deliberately accepted.` : '- Visual review: No obvious deterministic visual tension.'}\n${layerSignals.length ? `- Cross-layer review: ${layerSignals.length} saved selection${layerSignals.length > 1 ? 's are' : ' is'} excluded from implementation direction until App Setup becomes compatible.` : '- Cross-layer review: No saved selection conflicts.'}\n\nUSER-PROVIDED PROJECT CONTEXT — OPTIONAL / VERBATIM\n${projectContextPrompt(project.context)}\nInterpret these answers as human intent and priorities only. Do not translate them into new product scope, do not silently change structured choices, and do not let them override explicit or resolved App Setup.
${contextSignals.length ? `\nPROJECT CONTEXT REVIEW SIGNALS — ADVISORY ONLY\n${contextSignals.map((signal) => `- ${signal.title}: ${signal.detail}`).join('\n')}\nTreat these as prompts for human review, never as authorization to add features.` : ''}\n\nACCEPTANCE CRITERIA\n${criteria.map((item) => `- ${item}`).join('\n')}\n\nEDGE CASES TO TEST\n${cases.map((item) => `- ${item}`).join('\n')}\n\nFULL APP SETUP CONTRACT\n${buildConfigPrompt(config)}\n\nPRODUCT CAPABILITIES\n${resolvedCapabilities.length ? resolvedCapabilities.map((c) => `- ${c.name}: ${c.prompt}`).join('\n') : '- No active compatible capabilities selected; do not invent major product scope.'}\n\nVISUAL STUDIO — STRUCTURED VISUAL CONTRACT\n- Personality: ${dna.personality}\n- Ease of use: ${dna.easePriority}. Creative stretch: ${dna.stretch}.\n${visualDnaContract(dna, true)}\n\n${visualSignals.length ? `VISUAL REVIEW SIGNALS\n${visualSignals.map((signal) => `- ${signal}`).join('\n')}\n\n` : ''}VISUAL PATTERNS TO INTERPRET, NOT COPY AS A TEMPLATE\n${resolvedPatterns.length ? resolvedPatterns.map((p) => `- ${p.name}: ${p.prompt}`).join('\n') : '- No active compatible visual patterns selected; derive a coherent system from the structured Visual Studio contract.'}\n\n${layerSignals.length ? `CROSS-LAYER REVIEW — SAVED BUT EXCLUDED\nThe following saved capability/pattern choices conflict with resolved App Setup. Do not implement them unless the structured setting is changed:\n${layerSignals.map((signal) => `- ${signal}`).join('\n')}\n\n` : ''}REFERENCES\n${project.references.length ? project.references.map((ref) => `- ${ref.title}: use only for ${ref.focus.join(', ') || 'the noted direction'}. ${ref.note}`).join('\n') : '- None supplied.'}\n\nMVP PROJECT DOCS\nGenerate and maintain these repository files as part of the implementation:\n${docs.length ? docs.map((doc) => `- ${doc.filename}: ${doc.summary}`).join('\n') : '- No additional Markdown files selected.'}\n\nGUARDRAILS\nInstruction authority, highest to lowest: (1) explicit App Setup scope, (2) required/inferred structured dependencies and hard Blueprint constraints, (3) user-provided Project Context as interpretive guidance only, (4) recommended behavior/quality defaults inside active scope, then (5) implementation judgment where Blueprint is silent. Never create a feature solely because a behavioral default, capability card, visual pattern, reference, or free-text context mentions it. Saved capabilities/patterns excluded by cross-layer resolution are not implementation requirements. Keep capabilities modular and authorization/server validation explicit. Minimize repetitive manual operations when safe automation is reasonable. Keep the interface internally consistent but visually distinct from unrelated past projects. Do not add generic SaaS decoration, arbitrary gradients/glows, excessive cards, or motion that delays tasks. Use strong hierarchy, deliberate spacing, accessible contrast, large touch targets where applicable, and reduced-motion fallbacks for meaningful animation. Before completion, run the project’s validation/build/test commands, prove the acceptance criteria and relevant edge cases, resolve review signals, and update the selected documentation to match the final implementation.`
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [projects, setProjects] = useState<Project[]>(loadProjects)
  const [activeProjectId, setActiveProjectId] = useState(() => safeParse<string>(STORAGE.activeProject, ''))
  const [customPatterns, setCustomPatterns] = useState<CustomPattern[]>(loadCustomPatterns)
  const [customCapabilities, setCustomCapabilities] = useState<CustomCapability[]>(loadCustomCapabilities)
  const [configPresets, setConfigPresets] = useState<ConfigPreset[]>(loadConfigPresets)
  const [learningMode, setLearningMode] = useState(() => safeParse<boolean>(STORAGE.learning, true))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'All' | PatternCategory>('All')
  const [level, setLevel] = useState<'All' | PatternLevel>('All')
  const [capSearch, setCapSearch] = useState('')
  const [capCategory, setCapCategory] = useState<'All' | CapabilityCategory>('All')
  const [capLevel, setCapLevel] = useState<'All' | CapabilityLevel>('All')
  const [detail, setDetail] = useState<Pattern | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [showCustomCapability, setShowCustomCapability] = useState(false)
  const [showReference, setShowReference] = useState(false)
  const [showProjectCreate, setShowProjectCreate] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showPowerTools, setShowPowerTools] = useState(false)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement | null>(null)

  const allPatterns = useMemo(() => [...patterns, ...customPatterns], [customPatterns])
  const allCapabilities = useMemo(() => [...capabilities, ...customCapabilities], [customCapabilities])
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0]

  useEffect(() => {
    if (!activeProjectId && projects[0]) setActiveProjectId(projects[0].id)
    if (activeProjectId && !projects.some((project) => project.id === activeProjectId) && projects[0]) setActiveProjectId(projects[0].id)
  }, [activeProjectId, projects])

  useEffect(() => safeStore(STORAGE.projects, projects), [projects])
  useEffect(() => { if (activeProjectId) safeStore(STORAGE.activeProject, activeProjectId) }, [activeProjectId])
  useEffect(() => safeStore(STORAGE.custom, customPatterns), [customPatterns])
  useEffect(() => safeStore(STORAGE.customCapabilities, customCapabilities), [customCapabilities])
  useEffect(() => safeStore(STORAGE.configPresets, configPresets), [configPresets])
  useEffect(() => safeStore(STORAGE.learning, learningMode), [learningMode])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1900)
  }

  if (!activeProject) return null

  const updateProject = (patch: Partial<Project> | ((project: Project) => Partial<Project>)) => {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeProject.id) return project
      const nextPatch = typeof patch === 'function' ? patch(project) : patch
      return { ...project, ...nextPatch, updatedAt: now() }
    }))
  }

  const selectedPatterns = allPatterns.filter((pattern) => activeProject.selected.includes(pattern.id))
  const selectedCapabilities = allCapabilities.filter((capability) => activeProject.capabilities.includes(capability.id))
  const normalizedActiveConfig = normalizeProjectConfig(activeProject.config)
  const resolvedPatterns = activePatterns(selectedPatterns, normalizedActiveConfig)
  const resolvedCapabilities = activeCapabilities(selectedCapabilities, normalizedActiveConfig)
  const similarity = similarityReport(activeProject, projects)
  const recommendations = recommendPatterns(allPatterns, activeProject, projects)

  const toggleCapability = (id: string) => {
    const capability = allCapabilities.find((item) => item.id === id)
    updateProject((project) => {
      if (project.capabilities.includes(id)) return { capabilities: project.capabilities.filter((item) => item !== id) }
      const resolved = new Set<string>()
      const visit = (capabilityId: string) => {
        if (resolved.has(capabilityId)) return
        const item = allCapabilities.find((entry) => entry.id === capabilityId)
        item?.dependencies?.forEach(visit)
        resolved.add(capabilityId)
      }
      visit(id)
      return { capabilities: Array.from(new Set([...project.capabilities, ...resolved])) }
    })
    if (capability?.dependencies?.length) notify('Capability selected with required foundations')
  }

  const toggleDoc = (id: string) => updateProject((project) => ({ docs: project.docs.includes(id) ? project.docs.filter((item) => item !== id) : [...project.docs, id] }))

  const addCustomCapability = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const summary = String(data.get('summary') || '').trim()
    if (!name || !summary) return
    const custom: CustomCapability = {
      id: uid('cap'), custom: true, name, summary,
      category: String(data.get('category') || 'Data & Records') as CapabilityCategory,
      level: String(data.get('level') || 'Advanced') as CapabilityLevel,
      bestFor: String(data.get('bestFor') || 'Projects where this capability creates clear user or operational value.'),
      watchout: String(data.get('watchout') || 'Define scope, failure behavior, and ownership before making it a default.'),
      prompt: String(data.get('prompt') || `Implement ${name} as a reusable, well-bounded capability with clear validation, authorization, and failure states.`),
      tags: String(data.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    }
    setCustomCapabilities((current) => [...current, custom])
    setShowCustomCapability(false)
    notify('Capability added to reusable library')
  }

  const removeCustomCapability = (id: string) => {
    setCustomCapabilities((current) => current.filter((item) => item.id !== id))
    setProjects((current) => current.map((project) => ({ ...project, capabilities: project.capabilities.filter((item) => item !== id) })))
    notify('Custom capability removed')
  }

  const togglePattern = (id: string) => {
    updateProject((project) => ({ selected: project.selected.includes(id) ? project.selected.filter((item) => item !== id) : [...project.selected, id] }))
  }

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 3) {
        notify('Compare up to 3 patterns at a time')
        return current
      }
      return [...current, id]
    })
  }

  const copy = async (text: string, message = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text)
      notify(message)
    } catch {
      notify('Copy unavailable in this browser')
    }
  }

  const saveConfigPreset = (name: string, config: ProjectConfig) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const overrides = Object.fromEntries(config.overrides.map((id) => [id, config.values[id]]))
    const preset: ConfigPreset = { id: uid('preset'), name: trimmed, createdAt: now(), appType: config.appType, profile: config.profile, operationalScale: config.operationalScale, overrides, scopeChoices: { ...config.scopeChoices } }
    setConfigPresets((current) => [preset, ...current].slice(0, 20))
    notify('Reusable setup preset saved')
  }

  const applyConfigPreset = (preset: ConfigPreset) => {
    let next = createProjectConfig(preset.appType, preset.profile, preset.operationalScale ?? 'Auto')
    for (const [id, presetValue] of Object.entries(preset.overrides)) next = setConfigValue(next, id, presetValue)
    for (const [id, choice] of Object.entries(preset.scopeChoices ?? {})) next = setScopeChoice(next, id, choice)
    updateProject({ config: next })
    notify(`${preset.name} applied`)
  }

  const deleteConfigPreset = (id: string) => {
    setConfigPresets((current) => current.filter((preset) => preset.id !== id))
    notify('Setup preset removed')
  }

  const createProject = (name: string, appType: AppType) => {
    const project = blankProject(name.trim() || 'Untitled app')
    project.config = createProjectConfig(appType, 'Recommended')
    setProjects((current) => [...current, project])
    setActiveProjectId(project.id)
    setShowProjectCreate(false)
    setView('home')
    notify('Workspace created')
  }

  const duplicateProject = () => {
    const clone: Project = {
      ...activeProject,
      id: uid('project'),
      name: `${activeProject.name} — alternate`,
      createdAt: now(),
      updatedAt: now(),
      dna: structuredClone(activeProject.dna),
      config: structuredClone(activeProject.config),
      context: structuredClone(activeProject.context),
      references: activeProject.references.map((ref) => ({ ...ref, id: uid('ref') })),
      snapshots: [],
    }
    setProjects((current) => [...current, clone])
    setActiveProjectId(clone.id)
    notify('Alternate workspace created')
  }

  const deleteProject = () => {
    if (projects.length <= 1) {
      notify('Keep at least one workspace')
      return
    }
    const remaining = projects.filter((project) => project.id !== activeProject.id)
    setProjects(remaining)
    setActiveProjectId(remaining[0].id)
    setView('home')
    notify('Workspace removed')
  }

  const addSnapshot = () => {
    const snapshot: Snapshot = {
      id: uid('checkpoint'),
      label: `Checkpoint ${activeProject.snapshots.length + 1}`,
      createdAt: now(),
      selected: [...activeProject.selected],
      dna: structuredClone(activeProject.dna),
      config: structuredClone(activeProject.config),
      capabilities: [...activeProject.capabilities],
      docs: [...activeProject.docs],
      references: structuredClone(activeProject.references),
      context: structuredClone(activeProject.context),
    }
    updateProject((project) => ({ snapshots: [snapshot, ...project.snapshots].slice(0, 24) }))
    notify('Design checkpoint saved')
  }

  const restoreSnapshot = (snapshot: Snapshot) => {
    updateProject({
      selected: [...snapshot.selected],
      dna: normalizeDna(snapshot.dna),
      ...(snapshot.config ? { config: normalizeProjectConfig(snapshot.config) } : {}),
      ...(snapshot.capabilities ? { capabilities: [...snapshot.capabilities] } : {}),
      ...(snapshot.docs ? { docs: [...snapshot.docs] } : {}),
      ...(snapshot.references ? { references: structuredClone(snapshot.references) } : {}),
      ...(snapshot.context ? { context: normalizeProjectContext(snapshot.context) } : {}),
    })
    notify('Checkpoint restored')
  }


  const addCustomPattern = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const categoryValue = String(data.get('category') || 'Layout') as PatternCategory
    const custom: CustomPattern = {
      id: uid('custom'),
      custom: true,
      name: String(data.get('name') || '').trim(),
      summary: String(data.get('summary') || '').trim(),
      category: categoryValue,
      level: String(data.get('level') || 'Explore') as PatternLevel,
      bestFor: String(data.get('bestFor') || 'Use where the pattern improves hierarchy or task clarity.').trim(),
      watchout: String(data.get('watchout') || 'Validate usability and accessibility before making it a default.').trim(),
      prompt: String(data.get('prompt') || `Use ${String(data.get('name') || '').trim()} intentionally and keep it consistent with the selected Visual Studio contract.`).trim(),
      tags: String(data.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      preview: categoryValue === 'Navigation' ? 'bottom-dock' : categoryValue === 'Motion' ? 'staggered-enter' : categoryValue === 'Typography' ? 'editorial-type' : categoryValue === 'Forms' ? 'sectioned-form' : categoryValue === 'Data Display' ? 'metric-strip' : 'outlined-panels',
      sourceUrl: String(data.get('sourceUrl') || '').trim() || undefined,
      principle: 'A personally captured design pattern. Refine the rationale as your understanding grows.',
    }
    if (!custom.name || !custom.summary) return
    setCustomPatterns((current) => [...current, custom])
    setShowCustom(false)
    notify('Discovery added to your library')
  }

  const removeCustomPattern = (id: string) => {
    setCustomPatterns((current) => current.filter((pattern) => pattern.id !== id))
    setProjects((current) => current.map((project) => ({ ...project, selected: project.selected.filter((item) => item !== id) })))
    setDetail(null)
    notify('Discovery removed')
  }

  const addReference = async (form: HTMLFormElement, imageFile?: File) => {
    const data = new FormData(form)
    let imageData: string | undefined
    try {
      if (imageFile) imageData = await imageToDataUrl(imageFile)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not process image')
      return
    }
    const title = String(data.get('title') || '').trim()
    const url = String(data.get('url') || '').trim()
    if (!title && !url && !imageData) {
      notify('Add a title, URL, or image')
      return
    }
    const reference: ReferenceItem = {
      id: uid('ref'),
      title: title || url || 'Untitled reference',
      url,
      note: String(data.get('note') || '').trim(),
      focus: data.getAll('focus').map(String) as ReferenceFocus[],
      imageData,
      createdAt: now(),
    }
    updateProject((project) => ({ references: [reference, ...project.references] }))
    setShowReference(false)
    notify('Reference saved')
  }

  const removeReference = (id: string) => {
    updateProject((project) => ({ references: project.references.filter((reference) => reference.id !== id) }))
    notify('Reference removed')
  }

  const exportBackup = () => {
    const bundle: BackupBundle = { version: 10, exportedAt: now(), activeProjectId: activeProject.id, projects, customPatterns, customCapabilities, configPresets }
    downloadText(`blueprint-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(bundle, null, 2), 'application/json')
    notify('Backup exported')
  }

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<BackupBundle>
      if (![2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(parsed.version)) || !Array.isArray(parsed.projects) || !parsed.projects.length) throw new Error('Not a compatible Blueprint backup.')
      const restored = parsed.projects.map((project) => ({ ...project, dna: normalizeDna(project.dna), references: project.references ?? [], snapshots: (project.snapshots ?? []).map((snapshot) => ({ ...snapshot, dna: normalizeDna(snapshot.dna), context: normalizeProjectContext(snapshot.context) })), capabilities: project.capabilities ?? [], docs: project.docs ?? [...defaultDocIds], config: normalizeProjectConfig(project.config), context: normalizeProjectContext(project.context) })) as Project[]
      setProjects(restored)
      setCustomPatterns(Array.isArray(parsed.customPatterns) ? parsed.customPatterns : [])
      setCustomCapabilities(Array.isArray(parsed.customCapabilities) ? parsed.customCapabilities : [])
      setConfigPresets(Array.isArray(parsed.configPresets) ? parsed.configPresets : [])
      setActiveProjectId(parsed.activeProjectId && restored.some((p) => p.id === parsed.activeProjectId) ? parsed.activeProjectId : restored[0].id)
      setView('home')
      notify('Backup imported')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not import backup')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const markdown = buildMarkdown(activeProject, selectedPatterns, selectedCapabilities, similarity)
  const agentPrompt = buildAgentPrompt(activeProject, selectedPatterns, selectedCapabilities)
  const docsManifest = buildDocsManifest(activeProject, selectedCapabilities)

  const navigate = (next: View) => {
    setView(next)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const coreNav = [
    { id: 'home' as View, label: 'Workspace', icon: Home },
    { id: 'setup' as View, label: 'App setup', icon: Settings2, count: (activeProject.config.overrides.length + Object.keys(activeProject.config.scopeChoices ?? {}).length) || undefined },
    { id: 'dna' as View, label: 'Visual Studio', icon: Palette },
    { id: 'spec' as View, label: 'Generated spec', icon: ClipboardList },
  ]
  const toolNav = [
    { id: 'patterns' as View, label: 'Pattern explorer', icon: Grid3X3, count: activeProject.selected.length || undefined },
    { id: 'capabilities' as View, label: 'Product capabilities', icon: Settings2, count: activeProject.capabilities.length || undefined },
    { id: 'docs' as View, label: 'Project docs', icon: FileText, count: activeProject.docs.length || undefined },
    { id: 'references' as View, label: 'Reference board', icon: ImageIcon, count: activeProject.references.length || undefined },
    { id: 'inspiration' as View, label: 'Inspiration', icon: Compass },
    { id: 'compare' as View, label: 'Compare patterns', icon: Layers3, count: compareIds.length || undefined },
  ]
  const powerToolActive = toolNav.some((item) => item.id === view)

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('home')}><span className="brand-mark"><Sparkles size={18}/></span><span><strong>Blueprint</strong><small>product + visual blueprint</small></span></button>
      <div className="project-switcher">
        <span>Active workspace</span>
        <label><select value={activeProject.id} onChange={(event) => { setActiveProjectId(event.target.value); setView('home') }}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select><ChevronDown size={14}/></label>
      </div>
      <nav className="sidebar-nav">{coreNav.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={17}/><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}</button>)}
        <button className={`nav-tools-toggle ${(showPowerTools || powerToolActive) ? 'open' : ''}`} onClick={() => setShowPowerTools((value) => !value)} aria-expanded={showPowerTools || powerToolActive}><span>More tools</span><ChevronDown size={14}/></button>
        {(showPowerTools || powerToolActive) && <div className="nav-tools">{toolNav.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={16}/><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}</button>)}</div>}
      </nav>
      <div className="sidebar-note"><div className="eyebrow"><WandSparkles size={13}/> Configurable core</div><p>Auto resolves scope. Customize only the product decisions your project actually needs.</p></div>
    </aside>

    <header className="mobile-header"><button className="brand compact" onClick={() => navigate('home')}><span className="brand-mark"><Sparkles size={16}/></span><span><strong>Blueprint</strong><small>{activeProject.name}</small></span></button><button className="icon-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={19}/></button></header>

    {mobileMenu && <div className="mobile-drawer-wrap" onMouseDown={() => setMobileMenu(false)}><aside className="mobile-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-head"><strong>{activeProject.name}</strong><button className="icon-button" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18}/></button></div><div className="drawer-group-label">Core flow</div>{coreNav.map((item) => <button className="drawer-nav" key={item.id} onClick={() => navigate(item.id)}><item.icon size={17}/>{item.label}<ChevronRight size={15}/></button>)}<div className="drawer-group-label">More tools</div>{toolNav.map((item) => <button className="drawer-nav" key={item.id} onClick={() => navigate(item.id)}><item.icon size={17}/>{item.label}<ChevronRight size={15}/></button>)}</aside></div>}

    <main className="main-content">
      {view === 'home' && <HomeView project={activeProject} projects={projects} patterns={allPatterns} recommendations={recommendations} similarity={similarity} setView={navigate} updateProject={updateProject} create={() => setShowProjectCreate(true)} duplicate={duplicateProject} remove={deleteProject} addSnapshot={addSnapshot} restoreSnapshot={restoreSnapshot} exportBackup={exportBackup} importRef={importRef} importBackup={importBackup}/>} 
      {view === 'setup' && <SetupView project={activeProject} updateProject={updateProject} notify={notify} presets={configPresets} savePreset={saveConfigPreset} applyPreset={applyConfigPreset} deletePreset={deleteConfigPreset} setView={navigate}/>} 
      {view === 'patterns' && <PatternsView patterns={allPatterns} selected={activeProject.selected} config={normalizedActiveConfig} compareIds={compareIds} search={search} setSearch={setSearch} category={category} setCategory={setCategory} level={level} setLevel={setLevel} setDetail={setDetail} toggle={togglePattern} toggleCompare={toggleCompare} compare={() => navigate('compare')} addCustom={() => setShowCustom(true)} learningMode={learningMode} setLearningMode={setLearningMode}/>} 
      {view === 'capabilities' && <CapabilitiesView capabilities={allCapabilities} selected={activeProject.capabilities} config={normalizedActiveConfig} search={capSearch} setSearch={setCapSearch} category={capCategory} setCategory={setCapCategory} level={capLevel} setLevel={setCapLevel} toggle={toggleCapability} addCustom={() => setShowCustomCapability(true)} removeCustom={removeCustomCapability}/>} 
      {view === 'docs' && <DocsView project={activeProject} selectedCapabilities={resolvedCapabilities} toggle={toggleDoc} updateProject={updateProject} copy={copy}/>} 
      {view === 'compare' && <CompareView ids={compareIds} patterns={allPatterns} selected={activeProject.selected} toggle={togglePattern} removeCompare={toggleCompare} browse={() => navigate('patterns')} learningMode={learningMode}/>} 
      {view === 'dna' && <><VisualStudio dna={activeProject.dna} onChange={(dna) => updateProject({ dna })} suggestionContext={{ appType: normalizedActiveConfig.appType, activePacks: configSettings.filter((setting) => setting.section === 'business' && isScopeSetting(setting.id) && resolveScope(normalizedActiveConfig, setting.id).active).map((setting) => setting.label), projectContext: projectContextEntries(activeProject.context).map((entry) => entry.value).join(' '), dna: activeProject.dna }} recommendations={recommendations} onAddPattern={togglePattern} onOpenPattern={setDetail} sanity={designSanity}/><div className="flow-next"><div><span>Next</span><strong>Implementation brief</strong><small>Review the resolved scope and visual direction together before handing it to a coding agent.</small></div><button className="primary-button" onClick={() => navigate('spec')}>Review generated spec <ArrowRight size={15}/></button></div></>} 
      {view === 'references' && <ReferencesView project={activeProject} add={() => setShowReference(true)} remove={removeReference}/>} 
      {view === 'inspiration' && <InspirationView addReference={() => setShowReference(true)}/>} 
      {view === 'spec' && <SpecView project={activeProject} selectedPatterns={selectedPatterns} selectedCapabilities={selectedCapabilities} similarity={similarity} markdown={markdown} agentPrompt={agentPrompt} docsManifest={docsManifest} copy={copy} updateProject={updateProject} addSnapshot={addSnapshot} setView={navigate}/>} 
    </main>

    <nav className="mobile-bottom-nav">
      {[{ id: 'home' as View, icon: Home, label: 'Home' }, { id: 'setup' as View, icon: Settings2, label: 'Setup' }, { id: 'dna' as View, icon: Palette, label: 'Studio' }, { id: 'spec' as View, icon: ClipboardList, label: 'Spec' }].map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={18}/><span>{item.label}</span></button>)}
      <button className={powerToolActive ? 'active' : ''} onClick={() => setMobileMenu(true)} aria-label="Open more tools"><Menu size={18}/><span>More</span></button>
    </nav>

    {detail && <PatternDetail pattern={detail} selected={activeProject.selected.includes(detail.id)} toggle={() => togglePattern(detail.id)} close={() => setDetail(null)} copy={copy} learningMode={learningMode} related={allPatterns} openRelated={setDetail} removeCustom={'custom' in detail && detail.custom ? () => removeCustomPattern(detail.id) : undefined}/>} 
    {showCustomCapability && <CustomCapabilityModal close={() => setShowCustomCapability(false)} add={addCustomCapability}/>} 
    {showCustom && <CustomPatternModal close={() => setShowCustom(false)} add={addCustomPattern}/>} 
    {showReference && <ReferenceModal close={() => setShowReference(false)} add={addReference}/>} 
    {showProjectCreate && <ProjectModal close={() => setShowProjectCreate(false)} create={createProject}/>} 
    {toast && <div className="toast"><Check size={14}/>{toast}</div>}
  </div>
}

function PageHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>{action}</header>
}

function SetupView({ project, updateProject, notify, presets, savePreset, applyPreset, deletePreset, setView }: {
  project: Project
  updateProject: (patch: Partial<Project> | ((project: Project) => Partial<Project>)) => void
  notify: (message: string) => void
  presets: ConfigPreset[]
  savePreset: (name: string, config: ProjectConfig) => void
  applyPreset: (preset: ConfigPreset) => void
  deletePreset: (id: string) => void
  setView: (view: View) => void
}) {
  const config = normalizeProjectConfig(project.config)
  const [search, setSearch] = useState('')
  const [configDepth, setConfigDepth] = useState<ConfigDepth>(() => {
    const saved = window.localStorage.getItem('blueprint-setup-depth')
    return saved === 'Standard' || saved === 'Advanced' ? saved : 'Quick'
  })
  const [customOnly, setCustomOnly] = useState(false)
  const [showAvailableScope, setShowAvailableScope] = useState(false)
  const [showRecommendationTuning, setShowRecommendationTuning] = useState(() => config.profile !== 'Recommended' || config.operationalScale !== 'Auto')
  const [openSections, setOpenSections] = useState<string[]>(['identity'])
  const [savingPreset, setSavingPreset] = useState(false)
  const [presetName, setPresetName] = useState('')
  useEffect(() => { window.localStorage.setItem('blueprint-setup-depth', configDepth) }, [configDepth])
  useEffect(() => {
    if (config.profile !== 'Recommended' || config.operationalScale !== 'Auto') setShowRecommendationTuning(true)
  }, [config.profile, config.operationalScale])
  const warnings = configWarnings(config)
  const contextSignals = projectContextReviewSignals(project.context, config)
  const readiness = configReadiness(config)
  const typeMatches = appTypeMatches(config)
  const alternateTypeMatches = typeMatches.filter((match) => match.appType !== config.appType && match.score >= 88)
  const suggestions = domainSuggestions(config)
  const quickFixes = configQuickFixes(config)
  const hiddenOverrideCount = config.overrides.filter((id) => {
    const setting = configSettings.find((item) => item.id === id)
    return setting ? !settingIsActive(setting, config) : false
  }).length
  const normalizedQuery = search.trim().toLowerCase()
  const setConfig = (next: ProjectConfig) => updateProject({ config: next })
  const applyAction = (action: ConfigAction) => {
    let next = config
    for (const change of action.changes) {
      const setting = configSettings.find((item) => item.id === change.id)
      if (setting?.kind === 'boolean' && isScopeSetting(change.id)) next = setScopeChoice(next, change.id, change.value === true ? 'On' : 'Off')
      else next = setConfigValue(next, change.id, change.value)
    }
    setConfig(next)
    notify(action.title)
  }

  const changeAppType = (appType: AppType) => {
    setConfig(changeConfigContext(config, appType, config.profile))
    notify(`Recommended setup updated for ${appType}`)
  }

  const changeProfile = (profile: ConfigProfile) => {
    setConfig(changeConfigContext(config, config.appType, profile))
    notify(`${profile} setup applied; custom choices preserved`)
  }

  const changeOperationalScale = (operationalScale: OperationalScale) => {
    setConfig(changeConfigContext(config, config.appType, config.profile, operationalScale))
    const resolved = operationalScale === 'Auto' ? resolvedOperationalScale({ ...config, operationalScale }) : operationalScale
    notify(`${resolved} operational scale applied; custom choices preserved`)
  }

  const changeValue = (id: string, value: ConfigValue) => setConfig(setConfigValue(config, id, value))
  const resetValue = (id: string) => setConfig(resetConfigValue(config, id))
  const toggleSection = (id: string) => setOpenSections((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const jumpToSection = (id: string) => {
    setOpenSections((current) => current.includes(id) ? current : [...current, id])
    window.requestAnimationFrame(() => document.getElementById(`setup-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const matchingSettings = (sectionId: string) => configSettings.filter((setting) => {
    if (setting.section !== sectionId || !settingIsActive(setting, config)) return false
    const scope = isScopeSetting(setting.id) ? resolveScope(config, setting.id) : null
    const dormantAutoScope = scope && scope.choice === 'Auto' && !scope.active && !setting.dependsOn
    if (dormantAutoScope && !showAvailableScope && !normalizedQuery && !customOnly) return false
    if (customOnly && !config.overrides.includes(setting.id) && scopeChoice(config, setting.id) === 'Auto') return false
    if (!normalizedQuery && !customOnly && !settingVisibleAtDepth(setting, configDepth)) return false
    if (!normalizedQuery) return true
    const section = configSections.find((item) => item.id === setting.section)
    const haystack = [section?.label, setting.group, setting.label, setting.description, setting.caution, ...(setting.keywords ?? []), ...(setting.options ?? []).map((option) => `${option.label || option.value} ${option.note || ''}`)].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(normalizedQuery)
  })

  const relevantSections = configSections.filter((section) => matchingSettings(section.id).length > 0)
  const visibleDecisionCount = relevantSections.reduce((sum, section) => sum + matchingSettings(section.id).length, 0)
  const activeContractSettings = configSettings.filter((setting) => settingIncludedInContract(setting, config))
  const activeDecisionCount = activeContractSettings.length
  const hiddenByDepthCount = activeContractSettings.filter((setting) => !settingVisibleAtDepth(setting, configDepth)).length
  const customizedHiddenByDepthCount = activeContractSettings.filter((setting) => !settingVisibleAtDepth(setting, configDepth) && (config.overrides.includes(setting.id) || scopeChoice(config, setting.id) !== 'Auto')).length
  const activeBusinessPacks = configSettings.filter((setting) => setting.section === 'business' && resolveScope(config, setting.id).active).map((setting) => setting.label)
  const activeIntegrationFamilies = configSettings.filter((setting) => setting.section === 'integrations' && setting.kind === 'boolean' && isScopeSetting(setting.id) && resolveScope(config, setting.id).active).map((setting) => setting.label)

  return <>
    <PageHeader eyebrow="App setup" title="Start recommended. Change only what matters." copy="Blueprint already fills sensible defaults for the app type. You do not need to answer every setting—use this screen mainly to describe exceptions and important behavior." action={<button className="secondary-button" onClick={() => { if (window.confirm('Reset every app-setup choice to the current recommended defaults?')) { setConfig(resetAllConfig(config)); notify('App setup reset to recommended') } }}><RefreshCw size={15}/> Reset recommended</button>}/>

    <section className="setup-context">
      <div className="setup-context-main">
        <label><span>App type</span><select value={config.appType} onChange={(event) => changeAppType(event.target.value as AppType)}>{appTypes.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}</select><small>{appTypes.find((item) => item.value === config.appType)?.description}</small></label>
        <div className="setup-baseline">
          <div><span>Smart baseline</span><strong>{config.profile} · {config.operationalScale === 'Auto' ? `Auto → ${resolvedOperationalScale(config)}` : resolvedOperationalScale(config)}</strong><small>Blueprint uses this only to size recommendations. Your explicit scope and custom choices still win.</small></div>
          <button className="text-button" onClick={() => setShowRecommendationTuning((value) => !value)}>{showRecommendationTuning ? 'Hide tuning' : 'Tune recommendations'} <ChevronDown size={13} className={showRecommendationTuning ? 'rotate-180' : ''}/></button>
        </div>
        {showRecommendationTuning && <div className="setup-tuning">
          <div className="setup-profile"><span>Recommendation posture</span><small>Usually leave this on Recommended. It changes default strictness, not feature scope.</small><div>{configProfiles.map((profile) => <button key={profile.value} className={config.profile === profile.value ? 'active' : ''} onClick={() => changeProfile(profile.value)}><strong>{profile.value}</strong><small>{profile.value === 'Recommended' ? 'Best default' : profile.description}</small></button>)}</div></div>
          <div className="setup-scale"><div className="setup-depth-heading"><span>Operational scale</span><small>Use Auto unless traffic, recovery, or operational criticality clearly justifies another level.</small></div><div>{operationalScales.map((scale) => <button key={scale.value} className={config.operationalScale === scale.value ? 'active' : ''} onClick={() => changeOperationalScale(scale.value)}><strong>{scale.label}</strong><small>{scale.value === 'Auto' ? `Recommended · resolves to ${resolvedOperationalScale(config)}` : scale.description}</small></button>)}</div></div>
        </div>}
        <div className="setup-depth"><div className="setup-depth-heading"><span>How much detail do you want to review?</span><small>This changes presentation only. Search can still reach every setting.</small></div><div>{configDepths.map((depth) => <button key={depth.value} className={configDepth === depth.value ? 'active' : ''} onClick={() => setConfigDepth(depth.value)}><strong>{depth.label}</strong><small>{depth.description}</small></button>)}</div></div>
      </div>
      <aside className="setup-status"><div className="setup-ready"><Gauge size={17}/><div><span>Blueprint readiness</span><strong>{readiness.score}% · {readiness.label}</strong><p>{readiness.coverage}% active-contract coverage. Auto-inactive features do not count as missing decisions.</p></div></div><div className="setup-stat-row"><div><strong>{visibleDecisionCount}</strong><span>available in {configDepth.toLowerCase()}</span></div><div><strong>{config.overrides.length + Object.keys(config.scopeChoices).length}</strong><span>deliberate choices</span></div><div><strong>{warnings.length + contextSignals.length}</strong><span>review signals</span></div></div></aside>
    </section>

    <ProjectContextPanel project={project} updateProject={updateProject}/>

    {contextSignals.length > 0 && <section className="context-review-signals"><Lightbulb size={18}/><div><strong>Project Context review · suggestion only</strong><p>These signals do not change App Setup. They only flag possible mismatches between your human description and deterministic structured scope.</p>{contextSignals.map((signal) => <div className="context-review-row" key={signal.id}><div><strong>{signal.title}</strong><span>{signal.detail}</span></div><button className="text-button" onClick={() => jumpToSection(signal.targetSection)}>Review scope <ArrowRight size={13}/></button></div>)}</div></section>}

    <section className="setup-intelligence" aria-label="Blueprint intelligence review">
      <div className="intelligence-card readiness-card">
        <div className="intelligence-head"><div><Gauge size={15}/><span>Readiness</span></div><strong>{readiness.score}%</strong></div>
        <div className="readiness-dimensions">{readiness.dimensions.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.score}%` }}/></i><small>{item.note}</small></div>)}</div>
        <p>This is a coherence signal, not a checklist score. Recommended defaults are treated as complete decisions.</p>
      </div>
      {(config.appType === 'Custom / General' || alternateTypeMatches.length > 0) ? <div className="intelligence-card fit-card">
        <div className="intelligence-head"><div><Compass size={15}/><span>App-type fit</span></div><small>Only shown when useful</small></div>
        <div className="fit-list">{typeMatches.map((match) => <div key={match.appType}><div><strong>{match.appType}</strong><span>{match.reason}</span></div><b>{match.score}%</b>{config.appType !== match.appType && (config.appType === 'Custom / General' || match.score >= 88) && <button onClick={() => changeAppType(match.appType)}>Use base</button>}</div>)}{!typeMatches.length && <p className="intelligence-empty">Neutral by design. Customize a product-shape or business-pack decision and Blueprint can suggest a closer starting type.</p>}</div>
      </div> : <div className="intelligence-card baseline-card">
        <div className="intelligence-head"><div><Sparkles size={15}/><span>Resolved baseline</span></div><small>No competing app type detected</small></div>
        <div className="baseline-facts">
          <div><span>Access</span><strong>{formatConfigValue(effectiveConfigValue(config, 'app.accessShape'))}</strong></div>
          <div><span>Primary surface</span><strong>{formatConfigValue(effectiveConfigValue(config, 'app.primarySurface'))}</strong></div>
          <div><span>Scale</span><strong>{resolvedOperationalScale(config)}{config.operationalScale === 'Auto' ? ' · Auto' : ''}</strong></div>
          <div><span>Business packs</span><strong>{activeBusinessPacks.length ? activeBusinessPacks.join(', ') : 'None required'}</strong></div>
        </div>
        <p>Blueprint is intentionally keeping deeper implementation choices behind these resolved product decisions.</p>
      </div>}
      <div className="intelligence-card suggestion-card">
        <div className="intelligence-head"><div><Lightbulb size={15}/><span>Worth considering</span></div><small>{quickFixes.length ? `${quickFixes.length} quick fix${quickFixes.length > 1 ? 'es' : ''}` : `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''}`}</small></div>
        <div className="suggestion-list">{(quickFixes.length ? quickFixes : suggestions).slice(0, 3).map((item) => <div key={item.id}><div><strong>{item.title}</strong><span>{item.detail}</span></div><button onClick={() => applyAction(item)}>Apply</button></div>)}{!quickFixes.length && !suggestions.length && <p className="intelligence-empty">Nothing obvious to add or fix. The current setup is intentionally sufficient as-is.</p>}</div>
      </div>
    </section>

    <section className="setup-presets">
      <div><span>Reusable setup presets</span><p>Save only your deliberate exceptions so you can reuse a proven setup without copying every recommended default.</p></div>
      <div className="preset-controls">
        <label><select defaultValue="" onChange={(event) => { const preset = presets.find((item) => item.id === event.target.value); if (preset) applyPreset(preset); event.currentTarget.value = '' }}><option value="">Apply saved preset…</option>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name} · {preset.appType}</option>)}</select><ChevronDown size={14}/></label>
        <button className="secondary-button" onClick={() => { setSavingPreset(true); setPresetName(`${config.appType} setup`) }}><Save size={14}/> Save current</button>
      </div>
      {savingPreset && <div className="preset-save-row"><input autoFocus value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Preset name" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (presetName.trim()) { savePreset(presetName, config); setSavingPreset(false) } } }}/><button onClick={() => { if (presetName.trim()) { savePreset(presetName, config); setSavingPreset(false) } }}>Save</button><button onClick={() => setSavingPreset(false)}>Cancel</button></div>}
      {presets.length > 0 && <div className="preset-library">{presets.slice(0, 6).map((preset) => <span key={preset.id}><button onClick={() => applyPreset(preset)}>{preset.name}</button><button aria-label={`Delete ${preset.name}`} onClick={() => deletePreset(preset.id)}><X size={11}/></button></span>)}</div>}
    </section>

    {warnings.length > 0 && <section className="setup-warnings"><CircleHelp size={18}/><div><strong>{warnings.length === 1 ? 'One review signal' : `${warnings.length} review signals`}</strong>{warnings.map((warning) => <p key={warning}>{warning}</p>)}</div></section>}

    <div className="setup-toolbar">
      <label className="search-box"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find CSP, WCAG, backups, CI/CD, booking, webhook, AI, passkey, mobile…"/></label>
      <div className="setup-filter-actions">
        <button className={showAvailableScope ? 'learning-toggle active' : 'learning-toggle'} onClick={() => setShowAvailableScope((value) => !value)}><Plus size={14}/>{showAvailableScope ? 'All features shown' : 'Explore features'}</button>
        <button className={customOnly ? 'learning-toggle active' : 'learning-toggle'} onClick={() => setCustomOnly((value) => !value)}><Check size={14}/>{customOnly ? 'Customized only' : 'Show customized'}</button>
        <button className="learning-toggle depth-indicator" onClick={() => setConfigDepth(configDepth === 'Advanced' ? 'Quick' : 'Advanced')} title="Jump between Quick and Advanced depth"><Settings2 size={14}/>{configDepth} view</button>
      </div>
    </div>

    <div className="setup-note"><Sparkles size={16}/><p><strong>{configDepth} configuration depth.</strong> Operational scale is <strong>{resolvedOperationalScale(config)}{config.operationalScale === 'Auto' ? ' (Auto)' : ''}</strong>; it tunes engineering/operations proportionality without creating product features. Blueprint resolves <strong>{activeDecisionCount}</strong> active contract decisions from the 918-setting knowledge base, but this view only asks you to review the level of detail you chose. <strong>{hiddenByDepthCount}</strong> deeper active decision{hiddenByDepthCount === 1 ? ' is' : 's are'} currently handled by contextual defaults. Search ignores the depth filter, so an advanced setting is always one search away. Explicit On/Off still wins; required dependencies and valid child choices are inferred automatically. {activeBusinessPacks.length ? <> Active business packs: <strong>{activeBusinessPacks.join(', ')}</strong>.</> : <> No business pack is forced for this project.</>} {activeIntegrationFamilies.length ? <> Connected-service families currently enabled: <strong>{activeIntegrationFamilies.join(', ')}</strong>.</> : <> External channels and AI remain opt-in until the project actually needs them.</>}</p></div>

    {hiddenOverrideCount > 0 && <div className="setup-note setup-inactive-note"><History size={16}/><p><strong>{hiddenOverrideCount} customized choice{hiddenOverrideCount > 1 ? 's are' : ' is'} currently inactive.</strong> Blueprint is preserving {hiddenOverrideCount > 1 ? 'them' : 'it'} because a parent feature is off or no longer relevant. Re-enable the parent and your choice returns automatically.</p></div>}
    {customizedHiddenByDepthCount > 0 && !normalizedQuery && !customOnly && <div className="setup-note setup-depth-note"><Settings2 size={16}/><p><strong>{customizedHiddenByDepthCount} customized active choice{customizedHiddenByDepthCount > 1 ? 's are' : ' is'} hidden by {configDepth} view.</strong> Nothing was reset. Switch to a deeper level, use <strong>Show customized</strong>, or search for the setting to edit it directly.</p></div>}

    {relevantSections.length > 0 && <nav className="setup-jump" aria-label="App setup sections">
      <span>{configDepth} · {visibleDecisionCount} available</span>
      <div>{relevantSections.map((section) => <button key={section.id} className={openSections.includes(section.id) || normalizedQuery ? 'active' : ''} onClick={() => jumpToSection(section.id)}>{section.label}<small>{matchingSettings(section.id).length}</small></button>)}</div>
    </nav>}

    <div className="setup-sections">
      {relevantSections.map((section, index) => {
        const settings = matchingSettings(section.id)
        const sectionOverrideCount = configSettings.filter((setting) => setting.section === section.id && (config.overrides.includes(setting.id) || scopeChoice(config, setting.id) !== 'Auto')).length
        const isOpen = normalizedQuery || customOnly ? true : openSections.includes(section.id)
        const groups = settings.reduce<{ name: string; settings: typeof settings }[]>((result, setting) => {
          const name = setting.group || 'General'
          const existing = result.find((group) => group.name === name)
          if (existing) existing.settings.push(setting)
          else result.push({ name, settings: [setting] })
          return result
        }, [])
        return <section id={`setup-section-${section.id}`} className={`setup-section ${isOpen ? 'open' : ''}`} key={section.id}>
          <button className="setup-section-head" onClick={() => toggleSection(section.id)} aria-expanded={isOpen}>
            <span className="setup-section-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="setup-section-copy"><strong>{section.label}</strong><small>{section.description}</small></span>
            <span className="setup-section-meta">{sectionOverrideCount ? `${sectionOverrideCount} customized` : 'Recommended'}</span>
            {isOpen ? <ChevronDown size={17}/> : <ChevronRight size={17}/>} 
          </button>
          {isOpen && <div className="setup-section-body">
            {groups.map((group) => <div className="setup-setting-group" key={group.name}>
              {(groups.length > 1 || group.name !== 'General') && <div className="setup-group-label"><span>{group.name}</span><small>{group.settings.length}</small></div>}
              {group.settings.map((setting) => {
                const value = config.values[setting.id]
                const effectiveValue = effectiveConfigValue(config, setting.id)
                const expected = recommendedValue(setting, config.appType, config.profile, config.operationalScale)
                const overridden = config.overrides.includes(setting.id)
                const scope = isScopeSetting(setting.id) ? resolveScope(config, setting.id) : null
                const deliberateScope = scope ? scope.choice !== 'Auto' : false
                const customized = overridden || deliberateScope
                const booleanValue = typeof value === 'boolean'
                const options = setting.options ?? []
                const onOptions = options.filter((option) => !/^(off|none|disabled|no$|no\s|off\s\/|none\s\/)/i.test(option.value))
                const selectedNote = options.find((option) => option.value === effectiveValue)?.note
                const guidance = settingGuidance(setting, config)
                return <div className={`setup-setting ${customized ? 'customized' : ''} ${scope ? 'scope-setting' : ''}`} key={setting.id}>
                  <div className="setup-setting-copy"><div><strong>{setting.label}</strong><span className={`guidance-badge guidance-${guidance.toLowerCase().replace(/\s+/g, '-')}`}>{guidance}</span>{normalizedQuery && <span className={`depth-badge depth-${settingDepth(setting).toLowerCase()}`}>{settingDepth(setting)}</span>}{customized && <span className="custom-badge">{deliberateScope ? 'Explicit scope' : 'Customized'}</span>}</div><p>{setting.description}</p>{scope ? <small className="scope-explanation"><b>{scope.choice === 'Auto' ? `Auto → ${scope.active ? 'On' : 'Off'}` : scope.choice}</b> · {scope.reason}</small> : <small>Recommended: {formatConfigValue(expected)}</small>}{setting.caution && customized && <em>{setting.caution}</em>}</div>
                  <div className="setup-setting-control">
                    {scope ? <>
                      <div className="scope-control" aria-label={`${setting.label} scope`}>
                        {(['Auto', 'On', 'Off'] as const).map((choice) => <button key={choice} className={scope.choice === choice ? 'active' : ''} onClick={() => setConfig(setScopeChoice(config, setting.id, choice))}>{choice}</button>)}
                      </div>
                      {scope.active && !booleanValue && onOptions.length > 1 && <label className="setup-select scope-behavior"><span>Behavior</span><select value={String(effectiveValue)} onChange={(event) => changeValue(setting.id, event.target.value)}>{onOptions.map((option) => <option key={option.value} value={option.value}>{option.label || option.value}</option>)}</select><ChevronDown size={14}/></label>}
                    </> : booleanValue ? <div className="binary-control">{[true, false].map((option) => <button key={String(option)} className={value === option ? 'active' : ''} onClick={() => changeValue(setting.id, option)}>{option ? 'Yes' : 'No'}</button>)}</div> : options.length <= 4 ? <div className="choice-control">{options.map((option) => <button key={option.value} className={value === option.value ? 'active' : ''} onClick={() => changeValue(setting.id, option.value)}>{option.label || option.value}</button>)}</div> : <label className="setup-select"><select value={String(value)} onChange={(event) => changeValue(setting.id, event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label || option.value}</option>)}</select><ChevronDown size={14}/></label>}
                    {selectedNote && <small className="setup-option-note">{selectedNote}</small>}
                    {scope ? <div className="setting-reset-row">
                      {deliberateScope && <button className="setting-reset" onClick={() => setConfig(setScopeChoice(config, setting.id, 'Auto'))} title="Return scope to Auto without discarding a deliberate behavior choice"><RefreshCw size={13}/> Auto scope</button>}
                      {overridden && <button className="setting-reset" onClick={() => resetValue(setting.id)} title="Reset this feature's behavior to the contextual recommendation"><RefreshCw size={13}/> Reset behavior</button>}
                    </div> : customized && <button className="setting-reset" onClick={() => resetValue(setting.id)} title="Reset to recommended"><RefreshCw size={13}/> Reset</button>}
                  </div>
                </div>
              })}
            </div>)}
            {!normalizedQuery && !customOnly && <div className="setup-section-foot"><span>{settings.length} available in {configDepth.toLowerCase()} view</span>{sectionOverrideCount > 0 && <button onClick={() => { setConfig(resetConfigSection(config, section.id)); notify(`${section.label} reset to recommended`) }}><RefreshCw size={13}/> Reset section</button>}</div>}
          </div>}
        </section>
      })}
    </div>

    {relevantSections.length === 0 && <div className="empty-panel setup-empty"><Search size={20}/><div><strong>{customOnly ? 'No customized settings match.' : 'No matching settings.'}</strong><p>{customOnly ? 'Turn off “Customized only” or change a setting first.' : 'Try a broader word. Search automatically includes Standard and Advanced settings regardless of your current depth.'}</p></div></div>}

    <div className="flow-next"><div><span>Next</span><strong>Shape the visual direction</strong><small>Your product scope is preserved. Visual Studio changes presentation, not feature scope.</small></div><button className="primary-button" onClick={() => setView('dna')}>Continue to Visual Studio <ArrowRight size={15}/></button></div>
  </>
}

function ProjectContextPanel({ project, updateProject }: { project: Project; updateProject: (patch: Partial<Project> | ((project: Project) => Partial<Project>)) => void }) {
  const [expanded, setExpanded] = useState(() => projectContextQuestions.some((question) => !question.primary && Boolean(project.context?.[question.id]?.trim())))
  const context = normalizeProjectContext(project.context)
  const answered = projectContextEntries(context).length
  const visibleQuestions = projectContextQuestions.filter((question) => question.primary || expanded)
  const updateContext = (id: keyof ProjectContext, value: string) => updateProject({ context: { ...context, [id]: value } })

  return <section className="project-context-card">
    <div className="project-context-head"><div><div className="eyebrow"><ClipboardList size={13}/> Optional AI context</div><h2>Give the coding AI the human part.</h2><p>Short answers are enough. Skip anything you do not care about. Blueprint stores these words verbatim and never changes App Setup from them.</p></div><span>{answered ? `${answered}/8 answered` : 'Optional'}</span></div>
    <div className="project-context-grid">{visibleQuestions.map((question) => <label key={question.id}><span>{question.label}</span><textarea rows={2} value={context[question.id]} onChange={(event) => updateContext(question.id, event.target.value)} placeholder={question.placeholder}/></label>)}</div>
    <div className="project-context-foot"><button className="text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer questions' : 'Add more context'} <ChevronDown size={13} className={expanded ? 'rotate-180' : ''}/></button><small>Used only as interpretive context in AI/spec exports. Structured Blueprint scope always wins.</small></div>
  </section>
}

function snapshotComparison(project: Project, snapshot: Snapshot) {
  const snapshotConfig = snapshot.config ? normalizeProjectConfig(snapshot.config) : null
  const currentConfig = normalizeProjectConfig(project.config)
  const configChanges = snapshotConfig ? configSettings.filter((setting) => effectiveConfigValue(snapshotConfig, setting.id) !== effectiveConfigValue(currentConfig, setting.id)).length + (JSON.stringify(snapshotConfig.scopeChoices) === JSON.stringify(currentConfig.scopeChoices) ? 0 : 1) : 0
  const addedPatterns = project.selected.filter((id) => !snapshot.selected.includes(id)).length
  const removedPatterns = snapshot.selected.filter((id) => !project.selected.includes(id)).length
  const oldCapabilities = snapshot.capabilities ?? []
  const capabilityChanges = new Set([...oldCapabilities.filter((id) => !project.capabilities.includes(id)), ...project.capabilities.filter((id) => !oldCapabilities.includes(id))]).size
  const oldDocs = snapshot.docs ?? []
  const docChanges = new Set([...oldDocs.filter((id) => !project.docs.includes(id)), ...project.docs.filter((id) => !oldDocs.includes(id))]).size
  const snapshotDna = normalizeDna(snapshot.dna)
  const currentDna = normalizeDna(project.dna)
  const dnaKeys = (Object.keys(currentDna) as (keyof Dna)[]).filter((key) => key !== 'palette' && key !== 'darkPalette' && key !== 'visualAntiPatterns')
  const dnaChanges = dnaKeys.filter((key) => snapshotDna[key] !== currentDna[key]).length
    + (JSON.stringify(snapshotDna.palette) === JSON.stringify(currentDna.palette) ? 0 : 1)
    + (JSON.stringify(snapshotDna.darkPalette) === JSON.stringify(currentDna.darkPalette) ? 0 : 1)
    + (JSON.stringify(snapshotDna.visualAntiPatterns) === JSON.stringify(currentDna.visualAntiPatterns) ? 0 : 1)
  const contextChanges = JSON.stringify(normalizeProjectContext(snapshot.context)) === JSON.stringify(normalizeProjectContext(project.context)) ? 0 : 1
  const total = configChanges + addedPatterns + removedPatterns + capabilityChanges + docChanges + dnaChanges + contextChanges
  return { total, configChanges, addedPatterns, removedPatterns, capabilityChanges, docChanges, dnaChanges, contextChanges }
}

function HomeView({ project, projects, recommendations, similarity, setView, updateProject, create, duplicate, remove, addSnapshot, restoreSnapshot, exportBackup, importRef, importBackup }: {
  project: Project
  projects: Project[]
  patterns: Pattern[]
  recommendations: ReturnType<typeof recommendPatterns>
  similarity: ReturnType<typeof similarityReport>
  setView: (view: View) => void
  updateProject: (patch: Partial<Project> | ((project: Project) => Partial<Project>)) => void
  create: () => void
  duplicate: () => void
  remove: () => void
  addSnapshot: () => void
  restoreSnapshot: (snapshot: Snapshot) => void
  exportBackup: () => void
  importRef: React.RefObject<HTMLInputElement | null>
  importBackup: (file: File) => void
}) {
  const score = similarity.score
  const [compareCheckpointId, setCompareCheckpointId] = useState('')
  const compareCheckpoint = project.snapshots.find((snapshot) => snapshot.id === compareCheckpointId)
  const checkpointDiff = compareCheckpoint ? snapshotComparison(project, compareCheckpoint) : null
  const readiness = configReadiness(normalizeProjectConfig(project.config))
  const directionPalette = project.dna.themeMode === 'Dark only' || project.dna.defaultTheme === 'Dark' ? resolvedDarkPalette(project.dna) : project.dna.palette
  return <>
    <section className="workspace-head">
      <div><div className="eyebrow"><Sparkles size={13}/> Active blueprint workspace</div><input className="workspace-title" value={project.name} onChange={(event) => updateProject({ name: event.target.value })}/><p>Choose the product shape, change only meaningful exceptions, shape the visual direction, then export one implementation-ready brief.</p></div>
      <div className="workspace-actions"><button className="secondary-button" onClick={create}><Plus size={15}/> New</button><button className="secondary-button" onClick={duplicate}><Copy size={15}/> Alternate</button><button className="secondary-button" onClick={addSnapshot}><Save size={15}/> Checkpoint</button></div>
    </section>

    <section className="home-dashboard">
      <div className="direction-card" style={{ background: directionPalette.background, color: directionPalette.ink, borderColor: directionPalette.border }}>
        <div className="direction-top"><span>Current visual direction</span><i style={{ background: directionPalette.accent }}/></div>
        <h2 style={{ fontFamily: fontFamilyFor(project.dna.headingTypography), fontWeight: project.dna.headingWeight }}>{project.dna.personality}</h2>
        <p>{project.dna.typographyCharacter} · {project.dna.sectionStrategy}</p>
        <div className="direction-metrics"><div><span>Space</span><strong>{project.dna.whitespacePriority}</strong></div><div><span>Surface</span><strong>{project.dna.surfaceLanguage}</strong></div><div><span>Motion</span><strong>{project.dna.motionAmount}</strong></div></div>
        <button onClick={() => setView('dna')}>Open Visual Studio <ArrowRight size={15}/></button>
      </div>
      <div className="variety-card">
        <div className="variety-gauge"><div className="gauge-ring" style={{ '--score': score ?? 0 } as React.CSSProperties}><strong>{score === null ? '—' : `${score}%`}</strong><span>closest match</span></div></div>
        <div><div className="eyebrow"><RefreshCw size={12}/> Anti-sameness</div><h3>{similarity.label}</h3><p>{score === null ? 'Create another workspace and Blueprint can start comparing your visual habits.' : `Closest to “${similarity.project?.name}”. Similarity blends selected patterns and Visual Studio—not just colors.`}</p></div>
      </div>
    </section>

    <section className="workspace-stats workspace-stats-six">
      <button onClick={() => setView('setup')}><span>App setup</span><strong>{readiness.score}%</strong><small>{project.config.appType} · {project.config.overrides.length + Object.keys(project.config.scopeChoices ?? {}).length} deliberate choices</small></button>
      <button onClick={() => setView('patterns')}><span>Visual patterns</span><strong>{project.selected.length}</strong><small>How it looks and behaves</small></button>
      <button onClick={() => setView('capabilities')}><span>Capabilities</span><strong>{project.capabilities.length}</strong><small>Reusable engineering concepts</small></button>
      <button onClick={() => setView('docs')}><span>MVP docs</span><strong>{project.docs.length}</strong><small>Knowledge that ships with code</small></button>
      <button onClick={() => setView('references')}><span>References</span><strong>{project.references.length}</strong><small>Specific ideas, not clones</small></button>
      <button onClick={() => setView('spec')}><span>Generated spec</span><strong>{readiness.label === 'Ready' ? 'Ready' : 'Review'}</strong><small>Implementation brief + exports</small></button>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><div className="eyebrow"><WandSparkles size={13}/> Creative suggestions</div><h2>Try something that still makes sense.</h2></div><p>Recommendations react to your Visual Studio choices, creative-stretch setting, and patterns you already used in other workspaces.</p></div>
      <div className="recommend-grid">{recommendations.slice(0, 4).map(({ pattern, reason }) => <article key={pattern.id}><PatternPreview type={pattern.preview} compact/><div><span>{pattern.category} · {pattern.level}</span><h3>{pattern.name}</h3><p>{reason}</p><button onClick={() => setView('patterns')}>Explore pattern <ArrowUpRight size={14}/></button></div></article>)}</div>
    </section>

    <section className="section-block history-block">
      <div className="section-heading"><div><div className="eyebrow"><History size={13}/> Blueprint checkpoints</div><h2>Compare decisions before you restore them.</h2></div><button className="secondary-button" onClick={addSnapshot}><Save size={15}/> Save checkpoint</button></div>
      {project.snapshots.length ? <><div className="checkpoint-list checkpoint-list-rich">{project.snapshots.slice(0, 8).map((snapshot) => { const diff = snapshotComparison(project, snapshot); return <div key={snapshot.id}><div><strong>{snapshot.label}</strong><span>{new Date(snapshot.createdAt).toLocaleString()}</span></div><small>{snapshot.config ? `${snapshot.config.overrides.length + Object.keys(snapshot.config.scopeChoices ?? {}).length} setup decisions` : 'Legacy checkpoint'} · {snapshot.selected.length} patterns · {diff.total === 0 ? 'matches current' : `${diff.total} changes from current`}</small><div className="checkpoint-actions"><button onClick={() => setCompareCheckpointId((current) => current === snapshot.id ? '' : snapshot.id)}>{compareCheckpointId === snapshot.id ? 'Hide diff' : 'Compare'}</button><button onClick={() => restoreSnapshot(snapshot)}>Restore</button></div></div> })}</div>{compareCheckpoint && checkpointDiff && <div className="checkpoint-diff"><div><span>Comparing current with</span><strong>{compareCheckpoint.label}</strong></div><div><b>{checkpointDiff.configChanges}</b><span>setup decisions</span></div><div><b>{checkpointDiff.addedPatterns + checkpointDiff.removedPatterns}</b><span>pattern changes</span></div><div><b>{checkpointDiff.capabilityChanges}</b><span>capabilities</span></div><div><b>{checkpointDiff.docChanges}</b><span>docs</span></div><div><b>{checkpointDiff.dnaChanges}</b><span>Visual Studio</span></div><div><b>{checkpointDiff.contextChanges}</b><span>project context</span></div></div>}</> : <div className="empty-panel"><Save size={20}/><div><strong>No checkpoints yet.</strong><p>Save one before a meaningful product or visual change. New checkpoints capture setup, capabilities, docs, references, patterns, and Visual Studio together.</p></div></div>}
    </section>

    <section className="backup-strip"><div><div className="eyebrow"><FileJson size={13}/> Portability</div><strong>Your design knowledge should not be trapped in one browser.</strong><p>Export all projects, app setup, capabilities, references, checkpoints, docs selections, and custom discoveries as a portable backup.</p></div><div><button className="secondary-button" onClick={exportBackup}><Download size={15}/> Export backup</button><button className="secondary-button" onClick={() => importRef.current?.click()}><Upload size={15}/> Import</button><input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file) }}/><button className="danger-link" onClick={remove}><Trash2 size={14}/> Remove workspace</button></div></section>
  </>
}

function PatternsView({ patterns: allPatterns, selected, config, compareIds, search, setSearch, category, setCategory, level, setLevel, setDetail, toggle, toggleCompare, compare, addCustom, learningMode, setLearningMode }: {
  patterns: Pattern[]
  selected: string[]
  config: ProjectConfig
  compareIds: string[]
  search: string
  setSearch: (value: string) => void
  category: 'All' | PatternCategory
  setCategory: (value: 'All' | PatternCategory) => void
  level: 'All' | PatternLevel
  setLevel: (value: 'All' | PatternLevel) => void
  setDetail: (pattern: Pattern) => void
  toggle: (id: string) => void
  toggleCompare: (id: string) => void
  compare: () => void
  addCustom: () => void
  learningMode: boolean
  setLearningMode: (value: boolean) => void
}) {
  const filtered = allPatterns.filter((pattern) => {
    const haystack = `${pattern.name} ${pattern.summary} ${pattern.tags.join(' ')} ${pattern.category}`.toLowerCase()
    return (!search || haystack.includes(search.toLowerCase())) && (category === 'All' || pattern.category === category) && (level === 'All' || pattern.level === level)
  })

  return <>
    <PageHeader eyebrow="Pattern explorer" title="See the pattern before you try to remember its name." copy="Browse familiar, less-common, and experimental UI patterns. Visual guides are intentionally schematic so you learn the structure instead of copying one finished design." action={<div className="header-actions"><button className="secondary-button" onClick={() => { const candidates = filtered.filter((item) => !selected.includes(item.id) && item.level !== 'Familiar'); setDetail(candidates[Math.floor(Math.random() * candidates.length)] || filtered[Math.floor(Math.random() * filtered.length)] || null) }}><WandSparkles size={15}/> Surprise me</button><button className="primary-button" onClick={addCustom}><Plus size={16}/> Add discovery</button></div>}/>
    <div className="explorer-tools">
      <label className="search-box"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search navigation, motion, forms, FLIP…"/></label>
      <label className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value as 'All' | PatternCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="select-wrap"><select value={level} onChange={(event) => setLevel(event.target.value as 'All' | PatternLevel)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
      <button className={`learning-toggle ${learningMode ? 'active' : ''}`} onClick={() => setLearningMode(!learningMode)}><CircleHelp size={16}/>{learningMode ? 'Learning on' : 'Learning off'}</button>
    </div>
    <div className="pattern-count"><span>{filtered.length} patterns</span><span>{selected.length} selected · {compareIds.length}/3 comparing</span></div>
    {compareIds.length > 0 && <div className="compare-banner"><Layers3 size={17}/><div><strong>{compareIds.length} pattern{compareIds.length > 1 ? 's' : ''} staged for comparison</strong><span>Add up to three, then inspect their anatomy and tradeoffs side by side.</span></div><button className="secondary-button" onClick={compare}>Compare now <ArrowRight size={14}/></button></div>}
    <div className="pattern-grid">{filtered.map((pattern) => {
      const isSelected = selected.includes(pattern.id)
      const applicability = patternApplicability(pattern, config)
      const isCompare = compareIds.includes(pattern.id)
      return <article className={`pattern-card ${isSelected ? 'selected' : ''} ${isSelected && !applicability.compatible ? 'layer-conflict' : ''}`} key={pattern.id}>
        <button className="preview-button" onClick={() => setDetail(pattern)} aria-label={`Open ${pattern.name}`}><PatternPreview type={pattern.preview} compact annotated={learningMode}/></button>
        <div className="pattern-copy"><div className="pattern-meta"><span>{pattern.category}</span><b>{pattern.level}</b></div><h3>{pattern.name}</h3><p>{pattern.summary}</p>{isSelected && !applicability.compatible && <div className="layer-note"><CircleHelp size={13}/><span>Excluded from generated direction · {applicability.reason}</span></div>}<div className="pattern-card-actions"><button className={isSelected ? 'mini-action selected' : 'mini-action'} onClick={() => toggle(pattern.id)}>{isSelected ? <Check size={14}/> : <BookmarkPlus size={14}/>} {isSelected ? 'Selected' : 'Select'}</button><button className={isCompare ? 'mini-action compare-active' : 'mini-action'} onClick={() => toggleCompare(pattern.id)}><Layers3 size={14}/> {isCompare ? 'Comparing' : 'Compare'}</button></div></div>
      </article>
    })}</div>
  </>
}

function CapabilitiesView({ capabilities: allCapabilities, selected, config, search, setSearch, category, setCategory, level, setLevel, toggle, addCustom, removeCustom }: { capabilities: (Capability | CustomCapability)[]; selected: string[]; config: ProjectConfig; search: string; setSearch: (value: string) => void; category: 'All' | CapabilityCategory; setCategory: (value: 'All' | CapabilityCategory) => void; level: 'All' | CapabilityLevel; setLevel: (value: 'All' | CapabilityLevel) => void; toggle: (id: string) => void; addCustom: () => void; removeCustom: (id: string) => void }) {
  const filtered = allCapabilities.filter((capability) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [capability.name, capability.summary, capability.bestFor, capability.watchout, ...capability.tags].join(' ').toLowerCase().includes(q)
    return matchesSearch && (category === 'All' || capability.category === category) && (level === 'All' || capability.level === level)
  })
  const selectedSet = new Set(selected)
  const missingDependencies = Array.from(new Set(allCapabilities.filter((item) => selectedSet.has(item.id)).flatMap((item) => item.dependencies ?? []).filter((id) => !selectedSet.has(id))))
  return <>
    <PageHeader eyebrow="Product capability library" title="Specify what the app can do without hard-coding one type of product." copy="Keep this separate from visual design. Select generic capabilities, discover advanced engineering patterns, and add your own reusable concepts as your software vocabulary grows." action={<button className="primary-button" onClick={addCustom}><Plus size={16}/> Add capability</button>}/>
    <div className="capability-principle"><Settings2 size={18}/><div><strong>Capability ≠ screen.</strong><p>Choose a capability because the product needs the behavior. Blueprint will carry the engineering intent into the generated implementation prompt.</p></div></div>
    <div className="explorer-tools capability-tools"><label className="search-box"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search auth, webhooks, offline, audit…"/></label><label className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value as 'All' | CapabilityCategory)}>{capabilityCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="select-wrap"><select value={level} onChange={(event) => setLevel(event.target.value as 'All' | CapabilityLevel)}><option>All</option><option>Core</option><option>Advanced</option><option>Specialized</option></select></label></div>
    <div className="pattern-count"><span>{filtered.length} capabilities shown</span><span>{selected.length} selected</span></div>
    {missingDependencies.length > 0 && <div className="dependency-warning"><CircleHelp size={17}/><div><strong>Foundation check</strong><p>Some selected capabilities reference foundations that are not selected: {missingDependencies.map((id) => allCapabilities.find((item) => item.id === id)?.name || id).join(', ')}.</p></div></div>}
    <div className="capability-grid">{filtered.map((capability) => {
      const active = selected.includes(capability.id)
      const applicability = capabilityApplicability(capability, config)
      const deps = (capability.dependencies ?? []).map((id) => allCapabilities.find((item) => item.id === id)?.name || id)
      const custom = 'custom' in capability && capability.custom
      return <article className={`capability-card ${active ? 'selected' : ''} ${active && !applicability.compatible ? 'layer-conflict' : ''}`} key={capability.id}>
        <div className="capability-card-head"><div><span>{capability.category}</span><b>{capability.level}</b></div>{custom && <button className="icon-button" onClick={() => removeCustom(capability.id)} aria-label="Remove custom capability"><Trash2 size={14}/></button>}</div>
        <h3>{capability.name}</h3><p>{capability.summary}</p>
        <div className="capability-facts"><div><span>Best for</span><p>{capability.bestFor}</p></div><div><span>Watchout</span><p>{capability.watchout}</p></div></div>
        {active && !applicability.compatible && <div className="layer-note"><CircleHelp size={13}/><span>Selected, but excluded from generated scope · {applicability.reason}</span></div>}{deps.length > 0 && <div className="dependency-row"><span>Requires</span>{deps.map((dep) => <i key={dep}>{dep}</i>)}</div>}
        <div className="capability-prompt"><span>Implementation intent</span><p>{capability.prompt}</p></div>
        <button className={active ? 'mini-action selected' : 'mini-action'} onClick={() => toggle(capability.id)}>{active ? <Check size={14}/> : <Plus size={14}/>} {active ? 'Selected' : 'Add to project'}</button>
      </article>
    })}</div>
  </>
}

function DocsView({ project, selectedCapabilities, toggle, updateProject, copy }: { project: Project; selectedCapabilities: Capability[]; toggle: (id: string) => void; updateProject: (patch: Partial<Project> | ((project: Project) => Partial<Project>)) => void; copy: (value: string, message?: string) => void }) {
  const capabilityIds = new Set(selectedCapabilities.map((item) => item.id))
  const recommended = projectDocs.filter((doc) => doc.defaultSelected || (doc.recommendedFor ?? []).some((id) => capabilityIds.has(id)))
  const recommendedIds = recommended.map((doc) => doc.id)
  const selectedDocs = projectDocs.filter((doc) => project.docs.includes(doc.id))
  const applyRecommended = () => updateProject({ docs: Array.from(new Set([...project.docs, ...recommendedIds])) })
  const manifest = buildDocsManifest(project, selectedCapabilities)
  return <>
    <PageHeader eyebrow="MVP project docs" title="Choose the Markdown memory that should ship beside the code." copy="Use documentation as durable project memory—not paperwork. Select only files that will help future-you, collaborators, and coding agents understand the current truth of the repository." action={<button className="primary-button" onClick={applyRecommended}><WandSparkles size={16}/> Add recommended</button>}/>
    <div className="docs-summary"><div><span>Selected</span><strong>{selectedDocs.length}</strong><small>Markdown files</small></div><div><span>Recommended now</span><strong>{recommended.length}</strong><small>Based on selected capabilities</small></div><div className="docs-summary-actions"><button className="secondary-button" onClick={() => copy(manifest, 'Docs manifest copied')}><Copy size={15}/> Copy manifest</button><button className="secondary-button" onClick={() => downloadText(`${slugify(project.name)}-docs-manifest.md`, manifest, 'text/markdown')}><Download size={15}/> Download manifest</button></div></div>
    <div className="docs-rule"><FileText size={18}/><div><strong>No filler docs.</strong><p>A selected file is a contract to keep project-specific commands, constraints, decisions, and current status there. Cross-link rather than duplicating entire sections.</p></div></div>
    <div className="docs-grid">{projectDocs.map((doc) => {
      const active = project.docs.includes(doc.id)
      const isRecommended = recommendedIds.includes(doc.id)
      return <article className={`doc-card ${active ? 'selected' : ''}`} key={doc.id}>
        <button className="doc-check" onClick={() => toggle(doc.id)} aria-pressed={active}><span>{active ? <Check size={15}/> : null}</span><div><code>{doc.filename}</code><h3>{doc.title}</h3></div>{isRecommended && <b>Recommended</b>}</button>
        <p>{doc.summary}</p><div className="doc-why"><span>Why keep it</span><p>{doc.why}</p></div>
        <div className="doc-sections"><span>Suggested sections</span><div>{doc.sections.map((section) => <i key={section}>{section}</i>)}</div></div>
      </article>
    })}</div>
  </>
}

function CustomCapabilityModal({ close, add }: { close: () => void; add: (form: HTMLFormElement) => void }) {
  return <div className="modal-wrap" onMouseDown={close}><form className="custom-modal" onSubmit={(event) => { event.preventDefault(); add(event.currentTarget) }} onMouseDown={(event) => event.stopPropagation()}><div className="detail-head"><div><span>Grow your engineering vocabulary</span><h2>Add reusable capability</h2></div><button type="button" className="icon-button" onClick={close}><X size={19}/></button></div><p className="modal-intro">Capture a product or engineering capability Blueprint does not know yet. Keep it generic enough that you could reuse it across future apps.</p><label><span>Name *</span><input name="name" required placeholder="e.g. Conflict-aware offline sync"/></label><label><span>What does it enable? *</span><textarea name="summary" required placeholder="Describe the capability in plain language."/></label><div className="form-two"><label><span>Category</span><select name="category">{capabilityCategories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Level</span><select name="level"><option>Advanced</option><option>Core</option><option>Specialized</option></select></label></div><label><span>Best for</span><input name="bestFor" placeholder="Where does it create clear value?"/></label><label><span>Watchout</span><input name="watchout" placeholder="What tradeoff or failure mode matters?"/></label><label><span>Implementation intent</span><textarea name="prompt" placeholder="How should a coding agent interpret this capability?"/></label><label><span>Tags</span><input name="tags" placeholder="sync, reliability, mobile"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/> Add capability</button></div></form></div>
}


function CompareView({ ids, patterns: allPatterns, selected, toggle, removeCompare, browse, learningMode }: { ids: string[]; patterns: Pattern[]; selected: string[]; toggle: (id: string) => void; removeCompare: (id: string) => void; browse: () => void; learningMode: boolean }) {
  const compare = ids.map((id) => allPatterns.find((pattern) => pattern.id === id)).filter(Boolean) as Pattern[]
  return <>
    <PageHeader eyebrow="Compare variants" title="Different structure, different tradeoff." copy="Use this when two patterns sound similar in text but feel very different visually—like full-width bottom navigation versus a centered floating dock." action={<button className="secondary-button" onClick={browse}><Plus size={15}/> Add from library</button>}/>
    {compare.length < 2 ? <div className="compare-empty"><Layers3 size={30}/><h2>Stage at least two patterns.</h2><p>Open Pattern Explorer, tap Compare on two or three options, then return here.</p><button className="primary-button" onClick={browse}>Browse patterns</button></div> : <div className={`compare-grid compare-${compare.length}`}>{compare.map((pattern) => <article className="compare-column" key={pattern.id}><div className="compare-preview"><PatternPreview type={pattern.preview} annotated={learningMode}/><button className="icon-button compare-remove" onClick={() => removeCompare(pattern.id)} aria-label="Remove from comparison"><X size={16}/></button></div><div className="compare-head"><span>{pattern.category} · {pattern.level}</span><h2>{pattern.name}</h2><p>{pattern.summary}</p></div><CompareFact label="Design principle" value={pattern.principle || 'Use the pattern only when its structure supports the user task.'}/><CompareFact label="Best for" value={pattern.bestFor}/><CompareFact label="Watch out" value={pattern.watchout}/><CompareFact label="Prompt language" value={pattern.prompt}/><div className="compare-tags">{pattern.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className={selected.includes(pattern.id) ? 'secondary-button selected-action' : 'primary-button'} onClick={() => toggle(pattern.id)}>{selected.includes(pattern.id) ? <><Check size={15}/> Selected</> : <><BookmarkPlus size={15}/> Add to spec</>}</button></article>)}</div>}
  </>
}

function CompareFact({ label, value }: { label: string; value: string }) { return <div className="compare-fact"><span>{label}</span><p>{value}</p></div> }

function ReferencesView({ project, add, remove }: { project: Project; add: () => void; remove: (id: string) => void }) {
  return <>
    <PageHeader eyebrow="Reference board" title="Save the exact thing you like—not an entire design to imitate." copy="Add screenshots, links, and a note about what should influence the project. This keeps references directional: typography from one site, navigation from another, motion from somewhere else." action={<button className="primary-button" onClick={add}><Plus size={16}/> Add reference</button>}/>
    <div className="reference-rule"><Lightbulb size={18}/><div><strong>Good reference note</strong><p>“I like the centered dock and active-state treatment. Do not copy the color palette or page composition.”</p></div></div>
    {project.references.length ? <div className="reference-grid">{project.references.map((reference) => <article className="reference-card" key={reference.id}>{reference.imageData ? <div className="reference-image"><img src={reference.imageData} alt=""/></div> : <div className="reference-image placeholder"><ImageIcon size={26}/><span>Link / note reference</span></div>}<div className="reference-body"><div className="reference-head"><div><span>{reference.focus.join(' · ') || 'General direction'}</span><h3>{reference.title}</h3></div><button className="icon-button" onClick={() => remove(reference.id)} aria-label="Remove reference"><Trash2 size={15}/></button></div><p>{reference.note || 'No note yet. Add a precise note next time you refine this reference.'}</p><div className="reference-foot">{reference.url ? <a href={reference.url} target="_blank" rel="noreferrer"><LinkIcon size={13}/> Open source <ExternalLink size={12}/></a> : <span><ImageIcon size={13}/> Screenshot reference</span>}<small>{new Date(reference.createdAt).toLocaleDateString()}</small></div></div></article>)}</div> : <div className="reference-empty"><ImageIcon size={32}/><h2>Your board is intentionally empty.</h2><p>Start with one screenshot or URL and label exactly what you want to borrow as a principle.</p><button className="primary-button" onClick={add}>Add first reference</button></div>}
  </>
}

function InspirationView({ addReference }: { addReference: () => void }) {
  const [filter, setFilter] = useState('All')
  const groups = ['All', 'Product UI', 'Visual', 'Motion', 'Type', 'Color']
  const filtered = inspiration.filter((site) => filter === 'All' || site.group === filter)
  return <>
    <PageHeader eyebrow="Inspiration launchpad" title="Browse with a question, not with a blank mind." copy="Use curated sources to expand your visual vocabulary. When something works, capture the exact idea on the Reference Board or turn it into a custom pattern." action={<button className="secondary-button" onClick={addReference}><BookmarkPlus size={15}/> Capture reference</button>}/>
    <div className="chip-row">{groups.map((group) => <button className={filter === group ? 'active' : ''} onClick={() => setFilter(group)} key={group}>{group}</button>)}</div>
    <div className="link-grid">{filtered.map((site, index) => <a href={site.url} target="_blank" rel="noreferrer" className="link-card" key={site.name}><div className="link-index">{String(index + 1).padStart(2, '0')}</div><div><span>{site.group}</span><h3>{site.name}</h3><p>{site.use}</p><small>{site.searchHint}</small></div><ExternalLink size={17}/></a>)}</div>
    <section className="inspiration-workflow"><div><div className="eyebrow">A better browsing loop</div><h2>Turn inspiration into reusable knowledge.</h2></div><ol><li><span>01</span><div><strong>Browse with a design question</strong><p>“What are alternatives to my usual sidebar?” beats “show me nice websites.”</p></div></li><li><span>02</span><div><strong>Isolate the useful idea</strong><p>Navigation, hierarchy, typography, motion, spacing, color, or composition.</p></div></li><li><span>03</span><div><strong>Capture it</strong><p>Save a reference or add a custom discovery so the idea remains available months later.</p></div></li></ol></section>
  </>
}

function SpecView({ project, selectedPatterns, selectedCapabilities, similarity, markdown, agentPrompt, docsManifest, copy, updateProject, addSnapshot, setView }: { project: Project; selectedPatterns: Pattern[]; selectedCapabilities: Capability[]; similarity: ReturnType<typeof similarityReport>; markdown: string; agentPrompt: string; docsManifest: string; copy: (value: string, message?: string) => void; updateProject: (patch: Partial<Project>) => void; addSnapshot: () => void; setView: (view: View) => void }) {
  const selectedDocs = projectDocs.filter((doc) => project.docs.includes(doc.id))
  const config = normalizeProjectConfig(project.config)
  const readiness = configReadiness(config)
  const criteria = acceptanceCriteria(config)
  const cases = edgeCases(config)
  const warnings = configWarnings(config)
  const contextSignals = projectContextReviewSignals(project.context, config)
  const visualSignals = visualReviewSignals(project.dna)
  const resolvedCapabilities = activeCapabilities(selectedCapabilities, config)
  const resolvedPatterns = activePatterns(selectedPatterns, config)
  const layerSignals = crossLayerSignals(selectedCapabilities, selectedPatterns, config)
  const contextEntries = projectContextEntries(project.context)
  const reviewCount = warnings.length + contextSignals.length + visualSignals.length + layerSignals.length
  const jsonSpec = JSON.stringify({
    version: 10,
    blueprintVersion: '0.18.0',
    intelligence: { readiness, reviewSignals: warnings, projectContextReviewSignals: contextSignals, visualReviewSignals: visualSignals, crossLayerSignals: layerSignals, acceptanceCriteria: criteria, edgeCases: cases, appTypeMatches: appTypeMatches(config) },
    project: { ...project, config, selected: resolvedPatterns.map((pattern) => pattern.id), capabilities: resolvedCapabilities.map((capability) => capability.id), references: project.references.map(({ imageData: _imageData, ...reference }) => reference) },
    selectedPatterns: resolvedPatterns,
    selectedCapabilities: resolvedCapabilities,
    excludedSelections: { patterns: selectedPatterns.filter((pattern) => !patternApplicability(pattern, config).compatible).map((pattern) => ({ id: pattern.id, name: pattern.name, reason: patternApplicability(pattern, config).reason })), capabilities: selectedCapabilities.filter((capability) => !capabilityApplicability(capability, config).compatible).map((capability) => ({ id: capability.id, name: capability.name, reason: capabilityApplicability(capability, config).reason })) },
    selectedDocs: selectedDocs.map((doc) => ({ id: doc.id, filename: doc.filename, title: doc.title })),
  }, null, 2)
  return <>
    <PageHeader eyebrow="Generated blueprint" title="One implementation brief, with proof of what ‘done’ means." copy="The human-facing summary stays compact. Exports still carry the full active setup contract, plus readiness signals, acceptance criteria, edge cases, visual direction, capabilities, docs, and references." action={<button className="primary-button" onClick={() => copy(agentPrompt, 'Agent prompt copied')}><Copy size={16}/> Copy AI prompt</button>}/>
    <div className="spec-toolbar"><button onClick={() => downloadText(`${slugify(project.name)}-project-spec.md`, markdown, 'text/markdown')}><FileText size={15}/> Project spec</button><button onClick={() => downloadText(`${slugify(project.name)}-docs-manifest.md`, docsManifest, 'text/markdown')}><FileText size={15}/> Docs manifest</button><button onClick={() => downloadText(`${slugify(project.name)}-blueprint.json`, jsonSpec, 'application/json')}><FileJson size={15}/> JSON</button><button onClick={addSnapshot}><Save size={15}/> Save checkpoint</button></div>
    <div className="spec-layout"><section className="spec-sheet"><label className="spec-project"><span>Project name</span><input value={project.name} onChange={(event) => updateProject({ name: event.target.value })}/></label>
      <div className="spec-section"><span className="spec-number">01</span><div><div className="eyebrow">App setup</div><h2>{config.appType}</h2><div className="spec-facts"><span>{config.profile} profile</span><span>{resolvedOperationalScale(config)} scale</span><span>{config.overrides.length + Object.keys(config.scopeChoices).length} deliberate choices</span><span>{configSettings.filter((setting) => settingIncludedInContract(setting, config)).length} active decisions</span></div>{(config.overrides.length || Object.keys(config.scopeChoices).length) ? <div className="spec-config-overrides">{Object.entries(config.scopeChoices).slice(0, 6).map(([id, choice]) => { const setting = configSettings.find((item) => item.id === id); return setting ? <div key={`scope-${id}`}><span>{setting.label}</span><strong>{choice}</strong></div> : null })}{config.overrides.slice(0, 12).map((id) => { const setting = configSettings.find((item) => item.id === id); return setting && settingIncludedInContract(setting, config) ? <div key={id}><span>{setting.label}</span><strong>{formatConfigValue(effectiveConfigValue(config, id))}</strong></div> : null })}</div> : <p className="spec-muted">Using Auto scope resolution with contextual behavioral and quality defaults.</p>}<button className="text-button" onClick={() => setView('setup')}>Review app setup <ArrowUpRight size={14}/></button></div></div>
      <div className="spec-section"><span className="spec-number">02</span><div><div className="eyebrow">Readiness & proof</div><div className="spec-readiness"><div><strong>{readiness.score}%</strong><span>{readiness.label}</span><small>{reviewCount ? `${reviewCount} review signal${reviewCount > 1 ? 's' : ''}` : 'No review signals'}</small></div><div className="spec-proof-list"><strong>Acceptance criteria</strong>{criteria.slice(0, 5).map((item) => <p key={item}>{item}</p>)}</div><div className="spec-proof-list"><strong>Edge cases</strong>{cases.slice(0, 5).map((item) => <p key={item}>{item}</p>)}</div></div>{(warnings.length > 0 || contextSignals.length > 0 || visualSignals.length > 0) && <div className="spec-review-signals">{warnings.slice(0, 4).map((warning) => <p key={warning}>{warning}</p>)}{contextSignals.slice(0, 3).map((signal) => <p key={signal.id}><strong>Advisory:</strong> {signal.detail}</p>)}{visualSignals.slice(0, 4).map((signal) => <p key={signal}><strong>Visual:</strong> {signal}</p>)}</div>}</div></div>
      <div className="spec-section"><span className="spec-number">03</span><div><div className="eyebrow">Project context · optional</div>{contextEntries.length ? <div className="spec-context-list">{contextEntries.map((entry) => <div key={entry.id}><span>{entry.label}</span><p>{entry.value}</p></div>)}</div> : <p className="spec-muted">No optional human briefing supplied. Structured Blueprint scope remains sufficient.</p>}<small className="spec-muted">Verbatim guidance only — this never changes App Setup automatically.</small></div></div>
      <div className="spec-section"><span className="spec-number">04</span><div><div className="eyebrow">Product direction</div><h2>{project.dna.personality}</h2><div className="spec-facts"><span>{project.dna.mobileFirst ? 'Mobile-first' : 'Responsive'}</span><span>{project.dna.easePriority} usability</span><span>{project.dna.stretch} creative stretch</span><span>{project.dna.typography}</span></div></div></div>
      <div className="spec-section"><span className="spec-number">05</span><div><div className="eyebrow">Capabilities</div>{resolvedCapabilities.length ? <div className="spec-capability-list">{resolvedCapabilities.map((cap) => <span key={cap.id}>{cap.name}</span>)}</div> : <div className="spec-empty"><p>No compatible capabilities in resolved App Setup.</p><button className="text-button" onClick={() => setView('capabilities')}>Review product capabilities <ArrowUpRight size={14}/></button></div>}</div></div>
      <div className="spec-section"><span className="spec-number">06</span><div><div className="eyebrow">Visual Studio</div><div className="spec-facts"><span>{project.dna.themeMode}</span><span>{project.dna.typographyCharacter}</span><span>{project.dna.sectionStrategy}</span><span>{project.dna.surfaceLanguage}</span><span>{project.dna.motionAmount} · {project.dna.motionCharacter}</span></div><div className="visual-dna-summary"><Metric name="Density" value={project.dna.density}/><Metric name="Icons" value={project.dna.iconWeight}/><Metric name="Surfaces" value={project.dna.cardWeight}/><Metric name="Corners" value={project.dna.radius}/><Metric name="Motion" value={project.dna.motion}/></div><div className="spec-colors">{Object.entries(project.dna.palette).slice(0, 8).map(([role, color]) => <span key={role} style={{ background: color }} title={`${role}: ${color}`}/>)}</div>{project.dna.visualAntiPatterns.length > 0 && <p className="spec-muted">Avoid: {project.dna.visualAntiPatterns.join(', ')}</p>}</div></div>
      <div className="spec-section"><span className="spec-number">07</span><div className="spec-patterns"><div className="eyebrow">Selected visual patterns</div>{resolvedPatterns.length === 0 ? <div className="spec-empty"><p>No compatible visual patterns in resolved App Setup.</p><button className="text-button" onClick={() => setView('patterns')}>Review visual patterns <ArrowUpRight size={14}/></button></div> : resolvedPatterns.map((pattern) => <article key={pattern.id}><div><span>{pattern.category}</span><h3>{pattern.name}</h3></div><button onClick={() => copy(pattern.prompt, `${pattern.name} prompt copied`)}><Copy size={14}/></button><p>{pattern.prompt}</p></article>)}</div></div>
      {layerSignals.length > 0 && <div className="spec-section"><span className="spec-number">08</span><div><div className="eyebrow">Cross-layer review</div><p className="spec-muted">Saved choices below are preserved but excluded from generated implementation direction because App Setup currently says they do not apply.</p><div className="spec-review-signals">{layerSignals.map((signal) => <p key={signal}>{signal}</p>)}</div></div></div>}
      <div className="spec-section"><span className="spec-number">09</span><div><div className="eyebrow">MVP project docs</div><div className="spec-doc-list">{selectedDocs.length ? selectedDocs.map((doc) => <code key={doc.id}>{doc.filename}</code>) : <p className="spec-muted">No documentation files selected.</p>}</div><button className="text-button" onClick={() => setView('docs')}>Edit documentation checklist <ArrowUpRight size={14}/></button></div></div>
      <div className="spec-section"><span className="spec-number">10</span><div><div className="eyebrow">References</div>{project.references.length ? <div className="spec-reference-list">{project.references.map((reference) => <div key={reference.id}><strong>{reference.title}</strong><span>{reference.focus.join(', ') || 'General direction'}</span><p>{reference.note}</p></div>)}</div> : <p className="spec-muted">No directional references saved.</p>}</div></div>
      <div className="spec-section"><span className="spec-number">11</span><div><div className="eyebrow">Anti-sameness</div><p className="guardrail">{similarity.score === null ? 'No previous project is available for comparison yet.' : `This direction is ${similarity.score}% similar to “${similarity.project?.name}”. ${similarity.label}. Use this as a prompt to reconsider repeated visual habits—not as a hard rule.`}</p></div></div>
      <div className="spec-section last"><span className="spec-number">12</span><div><div className="eyebrow">Guardrail</div><p className="guardrail">App Setup is the source of truth for product scope. Explicit scope and resolved required/inferred dependencies outrank everything else. Optional Project Context is verbatim human guidance only and never changes scope automatically. Capabilities and visual patterns are applied only when compatible with resolved App Setup; excluded saved selections are not requirements. Recommended behavior/quality defaults apply only inside active scope. Preserve usability, responsiveness, accessibility, data integrity, and the actual workflow; references remain directional only.</p></div></div>
    </section><aside className="spec-aside"><div className="aside-card"><Sparkles size={18}/><strong>AI implementation prompt</strong><p>Includes the full contract, acceptance criteria, edge cases, and review signals.</p><button className="text-button" onClick={() => copy(agentPrompt, 'Agent prompt copied')}>Copy prompt <Copy size={13}/></button></div><div className="aside-card"><FileText size={18}/><strong>Project spec</strong><p>Human-first summary with exhaustive setup contract kept as an appendix.</p><button className="text-button" onClick={() => copy(markdown, 'Markdown copied')}>Copy Markdown <Copy size={13}/></button></div><div className="aside-card"><FileText size={18}/><strong>Docs manifest</strong><p>Exact selected Markdown files with purpose and suggested sections.</p><button className="text-button" onClick={() => copy(docsManifest, 'Docs manifest copied')}>Copy manifest <Copy size={13}/></button></div><div className="aside-card"><Settings2 size={18}/><strong>Structured JSON</strong><p>Portable contract plus readiness, acceptance criteria, edge cases, and app-type fit.</p><button className="text-button" onClick={() => copy(jsonSpec, 'JSON copied')}>Copy JSON <Copy size={13}/></button></div></aside></div>
  </>
}

function Metric({ name, value }: { name: string; value: number }) { return <div><span>{name}</span><strong>{value}</strong><i><b style={{ width: `${value}%` }}/></i></div> }

function PatternDetail({ pattern, selected, toggle, close, copy, learningMode, related, openRelated, removeCustom }: { pattern: Pattern; selected: boolean; toggle: () => void; close: () => void; copy: (text: string, message?: string) => void; learningMode: boolean; related: Pattern[]; openRelated: (pattern: Pattern) => void; removeCustom?: () => void }) {
  const relatedIds = Array.from(new Set([...(pattern.alternatives ?? []), ...(pattern.pairsWith ?? []), ...(pattern.related ?? [])])).slice(0, 5)
  const relatedPatterns = relatedIds.map((id) => related.find((item) => item.id === id)).filter(Boolean) as Pattern[]
  const difficulty = pattern.level === 'Familiar' ? 'Easy' : pattern.level === 'Explore' ? 'Intermediate' : 'Advanced'
  const implementationCost = pattern.level === 'Experimental' || (pattern.category === 'Motion' && pattern.level !== 'Familiar') ? 'High' : pattern.level === 'Explore' ? 'Medium' : 'Low'
  const uxRisk = pattern.level === 'Experimental' ? 'Needs restraint' : pattern.category === 'Motion' ? 'Validate motion' : 'Generally safe'
  const accessibility = pattern.category === 'Motion' ? 'Respect reduced motion and keep state changes understandable without animation.' : pattern.category === 'Navigation' ? 'Keep destinations keyboard/touch accessible and label unfamiliar icons.' : pattern.category === 'Forms' ? 'Preserve labels, errors, focus order, and large mobile targets.' : 'Maintain semantics, contrast, focus visibility, and responsive reflow.'
  return <div className="modal-wrap" onMouseDown={close}><section className="pattern-detail" onMouseDown={(event) => event.stopPropagation()}><div className="detail-head"><div><span>{pattern.category} · {pattern.level}</span><h2>{pattern.name}</h2></div><button className="icon-button" onClick={close}><X size={19}/></button></div><PatternPreview type={pattern.preview} annotated={learningMode}/><div className="detail-copy"><p className="lead">{pattern.summary}</p>{learningMode && <><div className="learning-principle"><CircleHelp size={17}/><div><span>Why this works</span><p>{pattern.principle || 'The visual structure should reduce effort or communicate hierarchy—not exist only as decoration.'}</p></div></div><div className="learning-metadata"><div><span>Difficulty</span><strong>{difficulty}</strong></div><div><span>Implementation cost</span><strong>{implementationCost}</strong></div><div><span>UX risk</span><strong>{uxRisk}</strong></div></div><div className="accessibility-note"><span>Accessibility lens</span><p>{accessibility}</p></div></>}<div className="detail-two"><div><span>Best for</span><p>{pattern.bestFor}</p></div><div><span>Watch out</span><p>{pattern.watchout}</p></div></div><div className="prompt-box"><span>Prompt-ready language</span><p>{pattern.prompt}</p><button onClick={() => copy(pattern.prompt, 'Pattern prompt copied')}><Copy size={14}/> Copy phrase</button></div><div className="tag-row">{pattern.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{relatedPatterns.length > 0 && <div className="related-patterns"><span>Alternatives / pairings</span><div>{relatedPatterns.map((item) => <button key={item.id} onClick={() => openRelated(item)}>{item.name}<ChevronRight size={13}/></button>)}</div></div>}</div><div className="detail-actions">{removeCustom && <button className="danger-button" onClick={removeCustom}><Trash2 size={15}/> Remove discovery</button>}<button className={selected ? 'secondary-button selected-action' : 'primary-button'} onClick={toggle}>{selected ? <><Check size={16}/> Added to spec</> : <><BookmarkPlus size={16}/> Add to spec</>}</button></div></section></div>
}

function CustomPatternModal({ close, add }: { close: () => void; add: (form: HTMLFormElement) => void }) {
  return <div className="modal-wrap" onMouseDown={close}><form className="custom-modal" onSubmit={(event) => { event.preventDefault(); add(event.currentTarget) }} onMouseDown={(event) => event.stopPropagation()}><div className="detail-head"><div><span>Grow your permanent library</span><h2>Add a new discovery</h2></div><button type="button" className="icon-button" onClick={close}><X size={19}/></button></div><p className="modal-intro">Found a visual idea Blueprint does not know yet? Capture it now so the app gets more valuable the longer you use it.</p><label><span>Name *</span><input name="name" required placeholder="e.g. Centered command dock"/></label><label><span>What is it? *</span><textarea name="summary" required placeholder="Describe the pattern in plain language."/></label><div className="form-two"><label><span>Category</span><select name="category">{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Knowledge level</span><select name="level"><option>Explore</option><option>Familiar</option><option>Experimental</option></select></label></div><label><span>Source URL</span><input name="sourceUrl" type="url" placeholder="Optional inspiration/reference URL"/></label><label><span>Best for</span><input name="bestFor" placeholder="Where would you use this?"/></label><label><span>Watchout</span><input name="watchout" placeholder="What can go wrong?"/></label><label><span>Prompt phrase</span><textarea name="prompt" placeholder="How should an implementation agent interpret this pattern?"/></label><label><span>Tags</span><input name="tags" placeholder="mobile, premium, navigation"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/> Add to library</button></div></form></div>
}

function ReferenceModal({ close, add }: { close: () => void; add: (form: HTMLFormElement, image?: File) => Promise<void> }) {
  const [file, setFile] = useState<File | undefined>()
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  return <div className="modal-wrap" onMouseDown={close}><form className="custom-modal reference-modal" onSubmit={(event) => { event.preventDefault(); void add(event.currentTarget, file) }} onMouseDown={(event) => event.stopPropagation()}><div className="detail-head"><div><span>Directional inspiration</span><h2>Add reference</h2></div><button type="button" className="icon-button" onClick={close}><X size={19}/></button></div><p className="modal-intro">A reference is useful only when you say what you like about it. Screenshot + precise note beats a giant unlabelled moodboard.</p><label><span>Title</span><input name="title" placeholder="e.g. Floating nav treatment"/></label><label><span>Source URL</span><input name="url" type="url" placeholder="https://…"/></label><label><span>Screenshot / image guide</span><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0])}/></label>{preview && <div className="reference-upload-preview"><img src={preview} alt="Selected reference preview"/></div>}<fieldset className="focus-fieldset"><legend>What do you like from this reference?</legend><div>{focusOptions.map((focus) => <label key={focus}><input type="checkbox" name="focus" value={focus}/><span>{focus}</span></label>)}</div></fieldset><label><span>Precise note</span><textarea name="note" placeholder="I like the centered dock and active state. Do not copy the colors or overall page layout."/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button" type="submit"><BookmarkPlus size={16}/> Save reference</button></div></form></div>
}

function ProjectModal({ close, create }: { close: () => void; create: (name: string, appType: AppType) => void }) {
  const [name, setName] = useState('')
  const [appType, setAppType] = useState<AppType>('Custom / General')
  return <div className="modal-wrap" onMouseDown={close}><form className="project-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); create(name, appType) }}><div className="detail-head"><div><span>New workspace</span><h2>Name it. Pick the closest app type. Start building.</h2></div><button type="button" className="icon-button" onClick={close}><X size={18}/></button></div><label><span>Project name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Court booking system"/></label><label><span>App type</span><select value={appType} onChange={(event) => setAppType(event.target.value as AppType)}>{appTypes.map((item) => <option value={item.value} key={item.value}>{item.value}</option>)}</select></label><p>Recommended settings and an Auto-inferred operational scale are applied automatically. You can change either later without losing deliberate choices.</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="primary-button"><Plus size={15}/> Create workspace</button></div></form></div>
}
