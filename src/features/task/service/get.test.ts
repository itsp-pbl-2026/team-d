import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { Task } from "../model/task";
import type { TaskRepository } from "../repository/task";
import { GetTaskService } from "./get";

const mockedTaskRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies TaskRepository;

const testIdGenerator = new IdGenerator();
const taskId = testIdGenerator.generate<Task>();

const createTask = () =>
  new Task(taskId, "タイトル", "説明", new Date(), 0, 0, 0, 0, "");

describe("GetTaskService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new GetTaskService(mockedTaskRepository);

    expect(service).toBeInstanceOf(GetTaskService);
  });

  describe("getById", () => {
    it("タスクを取得できる", async () => {
      const service = new GetTaskService(mockedTaskRepository);
      const task = createTask();
      mockedTaskRepository.findById.mockResolvedValue(task);

      const taskActual = await service.getById(taskId);

      expect(taskActual).toBe(task);
    });

    it("存在しないタスクはエラーになる", async () => {
      const service = new GetTaskService(mockedTaskRepository);
      mockedTaskRepository.findById.mockResolvedValue(undefined);

      await expect(() => service.getById(taskId)).rejects.toThrow(
        "No Task found.",
      );
    });
  });

  describe("getAll", () => {
    it("タスクを取得できる", async () => {
      const service = new GetTaskService(mockedTaskRepository);
      const tasks = [...new Array(10)].map(createTask); // Taskを10個生成
      mockedTaskRepository.findAll.mockResolvedValue(tasks);

      const tasksActual = await service.getAll();

      expect(tasksActual).toBe(tasks);
    });
  });
});
