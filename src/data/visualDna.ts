export type VisualDepth = 'Quick' | 'Standard' | 'Advanced'
export type ThemeMode = 'Light only' | 'Dark only' | 'System' | 'Light + Dark toggle'
export type TypographyCharacter = 'Neo-grotesk' | 'Humanist sans' | 'Geometric sans' | 'Rounded sans' | 'Editorial serif' | 'High-contrast serif' | 'Transitional serif' | 'Slab serif' | 'Monospace-led' | 'Display / expressive'
export type SectionStrategy = 'Uniform' | 'Alternating subtle sections' | 'Strong separated sections' | 'Tonal layering' | 'Card-within-section' | 'Editorial blocks' | 'Mixed'
export type SurfaceLanguage = 'Borderless' | 'Hairline borders' | 'Tonal surfaces' | 'Soft elevation' | 'Strong elevation' | 'Mixed containment'
export type ShapeLanguage = 'Sharp' | 'Soft' | 'Rounded' | 'Pill-accented'
export type ImageryMode = 'None' | 'Photography' | 'Product screenshots' | 'Illustration' | 'Abstract graphics' | 'Mixed'
export type MotionAmount = 'None' | 'Low' | 'Moderate' | 'High'
export type MotionCharacter = 'Snappy' | 'Smooth' | 'Springy' | 'Editorial' | 'Cinematic'

export type PaletteRoles = {
  ink: string
  background: string
  accent: string
  accentForeground: string
  accentHover: string
  accentActive: string
  surface: string
  muted: string
  positive: string
  destructive: string
  warning: string
  informational: string
  border: string
  focus: string
  disabled: string
}

export type Dna = {
  personality: string
  density: number
  iconWeight: number
  cardWeight: number
  radius: number
  motion: number
  typography: string
  palette: PaletteRoles
  mobileFirst: boolean
  easePriority: 'Standard' | 'High' | 'Non-negotiable'
  stretch: 'Safe' | 'Balanced' | 'Push me'

  themeMode: ThemeMode
  defaultTheme: 'Light' | 'Dark'
  respectOsPreference: boolean
  rememberThemePreference: boolean
  themeTogglePlacement: 'Header' | 'Navigation' | 'Settings' | 'Header + settings'
  darkPaletteStrategy: 'Auto-adapted' | 'Separately curated'
  darkPalette: PaletteRoles

  typographyCharacter: TypographyCharacter
  headingTypography: TypographyCharacter
  bodyTypography: TypographyCharacter
  monospaceUsage: 'None' | 'Metadata only' | 'Data / code' | 'Frequent accent' | 'Primary'
  bodyFontSize: number
  headingScale: number
  headingWeight: number
  bodyWeight: number
  lineHeight: number
  letterSpacing: number
  textMeasure: number

  contentMaxWidth: number
  pageGutters: number
  sectionSpacing: number
  whitespacePriority: 'Compact' | 'Balanced' | 'Generous' | 'Very spacious'
  gridCharacter: 'Strict grid' | 'Flexible grid' | 'Asymmetric' | 'Editorial flow' | 'Content-led'
  alignmentTendency: 'Mostly left' | 'Centered moments' | 'Mixed' | 'Deliberately asymmetric'
  responsiveBehavior: 'Reflow naturally' | 'Collapse aggressively' | 'Preserve density' | 'Mobile composition changes'
  functionalDensity: 'Follow global' | 'Balanced for scanning' | 'Compact operational'

  sectionStrategy: SectionStrategy
  sectionContrast: number
  backgroundTreatment: 'Solid' | 'Tint' | 'Gradient' | 'Texture' | 'Image' | 'Glass' | 'Mixed'
  sectionDividers: 'None' | 'Hairline' | 'Strong rules' | 'Whitespace only' | 'Mixed'
  heroSeparation: 'Integrated' | 'Subtle contrast' | 'Strong contrast' | 'Full bleed'
  ctaTreatment: 'Inline' | 'Contained' | 'Contrast band' | 'Full bleed' | 'Minimal'
  footerContrast: 'Same as page' | 'Subtle' | 'Strong' | 'Inverse'
  variedSections: boolean

  surfaceLanguage: SurfaceLanguage
  borderWeight: number
  shadowCharacter: 'None' | 'Barely there' | 'Soft diffuse' | 'Crisp' | 'Dramatic'
  elevation: number
  surfaceContrast: number
  gradientUsage: 'None' | 'Rare accent' | 'Selective' | 'Frequent'
  glassUsage: 'None' | 'Rare overlay' | 'Selective' | 'Frequent'
  textureUsage: 'None' | 'Subtle' | 'Selective' | 'Prominent'

  shapeLanguage: ShapeLanguage
  surfaceRadius: number
  controlRadius: number
  buttonRadius: number
  pillUsage: 'None' | 'Tags only' | 'Selective accents' | 'Frequent'

  buttonShape: 'Rectangular' | 'Soft rectangle' | 'Rounded' | 'Pill'
  buttonWeight: 'Quiet' | 'Balanced' | 'Bold'
  buttonEmphasis: 'Filled primary' | 'Outline primary' | 'Ghost-led' | 'Mixed hierarchy'
  inputAppearance: 'Underline' | 'Outlined' | 'Filled' | 'Borderless / tonal'
  inputHeight: number
  formDensity: 'Spacious' | 'Comfortable' | 'Compact'
  controlBorderStyle: 'None' | 'Hairline' | 'Defined' | 'High contrast'
  hoverCharacter: 'Minimal' | 'Color shift' | 'Lift' | 'Scale / spring' | 'Underline / rule'

  imageryMode: ImageryMode
  imageCharacter: 'Natural' | 'Editorial' | 'Technical' | 'Documentary' | 'Polished commercial'
  imageTreatment: 'Full color' | 'Muted' | 'Monochrome' | 'Duotone' | 'High contrast'
  imagePresentation: 'Full bleed' | 'Framed' | 'Floating' | 'Cropped' | 'Background'

  iconStyle: 'Outline' | 'Filled' | 'Mixed'
  iconGeometry: 'Geometric' | 'Organic' | 'Neutral'
  iconStrokeWeight: number
  iconSize: number
  labelUnfamiliarIcons: boolean
  strictIconFamily: boolean

  motionAmount: MotionAmount
  motionCharacter: MotionCharacter
  pageTransition: 'None' | 'Fade' | 'Slide' | 'Scale' | 'Reveal' | 'Contextual'
  scrollAnimation: 'None' | 'Key sections only' | 'Selective' | 'Frequent'
  hoverResponse: 'None' | 'Subtle' | 'Responsive' | 'Expressive'
  motionDuration: number
  easing: 'Standard ease' | 'Ease out' | 'Ease in-out' | 'Spring-like' | 'Custom / implementation-led'
  reducedMotionFallback: boolean

  accentUsage: 'Rare' | 'Focused' | 'Balanced' | 'Prominent'
  colorSchemeOrigin: string
  visualAntiPatterns: string[]
  visualSignature: string
}

