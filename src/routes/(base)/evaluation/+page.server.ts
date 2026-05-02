import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";

import {
  ALL_ITEM_IDS,
  RESPONDENT_ROLES,
  type LikertScore,
  type ResponseMap,
} from "$lib/data/evaluation-questions";
import { db } from "$lib/server/db";
import { evaluations } from "$lib/server/db/schema";

import type { Actions, PageServerLoad } from "./$types";

const VALID_ROLES: Set<string> = new Set(RESPONDENT_ROLES.map((r) => r.value));

export const load: PageServerLoad = async ({ locals }) => {
  const existing = await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.userId, locals.user!.id))
    .limit(1);

  return {
    existing: existing[0] ?? null,
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const userId = locals.user!.id;
    const form = await request.formData();

    const role = String(form.get("respondentRole") ?? "");
    if (!VALID_ROLES.has(role)) {
      return fail(400, { error: "Please choose your role." });
    }

    const responses: ResponseMap = {};
    const missing: string[] = [];

    for (const itemId of ALL_ITEM_IDS) {
      const raw = form.get(itemId);
      if (raw === null || raw === "") {
        missing.push(itemId);
        continue;
      }
      const score = Number(raw);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        return fail(400, { error: `Invalid score for item ${itemId}.` });
      }
      responses[itemId] = score as LikertScore;
    }

    if (missing.length > 0) {
      return fail(400, {
        error: `Please answer all ${ALL_ITEM_IDS.length} items. Missing ${missing.length}.`,
        missing,
      });
    }

    const comments = String(form.get("comments") ?? "").trim() || null;

    const existing = await db
      .select({ id: evaluations.id })
      .from(evaluations)
      .where(eq(evaluations.userId, userId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(evaluations)
        .set({
          respondentRole: role,
          responses,
          comments,
          createdAt: new Date(),
        })
        .where(eq(evaluations.id, existing[0].id));
    } else {
      await db.insert(evaluations).values({
        id: ulid(),
        userId,
        respondentRole: role,
        responses,
        comments,
        createdAt: new Date(),
      });
    }

    throw redirect(303, "/evaluation/summary?submitted=1");
  },
};
