# Runtime validation

The project is JavaScript, not TypeScript. Validate external payloads at boundaries and use existing domain validators rather than casts or assumptions.

For example `importRpm(state, input)` rejects duplicate identifiers; `connection(input)` checks Jira deployment and HTTPS URL constraints. Do not add a nominal typecheck command that cannot check this code. Schema changes must consider stored browser data, backend payloads, and mocked API tests together.
