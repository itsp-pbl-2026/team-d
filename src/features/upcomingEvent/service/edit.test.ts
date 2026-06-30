import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdGenerator } from "#/features/id";
import { UpcomingEvent, type UpcomingEventId } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";
import { CreateUpcomingEventService } from "./create";
import { EditUpcomingEventService } from "./edit";

const mockedUpcomingEventRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} satisfies UpcomingEventRepository;

const testIdGenerator = new IdGenerator();
const eventId = testIdGenerator.generate<UpcomingEvent>();
const createUpcomingEvent = (overrides?: {
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
}) =>
  new UpcomingEvent(
    eventId,
    overrides?.title ?? "元タイトル",
    overrides?.description ?? "元説明",
    overrides?.startAt ?? new Date("2026-06-01"),
    overrides?.endAt ?? new Date("2026-06-02"),
  );

const createInMemoryUpcomingEventRepository = () => {
  const events = new Map<UpcomingEventId, UpcomingEvent>();

  const repository = {
    findById: vi.fn(async (id: UpcomingEventId) => events.get(id)),
    findAll: vi.fn(async () => [...events.values()]),
    save: vi.fn(async (event: UpcomingEvent) => {
      events.set(event.getId(), event);
    }),
    delete: vi.fn(async (id: UpcomingEventId) => {
      events.delete(id);
    }),
  } satisfies UpcomingEventRepository;

  return repository;
};

describe("EditUpcomingEventService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("サービスを生成できる", () => {
    const service = new EditUpcomingEventService(mockedUpcomingEventRepository);

    expect(service).toBeInstanceOf(EditUpcomingEventService);
  });

  describe("handle", () => {
    it("CreateUpcomingEventServiceで作成したイベントを編集できる", async () => {
      const repository = createInMemoryUpcomingEventRepository();
      const createService = new CreateUpcomingEventService(
        testIdGenerator,
        repository,
      );
      const editService = new EditUpcomingEventService(repository);

      const createdTitle = "編集前タイトル";
      const createdDescription = "編集前説明";
      const createdStartAt = new Date("2026-06-01");
      const createdEndAt = new Date("2026-06-02");
      const createdEvent = await createService.handle(
        createdTitle,
        createdDescription,
        createdStartAt,
        createdEndAt,
      );

      expect(createdEvent.getTitle()).toBe(createdTitle);
      expect(createdEvent.getDescription()).toBe(createdDescription);
      expect(createdEvent.getStartAt()).toStrictEqual(createdStartAt);
      expect(createdEvent.getEndAt()).toStrictEqual(createdEndAt);

      const editedTitle = "編集後タイトル";
      const editedDescription = "編集後説明";
      const editedStartAt = new Date("2026-06-10");
      const editedEndAt = new Date("2026-06-11");
      const editedEvent = await editService.handle(
        createdEvent.getId(),
        editedTitle,
        editedDescription,
        editedStartAt,
        editedEndAt,
      );
      const storedEvent = await repository.findById(createdEvent.getId());

      expect(editedEvent.getId()).toBe(createdEvent.getId());
      expect(editedEvent.getTitle()).toBe(editedTitle);
      expect(editedEvent.getDescription()).toBe(editedDescription);
      expect(editedEvent.getStartAt()).toStrictEqual(editedStartAt);
      expect(editedEvent.getEndAt()).toStrictEqual(editedEndAt);

      expect(storedEvent).toBeDefined();
      if (storedEvent == null) {
        throw new Error("Stored event should exist.");
      }

      expect(storedEvent.getId()).toBe(createdEvent.getId());
      expect(storedEvent.getTitle()).toBe(editedTitle);
      expect(storedEvent.getDescription()).toBe(editedDescription);
      expect(storedEvent.getStartAt()).toStrictEqual(editedStartAt);
      expect(storedEvent.getEndAt()).toStrictEqual(editedEndAt);
    });

    it("存在しないイベントはエラーになる", async () => {
      const service = new EditUpcomingEventService(
        mockedUpcomingEventRepository,
      );
      mockedUpcomingEventRepository.findById.mockResolvedValue(undefined);

      await expect(() =>
        service.handle(eventId, "", "", new Date(), new Date()),
      ).rejects.toThrow("No event found.");
      expect(mockedUpcomingEventRepository.save).not.toHaveBeenCalled();
    });

    it("保存に失敗した場合はエラーになる", async () => {
      const service = new EditUpcomingEventService(
        mockedUpcomingEventRepository,
      );
      mockedUpcomingEventRepository.findById.mockResolvedValue(
        createUpcomingEvent(),
      );
      mockedUpcomingEventRepository.save.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(() =>
        service.handle(eventId, "", "", new Date(), new Date()),
      ).rejects.toThrow("Repository error");
    });
  });
});
