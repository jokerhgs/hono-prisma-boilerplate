# Hono Boilerplate - Serverless REST API

A clean, production-ready boilerplate for building modular monolithic REST APIs with Hono, TypeScript, Drizzle ORM, and Zod validation, designed to be deployed as an AWS Lambda function via Docker.

## Features

- **Serverless Ready**: Deploys to AWS Lambda using official Node.js Docker image
- **Modular Architecture**: Organized by feature modules with clear separation of concerns
- **Repository Layer**: Isolated database operations using Drizzle ORM
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Isolated Functions**: No classes, pure functions only
- **Database**: PostgreSQL with Drizzle ORM (Supabase ready)
- **Testing**: Comprehensive integration tests with Vitest
- **Local Dev**: Standalone development server with hot-reload via `@hono/node-server`

## Project Structure

```
src/
├── db/
│   ├── index.ts                 # Drizzle client instantiation
│   └── schema.ts                # Drizzle schema definitions
├── lib/
│   ├── logger.ts                # Pino logger configuration
│   └── rate-limiter.ts          # Hono rate limiter setup
├── modules/
│   └── users/                   # Generic starter module
│       ├── users-schema.ts      # Zod schemas and types
│       ├── users-repository.ts  # Repository Layer (Drizzle queries)
│       ├── users-service.ts     # Business logic
│       ├── users-controller.ts  # Request handlers
│       ├── users-routes.ts      # Route definitions
│       └── users.test.ts        # Integration tests
├── index.ts                     # Core Hono application setup
├── lambda.ts                    # AWS Lambda handler entry point
├── server.ts                    # Local development entry point
└── routes.ts                    # Main API router
drizzle.config.ts                # Drizzle Kit config
Dockerfile                       # Multi-stage Docker config for AWS Lambda
docker-compose.yml               # Local Lambda emulator for testing
```

## Architecture Layers

### 1. Repository Layer
**File**: `{module}-repository.ts`

- Direct database operations using Drizzle ORM
- Pure CRUD functions
- No business logic
- Returns inferred Drizzle types

### 2. Service Layer
**File**: `{module}-service.ts`

- Business logic and orchestration
- Calls repository functions
- Transforms data between layers
- Implements business rules

### 3. Controller Layer
**File**: `{module}-controller.ts`

- HTTP request/response handling
- Input validation using Zod
- Calls service functions
- Returns appropriate HTTP responses

### 4. Routes Layer
**File**: `{module}-routes.ts`

- Route definitions
- Maps URLs to controllers
- Imports controller functions

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase account)
- pnpm (recommended) or npm
- Docker (optional, for Lambda emulation)

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Setup environment variables**:

Create `.env` file (see `.env.example`):
```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"
NODE_ENV="development"
```

3. **Push schema or run database migrations**:
```bash
pnpm db:push
```

### Local Development

```bash
# Start development server on port 3000
pnpm dev

# Run tests
pnpm test

# Open Drizzle Studio
pnpm db:studio
```

## Docker / AWS Lambda Deployment

The application is bundled into a Docker image using the official AWS Lambda Node.js base image.

1. **Build the image**:
```bash
docker build -t my-hono-api .
```

2. **Run locally using Lambda Runtime Emulator**:
```bash
docker-compose up
```
*Note: Sends events on port 9000 (e.g. `http://localhost:9000/2015-03-31/functions/function/invocations`)*

## API Endpoints

### Users API (Starter Module)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

## Adding New Modules

When generating new modules, follow the same structure as the `users` module:
1. Define the table in `src/db/schema.ts`
2. Create standard files: `<module>-schema.ts`, `<module>-repository.ts`, `<module>-service.ts`, `<module>-controller.ts`, `<module>-routes.ts`
3. Export the module router and mount it in `src/routes.ts`

## Testing

Tests are written in Vitest and perform local database integrations. 
Ensure your `DATABASE_URL` points to a safe sandbox/test database.

```bash
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
```

## Tech Stack

- **Runtime**: Node.js (Local) / AWS Lambda Node.js 20 (Production)
- **Framework**: Hono
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest
- **Logging**: Pino

## License

MIT
