import { createServerFn } from "@tanstack/react-start";
import { TaskDrizzleRepository } from "../features/task/repository/taskDrizzle";
import { CreateTaskService } from "../features/task/service/create";
import { GetTaskService } from "../features/task/service/get";
import { Task } from "../features/task/model/task";

const serializeTask = (task: Task) => ({
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

export const getTasksFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const repo = new TaskDrizzleRepository();
    const service = new GetTaskService(repo);
    const tasks = await service.getAll();
    return tasks.map(serializeTask);
  });

export const createTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: {
    title: string;
    description: string;
    deadline: string;
    estimatedMinutes: number;
    priority: number;
  }) => data)
  .handler(async ({ data }) => {
    const repo = new TaskDrizzleRepository();
    const service = new CreateTaskService(repo);

    const task = await service.handle(
      data.title,
      data.description,
      new Date(data.deadline),
      data.estimatedMinutes,
      data.priority
    );
    return serializeTask(task);
  });
