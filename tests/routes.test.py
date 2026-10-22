"""HTTP integration checks for our real add-on with only ComfyUI's registry stubbed."""
import importlib.util
import sys
import types
import unittest
from pathlib import Path
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

class RoutesTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.original = sys.modules.get('server')
        self.routes = web.RouteTableDef()
        stub = types.ModuleType('server')
        stub.PromptServer = types.SimpleNamespace(instance=types.SimpleNamespace(routes=self.routes))
        sys.modules['server'] = stub
        init = Path(__file__).resolve().parents[1] / '__init__.py'
        spec = importlib.util.spec_from_file_location('test_studio', init)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        app = web.Application()
        app.add_routes(self.routes)
        self.client = TestClient(TestServer(app))
        await self.client.start_server()

    async def asyncTearDown(self):
        await self.client.close()
        if self.original is None:
            sys.modules.pop('server', None)
        else:
            sys.modules['server'] = self.original

    async def test_page_and_slash_alias(self):
        for path in ['/drama3-audio-studio', '/drama3-audio-studio/']:
            response = await self.client.get(path)
            self.assertEqual(response.status, 200)
            self.assertIn('Give your story a voice', await response.text())
            self.assertEqual(response.headers['Cache-Control'], 'no-cache')

    async def test_every_shipped_asset(self):
        for name in ['style.css', 'app.js', 'graph.js', 'workflow.json']:
            response = await self.client.get('/drama3-audio-studio/assets/' + name)
            self.assertEqual(response.status, 200)
            self.assertGreater(len(await response.read()), 100)

    async def test_arbitrary_files_cannot_be_read(self):
        for name in ['__init__.py', 'secret.txt', '..%2f__init__.py']:
            response = await self.client.get('/drama3-audio-studio/assets/' + name)
            self.assertEqual(response.status, 404)

    async def test_no_upload_or_generation_endpoint_added(self):
        response = await self.client.post('/drama3-audio-studio')
        self.assertEqual(response.status, 405)

if __name__ == '__main__':
    unittest.main()
