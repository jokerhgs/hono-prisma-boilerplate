import { Context } from "hono";
import type { Next } from "hono";
import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export function validate(schema: ReturnType<typeof Type.Object>) {
  const compiler = TypeCompiler.Compile(schema);

  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = compiler.Check(body);

    if (!result) {
      const errors = [...compiler.Errors(body)];
      return c.json({ error: "Validation failed", details: errors }, 400);
    }

    await next();
  };
}

export function validateQuery(schema: ReturnType<typeof Type.Object>) {
  const compiler = TypeCompiler.Compile(schema);

  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const result = compiler.Check(query);

    if (!result) {
      const errors = [...compiler.Errors(query)];
      return c.json({ error: "Query validation failed", details: errors }, 400);
    }

    await next();
  };
}
