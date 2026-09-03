# Phase 3 handoff — historical foundation

Phase 3 established Blueprint's reusable **Visual Patterns**, **Product Capabilities**, and **Project Docs** layers. Those boundaries are still valid, but this file is now historical.

For current work, read:

- `PHASE_ROADMAP.md` — the active 8-phase expansion roadmap
- `PHASE4_APP_SETUP_HANDOFF.md` — current App Setup/configurator architecture
- `README.md` — current product behavior and persistence notes

## Boundaries that still survive

### Visual patterns
`src/data/catalog.ts`

Answers: **How should this interface look / behave visually?**

### Product capabilities
`src/data/capabilities.ts`

Answers: **What reusable behavior or engineering capability does this app need?**

### App setup
`src/data/configurator.ts`

Answers: **How should this specific project's features, policies, defaults, and edge behavior be configured?**

### Project docs
`src/data/docs.ts`

Answers: **What repository knowledge should be created and kept current?**

Do not collapse these layers merely because related concepts overlap. App Setup can contain project-specific behavior (for example, login page = yes, MFA = admins only), while the capability library can still teach/recommend the broader reusable Authentication or RBAC concept.

## Persistence update

Current backup schema is `version: 4`. Import remains compatible with Phase 2 (`version: 2`) and Phase 3 (`version: 3`) bundles.

## Definition of a good future Blueprint feature

It should help a developer discover, remember, decide, configure, compare, or communicate **without making the planning experience tedious**.
