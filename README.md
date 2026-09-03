# Blueprint — Reusable Product Architecture (v0.24)

Blueprint is a local-first **application specification + visual direction workspace**. It makes product behavior, engineering expectations, and visual intent explicit before coding—without turning planning into another tedious questionnaire.

## Non-negotiable product rule

**Usability comes first.** A new workspace is already valid. Recommended defaults are applied automatically, irrelevant settings stay hidden, advanced controls stay out of the way until needed, and the normal workflow is to configure exceptions—not answer hundreds of questions.

## Final architecture

1. **App Setup** — 935 schema-driven product/engineering decisions across 50 possible sections, including reusable-product / tenant architecture
2. **Project Context** — optional verbatim human briefing for the coding AI; never auto-mutates configuration
3. **Core Flows** — optional user-authored actor journeys with main path, success state, and failure/recovery behavior; never auto-creates product scope
4. **Implementation Roadmap** — deterministic sequencing/dependency/proof phases derived from resolved App Setup + Core Flows; never creates scope
5. **Blueprint Intelligence** — severity-typed review signals, recommendation provenance, readiness, app-type fit, quick fixes, domain suggestions, acceptance criteria, and edge cases
6. **Product Capabilities** — reusable product/engineering concepts reconciled against App Setup
7. **Visual Patterns + Visual Studio** — expressive visual direction, design-token controls, and live previews reconciled against structured choices
8. **Project Docs + References** — durable repository context and inspiration with Blob-backed reference assets
9. **Implementation Brief** — clean Markdown, AI prompt, and structured JSON outputs from one resolved truth

## v0.24 — Reusable Product Architecture / Tenant Modularity

v0.24 makes “build once, onboard many organizations” an explicit architecture choice instead of leaving it as an implementation assumption. The new **Reusable product architecture** App Setup section adds 17 structured decisions while preserving Blueprint’s core scope rule: reuse architecture can shape packaging, tenancy, configuration, and upgrades, but it never activates business capabilities by itself.

- **Explicit reuse intent:** choose `Single-purpose application`, `Reusable for similar organizations`, `Multi-organization platform`, or `White-label product`. Existing projects remain single-purpose until the user deliberately changes this.
- **Shared runtime or isolated deployments:** support a shared multi-tenant runtime, isolated deployment per organization, or a hybrid model while keeping one maintained product core.
- **Anti-fork architecture:** choose one shared core, controlled tenant adapters, or explicitly accept per-tenant forks. Permanent forks are surfaced as an important architecture risk because they destroy upgradeability.
- **Tenant-configurable modules:** fixed modules, per-organization module configuration, or entitlement/edition-based modules with explicit dependency rules.
- **Configuration over hardcoding:** global defaults + organization overrides, governed custom fields, configurable terminology, tenant workflow policies, and tenant role customization can absorb ministry/organization differences without source branches.
- **Repeatable tenant lifecycle:** platform-admin or automated provisioning plus suspend/archive/offboarding behavior replaces hand-edited rows and environment files.
- **Real tenant isolation:** shared/hybrid runtimes require a first-class multi-tenant organization boundary and can choose database-enforced tenant context/RLS, separate schemas/databases, or hybrid isolation. Application-query-only isolation is a blocker.
- **Controlled extensibility:** configuration-first and typed extension points are preferred; runtime plugin loading is allowed only as an explicit reviewed architecture because it adds trust, sandboxing, compatibility, and upgrade obligations.
- **White-label and rollout controls:** organization branding depth, tenant feature rollout, and shared product/schema versioning make it possible to customize presentation and stage releases without creating tenant versions.
- **Derived roadmap support:** reusable projects receive a dedicated **Reusable product & tenant architecture** phase before domain implementation, with proof that a second organization can be provisioned without cloning the repository or adding tenant-specific business logic.
- **Proof generation:** acceptance criteria and edge cases now cover tenant configuration leakage, module disablement, background-job/report/cache tenant context, staged rollout compatibility, and code-free onboarding.
- **Typed review + quick fixes:** shared runtime without multi-tenant org scope and query-filter-only isolation are blockers with deterministic fixes; tenant forks/version branches are important signals; manual provisioning, fixed modules, white-label mismatch, and runtime plugins are review signals.
- **Scope-safe quick fixes:** choice-based scope fixes now explicitly enable the target scope before applying the intended choice, so an explicit Off cannot make a fix appear successful while remaining inactive.
- **No workspace migration:** the existing ProjectConfig map naturally accepts the new setting ids, so backup schema remains **v12** and v0.23 workspaces normalize safely.
- **Expanded regression gate:** `npm test` runs 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flow + 13 roadmap + 18 reusable-product checks = **97 named checks**.
- Package version and generated metadata are `0.24.0`.

