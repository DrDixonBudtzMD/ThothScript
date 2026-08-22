# Public Release Checklist

This checklist separates **public source visibility** from a **general public binary release**. The repository can be made public before every binary-release item is complete if the README clearly states the pre-release status and known limitations.

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
- [x] Dependency monitoring configured with Dependabot.
- [x] Accidental npm publication disabled with `private: true`.

## Source-release hardening

- [x] Generate, review, and commit `package-lock.json` so dependency resolution is reproducible.
- [x] Upgrade Electron from the unsupported 30.x line to supported Electron `^43.4.0`.
- [x] Replace deprecated `electron-packager` with `@electron/packager` `^20.3.0`.
- [x] Add automated source/dependency validation workflow for Windows and Linux.
- [x] Enforce the committed dependency graph in CI with `npm ci`.
- [x] Review Markdown/HTML rendering paths for obvious script injection and unsafe navigation behavior.
- [x] Add explicit navigation/window-open protections for external content.
- [x] Add a restrictive renderer Content Security Policy.
- [ ] Complete a clean runtime test after the Electron/toolchain upgrade.

## Electron hardening

- [x] `contextIsolation` enabled for the main application window.
- [x] `nodeIntegration` disabled for the main application window.
- [x] Renderer access to privileged operations routed through a preload bridge.
- [x] Renderer sandboxing enabled for the primary application window.
- [ ] Verify all editor/file workflows with renderer sandboxing enabled on Windows.
- [ ] Review IPC payload validation as the application grows; current handlers intentionally permit user-selected arbitrary filesystem paths because ThothScript is a desktop editor.
- [ ] Restrict or remove development-only menu items such as DevTools/reload in packaged production builds if appropriate.

## Build and release

- [x] Windows and Linux CI resolve the locked dependency graph and pass source syntax/package metadata checks.
- [x] `npm run check` succeeds in Windows and Linux CI.
- [ ] `npm start` succeeds from a fresh Windows clone.
- [ ] Windows x64 packaging succeeds.
- [ ] Smoke-test open/save/save-as/folder explorer/workspace restore.
- [ ] Smoke-test search/replace and verify safety backups.
- [ ] Smoke-test Markdown preview and external-link behavior.
- [ ] Smoke-test printing and PDF export.
- [ ] Verify recovery/session behavior after an intentional app interruption.
- [ ] Create a `v0.3.1` Git tag/release only after the tested commit is selected.
- [ ] Add release notes with known limitations.
- [ ] Decide whether distributed binaries will be code-signed.

## Public-source gate

Before changing repository visibility to Public:

- [x] No obvious credentials/secrets identified in the migration snapshot.
- [x] Ownership/copyright position documented.
- [x] README clearly marks the project as pre-release.
- [x] Security reporting instructions exist.
- [x] Reproducible dependency lock committed.
- [x] Main branch remains isolated from release-prep work by pull-request review.
- [ ] Final Windows/Linux `npm ci` CI run passes on the exact merge candidate.
- [ ] Review the final PR diff after that CI run.

A public **source repository** may be appropriate once the public-source gate is complete even if binary-release smoke tests remain open. Do not publish a general end-user binary as a stable release until the Build and release section is complete.

## Licensing decision

Before accepting substantial third-party source contributions, deliberately choose one of these paths:

1. **Open source** — adopt a recognized license such as MIT, Apache-2.0, GPL, etc.
2. **Source available / custom license** — permit selected uses while reserving others.
3. **Proprietary public-source** — keep source visible without granting broad reuse rights.

Until that decision is made, ThothScript remains under the copyright/use notice in `COPYRIGHT.md`, and substantial external code contributions should not be accepted.
