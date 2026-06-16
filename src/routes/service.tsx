import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { idGenerator } from "../features/id";
import type { Task } from "../features/task/model/task";
import { TaskDrizzleRepository } from "../features/task/repository/taskDrizzle";
import { CreateTaskService } from "../features/task/service/create";
import { GetTaskService } from "../features/task/service/get";
import type { UpcomingEvent } from "../features/upcomingEvent/model/upcomingEvent";
import { UpcomingEventDrizzleRepository } from "../features/upcomingEvent/repository/upcomingEventDrizzle";
import { CreateUpcomingEventService } from "../features/upcomingEvent/service/create";
import { GetUpcomingEventService } from "../features/upcomingEvent/service/get";

export const Route = createFileRoute("/service")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/service"!</div>;
}

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

export const getTasksFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const repo = new TaskDrizzleRepository();
    const service = new GetTaskService(repo);
    const tasks = await service.getAll();
    return tasks.map(serializeTask);
  },
);

export const createTaskFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      description: string;
      deadline: string;
      estimatedMinutes: number;
      priority: number;
    }) => data,
  )
  .handler(async ({ data }) => {
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

export const serializeEvent = (event: UpcomingEvent) => ({
  id: event.getId(),
  title: event.getTitle(),
  description: event.getDescription(),
  startAt: event.getStartAt().toISOString(),
  endAt: event.getEndAt().toISOString(),
});

export const getUpcomingEventsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const repo = new UpcomingEventDrizzleRepository();
    const service = new GetUpcomingEventService(repo);
    const events = await service.getAll();
    return events.map(serializeEvent);
  },
);

export const createUpcomingEventFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      description: string;
      startAt: string;
      endAt: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const repo = new UpcomingEventDrizzleRepository();
    const service = new CreateUpcomingEventService(idGenerator, repo);

    const event = await service.handle(
      data.title,
      data.description,
      new Date(data.startAt),
      new Date(data.endAt),
    );
    return serializeEvent(event);
  });