The release rule is: **tenant differences belong in configuration, entitlements, policy, and controlled extension points—not copied repositories.**

## v0.23 — Derived Implementation Roadmap

v0.23 converts Blueprint's resolved truth into a dependency-aware build plan without adding another questionnaire. The roadmap is fully derived and intentionally non-persistent.

- **No new source of truth:** App Setup still decides what exists. Core Flows still describe explicit journey behavior inside that scope. The roadmap only recommends build order and proof gates.
- **Dynamic phase generation:** foundation, access, active domain foundations, integrations, user-authored journeys, operations, hardening, and release phases appear only when justified by current scope.
- **Blockers move to the front:** blocker-level App Setup signals create a blocking preflight phase instead of being discovered after implementation.
- **Flows become executable sequencing:** complete Core Flows become journey phases; incomplete flows become `Clarify & implement` blocking phases with their missing contract called out explicitly.
- **Dependency graph without diagram bloat:** every phase names real earlier phase dependencies. The UI renders a readable vertical build sequence rather than another canvas/DSL.
- **Proof before advancing:** each phase carries concrete proof gates so “done” is not reduced to implementation output alone.
- **Scope safety remains absolute:** explicit Off removes matching derived work; neutral Custom / General gets no invented business domain; roadmap derivation never mutates App Setup or Core Flows.
- **Exports understand sequencing:** Markdown, AI prompt, Generated Spec, and JSON now carry the derived roadmap. The AI prompt labels it explicitly as sequencing—not authorization for scope.
- **No backup migration:** workspace shape is unchanged, so backup schema stays **v12** and existing v0.22 data loads without migration.
- **Expanded regression gate:** `npm test` runs 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flow + 13 roadmap checks = **79 named checks**.
- Package version and generated metadata are `0.23.0`.

The release rule is: **derive the smallest credible build order from product truth; never turn sequencing into hidden scope.**

## v0.22 — Core Flows / User Journeys

v0.22 adds one deliberately small workflow layer above App Setup: **Core Flows**. They describe the few actor journeys an implementation agent must get right without turning Blueprint into a workflow designer or another questionnaire.

- **Separate workflow contract:** Core Flows are stored independently from the 918-setting App Setup engine. They can describe actor, goal, starting point, ordered main steps, success state, failure/recovery states, and one optional implementation note.
- **Scope authority is preserved:** a flow never activates product scope. App Setup still wins when a flow mentions something that is Off/inactive. Generated AI guardrails explicitly rank user-authored flows below resolved App Setup scope and above free-text Project Context.
- **Explicit starters only:** relevant starter flows appear only when matching scope is already active (booking, payments, commerce, inventory, directory, government, clinic, tournament, portfolio). Nothing is inserted until the user explicitly clicks **Add starter**. Neutral Custom / General gets no invented starter.
- **Low-friction editor:** add, duplicate, delete, reorder, and edit flows inline; main steps can be added/reordered/removed; failure/recovery states stay separate so unhappy paths do not bloat the primary journey.
- **Implementation readiness per flow:** completeness checks require a name, actor, goal, starting point, at least two main steps, and a success state. Recovery guidance is advisory rather than required for purely informational journeys.
- **Proof generation:** authored flows extend generated acceptance criteria; every captured failure/recovery state becomes an explicit edge-case proof obligation.
- **Exports understand flows:** Markdown, AI implementation prompt, docs manifest, Generated Spec, and structured JSON carry Core Flows. Empty projects explicitly tell coding agents not to invent major workflow scope.
- **Checkpoint/backup support:** Core Flows survive duplication, checkpoints, restore, IndexedDB persistence, and backup import/export. Backup schema is **v12**; v2–v12 remain importable.
- **Expanded regression gate:** `npm test` runs 37 engine + 5 persistence + 12 review-intelligence + 12 Core Flow checks = **66 named checks**.
- Package version and generated metadata are `0.22.0`.

