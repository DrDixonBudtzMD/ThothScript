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

Version 0.3.1 focuses on stability and recovery behavior:

- Clean-content printing instead of printing the application chrome
- Safety backups before workspace-wide replacement
- 16 MB edit guard for unusually large files
- Missing recent-file cleanup
- Automatic restore of saved sessions
- Recovery-data cleanup after all tabs are saved
- Safer Markdown links and keyboard-focus polish
- Additional sidebar-collapse fixes

## Requirements

- Node.js and npm
- A supported desktop environment for Electron

The project currently depends on Electron and electron-packager through `devDependencies`.

## Run from source

```bash
npm install
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
├── main.js       # Electron main process and filesystem/printing IPC
├── preload.js    # contextBridge API exposed to the renderer
├── renderer.js   # editor UI behavior
├── index.html    # application shell
├── styles.css    # application styling
└── package.json  # project metadata, scripts, dependencies
```

## Security model

The primary application window uses Electron context isolation with Node integration disabled. File operations are exposed through a limited preload bridge rather than exposing Node directly to renderer code.

ThothScript 0.3.1 still has security-hardening work scheduled before a general public binary release. In particular, the Electron runtime needs to be upgraded from the older 30.x dependency line and renderer sandbox compatibility needs to be tested before enabling sandboxing by default.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and release-security notes.

## Data and recovery

ThothScript stores recovery/session information in the application's user-data directory. Workspace-wide replacement creates safety backups before modifying files.

Users should still keep independent backups or version control for important work. Recovery features are a safety net, not a substitute for backups.

## Roadmap

Near-term work includes:

- Upgrade to a currently supported Electron release
- Test and enable Chromium renderer sandboxing where compatible
- Add reproducible dependency locking
- Automated smoke tests / CI
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
