import { eq } from "drizzle-orm";
import type { DrizzleClient } from "#/db/drizzleClient";
import { schedule as scheduleTable } from "#/db/schema";
import { Task } from "../../task/model/task";
import { Schedule, type ScheduleId } from "../model/schedule";
import type { ScheduleRepository } from "./schedule";

export class ScheduleDrizzleRepository implements ScheduleRepository {
  #db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.#db = db;
  }

  async findById(id: ScheduleId): Promise<Schedule | undefined> {
    const resultSchedule = await this.#db.query.schedule.findFirst({
      where: eq(scheduleTable.id, id),
      with: {
        task: true,
      },
    });

    if (!resultSchedule) {
      return undefined;
    }

    const task = new Task(
      resultSchedule.task.id,
      resultSchedule.task.title,
      resultSchedule.task.description ?? "",
      resultSchedule.task.deadline,
      resultSchedule.task.estimatedMinutes,
      resultSchedule.task.actualMinutes ?? 0,
      resultSchedule.task.priority ?? 0,
      resultSchedule.task.progress ?? 0,
      resultSchedule.task.status ?? "",
    );

    return new Schedule(
      resultSchedule.id,
      resultSchedule.title,
      resultSchedule.startAt,
      resultSchedule.endAt,
      task,
    );
  }

  async findAll(): Promise<Schedule[]> {
    const allSchedulesFromTable = await this.#db.query.schedule.findMany({
      with: {
        task: true,
      },
    });
    return allSchedulesFromTable.map((oneSchedule) => {
      const task = new Task(
        oneSchedule.task.id,
        oneSchedule.task.title,
        oneSchedule.task.description ?? "",
        oneSchedule.task.deadline,
        oneSchedule.task.estimatedMinutes,
        oneSchedule.task.actualMinutes ?? 0,
        oneSchedule.task.priority ?? 0,
        oneSchedule.task.progress ?? 0,
        oneSchedule.task.status ?? "",
      );

      return new Schedule(
        oneSchedule.id,
        oneSchedule.title,
        oneSchedule.startAt,
        oneSchedule.endAt,
        task,
      );
    });
  }

  async save(schedule: Schedule) {
    await this.#db
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
    await this.#db.delete(scheduleTable).where(eq(scheduleTable.id, id));
  }
}
