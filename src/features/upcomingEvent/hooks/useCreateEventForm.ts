import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { createUpcomingEvent } from "../api/api";
import {
  createEmptyEventFormData,
  type EventFormData,
  type EventFormDataValidated,
} from "./eventForm";

export const useCreateEventForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [data, setData] = useState<EventFormData>(createEmptyEventFormData());

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
        setData(createEmptyEventFormData());
      } catch (error) {
        console.error("Failed to create event", error);
      }
    },
    [router, close],
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
