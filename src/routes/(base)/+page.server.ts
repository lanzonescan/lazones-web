import { desc, eq, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id;

  try {
    const recent = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(5);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(scans)
      .where(eq(scans.userId, userId));

    return { recent, total };
  } catch (err) {
    console.error("[dashboard] failed to load scans", err);
    return { recent: [], total: 0, loadError: true };
  }
};
