# v0.19 — Scenario Validation & Engine Trust

v0.19 freezes feature expansion and makes Blueprint's existing recommendation engine safer to evolve.

## What changed

### Executable engine regression gate

`npm test` now runs `scripts/engine-regression.mjs`.

The harness intentionally introduces no new testing framework dependency. It compiles only the deterministic Blueprint engine modules with the project's TypeScript compiler into a temporary CommonJS test build, runs assertions with Node, then removes the temporary output.

Current release gate: **37 regression checks**.

### Canonical app-type baselines

All 11 supported app types now have explicit Recommended-baseline assertions for:

- inferred Operational Scale
- domain/product scope that must be active
- generic machinery that must stay inactive
- important safety/integrity values
- zero default App Setup review signals
- Ready baseline state

### Scope invariants

The suite now proves the v0.12+ scope contract rather than relying on prose:

- behavioral defaults do not create product scope
- explicit `Off` is authoritative and never silently re-enabled
- explicit `Off` remains in the generated contract because it is deliberate intent
- required dependencies create review conflicts instead of overriding the user
- an explicit child decision can require a neutral parent
- explicit scope intent survives app-type changes
- deliberate behavioral overrides survive app-type changes
- Operational Scale can strengthen engineering defaults without creating business packs

The explicit-Off invariant is exercised across **75 non-redundant scope controls × 11 app types = 825 scope cases**.

### Real-world safety scenarios

Regression coverage now includes:

- standard online booking baseline
- custom cash-only booking with Payments explicitly out of scope
- server/provider payment authority vs browser-return-only verification
- atomic booking conflict handling vs UI-only checks
- protected admin authentication/authorization boundaries
- single-location inventory excluding inter-location transfers
- mission-critical Clinic/Government defaults
- intentional scale mismatch review signals
- Directory/Tournament/Portfolio avoidance of unrelated transactional/workflow scope

### Catalog and combination integrity

The suite validates:

- unique setting ids
- unique section ids
- every setting belongs to a declared section
- every `dependsOn` target exists
- boolean defaults stay boolean
- choice defaults/app defaults/profile defaults stay inside declared options
- all **11 app types × 4 profiles × 5 scale modes = 220 contexts** resolve every setting to a valid value

### Cross-layer and contract protection

Tests now lock down that:

- payment capability applicability follows resolved payment scope
- dashboard visual patterns are excluded when dashboard scope is inactive
- incompatible saved cross-layer choices surface review signals
- inactive Auto scope does not leak into generated implementation contracts
- compatibility/redundant settings stay excluded from generated truth

## Repository cleanup

- package version: `0.19.0`
- `typecheck`, `test`, and `test:engine` scripts are available
- `*.tsbuildinfo` and `.blueprint-test-build/` are ignored
- committed `tsconfig.app.tsbuildinfo` removed
- v0.18 handoff/release notes moved to `docs/history/`
- backup schema remains v10; no workspace migration is required

## Validation

Validated in the supplied source tree with:

```bash
npm test
```

Result: **37/37 regression checks passed.**

The sandbox could not reach the npm registry, so a clean dependency reinstall/full Vite production build was not possible in this environment. The regression harness itself compiles the deterministic engine modules with TypeScript and passed completely.
