# Blueprint v0.4 — App Setup foundation handoff

## What this patch establishes

Blueprint now has a schema-driven project configurator in `src/data/configurator.ts`. This is the foundation for the larger “almost every possible feature/behavior” direction.

The important architectural decision is that the future hundreds of settings should be **data**, not custom JSX branches scattered around `App.tsx`.

## Usability contract

Never sacrifice this when expanding the catalog:

1. A new workspace is ready immediately with Recommended defaults.
2. The user configures exceptions, not every field.
3. Parent features hide irrelevant child settings.
4. Advanced settings stay hidden unless requested/search-matched.
5. Every customization is visibly marked and resettable.
6. Changing app type/profile updates untouched defaults but preserves deliberate overrides.
7. Conflicts should be warned about; unsafe legacy choices should not be silently presented as recommended.
8. Mobile remains first-class. Controls should not turn into tiny segmented buttons just because desktop has space.

## Current configuration sections

- Access & login
- Landing & navigation
- Everyday UX
- Records & forms
- Admin & workflow
- Content rules
- Security & quality
- Platform & delivery

The initial catalog has 72 settings. It is intentionally broad enough to validate the architecture, not intended to represent the final feature universe.

## How to add a setting

Add one `ConfigSetting` to `configSettings` with:

- unique `id`
- `section`
- plain-language `label` and `description`
- `kind` (`boolean` or `choice`)
- `defaultValue`
- optional app-specific defaults
- optional profile defaults
- optional dependency
- optional `advanced` flag
- optional caution text

Do not add one-off UI for ordinary settings. The generic Setup renderer should handle it.

## Domain-pack direction

The next large content expansions should be schema modules that feed this same renderer rather than separate hard-coded pages. Planned packs can include:

- booking/scheduling + payments
- e-commerce/subscriptions
- inventory/POS
- clinic/EMR
- government/document workflow
- tournament/event
- directory/marketplace
- portfolio/marketing
- integrations/automation/AI

Domain packs should activate when relevant to the chosen app type and remain manually discoverable for custom projects.

## Persistence

`Project.config` is normalized for old projects. Backup version is 4; imports still accept versions 2 and 3. Config is included in duplication, checkpoints, Markdown, AI prompt, and JSON.

## Important security default

Do not mark legacy password composition requirements as the modern recommended option. The current `Modern recommended` policy is intentionally the baseline, while `Legacy composition rules` remains available only as an explicit exception.

## Definition of success for future phases

The product should eventually feel like it contains nearly every decision a developer might need while still letting a normal session look like:

1. Name project.
2. Pick closest app type.
3. Keep Recommended.
4. Search/change the handful of exceptions that matter.
5. Generate Blueprint.
