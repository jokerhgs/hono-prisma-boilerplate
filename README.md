# Hono Boilerplate - Modular Monolithic API

A clean, production-ready boilerplate for building modular monolithic REST APIs with Hono, TypeScript, Drizzle ORM, and Zod validation.

## Features

- **Modular Architecture**: Organized by feature modules with clear separation of concerns
- **Repository Layer**: Isolated database operations using Drizzle ORM
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Isolated Functions**: No classes, pure functions only
- **Database**: PostgreSQL with Drizzle ORM (Supabase ready)
- **Testing**: Comprehensive integration tests with Vitest
- **Hot Reload**: Development server with auto-reload

## Project Structure

```
src/
├── db/
│   ├── index.ts                 # Drizzle client singleton
│   └── schema.ts                # Database schema
├── lib/
│   └── db.ts                    # DB connection helpers
├── modules/
│   └── tasks/                   # Example module
│       ├── tasks-schema.ts      # Zod schemas and types
│       ├── tasks-repository.ts  # Repository Layer
│       ├── tasks-service.ts     # Business logic
│       ├── tasks-controller.ts  # Request handlers
│       ├── tasks-routes.ts      # Route definitions
│       └── tasks.test.ts        # Integration tests
└── index.ts                     # Application entry point
drizzle.config.ts                # Drizzle kit configuration
```

## Architecture Layers

### 1. Repository Layer
**File**: `{module}-repository.ts`

- Direct database operations using Drizzle ORM
- Pure CRUD functions
- No business logic
- Returns Drizzle schema types

**Naming Convention**: Use descriptive verbs
```typescript
// Good
export async function findAll(): Promise<Task[]>
export async function findById(id: string): Promise<Task | null>
export async function create(data: Pick<NewTask, 'title' | 'completed'>): Promise<Task>
export async function update(id: string, data: Partial<Pick<NewTask, 'title' | 'completed'>>): Promise<Task | null>
export async function deleteById(id: string): Promise<boolean>
```

### 2. Service Layer
**File**: `{module}-service.ts`

- Business logic and orchestration
- Calls repository functions
- Transforms data between layers
- Implements business rules

**Naming Convention**: Use domain-specific action names
```typescript
// Good
export async function getAllTasks(): Promise<Task[]>
export async function getTaskById(id: string): Promise<Task | null>
export async function createTask(data: CreateTaskDTO): Promise<Task>
export async function updateTask(id: string, data: UpdateTaskDTO): Promise<Task | null>
export async function deleteTask(id: string): Promise<boolean>
export async function getTaskStats(): Promise<TaskStats>
```

### 3. Controller Layer
**File**: `{module}-controller.ts`

- HTTP request/response handling
- Input validation using Zod
- Calls service functions
- Returns appropriate HTTP responses

**Naming Convention**: Match HTTP method + resource
```typescript
// Good
export async function getTasks(c: Context)      // GET /tasks
export async function getTask(c: Context)       // GET /tasks/:id
export async function createTask(c: Context)    // POST /tasks
export async function updateTask(c: Context)    // PATCH /tasks/:id
export async function deleteTask(c: Context)    // DELETE /tasks/:id
```

### 4. Routes Layer
**File**: `{module}-routes.ts`

- Route definitions
- Maps URLs to controllers
- Imports controller functions

**Pattern**:
```typescript
import * as TaskController from './tasks-controller.js';

tasksRouter.get('/', TaskController.getTasks);
tasksRouter.post('/', TaskController.createTask);
```

## Coding Conventions

### Isolated Functions (No Classes)

**Don't use classes**:
```typescript
export class TasksService {
  findAll() { }
}
```

**Use isolated functions**:
```typescript
export async function findAll(): Promise<Task[]> {
  return db.select().from(tasks);
}
```

### Named Imports

**Use named imports for clarity**:
```typescript
import { getAllTasks, createTask } from './tasks-service.js';
import { findAll, findById } from './tasks-repository.js';

// Use imported functions directly
const tasks = await getAllTasks();
const task = await findById(id);
```

