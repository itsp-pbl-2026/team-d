import { describe, expect, it } from "vitest";
import { IdGenerator } from "#/features/id";
import { Task } from "#/features/task/model/task";
import { Schedule } from "./schedule";

const testIdGenerator = new IdGenerator();
const scheduleId = testIdGenerator.generate<Schedule>();
const taskId = testIdGenerator.generate<Task>();

const createSchedule = (overrides?: {
  startAt?: Date;
  endAt?: Date;
  task?: Task;
}) =>
  new Schedule(
    scheduleId,
    "タイトル",
    overrides?.startAt ?? new Date(),
    overrides?.endAt ?? new Date(),
    overrides?.task ??
      new Task(
        taskId,
        "タスクタイトル",
        "タスク説明",
        new Date(),
        0,
        0,
        0,
        0,
        "Null",
      ),
  );

describe("Schedule", () => {
  it("インスタンスを生成できる", () => {
    const schedule = createSchedule();

    expect(schedule).toBeInstanceOf(Schedule);
  });

  it("データを正しく保存できる", () => {
    const startAt = new Date("2026-05-19");
    const endAt = new Date("2026-05-20");
    const task = new Task(
      taskId,
      "タスクタイトル",
      "タスク説明",
      new Date(),
      0,
      0,
      0,
      0,
      "Null",
    );
    const schedule = createSchedule({ startAt, endAt, task });

    expect(schedule.getId()).toBe(scheduleId);
    expect(schedule.getTitle()).toBe("タイトル");
    expect(schedule.getTask()).toBe(task);
    expect(schedule.getStartAt()).toBe(startAt);
    expect(schedule.getEndAt()).toBe(endAt);
  });
});
