import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { scans, type Detection } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

const DAYS = 30;
const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function buildActivitySeries(rows: { day: string; count: number }[]): {
  date: Date;
  count: number;
}[] {
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const today = startOfDay(new Date());
  const series: { date: Date; count: number }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_MS);
    series.push({ date, count: byDay.get(localDateKey(date)) ?? 0 });
  }
  return series;
}

function countByClass(
  rows: { detections: Detection[] }[],
): { class: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const { detections } of rows) {
    for (const d of detections) {
      counts.set(d.class, (counts.get(d.class) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([cls, count]) => ({ class: cls, count }))
    .sort((a, b) => b.count - a.count);
}

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id;

  try {
    const since = new Date(startOfDay(new Date()).getTime() - (DAYS - 1) * DAY_MS);

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

    const activityRows = await db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${scans.createdAt} / 1000, 'unixepoch', 'localtime')`,
        count: sql<number>`count(*)`,
      })
      .from(scans)
      .where(and(eq(scans.userId, userId), gte(scans.createdAt, since)))
      .groupBy(sql`1`);

    const classRows = await db
      .select({ detections: scans.detections })
      .from(scans)
      .where(eq(scans.userId, userId));

    return {
      recent,
      total,
      activity: buildActivitySeries(activityRows),
      classCounts: countByClass(classRows),
    };
  } catch (err) {
    console.error("[dashboard] failed to load scans", err);
    return {
      recent: [],
      total: 0,
      activity: [] as { date: Date; count: number }[],
      classCounts: [] as { class: string; count: number }[],
      loadError: true,
    };
  }
};
