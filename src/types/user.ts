import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const CreateUserSchema = Type.Object({
  email: Type.String({ pattern: "^[^@]+@[^@]+\\.[^@]+$" }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
});

export const LoginSchema = Type.Object({
  email: Type.String(),
  password: Type.String({ minLength: 1 }),
});

export const UpdateUserSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
});

export const UserResponseSchema = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  name: Type.String(),
  created_at: Type.String(),
});

export type CreateUser = Static<typeof CreateUserSchema>;
export type Login = Static<typeof LoginSchema>;
export type UpdateUser = Static<typeof UpdateUserSchema>;
export type UserResponse = Static<typeof UserResponseSchema>;
