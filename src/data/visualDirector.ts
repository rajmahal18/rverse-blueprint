import { normalizeDna, recommendedTypographyWeights, type Dna, type VisualOriginality, type DesignAutonomy, type SignatureStrength, type VisualAuthority, type VisualDecisionSource } from './visualDna'
import { applyFullDirection, previewColorScheme, rankedColorSchemes, rankedVisualDirections, visualDirections, type SuggestionContext } from './visualSuggestions'

export type MediaAssistanceInput = {
  generatePlaceholders: boolean
  placeholderStyle: string
  placeholderCoverage: string
}

export type DesignDNA = {
  archetype: string
  visualTension: string
  primaryCharacter: string[]
  composition: string
  geometry: string
  typography: string
  colorBehavior: string
  imagery: string
  motion: string
  density: string
  signatureMoment?: string
  avoid: string[]
}

export type VisualDecision = {
  id: string
  authority: VisualAuthority
  source: VisualDecisionSource
  label: string
  value: string
  reason: string
}

export type PremiumQualitySemantics = {
  means: string[]
  doesNotMean: string[]
}

export type VisualDirectorInput = SuggestionContext & {
  media?: Partial<MediaAssistanceInput>
}

export type VisualDirectorOutput = {
  id: string
  directionName: string
  baseDirectionId: string
  baseDirectionName: string
  thesis: string
  designDNA: DesignDNA
  proposedDna: Dna
  designAutonomy: DesignAutonomy
  visualOriginality: VisualOriginality
  signatureStrength: SignatureStrength
  signatureElement: string
  hardConstraints: string[]
  directionalGuidance: string[]
  implementationFreedom: string[]
  decisions: VisualDecision[]
  typographyDirection: string
  mediaDirection: string
  quality: PremiumQualitySemantics
  rationale: string[]
}

type DirectorProfile = {
  id: string
  name: string
  baseDirectionId: string
  archetype: string
  tension: string
  characters: string[]
  composition: string
  geometry: string
  colorBehavior: string
  imagery: string
  motion: string
  density: string
  signature: string
  avoid: string[]
  thesisLead: string
  preferredSchemeIds?: string[]
}

