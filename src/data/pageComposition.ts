import { effectiveConfigValue, resolveScope, type ProjectConfig } from './configurator'
import { normalizeDna, type Dna } from './visualDna'
import type { VisualDirectorOutput } from './visualDirector'
import type { PatternExplorerIntelligence } from './patternIntelligence'

export type CompositionAuthority = 'active_scope' | 'context_completion' | 'visual_direction'
export type CompositionScopeState = 'implementation' | 'advisory'
export type QualityStatus = 'clear' | 'review' | 'risk'

export type PageSection = {
  id: string
  label: string
  role: string
  composition: string
  authority: CompositionAuthority
  signaturePlacement?: string
}

export type PageComposition = {
  id: string
  name: string
  purpose: string
  scopeState: CompositionScopeState
  scopeReason: string
  visualAnchor: string
  sections: PageSection[]
  contentRhythm: string
  ctaStrategy: string
  imageryPlacement: string
  mobileRecomposition: string[]
  densityBehavior: string
  primaryInteraction: string
  avoid: string[]
  signaturePlacement: string
}

export type VisualQualityDimension = {
  id: string
  label: string
  status: QualityStatus
  observation: string
}

export type VisualQualityReview = {
  status: 'CLEAR' | 'REVIEW' | 'HIGH RISK'
  dimensions: VisualQualityDimension[]
  warnings: string[]
  summary: string
}

export type FrontendQualityContract = {
  appliesTo: string
  criteria: string[]
}

export type PageCompositionIntelligence = {
  domain: string
  pages: PageComposition[]
  responsiveRules: string[]
  frontendQualityContract: FrontendQualityContract
  visualQualityReview: VisualQualityReview
  scopeGuardrail: string
}

export type PageCompositionInput = {
  config: ProjectConfig
  dna: Dna
  director: VisualDirectorOutput
  patternIntelligence: PatternExplorerIntelligence
  projectContext: string
  selectedPatternIds?: string[]
  visualContradictionCount?: number
}

type PageSeed = Omit<PageComposition, 'scopeState' | 'scopeReason'> & {
  scopePack?: string
  allowContextCompletion?: boolean
}

const genericSequence = ['Hero', '3 feature cards', 'About', 'Testimonials', 'CTA', 'Footer']
const publicDomains = new Set(['automotive-retail', 'portfolio-creative', 'booking-consumer', 'sports-event'])

const contextIncludes = (context: string, terms: string[]) => terms.some((term) => context.toLowerCase().includes(term))
const hasActivePack = (config: ProjectConfig, pack: string | undefined) => !pack || resolveScope(config, pack).active

function section(id: string, label: string, role: string, composition: string, authority: CompositionAuthority = 'visual_direction', signaturePlacement?: string): PageSection {
  return { id, label, role, composition, authority, signaturePlacement }
}

