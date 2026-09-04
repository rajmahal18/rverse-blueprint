# RVerse Blueprint v0.28.0 — Pattern Explorer 2.0 + Anti-Homogeneity

## Release scope

v0.28 implements **Phase 3** of the Visual Intelligence program only. It turns Pattern Explorer from a mostly passive catalog into a recommendation-first visual decision environment, and adds a dimension-aware Anti-Homogeneity engine. It does **not** start v0.29 Page Composition Intelligence or v0.30 Preview Studio.

## What changed

### 1. Pattern Explorer 2.0 — Recommended first

Pattern Explorer now leads with **Recommended for this project** instead of forcing the user to interpret the full pattern library manually.

Each meaningful project receives:

- **Best Match** — the current Visual Director synthesis
- **2 Good Fits**
- **1 Alternative**
- why each direction fits
- a concrete possible drawback
- a qualitative originality estimate (`Familiar`, `Moderately distinct`, `Distinct`, or `Bold / niche`)
- compatibility notes against hard visual constraints
- a coherent, small pattern bundle

The full pattern library remains available underneath for learning and deliberate overrides.

### 2. One-click Use Recommended Direction

**Use Recommended Direction** is now an explicit action.

When clicked, Blueprint:

1. applies the recommended visual DNA,
2. preserves hard constraints through the Visual Director reconciliation layer,
3. adds only the bundled visual patterns that are currently compatible with App Setup and hard visual constraints,
4. preserves all existing functional scope exactly as-is.

No pattern recommendation can turn on Portfolio, Commerce, Payments, Booking, Admin, or any other optional product module.

### 3. Pattern compatibility engine

`src/data/patternIntelligence.ts` adds deterministic compatibility evaluation across two authority layers:

- **App Setup compatibility** — reuses the existing cross-layer `patternApplicability()` rules
- **Visual-constraint compatibility** — detects hard or soft conflicts such as:
  - Glassmorphism exclusion + Localized Glass Panel → conflict
  - Excessive animations exclusion + expressive motion patterns → warning / restraint required
  - Excessive pills + pill-dock navigation → warning
  - Excessive rounded corners + soft-card language → warning
  - typography-family tensions → warning

A pattern that requires inactive product behavior is **omitted from the recommended bundle**. Blueprint does not change App Setup to make the recommendation fit.

### 4. Coherent pattern bundles

Pattern bundles are now curated around visual families instead of adding isolated tricks.

Examples include:

- automotive / Performance Editorial → Editorial Grid, Borderless Sections, Bold Display Sans, Compact Context Header where compatible
- clinic / Calm Service → Outlined Panels, Progressive Disclosure, Compact Context Header, Timeline / forms only when their product scope exists
- government / Civic Clarity → restrained panels, progressive disclosure, institutional navigation/data patterns only when compatible
- booking / Friendly Consumer → sticky actions, compact header, segmented navigation, bottom-sheet/navigation only where App Setup allows them
- sports / Event Energy → high-visibility data and action patterns without inventing dashboard/reporting scope
- portfolio / Editorial Minimal → editorial grid/type/no-card patterns and hero/motion only when compatible

Bundles remain visual selections. They are never scope authority.

### 5. Anti-Homogeneity engine

The previous anti-sameness check mostly blended raw DNA + selected-pattern similarity into one percentage. v0.28 adds a more useful diagnostic model that compares major visual dimensions:

- typography family / heading weight
- heading scale
- grid / alignment
- section rhythm
- surface language / card frequency proxy
- geometry / radius profile
- imagery mode / presentation / character
- color behavior
- motion profile
- icon treatment
- selected pattern overlap

The result is expressed as **LOW / MODERATE / HIGH similarity risk**, plus:

- closest saved project
- repeated traits
- context-safe diversification suggestions

The engine deliberately avoids novelty for novelty's sake. If the current direction is already distinct, it tells the user to preserve contextual coherence rather than randomize the design.

### 6. Canonical benchmark differentiation

The Best Match continues to inherit the v0.27 project-specific Visual Director identity:

