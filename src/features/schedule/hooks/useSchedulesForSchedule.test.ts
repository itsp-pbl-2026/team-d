import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import type { ScheduleListItem } from "../api/api";
import { moveScheduleKeepingDuration } from "./moveScheduleKeepingDuration";

const createSchedule = (
  overrides?: Partial<ScheduleListItem>,
): ScheduleListItem => ({
  id: "schedule-1" as ScheduleListItem["id"],
  startAt: "2026-07-14T01:00:00.000Z",
  endAt: "2026-07-14T02:30:00.000Z",
  task: {
    id: "task-1",
    title: "検証用タスク",
    description: "description",
  },
  ...overrides,
});

describe("moveScheduleKeepingDuration", () => {
  it("移動前の所要時間を維持したまま開始時刻だけ移動する", () => {
    const schedule = createSchedule();

    const moved = moveScheduleKeepingDuration(schedule, "2026-07-15 12:00:00");

    expect(moved.startAt).toBe("2026-07-15T03:00:00.000Z");
    expect(moved.endAt).toBe("2026-07-15T04:30:00.000Z");
    expect(dayjs(moved.endAt).diff(dayjs(moved.startAt), "minute")).toBe(90);
  });

  it("繰り返し移動しても長さが伸びない", () => {
    const onceMoved = moveScheduleKeepingDuration(
      createSchedule(),
      "2026-07-15 12:00:00",
    );

    const twiceMoved = moveScheduleKeepingDuration(
      onceMoved,
      "2026-07-16 09:30:00",
    );

    expect(
      dayjs(twiceMoved.endAt).diff(dayjs(twiceMoved.startAt), "minute"),
    ).toBe(90);
    expect(twiceMoved.startAt).toBe("2026-07-16T00:30:00.000Z");
    expect(twiceMoved.endAt).toBe("2026-07-16T02:00:00.000Z");
  });
});
