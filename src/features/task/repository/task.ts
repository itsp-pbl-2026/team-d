import type { Task } from "../model/task";

export interface TaskRepository {
  findById(id: string): Promise<Task | undefined>;
  findAll(): Promise<Task[]>;

  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
