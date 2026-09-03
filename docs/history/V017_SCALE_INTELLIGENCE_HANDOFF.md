# Blueprint handoff — Continue from v0.17

## Source of truth

Use the latest v0.17 ZIP/codebase. Scan it before making changes; do not reconstruct behavior from this handoff alone.

## v0.17 architecture added

### Operational Scale

`ProjectConfig` now includes:

`operationalScale: Auto | Lean | Standard | High scale | Mission critical`

This is deliberately separate from:

- **App Type** — what kind of product is being built
- **Profile** — how opinionated/safeguarded the default set is
- **Configuration Depth** — how many applicable decisions are visible in the editor
- **Scope Intelligence** — which product capabilities actually exist

Operational Scale changes proportional engineering/operations recommendations only. It must not silently create major product features.

`Auto` remains the recommended default and currently infers scale from app type.

### Recommendation precedence

For `Recommended` profile:

1. base/default value
2. app-type contextual default
3. operational-scale proportional override
4. explicit user override / explicit scope choice at resolution time

Other profiles may intentionally impose their own profile-specific posture on top of scale.

### Upgrade rebasing

`normalizeProjectConfig()` intentionally rebuilds untouched values from the current recommendation engine and only restores values whose IDs are present in `overrides`. Explicit `scopeChoices` are preserved separately.

Do not revert this to blindly merging an old backup's full `values` map: doing so would pin historical defaults forever and defeat recommendation upgrades.

### E-commerce proportionality

E-commerce Auto scale is Lean. Generic workflow and attachment scope are not part of the commerce baseline; domain-specific order/payment/inventory lifecycles remain in their business packs. Payment/provider callbacks use incoming webhooks by default.

### Inventory consistency

`inventory.transfers` is applicable only when `inventory.locations` is multi-location. Keep generated acceptance criteria, edge cases, visibility, and exports aligned with this dependency.

### Visual density

Visual DNA includes `functionalDensity` to separate spacious marketing/brand rhythm from scan-efficient catalog/working surfaces. Keep it deterministic and exported in the Visual Studio contract.

## Migration/version

- Package/app version: 0.17.0
- Backup/spec schema: v9
- Imports accept v2–v9

## Product philosophy to preserve

- Usability is non-negotiable.
- Recommended should mean the **smallest robust architecture appropriate to the product**, not maximum architecture.
- Safety invariants must not be weakened merely to make a system “Lean.” Payments still need server/provider authority and idempotency; stock still needs concurrency/integrity protection; privileged access still needs strong authentication; accessibility remains a baseline.
- Explicit structured settings remain deterministic truth.
- Free-text Project Context may inform advisory review/ranking but must not silently mutate configuration.
- Scale, profile, and depth are independent dimensions; avoid collapsing them into one “simple/advanced” switch.

## Useful next stress tests

Test at least these shapes before the next recommendation-engine change:

1. small-business E-commerce
2. local Booking / Scheduling
3. Government System
4. Clinic / EMR
5. Portfolio / Marketing
6. SaaS / Client Portal

Compare both scope and engineering proportionality. A change that improves one app type must not accidentally weaken a higher-impact domain.
