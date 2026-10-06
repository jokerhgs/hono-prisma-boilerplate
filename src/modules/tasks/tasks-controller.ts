import type { Context } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import type * as v from 'valibot';
import { getDb } from '../../db/index.js';
import type { AppEnv } from '../../env.js';
import {
  getAllTasks,
  getTaskById,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
} from './tasks-service.js';
import { CreateTaskSchema, UpdateTaskSchema } from './tasks-schema.js';

type AppContext = Context<AppEnv>;

/**
 * Context carrying Valibot-validated JSON.
 * Matches the input/output types produced by the `vValidator` middleware
 * so handlers can read the body via `c.req.valid('json')`.
 */
type ValidatedJsonContext<Schema extends v.GenericSchema | v.GenericSchemaAsync> = Context<
  AppEnv,
  string,
  {
    in: { json: v.InferInput<Schema> };
    out: { json: v.InferOutput<Schema> };
  }
>;

/**
 * Controller Layer for Tasks
 * HTTP request/response handling.
 * Validation runs in `vValidator` middleware; handlers read `c.req.valid('json')`.
 */

/**
 * GET /tasks - Get all tasks
 */
export async function getTasks(c: AppContext) {
  const db = getDb(c.env.DB);
  const tasks = await getAllTasks(db);
  return c.json(tasks);
}

/**
 * GET /tasks/:id - Get task by ID
 */
export async function getTask(c: AppContext) {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'Task not found' }, 404);
  }

  const task = await getTaskById(db, id);

  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(task);
}

/**
 * POST /tasks - Create a new task
 */
export const createTaskValidator = vValidator('json', CreateTaskSchema);

export async function createTask(c: ValidatedJsonContext<typeof CreateTaskSchema>) {
  const db = getDb(c.env.DB);
  const data = c.req.valid('json');
  const newTask = await createTaskService(db, data);
  return c.json(newTask, 201);
}

/**
 * PATCH /tasks/:id - Update a task
 */
export const updateTaskValidator = vValidator('json', UpdateTaskSchema);

export async function updateTask(c: ValidatedJsonContext<typeof UpdateTaskSchema>) {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'Task not found' }, 404);
  }

  const data = c.req.valid('json');
  const updatedTask = await updateTaskService(db, id, data);

  if (!updatedTask) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(updatedTask);
}

/**
 * DELETE /tasks/:id - Delete a task
 */
export async function deleteTask(c: AppContext) {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'Task not found' }, 404);
  }

  const success = await deleteTaskService(db, id);

  if (!success) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.body(null, 204);
}

/**
 * GET /tasks/stats - Get tasks statistics
 */
export async function getTaskStats(c: AppContext) {
  const db = getDb(c.env.DB);
  const tasks = await getAllTasks(db);
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };
  return c.json(stats);
}
