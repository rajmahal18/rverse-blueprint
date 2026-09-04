# RVerse Blueprint v0.30 — Visual Preview Studio MVP Handoff

## Stable baseline

v0.30 completes **Phase 5** of the Visual Intelligence master program. The next implementation window should start from this release and implement **v0.31 — Interactive Approval + Visual Contract Integration** only.

## Architectural guarantees to preserve

1. **Suggested != On.** Project Context, Visual Director, Pattern Explorer, Page Composition, Preview Studio, and approval intelligence may never silently activate optional functional scope.
2. **Preview state is not scope authority.** Viewing an advisory page, switching A/B/C, or changing device mode cannot make that page/module an implementation requirement.
3. **Previewing is reversible; committing is explicit.** v0.30 separates transient inspection/refinement from persisted Visual DNA. Preserve that distinction when adding approval.
4. **Visual Director remains the project-level synthesis source.** Preview and approval specialize/freeze existing direction; they should not become new competing art-direction engines.
5. **Pattern Explorer owns A/B/C recommendation inputs.** Preview Studio consumes those proposals rather than fabricating another recommendation family.
6. **Page Composition owns page hierarchy.** Preview rendering and approval must preserve the domain-aware composition model and `implementation | advisory` scope state.
7. **Hard constraints always outrank visual direction and preview.** Explicit exclusions, accessibility, reduced motion, usability, scope authority, and other hard constraints survive approval.
8. **Mobile composition is recomposed, not shrunk.** Approval must include responsive rules, not only a desktop appearance snapshot.
9. **Frontend Quality Contract remains qualitative acceptance authority.** Do not replace it with fake quality/confidence percentages.
10. **Anti-homogeneity remains contextual.** A distinctive direction is not permission for arbitrary novelty.
11. **Premium remains contextual quality, not a preset.** Automotive, clinic, government, booking, sports, and portfolio outputs must continue to differ.
12. **Do not turn the app into Figma.** Preview/approval is product-direction tooling, not arbitrary graphics editing.

## v0.30 implementation surfaces

### `src/data/previewStudio.ts`

Central Phase 5 preview intelligence:

- Pattern Explorer A/B/C mapping
- placeholder-media direction
- preview warnings
- responsive-preview plans
- explicit scope guardrail

This layer is derived and does not independently change project state.

### `src/components/PreviewStudio.tsx`

Primary visual-decision UI:

- direction selector
- page selector
- desktop/tablet/mobile selector
- live high-value refinements
- explicit save/commit action
- domain-specific preview renderers
- qualitative warning panel

Important: there is currently **no approved state**. A saved preview is still mutable Visual DNA.

### `src/data/visualDna.ts`

v0.30 adds persisted `navigationVariant`:

- Auto / Recommended
- Top bar
- Compact header
- Sidebar
- Bottom dock

It participates in Visual DNA normalization and both full/compact compiler contracts.

### `src/App.tsx`

One project-level chain now flows conceptually as:

```text
Resolved App Setup
→ Visual Director
→ Pattern Explorer
→ Page Composition
→ Preview Studio
→ mutable saved Visual DNA
→ Generated Spec / compiler
```

Preview commits may persist Visual DNA and compatible visual patterns, but they do not mutate App Setup.

### Persistence / metadata

- backup schema: **v13**
- backups accepted: v2–v13
- structured JSON: **v18**
- package / Blueprint version: **0.30.0**

The backup bump exists because navigation variant is now persisted Visual DNA.

## Canonical benchmark expectations

Preview behavior should remain meaningfully different:

- **ADW Banawe** → photographic mechanical-editorial storefront
- **Clinic / EMR** → calm information-first operational hierarchy
- **Government HRMS** → institutional workforce/record hierarchy
- **Pickleball Booking** → availability-first mobile transaction
- **Sports Tournament** → live score/schedule/standings hierarchy
- **Developer Portfolio** → expressive authored-work narrative

v0.31 approval must freeze a coherent selected direction without collapsing those projects into one contract/template family.

## Validation status

- full `npm test`: **178 / 178 named checks pass**
- v0.30 dedicated suite: **16 / 16 pass**
- 24 TS/TSX source files: zero syntax/transpile diagnostics
- Phase 5 data layer: strict TypeScript compilation passes through regression harness
- dependency-backed React/Vite full typecheck/build still requires installed npm dependencies

