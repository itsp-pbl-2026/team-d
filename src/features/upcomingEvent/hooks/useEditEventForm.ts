import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { editUpcomingEvent, type UpcomingEventListItem } from "../api/api";
import type { UpcomingEventId } from "../model/upcomingEvent";
import {
  type EventFormDataValidated,
  useEventFormData,
} from "./useEventFormData";

export const useEditEventForm = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingEventId, setEditingEventId] = useState<UpcomingEventId>();
  const { data, setData, reset } = useEventFormData();

  const handleClose = useCallback(() => {
    close();
    setEditingEventId(undefined);
    reset();
  }, [close, reset]);

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
    [open, setData],
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
    open: openForEdit,
    close: handleClose,
    data,
    setData,
    submit,
  };
};