function pageSeeds(input: PageCompositionInput): PageSeed[] {
  const signature = input.director.signatureElement
  const context = input.projectContext.toLowerCase()

  switch (input.director.id) {
    case 'automotive-retail':
      return [
        {
          id: 'home', name: 'Homepage', scopePack: 'pack.portfolio', allowContextCompletion: true,
          purpose: 'Establish trust quickly, show the kinds of upgrades/products available, and make visiting or contacting the physical shop obvious.',
          visualAnchor: 'Large real automotive/product photography with cropped mechanical detail rather than abstract illustration.',
          sections: [
            section('hero', 'Visual-first shop hero', 'Orient visitors and establish automotive character.', 'Asymmetric headline/product image composition with one dominant customer action; avoid a generic centered SaaS hero.', 'context_completion', 'Introduce the mechanical grid/spec-ruler motif as an alignment device, not decoration.'),
            section('categories', 'Product / upgrade categories', 'Help customers understand what the shop carries.', 'Image-led category strip or editorial grid with varied media scale; avoid three identical feature cards.', 'context_completion'),
            section('featured', 'Featured upgrades', 'Surface concrete reasons to visit or inquire.', 'Use large product crops, short benefit copy, and selective technical detail instead of software-style cards.', 'context_completion'),
            section('story', 'Product / installation story', 'Create one memorable brand-specific visual moment.', 'One full-width or offset image story with product detail interacting with the grid and headline structure.', 'visual_direction', signature),
            section('capability', 'Shop capability / reasons to visit', 'Explain practical service value and trust signals.', 'Use proof, service capability, or installation context in a low-card-count editorial composition.', 'context_completion'),
            section('location', 'Location / store information', 'Make finding the physical shop effortless.', 'Give map/address/hours/contact a prominent dedicated band or split layout with strong scan hierarchy.', 'context_completion'),
            section('contact', 'Contact / directions CTA', 'Convert intent into a visit or inquiry.', 'Compact high-contrast action area tied to directions/contact—not a generic marketing CTA strip.', 'context_completion'),
          ],
          contentRhythm: 'Alternate large image-led moments with compact practical information; create contrast between open storytelling and denser product discovery.',
          ctaStrategy: 'Primary actions should be customer verbs such as View products, Get directions, Call/message, or Visit the shop. Do not use implementation/meta language.',
          imageryPlacement: 'Product and installation imagery should dominate the hero, categories, and story section; storefront/location imagery belongs near visit information.',
          mobileRecomposition: ['Stack hero copy and imagery intentionally instead of shrinking the desktop split.', 'Keep directions/contact reachable without scrolling through every marketing section.', 'Convert category layouts to compact horizontally scannable or 2-column touch-friendly structures.', 'Preserve the signature grid/ruler motif as a subtle alignment cue, not tiny decorative noise.'],
          densityBehavior: 'Open at the top and around story imagery; denser where customers compare product categories or store details.',
          primaryInteraction: 'Browse products/upgrades, then locate or contact the shop.',
          avoid: ['Hero → 3 cards → About → Testimonials → CTA template sequence', 'Generic SaaS feature cards', 'Abstract tech illustrations', 'Irrelevant software screenshots', 'Developer-facing copy'],
          signaturePlacement: 'Use the mechanical grid/spec-ruler motif most strongly in the hero/product-story transition and lightly in category alignment.'
        },
        {
          id: 'products', name: 'Products / Upgrades', scopePack: 'pack.portfolio', allowContextCompletion: true,
          purpose: 'Let visitors scan available product categories and representative upgrades without implying transactional checkout.',
          visualAnchor: 'Product photography and category hierarchy.',
          sections: [
            section('intro', 'Category orientation', 'Set expectations for what customers can explore.', 'Compact editorial intro with category navigation; avoid oversized hero repetition.', 'context_completion'),
            section('catalog', 'Image-led product/category browse', 'Support browsing without inventing cart/checkout.', 'Use varied image sizes, grouped categories, and concise details; cards are allowed only when they genuinely aid comparison.', 'context_completion'),
            section('proof', 'Installation / fit context', 'Connect products to real-world vehicle use.', 'Use installation details, before/after context, or fitment notes where appropriate.', 'context_completion', 'Apply spec-ruler language to measurements/fit details only when meaningful.'),
            section('visit', 'Visit / inquire action', 'Route product interest to the actual shop.', 'End with location/contact actions instead of checkout unless commerce scope is explicitly active.', 'context_completion'),
          ],
          contentRhythm: 'Dense browsing clusters broken by larger photographic proof moments.',
          ctaStrategy: 'Use inquire/visit/contact actions unless pack.commerce is active; never infer cart or checkout.',
          imageryPlacement: 'Products remain the content, not background decoration.',
          mobileRecomposition: ['Use sticky or nearby category navigation only if it reduces effort.', 'Keep product rows compact with readable names and large enough media.', 'Do not convert every item into oversized vertical cards.'],
          densityBehavior: 'Moderate-to-dense for browsing, with generous separation between product families.',
          primaryInteraction: 'Scan categories and identify products worth asking about or visiting for.',
          avoid: ['Checkout assumptions', 'Inventory availability claims without scope/data', 'Uniform card wall', 'Tiny product imagery'],
          signaturePlacement: 'Use technical alignment/ruler details around category labels or fitment metadata, not every item.'
        },
        {
          id: 'visit', name: 'Visit / Contact', scopePack: 'pack.portfolio', allowContextCompletion: true,
          purpose: 'Make store discovery, opening information, and contact actions unmistakable.',
          visualAnchor: 'Storefront/location context and clear address information.',
          sections: [
            section('location', 'Store location', 'Answer where the shop is.', 'Map/location information should be visually primary and easy to scan.', 'context_completion'),
            section('hours', 'Hours / practical details', 'Answer when and how to visit.', 'Compact factual layout with no marketing filler.', 'context_completion'),
            section('contact', 'Contact actions', 'Enable immediate call/message/directions.', 'Large touch-friendly customer actions with clear labels.', 'context_completion'),
          ],
          contentRhythm: 'Practical and compact; no need for decorative storytelling.',
          ctaStrategy: 'Directions, call, message, or other explicitly configured contact methods.',
          imageryPlacement: 'Use storefront/landmark photography only if it helps recognition.',
          mobileRecomposition: ['Prioritize tap-to-call/message/directions actions near the top.', 'Keep map and address usable without horizontal overflow.'],
          densityBehavior: 'Compact factual density.',
          primaryInteraction: 'Find and contact the physical shop.',
          avoid: ['Long brand essay', 'Generic lead-capture forms unless explicitly selected', 'Decorative feature cards'],
          signaturePlacement: 'Keep the motif minimal here; clarity outranks branding.'
        },
      ]

    case 'clinic-operations':
      return [
        {
          id: 'clinical-home', name: 'Clinical workspace', scopePack: 'pack.clinic',
          purpose: 'Help staff identify today’s work, patients requiring attention, and the next safe clinical action.',
          visualAnchor: 'Operational queue/state hierarchy rather than imagery.',
          sections: [
            section('today', 'Today / active queue', 'Make current workload obvious.', 'Structured list/queue with priority and status encoded semantically; avoid a wall of KPI cards.', 'active_scope'),
            section('exceptions', 'Needs attention', 'Surface incomplete, delayed, or high-priority clinical work.', 'Small exception band or filtered queue, not decorative alerts.', 'active_scope'),
            section('recent', 'Recent patient activity', 'Support rapid continuation of care.', 'Information-first rows with identifiers, status, and last action.', 'active_scope'),
          ],
          contentRhythm: 'Stable, predictable task blocks with minimal decorative interruption.',
          ctaStrategy: 'Primary actions are clinical/workflow verbs such as Open patient, Start encounter, Continue order, or Review result.',
          imageryPlacement: 'Avoid decorative clinical stock imagery on operational surfaces.',
          mobileRecomposition: ['Collapse secondary metadata before primary patient/status information.', 'Turn side-by-side queues into ordered vertical task groups.', 'Keep critical actions visible without relying on hover.'],
          densityBehavior: 'Balanced-to-compact scanning density with generous separation around safety-critical actions.',
          primaryInteraction: 'Open the correct patient/task and continue care safely.',
          avoid: ['Marketing hero', 'Decorative health photography', 'Oversized cards for every metric', 'Playful consumer motion'],
          signaturePlacement: 'Use the clinical timeline rhythm in activity/progression views, not as decoration around every panel.'
        },
        {
          id: 'patient-record', name: 'Patient record', scopePack: 'pack.clinic',
          purpose: 'Provide a coherent longitudinal patient view with current context and safe access to clinical detail.',
          visualAnchor: 'Patient identity/context header + longitudinal clinical timeline.',
          sections: [
            section('identity', 'Patient context header', 'Prevent wrong-patient ambiguity.', 'Persistent concise identity/status context with high readability.', 'active_scope'),
            section('timeline', 'Clinical timeline', 'Organize encounters, orders, results, medicines, and referrals over time.', 'Use the signature timeline rhythm to distinguish sequence and status.', 'active_scope', signature),
            section('current', 'Current encounter / active care', 'Keep today’s work distinguishable from historical information.', 'Stronger containment and clear current-state emphasis.', 'active_scope'),
          ],
          contentRhythm: 'Longitudinal information with strong current-vs-history separation.',
          ctaStrategy: 'Actions belong near the clinical object they affect; destructive/high-risk actions require explicit confirmation and permissions.',
          imageryPlacement: 'None unless medically relevant attachments/images are part of active scope.',
          mobileRecomposition: ['Keep patient identity visible while collapsing secondary demographics.', 'Use progressive disclosure for historical sections.', 'Preserve chronological order and status clarity in one column.'],
          densityBehavior: 'Dense but segmented; current care remains easiest to find.',
          primaryInteraction: 'Review history and continue the current care workflow.',
          avoid: ['Dashboard-card treatment for every clinical section', 'Hidden patient identity', 'Decorative animations'],
          signaturePlacement: 'The timeline is the signature motif’s functional home.'
        },
      ]

    case 'government-workforce':
      return [
        {
          id: 'workforce-home', name: 'Workforce overview', scopePack: 'pack.government',
          purpose: 'Give staff a credible starting point for workforce records, pending work, and role-appropriate next actions.',
          visualAnchor: 'Structured institutional information hierarchy and queue/state summary.',
          sections: [
            section('context', 'Role / office context', 'Orient the user to organizational scope.', 'Compact institutional header/rail, not a marketing hero.', 'active_scope', 'Use seal-derived grid geometry subtly in alignment and section rules.'),
            section('work', 'Pending / priority work', 'Surface tasks requiring action.', 'List/queue first; metrics only when they change decisions.', 'active_scope'),
            section('people', 'Workforce / employee access', 'Provide fast entry to records and directories.', 'Search/list hierarchy with clear filters and organizational context.', 'active_scope'),
            section('updates', 'Recent changes / notices', 'Support accountability and continuity.', 'Chronological or categorized feed with restrained containment.', 'active_scope'),
          ],
          contentRhythm: 'Consistent institutional bands with compact operational zones; avoid decorative section alternation.',
          ctaStrategy: 'Use explicit administrative verbs tied to permissions and workflow state.',
          imageryPlacement: 'Minimal; official/institutional imagery only when it communicates context.',
          mobileRecomposition: ['Prioritize search, pending work, and record access.', 'Move secondary organizational summaries below primary actions.', 'Convert wide tables into responsive row/detail patterns instead of horizontal squeeze.'],
          densityBehavior: 'Medium-to-compact with strong labels and progressive disclosure.',
          primaryInteraction: 'Find a person/record or act on pending workforce work.',
          avoid: ['Luxury editorial hero', 'Decorative civic imagery', 'KPI-card dumping ground', 'Consumer-style playful controls'],
          signaturePlacement: 'Use institutional grid geometry in navigation/section rules and identity context, not as a full-page pattern.'
        },
        {
          id: 'employee-record', name: 'Employee / personnel record', scopePack: 'pack.government',
          purpose: 'Present personnel information, history, and authorized actions with clear institutional context.',
          visualAnchor: 'Identity + employment status + organized record sections.',
          sections: [
            section('identity', 'Employee identity / appointment context', 'Prevent ambiguity and show current status.', 'Compact structured identity block with official reference information.', 'active_scope'),
            section('record', 'Record sections', 'Organize employment, assignment, documents, and related data.', 'Use grouped sections/tabs only where they reduce navigation effort.', 'active_scope'),
            section('history', 'Activity / change history', 'Support accountability.', 'Chronological log or workflow trail with readable actors/states.', 'active_scope'),
          ],
          contentRhythm: 'Information-dense but predictable, with strong group headings rather than many cards.',
          ctaStrategy: 'Actions remain permission-aware and positioned with the record state they affect.',
          imageryPlacement: 'Profile image only if active scope requires it; otherwise information remains primary.',
          mobileRecomposition: ['Stack identity and status before secondary metadata.', 'Turn wide record tables into grouped rows/detail drawers where appropriate.', 'Keep primary workflow actions obvious and labeled.'],
          densityBehavior: 'Compact operational density with clear section boundaries.',
          primaryInteraction: 'Review an employee record and perform authorized personnel actions.',
          avoid: ['Card-per-field layouts', 'Decorative marketing content', 'Ambiguous action menus'],
          signaturePlacement: 'Use grid/seal-derived structure in section headings and reference metadata.'
        },
      ]

    case 'booking-consumer':
      return [
        {
          id: 'availability', name: 'Availability / booking', scopePack: 'pack.booking',
          purpose: 'Let customers understand availability and commit to a valid booking with minimal cognitive load.',
          visualAnchor: 'Availability matrix/list and current selection.',
          sections: [
            section('context', 'Resource/date context', 'Keep what is being booked obvious.', 'Compact selector/header directly above availability.', 'active_scope'),
            section('availability', 'Availability', 'Make open vs unavailable options obvious.', 'The scheduling surface is the dominant visual object; avoid burying it under marketing cards.', 'active_scope', 'Use court-line geometry to frame slots/selection and primary dividers.'),
            section('selection', 'Current selection / price', 'Keep chosen time and cost visible.', 'Sticky or nearby summary; do not force repeated scrolling.', 'active_scope'),
            section('action', 'Continue / confirm', 'Advance the booking safely.', 'One clear primary action with concise validation/recovery.', 'active_scope'),
          ],
          contentRhythm: 'Task-first: context → availability → selection → action, with brand moments around rather than inside the booking logic.',
          ctaStrategy: 'Use reserve/continue/confirm language based on the actual workflow stage.',
          imageryPlacement: 'Venue imagery can orient users but must not compete with availability.',
          mobileRecomposition: ['Make the booking flow the first meaningful content.', 'Use touch-friendly slot controls and sticky selection summary where helpful.', 'Collapse secondary venue details below the active booking task.', 'Never make users horizontally zoom a desktop schedule.'],
          densityBehavior: 'Compact availability with generous touch targets and a simple summary area.',
          primaryInteraction: 'Choose an available slot and continue to the next explicitly scoped booking step.',
          avoid: ['Marketing hero before availability', 'Tiny calendar cells', 'Dense admin dashboard styling', 'Hidden total/selection'],
          signaturePlacement: 'Court-line motif belongs in slot grouping and selected-state framing.'
        },
        {
          id: 'review', name: 'Booking review / confirmation', scopePack: 'pack.booking',
          purpose: 'Let customers verify booking details and understand success, pending, or failure state.',
          visualAnchor: 'Booking summary and status.',
          sections: [
            section('summary', 'Booking summary', 'Confirm resource/date/time and other scoped details.', 'Readable concise summary with no redundant cards.', 'active_scope'),
            section('payment', 'Payment / fee state', 'Show money only when payments scope is active.', hasActivePack(input.config, 'pack.payments') ? 'Keep payment state and amount explicit with provider-safe status language.' : 'Do not invent payment UI; omit this section from implementation if payments are inactive.', hasActivePack(input.config, 'pack.payments') ? 'active_scope' : 'visual_direction'),
            section('status', 'Confirmation / recovery', 'Explain what happened and what the user should do next.', 'Use strong status hierarchy and next action, not celebratory decoration that obscures details.', 'active_scope'),
          ].filter((item) => item.id !== 'payment' || hasActivePack(input.config, 'pack.payments')),
          contentRhythm: 'Compact verification followed by explicit state/recovery.',
          ctaStrategy: 'Primary next action depends on booking state: confirm, retry, manage, or return.',
          imageryPlacement: 'Minimal; booking facts and status are primary.',
          mobileRecomposition: ['Show critical booking facts before secondary policy copy.', 'Keep next action immediately reachable.'],
          densityBehavior: 'Compact summary density.',
          primaryInteraction: 'Verify details and understand the next state/action.',
          avoid: ['Unverified “success” assumptions', 'Payment UI when payments scope is inactive', 'Decorative confirmation clutter'],
          signaturePlacement: 'Use the court-line motif as a restrained status/summary frame.'
        },
      ]

    case 'sports-event':
      return [
        {
          id: 'event-home', name: 'Live event home', scopePack: 'pack.tournament',
          purpose: 'Make the current state of the event—live matches, leaders, schedule, and standings—obvious at first glance.',
          visualAnchor: 'Live/current match state and high-visibility competitive data.',
          sections: [
            section('live', 'Live / current matches', 'Answer what is happening now.', 'High-contrast live rail or match block with large critical scores/status.', 'active_scope', 'Use broadcast/court-line score geometry here as the strongest signature placement.'),
            section('next', 'Up next / schedule', 'Show what happens next.', 'Compact schedule strip/list with current/upcoming distinction.', 'active_scope'),
            section('standings', 'Standings / leaders', 'Make competitive position easy to scan.', 'Table/rank structure with visual emphasis on leaders and qualifiers.', 'active_scope'),
            section('event', 'Event identity / context', 'Frame the competition without hiding live data.', 'Use event media/identity around the data rather than replacing it.', 'visual_direction'),
          ],
          contentRhythm: 'Dense live data punctuated by larger identity moments; current state always wins the hierarchy.',
          ctaStrategy: 'Actions are event verbs such as View match, Full standings, Schedule, or Team details.',
          imageryPlacement: 'Event photography/graphics support identity around live modules.',
          mobileRecomposition: ['Put live/current state first.', 'Use horizontally concise score blocks and vertically stacked schedules.', 'Keep standings readable without requiring desktop-width tables.'],
          densityBehavior: 'Moderate-to-dense data with large critical numbers and clear grouping.',
          primaryInteraction: 'See current event state and drill into matches/standings.',
          avoid: ['Marketing hero before live state', 'Tiny scores', 'Decorative cards with no event purpose', 'Slow cinematic transitions'],
          signaturePlacement: 'Broadcast-style score rails/court geometry should anchor live and standings areas.'
        },
        {
          id: 'match-center', name: 'Match / score center', scopePack: 'pack.tournament',
          purpose: 'Show one match clearly, including score, status, participants, and scoped detail.',
          visualAnchor: 'Score/status hierarchy.',
          sections: [
            section('score', 'Scoreboard', 'Make result/current score unmistakable.', 'Large numeric hierarchy with participants and state.', 'active_scope', signature),
            section('detail', 'Match detail', 'Provide sequence/lineup/stat detail only if active scope includes it.', 'Compact structured data; avoid decorative metric cards.', 'active_scope'),
            section('navigation', 'Previous / next context', 'Keep users oriented within the event.', 'Simple contextual links/rail.', 'active_scope'),
          ],
          contentRhythm: 'Score first, detail second, navigation last.',
          ctaStrategy: 'View team/player/event context; administrative scoring actions remain role/scope dependent.',
          imageryPlacement: 'Optional event identity or participant media, secondary to score.',
          mobileRecomposition: ['Preserve large score hierarchy.', 'Stack secondary match metadata below participants.', 'Keep admin actions separate from public viewing controls.'],
          densityBehavior: 'High information clarity with compact supporting detail.',
          primaryInteraction: 'Understand the match result/state immediately.',
          avoid: ['Small score hierarchy', 'Card wall', 'Identity graphics obscuring live data'],
          signaturePlacement: 'Use the score-rail motif directly in the scoreboard structure.'
        },
      ]

    case 'portfolio-creative':
      return [
        {
          id: 'portfolio-home', name: 'Portfolio / work home', scopePack: 'pack.portfolio', allowContextCompletion: true,
          purpose: 'Establish the creator’s point of view and move visitors quickly into real work.',
          visualAnchor: 'Selected work/project media or authored typography—not generic product UI.',
          sections: [
            section('intro', 'Authored introduction', 'Express identity and positioning succinctly.', 'Type-led or work-led opening with deliberate asymmetry; avoid generic “Hi, I’m…” template treatment.', 'context_completion', 'Introduce the project-specific interaction/type motif once, clearly.'),
            section('work', 'Selected work', 'Make actual projects the main proof.', 'Large varied project media with editorial pacing, not identical cards.', 'context_completion'),
            section('proof', 'Capabilities / proof', 'Support credibility without becoming a SaaS feature list.', 'Use concise evidence, outcomes, or role context integrated with work.', 'context_completion'),
            section('contact', 'Contact / next step', 'Give interested visitors a clear path forward.', 'Simple direct action with restrained framing.', 'context_completion'),
          ],
          contentRhythm: 'Spacious authored storytelling with denser project detail moments.',
          ctaStrategy: 'View project/case study, contact, or explicitly chosen next steps.',
          imageryPlacement: 'Real project screenshots/media/process artifacts dominate proof areas.',
          mobileRecomposition: ['Prioritize work previews over decorative intro height.', 'Preserve editorial rhythm with varied media scale rather than flattening everything into identical cards.', 'Keep contact easy to reach.'],
          densityBehavior: 'Spacious overall, denser around project information.',
          primaryInteraction: 'Explore real work and understand the creator’s capability.',
          avoid: ['Generic SaaS cards', 'Fake metrics', 'Template testimonials without evidence', 'Repeated centered sections'],
          signaturePlacement: 'Use the custom interaction/type behavior at the opening and in one project transition, not continuously.'
        },
        {
          id: 'case-study', name: 'Case study', scopePack: 'pack.portfolio', allowContextCompletion: true,
          purpose: 'Explain one project through problem, decisions, evidence, and outcome.',
          visualAnchor: 'Project media and the most important decision/outcome.',
          sections: [
            section('summary', 'Project summary', 'Orient quickly.', 'Concise role/context/outcome with one strong visual.', 'context_completion'),
            section('story', 'Problem → decisions → result', 'Show actual thinking and work.', 'Editorial narrative with media placed beside the decision it proves.', 'context_completion', signature),
            section('details', 'Technical / process detail', 'Provide depth without overwhelming the main story.', 'Use expandable or clearly separated detail blocks.', 'context_completion'),
            section('next', 'Related work / contact', 'Continue exploration.', 'One or two clear next routes, not a generic CTA band.', 'context_completion'),
          ],
          contentRhythm: 'Narrative progression with visual evidence; avoid repetitive equal-height sections.',
          ctaStrategy: 'Move to related work or contact based on visitor intent.',
          imageryPlacement: 'Media should prove the surrounding claim or design decision.',
          mobileRecomposition: ['Keep narrative order intact.', 'Place supporting media immediately after the idea it supports.', 'Avoid side-by-side text/media that becomes unreadably narrow.'],
          densityBehavior: 'Variable: open narrative, dense implementation/process detail when needed.',
          primaryInteraction: 'Understand the project and decide whether to explore more work/contact.',
          avoid: ['Screenshot dump', 'Unsubstantiated claims', 'Identical card sections'],
          signaturePlacement: 'Use the signature behavior in one transition or media treatment tied to the case study.'
        },
      ]

    default:
      return [
        {
          id: 'operations-home', name: 'Primary operational workspace',
          purpose: 'Help users understand current state, find the right record/task, and take the next valid action.',
          visualAnchor: 'Current operational state and the primary work object.',
          sections: [
            section('context', 'Operational context', 'Orient the user.', 'Compact context/header rather than a marketing hero.'),
            section('work', 'Primary work queue / records', 'Put the actual work first.', 'List/table/detail hierarchy chosen for the data shape; avoid card-per-record by default.'),
            section('exceptions', 'Exceptions / next actions', 'Surface meaningful problems or next work.', 'Small prioritized area tied to action.'),
          ],
          contentRhythm: 'Predictable work surfaces with strong hierarchy and low decorative noise.',
          ctaStrategy: 'Use domain/task verbs and permission-aware actions.',
          imageryPlacement: 'Little or none unless media is part of the active task.',
          mobileRecomposition: ['Prioritize current task/context.', 'Collapse secondary columns into detail rows.', 'Never shrink a desktop table until it becomes unreadable.'],
          densityBehavior: 'Compact operational density with progressive disclosure.',
          primaryInteraction: 'Find or act on the relevant operational object.',
          avoid: ['Marketing hero', 'Decorative cards', 'Cinematic motion'],
          signaturePlacement: 'Use the Visual Director signature only where it reinforces operational context or state.'
        },
      ]
  }
}

