import {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    deleteById,
} from './users-repository.js';
import type { CreateUserDTO, UpdateUserDTO } from './users-schema.js';
import type { User } from '../../db/schema.js';

export async function getAllUsers(): Promise<User[]> {
    return findAll();
}

export async function getUserById(id: string): Promise<User | null> {
    return findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    return findByEmail(email);
}

export async function createUser(data: CreateUserDTO): Promise<User> {
    return create(data);
}

export async function updateUser(
    id: string,
    data: UpdateUserDTO
): Promise<User | null> {
    return update(id, data);
}

export async function deleteUser(id: string): Promise<boolean> {
    return deleteById(id);
}
