import { Hono } from "hono";
import { validate } from "../middleware/validate";
import { UpdateUserSchema } from "../types/user";
import { authMiddleware } from "../middleware/auth";
import { getDB } from "../db";
import type { Env } from "../types/env";

const users = new Hono<Env>();

users.use("*", authMiddleware);

users.get("/profile", async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const payload = c.get("user");
  const result = await db.query("SELECT * FROM users WHERE id = $1", [payload.sub]);
  const user = result.rows[0];

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
  });
});

users.put("/profile", validate(UpdateUserSchema), async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const payload = c.get("user");
  const { name } = await c.req.json();

  const result = await db.query(
    "UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, updated_at",
    [name, payload.sub]
  );
  const user = result.rows[0];

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

users.delete("/account", async (c) => {
  const db = getDB();
  if (!db) return c.json({ error: "Database not configured" }, 503);

  const payload = c.get("user");
  await db.query("DELETE FROM users WHERE id = $1", [payload.sub]);

  return c.json({ message: "Account deleted" });
});

export default users;
