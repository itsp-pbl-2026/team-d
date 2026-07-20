import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import type { Schedule } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";
import { DeleteScheduleService } from "./delete";

const mockedScheduleRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  deleteAll: vi.fn(),
} satisfies ScheduleRepository;

const testIdGenerator = new IdGenerator();

describe("DeleteScheduleService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new DeleteScheduleService(mockedScheduleRepository);

    expect(service).toBeInstanceOf(DeleteScheduleService);
  });

  describe("delete", () => {
    it("スケジュールを削除できる", async () => {
      const service = new DeleteScheduleService(mockedScheduleRepository);
      const id = testIdGenerator.generate<Schedule>();

      mockedScheduleRepository.delete.mockResolvedValue(undefined);

      await service.delete(id);

      expect(mockedScheduleRepository.delete).toHaveBeenCalledExactlyOnceWith(
        id,
      );
    });
  });

  describe("deleteAll", () => {
    it("スケジュールをすべて削除できる", async () => {
      const service = new DeleteScheduleService(mockedScheduleRepository);

      mockedScheduleRepository.deleteAll.mockResolvedValue(undefined);

      await service.deleteAll();

      expect(mockedScheduleRepository.deleteAll).toHaveBeenCalledOnce();
    });
  });
});
