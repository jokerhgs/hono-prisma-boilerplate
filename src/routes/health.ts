import { Hono } from "hono";
import { getDB } from "../db";

const health = new Hono();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

health.get("/ready", async (c) => {
  const db = getDB();
  if (!db) {
    return c.json({ status: "not ready", database: "not configured" }, 503);
  }

  try {
    await db.query("SELECT 1");
    return c.json({ status: "ready", database: "connected" });
  } catch {
    return c.json({ status: "not ready", database: "disconnected" }, 503);
  }
});

export default health;
