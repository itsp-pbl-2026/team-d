import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ScheduleEventData, ScheduleViewLevel } from "@mantine/schedule";
import { Schedule } from "@mantine/schedule";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/calender")({ component: CalenderPage });

const today = dayjs().format("YYYY-MM-DD");

const initialEvents: ScheduleEventData[] = [
  {
    id: 1,
    title: "Weekly Standup",
    start: `${today} 09:00:00`,
    end: `${today} 10:00:00`,
    color: "blue",
  },
  {
    id: 2,
    title: "Design Team Sync",
    start: `${today} 09:30:00`,
    end: `${today} 11:00:00`,
    color: "indigo",
  },
  {
    id: 3,
    title: "Deep Work Block",
    start: `${today} 10:00:00`,
    end: `${today} 11:30:00`,
    color: "gray",
  },
  {
    id: 4,
    title: "Urgent Review",
    start: `${today} 11:00:00`,
    end: `${today} 11:45:00`,
    color: "red",
  },
  {
    id: 5,
    title: "LUNCH HOUR",
    start: `${today} 12:00:00`,
    end: `${today} 13:00:00`,
    color: "gray",
    display: "background",
  },
  {
    id: 6,
    title: "Client Lunch",
    start: `${today} 13:00:00`,
    end: `${today} 14:30:00`,
    color: "orange",
  },
];

function CalenderPage() {
  const [events] = useState<ScheduleEventData[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<ScheduleViewLevel>("week");
  const [opened, { open, close }] = useDisclosure(false);

  // Derive a string format for the schedule component
  const scheduleDate = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : today;

  return (
    <Stack gap="lg" h="100%">
      <Group justify="right">
        <Button leftSection={<Plus size={16} />} color="indigo" onClick={open}>
          Add Event
        </Button>
      </Group>

      <Schedule
        events={events}
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
      />

      <Modal opened={opened} onClose={close} title="Add New Event" centered>
        <Stack gap="md">
          <TextInput label="Title" placeholder="Event title" required />
          <Group grow>
            <TextInput label="Start Time" type="datetime-local" required />
            <TextInput label="End Time" type="datetime-local" required />
          </Group>
          <Button fullWidth onClick={close}>
            Save Event
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
