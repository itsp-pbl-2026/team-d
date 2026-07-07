import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import { ScheduleDrizzleRepository } from "../repository/scheduleDrizzle";
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

const scheduleRepository = new ScheduleDrizzleRepository(drizzleClient);
const getService = new GetScheduleService(scheduleRepository);

export const getSchedules = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScheduleListItem[]> => {
    const schedules = await getService.getAll();
    return schedules.map((schedule) => {
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
    });
  },
);
