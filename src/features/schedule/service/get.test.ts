import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { Task } from "#/features/task/model/task";
import { Schedule } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";
import { GetScheduleService } from "./get";

const mockedScheduleRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies ScheduleRepository;

const testIdGenerator = new IdGenerator();

const createSchedule = () => {
  const scheduleId = testIdGenerator.generate<Schedule>();
  const taskId = testIdGenerator.generate<Task>();

  return new Schedule(
    scheduleId,
    "タイトル",
    new Date(),
    new Date(),
    new Task(
      taskId,
      "タスクタイトル",
      "タスク説明",
      new Date(),
      0,
      0,
      0,
      0,
      "",
    ),
  );
};

describe("GetScheduleService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new GetScheduleService(mockedScheduleRepository);

    expect(service).toBeInstanceOf(GetScheduleService);
  });

  describe("getAll", () => {
    it("すべてのスケジュールを取得できる", async () => {
      const service = new GetScheduleService(mockedScheduleRepository);
      const schedules = [...new Array(10)].map(createSchedule);
      mockedScheduleRepository.findAll.mockResolvedValue(schedules);

      const schedulesActual = await service.getAll();

      expect(schedulesActual).toBe(schedules);
      expect(
        mockedScheduleRepository.findAll,
      ).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
