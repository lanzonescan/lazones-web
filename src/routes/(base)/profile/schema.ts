import { z } from "zod/v4";

export const nameSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});
export type NameSchema = typeof nameSchema;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Required" }),
    newPassword: z.string().min(8, { message: "At least 8 characters" }),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean().default(false),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type PasswordSchema = typeof passwordSchema;

export const deleteSchema = z.object({
  email: z.email({ error: "Enter your account email" }),
  password: z.string().min(1, { message: "Password required" }),
});
export type DeleteSchema = typeof deleteSchema;
