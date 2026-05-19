import { eq } from "drizzle-orm";
import { drizzleClient } from "../../../db/drizzleClient";
import { task } from "../../../db/schema";
import { Task } from "../model/task";
import type { TaskRepository } from "./task";

export class TaskDrizzleRepository implements TaskRepository {
  async findById(id: string) {
    const result = await drizzleClient
      .select()
      .from(task)
      .where(eq(task.id, id));

    const resultTask = result[0];

    return new Task(
      resultTask.id,
      resultTask.title,
      resultTask.description ?? "",
      resultTask.deadline,
      resultTask.estimatedMinutes,
      resultTask.actualMinutes ?? 0,
      resultTask.priority ?? 0,
      resultTask.progress ?? 0,
      resultTask.status ?? "",
    );
  }

  async findAll() {
    const allTasksFromTable = await drizzleClient.select().from(task);

    const allTasks = allTasksFromTable.map(
      (oneTask) =>
        new Task(
          oneTask.id,
          oneTask.title,
          oneTask.description ?? "",
          oneTask.deadline,
          oneTask.estimatedMinutes,
          oneTask.actualMinutes ?? 0,
          oneTask.priority ?? 0,
          oneTask.progress ?? 0,
          oneTask.status ?? "",
        ),
    );

    return allTasks;
  }

  async save(task_: Task) {
    await drizzleClient.insert(task).values({
      id: task_.getId(),
      title: task_.getTitle(),
      description: task_.getDescription(),
      deadline: task_.getDeadline(),
      estimatedMinutes: task_.getEstimatedMinutes(),
      actualMinutes: task_.getActualMinutes(),
      priority: task_.getPriority(),
      progress: task_.getProgress(),
      status: task_.getStatus(),
    });

    return;
  }

  async delete(id: string): Promise<void> {
    await drizzleClient.delete(task).where(eq(task.id, id));
  }
}
