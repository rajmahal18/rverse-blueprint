# App Type Maturity Discipline

Blueprint currently supports these app types and intentionally freezes expansion while their recommendation baselines mature:

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

## Rule

Do not add a new app type because it sounds useful. Add one only after the current types have been exercised against realistic projects and the new shape cannot be represented cleanly through an existing type + explicit business packs.

## Regression questions

For each type:

1. Is the primary user path obvious?
2. Does Recommended enable only domain-justified scope?
3. Are account/auth defaults proportional?
4. Are generic workflow/collaboration features being confused with domain-specific behavior?
5. Is Operational Scale proportional without weakening safety invariants?
6. Does Quick expose only decisions worth human attention?
7. Are optional suggestions high-confidence rather than a nice-to-have backlog?
8. Do generated acceptance criteria and edge cases match the actual active scope?
9. Do Visual Studio suggestions fit the product without mutating deterministic truth?
10. Does the generated implementation brief read like this project rather than a generic enterprise template?

Expansion is earned after these questions are boringly easy to answer.
