import express from 'express';
import { createStore } from './store.js';
import { tasksRouter } from './routes/tasks.js';

/** Builds the Express app. Exported separately from the server so tests can mount it on any port. */
export function createApp(store = createStore()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.use('/tasks', tasksRouter(store));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  // Malformed JSON and other errors end up here
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
