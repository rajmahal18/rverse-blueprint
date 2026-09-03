# Blueprint handoff — continue from v0.19

Use the latest v0.19 ZIP/codebase. Do not rebuild Blueprint from handoff prose. Historical handoffs and release notes live under `docs/history/`.

## Current release identity

- Blueprint version: `0.19.0`
- Backup schema: v10
- App Setup catalog: 918 settings / 49 sections
- Supported app types: 11
- Test gate: `npm test`
- Current regression checks: 37

## v0.19 product rule

Feature expansion is frozen while the recommendation engine matures.

Before changing recommendation defaults, scope/dependency logic, warning rules, quick fixes, app-type baselines, or cross-layer applicability:

1. Add or update a scenario that expresses the intended behavior.
2. Run `npm test` and understand every failure.
3. Change the smallest deterministic engine surface necessary.
4. Re-run the full suite.
5. Only then update release notes/docs if product truth changed.

Do not weaken an assertion merely to make a change pass. If behavior genuinely changed, document why the new contract is better.

## Protected invariants

Treat these as architecture, not implementation details:

- behavioral defaults never create major product scope
- explicit `Off` always wins; requirements become review conflicts
- explicit scope intent and deliberate behavior survive app-type changes
- Operational Scale strengthens/relaxes engineering posture without inventing business packs
- inactive Auto scope stays out of implementation contracts
- explicit Off stays in contracts because it is intentional exclusion
- admin operations require a protected auth/authz boundary
- booking conflicts are authoritative at the write/data boundary
- payment completion is not trusted from a client redirect alone
- provider/webhook confirmation must be retry-safe/idempotent
- single-location inventory does not expose transfer workflows
- Custom / General remains neutral until a meaningful scope signal exists
- saved Capability/Pattern choices cannot override resolved App Setup

## Regression harness structure

`scripts/engine-regression.mjs`:

- finds local `node_modules/.bin/tsc` when available, otherwise falls back to a global `tsc`
- compiles deterministic data/engine modules only
- runs Node assertions
- prints each named regression check
- exits non-zero on any failure
- deletes `.blueprint-test-build/` after execution

No additional test-framework dependency is required.

## Next recommended phase

v0.20 should address persistence/recovery hardening rather than add more App Setup decisions:

- move large project/reference payloads away from localStorage
- use IndexedDB for projects, snapshots, custom presets/capabilities/patterns, and image blobs
- keep only lightweight UI preferences in localStorage
- add visible `Saving… / Saved / Storage problem` state
- make persistence failures actionable instead of console-only
- preserve/export a recoverable backup path before destructive storage migrations

Do not mix that persistence migration into v0.19 unless fixing a regression-suite defect requires it.
