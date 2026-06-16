import { idGenerator } from "#/features/id";
import { Task } from "../model/task";
import type { TaskRepository } from "../repository/task";

export class CreateTaskService {
  #taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async handle(
    title: string,
    description: string,
    deadline: Date,
    estimatedMinutes: number,
    priority?: number,
  ): Promise<Task> {
    const taskId = idGenerator.generate<Task>();
    const task = new Task(
      taskId,
      title,
      description,
      deadline,
      estimatedMinutes,
      0, // actualMinutesは初期値0
      priority ?? 0,
      0, // progressは初期値0
      "pending", // statusは初期値"pending"
    );
    await this.#taskRepository.save(task);
    return task;
  }
}
