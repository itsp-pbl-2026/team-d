import { createServerFn } from "@tanstack/react-start";
import type { Task } from "../model/task";
import { TaskDrizzleRepository } from "../repository/taskDrizzle";
import { CreateTaskService } from "../service/create";
import { GetTaskService } from "../service/get";

export type TaskListItem = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: number;
  progress: number;
  status: string;
};

const serializeTask = (task: Task): TaskListItem => ({
  id: task.getId(),
  title: task.getTitle(),
  description: task.getDescription(),
  deadline: task.getDeadline().toISOString(),
  estimatedMinutes: task.getEstimatedMinutes(),
  actualMinutes: task.getActualMinutes(),
  priority: task.getPriority(),
  progress: task.getProgress(),
  status: task.getStatus(),
});

export const getTasks = createServerFn({ method: "GET" }).handler(
  async (): Promise<TaskListItem[]> => {
    const repo = new TaskDrizzleRepository();
    const service = new GetTaskService(repo);
    const tasks = await service.getAll();
    return tasks.map(serializeTask);
  },
);

export const createTask = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      description: string;
      deadline: string;
      estimatedMinutes: number;
      priority: number;
    }) => data,
  )
  .handler(async ({ data }): Promise<TaskListItem> => {
    const repo = new TaskDrizzleRepository();
    const service = new CreateTaskService(repo);

    const task = await service.handle(
      data.title,
      data.description,
      new Date(data.deadline),
      data.estimatedMinutes,
      data.priority,
    );
    return serializeTask(task);
  });
