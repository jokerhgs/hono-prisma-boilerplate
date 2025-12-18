import { Hono } from 'hono';
import tasksRouter from './modules/tasks/tasks-routes.js';

const router = new Hono();

router.route('/tasks', tasksRouter);

export default router;
