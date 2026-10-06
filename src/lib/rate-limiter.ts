import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';

type ClientInfo = {
  totalHits: number;
  resetTime: Date;
};

/**
 * Workers-safe in-memory rate limit store.
 *
 * The built-in `MemoryStore` calls `setInterval` during `init()`, which
 * workerd forbids in global scope. This store uses fixed windows with lazy
 * expiration on access instead of background timers.
 *
 * Note: counts live per isolate (no cross-isolate sharing), which is the
 * standard trade-off for in-memory limiting on Workers.
 */
class WorkersMemoryStore {
  localKeys = true;

  private windowMs = 15 * 60 * 1000;
  private hits = new Map<string, ClientInfo>();

  init(options: { windowMs: number }): void {
    this.windowMs = options.windowMs;
  }

  get(key: string): ClientInfo | undefined {
    const record = this.hits.get(key);
    if (!record) {
      return undefined;
    }
    if (record.resetTime.getTime() <= Date.now()) {
      this.hits.delete(key);
      return undefined;
    }
    return record;
  }

  increment(key: string): ClientInfo {
    const record = this.get(key);
    if (record) {
      record.totalHits += 1;
      return record;
    }
    const fresh: ClientInfo = {
      totalHits: 1,
      resetTime: new Date(Date.now() + this.windowMs),
    };
    this.hits.set(key, fresh);
    return fresh;
  }

  decrement(key: string): void {
    const record = this.get(key);
    if (record && record.totalHits > 0) {
      record.totalHits -= 1;
    }
  }

  resetKey(key: string): void {
    this.hits.delete(key);
  }

  resetAll(): void {
    this.hits.clear();
  }
}

export const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c: Context) => {
    return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  },
  store: new WorkersMemoryStore(),
});
