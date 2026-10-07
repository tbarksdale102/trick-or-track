# State management

`app.js` keeps the sample workspace in memory and persists it under localStorage key `traceworks.v1`. Invalid stored structures fall back to `seed()`.

Jira imports are kept separately in IndexedDB by `jira-ui.js`. Server-side draft/schedule data lives in ignored `.runtime/`. Do not merge sample requirements into a live Jira inventory implicitly.

Use existing domain functions such as `apply(state, 'req:RPM-004')` for corrections. They enforce prerequisites and idempotence. Findings are derived from current state. Keep source references and revisions when importing an RPM.
