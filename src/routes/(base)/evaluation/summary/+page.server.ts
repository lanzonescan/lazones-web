import {
  QUESTIONS,
  RESPONDENT_ROLES,
  type EvalChar,
  type EvalSubChar,
} from "$lib/data/evaluation-questions";
import { db } from "$lib/server/db";
import { evaluations } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

type ItemStat = {
  id: string;
  text: string;
  mean: number;
  count: number;
  distribution: [number, number, number, number, number];
};

type SubStat = {
  id: string;
  name: string;
  description: string;
  mean: number;
  items: ItemStat[];
};

type CharStat = {
  id: string;
  name: string;
  description: string;
  mean: number;
  subs: SubStat[];
};

type RoleBreakdown = { value: string; label: string; count: number };

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export const load: PageServerLoad = async () => {
  const rows = await db.select().from(evaluations);
  const total = rows.length;

  const characteristics: CharStat[] = QUESTIONS.map((char: EvalChar) => {
    const subs: SubStat[] = char.subs.map((sub: EvalSubChar) => {
      const items: ItemStat[] = sub.items.map((item) => {
        const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
        const scores: number[] = [];
        for (const row of rows) {
          const v = row.responses?.[item.id];
          if (typeof v === "number" && v >= 1 && v <= 5) {
            scores.push(v);
            dist[v - 1]++;
          }
        }
        return {
          id: item.id,
          text: item.text,
          mean: Number(mean(scores).toFixed(2)),
          count: scores.length,
          distribution: dist,
        };
      });
      const subMean = Number(mean(items.map((i) => i.mean).filter((m) => m > 0)).toFixed(2));
      return {
        id: sub.id,
        name: sub.name,
        description: sub.description,
        mean: subMean,
        items,
      };
    });
    const charMean = Number(mean(subs.map((s) => s.mean).filter((m) => m > 0)).toFixed(2));
    return {
      id: char.id,
      name: char.name,
      description: char.description,
      mean: charMean,
      subs,
    };
  });

  const overall = Number(
    mean(characteristics.map((c) => c.mean).filter((m) => m > 0)).toFixed(2)
  );

  const roleBreakdown: RoleBreakdown[] = RESPONDENT_ROLES.map((r) => ({
    value: r.value,
    label: r.label,
    count: rows.filter((row) => row.respondentRole === r.value).length,
  }));

  const recentComments = rows
    .filter((r) => r.comments && r.comments.trim().length > 0)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map((r) => ({
      role: RESPONDENT_ROLES.find((x) => x.value === r.respondentRole)?.label ??
        r.respondentRole,
      comment: r.comments!,
      createdAt: r.createdAt.toISOString(),
    }));

  return {
    total,
    overall,
    characteristics,
    roleBreakdown,
    recentComments,
  };
};
