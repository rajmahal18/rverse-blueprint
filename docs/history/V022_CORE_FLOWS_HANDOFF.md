# Blueprint handoff — continue from v0.22

Use the latest v0.22 ZIP/codebase. Historical handoffs/release notes live under `docs/history/`.

## Current state

- Blueprint version: `0.22.0`
- backup schema: `v12` (imports v2–v12)
- App Setup: 918 settings / 49 sections / 11 app types
- persistence: IndexedDB current + recovery envelopes; Blob-backed reference assets
- Core Flows: user-authored workflow contract stored on projects and checkpoints
- validation gate: 37 engine + 5 persistence + 12 review + 12 flow = **66 named checks**

## v0.22 authority rule

1. Explicit App Setup scope
2. Required/inferred structured dependencies + hard Blueprint constraints
3. User-authored Core Flows **inside resolved scope**
4. Project Context as lower-authority verbatim guidance
5. Recommended behavior/quality defaults inside active scope
6. Implementation judgment where Blueprint is silent

Core Flows must never auto-enable a feature. Starter templates are suggestions only and appear from scope that is already active.

## Core Flow shape

Each flow may contain:

- name
- actor
- goal
- starting point
- ordered main path
- success state
- failure/recovery states
- optional implementation note

Keep normal flows around 3–6 main steps. Split overly long journeys instead of creating a diagramming DSL.

## Generation behavior

- Markdown + AI prompt include the authored workflow contract.
- Authored flows add flow-specific acceptance criteria.
- Failure/recovery states add edge-case proof obligations.
- Structured JSON stores the raw flow contract on `project.coreFlows`.
- With zero flows, exports explicitly tell agents not to invent major workflow scope.

## Persistence/versioning

- Existing v0.21 workspaces normalize to `coreFlows: []` automatically.
- Core Flows are included in project duplication, checkpoints, restore, IndexedDB saves, and backup schema v12.
- Reference asset persistence remains unchanged from v0.20.

## Recommended next phase

v0.23 can build a **derived implementation roadmap** from already-resolved App Setup + authored Core Flows. Keep it derived and editable rather than adding another questionnaire.

Do not add more app types/settings merely to make the release larger. The priority remains implementation clarity and deterministic trust.
