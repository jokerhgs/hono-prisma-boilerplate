# Hono Bun Serverless Template

A lightning-fast, stateless server template using Bun, Hono, and PostgreSQL.

## Tech Stack

| Component | Technology | Performance Gain |
|-----------|------------|------------------|
| Runtime | Bun | Zig HTTP implementation, JavaScriptCore engine |
| Framework | Hono | Zero dependencies (~14KB bundle) |
| Database | pg (PostgreSQL) | External hosted DB — stateless by design |
| Validation | @sinclair/typebox | Compiled to raw JavaScript functions |

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start production server
bun run start
```

## Environment Variables

```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@host:5432/dbname  # optional
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

Leave `DATABASE_URL` empty to run without a database. DB-dependent endpoints return 503.

## API Endpoints

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe (includes DB status)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires token)

### Users
- `GET /api/users/profile` - Get profile (requires token)
- `PUT /api/users/profile` - Update profile (requires token)
- `DELETE /api/users/account` - Delete account (requires token)

## Project Structure

```
src/
├── index.ts           # Main server entry
├── db/
│   └── index.ts       # PostgreSQL connection (lazy, optional)
├── middleware/
│   ├── auth.ts        # JWT authentication
│   ├── rate-limit.ts  # Rate limiting
│   └── validate.ts    # TypeBox validation
├── routes/
│   ├── auth.ts        # Authentication routes
│   ├── health.ts      # Health check routes
│   └── users.ts       # User routes
└── types/
    ├── env.ts         # Hono environment types
    └── user.ts        # TypeBox schemas
```

## Security Features

- JWT authentication
- Rate limiting (100 requests/minute)
- CORS protection
- Security headers
- TypeBox input validation
- Parameterized queries (SQL injection prevention)

## License

MIT
