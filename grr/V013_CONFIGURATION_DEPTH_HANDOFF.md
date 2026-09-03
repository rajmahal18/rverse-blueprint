# Blueprint v0.13 — Configuration Depth Handoff

The 918-setting catalog remains the source of truth. Do not add another parallel set of simple settings. Configuration depth is a UI projection over the same schema.

Key rules:

1. **Quick / Standard / Advanced never mutate ProjectConfig.**
2. Search and Customized-only intentionally bypass depth filtering.
3. Scope intelligence still runs first; depth only filters already-relevant settings.
4. Dormant Auto→Off scope remains controlled by Explore features.
5. Hidden custom values must remain preserved.
6. New settings should default to Standard unless they are clearly product-defining (Quick) or deep/technical (`advanced: true`).
7. Keep Quick curated. The goal is a small number of conscious decisions, not a second comprehensive form.
8. Maintain the larger readable type scale introduced in v0.13 unless a specific layout proves it needs adjustment.
