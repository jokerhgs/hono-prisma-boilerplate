import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { env } from 'cloudflare:test';
import tasksRouter from './tasks-routes.js';

type TaskJson = {
  id: string;
  title: string;
  completed: boolean;
};

type StatsJson = {
  total: number;
  completed: number;
  pending: number;
};

function request(path: string, init?: RequestInit) {
  return tasksRouter.request(path, init, { DB: env.DB });
}

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
}

describe('Tasks API', () => {
  beforeAll(async () => {
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS `tasks` (`id` text PRIMARY KEY NOT NULL, `title` text NOT NULL, `completed` integer DEFAULT false NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL)',
    ).run();
  });

  // Clean up database before and after each test
  beforeEach(async () => {
    await env.DB.prepare('DELETE FROM `tasks`').run();
  });

  afterEach(async () => {
    await env.DB.prepare('DELETE FROM `tasks`').run();
  });

  it('should return empty list initially', async () => {
    const res = await request('/');
    expect(res.status).toBe(200);
    const data = await readJson<TaskJson[]>(res);
    expect(data).toEqual([]);
  });

  it('should create a task', async () => {
    const res = await request('/', jsonInit('POST', { title: 'Test Task' }));
    expect(res.status).toBe(201);
    const data = await readJson<TaskJson>(res);
    expect(data.title).toBe('Test Task');
    expect(data.id).toBeDefined();
    expect(data.completed).toBe(false);
  });

  it('should get a task by id', async () => {
    // Create first
    const createRes = await request('/', jsonInit('POST', { title: 'Test Task' }));
    const created = await readJson<TaskJson>(createRes);

    // Get
    const res = await request(`/${created.id}`);
    expect(res.status).toBe(200);
    const data = await readJson<TaskJson>(res);
    expect(data.id).toBe(created.id);
    expect(data.title).toBe('Test Task');
  });

  it('should update a task', async () => {
    // Create first
    const createRes = await request('/', jsonInit('POST', { title: 'Test Task' }));
    const created = await readJson<TaskJson>(createRes);

    // Update
    const res = await request(`/${created.id}`, jsonInit('PATCH', { completed: true }));
    expect(res.status).toBe(200);
    const data = await readJson<TaskJson>(res);
    expect(data.completed).toBe(true);
  });

  it('should delete a task', async () => {
    // Create first
    const createRes = await request('/', jsonInit('POST', { title: 'Test Task' }));
    const created = await readJson<TaskJson>(createRes);

    // Delete
    const res = await request(`/${created.id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);

    // Verify deleted
    const getRes = await request(`/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  it('should get task statistics', async () => {
    // Create some tasks
    await request('/', jsonInit('POST', { title: 'Task 1', completed: false }));
    await request('/', jsonInit('POST', { title: 'Task 2', completed: true }));

    // Get stats
    const res = await request('/stats');
    expect(res.status).toBe(200);
    const data = await readJson<StatsJson>(res);
    expect(data.total).toBe(2);
    expect(data.completed).toBe(1);
    expect(data.pending).toBe(1);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request('/non-existent-id');
    expect(res.status).toBe(404);
  });

  it('should validate task creation', async () => {
    const res = await request('/', jsonInit('POST', { title: '' })); // Invalid: empty title
    expect(res.status).toBe(400);
  });
});
