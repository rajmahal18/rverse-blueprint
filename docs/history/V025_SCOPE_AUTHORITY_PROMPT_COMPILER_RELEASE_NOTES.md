# Blueprint v0.25 — Scope Authority + Prompt Compiler

## Why this patch exists

A Government System sample intended as a reusable BARMM HRMS unexpectedly activated the Government & document workflow pack and expanded into document routing. The same sample also produced an implementation prompt roughly 990 lines long. Both problems came from the same architectural mistake: recommendation/context detail was being treated with too much authority during resolution and export.

## Resolver changes

- Optional scope now resolves as **off**, **suggested**, **on**, or **required**.
- App-type/profile recommendations never activate optional functional scope.
- Active scope is valid only when its activation source is an explicit user choice or a hard dependency.
- Circular scope resolution fails closed instead of falling back to a truthy recommendation.
- Explicitly disabled/off-like child behavior does not pull a parent feature into scope.
- Government app defaults now suggest Government/document workflow and Reports rather than activating them.
- Optional convenience inferences such as Government → approvals and active pack → admin were removed.

## Review intelligence

- Project Context remains advisory.
- HRMS/HRIS intent with no matching structured HR capability now emits an **important** “Product intent may not be represented” signal.
- The review explicitly tells the user/agent not to invent HR modules.

## Prompt compiler

The generated output is split into two roles:

1. **Implementation contract** — concise execution-oriented prompt containing scope authority, hard dependencies, material architecture/UX/domain decisions, quality baselines, review signals, roadmap, acceptance criteria, and a compact visual contract.
2. **Blueprint reference** — exhaustive resolved App Setup and Visual Studio state for audit/debugging and targeted lookup.

Explicit overrides are never dropped to satisfy compression budgets; baseline details are the part that gets trimmed.

## UI/export changes

- Scope rows visibly distinguish **Selected**, **Required**, **Suggested**, and **Not included**.
- Scope controls read **Default / Include / Exclude**.
- Suggested rows remain visible instead of disappearing as dormant scope.
- Spec export now exposes separate **Implementation** and **Blueprint reference** downloads/copy actions.
- JSON export includes the compiled scope contract, scope-state summary, and scope-integrity diagnostics.

## Regression coverage

Added `scripts/scope-authority-prompt-compiler-regression.mjs` with nine tests covering:

- Government app without document workflow
- Explicit document workflow
- Required authentication dependency
- HRMS Project Context mismatch
- Recommended profile scope safety
- Activation provenance
- Downstream resurrection prevention
- Prompt compression
- Explicit override preservation

All existing engine, persistence, review-intelligence, Core Flows, roadmap, and reusable-product tests were updated to reflect the new opt-in authority model and pass together with the new suite.
