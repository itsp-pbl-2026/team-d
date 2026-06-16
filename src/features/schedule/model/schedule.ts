export class Schedule {
  #id: string;
  #title: string;
  #description: string;
  #startAt: Date;
  #endAt: Date;

  constructor(
    id: string,
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
