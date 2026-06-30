import { useState } from "react";
import type { TaskListItem } from "../api/api";

export const useTaskFilters = (tasks: TaskListItem[]) => {
  const [filterTitle, setFilterTitle] = useState("");
  const [filterMinPriority, setFilterMinPriority] = useState<number | null>(
    null,
  );
  const [filterMaxPriority, setFilterMaxPriority] = useState<number | null>(
    null,
  );
  const [filterDeadlineStart, setFilterDeadlineStart] = useState<Date | null>(
    null,
  );
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("priority");

  const handleResetFilters = () => {
    setFilterTitle("");
    setFilterMinPriority(null);
    setFilterMaxPriority(null);
    setFilterDeadlineStart(null);
    setFilterDeadlineEnd(null);
  };

  const filteredTasks = tasks.filter((task) => {
    // Title filter
    if (filterTitle.trim() !== "") {
      if (!task.title.toLowerCase().includes(filterTitle.toLowerCase())) {
        return false;
      }
    }
    // Priority level min
    if (filterMinPriority !== null) {
      if (task.priority < filterMinPriority) {
        return false;
      }
    }
    // Priority level max
    if (filterMaxPriority !== null) {
      if (task.priority > filterMaxPriority) {
        return false;
      }
    }
    // Deadline start
    if (filterDeadlineStart !== null) {
      if (new Date(task.deadline) < filterDeadlineStart) {
        return false;
      }
    }
    // Deadline end
    if (filterDeadlineEnd !== null) {
      if (new Date(task.deadline) > filterDeadlineEnd) {
        return false;
      }
    }
    return true;
  });

  const sortTasks = (tasksList: TaskListItem[]) => {
    return [...tasksList].sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const sortedIncompleteTasks = sortTasks(
    filteredTasks.filter((t) => t.status !== "done"),
  );
  const sortedCompletedTasks = sortTasks(
    filteredTasks.filter((t) => t.status === "done"),
  );

  const isAnyFilterActive =
    filterTitle.trim() !== "" ||
    filterMinPriority !== null ||
    filterMaxPriority !== null ||
    filterDeadlineStart !== null ||
    filterDeadlineEnd !== null;

  return {
    filterTitle,
    setFilterTitle,
    filterMinPriority,
    setFilterMinPriority,
    filterMaxPriority,
    setFilterMaxPriority,
    filterDeadlineStart,
    setFilterDeadlineStart,
    filterDeadlineEnd,
    setFilterDeadlineEnd,
    sortBy,
    setSortBy,
    handleResetFilters,
    sortedIncompleteTasks,
    sortedCompletedTasks,
    isAnyFilterActive,
  };
};
