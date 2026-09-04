import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronRight, CircleHelp, Eye, Gauge, Grid3X3, Layers3, Search, Sparkles, X } from 'lucide-react'
import type { Pattern } from '../data/catalog'
import {
  fontFamilyFor, normalizeDna, recommendedTypographyWeights, resolvedDarkPalette, semanticFontWeight, typographyCharacters, visualAntiPatternOptions,
  type Dna, type DesignAutonomy, type FontWeightPreference, type PaletteRoles, type SignatureStrength, type TypographyCharacter, type VisualDepth, type VisualOriginality, type WeightContrast,
} from '../data/visualDna'
import {
  applyDirectionCategory, applyFullDirection, previewColorScheme, rankedColorSchemes, rankedVisualDirections,
  type ColorScheme, type DirectionCategoryId, type SuggestionContext, type VisualDirection,
} from '../data/visualSuggestions'
import type { VisualDirectorOutput } from '../data/visualDirector'
import { ConceptInfo, TldrOnly, TldrSummary, VerboseOnly, useGuidanceMode } from './Guidance'

type Recommendation = { pattern: Pattern; reason: string }
type Props = {
  dna: Dna
  onChange: (dna: Dna) => void
  suggestionContext: SuggestionContext
  recommendations: Recommendation[]
  onOpenPattern: (pattern: Pattern) => void
  onAddPattern: (id: string) => void
  sanity: (dna: Dna) => string[]
  director: VisualDirectorOutput
}

const selectOptions = {
  themeMode: ['Light only','Dark only','System','Light + Dark toggle'],
  defaultTheme: ['Light','Dark'],
  themeTogglePlacement: ['Header','Navigation','Settings','Header + settings'],
  darkPaletteStrategy: ['Auto-adapted','Separately curated'],
  monospaceUsage: ['None','Metadata only','Data / code','Frequent accent','Primary'],
  headingWeightPreference: ['Auto / Recommended','Light','Regular','Medium','Semibold','Bold','Extra Bold','Black'],
  bodyWeightPreference: ['Auto / Recommended','Light','Regular','Medium','Semibold'],
  uiWeightPreference: ['Auto / Recommended','Regular','Medium','Semibold','Bold'],
  weightContrast: ['Subtle','Balanced','Strong'],
  whitespacePriority: ['Compact','Balanced','Generous','Very spacious'],
  gridCharacter: ['Strict grid','Flexible grid','Asymmetric','Editorial flow','Content-led'],
  alignmentTendency: ['Mostly left','Centered moments','Mixed','Deliberately asymmetric'],
  responsiveBehavior: ['Reflow naturally','Collapse aggressively','Preserve density','Mobile composition changes'],
  functionalDensity: ['Follow global','Balanced for scanning','Compact operational'],
  navigationVariant: ['Auto / Recommended','Top bar','Compact header','Sidebar','Bottom dock'],
  sectionStrategy: ['Uniform','Alternating subtle sections','Strong separated sections','Tonal layering','Card-within-section','Editorial blocks','Mixed'],
  backgroundTreatment: ['Solid','Tint','Gradient','Texture','Image','Glass','Mixed'],
  sectionDividers: ['None','Hairline','Strong rules','Whitespace only','Mixed'],
  heroSeparation: ['Integrated','Subtle contrast','Strong contrast','Full bleed'],
  ctaTreatment: ['Inline','Contained','Contrast band','Full bleed','Minimal'],
  footerContrast: ['Same as page','Subtle','Strong','Inverse'],
  surfaceLanguage: ['Borderless','Hairline borders','Tonal surfaces','Soft elevation','Strong elevation','Mixed containment'],
  shadowCharacter: ['None','Barely there','Soft diffuse','Crisp','Dramatic'],
  gradientUsage: ['None','Rare accent','Selective','Frequent'],
  glassUsage: ['None','Rare overlay','Selective','Frequent'],
  textureUsage: ['None','Subtle','Selective','Prominent'],
  shapeLanguage: ['Sharp','Soft','Rounded','Pill-accented'],
  pillUsage: ['None','Tags only','Selective accents','Frequent'],
  buttonShape: ['Rectangular','Soft rectangle','Rounded','Pill'],
  buttonWeight: ['Quiet','Balanced','Bold'],
  buttonEmphasis: ['Filled primary','Outline primary','Ghost-led','Mixed hierarchy'],
  inputAppearance: ['Underline','Outlined','Filled','Borderless / tonal'],
  formDensity: ['Spacious','Comfortable','Compact'],
  controlBorderStyle: ['None','Hairline','Defined','High contrast'],
  hoverCharacter: ['Minimal','Color shift','Lift','Scale / spring','Underline / rule'],
  imageryMode: ['None','Photography','Product screenshots','Illustration','Abstract graphics','Mixed'],
  imageCharacter: ['Natural','Editorial','Technical','Documentary','Polished commercial'],
  imageTreatment: ['Full color','Muted','Monochrome','Duotone','High contrast'],
  imagePresentation: ['Full bleed','Framed','Floating','Cropped','Background'],
  iconStyle: ['Outline','Filled','Mixed'], iconGeometry: ['Geometric','Organic','Neutral'],
  motionAmount: ['None','Low','Moderate','High'], motionCharacter: ['Snappy','Smooth','Springy','Editorial','Cinematic'],
  pageTransition: ['None','Fade','Slide','Scale','Reveal','Contextual'], scrollAnimation: ['None','Key sections only','Selective','Frequent'], hoverResponse: ['None','Subtle','Responsive','Expressive'],
  easing: ['Standard ease','Ease out','Ease in-out','Spring-like','Custom / implementation-led'], accentUsage: ['Rare','Focused','Balanced','Prominent'],
  easePriority: ['Standard','High','Non-negotiable'], stretch: ['Safe','Balanced','Push me'],
  designAutonomy: ['Strict','Balanced','Art Director'], visualOriginality: ['Safe','Distinct','Bold','Experimental'], signatureStrength: ['None','Subtle','Recommended','Strong'],
} as const

const visualConceptHelp: Record<string, string> = {
  'Design autonomy': 'How much implementation freedom the coding AI gets when Blueprint has not specified a visual detail. It never grants permission to invent product scope.',
  'Visual originality': 'How far the visual direction may move away from familiar, conventional app patterns while still respecting usability and explicit constraints.',
  'Signature brand moment': 'The intended strength of one memorable visual behavior or composition that helps the product feel specifically designed rather than generic.',
  'Dark palette strategy': 'Whether dark mode is mechanically adapted from the light palette or curated as its own deliberate set of color roles.',
  'Weight contrast': 'How much typographic hierarchy should rely on differences between light and heavy font weights.',
  'Monospace usage': 'Where a fixed-width typeface is allowed. Useful for metadata or technical content, but easy to overuse as a generic tech aesthetic.',
  'Readable line width': 'The target text measure in characters. Shorter measures make long reading easier; wider measures fit denser interfaces.',
  'Whitespace priority': 'The overall breathing-room posture. It influences density, gutters, and section spacing together.',
  'Information density': 'How much content and control surface should fit into a given area. Higher values favor scanning efficiency over spaciousness.',
  'Grid character': 'The composition logic behind alignment: strict columns, flexible grids, asymmetric layouts, editorial flow, or content-led placement.',
  'Catalog / working-surface density': 'Density specifically for repetitive operational surfaces such as tables, catalogs, queues, dashboards, and admin workspaces.',
  'Navigation variant': 'The structural placement of primary navigation. Auto / Recommended lets Blueprint choose from product context without changing functional scope.',
  'Responsive behavior': 'How deliberately the layout changes across screen sizes instead of merely shrinking the desktop composition.',
  'Section strategy': 'How major page regions are visually separated so the interface does not become one undifferentiated canvas.',
  'Surface language': 'How panels and containers communicate grouping: borderless, tonal, bordered, elevated, or mixed.',
  'Accent usage': 'How often the accent color is allowed to compete for attention. Focused or rare use generally preserves clearer hierarchy.',
  'Ease-of-use priority': 'How strongly usability should constrain visual experimentation when the two come into tension.',
  'Creative stretch': 'How willing the visual system should be to push beyond safe conventions while staying inside explicit product and accessibility constraints.',
}