function scopeState(seed: PageSeed, input: PageCompositionInput): Pick<PageComposition, 'scopeState' | 'scopeReason'> {
  if (hasActivePack(input.config, seed.scopePack)) return { scopeState: 'implementation', scopeReason: seed.scopePack ? `Supported by active ${seed.scopePack} scope.` : 'General composition guidance inside the current product shape.' }
  if (seed.allowContextCompletion) return { scopeState: 'advisory', scopeReason: 'Context-completion visual proposal only. Review/activate the corresponding App Setup scope before treating this page as required implementation.' }
  return { scopeState: 'advisory', scopeReason: `The composition is useful as design planning, but ${seed.scopePack ?? 'its supporting functional scope'} is not active and must not be implemented solely from this proposal.` }
}

function deriveResponsiveRules(input: PageCompositionInput, pages: PageComposition[]): string[] {
  const dna = normalizeDna(input.dna)
  const rules = [
    'Mobile must be recomposed around the page’s primary task and visual anchor; do not merely scale down desktop typography and columns.',
    'When a desktop composition uses side-by-side regions, define an explicit mobile priority order before stacking.',
    'Replace wide tables/grids with responsive row/detail, grouped, or scroll-safe patterns appropriate to the domain rather than shrinking content below readable/tappable sizes.',
    'Keep the primary action and critical state reachable without hover-only behavior.',
  ]
  if (dna.easePriority === 'Non-negotiable') rules.push('First-glance usability outranks visual novelty on small screens; hide/defer secondary detail before compromising primary-task clarity.')
  if (pages.some((page) => page.mobileRecomposition.some((rule) => /sticky|reachable|first/i.test(rule)))) rules.push('Use sticky/fixed mobile affordances only when they reduce repeated navigation effort and do not cover essential content.')
  return rules
}