const extendPalette = (palette: Partial<PaletteRoles>): PaletteRoles => ({
  ink: '#101214', background: '#f4f3ee', accent: '#4f68e8', accentForeground: '#ffffff', accentHover: '#455dd5', accentActive: '#4056c9', surface: '#e6e4dd', muted: '#696c73', positive: '#4f7f61',
  destructive: '#b74438', warning: '#a16a16', informational: '#3d6f9d', border: '#cbc9c2', focus: '#4f68e8', disabled: '#a5a6a8',
  ...palette,
})

export const defaultDna: Dna = {
  personality: 'Premium / Practical', density: 42, iconWeight: 58, cardWeight: 34, radius: 26, motion: 28,
  typography: 'Neo-grotesk + humanist body', palette: extendPalette({}), mobileFirst: true, easePriority: 'Non-negotiable', stretch: 'Balanced',
  themeMode: 'Light + Dark toggle', defaultTheme: 'Light', respectOsPreference: true, rememberThemePreference: true, themeTogglePlacement: 'Header + settings', darkPaletteStrategy: 'Auto-adapted',
  darkPalette: extendPalette({ ink: '#f4f4f1', background: '#111317', accent: '#91a2ff', accentForeground: '#111317', accentHover: '#a8b5ff', accentActive: '#bac4ff', surface: '#1d2025', muted: '#9a9da4', positive: '#73a982', destructive: '#ef8275', warning: '#d9a24c', informational: '#75a8d4', border: '#353941', focus: '#a9b4ff', disabled: '#666b73' }),
  typographyCharacter: 'Neo-grotesk', headingTypography: 'Neo-grotesk', bodyTypography: 'Humanist sans', monospaceUsage: 'Metadata only', bodyFontSize: 16, headingScale: 110, headingWeight: 700, bodyWeight: 450, lineHeight: 155, letterSpacing: -1, textMeasure: 68,
  contentMaxWidth: 1200, pageGutters: 40, sectionSpacing: 88, whitespacePriority: 'Generous', gridCharacter: 'Flexible grid', alignmentTendency: 'Mostly left', responsiveBehavior: 'Mobile composition changes', functionalDensity: 'Balanced for scanning',
  sectionStrategy: 'Alternating subtle sections', sectionContrast: 28, backgroundTreatment: 'Tint', sectionDividers: 'Whitespace only', heroSeparation: 'Subtle contrast', ctaTreatment: 'Contrast band', footerContrast: 'Strong', variedSections: true,
  surfaceLanguage: 'Hairline borders', borderWeight: 1, shadowCharacter: 'Barely there', elevation: 12, surfaceContrast: 24, gradientUsage: 'None', glassUsage: 'None', textureUsage: 'None',
  shapeLanguage: 'Soft', surfaceRadius: 12, controlRadius: 9, buttonRadius: 9, pillUsage: 'Tags only',
  buttonShape: 'Soft rectangle', buttonWeight: 'Balanced', buttonEmphasis: 'Filled primary', inputAppearance: 'Outlined', inputHeight: 44, formDensity: 'Comfortable', controlBorderStyle: 'Hairline', hoverCharacter: 'Color shift',
  imageryMode: 'Product screenshots', imageCharacter: 'Technical', imageTreatment: 'Full color', imagePresentation: 'Framed',
  iconStyle: 'Outline', iconGeometry: 'Geometric', iconStrokeWeight: 1.75, iconSize: 20, labelUnfamiliarIcons: true, strictIconFamily: true,
  motionAmount: 'Low', motionCharacter: 'Snappy', pageTransition: 'Fade', scrollAnimation: 'Key sections only', hoverResponse: 'Subtle', motionDuration: 180, easing: 'Ease out', reducedMotionFallback: true,
  accentUsage: 'Focused', colorSchemeOrigin: '', visualAntiPatterns: ['Generic SaaS cards', 'Gradient-heavy UI', 'Glassmorphism', 'Excessive pills'], visualSignature: '',
}

const normalizeHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value) ? value : '#777777'
const rgb = (value: string) => {
  const hex = normalizeHex(value).slice(1)
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)] as const
}
const toHex = (channels: readonly number[]) => `#${channels.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('')}`
const mix = (left: string, right: string, amount: number) => {
  const a = rgb(left), b = rgb(right)
  return toHex(a.map((channel, index) => channel + (b[index] - channel) * amount))
}
const luminance = (value: string) => {
  const channels = rgb(value).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export const contrastRatio = (left: string, right: string) => {
  const a = luminance(left), b = luminance(right)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

export const colorLuminance = (value: string) => luminance(value)

const deriveAccentRoles = (palette: PaletteRoles, provided: Partial<PaletteRoles> = {}) => {
  const lightForeground = contrastRatio('#ffffff', palette.accent) >= contrastRatio('#111111', palette.accent) ? '#ffffff' : '#111111'
  if (!provided.accentForeground) palette.accentForeground = lightForeground
  if (!provided.accentHover) palette.accentHover = mix(palette.accent, lightForeground === '#ffffff' ? '#000000' : '#ffffff', 0.10)
  if (!provided.accentActive) palette.accentActive = mix(palette.accent, lightForeground === '#ffffff' ? '#000000' : '#ffffff', 0.18)
  return palette
}

export const autoAdaptDarkPalette = (palette: PaletteRoles): PaletteRoles => {
  const background = luminance(palette.background) < 0.22 ? mix(palette.background, '#000000', 0.18) : mix(palette.ink, '#000000', 0.72)
  const ink = luminance(palette.ink) > 0.72 ? mix(palette.ink, '#ffffff', 0.08) : mix(palette.background, '#ffffff', 0.58)
  const surface = mix(background, ink, 0.10)
  const accent = luminance(palette.accent) < 0.36 ? mix(palette.accent, '#ffffff', 0.28) : palette.accent
  const accentForeground = contrastRatio('#ffffff', accent) >= contrastRatio('#111317', accent) ? '#ffffff' : '#111317'
  return {
    ink,
    background,
    accent,
    accentForeground,
    accentHover: luminance(palette.accentHover) < 0.36 ? mix(palette.accentHover, '#ffffff', 0.32) : palette.accentHover,
    accentActive: luminance(palette.accentActive) < 0.36 ? mix(palette.accentActive, '#ffffff', 0.38) : palette.accentActive,
    surface,
    muted: mix(ink, background, 0.42),
    positive: luminance(palette.positive) < 0.34 ? mix(palette.positive, '#ffffff', 0.22) : palette.positive,
    destructive: luminance(palette.destructive) < 0.34 ? mix(palette.destructive, '#ffffff', 0.22) : palette.destructive,
    warning: luminance(palette.warning) < 0.34 ? mix(palette.warning, '#ffffff', 0.22) : palette.warning,
    informational: luminance(palette.informational) < 0.34 ? mix(palette.informational, '#ffffff', 0.22) : palette.informational,
    border: mix(surface, ink, 0.18),
    focus: luminance(palette.focus) < 0.36 ? mix(palette.focus, '#ffffff', 0.30) : palette.focus,
    disabled: mix(ink, background, 0.62),
  }
}

export const resolvedDarkPalette = (dna: Dna) => dna.darkPaletteStrategy === 'Separately curated' ? dna.darkPalette : autoAdaptDarkPalette(dna.palette)

export const typographyCharacters: TypographyCharacter[] = ['Neo-grotesk', 'Humanist sans', 'Geometric sans', 'Rounded sans', 'Editorial serif', 'High-contrast serif', 'Transitional serif', 'Slab serif', 'Monospace-led', 'Display / expressive']
export const visualAntiPatternOptions = ['Generic SaaS cards', 'Gradient-heavy UI', 'Glassmorphism', 'Excessive pills', 'Oversized generic hero', 'Stock imagery', 'Excessive rounded corners', 'Excessive animations', 'Dense dashboard aesthetic']

export const fontFamilyFor = (character: TypographyCharacter) => {
  switch (character) {
    case 'Humanist sans': return "'IBM Plex Sans', sans-serif"
    case 'Geometric sans': return "'Manrope', sans-serif"
    case 'Rounded sans': return "'Nunito Sans', sans-serif"
    case 'Editorial serif': return "'Source Serif 4', serif"
    case 'High-contrast serif': return "'Playfair Display', serif"
    case 'Transitional serif': return "'Libre Baskerville', serif"
    case 'Slab serif': return "'Roboto Slab', serif"
    case 'Monospace-led': return "'DM Mono', monospace"
    case 'Display / expressive': return "'Bebas Neue', sans-serif"
    default: return "'Space Grotesk', sans-serif"
  }
}

const legacyTypographyCharacter = (value: string | undefined): TypographyCharacter => {
  const normalized = (value || '').toLowerCase()
  if (normalized.includes('rounded')) return 'Rounded sans'
  if (normalized.includes('mono')) return 'Monospace-led'
  if (normalized.includes('editorial') || normalized.includes('serif')) return 'Editorial serif'
  if (normalized.includes('humanist')) return 'Humanist sans'
  if (normalized.includes('bold display')) return 'Display / expressive'
  return 'Neo-grotesk'
}
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

export const normalizeDna = (value: (Partial<Dna> & { palette?: Partial<PaletteRoles> | string[]; darkPalette?: Partial<PaletteRoles> }) | null | undefined): Dna => {
  if (!value) return structuredClone(defaultDna)
  const oldPalette = Array.isArray(value.palette) ? value.palette : null
  const providedPalette: Partial<PaletteRoles> = oldPalette ? { ink: oldPalette[0], background: oldPalette[1], accent: oldPalette[2], surface: oldPalette[3] } : (value.palette || {})
  const palette = deriveAccentRoles(extendPalette(providedPalette), providedPalette)
  const providedDarkPalette: Partial<PaletteRoles> = value.darkPalette || defaultDna.darkPalette
  const inferredType = value.typographyCharacter || legacyTypographyCharacter(value.typography)
  const normalized: Dna = {
    ...structuredClone(defaultDna), ...value, palette, darkPalette: deriveAccentRoles(extendPalette(providedDarkPalette), providedDarkPalette), typographyCharacter: inferredType,
    headingTypography: value.headingTypography || inferredType,
    bodyTypography: value.bodyTypography || ((inferredType.includes('serif') || inferredType === 'Display / expressive') ? 'Humanist sans' : inferredType),
    typography: value.typography || `${inferredType}${inferredType.includes('serif') || inferredType === 'Display / expressive' ? ' + utility sans' : ''}`,
    visualAntiPatterns: Array.isArray(value.visualAntiPatterns) ? value.visualAntiPatterns.filter(Boolean) : [...defaultDna.visualAntiPatterns],
  }
  normalized.density = clamp(normalized.density, 0, 100, defaultDna.density)
  normalized.iconWeight = clamp(normalized.iconWeight, 0, 100, defaultDna.iconWeight)
  normalized.cardWeight = clamp(normalized.cardWeight, 0, 100, defaultDna.cardWeight)
  normalized.radius = clamp(normalized.radius, 0, 100, defaultDna.radius)
  normalized.motion = clamp(normalized.motion, 0, 100, defaultDna.motion)
  normalized.bodyFontSize = clamp(normalized.bodyFontSize, 13, 22, defaultDna.bodyFontSize)
  normalized.headingScale = clamp(normalized.headingScale, 75, 160, defaultDna.headingScale)
  normalized.headingWeight = clamp(normalized.headingWeight, 300, 900, defaultDna.headingWeight)
  normalized.bodyWeight = clamp(normalized.bodyWeight, 300, 700, defaultDna.bodyWeight)
  normalized.lineHeight = clamp(normalized.lineHeight, 120, 190, defaultDna.lineHeight)
  normalized.letterSpacing = clamp(normalized.letterSpacing, -4, 8, defaultDna.letterSpacing)
  normalized.textMeasure = clamp(normalized.textMeasure, 42, 90, defaultDna.textMeasure)
  normalized.contentMaxWidth = clamp(normalized.contentMaxWidth, 720, 1600, defaultDna.contentMaxWidth)
  normalized.pageGutters = clamp(normalized.pageGutters, 12, 96, defaultDna.pageGutters)
  normalized.sectionSpacing = clamp(normalized.sectionSpacing, 32, 180, defaultDna.sectionSpacing)
  if (!['Follow global', 'Balanced for scanning', 'Compact operational'].includes(String(normalized.functionalDensity))) normalized.functionalDensity = defaultDna.functionalDensity
  normalized.sectionContrast = clamp(normalized.sectionContrast, 0, 100, defaultDna.sectionContrast)
  normalized.borderWeight = clamp(normalized.borderWeight, 0, 4, defaultDna.borderWeight)
  normalized.elevation = clamp(normalized.elevation, 0, 100, defaultDna.elevation)
  normalized.surfaceContrast = clamp(normalized.surfaceContrast, 0, 100, defaultDna.surfaceContrast)
  normalized.surfaceRadius = clamp(normalized.surfaceRadius, 0, 40, defaultDna.surfaceRadius)
  normalized.controlRadius = clamp(normalized.controlRadius, 0, 32, defaultDna.controlRadius)
  normalized.buttonRadius = clamp(normalized.buttonRadius, 0, 40, defaultDna.buttonRadius)
  normalized.inputHeight = clamp(normalized.inputHeight, 34, 64, defaultDna.inputHeight)
  normalized.iconStrokeWeight = clamp(normalized.iconStrokeWeight, 1, 3, defaultDna.iconStrokeWeight)
  normalized.iconSize = clamp(normalized.iconSize, 14, 32, defaultDna.iconSize)
  normalized.motionDuration = clamp(normalized.motionDuration, 80, 900, defaultDna.motionDuration)
  return normalized
}

type VisualPresetDna = Omit<Partial<Dna>, 'palette'> & { palette: Partial<PaletteRoles> }
export const themePresets: { id: string; name: string; description: string; dna: VisualPresetDna }[] = [
  { id: 'quiet-luxury', name: 'Quiet Luxury', description: 'Warm editorial type, broad whitespace, rules instead of card stacks.', dna: { personality: 'Premium / Editorial', density: 24, cardWeight: 16, radius: 16, motion: 20, typography: 'Editorial serif + utility sans', typographyCharacter: 'Editorial serif', headingTypography: 'Editorial serif', bodyTypography: 'Humanist sans', bodyFontSize: 16, headingScale: 122, headingWeight: 600, sectionStrategy: 'Editorial blocks', surfaceLanguage: 'Borderless', shapeLanguage: 'Sharp', surfaceRadius: 4, controlRadius: 5, buttonRadius: 5, whitespacePriority: 'Very spacious', sectionSpacing: 118, imageryMode: 'Photography', imageCharacter: 'Editorial', imageTreatment: 'Muted', motionAmount: 'Low', motionCharacter: 'Editorial', accentUsage: 'Rare', visualAntiPatterns: ['Generic SaaS cards','Gradient-heavy UI','Glassmorphism','Excessive pills','Stock imagery'], palette: { ink:'#171512',background:'#f3efe7',accent:'#8b7557',surface:'#e6ddd0',muted:'#756c61',positive:'#50705a',border:'#c9bfae' } } },
  { id: 'technical', name: 'Technical Control', description: 'Dense, sharp, data-forward, border-driven, quiet color accents.', dna: { personality:'Technical / Data-heavy',density:78,iconWeight:55,cardWeight:38,radius:7,motion:14,typography:'Neo-grotesk + mono data',typographyCharacter:'Neo-grotesk',headingTypography:'Neo-grotesk',bodyTypography:'Neo-grotesk',monospaceUsage:'Data / code',bodyFontSize:14,headingScale:92,headingWeight:650,contentMaxWidth:1480,whitespacePriority:'Compact',gridCharacter:'Strict grid',sectionStrategy:'Uniform',surfaceLanguage:'Hairline borders',shapeLanguage:'Sharp',surfaceRadius:3,controlRadius:3,buttonRadius:3,inputHeight:38,motionAmount:'Low',motionCharacter:'Snappy',iconGeometry:'Geometric',palette:{ink:'#0c0f14',background:'#e7ebef',accent:'#5b8cff',surface:'#d9dfe6',muted:'#66707c',positive:'#2d7d5b',border:'#aeb7c1'} } },
  { id: 'friendly', name: 'Friendly Consumer', description: 'Rounded, icon-led, roomy and obvious for low-friction everyday use.', dna: { personality:'Friendly / Consumer',density:22,iconWeight:82,cardWeight:62,radius:78,motion:44,typography:'Rounded sans',typographyCharacter:'Rounded sans',headingTypography:'Rounded sans',bodyTypography:'Rounded sans',bodyFontSize:17,headingScale:108,headingWeight:750,whitespacePriority:'Generous',sectionStrategy:'Tonal layering',surfaceLanguage:'Tonal surfaces',shapeLanguage:'Rounded',surfaceRadius:24,controlRadius:16,buttonRadius:18,buttonShape:'Rounded',imageryMode:'Illustration',imageCharacter:'Natural',motionAmount:'Moderate',motionCharacter:'Springy',iconGeometry:'Organic',iconStrokeWeight:2.2,accentUsage:'Balanced',palette:{ink:'#18211a',background:'#f8f7f0',accent:'#64a96b',surface:'#e7f0e4',muted:'#68716a',positive:'#3d8a56',border:'#c7d5c4'} } },
  { id: 'institutional', name: 'Modern Institutional', description: 'Clear hierarchy, conservative motion, high legibility, restrained geometry.', dna: { personality:'Institutional / Modern',density:50,iconWeight:40,cardWeight:30,radius:16,motion:10,typography:'Humanist sans',typographyCharacter:'Humanist sans',headingTypography:'Humanist sans',bodyTypography:'Humanist sans',bodyFontSize:16,headingScale:100,headingWeight:650,sectionStrategy:'Alternating subtle sections',surfaceLanguage:'Hairline borders',shapeLanguage:'Soft',surfaceRadius:9,controlRadius:7,buttonRadius:7,buttonWeight:'Balanced',imageryMode:'Product screenshots',imageCharacter:'Documentary',motionAmount:'Low',motionCharacter:'Smooth',accentUsage:'Focused',palette:{ink:'#142233',background:'#f7f8fa',accent:'#2f6c9e',surface:'#e7edf2',muted:'#66727f',positive:'#39765e',border:'#c6d0d9'} } },
  { id: 'neo-editorial', name: 'Neo Editorial', description: 'Asymmetric, type-led and contemporary without becoming decorative.', dna: { personality:'Editorial / Contemporary',density:34,iconWeight:22,cardWeight:10,radius:4,motion:30,typography:'High-contrast serif + grotesk',typographyCharacter:'High-contrast serif',headingTypography:'High-contrast serif',bodyTypography:'Neo-grotesk',bodyFontSize:16,headingScale:138,headingWeight:600,textMeasure:60,whitespacePriority:'Very spacious',gridCharacter:'Asymmetric',alignmentTendency:'Deliberately asymmetric',sectionStrategy:'Editorial blocks',surfaceLanguage:'Borderless',shapeLanguage:'Sharp',surfaceRadius:0,controlRadius:2,buttonRadius:2,imageryMode:'Photography',imageCharacter:'Editorial',imageTreatment:'High contrast',imagePresentation:'Full bleed',motionAmount:'Moderate',motionCharacter:'Editorial',accentUsage:'Focused',palette:{ink:'#151313',background:'#f2f0e8',accent:'#d14b36',surface:'#e6e1d7',muted:'#746f68',positive:'#507764',border:'#c8c2b8'} } },
  { id: 'sports', name: 'Sports Broadcast', description: 'Bold display type, dark surfaces, high contrast and energetic motion.', dna: { personality:'Bold / Sports',density:60,iconWeight:58,cardWeight:48,radius:12,motion:62,typography:'Display / expressive + neo-grotesk',typographyCharacter:'Display / expressive',headingTypography:'Display / expressive',bodyTypography:'Neo-grotesk',headingScale:130,headingWeight:800,themeMode:'Dark only',defaultTheme:'Dark',sectionStrategy:'Strong separated sections',surfaceLanguage:'Mixed containment',shapeLanguage:'Sharp',surfaceRadius:5,controlRadius:5,buttonRadius:5,imageryMode:'Photography',imageCharacter:'Polished commercial',imageTreatment:'High contrast',imagePresentation:'Full bleed',motionAmount:'High',motionCharacter:'Snappy',accentUsage:'Prominent',palette:{ink:'#f4f5f7',background:'#111317',accent:'#d8ff3e',surface:'#20242a',muted:'#9097a1',positive:'#72d48d',border:'#383e46'} } },
  { id: 'warm-commerce', name: 'Warm Commerce', description: 'Tactile, approachable and product-led with warm color relationships.', dna: { personality:'Warm / Product-led',density:34,iconWeight:48,cardWeight:55,radius:48,motion:34,typography:'Humanist sans + editorial accent',typographyCharacter:'Humanist sans',headingTypography:'Editorial serif',bodyTypography:'Humanist sans',bodyFontSize:16,headingScale:112,sectionStrategy:'Tonal layering',surfaceLanguage:'Tonal surfaces',shapeLanguage:'Soft',surfaceRadius:18,controlRadius:12,buttonRadius:14,imageryMode:'Photography',imageCharacter:'Natural',imageTreatment:'Full color',imagePresentation:'Framed',motionAmount:'Moderate',motionCharacter:'Smooth',accentUsage:'Balanced',palette:{ink:'#2b211d',background:'#fff8ef',accent:'#e06b3c',surface:'#f4e6d7',muted:'#806f65',positive:'#4f855c',border:'#decbb8'} } },
  { id: 'mono-utility', name: 'Monochrome Utility', description: 'Functional black-and-white system where type, rules and hierarchy do the work.', dna: { personality:'Minimal / Utility',density:54,iconWeight:44,cardWeight:18,radius:8,motion:12,typography:'Neo-grotesk + mono labels',typographyCharacter:'Neo-grotesk',headingTypography:'Neo-grotesk',bodyTypography:'Neo-grotesk',monospaceUsage:'Metadata only',headingScale:102,sectionStrategy:'Uniform',surfaceLanguage:'Hairline borders',shapeLanguage:'Sharp',surfaceRadius:3,controlRadius:3,buttonRadius:3,imageryMode:'None',motionAmount:'Low',motionCharacter:'Snappy',accentUsage:'Rare',visualAntiPatterns:['Generic SaaS cards','Gradient-heavy UI','Glassmorphism','Excessive pills','Oversized generic hero','Stock imagery','Excessive rounded corners'],palette:{ink:'#111111',background:'#f5f5f2',accent:'#111111',surface:'#e7e7e2',muted:'#6c6c68',positive:'#3e6f50',border:'#c7c7c1'} } },
]

export function visualDnaContract(dna: Dna, prompt = false) {
  const line = (label: string, value: string | number | boolean) => `- ${label}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}`
  const paletteLines = (palette: PaletteRoles) => Object.entries(palette).map(([role, color]) => `  - ${role}: ${color}`).join('\n')
  const sections: [string, (string | null)[]][] = [
    ['Theme',[line('Mode',dna.themeMode),line('Default theme',dna.defaultTheme),line('Respect OS preference',dna.respectOsPreference),line('Remember preference',dna.rememberThemePreference),line('Toggle placement',dna.themeTogglePlacement),line('Dark palette strategy',dna.darkPaletteStrategy),'- Light palette roles:\n'+paletteLines(dna.palette),dna.themeMode==='Light only'?null:dna.darkPaletteStrategy==='Separately curated'?'- Dark palette roles (separately curated):\n'+paletteLines(dna.darkPalette):'- Dark palette roles: Auto-adapt from the light semantic roles while preserving contrast and role meaning']],
    ['Typography',[line('Overall character',dna.typographyCharacter),line('Heading character',dna.headingTypography),line('Body character',dna.bodyTypography),line('Monospace usage',dna.monospaceUsage),line('Body size',`${dna.bodyFontSize}px`),line('Heading scale',`${dna.headingScale}%`),line('Heading weight',dna.headingWeight),line('Body weight',dna.bodyWeight),line('Line height',(dna.lineHeight/100).toFixed(2)),line('Tracking',`${dna.letterSpacing/100}em`),line('Readable text measure',`${dna.textMeasure}ch`)]],
    ['Layout & spacing',[line('Information density',`${dna.density}/100`),line('Content max width',`${dna.contentMaxWidth}px`),line('Page gutters',`${dna.pageGutters}px`),line('Section spacing',`${dna.sectionSpacing}px`),line('Whitespace priority',dna.whitespacePriority),line('Grid character',dna.gridCharacter),line('Alignment tendency',dna.alignmentTendency),line('Responsive behavior',dna.responsiveBehavior),line('Catalog / working-surface density',dna.functionalDensity),line('Mobile-first',dna.mobileFirst)]],
    ['Sections & backgrounds',[line('Section strategy',dna.sectionStrategy),line('Section contrast',`${dna.sectionContrast}/100`),line('Background treatment',dna.backgroundTreatment),line('Section dividers',dna.sectionDividers),line('Hero separation',dna.heroSeparation),line('CTA treatment',dna.ctaTreatment),line('Footer contrast',dna.footerContrast),line('Intentional section variation',dna.variedSections)]],
    ['Surfaces & containment',[line('Surface language',dna.surfaceLanguage),line('Border weight',`${dna.borderWeight}px`),line('Shadow character',dna.shadowCharacter),line('Elevation',`${dna.elevation}/100`),line('Surface contrast',`${dna.surfaceContrast}/100`),line('Gradient usage',dna.gradientUsage),line('Glass usage',dna.glassUsage),line('Texture usage',dna.textureUsage)]],
    ['Shape & controls',[line('Shape language',dna.shapeLanguage),line('Surface radius',`${dna.surfaceRadius}px`),line('Control radius',`${dna.controlRadius}px`),line('Button radius',`${dna.buttonRadius}px`),line('Pill usage',dna.pillUsage),line('Button shape',dna.buttonShape),line('Button weight',dna.buttonWeight),line('Button emphasis',dna.buttonEmphasis),line('Input appearance',dna.inputAppearance),line('Input height',`${dna.inputHeight}px`),line('Form density',dna.formDensity),line('Control border style',dna.controlBorderStyle),line('Hover / active character',dna.hoverCharacter)]],
    ['Imagery & iconography',[line('Imagery',dna.imageryMode),line('Image character',dna.imageCharacter),line('Image treatment',dna.imageTreatment),line('Image presentation',dna.imagePresentation),line('Icon emphasis',`${dna.iconWeight}/100`),line('Icon style',dna.iconStyle),line('Icon geometry',dna.iconGeometry),line('Icon stroke',dna.iconStrokeWeight),line('Icon size',`${dna.iconSize}px`),line('Label unfamiliar icons',dna.labelUnfamiliarIcons),line('Strict icon family consistency',dna.strictIconFamily)]],
    ['Motion',[line('Motion amount',dna.motionAmount),line('Motion character',dna.motionCharacter),line('Page transitions',dna.pageTransition),line('Scroll animation',dna.scrollAnimation),line('Hover response',dna.hoverResponse),line('Typical duration',`${dna.motionDuration}ms`),line('Easing',dna.easing),line('Reduced-motion fallback',dna.reducedMotionFallback)]],
    ['Color behavior & exclusions',[line('Accent usage',dna.accentUsage),line('Color scheme provenance',dna.colorSchemeOrigin || 'Custom / no saved scheme'),`- Explicit visual anti-patterns: ${dna.visualAntiPatterns.length?dna.visualAntiPatterns.join(', '):'None selected'}`]],
  ]
  const body = sections.map(([title,lines]) => `${prompt?title.toUpperCase():`### ${title}`}\n${lines.filter(Boolean).join('\n')}`).join('\n\n')
  const signature = dna.visualSignature.trim()
  return `${body}${signature?`\n\n${prompt?'VISUAL SIGNATURE — USER-PROVIDED / VERBATIM':'### Optional visual signature — verbatim'}\n${signature}\n${prompt?'Treat this as visual intent only. It may clarify structured choices but must not silently rewrite or contradict them.':'This human-written visual intent is passed verbatim. It does not silently mutate the structured Visual Studio settings.'}`:''}`
}
