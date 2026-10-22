# Drama 3 Audio Studio v0.1.0

A local ComfyUI browser frontend for Fish Audio Drama 3, preserved with source, a UI screenshot, installation instructions, model download links, and hardware requirements.

Features include voice-reference uploads, Solo/Dialogue script controls, optional ASR, model settings, playback/downloads, project save/load, saved-voice reuse, recent takes, and **Extensions → Open Audio Studio**.

Extract the release ZIP and copy its `drama3_audio_studio` folder into the `custom_nodes` directory of the ComfyUI instance you run. Install the separate PedroMarinhoDev/ComfyUI-Drama3 engine and compatible model files as described in README. Start or restart ComfyUI and leave it running.

**Read the hardware section before downloading models.** Upstream RAM estimates are approximately 32 GB for W4, 40 GB for W6, and 48 GB for FP8/INT8, with an NVIDIA 8 GB VRAM baseline for the offload configuration. These are not guarantees. A Windows RTX 5080/32 GB RAM test needed `--disable-pinned-memory`; system RAM reached approximately 98% during a generation screenshot.

Single-voice generation and menu launch were confirmed. Voice resemblance was reported as poor in the initial test, and broader features have not all been tested end to end. No model weights, personal reference recordings, or private generated audio are bundled.

Built with Fish Audio. Frontend code: GPL-3.0-or-later; external models and components retain their upstream licenses.
