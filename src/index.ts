import 'dotenv/config';
import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import logger from './lib/logger.js';
import { checkDatabaseConnection } from './db/index.js';
import { limiter } from './lib/rate-limiter.js';
import router from './routes.js';

const app = new Hono();

// Middleware
app.use(honoLogger());
app.use(limiter);

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

export default app;