# v0.21 — Typed Review Intelligence & Recommendation Provenance

v0.21 turns Blueprint's review layer from a flat list of warning strings into structured product intelligence while keeping the recommendation engine and persistence schema stable.

## What changed

### Typed App Setup review contract

New `src/data/reviewSignals.ts` introduces:

- `ReviewSeverity`: `advisory | review | important | blocker`
- `ReviewCategory`: `scope | security | reliability | data | privacy | accessibility | usability | architecture | operations | testing`
- `ReviewSignal` with stable id, severity, category, title, detail, affected setting ids, and optional `suggestedFixId`
- `configReviewSignals(config)` for current UI/readiness/export consumers
- `reviewSignalCounts(signals)` for deterministic severity summaries

The pre-v0.21 `configWarnings(config)` API is intentionally retained as a compatibility predicate/string layer. v0.21 no longer lets readiness infer seriousness directly from warning prose.

### Severity-driven readiness

`configReadiness()` now consumes typed review signals.

- any blocker → `Not ready`
- 3+ important signals without blockers → `Needs review`
- any lower-severity signal → `Ready with review`
- zero App Setup signals → `Ready`

The numeric score is retained only as a secondary coherence indicator. Its risk penalty is explicit by severity rather than a flat warning count.

Readiness dimensions now group typed categories:

- Coherence → scope + architecture
- Safety → security + privacy
- Resilience → reliability + data + operations
- Usability → usability + accessibility + testing

### Recommendation provenance

`settingRecommendationProvenance(setting, config)` explains why a decision currently resolves the way it does:

- Explicit
- Required
- Inferred
- App type
- Profile
- Operational scale
- Baseline
- Inactive

Auto operational scale is reported as the source when scale variants actually change the recommendation, so Mission-critical defaults are no longer presented as unexplained generic baselines.

### App Setup UI

The old flat yellow warning list is replaced with typed review rows:

- severity pill
- category pill
- concise signal title
- original detail
- affected-setting navigation when resolvable
- deterministic **Apply fix** action when a linked quick fix exists

Every non-scope setting now shows concise provenance underneath its description. Scope settings continue to show their Auto/On/Off resolution reason directly.

### Generated spec and exports

- App Setup review signals render as `[SEVERITY · CATEGORY] Title — detail` in Markdown/AI prompts.
- Structured JSON exports full typed `reviewSignals`.
- Structured JSON also exports recommendation provenance for every active contract decision.
- Project Context mismatch signals now include explicit advisory severity/category/affected setting ids.
- Readiness status is displayed before the percentage in the primary UI and Generated Spec.

## Compatibility

- Backup schema remains **v11**.
- v2–v11 backup import compatibility is unchanged.
- IndexedDB/current/recovery/asset storage behavior from v0.20 is unchanged.
- Recommendation defaults, scope resolution, and app-type baselines are intentionally unchanged.
- `configWarnings()` remains exported for compatibility and v0.19 regression coverage.

## Regression coverage

`npm test` runs:

- 37 engine regression checks
- 5 persistence regression checks
- 12 review-intelligence regression checks

Total: **54 named checks**.

The v0.21 checks prove:

- all 11 Recommended app-type baselines remain typed-signal-free
- admin without login is a security blocker linked to `protect-admin`
- UI-only booking conflict handling is a reliability blocker
- password-manager-hostile behavior is lower-severity usability review
- typed severity counts are deterministic
- blockers reduce readiness more than review-only signals
- app-type recommendation provenance is preserved
- Auto operational-scale provenance is visible
- Profile provenance is visible
- Explicit behavior overrides retain their recommended comparison
- Required/Inferred scope provenance is not flattened into generic “Recommended”
- Project Context mismatch signals remain typed advisory/non-mutating scope prompts

## Versioning

- package: `0.21.0`
- generated Blueprint metadata: `0.21.0`
- backup schema: `v11`
