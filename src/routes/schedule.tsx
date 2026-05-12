import { Card, Title, Text, Button, Group, Stack, Timeline, ThemeIcon, ActionIcon } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Wand2, Clock, Edit2 } from "lucide-react";
import type { Schedule, Task } from "../shared/types/models";
import dayjs from "dayjs";

export const Route = createFileRoute("/schedule")({ component: SchedulePage });

// Mock Data
const mockTasks: Record<string, Task> = {
  "1": { id: "1", title: "Update UI for Dashboard", description: "", deadline_at: "2026-05-12T17:00:00Z", estimated_minutes: 120, actual_minutes: 60, priority: 1, progress: 50, status: "in_progress" },
  "2": { id: "2", title: "Write API Documentation", description: "", deadline_at: "2026-05-15T15:00:00Z", estimated_minutes: 60, actual_minutes: 0, priority: 2, progress: 0, status: "todo" },
};

const mockSchedules: Schedule[] = [
  { id: "s1", taskId: "1", start_at: "2026-05-12T09:00:00Z", end_at: "2026-05-12T11:00:00Z" },
  { id: "s2", taskId: "2", start_at: "2026-05-12T13:00:00Z", end_at: "2026-05-12T14:00:00Z" },
];

function SchedulePage() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Smart Schedule</Title>
          <Text c="dimmed">AI-generated schedule based on your tasks and events.</Text>
        </div>
        <Button leftSection={<Wand2 size={16} />} color="indigo">Auto-generate Schedule</Button>
      </Group>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Title order={4} mb="xl">Today's Proposed Schedule</Title>
        
        <Timeline active={0} bulletSize={24} lineWidth={2}>
          {mockSchedules.map((schedule) => {
            const task = mockTasks[schedule.taskId];
            const startStr = dayjs(schedule.start_at).format('HH:mm');
            const endStr = dayjs(schedule.end_at).format('HH:mm');
            
            return (
              <Timeline.Item 
                key={schedule.id} 
                title={<Group justify="space-between" w="100%">
                  <Text fw={600}>{task?.title || "Unknown Task"}</Text>
                  <ActionIcon variant="subtle" color="gray" size="sm"><Edit2 size={14} /></ActionIcon>
                </Group>} 
                bullet={<ThemeIcon size={22} radius="xl" color="indigo"><Clock size={12} /></ThemeIcon>}
              >
                <Text c="dimmed" size="sm" mt={4}>Scheduled for {startStr} - {endStr}</Text>
                <Text size="xs" mt={4}>Priority: {task?.priority}</Text>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>
    </Stack>
  );
}
