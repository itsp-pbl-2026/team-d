import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { SQLiteInsertValue } from "drizzle-orm/sqlite-core";
import { assert, describe, expect, test } from "vitest";
import {
  createTestDrizzleClient,
  type DrizzleClient,
} from "#/db/drizzleClient";
import { schedule, task } from "#/db/schema";
import { IdGenerator } from "#/features/id";
import { Task, type TaskId } from "../../task/model/task";
import { Schedule, type ScheduleId } from "../model/schedule";
import { ScheduleDrizzleRepository } from "./scheduleDrizzle";

const testIdGenerator = new IdGenerator();
const scheduleId = testIdGenerator.generate<Schedule>();
const taskId = testIdGenerator.generate<Task>();

const createTask = (overrides?: {
  id?: TaskId;
  title?: string;
  description?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  priority?: number;
  progress?: number;
  status?: string;
}) =>
  new Task(
    overrides?.id ?? taskId,
    overrides?.title ?? "task title",
    overrides?.description ?? "task description",
    overrides?.deadline ?? new Date("2026-06-20"),
    overrides?.estimatedMinutes ?? 60,
    overrides?.actualMinutes ?? 0,
    overrides?.priority ?? 1,
    overrides?.progress ?? 0,
    overrides?.status ?? "pending",
  );

const createSchedule = (overrides?: {
  id?: ScheduleId;
  title?: string;
  startAt?: Date;
  endAt?: Date;
  task?: Task;
}) =>
  new Schedule(
    overrides?.id ?? scheduleId,
    overrides?.title ?? "schedule title",
    overrides?.startAt ?? new Date("2026-06-16T09:00:00"),
    overrides?.endAt ?? new Date("2026-06-16T10:00:00"),
    overrides?.task ?? createTask(),
  );

const insertTask = (
  db: DrizzleClient,
  value: SQLiteInsertValue<typeof task>,
) => db.insert(task).values(value);

const insertSchedule = (
  db: DrizzleClient,
  value: SQLiteInsertValue<typeof schedule>,
) => db.insert(schedule).values(value);

const insertTaskFromModel = (db: DrizzleClient, taskModel: Task) =>
  insertTask(db, {
    id: taskModel.getId(),
    title: taskModel.getTitle(),
    description: taskModel.getDescription(),
    deadline: taskModel.getDeadline(),
    estimatedMinutes: taskModel.getEstimatedMinutes(),
    actualMinutes: taskModel.getActualMinutes(),
    priority: taskModel.getPriority(),
    progress: taskModel.getProgress(),
    status: taskModel.getStatus(),
  });

const insertScheduleFromModel = (
  db: DrizzleClient,
  scheduleModel: Schedule,
) =>
  insertSchedule(db, {
    id: scheduleModel.getId(),
    title: scheduleModel.getTitle(),
    startAt: scheduleModel.getStartAt(),
    endAt: scheduleModel.getEndAt(),
    taskId: scheduleModel.getTask().getId(),
  });

const it = test.extend<{
  db: DrizzleClient;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: fixture関数の第1引数は分割代入パターンでなくてはならないため
  db: async ({}, use) => {
    const testDrizzleClient = createTestDrizzleClient();
    migrate(testDrizzleClient, { migrationsFolder: "./drizzle" });
    await use(testDrizzleClient);
  },
});