## Next phase — v0.31 Interactive Approval + Visual Contract Integration

Implement **Phase 6 only** from the master handoff.

### Required deliverables

#### 1. Interactive preview states

Add enough realistic interaction state to make approval meaningful without turning Preview Studio into a full application runtime or Figma clone.

Potential approved-state-relevant examples:

- navigation open/closed where applicable
- selected/active navigation treatment
- hover/focus/pressed examples where material
- booking selection state
- clinic/HRMS selected-row/detail state
- sports live/selected match state

Keep these deterministic and product-relevant.

#### 2. Visual approval state

Create an explicit user action that means:

> This is the visual direction I am approving for implementation.

Approval must be distinct from v0.30's mutable **Save refinement to Blueprint** behavior.

Recommended semantics:

- approval records the currently selected direction/refinements and relevant page/responsive rules
- approval has explicit provenance such as `approved_preview`
- subsequent raw visual edits must either invalidate/stale the approval or require intentional re-approval
- do not silently mutate an approved contract behind the user

#### 3. Approved Visual Contract

Create one stable contract containing at minimum:

```text
VISUAL CONTRACT

Approved direction
Visual Thesis
Design DNA
Page compositions
Typography
Color behavior
Imagery/media direction
Motion
Hard visual constraints
Signature element + placement
Responsive rules
Frontend Quality Contract
Approval provenance / state
```

Prefer synthesized implementation guidance over dumping every raw visual setting.

#### 4. Compiler integration

The primary implementation prompt should use the **Approved Visual Contract** as the authoritative visual source once approval exists.

Suggested priority:

```text
PRODUCT INTENT
SCOPE CONTRACT
VISUAL THESIS
APPROVED DESIGN DNA
PAGE COMPOSITION
SIGNATURE DESIGN ELEMENT
HARD VISUAL CONSTRAINTS
RESPONSIVE BEHAVIOR
MEDIA DIRECTION
COPY DIRECTION
FUNCTIONAL REQUIREMENTS
ARCHITECTURE
SECURITY / ACCESSIBILITY
ACCEPTANCE CRITERIA
DEPLOYMENT
```

Raw/full Blueprint visual detail must remain available in `BLUEPRINT_REFERENCE.md` for audit/debugging.

#### 5. Approval invalidation / staleness

This is important architecture, not polish.

If a material visual input changes after approval, Blueprint should not pretend the old approved contract still reflects current state.

At minimum define deterministic stale behavior for changes to:

- Visual DNA
- selected Pattern Explorer direction/pattern bundle
- Page Composition-relevant product context/scope
- hard visual constraints
- relevant media/copy settings

Do not invalidate approval for harmless preview-only state such as device tab selection.

#### 6. Visual regression benchmark suite

Add end-to-end benchmark assertions across:

- ADW
- Clinic
- HRMS
- Booking
- Sports
- Portfolio

Prove that each can reach an approved Visual Contract and that contracts remain materially/domain-appropriately different.

#### 7. Anti-homogeneity benchmark

Approval should preserve anti-homogeneity diagnostics. If the chosen direction remains too close to a recent unrelated project, surface the warning before/at approval without blocking legitimate contextual similarity automatically.

## Definition of done for v0.31

The following loop works end to end:

```text
Describe
→ Recommend
→ Preview
→ Refine
→ Approve
→ Compile
→ Build
```

Specifically:

- user can approve a selected/refined preview explicitly
- approval creates a stable Approved Visual Contract
- material post-approval changes mark that contract stale or require re-approval
- compiler prefers Approved Visual Contract over unsynthesized raw visual settings
- full Blueprint reference remains available separately
- scope-authority guarantees remain intact
- all six canonical benchmarks generate context-appropriate and materially different approved contracts
- v0.25–v0.30 regression suites remain green

## Important non-goals for v0.31

Do not add:

- arbitrary vector/path editing
- Figma-style freeform canvas tooling
- silent AI scope activation
- fake visual quality scores
- random anti-homogeneity changes
- a second art-direction recommendation engine

The point of Phase 6 is to **close the visual-design-to-implementation authority loop**, not expand the product into a general-purpose design editor.
