import { Box, Button, Card, Grid, Group, Progress, Stack, Text, Title, ActionIcon, ThemeIcon } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, Award, MoreVertical, Plus } from "lucide-react";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
});

const barData = [
  { day: "Mon", height: 40, active: false },
  { day: "Tue", height: 85, active: true },
  { day: "Wed", height: 50, active: false },
  { day: "Thu", height: 75, active: false },
  { day: "Fri", height: 45, active: false },
  { day: "Sat", height: 25, active: false },
  { day: "Sun", height: 20, active: false },
];

const projects = [
  { title: "Q3 Marketing Campaign", subtitle: "Strategy phase", progress: 75, color: "indigo.9" },
  { title: "Design System Overhaul", subtitle: "Component building", progress: 40, color: "indigo.2" },
  { title: "Client Onboarding Portal", subtitle: "Testing & QA", progress: 90, color: "orange.9" },
];

function ProgressPage() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} style={{ fontSize: 28 }}>Performance Overview</Title>
          <Text c="dimmed" mt={4}>Track your weekly goals and deep-work consistency.</Text>
        </div>
        <Button variant="default" leftSection={<Calendar size={16} />} radius="md">
          This Week
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder shadow="sm">
            <Group justify="space-between" mb="xl">
              <Text size="sm" fw={600} c="gray.6" style={{ letterSpacing: 0.5 }}>COMPLETED TASKS</Text>
              <ThemeIcon variant="light" color="indigo" radius="xl" size="md">
                <CheckCircle2 size={16} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs">
              <Text style={{ fontSize: 36, lineHeight: 1, fontWeight: 600 }} c="indigo.9">84</Text>
              <Text size="sm" c="blue.5" fw={600} mb={4}>↗ 12%</Text>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">vs. 75 last week</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder shadow="sm">
            <Group justify="space-between" mb="xl">
              <Text size="sm" fw={600} c="gray.6" style={{ letterSpacing: 0.5 }}>TOTAL WORK TIME</Text>
              <ThemeIcon variant="light" color="indigo" radius="xl" size="md">
                <Clock size={16} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap={4}>
              <Text style={{ fontSize: 36, lineHeight: 1, fontWeight: 600 }} c="indigo.9">32</Text>
              <Text size="lg" fw={500} c="gray.6" mb={4}>h</Text>
              <Text style={{ fontSize: 36, lineHeight: 1, fontWeight: 600 }} c="indigo.9" ml="sm">45</Text>
              <Text size="lg" fw={500} c="gray.6" mb={4}>m</Text>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">4.5 hrs in deep focus</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" shadow="sm" bg="indigo.9" c="white">
            <Group justify="space-between" mb="xl">
              <Text size="sm" fw={600} style={{ letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)' }}>FOCUS SCORE</Text>
              <ThemeIcon variant="transparent" color="white" radius="xl" size="md">
                <Award size={20} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs" mb="md">
              <Text style={{ fontSize: 36, lineHeight: 1, fontWeight: 600 }}>92</Text>
              <Text size="md" mb={4} style={{ color: 'rgba(255,255,255,0.7)' }}>/ 100</Text>
            </Group>
            <Progress value={92} color="white" bg="rgba(255,255,255,0.2)" size="sm" radius="xl" />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="xl" radius="md" withBorder shadow="sm" h="100%">
            <Group justify="space-between" mb="xl">
              <Title order={4} fw={500}>Productivity Volume</Title>
              <ActionIcon variant="subtle" color="gray">
                <MoreVertical size={18} />
              </ActionIcon>
            </Group>
            
            <Box style={{ height: 250, position: 'relative', marginTop: 20 }}>
              {/* Grid lines */}
              {[0, 1, 2, 3].map((i) => (
                <Box 
                  key={i} 
                  style={{ 
                    position: 'absolute', 
                    top: `${(i / 3) * 100}%`, 
                    left: 0, 
                    right: 0, 
                    borderTop: '1px dashed var(--mantine-color-gray-2)',
                    zIndex: 0
                  }} 
                />
              ))}
              
              {/* Bars */}
              <Group h="100%" grow align="flex-end" gap="md" style={{ position: 'relative', zIndex: 1, paddingBottom: 25 }}>
                {barData.map((item) => (
                  <Stack key={item.day} align="center" gap="xs" justify="flex-end" h="100%">
                    <Box 
                      w="100%" 
                      maw={40}
                      bg={item.active ? "indigo.9" : "indigo.1"}
                      style={{ 
                        height: `${item.height}%`, 
                        borderTopLeftRadius: 6, 
                        borderTopRightRadius: 6,
                        transition: 'height 0.3s ease'
                      }}
                    />
                    <Text size="xs" fw={item.active ? 600 : 500} c={item.active ? "dark" : "dimmed"} style={{ position: 'absolute', bottom: 0 }}>
                      {item.day}
                    </Text>
                  </Stack>
                ))}
              </Group>
            </Box>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="xl" radius="md" withBorder shadow="sm" h="100%">
            <Group justify="space-between" mb="xl">
              <Title order={4} fw={500}>Active Projects</Title>
              <Text size="sm" c="indigo.6" fw={500} style={{ cursor: 'pointer' }}>View All</Text>
            </Group>

            <Stack gap="xl" mb="xl">
              {projects.map((project) => (
                <Box key={project.title}>
                  <Group justify="space-between" mb={6}>
                    <div>
                      <Text size="sm" fw={600}>{project.title}</Text>
                      <Text size="xs" c="dimmed">{project.subtitle}</Text>
                    </div>
                    <Text size="sm" fw={600}>{project.progress}%</Text>
                  </Group>
                  <Progress value={project.progress} color={project.color} bg="gray.1" size="md" radius="xl" />
                </Box>
              ))}
            </Stack>

            <Button 
              fullWidth 
              variant="default" 
              leftSection={<Plus size={16} />}
              style={{ borderStyle: 'dashed', borderWidth: 2 }}
              color="gray"
              mt="auto"
            >
              Track New Goal
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
