# Trellis development workflow

Trellis 0.6.17 is configured for Codex development of Trick or Track. It is development tooling, not an application runtime dependency. Existing `npm start` and `npm test` work unchanged.

## Local prerequisites

Node.js 22+ (the app requirement) and Python 3.9+. Install the pinned CLI when you need upgrades or other CLI actions:

```sh
npm install -g @mindfoldhq/trellis@0.6.17
```

The committed scripts work without a global CLI. Run from the repository root (`python3` on Linux/macOS; `python` on Windows):

```sh
python3 .trellis/scripts/init_developer.py your-name
python3 .trellis/scripts/get_context.py
python3 .trellis/scripts/task.py list
```

Do not rerun init just to use an already configured checkout.

## Work on a feature

Read `AGENTS.md` and the relevant specs. Describe a feature to your coding agent; keep the PRD, acceptance criteria, implementation context, and review context in a Trellis task. Available skills include `trellis-start`, `trellis-brainstorm`, `trellis-continue`, and `trellis-finish-work`; exact invocation depends on the host. The task CLI can be used directly:

```sh
python3 .trellis/scripts/task.py create "Feature title" --slug feature-name
python3 .trellis/scripts/task.py add-context feature-name implement .trellis/spec/product/requirements.md "Product invariants"
python3 .trellis/scripts/task.py add-context feature-name check .trellis/spec/product/requirements.md "Verify invariants"
```

Add relevant frontend/backend specs to both manifests, write `prd.md`, validate with `task.py validate feature-name`, then `task.py start feature-name`. Keep secrets and real customer requirement data out of committed tasks and journals. Session/archive automatic commits are disabled so changes can be reviewed together.

## Optional Codex CLI hooks

Generated `.codex/` configuration includes native agents and hooks. Automatic injection has not been validated in this cloud chat. On supported Codex CLI versions, the installer documents user-level `features.hooks = true` (legacy `codex_hooks = true`) and a one-time `/hooks` review on Codex 0.129+. Enable these in your own trusted local setup if desired. Manual spec/context reading works without them; no global user configuration was changed here.

## Licensing and scope

Upstream Trellis is AGPL-3.0: https://github.com/mindfold-ai/Trellis/blob/main/LICENSE . Its generated tooling is versioned here; adoption does not assert that the application was relicensed. Review upstream licensing before redistributing the bundled tooling in a commercial product or embedding Trellis in a hosted service.

This setup adds no live Jira access or automated external writes.

## Export a requirement as a task

Open Requirements and select an RPM. In Implementation readiness, enter a delivery owner, measurable acceptance criteria (one per line), implementation scope and associated system. Source/revision and Requirement/Initiative links must also exist; resolve missing delivery links through the existing local reconciliation flow. Save the plan, review the export, then download the task ZIP.

Extract into this configured repository only after checking that `.trellis/tasks/<rpm>-r<revision>/` does not already exist. Read `IMPORT-INSTRUCTIONS.txt`, validate the task with the Trellis task CLI, and assign a developer before implementation. The export includes a PRD, task metadata, traceability data and implementation/review context manifests. It does not execute agents, modify Jira, or establish requirement verification. Use `python` instead of `python3` on Windows.

The export contains the local sample workspace text, owner and criteria. Review its contents before sharing; do not enter secrets or sensitive customer requirements.
