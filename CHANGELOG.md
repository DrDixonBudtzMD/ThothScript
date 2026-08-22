# Changelog

All notable project changes should be recorded here.

The project is still pre-1.0, so interfaces and behavior may change between minor releases.

## [Unreleased]

### Safety and diagnostics

- Added discard confirmation before closing dirty tabs.
- Added an unsaved-work warning when closing/reloading the application window.
- Added an in-app About / Diagnostics panel on the info rail button and `F1`.
- Diagnostics report preload-bridge status, open/dirty tab counts, preview state, platform, and user agent without exposing document contents.
- Added automated checks so the safety/diagnostics layer remains part of `npm run verify`.

### Community foundation

- Added `npm run doctor` project/environment diagnostics.
- Added a lightweight Node test suite for repository, lockfile and Electron security invariants.
- Added a combined `npm run verify` developer command.
- Expanded CI to run diagnostics, syntax checks and tests on Windows and Linux.
- Added a Windows x64 packaging workflow that uploads temporary test artifacts.
- Added architecture and development guides for new contributors.
- Added structured GitHub bug-report and feature-request templates.
- Expanded the README with clone-to-run, verification and test-build instructions.

### Public-release hardening

- Added a public-facing project README.
- Added security reporting guidance.
- Added contribution guidance.
- Added copyright/use notice while licensing remains undecided.
- Added GitHub Actions validation for Windows and Linux.
- Added Dependabot monitoring for npm and GitHub Actions dependencies.
- Upgraded Electron from the unsupported 30.x line to `^43.4.0`.
- Replaced deprecated `electron-packager` with `@electron/packager` `^20.3.0`.
- Enabled renderer sandboxing for the primary application window.
- Added external navigation/window-open restrictions.
- Added a restrictive Content Security Policy.
- Marked the npm package private to prevent accidental publication.

## [0.3.1] - 2026

### Stability

- Added clean-content printing instead of printing the application interface.
- Added safety backups before workspace-wide search-and-replace modifications.
- Added a 16 MB edit guard for unusually large files.
- Automatically removes missing recent files.
- Restores saved sessions automatically while reserving recovery prompts for unsaved content.
- Clears recovery data after all tabs are saved.
- Improved Markdown-link handling and keyboard focus behavior.
- Strengthened sidebar-collapse behavior to eliminate residual pixels.

## [0.3.0] - 2026

### Added

- Recent files.
- Session restore.
- Autosave recovery.
- Markdown file creation and preview.
- Improved language/file-type detection.
- Command palette.
- Workspace find and replace with regex, match-case, and whole-word options.
- Workspace save/load support.
- Improved Markdown PDF export.
- Focus-mode and sidebar behavior improvements.

## Earlier development

Versions before 0.3 were developed prior to the repository becoming the canonical project history. Historical ZIPs or local snapshots should not be represented as Git commits unless their original source state can be verified.
