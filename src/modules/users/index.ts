import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { validate } from "../../app/validate";
import { authMiddleware } from "../auth";
import { createDb } from "../../app/db";
import { user } from "../../database/schema";
import { UpdateUserSchema } from "./schemas";
import type { AppEnv } from "../../app/env";

const users = new Hono<AppEnv>();

users.use("*", authMiddleware);

users.get("/profile", async (c) => {
  const currentUser = c.get("user");
  return c.json({
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    emailVerified: currentUser.emailVerified,
    image: currentUser.image,
  });
});

users.put("/profile", validate(UpdateUserSchema), async (c) => {
  const currentUser = c.get("user");
  const { name } = await c.req.json();
  const db = createDb(c.env.DB);

  await db
    .update(user)
    .set({ name, updatedAt: new Date().toISOString() })
    .where(eq(user.id, currentUser.id));

  return c.json({ id: currentUser.id, email: currentUser.email, name });
});

users.delete("/account", async (c) => {
  const currentUser = c.get("user");
  const db = createDb(c.env.DB);

  await db.delete(user).where(eq(user.id, currentUser.id));

  return c.json({ message: "Account deleted" });
});

export default users;
