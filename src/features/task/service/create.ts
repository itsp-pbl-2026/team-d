import type { Task } from "../model/task";
import type { TaskRepository } from "../repository/task"

export class CreateTaskService {
  #taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async save(task: Task): Promise<void> {
    await this.#taskRepository.save(task);
    return;
  }

}