import { beforeEach, describe, expect, it, vi } from "vitest";
import { Task, type TaskId } from "../model/task";
import type { TaskRepository } from "../repository/task";
import { UpdateTaskService } from "./update";

const mockedTaskRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies TaskRepository;

describe("UpdateTaskService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new UpdateTaskService(mockedTaskRepository);
    expect(service).toBeInstanceOf(UpdateTaskService);
  });

  it("タスクを更新できる", async () => {
    const service = new UpdateTaskService(mockedTaskRepository);
    const existingTask = new Task(
      "task-1" as TaskId,
      "Old Title",
      "Old Desc",
      new Date("2026-06-01"),
      60,
      0,
      1,
      0,
      "pending",
    );

    mockedTaskRepository.findById.mockResolvedValue(existingTask);
    mockedTaskRepository.save.mockResolvedValue(undefined);

    const updated = await service.handle({
      id: "task-1" as TaskId,
      title: "New Title",
      progress: 50,
      status: "in_progress",
    });

    expect(updated.getTitle()).toBe("New Title");
    expect(updated.getDescription()).toBe("Old Desc");
    expect(updated.getProgress()).toBe(50);
    expect(updated.getStatus()).toBe("in_progress");
    expect(mockedTaskRepository.save).toHaveBeenCalledWith(updated);
  });
});
