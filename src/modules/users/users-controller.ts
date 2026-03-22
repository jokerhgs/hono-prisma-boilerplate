import type { Context } from 'hono';
import {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser as createUserService,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
} from './users-service.js';
import { CreateUserSchema, UpdateUserSchema } from './users-schema.js';

export async function getUsers(c: Context) {
    const users = await getAllUsers();
    return c.json(users);
}

export async function getUser(c: Context) {
    const id = c.req.param('id');
    const user = await getUserById(id);

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
}

export async function createUser(c: Context) {
    const body = await c.req.json();
    const result = CreateUserSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error.issues }, 400);
    }

    // Check if email is already taken
    const existingUser = await getUserByEmail(result.data.email);
    if (existingUser) {
        return c.json({ error: 'Email already exists' }, 409);
    }

    const newUser = await createUserService(result.data);
    return c.json(newUser, 201);
}

export async function updateUser(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = UpdateUserSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error.issues }, 400);
    }

    const updatedUser = await updateUserService(id, result.data);

    if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json(updatedUser);
}

export async function deleteUser(c: Context) {
    const id = c.req.param('id');
    const success = await deleteUserService(id);

    if (!success) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.body(null, 204);
}
