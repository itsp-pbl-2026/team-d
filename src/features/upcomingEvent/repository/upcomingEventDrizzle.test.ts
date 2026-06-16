import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { SQLiteInsertValue } from "drizzle-orm/sqlite-core";
import { seed } from "drizzle-seed";
import { assert, describe, expect, test } from "vitest";
import {
  createTestDrizzleClient,
  type DrizzleClient,
  schema,
} from "#/db/drizzleClient";
import { event } from "#/db/schema";
import { IdGenerator } from "#/features/id";
import { UpcomingEvent, type UpcomingEventId } from "../model/upcomingEvent";
import { UpcomingEventDrizzleRepository } from "./upcomingEventDrizzle";

const testIdGenerator = new IdGenerator();
const eventId = testIdGenerator.generate<UpcomingEvent>();
const createUpcomingEvent = (overrides?: {
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
}) =>
  new UpcomingEvent(
    eventId,
    overrides?.title ?? "",
    overrides?.description ?? "",
    overrides?.startAt ?? new Date(),
    overrides?.endAt ?? new Date(),
  );
const insertEvent = (
  db: DrizzleClient,
  value: SQLiteInsertValue<typeof event>,
) => db.insert(event).values(value);

const it = test.extend<{
  db: DrizzleClient;
  seed: (options?: { count?: number }) => Promise<void>;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: fixture関数の第1引数は分割代入パターンでなくてはならないため
  db: async ({}, use) => {
    const testDrizzleClient = createTestDrizzleClient();
    migrate(testDrizzleClient, { migrationsFolder: "./drizzle" });
    await use(testDrizzleClient);
  },
  seed: async ({ db }, use) => {
    await use((options) =>
      // @ts-expect-error drizzle-seedの不具合, v1で修正される予定
      seed(db, schema, { count: options?.count }).refine((f) => ({
        event: {
          columns: {
            description: f.default({ defaultValue: undefined }), // descriptionカラムはnullable
          },
        },
      })),
    );
  },
});

describe("UpcomingEventDrizzleRepository", () => {
  it("インスタンスが生成できる", ({ db }) => {
    const repository = new UpcomingEventDrizzleRepository(db);

    expect(repository).toBeInstanceOf(UpcomingEventDrizzleRepository);
  });

  describe("findById", () => {
    it("データを取得できる", async ({ db }) => {
      const startAt = new Date("2026-06-16");
      const endAt = new Date("2026-06-17");
      await insertEvent(db, {
        id: eventId,
        title: "title",
        startAt,
        endAt,
      });

      const repository = new UpcomingEventDrizzleRepository(db);
      const event = await repository.findById(eventId);

      expect(event).not.toBeUndefined();
      assert(event != null);

      expect(event.getId()).toBe(eventId);
      expect(event.getTitle()).toBe("title");
      expect(event.getDescription()).toBe("");
      expect(event.getStartAt()).toEqual(startAt);
      expect(event.getEndAt()).toEqual(endAt);
    });

    it("存在しないidではundefinedになる", async ({ db }) => {
      const repository = new UpcomingEventDrizzleRepository(db);
      const event = await repository.findById("" as UpcomingEventId);

      expect(event).toBeUndefined();
    });
  });

  describe("findAll", () => {
    it("データを取得できる", async ({ db, seed }) => {
      await seed({ count: 100 });

      const repository = new UpcomingEventDrizzleRepository(db);
      const events = await repository.findAll();

      expect(events).toHaveLength(100);
    });

    it("データが存在しない場合では空配列になる", async ({ db }) => {
      const repository = new UpcomingEventDrizzleRepository(db);
      const events = await repository.findAll();

      expect(events).toHaveLength(0);
    });
  });

  describe("save", () => {
    it("データを保存できる", async ({ db }) => {
      const repository = new UpcomingEventDrizzleRepository(db);

      const title = "title";
      const description = "description";
      const startAt = new Date("2026-05-20");
      const endAt = new Date("2026-05-21");
      const event = createUpcomingEvent({ title, description, startAt, endAt });
      await repository.save(event);

      const eventSaved = await repository.findById(eventId);

      expect(eventSaved).not.toBeUndefined();
      assert(eventSaved != null);

      expect(eventSaved.getId()).toBe(eventId);
      expect(eventSaved.getTitle()).toBe(title);
      expect(eventSaved.getDescription()).toBe(description);
      expect(eventSaved.getStartAt()).toStrictEqual(startAt);
      expect(eventSaved.getEndAt()).toStrictEqual(endAt);
    });

    it("既に存在するidではデータが更新される", async ({ db }) => {
      const repository = new UpcomingEventDrizzleRepository(db);

      const event1 = createUpcomingEvent();
      await repository.save(event1);

      const title = "title";
      const description = "description";
      const startAt = new Date("2026-05-20");
      const endAt = new Date("2026-05-21");
      const event2 = createUpcomingEvent({
        title,
        description,
        startAt,
        endAt,
      });
      await repository.save(event2);

      const eventSaved = await repository.findById(eventId);

      expect(eventSaved).not.toBeUndefined();
      assert(eventSaved != null);

      expect(eventSaved.getId()).toBe(eventId);
      expect(eventSaved.getTitle()).toBe(title);
      expect(eventSaved.getDescription()).toBe(description);
      expect(eventSaved.getStartAt()).toStrictEqual(startAt);
      expect(eventSaved.getEndAt()).toStrictEqual(endAt);
    });
  });

  describe("delete", () => {
    it("データを削除できる", async ({ db }) => {
      await insertEvent(db, {
        id: eventId,
        title: "",
        startAt: new Date(),
        endAt: new Date(),
      });

      const repository = new UpcomingEventDrizzleRepository(db);
      await repository.delete(eventId);

      const eventDeleted = await repository.findById(eventId);

      expect(eventDeleted).toBeUndefined();
    });

    it("存在しないidでもエラーにならない", async ({ db }) => {
      const repository = new UpcomingEventDrizzleRepository(db);

      await expect(repository.delete("" as UpcomingEventId)).resolves.toBe(
        undefined,
      );
    });
  });
});
