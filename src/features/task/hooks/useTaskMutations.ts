import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createTask,
  deleteTask,
  type TaskListItem,
  updateTask,
} from "../api/api";
import type { CreateTaskFormData } from "../components/CreateTaskModal";
import type { EditTaskFormData } from "../components/EditTaskModal";
import { formatDeadline } from "../utils/format";

export const useTaskMutations = (tasks: TaskListItem[]) => {
  const router = useRouter();

  const [taskOpened, { open: openTask, close: closeTask }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // New Task states
  const [taskFormData, setTaskFormData] = useState<CreateTaskFormData>({
    title: "",
    description: "",
    deadline: null,
    estimatedMinutes: 60,
    priority: 0,
  });
  const [taskErrors, setTaskErrors] = useState({ title: "", deadline: "" });

  // Edit states
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [editFormData, setEditFormData] = useState<EditTaskFormData>({
    id: "",
    title: "",
    description: "",
    deadline: null,
    estimatedMinutes: 60,
    priority: 0,
    progress: 0,
    status: "",
  });
  const [editErrors, setEditErrors] = useState({ title: "", deadline: "" });

  const handleTaskClose = () => {
    closeTask();
    setTaskErrors({ title: "", deadline: "" });
  };

  const handleCreateTask = async () => {
    const errors = {
      title: !taskFormData.title.trim() ? "Task Title is required" : "",
      deadline: !taskFormData.deadline ? "Deadline is required" : "",
    };

    setTaskErrors(errors);
    if (errors.title !== "" || errors.deadline !== "") return;

    try {
      await createTask({
        data: {
          title: taskFormData.title,
          description: taskFormData.description,
          deadline: taskFormData.deadline ?? new Date(),
          estimatedMinutes: taskFormData.estimatedMinutes,
          priority: taskFormData.priority,
        },
      });

      router.invalidate();
      handleTaskClose();
      setTaskFormData({
        title: "",
        description: "",
        deadline: null,
        estimatedMinutes: 60,
        priority: 0,
      });
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateTask({
        data: { id, status: "done", progress: 100 },
      });
      router.invalidate();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask({ data: { id } });
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleClearAll = async () => {
    try {
      const completedTasks = tasks.filter((t) => t.status === "done");
      for (const t of completedTasks) {
        await deleteTask({ data: { id: t.id } });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to clear completed tasks", error);
    }
  };

  const handleCompleteAllOverdue = async () => {
    try {
      const overdueTasks = tasks.filter(
        (t) => t.status !== "done" && formatDeadline(t.deadline).isOverdue,
      );
      for (const t of overdueTasks) {
        await updateTask({
          data: { id: t.id, status: "done", progress: 100 },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to complete overdue tasks", error);
    }
  };

  const handleDeleteAllOverdue = async () => {
    try {
      const overdueTasks = tasks.filter(
        (t) => t.status !== "done" && formatDeadline(t.deadline).isOverdue,
      );
      for (const t of overdueTasks) {
        await deleteTask({ data: { id: t.id } });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete overdue tasks", error);
    }
  };

  const handlePostponeAllActive = async (days: number) => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        const d = new Date(t.deadline);
        d.setDate(d.getDate() + days);
        await updateTask({
          data: { id: t.id, deadline: d },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error(`Failed to postpone active tasks by ${days} days`, error);
    }
  };

  const handlePostpone = async (id: string, days: number) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const d = new Date(task.deadline);
      d.setDate(d.getDate() + days);
      await updateTask({
        data: { id, deadline: d },
      });
      router.invalidate();
    } catch (error) {
      console.error(`Failed to postpone task by ${days} days`, error);
    }
  };

  const handleResetProgressAllActive = async () => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        await updateTask({
          data: { id: t.id, progress: 0, status: "pending" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to reset progress for active tasks", error);
    }
  };

  const handleCompleteAllActive = async () => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        await updateTask({
          data: { id: t.id, progress: 100, status: "done" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to complete all active tasks", error);
    }
  };

  const handleRestoreAllCompleted = async () => {
    try {
      const completedTasks = tasks.filter((t) => t.status === "done");
      for (const t of completedTasks) {
        await updateTask({
          data: { id: t.id, progress: 0, status: "pending" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to restore completed tasks", error);
    }
  };

  const handleEditClick = (task: TaskListItem) => {
    setEditingTask(task);
    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline),
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      progress: task.progress,
      status: task.status,
    });
    openEdit();
  };

  const handleEditClose = () => {
    closeEdit();
    setEditingTask(null);
    setEditErrors({ title: "", deadline: "" });
  };

  const handleUpdateTask = async () => {
    const errors = {
      title: !editFormData.title.trim() ? "Task Title is required" : "",
      deadline: !editFormData.deadline ? "Deadline is required" : "",
    };

    setEditErrors(errors);
    if (errors.title !== "" || errors.deadline !== "") return;

    try {
      await updateTask({
        data: {
          id: editFormData.id,
          title: editFormData.title,
          description: editFormData.description,
          deadline: editFormData.deadline ?? new Date(),
          estimatedMinutes: editFormData.estimatedMinutes,
          priority: editFormData.priority,
          progress: editFormData.progress,
          status: editFormData.status,
        },
      });

      router.invalidate();
      handleEditClose();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleEditDelete = async () => {
    if (!editingTask) return;
    try {
      await deleteTask({ data: { id: editingTask.id } });
      router.invalidate();
      handleEditClose();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return {
    taskOpened,
    openTask,
    closeTask,
    handleTaskClose,
    editOpened,
    openEdit,
    closeEdit,
    handleEditClose,
    taskFormData,
    setTaskFormData,
    taskErrors,
    handleCreateTask,
    editFormData,
    setEditFormData,
    editErrors,
    handleUpdateTask,
    handleEditDelete,
    handleComplete,
    handleDelete,
    handleClearAll,
    handleCompleteAllOverdue,
    handleDeleteAllOverdue,
    handlePostponeAllActive,
    handlePostpone,
    handleResetProgressAllActive,
    handleCompleteAllActive,
    handleRestoreAllCompleted,
    handleEditClick,
  };
};
