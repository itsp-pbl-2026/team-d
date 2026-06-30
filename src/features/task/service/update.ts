import { Task, type TaskId } from "../model/task";
import type { TaskRepository } from "../repository/task";

export class UpdateTaskService {
  #taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async handle(data: {
    id: string;
    title?: string;
    description?: string;
    deadline?: Date;
    estimatedMinutes?: number;
    actualMinutes?: number;
    priority?: number;
    progress?: number;
    status?: string;
  }): Promise<Task> {
    const task = await this.#taskRepository.findById(data.id as TaskId);
    if (task == null) {
      throw new Error("No Task found.");
    }

    const updated = new Task(
      task.getId(),
      data.title !== undefined ? data.title : task.getTitle(),
      data.description !== undefined ? data.description : task.getDescription(),
      data.deadline !== undefined ? data.deadline : task.getDeadline(),
      data.estimatedMinutes !== undefined ? data.estimatedMinutes : task.getEstimatedMinutes(),
      data.actualMinutes !== undefined ? data.actualMinutes : task.getActualMinutes(),
      data.priority !== undefined ? data.priority : task.getPriority(),
      data.progress !== undefined ? data.progress : task.getProgress(),
      data.status !== undefined ? data.status : task.getStatus(),
    );

    await this.#taskRepository.save(updated);
    return updated;
  }
}
