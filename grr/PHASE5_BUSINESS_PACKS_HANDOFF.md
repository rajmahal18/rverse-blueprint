# Phase 5 handoff — Business Feature Packs

Blueprint v0.8 expands App Setup from **406 to 587 schema-driven decisions** and from **23 to 35 possible section definitions**.

## Core architecture decision

Phase 5 does **not** expose eleven domain sections all the time.

A new `Business packs` hub contains the parent toggles. App type recommendations turn the relevant parents on automatically; domain sections only become visible when their parent pack is enabled. Custom / General starts with no pack forced, while keeping every domain one toggle/search away.

This preserves the core usability rule: **configure exceptions, not a 587-question form**.

## Added settings by section

- Business packs: 11
- Booking & scheduling: 17
- Payments & money: 17
- Subscriptions & SaaS billing: 14
- E-commerce: 16
- Inventory & POS: 16
- Reports & analytics: 14
- Directory & marketplace: 14
- Tournament & event: 15
- Government & document workflow: 15
- Clinic & EMR: 18
- Portfolio & marketing: 14

Total Phase 5 additions: **181**.

## Usability behavior preserved

- Recommended defaults remain complete.
- App-type changes update only untouched values.
- All business-pack parents are searchable/discoverable.
- Disabled pack sections disappear completely.
- Advanced domain controls remain hidden unless Advanced is shown or search finds them.
- Custom child choices remain preserved when a pack is disabled and restore when re-enabled.
- Customized-only mode and section reset work automatically with all new settings.
- Generated Markdown, AI prompt, JSON, duplicates, checkpoints, and backups automatically include the new configuration because they consume the same generic App Setup model.

## New cross-pack warnings

Blueprint now warns about cases including:

- UI-only booking conflict checks
- booking that requires payment while the payment pack is disabled
- browser-return-only payment verification
- webhook verification without duplicate-event protection
- hidden/late fee disclosure
- subscriptions without payments
- silent negative inventory
- report datasets bypassing source permissions
- instant listing claims without verification
- public government tracking that exposes internal routing
- Clinic/EMR configured as an overall public product
- broad staff access to clinical records
- clinical stock deduction without the inventory pack

## Minimal profile safety floor

Minimal is now explicitly interpreted as **less optional machinery, not less safety**. When an app type provides a stronger contextual baseline, Minimal preserves selected access/integrity/authorization/security/audit/accessibility/rate-limit/backup defaults rather than replacing them with a globally weaker convenience value.

## Compatibility

- Existing Phase 1–4 setting IDs are unchanged.
- Backup schema remains version 4.
- Old projects normalize through the existing configuration migration path.
- Phase 5 settings receive contextual defaults automatically while existing explicit overrides remain intact.

## Next phase

Phase 6 — Integrations, Automation & AI: APIs, webhooks, email/SMS/push, calendar/maps/storage, n8n-style automation rules, background jobs, AI capability/privacy/cost/fallback controls, and human approval for consequential AI actions.
