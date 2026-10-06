import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import logger from './lib/logger.js';
import { limiter } from './lib/rate-limiter.js';
import type { AppEnv } from './env.js';
import router from './routes.js';

const app = new Hono<AppEnv>();

// Middleware
app.use(honoLogger());
app.use(limiter);

// Error Handling
app.onError((err, c) => {
  logger.error(err);
  return c.json({ error: err.message }, 500);
});

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.route('/', router);

export default app;
