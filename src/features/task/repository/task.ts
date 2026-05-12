import type { Task } from "../model/task";

interface TaskRepository {
  findbyId(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;

  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
