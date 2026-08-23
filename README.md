# ThothScript

ThothScript is a lightweight desktop editor built with Electron for plain text, code, Markdown, and small workspace workflows.

> **Project status:** pre-release / active development  
> **Current version:** 0.3.1  
> **Primary development target:** Windows

## Open-source philosophy

ThothScript is licensed under **GPL-3.0-or-later**. Use it, study it, modify it, fork it, and contribute improvements. The GPL is intentional: distributed covered derivatives must preserve the same source-code freedoms instead of taking the shared code closed.

Open source does not mean abandoned ownership. Copyright remains with the applicable copyright holders, including contributors for their own contributions. Groundstate/ThothScript names, logos, artwork, and official-project identity are separate from the source-code license, so forks should not claim to be official Groundstate releases without permission.

See `LICENSE`, `COPYRIGHT.md`, and `CONTRIBUTING.md`.

## What it does

- Plain-text, code, and Markdown editing
- Multi-file tabs and recent files
- Folder explorer with collapsible sidebar
- Workspace save/load
- Find and workspace-wide search/replace with safety backups
- Regex, case-sensitive, and whole-word search modes
- Markdown preview and command palette
- Focus mode
- Autosave recovery and session restore
- Clean-content printing and PDF export
- Basic large-file guards

## Clone, verify, run

```bash
git clone https://github.com/DrDixonBudtzMD/ThothScript.git
cd ThothScript
npm ci
npm run verify
npm start
```

`npm run doctor`, `npm run check`, and `npm test` are also available individually.

## Windows test builds

The repository contains a Windows Package GitHub Actions workflow. Development artifacts are test builds, not code-signed stable releases. For a local package on Windows run `npm run package-win`.

## Requirements

- Node.js 22.12 or newer
- npm
- A supported Electron desktop environment

## Repository layout

```text
.github/          CI, package workflow, Dependabot, issue templates
docs/             architecture and development guides
scripts/          diagnostics / contributor tooling
tests/            Node tests and security invariants
main.js           Electron main process
preload.js        contextBridge API
renderer.js       editor UI behavior
index.html        application shell and CSP
styles.css        styling
```

## Security model

The primary window uses context isolation, disabled Node integration, renderer sandboxing, a narrow preload API, blocked unexpected navigation/window creation, and a restrictive Content Security Policy. See `SECURITY.md`.

## Automated checks

Pull requests to `main` run verification on Windows and Linux. Dependabot monitors npm and GitHub Actions dependencies, and application/package changes can trigger Windows packaging.

## Roadmap

Near-term work includes packaged Windows smoke testing, improved diagnostics, stronger IPC validation, signed releases, optional Monaco integration with the stable textarea fallback, and broader platform validation.

## Contributing

**Community source-code pull requests are welcome.** See `CONTRIBUTING.md` and `docs/DEVELOPMENT.md`. Maintainers review changes for scope, safety, maintainability, and compatibility with the project's GPL/open-development philosophy.

## Support

See `SUPPORT.md` for optional Patreon and PayPal support. Financial support does not purchase ownership, equity, IP rights, or special licensing rights.

## License and copyright

Source code is licensed under **GPL-3.0-or-later**. See `LICENSE` and `COPYRIGHT.md`. Third-party dependencies/assets remain under their own licenses.

## Changelog

See `CHANGELOG.md`.
