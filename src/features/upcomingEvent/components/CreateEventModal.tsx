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
import { type Dispatch, type SetStateAction, useState } from "react";
import type { EventFormData, EventFormDataValidated } from "../hooks/eventForm";

export type CreateEventFormError = {
  title: string;
  range: string;
};
export type CreateEventModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormDataValidated) => void | Promise<void>;
  data: EventFormData;
  setData: Dispatch<SetStateAction<EventFormData>>;
  mode?: "create" | "edit";
};

export const CreateEventModal = ({
  opened,
  onClose,
  onSubmit,
  data,
  setData,
  mode = "create",
}: CreateEventModalProps) => {
  const [error, setError] = useState<CreateEventFormError>({
    title: "",
    range: "",
  });
  const isEdit = mode === "edit";

  const handleClose = () => {
    onClose();
    setError({ title: "", range: "" });
  };

  const handleSubmit = () => {
    const hasInvalidEnd =
      data.startAt && data.endAt && data.startAt >= data.endAt;

    const rangeError = !data.startAt
      ? "Start Time is required"
      : !data.endAt
        ? "End Time is required"
        : hasInvalidEnd
          ? "End Time must be after Start Time"
          : "";

    const errors = {
      title: !data.title.trim() ? "Event Title is required" : "",
      range: rangeError,
    };

    setError(errors);
    if (errors.title !== "" || errors.range !== "") return;
    if (data.startAt == null || data.endAt == null) return; // never happen

    onSubmit({
      title: data.title,
      description: data.description,
      startAt: data.startAt,
      endAt: data.endAt,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={true}
      title={
        <Group gap="sm">
          <Calendar size={20} color="var(--mantine-color-indigo-6)" />
          <Title order={4}>{isEdit ? "Edit Event" : "Create New Event"}</Title>
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
          allowSingleDateInRange
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
          <Button variant="subtle" color="gray" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="indigo" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Create Event"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
