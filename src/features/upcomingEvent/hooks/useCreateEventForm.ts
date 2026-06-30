import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { createUpcomingEvent } from "../api/api";
import {
  type EventFormDataValidated,
  useEventFormData,
} from "./useEventFormData";

export const useCreateEventForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const { data, setData, reset } = useEventFormData();

  const submit = useCallback(
    async (data: EventFormDataValidated) => {
      try {
        await createUpcomingEvent({
          data: {
            title: data.title,
            description: data.description,
            startAt: data.startAt,
            endAt: data.endAt,
          },
        });

        router.invalidate();
        close();
        reset();
      } catch (error) {
        console.error("Failed to create event", error);
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
