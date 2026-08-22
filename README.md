# ThothScript Rewrite v0.3

This is the next stable milestone after v0.2.1.

## Fixes
- Explorer collapse now truly vanishes.
  - Layout becomes Rail + Editor.
  - No 5–8px ghost strip.
- Focus mode stays full-screen and exits with:
  - Esc
  - F11
  - floating Exit Focus button

## New in v0.3
- Recent Files section
- Session restore prompt
- Autosave recovery every 30 seconds
- Markdown file creation
- Markdown preview panel
- Better language/file type detection
- Command Palette (`Ctrl+Shift+P`)
- Better workspace search:
  - Find
  - Replace all
  - Regex
  - Match case
  - Whole word
- Workspace save/load continued
- Improved PDF export for Markdown

## Run
```bash
npm install
npm start
```

## Notes
This still intentionally uses a stable textarea editor core. Monaco should be added in v0.4 as an optional plugin layer, while keeping this stable fallback.


## v0.3.1 Stability Pass
- Clean-content printing instead of printing the application interface.
- Search-and-replace creates safety backups before modifying workspace files.
- 16 MB edit guard prevents huge binary/text files from freezing the renderer.
- Missing recent files are removed automatically.
- Saved sessions restore automatically; prompts are reserved for unsaved content.
- Recovery data clears after all tabs are saved.
- Safer Markdown links and keyboard focus polish.
- Extra hard collapse rules eliminate residual sidebar pixels.
