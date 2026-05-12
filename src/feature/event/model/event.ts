export class UpcomingEvent {
  #id: string;
  #title: string;
  #description: string;
  #startAt: Date;
  #endAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    start_at: Date,
    end_at: Date,
  ) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#startAt = start_at;
    this.#endAt = end_at;
  }
  getId(): string {
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
