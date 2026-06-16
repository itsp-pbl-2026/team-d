import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Indicator,
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
import { DatePicker, DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";
import { createTask, getTasks } from "#/features/task/api/api";
import { Task, type TaskId } from "#/features/task/model/task";
import {
  createUpcomingEvent,
  getUpcomingEvents,
} from "#/features/upcomingEvent/api/api";
import {
  UpcomingEvent,
  type UpcomingEventId,
} from "#/features/upcomingEvent/model/upcomingEvent";

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
  const { tasks: rawTasks, events: rawEvents } = Route.useLoaderData();

  const tasks = rawTasks.map(
    (t) =>
      new Task(
        t.id as TaskId,
        t.title,
        t.description,
        new Date(t.deadline),
        t.estimatedMinutes,
        t.actualMinutes,
        t.priority,
        t.progress,
        t.status,
      ),
  );

  const events = rawEvents.map(
    (e) =>
      new UpcomingEvent(
        e.id as UpcomingEventId,
        e.title,
        e.description,
        new Date(e.startAt),
        new Date(e.endAt),
      ),
  );

  const [taskOpened, { open: openTask, close: closeTask }] =
    useDisclosure(false);
  const [eventOpened, { open: openEvent, close: closeEvent }] =
    useDisclosure(false);
  const [calendarOpened, { open: openCalendar, close: closeCalendar }] =
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
    startAt: "",
    endAt: "",
  });

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(
    new Date(),
  );

  // Task Handlers
  const handleTaskClose = () => {
    closeTask();
    setTaskErrors({ title: "", deadline: "" });
  };

  const handleCreateTask = async () => {
    let hasError = false;
    const newErrors = { title: "", deadline: "" };

    if (!taskFormData.title.trim()) {
      newErrors.title = "Task Title is required";
      hasError = true;
    }
    if (!taskFormData.deadline) {
      newErrors.deadline = "Deadline is required";
      hasError = true;
    }

    setTaskErrors(newErrors);
    if (hasError) return;

    try {
      await createTask({
        data: {
          title: taskFormData.title,
          description: taskFormData.description,
          deadline: taskFormData.deadline?.toISOString() ?? "",
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
    setEventErrors({ title: "", startAt: "", endAt: "" });
  };

  const handleCreateEvent = async () => {
    let hasError = false;
    const newErrors = { title: "", startAt: "", endAt: "" };

    if (!eventFormData.title.trim()) {
      newErrors.title = "Event Title is required";
      hasError = true;
    }
    if (!eventFormData.startAt) {
      newErrors.startAt = "Start Time is required";
      hasError = true;
    }
    if (!eventFormData.endAt) {
      newErrors.endAt = "End Time is required";
      hasError = true;
    }
    if (
      eventFormData.startAt &&
      eventFormData.endAt &&
      eventFormData.startAt >= eventFormData.endAt
    ) {
      newErrors.endAt = "End Time must be after Start Time";
      hasError = true;
    }

    setEventErrors(newErrors);
    if (hasError) return;

    try {
      await createUpcomingEvent({
        data: {
          title: eventFormData.title,
          description: eventFormData.description,
          startAt: eventFormData.startAt?.toISOString() ?? "",
          endAt: eventFormData.endAt?.toISOString() ?? "",
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
  const currentTask = tasks.find((t) => t.getStatus() === "in_progress");
  const completedTasks = tasks.filter((t) => t.getStatus() === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.getStatus() === "in_progress",
  ).length;
  const todoTasks = tasks.filter((t) => t.getStatus() === "pending").length;
  const totalTasks = tasks.length;

  const completedPercent = Math.round((completedTasks / totalTasks) * 100) || 0;
  const inProgressPercent =
    Math.round((inProgressTasks / totalTasks) * 100) || 0;
  const pendingHighPriority = tasks.filter(
    (t) => t.getPriority() === 1 && t.getStatus() !== "done",
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
    .filter((e) => e.getStartAt() >= todayStart && e.getStartAt() <= todayEnd)
    .sort((a, b) => a.getStartAt().getTime() - b.getStartAt().getTime());

  // Filter Selected Date Events (for Calendar)
  const selectedDayStart = getStartOfDay(selectedCalendarDate);
  const selectedDayEnd = getEndOfDay(selectedCalendarDate);
  const selectedDayEvents = events
    .filter(
      (e) =>
        e.getStartAt() >= selectedDayStart && e.getStartAt() <= selectedDayEnd,
    )
    .sort((a, b) => a.getStartAt().getTime() - b.getStartAt().getTime());

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
              <Button variant="subtle" size="xs" onClick={openCalendar}>
                View Full Calendar
              </Button>
            </Group>

            {todaysEvents.length === 0 ? (
              <Text c="dimmed" fs="italic">
                No events scheduled for today.
              </Text>
            ) : (
              <Timeline active={1} bulletSize={24} lineWidth={2}>
                {todaysEvents.map((event, index) => {
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
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    title: e.currentTarget.value,
                  })
                }
                error={taskErrors.title}
              />
              <Textarea
                label="Description"
                placeholder="Add more details about this task..."
                minRows={3}
                value={taskFormData.description}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    description: e.currentTarget.value,
                  })
                }
              />
              <Group grow align="flex-start">
                <DateTimePicker
                  label="Deadline"
                  placeholder="mm/dd/yyyy, --:--"
                  required
                  value={taskFormData.deadline}
                  onChange={(val) =>
                    setTaskFormData({
                      ...taskFormData,
                      deadline: val ? new Date(val) : null,
                    })
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
                    setTaskFormData({
                      ...taskFormData,
                      estimatedMinutes: Number(val) || 0,
                    })
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
                    setTaskFormData({ ...taskFormData, priority: val })
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
            onChange={(e) =>
              setEventFormData({
                ...eventFormData,
                title: e.currentTarget.value,
              })
            }
            error={eventErrors.title}
          />
          <Textarea
            label="Description"
            placeholder="Briefly describe the agenda or goals..."
            minRows={3}
            value={eventFormData.description}
            onChange={(e) =>
              setEventFormData({
                ...eventFormData,
                description: e.currentTarget.value,
              })
            }
          />
          <Group grow align="flex-start">
            <DateTimePicker
              label="Start At"
              placeholder="Select start date and time"
              required
              value={eventFormData.startAt}
              onChange={(val) =>
                setEventFormData({
                  ...eventFormData,
                  startAt: val ? new Date(val) : null,
                })
              }
              error={eventErrors.startAt}
            />
            <DateTimePicker
              label="End At"
              placeholder="Select end date and time"
              required
              value={eventFormData.endAt}
              onChange={(val) =>
                setEventFormData({
                  ...eventFormData,
                  endAt: val ? new Date(val) : null,
                })
              }
              error={eventErrors.endAt}
            />
          </Group>
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

      {/* -------------------- Calendar Overview Modal -------------------- */}
      <Modal
        opened={calendarOpened}
        onClose={closeCalendar}
        title={
          <Group gap="sm">
            <Calendar size={20} />
            <Text fw={600}>Monthly Overview</Text>
          </Group>
        }
        size="xl"
        radius="md"
        padding={0}
      >
        <Grid>
          <Grid.Col
            span={{ base: 12, md: 7 }}
            p="lg"
            style={{ borderRight: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Box mb="xl">
              <Text fw={600} size="lg">
                {selectedCalendarDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mt={4}>
                Productivity Cycle Active
              </Text>
            </Box>

            <DatePicker
              size="md"
              date={selectedCalendarDate}
              onDateChange={(val: Date | string | null) => {
                if (val) setSelectedCalendarDate(new Date(val));
              }}
              onChange={(val: Date | string | null) => {
                if (val) setSelectedCalendarDate(new Date(val));
              }}
              value={selectedCalendarDate}
              renderDay={(d: Date | string) => {
                const date = new Date(d);
                const dayStart = getStartOfDay(date);
                const dayEnd = getEndOfDay(date);
                const dayEvents = events.filter(
                  (e) => e.getStartAt() >= dayStart && e.getStartAt() <= dayEnd,
                );
                const hasEvents = dayEvents.length > 0;

                return (
                  <Indicator
                    size={6}
                    color="indigo"
                    offset={-4}
                    disabled={!hasEvents}
                    position="bottom-center"
                  >
                    <Box>{date.getDate()}</Box>
                  </Indicator>
                );
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }} p="lg">
            <Text size="xs" c="indigo.6" tt="uppercase" fw={700} mb={4}>
              Selected Day
            </Text>
            <Title order={4} mb="xl">
              {selectedCalendarDate.toLocaleDateString("default", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Title>

            <Stack gap="md">
              {selectedDayEvents.length === 0 ? (
                <Text c="dimmed" fs="italic" size="sm">
                  No events on this day.
                </Text>
              ) : (
                selectedDayEvents.map((event) => {
                  const timeStr = event.getStartAt().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <Group key={event.getId()} align="flex-start" wrap="nowrap">
                      <Text size="xs" c="dimmed" fw={600} w={40}>
                        {timeStr}
                      </Text>
                      <Card
                        p="sm"
                        radius="md"
                        withBorder
                        style={{
                          borderLeft: "4px solid var(--mantine-color-indigo-6)",
                          flex: 1,
                        }}
                      >
                        <Text fw={600} size="sm">
                          {event.getTitle()}
                        </Text>
                        {event.getDescription() && (
                          <Text size="xs" c="dimmed" mt={4}>
                            {event.getDescription()}
                          </Text>
                        )}
                      </Card>
                    </Group>
                  );
                })
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Modal>
    </Stack>
  );
}
