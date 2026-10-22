"""Validate the source distribution without loading ComfyUI or any model."""
from __future__ import annotations

import ast
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    '__init__.py', 'README.md', 'LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES.md',
    'START_HERE.html', 'CHANGELOG.md', 'RELEASE_NOTES.md', 'RELEASE_CHECKS.md',
    'PUBLISHING.md', 'CONTRIBUTING.md', 'package.json', '.gitignore', '.gitattributes',
    '.github/ISSUE_TEMPLATE/bug_report.md', 'Open_Audio_Studio.url',
    'extension/audio_studio.js', 'web/index.html', 'web/style.css', 'web/app.js',
    'web/graph.js', 'web/workflow.json', 'examples/Audio_AI_TTS.workflow.json',
    'docs/images/audio-studio.png', 'docs/SOURCES.md', 'docs/UPSTREAM_VERSIONS.json',
    'tests/fixtures.cjs', 'tests/graph.test.cjs', 'tests/routes.test.py',
    'scripts/check_release.py', 'scripts/build_release.py',
)


def validate() -> list[str]:
    errors = []
    for name in REQUIRED:
        if not (ROOT / name).is_file():
            errors.append('Missing release file: ' + name)
    for path in ROOT.rglob('*.md'):
        if any(part in {'.git', 'dist', '__pycache__'} for part in path.relative_to(ROOT).parts):
            continue
        text = path.read_text(encoding='utf-8')
        for target in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', text):
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith('#'):
                continue
            relative = unquote(parsed.path)
            if relative and not (path.parent / relative).is_file():
                errors.append(f'{path.relative_to(ROOT)}: missing relative link {target}')
        for forbidden in ['C:\\Users\\', '/workspace/scratch/', 'libfile_', 'file_000000', 'sandbox:']:
            if forbidden in text:
                errors.append(f'{path.relative_to(ROOT)}: contains private working-context marker {forbidden!r}')
    image = ROOT / 'docs/images/audio-studio.png'
    if image.exists() and not image.read_bytes().startswith(b'\x89PNG\r\n\x1a\n'):
        errors.append('README screenshot is not a PNG')
    if (ROOT / '__init__.py').exists():
        tree = ast.parse((ROOT / '__init__.py').read_text(), filename='__init__.py')
        assignments = {node.targets[0].id: ast.literal_eval(node.value)
                       for node in tree.body if isinstance(node, ast.Assign)
                       and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name)
                       and isinstance(node.value, (ast.Constant, ast.Dict))}
        if assignments.get('WEB_DIRECTORY') != './extension':
            errors.append('ComfyUI launcher web directory is not declared correctly')
        if assignments.get('__version__') != '0.1.0':
            errors.append('Release version differs from 0.1.0')
    for name in ['package.json', 'docs/UPSTREAM_VERSIONS.json', 'web/workflow.json', 'examples/Audio_AI_TTS.workflow.json']:
        if (ROOT / name).exists():
            json.loads((ROOT / name).read_text())
    if (ROOT / 'web/workflow.json').exists() and (ROOT / 'examples/Audio_AI_TTS.workflow.json').exists():
        if (ROOT / 'web/workflow.json').read_bytes() != (ROOT / 'examples/Audio_AI_TTS.workflow.json').read_bytes():
            errors.append('Historical workflow copies differ')
    for path in ROOT.rglob('*'):
        if not path.is_file() or any(part in {'.git', 'dist', '__pycache__'} for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower() in {'.wav', '.flac', '.mp3', '.safetensors', '.ckpt', '.pt', '.pth'}:
            errors.append('Unexpected audio/model artifact in source: ' + str(path.relative_to(ROOT)))
    return errors


if __name__ == '__main__':
    problems = validate()
    if problems:
        raise SystemExit('\n'.join(problems))
    print('Release structure, relative Markdown links, screenshot, metadata, and source-content checks passed.')
