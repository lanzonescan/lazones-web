import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./auth";

export type EvaluationResponses = Record<string, 1 | 2 | 3 | 4 | 5>;

export const evaluations = sqliteTable("evaluations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  respondentRole: text("respondent_role").notNull(),
  responses: text("responses", { mode: "json" })
    .$type<EvaluationResponses>()
    .notNull(),
  comments: text("comments"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
