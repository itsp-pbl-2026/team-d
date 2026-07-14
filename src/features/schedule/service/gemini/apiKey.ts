import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 本番/デプロイ時は環境変数 GEMINI_API_KEY を優先する（Cloudflare Workers 等では
// ローカルファイルを読めないため）。ローカル検証実行時は既存の apikey.txt から読む。
// apikey.txt は LLM技術検証/ 配下に既にあるものをそのまま使う(重複コピーを避ける)。
const DEFAULT_API_KEY_PATH = (() => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "apikey.txt"); // 仮アドレス
})();

export const resolveGeminiApiKey = (): string => {
  const fromEnv = process.env.GEMINI_API_KEY;
  if (fromEnv != null && fromEnv.length > 0) return fromEnv.trim();

  const keyPath = process.env.GEMINI_API_KEY_PATH ?? DEFAULT_API_KEY_PATH;
  try {
    return readFileSync(keyPath, "utf-8").trim();
  } catch (error) {
    throw new Error(
      `Gemini APIキーが見つかりません。環境変数 GEMINI_API_KEY か、` +
        `${keyPath} にキーを保存してください。`,
      { cause: error },
    );
  }
};
