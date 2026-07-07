import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { loadTestCase, runGeminiSchedulingEval } from "./runner";

// 実行方法:
//   cd team-d
//   pnpm tsx src/features/schedule/service/gemini/run.ts
// (.env.local の GEMINI_API_KEY を自動で読む。無ければ apikey.txt から読む。詳細は apiKey.ts 参照)
//
// テストケースを指定する場合:
//   pnpm tsx src/features/schedule/service/gemini/run.ts path/to/testcase.json

const here = path.dirname(fileURLToPath(import.meta.url));

// Vite経由(dev/build)では自動で .env.local が読まれるが、tsx単体実行では読まれないため明示的に読み込む。
loadDotenv({
  path: path.resolve(here, "../../../../../.env.local"),
  quiet: true,
});

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
