import dayjs, { type Dayjs } from "dayjs";
import {
  DEFAULT_WORKING_HOURS,
  GAP_MIN,
  SPAN_MAX,
  SPAN_MIN,
} from "./freeSlots";
import type {
  CheckId,
  CheckResult,
  ScheduleFragment,
  TestCase,
  ValidationReport,
} from "./types";

// LLM技術検証(Python schedule_tools.py の validate_schedule)と同じ採点ロジック。
// Qwen での検証結果とスコアを直接比較できるようにするため、
// ハード制約(H1-H8)・ソフト制約(S1-S2)・スコア計算式を完全に一致させている。

const HARD_PENALTY = 10;
const SOFT_PRIORITY_PENALTY = 3;
const SOFT_BALANCE_DIVISOR = 12;
const SOFT_BALANCE_THRESHOLD_MIN = 90;

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

// 重ならない2区間の間隔(分)。重なる場合は負値。
const gapMinutes = (
  aStart: Dayjs,
  aEnd: Dayjs,
  bStart: Dayjs,
  bEnd: Dayjs,
): number => {
  if (!aEnd.isAfter(bStart)) return bStart.diff(aEnd, "minute");
  if (!bEnd.isAfter(aStart)) return aStart.diff(bEnd, "minute");
  return -1;
};

const isPositiveInteger = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n > 0;

type RawFragment = { task?: unknown; start?: unknown; durationMin?: unknown };

