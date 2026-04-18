import { desc, eq, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 8;

export const load: PageServerLoad = async ({ locals, url }) => {
  const userId = locals.user!.id;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(scans)
    .where(eq(scans.userId, userId));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requested = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const page = Math.min(requested, totalPages);

  const rows = db
    .select()
    .from(scans)
    .where(eq(scans.userId, userId))
    .orderBy(desc(scans.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .catch((err) => {
      console.error("[history] failed to load scans", err);
      return [];
    });

  return { scans: rows, page, pageSize: PAGE_SIZE, total, totalPages };
};
