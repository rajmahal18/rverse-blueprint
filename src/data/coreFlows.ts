import { resolveScope, type ProjectConfig } from './configurator'

export type CoreFlow = {
  id: string
  title: string
  actor: string
  goal: string
  startingPoint: string
  steps: string[]
  successState: string
  failureStates: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export type CoreFlowTemplate = Omit<CoreFlow, 'id' | 'createdAt' | 'updatedAt'> & {
  templateId: string
  description: string
  requiredScope?: string[]
}

export type CoreFlowQuality = {
  complete: boolean
  score: number
  missing: string[]
  guidance: string[]
}

const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const cleanList = (value: unknown) => Array.isArray(value) ? value.map(clean).filter(Boolean) : []
const now = () => new Date().toISOString()
const flowId = () => `flow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function createCoreFlow(input: Partial<CoreFlow> = {}): CoreFlow {
  const timestamp = now()
  return normalizeCoreFlow({
    id: input.id || flowId(),
    title: input.title ?? '',
    actor: input.actor ?? '',
    goal: input.goal ?? '',
    startingPoint: input.startingPoint ?? '',
    steps: input.steps ?? ['', '', ''],
    successState: input.successState ?? '',
    failureStates: input.failureStates ?? [],
    notes: input.notes ?? '',
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || timestamp,
  })
}

export function normalizeCoreFlow(input: Partial<CoreFlow> | null | undefined): CoreFlow {
  const timestamp = now()
  return {
    id: clean(input?.id) || flowId(),
    title: clean(input?.title),
    actor: clean(input?.actor),
    goal: clean(input?.goal),
    startingPoint: clean(input?.startingPoint),
    steps: cleanList(input?.steps),
    successState: clean(input?.successState),
    failureStates: cleanList(input?.failureStates),
    notes: clean(input?.notes),
    createdAt: clean(input?.createdAt) || timestamp,
    updatedAt: clean(input?.updatedAt) || clean(input?.createdAt) || timestamp,
  }
}

export function normalizeCoreFlows(value: unknown): CoreFlow[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Partial<CoreFlow> => Boolean(item && typeof item === 'object'))
    .map(normalizeCoreFlow)
}

export function coreFlowQuality(flow: CoreFlow): CoreFlowQuality {
  const steps = cleanList(flow.steps)
  const failureStates = cleanList(flow.failureStates)
  const missing: string[] = []
  if (!clean(flow.title)) missing.push('flow name')
  if (!clean(flow.actor)) missing.push('actor')
  if (!clean(flow.goal)) missing.push('goal')
  if (!clean(flow.startingPoint)) missing.push('starting point')
  if (steps.length < 2) missing.push('at least 2 main steps')
  if (!clean(flow.successState)) missing.push('success state')

  const guidance: string[] = []
  if (steps.length > 8) guidance.push('Consider splitting this into two flows; more than 8 steps usually hides separate user goals.')
  if (steps.length > 0 && steps.length < 3) guidance.push('A 3–6 step main path is usually easiest for an implementation agent to reason about.')
  if (!failureStates.length) guidance.push('Add at least one failure/recovery state when the flow can fail, conflict, or depend on an external system.')

  const requiredChecks = 6
  const completedChecks = requiredChecks - missing.length
  return {
    complete: missing.length === 0,
    score: Math.max(0, Math.round((completedChecks / requiredChecks) * 100)),
    missing,
    guidance,
  }
}

export function coreFlowMarkdown(flow: CoreFlow, headingLevel = 3): string {
  const steps = cleanList(flow.steps)
  const failureStates = cleanList(flow.failureStates)
  const heading = '#'.repeat(Math.max(1, Math.min(6, headingLevel)))
  const lines = [
    `${heading} ${flow.title || 'Untitled flow'}`,
    `- Actor: ${flow.actor || 'Not specified'}`,
    `- Goal: ${flow.goal || 'Not specified'}`,
    `- Starting point: ${flow.startingPoint || 'Not specified'}`,
    '- Main path:',
    ...(steps.length ? steps.map((step, index) => `  ${index + 1}. ${step}`) : ['  1. Not defined yet']),
    `- Success state: ${flow.successState || 'Not specified'}`,
  ]
  if (failureStates.length) {
    lines.push('- Failure / recovery states:')
    lines.push(...failureStates.map((state) => `  - ${state}`))
  }
  if (flow.notes) lines.push(`- Implementation notes: ${flow.notes}`)
  return lines.join('\n')
}

export function coreFlowsMarkdown(flows: CoreFlow[], headingLevel = 3): string {
  if (!flows.length) return 'No explicit core flows have been defined.'
  return flows.map((flow) => coreFlowMarkdown(flow, headingLevel)).join('\n\n')
}

export function coreFlowAcceptanceCriteria(flows: CoreFlow[]): string[] {
  return flows.map((flow) => {
    const title = clean(flow.title) || 'Untitled flow'
    const actor = clean(flow.actor) || 'the intended actor'
    const success = clean(flow.successState) || 'its defined success state'
    const steps = cleanList(flow.steps)
    const path = steps.length ? ` through ${steps.length} explicit main-path step${steps.length === 1 ? '' : 's'}` : ''
    return `Core flow “${title}” lets ${actor} proceed${path} to ${success} without silently bypassing resolved App Setup rules.`
  })
}

export function coreFlowFailureCases(flows: CoreFlow[]): string[] {
  return flows.flatMap((flow) => cleanList(flow.failureStates).map((state) => `${clean(flow.title) || 'Core flow'} — ${state}`))
}

export function coreFlowsPrompt(flows: CoreFlow[]): string {
  if (!flows.length) return '- No user-authored core flows supplied. Do not invent major workflow steps beyond resolved App Setup scope.'
  return flows.map((flow, index) => {
    const steps = cleanList(flow.steps)
    const failureStates = cleanList(flow.failureStates)
    const failure = failureStates.length ? `\nFailure/recovery:\n${failureStates.map((state) => `- ${state}`).join('\n')}` : ''
    const notes = flow.notes ? `\nImplementation note: ${flow.notes}` : ''
    return `FLOW ${index + 1} — ${flow.title || 'Untitled flow'}\nActor: ${flow.actor || 'Not specified'}\nGoal: ${flow.goal || 'Not specified'}\nStarting point: ${flow.startingPoint || 'Not specified'}\nMain path:\n${steps.length ? steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n') : '1. Not defined yet'}\nSuccess state: ${flow.successState || 'Not specified'}${failure}${notes}`
  }).join('\n\n')
}

