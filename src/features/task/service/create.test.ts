import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskRepository } from "../repository/task";
import { CreateTaskService } from "./create";

const mockedTaskRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies TaskRepository;



describe("CreateTaskService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new CreateTaskService(mockedTaskRepository);

    expect(service).toBeInstanceOf(CreateTaskService);
  });
});
