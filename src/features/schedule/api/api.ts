import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import type { ScheduleId, Schedule as ScheduleModel } from "../model/schedule";
import { ScheduleDrizzleRepository } from "../repository/scheduleDrizzle";
import { EditScheduleService } from "../service/edit";
import { GetScheduleService } from "../service/get";

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

const scheduleRepository = new ScheduleDrizzleRepository(drizzleClient);
const getService = new GetScheduleService(scheduleRepository);
const editService = new EditScheduleService(scheduleRepository);

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
  async () => {
    throw new Error("not implemented yet.");
  },
);
