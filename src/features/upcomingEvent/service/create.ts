import type { IdGenerator } from "#/features/id";
import { UpcomingEvent } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "../repository/upcomingEvent";

export class CreateUpcomingEventService {
  #idGenerator: IdGenerator;
  #upcomingEventRepository: UpcomingEventRepository;

  constructor(
    idGenerator: IdGenerator,
    upcomingEventRepository: UpcomingEventRepository,
  ) {
    this.#upcomingEventRepository = upcomingEventRepository;
    this.#idGenerator = idGenerator;
  }

  async handle(
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
  ): Promise<UpcomingEvent> {
    const id = this.#idGenerator.generate<UpcomingEvent>();
    const upcomingEvent = new UpcomingEvent(
      id,
      title,
      description,
      startAt,
      endAt,
    );
    await this.#upcomingEventRepository.save(upcomingEvent);
    return upcomingEvent;
  }
}
