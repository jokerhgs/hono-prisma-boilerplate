import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { rateLimiter } from "./middleware/rate-limit";
import { initDB } from "./db";
import auth from "./routes/auth";
import users from "./routes/users";
import health from "./routes/health";

const app = new Hono();

// Security middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);
app.use("*", rateLimiter);

// Routes
app.route("/health", health);
app.route("/api/auth", auth);
app.route("/api/users", users);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err.message);
  return c.json({ error: "Internal server error" }, 500);
});

// Initialize database
await initDB();

// Server configuration
const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

// Check for TLS certificates for HTTP/3
const CERT_PATH = process.env.TLS_CERT;
const KEY_PATH = process.env.TLS_KEY;

const serverConfig: any = {
  port: PORT,
  hostname: HOST,
};

// Enable HTTP/3 if TLS certificates are provided
if (CERT_PATH && KEY_PATH) {
  const cert = Bun.file(CERT_PATH);
  const key = Bun.file(KEY_PATH);

  serverConfig.tls = {
    cert,
    key,
  };

  console.log(`🔒 HTTP/3 (QUIC) enabled with TLS`);
}

const server = Bun.serve({
  ...serverConfig,
  fetch: app.fetch,
});

console.log(`
🚀 Lightning Fast Server running!
   ─────────────────────────────
   URL:      ${CERT_PATH ? "https" : "http"}://${server.hostname}:${server.port}
   Protocol: ${CERT_PATH ? "HTTP/3 (QUIC)" : "HTTP/1.1"}
   Runtime:  Bun ${Bun.version}
   ─────────────────────────────
`);

