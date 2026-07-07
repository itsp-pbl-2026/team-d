import { Box, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { Schedule, type ScheduleEventData } from "@mantine/schedule";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Grid2X2PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { getSchedules } from "#/features/schedule/api/api";
import { useGenerateSchedule } from "#/features/schedule/hooks/useGenerateSchedule";
import { useSchedulesForSchedule } from "#/features/schedule/hooks/useSchedulesForSchedule";
import { getUpcomingEvents } from "#/features/upcomingEvent/api/api";
import { useEventsForSchedule } from "#/features/upcomingEvent/hooks/useEventsForSchedule";

export const Route = createFileRoute("/schedule")({
  loader: async () => {
    const [events, schedules] = await Promise.all([
      getUpcomingEvents(),
      getSchedules(),
    ]);
    return { events, schedules };
  },
  component: SchedulePage,
});

const today = dayjs();

function SchedulePage() {
  const { events, schedules } = Route.useLoaderData();
  const weekEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          dayjs(event.startAt).isSame(today, "week") ||
          dayjs(event.endAt).isSame(today, "week"),
      ),
    [events],
  );
  const { data: eventData } = useEventsForSchedule({
    source: weekEvents,
    openForm: () => {},
  });
  const { data: scheduleData } = useSchedulesForSchedule({
    source: schedules,
    openForm: () => {},
  });
  const data = useMemo(
    () => [...eventData, ...scheduleData],
    [eventData, scheduleData],
  );
  const { generate } = useGenerateSchedule();

  return (
    <Stack gap="lg" h="100%">
      <Group justify="right">
        <Button
          leftSection={<Grid2X2PlusIcon size={16} />}
          color="indigo"
          onClick={generate}
        >
          {schedules.length === 0 ? "Generate Schedule" : "Regenerate Schedule"}
        </Button>
      </Group>

      <Schedule
        events={data}
        date={today.format("YYYY-MM-DD")}
        view="week"
        color="indigo"
        weekViewProps={{
          withHeader: false,
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
    </Stack>
  );
}
