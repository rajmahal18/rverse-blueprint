# Blueprint — 8-phase expansion roadmap

Blueprint's original visual/product/docs foundation remains intact. The new roadmap expands it into a near-comprehensive application configurator while keeping **usability non-negotiable**.

## Product rule for every phase

Blueprint must feel like **everything is available without making everything mandatory**.

- Recommended defaults first
- Progressive disclosure
- Context-aware app-type defaults
- Advanced choices one level deeper
- Irrelevant children hidden
- Deliberate overrides clearly marked
- Search must find deep settings quickly
- Mobile remains first-class
- Generated outputs must include the decisions even when the user never manually touched them

---

## Phase 1 — Configurable foundation ✅ v0.4

**Goal:** make hundreds of future settings technically and ergonomically possible.

Implemented:

- schema-driven `src/data/configurator.ts`
- 72 starter settings across 8 sections
- contextual Recommended defaults for common app types
- Minimal / Standard / Advanced profiles
- parent/child conditional visibility
- advanced-settings disclosure
- settings search
- individual, section, and global reset-to-recommended
- custom override tracking
- conflict/risk warnings
- App Setup in desktop/mobile navigation
- new-project app-type selection
- App Setup included in project duplication and checkpoints
- backup schema v4 with v2/v3 import compatibility
- full configuration included in Markdown, AI prompt, and JSON exports
- mobile layout for configuration controls

**Do not add hundreds more settings until this interaction model stays clean in real use.**

---

## Phase 2 — Core app structure & UX ✅ v0.5

Implemented:

- product identity/access shape, audience, app shell, start/resume behavior
- broad page inventory
- detailed landing/public composition
- navigation variants, context recovery, search, deep links, command palette, and quick actions
- dashboard presence, role-aware behavior, modules, and personalization
- common loading/empty/error/offline/permission/service states
- content/copy behavior and stronger AI-slop guardrails
- onboarding/help/support/feedback patterns
- modal/drawer/overlay policy
- phone-specific tables/forms/actions/touch/keyboard/safe-area/network behavior
- richer defaults per app type
- schema sub-groups, section jump navigation, and Customized-only filtering

Catalog now has **185 settings across 15 sections**. Visual DNA remains the visual source of truth; App Setup does not duplicate palette/typography/radius/density controls.

---

## Phase 3 — Authentication, users & permissions ✅ v0.6

Implemented:

- deep login/sign-in methods including password, magic link, OTP, passkey, social, and enterprise SSO direction
- registration, invite, approval, verification, recovery, and duplicate-account behavior
- modern password defaults plus explicit legacy-policy warnings
- MFA enrollment/fallback/factor-change/trusted-device behavior and step-up authentication
- session inactivity/absolute lifetime, concurrent sessions, user session management, revocation, and risk-event reauthentication
- profiles, account statuses, identity changes, invitations, approval queues, and offboarding
- RBAC/ownership/policy/hybrid authorization models, deny-by-default, server enforcement, granular action/record/field scopes, privileged access, and access governance
- teams/departments/workspaces/multi-tenant organization models, membership/offboarding, ownership, SSO/provisioning direction, and tenant boundaries
- inactive-customization notice so preserved child overrides never silently disappear when a parent is disabled

Catalog now has **302 settings across 18 sections**. Security recommendations remain modern and clearly distinguish legacy exceptions.

---

## Phase 4 — Data, forms & workflows ✅ v0.7

Implemented:

- data-model detail, identifiers/reference numbers, relationships, lifecycle, retention, transactions, idempotency and concurrency protection
- long-form structure, drafts/autosave/resume, validation timing, error recovery, conditional/repeatable fields, key field types, review and duplicate-submit protection
- tables/lists/cards/calendar/Kanban view direction, density, columns, sorting, filters, search, saved views, URL state, pagination/virtualization, exports and print behavior
- explicit workflow states/transitions/history, assignment/reassignment/auto-routing, approvals/delegation/return-for-correction, due dates, SLA/escalation, and task behavior
- attachments, previews/versioning/permissions, comments/mentions, activity timeline, edit presence/locking, and bulk import mapping/preview/duplicate/failure strategy
- new configuration warnings for client-only validation, app-only uniqueness, unsafe operational concurrency, unrestricted transitions, and imports without preview

