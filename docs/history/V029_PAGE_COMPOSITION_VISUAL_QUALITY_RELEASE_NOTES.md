# RVerse Blueprint v0.29.0 — Page Composition Intelligence + Visual Quality Review

## Release scope

v0.29 implements **Phase 4** of the Visual Intelligence program only. It moves Blueprint from project-level visual direction into first-class page composition, responsive recomposition, anti-AI-slop review, and frontend visual acceptance criteria. It does **not** start v0.30 Visual Preview Studio.

## What changed

### 1. First-class Page Composition Intelligence

New `src/data/pageComposition.ts` derives a composition contract for the project’s major pages. Every page model includes:

- page purpose
- implementation vs advisory scope state
- scope reason / provenance boundary
- visual anchor
- ordered section hierarchy
- section role and composition intent
- content rhythm
- CTA strategy
- imagery placement
- mobile recomposition
- density behavior
- primary interaction behavior
- project-specific signature-element placement
- explicit things to avoid

This is synthesized from the existing Visual Director + Pattern Explorer context rather than creating a competing design system.

### 2. Scope-safe page planning

Page composition is visual/presentational authority only.

A composition may be generated as an **advisory visual proposal** from clear Project Context, but it never turns the required domain pack on.

Example: ADW Banawe can receive a strong product/location storefront composition while `pack.portfolio` remains inactive. The generated page is labeled advisory until the user explicitly activates the corresponding structured scope.

The same rule applies to booking, commerce, payments, clinic, government, tournament, admin, and other optional functional modules.

### 3. Domain-aware composition families

Canonical benchmark projects now receive structurally different page logic:

- **ADW Banawe / automotive retail** → image-led storefront, product/upgrades discovery, product story, shop capability, location, directions/contact
- **Clinic / EMR** → clinical work queue, patient context, longitudinal record/timeline, active-care hierarchy
- **Government HRMS** → workforce overview, organizational context, people/record access, personnel record/history
- **Pickleball Booking** → availability-first selection, current selection/price, confirmation/recovery; payments appear only when payment scope is active
- **Sports Tournament** → live/current matches, up-next schedule, standings, event identity, score-first match center
- **Developer Portfolio** → authored introduction, selected work, evidence, case-study narrative, contact

Public-site composition no longer defaults to a universal:

```text
Hero
3 cards
About
Testimonials
CTA
Footer
```

unless the real content and product purpose genuinely support it.

### 4. Responsive composition is explicit

Every generated page carries actual mobile recomposition behavior instead of only resize advice.

Shared rules include:

- prioritize the page’s primary task / visual anchor before stacking
- define a mobile priority order for desktop side-by-side regions
- transform wide tables/grids into domain-appropriate row/detail/grouped structures instead of shrinking below readable sizes
- keep primary action and critical state accessible without hover
- when ease of use is Non-negotiable, defer secondary content before compromising task clarity

Domain-specific mobile instructions are generated alongside the shared rules.

### 5. Signature-element placement becomes contextual

The v0.27 signature motif is no longer only a prose idea. v0.29 gives it a functional home inside page composition.

Examples:

- ADW mechanical/spec-ruler language → hero/product-story alignment and fitment/category details
- Clinic timeline rhythm → longitudinal patient activity and care progression
- Government institutional grid → identity context, section rules, navigation
- Booking court-line geometry → availability and selected-state framing
- Sports broadcast/score rail → live match and scoreboard hierarchy
- Portfolio authored interaction/type behavior → opening and selected case-study transition

The motif must reinforce task, content, or identity rather than become arbitrary decoration.

### 6. Deterministic Anti-AI-Slop / Visual Quality Review

v0.29 adds qualitative review dimensions:

- visual coherence
- composition originality
- content realism
- template risk
- AI-slop risk
- instruction contradiction
- imagery appropriateness
- typography coherence
- responsive composition quality
- audience-copy quality

Results are intentionally qualitative (`CLEAR`, `REVIEW`, `HIGH RISK` plus per-dimension `clear/review/risk`). There is no fabricated certainty or synthetic quality percentage.

Review logic combines current hard contradictions, anti-homogeneity state, domain/media fit, signature strength, responsive completeness, and customer-copy guardrails.

### 7. Frontend Quality Contract

