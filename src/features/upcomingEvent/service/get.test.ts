import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { UpcomingEvent } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";
import { GetUpcomingEventService } from "./get";

const mockedUpcomingEventRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies UpcomingEventRepository;

const testIdGenerator = new IdGenerator();
const eventId = testIdGenerator.generate<UpcomingEvent>();
const createUpcomingEvent = () =>
  new UpcomingEvent(eventId, "タイトル", "説明", new Date(), new Date());

describe("GetUpcomingEventService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new GetUpcomingEventService(mockedUpcomingEventRepository);

    expect(service).toBeInstanceOf(GetUpcomingEventService);
  });

  describe("getById", () => {
    it("イベントを取得できる", async () => {
      const service = new GetUpcomingEventService(
        mockedUpcomingEventRepository,
      );
      const event = createUpcomingEvent();
      mockedUpcomingEventRepository.findById.mockResolvedValue(event);

      const eventActual = await service.getById(eventId);

      expect(eventActual).toBe(event);
    });

    it("存在しないイベントはエラーになる", async () => {
      const service = new GetUpcomingEventService(
        mockedUpcomingEventRepository,
      );
      mockedUpcomingEventRepository.findById.mockResolvedValue(undefined);

      await expect(() => service.getById(eventId)).rejects.toThrow(
        "No event found.",
      );
    });
  });

  describe("getAll", () => {
    it("イベントを取得できる", async () => {
      const service = new GetUpcomingEventService(
        mockedUpcomingEventRepository,
      );
      const events = [...new Array(10)].map(createUpcomingEvent); // UpcomingEventを10個生成
      mockedUpcomingEventRepository.findAll.mockResolvedValue(events);

      const eventsActual = await service.getAll();

      expect(eventsActual).toBe(events);
    });
  });
});
