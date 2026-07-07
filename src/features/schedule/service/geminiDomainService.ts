import dayjs from "dayjs";
import { DEFAULT_WORKING_HOURS } from "./gemini/freeSlots";
import { runGeminiSchedulingEval } from "./gemini/runner";
import type {
  FixedEvent,
  ScheduleFragment,
  TaskSpec,
  TestCase,
} from "./gemini/types";
import type {
  GenerateScheduleDomainService,
  GenerateScheduleDomainServiceInput,
  GenerateScheduleResult,
} from "./generateDomainService";

// GenerateScheduleDomainService の Gemini 実装。
// 実際のTask/UpcomingEventモデルには workingHours/blockedTimes の概念がまだ無いため、
// 稼働可能時間は暫定的にデフォルト値を使う(将来、設定機能ができたら差し替える)。
const buildTestCase = (
  input: GenerateScheduleDomainServiceInput,
): { testCase: TestCase; idByTitle: Map<string, string> } => {
  const idByTitle = new Map<string, string>();
  const tasks: TaskSpec[] = [];

  for (const task of input.tasks) {
    const remainingMinutes = task.estimatedMinutes - task.actualMinutes;
    if (remainingMinutes <= 0) continue; // 残り時間がないタスクは配置対象外

    if (idByTitle.has(task.title)) {
      throw new Error(
        `タスク名が重複しているため対応付けできません: ${task.title}`,
      );
    }
    idByTitle.set(task.title, task.id);
    tasks.push({
      title: task.title,
      durationMin: remainingMinutes,
      deadline: dayjs(task.deadline).format("YYYY-MM-DDTHH:mm:ss"),
      priority: task.priority,
    });
  }

  const fixedEvents: FixedEvent[] = input.events.map((event) => ({
    title: event.title,
    start: dayjs(event.startAt).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs(event.endAt).format("YYYY-MM-DDTHH:mm:ss"),
  }));

  const testCase: TestCase = {
    name: "generate-schedule-domain-service",
    workingHours: DEFAULT_WORKING_HOURS,
    fixedEvents,
    blockedTimes: [],
    tasks,
  };

  return { testCase, idByTitle };
};

const toResults = (
  schedule: ScheduleFragment[],
  idByTitle: Map<string, string>,
): GenerateScheduleResult[] =>
  schedule.map((fragment) => {
    const taskId = idByTitle.get(fragment.task);
    if (taskId == null) {
      throw new Error(
        `生成されたスケジュールに未知のタスク名が含まれています: ${fragment.task}`,
      );
    }
    const startAt = dayjs(fragment.start).toDate();
    const endAt = dayjs(fragment.start)
      .add(fragment.durationMin, "minute")
      .toDate();
    return { taskId, startAt, endAt };
  });

export type GeminiGenerateScheduleDomainServiceOptions = {
  model?: string;
  maxAttempts?: number;
};

export class GeminiGenerateScheduleDomainService
  implements GenerateScheduleDomainService
{
  #model: string | undefined;
  #maxAttempts: number | undefined;

  constructor(options?: GeminiGenerateScheduleDomainServiceOptions) {
    this.#model = options?.model;
    this.#maxAttempts = options?.maxAttempts;
  }

  async handle(
    input: GenerateScheduleDomainServiceInput,
  ): Promise<GenerateScheduleResult[]> {
    const { testCase, idByTitle } = buildTestCase(input);
    if (testCase.tasks.length === 0) return [];

    const result = await runGeminiSchedulingEval(testCase, {
      model: this.#model,
      maxAttempts: this.#maxAttempts,
    });

    if (!result.isValid) {
      console.warn(
        `GeminiGenerateScheduleDomainService: ${result.report.summary}`,
      );
    }

    return toResults(result.schedule, idByTitle);
  }
}
