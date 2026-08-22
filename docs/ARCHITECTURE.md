# ThothScript Architecture

ThothScript is intentionally small enough that a new contributor can understand the whole application without a framework-specific build system.

## Process model

ThothScript uses Electron's standard split-process model:

1. **Main process (`main.js`)**
   - owns native windows and menus;
   - owns filesystem access;
   - performs print/PDF work;
   - stores recovery data;
   - handles workspace search/replace;
   - exposes privileged operations only through IPC handlers.

2. **Preload bridge (`preload.js`)**
   - runs with context isolation enabled;
   - exposes a deliberately narrow `window.thoth` API;
   - is the security boundary between renderer UI and privileged Electron APIs.

3. **Renderer (`renderer.js`, `index.html`, `styles.css`)**
   - owns tabs, editor state, explorer UI, Markdown preview, command palette and local UI preferences;
   - does not receive direct Node.js access;
   - requests privileged operations through `window.thoth`.

## Security invariants

Changes should preserve these rules unless a reviewed design explicitly replaces them:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` for the primary renderer
- no direct `require()` or filesystem access from renderer code
- external navigation cannot replace the editor window
- renderer Content Security Policy remains restrictive
- IPC surface stays explicit and small
- workspace replacement makes backups before modifying files

## File/data flow

Opening a file follows this path:

`renderer action -> preload bridge -> IPC handler -> filesystem -> structured payload -> renderer tab`

Saving follows the reverse path:

`renderer tab -> preload bridge -> IPC handler -> filesystem`

This separation is intentional. Do not move filesystem calls into the renderer to save code.

## State

Renderer-local state includes:

- open tabs;
- active tab;
- current folder;
- recent files;
- sidebar preferences;
- Markdown preview state;
- command-palette state.

Local UI/session preferences use browser local storage. Unsaved recovery data is persisted by the main process in Electron's user-data directory.

## Workspace search and replace

Search walks the selected workspace while skipping common generated/VCS directories. Replacement is intentionally conservative:

- text-like files only;
- bounded file counts;
- backups created before writes;
- errors returned as structured IPC results.

Any future optimization must preserve backup-before-write behavior.

## Packaging

The project uses `@electron/packager` for a straightforward Windows x64 package. Packaging output is generated, not source, and must not be committed.

The GitHub Actions package workflow exists to give contributors a reproducible Windows test artifact without requiring every contributor to maintain a Windows packaging machine.

## Direction for v0.4+

The preferred evolution path is modularization without replacing the stable core all at once. Good candidates for extraction are:

- file-type/language detection;
- Markdown rendering/sanitization;
- search matcher construction;
- IPC payload validation;
- session/recovery serialization;
- commands and keyboard shortcuts.

Keep the textarea editor as the reliable fallback even if Monaco or another optional editor layer is introduced later.
