import type { Id } from "#/features/id";

export type UpcomingEventId = Id<UpcomingEvent>;

export class UpcomingEvent {
  #id: UpcomingEventId;
  #title: string;
  #description: string;
  #startAt: Date;
  #endAt: Date;

  constructor(
    id: UpcomingEventId,
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
  ) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#startAt = startAt;
    this.#endAt = endAt;
  }
  getId(): UpcomingEventId {
    return this.#id;
  }
  getTitle(): string {
    return this.#title;
  }
  getDescription(): string {
    return this.#description;
  }
  getStartAt(): Date {
    return this.#startAt;
  }
  getEndAt(): Date {
    return this.#endAt;
  }
}
