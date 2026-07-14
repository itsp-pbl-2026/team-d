import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback } from "react";
import { deleteTask, type TaskListItem, updateTask } from "../api/api";
import { formatDeadline } from "../utils/format";

const isDone = (task: TaskListItem) => task.status === "done";
const isOverdue = (task: TaskListItem) =>
  !isDone(task) && formatDeadline(task.deadline).isOverdue;

// カラムヘッダのメニューから実行する一括操作。
// 対象タスクへの更新は並列で投げ、完了後にまとめて再読込する。
export const useTaskBulkActions = (tasks: TaskListItem[]) => {
  const router = useRouter();

  const run = useCallback(
    async (label: string, operations: Promise<unknown>[]) => {
      try {
        await Promise.all(operations);
        router.invalidate();
      } catch (error) {
        console.error(`Failed to ${label}`, error);
      }
    },
    [router],
  );

  const completeOverdue = useCallback(
    () =>
      run(
        "complete overdue tasks",
        tasks.filter(isOverdue).map((task) =>
          updateTask({
            data: { id: task.id, status: "done", progress: 100 },
          }),
        ),
      ),
    [run, tasks],
  );

  const deleteOverdue = useCallback(
    () =>
      run(
        "delete overdue tasks",
        tasks
          .filter(isOverdue)
          .map((task) => deleteTask({ data: { id: task.id } })),
      ),
    [run, tasks],
  );

  const postponeAll = useCallback(
    (days: number) =>
      run(
        `postpone active tasks by ${days} days`,
        tasks
          .filter((task) => !isDone(task))
          .map((task) =>
            updateTask({
              data: {
                id: task.id,
                deadline: dayjs(task.deadline).add(days, "day").toDate(),
              },
            }),
          ),
      ),
    [run, tasks],
  );

  const resetProgressAll = useCallback(
    () =>
      run(
        "reset progress of active tasks",
        tasks
          .filter((task) => !isDone(task))
          .map((task) =>
            updateTask({
              data: { id: task.id, progress: 0, status: "pending" },
            }),
          ),
      ),
    [run, tasks],
  );

  const completeAll = useCallback(
    () =>
      run(
        "complete all active tasks",
        tasks
          .filter((task) => !isDone(task))
          .map((task) =>
            updateTask({
              data: { id: task.id, status: "done", progress: 100 },
            }),
          ),
      ),
    [run, tasks],
  );

  const restoreCompleted = useCallback(
    () =>
      run(
        "restore completed tasks",
        tasks.filter(isDone).map((task) =>
          updateTask({
            data: { id: task.id, progress: 0, status: "pending" },
          }),
        ),
      ),
    [run, tasks],
  );

  const deleteCompleted = useCallback(
    () =>
      run(
        "delete completed tasks",
        tasks
          .filter(isDone)
          .map((task) => deleteTask({ data: { id: task.id } })),
      ),
    [run, tasks],
  );

  return {
    completeOverdue,
    deleteOverdue,
    postponeAll,
    resetProgressAll,
    completeAll,
    restoreCompleted,
    deleteCompleted,
  };
};
