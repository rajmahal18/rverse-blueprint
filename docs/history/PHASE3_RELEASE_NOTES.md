# Blueprint v0.6 release notes — Phase 3

## Authentication, accounts, permissions

Phase 3 expands Blueprint from high-level login choices into a deep identity/access contract while preserving the Recommended-first workflow.

### Catalog

- **302 total App Setup settings** (up from 185)
- **18 total sections** (up from 15)
- new Accounts & profiles section
- new Roles & permissions section
- new Organizations & teams section
- existing stable IDs preserved for migration compatibility

### Authentication

- multiple sign-in directions: password, magic link, OTP, passkey, social, enterprise SSO
- modern password behavior and legacy-policy warnings
- registration/invite/approval depth
- verification and account-recovery policies
- MFA, factor replacement, backup/fallback behavior, trusted devices
- step-up authentication for sensitive actions
- richer session lifecycle and user-controlled session revocation

### Accounts

- profile visibility/editing/completion
- account statuses, suspension, deactivation, self-service lifecycle choices
- verified identity changes and connected identities
- invitation and approval behavior
- duplicate-account merge direction

### Authorization

- RBAC / ownership / policy / hybrid models
- deny by default
- server-side enforcement requirement
- role structure and permission granularity
- record/field/export/bulk/settings scopes
- privileged access, delegated admin, separation of duties
- access request/review/audit behavior

### Organizations / tenancy

- teams, departments, workspaces, and multi-tenant organizations
- memberships and switcher behavior
- invitations/join requests/domain discovery
- owner/transfer/offboarding/deletion flows
- org settings, SSO, directory provisioning
- tenant isolation and cross-tenant admin boundaries

### Usability

- preserved customized child settings now surface an **inactive customization** notice when a parent feature hides them
- search language expanded for passkey/MFA/role/tenant discovery
- no required checklist or new manual setup step

### Validation performed

- 302 unique setting IDs
- 18 valid sections
- 0 invalid default/app/profile option values
- 0 broken dependency references or dependency values
- all 11 Recommended app types start with 0 conflict warnings
- parent-disable/custom-child preservation and restoration tested
- old partial v0.5-style configuration normalization tested

### Environment note

A real `npm ci` attempt timed out in the packaging sandbox, so the final Vite production build could not be completed here. `configurator.ts` was compiled directly with TypeScript and the full schema/behavior validation suite above passed. Run `npm ci && npm run build` on a normal-network development machine before deployment.
