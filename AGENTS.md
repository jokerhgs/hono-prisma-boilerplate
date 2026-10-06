# AGENTS.md

> Human setup, API usage, and deployment? See [README.md](./README.md).

This file defines code rules for AI agents and contributors. Follow it when adding or modifying code.

## Commands

```bash
pnpm dev              # wrangler dev (Workers + local D1)
pnpm typecheck        # tsc --noEmit — run after code changes
pnpm lint             # eslint . — run after code changes
pnpm format           # prettier --write .
pnpm test             # vitest (workerd + real D1)
pnpm db:generate      # drizzle-kit generate (schema -> migrations/)
pnpm db:migrate:local # wrangler d1 migrations apply DB --local
pnpm db:migrate:remote # wrangler d1 migrations apply DB --remote
pnpm cf-typegen       # regenerate worker-configuration.d.ts after wrangler.jsonc changes
```

## Stack

Cloudflare Workers + Hono 4 + TypeScript + Drizzle ORM (D1/SQLite driver) + Valibot + Vitest (`@cloudflare/vitest-pool-workers`).

## Project Structure

```
src/
├── db/index.ts      # getDb(d1): Db per-request client factory + Db type
├── db/schema.ts     # Drizzle sqliteTable definitions + Task/NewTask types
├── env.ts           # Env { DB: D1Database }, AppEnv = { Bindings: Env }
├── lib/             # Shared helpers (logger, rate-limiter, db)
├── modules/<name>/  # Feature module (see below)
├── routes.ts        # Aggregates module routers: router.route('/x', xRouter)
└── index.ts         # Hono<AppEnv> app, middleware, onError, app.route('/', router)
```

D1 binding is `DB` (see `wrangler.jsonc`). Migrations live in `migrations/`.

## Module Layout

Every module at `src/modules/<name>/` uses kebab-case files with layer suffixes:

```
<name>-schema.ts      # Valibot schemas + DTO types
<name>-repository.ts  # Drizzle CRUD only
<name>-service.ts     # Business logic, calls repository
<name>-controller.ts  # Hono handlers (Context<AppEnv>), calls service
<name>-routes.ts      # Hono router + vValidator middleware
<name>.test.ts        # Integration tests against real D1
```

Example: `src/modules/tasks/` (`tasks-schema.ts`, `tasks-repository.ts`, `tasks-service.ts`, `tasks-controller.ts`, `tasks-routes.ts`, `tasks.test.ts`).

When adding a module: create the 5 files above, define tables in `src/db/schema.ts`, run `pnpm db:generate && pnpm db:migrate:local`, register the router in `src/routes.ts`.

## Layer Rules

### 1. Repository (`*-repository.ts`)

- Drizzle operations only. No business logic, no HTTP, no validation.
- First argument is always `db: Db`. Never import a global client.
- Return Drizzle schema types (`Task`, `Task[]`, `Task | null`, `boolean` for deletes).
- Document each function with JSDoc.

```typescript
// Good — src/modules/tasks/tasks-repository.ts
import type { Db } from '../../db/index.js';
export async function findAll(db: Db): Promise<Task[]> {
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}
export async function findById(db: Db, id: string): Promise<Task | null> {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return result[0] ?? null;
}
```

### 2. Service (`*-service.ts`)

- Business logic and orchestration. Calls repository functions via named imports.
- Takes `db: Db` as first arg, passes it through. Transforms DTOs to DB shapes.
- Return `null` / `false` for not-found when appropriate; throw only on real failures.

```typescript
// Good — src/modules/tasks/tasks-service.ts
import { findAll, create } from './tasks-repository.js';
export async function getAllTasks(db: Db): Promise<Task[]> {
  return findAll(db);
}
export async function createTask(db: Db, data: CreateTaskDTO): Promise<Task> {
  return create(db, { title: data.title, completed: data.completed ?? false });
}
```

### 3. Controller (`*-controller.ts`)