describe("ScheduleDrizzleRepository", () => {
  it("インスタンスが生成できる", ({ db }) => {
    const repository = new ScheduleDrizzleRepository(db);

    expect(repository).toBeInstanceOf(ScheduleDrizzleRepository);
  });

  describe("findById", () => {
    it("データを取得できる", async ({ db }) => {
      const taskModel = createTask();
      const startAt = new Date("2026-06-16T09:00:00");
      const endAt = new Date("2026-06-16T10:00:00");
      const scheduleModel = createSchedule({
        title: "title",
        startAt,
        endAt,
        task: taskModel,
      });
      await insertTaskFromModel(db, taskModel);
      await insertScheduleFromModel(db, scheduleModel);

      const repository = new ScheduleDrizzleRepository(db);
      const result = await repository.findById(scheduleId);

      expect(result).not.toBeUndefined();
      assert(result != null);

      expect(result.getId()).toBe(scheduleId);
      expect(result.getTitle()).toBe("title");
      expect(result.getStartAt()).toEqual(startAt);
      expect(result.getEndAt()).toEqual(endAt);
      expect(result.getTask().getId()).toBe(taskId);
      expect(result.getTask().getTitle()).toBe("task title");
    });

    it("存在しないidではundefinedになる", async ({ db }) => {
      const repository = new ScheduleDrizzleRepository(db);
      const result = await repository.findById("" as ScheduleId);

      expect(result).toBeUndefined();
    });
  });

  describe("findAll", () => {
    it("データを取得できる", async ({ db }) => {
      const taskModel = createTask();
      const otherTaskId = testIdGenerator.generate<Task>();
      const otherScheduleId = testIdGenerator.generate<Schedule>();
      const otherTask = createTask({
        id: otherTaskId,
        title: "other task title",
      });
      await insertTaskFromModel(db, taskModel);
      await insertTaskFromModel(db, otherTask);
      await insertScheduleFromModel(db, createSchedule({ task: taskModel }));
      await insertScheduleFromModel(
        db,
        createSchedule({
          id: otherScheduleId,
          title: "other schedule title",
          task: otherTask,
        }),
      );

      const repository = new ScheduleDrizzleRepository(db);
      const schedules = await repository.findAll();

      expect(schedules).toHaveLength(2);
      expect(schedules.map((oneSchedule) => oneSchedule.getId())).toEqual([
        scheduleId,
        otherScheduleId,
      ]);
      expect(
        schedules.map((oneSchedule) => oneSchedule.getTask().getId()),
      ).toEqual([taskId, otherTaskId]);
    });

    it("データが存在しない場合では空配列になる", async ({ db }) => {
      const repository = new ScheduleDrizzleRepository(db);
      const schedules = await repository.findAll();

      expect(schedules).toHaveLength(0);
    });
  });

  describe("save", () => {
    it("データを保存できる", async ({ db }) => {
      const repository = new ScheduleDrizzleRepository(db);
      const taskModel = createTask();
      await insertTaskFromModel(db, taskModel);

      const title = "title";
      const startAt = new Date("2026-06-16T09:00:00");
      const endAt = new Date("2026-06-16T10:00:00");
      const scheduleModel = createSchedule({
        title,
        startAt,
        endAt,
        task: taskModel,
      });
      await repository.save(scheduleModel);

      const savedSchedule = await repository.findById(scheduleId);

      expect(savedSchedule).not.toBeUndefined();
      assert(savedSchedule != null);

      expect(savedSchedule.getId()).toBe(scheduleId);
      expect(savedSchedule.getTitle()).toBe(title);
      expect(savedSchedule.getStartAt()).toStrictEqual(startAt);
      expect(savedSchedule.getEndAt()).toStrictEqual(endAt);
      expect(savedSchedule.getTask().getId()).toBe(taskId);
    });

    it("既に存在するidではデータが更新される", async ({ db }) => {
      const repository = new ScheduleDrizzleRepository(db);
      const taskModel = createTask();
      await insertTaskFromModel(db, taskModel);

      const scheduleModel = createSchedule({ task: taskModel });
      await repository.save(scheduleModel);

      const title = "updated title";
      const startAt = new Date("2026-06-17T13:00:00");
      const endAt = new Date("2026-06-17T14:00:00");
      const updatedSchedule = createSchedule({
        title,
        startAt,
        endAt,
        task: taskModel,
      });
      await repository.save(updatedSchedule);

      const savedSchedule = await repository.findById(scheduleId);

      expect(savedSchedule).not.toBeUndefined();
      assert(savedSchedule != null);

      expect(savedSchedule.getId()).toBe(scheduleId);
      expect(savedSchedule.getTitle()).toBe(title);
      expect(savedSchedule.getStartAt()).toStrictEqual(startAt);
      expect(savedSchedule.getEndAt()).toStrictEqual(endAt);
      expect(savedSchedule.getTask().getId()).toBe(taskId);
    });
  });

  describe("delete", () => {
    it("データを削除できる", async ({ db }) => {
      const taskModel = createTask();
      await insertTaskFromModel(db, taskModel);
      await insertScheduleFromModel(db, createSchedule({ task: taskModel }));

      const repository = new ScheduleDrizzleRepository(db);
      await repository.delete(scheduleId);

      const deletedSchedule = await repository.findById(scheduleId);

      expect(deletedSchedule).toBeUndefined();
    });

    it("存在しないidでもエラーにならない", async ({ db }) => {
      const repository = new ScheduleDrizzleRepository(db);

      await expect(repository.delete("" as ScheduleId)).resolves.toBe(
        undefined,
      );
    });
  });
});
