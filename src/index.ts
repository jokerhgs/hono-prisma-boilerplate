import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import logger from './lib/logger.js';
import { checkDatabaseConnection } from './lib/prisma.js';
import router from './routes.js';

const app = new Hono();

// Middleware
app.use(honoLogger());

// Error Handling
app.onError((err, c) => {
  logger.error(err);
  return c.json(
    {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    500
  );
});

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.route('/', router);

const port = 3000;

// Check DB connection before starting server
checkDatabaseConnection().then((result) => {
  if (result.connected) {
    logger.info('Database connected successfully');
  } else {
    logger.error(`Database connection failed: ${result.error}`);
  }
});

serve({
  fetch: app.fetch,
  port
}, (info) => {
  logger.info(`Server is running on http://localhost:${info.port}`);
});