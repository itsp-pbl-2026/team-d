import type { UpcomingEventId } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";

export class DeleteUpcomingEventService {
  #upcomingEventRepository: UpcomingEventRepository;

  constructor(upcomingEventRepository: UpcomingEventRepository) {
    this.#upcomingEventRepository = upcomingEventRepository;
  }

  async delete(id: UpcomingEventId): Promise<void> {
    await this.#upcomingEventRepository.delete(id);
  }
}
