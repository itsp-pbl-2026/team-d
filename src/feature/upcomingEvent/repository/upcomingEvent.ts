import type { UpcomingEvent } from "../model/upcomingEvent";

export interface UpcomingEventRepository {
  save(event: UpcomingEvent): Promise<void>;
  findById(id: string): Promise<UpcomingEvent | undefined>;
  findAll(): Promise<UpcomingEvent[]>;
  delete(id: string): Promise<void>;
}
