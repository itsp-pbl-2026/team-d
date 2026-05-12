import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const event = sqliteTable("event", {
  id: text().primaryKey(),
  title: text().notNull(),
  description: text(),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export const task = sqliteTable("task", {
  id: text().primaryKey(),
  title: text().notNull(),
  description: text(),
  deadline: integer({ mode: "timestamp" }).notNull(),
  estimatedMinutes: integer().notNull(),
  actualMinutes: integer().default(0),
  priority: integer(),
  progress: integer(),
  status: text(),
});
