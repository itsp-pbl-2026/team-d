import { Card, Title, Text, Button, Group, Stack, Switch, NumberInput, Divider } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import type { Setting } from "../shared/types/models";

export const Route = createFileRoute("/setting")({ component: SettingPage });

const defaultSettings: Setting = {
  id: "user1",
  notification: true,
  break_time_minutes: 15,
};

function SettingPage() {
  const [settings, setSettings] = useState<Setting>(defaultSettings);

  const handleSave = () => {
    // Mock save
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

  return (
    <Stack gap="lg" maxW={600}>
      <Title order={2}>Settings</Title>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Stack gap="lg">
          <div>
            <Title order={4} mb="xs">Notifications</Title>
            <Text c="dimmed" size="sm" mb="md">Manage how you receive alerts and reminders.</Text>
            <Switch
              size="md"
              label="Enable Notifications"
              description="Receive browser notifications for upcoming tasks and events"
              checked={settings.notification}
              onChange={(event) => setSettings({ ...settings, notification: event.currentTarget.checked })}
            />
          </div>

          <Divider />

          <div>
            <Title order={4} mb="xs">Preferences</Title>
            <Text c="dimmed" size="sm" mb="md">Customize your workflow experience.</Text>
            <NumberInput
              label="Default Break Time (minutes)"
              description="How long your AI-scheduled breaks should be"
              value={settings.break_time_minutes}
              onChange={(val) => setSettings({ ...settings, break_time_minutes: Number(val) || 0 })}
              min={0}
              max={60}
              w={200}
            />
          </div>

          <Group justify="flex-end" mt="md">
            <Button leftSection={<Save size={16} />} onClick={handleSave}>Save Changes</Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
