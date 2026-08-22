# Contributing to ThothScript

Thanks for your interest in improving ThothScript.

## Current contribution policy

ThothScript is being prepared for public development, but it does not yet use an open-source source-code contribution model. Until a project license and contributor terms are deliberately adopted, please **do not submit substantial source-code pull requests**.

The following contributions are welcome now:

- bug reports;
- reproducible test cases;
- documentation corrections;
- usability feedback;
- feature proposals;
- platform-compatibility reports;
- security reports through the process in `SECURITY.md`.

## Bug reports

Please include:

- ThothScript version;
- operating system and version;
- Node.js/npm version when running from source;
- exact reproduction steps;
- expected behavior;
- observed behavior;
- relevant console output or screenshots, with private information removed.

## Feature requests

Explain the problem first, then the proposed behavior. Small, composable changes are preferred over features that substantially increase editor complexity or undermine the stable fallback editing core.

## Development principles

Changes should preserve these project priorities:

1. Local-first desktop behavior.
2. Predictable file operations.
3. Recovery and safety before cleverness.
4. A stable lightweight editing core.
5. Clear separation between renderer UI and privileged filesystem operations.
6. No secrets, credentials, generated binaries, dependency folders, or local machine data in Git history.

## Pull requests

Source-code pull requests may be enabled later after licensing and contributor terms are finalized. At that point this document will be updated with branch, test, formatting, and review requirements.
