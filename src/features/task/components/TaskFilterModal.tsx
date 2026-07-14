import {
  Box,
  Button,
  Group,
  Modal,
  Rating,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Filter } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { TaskFilters } from "../hooks/useTaskFilters";

export type TaskFilterModalProps = {
  opened: boolean;
  onClose: () => void;
  filters: TaskFilters;
  setFilters: Dispatch<SetStateAction<TaskFilters>>;
  onReset: () => void;
};

export const TaskFilterModal = ({
  opened,
  onClose,
  filters,
  setFilters,
  onReset,
}: TaskFilterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={true}
      title={
        <Group gap="sm">
          <Filter size={20} color="var(--mantine-color-indigo-6)" />
          <Title order={4}>Filter Tasks</Title>
        </Group>
      }
      size="md"
      radius="md"
    >
      <Stack gap="md">
        <TextInput
          label="Search Title"
          placeholder="Search by task title..."
          value={filters.title}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setFilters((prev) => ({ ...prev, title: val }));
          }}
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
                value={filters.minPriority ?? 0}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, minPriority: val || null }))
                }
              />
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Max Priority
              </Text>
              <Rating
                size="md"
                count={5}
                value={filters.maxPriority ?? 0}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, maxPriority: val || null }))
                }
              />
            </Stack>
          </Group>
        </Box>

        <Group grow align="flex-start">
          <DateTimePicker
            label="Deadline From"
            placeholder="Select start date/time"
            value={filters.deadlineStart}
            onChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                deadlineStart: val ? new Date(val) : null,
              }))
            }
            clearable
          />
          <DateTimePicker
            label="Deadline To"
            placeholder="Select end date/time"
            value={filters.deadlineEnd}
            onChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                deadlineEnd: val ? new Date(val) : null,
              }))
            }
            clearable
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onReset}>
            Reset Filters
          </Button>
          <Button color="indigo" onClick={onClose}>
            Apply Filters
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
