import { APIError } from "better-auth/api";
import { fail, superValidate, type ErrorStatus } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { auth } from "$lib/server/auth";

import type { Actions, PageServerLoad } from "./$types";
import { schema } from "./schema";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod4(schema)),
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(schema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await auth.api.signInEmail({
        body: {
          email: form.data.email,
          password: form.data.password,
        },
      });
    } catch (e) {
      if (e instanceof APIError) {
        return fail((e as APIError).status as ErrorStatus, {
          form: {
            ...form,
            valid: false,
            posted: true,
            errors: { messages: [e.message] },
          },
        });
      }

      return fail(500, {
        form: {
          ...form,
          valid: false,
          posted: true,
          errors: {
            messages: ["An unexpected error occurred. Please try again later."],
          },
        },
      });
    }
    return { form };
  },
};