function VisualFieldLabel({ label }: { label: string }) {
  const help = visualConceptHelp[label]
  return <span className="visual-field-label"><span>{label}</span>{help && <ConceptInfo label={label}>{help}</ConceptInfo>}</span>
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return <div className="visual-field"><VisualFieldLabel label={label}/><select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>{options.map((option) => <option key={option}>{option}</option>)}</select></div>
}
function RangeField({ label, value, min, max, step=1, suffix='', onChange }: { label:string; value:number; min:number; max:number; step?:number; suffix?:string; onChange:(value:number)=>void }) {
  return <div className="visual-range"><div><VisualFieldLabel label={label}/><b>{value}{suffix}</b></div><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}/></div>
}
function ToggleField({ label, checked, onChange, helper }: { label:string; checked:boolean; onChange:(value:boolean)=>void; helper?:string }) {
  return <label className="visual-toggle"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}/><span><strong><VisualFieldLabel label={label}/></strong>{helper && <small>{helper}</small>}</span></label>
}
function Group({ number, title, badge, children }: { number:string; title:string; badge?:string; children:React.ReactNode }) {
  return <section className="visual-group"><header className="visual-group-head"><div><div className="eyebrow">{number}</div><h3>{title}</h3></div>{badge && <span>{badge}</span>}</header>{children}</section>
}

