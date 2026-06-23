import { object, string, email, minLength, maxLength, pipe } from "valibot";

export const CreateUserSchema = object({
  email: pipe(string(), email()),
  password: pipe(string(), minLength(8), maxLength(128)),
  name: pipe(string(), minLength(1), maxLength(100)),
});

export const LoginSchema = object({
  email: pipe(string(), email()),
  password: pipe(string(), minLength(1)),
});
