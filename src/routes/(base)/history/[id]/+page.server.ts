import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const userId = locals.user!.id;
  const [row] = await db
    .select()
    .from(scans)
    .where(and(eq(scans.id, params.id), eq(scans.userId, userId)))
    .limit(1);
  if (!row) throw error(404, "Scan not found");
  return { scan: row };
};
