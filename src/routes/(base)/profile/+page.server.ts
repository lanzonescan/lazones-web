import { error, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { eq, sql } from "drizzle-orm";
import {
  fail,
  setError,
  superValidate,
  type ErrorStatus,
  type SuperValidated,
} from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";

import type { Actions, PageServerLoad } from "./$types";
import { deleteSchema, nameSchema, passwordSchema } from "./schema";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw error(401);
  const userId = locals.user.id;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(scans)
    .where(eq(scans.userId, userId));

  return {
    total,
    nameForm: await superValidate(
      { name: locals.user.name },
      zod4(nameSchema),
      { id: "name" },
    ),
    passwordForm: await superValidate(zod4(passwordSchema), { id: "password" }),
    deleteForm: await superValidate(zod4(deleteSchema), { id: "delete" }),
  };
};

function apiFail<T extends SuperValidated<Record<string, unknown>>>(
  form: T,
  e: unknown,
) {
  if (e instanceof APIError) {
    return fail((e as APIError).status as ErrorStatus, {
      form: {
        ...form,
        valid: false,
        posted: true,
        errors: { ...form.errors, messages: [e.message] },
      },
    });
  }
  return fail(500, {
    form: {
      ...form,
      valid: false,
      posted: true,
      errors: {
        ...form.errors,
        messages: ["Unexpected error. Please try again."],
      },
    },
  });
}

export const actions: Actions = {
  updateName: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const form = await superValidate(request, zod4(nameSchema), { id: "name" });
    if (!form.valid) return fail(400, { form });
    try {
      await auth.api.updateUser({
        body: { name: form.data.name },
        headers: request.headers,
      });
    } catch (e) {
      return apiFail(form, e);
    }
    return { form };
  },

  changePassword: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const form = await superValidate(request, zod4(passwordSchema), {
      id: "password",
    });
    if (!form.valid) return fail(400, { form });
    try {
      await auth.api.changePassword({
        body: {
          currentPassword: form.data.currentPassword,
          newPassword: form.data.newPassword,
          revokeOtherSessions: form.data.revokeOtherSessions,
        },
        headers: request.headers,
      });
    } catch (e) {
      return apiFail(form, e);
    }
    form.data.currentPassword = "";
    form.data.newPassword = "";
    form.data.confirmPassword = "";
    return { form };
  },

  deleteAccount: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const form = await superValidate(request, zod4(deleteSchema), {
      id: "delete",
    });
    if (!form.valid) return fail(400, { form });
    if (form.data.email !== locals.user.email) {
      return setError(form, "email", "Email does not match your account");
    }
    try {
      await auth.api.deleteUser({
        body: { password: form.data.password },
        headers: request.headers,
      });
    } catch (e) {
      return apiFail(form, e);
    }
    throw redirect(303, "/login");
  },
};
