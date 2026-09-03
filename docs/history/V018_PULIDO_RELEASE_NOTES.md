# v0.18 — Pulido / Usability & Recommendation Maturity

## Goal

Make Blueprint feel substantially easier without deleting capability. This release intentionally adds no new app type. It improves navigation, recommendation tuning, baseline explanations, and the proportionality of existing app-type defaults.

## UX changes

- Core sidebar flow is now Workspace, App setup, Visual Studio, Generated spec.
- Deep/optional tools live under More tools and remain fully available.
- Mobile drawer separates Core flow from More tools; the bottom bar now keeps only Home, Setup, Studio, Spec, plus a More entry for optional tools.
- Setup and Visual Studio include explicit next-step cues so a first-time user can complete the core flow without learning the full navigation model.
- App Setup hides Recommendation Posture and Operational Scale behind Tune recommendations unless the user has deliberately customized them.
- The UI calls the old Starting profile a Recommendation posture to reduce confusion with Configuration Depth.
- App Setup now says decisions are available rather than implying every visible setting must be answered.
- App-type fit is only emphasized when an alternate type is genuinely plausible; otherwise Blueprint shows a Resolved baseline summary.
- Workspace copy and Generated spec status were tightened for a clearer end-to-end flow.
- Historical phase/v0.12–v0.17 handoffs are archived under `docs/history/`; current v0.18 truth stays obvious at the repository root.

## Recommendation maturity changes

### SaaS / Client Portal
Generic workflow, approvals, attachments, comments, bulk import, outbound webhooks, and automation orchestration are no longer presumed. They remain one explicit setting/search away.

### E-commerce
The generic signed-in dashboard and bulk import are no longer part of the default Lean baseline. Domain-specific checkout, orders, payments, stock, reporting, and admin behavior remain in their packs.

### Directory / Marketplace
Generic user profiles, record attachments/comments, and broad automation are no longer default scope. Listing freshness may suggest owner revalidation, but that suggestion no longer enables external automation. Commerce/payments remain a separate explicit decision when a marketplace transacts in-app.

### Clinic / EMR
Generic approval/comments/import scope is reduced. Clinical workflow and protected file handling remain. Managed relational storage is now the default database class; deployment topology can still be changed explicitly for on-prem/LAN environments.

### Inventory / POS
Self-registration is no longer Open; the default is Invite only. Generic workflow/approval/attachments/comments are removed from the baseline because stock movements, receiving, counts, and transaction rules already provide domain-specific operational structure.

### Tournament / Event
Generic workflow/approval/attachments/comments are removed. Organizer/admin scope and bulk participant ingestion remain available through event-domain and import settings.

### Portfolio / Marketing
Automation readiness is Manual only by default. Static/public marketing scope should not imply an orchestration layer.

## Intelligence changes

Optional suggestions were made deliberately conservative. Calendar interoperability, recurring-report automation, and generic automation-readiness nudges are no longer shown merely because they could be useful. Blueprint should not turn Recommended into a backlog generator.

## Migration

- Package version: 0.18.0
- Backup/spec schema: v10
- Imports accept v2–v10
- Recommendation rebasing from v0.17 remains intact: untouched historical defaults re-resolve; deliberate overrides remain user truth.
