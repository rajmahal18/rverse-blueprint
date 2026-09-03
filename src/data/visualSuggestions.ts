import { normalizeDna, type Dna, type PaletteRoles } from './visualDna'

export type SuggestionContext = {
  appType: string
  activePacks: string[]
  projectContext: string
  dna: Dna
}

export type ColorScheme = {
  id: string
  name: string
  description: string
  tags: string[]
  light: PaletteRoles
  dark: PaletteRoles
}

export type DirectionCategoryId = 'theme' | 'typography' | 'layout' | 'sections' | 'surfaces' | 'controls' | 'imagery' | 'icons' | 'motion' | 'colorBehavior'
export type DirectionCategory = {
  id: DirectionCategoryId
  label: string
  summary: string
  patch: Partial<Dna>
}
export type VisualDirection = {
  id: string
  name: string
  description: string
  tags: string[]
  categories: DirectionCategory[]
  colorSchemeIds: string[]
}

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '')
  return [Number.parseInt(clean.slice(0, 2), 16), Number.parseInt(clean.slice(2, 4), 16), Number.parseInt(clean.slice(4, 6), 16)]
}
const rgbToHex = (channels: number[]) => `#${channels.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('')}`
const mix = (left: string, right: string, amount: number) => {
  const a = hexToRgb(left), b = hexToRgb(right)
  return rgbToHex(a.map((channel, index) => channel + (b[index] - channel) * amount))
}

type PaletteCore = {
  background: string
  ink: string
  accent: string
  accentForeground: string
  surface?: string
  muted?: string
  border?: string
  focus?: string
  positive?: string
  destructive?: string
  warning?: string
  informational?: string
  disabled?: string
  accentHover?: string
  accentActive?: string
}

const uiPalette = (core: PaletteCore, dark = false): PaletteRoles => {
  const semantic = dark
    ? { positive: '#4ade80', destructive: '#f87171', warning: '#fbbf24', informational: '#60a5fa' }
    : { positive: '#15803d', destructive: '#b91c1c', warning: '#a16207', informational: '#1d4ed8' }
  const hoverTarget = core.accentForeground.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
  return {
    ink: core.ink,
    background: core.background,
    accent: core.accent,
    accentForeground: core.accentForeground,
    accentHover: core.accentHover ?? mix(core.accent, hoverTarget, 0.10),
    accentActive: core.accentActive ?? mix(core.accent, hoverTarget, 0.18),
    surface: core.surface ?? mix(core.background, core.ink, dark ? 0.08 : 0.035),
    muted: core.muted ?? mix(core.ink, core.background, dark ? 0.34 : 0.36),
    positive: core.positive ?? semantic.positive,
    destructive: core.destructive ?? semantic.destructive,
    warning: core.warning ?? semantic.warning,
    informational: core.informational ?? semantic.informational,
    border: core.border ?? mix(core.ink, core.background, dark ? 0.72 : 0.74),
    focus: core.focus ?? core.accent,
    disabled: core.disabled ?? mix(core.ink, core.background, dark ? 0.58 : 0.60),
  }
}

const scheme = (
  id: string,
  name: string,
  description: string,
  tags: string[],
  light: PaletteCore,
  dark: PaletteCore,
): ColorScheme => ({ id, name, description, tags, light: uiPalette(light), dark: uiPalette(dark, true) })

