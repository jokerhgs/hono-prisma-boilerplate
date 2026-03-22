/**
 * Lambda entry point.
 * Used by the Docker image when deployed to AWS Lambda.
 */
import 'dotenv/config';
import { handle } from 'hono/aws-lambda';
import app from './index.js';
import { checkDatabaseConnection } from './db/index.js';
import logger from './lib/logger.js';

// Log DB status on cold start (best-effort)
checkDatabaseConnection().then((result) => {
    if (result.connected) {
        logger.info('Database connected successfully');
    } else {
        logger.error(`Database connection failed: ${result.error}`);
    }
});

export const handler = handle(app);
