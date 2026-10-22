# Put this project on GitHub

This archive is prepared for public release. Creating or uploading a GitHub repository is a separate action; no repository was created by preparing these files.

## Publish the source through GitHub's website

1. Extract the release ZIP. Open the `drama3_audio_studio` folder containing `README.md`, `LICENSE`, `__init__.py`, `web`, `extension`, `docs`, and the other source files.
2. Sign in to GitHub and create a new repository. A suggested name is **ComfyUI-Drama3-Audio-Studio**. Choose **Public** if you want public preservation.
3. Leave GitHub's initial README, license, and .gitignore options unchecked: this project already supplies them.
4. On the empty repository page, choose **uploading an existing file**, or use **Add file → Upload files** if the repository already has files.
5. Drag the **contents of the extracted folder** into the upload area. Do not upload only the ZIP and do not put all the source inside another `drama3_audio_studio` directory on GitHub. `README.md` and `__init__.py` should be at the repository root.
6. Check that `docs/images/audio-studio.png` was uploaded with the folders intact. The README refers to this relative path, so its screenshot needs to stay there.
7. Enter a commit message such as **Initial public preservation release**, then commit the files.
8. Open the repository's main page and confirm that the README and screenshot render and that the model/download links are clickable.

File explorers may hide `.gitignore`, `.gitattributes`, and `.github`. Enable hidden-file display if you want to select them during upload. The application can run without the issue-template directory, but keep these files in the published repository for the complete prepared project.

## Add a release download

On GitHub, open **Releases → Draft a new release**. Create the tag **v0.1.0**, choose a release title, and use `RELEASE_NOTES.md` as the release description. Attach the original prepared release ZIP. Its internal folder can be copied directly into `custom_nodes`.

GitHub's automatically generated Source code ZIP is another installation route: extract it, rename the directory containing `__init__.py` to `drama3_audio_studio`, and follow README. GitHub repository metadata and Git history are not inside the manually prepared release ZIP.

Keep the README, screenshot, LICENSE, source, tests, and sources/version record in the repository, not only in a release attachment. That makes the project easier to inspect, fork, archive, and repair.

Suggested repository description:

> Local browser frontend for Fish Audio Drama 3 in ComfyUI: voice references, solo/dialogue scripts, playback, project save/load, and documented hardware requirements.

Suggested topics: `comfyui`, `comfyui-custom-node`, `drama3`, `text-to-speech`, `voice-cloning`, `local-ai`.

## Maintainer notes

The supplied project license is GPL-3.0-or-later. Check the included third-party notices and retain attribution. Model files and voice recordings are intentionally outside the source release. Do not imply Fish Audio, Qwen, or ComfyUI endorses this frontend.

Future releases should update the version, source-review record, test evidence, and changelog. Exact dependency versions from a working machine are more useful for preservation than “latest” alone. Preserve a full local Git clone or backup in addition to hosting the repository online.
