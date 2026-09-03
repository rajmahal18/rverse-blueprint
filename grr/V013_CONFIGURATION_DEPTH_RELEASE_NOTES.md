# Blueprint v0.13 — Configuration Depth Release Notes

## Goal

Remove the remaining questionnaire feel without weakening Blueprint's 918-setting knowledge base. Relevant does not mean the user must review it now.

## What changed

- Added persistent **Quick / Standard / Advanced** configuration depth.
- Quick is the default and uses a curated essentials layer rather than merely hiding fields marked `advanced`.
- Standard shows normal product behavior.
- Advanced shows every applicable setting.
- Search bypasses configuration depth and can surface any matching advanced setting directly.
- **Show customized** also bypasses depth so deliberate choices are never trapped behind the current view.
- Depth changes presentation only; project config, scope intent, behavioral overrides, readiness, generated specs, presets, checkpoints, and backups are untouched.
- Added per-setting depth badges and a notice when active custom choices are hidden by the current depth.
- App Setup now shows the number of decisions visible at the current depth instead of leading with the full 918-setting catalog count.
- Kept **Explore features** separate from depth: scope relevance answers “does this feature belong?”, while depth answers “do I need to think about this detail now?”
- Increased small UI typography by about **+1px** for readability without enlarging major headings.
- App/package version moved to **0.13.0**.

## Expected behavior

A new workspace opens in Quick depth. Blueprint continues resolving all relevant defaults and dependencies in the background, but only essential product decisions are shown. Switching to Standard or Advanced reveals more detail without changing any values. Searching for terms such as CSP, RPO, webhook, passkey, or migration surfaces matching settings regardless of depth.
