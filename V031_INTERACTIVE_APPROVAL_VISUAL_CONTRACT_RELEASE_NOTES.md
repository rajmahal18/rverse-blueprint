# RVerse Blueprint v0.31.0 — Interactive Approval + Visual Contract Integration

## Release status

Final phase of the v0.26 → v0.31 Visual Intelligence program.

The end-to-end product loop is now implemented:

```text
Describe
→ Recommend
→ Preview
→ Refine
→ Approve
→ Compile
→ Build
```

## What changed

### Explicit visual approval

Preview Studio now separates two different actions:

- **Save refinement to Blueprint** — updates the mutable working Visual DNA / compatible pattern selection.
- **Approve for implementation** — atomically saves the displayed direction/refinement and creates a stable approval snapshot with provenance `approved_preview`.

Approval is a visual/presentational authority boundary. It never authorizes functional scope.

### Approved Visual Contract

A persisted Approved Visual Contract now contains:

- approved direction
- Visual Thesis
- Design DNA
- normalized Visual DNA
- page compositions and their `implementation | advisory` state
- typography direction
- color behavior
- imagery/media direction
- motion direction
- hard visual constraints
- signature design element + placement
- responsive rules
- product-relevant interaction states
- Frontend Quality Contract
- audience/copy direction
- compatible selected pattern IDs
- anti-homogeneity diagnostic at approval time
- scope guardrail
- approval provenance and material-state hashes

### Deterministic stale / re-approval behavior

Blueprint derives approval freshness from material visual inputs. It does not rely on a manually maintained stale flag.

The approval becomes **STALE** when material inputs change, including:

- Visual DNA
- selected compatible Pattern Explorer patterns/bundle
- Visual Director synthesis / hard constraints
- Page Composition / responsive rules
- Project Context used by visual intelligence
- scope, media, or audience-copy direction

Preview-only state does **not** stale approval:

- desktop/tablet/mobile tab
- selected preview page
- selected interaction-state tab

A stale contract is preserved as audit/history but explicitly removed from current compiler authority until the user re-approves.

### Compiler integration

When approval is fresh, the primary implementation prompt now prioritizes:

```text
VISUAL AUTHORITY — APPROVED VISUAL CONTRACT
VISUAL THESIS
APPROVED DESIGN DNA
TYPOGRAPHY
COLOR BEHAVIOR
PAGE COMPOSITION
SIGNATURE DESIGN ELEMENT
HARD VISUAL CONSTRAINTS
RESPONSIVE BEHAVIOR
INTERACTION STATES TO PROVE
MEDIA DIRECTION
MOTION
COPY DIRECTION
FRONTEND QUALITY CONTRACT
ANTI-HOMOGENEITY CHECK
```

The coding agent is explicitly told not to recombine raw Visual Studio settings into a competing direction.

`BLUEPRINT_REFERENCE.md` remains exhaustive and includes:

- current raw/synthesized visual state
- visual approval status
- saved Approved Visual Contract snapshot, including stale snapshots for audit

### Interactive preview states

Preview Studio now demonstrates product-relevant interaction states before approval:

- automotive — active nav, pressed primary CTA
- clinic — selected patient/queue row, keyboard focus
- government HRMS — selected record, active workspace nav
- booking — selected slot, unavailable slot
- sports — selected/live match, active event nav
- portfolio — project hover/focus, active section

These are deterministic proof states, not a Figma-style runtime editor.

### Anti-homogeneity at approval

The current LOW / MODERATE / HIGH similarity diagnostic is visible before approval and snapshotted into the Approved Visual Contract.

A warning does not automatically block approval because legitimate contextual similarity is allowed. Blueprint continues to prefer context-safe diversification over random novelty.

### Scope safety remains intact

The v0.25 rule remains non-negotiable:

```text
Suggested != On
```

Approval and visual intelligence cannot activate optional functional modules. Advisory pages remain advisory until valid App Setup authority exists.

### Preview domain routing fix

The v0.31 interaction benchmark exposed a latent v0.30 integration bug: Page Composition exported the human-readable Design DNA archetype as `domain`, while Preview Studio expected the stable Visual Director direction ID.

The fix is architectural: Page Composition now exports the stable domain ID (`automotive-retail`, `clinic-operations`, `government-workforce`, `booking-consumer`, `sports-event`, `portfolio-creative`, etc.). This ensures domain-specific live preview renderers are actually selected.

## Persistence / export metadata

- package version: **0.31.0**
- backup schema: **v14**
- accepted backups: **v2–v14**
- structured Blueprint JSON: **v19**
- Approved Visual Contract schema: **v1**

Checkpoints now preserve the Approved Visual Contract snapshot. Restoring a checkpoint restores that snapshot alongside the material state; freshness is then derived normally. Duplicating a workspace deliberately clears approval so an alternate branch must be approved independently.

## Regression coverage

Dedicated v0.31 suite: **18 / 18**.

It proves:

- explicit `approved_preview` provenance
- fresh approval evaluation
- DNA stale detection
- pattern stale detection
- Project Context stale detection
- media/copy stale detection
- functional scope changes stale the visual contract without being caused by approval
- stale contract authority removal
- complete Approved Visual Contract prompt sections
- distinct interaction proof states
- scope safety
- six canonical benchmark contract differentiation
- anti-homogeneity snapshot without automatic blocking
- persistence normalization
- preview-only tabs excluded from freshness hashes
- explicit approve/re-approve Preview Studio semantics
- approved compiler priority
- v0.31 persistence/export metadata

Full regression chain: **196 / 196 named checks pass**.

Also validated:

- v0.29 dedicated suite after domain routing fix: **16 / 16**
- v0.30 dedicated suite after domain routing fix: **16 / 16**
- 25 TS/TSX source files: **0 syntax/transpile diagnostics**
- Phase 6 data layer: strict TypeScript compilation passes through the regression harness

## Environment-specific build gate

The release sandbox has no `node_modules`. A direct `npm run typecheck` therefore fails at dependency resolution (`react`, `react-dom`, `lucide-react`, JSX types), not because of a demonstrated Phase 6 data-layer regression.

Run in a dependency-enabled local environment:

```bash
npm ci
npm run typecheck
npm run build
npm test
```

## Program result

The six-phase Visual Intelligence revamp now has a complete authority chain:

```text
Explicit App Setup scope
→ Visual Director synthesis
→ Pattern Explorer recommendations
→ Page Composition Intelligence
→ Visual Preview Studio
→ explicit visual approval
→ Approved Visual Contract
→ compiled implementation prompt
```

Functional scope authority and visual authority remain deliberately separate.
