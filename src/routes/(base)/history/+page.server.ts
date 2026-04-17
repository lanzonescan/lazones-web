import { desc, eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const userId = locals.user!.id;

  const rows = await db
    .select()
    .from(scans)
    .where(eq(scans.userId, userId))
    .orderBy(desc(scans.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return { scans: rows, page, pageSize: PAGE_SIZE };
};
