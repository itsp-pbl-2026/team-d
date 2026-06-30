import { Box, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import type { ScheduleEventData, ScheduleViewLevel } from "@mantine/schedule";
import { Schedule } from "@mantine/schedule";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  editUpcomingEvent,
  getUpcomingEvents,
  type UpcomingEventListItem,
} from "#/features/upcomingEvent/api/api";
import { CreateEventModal } from "#/features/upcomingEvent/components/CreateEventModal";
import { useCreateEventForm } from "#/features/upcomingEvent/hooks/useCreateEventForm";
import { useEditEventForm } from "#/features/upcomingEvent/hooks/useEditEventForm";

export const Route = createFileRoute("/calender")({
  loader: async () => {
    const events = await getUpcomingEvents();
    return events;
  },
  component: CalenderPage,
});

const today = dayjs().format("YYYY-MM-DD");

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

const findEventById = (
  events: UpcomingEventListItem[],
  eventId: string | number,
) => events.find((event) => String(event.id) === String(eventId));

function CalenderPage() {
  const router = useRouter();
  const events = Route.useLoaderData();
  const [editableEvents, setEditableEvents] = useState(events);
  const eventData = useMemo(
    () => editableEvents.map(toEventData),
    [editableEvents],
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<ScheduleViewLevel>("week");

  const {
    opened: eventOpened,
    open: openEvent,
    close: handleEventClose,
    data: eventFormData,
    setData: setEventFormData,
    submit: handleCreateEvent,
  } = useCreateEventForm();
  const {
    opened: editOpened,
    close: handleEditClose,
    openForEdit,
    data: editFormData,
    setData: setEditFormData,
    submit: handleEditEvent,
  } = useEditEventForm();

  useEffect(() => {
    setEditableEvents(events);
  }, [events]);

  // Derive a string format for the schedule component
  const scheduleDate = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : today;

  const handleEventClick = useCallback(
    (event: ScheduleEventData) => {
      const selectedEvent = findEventById(editableEvents, event.id);

      if (selectedEvent == null) {
        return;
      }

      openForEdit(selectedEvent);
    },
    [editableEvents, openForEdit],
  );

  const handleEventDrop = useCallback(
    async ({
      eventId,
      newStart,
      newEnd,
    }: {
      eventId: string | number;
      newStart: string;
      newEnd: string;
    }) => {
      const currentEvent = findEventById(editableEvents, eventId);

      if (currentEvent == null) {
        return;
      }

      const nextEvent = {
        ...currentEvent,
        startAt: dayjs(newStart).toISOString(),
        endAt: dayjs(newEnd).toISOString(),
      };

      setEditableEvents((prev) =>
        prev.map((event) => (event.id === currentEvent.id ? nextEvent : event)),
      );

      try {
        await editUpcomingEvent({
          data: {
            id: currentEvent.id,
            title: currentEvent.title,
            description: currentEvent.description,
            startAt: dayjs(newStart).toDate(),
            endAt: dayjs(newEnd).toDate(),
          },
        });

        router.invalidate();
      } catch (error) {
        setEditableEvents((prev) =>
          prev.map((event) =>
            event.id === currentEvent.id ? currentEvent : event,
          ),
        );
        console.error("Failed to move event", error);
      }
    },
    [editableEvents, router],
  );

  return (
    <Stack gap="lg" h="100%">
      <Group justify="right">
        <Button
          leftSection={<Plus size={16} />}
          color="indigo"
          onClick={openEvent}
        >
          Add Event
        </Button>
      </Group>

      <Schedule
        events={eventData}
        date={scheduleDate}
        onDateChange={(d) => setSelectedDate(new Date(d))}
        view={view}
        onViewChange={setView}
        color="indigo"
        withEventsDragAndDrop
        onEventDrop={handleEventDrop}
        onEventClick={handleEventClick}
        dayViewProps={{
          startTime: "09:00:00",
          endTime: "18:00:00",
        }}
        weekViewProps={{
          startTime: "09:00:00",
          endTime: "18:00:00",
        }}
        renderEventBody={(
          event: ScheduleEventData<{ description: string }>,
        ) => (
          <>
            <Box>{event.title}</Box>
            <ScrollArea
              c="dark"
              h="100%"
              styles={{
                scrollbar: { background: "transparent" },
              }}
            >
              <Text c="dark" size="sm">
                {event.payload?.description}
              </Text>
            </ScrollArea>
          </>
        )}
      />

      <CreateEventModal
        opened={eventOpened}
        onClose={handleEventClose}
        onSubmit={handleCreateEvent}
        data={eventFormData}
        setData={setEventFormData}
      />
      <CreateEventModal
        opened={editOpened}
        onClose={handleEditClose}
        onSubmit={handleEditEvent}
        data={editFormData}
        setData={setEditFormData}
        mode="edit"
      />
    </Stack>
  );
}