function templateRisk(pages: PageComposition[]) {
  const labels = pages.flatMap((page) => page.sections.map((item) => item.label.toLowerCase())).join(' | ')
  const genericHits = genericSequence.filter((item) => labels.includes(item.toLowerCase().replace('3 feature cards', 'feature')))
  const repetitive = pages.some((page) => page.sections.length >= 4 && page.sections.every((item) => /card/i.test(item.composition)))
  return { genericHits, repetitive }
}

function qualityDimensions(input: PageCompositionInput, pages: PageComposition[]): VisualQualityDimension[] {
  const dna = normalizeDna(input.dna)
  const anti = input.patternIntelligence.antiHomogeneity
  const { genericHits, repetitive } = templateRisk(pages)
  const publicSurface = publicDomains.has(input.director.id) || contextIncludes(input.projectContext, ['public website', 'customers', 'visitors', 'shop', 'portfolio', 'booking'])
  const copyGuard = String(effectiveConfigValue(input.config, 'content.publicCopyGuardrails'))
  const imageryNeeded = ['automotive-retail', 'portfolio-creative'].includes(input.director.id)
  const imageryWeak = imageryNeeded && (dna.imageryMode === 'None' || dna.imageryMode === 'Product screenshots' && input.director.id === 'automotive-retail')
  const signatureMissing = dna.visualOriginality !== 'Safe' && dna.signatureStrength === 'None'
  const contradictions = input.visualContradictionCount ?? 0

  return [
    { id: 'coherence', label: 'Visual coherence', status: contradictions ? 'risk' : 'clear', observation: contradictions ? `${contradictions} deterministic visual contradiction${contradictions === 1 ? '' : 's'} should be resolved before implementation.` : 'Page composition follows the synthesized Visual Director direction and hard constraints.' },
    { id: 'composition-originality', label: 'Composition originality', status: anti.level === 'HIGH' ? 'review' : genericHits.length || repetitive ? 'review' : 'clear', observation: anti.level === 'HIGH' ? 'The current visual direction resembles recent project history; use the anti-homogeneity diversification guidance without random restyling.' : genericHits.length || repetitive ? 'The composition shows signs of a generic repeated marketing/card sequence. Rework section grammar around the domain-specific primary task.' : 'The composition uses domain-specific structure rather than a universal section template.' },
    { id: 'content-realism', label: 'Content realism', status: imageryWeak ? 'review' : 'clear', observation: imageryWeak ? 'The current imagery mode is weak for this physical/product domain. Use real/context-appropriate media or generated placeholders that match the approved direction.' : 'Content/media direction is tied to the actual domain and primary user goal.' },
    { id: 'template-risk', label: 'Template risk', status: genericHits.length >= 3 || repetitive ? 'risk' : 'clear', observation: genericHits.length >= 3 || repetitive ? 'The page risks reading as a generic generated template. Avoid repeated equal cards and the default Hero → cards → About → Testimonials → CTA rhythm.' : 'No deterministic generic-template sequence is driving the current page models.' },
    { id: 'ai-slop', label: 'AI-slop risk', status: signatureMissing || imageryWeak || (publicSurface && copyGuard === 'Off') ? 'review' : 'clear', observation: signatureMissing ? 'Originality is above Safe but no signature element is active; the result may feel polished yet anonymous.' : imageryWeak ? 'Generic or mismatched media can make the output feel synthetic even when layout is coherent.' : publicSurface && copyGuard === 'Off' ? 'Public copy guardrails are disabled, increasing the chance of developer/meta language leaking into customer-facing content.' : 'No obvious deterministic AI-slop trigger is present in the current composition contract.' },
    { id: 'instruction-contradiction', label: 'Instruction contradiction', status: contradictions ? 'risk' : 'clear', observation: contradictions ? 'Resolve explicit visual conflicts rather than asking implementation to satisfy incompatible directions.' : 'No known deterministic visual contradiction is unresolved.' },
    { id: 'imagery', label: 'Imagery appropriateness', status: imageryWeak ? 'risk' : 'clear', observation: imageryWeak ? 'Imagery treatment does not match the domain well enough for a finished result.' : input.director.mediaDirection },
    { id: 'typography', label: 'Typography coherence', status: 'clear', observation: `Use the synthesized hierarchy consistently: ${input.director.typographyDirection}` },
    { id: 'responsive', label: 'Responsive composition quality', status: pages.every((page) => page.mobileRecomposition.length >= 2) ? 'clear' : 'review', observation: pages.every((page) => page.mobileRecomposition.length >= 2) ? 'Every generated page includes explicit mobile recomposition guidance.' : 'One or more page models need explicit mobile priority/stack behavior.' },
    { id: 'audience-copy', label: 'Audience-copy quality', status: publicSurface && copyGuard === 'Off' ? 'risk' : copyGuard === 'Review only' ? 'review' : 'clear', observation: publicSurface ? `Customer-facing copy guardrails: ${copyGuard}. Public headings, labels, buttons, and empty states should speak to users/customers rather than describe implementation.` : 'Operational copy should use domain/task language and avoid raw implementation jargon.' },
  ]
}

