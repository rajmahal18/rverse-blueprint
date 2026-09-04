# RVerse Blueprint v0.26 — Intelligence Cleanup

## Release goal

Phase 1 of the Visual Intelligence program fixes the intelligence weaknesses exposed by the ADW Banawe benchmark without starting the Visual Director rewrite planned for v0.27.

## What changed

### Project-intent alignment
- Project Context now detects a clear public business/marketing-site intent that is not represented by active structured scope.
- ADW-style context produces **Recommended setup incomplete** instead of reporting that no obvious mismatch exists.
- The signal recommends reviewing Portfolio & Marketing/public-site scope but never activates it.

### Context-aware gap filling
- New modes: **Strict**, **Balanced · Recommended**, and **Proactive**.
- Context completion is restricted to presentation/content/implementation-detail decisions.
- Every inferred decision carries `context_completion` provenance, confidence, and `applied` vs `held_for_scope` state.
- Presentation gaps remain held until compatible public presentation scope is explicitly active.
- No context-completion path can mutate scope choices or activate checkout, payments, accounts, inventory, CRM, booking, admin dashboards, or other optional functional modules.

### Media Assistance
- Added **Generate appropriate placeholder images**.
- Added placeholder style and coverage controls.
- The prompt compiler now emits scope-safe Media Direction instructions and explicitly forbids inventing product modules merely to justify imagery.

### Audience-aware copy guardrails
- Added customer-facing copy guardrails with Enforce / Review only / Off.
- The compiled implementation contract separates customer language from Blueprint/developer language.
- Public copy is instructed not to leak phrases such as “current scope”, “implementation foundation”, “mobile-first architecture”, “visual system baseline”, MVP/architecture/deployment terminology, and similar meta language.
- Disabling the guardrail on an explicitly public product surface creates a review signal.

### Typography intelligence cleanup
- Added structured Heading, Body, and UI/control weight preferences with **Auto / Recommended**.
- Added weight contrast: Subtle / Balanced / Strong.
- Exact numeric weight controls remain available in Advanced mode and are marked Custom when manually adjusted.
- All three resolved weights plus preference provenance compile into the Visual Studio contract.

### Visual contradiction detection
- Added a deterministic visual-review module.
- Detects glass exclusion vs Localized Glass Panel/glass treatment, gradient/pill exclusion conflicts, competing type-pattern combinations, editorial/display-type mismatches, and physical-retail imagery mismatch such as Product Screenshots for an automotive shop.
- Contradictions appear in implementation/spec review output instead of silently compiling incompatible instructions.

### Generated outputs
- Context-completion provenance is included in Markdown, AI implementation prompt, exhaustive Blueprint reference, and structured JSON.
- Structured JSON schema is now v14 and Blueprint metadata is `0.26.0`.
- Backup schema remains v12; normalization keeps older Visual Studio state compatible while filling the new typography fields.

## Scope-authority guarantee

v0.26 preserves the v0.25 invariant:

> Suggested != On

Project Context, app type, recommendations, context completion, media assistance, visual patterns, and design decisions are not valid authority for optional functional scope. Only explicit/persisted user scope or a true required dependency can activate it.

## Validation

- Existing engine regression suite: 37 passed
- Persistence: 5 passed
- Review intelligence: 14 passed
- Core Flows: 12 passed
- Implementation Roadmap: 14 passed
- Reusable Product Architecture: 18 passed
- v0.25 Scope Authority + Prompt Compiler: 9 passed
- New v0.26 Intelligence Cleanup: 10 passed
- Total named regression checks: **119 passed**
- Source syntax/transpile sanity: **19 TS/TSX files checked, 0 errors**
- Full `npm run typecheck` / `npm run build` could not be completed in this sandbox because dependency installation failed inside npm itself (`Exit handler never called`) and the sandbox cannot resolve the npm registry. The failed partial `node_modules` was removed and is not included in the release package.

## Not included

v0.26 intentionally does **not** start v0.27 Visual Director Core, Pattern Explorer 2.0, Page Composition Intelligence, Preview Studio, or Visual Contract approval. Those remain later phases of the master program.
