import { idGenerator } from "../../../features/id";
import { UpcomingEvent } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";

export class CreateUpcomingEventService {
  #upcomingEventRepository: UpcomingEventRepository;

  constructor(upcomingEventRepository: UpcomingEventRepository) {
    this.#upcomingEventRepository = upcomingEventRepository;
  }

  async handle(
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
  ): Promise<UpcomingEvent> {
    const eventId = idGenerator.generate<UpcomingEvent>();
    const event = new UpcomingEvent(
      eventId,
      title,
      description,
      startAt,
      endAt,
    );
    await this.#upcomingEventRepository.save(event);
    return event;
  }
}
