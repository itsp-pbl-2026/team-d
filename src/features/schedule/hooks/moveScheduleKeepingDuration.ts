import dayjs from "dayjs";
import type { ScheduleListItem } from "../api/api";

export const moveScheduleKeepingDuration = (
  schedule: ScheduleListItem,
  newStart: string,
): ScheduleListItem => {
  const durationMs = dayjs(schedule.endAt).diff(
    dayjs(schedule.startAt),
    "millisecond",
  );
  const movedStart = dayjs(newStart);

  return {
    ...schedule,
    startAt: movedStart.toISOString(),
    endAt: movedStart.add(durationMs, "millisecond").toISOString(),
  };
};
