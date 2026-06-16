import type { Id } from "#/features/id";
import type { Task } from "#/features/task/model/task";

export type ScheduleId = Id<Schedule>;
export class Schedule {
  #id: ScheduleId;
  #title: string;
  #startAt: Date;
  #endAt: Date;
  #task: Task;

  constructor(
    id: ScheduleId,
    title: string,
    startAt: Date,
    endAt: Date,
    task: Task,
  ) {
    this.#id = id;
    this.#title = title;
    this.#startAt = startAt;
    this.#endAt = endAt;
    this.#task = task;
  }
  getId(): ScheduleId {
    return this.#id;
  }
  getTitle(): string {
    return this.#title;
  }
  getStartAt(): Date {
    return this.#startAt;
  }
  getEndAt(): Date {
    return this.#endAt;
  }
  getTask(): Task {
    return this.#task;
  }
}
