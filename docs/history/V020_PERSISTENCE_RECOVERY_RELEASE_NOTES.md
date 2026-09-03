# v0.20 — Persistence & Recovery Hardening

v0.20 keeps Blueprint's product/recommendation model stable and replaces the fragile heavy `localStorage` workspace path with a durable IndexedDB architecture.

## What changed

### IndexedDB is the workspace source of truth

Blueprint now stores the full mutable workspace in IndexedDB:

- projects
- checkpoints/snapshots
- custom visual patterns
- custom capabilities
- config presets

Only lightweight display preferences such as the active project, learning mode, Setup depth, and Visual Studio depth remain in `localStorage`.

The IndexedDB workspace uses a versioned envelope with `current` and `recovery` records. Normal saves rotate the previous valid current envelope into recovery before writing the new current state.

### Last-known-good recovery

On startup Blueprint validates the current IndexedDB workspace before using it. If current is unavailable or structurally invalid but the recovery envelope is valid, Blueprint loads the recovery copy and promotes it back to current.

Recovery promotion deliberately uses `updateRecovery: false`, so the known-good recovery envelope is not overwritten by the invalid primary state during repair.

The UI reports when the last-known-good copy was recovered.

### Safe v0.19 localStorage migration

Existing v0.19 workspaces remain supported.

Migration order is intentionally conservative:

1. Read and normalize the legacy workspace.
2. Convert legacy inline reference images into IndexedDB Blob assets.
3. Save the complete normalized workspace to IndexedDB.
4. Only after that durable write succeeds, remove the old heavy localStorage keys.

If migration fails before step 3 completes, the legacy localStorage workspace is left intact.

### Reference images are Blob assets

Reference screenshots are no longer stored as Base64 strings inside every project/checkpoint payload.

- new references store `imageAssetId`
- the image bytes live once in the IndexedDB `assets` store
- project duplication/checkpoints can safely reuse the immutable asset id
- preview URLs are created from the Blob only while the component needs them and are revoked on cleanup
- legacy `imageData` remains readable only as a migration/import compatibility field

Blueprint garbage-collects unused assets only during controlled startup/import maintenance, not on every autosave. Cleanup treats the durable current workspace, its checkpoints, and the recovery workspace as live roots. Recovery-only image assets are therefore preserved until that recovery envelope rotates out, and a newly written image asset cannot race a background autosave cleanup.

### Visible save state and actionable failures

Desktop and mobile shells now surface local persistence status:

- `Saving…`
- `Saved locally`
- `Save problem`

Workspace writes are debounced and serialized. A revision guard prevents an older async save from reporting success over a newer unsaved change.

When a workspace save fails, Blueprint tells the user to export a backup before closing and exposes **Retry save**. Reference-image storage failures are also surfaced before the reference is committed to project state.

### Portable backup schema v11

Backup schema advances to **v11**.

A v11 backup contains:

- normalized workspace data with asset ids
- every referenced image asset encoded portably as a data URL
- asset metadata needed to restore the Blob record

Imports remain backwards compatible with v2–v10. Older backups containing inline images are migrated to the Blob asset model during import.

For v11 imports Blueprint validates that every referenced image asset is actually included before replacing the current workspace.

Before import-side asset writes begin, Blueprint cancels any pending debounce, waits for queued saves, and flushes the latest in-memory workspace durably. The imported workspace is then committed so that exact pre-import state becomes recovery. The next normal autosave is skipped once so that recovery snapshot is not immediately rotated away. A failed import after the preflight flush leaves the existing workspace saved and cleans partial orphan assets safely.

### StrictMode-safe hydration

Workspace hydration is guarded by a module-level singleton promise. React StrictMode development remounts therefore cannot start competing migration/recovery transactions.

### Best-effort persistent browser storage

Blueprint requests `navigator.storage.persist()` after successful hydration. This is a durability hint only: failure or unsupported browsers do not block the app, and portable exports remain the recommended backup path for important projects.

## Regression coverage

`npm test` now runs:

- **37 engine checks** from v0.19
- **5 persistence-helper checks** introduced in v0.20

Total release gate: **42 named checks**.

The persistence suite verifies:

- asset ids are collected across live and checkpoint references
- recovery-workspace asset roots remain protected from orphan cleanup
- duplicate asset references are deduplicated
- legacy inline image payloads are removed while asset ids survive
- stripping legacy payloads does not mutate live objects
- projects without image references retain their structure

## Repository / schema updates

- package version: `0.20.0`
- backup schema: **v11**
- generated structured metadata: Blueprint `0.20.0`
- new persistence module: `src/data/persistence.ts`
- new test gate: `scripts/persistence-regression.mjs`
- `.blueprint-persistence-test-build/` ignored
- v0.19 handoff/release notes archived under `docs/history/`

## Validation

Validated in the supplied source tree with:

```bash
npm test
```

Result: **42/42 named checks passed** (37 engine + 5 persistence).

A full clean dependency reinstall/Vite production build could not be completed in the sandbox because npm registry access timed out. The changed TypeScript source was additionally checked with a local no-dependency validation shim; that temporary validation material is not part of the release archive.
