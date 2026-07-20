import type {
  GenerateScheduleDomainService,
  GenerateScheduleDomainServiceInput,
  GenerateScheduleEvent,
  GenerateScheduleResult,
  GenerateScheduleTask,
} from "./generateDomainService";

type TimeWindow = {
  start: Date;
  end: Date;
};

type ScheduleCandidateItem = {
  taskId: string;
  taskTitle: string;
  startAt: Date;
  endAt: Date;
  duration: number;
};

export type RuleBasedScheduleCandidate = {
  candidateId: number;
  strategy: Strategy;
  score: number;
  dailyTotals: Record<string, number>;
  schedules: GenerateScheduleResult[];
};

type Strategy =
  | "early"
  | "late"
  | "morning"
  | "avoidNight"
  | "spread"
  | "compact"
  | "random";

type SpanTemplate = {
  taskId: string;
  taskTitle: string;
  duration: number;
  deadline: Date;
  priority: number;
};

type RuleBasedGenerateScheduleDomainServiceOptions = {
  attempts?: number;
  candidateCount?: number;
  seed?: number;
  now?: Date;
};

const MIN_SPAN_MINUTES = 30;
const MAX_SPAN_MINUTES = 120;
const GAP_MINUTES = 15;
const STEP_MINUTES = 15;
const WORK_WINDOWS = [
  { startHour: 9, startMinute: 0, endHour: 12, endMinute: 30 },
  { startHour: 13, startMinute: 30, endHour: 19, endMinute: 0 },
  { startHour: 20, startMinute: 0, endHour: 23, endMinute: 0 },
] as const;
const STRATEGIES: Strategy[] = [
  "early",
  "late",
  "morning",
  "avoidNight",
  "spread",
  "compact",
  "random",
];

class SeededRandom {
  #state: number;

  constructor(seed: number) {
    this.#state = seed >>> 0;
  }

  next(): number {
    this.#state = (1664525 * this.#state + 1013904223) >>> 0;
    return this.#state / 2 ** 32;
  }

  int(minInclusive: number, maxInclusive: number): number {
    return (
      minInclusive +
      Math.floor(this.next() * (maxInclusive - minInclusive + 1))
    );
  }

  choice<T>(items: readonly T[]): T {
    const item = items[Math.floor(this.next() * items.length)];
    if (item == null) {
      throw new Error("Cannot choose from an empty array");
    }
    return item;
  }

  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [items[i], items[j]] = [items[j] as T, items[i] as T];
    }
    return items;
  }
}

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

const diffMinutes = (end: Date, start: Date): number =>
  (end.getTime() - start.getTime()) / 60_000;

const sameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const atTime = (
  date: Date,
  hour: number,
  minute: number,
): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const ceilToStepMinutes = (date: Date, stepMinutes: number): Date => {
  const stepMs = stepMinutes * 60_000;
  return new Date(Math.ceil(date.getTime() / stepMs) * stepMs);
};

const formatLocalIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  const second = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

const remainingTaskMinutes = (task: GenerateScheduleTask): number =>
  Math.max(task.estimatedMinutes - task.actualMinutes, 0);

const splitTaskDurationRandom = (
  totalMinutes: number,
  rng: SeededRandom,
): number[] => {
  const minCount = Math.max(1, Math.ceil(totalMinutes / MAX_SPAN_MINUTES));
  const maxCount = Math.max(minCount, Math.floor(totalMinutes / MIN_SPAN_MINUTES));
  const spanCount = rng.int(minCount, maxCount);
  const durations = Array.from({ length: spanCount }, () => MIN_SPAN_MINUTES);
  let remaining = totalMinutes - MIN_SPAN_MINUTES * spanCount;

  while (remaining > 0) {
    const adjustable = durations
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value < MAX_SPAN_MINUTES);
    if (adjustable.length === 0) {
      break;
    }
    const { index } = rng.choice(adjustable);
    const currentDuration = durations[index];
    if (currentDuration == null) {
      throw new Error("Invalid duration index");
    }
    const add = Math.min(
      remaining,
      STEP_MINUTES,
      MAX_SPAN_MINUTES - currentDuration,
    );
    durations[index] = currentDuration + add;
    remaining -= add;
  }

  return rng.shuffle(durations);
};

