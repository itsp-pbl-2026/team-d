import { readFileSync } from "node:fs";
import { computeFreeSlots } from "./freeSlots";
import type { GeminiContent } from "./geminiClient";
import { DEFAULT_GEMINI_MODEL, generateContent } from "./geminiClient";
import { buildInitialPrompt, buildRetryPrompt } from "./promptBuilder";
import type {
  EvalAttempt,
  EvalResult,
  ScheduleFragment,
  TestCase,
} from "./types";
import { validateSchedule } from "./validator";

// ①入力JSON ②プログラム:空きスロット算出 ③LLM:タスク配置(ここだけ)
// ④プログラム:検証・採点、違反があれば③を繰り返す ⑤出力:スケジュール+スコア
//
// agentがツールを呼び出す形式ではなく、プログラム側がLLM呼び出し・検証・再試行を
// すべて制御する(非エージェント・単発生成の繰り返し)。

// basic.json は snake_case (Python 側のテスト資産と共通のフィクスチャ形式)。
type RawTestCase = {
  name: string;
  // biome-ignore lint/style/useNamingConvention: JSONフィクスチャのフィールド名(snake_case)に合わせる
  working_hours: [string, string][];
  // biome-ignore lint/style/useNamingConvention: JSONフィクスチャのフィールド名(snake_case)に合わせる
  fixed_events: { title: string; start: string; end: string }[];
  // biome-ignore lint/style/useNamingConvention: JSONフィクスチャのフィールド名(snake_case)に合わせる
  blocked_times?: { title: string; start: string; end: string }[];
  tasks: {
    title: string;
    // biome-ignore lint/style/useNamingConvention: JSONフィクスチャのフィールド名(snake_case)に合わせる
    duration_min: number;
    deadline: string;
    priority: number;
  }[];
};

export const loadTestCase = (filePath: string): TestCase => {
  const raw = JSON.parse(readFileSync(filePath, "utf-8")) as RawTestCase;
  return {
    name: raw.name,
    workingHours: raw.working_hours,
    events: raw.fixed_events,
    blockedTimes: raw.blocked_times ?? [],
    tasks: raw.tasks.map((t) => ({
      title: t.title,
      durationMin: t.duration_min,
      deadline: t.deadline,
      priority: t.priority,
    })),
  };
};

const extractJsonArray = (text: string): unknown => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error(
      `Geminiの出力をJSONとして解析できない: ${trimmed.slice(0, 200)}`,
    );
  }
};

export type RunOptions = {
  model?: string;
  maxAttempts?: number;
};

export const runGeminiSchedulingEval = async (
  testCase: TestCase,
  options?: RunOptions,
): Promise<EvalResult> => {
  const model = options?.model ?? DEFAULT_GEMINI_MODEL;
  const maxAttempts = options?.maxAttempts ?? 3;

  // ② プログラム: 空きスロット算出
  const freeSlots = computeFreeSlots(testCase);

  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [{ text: buildInitialPrompt(testCase.tasks, freeSlots) }],
    },
  ];

  const attempts: EvalAttempt[] = [];
  let lastSchedule: ScheduleFragment[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startedAt = Date.now();

    // ③ LLM: タスク配置(ここだけがLLM呼び出し。ツール呼び出しはさせない単発生成)
    const response = await generateContent(contents, { model });
    const elapsedMs = Date.now() - startedAt;

    const parsed = extractJsonArray(response.text) as ScheduleFragment[];
    lastSchedule = parsed;

    // ④ プログラム: 検証・採点
    const report = validateSchedule(testCase, parsed);

    attempts.push({
      attempt,
      schedule: parsed,
      report,
      promptTokenCount: response.usage.promptTokenCount,
      candidatesTokenCount: response.usage.candidatesTokenCount,
      totalTokenCount: response.usage.totalTokenCount,
      elapsedMs,
    });

    if (report.isValid || attempt === maxAttempts) {
      break;
    }

    // 違反があれば③に戻る(プログラムが次のプロンプトを組み立てて再試行)
    contents.push({ role: "model", parts: [{ text: response.text }] });
    contents.push({
      role: "user",
      parts: [{ text: buildRetryPrompt(report) }],
    });
  }

  const lastAttempt = attempts[attempts.length - 1];
  if (lastAttempt == null) {
    throw new Error("Gemini呼び出しが1回も行われなかった");
  }

  // ⑤ 出力: スケジュール + スコア
  return {
    model,
    isValid: lastAttempt.report.isValid,
    finalScore: lastAttempt.report.score,
    attempts,
    totalElapsedMs: attempts.reduce((sum, a) => sum + a.elapsedMs, 0),
    totalTokenCount: attempts.reduce(
      (sum, a) => sum + (a.totalTokenCount ?? 0),
      0,
    ),
    schedule: lastSchedule,
    report: lastAttempt.report,
  };
};