const profiles: DirectorProfile[] = [
  {
    id: 'automotive-retail',
    name: 'Mechanical Editorial',
    baseDirectionId: 'performance-editorial',
    archetype: 'Editorial automotive retail',
    tension: 'Premium × utilitarian',
    characters: ['confident', 'mechanical', 'image-led', 'sharp'],
    composition: 'Asymmetric editorial layouts with strong product photography and deliberate alignment lines.',
    geometry: 'Sharp edges, narrow radii, strong rules, and restrained technical detailing.',
    colorBehavior: 'Mostly neutral surfaces with concentrated signal/accent color rather than full-page saturation.',
    imagery: 'Real automotive products, installation details, close crops, and storefront context.',
    motion: 'Short, directional, mechanical transitions that never delay navigation or conversion.',
    density: 'Open marketing sections with denser product/category zones.',
    signature: 'Mechanical grid / product-spec ruler language used as a recurring alignment and measurement motif.',
    avoid: ['Generic SaaS cards', 'Abstract tech blobs', 'Excessive pills', 'Overly rounded surfaces', 'Irrelevant software screenshots'],
    thesisLead: 'Build the experience as a premium automotive retail surface with a sharp mechanical-editorial identity.',
    preferredSchemeIds: ['automotive-red', 'monochrome-signal', 'onyx-acid'],
  },
  {
    id: 'clinic-operations',
    name: 'Clinical Calm',
    baseDirectionId: 'calm-service',
    archetype: 'Calm clinical operations',
    tension: 'Trust × efficiency',
    characters: ['reassuring', 'ordered', 'quiet', 'precise'],
    composition: 'Clear task hierarchy with calm sections, stable work surfaces, and minimal decorative interruption.',
    geometry: 'Soft but disciplined radii, clear boundaries, and consistent alignment for clinical scanning.',
    colorBehavior: 'Low-noise neutral or cool clinical surfaces with semantic color reserved for status and risk.',
    imagery: 'Clinical or service imagery only when it helps orientation; operational screens prioritize records over decoration.',
    motion: 'Low, smooth, predictable state feedback with no motion competing with clinical work.',
    density: 'Balanced information density with compact operational areas where scanning matters.',
    signature: 'Calm clinical timeline rhythm for encounters, orders, results, and care progression.',
    avoid: ['Automotive aggression', 'Neon event styling', 'Decorative gradients', 'Overly playful controls', 'Marketing-card repetition'],
    thesisLead: 'Build the experience around clinical trust, fast orientation, and low-friction staff work.',
    preferredSchemeIds: ['sage-teal', 'sage-jade', 'graphite-blue'],
  },
  {
    id: 'government-workforce',
    name: 'Institutional Workforce',
    baseDirectionId: 'civic-clarity',
    archetype: 'Modern institutional workforce system',
    tension: 'Authority × everyday usability',
    characters: ['structured', 'credible', 'scalable', 'legible'],
    composition: 'Strong information hierarchy, predictable navigation, and role-aware operational density rather than decorative storytelling.',
    geometry: 'Restrained institutional geometry with crisp grid logic and clear section boundaries.',
    colorBehavior: 'Conservative neutral/civic palette with controlled official accent and semantic states.',
    imagery: 'Minimal; use official/institutional visuals only when they add context. Operational pages should remain information-first.',
    motion: 'Conservative, brief, and functional.',
    density: 'Medium-to-compact working surfaces with progressive disclosure for advanced controls.',
    signature: 'Institutional/seal-derived grid geometry used subtly in section rules, navigation, and summary blocks.',
    avoid: ['Luxury-editorial theatrics', 'Playful consumer bubbles', 'Excessive dashboard cards', 'Decorative animation', 'Marketing-first hero logic'],
    thesisLead: 'Build the experience as a modern institutional work system: clear, credible, scalable, and easy to operate every day.',
    preferredSchemeIds: ['cobalt-paper', 'graphite-blue', 'navy-gold'],
  },
  {
    id: 'booking-consumer',
    name: 'Courtline Booking',
    baseDirectionId: 'friendly-consumer',
    archetype: 'Energetic mobile booking service',
    tension: 'Energy × first-glance ease',
    characters: ['approachable', 'active', 'obvious', 'mobile'],
    composition: 'Action-first mobile composition with availability, selection, price, and confirmation kept visually close to the booking task.',
    geometry: 'Friendly controls with court-line/grid cues instead of generic rounded SaaS cards.',
    colorBehavior: 'Bright but controlled accent usage for availability, selection, and primary booking actions.',
    imagery: 'Venue/court/product context when useful, but booking availability remains the visual priority.',
    motion: 'Responsive and energetic feedback for slot selection and confirmation, with reduced-motion safety.',
    density: 'Roomy touch targets around a compact availability surface.',
    signature: 'Court-line geometry that frames availability, selected slots, and key dividers without becoming decoration.',
    avoid: ['Dense enterprise dashboard styling', 'Luxury serif dominance', 'Tiny tap targets', 'Generic feature-card rows', 'Motion that slows booking'],
    thesisLead: 'Build the booking experience to feel energetic and brand-specific while keeping the reservation path obvious on first glance.',
    preferredSchemeIds: ['sage-mint', 'sand-orange', 'slate-cyan'],
  },
  {
    id: 'sports-event',
    name: 'Competitive Signal',
    baseDirectionId: 'event-energy',
    archetype: 'Live competitive sports system',
    tension: 'Event energy × data clarity',
    characters: ['bold', 'live', 'high-visibility', 'competitive'],
    composition: 'Live results, standings, schedules, and current-event state dominate the hierarchy; identity frames the data instead of hiding it.',
    geometry: 'Sharp score/broadcast structure, strong rules, and compact information blocks.',
    colorBehavior: 'High-contrast event palette with accent reserved for live state, leaders, actions, and important transitions.',
    imagery: 'Event photography or identity graphics used around live information, never in place of it.',
    motion: 'Fast, snappy, purposeful state changes for live updates and event transitions.',
    density: 'Moderate-to-dense live data with large critical numbers and strong scan paths.',
    signature: 'Broadcast-style score rails / court-line event geometry used consistently across live views.',
    avoid: ['Calm clinic styling', 'Muted luxury layouts', 'Tiny score hierarchy', 'Decorative cards without live purpose', 'Slow cinematic transitions'],
    thesisLead: 'Build the experience like a modern live event surface where competition identity and high-visibility data reinforce each other.',
    preferredSchemeIds: ['onyx-acid', 'automotive-red', 'slate-cyan'],
  },
  {
    id: 'portfolio-creative',
    name: 'Authored Portfolio',
    baseDirectionId: 'editorial-minimal',
    archetype: 'Authored creative portfolio',
    tension: 'Expression × restraint',
    characters: ['distinctive', 'editorial', 'intentional', 'personal'],
    composition: 'Type-led or work-led editorial composition with deliberate asymmetry and fewer repeated containers.',
    geometry: 'Sharp or minimal geometry that supports authorship rather than template familiarity.',
    colorBehavior: 'Restrained base palette with concentrated brand accents and room for project-specific media.',
    imagery: 'Curated project imagery, screenshots, process artifacts, or custom visual moments tied to real work.',
    motion: 'Selective expressive motion used as identity, not constant decoration.',
    density: 'Spacious storytelling with denser case-study/detail moments.',
    signature: 'A distinct interaction or type behavior tied to the creator’s identity and body of work.',
    avoid: ['Generic agency cards', 'Template testimonials filler', 'Default SaaS hero copy', 'Decorative blobs', 'Unrelated stock imagery'],
    thesisLead: 'Build the portfolio as an authored piece rather than a generic agency template, with expression concentrated in a few memorable moments.',
    preferredSchemeIds: ['pure-monochrome', 'monochrome-signal', 'mauve-plum'],
  },
  {
    id: 'technical-operations',
    name: 'Operational Precision',
    baseDirectionId: 'technical-control',
    archetype: 'Technical operational system',
    tension: 'Density × clarity',
    characters: ['precise', 'efficient', 'quiet', 'data-forward'],
    composition: 'Wide structured work surfaces, explicit states, and compact information hierarchy.',
    geometry: 'Sharp grid, defined controls, hairline containment.',
    colorBehavior: 'Neutral surfaces with focused action/semantic accents.',
    imagery: 'Little to none; use diagrams/screenshots only when they explain a task.',
    motion: 'Low and snappy.',
    density: 'Compact operational density with predictable scanning.',
    signature: 'Precision grid / metadata rail used for identifiers, status, and operational context.',
    avoid: ['Decorative marketing sections', 'Large empty hero zones', 'Excessive rounded cards', 'Cinematic motion'],
    thesisLead: 'Build the experience as a precise operational tool where hierarchy and state clarity do more work than decoration.',
    preferredSchemeIds: ['slate-cyan', 'graphite-blue', 'slate-indigo'],
  },
]

const includesAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(needle))
const contextText = (input: VisualDirectorInput) => `${input.appType} ${input.activePacks.join(' ')} ${input.projectContext}`.toLowerCase()

function selectProfile(input: VisualDirectorInput): DirectorProfile {
  const text = contextText(input)
  if (includesAny(text, ['car accessories', 'automotive', 'auto accessories', 'car shop', 'vehicle upgrades', 'banawe'])) return profiles.find((profile) => profile.id === 'automotive-retail')!
  if (input.appType === 'Clinic / EMR' || includesAny(text, ['clinic', 'emr', 'patient', 'medical', 'clinical'])) return profiles.find((profile) => profile.id === 'clinic-operations')!
  if (input.appType === 'Tournament / Event' || includesAny(text, ['tournament', 'standings', 'bracket', 'score', 'sports event', 'live results'])) return profiles.find((profile) => profile.id === 'sports-event')!
  if (input.appType === 'Booking / Scheduling' || includesAny(text, ['booking', 'reserve', 'reservation', 'court booking', 'appointment booking'])) return profiles.find((profile) => profile.id === 'booking-consumer')!
  if (input.appType === 'Portfolio / Marketing' || includesAny(text, ['portfolio', 'developer portfolio', 'creative site', 'personal site', 'case study'])) return profiles.find((profile) => profile.id === 'portfolio-creative')!
  if (input.appType === 'Government System' || includesAny(text, ['hrms', 'human resources', 'workforce', 'employee', 'government', 'ministry', 'personnel'])) return profiles.find((profile) => profile.id === 'government-workforce')!
  if (input.appType === 'Internal / Operations' || input.appType === 'Inventory / POS' || includesAny(text, ['operations', 'inventory', 'admin system', 'dashboard', 'analytics'])) return profiles.find((profile) => profile.id === 'technical-operations')!
  const ranked = rankedVisualDirections(input)[0]
  const fallbackId = ranked?.id === 'calm-service' ? 'clinic-operations' : ranked?.id === 'event-energy' ? 'sports-event' : ranked?.id === 'editorial-minimal' ? 'portfolio-creative' : ranked?.id === 'friendly-consumer' ? 'booking-consumer' : 'technical-operations'
  return profiles.find((profile) => profile.id === fallbackId)!
}

