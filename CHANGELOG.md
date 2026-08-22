# Changelog

All notable project changes should be recorded here.

The project is still pre-1.0, so interfaces and behavior may change between minor releases.

## [Unreleased]

### Public-release preparation

- Added a public-facing project README.
- Added security reporting guidance.
- Added contribution guidance.
- Added copyright/use notice while licensing remains undecided.
- Documented Electron runtime and sandbox hardening work required before a general public binary release.

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
