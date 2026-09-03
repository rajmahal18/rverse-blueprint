# Blueprint v0.6 — Phase 3 Authentication, Accounts & Permissions handoff

## Product constraint

Usability remains non-negotiable. Phase 3 adds deep identity/access configuration, but the normal workflow is unchanged:

1. Pick an app type.
2. Keep Recommended.
3. Search for an exception only when needed.
4. Generate the blueprint.

The user is never required to complete an authentication checklist.

## Catalog state

`src/data/configurator.ts` now contains **302 settings across 18 sections**.

Phase 3 adds three top-level sections instead of overloading Authentication:

- **Accounts & profiles**
- **Roles & permissions**
- **Organizations & teams**

Existing stable setting IDs such as `login.enabled`, `registration.mode`, `login.mfa`, `session.timeout`, and `roles.level` were preserved so older v4 backups continue to normalize cleanly.

## Authentication depth

Authentication now covers:

- login identifiers and alternate identifiers
- password, magic link, OTP, passkey, social login, and enterprise SSO direction
- registration shape, approval, invite codes, duplicate-account handling, and closed-registration behavior
- modern password defaults: long-password friendliness, compromised/common-password blocklist, password-manager/autofill/paste compatibility, no arbitrary composition requirement, and no periodic forced rotation by default
- email/phone verification and resend behavior
- account recovery, high-risk recovery review, recovery notifications, and reset-link lifetime
- MFA factor choice, backup codes, enrollment timing, factor replacement, trusted-device behavior
- step-up authentication for sensitive actions
- inactivity and absolute session lifetime, expiry warning, concurrent sessions, session/device management, revoke-all, session renewal after privilege changes, and reauthentication after risk events
- guest scope

## Accounts & profiles

New configuration includes:

- profile presence/complexity/avatar/custom fields
- user-editable vs administrator-controlled identity fields
- profile completion and public/member/private visibility
- last-login visibility
- active/suspended/deactivated account state models
- reversible deactivation and offboarding
- self-deactivation / deletion-request policy
- dormant-account handling
- verified email/phone changes
- connected identities and duplicate-account merge
- invitation expiry/resend/role preassignment
- account approval queues and decision reasons
- self-service account-data export policy

## Roles & permissions

Authorization now has explicit configuration for:

- simple roles, RBAC, ownership-aware RBAC, policy/attribute-based, or hybrid models
- deny-by-default authorization
- server-side enforcement with UI reflecting access
- built-in and custom roles
- multiple roles and role hierarchy
- module/action/record/field-level granularity
- CRUD and non-CRUD/domain actions
- ownership and organization scopes
- export/bulk/settings permissions
- privileged role assignment
- superadmin/break-glass access
- temporary elevation and delegated administration
- separation of duties
- access-request workflows
- periodic access review
- permission explanations/request paths
- audit of permission changes

## Organizations & teams

Organization configuration now covers:

- flat accounts, teams, branches/departments, multiple workspaces, and multi-tenant organizations
- multi-membership and context switching
- nested organization hierarchy
- member invites and join/access requests
- verified-domain discovery
- member offboarding and leave rules
- owner role and protected ownership transfer
- organization close/delete policy
- member directory
- organization-scoped settings and light branding
- per-organization SSO and directory/SCIM provisioning direction
- tenant data boundaries and restricted cross-tenant administration

## Usability behavior added

Customized child settings continue to survive when a parent is disabled. Phase 3 now explicitly tells the user when custom choices are **currently inactive but preserved**, so configuration never silently disappears.

Search placeholder language now includes Phase 3 concepts such as passkeys, MFA, roles, and tenants. The renderer itself remains generic; no one-off JSX was created for individual auth settings.

## Modern security baseline

Phase 3 defaults follow the direction of current NIST SP 800-63B and OWASP guidance:

- password blocklists over arbitrary composition rules
- password-manager and paste friendliness
- no periodic password rotation without a compromise/reset reason
- phishing-resistant authentication encouraged where practical
- stronger handling of MFA-factor replacement and recovery
- session renewal/re-authentication after risk/privilege events
- least privilege and deny-by-default authorization
- authorization enforced on the server/action boundary, not by hidden UI alone

Low-level production security details such as full header/CSP/secret-management/rate-limit implementation remain Phase 7 concerns; Phase 3 only defines identity/access behavior and policy.

## Persistence

No backup schema bump is needed. Backup bundle `version: 4` already stores a generic `ProjectConfig.values` record. `normalizeProjectConfig()` fills all newly introduced values while preserving valid existing overrides.

## Next phase

Phase 4 should deepen **Data, Forms & Workflows**: field types, validation, CRUD, tables/views, search/filter/sort, files, import/export, workflow states, assignments, approvals, tasks/comments, audit/version history, concurrency, and data-integrity rules.
