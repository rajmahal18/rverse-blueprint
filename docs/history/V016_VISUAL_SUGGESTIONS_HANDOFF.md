# Blueprint v0.16 — Visual Suggestions & Color Intelligence Handoff

## Source of truth

Continue from the latest v0.16 ZIP/codebase. Do not rebuild the feature from this note.

## New architecture

### `src/data/visualSuggestions.ts`

Owns the advisory recommendation layer:

- 24 `ColorScheme` definitions
- 9 `VisualDirection` definitions
- project-aware ranking
- temporary color-scheme application helper
- per-category visual-direction application
- full non-palette visual-direction application

### `src/components/VisualStudio.tsx`

Owns suggestion UX and preview state.

Important invariant: **preview state is local component state and is not persisted**. The parent `onChange` is called only after explicit Apply or direct manual editing.

### `src/data/visualDna.ts`

Palette roles now include:

- `accentForeground`
- `accentHover`
- `accentActive`

`colorSchemeOrigin` records provenance for an explicitly applied scheme. Manual color edits change provenance to Custom / customized.

### `src/data/intelligence.ts`

`projectContextReviewSignals()` uses Project Context only to surface advisory review prompts. It must never mutate `ProjectConfig`, scope choices, or recommended values.

## Authority and mutation rules

1. Structured App Setup remains product-scope truth.
2. Structured Visual Studio remains visual truth.
3. Project Context and Visual Signature remain lower-authority verbatim human intent.
4. Suggestion ranking may use lower-authority context because ranking is non-mutating.
5. Preview must remain non-mutating.
6. A color scheme Apply may change only `palette`, `darkPalette`, and `colorSchemeOrigin`.
7. A visual direction Apply may change its explicitly listed non-palette visual categories only.
8. Nothing may infer or enable product scope from Visual Suggestions or Project Context.

## Color-system design

Every curated scheme supplies both light and dark palettes with 15 roles. The current research model intentionally maps colors by UI responsibility rather than by decorative swatch position.

The supplied dark companion remains stored even when `darkPaletteStrategy` is `Auto-adapted`; it becomes active only if the user explicitly selects `Separately curated`.

## Sanity checks

`designSanity()` in `src/App.tsx` now handles structural visual conflicts and color contrast/coherence. The function is passed into Visual Studio so temporary preview state is checked live.

Generated Markdown, AI prompt, and JSON carry actual visual review signals, but not the generic “no tension” fallback message.

## Intent mismatch review

High-confidence Project Context hints currently cover commerce, booking, and payments. Keep these conservative. If adding more domains:

- use phrases that strongly imply user-facing product scope
- avoid broad single keywords that create false positives
- return review prompts only
- do not add an Apply button that silently changes scope
- do not lower structured readiness merely because optional human context differs

## Research references

- Radix palette composition: https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- Radix scale/use cases: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- WCAG 2.2 text contrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 non-text contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast

## Validation expectations

Before the next release, preserve tests/checks for:

- exactly 24 unique v0.16 scheme IDs/names unless deliberately expanding the catalog
- valid six-digit hex roles
- >= 4.5:1 ink/background and accentForeground/accent pairs in supplied light/dark schemes
- color Apply mutation boundary
- visual-direction palette immutability
- ABZ-style commerce context creates an advisory mismatch while commerce remains inactive
- old backup import compatibility