Catalog now has **406 settings across 23 sections**. Existing Phase 1–3 IDs and the v4 backup schema remain compatible.

---

## Phase 5 — Business/domain feature packs ✅ v0.8

Implemented through one discoverable **Business packs** hub and conditionally revealed domain sections:

- booking/scheduling: resources, slots, duration/buffers, availability/closures, holds, conflict protection, confirmation/payment rules, reschedule/cancel, waitlist, recurring bookings, and check-in
- payments/refunds/fees: channels/methods, payment timing, server/provider verification, webhook idempotency, pending/retry behavior, fee transparency, discounts/tax direction, refunds, receipts, disputes, settlement/reconciliation, and split-payment direction
- subscriptions/SaaS billing: plans, cadence, trials, seats, usage, entitlements, plan changes, cancellation/pause, dunning, invoices, and self-service billing
- e-commerce: catalog/variants, carts, guest checkout, fulfillment/shipping, promotions, wishlist, reviews, order lifecycle, cancellation, returns, recovery, and recommendations
- inventory/POS: locations, SKU/barcodes, units, movement ledger, transfers, adjustments, negative-stock rules, reservations, reorder/alerts, lots/expiry/serials, costing, purchasing, and physical counts
- reports/analytics: standard/custom reports, periods/comparisons, grouping/drill-down, charting, export/scheduling/delivery, permissions, audit, and freshness
- directory/marketplace: listings/submissions/claims, verification, location/maps/search/filters, owner edits, freshness, featured placement, reviews, contact actions, and moderation
- tournament/event: registration/entities/divisions/groups, scheduling, scoring, standings/tiebreakers, brackets, lineups, live/visibility rules, print, awards, and private simulation
- government/document workflow: document types/direction, office hierarchy, routing/receiving, references/families/signatories, turnaround/delay, slips/QR, bounded public tracking, retention, and receipt proof
- clinic/EMR: patient identity, encounters/appointments/vitals/complaint/assessment/diagnosis, orders/labs/medication/prescriptions/referrals/services/vaccines, optional inventory link, consent, and clinical access scope
- portfolio/marketing: project archive/case studies/media/links, services/about/resume/contact, maintained-content choice, verified proof, filtering, signature interactions, outcomes, and status metadata

Selected app types automatically enable relevant packs; Custom / General keeps every pack discoverable but off. Disabled packs keep their detailed sections hidden and preserve any custom child choices for later restoration.

Catalog now has **587 settings across 35 possible sections** (181 Phase 5 additions). The normal user sees only the relevant subset.

Phase 5 also adds a safety-floor rule for Minimal profiles: optional complexity may be reduced, but app-type-specific access, integrity, authorization, audit, accessibility, abuse-protection, and backup baselines are not silently weakened.

---

## Phase 6 — Integrations, automation & AI ✅ v0.9

Implemented through five progressive layers:

