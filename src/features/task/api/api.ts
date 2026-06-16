import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
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

const repository = new TaskDrizzleRepository(drizzleClient);
const getService = new GetTaskService(repository);
const createService = new CreateTaskService(repository);

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
    const tasks = await getService.getAll();
    return tasks.map(serializeTask);
  },
);

export const createTask = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      description: string;
      deadline: Date;
      estimatedMinutes: number;
      priority: number;
    }) => data,
  )
  .handler(async ({ data }): Promise<TaskListItem> => {
    const task = await createService.handle(
      data.title,
      data.description,
      data.deadline,
      data.estimatedMinutes,
      data.priority,
    );
    return serializeTask(task);
  });
