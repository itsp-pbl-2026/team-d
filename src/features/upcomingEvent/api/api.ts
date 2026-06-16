import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import { UpcomingEventDrizzleRepository } from "../repository/upcomingEventDrizzle";
import { GetUpcomingEventService } from "../service/get";

export type UpcomingEventListItem = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};
const repository = new UpcomingEventDrizzleRepository(drizzleClient);
const service = new GetUpcomingEventService(repository);

export const getUpcomingEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<UpcomingEventListItem[]> => {
    const events = await service.getAll();

    return events.map((event) => ({
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      startAt: event.getStartAt().toISOString(),
      endAt: event.getEndAt().toISOString(),
    }));
  },
);
