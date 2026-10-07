# Backend architecture and safety

- `server.mjs`: fixed asset map and API dispatch; loopback-only `127.0.0.1:4173`.
- `jira.mjs`: connection validation, JQL, search pagination and normalized issues.
- `tickets.mjs`: metadata, validation, persisted drafts, confirmation and uncertain-submit protection.
- `auto-reconcile.mjs`: configured reconciliation rules and action ledger.
- `reconcile.mjs`: shared hierarchy analysis.
- `schedule.mjs`: refresh lifecycle, snapshots, action history and credential helper.
- `credential.ps1`: Windows account credential protection, not a stored credential.

Keep Host and same-origin JSON checks, body limits, TLS verification, redirect restrictions, and timeouts. Reuse injected request functions for offline tests. Never log credentials or persist plaintext tokens.

An uncertain Jira create must not be blindly retried: preserve draft/action status so retries cannot create duplicates. Ambiguous mappings remain review items. Credential retention and daily refresh require Windows; do not claim Linux support or replace encryption with plaintext storage.

Ignore `.runtime/` in Git. Tests create and clean their own ticket drafts. The app has no database server or background-service prerequisite beyond its own process.

## GitHub

`github.mjs` uses a fixed `https://api.github.com` origin and read-only calls for repository metadata, issues, pulls, commits and trees. Validate owner, repo, page and response shape. Do not follow upstream pagination URLs or store tokens. The same-origin JSON route is `/api/github/page`. `github-ui.js` keeps snapshots separately in IndexedDB, promotes only completed imports, and supports local requirement linking through `github-links.js`. A truncated file tree is explicitly partial. GitHub references are context, not verification evidence; exports retain their links. Live API validation requires the environment's network allowlist and should be reported separately from fixture tests.
