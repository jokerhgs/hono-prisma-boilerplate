import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import type { User, NewUser } from '../../db/schema.js';

export async function findAll(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ?? null;
}

export async function findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] ?? null;
}

export async function create(data: Pick<NewUser, 'email' | 'name'>): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0];
}

export async function update(
    id: string,
    data: Partial<Pick<NewUser, 'email' | 'name'>>
): Promise<User | null> {
    const result = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
    return result[0] ?? null;
}

export async function deleteById(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
}
