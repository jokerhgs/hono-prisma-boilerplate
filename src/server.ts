/**
 * Local development entry point.
 * Run with: pnpm dev
 */
import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './index.js';
import { checkDatabaseConnection } from './db/index.js';
import logger from './lib/logger.js';

const port = Number(process.env.PORT ?? 3000);

checkDatabaseConnection().then((result) => {
    if (result.connected) {
        logger.info('Database connected successfully');
    } else {
        logger.error(`Database connection failed: ${result.error}`);
    }
});

serve(
    {
        fetch: app.fetch,
        port,
    },
    (info) => {
        logger.info(`Server is running on http://localhost:${info.port}`);
    }
);
