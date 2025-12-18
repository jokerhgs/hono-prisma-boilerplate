import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';

export const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c: Context) => {
        return c.req.header('x-forwarded-for') || 'unknown';
    },
});
