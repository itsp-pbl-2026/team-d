import type { Id } from "#/features/id";

export type TaskId = Id<Task>;

export class Task {
  #id: TaskId;
  #title: string;
  #description: string;
  #deadline: Date;
  #estimatedMinutes: number;
  #actualMinutes: number;
  #priority: number;
  #progress: number;
  #status: string;

  constructor(
    id: TaskId,
    title: string,
    description: string,
    deadline: Date,
    estimatedMinutes: number,
    actualMinutes: number,
    priority: number,
    progress: number,
    status: string,
  ) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#deadline = deadline;
    this.#estimatedMinutes = estimatedMinutes;
    this.#actualMinutes = actualMinutes;
    this.#priority = priority;
    this.#progress = progress;
    this.#status = status;
  }

  getId(): TaskId {
    return this.#id;
  }

  getTitle(): string {
    return this.#title;
  }

  getDescription(): string {
    return this.#description;
  }

  getDeadline(): Date {
    return this.#deadline;
  }

  getEstimatedMinutes(): number {
    return this.#estimatedMinutes;
  }

  getActualMinutes(): number {
    return this.#actualMinutes;
  }

  getPriority(): number {
    return this.#priority;
  }

  getProgress(): number {
    return this.#progress;
  }

  getStatus(): string {
    return this.#status;
  }
}
