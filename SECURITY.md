# Security Policy

## Supported status

ThothScript is currently pre-release software. Version 0.3.1 is suitable for development and testing, but it should not yet be treated as a hardened production editor for sensitive or untrusted content.

## Current security posture

The main Electron window uses:

- `contextIsolation: true`
- `nodeIntegration: false`
- a preload bridge that exposes a limited application API

Known hardening work before a general public binary release includes:

- upgrading from the Electron 30.x dependency line to a currently supported Electron release;
- testing renderer sandbox compatibility and enabling sandboxing where practical;
- adding dependency locking and automated dependency/security checks;
- reviewing IPC argument validation for filesystem operations;
- adding automated smoke tests for file open/save, workspace search/replace, printing, and PDF export;
- producing signed/reproducible release artifacts.

## Reporting a vulnerability

Please do not publish exploit details, private file paths, credentials, or proof-of-concept payloads in a public issue.

If GitHub Private Vulnerability Reporting is enabled for this repository, use **Security → Report a vulnerability**. If that option is not available, open a minimal issue stating that you have a security report and need a private reporting channel, without including sensitive technical details.

A useful report should include:

- affected ThothScript version;
- operating system;
- clear reproduction steps;
- expected vs. observed behavior;
- impact assessment;
- whether untrusted content or user interaction is required.

## Security assumptions

ThothScript is a local desktop editor with intentional filesystem access selected by the user. Opening, saving, searching, or replacing files can modify local data. Users should maintain independent backups or version control for important work.

Do not treat autosave recovery or replace-backups as a complete backup system.
