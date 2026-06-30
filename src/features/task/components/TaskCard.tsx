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
} from "@mantine/core";
import { Calendar, Check, Clock, MoreHorizontal, Trash2 } from "lucide-react";
import type { TaskListItem } from "../api/api";
import {
  formatCompletedDate,
  formatDeadline,
  formatEstimatedTime,
} from "../utils/format";

export const IncompleteTaskCard = ({
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
}) => {
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
};
