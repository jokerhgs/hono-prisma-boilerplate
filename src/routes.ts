import { Hono } from 'hono';
import usersRouter from './modules/users/users-routes.js';

const router = new Hono();

router.route('/users', usersRouter);

export default router;
