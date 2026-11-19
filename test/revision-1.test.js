import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/server.js';

let server;
let port;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
  base = `http://127.0.0.1:${port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /health con query string sigue respondiendo 200 y {status: ok}', async () => {
  const res = await fetch(`${base}/health?probe=1&x=%ZZ`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('el cuerpo de /health es JSON exacto, sin campos extra', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(await res.text(), '{"status":"ok"}');
});

test('rutas parecidas a /health responden 404', async () => {
  for (const path of ['/health/', '/HEALTH', '/healthz', '/health/x', '/%2Fhealth', '/']) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 404, `${path} debió dar 404`);
    await res.arrayBuffer();
  }
});

test('POST /health no responde como si fuera GET', async () => {
  const res = await fetch(`${base}/health`, { method: 'POST', body: 'x' });
  assert.notEqual(res.status, 200);
  await res.arrayBuffer();
});

test('una ruta enorme responde 404 sin tumbar el servidor', async () => {
  const res = await fetch(`${base}/${'a'.repeat(7000)}`);
  assert.equal(res.status, 404);
  await res.arrayBuffer();
});

test('una URL absoluta con host inválido no tumba el proceso', async () => {
  const serverPath = fileURLToPath(new URL('../src/server.js', import.meta.url));
  const childPort = String(40000 + Math.floor(Math.random() * 10000));
  const child = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: childPort } });
  let exitCode = null;
  child.on('exit', (code) => { exitCode = code; });
  try {
    await new Promise((resolve) => child.stdout.once('data', resolve));
    await new Promise((resolve) => {
      const socket = net.connect(Number(childPort), '127.0.0.1');
      // Hay que leer la respuesta: un socket pausado nunca llega a 'close' si el servidor sobrevive
      socket.resume();
      socket.on('close', resolve);
      socket.on('error', resolve);
      socket.write('GET http://[::1/health HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(exitCode, null, `el servidor murió con código ${exitCode}`);
  } finally {
    child.kill();
  }
});

test('el servidor arranca con node src/server.js en el PORT indicado', async () => {
  const serverPath = fileURLToPath(new URL('../src/server.js', import.meta.url));
  const child = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: '0' } });
  try {
    const line = await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('no arrancó')), 3000);
      child.stdout.on('data', (d) => { clearTimeout(t); resolve(String(d)); });
    });
    assert.match(line, /listening/);
  } finally {
    child.kill();
  }
});
