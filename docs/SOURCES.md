# Reviewed sources and versions

Documentation review date: **October 21, 2026**. Source facts are summarized in README; external sources are authoritative for their current requirements and licenses.

## Engine

- Repository: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Reviewed commit: `67a733a96890637dc27b1914974ad00c569405fb`
- Commit date: `2026-10-17T12:56:49Z`
- [Fixed-version engine source ZIP](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/archive/67a733a96890637dc27b1914974ad00c569405fb.zip)
- [Reviewed README and requirements](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/blob/67a733a96890637dc27b1914974ad00c569405fb/README.md)
- [Reviewed pinned-memory fallback](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/blob/67a733a96890637dc27b1914974ad00c569405fb/drama3/offload.py)
- [Reviewed loader and model initialization](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/blob/67a733a96890637dc27b1914974ad00c569405fb/drama3/loader.py)

The engine's `pinned` function checks ComfyUI's `DISABLE_PINNED_MEMORY`. The expert session also checks it before selecting its direct host-memory kernel path. This is the reviewed basis for recommending the existing startup flag for the recorded pinned-allocation failure, rather than editing the engine or claiming that reducing the VRAM cache fixes host pinning.

A source review is not a hardware test. The exact commit installed on the original tester's machine was not captured. Do not describe this source commit as a verified reproduction of that entire environment.

## Model repositories

- [PedroMarinhoDev/Drama-3-ComfyUI](https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI)
  - Reviewed revision: `681e2fae64af1f12e64b9c19c82930a5f3bba1a4` ([fixed tree](https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI/tree/681e2fae64af1f12e64b9c19c82930a5f3bba1a4)).
- [PedroMarinhoDev/Qwen3-ASR-ComfyUI](https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI)
  - Reviewed revision: `6ad8c9be026925839479a8d97749068a4202fbe9` ([fixed tree](https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI/tree/6ad8c9be026925839479a8d97749068a4202fbe9)).
- [fishaudio/drama-3](https://huggingface.co/fishaudio/drama-3)
  - Reviewed revision: `b2b5ee998034b2975720906c815e7fb0e9f007bd` ([fixed tree](https://huggingface.co/fishaudio/drama-3/tree/b2b5ee998034b2975720906c815e7fb0e9f007bd)).

The converted Drama 3 repository is maintained by the ComfyUI node author, not Fish Audio's original model publisher. It supplies the compatible `.safetensors` conversion, per-format size/RAM estimates, and codec. The original Fish Audio model page provides attribution and original model/license context. Do not substitute original checkpoint files for the conversion without following the engine's conversion instructions.

ASR size and placement information comes from the converted Qwen3-ASR model card. Its optional aligner belongs to word-timing/editor workflows and is not required for this Studio.

Machine-readable revisions and file inventories are in [UPSTREAM_VERSIONS.json](UPSTREAM_VERSIONS.json). File inventories are metadata only, not copies of model weights or proof of downloaded-byte verification. No model weight hashes were computed locally because the multi-gigabyte weights were not downloaded here.

## ComfyUI primary documentation

- [Windows Desktop installation](https://docs.comfy.org/installation/desktop/windows)
- [Windows Portable installation](https://docs.comfy.org/installation/comfyui_portable_windows)
- [Manual installation](https://docs.comfy.org/installation/manual_install)
- [Desktop instance management / Startup Args](https://docs.comfy.org/installation/desktop/usage/manage#startup-args-tab)
- [Startup flags, including --disable-pinned-memory](https://docs.comfy.org/development/comfyui-server/startup-flags)
- [Extension menu registration](https://docs.comfy.org/custom-nodes/js/javascript_topbar_menu)

## Memory semantics

[PyTorch CUDA notes: pinned host memory](https://docs.pytorch.org/docs/stable/notes/cuda.html#use-pinned-memory-buffers) distinguish page-locked CPU memory from ordinary pageable RAM. The recorded traceback ended at a pinned host allocation. The generic CUDA error wording is not sufficient to call that a full-dedicated-VRAM failure.

## Known scope of observations

The owner confirmed the menu launcher and single-voice generation worked after the startup-flag change. The public UI screenshot is from that testing session. The owner also reported poor similarity to their reference voice. No human listening comparison was completed by the release preparer. Reported memory values came from screenshots, not a profiler, and represent snapshots rather than peak measurements.

The frontend code is preserved from the working build; this release reorganizes the install layout and documentation. Model files, the engine implementation, user-specific error logs, and voice recordings are not vendored.
