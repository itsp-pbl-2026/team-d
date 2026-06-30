import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Rating,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

export interface CreateTaskFormData {
  title: string;
  description: string;
  deadline: Date | null;
  estimatedMinutes: number;
  priority: number;
}

export interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: CreateTaskFormData;
  setFormData: (
    updater: (prev: CreateTaskFormData) => CreateTaskFormData,
  ) => void;
  errors: { title: string; deadline: string };
}

export const CreateTaskModal = ({
  opened,
  onClose,
  onSubmit,
  formData,
  setFormData,
  errors,
}: CreateTaskModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
              onChange={(e) => {
                const val = e.currentTarget.value;
                setFormData((prev) => ({
                  ...prev,
                  title: val,
                }));
              }}
              error={errors.title}
            />
            <Textarea
              label="Description"
              placeholder="Add more details about this task..."
              minRows={3}
              value={formData.description}
              onChange={(e) => {
                const val = e.currentTarget.value;
                setFormData((prev) => ({
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
                value={formData.deadline}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    deadline: val ? new Date(val) : null,
                  }))
                }
                error={errors.deadline}
              />
              <NumberInput
                label="Est. Minutes"
                defaultValue={60}
                min={0}
                required
                value={formData.estimatedMinutes}
                onChange={(val) =>
                  setFormData((prev) => ({
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
                value={formData.priority}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, priority: val }))
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
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="indigo.9" onClick={onSubmit}>
            Create Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
