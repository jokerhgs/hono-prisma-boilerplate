import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

/**
 * Create a per-request Drizzle client for the D1 binding.
 * Workers have no shared singleton — call this with `c.env.DB`.
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof getDb>;
