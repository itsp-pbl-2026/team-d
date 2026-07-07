import dayjs, { type Dayjs } from "dayjs";
import type { FixedEvent, FreeSlot, TestCase } from "./types";

// LLM技術検証(Python schedule_tools.py の compute_free_slots)と同じロジック。
// 稼働可能時間から固定予定・blockedTimes を前後15分マージン込みで差し引く。
export const GAP_MIN = 15;
export const SPAN_MIN = 30;
export const SPAN_MAX = 120;
export const DEFAULT_WORKING_HOURS: [string, string][] = [
  ["09:00", "12:30"],
  ["13:30", "19:00"],
  ["20:00", "23:00"],
];

const parseTimeOfDay = (date: Dayjs, hhmm: string): Dayjs => {
  const [hour, minute] = hhmm.split(":").map(Number);
  return date
    .hour(hour ?? 0)
    .minute(minute ?? 0)
    .second(0)
    .millisecond(0);
};

const overlaps = (
  aStart: Dayjs,
  aEnd: Dayjs,
  bStart: Dayjs,
  bEnd: Dayjs,
): boolean => aStart.isBefore(bEnd) && bStart.isBefore(aEnd);

export const computeFreeSlots = (
  testCase: Pick<
    TestCase,
    "workingHours" | "fixedEvents" | "blockedTimes" | "tasks"
  >,
  gapMin: number = GAP_MIN,
): FreeSlot[] => {
  const windows =
    testCase.workingHours.length > 0
      ? testCase.workingHours
      : DEFAULT_WORKING_HOURS;
  const busy: [Dayjs, Dayjs][] = [
    ...testCase.fixedEvents.map((e): [Dayjs, Dayjs] => [
      dayjs(e.start),
      dayjs(e.end),
    ]),
    ...testCase.blockedTimes.map((e): [Dayjs, Dayjs] => [
      dayjs(e.start),
      dayjs(e.end),
    ]),
  ];

  const dates = new Set<string>();
  for (const [start, end] of busy) {
    dates.add(start.format("YYYY-MM-DD"));
    dates.add(end.format("YYYY-MM-DD"));
  }
  for (const task of testCase.tasks) {
    dates.add(dayjs(task.deadline).format("YYYY-MM-DD"));
  }
  if (dates.size === 0) return [];

  const sortedDates = [...dates].sort();
  const first = dayjs(sortedDates[0]);
  const last = dayjs(sortedDates[sortedDates.length - 1]);

  const margin = gapMin;
  const slots: FreeSlot[] = [];

  for (let cur = first; !cur.isAfter(last); cur = cur.add(1, "day")) {
    for (const [wStartStr, wEndStr] of windows) {
      const segStart = parseTimeOfDay(cur, wStartStr);
      const segEnd = parseTimeOfDay(cur, wEndStr);
      let free: [Dayjs, Dayjs][] = [[segStart, segEnd]];

      for (const [bStart, bEnd] of busy) {
        const bmStart = bStart.subtract(margin, "minute");
        const bmEnd = bEnd.add(margin, "minute");
        const nextFree: [Dayjs, Dayjs][] = [];
        for (const [fStart, fEnd] of free) {
          if (!overlaps(fStart, fEnd, bmStart, bmEnd)) {
            nextFree.push([fStart, fEnd]);
            continue;
          }
          if (fStart.isBefore(bmStart)) nextFree.push([fStart, bmStart]);
          if (bmEnd.isBefore(fEnd)) nextFree.push([bmEnd, fEnd]);
        }
        free = nextFree;
      }

      for (const [fStart, fEnd] of free) {
        const durationMin = fEnd.diff(fStart, "minute");
        if (durationMin >= SPAN_MIN) {
          slots.push({
            start: fStart.format("YYYY-MM-DDTHH:mm:ss"),
            end: fEnd.format("YYYY-MM-DDTHH:mm:ss"),
            durationMin,
          });
        }
      }
    }
  }

  return slots;
};

export type { FixedEvent };
