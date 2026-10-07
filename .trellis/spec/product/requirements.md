# Systems engineering product rules

Trick or Track is a local prototype. The traceability chain is government RPM → Requirement → Initiative → delivery Epics, with associated system architecture.

Preserve RPM identifier, original text, source reference, and revision. Creating an Initiative requires a Requirement first. Reject invalid Epic parent assignments without mutating records. Corrections should be idempotent. Architecture staleness is determined by the captured system source revision.

Sample workspace actions affect browser data only. Imported Jira tickets are separate. Real ticket writes require explicit user review; configured automatic writes require explicit rules. Unknown or ambiguous mappings stay review-only.

Current limits: no real repository scanning, government document parsing, multi-user collaboration, production deployment, or Trellis task export UI. Trellis adoption is a development workflow, not a new application feature.

For a future export feature, define acceptance criteria and identifier mapping before implementation; do not assume Trellis specs are certification or verification evidence.
