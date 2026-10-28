# Node REST API

A minimal REST API for managing tasks, built with Node.js 20 and Express 4. Data lives in memory, so the app starts instantly and needs no database; the store is isolated in one module so a real database can be plugged in later.

## Run

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # restarts on file changes (node --watch)
npm test           # built-in node:test runner, no extra dependency
```

`PORT` overrides the default port.

## Endpoints

| Method | Path          | Description                                  |
| ------ | ------------- | -------------------------------------------- |
| GET    | `/health`     | Liveness check                               |
| GET    | `/tasks`      | List tasks, filters `?done=true|false&q=text` |
| POST   | `/tasks`      | Create a task `{ "title": "...", "done": false }` |
| GET    | `/tasks/:id`  | Get one task                                 |
| PATCH  | `/tasks/:id`  | Update `title` and/or `done`                 |
| DELETE | `/tasks/:id`  | Delete a task (204)                          |

Errors are always JSON: `{ "error": "message" }` with a 400, 404 or 500 status.

## Examples

```bash
curl -s -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"title":"Buy milk"}'
curl -s localhost:3000/tasks
curl -s -X PATCH localhost:3000/tasks/<id> -H 'content-type: application/json' -d '{"done":true}'
curl -s -X DELETE localhost:3000/tasks/<id> -i
```

## Layout

```
src/
  server.js        starts the HTTP server, graceful shutdown
  app.js           Express app (JSON parsing, routes, error handling)
  routes/tasks.js  validation and CRUD handlers
  store.js         in-memory store (replaceable)
test/
  tasks.test.js    end-to-end tests against a real listening server
```

## License

MIT
