import type { Schedule, ScheduleId } from "../model/schedule";

export interface ScheduleRepository {
  findById(id: ScheduleId): Promise<Schedule | undefined>;
  findAll(): Promise<Schedule[]>;
  save(schedule: Schedule): Promise<void>;
  delete(id: ScheduleId): Promise<void>;
}
