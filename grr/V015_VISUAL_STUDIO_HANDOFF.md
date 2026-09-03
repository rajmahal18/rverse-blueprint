# Blueprint v0.15 — Visual Studio Handoff

## Source of truth

This patch was implemented from the v0.14 Intent + Consistency codebase. Continue using the latest v0.15 ZIP/codebase rather than rebuilding Visual Studio from notes.

## Architecture

### Visual data model

`src/data/visualDna.ts` owns:

- the expanded `Dna` type
- `defaultDna`
- migration/normalization via `normalizeDna`
- real typography specimen mappings
- visual presets
- Visual Studio contract serialization for Markdown/AI prompts

Legacy DNA fields remain intentionally available for compatibility with older projects and existing recommendation heuristics.

### Visual Studio UI

`src/components/VisualStudio.tsx` owns the v0.15 visual configurator and live specimen.

Visual Studio has its own `Quick / Standard / Advanced` presentation depth. Do not couple this depth to App Setup depth and do not let it mutate configuration.

### Authority rule

Structured Visual Studio settings are deterministic visual truth. `visualSignature` is verbatim lower-authority human context and must not silently mutate structured settings.

### Persistence

Backup/schema version is v7. Keep v2–v7 import compatibility unless a future migration explicitly supersedes it.

## Important continuation rules

- New visual controls should produce a visible preview difference where practical.
- Avoid adding controls that only rename generated prompt text while the specimen stays materially unchanged.
- Quick should remain curated; deeper design-token controls belong in Standard or Advanced.
- Preserve usability and progressive disclosure even as the visual catalog grows.
- Do not merge Project Context or Visual Signature into deterministic inference.
- Keep App Setup as product scope truth; Visual Studio describes appearance, not whether product features exist.
- When adding presets, merge their palette roles rather than destructively deleting unspecified semantic roles.
- Any new high-impact visual dimension should be considered for checkpoint diffs, similarity/anti-sameness, sanity checks, exports, and live preview.
