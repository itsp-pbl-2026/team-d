import { UpcomingEvent, type UpcomingEventId } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";

export class EditUpcomingEventService {
  #upcomingEventRepository: UpcomingEventRepository;

  constructor(upcomingEventRepository: UpcomingEventRepository) {
    this.#upcomingEventRepository = upcomingEventRepository;
  }

  async handle(
    id: UpcomingEventId,
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
  ): Promise<UpcomingEvent> {
    const event = await this.#upcomingEventRepository.findById(id);
    if (event == null) {
      throw new Error("No event found.");
    }

    const editedEvent = new UpcomingEvent(
      id,
      title,
      description,
      startAt,
      endAt,
    );
    await this.#upcomingEventRepository.save(editedEvent);

    return editedEvent;
  }
}
