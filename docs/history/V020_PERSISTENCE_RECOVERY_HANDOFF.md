# Blueprint handoff — continue from v0.20

Use the latest v0.20 ZIP/codebase. Do not rebuild Blueprint from handoff prose. Historical handoffs and release notes live under `docs/history/`.

## Current release identity

- Blueprint version: `0.20.0`
- Backup schema: v11
- IndexedDB schema: v1
- App Setup catalog: 918 settings / 49 sections
- Supported app types: 11
- Test gate: `npm test`
- Current named checks: 42 (37 engine + 5 persistence)

## v0.20 product rule

**Local-first must not mean invisible data loss.** Durable workspace state belongs in IndexedDB, large binary assets belong in the asset store, failures must be visible/actionable, and important work must remain exportable.

Do not move projects/reference images back into localStorage for convenience.

## Persistence architecture

`src/data/persistence.ts` owns the IndexedDB boundary.

Database: `rverse-blueprint`, schema version 1.

Stores:

- `workspace`
  - `current`: latest durable workspace envelope
  - `recovery`: prior known-good workspace envelope
- `assets`
  - immutable-ish Blob records addressed by `imageAssetId`

Workspace envelope fields:

- `id`
- `schemaVersion`
- `savedAt`
- `data`

Normal `saveWorkspace()` behavior rotates previous current → recovery, then writes the new current envelope.

Recovery promotion must use `{ updateRecovery: false }`; otherwise a corrupt/invalid primary can replace the good recovery snapshot during startup repair.

## Protected persistence invariants

Treat these as architecture:

- heavy workspace state is IndexedDB-backed
- localStorage is limited to lightweight preferences plus legacy migration keys
- old heavy localStorage keys are removed only after a successful IndexedDB write
- references store `imageAssetId`, not newly generated Base64 `imageData`
- checkpoints count as live asset references for cleanup purposes
- orphan cleanup runs only during controlled startup/import maintenance, never as a background step after every autosave
- orphan cleanup must preserve assets referenced by both `current` and `recovery` workspace envelopes
- a failed image-asset write must not add a dangling project reference
- normal async saves are serialized
- an older save completion must not mark a newer revision as saved
- recovery promotion preserves the existing known-good recovery copy
- backup imports first flush the latest in-memory workspace, then preserve that exact pre-import state as recovery
- pending/queued normal saves must finish before import assets or imported workspace state are installed
- the first state effect after a direct backup import must not immediately rotate away that recovery copy
- v11 export must contain every referenced image asset
- v11 import must reject a backup missing any referenced asset
- v2–v10 backups remain importable and inline images migrate forward
- generated implementation specs must not contain local-only `imageData` or `imageAssetId` payload details

## Hydration and migration

Hydration is singleton-based to survive React StrictMode remounts.

Startup priority:

1. valid IndexedDB current
2. valid IndexedDB recovery
3. legacy localStorage workspace
4. new blank workspace

Legacy image migration converts data URLs to Blobs before the migrated workspace is committed. Clear old heavy localStorage only after the commit succeeds.

If IndexedDB is unavailable, Blueprint can still open an in-memory/legacy fallback and should clearly show a save error. Do not silently pretend it is durable.

## Reference assets

`ReferenceItem.imageData` exists only for old backup/localStorage compatibility. New writes should use `imageAssetId`.

When rendering an IndexedDB image:

1. read Blob by asset id
2. create an object URL
3. render it
4. revoke it when the reference changes/unmounts

Do not persist object URLs.

## Backup contract

Backup schema v11 contains a portable `assets` array with data URLs. This is intentional: Base64/data URL is acceptable at the **export boundary**, but not as the live browser database representation.

When changing the backup schema, retain backwards import compatibility unless there is a documented reason not to.

## Testing

Run before any persistence or engine change:

```bash
npm test
```

Individual gates:

```bash
npm run test:engine
npm run test:persistence
```

The current persistence helper suite is intentionally dependency-free. If IndexedDB integration tests are added later, prefer a small controlled test dependency rather than weakening the existing deterministic gate.

## Next recommended phase

v0.21 should improve **review-signal trust and recommendation provenance**, not add more app types/settings:

- replace free-form warning strings with typed review signals
- assign stable ids, categories, and severity (`info`, `review`, `important`, `blocker`)
- make readiness/status derive from structured signals rather than keyword matching
- expose concise “Why this recommendation?” provenance from the existing Explicit / Required / Inferred / Recommended / Contextual resolution model
- keep the numeric readiness score secondary to meaningful status/severity

Do not combine v0.21 with Core Flows yet unless the structured review-signal migration is already stable and tested.
