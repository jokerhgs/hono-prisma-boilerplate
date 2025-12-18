import { Hono } from 'hono';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} from './tasks-controller.js';

const tasksRouter = new Hono();

tasksRouter.get('/', getTasks);
tasksRouter.get('/:id', getTask);
tasksRouter.post('/', createTask);
tasksRouter.patch('/:id', updateTask);
tasksRouter.delete('/:id', deleteTask);

export default tasksRouter;
