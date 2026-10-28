import { randomUUID } from 'node:crypto';

/**
 * In-memory task store. Swap this module for a database adapter
 * (SQLite, Postgres, Mongo…) without touching the routes.
 */
export function createStore() {
  const tasks = new Map();

  return {
    list({ done, q } = {}) {
      let items = [...tasks.values()];
      if (done !== undefined) items = items.filter((t) => t.done === done);
      if (q) {
        const needle = q.toLowerCase();
        items = items.filter((t) => t.title.toLowerCase().includes(needle));
      }
      return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    get(id) {
      return tasks.get(id) ?? null;
    },

    create({ title, done = false }) {
      const now = new Date().toISOString();
      const task = { id: randomUUID(), title, done, createdAt: now, updatedAt: now };
      tasks.set(task.id, task);
      return task;
    },

    update(id, patch) {
      const current = tasks.get(id);
      if (!current) return null;
      const next = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
      tasks.set(id, next);
      return next;
    },

    remove(id) {
      return tasks.delete(id);
    },

    clear() {
      tasks.clear();
    },
  };
}
