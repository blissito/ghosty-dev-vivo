import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// Maneja cada petición: /health para monitoreo, 404 para todo lo demás
export function handler(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
}

export function createApp() {
  return createServer(handler);
}

// Arranca sólo si se ejecuta directo (node src/server.js), no al importarlo en tests
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => console.log(`listening on :${port}`));
}
