# Trick or Track frontend

Plain browser JavaScript ES modules, served from `dist/` without compilation. Read the relevant guides before editing; no React, TypeScript, or bundler is currently used.

## Pre-development checklist
- Read [layout](directory-structure.md), [rendering](component-guidelines.md), and [state](state-management.md).
- For network changes read [backend](../backend/index.md).
- For traceability changes read [product rules](../product/requirements.md).

## Guides
- [Directory structure](directory-structure.md)
- [Component guidelines](component-guidelines.md)
- [Events and asynchronous operations](hook-guidelines.md)
- [State management](state-management.md)
- [Runtime validation](type-safety.md)
- [Quality checks](quality-guidelines.md)

## Quality check
Run `npm test`; start `npm start` and exercise affected browser flows. Do not describe mocked Jira tests as live integration evidence.
