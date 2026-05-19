import { Card, Grid, Title, Text, Button, Group, Stack, ActionIcon, Modal, TextInput, Textarea, Box } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Schedule } from "@mantine/schedule";
import type { ScheduleEventData, ScheduleViewLevel } from "@mantine/schedule";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Clock } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";

export const Route = createFileRoute("/schedule 3")({ component: SchedulePage });

const today = dayjs().format('YYYY-MM-DD');

const initialEvents: ScheduleEventData[] = [
  { id: 1, title: 'Weekly Standup', start: `${today} 09:00:00`, end: `${today} 10:00:00`, color: 'blue' },
  { id: 2, title: 'Design Team Sync', start: `${today} 09:30:00`, end: `${today} 11:00:00`, color: 'indigo' },
  { id: 3, title: 'Deep Work Block', start: `${today} 10:00:00`, end: `${today} 11:30:00`, color: 'gray' },
  { id: 4, title: 'Urgent Review', start: `${today} 11:00:00`, end: `${today} 11:45:00`, color: 'red' },
  { id: 5, title: 'LUNCH HOUR', start: `${today} 12:00:00`, end: `${today} 13:00:00`, color: 'gray', display: 'background' },
  { id: 6, title: 'Client Lunch', start: `${today} 13:00:00`, end: `${today} 14:30:00`, color: 'orange' },
];

function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEventData[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<ScheduleViewLevel>('week');
  const [opened, { open, close }] = useDisclosure(false);

  // Derive a string format for the schedule component
  const scheduleDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : today;

  return (
    <Stack gap="lg" h="100%">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Group gap="md" align="center">
            <Title order={2} style={{ fontSize: 28 }}>{dayjs(scheduleDate).format('MMMM YYYY')}</Title>
            <Group gap={0}>
              <ActionIcon variant="default" size="lg" radius="md" style={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onClick={() => setSelectedDate(dayjs(selectedDate).subtract(1, view === 'month' ? 'month' : 'week').toDate())}>
                <Text size="lg">‹</Text>
              </ActionIcon>
              <ActionIcon variant="default" size="lg" radius="md" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} onClick={() => setSelectedDate(dayjs(selectedDate).add(1, view === 'month' ? 'month' : 'week').toDate())}>
                <Text size="lg">›</Text>
              </ActionIcon>
            </Group>
          </Group>
          <Text c="dimmed" mt={4}>Manage your professional timeline</Text>
        </div>
        <Group>
          <Button.Group>
            <Button variant={view === 'day' ? 'filled' : 'default'} color={view === 'day' ? 'indigo.1' : undefined} c={view === 'day' ? 'indigo.9' : undefined} onClick={() => setView('day')}>Day</Button>
            <Button variant={view === 'week' ? 'filled' : 'default'} color={view === 'week' ? 'indigo.1' : undefined} c={view === 'week' ? 'indigo.9' : undefined} onClick={() => setView('week')}>Week</Button>
            <Button variant={view === 'month' ? 'filled' : 'default'} color={view === 'month' ? 'indigo.1' : undefined} c={view === 'month' ? 'indigo.9' : undefined} onClick={() => setView('month')}>Month</Button>
          </Button.Group>
          <Button leftSection={<Plus size={16} />} color="indigo.9" radius="md" onClick={open}>Add Event</Button>
        </Group>
      </Group>

      <Grid style={{ flex: 1 }}>
        {/* Left Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="md">
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <DatePicker 
                value={selectedDate} 
                onChange={setSelectedDate} 
                size="sm"
                styles={{ calendarHeader: { marginBottom: 10 } }}
              />
            </Card>

            <div>
              <Group justify="space-between" mb="xs">
                <Title order={5}>Up Next</Title>
                <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={16} /></ActionIcon>
              </Group>
              <Stack gap="xs">
                <Card withBorder padding="sm" radius="md" style={{ borderLeft: '4px solid var(--mantine-color-orange-filled)' }}>
                  <Text fw={500} size="sm">Client Lunch Prep</Text>
                  <Group gap={4} c="dimmed" mt={4}>
                    <Clock size={12} />
                    <Text size="xs">30 min</Text>
                  </Group>
                </Card>
                <Card withBorder padding="sm" radius="md" style={{ borderLeft: '4px solid var(--mantine-color-blue-filled)' }}>
                  <Text fw={500} size="sm">Review Q3 Assets</Text>
                  <Group gap={4} c="dimmed" mt={4}>
                    <Clock size={12} />
                    <Text size="xs">1 hr</Text>
                  </Group>
                </Card>
              </Stack>
            </div>
          </Stack>
        </Grid.Col>
        
        {/* Right Main Schedule */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Card shadow="sm" radius="md" withBorder h={700} p={0} style={{ overflow: 'hidden' }}>
            <Schedule 
              events={events} 
              date={scheduleDate}
              onDateChange={(d) => setSelectedDate(new Date(d))}
              view={view}
              onViewChange={setView}
              weekViewProps={{ startTime: '09:00:00', endTime: '18:00:00', withHeader: false, withWeekendDays: false }}
              dayViewProps={{ startTime: '09:00:00', endTime: '18:00:00', withHeader: false }}
              monthViewProps={{ withHeader: false }}
              yearViewProps={{ withHeader: false }}
              renderEventBody={(event) => (
                event.display === 'background' ? (
                  <Group justify="center" align="center" h="100%">
                    <Box px="md" py={4} bg="gray.1" style={{ borderRadius: 20, border: '1px solid var(--mantine-color-gray-3)' }}>
                      <Text size="xs" fw={600} c="gray.6" letterSpacing={1}>{event.title}</Text>
                    </Box>
                  </Group>
                ) : (
                  <Stack gap={2} p={4} h="100%">
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" c={event.color ? `${event.color}.9` : undefined} style={{ opacity: 0.8 }}>
                        {dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
                      </Text>
                      {event.id === 6 && <Box bg="orange.2" px={4} py={2} style={{ borderRadius: 4 }}><Text size="10px" fw={700} c="orange.9">HIGH</Text></Box>}
                    </Group>
                    <Text fw={600} size="sm" c={event.color ? `${event.color}.9` : undefined}>{event.title}</Text>
                  </Stack>
                )
              )}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={close} title="Add New Event" centered>
        <Stack gap="md">
          <TextInput label="Title" placeholder="Event title" required />
          <Group grow>
            <TextInput label="Start Time" type="datetime-local" required />
            <TextInput label="End Time" type="datetime-local" required />
          </Group>
          <Button fullWidth onClick={close}>Save Event</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