function explicitTypographyPatch(original: Dna): Partial<Dna> {
  const patch: Partial<Dna> = {}
  if (original.headingWeightPreference !== 'Auto / Recommended') {
    patch.headingWeight = original.headingWeight
    patch.headingWeightPreference = original.headingWeightPreference
  }
  if (original.bodyWeightPreference !== 'Auto / Recommended') {
    patch.bodyWeight = original.bodyWeight
    patch.bodyWeightPreference = original.bodyWeightPreference
  }
  if (original.uiWeightPreference !== 'Auto / Recommended') {
    patch.uiWeight = original.uiWeight
    patch.uiWeightPreference = original.uiWeightPreference
  }
  return patch
}

export function reconcileVisualConstraints(original: Dna, proposedInput: Dna): Dna {
  let proposed = normalizeDna({
    ...proposedInput,
    easePriority: original.easePriority,
    mobileFirst: original.mobileFirst,
    reducedMotionFallback: original.reducedMotionFallback,
    visualAntiPatterns: [...original.visualAntiPatterns],
    designAutonomy: original.designAutonomy,
    visualOriginality: original.visualOriginality,
    signatureStrength: original.signatureStrength,
    ...explicitTypographyPatch(original),
  })
  const anti = new Set(original.visualAntiPatterns)
  if (anti.has('Glassmorphism')) proposed = normalizeDna({ ...proposed, glassUsage: 'None', backgroundTreatment: proposed.backgroundTreatment === 'Glass' ? 'Tint' : proposed.backgroundTreatment })
  if (anti.has('Gradient-heavy UI')) proposed = normalizeDna({ ...proposed, gradientUsage: 'None', backgroundTreatment: proposed.backgroundTreatment === 'Gradient' ? 'Tint' : proposed.backgroundTreatment })
  if (anti.has('Excessive pills') && proposed.pillUsage === 'Frequent') proposed = normalizeDna({ ...proposed, pillUsage: 'Tags only', buttonShape: proposed.buttonShape === 'Pill' ? 'Soft rectangle' : proposed.buttonShape })
  if (anti.has('Excessive rounded corners') && proposed.shapeLanguage === 'Rounded') proposed = normalizeDna({ ...proposed, shapeLanguage: 'Soft', surfaceRadius: Math.min(proposed.surfaceRadius, 12), controlRadius: Math.min(proposed.controlRadius, 9), buttonRadius: Math.min(proposed.buttonRadius, 9) })
  if (anti.has('Excessive animations')) proposed = normalizeDna({ ...proposed, motionAmount: proposed.motionAmount === 'High' ? 'Moderate' : proposed.motionAmount, motion: Math.min(proposed.motion, 45) })
  return proposed
}

