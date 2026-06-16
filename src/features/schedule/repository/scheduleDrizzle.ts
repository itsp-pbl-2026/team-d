import { eq } from "drizzle-orm";
import { drizzleClient } from "../../../db/drizzleClient";
import { schedule as scheduleTable } from "../../../db/schema";
import { TaskDrizzleRepository } from "../../task/repository/taskDrizzle";
import { Schedule, type ScheduleId } from "../model/schedule";
import type { ScheduleRepository } from "./schedule";

export class ScheduleDrizzleRepository implements ScheduleRepository {
  #taskRepository: TaskDrizzleRepository;

  constructor() {
    this.#taskRepository = new TaskDrizzleRepository(drizzleClient);
  }

  async findById(id: ScheduleId): Promise<Schedule | undefined> {
    const resultSchedule = await drizzleClient.query.schedule.findFirst({
      where: eq(scheduleTable.id, id),
    });

    if (!resultSchedule) {
      return undefined;
    }

    const task = await this.#taskRepository.findById(resultSchedule.taskId);
    if (!task) {
      throw new Error("Task not found for the schedule");
    }

    return new Schedule(
      resultSchedule.id,
      resultSchedule.title,
      resultSchedule.startAt,
      resultSchedule.endAt,
      task,
    );
  }

  async findAll(): Promise<Schedule[]> {
    const allSchedulesFromTable = await drizzleClient.query.schedule.findMany();

    const allSchedules = await Promise.all(
      allSchedulesFromTable.map(async (oneSchedule) => {
        const task = await this.#taskRepository.findById(oneSchedule.taskId);
        if (!task) {
          throw new Error("Task not found for the schedule");
        }
        return new Schedule(
          oneSchedule.id,
          oneSchedule.title,
          oneSchedule.startAt,
          oneSchedule.endAt,
          task,
        );
      }),
    );

    return allSchedules;
  }

  async save(schedule: Schedule) {
    await drizzleClient
      .insert(scheduleTable)
      .values({
        id: schedule.getId(),
        title: schedule.getTitle(),
        startAt: schedule.getStartAt(),
        endAt: schedule.getEndAt(),
        taskId: schedule.getTask().getId(),
      })
      .onConflictDoUpdate({
        target: scheduleTable.id,
        set: {
          title: schedule.getTitle(),
          startAt: schedule.getStartAt(),
          endAt: schedule.getEndAt(),
          taskId: schedule.getTask().getId(),
        },
      });

    return;
  }

  async delete(id: ScheduleId) {
    await drizzleClient.delete(scheduleTable).where(eq(scheduleTable.id, id));
  }
}
