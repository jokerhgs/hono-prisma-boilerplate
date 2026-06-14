import { Context } from "hono";
import type { Next } from "hono";

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export async function rateLimiter(c: Context, next: Next) {
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    await next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }

  record.count++;
  await next();
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requests) {
    if (now > record.resetTime) {
      requests.delete(ip);
    }
  }
}, 60_000);
