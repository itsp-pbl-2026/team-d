import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { editUpcomingEvent, type UpcomingEventListItem } from "../api/api";
import {
  createEmptyEventFormData,
  type EventFormData,
  type EventFormDataValidated,
} from "./eventForm";

export const useEditEventForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingEventId, setEditingEventId] = useState<
    UpcomingEventListItem["id"] | null
  >(null);
  const [data, setData] = useState<EventFormData>(createEmptyEventFormData());

  const handleClose = useCallback(() => {
    close();
    setEditingEventId(null);
    setData(createEmptyEventFormData());
  }, [close]);

  const openForEdit = useCallback(
    (event: UpcomingEventListItem) => {
      setEditingEventId(event.id);
      setData({
        title: event.title,
        description: event.description,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
      });
      open();
    },
    [open],
  );

  const submit = useCallback(
    async (data: EventFormDataValidated) => {
      if (editingEventId == null) {
        return;
      }

      try {
        await editUpcomingEvent({
          data: {
            id: editingEventId,
            title: data.title,
            description: data.description,
            startAt: data.startAt,
            endAt: data.endAt,
          },
        });

        router.invalidate();
        handleClose();
      } catch (error) {
        console.error("Failed to edit event", error);
      }
    },
    [editingEventId, handleClose, router],
  );

  return {
    opened,
    close: handleClose,
    openForEdit,
    data,
    setData,
    submit,
  };
};
