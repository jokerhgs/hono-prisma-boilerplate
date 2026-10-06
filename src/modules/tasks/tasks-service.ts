import { findAll, findById, create, update, deleteById, findByStatus } from './tasks-repository.js';
import type { Db } from '../../db/index.js';
import type { CreateTaskDTO, UpdateTaskDTO } from './tasks-schema.js';
import type { Task } from '../../db/schema.js';

/**
 * Service Layer for Tasks
 * Business logic and orchestration
 */

/**
 * Get all tasks
 */
export async function getAllTasks(db: Db): Promise<Task[]> {
  return findAll(db);
}

/**
 * Get task by ID
 */
export async function getTaskById(db: Db, id: string): Promise<Task | null> {
  return findById(db, id);
}

/**
 * Create a new task
 */
export async function createTask(db: Db, data: CreateTaskDTO): Promise<Task> {
  return create(db, {
    title: data.title,
    completed: data.completed ?? false,
  });
}

/**
 * Update an existing task
 */
export async function updateTask(db: Db, id: string, data: UpdateTaskDTO): Promise<Task | null> {
  return update(db, id, data);
}

/**
 * Delete a task
 */
export async function deleteTask(db: Db, id: string): Promise<boolean> {
  return deleteById(db, id);
}

/**
 * Get tasks by completion status
 */
export async function getTasksByStatus(db: Db, completed: boolean): Promise<Task[]> {
  return findByStatus(db, completed);
}