function applyOriginality(dnaInput: Dna): Dna {
  const dna = normalizeDna(dnaInput)
  if (dna.visualOriginality === 'Safe') return normalizeDna({ ...dna, motion: Math.min(dna.motion, 35), motionAmount: dna.motionAmount === 'High' ? 'Moderate' : dna.motionAmount })
  if (dna.visualOriginality === 'Distinct') return dna
  const bold = dna.visualOriginality === 'Bold'
  const experimental = dna.visualOriginality === 'Experimental'
  const usabilityCap = dna.easePriority === 'Non-negotiable'
  return normalizeDna({
    ...dna,
    headingScale: Math.min(usabilityCap ? 138 : 150, dna.headingScale + (bold ? 8 : 14)),
    sectionContrast: Math.min(100, dna.sectionContrast + (bold ? 8 : 14)),
    motion: Math.min(usabilityCap ? 60 : 76, dna.motion + (bold ? 8 : 16)),
    alignmentTendency: experimental && !usabilityCap ? 'Deliberately asymmetric' : dna.alignmentTendency,
    gridCharacter: experimental && !usabilityCap && ['Flexible grid', 'Content-led'].includes(dna.gridCharacter) ? 'Asymmetric' : dna.gridCharacter,
  })
}

function proposedDnaFor(input: VisualDirectorInput, profile: DirectorProfile): Dna {
  const original = normalizeDna(input.dna)
  const direction = visualDirections.find((item) => item.id === profile.baseDirectionId) ?? rankedVisualDirections(input)[0]
  if (!direction || original.designAutonomy === 'Strict') return reconcileVisualConstraints(original, original)
  let proposed = applyFullDirection(original, direction)
  const hasCustomPalette = original.colorSchemeOrigin === 'Custom' || original.colorSchemeOrigin.toLowerCase().includes('customized')
  if (!hasCustomPalette) {
    const rankedSchemes = rankedColorSchemes({ ...input, dna: proposed })
    const preferred = profile.preferredSchemeIds?.map((id) => rankedSchemes.find((scheme) => scheme.id === id)).find(Boolean)
    const scheme = preferred ?? rankedSchemes[0]
    if (scheme) proposed = previewColorScheme(proposed, scheme)
  } else {
    proposed = normalizeDna({ ...proposed, palette: original.palette, darkPalette: original.darkPalette, colorSchemeOrigin: original.colorSchemeOrigin })
  }
  proposed = applyOriginality(proposed)
  proposed = reconcileVisualConstraints(original, proposed)
  if (original.designAutonomy === 'Balanced') {
    proposed = normalizeDna({
      ...proposed,
      themeMode: original.themeMode,
      defaultTheme: original.defaultTheme,
      respectOsPreference: original.respectOsPreference,
      rememberThemePreference: original.rememberThemePreference,
    })
  }
  const recommended = recommendedTypographyWeights(proposed)
  if (proposed.headingWeightPreference === 'Auto / Recommended') proposed.headingWeight = recommended.headingWeight
  if (proposed.bodyWeightPreference === 'Auto / Recommended') proposed.bodyWeight = recommended.bodyWeight
  if (proposed.uiWeightPreference === 'Auto / Recommended') proposed.uiWeight = recommended.uiWeight
  return normalizeDna(proposed)
}

function signatureFor(profile: DirectorProfile, strength: SignatureStrength) {
  if (strength === 'None') return 'No dedicated signature motif. Distinction should come from composition, typography, imagery, and hierarchy.'
  if (strength === 'Subtle') return `Use a restrained version of this motif: ${profile.signature}`
  if (strength === 'Strong') return `Make this a prominent recurring brand moment without reducing usability: ${profile.signature}`
  return profile.signature
}

function typographyDirection(dna: Dna) {
  return `${dna.headingTypography} headings at ${dna.headingWeight} weight with ${dna.bodyTypography} body at ${dna.bodyWeight}; UI/control weight ${dna.uiWeight}. Use ${dna.weightContrast.toLowerCase()} weight contrast, body size ${dna.bodyFontSize}px, heading scale ${dna.headingScale}%, and ${dna.textMeasure}ch readable measure.`
}

