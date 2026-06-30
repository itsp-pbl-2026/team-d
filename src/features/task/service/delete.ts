import { type TaskId } from "../model/task";
import type { TaskRepository } from "../repository/task";

export class DeleteTaskService {
  #taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async handle(id: string): Promise<void> {
    await this.#taskRepository.delete(id as TaskId);
  }
}