export const validateSchedule = (
  testCase: TestCase,
  proposed: RawFragment[] | ScheduleFragment[],
): ValidationReport => {
  const tasksByTitle = new Map(testCase.tasks.map((t) => [t.title, t]));
  const windows =
    testCase.workingHours.length > 0
      ? testCase.workingHours
      : DEFAULT_WORKING_HOURS;
  const blocked: [Dayjs, Dayjs][] = testCase.blockedTimes.map((b) => [
    dayjs(b.start),
    dayjs(b.end),
  ]);
  const fixed: [Dayjs, Dayjs, string][] = testCase.events.map((e) => [
    dayjs(e.start),
    dayjs(e.end),
    e.title,
  ]);

  // biome-ignore-start lint/style/useNamingConvention: 検証項目ID(H1-H8/S1-S2)は仕様上の識別子
  const checks: Record<CheckId, CheckResult> = {
    H1: { name: "スキーマ正当性", pass: true, violations: [] },
    H2: { name: "タスク名の対応", pass: true, violations: [] },
    H3: { name: "スパン長(30-120分)", pass: true, violations: [] },
    H4: { name: "稼働可能時間内", pass: true, violations: [] },
    H5: { name: "時間重複なし", pass: true, violations: [] },
    H6: { name: "15分間隔", pass: true, violations: [] },
    H7: { name: "合計時間一致", pass: true, violations: [] },
    H8: { name: "締切厳守", pass: true, violations: [] },
    S1: { name: "優先度順", pass: true, violations: [] },
    S2: { name: "日別負荷の偏り", pass: true, violations: [] },
  };
  // biome-ignore-end lint/style/useNamingConvention: 検証項目ID(H1-H8/S1-S2)は仕様上の識別子

  const fail = (id: CheckId, msg: string) => {
    checks[id].pass = false;
    checks[id].violations.push(msg);
  };

  // ---- H1: スキーマ & 断片の構築 ----
  const fragments: [string, Dayjs, Dayjs][] = [];
  if (!Array.isArray(proposed)) {
    fail("H1", `出力が配列ではない: ${typeof proposed}`);
  } else {
    proposed.forEach((item, idx) => {
      if (typeof item !== "object" || item === null) {
        fail("H1", `[${idx}] オブジェクトではない`);
        return;
      }
      const task = (item as RawFragment).task;
      const start = (item as RawFragment).start;
      const durationMin = (item as RawFragment).durationMin;
      if (typeof task !== "string" || task.length === 0) {
        fail("H1", `[${idx}] task が不正: ${JSON.stringify(task)}`);
        return;
      }
      if (!isPositiveInteger(durationMin)) {
        fail(
          "H1",
          `[${idx}] durationMin が正の整数でない: ${JSON.stringify(durationMin)}`,
        );
        return;
      }
      const startDate = typeof start === "string" ? dayjs(start) : null;
      if (startDate == null || !startDate.isValid()) {
        fail(
          "H1",
          `[${idx}] start が ISO 形式でない: ${JSON.stringify(start)}`,
        );
        return;
      }
      fragments.push([task, startDate, startDate.add(durationMin, "minute")]);
    });
  }

  // ---- H2: タスク名の対応 ----
  for (const [task] of fragments) {
    if (!tasksByTitle.has(task)) {
      fail("H2", `未知のタスク名: ${JSON.stringify(task)}`);
    }
  }

  // ---- H3: スパン長 ----
  for (const [task, start, end] of fragments) {
    const dur = end.diff(start, "minute");
    if (dur < SPAN_MIN || dur > SPAN_MAX) {
      fail(
        "H3",
        `${task} ${start.format("YYYY-MM-DDTHH:mm:ss")} のスパン ${dur}分 が範囲外(30-120)`,
      );
    }
  }

  // ---- H4: 稼働可能時間内 & blocked回避 ----
  for (const [task, start, end] of fragments) {
    if (!start.isSame(end, "day")) {
      fail("H4", `${task} ${start.format("YYYY-MM-DDTHH:mm:ss")} が日跨ぎ`);
      continue;
    }
    const inWindow = windows.some(([wStart, wEnd]) => {
      const windowStart = parseTimeOfDay(start, wStart);
      const windowEnd = parseTimeOfDay(start, wEnd);
      return !start.isBefore(windowStart) && !end.isAfter(windowEnd);
    });
    if (!inWindow) {
      fail(
        "H4",
        `${task} ${start.format("YYYY-MM-DDTHH:mm:ss")}-${end.format("HH:mm:ss")} が稼働可能時間外`,
      );
    }
    for (const [bStart, bEnd] of blocked) {
      if (overlaps(start, end, bStart, bEnd)) {
        fail(
          "H4",
          `${task} ${start.format("YYYY-MM-DDTHH:mm:ss")} が blocked と重複`,
        );
      }
    }
  }

  // ---- H5/H6: 重複・15分間隔(task断片が絡むペアのみ) ----
  type Interval = ["task" | "event", string, Dayjs, Dayjs];
  const intervals: Interval[] = [
    ...fragments.map((f): Interval => ["task", f[0], f[1], f[2]]),
    ...fixed.map((f): Interval => ["event", f[2], f[0], f[1]]),
  ];
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const [ti, ni, si, ei] = intervals[i] as Interval;
      const [tj, nj, sj, ej] = intervals[j] as Interval;
      if (ti === "event" && tj === "event") continue;
      if (overlaps(si, ei, sj, ej)) {
        fail(
          "H5",
          `重複: 「${ni}」と「${nj}」(${si.format("YYYY-MM-DDTHH:mm:ss")} 付近)`,
        );
      } else {
        const gap = gapMinutes(si, ei, sj, ej);
        if (gap >= 0 && gap < GAP_MIN) {
          fail("H6", `間隔不足(${gap}分): 「${ni}」と「${nj}」`);
        }
      }
    }
  }

  // ---- H7: 合計時間一致 ----
  const totals = new Map<string, number>();
  for (const [task, start, end] of fragments) {
    totals.set(task, (totals.get(task) ?? 0) + end.diff(start, "minute"));
  }
  for (const [title, task] of tasksByTitle) {
    const got = totals.get(title) ?? 0;
    if (got !== task.durationMin) {
      fail("H7", `${title} の合計 ${got}分 ≠ duration ${task.durationMin}分`);
    }
  }

  // ---- H8: 締切厳守 ----
  for (const [task, , end] of fragments) {
    const t = tasksByTitle.get(task);
    if (t != null) {
      const deadline = dayjs(t.deadline);
      if (end.isAfter(deadline)) {
        fail(
          "H8",
          `${task} ${end.format("YYYY-MM-DDTHH:mm:ss")} が締切 ${deadline.format("YYYY-MM-DDTHH:mm:ss")} を超過`,
        );
      }
    }
  }

  // ---- S1: 優先度順(高優先タスクの完了が遅い逆転を数える) ----
  const completion = new Map<string, Dayjs>();
  for (const [task, , end] of fragments) {
    const cur = completion.get(task);
    if (cur == null || end.isAfter(cur)) completion.set(task, end);
  }
  const scheduled = [...tasksByTitle.keys()].filter((title) =>
    completion.has(title),
  );
  let inversions = 0;
  for (const a of scheduled) {
    for (const b of scheduled) {
      const taskA = tasksByTitle.get(a);
      const taskB = tasksByTitle.get(b);
      const endA = completion.get(a);
      const endB = completion.get(b);
      if (taskA == null || taskB == null || endA == null || endB == null)
        continue;
      if (taskA.priority > taskB.priority && endA.isAfter(endB)) {
        inversions++;
        checks.S1.violations.push(
          `優先度逆転: ${a}(p${taskA.priority}) が ${b}(p${taskB.priority}) より遅く完了`,
        );
      }
    }
  }
  if (inversions > 0) checks.S1.pass = false;

  // ---- S2: 日別負荷の偏り(タスク時間のみ。固定予定は含めない) ----
  const windowDates = new Set<string>();
  for (const [start, end] of fixed) {
    windowDates.add(start.format("YYYY-MM-DD"));
    windowDates.add(end.format("YYYY-MM-DD"));
  }
  for (const task of tasksByTitle.values()) {
    windowDates.add(dayjs(task.deadline).format("YYYY-MM-DD"));
  }
  for (const [, start] of fragments) {
    windowDates.add(start.format("YYYY-MM-DD"));
  }
  const perDayTask = new Map<string, number>();
  if (windowDates.size > 0) {
    const sorted = [...windowDates].sort();
    const first = dayjs(sorted[0]);
    const last = dayjs(sorted[sorted.length - 1]);
    for (let cur = first; !cur.isAfter(last); cur = cur.add(1, "day")) {
      perDayTask.set(cur.format("YYYY-MM-DD"), 0);
    }
  }
  for (const [, start, end] of fragments) {
    const key = start.format("YYYY-MM-DD");
    perDayTask.set(key, (perDayTask.get(key) ?? 0) + end.diff(start, "minute"));
  }
  let balanceStd = 0;
  if (perDayTask.size >= 2) {
    const values = [...perDayTask.values()];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    balanceStd = Math.sqrt(
      values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length,
    );
    checks.S2.pass = balanceStd < SOFT_BALANCE_THRESHOLD_MIN;
    if (!checks.S2.pass) {
      const perDayText = [...perDayTask.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, v]) => `${k}:${v}分`)
        .join(", ");
      checks.S2.violations.push(
        `日別タスク時間の標準偏差 ${Math.round(balanceStd)}分 (日別タスク: ${perDayText})`,
      );
    }
  }

  // ---- スコア集計 ----
  const hardIds: CheckId[] = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"];
  const hardViolationCount = hardIds.reduce(
    (sum, id) => sum + checks[id].violations.length,
    0,
  );
  const softPenalty =
    inversions * SOFT_PRIORITY_PENALTY +
    Math.min(20, balanceStd / SOFT_BALANCE_DIVISOR);
  const score = Math.max(
    0,
    Math.round(100 - HARD_PENALTY * hardViolationCount - softPenalty),
  );
  const isValid = hardViolationCount === 0;

  const failedIds = (Object.keys(checks) as CheckId[]).filter(
    (id) => !checks[id].pass,
  );
  const summary =
    `${isValid ? "✅ 妥当" : "❌ 制約違反あり"} / score=${score} / ハード違反${hardViolationCount}件` +
    (failedIds.length > 0
      ? ` / 未達: ${failedIds.map((id) => `${id}:${checks[id].name}`).join(", ")}`
      : "");

  return { isValid, score, hardViolationCount, checks, summary };
};
