import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const api = (path, options = {}) =>
  fetch(base + path, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

test('health endpoint answers', async () => {
  const res = await api('/health');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('full CRUD cycle on a task', async () => {
  const created = await api('/tasks', { method: 'POST', body: { title: 'Buy milk' } });
  assert.equal(created.status, 201);
  const task = await created.json();
  assert.equal(task.title, 'Buy milk');
  assert.equal(task.done, false);
  assert.equal(created.headers.get('location'), `/tasks/${task.id}`);

  const list = await (await api('/tasks')).json();
  assert.equal(list.length, 1);

  const patched = await api(`/tasks/${task.id}`, { method: 'PATCH', body: { done: true } });
  assert.equal(patched.status, 200);
  assert.equal((await patched.json()).done, true);

  const onlyDone = await (await api('/tasks?done=true')).json();
  assert.equal(onlyDone.length, 1);
  const onlyActive = await (await api('/tasks?done=false')).json();
  assert.equal(onlyActive.length, 0);

  const removed = await api(`/tasks/${task.id}`, { method: 'DELETE' });
  assert.equal(removed.status, 204);
  assert.equal((await api(`/tasks/${task.id}`)).status, 404);
});

test('validation errors return 400', async () => {
  assert.equal((await api('/tasks', { method: 'POST', body: {} })).status, 400);
  assert.equal((await api('/tasks', { method: 'POST', body: { title: '   ' } })).status, 400);
  assert.equal((await api('/tasks', { method: 'POST', body: { title: 'ok', done: 'yes' } })).status, 400);

  const raw = await fetch(`${base}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(raw.status, 400);
});

test('unknown routes return 404 JSON', async () => {
  const res = await api('/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Route not found' });
});
