import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback } from "react";
import { deleteTask, type TaskListItem, updateTask } from "../api/api";
import type { TaskId } from "../model/task";

// タスクカード上のクイック操作(完了・延期・削除)。
export const useTaskActions = () => {
  const router = useRouter();

  const complete = useCallback(
    async (id: TaskId) => {
      try {
        await updateTask({ data: { id, status: "done", progress: 100 } });
        router.invalidate();
      } catch (error) {
        console.error("Failed to complete task", error);
      }
    },
    [router],
  );

  const postpone = useCallback(
    async (task: TaskListItem, days: number) => {
      try {
        await updateTask({
          data: {
            id: task.id,
            deadline: dayjs(task.deadline).add(days, "day").toDate(),
          },
        });
        router.invalidate();
      } catch (error) {
        console.error(`Failed to postpone task by ${days} days`, error);
      }
    },
    [router],
  );

  const remove = useCallback(
    async (id: TaskId) => {
      try {
        await deleteTask({ data: { id } });
        router.invalidate();
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    },
    [router],
  );

  return { complete, postpone, remove };
};
