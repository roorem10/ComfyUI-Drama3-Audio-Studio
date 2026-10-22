# Development and preservation

The repository root is the installable ComfyUI add-on. Do not introduce a second nested `drama3_audio_studio` package when creating a public source ZIP.

## Source layout

| Path | Purpose |
| --- | --- |
| `__init__.py` | Registers the Studio page and explicitly allowed assets with ComfyUI |
| `extension/audio_studio.js` | Registers Extensions → Open Audio Studio |
| `web/index.html`, `web/style.css`, `web/app.js` | Browser interface |
| `web/graph.js` | Pure, schema-aware prompt compiler |
| `examples/Audio_AI_TTS.workflow.json`, `web/workflow.json` | Original historical graph, preserved without conversion |
| `docs/images/audio-studio.png` | Screenshot displayed in README |
| `tests` | Graph tests and route integration checks |
| `scripts` | Release validation and deterministic ZIP packaging |

## Run checks

Only developers need Node.js. Use a recent Node.js supporting the built-in test runner (the checks were run on the version recorded in `RELEASE_CHECKS.md`). Python route tests need `aiohttp`; this is already a ComfyUI dependency. In a separate development environment, install it with your environment's `python -m pip install aiohttp`.

From this repository's root, run:

```bash
node --test tests/graph.test.cjs
python tests/routes.test.py
python scripts/check_release.py
```

Do not run an arbitrary system Python to install packages into a Desktop-managed ComfyUI installation. Use its managed environment/terminal for engine work.

Tests cover the prompt graph and the add-on's actual HTTP route handlers with ComfyUI's registry stubbed. They do not load a model, benchmark a GPU, or prove voice resemblance. No fake speech generator or silent-audio demo server is shipped as the application.

## Create a release ZIP

```bash
python scripts/build_release.py
```

This validates release contents and writes a ZIP in `dist` with one top-level folder, `drama3_audio_studio`. The script also includes a SHA-256 manifest of every project file in the archive. It does not include model weights, personal recordings, browser settings, Git metadata, or local build caches.

The release script packages only the explicit application/documentation/test paths maintained in its allowlist. Update that list deliberately when adding files. Runtime output belongs outside the repository.

## Changes and compatibility

Keep the existing `/drama3-audio-studio` route and `Drama3AudioStudio.Open` command stable. Schema changes should fail with an explanation rather than silently send incorrect model inputs. Preserve the manual-transcript path so ASR remains optional. Do not send a global interrupt when cancelling one client's job.

For a regression report, record exact ComfyUI, engine, PyTorch, and GPU/driver versions. Keep the upstream commit review date separate from real-world tested versions.

Do not commit voice samples or raw diagnostics containing personal paths or tokens. The published screenshot was explicitly supplied for inclusion; additional screenshots need the contributor's permission.
