import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  NumberInput,
  Rating,
  RingProgress,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Task, type TaskId } from "#/features/task/model/task";
import {
  UpcomingEvent,
  type UpcomingEventId,
} from "#/features/upcomingEvent/model/upcomingEvent";
import { getTasksFn, createTaskFn } from "./service";

export const Route = createFileRoute("/")({ 
  component: Home,
  loader: async () => await getTasksFn(),
});

// Mock Data using backend's Domain Classes
const todayEvents: UpcomingEvent[] = [
  new UpcomingEvent(
    "1" as UpcomingEventId,
    "Daily Standup",
    "Zoom Room A",
    new Date("2026-05-12T09:00:00Z"),
    new Date("2026-05-12T09:30:00Z"),
  ),
  new UpcomingEvent(
    "2" as UpcomingEventId,
    "Design System Review",
    "Reviewing component structures",
    new Date("2026-05-12T10:30:00Z"),
    new Date("2026-05-12T11:30:00Z"),
  ),
  new UpcomingEvent(
    "3" as UpcomingEventId,
    "Client Discovery Call",
    "New project kickoff",
    new Date("2026-05-12T13:00:00Z"),
    new Date("2026-05-12T14:00:00Z"),
  ),
];

function Home() {
  const router = useRouter();
  const rawTasks = Route.useLoaderData();
  const tasks = rawTasks.map(t => new Task(
    t.id as TaskId,
    t.title,
    t.description,
    new Date(t.deadline),
    t.estimatedMinutes,
    t.actualMinutes,
    t.priority,
    t.progress,
    t.status
  ));

  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: null as Date | null,
    estimatedMinutes: 60,
    priority: 0,
  });
  const [errors, setErrors] = useState({
    title: "",
    deadline: "",
  });

  const handleClose = () => {
    close();
    setErrors({ title: "", deadline: "" });
  };

  const handleCreateTask = async () => {
    let hasError = false;
    const newErrors = { title: "", deadline: "" };

    // 必須項目のチェック
    if (!formData.title.trim()) {
      newErrors.title = "Task Title is required";
      hasError = true;
    }
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    try {
      await createTaskFn({
        data: {
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline!.toISOString(),
          estimatedMinutes: formData.estimatedMinutes,
          priority: formData.priority,
        }
      });
      
      router.invalidate();
      handleClose();
      setFormData({ title: "", description: "", deadline: null, estimatedMinutes: 60, priority: 0 });
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

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
        <Button leftSection={<CheckCircle2 size={16} />} onClick={open}>New Task</Button>
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

      <Modal 
        opened={opened} 
        onClose={handleClose} 
        withCloseButton={false}
        size="lg"
        radius="md"
        padding={0}
      >
        <Stack gap={0}>
          <Box p="lg" pb="sm">
            <Title order={3}>Create New Task</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Fill in the details to add a new task to your flow.
            </Text>
          </Box>
          <Box p="lg" pt={0}>
            <Stack gap="md">
              <TextInput 
                label="Task Title" 
                placeholder="e.g., Finalize Q4 Budget" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })} 
                error={errors.title}
              />
              <Textarea 
                label="Description" 
                placeholder="Add more details about this task..." 
                minRows={3} 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
              />
              <Group grow align="flex-start">
                <DateTimePicker 
                  label="Deadline" 
                  placeholder="mm/dd/yyyy, --:--" 
                  required 
                  value={formData.deadline}
                  onChange={(val) => setFormData({ ...formData, deadline: val ? new Date(val) : null })}
                  error={errors.deadline}
                />
                <NumberInput 
                  label="Est. Minutes" 
                  defaultValue={60} 
                  min={0} 
                  required 
                  value={formData.estimatedMinutes}
                  onChange={(val) => setFormData({ ...formData, estimatedMinutes: Number(val) || 0 })}
                />
              </Group>
              <Box>
                <Text size="sm" fw={500} mb={4}>Priority Level</Text>
                <Rating 
                  size="lg" 
                  defaultValue={0} 
                  count={5} 
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                />
                <Text size="xs" c="dimmed" mt={4}>Select from 1 to 5 stars</Text>
              </Box>
            </Stack>
          </Box>
          <Group justify="flex-end" p="md" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
            <Button color="indigo.9" onClick={handleCreateTask}>Create Task</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
