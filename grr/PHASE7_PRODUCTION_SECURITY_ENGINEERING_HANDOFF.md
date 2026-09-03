# Phase 7 handoff — Production, Security & Engineering Quality

Blueprint v0.10 expands App Setup to **918 schema-driven decisions across 49 possible section definitions**.

## Product rule

Do not treat the catalog as a questionnaire. Blueprint remains **recommended-first**: a project is valid immediately; users search and change exceptions.

## Architecture decisions

### Existing anchors remain authoritative compatibility points

Do not delete or rename the earlier high-level settings such as:

- `quality.security`
- `quality.accessibility`
- `quality.rateLimit`
- `quality.logging`
- `quality.backups`
- `quality.testing`
- `quality.privacy`
- `platform.deployment`
- `platform.pwa`
- `platform.offline`

Phase 7 deepens these areas; it does not replace the stable IDs used by older workspaces/backups.

### New Phase 7 sections

- `security`
- `privacy`
- `accessibility`
- `seo`
- `performance`
- `observability`
- `recovery`
- `engineering`
- `testing`

### Progressive relevance

Keep the current dependency behavior:

- `seo.*` children depend on `seo.enabled`.
- `recovery.*` depends on the existing non-disposable `quality.backups` values.
- upload hardening depends on `attachments.enabled`.
- DB pooling depends on an actual server database; migrations/seeds hide for static/no-DB projects.
- PWA/offline detail depends on existing platform parent choices.
- payment/webhook/job test controls depend on their feature parents.

Do not flatten these dependencies in Phase 8.

## Safety floor

`minimalPreservesContextIds` intentionally grew in Phase 7. The rule is:

> Minimal may remove optional machinery, but must not silently replace a stronger app-type-specific safety/privacy/recovery/testing baseline with a weaker generic Minimal value.

This is especially important for Government and Clinic.

## Warnings

`configWarnings()` now covers both feature contradictions and production-risk overrides. Warnings must continue to respect `conditionMatches()` so inactive child settings do not nag the user.

## Migration

No backup-schema bump was necessary.

`normalizeProjectConfig()` continues to merge new recommended values into old compatible configs while preserving explicit override IDs/values. Do not create a separate migration table just for Phase 7 settings unless the storage structure itself changes.

## Phase 8 guidance

Phase 8 should focus on intelligence/polish rather than another massive catalog dump:

- stronger contextual recommendation explanations
- readiness/completeness indicators without checklist pressure
- recommended/optional/advanced/not-recommended labeling
- domain-aware suggestions and conflict resolution
- generated edge cases/acceptance criteria
- version/comparison quality
- cleaner generated specs/prompts
- final mobile/accessibility/consistency regression

The hard production contract now exists; Phase 8 should make it feel smarter and easier, not merely larger.
