# Blueprint handoff — continue from v0.24

Use the latest v0.24 ZIP/codebase. Historical handoffs/release notes live under `docs/history/`.

## Current truth

- Blueprint version: `0.24.0`
- Backup schema: `v12`
- App Setup: **935 settings / 50 sections / 11 app types**
- Regression gate: **97 named checks**
- Persistence: IndexedDB current + last-known-good recovery, Blob-backed reference assets
- Core Flows: user-authored workflow truth below App Setup scope
- Implementation Roadmap: fully derived sequencing/proof guidance
- Reusable Product Architecture: 17 structured build-once/tenant decisions

## v0.24 architectural contract

1. A reusable-product choice never creates business scope.
2. `Single-purpose application` remains the neutral/default posture for every app type.
3. Shared/hybrid tenant runtimes require a first-class multi-tenant organization boundary; Blueprint must surface a blocker rather than silently rewriting scope.
4. Shared-tenant data access must fail closed at a trusted boundary. Application query filters alone are not an acceptable recommended isolation strategy.
5. One maintained product core is the default. Tenant differences should be represented through configuration, modules/entitlements, policy, terminology/custom fields, branding, or controlled extension points.
6. Per-tenant source forks and tenant-version branches are deliberate risk choices, never recommended plug-and-play architecture.
7. Isolated deployment per organization remains valid when operational/legal boundaries require it—as long as all deployments consume the same maintained core rather than diverging forks.
8. The roadmap may sequence productization work, but it must never infer or activate domain packs.
9. A reusable product is not complete until a second representative organization can be provisioned/configured from the same release artifact without source cloning.

## Main files

- `src/data/configurator.ts` — 935-setting catalog, dependencies, scope resolution, reusable-product decisions + warnings
- `src/data/reviewSignals.ts` — typed severity/category metadata for productization conflicts
- `src/data/intelligence.ts` — quick fixes, acceptance criteria, edge cases
- `src/data/roadmap.ts` — reusable-product derived roadmap phase
- `src/App.tsx` — App Setup rendering, quick-fix scope handling, exports/generated metadata
- `scripts/reusable-product-regression.mjs` — v0.24 invariants

## Before the next release

Run:

```bash
npm install
npm test
npm run build
```

The most valuable next phase is likely one of two directions:

- **Implementation Slices:** derive smaller Codex-ready work packets from roadmap phases with dependencies and proof of completion; or
- **Real HRMS/ministry scenario validation:** model 2–3 ministries with different module/workflow/role requirements and use observed gaps to decide what v0.25 actually needs.

Prefer observed friction over adding generic tenant machinery speculatively.
