# hono-workers-drizzle-d1-boilerplate

API starter for **Cloudflare Workers** with **Hono**, **Drizzle ORM**, **D1**, and **Valibot**.

## Why this stack

- **Workers:** V8 isolates, no VM or container to boot, so cold starts are short. Restricted environment: JS/Wasm only, not full Node.
- **Hono:** built on web standards, runs on Workers without an adapter (`export default app`).
- **D1 + Drizzle:** SQLite database reached through a binding (`c.env.DB`), no connection strings. Drizzle adds typed queries and migrations. Create the client per request.
- **Valibot:** modular, so bundles stay small. Startup time counts against a Workers limit, so a lean validator helps. Zod is fine too; pick it if a dependency only supports Zod.

## Getting started

Requires Node 22+.

```bash
npm install
npm run cf-typegen
npm run db:generate
npm run db:migrate:local
npm run dev
```

Deploy: `npm run db:migrate:remote && npm run deploy`

Migrate scripts assume a D1 binding named `DB`. Match it in `wrangler.jsonc`.

## Notes

- Schemas use `sqliteTable` (`drizzle-orm/sqlite-core`), dialect `sqlite`.
- `hono-rate-limiter`'s in-memory store isn't shared across isolates. Use a Cloudflare-backed option for real limits.
- Vitest stays on 4.x (required by `@cloudflare/vitest-pool-workers`) and TypeScript on 5.x (`typescript-eslint` support).
- Check current [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (size, startup, CPU) before relying on them.