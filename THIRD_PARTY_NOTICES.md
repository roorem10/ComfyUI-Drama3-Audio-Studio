# Third-party notices

This repository supplies its own browser frontend, ComfyUI route registration, and prompt compiler. It does not bundle the external inference engine, PyTorch, model weights, tokenizer, codec weights, or private recordings.

| External project/component | Role | Upstream license information |
| --- | --- | --- |
| [ComfyUI](https://github.com/Comfy-Org/ComfyUI) | Host application and server/frontend APIs | [ComfyUI LICENSE](https://github.com/Comfy-Org/ComfyUI/blob/master/LICENSE) |
| [ComfyUI-Drama3](https://github.com/PedroMarinhoDev/ComfyUI-Drama3) | Separate engine dependency, native ASR, memory offloading | [GPL-3.0 code license](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/blob/main/LICENSE); the project also identifies Fish Audio and Apache-2.0 components in its [NOTICE](https://github.com/PedroMarinhoDev/ComfyUI-Drama3/blob/main/NOTICE) |
| [Fish Audio Drama 3](https://huggingface.co/fishaudio/drama-3) and its codec | Speech-generation model | [Fish Audio Community License](https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE); see the actual model terms for uses and restrictions |
| [Converted Drama 3 files](https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI) | Required ComfyUI-format model files | Model repository identifies Fish Audio Community License |
| [Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) and [converted ASR files](https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI) | Optional reference transcription | [Converted model LICENSE](https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI/blob/main/LICENSE), identified as Apache-2.0 |
| [aiohttp](https://github.com/aio-libs/aiohttp) | HTTP support supplied by ComfyUI; route tests | [Apache-2.0](https://github.com/aio-libs/aiohttp/blob/master/LICENSE.txt) |

**Built with Fish Audio.** This project is independent and is not affiliated with or endorsed by the listed upstream projects.

The original workflow JSON was supplied as the basis for this frontend and is retained as a historical reference. Its notes link to upstream projects; that file is not a copy of their engine implementation. The UI screenshot was supplied for public documentation. The screenshot's audio filenames and script are illustrative; the recordings are not distributed here.

GPL-3.0-or-later applies to this frontend's code and does not relicense external model weights or grant additional rights to generated audio. Verify upstream terms before redistributing models or using them in a commercial or hosted service. Upstream licenses may have conditions beyond an ordinary permissive software license.
