import { useCallback, useState } from "react";

export type EventFormData = {
  title: string;
  description: string;
  startAt: Date | null;
  endAt: Date | null;
};

export type EventFormDataValidated = {
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
};

const createEmptyData = (): EventFormData => ({
  title: "",
  description: "",
  startAt: null,
  endAt: null,
});

export const useEventFormData = () => {
  const [data, setData] = useState(createEmptyData());
  const reset = useCallback(() => setData(createEmptyData()), []);

  return { data, setData, reset };
};