The release rule is: **capture the few journeys that define whether the product works; do not model every screen or turn flow text into hidden scope inference.**

## v0.21 — Typed Review Intelligence & Recommendation Provenance

v0.21 keeps the 918-setting product model and v0.20 persistence architecture stable, but makes Blueprint substantially more trustworthy to interpret. Flat warning strings are no longer the readiness model. App Setup review items are promoted into a typed signal contract with explicit severity, category, affected-setting references, and optional quick-fix linkage.

- **Typed App Setup review signals:** each signal has a stable id, `blocker | important | review | advisory` severity, a category (`scope`, `security`, `reliability`, `data`, `privacy`, `accessibility`, `usability`, `architecture`, `operations`, or `testing`), a concise title, detail, affected-setting ids, and an optional linked quick fix.
- **Severity-driven readiness:** readiness no longer classifies free-form warnings by keyword. Blockers produce **Not ready**; multiple important signals can produce **Needs review**; lower-severity signals produce **Ready with review**. The numeric coherence indicator remains available but is deliberately secondary.
- **Explicit risk weighting:** blocker/important/review/advisory signals have different readiness impact, and readiness dimensions are driven by typed categories rather than text guessing.
- **Recommendation provenance:** every visible App Setup decision can explain whether it comes from **Explicit**, **Required**, **Inferred**, **App type**, **Profile**, **Operational scale**, **Baseline**, or **Inactive** context. Auto-resolved operational scale is identified when it actually changes the recommendation.
- **Linked quick fixes:** high-confidence typed signals such as unprotected admin, UI-only authorization, browser-trusted payment success, non-atomic booking conflicts, unsigned/unverified webhooks, CSP/CSRF gaps, unsafe hard delete, and shared production secrets can link directly to the existing deterministic fix action.
- **Typed Project Context advisory signals:** human-context mismatch prompts remain lower-authority and non-mutating, but now expose explicit advisory severity, scope category, and affected setting ids.
- **Exports carry typed intelligence:** Markdown/AI prompts render App Setup signals with severity + category; structured JSON exports the typed signals plus recommendation provenance for the active implementation contract.
- **Readiness UI is less gamified:** status is shown before the percentage in App Setup, workspace summary, and Generated Spec. Severity counts are visible where review work is required.
- **Compatibility preserved:** `configWarnings()` remains available as the legacy predicate/string API so v0.19/v0.20 regression behavior and downstream callers stay stable. The new `configReviewSignals()` layer is the source consumed by readiness and current UI/exports.
- **Expanded regression gate:** `npm test` now runs 37 engine checks + 5 persistence checks + 12 review-intelligence checks = **54 named checks**.
- Package version is `0.21.0`; generated structured metadata reports Blueprint `0.21.0`; backup schema remains **v11** because persisted workspace shape did not change.

The release rule is: **a review signal should tell you how serious the issue is, what kind of issue it is, what decision caused it, and—when deterministic—how to fix it.**

## v0.20 — Persistence & Recovery Hardening

v0.20 keeps the product model stable and makes the local-first workspace substantially safer. Heavy workspace state no longer depends on `localStorage`; IndexedDB is now the durable source of truth, with a rolling recovery copy and Blob-backed reference assets.

