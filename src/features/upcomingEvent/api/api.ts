import { createServerFn } from "@tanstack/react-start";
import { idGenerator } from "#/features/id";
import { UpcomingEventDrizzleRepository } from "../repository/upcomingEventDrizzle";
import { CreateUpcomingEventService } from "../service/create";
import { GetUpcomingEventService } from "../service/get";

export type UpcomingEventListItem = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};

const repository = new UpcomingEventDrizzleRepository();
const getService = new GetUpcomingEventService(repository);
const createService = new CreateUpcomingEventService(idGenerator, repository);

export const getUpcomingEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<UpcomingEventListItem[]> => {
    const events = await getService.getAll();

    return events.map((event) => ({
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      startAt: event.getStartAt().toISOString(),
      endAt: event.getEndAt().toISOString(),
    }));
  },
);

export const createUpcomingEvent = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      description: string;
      startAt: Date;
      endAt: Date;
    }) => data,
  )
  .handler(async ({ data }): Promise<UpcomingEventListItem> => {
    const event = await createService.handle(
      data.title,
      data.description,
      data.startAt,
      data.endAt,
    );
    return {
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      startAt: event.getStartAt().toISOString(),
      endAt: event.getEndAt().toISOString(),
    };
  });
