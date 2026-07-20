import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import {
  Schedule,
  type ScheduleEventData,
  type ScheduleViewLevel,
} from "@mantine/schedule";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Grid2X2PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getSchedules } from "#/features/schedule/api/api";
import {
  useGenerateRuleBasedSchedule,
  useGenerateSchedule,
} from "#/features/schedule/hooks/useGenerateSchedule";
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
const timeOptions = Array.from({ length: 25 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, "0")}:00`,
}));

const formatScheduleTime = (hour: number): string =>
  `${String(hour).padStart(2, "0")}:00:00`;

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
  const { data: scheduleData, onEventDrop } = useSchedulesForSchedule({
    source: schedules,
    openForm: () => {},
  });
  const data = useMemo(
    () => [...eventData, ...scheduleData],
    [eventData, scheduleData],
  );
  const { generate, isGenerating } = useGenerateSchedule();
  const {
    generate: generateRuleBased,
    isGenerating: isGeneratingRuleBased,
  } = useGenerateRuleBasedSchedule();
  const isAnyGenerating = isGenerating || isGeneratingRuleBased;

  const [selectedDate, setSelectedDate] = useState<Date>(today.toDate());
  const [view, setView] = useState<ScheduleViewLevel>("week");
  const [displayStartHour, setDisplayStartHour] = useState(0);
  const [displayEndHour, setDisplayEndHour] = useState(24);
  const displayStartTime = formatScheduleTime(displayStartHour);
  const displayEndTime = formatScheduleTime(displayEndHour);
  const displayStartOptions = timeOptions.filter(
    (option) => Number(option.value) < displayEndHour,
  );
  const displayEndOptions = timeOptions.filter(
    (option) => Number(option.value) > displayStartHour,
  );

  return (
    <Stack gap="lg" h="100%">
      <Group justify="space-between">
        <Group gap="xs">
          <Select
            label="Display start"
            value={String(displayStartHour)}
            onChange={(value) => {
              if (value != null) {
                setDisplayStartHour(Number(value));
              }
            }}
            data={displayStartOptions}
            allowDeselect={false}
            size="xs"
            w={120}
          />
          <Select
            label="Display end"
            value={String(displayEndHour)}
            onChange={(value) => {
              if (value != null) {
                setDisplayEndHour(Number(value));
              }
            }}
            data={displayEndOptions}
            allowDeselect={false}
            size="xs"
            w={120}
          />
        </Group>
        <Group>
          <Button
            leftSection={<Grid2X2PlusIcon size={16} />}
            color="teal"
            variant="outline"
            onClick={generateRuleBased}
            loading={isGeneratingRuleBased}
            disabled={isGenerating}
            loaderProps={{
              type: "dots",
            }}
          >
            Rule-based Generate
          </Button>
          <Button
            leftSection={<Grid2X2PlusIcon size={16} />}
            color="indigo"
            onClick={generate}
            loading={isGenerating}
            disabled={isGeneratingRuleBased}
            loaderProps={{
              type: "dots",
            }}
          >
            {schedules.length === 0
              ? "Generate Schedule"
              : "Regenerate Schedule"}
          </Button>
        </Group>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={isAnyGenerating} />
        <Schedule
          events={data}
          date={selectedDate}
          onDateChange={(date) => setSelectedDate(new Date(date))}
          view={view}
          onViewChange={setView}
          color="indigo"
          withEventsDragAndDrop
          canDragEvent={(event) => event.payload?.isEditable === true}
          onEventDrop={onEventDrop}
          dayViewProps={{
            startTime: displayStartTime,
            endTime: displayEndTime,
          }}
          weekViewProps={{
            startTime: displayStartTime,
            endTime: displayEndTime,
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
      </Box>
    </Stack>
  );
}
