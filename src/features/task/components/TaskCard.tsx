import {
  ActionIcon,
  Box,
  Card,
  Group,
  Menu,
  Progress,
  Rating,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Calendar, Check, Clock, MoreHorizontal, Trash2 } from "lucide-react";
import type { TaskListItem } from "../api/api";
import type { TaskId } from "../model/task";
import { formatDeadline, formatEstimatedTime } from "../utils/format";

const HIGH_PRIORITY_THRESHOLD = 4;

export const IncompleteTaskCard = ({
  task,
  onComplete,
  onPostpone,
  onDelete,
  onClick,
}: {
  task: TaskListItem;
  onComplete: (id: TaskId) => void;
  onPostpone: (task: TaskListItem, days: number) => void;
  onDelete: (id: TaskId) => void;
  onClick: () => void;
}) => {
  const deadline = formatDeadline(task.deadline);
  const isUrgent = deadline.isOverdue || deadline.isToday;
  const isHighPriority = task.priority >= HIGH_PRIORITY_THRESHOLD;

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderLeft: isHighPriority
          ? "4px solid var(--mantine-color-red-6)"
          : undefined,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Rating
            readOnly
            value={task.priority}
            count={5}
            size="xs"
            color="yellow"
          />
          <Text fw={600} size="lg" lh={1.3}>
            {task.title}
          </Text>
          {task.description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {task.description}
            </Text>
          )}
        </Stack>
        <Menu shadow="md" width={140} position="bottom-end">
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
                onPostpone(task, 1);
              }}
            >
              Postpone by 1 Day
            </Menu.Item>
            <Menu.Item
              leftSection={<Calendar size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task, 7);
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
              isUrgent
                ? "var(--mantine-color-red-6)"
                : "var(--mantine-color-gray-6)"
            }
          />
          <Text size="xs" fw={600} c={isUrgent ? "red.6" : "gray.6"}>
            {deadline.text}
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
        <Progress value={task.progress} size={4} color="indigo" radius="xl" />
      </Box>
    </Card>
  );
};

export const CompletedTaskCard = ({
  task,
  onClick,
}: {
  task: TaskListItem;
  onClick: () => void;
}) => {
  return (
    <Card
      padding="md"
      radius="md"
      bg="gray.0"
      withBorder
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color="indigo" radius="xl" size="md">
          <Check size={14} strokeWidth={3} />
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1 }}>
          <Rating
            readOnly
            value={task.priority}
            count={5}
            size="xs"
            color="gray"
          />
          <Text fw={600} size="md" c="gray.5" td="line-through">
            {task.title}
          </Text>
          <Group gap={6}>
            <Calendar size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" fw={500} c="gray.5">
              Deadline: {formatDeadline(task.deadline).text}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
