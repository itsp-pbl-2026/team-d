import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TaskId } from "#/features/task/model/task";
import type { UpcomingEventId } from "#/features/upcomingEvent/model/upcomingEvent";
import type { ScheduleId } from "#/features/schedule/model/schedule";

export const event = sqliteTable("event", {
  id: text().$type<UpcomingEventId>().primaryKey(),
  title: text().notNull(),
  description: text(),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export const task = sqliteTable("task", {
  id: text().$type<TaskId>().primaryKey(),
  title: text().notNull(),
  description: text(),
  deadline: integer({ mode: "timestamp" }).notNull(),
  estimatedMinutes: integer().notNull(),
  actualMinutes: integer().default(0),
  priority: integer(),
  progress: integer(),
  status: text(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export const schedule = sqliteTable("schedule", {
  id: text().$type<ScheduleId>().primaryKey(),
  title: text().notNull(),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }).notNull(),
  taskId: text("task_id").$type<TaskId>().notNull().references(() => task.id),
});