const templates: CoreFlowTemplate[] = [
  {
    templateId: 'booking-customer',
    description: 'Customer checks real availability, chooses a slot, satisfies any required payment/confirmation condition, and receives a durable booking result.',
    requiredScope: ['pack.booking'],
    title: 'Customer booking', actor: 'Customer', goal: 'Reserve an available resource without double-booking', startingPoint: 'Customer opens the booking experience',
    steps: ['Choose a resource/date and inspect live availability', 'Select an available slot and review booking details', 'Provide required customer details and satisfy payment/confirmation conditions', 'Submit the booking and wait for the authoritative server result'],
    successState: 'The booking is durably confirmed and the slot is no longer available to conflicting requests',
    failureStates: ['Slot becomes unavailable → explain the conflict and return to current availability without losing safe input', 'Payment/confirmation condition fails → do not mark the booking confirmed; preserve a clear retry or recovery path'],
    notes: 'Treat server-side availability/conflict rules as authoritative; the UI is never the final lock.',
  },
  {
    templateId: 'payment-checkout',
    description: 'Payment completes only after trusted provider/server verification, including delayed or duplicated callbacks.',
    requiredScope: ['pack.payments'],
    title: 'Payment completion', actor: 'Customer / payer', goal: 'Complete a payment and receive one authoritative transaction result', startingPoint: 'A payable transaction has a final amount and reference',
    steps: ['Review the amount and choose an allowed payment method', 'Create/initiate the provider transaction from a trusted server boundary', 'Complete the provider payment interaction', 'Verify the final provider state through the trusted callback/webhook path', 'Apply the paid result idempotently to the business record'],
    successState: 'The internal transaction and related business record reflect one verified successful payment',
    failureStates: ['Customer returns before provider verification → show pending, not paid', 'Webhook is delayed or duplicated → reconcile idempotently without duplicate fulfillment', 'Payment fails/cancels → preserve the unpaid business state and give an intentional retry path'],
    notes: 'Browser redirects are UX signals only; they are not authoritative payment proof.',
  },
  {
    templateId: 'commerce-purchase',
    description: 'A shopper moves from catalog to a durable order without losing cart or creating duplicate fulfillment.',
    requiredScope: ['pack.commerce'],
    title: 'Customer purchase', actor: 'Shopper', goal: 'Purchase selected products with a clear order result', startingPoint: 'Shopper is browsing the product catalog or cart',
    steps: ['Choose products/variants and quantities', 'Review cart, availability, price, fees, and fulfillment details', 'Provide checkout/customer details', 'Submit checkout and complete any required payment condition', 'Create the authoritative order and show confirmation'],
    successState: 'One order exists with a durable status, totals, line items, and next-step/fulfillment information',
    failureStates: ['Price/stock changes before submit → explain the change and require review', 'Duplicate submit/callback → reconcile to the existing order rather than creating another'],
    notes: '',
  },
  {
    templateId: 'inventory-adjustment',
    description: 'Staff records a stock movement with traceable reason and authoritative quantity changes.',
    requiredScope: ['pack.inventory'],
    title: 'Stock movement', actor: 'Authorized staff', goal: 'Record an inventory change accurately and traceably', startingPoint: 'Staff opens an item or stock operation',
    steps: ['Choose the item and applicable location', 'Choose movement type and enter quantity/reason/reference', 'Review the resulting stock effect', 'Submit the movement through the authoritative inventory transaction'],
    successState: 'The stock ledger and current quantity are updated consistently with an auditable movement record',
    failureStates: ['Insufficient/invalid quantity → reject without partial stock changes', 'Concurrent stock update → re-evaluate against current stock before committing'],
    notes: '',
  },
  {
    templateId: 'directory-discovery',
    description: 'A visitor discovers a relevant listing and reaches trustworthy detail without dead-end search behavior.',
    requiredScope: ['pack.directory'],
    title: 'Discover a listing', actor: 'Visitor', goal: 'Find and evaluate a relevant listing', startingPoint: 'Visitor opens the directory or a search entry point',
    steps: ['Search/browse using the primary discovery controls', 'Refine results with relevant filters or location/category context', 'Open a listing and inspect its verified/current details', 'Take the primary next action offered by the listing'],
    successState: 'The visitor reaches a relevant listing and can confidently continue with the intended next action',
    failureStates: ['No results → provide recovery suggestions instead of a dead end', 'Stale/unavailable listing → make status clear and provide a useful way back to discovery'],
    notes: '',
  },
  {
    templateId: 'government-routing',
    description: 'A document/record enters an accountable route, changes custody/status explicitly, and remains reconstructable.',
    requiredScope: ['pack.government'],
    title: 'Route an official record', actor: 'Authorized staff', goal: 'Move a record through the correct office/owner with traceable status', startingPoint: 'A valid record is created/received and ready for routing',
    steps: ['Verify the record identity, metadata, and current custody/status', 'Choose the allowed next office/owner/action', 'Add required remarks/reason or routing context', 'Commit the transition and notify/expose it to the next responsible actor', 'Continue until the record reaches its defined terminal outcome'],
    successState: 'Current status/custody is unambiguous and the full route can be reconstructed from history',
    failureStates: ['Invalid transition → reject and explain the allowed next actions', 'Concurrent routing/edit → detect stale state rather than silently overwriting custody'],
    notes: 'Authorization must be enforced at the server boundary for every consequential transition.',
  },
  {
    templateId: 'clinic-encounter',
    description: 'Clinical staff open the correct patient encounter, record care in a safe sequence, and close it with traceable outputs.',
    requiredScope: ['pack.clinic'],
    title: 'Patient encounter', actor: 'Authorized clinical staff', goal: 'Document and complete a patient visit safely', startingPoint: 'The correct patient/visit is identified and staff has appropriate access',
    steps: ['Confirm patient and active visit context', 'Record intake/vitals and chief complaint as applicable', 'Capture assessment/clinical documentation', 'Record orders, medicines, services, referrals, or other scoped outputs', 'Review required information and complete/close the encounter'],
    successState: 'The encounter has a durable clinical record, correct attribution, and clear follow-up/output state',
    failureStates: ['Wrong/ambiguous patient context → stop consequential entry until identity is resolved', 'Autosave/network failure → preserve entered work and clearly show recovery/sync state', 'Unauthorized record access → deny access without leaking restricted clinical detail'],
    notes: 'Do not make clinical documentation depend on optional stock/operational UI unless App Setup explicitly requires the integration.',
  },
  {
    templateId: 'tournament-result',
    description: 'An organizer records an authoritative match result and downstream standings/brackets update consistently.',
    requiredScope: ['pack.tournament'],
    title: 'Record match result', actor: 'Authorized organizer / scorer', goal: 'Publish one authoritative match result and its downstream effects', startingPoint: 'A scheduled match is ready for scoring',
    steps: ['Open the correct match and confirm participants/lineup', 'Enter game/score details under the configured scoring rules', 'Review the computed winner and result summary', 'Finalize the result', 'Recompute/publish affected standings, progression, or next match state'],
    successState: 'The finalized result and every dependent standing/bracket state agree',
    failureStates: ['Invalid score → reject before finalization with a rule-specific explanation', 'Correction after finalization → require an explicit controlled correction path and recompute dependencies'],
    notes: '',
  },
  {
    templateId: 'portfolio-contact',
    description: 'A visitor understands the work and reaches a real contact path without a generic funnel.',
    requiredScope: ['pack.portfolio'],
    title: 'Evaluate work and make contact', actor: 'Prospective client / visitor', goal: 'Understand relevant work and reach the owner through the intended contact path', startingPoint: 'Visitor lands on the portfolio or a project page',
    steps: ['Understand the owner/product positioning and selected work', 'Open a relevant project/case study and inspect evidence', 'Return to or discover the primary contact/next-step CTA', 'Send the inquiry or use the configured contact channel'],
    successState: 'The visitor has enough evidence/context to take the intended real contact action',
    failureStates: ['External/live project link is unavailable → keep enough contextual evidence on-site to understand the work', 'Contact submission fails → preserve the message and provide a retry/alternate contact path'],
    notes: '',
  },
]

export function suggestedCoreFlowTemplates(config: ProjectConfig): CoreFlowTemplate[] {
  return templates.filter((template) => (template.requiredScope ?? []).every((id) => resolveScope(config, id).active))
}

export function coreFlowFromTemplate(template: CoreFlowTemplate): CoreFlow {
  return createCoreFlow({
    title: template.title,
    actor: template.actor,
    goal: template.goal,
    startingPoint: template.startingPoint,
    steps: [...template.steps],
    successState: template.successState,
    failureStates: [...template.failureStates],
    notes: template.notes,
  })
}
