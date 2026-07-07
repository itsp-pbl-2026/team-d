import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { Task, type TaskId } from "#/features/task/model/task";
import { Schedule, type ScheduleId } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";
import { EditScheduleService } from "./edit";

const mockedScheduleRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies ScheduleRepository;

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

const createSchedule = (overrides?: {
  id?: ScheduleId;
  title?: string;
  startAt?: Date;
  endAt?: Date;
  task?: Task;
}) =>
  new Schedule(
    overrides?.id ?? testIdGenerator.generate<Schedule>(),
    overrides?.title ?? "schedule title",
    overrides?.startAt ?? new Date("2026-07-01T10:00:00.000Z"),
    overrides?.endAt ?? new Date("2026-07-01T11:00:00.000Z"),
    overrides?.task ?? createTask(),
  );

describe("EditScheduleService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new EditScheduleService(mockedScheduleRepository);

    expect(service).toBeInstanceOf(EditScheduleService);
  });

  describe("handle", () => {
    it("スケジュールを更新できる", async () => {
      const service = new EditScheduleService(mockedScheduleRepository);
      const existingTask = createTask({ title: "before task title" });
      const updatedTask = createTask({ title: "after task title" });
      const existingSchedule = createSchedule({
        id: "schedule-1" as ScheduleId,
        title: "before schedule title",
        startAt: new Date("2026-07-01T10:00:00.000Z"),
        endAt: new Date("2026-07-01T11:00:00.000Z"),
        task: existingTask,
      });

      mockedScheduleRepository.findById.mockResolvedValue(existingSchedule);
      mockedScheduleRepository.save.mockResolvedValue(undefined);

      const updated = await service.handle({
        id: "schedule-1" as ScheduleId,
        title: "after schedule title",
        startAt: new Date("2026-07-01T13:00:00.000Z"),
        endAt: new Date("2026-07-01T14:00:00.000Z"),
        task: updatedTask,
      });

      expect(updated.getId()).toBe(existingSchedule.getId());
      expect(updated.getTitle()).toBe("after schedule title");
      expect(updated.getStartAt()).toStrictEqual(
        new Date("2026-07-01T13:00:00.000Z"),
      );
      expect(updated.getEndAt()).toStrictEqual(
        new Date("2026-07-01T14:00:00.000Z"),
      );
      expect(updated.getTask()).toBe(updatedTask);
      expect(mockedScheduleRepository.save).toHaveBeenCalledExactlyOnceWith(
        updated,
      );
    });

    it("存在しないスケジュールはエラーになる", async () => {
      const service = new EditScheduleService(mockedScheduleRepository);
      mockedScheduleRepository.findById.mockResolvedValue(undefined);

      await expect(() =>
        service.handle({ id: "schedule-1" as ScheduleId }),
      ).rejects.toThrow("No Schedule found.");
      expect(mockedScheduleRepository.save).not.toHaveBeenCalled();
    });
  });
});
