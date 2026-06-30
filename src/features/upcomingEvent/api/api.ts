import { createServerFn } from "@tanstack/react-start";
import { drizzleClient } from "#/db/drizzleClient";
import { idGenerator } from "#/features/id";
import type { UpcomingEvent, UpcomingEventId } from "../model/upcomingEvent";
import { UpcomingEventDrizzleRepository } from "../repository/upcomingEventDrizzle";
import { CreateUpcomingEventService } from "../service/create";
import { EditUpcomingEventService } from "../service/edit";
import { GetUpcomingEventService } from "../service/get";

export type UpcomingEventListItem = {
  id: UpcomingEventId;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};

const repository = new UpcomingEventDrizzleRepository(drizzleClient);
const getService = new GetUpcomingEventService(repository);
const createService = new CreateUpcomingEventService(idGenerator, repository);
const editService = new EditUpcomingEventService(repository);

const serializeUpcomingEvent = (
  event: UpcomingEvent,
): UpcomingEventListItem => ({
  id: event.getId(),
  title: event.getTitle(),
  description: event.getDescription(),
  startAt: event.getStartAt().toISOString(),
  endAt: event.getEndAt().toISOString(),
});

export const getUpcomingEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<UpcomingEventListItem[]> => {
    const events = await getService.getAll();

    return events.map(serializeUpcomingEvent);
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
    return serializeUpcomingEvent(event);
  });

export const editUpcomingEvent = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: UpcomingEventId;
      title: string;
      description: string;
      startAt: Date;
      endAt: Date;
    }) => data,
  )
  .handler(async ({ data }): Promise<UpcomingEventListItem> => {
    const event = await editService.handle(
      data.id,
      data.title,
      data.description,
      data.startAt,
      data.endAt,
    );

    return serializeUpcomingEvent(event);
  });