function qualityReview(input: PageCompositionInput, pages: PageComposition[]): VisualQualityReview {
  const dimensions = qualityDimensions(input, pages)
  const riskCount = dimensions.filter((item) => item.status === 'risk').length
  const reviewCount = dimensions.filter((item) => item.status === 'review').length
  const status: VisualQualityReview['status'] = riskCount >= 2 ? 'HIGH RISK' : riskCount || reviewCount ? 'REVIEW' : 'CLEAR'
  const warnings = dimensions.filter((item) => item.status !== 'clear').map((item) => `${item.label}: ${item.observation}`)
  const summary = status === 'CLEAR'
    ? 'Composition is coherent, domain-specific, and ready to use as visual implementation guidance inside active scope.'
    : status === 'HIGH RISK'
      ? 'Resolve the flagged visual/template/content risks before treating the composition as implementation-ready.'
      : 'The composition is directionally strong, but one or more qualitative review dimensions should be checked before implementation.'
  return { status, dimensions, warnings, summary }
}

function frontendQualityContract(input: PageCompositionInput, pages: PageComposition[]): FrontendQualityContract {
  const isPublic = publicDomains.has(input.director.id) || pages.some((page) => /customer|visitor|public|shop|portfolio|booking/i.test(`${page.purpose} ${page.primaryInteraction}`))
  const criteria = [
    'The implemented page must feel like a finished real product/business surface, not a design-system demo or pattern gallery.',
    'No section may exist solely to demonstrate a UI pattern; every section must support the page purpose, user task, trust, orientation, or required content.',
    'Avoid repetitive card-grid composition when a list, editorial layout, table, timeline, image-led section, or other domain-specific structure communicates better.',
    'Mobile layouts must be recomposed around task and hierarchy, not merely scaled down from desktop.',
    'Visual hierarchy must remain intentional at all responsive sizes; primary content/action cannot become visually weaker than decorative media.',
    '“Premium” must come from composition, typography, spacing, content realism, and coherence—not default luxury clichés, glass, giant serif type, or excessive empty space.',
    'The implementation must not obviously reuse the dominant visual combination of an unrelated recent Blueprint project without contextual reason.',
  ]
  if (isPublic) criteria.splice(2, 0,
    'Customer-facing copy must address customers/visitors in natural domain language and must not expose Blueprint, implementation, responsive, architecture, current-scope, or MVP terminology.',
    'Imagery must match the actual domain and page purpose; do not use irrelevant software screenshots, abstract filler, or generic stock imagery when real/product/location media is called for.',
  )
  if (input.dna.visualOriginality !== 'Safe') criteria.push('At least one project-specific signature visual moment must be present, but it must reinforce the page purpose rather than reduce usability.')
  return { appliesTo: isPublic ? 'Public/marketing/customer-facing surfaces plus shared responsive visual quality' : 'Operational/product surfaces plus shared responsive visual quality', criteria }
}

