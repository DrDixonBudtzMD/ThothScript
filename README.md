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

## Clone, verify, run

ThothScript now includes a contributor-facing diagnostic and lightweight test suite so a clean checkout can be verified before launching the desktop app.

```bash
git clone https://github.com/DrDixonBudtzMD/ThothScript.git
cd ThothScript
npm ci
npm run doctor
npm run check
npm test
npm start
```

Or run the full non-GUI verification chain with:

```bash
npm run verify
```

`npm run doctor` checks the expected source tree, Node version, package metadata, lockfile alignment, Electron/packager declarations, and other project assumptions. It is intended to make environment problems obvious before debugging the application itself.

## Windows test builds

The repository contains a **Windows Package** GitHub Actions workflow. Pull requests that affect application/package files build a Windows x64 artifact after verification, and maintainers can run the workflow manually at any time.

These artifacts are development/test builds, not code-signed stable releases. They exist so testers can try a reproducible packaged application without building it themselves.

For a local package on Windows:

```bash
npm run package-win
```

## Requirements

- Node.js 22.12 or newer
- npm
- A supported desktop environment for Electron

The project uses Electron `^43.4.0` and `@electron/packager` `^20.3.0` as development dependencies. Dependency resolution is pinned by the committed `package-lock.json`.

## Repository layout

```text
ThothScript/
├── .github/          # CI, package workflow, Dependabot, issue templates
├── docs/             # architecture and development guides
├── scripts/          # project diagnostics / contributor tooling
├── tests/            # lightweight Node tests and security invariants
├── main.js           # Electron main process and filesystem/printing IPC
├── preload.js        # contextBridge API exposed to the renderer
├── renderer.js       # editor UI behavior
├── index.html        # application shell and CSP
├── styles.css        # application styling
├── package.json      # project metadata and commands
└── package-lock.json # reproducible dependency graph
```

For an architectural map, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). For a contributor walkthrough, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Security model

The primary application window uses:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- a narrow preload/contextBridge API for privileged operations
- explicit interception of unexpected navigation/window-open requests
- a Content Security Policy that limits renderer resource loading

Filesystem, printing, PDF, recovery, and workspace operations remain in the Electron main process and are invoked through IPC.

The automated test suite also checks that core Electron isolation controls and the renderer CSP remain present, so accidental security regressions are caught in CI.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and release-security notes.

## Data and recovery

ThothScript stores recovery/session information in the application's user-data directory. Workspace-wide replacement creates safety backups before modifying files.

Users should still keep independent backups or version control for important work. Recovery features are a safety net, not a substitute for backups.

## Automated checks

Every pull request to `main` runs on Windows and Linux and performs:

```text
npm ci
npm run doctor
npm run check
npm test
```

Dependabot monitors npm and GitHub Actions dependencies. Application/package changes also trigger a Windows packaging job that uploads the packaged application as a temporary Actions artifact.

## v0.4 community-foundation work

The current development cycle is focused on making the repository useful to people other than its original developer:

- self-diagnostic `npm run doctor` command
- built-in Node test suite
- explicit architecture documentation
- clone-to-run development instructions
- structured bug and feature-request templates
- reproducible Windows package artifacts in GitHub Actions
- stronger CI gates around security-sensitive Electron configuration

The editor remains intentionally small while the surrounding engineering/release structure becomes more professional.

## Roadmap

Near-term work includes:

- complete Windows runtime smoke tests against packaged artifacts
- smoke-test open/save/search/replace/recovery/Markdown/print/PDF workflows with sandboxing enabled
- expose clearer in-app About/diagnostics information
- improve IPC input validation
- signed release builds
- optional Monaco editor layer while retaining the stable textarea fallback
- broader Windows/macOS/Linux validation

## Contributing

Bug reports, reproducible test cases, documentation corrections, usability feedback and feature discussions are welcome. Substantial third-party source-code contributions remain intentionally limited until the project adopts explicit licensing/contributor terms.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## License and copyright

No open-source license has been granted for ThothScript at this time. Public visibility on GitHub does **not** by itself grant permission to copy, redistribute, modify, sublicense, or commercially exploit the project beyond rights provided by applicable law and GitHub's platform terms.

See [COPYRIGHT.md](COPYRIGHT.md) for the current project notice. A deliberate open-source or commercial licensing model may be adopted later.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
