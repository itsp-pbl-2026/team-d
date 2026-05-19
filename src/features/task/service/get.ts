import type { Task } from "../model/task";
import type { TaskRepository } from "../repository/task"

export class GetTaskService {
 #taskRepository: TaskRepository;

 constructor(taskRepository: TaskRepository) {
  this.#taskRepository = taskRepository;
 }

 async getById(id: string): Promise<Task> {
  const task = await this.#taskRepository.findById(id);
  if (task == null) {
   // TODO: Result型を作る?
   throw new Error("No event found.");
  }

  return task;
 }

 async getAll(): Promise<Task[]> {
  const tasks = await this.#taskRepository.findAll();
  return tasks;
 }
}