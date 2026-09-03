# Blueprint v0.12 — Scope Intelligence Release Notes

## Goal

Fix the highest-ROI issue found in the v0.11 sample output: Recommended behavioral defaults were being interpreted as product scope, so a neutral Custom project could accidentally grow dashboard/workflow/uploads/admin/reporting machinery it never asked for.

## What changed

- Added first-class `scopeChoices` with **Auto | On | Off** semantics for major capabilities.
- Added a resolver that explains whether scope is **Explicit, Required, Inferred, Contextual, or Inactive**.
- **Custom / General starts neutral** for scope-level features; Auto no longer means “build the Recommended feature.”
- Hard dependencies and deliberate child behaviors can activate an Auto parent.
- Explicit Off is respected. If another active decision requires it, Blueprint surfaces a conflict instead of silently flipping it On.
- Separated **scope intent from behavior overrides**. A boolean feature On/Off is stored once, while a choice-based feature can keep a distinct behavior customization.
- A customized behavior survives feature Off → On and Off → Auto; returning scope to Auto does not silently erase the behavior choice.
- Added memoized, cycle-safe scope resolution so the smarter dependency graph does not make the setup UI sluggish.
- Removed legacy/duplicate compatibility controls from normal setup/spec output while retaining migration support.
- Tightened relevance gates for profiles, collaboration, tables, workflow, automation, database operations, recovery, production engineering, testing, and other downstream controls.
- Added **Explore features**: dormant Auto→Off scope is hidden during normal use but remains one click/search away.
- Deep production controls stay behind Advanced/search unless they are deliberate or immediately relevant.
- Generated Markdown/AI/JSON contracts now include only resolved active scope plus relevant behavior/quality rules.
- Acceptance criteria and edge cases now use resolved active scope instead of raw Recommended values.
- Added a public-site/noindex review signal rather than silently enabling SEO.
- Backup/export schema moved to **v5**; versions 2–5 remain import-compatible.
- App/package version moved to **0.12.0**.

## Regression summary

- **918 settings / 49 sections retained** — no new feature dump.
- **918 unique setting IDs**.
- **44 app-type × profile default contexts checked; zero warnings**.
- Neutral **Custom / General resolves zero active scope roots**.
- Sample-shaped public website correctly activates only the requested/inferred public/account surface (landing, login, requested pages, search required by its results page, notifications required by its center) while **dashboard, records, workflow, uploads, admin, automation, database, and backups remain inactive**.
- That sample generates no workflow/upload/automation acceptance criteria or irrelevant large-dataset edge case; the only deliberate review signal is public-site SEO being Auto→Off.
- Explicit parent-Off + customized child produces an immediate dependency conflict.
- Subscription On + Payments Off produces the expected hard-dependency conflict.
- Choice-based behavior customization survives scope Off → On → Auto.
- Boolean scope intent is no longer duplicated in the raw override count.
- Legacy v0.11 non-default scope overrides and special Off sentinels migrate into the new scope model.
- Neutral Custom app-type fit stays neutral; enabling the Booking pack identifies **Booking / Scheduling at 100% fit**.
- Standalone configurator/intelligence TypeScript compile passed.
- Full TS/TSX structural typecheck with local dependency stubs passed.
- CSS/JSON structural validation passed.

## Environment note

A dependency-backed `npm run build` could not be completed in the execution sandbox because `npm ci` timed out while accessing the package registry. Partial dependencies were removed; no `node_modules` is included in the release archive.
