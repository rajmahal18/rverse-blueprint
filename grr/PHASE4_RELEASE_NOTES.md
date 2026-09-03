# Blueprint v0.4 release notes

## App Setup foundation
- Added schema-driven application configuration with 72 starter settings across 8 sections.
- Added contextual defaults for 11 app types and Recommended / Minimal / Standard / Advanced profiles.
- Added conditional child settings, advanced-setting disclosure, deep search, override markers, and reset controls.
- Added conflict/risk warnings for contradictory or deliberately weak choices.
- Added App Setup to desktop and mobile primary workflows.
- New workspaces now ask only for project name + closest app type; recommended settings are automatic.

## Portability
- Project configuration is included in duplication, checkpoints, Markdown, AI prompt, JSON, and full backups.
- Backup schema upgraded to version 4 while preserving version 2/3 import compatibility.

## Usability rule
The configurator is intentionally recommended-first: users should configure exceptions rather than complete a giant checklist. Advanced and irrelevant settings stay out of the way until needed.
