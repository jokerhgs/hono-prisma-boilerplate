import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

let pool: Pool | null = null;
let dbAvailable = true;

function getPool(): Pool | null {
  if (!DATABASE_URL || !dbAvailable) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

// Initialize tables (run once on startup)
export async function initDB() {
  if (!DATABASE_URL) {
    console.warn("⚠️  No DATABASE_URL set — database features disabled");
    return;
  }

  try {
    const db = getPool();
    if (!db) return;

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log("✅ Database connected and initialized");
  } catch (err: any) {
    console.warn(`⚠️  Database unavailable: ${err.message}`);
    console.warn("   API endpoints requiring database will return 503");
    dbAvailable = false;
    // Destroy the failed pool
    if (pool) {
      pool = null;
    }
  }
}

// Lazy getter — returns null if no DATABASE_URL or DB is unreachable
export function getDB(): Pool | null {
  return getPool();
}

export default getDB;
