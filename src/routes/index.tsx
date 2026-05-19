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
import { UpcomingEvent } from "../feature/event/model/event";
import { Task } from "../features/task/model/task";

export const Route = createFileRoute("/")({ component: Home });

// Mock Data using backend's Domain Classes
const todayEvents: UpcomingEvent[] = [
  new UpcomingEvent(
    "1",
    "Daily Standup",
    "Zoom Room A",
    new Date("2026-05-12T09:00:00Z"),
    new Date("2026-05-12T09:30:00Z"),
  ),
  new UpcomingEvent(
    "2",
    "Design System Review",
    "Reviewing component structures",
    new Date("2026-05-12T10:30:00Z"),
    new Date("2026-05-12T11:30:00Z"),
  ),
  new UpcomingEvent(
    "3",
    "Client Discovery Call",
    "New project kickoff",
    new Date("2026-05-12T13:00:00Z"),
    new Date("2026-05-12T14:00:00Z"),
  ),
];

const tasks: Task[] = [
  new Task(
    "1",
    "Update UI for Dashboard",
    "",
    new Date("2026-05-12T17:00:00Z"),
    120,
    60,
    1,
    50,
    "in_progress",
  ),
  new Task(
    "2",
    "Write API Documentation",
    "",
    new Date("2026-05-12T15:00:00Z"),
    60,
    0,
    2,
    0,
    "todo",
  ),
  new Task(
    "3",
    "Fix Login Bug",
    "",
    new Date("2026-05-12T12:00:00Z"),
    30,
    30,
    1,
    100,
    "done",
  ),
];

function Home() {
  const currentTask = tasks.find((t) => t.getStatus() === "in_progress");
  const completedTasks = tasks.filter((t) => t.getStatus() === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.getStatus() === "in_progress",
  ).length;
  const todoTasks = tasks.filter((t) => t.getStatus() === "todo").length;
  const totalTasks = tasks.length;

  const completedPercent = Math.round((completedTasks / totalTasks) * 100) || 0;
  const inProgressPercent =
    Math.round((inProgressTasks / totalTasks) * 100) || 0;
  const pendingHighPriority = tasks.filter(
    (t) => t.getPriority() === 1 && t.getStatus() !== "done",
  ).length;

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
                const timeStr = event.getStartAt().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <Timeline.Item
                    key={event.getId()}
                    title={event.getTitle()}
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
                      {event.getDescription()}
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
                    {
                      value: completedPercent,
                      color: "indigo",
                      tooltip: `Done (${completedTasks})`,
                    },
                    {
                      value: inProgressPercent,
                      color: "blue.3",
                      tooltip: `In Progress (${inProgressTasks})`,
                    },
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
                <Group
                  justify="space-between"
                  bg="gray.0"
                  p="xs"
                  style={{ borderRadius: 8 }}
                >
                  <Group gap="xs">
                    <Badge color="gray" variant="dot">
                      Todo
                    </Badge>
                  </Group>
                  <Text fw={700} c="gray.7">
                    {todoTasks}
                  </Text>
                </Group>

                <Group
                  justify="space-between"
                  bg="blue.0"
                  p="xs"
                  style={{ borderRadius: 8 }}
                >
                  <Group gap="xs">
                    <Badge color="blue" variant="dot">
                      In Progress
                    </Badge>
                  </Group>
                  <Text fw={700} c="blue.7">
                    {inProgressTasks}
                  </Text>
                </Group>

                <Group
                  justify="space-between"
                  bg="indigo.0"
                  p="xs"
                  style={{ borderRadius: 8 }}
                >
                  <Group gap="xs">
                    <Badge color="indigo" variant="dot">
                      Done
                    </Badge>
                  </Group>
                  <Text fw={700} c="indigo.7">
                    {completedTasks}
                  </Text>
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
                  {currentTask.getTitle()}
                </Text>
                <Text size="xs" c="dimmed">
                  Expected: {currentTask.getEstimatedMinutes()} min | Actual:{" "}
                  {currentTask.getActualMinutes()} min
                </Text>
                <Badge mt="sm" color="indigo" variant="light">
                  {currentTask.getProgress()}% Complete
                </Badge>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
