# v0.12 Scope Intelligence Handoff

## Product rule

Do not add catalog depth just to make Blueprint look more complete. The current catalog already understands **918 decisions across 49 possible sections**. The product advantage is now deciding which of those concepts actually apply.

**A behavioral default must never create product scope by itself.**

## Resolution order

1. Explicit user scope (`On` / `Off`)
2. Hard required dependencies
3. Deliberate child behavior that requires a parent
4. Context/app-type inference
5. Recommended behavior for the resolved active feature
6. Quality requirements only inside a relevant active surface

Explicit Off is never silently flipped On. If another decision requires it, show a conflict and a clear repair path.

## Scope vs behavior

Scope intent and behavior are independent:

- Boolean scope controls store only `scopeChoices`; they are not duplicated in `overrides`.
- Choice-based scope controls can keep a behavior override while their scope is Off.
- Turning scope back On restores that behavior.
- Returning scope to Auto preserves a deliberate behavior; Auto may then infer the feature On because that behavior is intentional.
- Resetting behavior is a separate action from returning scope to Auto.

This separation is important for both usability and accurate deliberate-choice counts.

## Core implementation

`src/data/configurator.ts` owns:

- scope IDs and canonical compatibility aliases
- Auto/On/Off resolution
- hard requirements and contextual inference
- cycle-safe parent/dependency evaluation
- memoized scope resolution
- effective values
- active-setting relevance
- conflict generation
- v0.11→v0.12 normalization/migration
- scope/behavior reset semantics

`src/data/intelligence.ts` consumes resolved scope for readiness, app-type fit, quick fixes, suggestions, acceptance criteria, and edge cases.

`src/App.tsx` renders:

- Auto/On/Off controls and reasons
- separate **Auto scope** / **Reset behavior** actions
- relevant-only settings by default
- **Explore features** for dormant Auto→Off capabilities
- Advanced/search access to deep production controls
- scope-aware presets, checkpoints, backups, Markdown, AI prompts, JSON, and spec views

## Compatibility

Legacy alias settings remain in the schema so old backups can normalize, but they are compatibility-only and should never appear as competing current controls. Backup schema is v5; imports accept v2–v5.

## Regression invariant

Always test a neutral **Custom / General** project after resolver changes. It should not invent login, dashboard, records, workflow, uploads, admin, automation, database, backups, SEO, or business packs without a real signal.

Also test a public-site sample with explicit account/search pages: only requested/inferred dependencies should activate; acceptance criteria and edge cases must not mention inactive domain machinery.

## Future work

Prefer better inference, clearer explanations, one-click conflict repair, and canonicalization over adding settings. If a field is not valid or useful in the resolved project, hide it; if a choice is implied, infer it; if a choice conflicts, explain it at selection time.
