import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  NumberInput,
  Progress,
  Rating,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  MoreHorizontal,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  type TaskListItem,
  updateTask,
} from "#/features/task/api/api";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async () => {
    const tasks = await getTasks();
    return { tasks };
  },
});

// --- Helper Functions ---

function formatDeadline(deadline: string): {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  const d = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (deadlineDate < today) {
    return { text: "Overdue", isOverdue: true, isToday: false };
  }
  if (deadlineDate.getTime() === today.getTime()) {
    const timeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { text: `Today, ${timeStr}`, isOverdue: false, isToday: true };
  }
  if (deadlineDate.getTime() === tomorrow.getTime()) {
    return { text: "Tomorrow", isOverdue: false, isToday: false };
  }
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isOverdue: false,
    isToday: false,
  };
}

function formatEstimatedTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function formatCompletedDate(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (deadlineDate.getTime() === today.getTime()) {
    const timeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Completed Today, ${timeStr}`;
  }
  if (deadlineDate.getTime() === yesterday.getTime()) {
    return "Completed Yesterday";
  }
  return `Completed ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// --- Components ---

function IncompleteTaskCard({
  task,
  onComplete,
  onDelete,
  onPostpone,
  onClick,
}: {
  task: TaskListItem;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPostpone: (id: string, days: number) => void;
  onClick: () => void;
}) {
  const {
    text: deadlineText,
    isOverdue,
    isToday,
  } = formatDeadline(task.deadline);
  const isHighPriority = task.priority >= 4;
  const progressColor =
    task.progress >= 60 ? "indigo" : task.progress >= 30 ? "blue" : "gray";

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      withBorder={false}
      pos="relative"
      onClick={onClick}
      style={{
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(12,27,84,0.05)",
        borderLeft: isHighPriority
          ? "4px solid var(--mantine-color-red-6)"
          : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(12,27,84,0.08)";
        e.currentTarget.style.borderColor = "var(--mantine-color-gray-3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,27,84,0.05)";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <Group justify="space-between" align="flex-start" mb={4}>
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center">
            <Rating
              readOnly
              value={task.priority}
              count={5}
              size="xs"
              color="yellow"
            />
            {task.description && (
              <Text size="xs" c="dimmed" fw={500}>
                {task.description}
              </Text>
            )}
          </Group>
          <Text fw={600} size="lg" lh={1.3} mt={2}>
            {task.title}
          </Text>
        </Stack>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Check size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
            >
              Complete
            </Menu.Item>
            <Menu.Item
              leftSection={<Calendar size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id, 1);
              }}
            >
              Postpone by 1 Day
            </Menu.Item>
            <Menu.Item
              leftSection={<Calendar size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id, 7);
              }}
            >
              Postpone by 1 Week
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<Trash2 size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group gap="lg" mt="xs">
        <Group gap={6}>
          <Calendar
            size={14}
            color={
              isOverdue || isToday
                ? "var(--mantine-color-red-6)"
                : "var(--mantine-color-gray-6)"
            }
          />
          <Text
            size="xs"
            fw={600}
            c={isOverdue || isToday ? "red.6" : "gray.6"}
          >
            {deadlineText}
          </Text>
        </Group>
        <Group gap={6}>
          <Clock size={14} color="var(--mantine-color-gray-6)" />
          <Text size="xs" fw={500} c="gray.6">
            Est. {formatEstimatedTime(task.estimatedMinutes)}
          </Text>
        </Group>
      </Group>

      <Box mt="sm">
        <Group justify="space-between" mb={4}>
          <Text size="xs" fw={500} c="gray.5">
            Progress
          </Text>
          <Text size="xs" fw={500} c="gray.5">
            {task.progress}%
          </Text>
        </Group>
        <Progress
          value={task.progress}
          size={4}
          color={progressColor}
          radius="xl"
        />
      </Box>
    </Card>
  );
}

function CompletedTaskCard({
  task,
  onClick,
}: {
  task: TaskListItem;
  onClick: () => void;
}) {
  return (
    <Card
      padding="md"
      radius="md"
      bg="gray.0"
      onClick={onClick}
      style={{
        cursor: "pointer",
        opacity: 0.8,
        transition: "opacity 0.2s ease",
        border: "1px solid var(--mantine-color-gray-2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.8";
      }}
    >
      <Group align="flex-start" gap="sm">
        <Box
          mt={4}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-indigo-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Check
            size={14}
            color="var(--mantine-color-indigo-7)"
            strokeWidth={3}
          />
        </Box>

        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center">
            <Rating
              readOnly
              value={task.priority}
              count={5}
              size="xs"
              color="gray"
            />
            {task.description && (
              <Text size="xs" c="gray.5" fw={500} td="line-through">
                {task.description}
              </Text>
            )}
          </Group>
          <Text fw={600} size="md" c="gray.5" td="line-through" mt={2}>
            {task.title}
          </Text>
        </Stack>
      </Group>

      <Group gap={6} mt="xs" pl={36}>
        <Check size={14} color="var(--mantine-color-gray-5)" />
        <Text size="xs" fw={500} c="gray.5">
          {formatCompletedDate(task.deadline)}
        </Text>
      </Group>
    </Card>
  );
}

