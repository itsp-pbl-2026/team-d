import { Box, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import type { ScheduleEventData, ScheduleViewLevel } from "@mantine/schedule";
import { Schedule } from "@mantine/schedule";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getUpcomingEvents,
  type UpcomingEventListItem,
} from "#/features/upcomingEvent/api/api";
import { CreateEventModal } from "#/features/upcomingEvent/components/CreateEventModal";
import { useCreateEventForm } from "#/features/upcomingEvent/hooks/useCreateEventForm";

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

function CalenderPage() {
  const events = Route.useLoaderData();
  const eventData = useMemo(() => events.map(toEventData), [events]);
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

  // Derive a string format for the schedule component
  const scheduleDate = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : today;

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
    </Stack>
  );
}
