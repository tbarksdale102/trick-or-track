# Rendering

The app renders HTML strings into `#content`, with delegated document events in `app.js`. Match this architecture for small changes; introduce frameworks only as a separate deliberate task.

Escape dynamic HTML using the local `esc()` function, e.g. `${esc(r.title)}`. Treat requirement text and imported Jira values as untrusted display data. Use `textContent` for plain error messages. Preserve accessible labels, dialog controls, status regions, and disabled states during requests.

Sample correction dialogs must identify their local-only behavior. Real Jira creation must show a review step and require explicit submission.
