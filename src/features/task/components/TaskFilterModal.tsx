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

export interface TaskFilterModalProps {
  opened: boolean;
  onClose: () => void;
  filterTitle: string;
  setFilterTitle: (val: string) => void;
  filterMinPriority: number | null;
  setFilterMinPriority: (val: number | null) => void;
  filterMaxPriority: number | null;
  setFilterMaxPriority: (val: number | null) => void;
  filterDeadlineStart: Date | null;
  setFilterDeadlineStart: (val: Date | null) => void;
  filterDeadlineEnd: Date | null;
  setFilterDeadlineEnd: (val: Date | null) => void;
  onReset: () => void;
}

export const TaskFilterModal = ({
  opened,
  onClose,
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
  onReset,
}: TaskFilterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
