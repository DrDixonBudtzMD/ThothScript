# ThothScript

ThothScript is a lightweight desktop editor built with Electron for plain text, code, Markdown, and small workspace workflows. It is designed around a stable textarea-based editing core with practical desktop features rather than a browser-only editing experience.

> **Project status:** pre-release / active development  
> **Current version:** 0.3.1  
> **Primary development target:** Windows  
> **macOS/Linux:** not yet release-tested

## What it does

ThothScript currently includes:

- Plain-text, code, and Markdown editing
- Multi-file tabs and recent files
- Folder explorer with a fully collapsible sidebar
- Workspace save/load
- Find and workspace-wide search
- Search-and-replace with automatic safety backups
- Regex, case-sensitive, and whole-word search modes
- Markdown preview
- Command palette
- Focus mode
- Autosave recovery and session restore
- Clean-content printing
- PDF export
- Basic large-file guards to reduce accidental renderer freezes

## v0.3.1 stability pass

Version 0.3.1 focuses on stability, recovery, and public-release hardening:

- Clean-content printing instead of printing the application chrome
- Safety backups before workspace-wide replacement
- 16 MB edit guard for unusually large files
- Missing recent-file cleanup
- Automatic restore of saved sessions
- Recovery-data cleanup after all tabs are saved
- Safer Markdown links and keyboard-focus polish
- Additional sidebar-collapse fixes
- Electron upgraded to the supported 43.x release line
- Chromium renderer sandbox enabled for the primary window
- External navigation blocked from replacing the editor window
- Content Security Policy added to the renderer document

## Requirements

- Node.js 22.12 or newer
- npm
- A supported desktop environment for Electron

The project uses Electron `^43.4.0` and `@electron/packager` `^20.3.0` as development dependencies. Dependency resolution is pinned by the committed `package-lock.json`.

## Run from source

```bash
npm ci
npm run check
npm start
```

## Package for Windows

```bash
npm run package-win
```

The packaging script currently targets Windows x64. Packaged output is intentionally excluded from Git with `.gitignore`.

## Repository layout

```text
ThothScript/
├── .github/          # CI and dependency monitoring
├── main.js           # Electron main process and filesystem/printing IPC
├── preload.js        # contextBridge API exposed to the renderer
├── renderer.js       # editor UI behavior
├── index.html        # application shell and CSP
├── styles.css        # application styling
├── package.json      # project metadata, scripts, dependencies
└── package-lock.json # reproducible dependency graph
```

## Security model

The primary application window uses:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- a narrow preload/contextBridge API for privileged operations
- explicit interception of unexpected navigation/window-open requests
- a Content Security Policy that limits renderer resource loading

Filesystem, printing, PDF, recovery, and workspace operations remain in the Electron main process and are invoked through IPC.

These controls reduce renderer privilege; they do not replace runtime testing. The sandboxed build still needs a clean Windows launch and feature smoke test before a general binary release.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and release-security notes.

## Data and recovery

ThothScript stores recovery/session information in the application's user-data directory. Workspace-wide replacement creates safety backups before modifying files.

Users should still keep independent backups or version control for important work. Recovery features are a safety net, not a substitute for backups.

## Automated checks

The repository includes GitHub Actions validation for Windows and Linux. CI installs the exact dependency graph from `package-lock.json` with `npm ci` and runs JavaScript syntax and package-metadata checks. Dependabot monitors npm and GitHub Actions dependencies.

## Roadmap

Near-term work includes:

- Complete clean-clone Windows launch and packaging tests
- Smoke-test open/save/search/replace/recovery/Markdown/print/PDF workflows with sandboxing enabled
- Signed release builds
- Optional Monaco editor layer while retaining the stable textarea fallback
- Broader Windows/macOS/Linux validation

## Contributing

The project is being prepared for public development, but source-code contributions are not yet being accepted under an open-source contribution model. Bug reports, reproducible test cases, documentation corrections, and feature discussions are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License and copyright

No open-source license has been granted for ThothScript at this time. Public visibility on GitHub does **not** by itself grant permission to copy, redistribute, modify, sublicense, or commercially exploit the project beyond rights provided by applicable law and GitHub's platform terms.

See [COPYRIGHT.md](COPYRIGHT.md) for the current project notice. A deliberate open-source or commercial licensing model may be adopted later.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
