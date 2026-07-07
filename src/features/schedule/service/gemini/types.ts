// LLM技術検証の basic ケースと同じ形式・同じ制約モデル。
// Qwen での検証結果とスコアを直接比較できるようにするため、
// 実プロダクトの Task/UpcomingEvent モデルとは独立させている。

export type FixedEvent = {
  title: string;
  start: string;
  end: string;
};

export type TaskSpec = {
  title: string;
  durationMin: number;
  deadline: string;
  priority: number;
};

export type TestCase = {
  name: string;
  workingHours: [string, string][];
  fixedEvents: FixedEvent[];
  blockedTimes: FixedEvent[];
  tasks: TaskSpec[];
};

export type FreeSlot = {
  start: string;
  end: string;
  durationMin: number;
};

export type ScheduleFragment = {
  task: string;
  start: string;
  durationMin: number;
};

export type CheckResult = {
  name: string;
  pass: boolean;
  violations: string[];
};

export type CheckId =
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H5"
  | "H6"
  | "H7"
  | "H8"
  | "S1"
  | "S2";

export type ValidationReport = {
  isValid: boolean;
  score: number;
  hardViolationCount: number;
  checks: Record<CheckId, CheckResult>;
  summary: string;
};

export type EvalAttempt = {
  attempt: number;
  schedule: ScheduleFragment[];
  report: ValidationReport;
  promptTokenCount: number | null;
  candidatesTokenCount: number | null;
  totalTokenCount: number | null;
  elapsedMs: number;
};

export type EvalResult = {
  model: string;
  isValid: boolean;
  finalScore: number;
  attempts: EvalAttempt[];
  totalElapsedMs: number;
  totalTokenCount: number;
  schedule: ScheduleFragment[];
  report: ValidationReport;
};
