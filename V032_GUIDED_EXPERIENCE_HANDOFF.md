# v0.32.1 Handoff — Guided Experience / Anti-Dumb UX hardening

## Status

v0.32 is the usability transformation layer over the completed v0.31 Visual Intelligence program.

## Product direction

Blueprint should be usable by someone who does not know where any setting lives.

Default mental model:

1. What are you building?
2. What important decisions need attention?
3. Review the recommended setup.
4. Design and preview visually.
5. Review readiness and build.

The complete expert configuration system remains available through Advanced tools and global search.

## Non-negotiable rules

- `Suggested != On` remains absolute.
- Goal/intelligence mismatches may block readiness but cannot silently activate scope.
- Search/jump helpers may expose controls but do not change them until the user explicitly acts.
- Guided Mode is a presentation/navigation layer over the same resolved Blueprint truth; do not create a second configuration model.
- Important decisions should be surfaced proactively instead of requiring menu hunting.
- Avoid adding more helper UI unless it reduces cognitive load; helpers must not become another layer of clutter.

## Canonical regression scenario

Project Context:

- Highly customized pickleball court booking system
- Players should be able to book on the website
- Ease of use matters most

Booking & Scheduling is initially inactive.

Expected:

- Blueprint prominently surfaces Booking as goal-critical.
- The user can Include, Review, or mark it Not needed directly.
- Find Anything locates Booking immediately.
- The product is not Ready to Build while the goal-critical mismatch remains unresolved.
- Booking remains inactive until the user explicitly includes it.

## v0.32.1 hardening delta

- one shared unresolved-decision queue for Home, Guided Setup, navigation badges, global guidance, Finder, export prompts, and build-readiness
- App Setup blockers with a known `suggestedFixId` can apply the exact typed quick fix from the guided card
- Project Context is now a recommended first step with clearer authority copy
- high-confidence intent surfacing expanded to inventory, clinic/EMR, document workflows, tournaments, directories, reporting, and subscriptions
- Find Anything uses conservative typo-tolerant matching and Enter activates the first useful match
- no backup-schema or structured-export migration required

## Validation

`npm test` passes **213 / 213** named checks, including **17 / 17** dedicated v0.32 Guided Experience regressions. The patch specifically protects against a blocked/all-clear contradiction, verifies typo-tolerant search, and verifies the expanded high-confidence Project Context intent catalog.

## Future work

Do not automatically invent v0.33. Use v0.32 with real projects and fix the next empirically observed usability bottleneck. The next optimization target should come from user friction, not feature-count momentum.
