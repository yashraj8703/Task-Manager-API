# Task Manager API (Starter)

A simple, production-minded Task Manager REST API built with Node.js, Express and MongoDB (Mongoose). This project demonstrates a clean MVC structure, validation, centralized error handling, and useful middleware patterns for building stable CRUD APIs.

---

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- dotenv (environment variables)
- express-validator (request validation)
- nodemon (dev)

---

## Quick Project Description

This API manages simple tasks with the following fields: `name` and `completed`. It exposes RESTful endpoints to create, list, read, update (partial and full), and delete tasks. The app uses a layered architecture (routes → controllers → models) with reusable middleware:

- Async wrapper for catching async controller errors
- Validation middleware using `express-validator`
- Global error handling middleware
- Custom error classes for structured error responses

---

## Folder structure (starter)

```
03-task-manager/starter
├── app.js                  # Application bootstrap and server start
├── package.json
├── db
│   └── connect.js          # MongoDB connection helper
├── models
│   └── task.js             # Mongoose Task model/schema
├── controllers
│   └── tasks.js            # Controller functions for task routes
├── routes
│   └── tasks.js            # Express router for /api/v1/tasks
├── middleware
│   ├── async.js            # Async wrapper to catch and forward errors
│   ├── validateTask.js     # express-validator rules and error handler
│   ├── error-handler.js    # Global error handler middleware
│   └── not-found.js        # Route not found (404) middleware
├── errors
│   ├── custom-error.js     # Base CustomError class
│   └── not-found.js        # NotFoundError (404) class
├── public                  # Static front-end assets (optional)
└── README.md               # <-- You are viewing this file
```

Each folder purpose:

- `db/` — connection helper that receives `MONGO_URI` and connects with Mongoose.
- `models/` — Mongoose schemas and models (data layer).
- `controllers/` — business logic: receive validated input, call models, and return JSON.
- `routes/` — API route definitions; attach middleware and controllers.
- `middleware/` — reusable Express middleware (validation, async wrapper, error handler, 404).
- `errors/` — custom Error classes to standardize error payloads.
- `public/` — static front-end (not required to run the API).

---

## How the application works (request flow)

1. A client sends an HTTP request to an API route (for example, `POST /api/v1/tasks`).
2. Express matches the route in `routes/tasks.js` and runs any route-level middleware (for example `validateTask`).
3. The request reaches the controller function in `controllers/tasks.js`. Controllers are wrapped with `asyncWrapper` (from `middleware/async.js`) so any thrown or rejected error is passed to `next()`.
4. Controller calls Mongoose model methods (`Task.find`, `Task.create`, etc.) to interact with MongoDB.
5. If the operation succeeds, controller returns a structured JSON response (status codes like 200, 201).
6. On error, `next(err)` forwards the error to the global error handler `middleware/error-handler.js`, which maps known errors to HTTP responses.
7. If no route matched the request, `middleware/not-found.js` catches it and throws a 404 error.
8. The client receives the error response with a consistent JSON shape.

---

## API Endpoints

All routes are prefixed with `/api/v1/tasks` (configured in `app.js`).

