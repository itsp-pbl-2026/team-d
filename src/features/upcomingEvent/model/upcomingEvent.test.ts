import { describe, expect, it } from "vitest";
import { UpcomingEvent } from "./upcomingEvent";

const eventId = "DUMMY";

const createUpcomingEvent = (overrides?: { startAt?: Date; endAt?: Date }) =>
  new UpcomingEvent(
    eventId,
    "タイトル",
    "説明",
    overrides?.startAt ?? new Date(),
    overrides?.endAt ?? new Date(),
  );

describe("UpcomingEvent", () => {
  it("インスタンスを生成できる", () => {
    const event = createUpcomingEvent();

    expect(event).toBeInstanceOf(UpcomingEvent);
  });

  it("データを正しく保存できる", () => {
    const startAt = new Date("2026-05-19");
    const endAt = new Date("2026-05-20");
    const event = createUpcomingEvent({ startAt, endAt });

    expect(event.getId()).toBe(eventId);
    expect(event.getTitle()).toBe("タイトル");
    expect(event.getDescription()).toBe("説明");
    expect(event.getStartAt()).toBe(startAt);
    expect(event.getEndAt()).toBe(endAt);
  });
});
