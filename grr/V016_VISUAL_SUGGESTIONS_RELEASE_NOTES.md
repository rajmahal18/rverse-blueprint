# v0.16 — Visual Suggestions & Color Intelligence — Release Notes

## Summary

v0.16 adds a recommendation layer above Visual Studio without weakening Blueprint's deterministic configuration model. Suggestions can be explored and previewed freely, but nothing changes the saved Visual Studio contract until the user explicitly applies it.

## Visual Suggestions

The old one-click Visual starting points interaction has been retired from the UI. It immediately changed multiple visual categories and made it difficult to understand what was being overwritten.

The replacement has two separate suggestion systems:

1. **Suggested visual directions** — broad, project-aware ideas for typography, layout, sections, surfaces, controls, imagery, iconography, motion, theme behavior, and accent usage.
2. **Color scheme suggestions** — palette-role recommendations only.

Project type, active business packs, the current visual posture, and optional Project Context can affect recommendation ranking. This is advisory ranking only. Project Context never creates scope and never silently changes settings.

## Preview before apply

- Previewing a direction or color scheme is temporary and does not persist.
- The sticky live specimen clearly indicates when it is showing temporary suggestion state.
- Manual edits exit temporary preview and continue from the saved deterministic contract.
- Users may explicitly apply one visual-direction category or the whole direction.
- Applying a full visual direction **never changes palette roles**.
- Applying a color scheme **changes only light/dark palette roles plus palette provenance**. It cannot modify theme behavior, typography, layout, section style, surfaces, shape, controls, imagery, iconography, motion, anti-patterns, or Visual Signature.

## 24 curated web-app color schemes

v0.16 ships 24 role-based light/dark schemes:

1. Graphite Blue
2. Slate Indigo
3. Slate Cyan
4. Midnight Sky
5. Cobalt Paper
6. Mauve Violet
7. Mauve Purple
8. Mauve Plum
9. Mauve Crimson
10. Sage Teal
11. Sage Jade
12. Sage Green
13. Sage Mint
14. Olive Lime
15. Olive Grass
16. Sand Amber
17. Sand Orange
18. Sand Bronze
19. Warm Terracotta
20. Automotive Red
21. Onyx Acid
22. Monochrome Signal
23. Pure Monochrome
24. Navy Gold

These are application palettes rather than decorative five-swatch moodboards. Each scheme includes light and dark values for semantic UI roles.

## Expanded color contract

The palette contract now has 15 roles:

- ink
- background
- accent
- accent foreground
- accent hover
- accent active
- surface
- muted
- positive
- destructive
- warning
- informational
- border
- focus
- disabled

Older workspaces are normalized so missing accent interaction roles are derived safely.

## Color/design sanity checks

Visual Studio now performs deterministic advisory checks for issues including:

- a Light palette whose background behaves like a dark theme
- a Dark palette whose background behaves like a light theme
- primary and muted text contrast
- accent/button foreground contrast
- focus-indicator contrast
- extremely weak borders
- light/dark themes that are barely distinguishable
- auto-adapting dark mode from an already-dark Light palette
- existing structural contradictions such as excessive motion without reduced-motion fallback or anti-pattern conflicts

Visual sanity checks also evaluate temporary suggestion previews, so a user can inspect a scheme before applying it. Relevant visual review signals are included in Markdown, AI prompt, and JSON output.

## Project Context intent review

Project Context remains lower-authority, verbatim human context. v0.16 may now use high-confidence phrases to surface **advisory-only scope mismatch signals**, currently for:

- e-commerce / online shopping
- booking / reservations
- payments

Example: if Project Context says customers should shop or checkout online while E-commerce is inactive, Blueprint flags a possible mismatch and offers a route back to the Business Packs section. It does not enable commerce, change readiness, or authorize the implementation agent to invent e-commerce scope.

## Research basis

The palette architecture follows established application-UI principles rather than trend palettes:

- Radix Colors documents role-specific color use for app backgrounds, component states, borders/focus, solid actions, and text, and recommends tinted neutral families paired near the accent hue.
  - https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
  - https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- Contrast sanity thresholds use WCAG 2.2 guidance: 4.5:1 for normal text and 3:1 where the non-text contrast criterion applies to meaningful UI component/state cues.
  - https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
  - https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast

Curated schemes were validated so primary ink/background and accent-foreground/accent pairs meet at least 4.5:1 in both their supplied light and dark variants.

## Persistence and compatibility

- Blueprint package version: **0.16.0**
- Backup/schema version: **v8**
- Backups **v2–v8** remain importable.
- JSON exports identify Blueprint v0.16.0.
- Existing v0.15 visual presets remain only as legacy source data for compatibility/history; the Visual Studio UI no longer exposes the old immediate-mutation preset workflow.
