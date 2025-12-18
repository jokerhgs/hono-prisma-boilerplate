# Hono Boilerplate - Modular Monolithic API

A clean, production-ready boilerplate for building modular monolithic REST APIs with Hono, TypeScript, Prisma, and Zod validation.

## Features

- **Modular Architecture**: Organized by feature modules with clear separation of concerns
- **Repository Layer**: Isolated database operations using Prisma ORM
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Isolated Functions**: No classes, pure functions only
- **Database**: PostgreSQL with Prisma ORM (Supabase ready)
- **Testing**: Comprehensive integration tests with Vitest
- **Hot Reload**: Development server with auto-reload

## Project Structure

```
src/
├── lib/
│   └── prisma.ts                # Prisma client singleton
├── modules/
│   └── tasks/                   # Example module
│       ├── tasks-schema.ts      # Zod schemas and types
│       ├── tasks-repository.ts  # Repository Layer
│       ├── tasks-service.ts     # Business logic
│       ├── tasks-controller.ts  # Request handlers
│       ├── tasks-routes.ts      # Route definitions
│       └── tasks.test.ts        # Integration tests
└── index.ts                     # Application entry point
prisma/
├── schema.prisma                # Database schema
├── migrations/                  # Database migrations
└── prisma.config.ts             # Prisma 7 configuration
```

## Architecture Layers

### 1. Repository Layer
**File**: `{module}-repository.ts`

- Direct database operations using Prisma
- Pure CRUD functions
- No business logic
- Returns Prisma types

**Naming Convention**: Use descriptive verbs
```typescript
// ✅ Good
export async function findAll(): Promise<Task[]>
export async function findById(id: string): Promise<Task | null>
export async function create(data: Prisma.TaskCreateInput): Promise<Task>
export async function update(id: string, data: Prisma.TaskUpdateInput): Promise<Task | null>
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
// ✅ Good
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
// ✅ Good
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

**❌ Don't use classes**:
```typescript
export class TasksService {
  findAll() { }
}
```

**✅ Use isolated functions**:
```typescript
export async function findAll(): Promise<Task[]> {
  return prisma.task.findMany();
}
```

### Named Imports

**✅ Use named imports for clarity**:
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

4. **Generate Prisma Client**:
```bash
pnpm db:generate
```

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Open Prisma Studio
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
export type User = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
```

```typescript
// users-repository.ts - Database operations
import { prisma } from '../../lib/prisma.js';
import type { User, Prisma } from '@prisma/client';

export async function findAll(): Promise<User[]> {
  return prisma.user.findMany();
}

export async function create(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
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

4. **Update Prisma schema** and run migration:
```bash
pnpm db:migrate
```

## Database Commands

```bash
# Create migration
pnpm db:migrate

# Generate Prisma Client
pnpm db:generate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Push schema changes (dev only)
pnpm db:push

# Reset database
pnpm prisma migrate reset
```

## Testing

Tests are integration tests that use the actual database:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma.js';

describe('Tasks API', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany(); // Clean database
  });

  it('should create a task', async () => {
    // Test implementation
  });
});
```

Run tests:
```bash
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono (lightweight, fast)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 7
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
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:push` | Push schema changes (dev only) |

## Best Practices

1. **Use named imports** for clarity and simplicity
2. **Keep functions pure** - no side effects except database operations
3. **One responsibility per function** - functions should do one thing well
4. **Validate at the edge** - use Zod schemas in controllers
5. **Type everything** - leverage TypeScript and Prisma types
6. **Test with real database** - integration tests are more valuable
7. **Document public functions** - use JSDoc comments
8. **Handle errors gracefully** - return null/false instead of throwing when appropriate

## License

MIT
