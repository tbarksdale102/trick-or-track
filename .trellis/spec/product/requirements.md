# Systems engineering product rules

Trick or Track is a local prototype. The traceability chain is government RPM → Requirement → Initiative → delivery Epics, with associated system architecture.

Preserve RPM identifier, original text, source reference, and revision. Creating an Initiative requires a Requirement first. Reject invalid Epic parent assignments without mutating records. Corrections should be idempotent. Architecture staleness is determined by the captured system source revision.

Sample workspace actions affect browser data only. Imported Jira tickets are separate. Real ticket writes require explicit user review; configured automatic writes require explicit rules. Unknown or ambiguous mappings stay review-only.

Current limits: no real repository scanning, government document parsing, multi-user collaboration, production deployment. Trellis also supports a local reviewed task ZIP export from requirement details.

Task export requires source/revision, Requirement and Initiative links, delivery owner, acceptance criteria, registered system and scope. Export preserves trace identifiers and does not change requirement verification or Jira status. Plans persist in existing browser state; legacy records without a plan stay readable. Task packages contain no credentials and must not overwrite existing tasks on import.

GitHub reference links are local traceability records, independently keyed by repository identity, type and reference identifier/path. Linking, unlinking and import must not mutate Jira or requirement verification status. GitHub tokens are transient and excluded from snapshots and Trellis exports. Real file inventory is available; automatic architecture inference remains unsupported.