export function pageCompositionIntelligence(input: PageCompositionInput): PageCompositionIntelligence {
  const seeds = pageSeeds(input)
  const pages: PageComposition[] = seeds.map((seed) => ({ ...seed, ...scopeState(seed, input) }))
  return {
    domain: input.director.id,
    pages,
    responsiveRules: deriveResponsiveRules(input, pages),
    frontendQualityContract: frontendQualityContract(input, pages),
    visualQualityReview: qualityReview(input, pages),
    scopeGuardrail: 'Page composition is visual/presentational guidance only. Advisory pages or sections do not activate App Setup scope. If a composition depends on inactive booking, commerce, payments, clinic, government, tournament, admin, or other functional modules, keep it advisory until the user explicitly enables the required scope.',
  }
}

export function pageCompositionPrompt(intelligence: PageCompositionIntelligence) {
  const pageText = intelligence.pages.map((page) => {
    const sections = page.sections.map((item, index) => `${index + 1}. ${item.label} — ${item.role}\n   Composition: ${item.composition}${item.signaturePlacement ? `\n   Signature placement: ${item.signaturePlacement}` : ''}`).join('\n')
    return `### ${page.name} — ${page.scopeState.toUpperCase()}\nPurpose: ${page.purpose}\nScope note: ${page.scopeReason}\nVisual anchor: ${page.visualAnchor}\nSection hierarchy:\n${sections}\nContent rhythm: ${page.contentRhythm}\nCTA strategy: ${page.ctaStrategy}\nImagery placement: ${page.imageryPlacement}\nDensity: ${page.densityBehavior}\nPrimary interaction: ${page.primaryInteraction}\nMobile recomposition:\n${page.mobileRecomposition.map((item) => `- ${item}`).join('\n')}\nSignature placement: ${page.signaturePlacement}\nAvoid:\n${page.avoid.map((item) => `- ${item}`).join('\n')}`
  }).join('\n\n')
  const review = intelligence.visualQualityReview
  return `PAGE COMPOSITION INTELLIGENCE\nDomain: ${intelligence.domain}\n${intelligence.scopeGuardrail}\n\n${pageText}\n\nRESPONSIVE COMPOSITION RULES\n${intelligence.responsiveRules.map((item) => `- ${item}`).join('\n')}\n\nANTI-AI-SLOP / VISUAL QUALITY REVIEW\nOverall: ${review.status}\n${review.dimensions.map((item) => `- ${item.label} [${item.status.toUpperCase()}]: ${item.observation}`).join('\n')}\n\nFRONTEND QUALITY CONTRACT\nApplies to: ${intelligence.frontendQualityContract.appliesTo}\n${intelligence.frontendQualityContract.criteria.map((item) => `- ${item}`).join('\n')}`
}
