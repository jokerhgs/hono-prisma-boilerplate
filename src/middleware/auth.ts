import { Context } from "hono";
import type { Next } from "hono";
import { sign, verify } from "hono/jwt";
import type { Env } from "../types/env";

const JWT_SECRET = (process.env.JWT_SECRET || "change-me-in-production") as string;

export async function signToken(payload: { sub: number; email: string }): Promise<string> {
  return sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    JWT_SECRET,
    "HS256"
  );
}

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  if (!token) {
    return c.json({ error: "Missing token" }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    c.set("user", payload as Env["Variables"]["user"]);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
