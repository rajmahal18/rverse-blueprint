# v0.22 — Core Flows / User Journeys

v0.22 gives Blueprint a compact workflow language for the few journeys an implementation agent must get right.

## Product changes

- Added **Core Flows** under More tools.
- Inline editor for actor, goal, starting point, ordered main path, success state, failure/recovery states, and optional implementation note.
- Add, duplicate, delete, reorder flows; add/reorder/remove main steps.
- Deterministic completeness indicator per flow.
- Optional scope-aware starter templates for booking, payments, commerce, inventory, directory, government, clinic, tournament, and portfolio.
- Starters are never auto-applied and never mutate App Setup.

## Generated outputs

- Markdown includes a user-authored Core Flows section.
- AI prompt includes Core Flows with explicit scope-authority guardrails.
- Authored flows extend acceptance criteria.
- Failure/recovery states extend edge-case proof obligations.
- Generated Spec shows concise flow summaries.
- Docs manifest reports captured flow count.
- Structured JSON includes `project.coreFlows`.

## Persistence / compatibility

- Project model and checkpoints now include `coreFlows`.
- v0.21 data normalizes to an empty flow list safely.
- Backup schema bumped from v11 to **v12**; import compatibility remains v2–v12.
- IndexedDB/recovery/reference-asset behavior is unchanged.

## Validation

`npm test` now runs:

- 37 engine checks
- 5 persistence checks
- 12 review-intelligence checks
- 12 Core Flows checks

Total: **66 named checks**.

A source syntax/transpile validation also covers all TS/TSX source files. Full dependency-backed Vite/React typecheck/build still requires normal `npm install` where registry access is available.