- Integration hub: provider strategy, failure UX/health, email/SMS/push/calendar/maps/storage/collaboration/CRM/accounting, external automation, and AI parent switches
- APIs & webhooks: contract style/versioning/docs/auth/scopes/keys/pagination/filtering/errors/idempotency/rate limits/CORS/deprecation plus signing, signature verification, replay protection, retries, delivery logs, resend, idempotency, and endpoint failure handling
- Connected channels: email/SMS/push consent/privacy/delivery, calendar source-of-truth/timezone/privacy, maps permission/precision/geocoding, storage access/privacy/outage behavior, collaboration action auth, CRM/accounting sync ownership/reconciliation
- Automation & jobs: n8n/Make/Zapier/custom orchestration, trigger/condition/delay/action rules, scoped service identities, human approval, dry-run, dedupe, retries, failure alerts, run history, replay, credential storage, versioned contracts, queues, long-running-task UX, dead-letter state, concurrency, scheduling timezone, and monitoring
- AI & intelligence: chat/summarization/extraction/classification/drafting/translation/recommendations/semantic search/document analysis/data insights/routing plus provider/model routing, structured output, grounding/citations, uncertainty, sensitive-data policy, provider retention, prompt logging, action authority, human approval, tool permissions, prompt-injection handling, destructive-action bounds, cost/rate/fallback controls, prompt versioning, evaluation, feedback, and audit

Phase 6 adds **147 settings**, bringing the catalog to **734 settings across 40 possible sections**.

Optional external services remain opt-in/contextual even on Advanced. The deeper section appears only when a parent integration or AI capability is active. Automation keeps critical invariants in the app while allowing replaceable orchestration to live in n8n/Make/Zapier/custom workflows.

Cross-setting warnings now cover webhook trust/retry/idempotency, sensitive channel content, location permission timing, public protected-file URLs, chat-action authorization, automation privilege/approval/deduplication/credential mistakes, and AI grounding/privacy/action-permission/destructive-action/structured-output risks.

---

## Phase 7 — Production, security & engineering quality ✅ v0.10

Implemented a deep production contract across **184 new settings / 9 sections**, bringing Blueprint to **918 settings across 49 possible sections**:

- security hardening: headers/CSP/transport, CSRF/CORS, trusted-boundary validation, uploads, abuse controls, secrets/dependencies, privileged surfaces, and production exposure
- privacy/data governance: minimization/classification/encryption/masking, analytics privacy, consent/cookies, retention/rights, third-party payloads, sensitive-access audit, and incident handling
- accessibility/inclusive UX: WCAG 2.2 target, keyboard/focus/semantics/forms/contrast/reflow/touch/motion/media/tables/charts/auth plus manual/automated verification
- SEO/web quality: conditional public indexing, metadata/canonicals/sitemaps/robots/noindex, URLs/redirects, sharing/structured data, status codes, performance, and verification
- performance/reliability: client/server targets, caching/CDN, query/index discipline, large-data/frontend optimization, timeouts/retries/circuit breakers, degradation, health, capacity, region, and availability
- observability/incidents: structured/redacted logs, correlation, errors/traces/metrics, uptime/synthetics, alerting, dependency/job/DB monitoring, release markers, incidents/status, and retention
- backup/disaster recovery: scope/frequency/retention/separation/encryption/access, verification/restore drills, RPO/RTO, runbooks, snapshots, deletion protection, and alerts
- deployment/engineering: environment/config/secret separation, DB class/pooling/migrations/seeds, deployment/rollback/regions/residency, CI/CD/branch/build/deploy gates, feature flags/maintenance, PWA/offline safety
- testing/compatibility: unit/integration/E2E/security/authz/accessibility/mobile/visual/performance/load/domain/data-recovery tests plus browser/device/network/print/release confidence

Phase 7 also expands the Minimal safety floor for sensitive app types and adds production-risk warnings while keeping all 44 app-type/profile recommended defaults conflict-free.

---

## Phase 8 — Intelligence & final polish ✅ v0.11

Final phase completed without adding another configuration dump. The catalog remains **918 settings across 49 possible sections**.

Implemented intelligence/polish layer:

- readiness summary with coherence, safety, resilience, usability, coverage, and review-signal counts
- contextual app-type fit; neutral Custom projects remain neutral until meaningful overrides exist
- one-click quick fixes for active contradictions and risky choices
- optional domain-aware suggestions for automation/quality improvements
- contextual Recommended / Optional / Advanced / Not recommended setting guidance
- reusable custom configuration presets that store base context + deliberate overrides only
- full Blueprint checkpoints with App Setup, patterns, Visual DNA, capabilities, docs, and references
- checkpoint diff before restore, with legacy checkpoint compatibility
- generated acceptance criteria and edge cases derived from actual project configuration
- cleaner Markdown/AI/JSON outputs with readiness and proof-of-done intelligence
- final responsive/intelligence UI polish without changing the established Visual DNA system