// --- Main Page ---

function TasksPage() {
  const router = useRouter();
  const { tasks } = Route.useLoaderData();

  const [taskOpened, { open: openTask, close: closeTask }] =
    useDisclosure(false);
  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // Filter states
  const [filterTitle, setFilterTitle] = useState("");
  const [filterMinPriority, setFilterMinPriority] = useState<number | null>(
    null,
  );
  const [filterMaxPriority, setFilterMaxPriority] = useState<number | null>(
    null,
  );
  const [filterDeadlineStart, setFilterDeadlineStart] = useState<Date | null>(
    null,
  );
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState<Date | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState<string>("priority");

  // Edit states
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    deadline: null as Date | null,
    estimatedMinutes: 60,
    priority: 0,
    progress: 0,
    status: "",
  });
  const [editErrors, setEditErrors] = useState({ title: "", deadline: "" });

  // New Task states
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    deadline: null as Date | null,
    estimatedMinutes: 60,
    priority: 0,
  });
  const [taskErrors, setTaskErrors] = useState({ title: "", deadline: "" });

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

  const handleComplete = async (id: string) => {
    try {
      await updateTask({
        data: { id, status: "done", progress: 100 },
      });
      router.invalidate();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask({ data: { id } });
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleClearAll = async () => {
    try {
      const completedTasks = tasks.filter((t) => t.status === "done");
      for (const t of completedTasks) {
        await deleteTask({ data: { id: t.id } });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to clear completed tasks", error);
    }
  };

  const handleCompleteAllOverdue = async () => {
    try {
      const overdueTasks = tasks.filter(
        (t) => t.status !== "done" && formatDeadline(t.deadline).isOverdue,
      );
      for (const t of overdueTasks) {
        await updateTask({
          data: { id: t.id, status: "done", progress: 100 },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to complete overdue tasks", error);
    }
  };

  const handleDeleteAllOverdue = async () => {
    try {
      const overdueTasks = tasks.filter(
        (t) => t.status !== "done" && formatDeadline(t.deadline).isOverdue,
      );
      for (const t of overdueTasks) {
        await deleteTask({ data: { id: t.id } });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete overdue tasks", error);
    }
  };

  const handlePostponeAllActive = async (days: number) => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        const d = new Date(t.deadline);
        d.setDate(d.getDate() + days);
        await updateTask({
          data: { id: t.id, deadline: d },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error(`Failed to postpone active tasks by ${days} days`, error);
    }
  };

  const handlePostpone = async (id: string, days: number) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const d = new Date(task.deadline);
      d.setDate(d.getDate() + days);
      await updateTask({
        data: { id, deadline: d },
      });
      router.invalidate();
    } catch (error) {
      console.error(`Failed to postpone task by ${days} days`, error);
    }
  };

  const handleResetProgressAllActive = async () => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        await updateTask({
          data: { id: t.id, progress: 0, status: "pending" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to reset progress for active tasks", error);
    }
  };

  const handleCompleteAllActive = async () => {
    try {
      const activeTasks = tasks.filter((t) => t.status !== "done");
      for (const t of activeTasks) {
        await updateTask({
          data: { id: t.id, progress: 100, status: "done" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to complete all active tasks", error);
    }
  };

  const handleRestoreAllCompleted = async () => {
    try {
      const completedTasks = tasks.filter((t) => t.status === "done");
      for (const t of completedTasks) {
        await updateTask({
          data: { id: t.id, progress: 0, status: "pending" },
        });
      }
      router.invalidate();
    } catch (error) {
      console.error("Failed to restore completed tasks", error);
    }
  };

  const handleEditClick = (task: TaskListItem) => {
    setEditingTask(task);
    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline),
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      progress: task.progress,
      status: task.status,
    });
    openEdit();
  };

  const handleEditClose = () => {
    closeEdit();
    setEditingTask(null);
    setEditErrors({ title: "", deadline: "" });
  };

  const handleUpdateTask = async () => {
    const errors = {
      title: !editFormData.title.trim() ? "Task Title is required" : "",
      deadline: !editFormData.deadline ? "Deadline is required" : "",
    };

    setEditErrors(errors);
    if (errors.title !== "" || errors.deadline !== "") return;

    try {
      await updateTask({
        data: {
          id: editFormData.id,
          title: editFormData.title,
          description: editFormData.description,
          deadline: editFormData.deadline ?? new Date(),
          estimatedMinutes: editFormData.estimatedMinutes,
          priority: editFormData.priority,
          progress: editFormData.progress,
          status: editFormData.status,
        },
      });

      router.invalidate();
      handleEditClose();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleEditDelete = async () => {
    if (!editingTask) return;
    try {
      await deleteTask({ data: { id: editingTask.id } });
      router.invalidate();
      handleEditClose();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleResetFilters = () => {
    setFilterTitle("");
    setFilterMinPriority(null);
    setFilterMaxPriority(null);
    setFilterDeadlineStart(null);
    setFilterDeadlineEnd(null);
  };

  // Filter and Search logic
  const filteredTasks = tasks.filter((task) => {
    // Title filter
    if (filterTitle.trim() !== "") {
      if (!task.title.toLowerCase().includes(filterTitle.toLowerCase())) {
        return false;
      }
    }
    // Priority level min
    if (filterMinPriority !== null) {
      if (task.priority < filterMinPriority) {
        return false;
      }
    }
    // Priority level max
    if (filterMaxPriority !== null) {
      if (task.priority > filterMaxPriority) {
        return false;
      }
    }
    // Deadline start
    if (filterDeadlineStart !== null) {
      if (new Date(task.deadline) < filterDeadlineStart) {
        return false;
      }
    }
    // Deadline end
    if (filterDeadlineEnd !== null) {
      if (new Date(task.deadline) > filterDeadlineEnd) {
        return false;
      }
    }
    return true;
  });

  const sortTasks = (tasksList: TaskListItem[]) => {
    return [...tasksList].sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const sortedIncompleteTasks = sortTasks(
    filteredTasks.filter((t) => t.status !== "done"),
  );
  const sortedCompletedTasks = sortTasks(
    filteredTasks.filter((t) => t.status === "done"),
  );

  const isAnyFilterActive =
    filterTitle.trim() !== "" ||
    filterMinPriority !== null ||
    filterMaxPriority !== null ||
    filterDeadlineStart !== null ||
    filterDeadlineEnd !== null;

  return (
    <Stack gap="lg" h="calc(100vh - 48px)" style={{ overflow: "hidden" }}>
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} fw={700}>
            Task Management
          </Title>
          <Text c="dimmed" size="sm">
            Manage your high-priority items and track productivity progress.
          </Text>
        </div>
        <Button
          color="indigo"
          leftSection={<CheckCircle2 size={16} />}
          onClick={openTask}
        >
          New Task
        </Button>
      </Group>

      {/* Two Column Layout */}
      <Group
        grow
        align="stretch"
        wrap="nowrap"
        gap="lg"
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* Incomplete Column */}
        <Box
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Stack gap="md" style={{ height: "100%", minHeight: 0 }}>
            <Group
              justify="space-between"
              pb="sm"
              style={{
                borderBottom: "1px solid var(--mantine-color-gray-2)",
                flexShrink: 0,
              }}
            >
              <Group gap="sm">
                <Title order={3} fw={600}>
                  Incomplete
                </Title>
                <Badge
                  size="sm"
                  variant="filled"
                  radius="xl"
                  color="gray.2"
                  c="dark"
                >
                  {sortedIncompleteTasks.length}
                </Badge>
              </Group>
              <Group gap="xs" align="center">
                <Select
                  leftSection={<ArrowUpDown size={12} />}
                  value={sortBy}
                  onChange={(val) => setSortBy(val || "priority")}
                  data={[
                    { value: "priority", label: "Priority" },
                    { value: "deadline", label: "Deadline" },
                    { value: "title", label: "Title" },
                  ]}
                  allowDeselect={false}
                  size="xs"
                  style={{ width: 110 }}
                />
                <ActionIcon
                  variant="subtle"
                  color={isAnyFilterActive ? "indigo" : "gray"}
                  onClick={openFilter}
                >
                  <Filter size={18} />
                </ActionIcon>
                <Menu shadow="md" width={220} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <MoreVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<CheckCircle2 size={14} />}
                      onClick={handleCompleteAllOverdue}
                    >
                      Mark Overdue Completed
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Calendar size={14} />}
                      onClick={() => handlePostponeAllActive(1)}
                    >
                      Postpone by 1 Day
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Calendar size={14} />}
                      onClick={() => handlePostponeAllActive(7)}
                    >
                      Postpone by 1 Week
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<RotateCcw size={14} />}
                      onClick={handleResetProgressAllActive}
                    >
                      Reset Active Progress
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Check size={14} />}
                      onClick={handleCompleteAllActive}
                    >
                      Mark All Completed
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<Trash2 size={14} />}
                      onClick={handleDeleteAllOverdue}
                    >
                      Delete All Overdue
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} pr="xs">
              {sortedIncompleteTasks.length === 0 ? (
                <Card padding="xl" radius="md" bg="gray.0">
                  <Text ta="center" c="dimmed" fs="italic">
                    {isAnyFilterActive
                      ? "No matching incomplete tasks."
                      : "All tasks are completed! 🎉"}
                  </Text>
                </Card>
              ) : (
                <Stack gap="md" pb="md">
                  {sortedIncompleteTasks.map((task) => (
                    <IncompleteTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onPostpone={handlePostpone}
                      onClick={() => handleEditClick(task)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Completed Column */}
        <Box
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Stack gap="md" style={{ height: "100%", minHeight: 0 }}>
            <Group
              justify="space-between"
              pb="sm"
              style={{
                borderBottom: "1px solid var(--mantine-color-gray-2)",
                flexShrink: 0,
              }}
            >
              <Group gap="sm">
                <Title order={3} fw={600}>
                  Completed
                </Title>
                <Badge
                  size="sm"
                  variant="filled"
                  radius="xl"
                  color="gray.2"
                  c="dark"
                >
                  {sortedCompletedTasks.length}
                </Badge>
              </Group>
              <Group gap="xs" align="center">
                <Select
                  leftSection={<ArrowUpDown size={12} />}
                  value={sortBy}
                  onChange={(val) => setSortBy(val || "priority")}
                  data={[
                    { value: "priority", label: "Priority" },
                    { value: "deadline", label: "Deadline" },
                    { value: "title", label: "Title" },
                  ]}
                  allowDeselect={false}
                  size="xs"
                  style={{ width: 110 }}
                />
                <ActionIcon
                  variant="subtle"
                  color={isAnyFilterActive ? "indigo" : "gray"}
                  onClick={openFilter}
                >
                  <Filter size={18} />
                </ActionIcon>
                <Menu shadow="md" width={220} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <MoreVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<RotateCcw size={14} />}
                      onClick={handleRestoreAllCompleted}
                    >
                      Restore All to Pending
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<Trash2 size={14} />}
                      onClick={handleClearAll}
                    >
                      Delete All Completed
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} pr="xs">
              {sortedCompletedTasks.length === 0 ? (
                <Card padding="xl" radius="md" bg="gray.0">
                  <Text ta="center" c="dimmed" fs="italic">
                    {isAnyFilterActive
                      ? "No matching completed tasks."
                      : "No completed tasks yet."}
                  </Text>
                </Card>
              ) : (
                <Stack gap="md" pb="md">
                  {sortedCompletedTasks.map((task) => (
                    <CompletedTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleEditClick(task)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Group>

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

      {/* -------------------- Edit Task Modal -------------------- */}
      <Modal
        opened={editOpened}
        onClose={handleEditClose}
        withCloseButton={false}
        size="lg"
        radius="md"
        padding={0}
      >
        <Stack gap={0}>
          <Box p="lg" pb="sm">
            <Title order={3}>Edit Task</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Modify the details of your task below.
            </Text>
          </Box>
          <Box p="lg" pt={0}>
            <Stack gap="md">
              <TextInput
                label="Task Title"
                placeholder="e.g., Finalize Q4 Budget"
                required
                value={editFormData.title}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setEditFormData((prev) => ({
                    ...prev,
                    title: val,
                  }));
                }}
                error={editErrors.title}
              />
              <Textarea
                label="Description"
                placeholder="Add more details about this task..."
                minRows={3}
                value={editFormData.description}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setEditFormData((prev) => ({
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
                  value={editFormData.deadline}
                  onChange={(val) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      deadline: val ? new Date(val) : null,
                    }))
                  }
                  error={editErrors.deadline}
                />
                <NumberInput
                  label="Est. Minutes"
                  min={0}
                  required
                  value={editFormData.estimatedMinutes}
                  onChange={(val) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      estimatedMinutes: Number(val) || 0,
                    }))
                  }
                />
              </Group>
              <Group grow align="flex-start">
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    Priority Level
                  </Text>
                  <Rating
                    size="lg"
                    count={5}
                    value={editFormData.priority}
                    onChange={(val) =>
                      setEditFormData((prev) => ({ ...prev, priority: val }))
                    }
                  />
                </Box>
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    Progress ({editFormData.progress}%)
                  </Text>
                  <Slider
                    mt="sm"
                    value={editFormData.progress}
                    onChange={(val) =>
                      setEditFormData((prev) => {
                        const newProgress = val;
                        return {
                          ...prev,
                          progress: newProgress,
                          status:
                            newProgress === 100
                              ? "done"
                              : prev.status === "done"
                                ? "pending"
                                : prev.status,
                        };
                      })
                    }
                    min={0}
                    max={100}
                    step={1}
                    color="indigo"
                    label={(value) => `${value}%`}
                  />
                </Box>
              </Group>

              <Group grow>
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    Status
                  </Text>
                  <Group>
                    <Button
                      size="xs"
                      variant={
                        editFormData.status === "pending" ? "filled" : "outline"
                      }
                      color="gray"
                      onClick={() =>
                        setEditFormData((prev) => ({
                          ...prev,
                          status: "pending",
                          progress: prev.progress === 100 ? 0 : prev.progress,
                        }))
                      }
                    >
                      Pending
                    </Button>
                    <Button
                      size="xs"
                      variant={
                        editFormData.status === "in_progress"
                          ? "filled"
                          : "outline"
                      }
                      color="blue"
                      onClick={() =>
                        setEditFormData((prev) => ({
                          ...prev,
                          status: "in_progress",
                          progress: prev.progress === 100 ? 50 : prev.progress,
                        }))
                      }
                    >
                      In Progress
                    </Button>
                    <Button
                      size="xs"
                      variant={
                        editFormData.status === "done" ? "filled" : "outline"
                      }
                      color="indigo"
                      onClick={() =>
                        setEditFormData((prev) => ({
                          ...prev,
                          status: "done",
                          progress: 100,
                        }))
                      }
                    >
                      Completed
                    </Button>
                  </Group>
                </Box>
              </Group>
            </Stack>
          </Box>
          <Group
            justify="space-between"
            p="md"
            bg="gray.0"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Button variant="outline" color="red" onClick={handleEditDelete}>
              Delete Task
            </Button>
            <Group gap="sm">
              <Button variant="subtle" color="gray" onClick={handleEditClose}>
                Cancel
              </Button>
              <Button color="indigo.9" onClick={handleUpdateTask}>
                Save Changes
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* -------------------- Filter Modal -------------------- */}
      <Modal
        opened={filterOpened}
        onClose={closeFilter}
        withCloseButton={false}
        size="md"
        radius="md"
        padding={0}
      >
        <Stack gap={0}>
          <Box p="lg" pb="sm">
            <Title order={3}>Filter Tasks</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Narrow down your task list by title, priority, or deadline.
            </Text>
          </Box>
          <Box p="lg" pt={0}>
            <Stack gap="md">
              <TextInput
                label="Search Title"
                placeholder="Search by task title..."
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.currentTarget.value)}
              />

              <Box>
                <Text size="sm" fw={500} mb={4}>
                  Priority Level Range
                </Text>
                <Group gap="lg">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Min Priority
                    </Text>
                    <Rating
                      size="md"
                      count={5}
                      value={filterMinPriority || 0}
                      onChange={(val) => setFilterMinPriority(val || null)}
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Max Priority
                    </Text>
                    <Rating
                      size="md"
                      count={5}
                      value={filterMaxPriority || 0}
                      onChange={(val) => setFilterMaxPriority(val || null)}
                    />
                  </Stack>
                </Group>
              </Box>

              <Group grow align="flex-start">
                <DateTimePicker
                  label="Deadline From"
                  placeholder="Select start date/time"
                  value={filterDeadlineStart}
                  onChange={(val) =>
                    setFilterDeadlineStart(val ? new Date(val) : null)
                  }
                  clearable
                />
                <DateTimePicker
                  label="Deadline To"
                  placeholder="Select end date/time"
                  value={filterDeadlineEnd}
                  onChange={(val) =>
                    setFilterDeadlineEnd(val ? new Date(val) : null)
                  }
                  clearable
                />
              </Group>
            </Stack>
          </Box>
          <Group
            justify="flex-end"
            p="md"
            bg="gray.0"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Button variant="subtle" color="gray" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button color="indigo" onClick={closeFilter}>
              Apply Filters
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
