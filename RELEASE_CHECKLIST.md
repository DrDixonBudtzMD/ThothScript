# Public Release Checklist

This checklist separates **source visibility** from a **general public binary release**. The repository can be made public before every binary-release item is complete, provided the README clearly states the pre-release status and known limitations.

## Repository readiness

- [x] Default branch is `main`.
- [x] Repository remains private during release preparation.
- [x] `.gitignore` excludes dependencies, builds, logs, local environment files, and common editor/OS noise.
- [x] Public-facing README added.
- [x] Security reporting policy added.
- [x] Contribution policy added.
- [x] Changelog added.
- [x] Copyright/use position documented without accidentally granting an open-source license.
- [x] Existing source reviewed for obvious embedded credentials/secrets before public release preparation.

## Source-release blockers / follow-up

- [ ] Generate and commit `package-lock.json` using a trusted local npm install so dependency resolution is reproducible.
- [ ] Upgrade Electron from the 30.x dependency line to a currently supported release.
- [ ] Re-test the application after the Electron upgrade.
- [ ] Review all IPC handlers for strict validation of filesystem paths and payload shapes.
- [ ] Review Markdown/HTML rendering paths for injection and unsafe navigation behavior.
- [ ] Add automated syntax/smoke checks.

## Electron hardening

- [x] `contextIsolation` enabled for the main application window.
- [x] `nodeIntegration` disabled for the main application window.
- [x] Renderer access to privileged operations is routed through a preload bridge.
- [ ] Test application behavior with renderer sandboxing enabled.
- [ ] Enable sandboxing if testing confirms preload/file workflows remain functional.
- [ ] Restrict or remove development-only menu items such as DevTools/reload in packaged production builds if appropriate.
- [ ] Add explicit navigation/window-open protections for unexpected external content.
- [ ] Add or verify an appropriate Content Security Policy for renderer content.

## Build and release

- [ ] Clean install from a fresh clone succeeds.
- [ ] `npm start` succeeds from a fresh clone.
- [ ] Windows x64 packaging succeeds.
- [ ] Smoke-test open/save/save-as/folder explorer/workspace restore.
- [ ] Smoke-test search/replace and verify safety backups.
- [ ] Smoke-test Markdown preview, printing, and PDF export.
- [ ] Verify recovery/session behavior after an intentional app interruption.
- [ ] Create a `v0.3.1` Git tag/release only after the tested commit is selected.
- [ ] Add release notes with known limitations.
- [ ] Decide whether distributed binaries will be code-signed.

## Licensing decision

Before accepting substantial third-party source contributions, deliberately choose one of these paths:

1. **Open source** — adopt a recognized license such as MIT, Apache-2.0, GPL, etc.
2. **Source available / custom license** — permit selected uses while reserving others.
3. **Proprietary public-source** — keep source visible without granting broad reuse rights.

Until that decision is made, ThothScript remains under the copyright/use notice in `COPYRIGHT.md`, and substantial external code contributions should not be accepted.
