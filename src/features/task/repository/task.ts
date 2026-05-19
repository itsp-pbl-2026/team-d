import type { Task } from "../model/task";
import {drizzleClient} from "../../../db/drizzleClient"
import {task} from "../../../db/schema"

export interface TaskRepository {
  findById(id: string): Promise<Task | undefined>;
  findAll(): Promise<Task[]>;

  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

async function save(task_:Task){
  await drizzleClient.insert(task).values({
    id: task_.getId(),
    title: task_.getTitle(),
    description: task_.getDescription(),
    deadline: task_.getDeadline(),                // Drizzleが自動的にDateオブジェクトをSQLiteに適した形式に変換してくれます
    estimatedMinutes: task_.getEstimatedMinutes(),
    actualMinutes: task_.getActualMinutes(),
    priority: task_.getPriority(),
    progress: task_.getProgress(),
    status: task_.getStatus(),
  })
}
