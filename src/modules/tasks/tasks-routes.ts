import { Hono } from 'hono';
import type { AppEnv } from '../../env.js';
import {
  getTasks,
  getTask,
  createTask,
  createTaskValidator,
  updateTask,
  updateTaskValidator,
  deleteTask,
  getTaskStats,
} from './tasks-controller.js';

const tasksRouter = new Hono<AppEnv>();

tasksRouter.get('/', getTasks);
tasksRouter.get('/stats', getTaskStats);
tasksRouter.get('/:id', getTask);
tasksRouter.post('/', createTaskValidator, createTask);
tasksRouter.patch('/:id', updateTaskValidator, updateTask);
tasksRouter.delete('/:id', deleteTask);

export default tasksRouter;
