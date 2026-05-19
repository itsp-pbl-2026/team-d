import type { UpcomingEvent, UpcomingEventId } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";

export class GetUpcomingEventService {
  #upcomingEventRepository: UpcomingEventRepository;

  constructor(upcomingEventRepository: UpcomingEventRepository) {
    this.#upcomingEventRepository = upcomingEventRepository;
  }

  async getById(id: UpcomingEventId): Promise<UpcomingEvent> {
    const event = await this.#upcomingEventRepository.findById(id);
    if (event == null) {
      // TODO: Result型を作る?
      throw new Error("No event found.");
    }

    return event;
  }

  async getAll(): Promise<UpcomingEvent[]> {
    const events = await this.#upcomingEventRepository.findAll();
    return events;
  }
}
