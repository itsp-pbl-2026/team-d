import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import type { UpcomingEvent } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";
import { DeleteUpcomingEventService } from "./delete";

const mockedUpcomingEventRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies UpcomingEventRepository;

const testIdGenerator = new IdGenerator();
const upcomingEventId = testIdGenerator.generate<UpcomingEvent>();

describe("DeleteUpcomingEventService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new DeleteUpcomingEventService(
      mockedUpcomingEventRepository,
    );

    expect(service).toBeInstanceOf(DeleteUpcomingEventService);
  });

  describe("delete", () => {
    it("イベントを削除できる", async () => {
      const service = new DeleteUpcomingEventService(
        mockedUpcomingEventRepository,
      );

      await service.delete(upcomingEventId);

      expect(
        mockedUpcomingEventRepository.delete,
      ).toHaveBeenCalledExactlyOnceWith(upcomingEventId);
    });
  });
});
