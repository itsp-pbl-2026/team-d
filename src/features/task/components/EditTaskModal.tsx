import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Rating,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

export interface EditTaskFormData {
  id: string;
  title: string;
  description: string;
  deadline: Date | null;
  estimatedMinutes: number;
  priority: number;
  progress: number;
  status: string;
}

export interface EditTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  formData: EditTaskFormData;
  setFormData: (updater: (prev: EditTaskFormData) => EditTaskFormData) => void;
  errors: { title: string; deadline: string };
}

export const EditTaskModal = ({
  opened,
  onClose,
  onSave,
  onDelete,
  formData,
  setFormData,
  errors,
}: EditTaskModalProps) => {
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
            <Group grow align="flex-start">
              <Box>
                <Text size="sm" fw={500} mb={4}>
                  Priority Level
                </Text>
                <Rating
                  size="lg"
                  count={5}
                  value={formData.priority}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, priority: val }))
                  }
                />
              </Box>
              <Box>
                <Text size="sm" fw={500} mb={4}>
                  Progress ({formData.progress}%)
                </Text>
                <Slider
                  mt="sm"
                  value={formData.progress}
                  onChange={(val) =>
                    setFormData((prev) => {
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
                      formData.status === "pending" ? "filled" : "outline"
                    }
                    color="gray"
                    onClick={() =>
                      setFormData((prev) => ({
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
                      formData.status === "in_progress" ? "filled" : "outline"
                    }
                    color="blue"
                    onClick={() =>
                      setFormData((prev) => ({
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
                    variant={formData.status === "done" ? "filled" : "outline"}
                    color="indigo"
                    onClick={() =>
                      setFormData((prev) => ({
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
          <Button variant="outline" color="red" onClick={onDelete}>
            Delete Task
          </Button>
          <Group gap="sm">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button color="indigo.9" onClick={onSave}>
              Save Changes
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
