import type { UpcomingEvent, UpcomingEventId } from "../model/upcomingEvent";

export interface UpcomingEventRepository {
  save(event: UpcomingEvent): Promise<void>;
  findById(id: UpcomingEventId): Promise<UpcomingEvent | undefined>;
  findAll(): Promise<UpcomingEvent[]>;
  delete(id: UpcomingEventId): Promise<void>;
}
