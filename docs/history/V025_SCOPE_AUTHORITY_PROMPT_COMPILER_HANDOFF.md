# HANDOFF — Blueprint v0.25 Scope Authority + Prompt Compiler

## Status

v0.25 implements the scope-authority and prompt-compiler revamp discovered from the Government HRMS sample.

## Non-negotiable invariants

1. Optional functional scope is opt-in.
2. `SUGGESTED != ON` everywhere in the pipeline.
3. Active functional scope must trace to an explicit user selection, a persisted explicit selection, or a hard dependency.
4. Project Context is advisory; it may raise review signals but may not activate product features.
5. Roadmaps, acceptance criteria, edge cases, and generated docs may sequence or describe active scope but may not create scope.
6. Quality/safety implementation behavior may still be inferred inside already-active functionality.
7. Explicit user overrides always survive prompt compression.

## Main implementation changes

### Resolver

`src/data/configurator.ts`

- Scope now resolves to `off | suggested | on | required`.
- Activation provenance is tracked separately from recommendation state.
- App-type/profile recommendations produce `suggested`, never active scope.
- Circular resolution fails closed.
- Optional Government → approvals/admin inferences were removed.
- Scope-integrity diagnostics reject active scope without valid authority.

### Review intelligence

`src/data/intelligence.ts`

- Recommendation provenance understands `Suggested` distinctly.
- Project Context cannot satisfy active-scope checks by itself.
- HRMS/HRIS intent without structured HR scope now raises an important product-intent mismatch instead of silently inventing HR modules.

### Prompt compiler

`src/data/promptCompiler.ts`

- `compileScopeContract()` creates the short build/required/suggested/excluded authority view.
- `implementationConfigContractPrompt()` exports only material execution decisions plus compressed baselines.
- `fullBlueprintReferencePrompt()` preserves exhaustive App Setup detail separately.
- `scopeStateSummary()` reports the complete resolved scope-state counts, not only suggestions shown in the compact contract.

### Primary UI/export

`src/App.tsx`

- Suggested scope stays visible and is labeled as not included.
- Scope controls are phrased as `Default / Include / Exclude`.
- Primary Markdown/AI prompt uses the compiled contract and compact visual direction.
- Full App Setup + Visual Studio detail is exported separately as the Blueprint reference.
- JSON includes scope contract, state summary, and integrity diagnostics.

## Regression coverage

`scripts/scope-authority-prompt-compiler-regression.mjs` covers:

- Government app without document workflow
- Explicit document workflow
- Required authentication dependency
- HRMS Context mismatch
- Recommended-profile scope safety
- Activation provenance
- Downstream resurrection prevention
- Prompt compression
- Explicit override preservation

Existing regression suites were updated so cases that genuinely require a domain pack explicitly include it instead of depending on old recommendation-as-scope behavior.

## Validation

- Full regression suite passes.
- TypeScript/TSX source files pass syntax transpilation.
- A normal Vite production build could not be completed in the patch environment because npm dependency installation could not finish; this is an environment/package-fetch limitation, not a known source-code build error.

## Recommended next work

The architectural next step is phase-scoped prompting: compile the global contract plus only the active module, permissions, UX/security rules, and acceptance criteria relevant to the current implementation phase. Do not implement that by reintroducing a full Blueprint dump.
