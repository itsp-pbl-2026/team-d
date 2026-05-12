import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import type { Event, Task } from "../shared/types/models";

export const Route = createFileRoute("/")({ component: Home });

// Mock Data
const todayEvents: Event[] = [
  {
    id: "1",
    title: "Daily Standup",
    description: "Zoom Room A",
    start_at: "2026-05-12T09:00:00Z",
    end_at: "2026-05-12T09:30:00Z",
  },
  {
    id: "2",
    title: "Design System Review",
    description: "Reviewing component structures",
    start_at: "2026-05-12T10:30:00Z",
    end_at: "2026-05-12T11:30:00Z",
  },
  {
    id: "3",
    title: "Client Discovery Call",
    description: "New project kickoff",
    start_at: "2026-05-12T13:00:00Z",
    end_at: "2026-05-12T14:00:00Z",
  },
];

const tasks: Task[] = [
  {
    id: "1",
    title: "Update UI for Dashboard",
    description: "",
    deadline_at: "2026-05-12T17:00:00Z",
    estimated_minutes: 120,
    actual_minutes: 60,
    priority: 1,
    progress: 50,
    status: "in_progress",
  },
  {
    id: "2",
    title: "Write API Documentation",
    description: "",
    deadline_at: "2026-05-12T15:00:00Z",
    estimated_minutes: 60,
    actual_minutes: 0,
    priority: 2,
    progress: 0,
    status: "todo",
  },
  {
    id: "3",
    title: "Fix Login Bug",
    description: "",
    deadline_at: "2026-05-12T12:00:00Z",
    estimated_minutes: 30,
    actual_minutes: 30,
    priority: 1,
    progress: 100,
    status: "done",
  },
];

function Home() {
  const currentTask = tasks.find((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const totalTasks = tasks.length;
  
  const completedPercent = Math.round((completedTasks / totalTasks) * 100) || 0;
  const inProgressPercent = Math.round((inProgressTasks / totalTasks) * 100) || 0;
  const pendingHighPriority = tasks.filter((t) => t.priority === 1 && t.status !== "done").length;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Good morning, Alex.</Title>
          <Text c="dimmed">
            You have {pendingHighPriority} high-priority tasks pending.
          </Text>
        </div>
        <Button leftSection={<CheckCircle2 size={16} />}>New Task</Button>
      </Group>

      <Grid>
        {/* Today's Schedule */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <Calendar size={20} className="text-indigo-600" />
                <Title order={4}>Today's Schedule</Title>
              </Group>
              <Button variant="subtle" size="xs">
                View Full Calendar
              </Button>
            </Group>

            <Timeline active={1} bulletSize={24} lineWidth={2}>
              {todayEvents.map((event, index) => {
                const timeStr = new Date(event.start_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" },
                );
                return (
                  <Timeline.Item
                    key={event.id}
                    title={event.title}
                    bullet={
                      <ThemeIcon
                        size={22}
                        radius="xl"
                        color={index === 1 ? "indigo" : "gray"}
                      >
                        <Clock size={12} />
                      </ThemeIcon>
                    }
                  >
                    <Text c="dimmed" size="sm">
                      {event.description}
                    </Text>
                    <Text size="xs" mt={4} fw={500}>
                      {timeStr}
                    </Text>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack h="100%" gap="md">
            {/* Overall Task Progress */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Overall Progress
              </Title>
              <Group justify="center">
                <RingProgress
                  size={120}
                  thickness={12}
                  roundCaps
                  sections={[
                    { value: completedPercent, color: "indigo", tooltip: `Done (${completedTasks})` },
                    { value: inProgressPercent, color: "blue.3", tooltip: `In Progress (${inProgressTasks})` }
                  ]}
                  label={
                    <Text c="indigo.9" fw={700} ta="center" size="xl">
                      {completedPercent}%
                    </Text>
                  }
                />
              </Group>
              <Text ta="center" c="dimmed" mt="sm">
                Completed{" "}
                <Text span fw={700} c="dark">
                  {completedTasks} of {totalTasks}
                </Text>{" "}
                total tasks.
              </Text>
            </Card>

            {/* Task Breakdown */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Task Status
              </Title>
              <Stack gap="xs">
                <Group justify="space-between" bg="gray.0" p="xs" style={{ borderRadius: 8 }}>
                  <Group gap="xs">
                    <Badge color="gray" variant="dot">Todo</Badge>
                  </Group>
                  <Text fw={700} c="gray.7">{todoTasks}</Text>
                </Group>
                
                <Group justify="space-between" bg="blue.0" p="xs" style={{ borderRadius: 8 }}>
                  <Group gap="xs">
                    <Badge color="blue" variant="dot">In Progress</Badge>
                  </Group>
                  <Text fw={700} c="blue.7">{inProgressTasks}</Text>
                </Group>

                <Group justify="space-between" bg="indigo.0" p="xs" style={{ borderRadius: 8 }}>
                  <Group gap="xs">
                    <Badge color="indigo" variant="dot">Done</Badge>
                  </Group>
                  <Text fw={700} c="indigo.7">{completedTasks}</Text>
                </Group>
              </Stack>
            </Card>

            {/* Current Working Task */}
            {currentTask && (
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                bg="indigo.0"
              >
                <Group gap="xs" mb="xs">
                  <PlayCircle size={18} color="var(--mantine-color-indigo-6)" />
                  <Title order={5} c="indigo.8">
                    Currently Working
                  </Title>
                </Group>
                <Text fw={600} size="sm">
                  {currentTask.title}
                </Text>
                <Text size="xs" c="dimmed">
                  Expected: {currentTask.estimated_minutes} min | Actual:{" "}
                  {currentTask.actual_minutes} min
                </Text>
                <Badge mt="sm" color="indigo" variant="light">
                  {currentTask.progress}% Complete
                </Badge>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
