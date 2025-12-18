import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import tasksRouter from './tasks-routes.js';
import { prisma } from '../../lib/prisma.js';

describe('Tasks API', () => {
    const app = new Hono().route('/', tasksRouter);

    // Clean up database before and after each test
    beforeEach(async () => {
        await prisma.task.deleteMany();
    });

    afterEach(async () => {
        await prisma.task.deleteMany();
    });

    it('should return empty list initially', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual([]);
    });

    it('should create a task', async () => {
        const res = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Test Task' }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.title).toBe('Test Task');
        expect(data.id).toBeDefined();
        expect(data.completed).toBe(false);
    });

    it('should get a task by id', async () => {
        // Create first
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Test Task' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        // Get
        const res = await app.request(`/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.title).toBe('Test Task');
    });

    it('should update a task', async () => {
        // Create first
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Test Task' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        // Update
        const res = await app.request(`/${created.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed: true }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.completed).toBe(true);
    });

    it('should delete a task', async () => {
        // Create first
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Test Task' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        // Delete
        const res = await app.request(`/${created.id}`, {
            method: 'DELETE',
        });
        expect(res.status).toBe(204);

        // Verify deleted
        const getRes = await app.request(`/${created.id}`);
        expect(getRes.status).toBe(404);
    });

    it('should get task statistics', async () => {
        // Create some tasks
        await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Task 1', completed: false }),
            headers: { 'Content-Type': 'application/json' },
        });
        await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Task 2', completed: true }),
            headers: { 'Content-Type': 'application/json' },
        });

        // Get stats
        const res = await app.request('/stats');
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.total).toBe(2);
        expect(data.completed).toBe(1);
        expect(data.pending).toBe(1);
    });

    it('should return 404 for non-existent task', async () => {
        const res = await app.request('/non-existent-id');
        expect(res.status).toBe(404);
    });

    it('should validate task creation', async () => {
        const res = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ title: '' }), // Invalid: empty title
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(400);
    });
});
