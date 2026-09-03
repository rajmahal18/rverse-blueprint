# Blueprint v0.10 — Phase 7 release notes

Phase 7 deepens Blueprint from feature/integration completeness into a production-quality implementation contract.

## Release numbers

- Previous catalog: **734 settings / 40 possible sections**
- New catalog: **918 settings / 49 possible sections**
- Phase 7 additions: **184 settings / 9 sections**
- Backup schema: unchanged at **version 4**

## Added sections

1. Security hardening — 28 settings
2. Privacy & data governance — 18 settings
3. Accessibility & inclusive UX — 22 settings
4. SEO & web quality — 16 settings
5. Performance & reliability — 22 settings
6. Observability & incidents — 17 settings
7. Backup & disaster recovery — 14 settings
8. Deployment & engineering — 24 settings
9. Testing & compatibility — 23 settings

## Usability behavior

- No production checklist is required before a project is valid.
- Recommended defaults populate all applicable Phase 7 decisions.
- Advanced options remain hidden unless deliberately opened or searched.
- SEO details are conditional on `seo.enabled`.
- Recovery details follow the existing `quality.backups` posture.
- Upload security follows attachment support.
- DB operational controls disappear for static/no-DB projects.
- PWA/offline child settings follow their existing parent choices.
- Payment/webhook/job tests appear only when the underlying feature exists.
- Phase 7 settings automatically flow into checkpoints, duplication, Markdown/AI/JSON exports, and v4 backups through the shared `ProjectConfig` model.

## Minimal safety-floor expansion

Government/Clinic Minimal profiles now preserve contextual baselines for additional production fundamentals including:

- operational logging, testing, and privacy posture
- CSP/CSRF/upload defenses and scanning/static checks where contextual defaults are stronger
- sensitive-domain data inventory/retention
- WCAG target and screen-reader verification
- restore drills
- environment separation
- risk-based overall/security testing strategy

Minimal still removes optional machinery where safe.

## New risk/conflict warnings

Phase 7 warns on representative dangerous overrides including:

- CSP/CSRF disabled, wildcard CORS, UI-only trusted validation, unsafe query policy
- extension-only upload validation and disabled malware scanning in sensitive apps
- detailed production errors/debug exposure
- excessive sensitive-data collection, raw app fields in analytics, weak tracker/retention/third-party policies
- placeholder-only labels, color-only meaning, ignored reduced-motion, drag-only actions, inaccessible charts
- private products with broad indexing, robots-only private-page protection, incorrect public status-code behavior
- high-availability apps with weak health/degradation/uptime/alerting posture
- single-failure-domain backups, untested restores, weak backup deletion protection, excessive data-loss windows
- shared environment secrets, manual schema edits, unreviewed migrations, downtime-incompatible deployment strategies, direct production pushes
- silent offline conflict overwrite
- weak authorization/payment/migration/test-data/browser coverage

## Validation performed

- 918 total setting IDs
- 918 unique IDs
- 49 valid section definitions
- 0 invalid default values
- 0 invalid app/profile defaults
- 0 missing/broken dependency references
- all **44 app type × profile** default combinations produce **0 warnings**
- deliberate Phase 7 risk overrides trigger expected warnings
- Portfolio Recommended hides backup/recovery and no-DB pooling detail while retaining SEO
- Clinic Minimal retains sensitive-app safety floor
- standalone configurator TypeScript compile passes
