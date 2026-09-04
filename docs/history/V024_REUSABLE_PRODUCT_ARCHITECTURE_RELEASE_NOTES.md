# v0.24 — Reusable Product Architecture / Tenant Modularity

v0.24 teaches Blueprint how to specify products that are built once and reused across ministries, branches, clients, or other organizations without turning each deployment into a permanent source fork.

## Product model

A new **Reusable product architecture** App Setup section adds 17 decisions:

- product reuse intent
- organization deployment model
- shared-core / anti-fork policy
- module model + dependency rules
- global vs organization configuration scope
- organization provisioning + lifecycle
- tenant terminology
- governed custom fields
- workflow customization
- role customization
- branding depth
- tenant data-isolation strategy
- extension strategy
- tenant rollout
- shared product/schema versioning

The catalog is now **935 settings across 50 sections**.

## Scope discipline

Reusable-product settings are architectural behavior, not business scope. Selecting a reusable intent never turns on booking, payments, HR-like records, government workflows, inventory, or any other domain pack. Existing projects remain `Single-purpose application` unless the user deliberately changes the reuse intent.

Shared multi-tenant runtime is also not silently inferred into organization scope. If the user selects a shared/hybrid tenant runtime without a first-class multi-tenant organization model, Blueprint surfaces a blocker and offers an explicit fix.

## Build-once safeguards

Typed review signals now cover:

- **Blocker:** shared multi-tenant runtime without `Multi-tenant organizations`
- **Blocker:** shared tenant data isolation based only on application query filters
- **Important:** permanent per-tenant source forks
- **Important:** tenant-specific version branches
- **Review:** runtime plugin loading
- **Review:** developer/manual provisioning for a multi-organization product
- **Review:** one fixed module set for a reusable product
- **Review:** white-label intent with product-only branding

Deterministic fixes can establish the multi-tenant organization boundary, move tenant isolation to database-enforced context/RLS, return to one shared product core, and move tenant versioning back to a compatible shared line.

## Roadmap + proof

Reusable projects derive a `Reusable product & tenant architecture` roadmap phase before domain implementation. The phase can include:

- shared core boundary
- tenant deployment model
- module/entitlement registry
- module dependency contract
- configuration resolution
- provisioning/lifecycle
- tenant data isolation
- terminology/custom fields/workflow/role boundaries
- branding
- extension points
- tenant rollout and shared-version compatibility

Proof gates require a second representative organization to be provisioned from the same maintained product without repository cloning or tenant-specific business-logic edits. Shared runtimes also require cross-tenant read/write/export/background-job failure tests.

Acceptance criteria and edge cases now explicitly cover module disablement, tenant configuration leakage, wrong/missing tenant context in jobs/reports/cache keys, and staged rollout compatibility.

## Quick-fix correctness

App Setup quick fixes now handle choice-based scope settings correctly: applying a positive fix to a scoped choice first turns the scope On and then applies the intended value. This prevents an explicit Off from surviving underneath a seemingly successful quick fix.

## Compatibility

- Blueprint package/generated metadata: `0.24.0`
- Backup schema: **v12** (unchanged)
- Existing v0.23 workspaces: no migration required; new config ids normalize to their defaults
- IndexedDB/recovery/reference-asset behavior: unchanged
- Core Flow model: unchanged

## Validation

`npm test` now executes:

- 37 engine checks
- 5 persistence checks
- 12 typed review-intelligence checks
- 12 Core Flow checks
- 13 implementation-roadmap checks
- 18 reusable-product architecture checks

**Total: 97 named regression checks.**
