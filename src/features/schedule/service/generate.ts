import { idGenerator } from "#/features/id";
import type { Task } from "#/features/task/model/task";
import type { TaskRepository } from "#/features/task/repository/task";
import type { UpcomingEvent } from "#/features/upcomingEvent/model/upcomingEvent";
import type { UpcomingEventRepository } from "#/features/upcomingEvent/repository/upcomingEvent";
import { Schedule } from "../model/schedule";
import type { ScheduleRepository } from "../repository/schedule";
import type {
  GenerateScheduleDomainService,
  GenerateScheduleDomainServiceInput,
} from "./generateDomainService";

const serializeTask = (
  task: Task,
): GenerateScheduleDomainServiceInput["tasks"][number] => ({
  id: task.getId(),
  title: task.getTitle(),
  description: task.getDescription(),
  deadline: task.getDeadline().toISOString(),
  estimatedMinutes: task.getEstimatedMinutes(),
  actualMinutes: task.getActualMinutes(),
  priority: task.getPriority(),
  progress: task.getProgress(),
  status: task.getStatus(),
});

const serializeUpcomingEvent = (
  upcomingEvent: UpcomingEvent,
): GenerateScheduleDomainServiceInput["upcomingEvents"][number] => ({
  id: upcomingEvent.getId(),
  title: upcomingEvent.getTitle(),
  description: upcomingEvent.getDescription(),
  startAt: upcomingEvent.getStartAt().toISOString(),
  endAt: upcomingEvent.getEndAt().toISOString(),
});

export class GenerateScheduleService {
  #taskRepository: TaskRepository;
  #upcomingEventRepository: UpcomingEventRepository;
  #scheduleRepository: ScheduleRepository;
  #generateScheduleDomainService: GenerateScheduleDomainService;

  constructor(
    taskRepository: TaskRepository,
    upcomingEventRepository: UpcomingEventRepository,
    scheduleRepository: ScheduleRepository,
    generateScheduleDomainService: GenerateScheduleDomainService,
  ) {
    this.#taskRepository = taskRepository;
    this.#upcomingEventRepository = upcomingEventRepository;
    this.#scheduleRepository = scheduleRepository;
    this.#generateScheduleDomainService = generateScheduleDomainService;
  }

  async handle(): Promise<Schedule[]> {
    const [tasks, upcomingEvents] = await Promise.all([
      this.#taskRepository.findAll(),
      this.#upcomingEventRepository.findAll(),
    ]);

    const generatedSchedules = await this.#generateScheduleDomainService.handle({
      tasks: tasks.map(serializeTask),
      upcomingEvents: upcomingEvents.map(serializeUpcomingEvent),
    });

    const tasksById = new Map<string, Task>(
      tasks.map((task) => [task.getId(), task]),
    );

    const schedules = generatedSchedules.map((generatedSchedule) => {
      const task = tasksById.get(generatedSchedule.taskId);
      if (task == null) {
        throw new Error(`No task found: ${generatedSchedule.taskId}`);
      }

      return new Schedule(
        idGenerator.generate<Schedule>(),
        generatedSchedule.title,
        new Date(generatedSchedule.startAt),
        new Date(generatedSchedule.endAt),
        task,
      );
    });

    await Promise.all(
      schedules.map((schedule) => this.#scheduleRepository.save(schedule)),
    );

    return schedules;
  }
}
