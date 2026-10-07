# Directory structure

`dist/` is maintained source, despite its name. Never delete it as generated output.
- `index.html`: page shell and module entry point.
- `app.js`: sample workspace navigation, rendering, event handling.
- `domain.js`: sample data and traceability operations; no browser dependencies.
- `jira-ui.js`: Jira import, browser persistence, schedule configuration.
- `tickets-ui.js`: ticket preparation, review, and submission UI.
- `styles.css`: shared styling.
- Root `reconcile.mjs` is served as `/reconcile.js` for browser reuse.

Use relative ES-module imports, e.g. `import {seed} from './domain.js';`. Tests belong in `tests/`, not `dist/`.
