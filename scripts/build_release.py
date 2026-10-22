"""Build the installable public source archive using only standard-library tools."""
from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path

from check_release import ROOT, REQUIRED, validate

# Explicit allowlist: personal/local files elsewhere in the checkout are never swept into a release.
FILES = (
    '.gitignore', '.gitattributes', 'README.md', 'LICENSE', 'NOTICE',
    'THIRD_PARTY_NOTICES.md', 'START_HERE.html', 'CHANGELOG.md', 'RELEASE_NOTES.md',
    'RELEASE_CHECKS.md', 'PUBLISHING.md', 'CONTRIBUTING.md', 'package.json',
    'Open_Audio_Studio.url', '__init__.py',
)
DIRECTORIES = ('web', 'extension', 'docs', 'examples', 'tests', 'scripts', '.github')


def source_files() -> list[Path]:
    selected = [ROOT / name for name in FILES]
    for name in DIRECTORIES:
        selected.extend(path for path in (ROOT / name).rglob('*')
                        if path.is_file() and '__pycache__' not in path.parts
                        and path.suffix not in {'.pyc', '.pyo'})
    for path in selected:
        if path.is_symlink():
            raise ValueError('Symlinks are not part of the source release: ' + str(path))
    return sorted(set(selected), key=lambda path: path.relative_to(ROOT).as_posix())


def main() -> None:
    problems = validate()
    if problems:
        raise SystemExit('\n'.join(problems))
    paths = source_files()
    included = {path.relative_to(ROOT).as_posix() for path in paths}
    missing = set(REQUIRED) - included
    if missing:
        raise SystemExit('Required paths omitted from archive allowlist: ' + ', '.join(sorted(missing)))
    manifest = {path.relative_to(ROOT).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest() for path in paths}
    out = ROOT / 'dist'
    out.mkdir(exist_ok=True)
    archive = out / 'Drama3_Audio_Studio_GitHub_Release_v0.1.0.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for path in paths:
            info = zipfile.ZipInfo('drama3_audio_studio/' + path.relative_to(ROOT).as_posix(), (2026, 10, 21, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, path.read_bytes())
        info = zipfile.ZipInfo('drama3_audio_studio/RELEASE_MANIFEST.json', (2026, 10, 21, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        bundle.writestr(info, json.dumps({'version': '0.1.0', 'hash_algorithm': 'SHA-256', 'files': manifest}, indent=2) + '\n')
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise SystemExit('Archive integrity failure')
        for relative, digest in manifest.items():
            actual = hashlib.sha256(bundle.read('drama3_audio_studio/' + relative)).hexdigest()
            if actual != digest:
                raise SystemExit('Archive member mismatch: ' + relative)
    print(archive)
    print(f'{len(paths)} source files plus manifest; {archive.stat().st_size} bytes')
    print('Archive SHA-256: ' + hashlib.sha256(archive.read_bytes()).hexdigest())


if __name__ == '__main__':
    main()