- **IndexedDB workspace persistence:** projects, checkpoints, custom patterns, custom capabilities, and config presets are stored as a versioned workspace envelope. Only lightweight display/preferences and legacy migration keys remain in `localStorage`.
- **Last-known-good recovery:** before a normal save replaces the current workspace, the previous current envelope becomes `recovery`. If the current envelope is missing/invalid, hydration can promote the recovery copy without overwriting the known-good recovery during promotion.
- **Safe v0.19 migration:** legacy localStorage projects are normalized first; inline Base64 reference images are converted to IndexedDB Blob assets; the complete workspace is saved successfully; only then are the old heavy localStorage keys removed. Failed migration leaves the legacy copy intact.
- **Reference asset separation:** projects/checkpoints store immutable `imageAssetId` references instead of duplicating Base64 payloads. Orphaned assets are garbage-collected during safe startup/import maintenance, while assets still referenced by checkpoints or the last-known-good recovery workspace remain protected. Normal autosaves never race asset cleanup.
- **Visible persistence state:** desktop and mobile shells surface `Saving…`, `Saved locally`, or `Save problem`. Storage errors are actionable with a **Retry save** control instead of being console-only. Reference-image storage failures are also surfaced before the reference is added.
- **Portable backup schema v11:** exports include referenced image assets as portable data URLs; imports accept v2–v11 backups. v11 imports verify that every referenced asset is supplied before replacing the current workspace. Older inline-image backups are migrated on import.
- **Import recovery protection:** imported workspaces are written directly before React state changes and preserve the pre-import current workspace as recovery. The next autosave is intentionally skipped once so it cannot rotate the imported workspace over the recovery snapshot immediately.
- **StrictMode-safe hydration:** a module-level hydration promise prevents duplicate mount effects from racing migration or recovery work in React development mode.
- **Browser durability hint:** Blueprint requests persistent browser storage on a best-effort basis; inability to obtain it never blocks the app. Users should still export portable backups for important work.
- **Expanded regression gate:** `npm test` now runs both the 37-check engine suite and a 5-check persistence helper suite, for **42 named checks** total.
- Package version is `0.20.0`; generated structured metadata reports Blueprint `0.20.0`; backup schema is **v11**.

The release rule is: **local-first must not mean invisible data loss. A saved workspace needs an explicit durable write path, a recoverable previous copy, and a portable escape hatch.**

## v0.19 — Scenario Validation & Engine Trust

v0.19 intentionally adds almost no product-surface complexity. It turns the existing 918-decision recommendation engine into something that can be changed with confidence.

- `npm test` now runs a zero-bloat deterministic regression harness using Node + the TypeScript compiler already required by the project.
- 11 canonical app-type baselines assert proportional Recommended scope, default operational scale, and warning-free starting states.
- Real-world/failure-mode checks cover cash-only booking, unsafe payment verification, booking race handling, app-type changes, scale changes, explicit scope intent, and cross-layer exclusions.
- Explicit `Off` is exhaustively proven authoritative across all 75 active scope controls × 11 app types (825 scope assertions). Required dependencies surface conflicts instead of silently re-enabling features.
- Every app type × profile × operational-scale combination (220 contexts) is resolved to prove all 918 settings still return valid declared values.
- Catalog integrity checks protect unique ids, section membership, dependency targets, and declared default validity.
- Inactive Auto scope is proven absent from generated implementation contracts; explicit Off remains present because it is deliberate product intent.
- Package version is `0.19.0`; backup schema remains v10 because this release changes validation discipline, not persisted workspace shape.
- Generated structured metadata now reports Blueprint `0.19.0`.
- Build artifacts such as `*.tsbuildinfo` and temporary regression output are ignored.

The release rule is: **change the recommendation engine only when the regression suite can explain why the change is safe.**

## v0.18 — Pulido / Usability & Recommendation Maturity

v0.18 is deliberately a polish release. It freezes app-type expansion for now and makes the existing product easier to understand while improving the maturity of current recommendation baselines.

- **Core navigation is simpler:** Workspace → App setup → Visual Studio → Generated spec. Pattern Explorer, Capabilities, Docs, References, Inspiration, and Compare remain available under **More tools** instead of competing as peer-level destinations. Mobile mirrors the same priority with Home / Setup / Studio / Spec + More.
- **The core flow is guided:** App Setup points directly to Visual Studio, and Visual Studio points directly to the Generated spec, so first-time users can finish without learning every tool.
- **App Setup starts lighter:** App Type remains primary; Recommendation Posture and Operational Scale are tucked behind **Tune recommendations** and stay visible automatically when the user deliberately changes either one. Configuration Depth remains separate because it changes presentation only.
- **Resolved baseline replaces redundant intelligence:** when the chosen app type already clearly fits, Blueprint summarizes access shape, primary surface, inferred scale, and active business packs instead of showing a mostly-useless list saying the current app type matches itself.
- **Existing app types received a proportionality cleanup.** Generic workflow, approvals, collaboration, bulk import, automation, and account-profile machinery no longer leak into products merely because the generic setting default was On.
- E-commerce drops the generic customer dashboard and bulk-import baseline; its domain-specific order/payment/inventory behavior remains intact.
- SaaS keeps account/workspace/product foundations without assuming generic workflow, approvals, attachments, comments, imports, outbound webhooks, or automation orchestration.
- Directory keeps discovery/listing ownership but stops assuming generic profiles, attachments/comments, and external automation. Owner revalidation can be suggested without adding an integration.
- Inventory/POS defaults to controlled invitation onboarding and uses inventory-domain behavior without a generic workflow/approval/collaboration layer.
- Tournament/Event keeps organizer/admin operations without generic workflow/approval/collaboration scope.
- Clinic keeps explicit clinical workflow and protected files while generic approvals/comments/imports are no longer assumed; the database recommendation is managed relational rather than self-managed merely because the product is mission-critical.
- Marketing/portfolio projects no longer become automation-ready by default.
- Optional suggestions are now intentionally conservative: Blueprint should surface high-confidence value, not manufacture a backlog of nice-to-haves.
- Backup/spec schema is **v10**; backup versions v2–v10 remain importable.

