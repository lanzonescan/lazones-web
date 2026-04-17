import { z } from "zod/v4";

export const schema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type Schema = typeof schema;
