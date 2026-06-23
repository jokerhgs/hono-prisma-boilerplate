import { Hono } from "hono";
import type { AppEnv } from "../../app/env";

const health = new Hono<AppEnv>();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

health.get("/ready", async (c) => {
  try {
    await c.env.DB.prepare("SELECT 1").run();
    return c.json({ status: "ready", database: "connected" });
  } catch {
    return c.json({ status: "not ready", database: "disconnected" }, 503);
  }
});

export default health;
