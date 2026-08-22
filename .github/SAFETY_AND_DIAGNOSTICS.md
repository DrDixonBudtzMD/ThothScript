# Safety and Diagnostics Verification

This note documents the v0.4 safety/diagnostics additions for reviewers and testers.

## Unsaved-work protection

- Closing a dirty tab prompts before discarding unsaved changes.
- Closing or reloading the application window triggers a browser/electron unsaved-work warning when dirty tabs are present.
- Saved tabs continue to close normally without an extra prompt.

## Diagnostics

Use either the info button in the left rail or `F1` to open the diagnostics panel.

The panel reports only application/runtime metadata such as bridge status, open/dirty tab counts, preview state, user agent, and platform. It does not display or transmit document contents.

## Verification

Run:

```bash
npm ci
npm run verify
```

The Windows packaging workflow also runs the same verification before creating the packaged application artifact.
