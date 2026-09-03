# v0.15 — Visual DNA 2.0 / Visual Studio — Release Notes

## Summary

v0.15 makes visual identity a first-class Blueprint system. The previous compact Visual DNA controls are replaced by a progressively disclosed Visual Studio with a richer deterministic visual contract and a live specimen that visibly reacts to the selected direction.

## What changed

### Visual Studio depth

- Added Visual Studio-specific `Quick / Standard / Advanced` depth.
- Depth is stored locally as a presentation preference only.
- Switching depth does not mutate DNA, App Setup, generated specs, or readiness.

### Theme behavior

Added explicit light/dark behavior including:

- Light only
- Dark only
- System
- Light + Dark toggle
- default theme
- OS preference behavior
- preference persistence
- toggle placement
- auto-adapted versus separately curated dark palettes

### Typography

Typography is now a real visual system rather than a broad label.

- 10 typography characters with visibly different specimen families
- independent heading and body character
- monospace usage
- body size
- heading scale
- heading/body weight
- line height
- tracking
- readable text measure

### Layout and section identity

Added controls for:

- max content width
- gutters
- section spacing
- whitespace priority
- grid character
- alignment tendency
- responsive behavior
- section background strategy
- contrast
- background treatment
- dividers
- hero, CTA, and footer treatment
- intentional section variation

### Surfaces, shapes, controls

Added:

- borderless / bordered / tonal / elevated / mixed containment
- border weight, shadow character, elevation, contrast
- gradient, glass, and texture usage
- shape language and separate surface/control/button radii
- pill usage
- button hierarchy and weight
- input appearance and height
- form density
- control borders and hover character

### Imagery, iconography, motion

Added structured art direction for:

- imagery mode, character, treatment, and presentation
- icon fill style, geometry, stroke weight, size, labels, and family consistency
- motion amount, character, page transitions, scroll animation, hover response, duration, easing, and reduced-motion fallback

### Color system

The palette now carries 12 semantic roles:

- ink
- background
- accent
- surface
- muted
- positive
- destructive
- warning
- informational
- border
- focus
- disabled

Advanced configuration can separately curate the same roles for dark mode.

### Anti-sameness safeguards

Added selectable Visual anti-pattern exclusions and a free-text Visual Signature. The signature is stored verbatim and is deliberately lower-authority than structured Visual Studio choices.

### Live preview

The Visual Studio preview now makes high-impact choices visible instead of only reflecting them in generated text. It responds to theme, typography, hierarchy, spacing, section separation, surfaces, radii, controls, imagery, icon treatment, density, and motion timing/character.

### Persistence and generated contracts

- Backup/schema version: **v7**
- Import compatibility retained for **v2–v7**
- Visual Studio participates in checkpoints and checkpoint diffs
- Similarity/anti-sameness checks account for high-impact visual dimensions
- Design sanity checks cover new contradictions such as high motion without reduced-motion fallback and selected anti-patterns that conflict with active visual treatments
- Markdown and AI prompts receive the full structured Visual Studio contract
- JSON export identifies Blueprint v0.15.0

## Compatibility

Legacy DNA fields remain present and normalized so old workspaces and recommendation behavior continue working. Richer v0.15 fields are layered on top rather than destructively replacing the v0.14 model.
