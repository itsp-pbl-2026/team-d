import type { Task } from "../../task/model/task";
export class Schedule {
  #id: string;
  #title: string;
  #startAt: Date;
  #endAt: Date;
  #task: Task;

  constructor(id: string, title: string, startAt: Date, endAt: Date, task: Task) {
    this.#id = id;
    this.#title = title;
    this.#startAt = startAt;
    this.#endAt = endAt;
    this.#task = task;
  }
  getId(): string {
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
