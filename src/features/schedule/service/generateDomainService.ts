export type GenerateScheduleTask = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: number;
  progress: number;
  status: string;
};

export type GenerateScheduleUpcomingEvent = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};

export type GenerateScheduleDomainServiceInput = {
  tasks: GenerateScheduleTask[];
  upcomingEvents: GenerateScheduleUpcomingEvent[];
};

export type GenerateScheduleResult = {
  taskId: string;
  title: string;
  startAt: string;
  endAt: string;
};

export interface GenerateScheduleDomainService {
  handle(
    input: GenerateScheduleDomainServiceInput,
  ): Promise<GenerateScheduleResult[]>;
}