const subtractBlockedWindow = (
  segments: TimeWindow[],
  blocked: TimeWindow,
): TimeWindow[] => {
  const nextSegments: TimeWindow[] = [];
  for (const segment of segments) {
    if (blocked.end <= segment.start || segment.end <= blocked.start) {
      nextSegments.push(segment);
      continue;
    }
    if (segment.start < blocked.start) {
      nextSegments.push({
        start: segment.start,
        end: new Date(Math.min(segment.end.getTime(), blocked.start.getTime())),
      });
    }
    if (blocked.end < segment.end) {
      nextSegments.push({
        start: new Date(Math.max(segment.start.getTime(), blocked.end.getTime())),
        end: segment.end,
      });
    }
  }
  return nextSegments;
};

const calculateAvailableWindows = (
  events: GenerateScheduleEvent[],
  planningStart: Date,
  planningEnd: Date,
): TimeWindow[] => {
  const blockedWindows = events.map((event) => ({
    start: addMinutes(event.startAt, -GAP_MINUTES),
    end: addMinutes(event.endAt, GAP_MINUTES),
  }));
  const windows: TimeWindow[] = [];
  let currentDate = startOfDay(planningStart);
  const finalDate = startOfDay(planningEnd);

  while (currentDate <= finalDate) {
    for (const workWindow of WORK_WINDOWS) {
      const workStart = atTime(
        currentDate,
        workWindow.startHour,
        workWindow.startMinute,
      );
      const segmentStart = sameDate(currentDate, planningStart)
        ? new Date(Math.max(workStart.getTime(), ceilToStepMinutes(planningStart, STEP_MINUTES).getTime()))
        : workStart;
      const segmentEnd = atTime(currentDate, workWindow.endHour, workWindow.endMinute);
      if (segmentStart >= segmentEnd) {
        continue;
      }
      let segments: TimeWindow[] = [
        {
          start: segmentStart,
          end: segmentEnd,
        },
      ];
      for (const blocked of blockedWindows) {
        segments = subtractBlockedWindow(segments, blocked);
      }
      windows.push(
        ...segments.filter(
          (segment) => diffMinutes(segment.end, segment.start) >= MIN_SPAN_MINUTES,
        ),
      );
    }
    currentDate = addMinutes(currentDate, 24 * 60);
  }

  return windows;
};

const overlapsWithGap = (
  start: Date,
  end: Date,
  placedItems: readonly ScheduleCandidateItem[],
): boolean =>
  placedItems.some(
    (item) =>
      start < addMinutes(item.endAt, GAP_MINUTES) &&
      addMinutes(end, GAP_MINUTES) > item.startAt,
  );

const mergeAdjacentSameTask = (
  schedule: readonly ScheduleCandidateItem[],
): ScheduleCandidateItem[] => {
  const items = [...schedule].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  const merged: ScheduleCandidateItem[] = [];

  for (const item of items) {
    const current = { ...item };
    const previous = merged.at(-1);
    if (previous == null) {
      merged.push(current);
      continue;
    }

    const gap = diffMinutes(current.startAt, previous.endAt);
    const combinedDuration = previous.duration + current.duration;
    if (
      previous.taskId === current.taskId &&
      sameDate(previous.startAt, current.startAt) &&
      gap >= 0 &&
      gap <= GAP_MINUTES &&
      combinedDuration <= MAX_SPAN_MINUTES
    ) {
      previous.endAt = addMinutes(previous.startAt, combinedDuration);
      previous.duration = combinedDuration;
    } else {
      merged.push(current);
    }
  }

  return merged;
};

const candidateSortKey = (
  strategy: Strategy,
  start: Date,
  end: Date,
  placed: readonly ScheduleCandidateItem[],
  rng: SeededRandom,
): [number, number, number, number] => {
  if (strategy === "early") {
    return [start.getTime(), rng.next(), 0, 0];
  }
  if (strategy === "late") {
    return [-start.getTime(), rng.next(), 0, 0];
  }
  if (strategy === "morning") {
    return [start.getHours() < 12 ? 0 : 1, start.getTime(), rng.next(), 0];
  }
  if (strategy === "avoidNight") {
    return [start.getHours() >= 20 ? 1 : 0, start.getTime(), rng.next(), 0];
  }
  if (strategy === "spread") {
    const dateMinutes = new Map<string, number>();
    for (const item of placed) {
      const key = dateKey(item.startAt);
      dateMinutes.set(key, (dateMinutes.get(key) ?? 0) + item.duration);
    }
    return [dateMinutes.get(dateKey(start)) ?? 0, start.getTime(), rng.next(), 0];
  }
  if (strategy === "compact") {
    if (placed.length === 0) {
      return [start.getTime(), rng.next(), 0, 0];
    }
    const sameDayCount = placed.filter((item) => sameDate(item.startAt, start)).length;
    const nearestGap = Math.min(
      ...placed.map((item) =>
        item.endAt <= start
          ? Math.abs(diffMinutes(start, item.endAt))
          : Math.abs(diffMinutes(item.startAt, end)),
      ),
    );
    return [-sameDayCount, nearestGap, start.getTime(), rng.next()];
  }
  return [rng.next(), 0, 0, 0];
};

