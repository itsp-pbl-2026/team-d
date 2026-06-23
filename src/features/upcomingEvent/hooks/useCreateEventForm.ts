import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { createUpcomingEvent } from "../api/api";

export type CreateEventFormData = {
  title: string;
  description: string;
  startAt: Date | null;
  endAt: Date | null;
};
export type CreateEventFormDataValidated = {
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
};

export const useCreateEventForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [data, setData] = useState<CreateEventFormData>({
    title: "",
    description: "",
    startAt: null,
    endAt: null,
  });

  const submit = useCallback(
    async (data: CreateEventFormDataValidated) => {
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
        setData({
          title: "",
          description: "",
          startAt: null,
          endAt: null,
        });
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
