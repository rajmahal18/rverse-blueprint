# v0.14 Handoff — Intent & Cross-Layer Consistency

Blueprint now separates deterministic configuration from human intent. `Project.context` contains eight optional verbatim fields and must never be parsed to silently toggle config.

`src/data/consistency.ts` reconciles selected reusable Capabilities and Visual Patterns against resolved App Setup. Preserve selections for future reuse, but generated outputs must use only compatible selections. Add deterministic mappings when new reusable concepts directly correspond to a structured setting. Avoid fuzzy natural-language inference in this layer.

Authority order for generated AI prompts:
1. Explicit App Setup scope
2. Required/inferred structured scope
3. Hard Blueprint constraints
4. User-provided Project Context (interpretive only)
5. Recommended behavior/quality defaults inside active scope
6. Implementation-agent judgment

Booking defaults were intentionally trimmed so nice-to-have collaboration/automation/PWA features do not appear just because the app type is Booking.
