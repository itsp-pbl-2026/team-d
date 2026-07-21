import { describe, expect, it } from "vitest";
import type { ScheduleFragment, TestCase } from "./types";
import { validateSchedule } from "./validator";

// const here = path.dirname(fileURLToPath(import.meta.url));
// const basicTestCase = loadTestCase(path.join(here, "testCases/basic.json"));

// 動的に TestCase オブジェクトを生成する関数
function makeBasicTestCase(): TestCase {
  const now = new Date();

  const day1 = getFutureDateString(1, now);
  const day2 = getFutureDateString(2, now);
  const day3 = getFutureDateString(3, now);
  const day4 = getFutureDateString(4, now);
  const day5 = getFutureDateString(5, now);
  const day7 = getFutureDateString(7, now);
  const day8 = getFutureDateString(8, now);

  // loadTestCase で行っているプロパティ名の変換を直接適用して返す
  return {
    name: "basic",
    workingHours: [
      ["09:00", "12:30"],
      ["13:30", "19:00"],
      ["20:00", "23:00"],
    ],
    events: [
      {
        title: "ゼミ",
        start: `${day1}T10:45:00`,
        end: `${day1}T12:25:00`,
      },
      {
        title: "ソフトウェア開発方法論",
        start: `${day1}T15:25:00`,
        end: `${day1}T17:05:00`,
      },
      {
        title: "システム開発プロジェクト基礎第二",
        start: `${day2}T13:30:00`,
        end: `${day2}T17:05:00`,
      },
      {
        title: "情報リテラシーTA",
        start: `${day3}T08:50:00`,
        end: `${day3}T12:25:00`,
      },
      {
        title: "ゼミ",
        start: `${day4}T10:45:00`,
        end: `${day4}T12:25:00`,
      },
      {
        title: "ソフトウェア開発方法論",
        start: `${day4}T15:25:00`,
        end: `${day4}T17:05:00`,
      },
      {
        title: "バイト",
        start: `${day5}T10:00:00`,
        end: `${day5}T19:00:00`,
      },
      {
        title: "バイト",
        start: `${day7}T10:00:00`,
        end: `${day7}T19:00:00`,
      },
    ],
    blockedTimes: [],
    tasks: [
      {
        title: "研究進捗",
        durationMin: 360,
        deadline: `${day4}T10:45:00`,
        priority: 10,
      },
      {
        title: "発表スライド作成",
        durationMin: 300,
        deadline: `${day8}T10:45:00`,
        priority: 10,
      },
      {
        title: "ゲーム開発",
        durationMin: 240,
        deadline: `${day8}T00:00:00`,
        priority: 5,
      },
    ],
  };
}

function makeSchedule1(): ScheduleFragment[] {
  const now = new Date();

  // 6/21を基準とした場合の相対的な日数を生成
  const day1 = getFutureDateString(1, now); // 6/22 相当
  const day2 = getFutureDateString(2, now); // 6/23 相当
  const day3 = getFutureDateString(3, now); // 6/24 相当
  const day4 = getFutureDateString(4, now); // 6/25 相当
  const day5 = getFutureDateString(5, now); // 6/26 相当
  const day6 = getFutureDateString(6, now); // 6/27 相当
  const day7 = getFutureDateString(7, now); // 6/28 相当

  const schedule: ScheduleFragment[] = [
    { task: "研究進捗", start: `${day1}T20:00:00`, durationMin: 120 },
    { task: "研究進捗", start: `${day2}T09:00:00`, durationMin: 120 },
    { task: "研究進捗", start: `${day3}T13:30:00`, durationMin: 120 },
    {
      task: "発表スライド作成",
      start: `${day4}T20:00:00`,
      durationMin: 120,
    },
    {
      task: "発表スライド作成",
      start: `${day5}T20:00:00`,
      durationMin: 120,
    },
    {
      task: "発表スライド作成",
      start: `${day6}T09:00:00`,
      durationMin: 60,
    },
    { task: "ゲーム開発", start: `${day6}T13:30:00`, durationMin: 120 },
    { task: "ゲーム開発", start: `${day7}T20:00:00`, durationMin: 120 },
  ];

  return schedule;
}

function makeSchedule2(): ScheduleFragment[] {
  const now = new Date();

  const tomorrow = getFutureDateString(1, now);
  const threeDaysLater = getFutureDateString(3, now);
  const nextWeek = getFutureDateString(9, now);

  const schedule: ScheduleFragment[] = [
    // 常に明日の日付になるため、現在時刻より前のエラーには絶対にならない
    { task: "研究進捗", start: `${tomorrow}T11:00:00`, durationMin: 90 }, // ゼミと重複
    { task: "研究進捗", start: `${tomorrow}T13:30:00`, durationMin: 20 }, // スパン短すぎ
    {
      task: "存在しないタスク",
      start: `${threeDaysLater}T13:30:00`,
      durationMin: 60,
    }, // 未知タスク
    { task: "ゲーム開発", start: `${nextWeek}T09:00:00`, durationMin: 60 }, // 締切超過
  ];
  return schedule;
}

function getFutureDateString(daysToAdd: number, d: Date): string {
  // 元の d に影響を与えないように完全に独立したコピーを作る
  const targetDate = new Date(d.getTime());

  // 指定された日数を足す
  targetDate.setDate(targetDate.getDate() + daysToAdd);

  // 足した後の日付で文字列を組み立てる
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

describe("validateSchedule", () => {
  it("妥当なスケジュールは is_valid=true・score=96 になる(Python版 v9 の結果と一致)", () => {
    const schedule = makeSchedule1();
    const basicTestCase = makeBasicTestCase();

    const report = validateSchedule(basicTestCase, schedule);

    expect(report.isValid).toBe(true);
    expect(report.score).toBe(96);
    expect(report.hardViolationCount).toBe(0);
    for (const check of Object.values(report.checks)) {
      expect(check.pass).toBe(true);
    }
  });

  it("制約違反だらけのスケジュールは各項目を正しく検出する", () => {
    const schedule = makeSchedule2();
    const basicTestCase = makeBasicTestCase();

    const report = validateSchedule(basicTestCase, schedule);

    expect(report.isValid).toBe(false);
    expect(report.checks.H2.pass).toBe(false);
    expect(report.checks.H3.pass).toBe(false);
    expect(report.checks.H5.pass).toBe(false);
    expect(report.checks.H7.pass).toBe(false);
    expect(report.checks.H8.pass).toBe(false);
  });

  it("H1: 配列でない出力はスキーマ違反として検出する", () => {
    const basicTestCase = makeBasicTestCase();
    // biome-ignore lint/suspicious/noExplicitAny: 意図的に不正な形式を渡すテスト
    const report = validateSchedule(basicTestCase, { not: "an array" } as any);
    expect(report.checks.H1.pass).toBe(false);
    expect(report.isValid).toBe(false);
  });
});
