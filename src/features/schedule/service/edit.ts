import type { Task } from "#/features/task/model/task";
import { Schedule, type ScheduleId } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";

export class EditScheduleService {
  #scheduleRepository: ScheduleRepository;

  constructor(scheduleRepository: ScheduleRepository) {
    this.#scheduleRepository = scheduleRepository;
  }

  async handle(data: {
    id: ScheduleId;
    title?: string;
    startAt?: Date;
    endAt?: Date;
    task?: Task;
  }): Promise<Schedule> {
    const schedule = await this.#scheduleRepository.findById(data.id);
    if (schedule == null) {
      throw new Error("No Schedule found.");
    }

    const updated = new Schedule(
      schedule.getId(),
      data.title ?? schedule.getTitle(),
      data.startAt ?? schedule.getStartAt(),
      data.endAt ?? schedule.getEndAt(),
      data.task ?? schedule.getTask(),
    );

    await this.#scheduleRepository.save(updated);
    return updated;
  }
}
