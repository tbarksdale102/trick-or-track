# Backend development

## Pre-development checklist
Read [architecture and safety](architecture.md) and [product rules](../product/requirements.md).

## Architecture
Native Node.js ES modules and built-in HTTP/fs/crypto APIs. Node.js 22+; no third-party runtime dependencies. See [architecture and safety](architecture.md).

## Quality check
Run `npm test`. Exercise changed HTTP routes locally with the required Host, Origin, and JSON headers. Jira tests use mocked requests; live Jira calls require explicit user authorization and configuration.
