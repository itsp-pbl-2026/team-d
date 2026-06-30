import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { Task, type TaskId } from "#/features/task/model/task";
import type { TaskRepository } from "#/features/task/repository/task";
import { UpcomingEvent } from "#/features/upcomingEvent/model/upcomingEvent";
import type { UpcomingEventRepository } from "#/features/upcomingEvent/repository/upcomingEvent";
import type { ScheduleRepository } from "../repository/schedule";
import { GenerateScheduleService } from "./generate";
import type { GenerateScheduleDomainService } from "./generateDomainService";

const mockedTaskRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies TaskRepository;

const mockedUpcomingEventRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies UpcomingEventRepository;

const mockedScheduleRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies ScheduleRepository;

const mockedGenerateScheduleDomainService = {
  handle: vi.fn(),
} satisfies GenerateScheduleDomainService;

const testIdGenerator = new IdGenerator();

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
    overrides?.id ?? testIdGenerator.generate<Task>(),
    overrides?.title ?? "task title",
    overrides?.description ?? "task description",
    overrides?.deadline ?? new Date("2026-07-01T09:00:00.000Z"),
    overrides?.estimatedMinutes ?? 60,
    overrides?.actualMinutes ?? 0,
    overrides?.priority ?? 1,
    overrides?.progress ?? 0,
    overrides?.status ?? "pending",
  );

const createUpcomingEvent = (overrides?: {
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
}) =>
  new UpcomingEvent(
    testIdGenerator.generate<UpcomingEvent>(),
    overrides?.title ?? "event title",
    overrides?.description ?? "event description",
    overrides?.startAt ?? new Date("2026-07-01T12:00:00.000Z"),
    overrides?.endAt ?? new Date("2026-07-01T13:00:00.000Z"),
  );

describe("GenerateScheduleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedScheduleRepository.save.mockResolvedValue(undefined);
  });

  it("サービスを生成できる", () => {
    const service = new GenerateScheduleService(
      mockedTaskRepository,
      mockedUpcomingEventRepository,
      mockedScheduleRepository,
      mockedGenerateScheduleDomainService,
    );

    expect(service).toBeInstanceOf(GenerateScheduleService);
  });

  describe("handle", () => {
    it("タスクとイベントからスケジュールを生成して保存できる", async () => {
      const service = new GenerateScheduleService(
        mockedTaskRepository,
        mockedUpcomingEventRepository,
        mockedScheduleRepository,
        mockedGenerateScheduleDomainService,
      );
      const task = createTask({
        title: "資料作成",
        description: "週次定例の資料を作る",
        deadline: new Date("2026-07-02T09:00:00.000Z"),
        estimatedMinutes: 90,
        actualMinutes: 30,
        priority: 2,
        progress: 20,
        status: "in_progress",
      });
      const upcomingEvent = createUpcomingEvent({
        title: "定例会議",
        description: "毎週の定例会議",
        startAt: new Date("2026-07-01T15:00:00.000Z"),
        endAt: new Date("2026-07-01T16:00:00.000Z"),
      });
      mockedTaskRepository.findAll.mockResolvedValue([task]);
      mockedUpcomingEventRepository.findAll.mockResolvedValue([upcomingEvent]);
      mockedGenerateScheduleDomainService.handle.mockResolvedValue([
        {
          taskId: task.getId(),
          startAt: new Date("2026-07-01T09:00:00.000Z"),
          endAt: new Date("2026-07-01T10:30:00.000Z"),
        },
      ]);

      const schedules = await service.handle();

      expect(
        mockedGenerateScheduleDomainService.handle,
      ).toHaveBeenCalledExactlyOnceWith({
        tasks: [
          {
            id: task.getId(),
            title: "資料作成",
            description: "週次定例の資料を作る",
            deadline: new Date("2026-07-02T09:00:00.000Z"),
            estimatedMinutes: 90,
            actualMinutes: 30,
            priority: 2,
            progress: 20,
            status: "in_progress",
          },
        ],
        events: [
          {
            id: upcomingEvent.getId(),
            title: "定例会議",
            description: "毎週の定例会議",
            startAt: new Date("2026-07-01T15:00:00.000Z"),
            endAt: new Date("2026-07-01T16:00:00.000Z"),
          },
        ],
      });
      expect(schedules).toHaveLength(1);
      expect(schedules[0]?.getTitle()).toBe("資料作成");
      expect(schedules[0]?.getStartAt()).toStrictEqual(
        new Date("2026-07-01T09:00:00.000Z"),
      );
      expect(schedules[0]?.getEndAt()).toStrictEqual(
        new Date("2026-07-01T10:30:00.000Z"),
      );
      expect(schedules[0]?.getTask()).toBe(task);
      expect(mockedScheduleRepository.save).toHaveBeenCalledExactlyOnceWith(
        schedules[0],
      );
    });

    it("存在しない taskId が返ってきたらエラーにする", async () => {
      const service = new GenerateScheduleService(
        mockedTaskRepository,
        mockedUpcomingEventRepository,
        mockedScheduleRepository,
        mockedGenerateScheduleDomainService,
      );
      mockedTaskRepository.findAll.mockResolvedValue([]);
      mockedUpcomingEventRepository.findAll.mockResolvedValue([]);
      mockedGenerateScheduleDomainService.handle.mockResolvedValue([
        {
          taskId: "unknown-task-id",
          startAt: new Date("2026-07-01T09:00:00.000Z"),
          endAt: new Date("2026-07-01T10:30:00.000Z"),
        },
      ]);

      await expect(() => service.handle()).rejects.toThrow(
        "No task found: unknown-task-id",
      );
      expect(mockedScheduleRepository.save).not.toHaveBeenCalled();
    });
  });
});
