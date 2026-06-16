import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";
import { CreateUpcomingEventService } from "./create";

const mockedUpcomingEventRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies UpcomingEventRepository;

const testIdGenerator = new IdGenerator();

describe("CreateUpcomingEventService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new CreateUpcomingEventService(
      testIdGenerator,
      mockedUpcomingEventRepository,
    );

    expect(service).toBeInstanceOf(CreateUpcomingEventService);
  });

  describe("handle", () => {
    it("イベントを作成できる", async () => {
      const service = new CreateUpcomingEventService(
        testIdGenerator,
        mockedUpcomingEventRepository,
      );

      const title = "title";
      const description = "description";
      const startAt = new Date("2026-05-26");
      const endAt = new Date("2026-05-27");
      const event = await service.handle(title, description, startAt, endAt);

      expect(event.getTitle()).toBe(title);
      expect(event.getDescription()).toBe(description);
      expect(event.getStartAt()).toBe(startAt);
      expect(event.getEndAt()).toBe(endAt);
      expect(
        mockedUpcomingEventRepository.save,
      ).toHaveBeenCalledExactlyOnceWith(event);
    });

    it("イベントにはユニークなIDが付与される", async () => {
      const service = new CreateUpcomingEventService(
        testIdGenerator,
        mockedUpcomingEventRepository,
      );

      const event1 = await service.handle("", "", new Date(), new Date());
      const event2 = await service.handle("", "", new Date(), new Date());

      expect(event1.getId()).not.toBe(event2.getId());
    });

    it("保存に失敗した場合はエラーになる", async () => {
      const service = new CreateUpcomingEventService(
        testIdGenerator,
        mockedUpcomingEventRepository,
      );
      mockedUpcomingEventRepository.save.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(() =>
        service.handle("", "", new Date(), new Date()),
      ).rejects.toThrow("Repository error");
    });
  });
});
