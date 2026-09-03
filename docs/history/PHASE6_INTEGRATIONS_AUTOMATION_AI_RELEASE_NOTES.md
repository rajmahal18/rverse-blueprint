# Blueprint v0.9 — Phase 6 release notes

## Added
- 147 App Setup decisions
- Integration hub
- API/webhook contract and reliability controls
- Email/SMS/push/calendar/maps/storage/collaboration/CRM/accounting controls
- n8n/Make/Zapier/custom automation configuration
- background-job and long-running-task behavior
- AI use cases, provider/model, grounding, privacy, permission, human-review, cost, fallback, and evaluation controls
- Phase 6 conflict/risk warnings
- setup note now surfaces enabled connected-service families
- search placeholder updated for webhook/n8n/AI discovery

## Catalog
- 734 total settings
- 40 possible sections
- 147 Phase 6 additions

## Compatibility
Backup schema remains version 4. Existing workspaces receive recommended Phase 6 defaults while explicit overrides remain intact.

## Validation target
All 11 app types × 4 profiles must start conflict-free; schema IDs/defaults/dependencies must validate; hidden customized children must remain preserved and restore with their parent.