| Method | Route                   | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/api/v1/tasks`         | Get all tasks                      |
| POST   | `/api/v1/tasks`         | Create a new task                  |
| GET    | `/api/v1/tasks/:id`     | Get one task by ID                 |
| PATCH  | `/api/v1/tasks/:id`     | Partially update a task (fields)   |
| PUT    | `/api/v1/tasks/:id`     | Replace a task (full document)     |
| DELETE | `/api/v1/tasks/:id`     | Delete a task                      |


### Request/Response details

Common request body for creating/updating tasks:

```json
{
  "name": "My task name",
  "completed": false
}
```

Success responses (examples):

- GET /api/v1/tasks (200):

```json
{
  "tasks": [
    {
      "_id": "615...",
      "name": "Buy groceries",
      "completed": false,
      "__v": 0
    }
  ]
}
```

- POST /api/v1/tasks (201):

```json
{
  "success": true,
  "task": {
    "_id": "615...",
    "name": "Pay bills",
    "completed": false,
    "__v": 0
  }
}
```

- GET /api/v1/tasks/:id (200):

```json
{
  "task": {
    "_id": "615...",
    "name": "Pay bills",
    "completed": false
  }
}
```

- PATCH /api/v1/tasks/:id (200):

```json
{
  "task": {
    "_id": "615...",
    "name": "Pay bills (updated)",
    "completed": true
  }
}
```

- DELETE /api/v1/tasks/:id (200):

```json
{
  "success": true,
  "task": {
    "_id": "615...",
    "name": "Pay bills (updated)",
    "completed": true
  },
  "message": "Task deleted successfully"
}
```

### Error responses

- Validation errors (400): returned by `validateTask` when request body fails `express-validator` rules.

```json
{
  "success": false,
  "errors": [
    { "msg": "Task name is required", "param": "name", "location": "body" }
  ]
}
```

- Not found (404): when a task ID does not map to a document. Implemented with `NotFoundError`.

```json
{ "success": false, "message": "task not found" }
```

- Invalid MongoDB ID (400): when Mongoose throws a `CastError` for malformed ObjectId.

```json
{ "success": false, "message": "Invalid Task ID format" }
```

- Server error (500): unexpected errors that are not handled explicitly.

```json
{ "success": false, "message": "Server error" }
```

---

## Example requests (curl)

Create a task:

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"Finish project","completed":false}'
```

Get all tasks:

```bash
curl http://localhost:3000/api/v1/tasks
```

Get one task:

```bash
curl http://localhost:3000/api/v1/tasks/<task-id>
```

Replace a task (PUT):

```bash
curl -X PUT http://localhost:3000/api/v1/tasks/<task-id> \
  -H "Content-Type: application/json" \
  -d '{"name":"New name","completed":true}'
```

---

## Database schema (Mongoose)

Defined in `models/task.js`:

- `name` (String)
  - required: true
  - trim: true
  - maxlength: 20 (Mongoose schema rule)
- `completed` (Boolean)
  - default: false

Note: Request validation in `middleware/validateTask.js` additionally enforces a maximum length of 100 for `name`. To avoid conflicting validation rules, align these two values (schema `maxlength` and express-validator rule) when you modify the model.

---

## Middleware and Error System

### `middleware/async.js` (Async wrapper)

This small helper wraps controller functions to catch rejected promises and forward errors to the next middleware. Pattern:

```js
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
```

Usage: controllers exported functions are wrapped so you do not need try/catch inside each controller.

### `middleware/validateTask.js` (Validation)

Uses `express-validator` to enforce request body rules for `name` and `completed`. If validation fails, it returns a 400 with an `errors` array containing details.

### `middleware/not-found.js` (404 Handler)

Catches all requests that don't match any defined routes and forwards a 404 error to the global error handler.

```javascript
const notFound = (req, res, next) => {
  next(new NotFoundError("Route not found"));
};
```

**Important**: This middleware must be placed **after all routes** in `app.js` so that unmatched requests are caught. Otherwise, Express will respond with its default 404 before this middleware runs.

### Custom Error classes (`errors/custom-error.js`, `errors/not-found.js`)

- `CustomError` extends `Error` and carries a `statusCode` property.
- `NotFoundError` extends `CustomError` and sets a 404 status.

Controllers throw `NotFoundError` when resources are absent. The global error handler inspects `err.statusCode` to format responses consistently.

### `middleware/error-handler.js` (Global error handler)

Behavior:

- If an error has `statusCode` (custom errors), respond with that code and message.
- If Mongoose throws a `CastError` (invalid ObjectId), return `400` with message "Invalid Task ID format".
- Fallback: return `500` with message "Server error" for unhandled exceptions.

This centralized approach keeps controllers concise and ensures consistent error JSON shapes.

---

## Environment & Setup

1. Clone the repository and change into the starter directory:

```bash
git clone <repo-url>
cd 03-task-manager/starter
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `starter` folder (same directory as `app.js`) and add:

```
MONGO_URI=<your MongoDB connection string>
PORT=3000   # optional
```

4. Start the server in development (uses `nodemon`):

```bash
npm start
```

5. Server will start after a successful DB connection. Default base URL: `http://localhost:3000`.

---