# RVerse Blueprint v0.27 — Visual Director Core Handoff

## Stable baseline

v0.27 completes **Phase 2** of the Visual Intelligence master program. The next implementation window should start from this release and implement **v0.28 — Pattern Explorer 2.0 + Anti-Homogeneity** only.

## Architectural guarantees to preserve

1. **Suggested != On.** App type/profile/context/recommendations/defaults cannot silently activate optional functional scope.
2. **Visual intelligence has no functional-scope authority.** Visual Director, pattern recommendations, originality, media direction, and signature elements may shape presentation only.
3. **Project Context remains advisory for scope.** It may influence Visual Director synthesis and low-risk presentation completion but cannot create business modules.
4. **Hard visual constraints outrank synthesized direction.** Explicit typography weights and active visual exclusions must survive direction application.
5. **Direction outranks freedom.** Implementation judgment can resolve minor details only where the Visual Thesis / Design DNA is silent.
6. **Prompt output stays compiled.** The primary implementation prompt should lead with synthesized guidance; exhaustive raw settings remain in the Blueprint reference.
7. **Do not treat “premium” as a universal style preset.** Premium is a quality bar, not black/beige/serif/glass/whitespace defaults.

## New v0.27 implementation surfaces

### `src/data/visualDirector.ts`

Central deterministic synthesis engine:

- `synthesizeVisualDirector()`
- `visualDirectorPrompt()`
- `VisualDirectorOutput`
- `DesignDNA`
- Hard / Direction / Freedom `VisualDecision` model
- domain profiles and signature motifs
- typography/media direction synthesis
- premium-quality semantics
- post-synthesis hard-constraint reconciliation

### `src/data/visualDna.ts`

New persisted visual controls/types:

- `DesignAutonomy`
- `VisualOriginality`
- `SignatureStrength`
- `VisualAuthority`
- `VisualDecisionSource`

Defaults:

- Design Autonomy: `Balanced`
- Visual Originality: `Distinct`
- Signature Strength: `Recommended`

Normalization handles older workspaces without migration.

### `src/components/VisualStudio.tsx`

New Visual Director surface shows:

- synthesized direction name
- Visual Thesis
- archetype / visual tension
- composition
- typography
- signature element
- hard constraints
- explicit **Use Visual Director** action
- Design Autonomy / Visual Originality / Signature controls
- Premium-is-quality-not-preset explanation

Applying the proposed direction remains an explicit user action.

### `src/App.tsx`

- central `projectVisualDirector()` adapter combines App Setup media settings, Project Context, active packs, and Visual DNA
- generated implementation Markdown prioritizes Visual Director synthesis
- coding-agent prompt prioritizes synthesized visual guidance before raw Visual Studio controls/patterns
- full Blueprint reference includes the synthesis
- Spec UI exposes the current direction
- JSON export adds `visualDirector` and moves to schema v15
- Blueprint metadata is `0.27.0`

### `scripts/visual-director-core-regression.mjs`

14 dedicated checks covering:

- six benchmark domains
- benchmark differentiation
- Strict autonomy
- explicit typography preservation
- hard anti-pattern reconciliation
- premium semantics
- media settings
- authority hierarchy in prompt output
- functional scope non-mutation

## Canonical benchmark expectation

The following deterministic high-level identities are now expected:

- ADW automotive retail → **Mechanical Editorial**
- Clinic / EMR → **Clinical Calm**
- Government HRMS → **Institutional Workforce**
- Pickleball booking → **Courtline Booking**
- Tournament / live sports → **Competitive Signal**
- Developer / creative portfolio → **Authored Portfolio**

Do not require these exact labels forever if a later engine becomes more sophisticated, but preserve the important property: the domains must resolve to meaningfully different coherent design systems.

## Validation status

- The complete chained `npm test` command passes: 133 named regression checks across v0.12–v0.27 suites.
- 20 TS/TSX source files pass parse/transpile sanity with zero syntactic diagnostics.
- Visual Director data modules pass strict TypeScript compilation using the available global compiler.
- Full dependency-backed `tsc -b` / Vite build still requires a normal environment with installed npm dependencies. This sandbox has no working project `node_modules`; missing React/lucide declarations are environmental rather than a validated application build.

## Next phase — v0.28 Pattern Explorer 2.0 + Anti-Homogeneity

Implement the master handoff’s Phase 3 only:

- **Recommended for this project** hierarchy
  - Best Match
  - 2–3 Good Fits / alternatives
- why it fits
- possible drawback
- estimated originality (do not fake mathematical certainty)
- compatibility with active visual constraints
- one-click **Use Recommended Direction**
- pattern compatibility engine
- coherent pattern bundles
- Anti-Homogeneity engine
- visual similarity diagnostics across major dimensions
- contextually appropriate variation strategy

### v0.28 definition of done

A clinic, ADW, HRMS, booking system, sports site, and portfolio must not all receive the same dominant pattern family. Pattern Explorer should require much less manual design knowledge: the user should see a clear Best Match and a few coherent alternatives rather than interpreting a large pattern catalog alone.

## Important boundary for v0.28

Do **not** start Phase 4 Page Composition Intelligence in the same patch unless the phase plan is explicitly changed. v0.28 may use the current Visual Director Design DNA as its recommendation context, but it should not yet build the full page-composition generator or Preview Studio.
