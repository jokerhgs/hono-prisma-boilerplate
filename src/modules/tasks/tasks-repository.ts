import { prisma } from '../../lib/prisma.js';
import type { Task, Prisma } from '@prisma/client';

/**
 * Data Access Layer for Tasks
 * All database operations for the Task entity
 */

/**
 * Find all tasks
 */
export async function findAll(): Promise<Task[]> {
    return prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Find task by ID
 */
export async function findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
        where: { id },
    });
}

/**
 * Create a new task
 */
export async function create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({
        data,
    });
}

/**
 * Update a task by ID
 */
export async function update(
    id: string,
    data: Prisma.TaskUpdateInput
): Promise<Task | null> {
    try {
        return await prisma.task.update({
            where: { id },
            data,
        });
    } catch (error) {
        // Task not found
        return null;
    }
}

/**
 * Delete a task by ID
 */
export async function deleteById(id: string): Promise<boolean> {
    try {
        await prisma.task.delete({
            where: { id },
        });
        return true;
    } catch (error) {
        // Task not found
        return false;
    }
}

/**
 * Count all tasks
 */
export async function count(): Promise<number> {
    return prisma.task.count();
}

/**
 * Find tasks by completion status
 */
export async function findByStatus(completed: boolean): Promise<Task[]> {
    return prisma.task.findMany({
        where: { completed },
        orderBy: { createdAt: 'desc' },
    });
}
