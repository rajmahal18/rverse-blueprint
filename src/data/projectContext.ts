export type ProjectContext = {
  building: string
  audience: string
  outcomes: string
  priorities: string
  nonNegotiables: string
  avoid: string
  dependencies: string
  done: string
}

export const emptyProjectContext: ProjectContext = {
  building: '',
  audience: '',
  outcomes: '',
  priorities: '',
  nonNegotiables: '',
  avoid: '',
  dependencies: '',
  done: '',
}

export const projectContextQuestions: { id: keyof ProjectContext; label: string; placeholder: string; primary: boolean }[] = [
  { id: 'building', label: 'What are you building?', placeholder: 'e.g. A simple website for…', primary: true },
  { id: 'audience', label: 'Who is it for?', placeholder: 'e.g. Customers, staff, visitors…', primary: true },
  { id: 'outcomes', label: 'What should people be able to accomplish?', placeholder: 'e.g. Find information and complete the main task quickly.', primary: true },
  { id: 'priorities', label: 'What matters most?', placeholder: 'e.g. Ease of use, speed, reliability, visual impact…', primary: true },
  { id: 'nonNegotiables', label: 'What must never happen?', placeholder: 'e.g. Never lose submitted work.', primary: false },
  { id: 'avoid', label: 'What should the implementation avoid assuming or adding?', placeholder: 'e.g. No unnecessary login, dashboards, or generic SaaS filler.', primary: false },
  { id: 'dependencies', label: 'Anything it must work with?', placeholder: 'e.g. An existing API, spreadsheet, payment provider — or none.', primary: false },
  { id: 'done', label: 'What does “done” look like?', placeholder: 'e.g. The main flow works end-to-end and is ready to deploy.', primary: false },
]

export function normalizeProjectContext(input?: Partial<ProjectContext> | null): ProjectContext {
  const normalized = { ...emptyProjectContext }
  for (const key of Object.keys(normalized) as (keyof ProjectContext)[]) {
    const value = input?.[key]
    normalized[key] = typeof value === 'string' ? value : ''
  }
  return normalized
}

export function projectContextEntries(context: ProjectContext) {
  const normalized = normalizeProjectContext(context)
  return projectContextQuestions
    .map((question) => ({ ...question, value: normalized[question.id].trim() }))
    .filter((entry) => entry.value.length > 0)
}

export function projectContextPrompt(context: ProjectContext): string {
  const entries = projectContextEntries(context)
  if (!entries.length) return '- None supplied. Do not infer missing product scope from the absence of context.'
  return entries.map((entry) => `- ${entry.label} ${entry.value}`).join('\n')
}
