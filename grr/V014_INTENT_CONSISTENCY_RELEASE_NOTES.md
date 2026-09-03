# Blueprint v0.14 — Intent & Consistency

## What changed
- Added optional Project Context: eight universal, short, skippable questions; only four are shown initially.
- Project Context is stored verbatim and never mutates App Setup.
- Added a deterministic cross-layer resolver for Product Capabilities and Visual Patterns.
- Selected capabilities/patterns that contradict App Setup stay saved but are excluded from generated implementation scope until the structured setting changes.
- Generated Markdown, AI prompt, JSON, docs manifest, and Spec view now use reconciled active capabilities/patterns.
- Added cross-layer review signals and clear authority ordering in the AI prompt.
- Leaned Booking / Scheduling defaults: approvals, attachments, comments, bulk import, notification center, external automation, external calendar sync, and PWA are no longer assumed; payment webhooks default to incoming only; notifications default to important events.
- Backup schema is v6 and includes Project Context in workspaces/checkpoints. v2–v6 imports remain supported.

## Design rule
App Setup is the deterministic source of truth for product scope. Human free text supplies context to the coding AI, not configuration instructions to Blueprint itself.