function mediaDirection(profile: DirectorProfile, input: VisualDirectorInput, dna: Dna) {
  const media: MediaAssistanceInput = {
    generatePlaceholders: input.media?.generatePlaceholders ?? true,
    placeholderStyle: input.media?.placeholderStyle ?? 'Auto / Recommended',
    placeholderCoverage: input.media?.placeholderCoverage ?? 'Appropriate coverage',
  }
  if (!media.generatePlaceholders) return `Do not generate placeholder imagery. When media is supplied, follow this direction: ${profile.imagery}`
  const style = media.placeholderStyle === 'Auto / Recommended' ? `${dna.imageCharacter} / ${dna.imageryMode}` : media.placeholderStyle
  return `Generate context-appropriate placeholder imagery with ${media.placeholderCoverage.toLowerCase()} and a ${style} treatment. ${profile.imagery} Keep imagery inside active scope and never invent product modules merely to justify additional media.`
}

function hardConstraints(dna: Dna) {
  const result = [
    `Ease of use: ${dna.easePriority}. Visual originality must never damage primary task completion.`,
    dna.mobileFirst ? 'Mobile composition is first-class; do not merely shrink the desktop layout.' : 'Responsive behavior must remain deliberate across supported sizes.',
    'Accessibility, readable hierarchy, and reduced-motion support remain mandatory quality constraints.',
  ]
  if (dna.visualAntiPatterns.length) result.push(`Avoid: ${dna.visualAntiPatterns.join(', ')}.`)
  if (dna.headingWeightPreference !== 'Auto / Recommended') result.push(`Heading weight is explicitly constrained to ${dna.headingWeight} (${dna.headingWeightPreference}).`)
  if (dna.bodyWeightPreference !== 'Auto / Recommended') result.push(`Body weight is explicitly constrained to ${dna.bodyWeight} (${dna.bodyWeightPreference}).`)
  if (dna.uiWeightPreference !== 'Auto / Recommended') result.push(`UI/control weight is explicitly constrained to ${dna.uiWeight} (${dna.uiWeightPreference}).`)
  return result
}

function decisions(profile: DirectorProfile, original: Dna, proposed: Dna): VisualDecision[] {
  const hard: VisualDecision[] = hardConstraints(original).map((value, index) => ({
    id: `hard-${index + 1}`,
    authority: 'hard',
    source: 'design_baseline',
    label: index === 0 ? 'Usability / constraints' : 'Hard visual constraint',
    value,
    reason: 'Hard constraints outrank Visual Director preferences.',
  }))
  return [
    ...hard,
    { id: 'direction-archetype', authority: 'direction', source: 'visual_director', label: 'Design archetype', value: profile.archetype, reason: 'Synthesized from app type and project context.' },
    { id: 'direction-composition', authority: 'direction', source: 'visual_director', label: 'Composition', value: profile.composition, reason: 'Provides coherent project-level art direction rather than isolated pattern choices.' },
    { id: 'direction-typography', authority: 'direction', source: 'visual_director', label: 'Typography', value: typographyDirection(proposed), reason: 'Typography is resolved as a system, including role weights and scale.' },
    { id: 'freedom-detail', authority: 'freedom', source: 'visual_director', label: 'Implementation detail', value: 'Micro-layout, exact crop positions, minor spacing adjustments, and implementation-specific transitions may be resolved during build as long as they preserve the Visual Thesis and hard constraints.', reason: 'These details benefit from implementation judgment and responsive context.' },
  ]
}