const compareNumberTuple = (
  a: readonly number[],
  b: readonly number[],
): number => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
};

const buildRandomScheduleOnce = (
  input: GenerateScheduleDomainServiceInput,
  availableWindows: readonly TimeWindow[],
  rng: SeededRandom,
  strategy: Strategy,
): { schedule: ScheduleCandidateItem[]; strategy: Strategy } | null => {
  const spans: SpanTemplate[] = [];
  for (const task of input.tasks) {
    const remaining = remainingTaskMinutes(task);
    if (remaining === 0) {
      continue;
    }
    for (const duration of splitTaskDurationRandom(remaining, rng)) {
      spans.push({
        taskId: task.id,
        taskTitle: task.title,
        duration,
        deadline: task.deadline,
        priority: task.priority,
      });
    }
  }

  rng.shuffle(spans);
  if (strategy === "late" || strategy === "random") {
    spans.sort(() => rng.next() - 0.5);
  } else {
    spans.sort((a, b) => {
      const deadlineDiff = a.deadline.getTime() - b.deadline.getTime();
      if (deadlineDiff !== 0) {
        return deadlineDiff;
      }
      const priorityDiff = b.priority - a.priority;
      return priorityDiff !== 0 ? priorityDiff : rng.next() - 0.5;
    });
  }

  const placed: ScheduleCandidateItem[] = [];
  for (const span of spans) {
    const candidates: TimeWindow[] = [];
    for (const window of availableWindows) {
      const latestEnd = new Date(
        Math.min(window.end.getTime(), span.deadline.getTime()),
      );
      const latestStart = addMinutes(latestEnd, -span.duration);
      let current = window.start;
      while (current <= latestStart) {
        const end = addMinutes(current, span.duration);
        if (!overlapsWithGap(current, end, placed)) {
          candidates.push({ start: current, end });
        }
        current = addMinutes(current, STEP_MINUTES);
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    const keyedCandidates = candidates.map((candidate) => ({
      candidate,
      key: candidateSortKey(
        strategy,
        candidate.start,
        candidate.end,
        placed,
        rng,
      ),
    }));
    keyedCandidates.sort((a, b) => compareNumberTuple(a.key, b.key));
    const sortedCandidates = keyedCandidates.map(({ candidate }) => candidate);
    const sampleWidth =
      strategy === "random"
        ? sortedCandidates.length
        : Math.min(sortedCandidates.length, rng.int(8, 40));
    const chosen = rng.choice(sortedCandidates.slice(0, sampleWidth));
    placed.push({
      taskId: span.taskId,
      taskTitle: span.taskTitle,
      startAt: chosen.start,
      endAt: chosen.end,
      duration: span.duration,
    });
  }

  return { schedule: mergeAdjacentSameTask(placed), strategy };
};

const isWithinWorkWindow = (start: Date, end: Date): boolean =>
  WORK_WINDOWS.some((window) => {
    const windowStart = atTime(start, window.startHour, window.startMinute);
    const windowEnd = atTime(start, window.endHour, window.endMinute);
    return sameDate(start, end) && windowStart <= start && end <= windowEnd;
  });

const validateSchedule = (
  input: GenerateScheduleDomainServiceInput,
  schedule: readonly ScheduleCandidateItem[],
): string[] => {
  const errors: string[] = [];
  const tasksById = new Map(input.tasks.map((task) => [task.id, task]));
  const scheduledMinutes = new Map<string, number>();

  for (const item of schedule) {
    const task = tasksById.get(item.taskId);
    if (task == null) {
      errors.push(`Unknown task: ${item.taskId}`);
      continue;
    }
    if (item.duration < MIN_SPAN_MINUTES || item.duration > MAX_SPAN_MINUTES) {
      errors.push(`${task.title} duration must be 30-120 minutes`);
    }
    if (diffMinutes(item.endAt, item.startAt) !== item.duration) {
      errors.push(`${task.title} endAt must equal startAt + duration`);
    }
    if (!isWithinWorkWindow(item.startAt, item.endAt)) {
      errors.push(`${task.title} must be within a work window`);
    }
    if (item.endAt > task.deadline) {
      errors.push(`${task.title} exceeds deadline`);
    }
    scheduledMinutes.set(
      item.taskId,
      (scheduledMinutes.get(item.taskId) ?? 0) + item.duration,
    );
  }

  for (const task of input.tasks) {
    const required = remainingTaskMinutes(task);
    const actual = scheduledMinutes.get(task.id) ?? 0;
    if (actual !== required) {
      errors.push(`${task.title} total duration ${actual} must equal ${required}`);
    }
  }

  const allItems = [
    ...input.events.map((event) => ({
      type: "event" as const,
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
    })),
    ...schedule.map((item) => ({
      type: "task" as const,
      title: item.taskTitle,
      startAt: item.startAt,
      endAt: item.endAt,
    })),
  ].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  for (let i = 0; i < allItems.length - 1; i += 1) {
    const current = allItems[i];
    const next = allItems[i + 1];
    if (current == null || next == null) {
      continue;
    }
    if (current.type === "event" && next.type === "event") {
      continue;
    }
    const gap = diffMinutes(next.startAt, current.endAt);
    if (gap < GAP_MINUTES) {
      errors.push(`${current.title} and ${next.title} must have a 15 minute gap`);
    }
  }

  return errors;
};

const scoreSchedule = (
  input: GenerateScheduleDomainServiceInput,
  schedule: readonly ScheduleCandidateItem[],
): number => {
  const tasksById = new Map(input.tasks.map((task) => [task.id, task]));
  const dailyMinutes = new Map<string, number>();
  const dailyFirstStart = new Map<string, Date>();
  const dailyLastEnd = new Map<string, Date>();

  const addDailyLoad = (start: Date, end: Date, duration: number) => {
    const key = dateKey(start);
    dailyMinutes.set(key, (dailyMinutes.get(key) ?? 0) + duration);
    const firstStart = dailyFirstStart.get(key);
    const lastEnd = dailyLastEnd.get(key);
    dailyFirstStart.set(key, firstStart == null || start < firstStart ? start : firstStart);
    dailyLastEnd.set(key, lastEnd == null || end > lastEnd ? end : lastEnd);
  };

  for (const event of input.events) {
    addDailyLoad(event.startAt, event.endAt, diffMinutes(event.endAt, event.startAt));
  }

  let deadlinePressure = 0;
  let shortSpanPenalty = 0;
  for (const item of schedule) {
    addDailyLoad(item.startAt, item.endAt, item.duration);
    const task = tasksById.get(item.taskId);
    if (task == null) {
      continue;
    }
    const hoursToDeadline = diffMinutes(task.deadline, item.endAt) / 60;
    if (hoursToDeadline >= 0 && hoursToDeadline < 3) {
      deadlinePressure += 120;
    } else if (hoursToDeadline >= 0 && hoursToDeadline < 6) {
      deadlinePressure += 60;
    } else if (hoursToDeadline >= 0 && hoursToDeadline < 12) {
      deadlinePressure += 30;
    } else if (hoursToDeadline >= 0 && hoursToDeadline < 24) {
      deadlinePressure += 10;
    }
    if (item.duration === 30) {
      shortSpanPenalty += 8;
    } else if (item.duration < 60) {
      shortSpanPenalty += 3;
    }
  }

  const values = [...dailyMinutes.values()];
  if (values.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const maxDaily = Math.max(...values);
  const minDaily = Math.min(...values);
  const averageDaily = values.reduce((sum, value) => sum + value, 0) / values.length;
  const balancePenalty = maxDaily - minDaily;
  const dailyVariancePenalty =
    values.reduce((sum, value) => sum + (value - averageDaily) ** 2, 0) /
    values.length /
    10;

  let dailySpanPenalty = 0;
  for (const [key, workMinutes] of dailyMinutes) {
    const firstStart = dailyFirstStart.get(key);
    const lastEnd = dailyLastEnd.get(key);
    if (firstStart == null || lastEnd == null) {
      continue;
    }
    const spanMinutes = diffMinutes(lastEnd, firstStart);
    dailySpanPenalty += Math.max(0, spanMinutes - workMinutes) * 0.8;
  }

  let sameTaskContinuityPenalty = 0;
  const sortedItems = [...schedule].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  for (let i = 0; i < sortedItems.length - 1; i += 1) {
    const previous = sortedItems[i];
    const current = sortedItems[i + 1];
    if (previous == null || current == null) {
      continue;
    }
    const gap = diffMinutes(current.startAt, previous.endAt);
    if (
      previous.taskId === current.taskId &&
      sameDate(previous.startAt, current.startAt) &&
      gap >= 0 &&
      gap <= 75
    ) {
      sameTaskContinuityPenalty += 15;
    }
  }

  return (
    balancePenalty +
    dailyVariancePenalty +
    deadlinePressure +
    dailySpanPenalty +
    sortedItems.length * 6 +
    shortSpanPenalty +
    sameTaskContinuityPenalty
  );
};

const summarizeCandidate = (
  input: GenerateScheduleDomainServiceInput,
  schedule: readonly ScheduleCandidateItem[],
): Pick<RuleBasedScheduleCandidate, "dailyTotals" | "schedules" | "score"> => {
  const dailyTotals = new Map<string, number>();
  for (const event of input.events) {
    const key = dateKey(event.startAt);
    dailyTotals.set(
      key,
      (dailyTotals.get(key) ?? 0) + diffMinutes(event.endAt, event.startAt),
    );
  }
  for (const item of schedule) {
    const key = dateKey(item.startAt);
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + item.duration);
  }
  return {
    score: scoreSchedule(input, schedule),
    dailyTotals: Object.fromEntries(
      [...dailyTotals.entries()].sort(([a], [b]) => a.localeCompare(b)),
    ),
    schedules: schedule
      .map((item) => ({
        taskId: item.taskId,
        startAt: item.startAt,
        endAt: item.endAt,
      }))
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
  };
};

export class RuleBasedGenerateScheduleDomainService
  implements GenerateScheduleDomainService
{
  #attempts: number;
  #candidateCount: number;
  #seed: number;
  #now: Date;

  constructor(options: RuleBasedGenerateScheduleDomainServiceOptions = {}) {
    this.#attempts = options.attempts ?? 2000;
    this.#candidateCount = options.candidateCount ?? 10;
    this.#seed = options.seed ?? 42;
    this.#now = options.now ?? new Date();
  }

  async handle(
    input: GenerateScheduleDomainServiceInput,
  ): Promise<GenerateScheduleResult[]> {
    const candidates = this.generateCandidates(input);
    const best = candidates[0];
    if (best == null) {
      throw new Error("No valid schedule candidate found");
    }
    return best.schedules;
  }

  generateCandidates(
    input: GenerateScheduleDomainServiceInput,
  ): RuleBasedScheduleCandidate[] {
    const schedulingStart = this.#now;
    const dates = [
      startOfDay(schedulingStart),
      ...input.events.map((event) => startOfDay(event.startAt)),
      ...input.tasks.map((task) => startOfDay(task.deadline)),
    ];
    if (dates.length === 0) {
      return [];
    }
    const planningStart = schedulingStart;
    const planningEnd = new Date(Math.max(...dates.map((date) => date.getTime())));
    const availableWindows = calculateAvailableWindows(
      input.events,
      planningStart,
      planningEnd,
    );
    const rng = new SeededRandom(this.#seed);
    const candidates: RuleBasedScheduleCandidate[] = [];
    const seen = new Set<string>();

    for (let attempt = 0; attempt < this.#attempts; attempt += 1) {
      const strategy = rng.choice(STRATEGIES);
      const result = buildRandomScheduleOnce(input, availableWindows, rng, strategy);
      if (result == null) {
        continue;
      }
      const errors = validateSchedule(input, result.schedule);
      if (errors.length > 0) {
        continue;
      }
      const signature = JSON.stringify(
        result.schedule.map((item) => ({
          taskId: item.taskId,
          startAt: formatLocalIso(item.startAt),
          endAt: formatLocalIso(item.endAt),
          duration: item.duration,
        })),
      );
      if (seen.has(signature)) {
        continue;
      }
      seen.add(signature);
      candidates.push({
        candidateId: 0,
        strategy: result.strategy,
        ...summarizeCandidate(input, result.schedule),
      });
      candidates.sort((a, b) => a.score - b.score);
      candidates.splice(this.#candidateCount);
    }

    return candidates.map((candidate, index) => ({
      ...candidate,
      candidateId: index + 1,
    }));
  }
}