// Curated for application UI rather than decorative palette boards. Each scheme has
// explicit background/surface/text/accent roles plus a dark companion and semantic roles.
// The pairings follow the same general principle used by established UI systems: tinted
// neutrals near the accent family, role-based tokens, and dedicated light/dark values.
export const colorSchemes: ColorScheme[] = [
  scheme('graphite-blue','Graphite Blue','Neutral graphite with a dependable blue accent. Versatile for product, admin, and public-facing applications.',['general','professional','saas','operations','product'],
    {background:'#f8fafc',ink:'#0f172a',accent:'#2563eb',accentForeground:'#ffffff',surface:'#f1f5f9',muted:'#475569',border:'#b8c1cc'},
    {background:'#0b1220',ink:'#f8fafc',accent:'#60a5fa',accentForeground:'#0b1220',surface:'#151d2c',muted:'#aeb8c6',border:'#3b4657'}),
  scheme('slate-indigo','Slate Indigo','Cool slate neutrals with indigo interaction color. Focused, disciplined, and familiar without looking default.',['saas','productivity','professional','dashboard','finance'],
    {background:'#f8fafc',ink:'#0f172a',accent:'#4f46e5',accentForeground:'#ffffff',surface:'#f1f3f9',muted:'#4b5563',border:'#bcc2cd'},
    {background:'#0d1020',ink:'#f8fafc',accent:'#818cf8',accentForeground:'#111827',surface:'#171a2c',muted:'#b0b4c4',border:'#41455a'}),
  scheme('slate-cyan','Slate Cyan','Cool neutral UI with cyan-teal accents for technical clarity and data-forward products.',['technical','data','developer','dashboard','operations'],
    {background:'#f8fafc',ink:'#0f172a',accent:'#0e7490',accentForeground:'#ffffff',surface:'#f0f6f7',muted:'#475569',border:'#b9c5c9'},
    {background:'#071a20',ink:'#ecfeff',accent:'#22d3ee',accentForeground:'#083344',surface:'#10262c',muted:'#a7c0c5',border:'#345159'}),
  scheme('midnight-sky','Midnight Sky','Navy-tinted structure with sky blue actions. Crisp for cloud tools, portals, and contemporary tech.',['technology','portal','saas','public','professional'],
    {background:'#f5f9ff',ink:'#0b1220',accent:'#0369a1',accentForeground:'#ffffff',surface:'#edf4fb',muted:'#46566b',border:'#b7c6d6'},
    {background:'#071827',ink:'#f0f9ff',accent:'#38bdf8',accentForeground:'#082f49',surface:'#112536',muted:'#abc2d3',border:'#385367'}),
  scheme('cobalt-paper','Cobalt Paper','Paper-like neutral surfaces with confident cobalt actions. Strong for institutional and content-heavy websites.',['institutional','government','public','marketing','professional'],
    {background:'#fafaf9',ink:'#172554',accent:'#1d4ed8',accentForeground:'#ffffff',surface:'#f1f3f8',muted:'#52607f',border:'#c0c5d1'},
    {background:'#0b1330',ink:'#eff6ff',accent:'#60a5fa',accentForeground:'#0f172a',surface:'#151e3a',muted:'#aeb9d0',border:'#404a66'}),
  scheme('mauve-violet','Mauve Violet','Purple-tinted neutrals with violet interaction color. Expressive but still disciplined enough for real application UI.',['creative','ai','consumer','saas','portfolio'],
    {background:'#fcf8ff',ink:'#2e1065',accent:'#7c3aed',accentForeground:'#ffffff',surface:'#f5eefb',muted:'#67527f',border:'#c9bfd2'},
    {background:'#170b2d',ink:'#faf5ff',accent:'#a78bfa',accentForeground:'#2e1065',surface:'#221638',muted:'#bcb0ca',border:'#4b3f5e'}),
  scheme('mauve-purple','Mauve Purple','Warm mauve structure with a stronger purple accent for creative consumer and AI-assisted products.',['creative','consumer','ai','community','marketing'],
    {background:'#fcf9ff',ink:'#3b0764',accent:'#9333ea',accentForeground:'#ffffff',surface:'#f5effa',muted:'#6b4e7b',border:'#ccbed2'},
    {background:'#1d0a2e',ink:'#faf5ff',accent:'#c084fc',accentForeground:'#3b0764',surface:'#28153a',muted:'#c2b1cc',border:'#523e61'}),
  scheme('mauve-plum','Mauve Plum','Editorial plum over soft mauve surfaces. Suits premium content, beauty, fashion, and expressive commerce.',['premium','editorial','commerce','fashion','creative'],
    {background:'#fff8fc',ink:'#3b0a45',accent:'#a21caf',accentForeground:'#ffffff',surface:'#f8edf5',muted:'#704f72',border:'#cfbfcc'},
    {background:'#220b25',ink:'#fdf4ff',accent:'#e879f9',accentForeground:'#4a044e',surface:'#2d1630',muted:'#c8b2c8',border:'#5b405d'}),
  scheme('mauve-crimson','Mauve Crimson','Warm neutral pink-mauve structure with controlled crimson actions. Bold without turning every surface red.',['commerce','fashion','editorial','consumer','marketing'],
    {background:'#fff8fa',ink:'#4c0519',accent:'#be123c',accentForeground:'#ffffff',surface:'#f8edf0',muted:'#79515d',border:'#d1bdc3'},
    {background:'#24070f',ink:'#fff1f2',accent:'#fb7185',accentForeground:'#4c0519',surface:'#30131a',muted:'#cab0b7',border:'#604047'}),
  scheme('sage-teal','Sage Teal','Sage-tinted neutrals with teal actions. Calm, trustworthy, and particularly useful for service workflows.',['health','booking','service','wellness','finance'],
    {background:'#f6faf8',ink:'#0f2f2a',accent:'#0f766e',accentForeground:'#ffffff',surface:'#edf4f0',muted:'#496a63',border:'#b7c9c2'},
    {background:'#071d1a',ink:'#f0fdfa',accent:'#2dd4bf',accentForeground:'#042f2e',surface:'#112925',muted:'#abc7c1',border:'#385650'}),
  scheme('sage-jade','Sage Jade','Green-tinted neutral system with jade accents. Grounded for finance, operations, health, and sustainability products.',['finance','health','operations','sustainability','professional'],
    {background:'#f6fbf8',ink:'#102c24',accent:'#047857',accentForeground:'#ffffff',surface:'#ecf5f0',muted:'#49675e',border:'#b8c9c2'},
    {background:'#061c15',ink:'#ecfdf5',accent:'#34d399',accentForeground:'#022c22',surface:'#102820',muted:'#aac7bc',border:'#36564b'}),
  scheme('sage-green','Sage Green','Reserved green over quiet sage surfaces. Familiar enough for operational software but less sterile than gray-blue.',['operations','inventory','sustainability','health','government'],
    {background:'#f8fbf7',ink:'#142d1f',accent:'#15803d',accentForeground:'#ffffff',surface:'#eef5ed',muted:'#4c6653',border:'#bccabc'},
    {background:'#071d10',ink:'#f0fdf4',accent:'#4ade80',accentForeground:'#052e16',surface:'#11291a',muted:'#abc8b2',border:'#39573f'}),
  scheme('sage-mint','Sage Mint','Fresh mint-teal accent with restrained sage neutrals. Light, clean, and useful for friendly service products.',['consumer','service','wellness','booking','light'],
    {background:'#f6fbf9',ink:'#12342e',accent:'#0f766e',accentForeground:'#ffffff',surface:'#ecf6f2',muted:'#4d6d66',border:'#b9ccc5'},
    {background:'#071e1b',ink:'#f0fdfa',accent:'#5eead4',accentForeground:'#042f2e',surface:'#112b27',muted:'#accbc4',border:'#395a53'}),
  scheme('olive-lime','Olive Lime','Olive neutrals with a vivid but accessible lime-green action color. Energetic for sports and active products.',['sports','fitness','event','automotive','energy'],
    {background:'#fafbef',ink:'#26310d',accent:'#4d7c0f',accentForeground:'#ffffff',surface:'#f1f4e5',muted:'#5e6843',border:'#c7cbb5'},
    {background:'#151c07',ink:'#f7fee7',accent:'#a3e635',accentForeground:'#1a2e05',surface:'#20290f',muted:'#c1c9a9',border:'#4d5737'}),
  scheme('olive-grass','Olive Grass','Natural olive base with grass green actions. Productive and grounded for outdoor, logistics, and utility interfaces.',['outdoor','logistics','operations','utility','sustainability'],
    {background:'#f8faf3',ink:'#1f2e15',accent:'#3f7d20',accentForeground:'#ffffff',surface:'#f0f4e9',muted:'#58684d',border:'#c2cbb9'},
    {background:'#111a08',ink:'#f7fee7',accent:'#84cc16',accentForeground:'#1a2e05',surface:'#1c260f',muted:'#bdc9aa',border:'#46543a'}),
  scheme('sand-amber','Sand Amber','Warm sand neutrals with amber actions. Strong for commerce, hospitality, and approachable business sites.',['commerce','hospitality','retail','food','marketing'],
    {background:'#fffbea',ink:'#3d2600',accent:'#b45309',accentForeground:'#ffffff',surface:'#f8f1dd',muted:'#725d3c',border:'#d1c5a9'},
    {background:'#241602',ink:'#fffbea',accent:'#fbbf24',accentForeground:'#451a03',surface:'#30220d',muted:'#d1bea0',border:'#625137'}),
  scheme('sand-orange','Sand Orange','Warm sand with controlled orange. High-energy enough for retail and service calls to action without becoming neon.',['retail','commerce','service','automotive','consumer'],
    {background:'#fff7ed',ink:'#431407',accent:'#c2410c',accentForeground:'#ffffff',surface:'#f8ede1',muted:'#795447',border:'#d3bfb3'},
    {background:'#260c03',ink:'#fff7ed',accent:'#fb923c',accentForeground:'#431407',surface:'#32180f',muted:'#d0b4a6',border:'#65463a'}),
  scheme('sand-bronze','Sand Bronze','Muted bronze on warm sand. A tactile, heritage-leaning system for premium retail and established brands.',['premium','heritage','retail','hospitality','editorial'],
    {background:'#fbf7f3',ink:'#3b251c',accent:'#8a4b22',accentForeground:'#ffffff',surface:'#f3ebe4',muted:'#705c52',border:'#cbbcb3'},
    {background:'#23140d',ink:'#fff7ed',accent:'#d98255',accentForeground:'#32150a',surface:'#2f2019',muted:'#ceb8aa',border:'#5f4d43'}),
  scheme('warm-terracotta','Warm Terracotta','Ivory surfaces with terracotta actions. Human, editorial, and especially effective for lifestyle or local-business sites.',['lifestyle','local-business','editorial','commerce','hospitality'],
    {background:'#fff8f3',ink:'#3a1f1a',accent:'#b64a31',accentForeground:'#ffffff',surface:'#f7ede7',muted:'#715750',border:'#cebdb6'},
    {background:'#25110d',ink:'#fff7ed',accent:'#fb8a6a',accentForeground:'#3a1f1a',surface:'#311d18',muted:'#cfb5ab',border:'#62493f'}),
  scheme('automotive-red','Automotive Red','Graphite-neutral foundation with disciplined performance red. Built for automotive, sports, and bold product presentation.',['automotive','sports','performance','commerce','product'],
    {background:'#fafafa',ink:'#191919',accent:'#b91c1c',accentForeground:'#ffffff',surface:'#f1f1f1',muted:'#595959',border:'#c2c2c2'},
    {background:'#170708',ink:'#fff5f5',accent:'#f87171',accentForeground:'#450a0a',surface:'#251314',muted:'#cbb3b4',border:'#5b4142'}),
  scheme('onyx-acid','Onyx Acid','Near-monochrome structure with acid lime as a deliberate signal color. Distinctive for motorsport and experimental technical products.',['automotive','motorsport','sports','experimental','technical'],
    {background:'#fafaf7',ink:'#111111',accent:'#a3e635',accentForeground:'#111111',surface:'#f0f1e9',muted:'#53534f',border:'#c1c2ba'},
    {background:'#0e100b',ink:'#fafaf7',accent:'#bef264',accentForeground:'#111111',surface:'#1a1d15',muted:'#bdbfb7',border:'#45483f'}),
  scheme('monochrome-signal','Monochrome Signal','Black, white, and a single signal-red action color. Excellent when typography and photography should do most of the visual work.',['editorial','automotive','marketing','minimal','sports'],
    {background:'#fafafa',ink:'#111111',accent:'#b91c1c',accentForeground:'#ffffff',surface:'#f0f0f0',muted:'#555555',border:'#c1c1c1'},
    {background:'#111111',ink:'#fafafa',accent:'#f87171',accentForeground:'#450a0a',surface:'#1d1d1d',muted:'#bdbdbd',border:'#484848'}),
  scheme('pure-monochrome','Pure Monochrome','A strict black-and-white system with neutral semantics. Ideal when hierarchy, imagery, and typography should carry the identity.',['minimal','premium','editorial','portfolio','utility'],
    {background:'#fafaf8',ink:'#111111',accent:'#111111',accentForeground:'#ffffff',surface:'#f0f0ed',muted:'#555552',border:'#c1c1bd',focus:'#111111'},
    {background:'#111111',ink:'#f5f5f5',accent:'#f5f5f5',accentForeground:'#111111',surface:'#1d1d1d',muted:'#bababa',border:'#484848',focus:'#f5f5f5'}),
  scheme('navy-gold','Navy Gold','Deep navy structure with restrained old-gold actions. Premium and credible for institutional, luxury, or heritage brands.',['premium','institutional','finance','heritage','luxury'],
    {background:'#faf8f2',ink:'#0f1e32',accent:'#7a5812',accentForeground:'#ffffff',surface:'#f1eee5',muted:'#526071',border:'#c2c2bc'},
    {background:'#09121e',ink:'#fffbef',accent:'#d4a72c',accentForeground:'#211705',surface:'#141e29',muted:'#bdc1c2',border:'#414a54'}),
]

