import type { ScheduleEventData, ScheduleProps } from "@mantine/schedule";
import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { editUpcomingEvent, type UpcomingEventListItem } from "../api/api";

export type UseEventsForScheduleProps = {
  source: UpcomingEventListItem[];
  openForm: (event: UpcomingEventListItem) => void;
};

const toEventData = (
  event: UpcomingEventListItem,
): ScheduleEventData<{ description: string }> => ({
  id: event.id,
  title: event.title,
  payload: {
    description: event.description,
  },
  start: event.startAt,
  end: event.endAt,
  color: "blue",
});

export const useEventsForSchedule = ({
  source,
  openForm,
}: UseEventsForScheduleProps) => {
  const router = useRouter();

  const [events, setEvents] = useState(source);
  const data = useMemo(() => events.map(toEventData), [events]);

  useEffect(() => setEvents(source), [source]);

  const onEventClick = useCallback<NonNullable<ScheduleProps["onEventClick"]>>(
    ({ id }) => {
      const event = events.find((event) => event.id === id);
      if (!event) return;

      openForm(event);
    },
    [events, openForm],
  );

  const onEventDrop = useCallback<NonNullable<ScheduleProps["onEventDrop"]>>(
    async ({ eventId, newStart, newEnd }) => {
      const previousEvent = events.find((event) => event.id === eventId);
      if (!previousEvent) return;

      const newEvent: UpcomingEventListItem = {
        ...previousEvent,
        startAt: dayjs(newStart).toISOString(),
        endAt: dayjs(newEnd).toISOString(),
      };
      setEvents((prev) =>
        prev.map((event) => (event.id === newEvent.id ? newEvent : event)),
      );

      try {
        await editUpcomingEvent({
          data: {
            id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description,
            startAt: dayjs(newStart).toDate(),
            endAt: dayjs(newEnd).toDate(),
          },
        });

        router.invalidate();
      } catch (error) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === newEvent.id ? previousEvent : event,
          ),
        );
        console.error("Failed to move event", error);
      }
    },
    [events, router],
  );

  return { data, onEventClick, onEventDrop };
};
