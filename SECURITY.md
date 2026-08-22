# Security Policy

ThothScript is currently pre-release software. Security reports are welcome, especially for issues involving filesystem access, IPC boundaries, Markdown rendering, navigation, printing/PDF generation, recovery data, or packaged Electron behavior.

## Supported versions

Only the latest development version on `main` is expected to receive security fixes before the first stable release.

## Reporting a vulnerability

Please do not publish exploit details in a public issue before a fix or mitigation is available. Use GitHub's private vulnerability reporting feature if it is enabled for the repository. If private reporting is unavailable, open a minimal issue stating that you have a security report and avoid including exploit details, secrets, personal data, or destructive proof-of-concept content.

## Current security posture

The primary application window uses Electron context isolation, disables renderer Node integration, enables Chromium sandboxing, and exposes privileged operations through a preload/contextBridge API. External navigation/window-opening is intercepted by the main process, and the renderer document includes a restrictive Content Security Policy.

ThothScript is a desktop editor and intentionally allows users to select and edit arbitrary local files. That capability is privileged by design. Renderer code should never receive unrestricted Node.js access as a shortcut around the preload/IPC boundary.

## Release expectations

Before a stable public binary release, the project should have:

- a committed dependency lockfile;
- clean-clone dependency and syntax validation;
- a Windows launch/package smoke test on the supported Electron line;
- validation of open/save/search/replace/recovery/Markdown/print/PDF workflows with sandboxing enabled;
- review of packaged-build behavior and signing strategy.

See `RELEASE_CHECKLIST.md` for the current gate status.
