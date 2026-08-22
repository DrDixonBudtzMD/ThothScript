# Developing ThothScript

## Prerequisites

- Node.js 22.12 or newer
- npm
- Git
- Windows, Linux or macOS for source work
- Windows for the current packaged-release target

## First run

```bash
git clone https://github.com/DrDixonBudtzMD/ThothScript.git
cd ThothScript
npm ci
npm run doctor
npm run check
npm test
npm start
```

`npm ci` is preferred because the repository commits `package-lock.json` and CI uses the same locked graph.

## Useful commands

```bash
npm run doctor      # verify local project structure/toolchain assumptions
npm run check       # JavaScript syntax checks
npm test            # lightweight Node test suite
npm start           # run ThothScript from source
npm run package-win # package Windows x64 build locally
```

## Branch workflow

Do not develop directly on `main`.

```bash
git switch main
git pull
git switch -c feature/my-change
```

Keep commits focused and use meaningful messages, for example:

```text
feat: add editor setting
fix: preserve recovery state after save failure
test: cover workspace matcher
docs: explain preload bridge
```

## Before opening a pull request

Run:

```bash
npm ci
npm run doctor
npm run check
npm test
```

If the change affects packaging, also run `npm run package-win` on Windows or use the Windows package workflow artifact from GitHub Actions.

## What to test manually

Changes touching the editor or IPC should be checked against:

- open file;
- save and save-as;
- open folder/explorer navigation;
- recent files;
- workspace save/load;
- search and replace;
- replace backup creation;
- Markdown preview;
- print and PDF export;
- focus mode and sidebar collapse;
- recovery/session restore.

## Security-sensitive areas

Treat changes to these files as security-sensitive:

- `main.js`
- `preload.js`
- `index.html` CSP
- Markdown rendering/link handling
- filesystem/search/replace IPC
- print/PDF windows

See `SECURITY.md` and `docs/ARCHITECTURE.md` before changing the renderer/main-process boundary.

## Generated files

Do not commit:

- `node_modules/`
- packaged `dist/`, `out/`, `release/` directories
- executables/installers
- `.env` files
- local logs/caches

## Current project philosophy

ThothScript favors a small, understandable, local-first desktop editor over a large dependency stack. New features should remain optional and composable where possible. Stability, recovery and predictable file behavior take priority over novelty.