- HTTP only: build `db` per request, read params/validated body, call service, return `c.json()`.
- Signature: `(c: Context<AppEnv>)`. Build db via `getDb(c.env.DB)`.
- Do NOT validate inline — export `vValidator('json', Schema)` constants; routes apply them. Read body via `c.req.valid('json')`.
- Not-found → `c.json({ error: '<Resource> not found' }, 404)`. Delete success → `c.body(null, 204)`. Create → `c.json(task, 201)`.

```typescript
// Good — src/modules/tasks/tasks-controller.ts
export const createTaskValidator = vValidator('json', CreateTaskSchema);
export async function createTask(c: Context<AppEnv>) {
  const db = getDb(c.env.DB);
  const data = c.req.valid('json');
  const newTask = await createTaskService(db, data);
  return c.json(newTask, 201);
}
```

### 4. Routes (`*-routes.ts`)

- Define `new Hono<AppEnv>()`, attach validators before handlers, export default router.
- Order static routes before `/:id` (e.g. `/stats` before `/:id`).

```typescript
// Good — src/modules/tasks/tasks-routes.ts
tasksRouter.get('/', getTasks);
tasksRouter.get('/stats', getTaskStats);
tasksRouter.get('/:id', getTask);
tasksRouter.post('/', createTaskValidator, createTask);
tasksRouter.patch('/:id', updateTaskValidator, updateTask);
tasksRouter.delete('/:id', deleteTask);
```

## Naming Conventions

| Layer      | Pattern                             | Example                                       |
| ---------- | ----------------------------------- | --------------------------------------------- |
| Repository | verb + optional `By{Criteria}`      | `findAll`, `findById`, `create`, `deleteById` |
| Service    | `get/create/update/delete`+Resource | `getAllTasks`, `getTaskById`, `createTask`    |
| Controller | `get/create/update/delete`+Resource | `getTasks`, `getTask`, `createTask`           |

- Files: kebab-case + layer suffix (`tasks-service.ts`, never `TasksService.ts`).
- No classes. Export isolated `async function`s only. Never `export class XService`.
- Use named imports and call them directly: `import { findAll } from './tasks-repository.js'`.

## TypeScript / Imports / Validation / DB

- Strict TS. Type everything; prefer Drizzle inferred types (`Task`, `NewTask`) and Valibot `v.InferOutput` DTOs.
- ESM imports with `.js` extension: `from './tasks-service.js'`, `from '../../db/index.js'`.
- Valibot schemas in `*-schema.ts`: `v.object({...})`, `v.optional(...)` for PATCH, `v.pipe(v.string(), v.minLength(1))` for required text. Export `XSchema`, `CreateXSchema`, `UpdateXSchema` + `XDTO` / `CreateXDTO` / `UpdateXDTO` types.
- Drizzle schema in `src/db/schema.ts`: `sqliteTable`, `text(...).primaryKey().$defaultFn(() => crypto.randomUUID())`, `integer(..., { mode: 'boolean' | 'timestamp_ms' })`.
- Workers have no singleton DB: always `getDb(c.env.DB)` per request in controllers, then pass `db` down. Never store `db` globally.
- Shared code goes in `src/lib/` (Workers-compatible only — e.g. custom logger, not Node-only `pino`).
- Entry: `src/index.ts` owns `new Hono<AppEnv>()`, middleware (`hono/logger`, rate limiter), `onError`, and `app.route('/', router)`.

## Testing

- Integration tests only, against real D1 via `cloudflare:test` + `tasksRouter.request(path, init, { DB: env.DB })`.
- Co-locate as `src/modules/<name>/<name>.test.ts`. Clean tables in `beforeEach`/`afterEach` (`DELETE FROM`).
- Cover CRUD + 404 + validation-failure (400) paths. See `src/modules/tasks/tasks.test.ts`.

## Constraints

1. No classes — pure functions only.
2. No global DB client — `db: Db` first arg everywhere below controllers.
3. Validate at the edge — Valibot schema + `vValidator` in routes, never raw `c.req.json()` in write handlers.
4. Keep functions pure (except DB I/O) and single-purpose.
5. Use JSDoc on exported repository/service/controller functions.
6. Return `null` / `false` for not-found instead of throwing.
7. Follow existing file/function naming exactly when scaffolding new modules.
