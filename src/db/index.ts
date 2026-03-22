import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL!;

// Create the postgres.js client (used by Drizzle)
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

/**
 * Check database connection health.
 */
export async function checkDatabaseConnection(): Promise<{
    connected: boolean;
    error?: string;
}> {
    try {
        await client`SELECT 1`;
        return { connected: true };
    } catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