The release rule is: **complexity belongs in the engine; the normal user should mostly see app type, meaningful exceptions, visual direction, and the final implementation brief.**

## v0.17 — Scale Intelligence & Proportional Architecture

v0.17 teaches Blueprint that **production-safe does not mean enterprise-by-default**. Product scope, configuration depth, and operational sophistication are now separate concepts.

- **Operational scale** is a first-class App Setup context with `Auto | Lean | Standard | High scale | Mission critical`. Auto is the default and is inferred from app type, so it adds no mandatory setup question.
- `Recommended` now resolves engineering/operations defaults proportionally. E-commerce, portfolio, directory, and event projects start Lean; government and clinic systems remain Mission critical; SaaS, booking, internal operations, and inventory/POS start Standard.
- Lean products keep security and transaction invariants while avoiding unnecessary machinery: customer social login/session tooling is reduced, generic custom-role/account complexity is trimmed, tracing/synthetics are lighter, recovery targets are realistic, and ordinary atomic/rolling deploys replace blue-green/canary requirements.
- E-commerce no longer enables a generic workflow engine or generic record attachments merely because orders/products have domain lifecycles. Payment-provider callbacks use **incoming webhooks** without inventing a reusable outbound-webhook product.
- **Single-location inventory can no longer expose inter-location transfers.** Transfers become applicable only when multiple stock locations exist, and edge-case guidance follows the same dependency.
- Visual Studio adds **Catalog / working-surface density** so an expressive, spacious marketing shell can coexist with efficient product grids, admin lists, and operational surfaces.
- Scale is advisory to implementation complexity, not feature scope: changing it never creates commerce, booking, payments, records, or other major capabilities. Explicit scope and deliberate overrides still win.
- Upgrade normalization now rebases untouched stored values onto the current recommendation engine while preserving deliberate overrides and explicit scope choices. Old full value maps therefore do not pin obsolete defaults forever.
- Backup/spec schema is **v9**; backup versions v2–v9 remain importable.

The rule is: **build the smallest robust architecture justified by the product's real operating impact.**

## v0.16 — Visual Suggestions & Color Intelligence

v0.16 adds a non-destructive recommendation layer above Visual Studio. Suggestions help with taste and direction without silently rewriting the deterministic design contract.

- **Visual directions are advisory.** Preview first, then explicitly apply one category or the whole direction. Full directions never change palette roles.
- **24 curated web-app color schemes** are ranked for the current project. Each includes light/dark UI roles, semantic colors, focus/border states, and accent foreground/hover/active states.
- **Apply colors only means colors only.** Theme behavior, typography, layout, sections, surfaces, shape, controls, imagery, icons, motion, anti-patterns, and Visual Signature are preserved.
- Temporary previews are local and never persisted until the user explicitly applies them.
- The color contract expands from 12 to **15 roles** with `accentForeground`, `accentHover`, and `accentActive`.
- Deterministic visual sanity checks cover text/accent/focus contrast, light/dark palette coherence, auto-dark edge cases, and existing structural visual conflicts. Checks also evaluate temporary previews.
- Optional Project Context can raise **advisory-only intent mismatch signals** for high-confidence commerce, booking, and payment language. These signals never mutate App Setup or lower structured readiness.
- Markdown, AI prompt, and JSON exports include advisory Project Context signals and actual visual review signals.
- Backup schema is **v8**; v2–v8 backups remain importable.

