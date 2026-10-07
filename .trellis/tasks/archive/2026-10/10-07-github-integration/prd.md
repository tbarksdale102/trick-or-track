# GitHub repository context and traceability

Add a read-only GitHub.com connection alongside Jira. Import repository metadata, issues, pull requests, commits and file references. Preserve the previous complete import on failure/cancellation. Link/unlink references locally to RPMs, include them in Trellis export, and retain all existing delivery state. Tokens must never be persisted.

## Acceptance criteria
- [x] GitHub navigation and read-only connection/import UI.
- [x] Fixed-origin validated backend, pagination, rate-limit and access errors.
- [x] Separate browser import storage and transient token handling.
- [x] Search/type filters, local idempotent links and requirement display.
- [x] GitHub context included in Trellis exports.
- [x] 32 unit tests and browser fixture/HTTP checks pass.
- [ ] Live GitHub API check: blocked by current network policy; api.github.com saved for review.

No issue creation, OAuth app, background refresh, Enterprise Server or automatic verification is included.
