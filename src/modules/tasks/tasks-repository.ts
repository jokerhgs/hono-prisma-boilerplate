import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import type { Task, NewTask } from '../../db/schema.js';

/**
 * Data Access Layer for Tasks
 * All database operations for the Task entity
 */

/**
 * Find all tasks
 */
export async function findAll(): Promise<Task[]> {
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

/**
 * Find task by ID
 */
export async function findById(id: string): Promise<Task | null> {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return result[0] ?? null;
}

/**
 * Create a new task
 */
export async function create(data: Pick<NewTask, 'title' | 'completed'>): Promise<Task> {
  const result = await db.insert(tasks).values(data).returning();
  return result[0];
}

/**
 * Update a task by ID
 */
export async function update(
  id: string,
  data: Partial<Pick<NewTask, 'title' | 'completed'>>,
): Promise<Task | null> {
  const result = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
  return result[0] ?? null;
}

/**
 * Delete a task by ID
 */
export async function deleteById(id: string): Promise<boolean> {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return result.length > 0;
}

/**
 * Count all tasks
 */
export async function count(): Promise<number> {
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tasks);
  return result[0].count;
}

/**
 * Find tasks by completion status
 */
export async function findByStatus(completed: boolean): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.completed, completed))
    .orderBy(desc(tasks.createdAt));
}