The rule is explicit: **Blueprint may suggest, rank, and preview freely; deterministic truth changes only when the user applies or edits a structured setting.**

## v0.15 — Visual DNA 2.0 / Visual Studio

v0.15 turns the former Visual DNA panel into a substantially richer **Visual Studio**. Visual identity can now vary as deeply as product behavior without making the builder feel like another giant questionnaire.

- Visual Studio has its own **Quick / Standard / Advanced** depth. This is presentation-only and never mutates project configuration.
- **Quick** concentrates on the high-impact choices: theme, typography character and scale, whitespace, section/background strategy, surface language, shape language, imagery, motion, palette, and visual exclusions.
- **Standard / Advanced** progressively expose heading/body typography, weights and tracking, layout tokens, section contrast/treatments, border/elevation behavior, per-control radii, button/form treatment, icon geometry, motion timing/easing, semantic color roles, and curated dark palettes.
- Typography choices use genuinely different font specimens instead of relabeling the same serif/sans preview.
- The live preview now responds to typography, scale/weight, gutters and section rhythm, background strategy, containment/elevation, radii, controls, icons, imagery, light/dark behavior, and motion character.
- The v0.15 color contract introduced semantic roles and optional separately curated dark palettes; v0.16 extends the active contract to **15 roles** with accent foreground/hover/active states.
- Visual anti-pattern exclusions explicitly guard against generic SaaS cards, gradient-heavy UI, glassmorphism, excessive pills/rounding/animation, stock imagery, oversized generic heroes, and dense-dashboard sameness.
- **Visual Signature** is a verbatim, lower-authority human design note. Like Project Context, it never silently rewrites structured settings.
- Markdown, AI prompt, JSON, checkpoints, backups, similarity checks, and design sanity checks now understand the richer visual contract.
- Backup schema is **v7**; v2–v7 backups remain importable.

The product rule remains: **structured visual choices are deterministic truth; free-text visual intent is context for the coding AI.**

## v0.14 — Intent + cross-layer consistency

v0.14 adds human context without making Blueprint guess what the user means, and makes every generated layer obey the same resolved product scope.

- **Project Context is optional.** Four short universal questions are shown first; four more stay behind **Add more context**. Every answer can be skipped.
- Context is stored **verbatim** and never toggles App Setup, changes readiness, or infers scope. It is passed to GPT/Codex only as lower-authority interpretive guidance.
- App Setup is the deterministic source of truth. Product Capabilities and Visual Patterns are checked against resolved scope before they can enter Markdown, AI prompts, docs guidance, or structured JSON.
- Contradictory saved Capability/Pattern selections are preserved for later but excluded from implementation direction, with a visible reason.
- Structured JSON exports resolved selections as the active project truth and records excluded saved selections separately.
- Booking / Scheduling defaults are leaner: approvals, attachments/comments, bulk import, notification center, external automation/n8n, calendar sync, and PWA are no longer assumed. Payment-provider callbacks default to incoming webhooks only.
- Generated prompts explicitly define instruction authority: explicit scope → required/inferred structured dependencies/hard constraints → optional Project Context → recommended behavior/quality inside active scope → implementation judgment.
- Backup schema is **v6**; Project Context is included in workspaces and new checkpoints. v2–v6 backups remain importable.

The design rule is simple: **Blueprint understands structured settings; the coding AI understands human language.**

## v0.13 — Configuration depth + readability

v0.13 keeps the **918-setting / 49-section** engine intact and changes how much of it the user has to look at. App Setup now has a persistent **Quick / Standard / Advanced** configuration depth.

- **Quick** is the default and shows a curated set of product-defining decisions only.
- **Standard** reveals normal product behavior while leaving deep engineering controls alone.
- **Advanced** exposes every currently applicable decision.
- Search ignores the depth filter, so any hidden advanced setting remains directly reachable without switching the whole workspace to Advanced.
- **Show customized** also bypasses depth so deliberate choices are always recoverable.
- Changing depth never changes project configuration, recommended defaults, scope resolution, exports, presets, or readiness. It is a presentation preference only and persists locally.
- The setup UI explains how many deeper active decisions Blueprint is handling automatically rather than presenting them as a questionnaire.
- Small UI typography was increased by roughly one pixel across labels, helper copy, controls, cards, and metadata for better readability while preserving the visual hierarchy.

