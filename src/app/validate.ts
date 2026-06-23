import type { Context, Next } from "hono";
import { safeParse } from "valibot";

export function validate(schema: any) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = safeParse(schema, body);

    if (!result.success) {
      return c.json({ error: "Validation failed", details: result.issues }, 400);
    }

    await next();
  };
}

export function validateQuery(schema: any) {
  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const result = safeParse(schema, query);

    if (!result.success) {
      return c.json({ error: "Query validation failed", details: result.issues }, 400);
    }

    await next();
  };
}
