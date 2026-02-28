import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

/**
 * Check database connection health
 * @returns Promise with connection status and optional error message
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await db.execute(sql`SELECT 1`);
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