The practical target is that a typical project can be configured from roughly **20–40 visible Quick decisions**, while the full 918-decision contract remains available underneath.

## v0.12 — Scope + dependency intelligence

v0.12 keeps the catalog at **918 settings / 49 sections** and changes how Blueprint interprets them. The core rule is now: **a behavioral default never creates product scope by itself.**

### Auto is real scope resolution

Major scope controls use **Auto / On / Off**:

- **Auto** resolves from app type, active business packs, explicit child decisions, and hard dependencies
- **On** explicitly includes the capability
- **Off** explicitly excludes it; if another active decision requires it, Blueprint surfaces a conflict instead of silently overriding the user

For **Custom / General**, Auto starts neutral. Dashboard, workflow, uploads, admin, search, SEO, and other major capabilities stay inactive until a real signal requires them.

### Scope, behavior, quality, compatibility

The engine now distinguishes four roles:

- **Scope** — whether a capability exists
- **Behavior** — how an active capability should behave
- **Quality** — standards that apply when the relevant surface exists
- **Compatibility** — legacy/alias controls retained for migration but removed from normal UI/spec output

This prevents duplicate questions and keeps old backups readable without showing two controls for the same concept.

### Smarter relevance and generation

- irrelevant child settings stay hidden, and dormant Auto→Off capabilities stay out of the normal view until **Explore features** or search is used
- customized children can infer an Auto parent as required
- explicitly disabling a required parent creates an immediate review signal
- active scope, not raw Recommended values, drives acceptance criteria and edge cases
- Auto-inactive capabilities are omitted from generated implementation contracts
- public-site/noindex combinations surface as an intentional-review prompt rather than silently enabling SEO
- scope intent is stored separately from behavior customization, so Off/On/Auto does not erase a deliberate behavior
- legacy v0.11 scope overrides migrate into explicit On/Off intent

The intended result: Blueprint can understand 918 decisions while a normal Custom project exposes only the handful that are actually relevant. A neutral Custom project resolves no feature scope until the user supplies a meaningful signal.

## Phase 8 — intelligence without more questions

Phase 8 intentionally adds **zero new App Setup settings**. The catalog remains **918 settings / 49 section definitions**.

Instead, Blueprint now interprets the configuration that already exists.

### Readiness, not checklist pressure

App Setup shows a readiness summary using the existing configuration:

- overall readiness score
- active-setting coverage
- coherence
- safety
- resilience
- usability
- review-signal count

A default project can be fully ready without manually touching a setting. The score is not a gamified completion meter; it highlights contradictions or risky overrides while respecting recommended defaults as intentional decisions.

### App-type fit

Blueprint compares meaningful product signals against the supported base app types and can suggest a closer starting point.

- a neutral **Custom / General** project stays neutral until the user makes meaningful overrides
- deliberate business-pack/access/product-shape signals influence matching
- changing base type remains explicit; Blueprint never silently rewrites the project

### One-click fixes and domain suggestions

The review layer can offer actionable fixes for contradictions such as:

- admin surface without login
- allow-by-default permissions
- UI-only authorization
- UI-only booking conflict handling
- client-return-only payment verification
- unsigned/unverified/non-idempotent webhooks
- disabled CSP/CSRF
- shared environment secrets
- destructive record handling in sensitive apps

Separate domain suggestions surface useful-but-optional improvements such as automated booking confirmations, calendar interoperability, listing freshness automation, scheduled reporting, inventory reorder thresholds, and stronger test depth.

### Guidance labels

Existing settings now receive contextual labels:

- **Recommended**
- **Optional**
- **Advanced**
- **Not recommended**

These are derived from the active app type/profile and existing caution metadata. They do not create another configuration layer.

### Reusable custom presets

A useful configured starting point can now be saved as a reusable preset.

Presets store:

- base app type
- profile
- deliberate overrides only

Applying a preset creates a fresh contextual base and replays the saved exceptions, so future schema defaults can still evolve cleanly.

### Real Blueprint checkpoints

Checkpoints are now full Blueprint versions rather than visual-only snapshots.

