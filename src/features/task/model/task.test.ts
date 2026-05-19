import { describe, expect, it } from "vitest";
import { Task } from "./task";

const taskId = "DUMMY";

const createTask = (overrides?: {
  deadline?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  priority?: number;
  progress?: number;
  status?: string;
}) =>
  new Task(
    taskId,
    "タイトル",
    "説明",
    overrides?.deadline ?? new Date(),
    overrides?.estimatedMinutes ?? 0,
    overrides?.actualMinutes ?? 0,
    overrides?.priority ?? 0,
    overrides?.progress ?? 0,
    overrides?.status ?? "Null",
  );

describe("Task", () => {
  it("インスタンスを生成できる", () => {
    const task = createTask();

    expect(task).toBeInstanceOf(Task);
  });

  it("データを正しく保存できる", () => {
    const deadline = new Date("2026-05-19");
    const estimatedMinutes = 99;
    const actualMinutes = 88;
    const priority = 1;
    const progress = 66;
    const status = "そこそこ";
    const task = createTask({
      deadline,
      estimatedMinutes,
      actualMinutes,
      priority,
      progress,
      status,
    });

    expect(task.getId()).toBe(taskId);
    expect(task.getTitle()).toBe("タイトル");
    expect(task.getDescription()).toBe("説明");
    expect(task.getDeadline()).toBe(deadline);
    expect(task.getEstimatedMinutes()).toBe(estimatedMinutes);
    expect(task.getActualMinutes()).toBe(actualMinutes);
    expect(task.getPriority()).toBe(priority);
    expect(task.getProgress()).toBe(progress);
    expect(task.getStatus()).toBe(status);
  });
});
