import dayjs from "dayjs";
import { DEFAULT_WORKING_HOURS } from "./gemini/freeSlots";
import { runGeminiSchedulingEval } from "./gemini/runner";
import type {
  ScheduleEvent,
  ScheduleFragment,
  TaskSpec,
  TestCase,
} from "./gemini/types";
import type {
  GenerateScheduleDomainService,
  GenerateScheduleDomainServiceInput,
  GenerateScheduleResult,
} from "./generateDomainService";

type TaskLookup = { id: string; title: string };

// GenerateScheduleDomainService の Gemini 実装。
// 実際のTask/UpcomingEventモデルには workingHours/blockedTimes の概念がまだ無いため、
// 稼働可能時間は暫定的にデフォルト値を使う(将来、設定機能ができたら差し替える)。
//
// gemini/ 側はタスクを「タイトル文字列」で識別するため、タイトルが重複していると
// 生成結果を元のタスクIDへ正しく戻せない。そのため重複時は別名(エイリアス)を付けて
// Geminiに渡し、結果を戻す際はエイリアス経由で元のタスク(id/title)を解決する。
const buildTestCase = (
  input: GenerateScheduleDomainServiceInput,
): { testCase: TestCase; taskByAlias: Map<string, TaskLookup> } => {
  const taskByAlias = new Map<string, TaskLookup>();
  const titleOccurrences = new Map<string, number>();
  const tasks: TaskSpec[] = [];

  for (const task of input.tasks) {
    const remainingMinutes = task.estimatedMinutes - task.actualMinutes;
    if (remainingMinutes <= 0) continue; // 残り時間がないタスクは配置対象外

    const occurrence = (titleOccurrences.get(task.title) ?? 0) + 1;
    titleOccurrences.set(task.title, occurrence);
    const alias =
      occurrence === 1 ? task.title : `${task.title} (${occurrence})`;

    taskByAlias.set(alias, { id: task.id, title: task.title });
    tasks.push({
      title: alias,
      durationMin: remainingMinutes,
      deadline: dayjs(task.deadline).format("YYYY-MM-DDTHH:mm:ss"),
      priority: task.priority,
    });
  }

  const events: ScheduleEvent[] = input.events.map((event) => ({
    title: event.title,
    start: dayjs(event.startAt).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs(event.endAt).format("YYYY-MM-DDTHH:mm:ss"),
  }));

  const testCase: TestCase = {
    name: "generate-schedule-domain-service",
    workingHours: DEFAULT_WORKING_HOURS,
    events,
    blockedTimes: [],
    tasks,
  };

  return { testCase, taskByAlias };
};

const toResults = (
  schedule: ScheduleFragment[],
  taskByAlias: Map<string, TaskLookup>,
): GenerateScheduleResult[] =>
  schedule.map((fragment) => {
    const task = taskByAlias.get(fragment.task);
    if (task == null) {
      throw new Error(
        `生成されたスケジュールに未知のタスク名が含まれています: ${fragment.task}`,
      );
    }
    const startAt = dayjs(fragment.start).toDate();
    const endAt = dayjs(fragment.start)
      .add(fragment.durationMin, "minute")
      .toDate();
    return { taskId: task.id, startAt, endAt };
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
    const { testCase, taskByAlias } = buildTestCase(input);
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

    return toResults(result.schedule, taskByAlias);
  }
}
