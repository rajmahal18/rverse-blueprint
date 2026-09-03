# Blueprint handoff — continue from v0.23

Use the latest v0.23 ZIP/codebase. Historical handoffs/release notes live under `docs/history/`.

## Current state

- Blueprint version: `0.23.0`
- backup schema: `v12` (imports v2–v12)
- App Setup: 918 settings / 49 sections / 11 app types
- persistence: IndexedDB current + recovery envelopes; Blob-backed reference assets
- review intelligence: typed severity + recommendation provenance
- Core Flows: optional user-authored workflow truth inside resolved scope
- Implementation Roadmap: fully derived build sequencing from App Setup + Core Flows
- validation gate: 37 engine + 5 persistence + 12 review + 12 flows + 13 roadmap = **79 named checks**

## Authority rule

1. Explicit App Setup scope
2. Required/inferred structured dependencies + hard Blueprint constraints
3. User-authored Core Flows **inside resolved scope**
4. Project Context as lower-authority verbatim guidance
5. Recommended behavior/quality defaults inside active scope
6. Implementation judgment where Blueprint is silent

The Implementation Roadmap is **not a seventh source of authority**. It is a deterministic sequencing projection of the layers above. It can order work, expose dependencies, and define proof gates, but it must never create/override scope.

## Roadmap invariants

- Custom / General stays domain-neutral unless structured scope is actually active.
- Explicit Off wins even when a flow/reference/context mentions an excluded feature.
- App Setup blocker signals create preflight gates instead of being buried in a late hardening phase.
- Complete Core Flows become journey phases.
- Incomplete Core Flows remain visible as blocking clarification work.
- Dependencies must point only to real earlier phases.
- Hardening/release remain explicit rather than being implied by “done.”
- Roadmap derivation must not mutate the config or Core Flow objects.

## Where the roadmap appears

- More tools → Implementation roadmap
- Generated Spec compact roadmap section
- Project-spec Markdown
- AI implementation prompt
- Structured JSON at `intelligence.implementationRoadmap`

Roadmap data is intentionally not persisted because it is 100% derived.

## Persistence/versioning

- Backup schema stays v12; there was no workspace-shape change in v0.23.
- Existing v0.22 workspaces need no migration.
- v0.20 recovery/reference-asset behavior remains unchanged.

## Recommended next phase

Do not immediately add more settings/app types.

A good v0.24 direction is **Implementation Slices / execution handoff**: derive small independently executable work packets from roadmap phases (scope, files/areas likely touched, acceptance proof, dependencies), suitable for handing to Codex one slice at a time. Keep slices derived rather than persisted and never let them become hidden product scope.

An alternative is to pause feature growth and run the current v0.23 engine against several real builds to find where roadmap ordering is too generic. Prefer observed shortcomings over speculative complexity.
