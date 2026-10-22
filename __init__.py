"""Local browser frontend for Drama 3 in ComfyUI. SPDX-License-Identifier: GPL-3.0-or-later."""
__version__ = "0.1.0"
from pathlib import Path
from aiohttp import web
from server import PromptServer

ROOT = Path(__file__).parent / 'web'
routes = PromptServer.instance.routes

@routes.get('/drama3-audio-studio')
@routes.get('/drama3-audio-studio/')
async def studio_page(request):
    return web.FileResponse(ROOT / 'index.html', headers={'Cache-Control': 'no-cache'})

@routes.get('/drama3-audio-studio/assets/{name}')
async def studio_asset(request):
    name = request.match_info['name']
    if name not in {'style.css', 'app.js', 'graph.js', 'workflow.json'}:
        raise web.HTTPNotFound()
    return web.FileResponse(ROOT / name, headers={'Cache-Control': 'no-cache'})

WEB_DIRECTORY = "./extension"

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
print('[Drama 3 Audio Studio] Open your ComfyUI address + /drama3-audio-studio')
