# RVerse Blueprint v0.29 — Page Composition Intelligence + Visual Quality Review Handoff

## Stable baseline

v0.29 completes **Phase 4** of the Visual Intelligence master program. The next implementation window should start from this release and implement **v0.30 — Visual Preview Studio MVP** only.

## Architectural guarantees to preserve

1. **Suggested != On.** App type, Project Context, recommendations, Visual Director, Pattern Explorer, page composition, review intelligence, and previews cannot silently activate optional functional scope.
2. **Page composition has visual/presentational authority only.** A generated page may be `advisory` until the corresponding App Setup scope is active.
3. **Visual Director remains the project-level art-direction source.** Page Composition specializes that direction into page hierarchy; it must not become a second competing visual identity engine.
4. **Pattern Explorer remains recommendation-first and explicit.** Applying visual direction/pattern bundles still requires user action and cannot mutate App Setup.
5. **Hard visual constraints outrank visual direction, composition, and previews.** Explicit anti-patterns, typography constraints, usability, accessibility, and reduced-motion requirements must survive later phases.
6. **Responsive composition means recomposition.** v0.30 preview modes must visibly demonstrate priority/order/layout changes, not just resize the same desktop DOM geometry.
7. **Frontend Quality Contract is an acceptance layer.** Preview Studio should help the user recognize whether those criteria are being met; do not reduce them to a fake score.
8. **Anti-homogeneity remains contextual.** Preview alternatives may differ meaningfully, but never randomize merely to look different.
9. **Premium is a quality bar, not a template.** Preview Studio must render clinic/government/booking/sports/portfolio/automotive directions according to their own product logic.
10. **Do not turn Preview Studio into Figma.** No arbitrary vector/path editor, freeform graphics tooling, or full design-canvas scope.

## v0.29 implementation surfaces

### `src/data/pageComposition.ts`

Central Phase 4 engine:

- `pageCompositionIntelligence()`
- `pageCompositionPrompt()`
- Page Composition models with `implementation | advisory` scope state
- section hierarchy / role / composition guidance
- visual anchor
- CTA / imagery / density / primary-interaction guidance
- mobile recomposition rules
- signature-element placement
- qualitative anti-AI-slop / visual quality review
- Frontend Quality Contract

### `src/App.tsx`

One derived `pageIntel` object now powers:

- Generated Spec Phase 4 summary
- implementation Markdown
- AI coding prompt
- full Blueprint reference
- structured JSON v17

The backup schema remains v12 because composition/review output is derived rather than persisted.

## Canonical benchmark expectation

The v0.29 page structures should remain meaningfully different:

- **ADW** → storefront/product/location discovery
- **Clinic** → queue + patient record / clinical timeline
- **HRMS** → workforce overview + employee/personnel record
- **Booking** → availability-first reservation flow
- **Sports** → live state + schedule + standings + score center
- **Portfolio** → authored work + case-study narrative

v0.30 preview rendering must preserve these differences rather than funneling all projects through one generic page renderer.

## Validation status

- full `npm test`: **162 / 162 named checks pass**
- v0.29 dedicated suite: **16 / 16 pass**
- 22 TS/TSX files: zero syntax/transpile diagnostics
- core Phase 4 data modules: strict TypeScript compilation passes
- full dependency-backed React/Vite typecheck/build still requires installed npm dependencies

## Next phase — v0.30 Visual Preview Studio MVP

Implement the master handoff’s **Phase 5 only**.

### Required deliverables

#### 1. Live preview shell

Create a product-relevant preview environment, not a full design editor.

Suggested layout:

- left/control panel: recommended direction, page selector, high-value visual controls, warnings
- main/right area: live rendered page preview

#### 2. Desktop / tablet / mobile preview modes

At minimum:

- desktop
- tablet
- mobile

The preview must use the v0.29 `mobileRecomposition` intent. Do not merely scale the same desktop canvas.

#### 3. Multi-page preview

Render the generated major page models from `pageCompositionIntelligence()`.

Important scope behavior:

- implementation pages may render as active preview surfaces
- advisory pages may be previewed for design comparison, but must remain visibly advisory and cannot become functional requirements automatically

#### 4. A/B/C direction selector

Preview at least three meaningful visual directions for canonical projects, with ADW as the benchmark.

The Preview Studio should consume the existing Pattern Explorer recommendation objects rather than independently inventing new directions.

#### 5. Minimum live controls

Support live visual refinement for:

- typography family/character
- heading weight
- body weight
- color behavior / palette direction
- density
- radius / geometry
- spacing
- imagery treatment
- section structure where safely editable
- navigation variant

Do not expose hundreds of raw controls in the default preview workflow.

#### 6. Placeholder imagery

Use the existing Media Assistance settings + Visual Director media direction.

The MVP may use deterministic/curated placeholder representations if real AI image generation is not part of the local app runtime. Keep the imagery domain-aware and avoid misleading fake content.

#### 7. Preview persistence

User preview changes must persist back into Blueprint visual state in a controlled way.

Keep provenance / authority clear. Do not persist accidental hover/device states as design decisions.

#### 8. Preview warnings

Surface relevant current review information inside Preview Studio:

- page scope is advisory
- visual contradiction
- template/AI-slop review
- anti-homogeneity risk
- customer-copy guardrail risk
- responsive composition issues

Warnings should help recognition and correction, not turn the preview into a dashboard of scores.

## Definition of done for v0.30

- user can visually compare at least three ADW directions before implementation
- user can switch desktop/tablet/mobile and observe deliberate layout recomposition
- user can switch among major generated pages
- live changes to the minimum visual controls are visible immediately
- preview choices persist into Blueprint state intentionally
- advisory page scope remains advisory
- v0.25–v0.29 scope/review/compiler guarantees remain green
- clinic, HRMS, booking, sports, and portfolio previews do not collapse into the same page shell

## Important boundary for v0.30

Do **not** start v0.31 Interactive Approval / Approved Visual Contract in the same patch.

v0.30 may let users compare/refine/persist previews, but final visual approval state, immutable Approved Visual Contract semantics, and full compiler authority handoff belong to Phase 6.
