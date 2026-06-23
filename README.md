# Hono Cloudflare Workers Template

A production-ready serverless API template using Hono, Drizzle ORM, and better-auth — built for Cloudflare Workers with D1 and R2.

## Tech Stack

| Component         | Technology        | Notes                                |
|-------------------|-------------------|--------------------------------------|
| Runtime           | Cloudflare Workers| Edge-deployed, globally distributed  |
| Framework         | Hono             | Ultra-light (~14KB), first-class CF support |
| Database          | D1 (SQLite)      | Serverless SQLite via Cloudflare     |
| ORM               | Drizzle          | Type-safe, light, D1-native          |
| Auth              | better-auth      | Sessions, email verification, password reset |
| Validation        | valibot          | Tiny schema validation library       |
| Email             | Resend           | Transactional emails                 |
| Object Storage    | R2               | S3-compatible, no egress fees        |

## Quick Start

```bash
# Install dependencies
pnpm install

# Create a D1 database
pnpm exec wrangler d1 create app-db
# → Copy the database_id into wrangler.toml

# Generate & apply migrations
pnpm db:generate
pnpm exec wrangler d1 execute app-db --file=./drizzle/0000_*.sql

# Start dev server
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.dev.vars` for local development:

```env
RESEND_API_KEY=re_xxx
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8788
```

For production, set these via `wrangler secret put` or in the Cloudflare Dashboard.

## R2 Setup

Create an R2 bucket and add its name to `wrangler.toml`:

```bash
pnpm exec wrangler r2 bucket create app-assets
```

## API Endpoints

### Health
- `GET /health` — Health check
- `GET /health/ready` — Readiness probe (pings D1)

### Authentication (handled by better-auth)
- `POST /api/auth/register` — Register (triggers verification email via Resend)
- `POST /api/auth/login` — Email/password login
- `POST /api/auth/forgot-password` — Sends password reset email
- `POST /api/auth/reset-password` — Resets password with token
- `GET /api/auth/verify-email` — Email verification link handler
- `GET /api/auth/session` — Get current session

### Users (requires session)
- `GET /api/users/profile` — Get profile
- `PUT /api/users/profile` — Update name
- `DELETE /api/users/account` — Delete account

## Project Structure

```
src/
├── index.ts              # Worker entry point (Hono app)
├── schema.ts             # Drizzle table definitions
├── db/
│   └── index.ts          # Drizzle + D1 connection (cached singleton)
├── lib/
│   ├── auth.ts           # better-auth configuration with Resend hooks
│   └── resend.ts         # Email service (verification, welcome, password reset)
├── middleware/
│   ├── auth.ts           # Session-based auth middleware via better-auth
│   └── validate.ts       # Valibot validation middleware
├── routes/
│   ├── auth.ts           # Proxies to better-auth handler
│   ├── health.ts         # Health check + D1 readiness
│   └── users.ts          # User profile CRUD
├── types/
│   └── env.ts            # Cloudflare bindings + Hono variables
└── validators/
    └── user.ts           # Valibot schemas
```

## Migrations

```bash
pnpm db:generate        # Generate SQL migration from schema
pnpm exec wrangler d1 execute app-db --file=./drizzle/0000_*.sql
```

## Deploy

```bash
pnpm deploy
```

## Security Features

- **Session-based auth** via better-auth (secure HTTP-only cookies)
- **Email verification** required before login (via Resend)
- **CSRF protection** built into better-auth
- **Security headers** via `hono/secure-headers`
- **CORS** configured via `hono/cors`
- **Valibot input validation** on all mutation endpoints
- **Parameterized queries** via Drizzle ORM (SQL injection prevention)
- **Rate limiting** at Cloudflare WAF edge (configure via Dashboard)

## License

MIT
