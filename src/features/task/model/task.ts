import { timeStamp } from "console";

class Task {
  #id: string;
  #title: string;
  #description: string;
  #deadline: Date;
  #estimated_minutes: number;
  #actual_minutes: number;
  #priority: number;
  #progress: number;
  #status: string;

  constructor(
    id: string,
    title: string,
    description: string,
    deadline: Date,
    estimated_minutes: number,
    actual_minutes: number,
    priority: number,
    progress: number,
    status: string,
  ) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#deadline = deadline;
    this.#estimated_minutes = estimated_minutes;
    this.#actual_minutes = actual_minutes;
    this.#priority = priority;
    this.#progress = progress;
    this.#status = status;
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

  getDeadline(): Date {
    return this.#deadline;
  }

  getEstimatedMinutes(): number {
    return this.#estimated_minutes;
  }

  getActualMinutes(): number {
    return this.#actual_minutes;
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
