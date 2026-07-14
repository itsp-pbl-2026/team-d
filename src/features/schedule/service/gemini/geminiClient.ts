import { resolveGeminiApiKey } from "./apiKey";

// gemini flash lite での検証用。モデルIDは変わる可能性があるため env で上書き可能にする。
export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

export type GeminiRole = "user" | "model";
export type GeminiContent = { role: GeminiRole; parts: { text: string }[] };

export type GeminiUsage = {
  promptTokenCount: number | null;
  candidatesTokenCount: number | null;
  totalTokenCount: number | null;
};

export type GeminiResponse = {
  text: string;
  usage: GeminiUsage;
};

type GenerateContentApiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

export const generateContent = async (
  contents: GeminiContent[],
  options?: { model?: string; apiKey?: string },
): Promise<GeminiResponse> => {
  const model =
    options?.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const apiKey = options?.apiKey ?? resolveGeminiApiKey();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API エラー (${res.status}): ${body}`);
  }

  const json = (await res.json()) as GenerateContentApiResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text == null) {
    throw new Error(
      `Gemini API のレスポンスにテキストが含まれない: ${JSON.stringify(json)}`,
    );
  }

  return {
    text,
    usage: {
      promptTokenCount: json.usageMetadata?.promptTokenCount ?? null,
      candidatesTokenCount: json.usageMetadata?.candidatesTokenCount ?? null,
      totalTokenCount: json.usageMetadata?.totalTokenCount ?? null,
    },
  };
};