The compiler now emits visual acceptance criteria such as:

- finished real-product/business feel, not design-system-demo feel
- no section exists only to showcase a pattern
- customer-facing copy uses natural customer/domain language and never leaks Blueprint/developer terminology
- imagery must match the actual domain and page purpose
- repetitive card-grid composition is avoided when another information structure is better
- mobile is recomposed rather than merely scaled down
- visual hierarchy stays intentional at every supported size
- “premium” comes from composition, typography, spacing, realism, and coherence—not luxury clichés
- unrelated Blueprint projects must not obviously reuse the same dominant visual combination without contextual reason
- when originality is above Safe, at least one project-specific signature moment is required

### 8. Export / compiler integration

Page Composition Intelligence now participates in:

- generated implementation Markdown
- AI coding-agent prompt
- exhaustive Blueprint reference
- Generated Spec UI
- structured JSON export

Structured JSON is now **v17** and includes a top-level `pageComposition` object.

Package / Blueprint metadata are **0.29.0**.

Backup schema remains **v12** because v0.29 adds no persisted project fields; the full composition/review output is derived from existing state.

## Main architecture changes

### New `src/data/pageComposition.ts`

Exports:

- `pageCompositionIntelligence()`
- `pageCompositionPrompt()`
- page / section composition types
- qualitative visual-review types
- frontend quality-contract types

### `src/App.tsx`

- derives one project-level Page Composition Intelligence object
- passes it to the Generated Spec
- compiles it into implementation Markdown, AI prompt, and Blueprint reference
- includes it in structured JSON v17
- keeps composition scope state visible (`implementation` vs `advisory`)

### `scripts/page-composition-visual-quality-regression.mjs`

Adds 16 Phase 4 regression checks across all canonical benchmark domains and scope-safety boundaries.

## Validation

### Full regression chain

`npm test` passes **162 / 162 named regression checks**:

- Engine: 37
- Persistence: 5
- Review Intelligence: 14
- Core Flows: 12
- Implementation Roadmap: 14
- Reusable Product Architecture: 18
- v0.25 Scope Authority + Prompt Compiler: 9
- v0.26 Intelligence Cleanup: 10
- v0.27 Visual Director Core: 14
- v0.28 Pattern Explorer 2.0 + Anti-Homogeneity: 13
- **v0.29 Page Composition Intelligence + Visual Quality Review: 16**

### v0.29 dedicated checks

The new suite verifies:

- ADW gets a real automotive storefront composition
- inactive Portfolio/Marketing keeps ADW compositions advisory
- explicit marketing scope makes those pages implementation guidance without activating commerce/payments
- clinic composition differs structurally from ADW
- HRMS differs structurally from clinic
- booking is availability-first
- booking review omits payment UI while payment scope is inactive
- sports is live/score/standings-first
- portfolio is work/story-first
- every benchmark has explicit mobile recomposition
- frontend quality contract rejects design-system-demo/template behavior
- visual review is qualitative, not fake-scored
- mismatched automotive screenshot imagery is flagged
- project-specific signature requirement appears above Safe originality
- prompt serialization includes page hierarchy, responsive behavior, review, and quality contract
- page composition cannot mutate optional functional scope

### Source validation

- **22 TS/TSX files** pass TypeScript `transpileModule` syntax diagnostics with **0 syntax/transpile errors**
- Phase 4 data modules and their required dependencies pass strict TypeScript compilation through the dedicated regression harness

### Environment limitation

The repository is packaged without `node_modules`. A dependency-backed full React/Vite `npm run typecheck` / production build cannot be completed in this sandbox because React, `react/jsx-runtime`, `lucide-react`, and their declaration packages are not installed.

On a normal local checkout:

```bash
npm ci
npm run typecheck
npm run build
npm test
```

## Release boundary

v0.29 intentionally stops before:

- live page preview shell
- desktop/tablet/mobile preview controls
- A/B/C preview direction switching
- live typography/color/radius/spacing controls
- multi-page live rendering
- preview persistence
- visual approval state / Approved Visual Contract

Those belong to v0.30 and v0.31.

## Release rule

> **Design the actual page hierarchy around the product’s real purpose, recompose it deliberately for mobile, review it for generated-frontend habits, and never let page planning invent product scope.**
