import * as v from 'valibot';

export const TaskSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1)),
  completed: v.boolean(),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const CreateTaskSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  completed: v.optional(v.boolean(), false),
});

export const UpdateTaskSchema = v.object({
  title: v.optional(v.pipe(v.string(), v.minLength(1))),
  completed: v.optional(v.boolean()),
});

export type TaskDTO = v.InferOutput<typeof TaskSchema>;
export type CreateTaskDTO = v.InferOutput<typeof CreateTaskSchema>;
export type UpdateTaskDTO = v.InferOutput<typeof UpdateTaskSchema>;
