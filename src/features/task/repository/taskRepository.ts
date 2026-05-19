import { eq } from "drizzle-orm";
import { drizzleClient } from "../../../db/drizzleClient";
import { task as taskTable } from "../../../db/schema";
import { Task } from "../model/task";
import type { TaskRepository } from "./task";

export class TaskDrizzleRepository implements TaskRepository {
  async findById(id: string) {
    const result = await drizzleClient
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, id));

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
    const allTasksFromTable = await drizzleClient.select().from(taskTable);

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

  async save(task: Task) {
    await drizzleClient
      .insert(taskTable)
      .values({
        id: task.getId(),
        title: task.getTitle(),
        description: task.getDescription(),
        deadline: task.getDeadline(),
        estimatedMinutes: task.getEstimatedMinutes(),
        actualMinutes: task.getActualMinutes(),
        priority: task.getPriority(),
        progress: task.getProgress(),
        status: task.getStatus(),
      })
      .onConflictDoUpdate({
        target: taskTable.id,
        set: {
          title: task.getTitle(),
          description: task.getDescription(),
          deadline: task.getDeadline(),
          estimatedMinutes: task.getEstimatedMinutes(),
          actualMinutes: task.getActualMinutes(),
          priority: task.getPriority(),
          progress: task.getProgress(),
          status: task.getStatus(),
        },
      });

    return;
  }

  async delete(id: string): Promise<void> {
    await drizzleClient.delete(taskTable).where(eq(taskTable.id, id));
  }
}
