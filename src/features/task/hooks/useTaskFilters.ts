import { useCallback, useMemo, useState } from "react";
import type { TaskListItem } from "../api/api";

export type TaskFilters = {
  title: string;
  minPriority: number | null;
  maxPriority: number | null;
  deadlineStart: Date | null;
  deadlineEnd: Date | null;
};

export type TaskSortBy = "priority" | "deadline" | "title";

const createEmptyFilters = (): TaskFilters => ({
  title: "",
  minPriority: null,
  maxPriority: null,
  deadlineStart: null,
  deadlineEnd: null,
});

const matchesFilters = (task: TaskListItem, filters: TaskFilters): boolean => {
  if (
    filters.title.trim() !== "" &&
    !task.title.toLowerCase().includes(filters.title.toLowerCase())
  ) {
    return false;
  }
  if (filters.minPriority !== null && task.priority < filters.minPriority) {
    return false;
  }
  if (filters.maxPriority !== null && task.priority > filters.maxPriority) {
    return false;
  }
  const deadline = new Date(task.deadline);
  if (filters.deadlineStart !== null && deadline < filters.deadlineStart) {
    return false;
  }
  if (filters.deadlineEnd !== null && deadline > filters.deadlineEnd) {
    return false;
  }
  return true;
};

const sortTasks = (tasks: TaskListItem[], sortBy: TaskSortBy): TaskListItem[] =>
  [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return b.priority - a.priority;
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return a.title.localeCompare(b.title);
    }
  });

// タスク一覧の絞り込みと並び替え。filters は1つのオブジェクトで管理する。
export const useTaskFilters = (tasks: TaskListItem[]) => {
  const [filters, setFilters] = useState(createEmptyFilters());
  const [sortBy, setSortBy] = useState<TaskSortBy>("priority");

  const resetFilters = useCallback(() => setFilters(createEmptyFilters()), []);

  const isFilterActive =
    filters.title.trim() !== "" ||
    filters.minPriority !== null ||
    filters.maxPriority !== null ||
    filters.deadlineStart !== null ||
    filters.deadlineEnd !== null;

  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesFilters(task, filters)),
    [tasks, filters],
  );

  const incompleteTasks = useMemo(
    () =>
      sortTasks(
        filteredTasks.filter((task) => task.status !== "done"),
        sortBy,
      ),
    [filteredTasks, sortBy],
  );
  const completedTasks = useMemo(
    () =>
      sortTasks(
        filteredTasks.filter((task) => task.status === "done"),
        sortBy,
      ),
    [filteredTasks, sortBy],
  );

  return {
    filters,
    setFilters,
    resetFilters,
    isFilterActive,
    sortBy,
    setSortBy,
    incompleteTasks,
    completedTasks,
  };
};
