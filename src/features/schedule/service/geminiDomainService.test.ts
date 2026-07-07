import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EvalResult } from "./gemini/types";
import type { GenerateScheduleDomainServiceInput } from "./generateDomainService";

const runGeminiSchedulingEvalMock = vi.fn();
vi.mock("./gemini/runner", () => ({
  runGeminiSchedulingEval: (...args: unknown[]) =>
    runGeminiSchedulingEvalMock(...args),
}));

const { GeminiGenerateScheduleDomainService } = await import(
  "./geminiDomainService"
);

const buildInput = (
  overrides?: Partial<GenerateScheduleDomainServiceInput>,
): GenerateScheduleDomainServiceInput => ({
  tasks: [
    {
      id: "task-1",
      title: "資料作成",
      description: "",
      deadline: new Date("2026-07-02T09:00:00"),
      estimatedMinutes: 90,
      actualMinutes: 30,
      priority: 2,
      progress: 30,
      status: "in_progress",
    },
  ],
  events: [
    {
      id: "event-1",
      title: "定例会議",
      description: "",
      startAt: new Date("2026-07-01T15:00:00"),
      endAt: new Date("2026-07-01T16:00:00"),
    },
  ],
  ...overrides,
});

const buildEvalResult = (overrides?: Partial<EvalResult>): EvalResult => ({
  model: "gemini-flash-lite-latest",
  isValid: true,
  finalScore: 96,
  attempts: [],
  totalElapsedMs: 100,
  totalTokenCount: 1000,
  schedule: [
    { task: "資料作成", start: "2026-07-01T09:00:00", durationMin: 60 },
  ],
  report: {
    isValid: true,
    score: 96,
    hardViolationCount: 0,
    checks: {} as EvalResult["report"]["checks"],
    summary: "✅ 妥当 / score=96",
  },
  ...overrides,
});

describe("GeminiGenerateScheduleDomainService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("残り時間(estimatedMinutes - actualMinutes)をタスクのdurationとしてrunnerへ渡す", async () => {
    runGeminiSchedulingEvalMock.mockResolvedValue(buildEvalResult());
    const service = new GeminiGenerateScheduleDomainService();

    await service.handle(buildInput());

    expect(runGeminiSchedulingEvalMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        tasks: [
          expect.objectContaining({
            title: "資料作成",
            durationMin: 60, // 90 - 30
            priority: 2,
          }),
        ],
        fixedEvents: [
          expect.objectContaining({
            title: "定例会議",
            start: "2026-07-01T15:00:00",
            end: "2026-07-01T16:00:00",
          }),
        ],
      }),
      { model: undefined, maxAttempts: undefined },
    );
  });

  it("残り時間が0以下のタスクは配置対象から除外する", async () => {
    const service = new GeminiGenerateScheduleDomainService();

    const results = await service.handle(
      buildInput({
        tasks: [
          {
            id: "task-done",
            title: "完了済みタスク",
            description: "",
            deadline: new Date("2026-07-02T09:00:00"),
            estimatedMinutes: 60,
            actualMinutes: 60,
            priority: 1,
            progress: 100,
            status: "done",
          },
        ],
      }),
    );

    expect(runGeminiSchedulingEvalMock).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  it("生成されたスケジュールをタスク名で対応付けてGenerateScheduleResultに変換する", async () => {
    runGeminiSchedulingEvalMock.mockResolvedValue(
      buildEvalResult({
        schedule: [
          { task: "資料作成", start: "2026-07-01T09:00:00", durationMin: 60 },
        ],
      }),
    );
    const service = new GeminiGenerateScheduleDomainService();

    const results = await service.handle(buildInput());

    expect(results).toEqual([
      {
        taskId: "task-1",
        startAt: new Date("2026-07-01T09:00:00"),
        endAt: new Date("2026-07-01T10:00:00"),
      },
    ]);
  });

  it("未知のタスク名が返ってきたらエラーにする", async () => {
    runGeminiSchedulingEvalMock.mockResolvedValue(
      buildEvalResult({
        schedule: [
          {
            task: "存在しないタスク",
            start: "2026-07-01T09:00:00",
            durationMin: 60,
          },
        ],
      }),
    );
    const service = new GeminiGenerateScheduleDomainService();

    await expect(service.handle(buildInput())).rejects.toThrow(
      "生成されたスケジュールに未知のタスク名が含まれています: 存在しないタスク",
    );
  });

  it("タスクタイトルが重複しているとエラーにする", async () => {
    const service = new GeminiGenerateScheduleDomainService();

    await expect(
      service.handle(
        buildInput({
          tasks: [
            {
              id: "task-1",
              title: "同名タスク",
              description: "",
              deadline: new Date("2026-07-02T09:00:00"),
              estimatedMinutes: 60,
              actualMinutes: 0,
              priority: 1,
              progress: 0,
              status: "pending",
            },
            {
              id: "task-2",
              title: "同名タスク",
              description: "",
              deadline: new Date("2026-07-03T09:00:00"),
              estimatedMinutes: 60,
              actualMinutes: 0,
              priority: 1,
              progress: 0,
              status: "pending",
            },
          ],
        }),
      ),
    ).rejects.toThrow(
      "タスク名が重複しているため対応付けできません: 同名タスク",
    );
  });

  it("options(model/maxAttempts)をrunnerにそのまま渡す", async () => {
    runGeminiSchedulingEvalMock.mockResolvedValue(buildEvalResult());
    const service = new GeminiGenerateScheduleDomainService({
      model: "gemini-flash-lite-latest",
      maxAttempts: 5,
    });

    await service.handle(buildInput());

    expect(runGeminiSchedulingEvalMock).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      {
        model: "gemini-flash-lite-latest",
        maxAttempts: 5,
      },
    );
  });
});
