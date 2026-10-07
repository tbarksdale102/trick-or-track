# Quality

Run `npm test` (currently 23 tests across five files). No lint, typecheck, dependency installation, or build script exists. Do not invent successful checks.

For UI changes run the server and exercise the changed browser behavior. Check assets return 200 and inspect browser errors. Node's domain tests cover coverage corrections, source preservation, orphan handling, and diagram staleness. Add tests for new behavior, not duplicated implementation.

Preserve escaped output, keyboard-usable controls, explicit Jira write review, and a distinction between simulated and live behavior.