New checkpoints preserve:

- App Setup
- Visual Patterns
- Visual Studio
- Product Capabilities
- Project Docs
- References

Before restoring, Blueprint can compare the checkpoint with the current workspace and summarize differences across setup decisions, patterns, capabilities, docs, and Visual Studio. Legacy checkpoints remain restorable.

### Proof-of-done generation

Generated implementation output now includes contextual:

- acceptance criteria
- edge cases to prove
- readiness/review signals
- important deliberate customizations
- full active App Setup contract as the exhaustive appendix

Examples are generated from the actual configuration: concurrent booking protection, authoritative payment verification, server-side authorization, form error preservation, workflow traceability, upload behavior, inventory concurrency, clinic access rules, government routing, automation failure/retry behavior, AI permission boundaries, and mobile/network recovery.

The goal is a brief that tells an implementation agent **what success means**, not just what controls were selected.

## Recommended-first interaction model

- Every project starts fully configured.
- Changing app type/profile recalculates untouched defaults only.
- User overrides survive context changes.
- Parent settings hide irrelevant children.
- Hidden custom child choices are preserved and reported as inactive.
- Advanced settings are hidden by default but remain searchable.
- **Customized only** revisits deliberate exceptions.
- Section jumps and sub-groups keep the catalog navigable.
- Search covers deep product, security, production, integration, and domain terminology.
- Review signals only appear for active contradictory/risky behavior.
- Phase 8 intelligence never requires another questionnaire.

## Supported starting app types

- Custom / General
- Booking / Scheduling
- Internal / Operations
- SaaS / Client Portal
- E-commerce
- Directory / Marketplace
- Portfolio / Marketing
- Government System
- Clinic / EMR
- Inventory / POS
- Tournament / Event

## Persistence and exports

Blueprint remains zero-backend/local-first, but **IndexedDB is the authoritative workspace store**. `localStorage` is limited to lightweight UI preferences and one-time legacy migration keys. Reference screenshots/images are stored as Blob assets instead of Base64 inside project payloads, and the workspace keeps a last-known-good recovery envelope.

The full workspace travels with:

- project duplication
- full Blueprint checkpoints
- reusable configuration presets
- Core Flows
- reference assets
- Markdown implementation specs
- AI implementation prompts
- structured JSON
- portable Blueprint backups

Backup schema is **v12**. Imports remain compatible with v2–v12, and older project/config payloads normalize forward without inventing new scope.

## Existing systems preserved

- 935-setting schema-driven App Setup
- 50 possible context-aware sections
- 11 app types × 4 profiles
- business feature packs
- integrations, automation, and AI controls
- production/security/privacy/accessibility/reliability/testing controls
- Visual Pattern library and schematic previews
- compare mode and learning overlays
- Visual Studio and presets
- anti-sameness scoring and recommendations
- reference board
- inspiration launchpad
- product capability library with dependencies
- project documentation checklist

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Architecture

- `src/App.tsx` — workspace UI/state, generic setup renderer, quick-fix handling, intelligence surfaces, presets/checkpoints, and generated outputs
- `src/data/configurator.ts` — 935 settings, contextual defaults, reusable-product architecture, dependencies, warning rules, profile safety floors
- `src/data/intelligence.ts` — readiness, app-type matching, recommendation provenance, quick fixes, acceptance criteria, and edge cases
- `src/data/reviewSignals.ts` — typed blocker/important/review/advisory metadata and affected-setting links
- `src/data/coreFlows.ts` — user-authored journey contracts and starter suggestions
- `src/data/roadmap.ts` — derived implementation sequencing, including reusable-product phases
- `src/data/persistence.ts` — IndexedDB workspace/recovery envelopes and Blob asset storage
- `src/data/catalog.ts` — reusable visual pattern knowledge
- `src/data/capabilities.ts` — reusable generic software capability knowledge
- `src/data/docs.ts` — project-document catalog and recommendation triggers
- `src/components/PatternPreview.tsx` — visual schematic renderer
- `src/styles.css` — responsive workspace/design-system UI

Historical phase handoffs, release notes, and the completed expansion roadmap are archived under `docs/history/`. The current source-of-truth handoff is `V024_REUSABLE_PRODUCT_ARCHITECTURE_HANDOFF.md`.
