import { Hono } from "hono";
import { validate } from "../middleware/validate";
import { CreateUserSchema, LoginSchema } from "../types/user";
import { authMiddleware, signToken } from "../middleware/auth";
import { getDB } from "../db";
import type { Env } from "../types/env";

const auth = new Hono<Env>();

// Register
auth.post("/register", validate(CreateUserSchema), async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const { email, password, name } = await c.req.json();

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(password);
  const passwordHash = hasher.digest("hex");

  const result = await db.query(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at",
    [email, passwordHash, name]
  );
  const user = result.rows[0];

  const token = await signToken({ sub: user.id, email: user.email });

  return c.json({ user, token }, 201);
});

// Login
auth.post("/login", validate(LoginSchema), async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const { email, password } = await c.req.json();

  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(password);
  const passwordHash = hasher.digest("hex");

  if (passwordHash !== user.password_hash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signToken({ sub: user.id, email: user.email });

  return c.json({ user: { id: user.id, email: user.email, name: user.name }, token });
});

// Get current user
auth.get("/me", authMiddleware, async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const payload = c.get("user");
  const result = await db.query("SELECT * FROM users WHERE id = $1", [payload.sub]);
  const user = result.rows[0];

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ id: user.id, email: user.email, name: user.name });
});

export default auth;