const category = (id: DirectionCategoryId, label: string, summary: string, patch: Partial<Dna>): DirectionCategory => ({ id, label, summary, patch })

export const visualDirections: VisualDirection[] = [
  {
    id:'performance-editorial', name:'Performance Editorial', description:'Product-first, asymmetric, sharp, and photographic. Strong enough for automotive or sports without collapsing into a generic neon dashboard.', tags:['automotive','sports','performance','marketing','product','commerce'], colorSchemeIds:['automotive-red','onyx-acid','monochrome-signal'],
    categories:[
      category('theme','Theme','Light/dark capable with a dark-forward fallback.',{themeMode:'Light + Dark toggle',defaultTheme:'Dark',respectOsPreference:true,rememberThemePreference:true}),
      category('typography','Typography','High-contrast display headings with a restrained utility body.',{typographyCharacter:'High-contrast serif',headingTypography:'High-contrast serif',bodyTypography:'Neo-grotesk',typography:'High-contrast serif + neo-grotesk',bodyFontSize:15,headingScale:132,headingWeight:750,bodyWeight:450,textMeasure:60}),
      category('layout','Layout','Very spacious and deliberately asymmetric.',{density:24,whitespacePriority:'Very spacious',contentMaxWidth:1480,pageGutters:48,sectionSpacing:120,gridCharacter:'Asymmetric',alignmentTendency:'Deliberately asymmetric',responsiveBehavior:'Mobile composition changes'}),
      category('sections','Sections','Strong section separation with full-bleed hero moments.',{sectionStrategy:'Strong separated sections',sectionContrast:58,backgroundTreatment:'Tint',sectionDividers:'Whitespace only',heroSeparation:'Full bleed',ctaTreatment:'Contrast band',footerContrast:'Inverse',variedSections:true}),
      category('surfaces','Surfaces','Rules and sparse containment instead of card stacks.',{surfaceLanguage:'Hairline borders',cardWeight:18,borderWeight:1,shadowCharacter:'None',elevation:0,surfaceContrast:18,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Sharp, rectangular controls with visible structure.',{shapeLanguage:'Sharp',radius:4,surfaceRadius:2,controlRadius:2,buttonRadius:2,pillUsage:'Tags only',buttonShape:'Rectangular',buttonWeight:'Bold',buttonEmphasis:'Filled primary',inputAppearance:'Outlined',inputHeight:42,formDensity:'Comfortable',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','Full-bleed high-contrast commercial product imagery.',{imageryMode:'Photography',imageCharacter:'Polished commercial',imageTreatment:'High contrast',imagePresentation:'Full bleed'}),
      category('icons','Iconography','Geometric outline icons used as support, not decoration.',{iconWeight:42,iconStyle:'Outline',iconGeometry:'Geometric',iconStrokeWeight:1.75,iconSize:19,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Moderate snappy motion reserved for product and section transitions.',{motion:48,motionAmount:'Moderate',motionCharacter:'Snappy',pageTransition:'Reveal',scrollAnimation:'Key sections only',hoverResponse:'Responsive',motionDuration:190,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Use the chosen accent prominently but selectively.',{accentUsage:'Prominent'}),
    ],
  },
  {
    id:'premium-product-catalog', name:'Premium Product Catalog', description:'Quiet luxury meets practical commerce: large product media, strong type hierarchy, generous rhythm, and minimal UI chrome.', tags:['commerce','retail','product','premium','marketing','catalog'], colorSchemeIds:['pure-monochrome','navy-gold','sand-bronze'],
    categories:[
      category('theme','Theme','Light-led with an optional dark companion.',{themeMode:'Light + Dark toggle',defaultTheme:'Light',respectOsPreference:true,rememberThemePreference:true}),
      category('typography','Typography','Editorial headings paired with a highly readable sans body.',{typographyCharacter:'Editorial serif',headingTypography:'Editorial serif',bodyTypography:'Humanist sans',typography:'Editorial serif + humanist sans',bodyFontSize:16,headingScale:124,headingWeight:600,bodyWeight:450,lineHeight:160,textMeasure:64}),
      category('layout','Layout','Generous whitespace and content-led grids.',{density:28,whitespacePriority:'Very spacious',contentMaxWidth:1360,pageGutters:48,sectionSpacing:112,gridCharacter:'Content-led',alignmentTendency:'Mostly left',responsiveBehavior:'Mobile composition changes'}),
      category('sections','Sections','Editorial blocks with subtle contrast instead of repeated cards.',{sectionStrategy:'Editorial blocks',sectionContrast:24,backgroundTreatment:'Tint',sectionDividers:'Hairline',heroSeparation:'Integrated',ctaTreatment:'Minimal',footerContrast:'Strong',variedSections:true}),
      category('surfaces','Surfaces','Mostly borderless surfaces; containment only where needed.',{surfaceLanguage:'Borderless',cardWeight:12,borderWeight:1,shadowCharacter:'None',elevation:0,surfaceContrast:16,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Quiet, precise controls that stay out of the product photography.',{shapeLanguage:'Soft',radius:18,surfaceRadius:8,controlRadius:7,buttonRadius:7,pillUsage:'Tags only',buttonShape:'Soft rectangle',buttonWeight:'Balanced',buttonEmphasis:'Filled primary',inputAppearance:'Underline',inputHeight:44,formDensity:'Spacious',controlBorderStyle:'Hairline',hoverCharacter:'Underline / rule'}),
      category('imagery','Imagery','Large polished photography, mostly full-bleed or carefully cropped.',{imageryMode:'Photography',imageCharacter:'Polished commercial',imageTreatment:'Full color',imagePresentation:'Full bleed'}),
      category('icons','Iconography','Low-emphasis neutral outline icons.',{iconWeight:28,iconStyle:'Outline',iconGeometry:'Neutral',iconStrokeWeight:1.5,iconSize:18,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Low smooth motion; product hierarchy should feel calm.',{motion:24,motionAmount:'Low',motionCharacter:'Smooth',pageTransition:'Fade',scrollAnimation:'Key sections only',hoverResponse:'Subtle',motionDuration:220,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Keep accent focused on conversion and selection states.',{accentUsage:'Focused'}),
    ],
  },
  {
    id:'technical-control', name:'Technical Control', description:'Dense but legible, border-driven, and precise. Good for systems where operational information matters more than decorative composition.', tags:['technical','operations','inventory','dashboard','admin','saas','data'], colorSchemeIds:['slate-cyan','graphite-blue','slate-indigo'],
    categories:[
      category('theme','Theme','System-aware light/dark behavior.',{themeMode:'System',defaultTheme:'Light',respectOsPreference:true}),
      category('typography','Typography','Neo-grotesk hierarchy with monospace reserved for identifiers and data.',{typographyCharacter:'Neo-grotesk',headingTypography:'Neo-grotesk',bodyTypography:'Neo-grotesk',typography:'Neo-grotesk + mono data',monospaceUsage:'Data / code',bodyFontSize:14,headingScale:94,headingWeight:650,bodyWeight:450,lineHeight:145,textMeasure:76}),
      category('layout','Layout','Compact strict grid and wide data canvas.',{density:76,whitespacePriority:'Compact',contentMaxWidth:1560,pageGutters:22,sectionSpacing:48,gridCharacter:'Strict grid',alignmentTendency:'Mostly left',responsiveBehavior:'Preserve density'}),
      category('sections','Sections','Uniform page structure with explicit rules.',{sectionStrategy:'Uniform',sectionContrast:12,backgroundTreatment:'Solid',sectionDividers:'Hairline',heroSeparation:'Integrated',ctaTreatment:'Inline',footerContrast:'Same as page',variedSections:false}),
      category('surfaces','Surfaces','Hairline containment with almost no elevation.',{surfaceLanguage:'Hairline borders',cardWeight:30,borderWeight:1,shadowCharacter:'None',elevation:0,surfaceContrast:16,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Compact rectangular controls with defined borders.',{shapeLanguage:'Sharp',radius:6,surfaceRadius:3,controlRadius:3,buttonRadius:3,pillUsage:'Tags only',buttonShape:'Rectangular',buttonWeight:'Balanced',buttonEmphasis:'Mixed hierarchy',inputAppearance:'Outlined',inputHeight:38,formDensity:'Compact',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','Product screenshots or technical captures only when they explain function.',{imageryMode:'Product screenshots',imageCharacter:'Technical',imageTreatment:'Full color',imagePresentation:'Framed'}),
      category('icons','Iconography','Consistent geometric outline icons.',{iconWeight:52,iconStyle:'Outline',iconGeometry:'Geometric',iconStrokeWeight:1.75,iconSize:18,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Low snappy feedback; never delay an operational action.',{motion:16,motionAmount:'Low',motionCharacter:'Snappy',pageTransition:'None',scrollAnimation:'None',hoverResponse:'Subtle',motionDuration:140,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Use accent only for action, focus, and important state.',{accentUsage:'Focused'}),
    ],
  },
  {
    id:'civic-clarity', name:'Civic Clarity', description:'Institutional without looking dated: humanist typography, restrained geometry, clear sections, and conservative motion.', tags:['government','institutional','public','civic','professional'], colorSchemeIds:['cobalt-paper','graphite-blue','navy-gold'],
    categories:[
      category('theme','Theme','Light-led with system-aware dark support.',{themeMode:'Light + Dark toggle',defaultTheme:'Light',respectOsPreference:true,rememberThemePreference:true}),
      category('typography','Typography','Humanist sans for legibility and approachable authority.',{typographyCharacter:'Humanist sans',headingTypography:'Humanist sans',bodyTypography:'Humanist sans',typography:'Humanist sans',bodyFontSize:16,headingScale:102,headingWeight:700,bodyWeight:450,lineHeight:160,textMeasure:70}),
      category('layout','Layout','Balanced spacing and stable grid behavior.',{density:48,whitespacePriority:'Balanced',contentMaxWidth:1240,pageGutters:40,sectionSpacing:80,gridCharacter:'Flexible grid',alignmentTendency:'Mostly left',responsiveBehavior:'Reflow naturally'}),
      category('sections','Sections','Subtle alternating sections and explicit hierarchy.',{sectionStrategy:'Alternating subtle sections',sectionContrast:24,backgroundTreatment:'Tint',sectionDividers:'Whitespace only',heroSeparation:'Subtle contrast',ctaTreatment:'Contained',footerContrast:'Strong',variedSections:false}),
      category('surfaces','Surfaces','Hairline borders and restrained tonal surfaces.',{surfaceLanguage:'Hairline borders',cardWeight:30,borderWeight:1,shadowCharacter:'Barely there',elevation:8,surfaceContrast:20,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Soft rectangles with strong visible boundaries.',{shapeLanguage:'Soft',radius:18,surfaceRadius:9,controlRadius:7,buttonRadius:7,pillUsage:'Tags only',buttonShape:'Soft rectangle',buttonWeight:'Balanced',buttonEmphasis:'Filled primary',inputAppearance:'Outlined',inputHeight:44,formDensity:'Comfortable',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','Documentary or contextual imagery rather than decorative stock.',{imageryMode:'Photography',imageCharacter:'Documentary',imageTreatment:'Muted',imagePresentation:'Framed'}),
      category('icons','Iconography','Neutral outline icons with labels on unfamiliar actions.',{iconWeight:38,iconStyle:'Outline',iconGeometry:'Neutral',iconStrokeWeight:1.75,iconSize:19,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Low smooth motion with strong reduced-motion behavior.',{motion:12,motionAmount:'Low',motionCharacter:'Smooth',pageTransition:'Fade',scrollAnimation:'None',hoverResponse:'Subtle',motionDuration:180,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Keep accent focused and semantic colors meaningful.',{accentUsage:'Focused'}),
    ],
  },
  {
    id:'calm-service', name:'Calm Service', description:'Clear, reassuring, and mobile-friendly for booking, healthcare, support, and other task-oriented service experiences.', tags:['booking','clinic','health','service','support','mobile'], colorSchemeIds:['sage-teal','sage-jade','sage-mint'],
    categories:[
      category('theme','Theme','System-aware light/dark behavior with a light fallback.',{themeMode:'System',defaultTheme:'Light',respectOsPreference:true}),
      category('typography','Typography','Humanist sans with generous readable body text.',{typographyCharacter:'Humanist sans',headingTypography:'Humanist sans',bodyTypography:'Humanist sans',typography:'Humanist sans',bodyFontSize:17,headingScale:104,headingWeight:700,bodyWeight:450,lineHeight:165,textMeasure:66}),
      category('layout','Layout','Generous, obvious task hierarchy with mobile composition changes.',{density:30,whitespacePriority:'Generous',contentMaxWidth:1120,pageGutters:36,sectionSpacing:92,gridCharacter:'Content-led',alignmentTendency:'Mostly left',responsiveBehavior:'Mobile composition changes',mobileFirst:true}),
      category('sections','Sections','Tonal layering that separates steps without fragmenting the workflow.',{sectionStrategy:'Tonal layering',sectionContrast:22,backgroundTreatment:'Tint',sectionDividers:'Whitespace only',heroSeparation:'Subtle contrast',ctaTreatment:'Contained',footerContrast:'Subtle',variedSections:false}),
      category('surfaces','Surfaces','Tonal surfaces with very light elevation.',{surfaceLanguage:'Tonal surfaces',cardWeight:42,borderWeight:1,shadowCharacter:'Barely there',elevation:8,surfaceContrast:24,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Large touch-friendly soft controls.',{shapeLanguage:'Soft',radius:34,surfaceRadius:14,controlRadius:12,buttonRadius:12,pillUsage:'Tags only',buttonShape:'Soft rectangle',buttonWeight:'Balanced',buttonEmphasis:'Filled primary',inputAppearance:'Outlined',inputHeight:48,formDensity:'Spacious',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','Natural or documentary imagery only where it helps orient the user.',{imageryMode:'Photography',imageCharacter:'Natural',imageTreatment:'Full color',imagePresentation:'Framed'}),
      category('icons','Iconography','Friendly but consistent outline iconography.',{iconWeight:54,iconStyle:'Outline',iconGeometry:'Organic',iconStrokeWeight:2,iconSize:21,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Low smooth motion that reinforces state changes.',{motion:20,motionAmount:'Low',motionCharacter:'Smooth',pageTransition:'Fade',scrollAnimation:'None',hoverResponse:'Subtle',motionDuration:200,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Balanced accent usage for actions and progress.',{accentUsage:'Balanced'}),
    ],
  },
  {
    id:'friendly-consumer', name:'Friendly Consumer', description:'Obvious, touch-friendly, and approachable. Useful for broad-audience consumer products where first-glance usability matters.', tags:['consumer','directory','marketplace','booking','commerce','mobile'], colorSchemeIds:['sage-mint','sand-orange','mauve-violet'],
    categories:[
      category('theme','Theme','Light-first with optional dark toggle.',{themeMode:'Light + Dark toggle',defaultTheme:'Light',respectOsPreference:true,rememberThemePreference:true}),
      category('typography','Typography','Rounded sans hierarchy with readable body sizing.',{typographyCharacter:'Rounded sans',headingTypography:'Rounded sans',bodyTypography:'Rounded sans',typography:'Rounded sans',bodyFontSize:17,headingScale:108,headingWeight:750,bodyWeight:500,lineHeight:160,textMeasure:66}),
      category('layout','Layout','Generous rhythm and mobile-first composition.',{density:24,whitespacePriority:'Generous',contentMaxWidth:1180,pageGutters:34,sectionSpacing:92,gridCharacter:'Flexible grid',alignmentTendency:'Mostly left',responsiveBehavior:'Mobile composition changes',mobileFirst:true}),
      category('sections','Sections','Soft tonal sections with clear conversion moments.',{sectionStrategy:'Tonal layering',sectionContrast:24,backgroundTreatment:'Tint',sectionDividers:'Whitespace only',heroSeparation:'Subtle contrast',ctaTreatment:'Contrast band',footerContrast:'Strong',variedSections:true}),
      category('surfaces','Surfaces','Tonal containment, not shadow-heavy card stacks.',{surfaceLanguage:'Tonal surfaces',cardWeight:48,borderWeight:1,shadowCharacter:'Barely there',elevation:10,surfaceContrast:26,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Large rounded controls with restrained pills.',{shapeLanguage:'Rounded',radius:62,surfaceRadius:20,controlRadius:15,buttonRadius:16,pillUsage:'Tags only',buttonShape:'Rounded',buttonWeight:'Bold',buttonEmphasis:'Filled primary',inputAppearance:'Outlined',inputHeight:50,formDensity:'Spacious',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','Natural product or contextual imagery.',{imageryMode:'Photography',imageCharacter:'Natural',imageTreatment:'Full color',imagePresentation:'Cropped'}),
      category('icons','Iconography','Organic outline icons with high recognition support.',{iconWeight:72,iconStyle:'Outline',iconGeometry:'Organic',iconStrokeWeight:2.2,iconSize:22,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Moderate springy feedback, but only around interactions.',{motion:44,motionAmount:'Moderate',motionCharacter:'Springy',pageTransition:'Fade',scrollAnimation:'Key sections only',hoverResponse:'Responsive',motionDuration:220,easing:'Spring-like',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Balanced accent usage with obvious primary actions.',{accentUsage:'Balanced'}),
    ],
  },
  {
    id:'editorial-minimal', name:'Editorial Minimal', description:'Type-led, spacious, nearly cardless, and intentionally restrained. Good when the content or brand should feel authored rather than templated.', tags:['portfolio','marketing','editorial','premium','content','minimal'], colorSchemeIds:['pure-monochrome','monochrome-signal','mauve-plum'],
    categories:[
      category('theme','Theme','Light-led with a carefully paired dark option.',{themeMode:'Light + Dark toggle',defaultTheme:'Light',respectOsPreference:true,rememberThemePreference:true}),
      category('typography','Typography','High-contrast serif display with restrained sans utility text.',{typographyCharacter:'High-contrast serif',headingTypography:'High-contrast serif',bodyTypography:'Neo-grotesk',typography:'High-contrast serif + neo-grotesk',bodyFontSize:16,headingScale:142,headingWeight:600,bodyWeight:450,lineHeight:158,letterSpacing:-1,textMeasure:58}),
      category('layout','Layout','Very spacious asymmetric editorial flow.',{density:18,whitespacePriority:'Very spacious',contentMaxWidth:1320,pageGutters:52,sectionSpacing:132,gridCharacter:'Editorial flow',alignmentTendency:'Deliberately asymmetric',responsiveBehavior:'Mobile composition changes'}),
      category('sections','Sections','Editorial blocks and rules instead of boxed modules.',{sectionStrategy:'Editorial blocks',sectionContrast:18,backgroundTreatment:'Solid',sectionDividers:'Hairline',heroSeparation:'Integrated',ctaTreatment:'Minimal',footerContrast:'Inverse',variedSections:true}),
      category('surfaces','Surfaces','Borderless, shadowless, and intentionally flat.',{surfaceLanguage:'Borderless',cardWeight:6,borderWeight:1,shadowCharacter:'None',elevation:0,surfaceContrast:10,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Sharp quiet controls that resemble editorial furniture.',{shapeLanguage:'Sharp',radius:2,surfaceRadius:0,controlRadius:2,buttonRadius:2,pillUsage:'None',buttonShape:'Rectangular',buttonWeight:'Quiet',buttonEmphasis:'Outline primary',inputAppearance:'Underline',inputHeight:42,formDensity:'Spacious',controlBorderStyle:'Hairline',hoverCharacter:'Underline / rule'}),
      category('imagery','Imagery','Editorial photography or product imagery, often full bleed.',{imageryMode:'Photography',imageCharacter:'Editorial',imageTreatment:'High contrast',imagePresentation:'Full bleed'}),
      category('icons','Iconography','Minimal neutral icons only when text is insufficient.',{iconWeight:20,iconStyle:'Outline',iconGeometry:'Neutral',iconStrokeWeight:1.5,iconSize:17,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Moderate editorial transitions with deliberate pacing.',{motion:34,motionAmount:'Moderate',motionCharacter:'Editorial',pageTransition:'Reveal',scrollAnimation:'Key sections only',hoverResponse:'Subtle',motionDuration:260,easing:'Ease in-out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Accent should be rare or highly focused.',{accentUsage:'Rare'}),
    ],
  },
  {
    id:'data-precision', name:'Data Precision', description:'Wide, disciplined, and information-dense for analytics, reporting, inventory, and operational decision support.', tags:['data','reports','analytics','inventory','operations','dashboard'], colorSchemeIds:['graphite-blue','slate-indigo','slate-cyan'],
    categories:[
      category('theme','Theme','System theme with stable semantic color roles.',{themeMode:'System',defaultTheme:'Light',respectOsPreference:true}),
      category('typography','Typography','Neo-grotesk UI with frequent monospace data accents.',{typographyCharacter:'Neo-grotesk',headingTypography:'Neo-grotesk',bodyTypography:'Humanist sans',typography:'Neo-grotesk + mono metadata',monospaceUsage:'Frequent accent',bodyFontSize:14,headingScale:94,headingWeight:700,bodyWeight:450,lineHeight:145,textMeasure:80}),
      category('layout','Layout','Wide strict grid with compact rhythm.',{density:72,whitespacePriority:'Compact',contentMaxWidth:1600,pageGutters:20,sectionSpacing:44,gridCharacter:'Strict grid',alignmentTendency:'Mostly left',responsiveBehavior:'Preserve density'}),
      category('sections','Sections','Uniform or subtly layered canvas for uninterrupted scanning.',{sectionStrategy:'Uniform',sectionContrast:10,backgroundTreatment:'Solid',sectionDividers:'Hairline',heroSeparation:'Integrated',ctaTreatment:'Inline',footerContrast:'Same as page',variedSections:false}),
      category('surfaces','Surfaces','Hairline boundaries and tonal layers, not floating cards.',{surfaceLanguage:'Hairline borders',cardWeight:26,borderWeight:1,shadowCharacter:'None',elevation:0,surfaceContrast:18,gradientUsage:'None',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Compact structured controls with mixed hierarchy.',{shapeLanguage:'Sharp',radius:8,surfaceRadius:4,controlRadius:4,buttonRadius:4,pillUsage:'Tags only',buttonShape:'Rectangular',buttonWeight:'Balanced',buttonEmphasis:'Mixed hierarchy',inputAppearance:'Outlined',inputHeight:38,formDensity:'Compact',controlBorderStyle:'Defined',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','No decorative imagery; screenshots or data visuals only when informative.',{imageryMode:'Product screenshots',imageCharacter:'Technical',imageTreatment:'Full color',imagePresentation:'Framed'}),
      category('icons','Iconography','Geometric outline icons at compact sizes.',{iconWeight:46,iconStyle:'Outline',iconGeometry:'Geometric',iconStrokeWeight:1.75,iconSize:17,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','Very low, snappy state feedback.',{motion:10,motionAmount:'Low',motionCharacter:'Snappy',pageTransition:'None',scrollAnimation:'None',hoverResponse:'Subtle',motionDuration:120,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Accent stays focused; semantics carry operational meaning.',{accentUsage:'Focused'}),
    ],
  },
  {
    id:'event-energy', name:'Event Energy', description:'Bold, high-contrast, fast-moving presentation for tournaments, live events, scores, and time-sensitive public experiences.', tags:['tournament','event','sports','live','score'], colorSchemeIds:['onyx-acid','automotive-red','slate-cyan'],
    categories:[
      category('theme','Theme','Dark-forward toggle for live-event environments.',{themeMode:'Light + Dark toggle',defaultTheme:'Dark',respectOsPreference:false,rememberThemePreference:true}),
      category('typography','Typography','Expressive display headings with compact neo-grotesk supporting text.',{typographyCharacter:'Display / expressive',headingTypography:'Display / expressive',bodyTypography:'Neo-grotesk',typography:'Display / expressive + neo-grotesk',bodyFontSize:15,headingScale:134,headingWeight:800,bodyWeight:500,lineHeight:145,textMeasure:64}),
      category('layout','Layout','Moderately dense, wide, and score-friendly.',{density:58,whitespacePriority:'Balanced',contentMaxWidth:1480,pageGutters:28,sectionSpacing:66,gridCharacter:'Flexible grid',alignmentTendency:'Mixed',responsiveBehavior:'Mobile composition changes'}),
      category('sections','Sections','Strong separated live sections and contrast bands.',{sectionStrategy:'Strong separated sections',sectionContrast:62,backgroundTreatment:'Tint',sectionDividers:'Strong rules',heroSeparation:'Strong contrast',ctaTreatment:'Contrast band',footerContrast:'Inverse',variedSections:true}),
      category('surfaces','Surfaces','Mixed containment with crisp boundaries.',{surfaceLanguage:'Mixed containment',cardWeight:42,borderWeight:1,shadowCharacter:'Crisp',elevation:18,surfaceContrast:26,gradientUsage:'Rare accent',glassUsage:'None',textureUsage:'None'}),
      category('controls','Controls','Sharp bold controls with selective status pills.',{shapeLanguage:'Sharp',radius:8,surfaceRadius:4,controlRadius:4,buttonRadius:4,pillUsage:'Selective accents',buttonShape:'Rectangular',buttonWeight:'Bold',buttonEmphasis:'Filled primary',inputAppearance:'Outlined',inputHeight:42,formDensity:'Comfortable',controlBorderStyle:'High contrast',hoverCharacter:'Color shift'}),
      category('imagery','Imagery','High-contrast photography or event graphics.',{imageryMode:'Photography',imageCharacter:'Polished commercial',imageTreatment:'High contrast',imagePresentation:'Background'}),
      category('icons','Iconography','Bold geometric outline icons.',{iconWeight:60,iconStyle:'Outline',iconGeometry:'Geometric',iconStrokeWeight:2.2,iconSize:20,labelUnfamiliarIcons:true,strictIconFamily:true}),
      category('motion','Motion','High snappy motion only for meaningful live changes and transitions.',{motion:70,motionAmount:'High',motionCharacter:'Snappy',pageTransition:'Contextual',scrollAnimation:'Key sections only',hoverResponse:'Responsive',motionDuration:170,easing:'Ease out',reducedMotionFallback:true}),
      category('colorBehavior','Color behavior','Prominent accent for live status and key actions.',{accentUsage:'Prominent'}),
    ],
  },
]

const normalizedTerms = (context: SuggestionContext) => `${context.appType} ${context.activePacks.join(' ')} ${context.projectContext} ${context.dna.personality} ${context.dna.imageryMode}`.toLowerCase()
const tagScore = (tags: string[], haystack: string) => tags.reduce((score, tag) => score + (haystack.includes(tag.toLowerCase()) ? 4 : 0), 0)
const wordScore = (haystack: string, words: string[], points: number) => words.reduce((score, word) => score + (haystack.includes(word) ? points : 0), 0)

export function rankedVisualDirections(context: SuggestionContext) {
  const haystack = normalizedTerms(context)
  return visualDirections.map((direction, index) => {
    let score = tagScore(direction.tags, haystack)
    if (context.dna.stretch === 'Push me' && ['performance-editorial','editorial-minimal','event-energy'].includes(direction.id)) score += 4
    if (context.dna.stretch === 'Safe' && ['civic-clarity','calm-service','technical-control'].includes(direction.id)) score += 3
    if (context.dna.easePriority === 'Non-negotiable' && ['calm-service','friendly-consumer','civic-clarity'].includes(direction.id)) score += 3
    score += wordScore(haystack, direction.tags, 1)
    return { ...direction, score, rankSeed: index }
  }).sort((a,b) => b.score - a.score || a.rankSeed - b.rankSeed)
}

export function rankedColorSchemes(context: SuggestionContext) {
  const haystack = normalizedTerms(context)
  const directionRanking = rankedVisualDirections(context).slice(0,3)
  const boosted = new Set(directionRanking.flatMap((direction) => direction.colorSchemeIds))
  return colorSchemes.map((color, index) => {
    let score = tagScore(color.tags, haystack)
    if (boosted.has(color.id)) score += 5
    if (context.dna.accentUsage === 'Rare' && ['pure-monochrome','monochrome-signal','navy-gold','sand-bronze'].includes(color.id)) score += 2
    if (context.dna.personality.toLowerCase().includes('bold') && ['automotive-red','onyx-acid','slate-cyan'].includes(color.id)) score += 3
    return { ...color, score, rankSeed: index }
  }).sort((a,b) => b.score - a.score || a.rankSeed - b.rankSeed)
}

export function previewColorScheme(dna: Dna, schemeValue: ColorScheme) {
  return normalizeDna({ ...dna, palette: schemeValue.light, darkPalette: schemeValue.dark, colorSchemeOrigin: schemeValue.name })
}

export function applyDirectionCategory(dna: Dna, direction: VisualDirection, categoryId: DirectionCategoryId) {
  const found = direction.categories.find((item) => item.id === categoryId)
  return found ? normalizeDna({ ...dna, ...found.patch }) : normalizeDna(dna)
}

export function applyFullDirection(dna: Dna, direction: VisualDirection) {
  const patch = Object.assign({}, ...direction.categories.map((item) => item.patch)) as Partial<Dna>
  return normalizeDna({ ...dna, ...patch })
}
