# RVerse Blueprint v0.26 — Intelligence Cleanup Handoff

## Stable baseline

v0.26 completes Phase 1 of the Visual Intelligence master plan. The next implementation window should start from this release and proceed to **v0.27 — Visual Director Core** only after re-running the current validation gates.

## Architectural guarantees to preserve

1. **Suggested != On.** App type/profile/context/recommendation/defaults never silently activate optional functional scope.
2. **Project Context is advisory.** It can flag setup incompleteness and drive low-risk presentation completion, but it cannot create business modules.
3. **Context completion is not scope authority.** `context_completion` decisions are presentation/content/implementation-detail only; `held_for_scope` items stay advisory.
4. **Roadmap sequencing is not scope.** It may only sequence already-active work.
5. **Implementation prompts stay compiled.** Do not regress to dumping the full raw Blueprint into the primary coding prompt.
6. **Visual contradictions must be surfaced or resolved.** Do not silently compile mutually incompatible visual instructions.

## New v0.26 implementation surfaces

- `src/data/intelligence.ts`
  - `contextGapDecisions()`
  - `ContextGapMode`
  - ADW/public-site `context-recommended-setup-incomplete` review signal
- `src/data/configurator.ts`
  - Blueprint Intelligence section
  - Media Assistance section
  - Audience-aware public copy guardrail
- `src/data/promptCompiler.ts`
  - Media Direction
  - Copy Direction
  - new intelligence/media settings in material prompt decisions
- `src/data/visualDna.ts`
  - heading/body/UI weight preferences
  - weight contrast
  - semantic/recommended weight helpers
- `src/data/visualReview.ts`
  - deterministic Phase-1 visual contradiction signals
- `src/components/VisualStudio.tsx`
  - structured typography-weight UI plus advanced exact controls
- `src/App.tsx`
  - Recommended setup incomplete state
  - context-completion provenance in Setup/exports/spec
  - visual contradictions in generated review output
- `scripts/visual-intelligence-phase1-regression.mjs`
  - 10 dedicated v0.26 regression checks

## Canonical ADW expected behavior

Given Project Context describing an automotive shop website where visitors should view products, find the shop, get directions/contact details, and no public marketing scope is active:

- show **Recommended setup incomplete**
- recommend reviewing Portfolio & Marketing / public-site scope
- do not activate Portfolio & Marketing
- do not activate commerce, checkout, payments, booking, accounts, inventory, CRM, or admin
- Balanced/Proactive context completion may infer presentation decisions, but they remain `held_for_scope` until compatible public scope is explicitly included
- Product Screenshots imagery should produce a physical-retail imagery contradiction
- developer/meta copy should be blocked from customer-facing output when guardrails are enforced

## Validation status

- **119 named regression checks pass.**
- **19 TS/TSX source files pass syntax/transpile sanity.**
- A full dependency-backed `tsc -b` / Vite build should be rerun in the next normal development environment. This sandbox could not complete `npm ci` because npm terminated with `Exit handler never called` and registry DNS is unavailable here; no partial `node_modules` is packaged.

## Next phase — v0.27 Visual Director Core

Implement the master handoff's Phase 2 only:
- Design DNA model/synthesis
- Visual Thesis generator
- Design Autonomy
- Visual Originality
- Premium-quality semantics
- stronger typography intelligence
- media direction synthesis
- signature design element proposal
- Hard / Direction / Freedom hierarchy

Definition of done for v0.27: ADW should resolve to one coherent design direction such as Mechanical Editorial rather than a collection of unrelated patterns, and benchmark domains (clinic, HRMS, booking, sports, portfolio) must resolve to meaningfully different Design DNA.

Do not start Pattern Explorer 2.0 / Anti-Homogeneity (v0.28) in the same patch unless the phase plan is explicitly changed.
