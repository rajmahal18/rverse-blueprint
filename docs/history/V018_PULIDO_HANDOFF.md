# Blueprint handoff — continue from v0.18

## Source of truth

Use the latest v0.18 ZIP/codebase. Do not rebuild Blueprint from handoff prose. Historical handoffs live under `docs/history/` for reference only.

## Product direction

Blueprint is now in a **depth-before-breadth** phase. Do not add another App Type casually. Mature the current types through real scenarios, lock good defaults, then expand only when the existing catalog is trustworthy.

The intended user experience is:

1. choose the closest App Type
2. optionally add short human Project Context
3. change only meaningful App Setup exceptions
4. choose/preview visual direction
5. export the implementation brief

Everything else is a power tool.

## v0.18 UX architecture

Desktop core navigation is Workspace / App setup / Visual Studio / Generated spec. Optional tools are grouped under More tools. Mobile mirrors that model with Home / Setup / Studio / Spec plus More, and the core pages include explicit next-step cues.

App Setup keeps three independent concepts:

- App Type — product shape
- Recommendation Posture + Operational Scale — how defaults are sized; hidden behind Tune recommendations for the normal path
- Configuration Depth — presentation only

Do not recombine these into one simple/advanced switch.

## Recommendation rule

Recommended means the **smallest robust baseline justified by the app type and scale**. Generic machinery must not be enabled just because it exists. Prefer domain-specific pack behavior over generic workflow/collaboration equivalents.

Examples:

- Commerce order lifecycle is not a reason to enable the generic Workflow Engine.
- Inventory movement/receiving/count rules are not a reason to enable generic approvals or comments.
- A Directory listing image is not a reason to enable generic record attachments.
- Mission critical does not mean self-managed infrastructure by default.
- A feature being “nice to have” is not enough reason for Worth considering to recommend it.

## App-type maturity workflow

For every recommendation change, regress at least:

- small-business E-commerce
- local Booking / Scheduling
- internal operations tool
- generic SaaS / client portal
- searchable Directory
- public Portfolio / Marketing site
- Government workflow system
- Clinic / EMR
- single-location Inventory / POS
- Tournament / Event
- Custom / General neutral baseline

Check: warnings, quick fixes, accidental scope, active business packs, auth/account assumptions, generic workflow/collaboration leakage, integrations, scale, recovery/deployment posture, acceptance criteria, and edge cases.

## Next work

Continue gradual maturity passes. The best next patch should come from a concrete generated-project stress test, not from brainstorming another hundred settings.
