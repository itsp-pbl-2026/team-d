import { eq } from "drizzle-orm";
import type { DrizzleClient } from "#/db/drizzleClient";
import { event as eventTable } from "#/db/schema";
import { UpcomingEvent, type UpcomingEventId } from "../model/upcomingEvent";
import type { UpcomingEventRepository } from "./upcomingEvent";

export class UpcomingEventDrizzleRepository implements UpcomingEventRepository {
  #db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.#db = db;
  }

  async save(event: UpcomingEvent): Promise<void> {
    await this.#db
      .insert(eventTable)
      .values({
        id: event.getId(),
        title: event.getTitle(),
        description: event.getDescription(),
        startAt: event.getStartAt(),
        endAt: event.getEndAt(),
      })
      .onConflictDoUpdate({
        target: eventTable.id,
        set: {
          title: event.getTitle(),
          description: event.getDescription(),
          startAt: event.getStartAt(),
          endAt: event.getEndAt(),
        },
      });
  }

  async findById(id: UpcomingEventId): Promise<UpcomingEvent | undefined> {
    const row = await this.#db.query.event.findFirst({
      where: eq(eventTable.id, id),
    });

    if (!row) {
      return undefined;
    }

    return new UpcomingEvent(
      row.id,
      row.title,
      row.description ?? "",
      row.startAt,
      row.endAt,
    );
  }

  async findAll(): Promise<UpcomingEvent[]> {
    const rows = await this.#db.query.event.findMany();

    return rows.map(
      (row) =>
        new UpcomingEvent(
          row.id,
          row.title,
          row.description ?? "",
          row.startAt,
          row.endAt,
        ),
    );
  }

  async delete(id: UpcomingEventId): Promise<void> {
    await this.#db.delete(eventTable).where(eq(eventTable.id, id));
  }
}