- ADW Banawe → **Mechanical Editorial**
- Clinic / EMR → **Clinical Calm**
- Government HRMS → **Institutional Workforce**
- Pickleball Booking → **Courtline Booking**
- Sports Tournament → **Competitive Signal**
- Developer Portfolio → **Authored Portfolio**

The new v0.28 regression suite explicitly verifies that these six benchmark domains do not collapse into one dominant recommendation family.

### 7. Export / compiler integration

Pattern Explorer intelligence now participates in:

- generated implementation Markdown
- coding-agent prompt
- full Blueprint reference
- Generated Spec screen
- structured JSON
- Home anti-homogeneity summary

Structured JSON is now **schema v16** and includes a `patternExplorer` object containing recommendations, bundle compatibility, and anti-homogeneity diagnostics.

Package/generated Blueprint metadata are `0.28.0`.

Backup schema remains **v12** because v0.28 introduces no new required persisted project field. Recommended directions and diagnostics are derived deterministically from existing project/config/history state.

## Main architecture changes

### New `src/data/patternIntelligence.ts`

Exports:

- `patternExplorerIntelligence()`
- `patternCompatibility()`
- `patternIntelligencePrompt()`
- recommendation / bundle / compatibility / history diagnostic types

### `src/data/visualDirector.ts`

The post-synthesis hard-constraint reconciler is now exported as `reconcileVisualConstraints()` so alternate Pattern Explorer directions are subject to the same hard visual authority as the Best Match.

### `src/App.tsx`

- computes one project-level Pattern Explorer intelligence result
- supplies saved-project history for anti-homogeneity comparison
- adds explicit direction application
- merges only compatible bundled pattern IDs
- surfaces v0.28 recommendations in Pattern Explorer
- surfaces anti-homogeneity on Home and Spec
- adds Pattern Explorer intelligence to Markdown, AI prompt, full reference, and JSON

### `src/styles.css`

Adds responsive recommendation cards, bundle chips, compatibility notes, and anti-homogeneity diagnostic layouts.

## Validation

### Full regression chain

`npm test` passes **146 / 146 named regression checks**:

- Engine: 37
- Persistence: 5
- Review Intelligence: 14
- Core Flows: 12
- Implementation Roadmap: 14
- Reusable Product Architecture: 18
- v0.25 Scope Authority + Prompt Compiler: 9
- v0.26 Intelligence Cleanup: 10
- v0.27 Visual Director Core: 14
- **v0.28 Pattern Explorer 2.0 + Anti-Homogeneity: 13**

### v0.28 dedicated checks

The new suite verifies:

- Best Match uses Visual Director synthesis rather than a disconnected preset
- Best Match + Good Fits + Alternative structure
- reasons / drawbacks / qualitative originality
- six-domain differentiation
- small compatible bundles
- Glassmorphism conflict detection
- motion caveat detection
- HIGH repeated-structure similarity diagnostics
- LOW-risk anti-randomness behavior
- explicit typography preservation
- alternative-direction hard-constraint reconciliation
- prompt integration
- no functional-scope mutation
- incompatible functional patterns are omitted rather than activating scope

### Source validation

- all **21 TS/TSX files** pass TypeScript `transpileModule` syntax diagnostics with zero syntax errors
- core v0.28 data modules pass strict TypeScript compilation using the available global TypeScript compiler

### Environment limitation

The project does not have installed `node_modules` in this sandbox. Therefore dependency-backed `npm run typecheck` / Vite production build cannot complete here: React, `react/jsx-runtime`, `react-dom`, `lucide-react`, and their declaration packages are unavailable. The resulting JSX/implicit-any cascade is an environment/dependency failure, not a successful full application typecheck.

On a normal local checkout, run:

```bash
npm ci
npm run typecheck
npm run build
npm test
```

## Release boundary

v0.28 intentionally stops before:

- full page composition generation
- domain-aware page section ordering
- anti-AI-slop page/composition review
- frontend quality contract generation
- Preview Studio
- multi-device live preview
- visual approval / Visual Contract

Those belong to later phases.

## Release rule

> **Recommend coherent directions first, surface compatibility honestly, diversify repeated visual structure without randomizing the product, and never let visual recommendations become functional scope authority.**
