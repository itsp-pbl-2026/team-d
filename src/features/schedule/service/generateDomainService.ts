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
