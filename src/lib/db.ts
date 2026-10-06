import { sql } from 'drizzle-orm';
import type { Db } from '../db/index.js';

/**
 * Check database connection health
 * @returns Promise with connection status and optional error message
 */
export async function checkDatabaseConnection(database: Db): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await database.run(sql`SELECT 1`);
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
