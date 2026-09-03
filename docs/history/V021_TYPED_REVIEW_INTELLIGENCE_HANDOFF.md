# Blueprint handoff — continue from v0.21

Use the latest v0.21 ZIP/codebase. Do not rebuild Blueprint from handoff prose. Historical handoffs and release notes live under `docs/history/`.

## Current state

- Blueprint version: `0.21.0`
- backup schema: `v11`
- App Setup knowledge base: 918 settings / 49 sections / 11 app types
- persistence: IndexedDB current + recovery workspace envelopes, Blob-backed reference assets
- validation gate: 37 engine + 5 persistence + 12 review-intelligence = 54 named checks

## v0.21 architecture rule

App Setup still has one deterministic source of product truth. v0.21 only changes how Blueprint explains and prioritizes review concerns.

The compatibility path is deliberate:

```text
configWarnings(config)
  legacy predicate/string contract
        ↓
configReviewSignals(config)
  typed id + severity + category + title + affected settings + optional fix
        ↓
configReadiness / App Setup UI / Markdown / AI prompt / JSON
```

Do not reintroduce readiness logic that searches warning text for severity/category keywords. If a new warning matters to readiness, give it explicit typed metadata in `reviewSignals.ts`.

## Recommendation provenance

Use `settingRecommendationProvenance(setting, config)` when the user or an export needs to know why a setting resolved the way it did.

Possible sources:

- Explicit
- Required
- Inferred
- App type
- Profile
- Operational scale
- Baseline
- Inactive

Operational scale provenance should appear only when scale variants materially change the recommendation. Auto-inferred scale must remain visible in the explanation when it is the source.

## Readiness semantics

Status, not percentage, is primary:

- Blocker present → Not ready
- 3+ Important, no blocker → Needs review
- Other signal(s), no blocker → Ready with review
- No App Setup signal → Ready

The score is a secondary coherence indicator and must not become a gamified completion meter.

## Adding a new typed review rule

1. Keep the underlying deterministic predicate compatible unless there is a product reason to change it.
2. Add a stable rule id in `src/data/reviewSignals.ts`.
3. Assign explicit severity/category.
4. Add affected setting ids when known.
5. Link `suggestedFixId` only when the fix is deterministic and already represented by `configQuickFixes()`.
6. Add/update a regression check for blocker/important rules or any rule affecting readiness semantics.
7. Run `npm test`.

## Recommended next phase

The next major product improvement should be **Core Flows / user journeys**, not another large catalog expansion.

A good v0.22 direction:

- optional actor-based primary flows
- 3–6 concise steps per flow
- success state + key failure/recovery state
- flows feed acceptance criteria and generated implementation order
- App Setup remains authoritative; a flow cannot silently create disabled product scope
- no giant workflow designer and no repetitive questionnaire

Keep the mantra: **more implementation clarity, not more knobs.**
