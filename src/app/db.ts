import { drizzle } from "drizzle-orm/d1";
import * as schema from "../database/schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function createDb(d1: D1Database) {
  if (!_db) _db = drizzle(d1, { schema });
  return _db;
}
