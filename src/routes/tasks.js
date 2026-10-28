import { Router } from 'express';

const MAX_TITLE = 200;

/** Validates a task body; returns { value } or { error }. `partial` allows missing fields (PATCH). */
function validate(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object' };
  const value = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== 'string' || body.title.trim() === '') return { error: '"title" is required and must be a non-empty string' };
    if (body.title.length > MAX_TITLE) return { error: `"title" must be at most ${MAX_TITLE} characters` };
    value.title = body.title.trim();
  }
  if (body.done !== undefined) {
    if (typeof body.done !== 'boolean') return { error: '"done" must be a boolean' };
    value.done = body.done;
  }
  return { value };
}

export function tasksRouter(store) {
  const router = Router();

  // GET /tasks?done=true&q=milk
  router.get('/', (req, res) => {
    const filter = {};
    if (req.query.done === 'true') filter.done = true;
    if (req.query.done === 'false') filter.done = false;
    if (typeof req.query.q === 'string') filter.q = req.query.q;
    res.json(store.list(filter));
  });

  router.get('/:id', (req, res) => {
    const task = store.get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  router.post('/', (req, res) => {
    const { value, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    const task = store.create(value);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  router.patch('/:id', (req, res) => {
    const { value, error } = validate(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    if (Object.keys(value).length === 0) return res.status(400).json({ error: 'Nothing to update' });
    const task = store.update(req.params.id, value);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  router.delete('/:id', (req, res) => {
    if (!store.remove(req.params.id)) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  });

  return router;
}
