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
