# v0.17 — Scale Intelligence & Proportional Architecture

## Why this patch exists

v0.16 could describe a safe, comprehensive E-commerce system, but `Recommended` still tended to inherit enterprise-grade operational machinery even for a focused small-business store. v0.17 separates **what the product does** from **how much operational sophistication it needs**.

## Operational Scale

App Setup now has a first-class Operational scale:

- `Auto` — recommended; infer a proportional posture from app type
- `Lean` — focused/small-business products; production-safe without enterprise operations machinery
- `Standard` — growing products with normal safeguards
- `High scale` — higher traffic and tighter release/recovery requirements
- `Mission critical` — outages/data loss materially disrupt essential operations

Auto currently resolves:

- Government System / Clinic & EMR → Mission critical
- SaaS / Client Portal, Booking / Scheduling, Internal / Operations, Inventory / POS → Standard
- E-commerce, Directory / Marketplace, Portfolio / Marketing, Tournament / Event → Lean
- Custom / General → Standard

Operational Scale is separate from Configuration Depth. Depth controls **what the user sees**; scale controls **proportional engineering/operations defaults**. Neither creates product scope.

## Lean E-commerce proportionality

The Lean baseline keeps payment, security, accessibility, data-integrity, stock-concurrency, and provider-verification invariants, while removing requirements that are not justified by a typical small-business store.

Examples include:

- social login Off by default
- MFA required for privileged admins rather than ordinary customers
- user session-device management Off
- minimal customer profile surface; optional avatar/custom profile fields removed
- custom/delegated/superadmin role machinery reduced unless explicitly needed
- generic Workflow Engine Off for E-commerce; order lifecycle remains inside the commerce pack
- generic record Attachments Off for E-commerce
- payment/provider webhooks default to Incoming rather than Incoming + outgoing
- central error tracking without release-regression alert machinery
- primary entry/health uptime checks instead of multiple synthetic workflow probes
- production-sample Web Vitals and dependency review instead of mandatory CI regression budgets
- daily/provider backup posture with up-to-24-hour RPO and one-business-day RTO
- normal rolling/platform-atomic deploys with one-step rollback
- representative responsive/performance/payment tests instead of full matrices

## Inventory dependency fix

`Inter-location transfers` now depends on having `Multiple locations` or `Locations + bins/zones`. A single-location project no longer emits a transfer requirement, and generated edge cases no longer mention partial transfers unless transfers are applicable.

## Visual density split

Visual Studio now includes `Catalog / working-surface density`:

- Follow global
- Balanced for scanning
- Compact operational

This lets marketing/brand pages remain spacious while product grids, tables, inventory screens, and other working surfaces stay scan-efficient.

## Upgrade semantics

Older backups store a full resolved value map. v0.17 normalization now treats `overrides` as the durable record of deliberate behavior choices: untouched values rebase onto current recommendations, while deliberate overrides and explicit Auto/On/Off scope choices survive. This prevents obsolete recommended defaults from being silently frozen after an engine upgrade.

## Persistence / export

- Backup schema: v9
- Import compatibility: v2–v9
- Structured JSON blueprint version: 0.17.0
- Markdown / AI prompt summary includes resolved Operational Scale

## Validation focus

Regression coverage verifies that:

- E-commerce + Recommended + Auto resolves to Lean
- scale changes do not activate generic workflow or attachment scope
- payment and inventory safety remain active
- single-location inventory hides transfers; multi-location inventory re-enables them
- explicit overrides survive recommendation rebasing
- untouched v0.16-style values rebase to v0.17 defaults
- High scale escalates recovery/observability/release expectations without creating product features
