# Changelog

## 0.1.0 — 2026-10-21

Initial public preservation package.

- Preserve the local Drama 3 browser interface, schema-aware prompt compiler, project/take handling, and Extensions menu launcher.
- Place the installable ComfyUI add-on at the repository root to avoid nested-folder installation mistakes.
- Add the supplied frontend screenshot to README using a repository-relative image path.
- Replace private handoff instructions with a public installation guide, actual model download links, verified hardware requirements, and a documented first test.
- Record the pinned host-memory failure and the `--disable-pinned-memory` workaround that allowed generation on the original RTX 5080/32 GB RAM test system.
- Include source/version references, license, notices, tests, release packaging, issue-report guidance, and GitHub publishing instructions.

The preservation packaging does not change the speech-generation algorithm, model weights, frontend generation settings, or voice-cloning quality. Initial real-world testing established single-voice audio generation; the broader feature set still needs wider testing.