Phase 8 adds **zero new setup questions**. Its job is to make the existing depth easier to understand, review, reuse, and hand off.

## End state

The ideal normal workflow is still short:

1. Create project.
2. Pick closest app type.
3. Keep Recommended.
4. Search and change only important exceptions.
5. Add visual direction/capabilities/references if useful.
6. Generate Blueprint.

The power user can go hundreds of settings deep; the normal user should never have to.


---

## v0.12 follow-up — Scope + dependency intelligence ✅

Implemented after the eight-phase catalog/intelligence roadmap without adding new setup questions. The catalog remains **918 settings / 49 sections**.

- introduced explicit **Auto / On / Off** scope intent for major feature-level controls
- separated scope activation from behavioral/quality defaults so Recommended behavior cannot create functionality by itself
- made Custom / General Auto scope neutral until app shape, child customizations, business packs, or hard dependencies require a capability
- added resolver sources/reasons: Explicit, Required, Inferred, Contextual, Inactive
- added dependency conflict detection when a user explicitly disables a capability required by another active decision
- hides Auto-inactive child settings and omits them from implementation contracts
- canonicalizes legacy/duplicate feature toggles while preserving v0.11 migration compatibility
- makes acceptance criteria and edge cases derive from resolved active scope rather than every Recommended default
- preserves child/behavior choices while scope is inactive and restores them across Off / On / Auto
- separates scope intent from raw behavior overrides to prevent duplicate deliberate-choice counts
- hides dormant Auto→Off capabilities in the normal setup view while keeping them available through **Explore features** and search
- adds a review signal for explicitly public website direction that remains Auto → noindex

The main objective is scope discipline: **918 things Blueprint understands should not become 918 things the generated product must contain.**

## v0.13 follow-up — Configuration depth + readability ✅

- Added persistent Quick / Standard / Advanced setup depth.
- Quick is a curated essentials view; Standard adds normal product behavior; Advanced exposes every applicable setting.
- Search and Customized-only bypass the depth filter so hidden settings remain directly reachable.
- Configuration depth is UI-only and never mutates ProjectConfig, presets, checkpoints, readiness, or generated specs.
- Retained Scope Intelligence / Explore features as the separate relevance layer.
- Increased the small UI type scale by roughly one pixel for easier reading.
- Kept the underlying catalog at 918 settings / 49 sections.

## v0.14 follow-up — Intent + cross-layer consistency ✅

- Added eight universal, optional Project Context prompts; only four are visible initially and every field is skippable.
- Stores Project Context verbatim and never parses it into automatic App Setup changes.
- Passes Project Context to AI/spec exports as interpretive guidance below deterministic structured scope.
- Added deterministic reconciliation for reusable Product Capabilities and Visual Patterns against resolved App Setup.
- Preserves contradictory saved selections but excludes them from generated implementation direction and explains why.
- Makes resolved App Setup the single source of truth for Markdown, AI prompts, structured JSON, docs recommendations, acceptance criteria, and edge cases.
- Trimmed over-eager Booking defaults: approvals, attachments/comments, bulk import, notification center, external automation/n8n, external calendar sync, and PWA are no longer assumed.
- Tightened payment/webhook semantics so incoming provider callbacks do not imply outbound webhook capability.
- Backup schema advances to v6 with Project Context included in projects/checkpoints; v2–v6 imports remain supported.

The objective is not more settings. It is one coherent implementation story: **structured Blueprint choices define scope; optional human context helps the coding AI understand intent without silently changing that scope.**

