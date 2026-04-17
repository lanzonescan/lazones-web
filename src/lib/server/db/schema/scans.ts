import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./auth";

export type Detection = {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
};

export const scans = sqliteTable("scans", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  detections: text("detections", { mode: "json" })
    .$type<Detection[]>()
    .notNull(),
  imageWidth: integer("image_width").notNull(),
  imageHeight: integer("image_height").notNull(),
  conf: real("conf").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Scan = typeof scans.$inferSelect;
