# Trick or Track

A local systems engineering prototype for requirements gathering, RPM traceability, delivery coverage, architecture diagrams, and Jira integration.

## Run

Requires Node.js 22 or newer. There are no third-party dependencies or build steps.

```sh
npm start
```

Open http://127.0.0.1:4173 on the machine running the server. The server binds to loopback. On Windows, you can also double-click `Start-Trick-or-Track.cmd`.

## Test

```sh
npm test
```

## Layout

- `dist/`: supplied browser application files, served directly without a build.
- Root `.mjs` files: local HTTP server, Jira operations, and reconciliation.
- `tests/`: supplied Node test suites.
- `credential.ps1`: Windows credential protection helper; contains no credentials.

The sample workspace runs without Jira credentials. Live Jira import and ticket creation require your own site, account, and token entered in the UI. Ticket creation and configured automation can write real Jira issues.

Encrypted credential retention and daily scheduled refresh require Windows account protection and are unavailable on Linux. Manual Jira operations and the sample workspace do not use that helper.

Keep `.runtime/`, browser exports, and credentials private. Runtime data is excluded from Git. See `START-HERE.txt` for the original prototype instructions and limitations.

## AI development with Trellis

Project-specific guidelines, task records, and Codex skills are configured with Trellis 0.6.17. See [the development guide](docs/trellis.md). Trellis is not required to run the application.

## Implementation readiness and task export

Select a requirement to save a delivery owner, acceptance criteria, implementation scope and system context. Complete all six readiness checks, then review and download a Trellis task ZIP. See [import instructions](docs/trellis.md#export-a-requirement-as-a-task). Export does not execute agents or write Jira issues.

## GitHub integration

Open GitHub in the navigation and enter a repository owner/name. Import issues, pull requests, commits and a file inventory, then link references to an RPM. Requirement details show linked references, which are also included in reviewed Trellis exports. Imports are read-only; no GitHub issues are created or updated.

Public repositories support unauthenticated access (subject to rate limits). Private repositories need a fine-grained token with repository Metadata, Contents, Issues and Pull requests read permissions. Tokens are cleared after import and never persisted. Import snapshots live separately in IndexedDB, and failed/cancelled refreshes preserve the previous snapshot. Do not share private repository snapshots or exported requirement data without review.

Cloud access requires `api.github.com` in the environment network allowlist. This integration supports GitHub.com, not GitHub Enterprise Server. File inventories may be marked partial when GitHub truncates its tree response; they are not architecture scans. Each list import is limited to 100 pages. Linked references do not automatically verify a requirement or alter Jira status.
