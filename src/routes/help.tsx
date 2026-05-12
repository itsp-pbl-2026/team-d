import { Card, Grid, Title, Text, Button, Group, Stack, Accordion, TextInput, Textarea } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Mail, MessageSquare, BookOpen } from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} style={{ fontSize: 28 }}>Help Center</Title>
          <Text c="dimmed" mt={4}>Find answers, tutorials, and reach out to support.</Text>
        </div>
      </Group>

      <TextInput
        placeholder="Search for articles, guides, or FAQs..."
        size="lg"
        radius="md"
        leftSection={<Search size={20} />}
        styles={{ input: { backgroundColor: 'var(--mantine-color-white)' } }}
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="xl" radius="md" withBorder shadow="sm" h="100%">
            <Title order={4} mb="lg">Frequently Asked Questions</Title>
            <Accordion variant="separated" radius="md">
              <Accordion.Item value="ai-schedule">
                <Accordion.Control>How does the AI Smart Schedule work?</Accordion.Control>
                <Accordion.Panel>
                  Our AI analyzes your task priorities, estimated durations, and your default break settings to generate an optimal daily timeline. It ensures deep work blocks are scheduled during your most productive hours.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="sync">
                <Accordion.Control>Can I sync my external calendar?</Accordion.Control>
                <Accordion.Panel>
                  Yes, FocusFlow supports two-way syncing with Google Calendar and Outlook. You can set this up in your Settings page under the "Integrations" tab.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="focus-score">
                <Accordion.Control>How is my Focus Score calculated?</Accordion.Control>
                <Accordion.Panel>
                  The Focus Score is calculated based on your ratio of completed tasks to planned tasks, the amount of uninterrupted deep work time logged, and your adherence to the generated schedule.
                </Accordion.Panel>
              </Accordion.Item>
              
              <Accordion.Item value="notifications">
                <Accordion.Control>How do I customize my notifications?</Accordion.Control>
                <Accordion.Panel>
                  Navigate to the Setting page from the sidebar to toggle email and push notifications, and customize your default break and work interval preferences.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg" h="100%">
            <Card padding="xl" radius="md" withBorder shadow="sm" bg="indigo.9" c="white">
              <Group mb="md">
                <BookOpen size={24} />
                <Title order={4} c="white">Quick Guides</Title>
              </Group>
              <Stack gap="xs">
                <Text size="sm" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Getting started with FocusFlow</Text>
                <Text size="sm" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Mastering task priorities</Text>
                <Text size="sm" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Setting up effective break times</Text>
              </Stack>
            </Card>

            <Card padding="xl" radius="md" withBorder shadow="sm" style={{ flex: 1 }}>
              <Title order={4} mb="xs">Contact Support</Title>
              <Text size="sm" c="dimmed" mb="lg">Can't find what you're looking for? Send us a message.</Text>
              
              <Stack gap="md">
                <TextInput label="Subject" placeholder="How can we help?" />
                <Textarea label="Message" placeholder="Describe your issue in detail..." minRows={4} />
                <Button fullWidth color="indigo" leftSection={<MessageSquare size={16} />}>
                  Send Message
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
