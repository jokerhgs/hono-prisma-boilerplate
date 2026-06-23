import { object, string, minLength, maxLength, pipe } from "valibot";

export const UpdateUserSchema = object({
  name: pipe(string(), minLength(1), maxLength(100)),
});
