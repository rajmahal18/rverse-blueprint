# RVerse Blueprint v0.28 — Pattern Explorer 2.0 + Anti-Homogeneity Handoff

## Stable baseline

v0.28 completes **Phase 3** of the Visual Intelligence master program. The next implementation window should start from this release and implement **v0.29 — Page Composition Intelligence + Visual Quality Review** only.

## Architectural guarantees to preserve

1. **Suggested != On.** Recommendations, Project Context, app type, profiles, visual intelligence, and pattern bundles cannot silently activate optional functional scope.
2. **Visual intelligence has visual authority only.** Visual Director and Pattern Explorer may synthesize presentation decisions but cannot create business modules.
3. **Use Recommended Direction is explicit.** Nothing in Pattern Explorer mutates the saved visual contract or selected patterns until the user clicks an apply action.
4. **Bundles are compatibility-filtered.** A pattern that requires inactive App Setup behavior is omitted; App Setup is never changed to justify the pattern.
5. **Hard visual constraints outrank directions.** Explicit typography and anti-pattern exclusions survive Best Match and alternate-direction application.
6. **Anti-homogeneity is contextual, not random.** A LOW-risk direction should remain coherent. Variation is recommended only where meaningful structural habits repeat.
7. **Premium is a quality bar, not a style family.** Do not turn Phase 4 into another universal editorial/luxury template.
8. **Prompt output stays synthesized.** Do not regress to dumping every raw setting into the primary coding prompt.

## v0.28 implementation surfaces

### `src/data/patternIntelligence.ts`

Central Phase 3 engine:

- `patternExplorerIntelligence()`
- `patternCompatibility()`
- `patternIntelligencePrompt()`
- Best Match / Good Fit / Alternative recommendation model
- qualitative originality estimate
- compatibility state + notes
- coherent pattern bundles
- saved-project visual-history comparison
- LOW / MODERATE / HIGH anti-homogeneity report
- repeated-trait extraction
- context-safe diversification guidance

### `src/data/visualDirector.ts`

`reconcileVisualConstraints()` is now exported and is the shared authority layer used by both Visual Director synthesis and Pattern Explorer alternatives.

### `src/App.tsx`

One derived `patternIntel` object now powers:

- Pattern Explorer 2.0
- Home anti-homogeneity summary
- Generated Spec review
- implementation Markdown
- AI coding prompt
- full Blueprint reference
- JSON schema v16

`Use Recommended Direction` explicitly applies proposed DNA and adds only compatible bundle pattern IDs. Existing selected patterns are preserved rather than silently removed.

## Canonical benchmark expectation

Best Match should continue to resolve as visibly different project identities:

- ADW → Mechanical Editorial
- Clinic / EMR → Clinical Calm
- Government HRMS → Institutional Workforce
- Pickleball Booking → Courtline Booking
- Sports Tournament → Competitive Signal
- Developer Portfolio → Authored Portfolio

Pattern bundles and alternatives may evolve, but unrelated benchmark projects must not converge on the same dominant pattern combination without a strong contextual reason.

## Validation status

- full `npm test`: **146 / 146 named checks pass**
- v0.28 dedicated suite: **13 / 13 pass**
- 21 TS/TSX files: zero syntax diagnostics under TypeScript transpile validation
- core Phase 3 data modules: strict TypeScript compilation passes
- full dependency-backed React/Vite typecheck/build still requires installed npm dependencies; this sandbox has none

## Next phase — v0.29 Page Composition Intelligence + Visual Quality Review

Implement the master handoff’s **Phase 4 only**.

### Required deliverables

#### 1. Page Composition Intelligence

For every major page, derive a first-class composition model including:

- page purpose
- visual anchor
- section hierarchy
- content rhythm
- CTA strategy
- imagery placement
- mobile recomposition
- density behavior
- primary interaction behavior
- things to avoid

Different product domains must receive different composition logic.

Canonical examples:

- ADW → automotive storefront / product + location discovery
- Clinic → calm operational hierarchy
- HRMS → structured workforce/information density
- Booking → action-first availability/reservation composition
- Sports → live results / standings / event-state prominence
- Portfolio → authored storytelling / work-first composition

#### 2. Domain-aware page structures

Do not default public sites to:

```text
Hero
3 cards
About
Testimonials
CTA
Footer
```

unless the context genuinely supports it.

#### 3. Anti-AI-slop visual review

Add deterministic review dimensions such as:

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

Do not present fake mathematical certainty.

#### 4. Frontend Quality Contract

For public/marketing surfaces, compile visual acceptance criteria such as:

- finished real-business feel rather than design-system-demo feel
- no section exists only to show a UI pattern
- customer-facing copy is customer language
- imagery fits the domain
- avoid repetitive card-grid composition
- at least one project-specific visual moment when originality is not Safe
- mobile composition is recomposed, not merely scaled down
- premium comes from quality/coherence rather than luxury clichés
- unrelated projects should not obviously resemble each other

#### 5. Responsive composition rules

Composition intelligence should explicitly describe how the page changes on mobile rather than only resizing typography and containers.

#### 6. Signature element placement

The v0.27 signature motif should gain intentional placement/context inside page composition rather than remaining only a prose design idea.

## Definition of done for v0.29

- ADW receives a meaningful automotive storefront composition
- Clinic and HRMS receive clearly different operational compositions
- marketing outputs no longer default to generic Hero → 3 cards → About → Testimonials → CTA
- generated implementation guidance includes page composition and frontend visual quality acceptance criteria
- mobile behavior is described as recomposition
- current scope-authority and Pattern Explorer guarantees remain green

## Important boundary for v0.29

Do **not** start v0.30 Visual Preview Studio in the same patch. Phase 4 may generate composition models and quality review data, but it should not build desktop/tablet/mobile live preview shells yet.
