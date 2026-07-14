import type { ScheduleId } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";

export class DeleteScheduleService {
  #scheduleRepository: ScheduleRepository;

  constructor(scheduleRepository: ScheduleRepository) {
    this.#scheduleRepository = scheduleRepository;
  }

  async delete(id: ScheduleId): Promise<void> {
    await this.#scheduleRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.#scheduleRepository.deleteAll();
  }
}
