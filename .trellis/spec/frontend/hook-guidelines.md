# Events and asynchronous operations

There are no React hooks. `app.js` delegates click/input/submit events; Jira modules attach form and dialog handlers.

Use `AbortController` for cancellable imports. Disable duplicate submissions while work is in progress; restore controls in `finally`. Pagination must terminate and reject repeated tokens. Preserve the previous complete import if a request fails or is cancelled. Clear manual token input after use; never put credentials in localStorage, IndexedDB, or task files.
