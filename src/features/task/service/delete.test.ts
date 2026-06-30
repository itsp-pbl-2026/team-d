import { beforeEach, describe, expect, it, vi } from "vitest";
import { type TaskId } from "../model/task";
import type { TaskRepository } from "../repository/task";
import { DeleteTaskService } from "./delete";

const mockedTaskRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies TaskRepository;

describe("DeleteTaskService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new DeleteTaskService(mockedTaskRepository);
    expect(service).toBeInstanceOf(DeleteTaskService);
  });

  it("タスクを削除できる", async () => {
    const service = new DeleteTaskService(mockedTaskRepository);
    mockedTaskRepository.delete.mockResolvedValue(undefined);

    await service.handle("task-1");

    expect(mockedTaskRepository.delete).toHaveBeenCalledWith("task-1" as TaskId);
  });
});
