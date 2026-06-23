import {
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Calendar } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type CreateEventFormData = {
  title: string;
  description: string;
  startAt: Date | null;
  endAt: Date | null;
};
export type CreateEventFormError = {
  title: string;
  range: string;
};
export type CreateEventModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: CreateEventFormData;
  setData: Dispatch<SetStateAction<CreateEventFormData>>;
  error: CreateEventFormError;
};

export const CreateEventModal = ({
  opened,
  onClose,
  onSubmit,
  data,
  setData,
  error,
}: CreateEventModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    withCloseButton={true}
    title={
      <Group gap="sm">
        <Calendar size={20} color="var(--mantine-color-indigo-6)" />
        <Title order={4}>Create New Event</Title>
      </Group>
    }
    size="md"
    radius="md"
  >
    <Stack gap="md">
      <TextInput
        label="Title"
        placeholder="Project Sync or Deep Work Session"
        required
        value={data.title}
        onChange={(e) => {
          const val = e.currentTarget.value;
          setData((prev) => ({
            ...prev,
            title: val,
          }));
        }}
        error={error.title}
      />
      <Textarea
        label="Description"
        placeholder="Briefly describe the agenda or goals..."
        minRows={3}
        value={data.description}
        onChange={(e) => {
          const val = e.currentTarget.value;
          setData((prev) => ({
            ...prev,
            description: val,
          }));
        }}
      />
      <DateTimePicker
        type="range"
        label="Event Period"
        placeholder="Select start and end date/time"
        required
        value={[data.startAt, data.endAt]}
        onChange={(val) =>
          setData((prev) => ({
            ...prev,
            startAt: val[0] ? new Date(val[0]) : null,
            endAt: val[1] ? new Date(val[1]) : null,
          }))
        }
        error={error.range}
      />
      <Group justify="flex-end" mt="md">
        <Button variant="subtle" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="indigo" onClick={onSubmit}>
          Create Event
        </Button>
      </Group>
    </Stack>
  </Modal>
);
