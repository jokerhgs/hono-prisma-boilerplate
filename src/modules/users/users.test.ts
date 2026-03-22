import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import usersRouter from './users-routes.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';

describe('Users API', () => {
    const app = new Hono().route('/', usersRouter);

    beforeEach(async () => {
        await db.delete(users);
    });

    afterEach(async () => {
        await db.delete(users);
    });

    it('should return empty list initially', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual([]);
    });

    it('should create a user', async () => {
        const res = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.email).toBe('test@example.com');
        expect(data.name).toBe('Test User');
        expect(data.id).toBeDefined();
    });

    it('should prevent duplicate emails', async () => {
        await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User 1' }),
            headers: { 'Content-Type': 'application/json' },
        });

        const res = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User 2' }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(409);
    });

    it('should get a user by id', async () => {
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        const res = await app.request(`/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.email).toBe('test@example.com');
    });

    it('should update a user', async () => {
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        const res = await app.request(`/${created.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: 'Updated Name' }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe('Updated Name');
        expect(data.email).toBe('test@example.com'); // unchanged
    });

    it('should delete a user', async () => {
        const createRes = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
            headers: { 'Content-Type': 'application/json' },
        });
        const created = await createRes.json();

        const res = await app.request(`/${created.id}`, {
            method: 'DELETE',
        });
        expect(res.status).toBe(204);

        const getRes = await app.request(`/${created.id}`);
        expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
        const res = await app.request('/non-existent-id');
        expect(res.status).toBe(404);
    });

    it('should validate user creation', async () => {
        const res = await app.request('/', {
            method: 'POST',
            body: JSON.stringify({ email: 'not-an-email', name: '' }),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status).toBe(400);
    });
});
