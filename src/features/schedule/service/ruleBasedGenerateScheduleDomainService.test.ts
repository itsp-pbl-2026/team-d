import { describe, expect, it } from "vitest";
import type {
  GenerateScheduleDomainServiceInput,
  GenerateScheduleResult,
} from "./generateDomainService";
import { RuleBasedGenerateScheduleDomainService } from "./ruleBasedGenerateScheduleDomainService";

const minutes = (end: Date, start: Date): number =>
  (end.getTime() - start.getTime()) / 60_000;

const hasGap = (aEnd: Date, bStart: Date): boolean =>
  minutes(bStart, aEnd) >= 15;

const isWithinWorkWindow = (start: Date, end: Date): boolean => {
  const windows = [
    [9 * 60, 12 * 60 + 30],
    [13 * 60 + 30, 19 * 60],
    [20 * 60, 23 * 60],
  ];
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();

  return (
    start.toDateString() === end.toDateString() &&
    windows.some(
      ([windowStart, windowEnd]) =>
        windowStart <= startMin && endMin <= windowEnd,
    )
  );
};

const assertValidSchedule = (
  input: GenerateScheduleDomainServiceInput,
  schedules: GenerateScheduleResult[],
) => {
  const tasksById = new Map(input.tasks.map((task) => [task.id, task]));
  const totals = new Map<string, number>();

  for (const schedule of schedules) {
    const task = tasksById.get(schedule.taskId);
    expect(task).toBeDefined();
    if (task == null) {
      continue;
    }
    const duration = minutes(schedule.endAt, schedule.startAt);
    expect(duration).toBeGreaterThanOrEqual(30);
    expect(duration).toBeLessThanOrEqual(120);
    expect(isWithinWorkWindow(schedule.startAt, schedule.endAt)).toBe(true);
    expect(schedule.endAt.getTime()).toBeLessThanOrEqual(
      task.deadline.getTime(),
    );
    totals.set(schedule.taskId, (totals.get(schedule.taskId) ?? 0) + duration);
  }

  for (const task of input.tasks) {
    const required = Math.max(task.estimatedMinutes - task.actualMinutes, 0);
    expect(totals.get(task.id) ?? 0).toBe(required);
  }

  const items = [
    ...input.events.map((event) => ({
      type: "event",
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
    })),
    ...schedules.map((schedule) => ({
      type: "task",
      title: schedule.taskId,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
    })),
  ].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  for (let i = 0; i < items.length - 1; i += 1) {
    const current = items[i];
    const next = items[i + 1];
    expect(current).toBeDefined();
    expect(next).toBeDefined();
    if (current == null || next == null) {
      continue;
    }
    if (current.type === "event" && next.type === "event") {
      continue;
    }
    expect(
      hasGap(current.endAt, next.startAt),
      `${current.title} and ${next.title} should have a 15 minute gap`,
    ).toBe(true);
  }
};

describe("RuleBasedGenerateScheduleDomainService", () => {
  it("固定予定・締切・稼働時間・15分間隔を満たすスケジュールを生成できる", async () => {
    const input: GenerateScheduleDomainServiceInput = {
      events: [
        {
          id: "event-1",
          title: "ゼミ",
          description: "",
          startAt: new Date("2026-07-08T10:45:00"),
          endAt: new Date("2026-07-08T12:25:00"),
        },
        {
          id: "event-2",
          title: "ソフトウェア開発方法論",
          description: "",
          startAt: new Date("2026-07-08T15:25:00"),
          endAt: new Date("2026-07-08T17:05:00"),
        },
        {
          id: "event-3",
          title: "システム開発プロジェクト基礎第二",
          description: "",
          startAt: new Date("2026-07-09T13:30:00"),
          endAt: new Date("2026-07-09T17:05:00"),
        },
        {
          id: "event-4",
          title: "情報リテラシーTA",
          description: "",
          startAt: new Date("2026-07-10T08:50:00"),
          endAt: new Date("2026-07-10T12:25:00"),
        },
        {
          id: "event-5",
          title: "ゼミ",
          description: "",
          startAt: new Date("2026-07-11T10:45:00"),
          endAt: new Date("2026-07-11T12:25:00"),
        },
        {
          id: "event-6",
          title: "ソフトウェア開発方法論",
          description: "",
          startAt: new Date("2026-07-11T15:25:00"),
          endAt: new Date("2026-07-11T17:05:00"),
        },
        {
          id: "event-7",
          title: "バイト",
          description: "",
          startAt: new Date("2026-07-12T10:00:00"),
          endAt: new Date("2026-07-12T19:00:00"),
        },
        {
          id: "event-8",
          title: "バイト",
          description: "",
          startAt: new Date("2026-07-14T10:00:00"),
          endAt: new Date("2026-07-14T19:00:00"),
        },
      ],
      tasks: [
        {
          id: "task-1",
          title: "研究進捗",
          description: "",
          deadline: new Date("2026-07-11T10:45:00"),
          estimatedMinutes: 360,
          actualMinutes: 0,
          priority: 10,
          progress: 0,
          status: "pending",
        },
        {
          id: "task-2",
          title: "発表スライド作成",
          description: "",
          deadline: new Date("2026-07-15T10:45:00"),
          estimatedMinutes: 300,
          actualMinutes: 0,
          priority: 10,
          progress: 0,
          status: "pending",
        },
        {
          id: "task-3",
          title: "ゲーム開発",
          description: "",
          deadline: new Date("2026-07-15T00:00:00"),
          estimatedMinutes: 240,
          actualMinutes: 0,
          priority: 5,
          progress: 0,
          status: "pending",
        },
      ],
    };
    const service = new RuleBasedGenerateScheduleDomainService({
      attempts: 500,
      candidateCount: 10,
      seed: 42,
      now: new Date("2026-07-08T08:00:00"),
    });

    const schedules = await service.handle(input);

    expect(schedules.length).toBeGreaterThan(0);
    assertValidSchedule(input, schedules);
  });
});
