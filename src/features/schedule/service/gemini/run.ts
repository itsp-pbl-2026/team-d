import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTestCase, runGeminiSchedulingEval } from "./runner";

// 実行方法:
//   cd team-d
//   GEMINI_API_KEY=... pnpm tsx src/features/schedule/service/gemini/run.ts
// (GEMINI_API_KEY を指定しなければ apikey.txt から自動で読む。詳細は apiKey.ts 参照)
//
// テストケースを指定する場合:
//   pnpm tsx src/features/schedule/service/gemini/run.ts path/to/testcase.json

const here = path.dirname(fileURLToPath(import.meta.url));
const testCasePath = process.argv[2] ?? path.join(here, "testCases/basic.json");

const main = async () => {
  const testCase = loadTestCase(testCasePath);
  console.log(`テストケース: ${testCase.name} (${testCasePath})`);

  const startedAt = Date.now();
  const result = await runGeminiSchedulingEval(testCase);
  const totalWallMs = Date.now() - startedAt;

  console.log(`\nモデル: ${result.model}`);
  console.log(`試行回数: ${result.attempts.length}`);
  console.log(`合計トークン: ${result.totalTokenCount}`);
  console.log(
    `合計時間(API呼び出しのみ): ${result.totalElapsedMs}ms / 実測合計: ${totalWallMs}ms`,
  );
  console.log(`結果: ${result.report.summary}`);

  const outDir = path.join(here, "result");
  writeFileSync(
    path.join(outDir, "schedule_output.json"),
    JSON.stringify(result.schedule, null, 2),
  );
  writeFileSync(
    path.join(outDir, "eval_result.json"),
    JSON.stringify({ ...result, totalWallMs }, null, 2),
  );
  console.log(`\n結果を ${outDir} に保存しました。`);
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