### Function Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| **Repository** | `verb` + optional `By{Criteria}` | `findAll`, `findById`, `create`, `deleteById` |
| **Service** | `get/create/update/delete` + `{Resource}` | `getAllTasks`, `getTaskById`, `createTask` |
| **Controller** | `get/create/update/delete` + `{Resource}` | `getTasks`, `getTask`, `createTask` |

### File Naming

- Use kebab-case: `tasks-service.ts`, `tasks-repository.ts`
- Suffix indicates layer: `-repository`, `-service`, `-controller`, `-routes`, `-schema`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Setup environment variables**:

Create `.env` file (see `.env.example`):
```env
# Supabase Transaction Pooler (runtime queries)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection (migrations)
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

NODE_ENV="development"
```

3. **Run database migrations**:
```bash
pnpm db:migrate
```

4. **Generate Drizzle Migrations**:
```bash
pnpm db:generate
```

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Open Drizzle Studio
pnpm db:studio
```

Server runs at `http://localhost:3000`

### Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Tasks API (Example)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/stats` | Get task statistics |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create new task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

**Example Request**:
```bash
# Create task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "completed": false}'

# Get stats
curl http://localhost:3000/tasks/stats
```

## Adding New Modules

1. **Create module directory**:
```bash
mkdir src/modules/users
```

2. **Create required files**:

```typescript
// users-schema.ts - Define types and validation
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export const CreateUserSchema = UserSchema.omit({ id: true });
export type UserDTO = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
```

```typescript
// users-repository.ts - Database operations
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import type { User, NewUser } from '../../db/schema.js';

export async function findAll(): Promise<User[]> {
  return db.select().from(users);
}

export async function create(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
```

```typescript
// users-service.ts - Business logic
import { findAll, create } from './users-repository.js';
import type { CreateUserDTO } from './users-schema.js';

export async function getAllUsers() {
  return findAll();
}

export async function createUser(data: CreateUserDTO) {
  return create(data);
}
```

```typescript
// users-controller.ts - Request handlers
import type { Context } from 'hono';
import { getAllUsers } from './users-service.js';

export async function getUsers(c: Context) {
  const users = await getAllUsers();
  return c.json(users);
}
```

```typescript
// users-routes.ts - Route definitions
import { Hono } from 'hono';
import { getUsers } from './users-controller.js';

const usersRouter = new Hono();
usersRouter.get('/', getUsers);

export default usersRouter;
```

3. **Register routes in `src/index.ts`**:
```typescript
import usersRouter from './modules/users/users-routes.js';
app.route('/users', usersRouter);
```

4. **Update Drizzle schema** and run migration:
```bash
pnpm db:generate
pnpm db:migrate
```

## Database Commands

```bash
# Generate migration files
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Push schema changes (dev only)
pnpm db:push
```

## Testing

Tests are integration tests that use the actual database:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';

describe('Tasks API', () => {
  beforeEach(async () => {
    await db.delete(tasks); // Clean database
  });

  it('should create a task', async () => {
    // Test implementation
  });
});
```

Run tests:
```bash
pnpm test           # Run all tests
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono (lightweight, fast)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest
- **Dev Tools**: tsx (hot reload)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Pooled connection for runtime | `postgresql://...@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | Direct connection for migrations | `postgresql://...@host:5432/db` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:push` | Push schema changes directly parameters (dev only) |

## Best Practices

1. **Use named imports** for clarity and simplicity
2. **Keep functions pure** - no side effects except database operations
3. **One responsibility per function** - functions should do one thing well
4. **Validate at the edge** - use Zod schemas in controllers
5. **Type everything** - leverage TypeScript and Drizzle types
6. **Test with real database** - integration tests are more valuable
7. **Document public functions** - use JSDoc comments
8. **Handle errors gracefully** - return null/false instead of throwing when appropriate

## License

MIT
