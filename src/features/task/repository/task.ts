import type { Task, TaskId } from "../model/task";

export interface TaskRepository {
  findById(id: TaskId): Promise<Task | undefined>;
  findAll(): Promise<Task[]>;

  save(task: Task): Promise<void>;
  delete(id: TaskId): Promise<void>;
}
