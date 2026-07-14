import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Rating,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { CheckCircle2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import type {
  TaskFormData,
  TaskFormDataValidated,
} from "../hooks/useTaskFormData";

export type TaskFormError = {
  title: string;
  deadline: string;
};

export type TaskFormModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormDataValidated) => void | Promise<void>;
  data: TaskFormData;
  setData: Dispatch<SetStateAction<TaskFormData>>;
  mode?: "create" | "edit";
  // 編集時のみ表示する削除ボタン
  onDelete?: () => void | Promise<void>;
};

export const TaskFormModal = ({
  opened,
  onClose,
  onSubmit,
  data,
  setData,
  mode = "create",
  onDelete,
}: TaskFormModalProps) => {
  const [error, setError] = useState<TaskFormError>({
    title: "",
    deadline: "",
  });
  const isEdit = mode === "edit";

  const handleClose = () => {
    onClose();
    setError({ title: "", deadline: "" });
  };

  const handleSubmit = () => {
    const errors = {
      title: !data.title.trim() ? "Task Title is required" : "",
      deadline: !data.deadline ? "Deadline is required" : "",
    };

    setError(errors);
    if (errors.title !== "" || errors.deadline !== "") return;
    if (data.deadline == null) return; // never happen

    onSubmit({ ...data, deadline: data.deadline });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={true}
      title={
        <Group gap="sm">
          <CheckCircle2 size={20} color="var(--mantine-color-indigo-6)" />
          <Title order={4}>{isEdit ? "Edit Task" : "Create New Task"}</Title>
        </Group>
      }
      size="md"
      radius="md"
    >
      <Stack gap="md">
        <TextInput
          label="Task Title"
          placeholder="e.g., Finalize Q4 Budget"
          required
          value={data.title}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setData((prev) => ({ ...prev, title: val }));
          }}
          error={error.title}
        />
        <Textarea
          label="Description"
          placeholder="Add more details about this task..."
          minRows={3}
          value={data.description}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setData((prev) => ({ ...prev, description: val }));
          }}
        />
        <Group grow align="flex-start">
          <DateTimePicker
            label="Deadline"
            placeholder="Select date/time"
            required
            value={data.deadline}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                deadline: val ? new Date(val) : null,
              }))
            }
            error={error.deadline}
          />
          <NumberInput
            label="Est. Minutes"
            min={0}
            required
            value={data.estimatedMinutes}
            onChange={(val) =>
              setData((prev) => ({
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
            count={5}
            value={data.priority}
            onChange={(val) => setData((prev) => ({ ...prev, priority: val }))}
          />
        </Box>

        {isEdit && (
          <>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Progress ({data.progress}%)
              </Text>
              <Slider
                value={data.progress}
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    progress: val,
                    // 100%に達したら完了扱いにする
                    status: val === 100 ? "done" : prev.status,
                  }))
                }
                min={0}
                max={100}
                step={1}
                color="indigo"
                label={(value) => `${value}%`}
              />
            </Box>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Status
              </Text>
              <SegmentedControl
                fullWidth
                value={data.status}
                onChange={(val) =>
                  setData((prev) => ({
                    ...prev,
                    status: val,
                    // 完了を選んだら進捗も100%にする
                    progress: val === "done" ? 100 : prev.progress,
                  }))
                }
                data={[
                  { value: "pending", label: "Pending" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "done", label: "Completed" },
                ]}
              />
            </Box>
          </>
        )}

        <Group justify={isEdit ? "space-between" : "flex-end"} mt="md">
          {isEdit && onDelete != null && (
            <Button variant="outline" color="red" onClick={onDelete}>
              Delete Task
            </Button>
          )}
          <Group gap="sm">
            <Button variant="subtle" color="gray" onClick={handleClose}>
              Cancel
            </Button>
            <Button color="indigo" onClick={handleSubmit}>
              {isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
