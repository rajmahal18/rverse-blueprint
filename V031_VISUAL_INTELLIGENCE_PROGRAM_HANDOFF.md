# RVerse Blueprint v0.31 — Visual Intelligence Program Completion Handoff

### Stable baseline

v0.31 completes the planned **v0.26 → v0.31 Visual Intelligence program**.

Do not treat this as a request to add a seventh phase automatically. Future work should begin from observed product usage, benchmark results, or a new explicit product direction.

## North star now implemented

> Recognition over construction.

> Premium without sameness.

> Visual intelligence first.

> Show the design before asking the coding agent to build it.

The intended loop now exists end to end:

```text
Describe
→ Recommend
→ Preview
→ Refine
→ Approve
→ Compile
→ Build
```

## Authority model to preserve

### Functional authority

Functional scope may become active only through:

1. explicit user selection
2. persisted explicit selection
3. a real hard dependency

`Suggested != On` remains a permanent architecture rule.

Project Context, Visual Director, Pattern Explorer, Page Composition, Preview Studio, visual approval, and Approved Visual Contract **cannot** activate optional functional scope.

### Visual authority

For visual/presentational implementation:

1. explicit hard visual constraints / accessibility / usability
2. **fresh Approved Visual Contract**, when present
3. current Visual Director / Pattern Explorer / Page Composition synthesis when no fresh approval exists
4. implementation judgment where Blueprint is silent

A stale Approved Visual Contract is audit history only until re-approved.

## v0.31 architecture

### `src/data/visualApproval.ts`

Owns:

- `ApprovedVisualContract`
- `VisualApprovalStatus`
- approval snapshot creation
- material-state hashing
- deterministic freshness/staleness evaluation
- domain-specific interaction proof states
- approved contract compiler text
- stale compiler warning
- persisted-contract normalization

Do not replace derived freshness with a manually mutated `stale: true/false` flag. Derived comparison prevents silent drift and survives import/checkpoint restore cleanly.

### `src/components/PreviewStudio.tsx`

Now owns the final human visual decision surface:

- A/B/C comparison
- multi-page/device preview
- high-value live refinements
- product-relevant interaction-state inspection
- mutable save action
- explicit approve/re-approve action
- approval status / stale detail
- anti-homogeneity warning at approval
- approval removal

Preview-only state must remain ephemeral and must not invalidate approval.

### `src/data/pageComposition.ts`

`PageCompositionIntelligence.domain` now exports the stable Visual Director domain ID, not the human-readable archetype. Preserve this contract because Preview Studio and approval interaction states route by stable ID.

### `src/App.tsx`

The full chain is:

```text
Resolved App Setup
→ Visual Director
→ Pattern Explorer
→ Page Composition
→ Preview Studio
→ explicit approval
→ Approved Visual Contract
→ Generated Spec / compiler
```

Approval is persisted per project and per checkpoint.

Important branch behavior:

- checkpoint restore restores the saved approval snapshot and then derives freshness
- workspace duplication clears approval so the alternate branch must be approved independently
- material edits do not delete the old contract; they make it stale

## Compiler behavior

### Fresh approval

The primary prompt uses the Approved Visual Contract as the authoritative visual source and tells the coding agent not to reconstruct a competing design from raw settings.

### Stale approval

The prompt explicitly states that the previous approved contract MUST NOT be treated as current implementation authority and requires re-approval.

### No approval

Current Visual Director + Pattern Explorer + Page Composition + Visual DNA remain provisional guidance.

### Full Blueprint reference

`BLUEPRINT_REFERENCE.md` always preserves exhaustive current detail and, when present, the saved Approved Visual Contract snapshot for audit/debugging.

## Canonical benchmark expectations

Continue regression testing these six families:

- **ADW Banawe** — Mechanical Editorial / photographic automotive storefront
- **Clinic / EMR** — Clinical Calm / information-first operational hierarchy
- **Government HRMS** — Institutional Workforce / record and action hierarchy
- **Pickleball Booking** — Courtline Booking / availability-first mobile transaction
- **Sports Tournament** — Competitive Signal / live scores, standings, schedule
- **Developer Portfolio** — Authored Portfolio / expressive real-work narrative

Fail visual regression if unrelated projects collapse toward the same dominant composition/type/surface/imagery combination without contextual reason.

## Validation baseline

At release:

- full `npm test`: **196 / 196 named checks pass**
- dedicated v0.31: **18 / 18**
- v0.29 after domain-routing correction: **16 / 16**
- v0.30 after domain-routing correction: **16 / 16**
- 25 TS/TSX files: zero syntax/transpile diagnostics
- strict Phase 6 data-layer TypeScript compilation: pass

Full dependency-backed React/Vite typecheck/build requires installed npm dependencies.

## Metadata

- package / Blueprint: **0.31.0**
- backup schema: **v14**
- structured JSON: **v19**
- Approved Visual Contract: **v1**

## Future-work rule

Do not add features merely because they are adjacent to visual tooling. Validate future work against the product question:

> Does this help a developer with strong visual taste but weak manual design-construction skills recognize, choose, approve, and successfully implement a better differentiated design?

If not, it probably does not belong in the Visual Intelligence core.
