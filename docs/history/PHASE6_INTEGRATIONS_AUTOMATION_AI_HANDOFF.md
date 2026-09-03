# Phase 6 handoff — Integrations, Automation & AI

Blueprint v0.9 expands App Setup from **587 to 734 schema-driven decisions** and from **35 to 40 possible section definitions**.

## Architecture

Phase 6 deliberately reuses the existing `platform.api`, `platform.webhooks`, and `platform.automation` settings as compatibility anchors. It does not create a second competing API/webhook/automation model.

Five sections were added:

- Integration hub — 15 settings
- APIs & webhooks — 25 settings
- Connected channels — 43 settings
- Automation & jobs — 25 settings
- AI & intelligence — 39 settings

Total Phase 6 additions: **147**.

## Usability rule

External services are **not enabled merely because the user chose Advanced**. AI, SMS, push, storage, CRM/accounting, collaboration, and similar optional connections stay opt-in or app-contextual. Detailed settings are conditionally hidden until their parent exists.

This keeps the normal workflow as: choose app type → keep Recommended → enable only integrations that solve a real need → configure exceptions.

## Automation principle

Automation should remove repetitive work, not move business invariants into fragile workflows.

Recommended defaults therefore keep:
- critical validation/authorization/data integrity in the app
- external orchestration behind stable documented payloads
- side-effecting automation idempotent
- retries bounded
- credentials in protected secret storage
- high-impact actions reviewable
- failed runs inspectable/replayable
- long-running work asynchronous with visible status

Booking projects contextually enable the external automation connector because their existing automation posture is external-automation-first; Minimal disables that optional connector while retaining safe product fundamentals.

## AI principle

AI is off by default. When enabled, Blueprint can express use cases independently from provider/model choices.

Recommended defaults favor:
- server-side provider calls
- schema-validated machine-consumed output
- source grounding for product/document facts
- citations for grounded answers
- explicit uncertainty handling
- data minimization/redaction
- caller permissions + tool allowlists
- suggest-only authority by default
- human approval for consequential actions
- no autonomous destructive actions
- bounded cost/rate limits
- graceful non-AI fallback
- prompt/config versioning and regression evaluation

Government/Clinic contexts tighten grounding, citation, sensitive-data, retention/logging, action-authority, evaluation, and AI audit defaults.

## Warnings added

Warnings now identify risky configurations including:
- non-idempotent booking/payment APIs
- unsigned outgoing webhooks
- unverified incoming webhooks
- webhook duplicate/retry hazards
- sensitive email/SMS/calendar content in high-accountability apps
- first-visit push/location permission prompts
- permanent public URLs for protected files
- chat actions trusting channel membership
- system-wide automation privileges
- broad automation without approval
- side effects without dedupe
- workflow credentials stored in plain config
- ad hoc external automation payloads
- long tasks represented only by a blocking spinner
- client-side/untrusted AI provider calls
- ungrounded or uncited AI in sensitive workflows
- broad AI data sharing/logging
- autonomous AI without approval
- broad AI service-account authority
- weak prompt-injection boundaries for tool-using AI
- autonomous destructive AI actions
- free-form parsing for machine-consumed AI output

## Compatibility

- Existing setting IDs remain unchanged.
- Backup schema remains version 4.
- v0.8 and older compatible configs normalize automatically and receive Phase 6 contextual defaults.
- Explicit user overrides remain preserved.
- Generic exports/checkpoints/duplicates/backups include Phase 6 automatically because they consume the shared ProjectConfig.

## Next

Phase 7 — Production, Security & Engineering Quality.