export default function VisualStudio({ dna: rawDna, onChange, suggestionContext, recommendations, onOpenPattern, onAddPattern, sanity, director }: Props) {
  const { tldrMode } = useGuidanceMode()
  const dna = normalizeDna(rawDna)
  const [depth, setDepth] = useState<VisualDepth>(() => {
    try {
      const saved = localStorage.getItem('blueprint-visual-depth')
      return saved === 'Standard' || saved === 'Advanced' ? saved : 'Quick'
    } catch {
      return 'Quick'
    }
  })
  useEffect(() => {
    try { localStorage.setItem('blueprint-visual-depth', depth) } catch { /* non-critical display preference */ }
  }, [depth])
  const [previewDna, setPreviewDna] = useState<Dna | null>(null)
  const [previewLabel, setPreviewLabel] = useState('')
  const displayDna = previewDna ?? dna
  const atLeast = (wanted: VisualDepth) => ['Quick','Standard','Advanced'].indexOf(depth) >= ['Quick','Standard','Advanced'].indexOf(wanted)
  const clearPreview = () => { setPreviewDna(null); setPreviewLabel('') }
  const commit = (next: Dna) => { clearPreview(); onChange(normalizeDna(next)) }
  const patch = (value: Partial<Dna>) => commit({ ...dna, ...value } as Dna)
  const customizedOrigin = dna.colorSchemeOrigin ? `${dna.colorSchemeOrigin.replace(/ · customized$/, '')} · customized` : 'Custom'
  const setPalette = (role:keyof PaletteRoles, value:string, dark=false) => patch(dark ? { darkPalette:{...dna.darkPalette,[role]:value}, colorSchemeOrigin:customizedOrigin } : { palette:{...dna.palette,[role]:value}, colorSchemeOrigin:customizedOrigin })
  const setTypography = (character: TypographyCharacter) => {
    const next = { ...dna, typographyCharacter:character, headingTypography:character, bodyTypography:(character.includes('serif') || character==='Display / expressive')?'Humanist sans':character, typography:`${character}${character.includes('serif') || character==='Display / expressive'?' + utility sans':''}` } as Dna
    const recommended = recommendedTypographyWeights(next)
    if (dna.headingWeightPreference === 'Auto / Recommended') next.headingWeight = recommended.headingWeight
    if (dna.bodyWeightPreference === 'Auto / Recommended') next.bodyWeight = recommended.bodyWeight
    if (dna.uiWeightPreference === 'Auto / Recommended') next.uiWeight = recommended.uiWeight
    commit(next)
  }
  const setWeightPreference = (kind: 'heading' | 'body' | 'ui', preference: FontWeightPreference) => {
    const recommended = recommendedTypographyWeights(dna)
    const fallback = kind === 'heading' ? recommended.headingWeight : kind === 'body' ? recommended.bodyWeight : recommended.uiWeight
    const weight = preference === 'Auto / Recommended' ? fallback : semanticFontWeight(preference, fallback)
    if (kind === 'heading') patch({ headingWeightPreference: preference, headingWeight: weight })
    else if (kind === 'body') patch({ bodyWeightPreference: preference, bodyWeight: weight })
    else patch({ uiWeightPreference: preference, uiWeight: weight })
  }
  const setWeightContrast = (weightContrast: WeightContrast) => {
    const next = { ...dna, weightContrast } as Dna
    const recommended = recommendedTypographyWeights(next)
    if (dna.headingWeightPreference === 'Auto / Recommended') next.headingWeight = recommended.headingWeight
    if (dna.bodyWeightPreference === 'Auto / Recommended') next.bodyWeight = recommended.bodyWeight
    if (dna.uiWeightPreference === 'Auto / Recommended') next.uiWeight = recommended.uiWeight
    commit(next)
  }
  const toggleAnti = (item:string) => patch({ visualAntiPatterns:dna.visualAntiPatterns.includes(item)?dna.visualAntiPatterns.filter((x)=>x!==item):[...dna.visualAntiPatterns,item] })

  return <>
    <header className={`page-header ${tldrMode ? 'page-header-tldr' : ''}`}><div><div className="eyebrow">Visual Studio · visual authority</div><h1>See a coherent art direction before tuning raw controls.</h1><p>{tldrMode ? 'Pick or refine the visual direction. Scope remains untouched.' : 'Visual Director synthesizes the product context into one project-specific direction. You can apply it as a starting point, then refine any advanced control without giving it permission to invent functional scope.'}</p>{tldrMode && <span className="page-tldr-chip">TL;DR · direction + high-impact controls</span>}</div></header>
    <div className="visual-depth-bar"><div><div className="eyebrow"><Layers3 size={12}/> Configuration depth</div><p>{depth==='Quick'?'High-impact choices only.':depth==='Standard'?'Normal design-system control.':'Every applicable visual token.'} Changing depth never changes the project itself.</p></div><div className="visual-depth-tabs">{(['Quick','Standard','Advanced'] as VisualDepth[]).map((item)=><button key={item} className={depth===item?'active':''} onClick={()=>setDepth(item)}>{item}</button>)}</div></div>

    <section className="visual-director-card"><div className="visual-director-head"><div><div className="eyebrow"><Sparkles size={12}/> Visual Director · synthesized <ConceptInfo label="Visual Director">A context-aware visual recommendation. It proposes art direction only; it cannot create features, permissions, or product scope.</ConceptInfo></div><h2>{director.directionName}</h2><p>{director.thesis}</p></div><button className="primary-button" onClick={()=>commit(director.proposedDna)}><Sparkles size={15}/> Use Visual Director</button></div><div className="visual-director-meta"><span>{director.designDNA.archetype}</span><span>{director.designDNA.visualTension}</span><span>{director.visualOriginality} originality</span><span>{director.designAutonomy} autonomy</span></div><TldrSummary title="Direction in one line">{director.designDNA.composition} · {director.typographyDirection} · signature: {director.signatureElement}</TldrSummary><VerboseOnly><div className="visual-director-grid"><div><strong>Composition</strong><p>{director.designDNA.composition}</p></div><div><strong>Typography</strong><p>{director.typographyDirection}</p></div><div><strong>Signature element</strong><p>{director.signatureElement}</p></div><div><strong>Hard constraints</strong><p>{director.hardConstraints.slice(0,3).join(' ')}</p></div></div><small>Hard constraints outrank the recommended direction; implementation freedom applies only where Blueprint is silent.</small></VerboseOnly></section>

    <div className="visual-director-controls"><SelectField label="Design autonomy" value={dna.designAutonomy} options={selectOptions.designAutonomy} onChange={(designAutonomy:DesignAutonomy)=>patch({designAutonomy})}/><SelectField label="Visual originality" value={dna.visualOriginality} options={selectOptions.visualOriginality} onChange={(visualOriginality:VisualOriginality)=>patch({visualOriginality})}/><SelectField label="Signature brand moment" value={dna.signatureStrength} options={selectOptions.signatureStrength} onChange={(signatureStrength:SignatureStrength)=>patch({signatureStrength})}/><div className="visual-director-control-note"><strong>Premium is a quality bar, not a preset.</strong><span>Composition, typography, spacing, imagery, hierarchy, and responsive behavior should feel deliberate without defaulting to black/beige, giant serifs, glass, or generic card grids.</span></div></div>

    <TldrOnly><details className="tldr-on-demand"><summary>Explore alternative visual directions & color schemes</summary><VisualSuggestions dna={dna} context={{ ...suggestionContext, dna }} previewDna={previewDna} previewLabel={previewLabel} onPreview={(next,label)=>{ setPreviewDna(next); setPreviewLabel(label) }} onClearPreview={clearPreview} onCommit={commit}/></details></TldrOnly>
    <VerboseOnly><VisualSuggestions dna={dna} context={{ ...suggestionContext, dna }} previewDna={previewDna} previewLabel={previewLabel} onPreview={(next,label)=>{ setPreviewDna(next); setPreviewLabel(label) }} onClearPreview={clearPreview} onCommit={commit}/></VerboseOnly>

    <div className="dna-layout visual-studio-layout"><div className="visual-controls">
      <Group number="01 · Theme" title="How the product lives in light and dark." badge="Quick"><div className="visual-grid two"><SelectField label="Theme behavior" value={dna.themeMode} options={selectOptions.themeMode} onChange={(themeMode)=>patch({themeMode})}/>{(dna.themeMode==='System'||dna.themeMode==='Light + Dark toggle') && <SelectField label="Default / fallback theme" value={dna.defaultTheme} options={selectOptions.defaultTheme} onChange={(defaultTheme)=>patch({defaultTheme})}/>}</div>{atLeast('Standard') && <div className="visual-grid two">{(dna.themeMode==='System'||dna.themeMode==='Light + Dark toggle') && <ToggleField label="Respect OS preference" checked={dna.respectOsPreference} onChange={(respectOsPreference)=>patch({respectOsPreference})}/>} {dna.themeMode==='Light + Dark toggle' && <ToggleField label="Remember preference" checked={dna.rememberThemePreference} onChange={(rememberThemePreference)=>patch({rememberThemePreference})}/>} {dna.themeMode==='Light + Dark toggle' && <SelectField label="Toggle placement" value={dna.themeTogglePlacement} options={selectOptions.themeTogglePlacement} onChange={(themeTogglePlacement)=>patch({themeTogglePlacement})}/>} {dna.themeMode!=='Light only' && <SelectField label="Dark palette strategy" value={dna.darkPaletteStrategy} options={selectOptions.darkPaletteStrategy} onChange={(darkPaletteStrategy)=>patch({darkPaletteStrategy})}/>}</div>}</Group>

      <Group number="02 · Typography" title="Type should change the personality, not just the label." badge="Highest impact"><div className="type-specimen-grid">{typographyCharacters.map((character)=><button key={character} className={dna.typographyCharacter===character?'active':''} onClick={()=>setTypography(character)}><span style={{fontFamily:fontFamilyFor(character)}}>Aa</span><strong>{character}</strong><small style={{fontFamily:fontFamilyFor(character)}}>Blueprint 27</small></button>)}</div><div className="visual-grid two"><RangeField label="Body text size" value={dna.bodyFontSize} min={13} max={22} suffix="px" onChange={(bodyFontSize)=>patch({bodyFontSize})}/><RangeField label="Heading scale" value={dna.headingScale} min={75} max={160} suffix="%" onChange={(headingScale)=>patch({headingScale})}/></div>{atLeast('Standard') && <><div className="visual-grid two"><SelectField label="Heading character" value={dna.headingTypography} options={typographyCharacters} onChange={(headingTypography)=>patch({headingTypography})}/><SelectField label="Body character" value={dna.bodyTypography} options={typographyCharacters} onChange={(bodyTypography)=>patch({bodyTypography})}/><SelectField label="Heading weight" value={dna.headingWeightPreference} options={selectOptions.headingWeightPreference} onChange={(value)=>setWeightPreference('heading', value)}/><SelectField label="Body weight" value={dna.bodyWeightPreference} options={selectOptions.bodyWeightPreference} onChange={(value)=>setWeightPreference('body', value)}/><SelectField label="UI / control weight" value={dna.uiWeightPreference} options={selectOptions.uiWeightPreference} onChange={(value)=>setWeightPreference('ui', value)}/><SelectField label="Weight contrast" value={dna.weightContrast} options={selectOptions.weightContrast} onChange={setWeightContrast}/><SelectField label="Monospace usage" value={dna.monospaceUsage} options={selectOptions.monospaceUsage} onChange={(monospaceUsage)=>patch({monospaceUsage})}/><RangeField label="Readable line width" value={dna.textMeasure} min={42} max={90} suffix="ch" onChange={(textMeasure)=>patch({textMeasure})}/></div></>}{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Exact heading weight" value={dna.headingWeight} min={300} max={900} step={50} onChange={(headingWeight)=>patch({headingWeight,headingWeightPreference:'Custom'})}/><RangeField label="Exact body weight" value={dna.bodyWeight} min={300} max={700} step={50} onChange={(bodyWeight)=>patch({bodyWeight,bodyWeightPreference:'Custom'})}/><RangeField label="Exact UI weight" value={dna.uiWeight} min={300} max={700} step={50} onChange={(uiWeight)=>patch({uiWeight,uiWeightPreference:'Custom'})}/><RangeField label="Line height" value={dna.lineHeight} min={120} max={190} suffix="%" onChange={(lineHeight)=>patch({lineHeight})}/><RangeField label="Tracking" value={dna.letterSpacing} min={-4} max={8} suffix="/100em" onChange={(letterSpacing)=>patch({letterSpacing})}/></div>}</Group>

      <Group number="03 · Layout & rhythm" title="Decide how much the interface breathes." badge="Quick"><div className="visual-grid two"><SelectField label="Whitespace priority" value={dna.whitespacePriority} options={selectOptions.whitespacePriority} onChange={(whitespacePriority)=>patch({whitespacePriority,density:whitespacePriority==='Compact'?72:whitespacePriority==='Balanced'?50:whitespacePriority==='Generous'?34:20,pageGutters:whitespacePriority==='Compact'?20:whitespacePriority==='Balanced'?32:whitespacePriority==='Generous'?44:56,sectionSpacing:whitespacePriority==='Compact'?48:whitespacePriority==='Balanced'?72:whitespacePriority==='Generous'?96:128})}/><RangeField label="Information density" value={dna.density} min={0} max={100} onChange={(density)=>patch({density})}/></div>{atLeast('Standard') && <div className="visual-grid two"><RangeField label="Content max width" value={dna.contentMaxWidth} min={720} max={1600} step={20} suffix="px" onChange={(contentMaxWidth)=>patch({contentMaxWidth})}/><RangeField label="Section spacing" value={dna.sectionSpacing} min={32} max={180} step={4} suffix="px" onChange={(sectionSpacing)=>patch({sectionSpacing})}/><SelectField label="Grid character" value={dna.gridCharacter} options={selectOptions.gridCharacter} onChange={(gridCharacter)=>patch({gridCharacter})}/><SelectField label="Alignment tendency" value={dna.alignmentTendency} options={selectOptions.alignmentTendency} onChange={(alignmentTendency)=>patch({alignmentTendency})}/><SelectField label="Catalog / working-surface density" value={dna.functionalDensity} options={selectOptions.functionalDensity} onChange={(functionalDensity)=>patch({functionalDensity})}/><SelectField label="Navigation variant" value={dna.navigationVariant} options={selectOptions.navigationVariant} onChange={(navigationVariant)=>patch({navigationVariant})}/></div>}{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Page gutters" value={dna.pageGutters} min={12} max={96} step={2} suffix="px" onChange={(pageGutters)=>patch({pageGutters})}/><SelectField label="Responsive behavior" value={dna.responsiveBehavior} options={selectOptions.responsiveBehavior} onChange={(responsiveBehavior)=>patch({responsiveBehavior})}/><ToggleField label="Mobile-first" checked={dna.mobileFirst} helper="Treat mobile constraints as a first-class design input." onChange={(mobileFirst)=>patch({mobileFirst})}/></div>}</Group>

      <Group number="04 · Sections & backgrounds" title="Stop every page from becoming one endless canvas." badge="Major identity lever"><SelectField label="Section strategy" value={dna.sectionStrategy} options={selectOptions.sectionStrategy} onChange={(sectionStrategy)=>patch({sectionStrategy})}/>{atLeast('Standard') && <div className="visual-grid two"><RangeField label="Section contrast" value={dna.sectionContrast} min={0} max={100} onChange={(sectionContrast)=>patch({sectionContrast})}/><SelectField label="Background treatment" value={dna.backgroundTreatment} options={selectOptions.backgroundTreatment} onChange={(backgroundTreatment)=>patch({backgroundTreatment})}/><SelectField label="Hero separation" value={dna.heroSeparation} options={selectOptions.heroSeparation} onChange={(heroSeparation)=>patch({heroSeparation})}/><SelectField label="CTA treatment" value={dna.ctaTreatment} options={selectOptions.ctaTreatment} onChange={(ctaTreatment)=>patch({ctaTreatment})}/></div>}{atLeast('Advanced') && <div className="visual-grid two advanced-well"><SelectField label="Section dividers" value={dna.sectionDividers} options={selectOptions.sectionDividers} onChange={(sectionDividers)=>patch({sectionDividers})}/><SelectField label="Footer contrast" value={dna.footerContrast} options={selectOptions.footerContrast} onChange={(footerContrast)=>patch({footerContrast})}/><ToggleField label="Intentional variation" checked={dna.variedSections} onChange={(variedSections)=>patch({variedSections})}/></div>}</Group>

      <Group number="05 · Surfaces & shape" title="Choose containment before the AI chooses rounded cards for everything." badge="Anti-template"><div className="visual-grid two"><SelectField label="Surface language" value={dna.surfaceLanguage} options={selectOptions.surfaceLanguage} onChange={(surfaceLanguage)=>patch({surfaceLanguage})}/><SelectField label="Shape language" value={dna.shapeLanguage} options={selectOptions.shapeLanguage} onChange={(shapeLanguage)=>patch({shapeLanguage,radius:shapeLanguage==='Sharp'?4:shapeLanguage==='Soft'?28:shapeLanguage==='Rounded'?72:58,surfaceRadius:shapeLanguage==='Sharp'?2:shapeLanguage==='Soft'?10:shapeLanguage==='Rounded'?24:14,controlRadius:shapeLanguage==='Sharp'?2:shapeLanguage==='Soft'?8:shapeLanguage==='Rounded'?16:12,buttonRadius:shapeLanguage==='Sharp'?2:shapeLanguage==='Soft'?8:shapeLanguage==='Rounded'?18:40,buttonShape:shapeLanguage==='Sharp'?'Rectangular':shapeLanguage==='Soft'?'Soft rectangle':shapeLanguage==='Rounded'?'Rounded':'Pill',pillUsage:shapeLanguage==='Pill-accented'?'Selective accents':dna.pillUsage})}/></div>{atLeast('Standard') && <div className="visual-grid two"><SelectField label="Shadow character" value={dna.shadowCharacter} options={selectOptions.shadowCharacter} onChange={(shadowCharacter)=>patch({shadowCharacter})}/><RangeField label="Surface contrast" value={dna.surfaceContrast} min={0} max={100} onChange={(surfaceContrast)=>patch({surfaceContrast})}/><RangeField label="Surface radius" value={dna.surfaceRadius} min={0} max={40} suffix="px" onChange={(surfaceRadius)=>patch({surfaceRadius})}/><SelectField label="Pill usage" value={dna.pillUsage} options={selectOptions.pillUsage} onChange={(pillUsage)=>patch({pillUsage})}/></div>}{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Border weight" value={dna.borderWeight} min={0} max={4} step={.5} suffix="px" onChange={(borderWeight)=>patch({borderWeight})}/><RangeField label="Elevation" value={dna.elevation} min={0} max={100} onChange={(elevation)=>patch({elevation})}/><RangeField label="Control radius" value={dna.controlRadius} min={0} max={32} suffix="px" onChange={(controlRadius)=>patch({controlRadius})}/><RangeField label="Button radius" value={dna.buttonRadius} min={0} max={40} suffix="px" onChange={(buttonRadius)=>patch({buttonRadius})}/><SelectField label="Gradient usage" value={dna.gradientUsage} options={selectOptions.gradientUsage} onChange={(gradientUsage)=>patch({gradientUsage})}/><SelectField label="Glass usage" value={dna.glassUsage} options={selectOptions.glassUsage} onChange={(glassUsage)=>patch({glassUsage})}/><SelectField label="Texture usage" value={dna.textureUsage} options={selectOptions.textureUsage} onChange={(textureUsage)=>patch({textureUsage})}/></div>}</Group>

      {atLeast('Standard') && <Group number="06 · Buttons & forms" title="Give controls their own design language." badge="Standard"><div className="visual-grid two"><SelectField label="Button shape" value={dna.buttonShape} options={selectOptions.buttonShape} onChange={(buttonShape)=>patch({buttonShape})}/><SelectField label="Button weight" value={dna.buttonWeight} options={selectOptions.buttonWeight} onChange={(buttonWeight)=>patch({buttonWeight})}/><SelectField label="Button hierarchy" value={dna.buttonEmphasis} options={selectOptions.buttonEmphasis} onChange={(buttonEmphasis)=>patch({buttonEmphasis})}/><SelectField label="Input appearance" value={dna.inputAppearance} options={selectOptions.inputAppearance} onChange={(inputAppearance)=>patch({inputAppearance})}/><SelectField label="Form density" value={dna.formDensity} options={selectOptions.formDensity} onChange={(formDensity)=>patch({formDensity})}/><SelectField label="Hover / active" value={dna.hoverCharacter} options={selectOptions.hoverCharacter} onChange={(hoverCharacter)=>patch({hoverCharacter})}/></div>{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Input height" value={dna.inputHeight} min={34} max={64} suffix="px" onChange={(inputHeight)=>patch({inputHeight})}/><SelectField label="Control borders" value={dna.controlBorderStyle} options={selectOptions.controlBorderStyle} onChange={(controlBorderStyle)=>patch({controlBorderStyle})}/></div>}</Group>}

      <Group number="07 · Imagery" title="Define what kind of visual material belongs here." badge="Quick"><SelectField label="Imagery direction" value={dna.imageryMode} options={selectOptions.imageryMode} onChange={(imageryMode)=>patch({imageryMode})}/>{atLeast('Standard') && dna.imageryMode!=='None' && <div className="visual-grid three"><SelectField label="Character" value={dna.imageCharacter} options={selectOptions.imageCharacter} onChange={(imageCharacter)=>patch({imageCharacter})}/><SelectField label="Treatment" value={dna.imageTreatment} options={selectOptions.imageTreatment} onChange={(imageTreatment)=>patch({imageTreatment})}/><SelectField label="Presentation" value={dna.imagePresentation} options={selectOptions.imagePresentation} onChange={(imagePresentation)=>patch({imagePresentation})}/></div>}</Group>

      {atLeast('Standard') && <Group number="08 · Iconography" title="One family, one visual grammar." badge="Standard"><div className="visual-grid two"><SelectField label="Icon style" value={dna.iconStyle} options={selectOptions.iconStyle} onChange={(iconStyle)=>patch({iconStyle})}/><SelectField label="Icon geometry" value={dna.iconGeometry} options={selectOptions.iconGeometry} onChange={(iconGeometry)=>patch({iconGeometry})}/><RangeField label="Icon emphasis" value={dna.iconWeight} min={0} max={100} onChange={(iconWeight)=>patch({iconWeight})}/><ToggleField label="Label unfamiliar icons" checked={dna.labelUnfamiliarIcons} onChange={(labelUnfamiliarIcons)=>patch({labelUnfamiliarIcons})}/></div>{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Stroke weight" value={dna.iconStrokeWeight} min={1} max={3} step={.25} onChange={(iconStrokeWeight)=>patch({iconStrokeWeight})}/><RangeField label="Base icon size" value={dna.iconSize} min={14} max={32} suffix="px" onChange={(iconSize)=>patch({iconSize})}/><ToggleField label="Strict icon family" checked={dna.strictIconFamily} onChange={(strictIconFamily)=>patch({strictIconFamily})}/></div>}</Group>}

      <Group number="09 · Motion" title="Animation needs a character and a budget." badge="Quick"><div className="visual-grid two"><SelectField label="Motion amount" value={dna.motionAmount} options={selectOptions.motionAmount} onChange={(motionAmount)=>patch({motionAmount,motion:motionAmount==='None'?0:motionAmount==='Low'?22:motionAmount==='Moderate'?48:76})}/><SelectField label="Motion character" value={dna.motionCharacter} options={selectOptions.motionCharacter} onChange={(motionCharacter)=>patch({motionCharacter})}/></div>{atLeast('Standard') && <div className="visual-grid two"><SelectField label="Page transition" value={dna.pageTransition} options={selectOptions.pageTransition} onChange={(pageTransition)=>patch({pageTransition})}/><SelectField label="Scroll animation" value={dna.scrollAnimation} options={selectOptions.scrollAnimation} onChange={(scrollAnimation)=>patch({scrollAnimation})}/><SelectField label="Hover response" value={dna.hoverResponse} options={selectOptions.hoverResponse} onChange={(hoverResponse)=>patch({hoverResponse})}/><ToggleField label="Reduced-motion fallback" checked={dna.reducedMotionFallback} onChange={(reducedMotionFallback)=>patch({reducedMotionFallback})}/></div>}{atLeast('Advanced') && <div className="visual-grid two advanced-well"><RangeField label="Typical duration" value={dna.motionDuration} min={80} max={900} step={10} suffix="ms" onChange={(motionDuration)=>patch({motionDuration})}/><SelectField label="Easing" value={dna.easing} options={selectOptions.easing} onChange={(easing)=>patch({easing})}/></div>}</Group>

      <Group number="10 · Color system" title="Roles first. Accent with restraint." badge={atLeast('Standard')?'15 roles':'Core roles'}><SelectField label="Accent usage" value={dna.accentUsage} options={selectOptions.accentUsage} onChange={(accentUsage)=>patch({accentUsage})}/><div className={`palette-editor visual-palette ${atLeast('Standard')?'':'quick-palette'}`}>{(Object.keys(dna.palette) as (keyof PaletteRoles)[]).filter((role)=>atLeast('Standard') || ['ink','background','accent','surface'].includes(role)).map((role)=><label key={role}><span>{role}</span><div><input type="color" value={dna.palette[role]} onChange={(e)=>setPalette(role,e.target.value)}/><input value={dna.palette[role]} onChange={(e)=>setPalette(role,e.target.value)}/></div></label>)}</div>{atLeast('Advanced') && dna.darkPaletteStrategy==='Separately curated' && dna.themeMode!=='Light only' && <><div className="palette-subhead"><strong>Dark palette</strong><small>Separately curated instead of automatically adapted.</small></div><div className="palette-editor visual-palette">{(Object.keys(dna.darkPalette) as (keyof PaletteRoles)[]).map((role)=><label key={role}><span>{role}</span><div><input type="color" value={dna.darkPalette[role]} onChange={(e)=>setPalette(role,e.target.value,true)}/><input value={dna.darkPalette[role]} onChange={(e)=>setPalette(role,e.target.value,true)}/></div></label>)}</div></>}</Group>

      <Group number="11 · Visual anti-patterns" title="Explicitly say what the implementation should not collapse into." badge="Anti-AI-slop"><div className="anti-pattern-grid">{visualAntiPatternOptions.map((item)=><button key={item} className={dna.visualAntiPatterns.includes(item)?'active':''} onClick={()=>toggleAnti(item)}>{dna.visualAntiPatterns.includes(item)&&<Check size={14}/>}<span>{item}</span></button>)}</div></Group>
      <Group number="12 · Optional visual signature" title="Describe the thing structured controls cannot quite say." badge="Verbatim"><label className="visual-signature"><textarea value={dna.visualSignature} onChange={(e)=>patch({visualSignature:e.target.value})} placeholder="Large editorial serif headings, tiny monospace metadata, thin rules, almost no cards."/><small>Passed verbatim to the coding AI as lower-authority visual intent. It never silently changes structured settings.</small></label></Group>
      <Group number="UX posture" title="Visual expression still answers to usability."><div className="visual-grid two"><SelectField label="Ease-of-use priority" value={dna.easePriority} options={selectOptions.easePriority} onChange={(easePriority)=>patch({easePriority})}/><SelectField label="Creative stretch" value={dna.stretch} options={selectOptions.stretch} onChange={(stretch)=>patch({stretch})}/></div></Group>
    </div>

    <aside className="sticky-preview visual-sticky">{previewDna && <div className="preview-mode-banner"><div><Eye size={13}/><span>Previewing <strong>{previewLabel}</strong></span></div><button onClick={clearPreview}><X size={13}/> Exit preview</button></div>}<LivePreview dna={displayDna}/><div className="recommend-panel"><div className="eyebrow"><Sparkles size={12}/> Compatible patterns</div>{recommendations.slice(0,3).map(({pattern,reason})=><button key={pattern.id} onClick={()=>onOpenPattern(pattern)}><span>{pattern.name}</span><small>{reason}</small></button>)}<button className="recommend-add" disabled={!recommendations[0]} onClick={()=>recommendations[0]&&onAddPattern(recommendations[0].pattern.id)}>Add top suggestion</button></div><div className="sanity-panel"><div className="eyebrow"><CircleHelp size={12}/> Design sanity check</div>{sanity(displayDna).map((note)=><p key={note}>{note}</p>)}</div></aside></div>
  </>
}


type SuggestionsProps = {
  dna: Dna
  context: SuggestionContext
  previewDna: Dna | null
  previewLabel: string
  onPreview: (dna: Dna, label: string) => void
  onClearPreview: () => void
  onCommit: (dna: Dna) => void
}

function VisualSuggestions({ dna, context, previewDna, previewLabel, onPreview, onClearPreview, onCommit }: SuggestionsProps) {
  const directions = rankedVisualDirections(context)
  const schemes = rankedColorSchemes(context)
  const [selectedDirectionId, setSelectedDirectionId] = useState(directions[0]?.id ?? '')
  const [showAllSchemes, setShowAllSchemes] = useState(false)
  const [feedback, setFeedback] = useState('')
  const selectedDirection = directions.find((item) => item.id === selectedDirectionId) ?? directions[0]
  const visibleSchemes = showAllSchemes ? schemes : schemes.slice(0, 8)

  useEffect(() => {
    if (!directions.some((item) => item.id === selectedDirectionId)) setSelectedDirectionId(directions[0]?.id ?? '')
  }, [directions, selectedDirectionId])

  const flash = (message: string) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2200)
  }
  const previewDirection = (direction: VisualDirection) => onPreview(applyFullDirection(dna, direction), direction.name)
  const applyDirection = (direction: VisualDirection) => {
    onCommit(applyFullDirection(dna, direction))
    flash(`${direction.name} applied to visual settings. Colors were preserved.`)
  }
  const applyCategory = (direction: VisualDirection, categoryId: DirectionCategoryId, label: string) => {
    onCommit(applyDirectionCategory(dna, direction, categoryId))
    flash(`${label} suggestion applied. Other visual categories were preserved.`)
  }
  const previewScheme = (color: ColorScheme) => {
    const next = previewColorScheme(dna, color)
    onPreview(normalizeDna({ ...next, darkPaletteStrategy: 'Separately curated' }), `${color.name} colors`)
  }
  const applyScheme = (color: ColorScheme) => {
    onCommit(previewColorScheme(dna, color))
    flash(`${color.name} applied to color roles only.`)
  }
  const contextLabel = context.activePacks.length ? context.activePacks.slice(0, 2).join(' + ') : context.appType

  return <section className="visual-suggestions-hub">
    <div className="suggestion-hub-head">
      <div><div className="eyebrow"><Sparkles size={12}/> Visual suggestions · advisory only</div><h2>Get a direction without surrendering control.</h2><p>Blueprint can rank ideas from your app type, active packs, visual posture, and optional Project Context. Nothing below changes structured settings until you explicitly apply it.</p></div>
      <div className="suggestion-context"><span>Ranking context</span><strong>{contextLabel || 'General app'}</strong><small>Project Context may influence ranking only. It cannot create scope or mutate settings.</small></div>
    </div>

    {feedback && <div className="suggestion-feedback"><Check size={14}/>{feedback}</div>}
    {previewDna && <div className="suggestion-preview-note"><Eye size={14}/><div><strong>Temporary preview: {previewLabel}</strong><span>Your saved Visual Studio contract has not changed.</span></div><button onClick={onClearPreview}>Exit preview</button></div>}

    <div className="suggestion-block">
      <div className="suggestion-block-head"><div><span>01</span><div><h3>Suggested visual directions</h3><p>Whole-system ideas across typography, layout, sections, surfaces, controls, imagery, icons, motion, and color behavior. Palette roles stay separate.</p></div></div><b>{Math.min(4,directions.length)} recommended</b></div>
      <div className="direction-suggestion-grid">{directions.slice(0,4).map((direction,index) => <article key={direction.id} className={selectedDirection?.id===direction.id?'selected':''}>
        <div className="direction-rank">{index===0?'Best fit':`#${index+1}`}</div>
        <h4>{direction.name}</h4><p>{direction.description}</p>
        <div className="suggestion-tags">{direction.tags.slice(0,4).map((tag)=><span key={tag}>{tag}</span>)}</div>
        <div className="suggestion-card-actions"><button className="secondary-button compact" onClick={()=>previewDirection(direction)}><Eye size={13}/> Preview</button><button className="text-button" onClick={()=>setSelectedDirectionId(direction.id)}>Inspect <ChevronRight size={13}/></button></div>
      </article>)}</div>
      {selectedDirection && <div className="direction-inspector">
        <div className="direction-inspector-head"><div><span>Inspecting direction</span><h4>{selectedDirection.name}</h4><p>Apply one category, or explicitly apply the entire direction. Palette roles are never changed by this action.</p></div><div className="direction-inspector-actions"><button className="secondary-button" onClick={()=>previewDirection(selectedDirection)}><Eye size={14}/> Preview direction</button><button className="primary-button" onClick={()=>applyDirection(selectedDirection)}>Apply full direction · no palette changes</button></div></div>
        <div className="direction-category-grid">{selectedDirection.categories.map((item)=><article key={item.id}><div><strong>{item.label}</strong><p>{item.summary}</p></div><button onClick={()=>applyCategory(selectedDirection,item.id,item.label)}>Apply {item.label.toLowerCase()}</button></article>)}</div>
        <div className="direction-color-links"><span>Color schemes Blueprint pairs with this direction</span><div>{selectedDirection.colorSchemeIds.map((id)=>{ const color=schemes.find((item)=>item.id===id); return color?<button key={id} onClick={()=>previewScheme(color)}>{color.name}</button>:null })}</div></div>
      </div>}
    </div>

    <div className="suggestion-block color-suggestion-block">
      <div className="suggestion-block-head"><div><span>02</span><div><h3>Color scheme suggestions</h3><p>24 role-based schemes built for application UI—not five decorative swatches. Each includes light and dark roles, accent interaction states, semantic colors, borders, focus, and disabled states.</p></div></div><b>24 schemes</b></div>
      <div className="color-scheme-grid">{visibleSchemes.map((color,index)=><article key={color.id} className={dna.colorSchemeOrigin?.startsWith(color.name)?'applied':''}>
        <div className="color-card-top"><span>{index<4?`Recommended ${index+1}`:'Palette'}</span>{dna.colorSchemeOrigin?.startsWith(color.name)&&<b><Check size={11}/> Applied</b>}</div>
        <div className="color-scheme-swatches" aria-label={`${color.name} core swatches`}>
          {[color.light.background,color.light.surface,color.light.ink,color.light.accent,color.light.positive].map((value,i)=><i key={`${value}-${i}`} style={{background:value}}/>) }
        </div>
        <h4>{color.name}</h4><p>{color.description}</p>
        <div className="suggestion-tags">{color.tags.slice(0,4).map((tag)=><span key={tag}>{tag}</span>)}</div>
        <div className="scheme-role-preview"><span><i style={{background:color.light.background}}/>Light</span><span><i style={{background:color.dark.background}}/>Dark</span><span><i style={{background:color.light.accent}}/>Accent</span></div>
        <div className="suggestion-card-actions"><button className="secondary-button compact" onClick={()=>previewScheme(color)}><Eye size={13}/> Preview colors</button><button className="primary-button compact" onClick={()=>applyScheme(color)}>Apply colors only</button></div>
      </article>)}</div>
      <div className="scheme-footer"><p>Applying a scheme changes <strong>palette roles only</strong>. Theme behavior, typography, layout, sections, surfaces, shape, imagery, icons, motion, and anti-patterns are preserved. If Dark palette strategy is Auto-adapted, the curated dark companion is saved but remains dormant until you choose Separately curated.</p><button className="secondary-button" onClick={()=>setShowAllSchemes(!showAllSchemes)}>{showAllSchemes?'Show recommended only':'Explore all 24 schemes'}</button></div>
    </div>
  </section>
}

function LivePreview({ dna }: { dna:Dna }) {
  const [dark,setDark] = useState(dna.defaultTheme==='Dark' || dna.themeMode==='Dark only')
  useEffect(()=>{
    if(dna.themeMode==='Light only') { setDark(false); return }
    if(dna.themeMode==='Dark only') { setDark(true); return }
    if(dna.themeMode==='System' && dna.respectOsPreference) {
      const media = window.matchMedia?.('(prefers-color-scheme: dark)')
      if (!media) return
      const sync = () => setDark(media.matches)
      sync()
      media.addEventListener?.('change', sync)
      return () => media.removeEventListener?.('change', sync)
    }
    setDark(dna.defaultTheme==='Dark')
  },[dna.themeMode,dna.defaultTheme,dna.respectOsPreference])
  const p = dark?resolvedDarkPalette(dna):dna.palette
  const heading = fontFamilyFor(dna.headingTypography), body = fontFamilyFor(dna.bodyTypography), mono = dna.monospaceUsage==='None'?body:"'DM Mono', monospace"
  const borderWidth = dna.surfaceLanguage==='Borderless'?0:Math.max(.5,dna.borderWeight)
  const border = dna.surfaceLanguage==='Borderless'?'transparent':p.border
  const radius = `${dna.surfaceRadius}px`, controlRadius = dna.buttonShape==='Pill'?'999px':dna.buttonShape==='Rectangular'?'0px':`${dna.buttonRadius}px`
  const shadow = dna.shadowCharacter==='None'?'none':dna.shadowCharacter==='Barely there'?`0 4px 18px ${p.ink}10`:dna.shadowCharacter==='Soft diffuse'?`0 14px 36px ${p.ink}18`:dna.shadowCharacter==='Crisp'?`5px 5px 0 ${p.ink}1f`:`0 20px 55px ${p.ink}33`
  const tonalSection = `color-mix(in srgb, ${p.background}, ${p.surface} ${Math.max(8,dna.sectionContrast)}%)`
  const tonalSurface = `color-mix(in srgb, ${p.background}, ${p.surface} ${Math.max(18,dna.surfaceContrast)}%)`
  const sectionBg = dna.sectionStrategy==='Uniform'?'transparent':dna.sectionStrategy==='Strong separated sections'?p.ink:tonalSection
  const heroBg = dna.heroSeparation==='Strong contrast'?p.ink:dna.heroSeparation==='Subtle contrast'?p.surface:p.background
  const heroInk = dna.heroSeparation==='Strong contrast'?p.background:p.ink
  const contentWidth = `${Math.min(100,72+(dna.contentMaxWidth-720)/35)}%`, pad=Math.max(12,Math.min(34,dna.pageGutters*.45)), sectionPad=Math.max(18,Math.min(48,dna.sectionSpacing*.28))
  const workingDensity = dna.functionalDensity==='Follow global'?dna.density:dna.functionalDensity==='Compact operational'?78:Math.max(46,dna.density)
  const buttonBg = dna.buttonEmphasis==='Filled primary'?p.accent:'transparent', buttonInk=dna.buttonEmphasis==='Filled primary'?p.accentForeground:p.ink
  const stageBg = dna.backgroundTreatment==='Gradient'?`linear-gradient(135deg,${p.background},${p.surface})`:dna.backgroundTreatment==='Texture'?`radial-gradient(${p.border} .8px,transparent .8px),${p.background}`:dna.backgroundTreatment==='Image'?`linear-gradient(120deg,${p.background}dd,${p.surface}aa),repeating-linear-gradient(135deg,${p.accent}22 0 18px,transparent 18px 42px)`:dna.backgroundTreatment==='Glass'?`linear-gradient(145deg,${p.background},${p.accent}18,${p.surface})`:dna.backgroundTreatment==='Mixed'?`radial-gradient(${p.accent}20 1px,transparent 1px),linear-gradient(135deg,${p.background},${p.surface})`:p.background
  const iconProps={size:dna.iconSize,strokeWidth:dna.iconStrokeWeight,fill:dna.iconStyle==='Filled'?'currentColor':'none'}
  return <div className={`dna-preview visual-preview motion-${dna.motionCharacter.toLowerCase()} amount-${dna.motionAmount.toLowerCase()}`} style={{background:stageBg,backgroundSize:dna.backgroundTreatment==='Texture'?'9px 9px':undefined,color:p.ink,fontFamily:body,['--preview-duration' as string]:`${dna.motionAmount==='None'?0:dna.motionDuration}ms`}}>
    <div className="preview-browser" style={{borderColor:p.border}}><div><i/><i/><i/></div><span style={{fontFamily:mono,color:p.muted}}>VISUAL STUDIO / LIVE</span>{dna.themeMode==='Light + Dark toggle'||dna.themeMode==='System'?<button onClick={()=>setDark(!dark)} style={{color:p.ink,borderColor:p.border}}>{dark?'LIGHT':'DARK'}</button>:<b style={{color:p.muted}}>{dark?'DARK':'LIGHT'}</b>}</div>
    <div className="visual-app-shell" style={{width:contentWidth,padding:`0 ${pad}px ${pad}px`,margin:'0 auto'}}>
      <nav className="visual-app-nav" style={{minHeight:Math.max(48,dna.inputHeight+8),borderColor:p.border}}><div className="preview-logo" style={{background:dna.accentUsage==='Rare'?p.ink:p.accent,borderRadius:dna.shapeLanguage==='Sharp'?0:dna.shapeLanguage==='Rounded'?12:6}}/><span style={{fontWeight:dna.uiWeight}}>Northstar</span><div className="preview-nav-actions"><Search {...iconProps}/><button style={{borderRadius:controlRadius,borderColor:p.border,color:p.ink,fontWeight:dna.uiWeight}}>New item</button></div></nav><div key={`${dna.motionCharacter}-${dna.motionAmount}-${dna.motionDuration}`} className="preview-motion-sample" style={{color:p.muted}}><span>MOTION · {dna.motionCharacter}</span><b><i style={{background:p.accent}}/></b></div>
      <section className="visual-hero" style={{background:heroBg,color:heroInk,padding:`${sectionPad}px ${Math.max(14,pad*.65)}px`,borderRadius:dna.heroSeparation==='Integrated'||dna.heroSeparation==='Full bleed'?0:radius,marginInline:dna.heroSeparation==='Full bleed'?-pad:0,textAlign:dna.alignmentTendency==='Centered moments'?'center':'left'}}><small style={{fontFamily:mono,color:dna.heroSeparation==='Strong contrast'?heroInk:p.muted}}>{dna.personality}</small><h2 style={{fontFamily:heading,fontWeight:dna.headingWeight,fontSize:`${Math.max(28,37*dna.headingScale/110)}px`,letterSpacing:`${dna.letterSpacing/100}em`,maxWidth:`${dna.textMeasure/1.7}ch`,marginInline:dna.alignmentTendency==='Centered moments'?'auto':undefined}}>Build with a point of view.</h2><p style={{fontSize:`${Math.max(10,dna.bodyFontSize*.72)}px`,fontWeight:dna.bodyWeight,lineHeight:dna.lineHeight/100,maxWidth:`${dna.textMeasure}ch`,marginInline:dna.alignmentTendency==='Centered moments'?'auto':undefined}}>A live specimen for hierarchy, containment, controls, section rhythm, palette, and motion.</p></section>
      <section className="preview-section" style={{background:sectionBg,color:dna.sectionStrategy==='Strong separated sections'?p.background:p.ink,padding:`${sectionPad*.65}px ${dna.sectionStrategy==='Uniform'?0:Math.max(12,pad*.55)}px`,borderRadius:dna.sectionStrategy==='Tonal layering'||dna.sectionStrategy==='Card-within-section'?radius:0,borderLeft:dna.sectionStrategy==='Editorial blocks'?`3px solid ${p.accent}`:undefined}}><div className="preview-section-head"><div><small style={{fontFamily:mono,color:p.muted}}>TODAY</small><strong style={{fontFamily:heading}}>Operations</strong></div><button style={{background:buttonBg,color:buttonInk,borderRadius:controlRadius,border:`${borderWidth||1}px solid ${dna.buttonEmphasis==='Filled primary'?p.accent:p.border}`,fontWeight:dna.uiWeight}}>Review queue <ArrowRight size={13}/></button></div><div className="preview-metrics" style={{gap:Math.max(8,23-workingDensity*.14)}}>{[['24','Active'],['7','Queue'],['89%','Rate']].map(([n,l])=><div key={l} style={{background:dna.surfaceLanguage==='Tonal surfaces'||dna.cardWeight>55?tonalSurface:'transparent',border:`${borderWidth}px solid ${border}`,borderRadius:radius,boxShadow:dna.surfaceLanguage.includes('elevation')?shadow:'none'}}><span style={{fontFamily:mono,color:p.muted}}>{l}</span><strong style={{fontFamily:heading}}>{n}</strong></div>)}</div></section>
      <section className="preview-section preview-worklist"><div className="preview-section-head"><div><small style={{fontFamily:mono,color:p.muted}}>WORKLIST</small><strong style={{fontFamily:heading}}>Recently updated</strong></div><div className="preview-icon-pair"><Gauge {...iconProps}/><Grid3X3 {...iconProps}/></div></div><div className="preview-table" style={{border:`${borderWidth}px solid ${border}`,borderRadius:radius,boxShadow:dna.surfaceLanguage.includes('elevation')?shadow:'none',background:dna.surfaceLanguage==='Tonal surfaces'?tonalSurface:'transparent'}}>{['Patient intake','Booking review','Inventory count'].map((label,index)=><div key={label} style={{minHeight:Math.max(38,56-workingDensity*.17),borderColor:p.border}}><i style={{background:index===1&&dna.accentUsage!=='Rare'?p.accent:p.surface,borderRadius:dna.shapeLanguage==='Rounded'?'50%':dna.controlRadius}}/><span><strong>{label}</strong><small style={{color:p.muted}}>Updated {index+2}m ago</small></span><b style={{color:p.muted}}>Open</b></div>)}</div></section>
      <section className="preview-form" style={{background:dna.sectionStrategy==='Strong separated sections'?p.ink:dna.sectionStrategy==='Alternating subtle sections'?p.surface:'transparent',color:dna.sectionStrategy==='Strong separated sections'?p.background:p.ink,padding:`${sectionPad*.55}px ${dna.sectionStrategy==='Uniform'?0:Math.max(12,pad*.55)}px`}}><div><small style={{fontFamily:mono,color:p.muted}}>QUICK ACTION</small><strong style={{fontFamily:heading}}>Create a record</strong></div><div className="preview-input" style={{height:dna.inputHeight,background:dna.inputAppearance==='Filled'||dna.inputAppearance==='Borderless / tonal'?p.surface:'transparent',border:dna.inputAppearance==='Borderless / tonal'||dna.inputAppearance==='Underline'?'0':`1px solid ${p.border}`,borderBottom:dna.inputAppearance==='Underline'?`1px solid ${p.border}`:undefined,borderRadius:dna.inputAppearance==='Underline'?0:dna.controlRadius}}><span style={{color:p.muted}}>Search or enter a name…</span></div></section>
      {dna.imageryMode!=='None' && <section className={`preview-imagery imagery-${dna.imagePresentation.toLowerCase().replace(/\s/g,'-')}`} style={{borderRadius:dna.imagePresentation==='Framed'?radius:0,filter:dna.imageTreatment==='Monochrome'?'grayscale(1)':dna.imageTreatment==='Muted'?'saturate(.45)':dna.imageTreatment==='High contrast'?'contrast(1.35)':'none',background:`linear-gradient(135deg,${p.accent}55,${p.surface}),repeating-linear-gradient(45deg,transparent,transparent 8px,${p.ink}0a 8px,${p.ink}0a 9px)`}}><span style={{fontFamily:mono}}>{dna.imageryMode.toUpperCase()} · {dna.imageCharacter}</span></section>}
    </div>
  </div>
}
