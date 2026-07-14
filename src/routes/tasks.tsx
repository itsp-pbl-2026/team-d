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
  Calendar,
  CheckCircle2,
  Filter,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { getTasks } from "#/features/task/api/api";
import {
  CompletedTaskCard,
  IncompleteTaskCard,
} from "#/features/task/components/TaskCard";
import { TaskFilterModal } from "#/features/task/components/TaskFilterModal";
import { TaskFormModal } from "#/features/task/components/TaskFormModal";
import { useCreateTaskForm } from "#/features/task/hooks/useCreateTaskForm";
import { useEditTaskForm } from "#/features/task/hooks/useEditTaskForm";
import { useTaskActions } from "#/features/task/hooks/useTaskActions";
import { useTaskBulkActions } from "#/features/task/hooks/useTaskBulkActions";
import {
  type TaskSortBy,
  useTaskFilters,
} from "#/features/task/hooks/useTaskFilters";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async () => {
    const tasks = await getTasks();
    return { tasks };
  },
});

const TaskColumn = ({
  title,
  count,
  emptyMessage,
  menu,
  children,
}: {
  title: string;
  count: number;
  emptyMessage: string;
  menu: ReactNode;
  children: ReactNode;
}) => (
  <Stack
    gap="md"
    style={{
      flex: 1,
      height: "100%",
      minHeight: 0,
      minWidth: 0,
    }}
  >
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
          {title}
        </Title>
        <Badge size="sm" variant="filled" radius="xl" color="gray.2" c="dark">
          {count}
        </Badge>
      </Group>
      <Menu shadow="md" width={220} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray">
            <MoreVertical size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>{menu}</Menu.Dropdown>
      </Menu>
    </Group>
    <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} pr="xs">
      {count === 0 ? (
        <Card padding="xl" radius="md" bg="gray.0">
          <Text ta="center" c="dimmed" fs="italic">
            {emptyMessage}
          </Text>
        </Card>
      ) : (
        <Stack gap="md" pb="md">
          {children}
        </Stack>
      )}
    </Box>
  </Stack>
);

function TasksPage() {
  const { tasks } = Route.useLoaderData();

  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);

  const {
    filters,
    setFilters,
    resetFilters,
    isFilterActive,
    sortBy,
    setSortBy,
    incompleteTasks,
    completedTasks,
  } = useTaskFilters(tasks);

  const createForm = useCreateTaskForm();
  const editForm = useEditTaskForm();
  const { complete, postpone, remove } = useTaskActions();
  const bulk = useTaskBulkActions(tasks);

  const incompleteMenu = useMemo(
    () => (
      <>
        <Menu.Item
          leftSection={<CheckCircle2 size={14} />}
          onClick={bulk.completeOverdue}
        >
          Mark Overdue Completed
        </Menu.Item>
        <Menu.Item
          leftSection={<Calendar size={14} />}
          onClick={() => bulk.postponeAll(1)}
        >
          Postpone by 1 Day
        </Menu.Item>
        <Menu.Item
          leftSection={<Calendar size={14} />}
          onClick={() => bulk.postponeAll(7)}
        >
          Postpone by 1 Week
        </Menu.Item>
        <Menu.Item
          leftSection={<RotateCcw size={14} />}
          onClick={bulk.resetProgressAll}
        >
          Reset Active Progress
        </Menu.Item>
        <Menu.Item
          leftSection={<CheckCircle2 size={14} />}
          onClick={bulk.completeAll}
        >
          Mark All Completed
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<Trash2 size={14} />}
          onClick={bulk.deleteOverdue}
        >
          Delete All Overdue
        </Menu.Item>
      </>
    ),
    [bulk],
  );

  const completedMenu = useMemo(
    () => (
      <>
        <Menu.Item
          leftSection={<RotateCcw size={14} />}
          onClick={bulk.restoreCompleted}
        >
          Restore All to Pending
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<Trash2 size={14} />}
          onClick={bulk.deleteCompleted}
        >
          Delete All Completed
        </Menu.Item>
      </>
    ),
    [bulk],
  );

  return (
    <Stack gap="lg" h="calc(100vh - 48px)" style={{ overflow: "hidden" }}>
      <Group justify="space-between">
        <div>
          <Title order={2} fw={700}>
            Task Management
          </Title>
          <Text c="dimmed" size="sm">
            Manage your tasks and track progress.
          </Text>
        </div>
        <Group gap="sm">
          <Select
            leftSection={<ArrowUpDown size={12} />}
            value={sortBy}
            onChange={(val) => setSortBy((val as TaskSortBy) ?? "priority")}
            data={[
              { value: "priority", label: "Priority" },
              { value: "deadline", label: "Deadline" },
              { value: "title", label: "Title" },
            ]}
            allowDeselect={false}
            size="xs"
            style={{ width: 120 }}
          />
          <ActionIcon
            variant="subtle"
            color={isFilterActive ? "indigo" : "gray"}
            onClick={openFilter}
            aria-label="Filter tasks"
          >
            <Filter size={18} />
          </ActionIcon>
          <Button
            color="indigo"
            leftSection={<CheckCircle2 size={16} />}
            onClick={createForm.open}
          >
            New Task
          </Button>
        </Group>
      </Group>

      <Group
        align="stretch"
        wrap="nowrap"
        gap="lg"
        style={{ flex: 1, minHeight: 0 }}
      >
        <TaskColumn
          title="Incomplete"
          count={incompleteTasks.length}
          emptyMessage={
            isFilterActive
              ? "No matching incomplete tasks."
              : "All tasks are completed! 🎉"
          }
          menu={incompleteMenu}
        >
          {incompleteTasks.map((task) => (
            <IncompleteTaskCard
              key={task.id}
              task={task}
              onComplete={complete}
              onPostpone={postpone}
              onDelete={remove}
              onClick={() => editForm.open(task)}
            />
          ))}
        </TaskColumn>

        <TaskColumn
          title="Completed"
          count={completedTasks.length}
          emptyMessage={
            isFilterActive
              ? "No matching completed tasks."
              : "No completed tasks yet."
          }
          menu={completedMenu}
        >
          {completedTasks.map((task) => (
            <CompletedTaskCard
              key={task.id}
              task={task}
              onClick={() => editForm.open(task)}
            />
          ))}
        </TaskColumn>
      </Group>

      <TaskFormModal
        mode="create"
        opened={createForm.opened}
        onClose={createForm.close}
        onSubmit={createForm.submit}
        data={createForm.data}
        setData={createForm.setData}
      />

      <TaskFormModal
        mode="edit"
        opened={editForm.opened}
        onClose={editForm.close}
        onSubmit={editForm.submit}
        onDelete={editForm.remove}
        data={editForm.data}
        setData={editForm.setData}
      />

      <TaskFilterModal
        opened={filterOpened}
        onClose={closeFilter}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
      />
    </Stack>
  );
}
