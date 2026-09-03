# Blueprint v0.5 — Phase 2 Core App Structure & UX handoff

## Product constraint

Usability is non-negotiable. Blueprint can grow to hundreds of decisions only if the normal workflow stays short:

1. Name the project.
2. Pick the closest app type.
3. Keep Recommended.
4. Search/change only meaningful exceptions.
5. Generate the blueprint.

Do not turn App Setup into a completion checklist.

## What Phase 2 added

The configuration catalog grew from 72 to **185 settings** and from 8 to **15 sections**. New depth is focused on the product shell and daily interaction rather than Phase 3+ security/domain detail.

New major areas:

- product access shape, audience, primary surface, app shell, entry/resume behavior
- broader page inventory
- detailed landing/public composition
- navigation depth, user menu, global search, command palette, quick actions, recents/favorites, history-aware back, scroll restoration, deep links, URL state
- dashboard presence, role-specific behavior, KPI rules, work queues, calendar, charts, personalization, saved views
- overlay/modal/drawer and destructive-action policy
- first-use/no-result/permission/404/offline/maintenance/session-expired/third-party/partial-success states
- phone-specific tables, forms, primary actions, touch targets, bottom sheets, gestures, keyboard/safe-area/orientation/network behavior
- product copy, feedback language, AI-slop/hype/emoji/synthetic-proof controls
- onboarding, sample data, contextual help, help center, support, feedback, structured bug reports, safe diagnostics

## Renderer improvements

`SetupView` remains generic. Phase 2 adds:

- sub-groups through optional `ConfigSetting.group`
- search enrichment through optional `ConfigSetting.keywords`
- Customized-only filtering
- section jump navigation with per-section visible counts
- search across section/group/label/description/caution/keywords/options
- selected option notes support
- mobile-safe stacked filters and horizontally scrollable section jumps

Future phases should extend schema data, not add one-off setting JSX.

## Validation rules used in this phase

The release was audited so that:

- every setting ID is unique
- every choice default is a valid declared option
- every app-type/profile override uses a valid option
- every dependency references a real setting
- dependency values match the parent setting type/options
- all 11 Recommended app types start with zero conflict warnings
- disabling login hides its child login configuration
- disabling landing hides its child landing configuration

## Persistence

No backup-version bump is required. `ProjectConfig.values` is an extensible record and `normalizeProjectConfig()` fills newly introduced defaults while preserving stored values and valid overrides.

## Next phase

Phase 3 should deepen authentication/users/permissions without duplicating current high-level settings. Prefer child settings under the existing login/registration/session/roles decisions.

Security defaults must stay modern: passkeys/passwordless can exist, password-manager/paste/show-password friendliness should remain allowed, and legacy composition/forced-change patterns must never become the recommended baseline merely because they are familiar.
