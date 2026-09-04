# RVerse Blueprint v0.27 — Visual Director Core

## Release scope

This release implements **Phase 2 only** of the Visual Intelligence master program. Pattern Explorer 2.0 / Anti-Homogeneity remains v0.28 and is intentionally not included here.

## Product change

Blueprint now has a central Visual Director that synthesizes project context, app type, active visual DNA, usability priority, originality posture, media settings, and the curated visual-direction library into **one coherent project-level direction**.

The intended shift is from:

> many individually reasonable visual controls / patterns

into:

> one Visual Thesis + one Design DNA that explains how the entire product should look and feel.

## New Visual Director outputs

Every synthesis includes:

- direction name and base visual family
- Visual Thesis
- Design DNA
  - archetype
  - visual tension
  - primary character
  - composition
  - geometry
  - typography
  - color behavior
  - imagery
  - motion
  - density
  - signature moment
  - avoid list
- typography direction with heading/body/UI weights
- media direction
- signature design element
- Premium quality semantics
- Hard / Direction / Freedom decision hierarchy
- implementation freedoms
- reconciled proposed Visual Studio DNA

## New controls

### Design Autonomy

- `Strict`
- `Balanced` — recommended default
- `Art Director`

Strict keeps the current Visual Studio DNA as the proposal and uses the Director primarily as analysis/direction. Balanced resolves unspecified design choices while preserving hard constraints and theme posture. Art Director permits stronger visual/compositional synthesis while still preserving usability, anti-pattern exclusions, accessibility, and explicit typography weights.

### Visual Originality

- `Safe`
- `Distinct` — recommended default
- `Bold`
- `Experimental`

Originality can increase visual character, but `Ease of use: Non-negotiable` caps aggressive composition/motion changes.

### Signature brand moment

- `None`
- `Subtle`
- `Recommended`
- `Strong`

The signature element is domain-specific and is never permission to reduce usability.

## Canonical benchmark results

| Benchmark | Visual Director result |
| --- | --- |
| ADW Banawe automotive retail | **Mechanical Editorial** |
| Clinic / EMR | **Clinical Calm** |
| Government HRMS / workforce | **Institutional Workforce** |
| Pickleball booking | **Courtline Booking** |
| Sports tournament / live event | **Competitive Signal** |
| Developer / creative portfolio | **Authored Portfolio** |

The six benchmark outputs use meaningfully different archetypes, composition logic, signatures, and dominant base direction families.

## Scope-authority guarantee

v0.27 preserves all v0.25/v0.26 guarantees:

- `Suggested != On`
- Project Context remains advisory for functional scope
- Visual Director has **zero functional-scope activation authority**
- visual/media synthesis cannot create checkout, accounts, payments, inventory, CRM, booking, admin, or other optional modules
- hard dependencies remain the only non-user authority that can force functional scope
- roadmap sequencing remains non-authoritative for scope

## Hard / Direction / Freedom hierarchy

The Visual Director now emits an explicit hierarchy:

1. **Hard** — usability, accessibility, reduced-motion, explicit typography weights, selected visual exclusions, and other non-negotiable constraints.
2. **Direction** — synthesized Design DNA and Visual Thesis.
3. **Freedom** — micro-layout, exact responsive crop/stack details, minor spacing, and implementation-specific transition details where Blueprint is silent.

Hard constraints are reconciled after direction synthesis so a recommended visual family cannot silently reintroduce Glassmorphism, heavy gradients, excessive pills, excessive rounding, or excessive animation when excluded.

## Premium semantics

“Premium” now means:

- deliberate composition
- excellent typography
- refined spacing
- strong hierarchy
- coherent visual language
- context-appropriate imagery
- restrained effects
- intentional responsive behavior
- realistic content
- project-specific polish

It does **not** automatically mean black/beige, giant serif headings, glassmorphism, oversized whitespace, generic luxury clichés, or repeated SaaS card grids.

## Compiler/export changes

The synthesized Visual Director output is now included before raw Visual Studio settings in:

- primary implementation Markdown
- coding-agent prompt
- full Blueprint reference
- generated Spec UI
- JSON export

JSON schema version is now **15**. Blueprint metadata is `0.27.0`.

The primary prompt explicitly states that Visual Director synthesis is **visual/presentational authority only** and cannot activate functional scope.

## Validation

Named regression checks:

- Engine: 37 passed
- Persistence: 5 passed
- Typed review intelligence: 14 passed
- Core Flows: 12 passed
- Implementation Roadmap: 14 passed
- Reusable Product Architecture: 18 passed
- v0.25 Scope Authority / Prompt Compiler: 9 passed
- v0.26 Intelligence Cleanup: 10 passed
- **v0.27 Visual Director Core: 14 passed**

**Total: 133 named regression checks passed.** The complete chained `npm test` command also passes from the final v0.27 tree.

Additional validation:

- `src/data/visualDna.ts`, `visualSuggestions.ts`, and new `visualDirector.ts` pass strict TypeScript compilation with the available global compiler.
- all 20 TS/TSX source files pass TypeScript parse/transpile sanity with zero syntactic diagnostics.

A dependency-backed `tsc -b` / Vite build cannot be claimed in this sandbox because project dependencies (`react`, `react-dom`, `lucide-react`, etc.) are not installed and the environment used for v0.26 could not complete npm registry installation. The emitted full-project typecheck therefore reports missing dependency/type declarations. Run `npm ci`, `npm run typecheck`, and `npm run build` in a normal networked development environment before deployment.

## Not included

This release intentionally does **not** implement:

- Pattern Explorer 2.0 Best Match / Good Fits UI
- pattern bundles / compatibility scoring expansion
- Anti-Homogeneity engine and recent-output similarity diagnostics
- Page Composition Intelligence
- Anti-AI-slop full visual review
- Visual Preview Studio A/B/C directions
- Visual approval / Approved Visual Contract

Those remain v0.28–v0.31 according to the master phase plan.
