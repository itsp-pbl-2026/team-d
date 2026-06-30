import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  CheckCircle2,
  Filter,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { getTasks } from "#/features/task/api/api";
import { CreateTaskModal } from "#/features/task/components/CreateTaskModal";
import { EditTaskModal } from "#/features/task/components/EditTaskModal";
import {
  CompletedTaskCard,
  IncompleteTaskCard,
} from "#/features/task/components/TaskCard";
import { TaskFilterModal } from "#/features/task/components/TaskFilterModal";
import { useTaskFilters } from "#/features/task/hooks/useTaskFilters";
import { useTaskMutations } from "#/features/task/hooks/useTaskMutations";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async () => {
    const tasks = await getTasks();
    return { tasks };
  },
});

function TasksPage() {
  const { tasks } = Route.useLoaderData();

  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);

  const {
    filterTitle,
    setFilterTitle,
    filterMinPriority,
    setFilterMinPriority,
    filterMaxPriority,
    setFilterMaxPriority,
    filterDeadlineStart,
    setFilterDeadlineStart,
    filterDeadlineEnd,
    setFilterDeadlineEnd,
    sortBy,
    setSortBy,
    handleResetFilters,
    sortedIncompleteTasks,
    sortedCompletedTasks,
    isAnyFilterActive,
  } = useTaskFilters(tasks);

  const {
    taskOpened,
    openTask,
    handleTaskClose,
    editOpened,
    handleEditClose,
    taskFormData,
    setTaskFormData,
    taskErrors,
    handleCreateTask,
    editFormData,
    setEditFormData,
    editErrors,
    handleUpdateTask,
    handleEditDelete,
    handleComplete,
    handleDelete,
    handleClearAll,
    handleCompleteAllOverdue,
    handleDeleteAllOverdue,
    handlePostponeAllActive,
    handlePostpone,
    handleResetProgressAllActive,
    handleCompleteAllActive,
    handleRestoreAllCompleted,
    handleEditClick,
  } = useTaskMutations(tasks);

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
                      leftSection={<CheckCircle2 size={14} />}
                      onClick={() => handlePostponeAllActive(1)}
                    >
                      Postpone by 1 Day
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<CheckCircle2 size={14} />}
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
                      leftSection={<CheckCircle2 size={14} />}
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

      {/* New Task Modal */}
      <CreateTaskModal
        opened={taskOpened}
        onClose={handleTaskClose}
        onSubmit={handleCreateTask}
        formData={taskFormData}
        setFormData={setTaskFormData}
        errors={taskErrors}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        opened={editOpened}
        onClose={handleEditClose}
        onSave={handleUpdateTask}
        onDelete={handleEditDelete}
        formData={editFormData}
        setFormData={setEditFormData}
        errors={editErrors}
      />

      {/* Filter Modal */}
      <TaskFilterModal
        opened={filterOpened}
        onClose={closeFilter}
        filterTitle={filterTitle}
        setFilterTitle={setFilterTitle}
        filterMinPriority={filterMinPriority}
        setFilterMinPriority={setFilterMinPriority}
        filterMaxPriority={filterMaxPriority}
        setFilterMaxPriority={setFilterMaxPriority}
        filterDeadlineStart={filterDeadlineStart}
        setFilterDeadlineStart={setFilterDeadlineStart}
        filterDeadlineEnd={filterDeadlineEnd}
        setFilterDeadlineEnd={setFilterDeadlineEnd}
        onReset={handleResetFilters}
      />
    </Stack>
  );
}
