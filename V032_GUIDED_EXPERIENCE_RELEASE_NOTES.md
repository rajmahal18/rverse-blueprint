# v0.32.1 — Guided Experience / Anti-Dumb UX hardening

## Goal

Transform Blueprint from a powerful-but-dense expert workspace into an unexpectedly easy product to navigate without removing its underlying depth.

The central rule is:

> Important decisions should find the user. The user should not need to know where a setting lives.

## Hardening fixes

- Unified every guided surface around the same unresolved-decision helper, eliminating the case where build-readiness could be blocked while Guided Setup rendered an all-clear message.
- Surfaced typed App Setup quick fixes directly from guided cards when a safe exact fix is available.
- Reframed Project Context as a recommended first step without granting it authority over structured App Setup.
- Expanded high-confidence intent detection for inventory, clinic/EMR, document workflow, tournament, directory, reporting, and subscription products.
- Added conservative typo tolerance to Find Anything plus Enter-to-open behavior.
- Preserved explicit scope authority: recommendations remain advisory until the user explicitly includes them.

## What changed

- Guided-first navigation centered on Home, Setup, Design, Preview, and Review & Build.
- A prioritized **What needs my attention?** queue surfaces goal-critical unresolved decisions before secondary configuration.
- **Human Setup Readiness** detects when stated intent cannot be implemented from current explicit scope.
- Example: “players should be able to book” + Booking & Scheduling Off becomes a prominent required decision rather than a buried advisory mismatch.
- **Include / Review / Not needed** actions resolve recommendations explicitly while preserving `Suggested != On`.
- **Apply Recommended Setup** helps approve a coherent minimum setup without letting recommendation logic mutate scope by itself.
- **Find Anything** (`Ctrl/Cmd+K` or `/`) searches hidden, inactive, standard, and advanced settings and deep-links to the exact control.
- Dormant business packs such as Booking can be found even when they are currently inactive.
- Progressive disclosure hides the full settings catalog until the user explicitly asks to browse it.
- Advanced tools remain available for expert workflows without dominating the default experience.
- Setup status no longer claims “No App Setup review signals” while a goal-critical Project Context mismatch is unresolved.
- Review & Build uses the same readiness logic, preventing a semantically incomplete product from appearing ready.
- Generated implementation Markdown / AI prompt include **Human Setup Readiness** as guidance only, never functional scope authority.
- Structured JSON advances to v20.
- Backup schema remains v14; no migration is required for this UX layer.

## Scope safety

v0.32 does not weaken any scope-authority guarantee. Recommendations, Project Context, search, guided cards, previews, and readiness signals cannot activate optional functional scope. Only valid explicit user action or an existing hard dependency can do so.

## Validation

- Full regression chain: **213 / 213**
- Dedicated v0.32 Guided Experience suite: **17 / 17**
- Existing v0.31 approval-contract suite remains green: **18 / 18**
- Package version: **0.32.1**
- Structured JSON: **v20**
- Backup schema: **v14**

Dependency-backed React/Vite typecheck/build still requires the npm dependency tree to be installed in the target environment.
