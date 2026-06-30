export type GenerateScheduleTask = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: number;
  progress: number;
  status: string;
};

export type GenerateScheduleEvent = {
  id: string;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
};

export type GenerateScheduleDomainServiceInput = {
  tasks: GenerateScheduleTask[];
  events: GenerateScheduleEvent[];
};

export type GenerateScheduleResult = {
  taskId: string;
  startAt: Date;
  endAt: Date;
};

export interface GenerateScheduleDomainService {
  handle(
    input: GenerateScheduleDomainServiceInput,
  ): Promise<GenerateScheduleResult[]>;
}

export class GenerateDomainService implements GenerateScheduleDomainService {
  async handle(
    input: GenerateScheduleDomainServiceInput,
  ): Promise<GenerateScheduleResult[]> {
    const _inputJson = this.generateInputJson(input);

    // TODO: API呼び出し

    const outputJson = `[
    {
      "task": "研究進捗",
      "start": "2026-06-22T09:00:00",
      "end": "2026-06-22T10:30:00"
    }
  ]`;

    const output = this.parseOutputJson(outputJson);

    return output;
  }

  private generateInputJson(input: GenerateScheduleDomainServiceInput): string {
    return JSON.stringify({
      fixedEvents: input.events.map((event) => ({
        id: event.id,
        start: event.startAt.toISOString(),
        end: event.endAt.toISOString(),
      })),

      tasks: input.tasks.map((task) => ({
        id: task.id,
        durationMin: task.estimatedMinutes,
        deadline: task.deadline.toISOString(),
        priority: task.priority,
      })),
    });
  }

  private parseOutputJson(output: string): GenerateScheduleResult[] {
    const schedules = JSON.parse(output) as {
      task: string;
      start: string;
      end: string;
    }[];

    return schedules.map((schedule) => ({
      taskId: schedule.task,
      startAt: new Date(schedule.start),
      endAt: new Date(schedule.end),
    }));
  }
}
