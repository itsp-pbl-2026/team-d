import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { deleteTask, type TaskListItem, updateTask } from "../api/api";
import type { TaskId } from "../model/task";
import { type TaskFormDataValidated, useTaskFormData } from "./useTaskFormData";

export const useEditTaskForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTaskId, setEditingTaskId] = useState<TaskId>();
  const { data, setData, reset } = useTaskFormData();

  const handleClose = useCallback(() => {
    close();
    setEditingTaskId(undefined);
    reset();
  }, [close, reset]);

  const openForEdit = useCallback(
    (task: TaskListItem) => {
      setEditingTaskId(task.id);
      setData({
        title: task.title,
        description: task.description,
        deadline: new Date(task.deadline),
        estimatedMinutes: task.estimatedMinutes,
        priority: task.priority,
        progress: task.progress,
        status: task.status,
      });
      open();
    },
    [open, setData],
  );

  const submit = useCallback(
    async (data: TaskFormDataValidated) => {
      if (editingTaskId == null) {
        return;
      }

      try {
        await updateTask({
          data: {
            id: editingTaskId,
            title: data.title,
            description: data.description,
            deadline: data.deadline,
            estimatedMinutes: data.estimatedMinutes,
            priority: data.priority,
            progress: data.progress,
            status: data.status,
          },
        });

        router.invalidate();
        handleClose();
      } catch (error) {
        console.error("Failed to edit task", error);
      }
    },
    [editingTaskId, handleClose, router],
  );

  const remove = useCallback(async () => {
    if (editingTaskId == null) {
      return;
    }

    try {
      await deleteTask({ data: { id: editingTaskId } });

      router.invalidate();
      handleClose();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  }, [editingTaskId, handleClose, router]);

  return {
    opened,
    open: openForEdit,
    close: handleClose,
    data,
    setData,
    submit,
    remove,
  };
};
