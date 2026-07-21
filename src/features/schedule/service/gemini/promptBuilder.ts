import type {
  CheckResult,
  FreeSlot,
  TaskSpec,
  ValidationReport,
} from "./types";

// 汎用プロンプト。特定の入力データ(タスク名・日付・所要時間)には一切言及しない。
// どんな入力ケースにも当てはまる一般ルールのみを書く。

const CONSTRAINTS = `制約(厳守):
- 各タスクの断片の合計時間が durationMin にちょうど一致すること
- deadline(締切)を厳守する(全断片の終了時刻 <= deadline)
- priority は数値が高いほど優先(高優先のタスクをできるだけ早く完了させる)
- タスクは複数の断片に分割可能(同じ task 名で複数エントリにする)
- 1断片の時間は30分以上120分以下
- 空きスロットは既に固定予定の前後15分マージンを除外済み。
  同一スロット内に複数の断片を置く場合のみ、断片同士を15分以上あける
  (別スロット/別日に置いた断片同士は気にしなくてよい)
- 1日あたりのタスク時間の偏りをできるだけ小さくする
  (締切が早いタスクは締切までの日に均等に、余裕があるタスクは利用可能な日全体に分散させる)`;

const OUTPUT_FORMAT = `出力形式(JSON配列のみ。説明文やマークダウンは含めない):
[{"task": "(タスク名)", "start": "2026-01-05T09:00:00", "durationMin": 90}, ...]`;

export const buildInitialPrompt = (
  tasks: TaskSpec[],
  freeSlots: FreeSlot[],
): string => {
  // 1. 時刻を分かりやすい文字列として取得
  const now = new Date();
  const timeString = now.toLocaleString("ja-JP");

  return `あなたは優秀なスケジューリングAIです。以下のタスクを、与えられた空きスロットに配置してください。
タスクの分解方法として、まず durationMin を「30〜120の整数の和」に分解してから、各断片を空きスロットに割り当てる進め方が有効です。

ただし現在の日時は以下になる
${timeString}
この日時以降にスケジュールを割り振ってほしい

タスク一覧:
${JSON.stringify(tasks, null, 2)}

空きスロット一覧:
${JSON.stringify(freeSlots, null, 2)}

${CONSTRAINTS}

${OUTPUT_FORMAT}`;
};

export const buildRetryPrompt = (report: ValidationReport): string => {
  const failedHard = (
    Object.entries(report.checks) as [string, CheckResult][]
  ).filter(([id, check]) => !check.pass && id.startsWith("H"));
  const violationLines = failedHard
    .flatMap(([id, check]) => check.violations.map((v) => `- ${id}: ${v}`))
    .join("\n");

  return `先ほどの配置には以下の制約違反がありました。修正してください。

違反内容:
${violationLines}

修正した配置のみを、同じJSON配列形式で出力してください(説明文は不要)。`;
};
