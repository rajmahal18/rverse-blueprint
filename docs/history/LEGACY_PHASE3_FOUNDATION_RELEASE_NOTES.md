# Blueprint Phase 3 — Release Notes

## Core model completed
Blueprint now treats an app blueprint as three independent layers:

- **Product capabilities** — reusable software behavior
- **Visual direction** — Visual DNA, patterns, references, inspiration
- **Repository memory** — selected Markdown documents that must ship with the MVP

## New: Product Capability Library
- 49 built-in generic capabilities
- 10 capability categories
- Core / Advanced / Specialized knowledge levels
- Search and filters
- Reusable custom capability capture
- Recursive dependency selection
- Best-fit, watchout, tags, and implementation-intent guidance
- Selected capabilities are included in Project Spec, AI Prompt, and JSON exports

## New: MVP Project Docs
- 16 Markdown document templates
- Context-aware recommendations triggered by selected capabilities
- Checklist selection per workspace
- Purpose + rationale + suggested sections per doc
- Copy/download Docs Manifest
- Selected docs are explicit requirements in the AI implementation prompt

## Visual learning improvements
- Surprise Me discovery control
- Difficulty estimate
- Implementation-cost estimate
- UX-risk estimate
- Accessibility lens per pattern
- Visual DNA sanity/compatibility warnings

## Migration / portability
- Backup schema upgraded to version 3
- Phase 2 backup import remains supported
- Existing Phase 2 browser workspaces receive the new fields safely

## Validation completed in packaging environment
- TypeScript/TSX sources pass a local compiler check using dependency shims
- All visual-pattern relationship references resolve
- All capability dependency/related references resolve
- All Project Doc recommendation capability IDs resolve
- CSS brace/syntax structure check passes
- Final ZIP integrity is verified after packaging

## Environment note
The packaging environment cannot currently reach the npm registry reliably, so a real dependency install / Vite production build could not be executed here. Run `npm install && npm run build` on a normal-network development machine before deployment.
