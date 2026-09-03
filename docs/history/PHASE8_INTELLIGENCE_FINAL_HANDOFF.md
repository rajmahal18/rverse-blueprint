# Phase 8 final handoff — Blueprint v0.11

Blueprint's eight-phase expansion is complete.

## Current contract

- **918 App Setup settings**
- **49 possible context-aware sections**
- **11 app types × 4 profiles**
- zero new setup questions in Phase 8
- browser-local persistence; no backend required
- backup schema remains version 4

## Intelligence module

`src/data/intelligence.ts` owns derived guidance only. It must not become a second source of truth for configuration.

It currently provides:

- `configReadiness(config)`
- `appTypeMatches(config)`
- `settingGuidance(setting, config)`
- `configQuickFixes(config)`
- `domainSuggestions(config)`
- `acceptanceCriteria(config)`
- `edgeCases(config)`

Rules for future maintenance:

1. Derive intelligence from `ProjectConfig` and the configurator schema; do not duplicate the 918-setting catalog.
2. A neutral Custom project must not fabricate an app-type recommendation before meaningful signals exist.
3. Recommended defaults should remain warning-free.
4. Quick fixes must be explicit user actions; never silently mutate a project.
5. Suggestions are optional product advice, not readiness failures.
6. Readiness must not pressure users to manually override recommended defaults.

## Checkpoint model

New checkpoints include App Setup, patterns, Visual DNA, capabilities, docs, and references. Older snapshots may lack the optional Phase 8 fields and must remain readable/restorable.

Keep checkpoint restore explicit and show a comparison first when possible.

## Preset model

Custom configuration presets store:

- app type
- profile
- override values only

Do not serialize a full copy of all recommended values into a preset. Rebuilding the contextual base and replaying overrides is intentional—it allows future recommended defaults to evolve without freezing old schema state.

## Generated output

Markdown and AI prompts now use a two-layer structure:

1. concise implementation brief: readiness, important customizations, acceptance criteria, edge cases, review signals
2. exhaustive active App Setup contract appendix

Keep that hierarchy. Do not regress to dumping hundreds of settings before the implementation intent.

JSON adds an `intelligence` object with readiness, review signals, acceptance criteria, edge cases, and app-type matches while preserving the project/config payload.

## Final usability principle

The user should normally be able to:

1. Create a project.
2. Pick the closest app type.
3. Keep Recommended.
4. Change only important exceptions.
5. Add capabilities/visual direction/references if useful.
6. Review readiness or suggestions only when needed.
7. Generate the implementation brief.

The power of 918 settings should remain mostly invisible until deliberately searched/opened.
