import {
    findAll,
    findById,
    create,
    update,
    deleteById,
    findByStatus,
} from './tasks-repository.js';
import type { CreateTaskDTO, UpdateTaskDTO } from './tasks-schema.js';
import type { Task } from '@prisma/client';

/**
 * Service Layer for Tasks
 * Business logic and orchestration
 */

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
    return findAll();
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
    return findById(id);
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskDTO): Promise<Task> {
    return create({
        title: data.title,
        completed: data.completed ?? false,
    });
}

/**
 * Update an existing task
 */
export async function updateTask(
    id: string,
    data: UpdateTaskDTO
): Promise<Task | null> {
    return update(id, data);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
    return deleteById(id);
}

/**
 * Get tasks by completion status
 */
export async function getTasksByStatus(completed: boolean): Promise<Task[]> {
    return findByStatus(completed);
}

