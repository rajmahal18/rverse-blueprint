# Blueprint v0.5 release notes — Phase 2

## Core App Structure & UX

- Expanded App Setup from 72 to **185 schema-driven decisions**.
- Expanded from 8 to **15 understandable sections**.
- Added Product Shape, Page Inventory, Navigation, Dashboard, States & Recovery, Mobile Behavior, and Onboarding & Help as first-class areas.
- Greatly expanded landing-page composition while keeping child settings conditional on the landing page/media/CTA settings.
- Added app-shell/navigation context recovery: back behavior, scroll restoration, recents, favorites, deep links, URL state, search, command palette, and quick actions.
- Added role-aware dashboard behavior and optional operational modules.
- Added explicit modal/drawer/overlay policy and mobile overlay behavior.
- Added first-use, no-results, permission, 404, offline, maintenance, session-expired, third-party, and partial-success behavior.
- Added phone-specific table/form/action/touch/keyboard/safe-area/orientation/network rules.
- Expanded anti-AI-slop controls with hype, emoji, synthetic-proof, action wording, labels, error/success language, and optional AI-output disclosure.
- Added onboarding/help/support/feedback/bug-report/diagnostic behavior.

## Usability

- Added section jump navigation.
- Added plain-language sub-groups for large sections.
- Added **Customized only** filtering.
- Search now matches group names, keywords, caution text, and option values/notes.
- Advanced settings remain hidden until requested or searched.
- Recommended defaults remain the baseline; users configure exceptions.

## Compatibility

- Backup schema remains version 4; persisted config shape did not change.
- Existing projects normalize into the expanded catalog automatically.
- Visual DNA, patterns, capabilities, docs, references, checkpoints, and generated outputs remain intact.

## Validation

- 185 unique setting IDs.
- 0 invalid defaults/profile defaults/app-type defaults.
- 0 broken dependency references/values.
- All 11 Recommended app types initialize with 0 conflict warnings.
- Configurator and App TS/TSX syntax transpilation passed.
- Local strict TypeScript structural check passed using temporary dependency stubs after package installation was unavailable in the environment.
