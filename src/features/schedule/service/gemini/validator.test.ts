import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadTestCase } from "./runner";
import type { ScheduleFragment } from "./types";
import { validateSchedule } from "./validator";

const here = path.dirname(fileURLToPath(import.meta.url));
const basicTestCase = loadTestCase(path.join(here, "testCases/basic.json"));

describe("validateSchedule", () => {
  it("妥当なスケジュールは is_valid=true・score=96 になる(Python版 v9 の結果と一致)", () => {
    const schedule: ScheduleFragment[] = [
      { task: "研究進捗", start: "2026-06-22T20:00:00", durationMin: 120 },
      { task: "研究進捗", start: "2026-06-23T09:00:00", durationMin: 120 },
      { task: "研究進捗", start: "2026-06-24T13:30:00", durationMin: 120 },
      {
        task: "発表スライド作成",
        start: "2026-06-25T20:00:00",
        durationMin: 120,
      },
      {
        task: "発表スライド作成",
        start: "2026-06-26T20:00:00",
        durationMin: 120,
      },
      {
        task: "発表スライド作成",
        start: "2026-06-27T09:00:00",
        durationMin: 60,
      },
      { task: "ゲーム開発", start: "2026-06-27T13:30:00", durationMin: 120 },
      { task: "ゲーム開発", start: "2026-06-28T20:00:00", durationMin: 120 },
    ];

    const report = validateSchedule(basicTestCase, schedule);

    expect(report.isValid).toBe(true);
    expect(report.score).toBe(96);
    expect(report.hardViolationCount).toBe(0);
    for (const check of Object.values(report.checks)) {
      expect(check.pass).toBe(true);
    }
  });

  it("制約違反だらけのスケジュールは各項目を正しく検出する", () => {
    const schedule: ScheduleFragment[] = [
      { task: "研究進捗", start: "2026-06-22T11:00:00", durationMin: 90 }, // ゼミと重複
      { task: "研究進捗", start: "2026-06-22T13:30:00", durationMin: 20 }, // スパン短すぎ
      {
        task: "存在しないタスク",
        start: "2026-06-24T13:30:00",
        durationMin: 60,
      }, // 未知タスク
      { task: "ゲーム開発", start: "2026-06-30T09:00:00", durationMin: 60 }, // 締切超過
    ];

    const report = validateSchedule(basicTestCase, schedule);

    expect(report.isValid).toBe(false);
    expect(report.checks.H2.pass).toBe(false);
    expect(report.checks.H3.pass).toBe(false);
    expect(report.checks.H5.pass).toBe(false);
    expect(report.checks.H7.pass).toBe(false);
    expect(report.checks.H8.pass).toBe(false);
  });

  it("H1: 配列でない出力はスキーマ違反として検出する", () => {
    // biome-ignore lint/suspicious/noExplicitAny: 意図的に不正な形式を渡すテスト
    const report = validateSchedule(basicTestCase, { not: "an array" } as any);
    expect(report.checks.H1.pass).toBe(false);
    expect(report.isValid).toBe(false);
  });
});
