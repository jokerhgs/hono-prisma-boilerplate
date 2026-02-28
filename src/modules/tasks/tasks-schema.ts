import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export const CreateTaskSchema = TaskSchema.pick({ title: true, completed: true }).partial({
  completed: true,
});
export const UpdateTaskSchema = TaskSchema.pick({ title: true, completed: true }).partial();

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
