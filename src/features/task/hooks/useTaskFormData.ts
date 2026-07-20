import { useCallback, useState } from "react";

export type TaskFormData = {
  title: string;
  description: string;
  deadline: Date | null;
  estimatedMinutes: number;
  priority: number;
  progress: number;
  status: string;
};

export type TaskFormDataValidated = TaskFormData & {
  deadline: Date;
};

const createEmptyData = (): TaskFormData => ({
  title: "",
  description: "",
  deadline: null,
  estimatedMinutes: 60,
  priority: 0,
  progress: 0,
  status: "pending",
});

export const useTaskFormData = () => {
  const [data, setData] = useState(createEmptyData());
  const reset = useCallback(() => setData(createEmptyData()), []);

  return { data, setData, reset };
};
