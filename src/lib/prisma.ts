import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create a PostgreSQL connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Initialize PrismaClient with the adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Check database connection health
 * @returns Promise with connection status and optional error message
 */
export async function checkDatabaseConnection(): Promise<{
    connected: boolean;
    error?: string;
}> {
    try {
        // Attempt to execute a simple query to verify connection
        await prisma.$queryRaw`SELECT 1`;
        return { connected: true };
    } catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
