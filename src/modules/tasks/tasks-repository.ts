import { eq, desc, sql } from 'drizzle-orm';
import type { Db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import type { Task, NewTask } from '../../db/schema.js';

/**
 * Data Access Layer for Tasks
 * All database operations for the Task entity.
 * Takes a per-request D1-backed Drizzle client (no singleton on Workers).
 */

/**
 * Find all tasks
 */
export async function findAll(db: Db): Promise<Task[]> {
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

/**
 * Find task by ID
 */
export async function findById(db: Db, id: string): Promise<Task | null> {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return result[0] ?? null;
}

/**
 * Create a new task
 */
export async function create(db: Db, data: Pick<NewTask, 'title' | 'completed'>): Promise<Task> {
  const result = await db.insert(tasks).values(data).returning();
  const task = result[0];
  if (!task) {
    throw new Error('Failed to create task');
  }
  return task;
}

/**
 * Update a task by ID
 */
export async function update(
  db: Db,
  id: string,
  data: Partial<Pick<NewTask, 'title' | 'completed'>>,
): Promise<Task | null> {
  const result = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
  return result[0] ?? null;
}

/**
 * Delete a task by ID
 */
export async function deleteById(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return result.length > 0;
}

/**
 * Count all tasks
 */
export async function count(db: Db): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(tasks);
  return result[0]?.count ?? 0;
}

/**
 * Find tasks by completion status
 */
export async function findByStatus(db: Db, completed: boolean): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.completed, completed))
    .orderBy(desc(tasks.createdAt));
}
