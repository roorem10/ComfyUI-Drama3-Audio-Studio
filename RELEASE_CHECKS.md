# Release checks — 0.1.0

Checks for this public preservation package were performed on October 21, 2026. This report distinguishes source/distribution checks from actual model execution.

## Source/distribution checks

- The 13 existing graph-compiler tests cover Solo/Dialogue wiring, old/current ASR schema inputs, typed transcripts without ASR, mixed transcript modes, saved voices, optional save outputs, and validation failures.
- Four HTTP integration tests exercise the real Python page/asset handlers with only ComfyUI's route registry stubbed. They check page aliases, allowed assets, access rejection for arbitrary file names, and the absence of an extra generation endpoint.
- JavaScript parser checks cover the frontend, compiler, and menu extension. Python source is parsed without importing a real model runtime.
- Release validation checks repository-root layout, README's screenshot path, other relative Markdown links, JSON metadata, and exclusion of local context markers and model/audio binaries.
- ZIP creation validates every archived source member against its SHA-256 manifest and runs the archive's CRC check.

These checks do not execute GPU inference. See the real-world notes in README and docs/SOURCES.md. The original tester confirmed a menu launch and successful single-voice generation after disabling pinned memory. A frontend screenshot was supplied. Automated browser visual QA was not completed in the preparation environment.

## Reproduce

```bash
node --test tests/graph.test.cjs
python tests/routes.test.py
python scripts/check_release.py
python scripts/build_release.py
```

Runtime versions used for these source checks are recorded below by the preparation process. They are not the unknown runtime versions from the owner's Windows inference environment.

- Python: `3.12.14`
- Node.js: `v24.19.0`
