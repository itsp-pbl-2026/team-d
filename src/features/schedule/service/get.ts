import type { Schedule } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";

export class GetScheduleService {
  #scheduleRepository: ScheduleRepository;

  constructor(scheduleRepository: ScheduleRepository) {
    this.#scheduleRepository = scheduleRepository;
  }

  async getAll(): Promise<Schedule[]> {
    const schedules = await this.#scheduleRepository.findAll();
    return schedules;
  }
}
