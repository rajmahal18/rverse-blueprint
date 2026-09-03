# v0.23 — Derived Implementation Roadmap

v0.23 turns Blueprint's resolved specification into a concrete build sequence without adding another questionnaire or another source of product truth.

## Product changes

- Added **Implementation roadmap** under More tools.
- Roadmap is regenerated deterministically from resolved App Setup + user-authored Core Flows.
- Nothing in the roadmap is persisted or independently editable; changing structured scope/flows changes the roadmap automatically.
- Every phase includes:
  - phase kind
  - objective
  - deliverables
  - proof-before-advancing gates
  - derivation evidence
  - explicit phase dependencies
- Blocker-level App Setup review signals create a **blocking preflight gate** before foundation work.
- Incomplete Core Flows become **Clarify & implement** blocking journey phases rather than being silently treated as implementation-ready.
- Complete Core Flows become explicit journey phases whose ordered deliverables and recovery proof come directly from the authored contract.

## Scope safety

The roadmap is sequencing guidance only.

- neutral Custom / General receives no invented business-domain phase
- explicit App Setup Off remains authoritative
- Core Flow wording never mutates or activates App Setup
- Payments Off removes payment-derived integration work
- single-location inventory does not invent inter-location transfer work
- App Setup remains the only authority for whether a capability exists

## Derived phase families

Depending on the project, Blueprint may derive:

1. blocker preflight
2. foundation & architecture
3. identity/access/authorization
4. active business-domain foundations
5. transactional/external integrations
6. authored user journeys
7. admin/operational tooling
8. reliability/recovery/proof
9. release/operational verification

The exact count/order varies with resolved scope and authored flows.

## Generated outputs

- Markdown project spec includes the full derived roadmap.
- AI implementation prompt includes roadmap sequencing plus an explicit "sequencing, not scope" guardrail.
- Generated Spec adds a compact roadmap section and links to the full Roadmap view.
- Structured JSON exports `intelligence.implementationRoadmap`.
- Roadmap can be copied independently as Markdown.

## Persistence / compatibility

- No persisted project shape changed.
- Backup/spec schema remains **v12**; v2–v12 imports remain supported.
- IndexedDB current/recovery envelopes and Blob-backed reference assets are unchanged from v0.20.
- Package and generated Blueprint metadata are `0.23.0`.

## Validation

`npm test` now runs:

- 37 engine checks
- 5 persistence checks
- 12 review-intelligence checks
- 12 Core Flow checks
- 13 Implementation Roadmap checks

Total: **79 named checks**.

A source syntax/transpile validation also covers all 17 TS/TSX source files with zero syntax/transpile errors.

A fresh dependency-backed Vite/React build could not be completed in the sandbox because `npm ci` timed out while reaching the package registry. Run `npm install && npm test && npm run build` in a normal networked local environment before deployment.
