import { Hono } from 'hono';
import type { AppEnv } from './env.js';
import tasksRouter from './modules/tasks/tasks-routes.js';

const router = new Hono<AppEnv>();

router.route('/tasks', tasksRouter);

export default router;
