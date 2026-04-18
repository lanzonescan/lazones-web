import tipsData from "$lib/data/plant-care-tips.json";
import type { Advice, Detection } from "$lib/server/db/schema";

type TipsEntry = {
  label: string;
  summary: string[];
  tips: string[];
};

const DB = tipsData as unknown as Record<string, TipsEntry>;

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany<T>(arr: readonly T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

export function buildAdvice(detections: Detection[]): Advice | null {
  if (detections.length === 0) return null;
  const top = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
  const entry = DB[top.class];
  if (!entry) return null;
  return {
    class: top.class,
    label: entry.label,
    summary: pickOne(entry.summary),
    tips: pickMany(entry.tips, 5),
  };
}
