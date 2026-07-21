import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import { TaskDrizzleRepository } from "#/features/task/repository/taskDrizzle";
import { UpcomingEventDrizzleRepository } from "#/features/upcomingEvent/repository/upcomingEventDrizzle";
import type { ScheduleId, Schedule as ScheduleModel } from "../model/schedule";
import { ScheduleDrizzleRepository } from "../repository/scheduleDrizzle";
import { DeleteScheduleService } from "../service/delete";
import { EditScheduleService } from "../service/edit";
import { GeminiGenerateScheduleDomainService } from "../service/geminiDomainService";
import { GenerateScheduleService } from "../service/generate";
import { GetScheduleService } from "../service/get";
import { RuleBasedGenerateScheduleDomainService } from "../service/ruleBasedGenerateScheduleDomainService";

export type ScheduleListItem = {
  id: ScheduleId;
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
const geminiGenerateScheduleDomainService =
  new GeminiGenerateScheduleDomainService();
const ruleBasedGenerateScheduleDomainService =
  new RuleBasedGenerateScheduleDomainService();

const getService = new GetScheduleService(scheduleRepository);
const editService = new EditScheduleService(scheduleRepository);
const deleteService = new DeleteScheduleService(scheduleRepository);
const generateService = new GenerateScheduleService(
  taskRepository,
  upcomingEventRepository,
  scheduleRepository,
  geminiGenerateScheduleDomainService,
);
const ruleBasedGenerateService = new GenerateScheduleService(
  taskRepository,
  upcomingEventRepository,
  scheduleRepository,
  ruleBasedGenerateScheduleDomainService,
);

const serializeSchedule = (schedule: ScheduleModel): ScheduleListItem => {
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

export const editSchedule = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: ScheduleId; startAt?: Date; endAt?: Date }) => data,
  )
  .handler(async ({ data }): Promise<ScheduleListItem> => {
    const schedule = await editService.handle(data);

    return serializeSchedule(schedule);
  });

export const generateSchedules = createServerFn({ method: "POST" }).handler(
  async (): Promise<ScheduleListItem[]> => {
    await deleteService.deleteAll();
    const schedules = await generateService.handle();
    return schedules.map(serializeSchedule);
  },
);

export const generateRuleBasedSchedules = createServerFn({
  method: "POST",
}).handler(async (): Promise<ScheduleListItem[]> => {
  await deleteService.deleteAll();
  const schedules = await ruleBasedGenerateService.handle();
  return schedules.map(serializeSchedule);
});
