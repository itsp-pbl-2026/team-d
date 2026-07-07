import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import { TaskDrizzleRepository } from "#/features/task/repository/taskDrizzle";
import { UpcomingEventDrizzleRepository } from "#/features/upcomingEvent/repository/upcomingEventDrizzle";
import type { Schedule } from "../model/schedule";
import { ScheduleDrizzleRepository } from "../repository/scheduleDrizzle";
import { GeminiGenerateScheduleDomainService } from "../service/geminiDomainService";
import { GenerateScheduleService } from "../service/generate";
import { GetScheduleService } from "../service/get";

export type ScheduleListItem = {
  id: string;
  startAt: Date;
  endAt: Date;
  task: {
    id: string;
    title: string;
    description: string;
  };
};

const taskRepository = new TaskDrizzleRepository(drizzleClient);
const upcomingEventRepository = new UpcomingEventDrizzleRepository(
  drizzleClient,
);
const scheduleRepository = new ScheduleDrizzleRepository(drizzleClient);
const generateScheduleDomainService = new GeminiGenerateScheduleDomainService();

const getService = new GetScheduleService(scheduleRepository);
const generateService = new GenerateScheduleService(
  taskRepository,
  upcomingEventRepository,
  scheduleRepository,
  generateScheduleDomainService,
);

const serializeSchedule = (schedule: Schedule): ScheduleListItem => {
  const task = schedule.getTask();
  return {
    id: schedule.getId(),
    startAt: schedule.getStartAt(),
    endAt: schedule.getEndAt(),
    task: {
      id: task.getId(),
      title: task.getTitle(),
      description: task.getDescription(),
    },
  };
};

export const getSchedules = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScheduleListItem[]> => {
    const schedules = await getService.getAll();
    return schedules.map(serializeSchedule);
  },
);

export const generateSchedules = createServerFn({ method: "POST" }).handler(
  async (): Promise<ScheduleListItem[]> => {
    const schedules = await generateService.handle();
    return schedules.map(serializeSchedule);
  },
);
