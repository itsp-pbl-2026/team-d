import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { createTask } from "../api/api";
import { type TaskFormDataValidated, useTaskFormData } from "./useTaskFormData";

export const useCreateTaskForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const { data, setData, reset } = useTaskFormData();

  const submit = useCallback(
    async (data: TaskFormDataValidated) => {
      try {
        await createTask({
          data: {
            title: data.title,
            description: data.description,
            deadline: data.deadline,
            estimatedMinutes: data.estimatedMinutes,
            priority: data.priority,
          },
        });

        router.invalidate();
        close();
        reset();
      } catch (error) {
        console.error("Failed to create task", error);
      }
    },
    [router, close, reset],
  );

  return {
    opened,
    open,
    close,
    data,
    setData,
    submit,
  };
};
