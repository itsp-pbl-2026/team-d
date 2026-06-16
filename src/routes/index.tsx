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
  Textarea,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";
import { createTask, getTasks } from "#/features/task/api/api";
import {
  createUpcomingEvent,
  getUpcomingEvents,
} from "#/features/upcomingEvent/api/api";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [tasks, events] = await Promise.all([
      getTasks(),
      getUpcomingEvents(),
    ]);
    return { tasks, events };
  },
});

function Home() {
  const router = useRouter();
  const { tasks, events } = Route.useLoaderData();

  const [taskOpened, { open: openTask, close: closeTask }] =
    useDisclosure(false);
  const [eventOpened, { open: openEvent, close: closeEvent }] =
    useDisclosure(false);

  // Form states
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    deadline: null as Date | null,
    estimatedMinutes: 60,
    priority: 0,
  });
  const [taskErrors, setTaskErrors] = useState({ title: "", deadline: "" });

  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    startAt: null as Date | null,
    endAt: null as Date | null,
  });
  const [eventErrors, setEventErrors] = useState({
    title: "",
    range: "",
  });

  // Task Handlers
  const handleTaskClose = () => {
    closeTask();
    setTaskErrors({ title: "", deadline: "" });
  };

  const handleCreateTask = async () => {
    const errors = {
      title: !taskFormData.title.trim() ? "Task Title is required" : "",
      deadline: !taskFormData.deadline ? "Deadline is required" : "",
    };

    setTaskErrors(errors);
    if (errors.title !== "" || errors.deadline !== "") return;

    try {
      await createTask({
        data: {
          title: taskFormData.title,
          description: taskFormData.description,
          deadline: taskFormData.deadline ?? new Date(),
          estimatedMinutes: taskFormData.estimatedMinutes,
          priority: taskFormData.priority,
        },
      });

      router.invalidate();
      handleTaskClose();
      setTaskFormData({
        title: "",
        description: "",
        deadline: null,
        estimatedMinutes: 60,
        priority: 0,
      });
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  // Event Handlers
  const handleEventClose = () => {
    closeEvent();
    setEventErrors({ title: "", range: "" });
  };

  const handleCreateEvent = async () => {
    const hasInvalidEnd =
      eventFormData.startAt &&
      eventFormData.endAt &&
      eventFormData.startAt >= eventFormData.endAt;

    const rangeError = !eventFormData.startAt
      ? "Start Time is required"
      : !eventFormData.endAt
        ? "End Time is required"
        : hasInvalidEnd
          ? "End Time must be after Start Time"
          : "";

    const errors = {
      title: !eventFormData.title.trim() ? "Event Title is required" : "",
      range: rangeError,
    };

    setEventErrors(errors);
    if (errors.title !== "" || errors.range !== "") return;

    try {
      await createUpcomingEvent({
        data: {
          title: eventFormData.title,
          description: eventFormData.description,
          startAt: eventFormData.startAt ?? new Date(),
          endAt: eventFormData.endAt ?? new Date(),
        },
      });

      router.invalidate();
      handleEventClose();
      setEventFormData({
        title: "",
        description: "",
        startAt: null,
        endAt: null,
      });
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };

  // Compute Task Metrics
  const currentTask = tasks.find((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const todoTasks = tasks.filter((t) => t.status === "pending").length;
  const totalTasks = tasks.length;

  const completedPercent = Math.round((completedTasks / totalTasks) * 100) || 0;
  const inProgressPercent =
    Math.round((inProgressTasks / totalTasks) * 100) || 0;
  const pendingHighPriority = tasks.filter(
    (t) => t.priority === 1 && t.status !== "done",
  ).length;

  // Filter Today's Events
  const today = new Date();
  const getStartOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const getEndOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const todayStart = getStartOfDay(today);
  const todayEnd = getEndOfDay(today);

  const todaysEvents = events
    .filter((e) => {
      const start = new Date(e.startAt);
      return start >= todayStart && start <= todayEnd;
    })
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Good morning, Alex.</Title>
          <Text c="dimmed">
            You have {pendingHighPriority} high-priority tasks pending.
          </Text>
        </div>
        <Group>
          <Button
            variant="outline"
            color="indigo"
            leftSection={<Calendar size={16} />}
            onClick={openEvent}
          >
            New Event
          </Button>
          <Button
            color="indigo"
            leftSection={<CheckCircle2 size={16} />}
            onClick={openTask}
          >
            New Task
          </Button>
        </Group>
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
            </Group>

            {todaysEvents.length === 0 ? (
              <Text c="dimmed" fs="italic">
                No events scheduled for today.
              </Text>
            ) : (
              <Timeline active={1} bulletSize={24} lineWidth={2}>
                {todaysEvents.map((event, index) => {
                  const timeStr = new Date(event.startAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
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
            )}
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
                  {currentTask.title}
                </Text>
                <Text size="xs" c="dimmed">
                  Expected: {currentTask.estimatedMinutes} min | Actual:{" "}
                  {currentTask.actualMinutes} min
                </Text>
                <Badge mt="sm" color="indigo" variant="light">
                  {currentTask.progress}% Complete
                </Badge>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      {/* -------------------- New Task Modal -------------------- */}
      <Modal
        opened={taskOpened}
        onClose={handleTaskClose}
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
                value={taskFormData.title}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setTaskFormData((prev) => ({
                    ...prev,
                    title: val,
                  }));
                }}
                error={taskErrors.title}
              />
              <Textarea
                label="Description"
                placeholder="Add more details about this task..."
                minRows={3}
                value={taskFormData.description}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setTaskFormData((prev) => ({
                    ...prev,
                    description: val,
                  }));
                }}
              />
              <Group grow align="flex-start">
                <DateTimePicker
                  label="Deadline"
                  placeholder="mm/dd/yyyy, --:--"
                  required
                  value={taskFormData.deadline}
                  onChange={(val) =>
                    setTaskFormData((prev) => ({
                      ...prev,
                      deadline: val ? new Date(val) : null,
                    }))
                  }
                  error={taskErrors.deadline}
                />
                <NumberInput
                  label="Est. Minutes"
                  defaultValue={60}
                  min={0}
                  required
                  value={taskFormData.estimatedMinutes}
                  onChange={(val) =>
                    setTaskFormData((prev) => ({
                      ...prev,
                      estimatedMinutes: Number(val) || 0,
                    }))
                  }
                />
              </Group>
              <Box>
                <Text size="sm" fw={500} mb={4}>
                  Priority Level
                </Text>
                <Rating
                  size="lg"
                  defaultValue={0}
                  count={5}
                  value={taskFormData.priority}
                  onChange={(val) =>
                    setTaskFormData((prev) => ({ ...prev, priority: val }))
                  }
                />
                <Text size="xs" c="dimmed" mt={4}>
                  Select from 1 to 5 stars
                </Text>
              </Box>
            </Stack>
          </Box>
          <Group
            justify="flex-end"
            p="md"
            bg="gray.0"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Button variant="subtle" color="gray" onClick={handleTaskClose}>
              Cancel
            </Button>
            <Button color="indigo.9" onClick={handleCreateTask}>
              Create Task
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* -------------------- New Event Modal -------------------- */}
      <Modal
        opened={eventOpened}
        onClose={handleEventClose}
        withCloseButton={true}
        title={
          <Group gap="sm">
            <Calendar size={20} color="var(--mantine-color-indigo-6)" />
            <Title order={4}>Create New Event</Title>
          </Group>
        }
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Project Sync or Deep Work Session"
            required
            value={eventFormData.title}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setEventFormData((prev) => ({
                ...prev,
                title: val,
              }));
            }}
            error={eventErrors.title}
          />
          <Textarea
            label="Description"
            placeholder="Briefly describe the agenda or goals..."
            minRows={3}
            value={eventFormData.description}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setEventFormData((prev) => ({
                ...prev,
                description: val,
              }));
            }}
          />
          <DateTimePicker
            type="range"
            label="Event Period"
            placeholder="Select start and end date/time"
            required
            value={[eventFormData.startAt, eventFormData.endAt]}
            onChange={(val) =>
              setEventFormData((prev) => ({
                ...prev,
                startAt: val[0] ? new Date(val[0]) : null,
                endAt: val[1] ? new Date(val[1]) : null,
              }))
            }
            error={eventErrors.range}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={handleEventClose}>
              Cancel
            </Button>
            <Button color="indigo.9" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
