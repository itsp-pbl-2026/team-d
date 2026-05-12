import { Card, Title, Text, Button, Group, Stack, ActionIcon, Modal, TextInput, Textarea, NumberInput, Select, Table, Badge, Progress } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Task } from "../shared/types/models";
import dayjs from "dayjs";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

const initialTasks: Task[] = [
  { id: "1", title: "Update UI for Dashboard", description: "Use Mantine components", deadline_at: "2026-05-12T17:00:00Z", estimated_minutes: 120, actual_minutes: 60, priority: 1, progress: 50, status: "in_progress" },
  { id: "2", title: "Write API Documentation", description: "Swagger format", deadline_at: "2026-05-15T15:00:00Z", estimated_minutes: 60, actual_minutes: 0, priority: 2, progress: 0, status: "todo" },
  { id: "3", title: "Fix Login Bug", description: "Auth token issue", deadline_at: "2026-05-10T12:00:00Z", estimated_minutes: 30, actual_minutes: 30, priority: 1, progress: 100, status: "done" },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'done': return 'green';
    case 'in_progress': return 'blue';
    default: return 'gray';
  }
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [opened, { open, close }] = useDisclosure(false);

  const rows = tasks.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>{task.title}</Table.Td>
      <Table.Td>{dayjs(task.deadline_at).format('MMM D, YYYY HH:mm')}</Table.Td>
      <Table.Td>{task.estimated_minutes}m</Table.Td>
      <Table.Td>{task.actual_minutes}m</Table.Td>
      <Table.Td>
        <Badge color={task.priority === 1 ? 'red' : 'yellow'}>
          P{task.priority}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Progress value={task.progress} w={60} color={getStatusColor(task.status)} />
          <Text size="xs">{task.progress}%</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(task.status)} variant="light">
          {task.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="light" color="blue"><Edit2 size={14} /></ActionIcon>
          <ActionIcon variant="light" color="red"><Trash2 size={14} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Tasks</Title>
        <Button leftSection={<Plus size={16} />} onClick={open}>Add Task</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Deadline</Table.Th>
                <Table.Th>Est. Time</Table.Th>
                <Table.Th>Act. Time</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Progress</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <Modal opened={opened} onClose={close} title="Add New Task" centered size="lg">
        <Stack gap="md">
          <TextInput label="Title" placeholder="Task title" required />
          <Textarea label="Description" placeholder="Task description" />
          <Group grow>
            <TextInput label="Deadline" type="datetime-local" required />
            <Select 
              label="Status" 
              data={['todo', 'in_progress', 'done']} 
              defaultValue="todo" 
            />
          </Group>
          <Group grow>
            <NumberInput label="Estimated Minutes" min={0} defaultValue={30} />
            <NumberInput label="Priority" min={1} max={5} defaultValue={2} />
          </Group>
          <Group grow>
            <NumberInput label="Progress (%)" min={0} max={100} defaultValue={0} />
          </Group>
          <Button fullWidth onClick={close} mt="md">Save Task</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
