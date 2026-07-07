import { Box, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import type { ScheduleEventData, ScheduleViewLevel } from "@mantine/schedule";
import { Schedule } from "@mantine/schedule";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { getUpcomingEvents } from "#/features/upcomingEvent/api/api";
import { CreateEventModal } from "#/features/upcomingEvent/components/CreateEventModal";
import { useCreateEventForm } from "#/features/upcomingEvent/hooks/useCreateEventForm";
import { useEditEventForm } from "#/features/upcomingEvent/hooks/useEditEventForm";
import { useEventsForSchedule } from "#/features/upcomingEvent/hooks/useEventsForSchedule";

export const Route = createFileRoute("/calender")({
  loader: async () => {
    const events = await getUpcomingEvents();
    return events;
  },
  component: CalenderPage,
});

const today = dayjs().format("YYYY-MM-DD");

function CalenderPage() {
  const events = Route.useLoaderData();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<ScheduleViewLevel>("week");

  const {
    opened: createEventOpened,
    open: openCreateEvent,
    close: handleCreateEventClose,
    data: createEventFormData,
    setData: setCreateEventFormData,
    submit: handleCreateEvent,
  } = useCreateEventForm();
  const {
    opened: eventEditOpened,
    open: openEditEvent,
    close: handleEditEventClose,
    data: editEventFormData,
    setData: setEditEventFormData,
    submit: handleEditEvent,
  } = useEditEventForm();

  // Derive a string format for the schedule component
  const scheduleDate = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : today;

  const {
    data: eventData,
    onEventClick,
    onEventDrop,
  } = useEventsForSchedule({ source: events, openForm: openEditEvent });

  return (
    <Stack gap="lg" h="100%">
      <Group justify="right">
        <Button
          leftSection={<Plus size={16} />}
          color="indigo"
          onClick={openCreateEvent}
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
        onEventClick={onEventClick}
        onEventDrop={onEventDrop}
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
        opened={createEventOpened}
        onClose={handleCreateEventClose}
        onSubmit={handleCreateEvent}
        data={createEventFormData}
        setData={setCreateEventFormData}
      />
      <CreateEventModal
        opened={eventEditOpened}
        onClose={handleEditEventClose}
        onSubmit={handleEditEvent}
        data={editEventFormData}
        setData={setEditEventFormData}
        mode="edit"
      />
    </Stack>
  );
}