export function synthesizeVisualDirector(input: VisualDirectorInput): VisualDirectorOutput {
  const original = normalizeDna(input.dna)
  const profile = selectProfile({ ...input, dna: original })
  const proposed = proposedDnaFor({ ...input, dna: original }, profile)
  const baseDirection = visualDirections.find((item) => item.id === profile.baseDirectionId) ?? rankedVisualDirections(input)[0]
  const signatureElement = signatureFor(profile, original.signatureStrength)
  const quality: PremiumQualitySemantics = {
    means: ['deliberate composition', 'excellent typography', 'refined spacing', 'strong hierarchy', 'coherent visual language', 'context-appropriate imagery', 'restrained effects', 'intentional responsive behavior', 'realistic content', 'project-specific polish'],
    doesNotMean: ['black/beige by default', 'giant serif headings by default', 'glassmorphism', 'oversized whitespace everywhere', 'generic luxury clichés', 'repeated SaaS-card grids'],
  }
  const thesis = `${profile.thesisLead} Prioritize ${profile.composition.replace(/\.$/, '').toLowerCase()} Use ${profile.geometry.replace(/\.$/, '').toLowerCase()} Keep color behavior ${profile.colorBehavior.replace(/\.$/, '').toLowerCase()} ${original.visualOriginality === 'Safe' ? 'Keep originality restrained.' : `Target ${original.visualOriginality.toLowerCase()} originality while preserving usability.`}`
  return {
    id: profile.id,
    directionName: profile.name,
    baseDirectionId: baseDirection?.id ?? profile.baseDirectionId,
    baseDirectionName: baseDirection?.name ?? profile.name,
    thesis,
    designDNA: {
      archetype: profile.archetype,
      visualTension: profile.tension,
      primaryCharacter: profile.characters,
      composition: profile.composition,
      geometry: profile.geometry,
      typography: typographyDirection(proposed),
      colorBehavior: profile.colorBehavior,
      imagery: profile.imagery,
      motion: profile.motion,
      density: profile.density,
      signatureMoment: original.signatureStrength === 'None' ? undefined : signatureElement,
      avoid: Array.from(new Set([...profile.avoid, ...original.visualAntiPatterns])),
    },
    proposedDna: proposed,
    designAutonomy: original.designAutonomy,
    visualOriginality: original.visualOriginality,
    signatureStrength: original.signatureStrength,
    signatureElement,
    hardConstraints: hardConstraints(original),
    directionalGuidance: [profile.composition, profile.geometry, profile.colorBehavior, profile.imagery, profile.motion, profile.density],
    implementationFreedom: ['Exact component micro-spacing inside the approved rhythm.', 'Responsive crop/stack details that preserve hierarchy.', 'Minor interaction transitions that stay within the motion character.', 'Implementation-specific component structure that does not alter visual or functional intent.'],
    decisions: decisions(profile, original, proposed),
    typographyDirection: typographyDirection(proposed),
    mediaDirection: mediaDirection(profile, input, proposed),
    quality,
    rationale: [
      `Project context/app type matched the ${profile.archetype} profile.`,
      `Base direction: ${baseDirection?.name ?? profile.baseDirectionId}.`,
      `Design autonomy is ${original.designAutonomy}; originality is ${original.visualOriginality}.`,
      'Hard visual constraints are reconciled after synthesis so recommendations cannot silently override explicit exclusions or usability requirements.',
    ],
  }
}

export function visualDirectorPrompt(output: VisualDirectorOutput) {
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n')
  return `VISUAL THESIS\n${output.thesis}\n\nSYNTHESIZED DESIGN DIRECTION\n- Direction: ${output.directionName}\n- Base visual family: ${output.baseDirectionName}\n- Design autonomy: ${output.designAutonomy}\n- Visual originality: ${output.visualOriginality}\n- Signature strength: ${output.signatureStrength}\n\nDESIGN DNA\n- Archetype: ${output.designDNA.archetype}\n- Visual tension: ${output.designDNA.visualTension}\n- Primary character: ${output.designDNA.primaryCharacter.join(', ')}\n- Composition: ${output.designDNA.composition}\n- Geometry: ${output.designDNA.geometry}\n- Typography: ${output.designDNA.typography}\n- Color behavior: ${output.designDNA.colorBehavior}\n- Imagery: ${output.designDNA.imagery}\n- Motion: ${output.designDNA.motion}\n- Density: ${output.designDNA.density}\n- Avoid: ${output.designDNA.avoid.join(', ')}\n\nSIGNATURE DESIGN ELEMENT\n${output.signatureElement}\n\nHARD VISUAL CONSTRAINTS\n${list(output.hardConstraints)}\n\nMEDIA DIRECTION\n${output.mediaDirection}\n\nPREMIUM QUALITY SEMANTICS\nPremium means: ${output.quality.means.join(', ')}.\nPremium does not automatically mean: ${output.quality.doesNotMean.join(', ')}.\n\nIMPLEMENTATION FREEDOM\n${list(output.implementationFreedom)}`
}
