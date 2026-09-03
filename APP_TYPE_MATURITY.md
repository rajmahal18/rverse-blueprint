# App Type Maturity Discipline

Blueprint currently supports these app types and intentionally freezes expansion while their recommendation baselines mature:

- Custom / General
- Booking / Scheduling
- Internal / Operations
- SaaS / Client Portal
- E-commerce
- Directory / Marketplace
- Portfolio / Marketing
- Government System
- Clinic / EMR
- Inventory / POS
- Tournament / Event

## Rule

Do not add a new app type because it sounds useful. Add one only after the current types have been exercised against realistic projects and the new shape cannot be represented cleanly through an existing type + explicit business packs.

## Regression questions

For each type:

1. Is the primary user path obvious?
2. Does Recommended enable only domain-justified scope?
3. Are account/auth defaults proportional?
4. Are generic workflow/collaboration features being confused with domain-specific behavior?
5. Is Operational Scale proportional without weakening safety invariants?
6. Does Quick expose only decisions worth human attention?
7. Are optional suggestions high-confidence rather than a nice-to-have backlog?
8. Do generated acceptance criteria and edge cases match the actual active scope?
9. Do Visual Studio suggestions fit the product without mutating deterministic truth?
10. Does the generated implementation brief read like this project rather than a generic enterprise template?

Expansion is earned after these questions are boringly easy to answer.

## v0.19 regression gate

App-type maturity is now executable rather than only documented. Before merging changes to defaults, scope resolution, dependencies, warnings, quick fixes, or cross-layer applicability, run:

```bash
npm test
```

The suite protects:

- all 11 Recommended app-type baselines
- catalog/dependency/default integrity
- explicit Off authority across every scope control and app type
- behavior-vs-scope separation
- deliberate override/scope preservation when app type changes
- operational-scale proportionality without product-scope inflation
- booking/payment/admin safety invariants
- single-location inventory transfer exclusion
- generated-contract exclusion for inactive Auto scope
- cross-layer capability/pattern applicability
- all 220 app type × profile × scale resolution contexts

A new app type is still out of scope until these baselines remain stable under real project usage.

## v0.20 persistence gate

The recommendation engine remains frozen and protected by the v0.19 scenarios. `npm test` now runs two independent deterministic gates:

```bash
npm run test:engine
npm run test:persistence
```

Current total: **42 named checks** — 37 engine checks plus 5 persistence-helper invariants.

Persistence tests protect reference-asset behavior that can otherwise create silent data loss while projects/checkpoints evolve:

- referenced image asset ids are collected across both live references and checkpoint references
- duplicate asset ids are deduplicated before cleanup/export work
- recovery-workspace asset ids remain live roots for cleanup
- legacy inline image data is stripped from durable project payloads without removing the asset reference
- stripping legacy inline image payloads does not mutate live React state
- projects without images remain structurally intact

Changes to recommendation defaults still require the full `npm test` gate. Persistence work must not be used as a reason to weaken any v0.19 engine invariant.

## v0.21 review-intelligence gate

`npm test` now adds a third independent gate:

```bash
npm run test:engine
npm run test:persistence
npm run test:review
```

Current total before v0.22: **54 named checks** — 37 engine + 5 persistence + 12 review-intelligence.

The review gate protects the interpretation layer without changing app-type scope baselines:

- Recommended app-type baselines must remain free of App Setup review signals
- blocker vs important vs review vs advisory severity is explicit and deterministic
- readiness status is severity-driven rather than keyword-derived from prose
- deterministic quick fixes stay linked to the signals they resolve
- recommendation provenance distinguishes App type, Auto operational scale, Profile, Explicit, Required, Inferred, Baseline, and Inactive sources
- Project Context mismatch prompts remain advisory-only and cannot mutate App Setup

New warning/review behavior should include typed metadata and a regression check when it can affect readiness or implementation safety.


## v0.22 Core Flows gate

`npm test` now adds a fourth independent gate:

```bash
npm run test:flows
```

Current total: **66 named checks** — 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flows.

The flow gate protects the boundary between human-authored workflow intent and deterministic product scope:

- neutral Custom / General never receives invented workflow starters
- starters appear only from already-active structured scope
- explicit Off removes incompatible starter suggestions
- applying a starter never mutates App Setup
- flow normalization keeps portable project/checkpoint data clean
- flow completeness is deterministic but does not turn optional recovery guidance into fake blockers
- Markdown/AI flow contracts preserve ordered paths and recovery states
- authored flows extend acceptance criteria without creating scope
- recovery states become explicit edge-case proof obligations

A Core Flow may explain **how** an active capability should work. It must never decide **whether** that capability exists.

## v0.23 implementation-roadmap gate

`npm test` now adds a fifth independent deterministic gate:

```bash
npm run test:roadmap
```

Current total: **79 named checks** — 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flows + 13 Implementation Roadmap.

The roadmap gate protects sequencing without allowing sequencing to become product inference:

- neutral Custom / General receives no invented business-domain phase
- explicit Off removes incompatible derived work
- single-location inventory does not invent transfer scope
- Core Flow derivation never mutates App Setup
- complete flows become journey phases; incomplete flows become blocking clarification phases
- blocker-level App Setup review signals become a preflight gate
- every dependency references a real earlier phase
- Markdown/AI roadmap outputs carry deliverables, dependencies, derivation evidence, and proof gates
- repeated derivation from identical inputs is deterministic

A roadmap may decide **when** active work should be built. It must never decide **whether** a capability exists.

## v0.24 reusable-product architecture gate

`npm test` now adds a sixth independent deterministic gate:

```bash
npm run test:productization
```

Current total: **97 named checks** — 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flows + 13 Implementation Roadmap + 18 Reusable Product Architecture.

The productization gate protects build-once architecture without allowing reuse intent to become hidden domain scope:

- normal projects remain `Single-purpose application` and receive no productization roadmap phase
- selecting reusable intent never activates organization scope or business packs behind the user
- Project Context may flag multi-ministry / white-label / plug-and-play intent as an advisory mismatch, but never mutates structured reuse or tenant scope
- shared/hybrid tenant runtime without a first-class multi-tenant organization boundary is a blocker
- an explicit Organization Off remains authoritative until the user deliberately applies the fix
- isolated deployment per organization remains valid without forcing multi-tenant runtime scope
- query-filter-only tenant isolation is a blocker for shared runtimes
- permanent tenant source forks and tenant-version branches are explicit upgrade-drift risks
- runtime plugins and white-label/module/provisioning tensions remain typed review decisions rather than hidden defaults
- reusable projects derive productization work before domain implementation
- productization settings enter generated contracts only when reuse intent activates their dependencies
- generated acceptance criteria/edge cases include tenant configuration leakage and wrong-tenant background execution
- roadmap/productization derivation is deterministic and never mutates App Setup

Reusable-product architecture may decide **how one maintained product serves multiple organizations**. It must never decide **which business capabilities exist**.

