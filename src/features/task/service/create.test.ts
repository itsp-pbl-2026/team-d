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
  mockedTaskRepository.save.mockResolvedValue(undefined);
  it("タスクを作成できる", async () => {
    const service = new CreateTaskService(mockedTaskRepository);
    const title = "いぬのきもち概論";
    const description = "犬の気持ちを理解する";
    const deadline = new Date();
    const estimatedMinutes = 60;
    const priority = 1;

    const task = await service.handle(
      title,
      description,
      deadline,
      estimatedMinutes,
      priority,
    );
    expect(task.getTitle()).toBe(title);
    expect(task.getDescription()).toBe(description);
    expect(task.getDeadline()).toBe(deadline);
    expect(task.getEstimatedMinutes()).toBe(estimatedMinutes);
    expect(task.getPriority()).toBe(priority);
    expect(mockedTaskRepository.save).toHaveBeenCalledWith(task);
  });
  it("タスクのIDが一意に生成される", async () => {
    const service = new CreateTaskService(mockedTaskRepository);
    const task = await service.handle(
      "いぬのきもち概論Ⅱ",
      "犬の気持ちをより深く理解する",
      new Date(),
      90,
      1,
    );
    const anotherTask = await service.handle(
      "ねこのきもち発展",
      "ﾈｺと和解せよ",
      new Date(),
      120,
      2,
    );
    expect(task.getId()).toBe(task.getId());
    expect(task.getId()).not.toBe(anotherTask.getId());
  });
});
