import { z } from "zod/v4";

export const schema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type Schema = typeof schema;
