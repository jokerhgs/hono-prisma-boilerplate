import type { Context } from 'hono';
import {
    getAllTasks,
    getTaskById,
    createTask as createTaskService,
    updateTask as updateTaskService,
    deleteTask as deleteTaskService,
} from './tasks-service.js';
import { CreateTaskSchema, UpdateTaskSchema } from './tasks-schema.js';

/**
 * Controller Layer for Tasks
 * HTTP request/response handling
 */

/**
 * GET /tasks - Get all tasks
 */
export async function getTasks(c: Context) {
    const tasks = await getAllTasks();
    return c.json(tasks);
}

/**
 * GET /tasks/:id - Get task by ID
 */
export async function getTask(c: Context) {
    const id = c.req.param('id');
    const task = await getTaskById(id);

    if (!task) {
        return c.json({ error: 'Task not found' }, 404);
    }

    return c.json(task);
}

/**
 * POST /tasks - Create a new task
 */
export async function createTask(c: Context) {
    const body = await c.req.json();
    const result = CreateTaskSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error.issues }, 400);
    }

    const newTask = await createTaskService(result.data);
    return c.json(newTask, 201);
}

/**
 * PATCH /tasks/:id - Update a task
 */
export async function updateTask(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = UpdateTaskSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error.issues }, 400);
    }

    const updatedTask = await updateTaskService(id, result.data);

    if (!updatedTask) {
        return c.json({ error: 'Task not found' }, 404);
    }

    return c.json(updatedTask);
}

/**
 * DELETE /tasks/:id - Delete a task
 */
export async function deleteTask(c: Context) {
    const id = c.req.param('id');
    const success = await deleteTaskService(id);

    if (!success) {
        return c.json({ error: 'Task not found' }, 404);
    }

    return c.body(null, 204);
}