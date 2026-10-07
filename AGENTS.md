<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

# Trick or Track local conventions

- Read `.trellis/spec/product/requirements.md` and the relevant frontend/backend specs.
- Use the existing checkout in isolated cloud tasks; do not create worktrees unless the user asks.
- Keep `.runtime/`, credentials, developer identity, and session pointers out of Git.
- Respect the user's existing authorization for commits/pushes; do not ask for duplicate approval solely because a Trellis template suggests it. Otherwise keep remote writes within the requested scope.
- Hooks and subagents depend on the host's capabilities. If unavailable, read specs and task context directly and work inline. Do not require hook approval to make progress.
- Run `npm test`; validate actual browser/HTTP behavior for affected flows.
