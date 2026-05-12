import { AppShell, Burger, Group, NavLink, Title, ActionIcon, Avatar, TextInput, Text, Stack, Indicator, Popover, Menu, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Calendar as CalendarIcon, CheckSquare, Settings, Bell, Search, Zap, BarChart2, Lightbulb, HelpCircle, LogOut } from "lucide-react";

const NAV_LINKS = [
  { icon: Home, label: "Home", to: "/" },
  { icon: CalendarIcon, label: "Schedule", to: "/calendar" },
  { icon: CheckSquare, label: "Tasks", to: "/tasks" },
  { icon: Lightbulb, label: "AI Tips", to: "/schedule" },
  { icon: BarChart2, label: "Progress", to: "/progress" },
];

export function DashboardLayout() {
  const [opened, { toggle }] = useDisclosure();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <AppShell
      layout="alt"
      header={{ height: 70 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      bg="gray.0"
    >
      <AppShell.Header withBorder={false} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }} bg="white">
        <Group h="100%" px="xl" justify="space-between" w="100%">
          <Group flex={1}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <TextInput
              placeholder="Search events or tasks..."
              leftSection={<Search size={16} />}
              visibleFrom="sm"
              radius="xl"
              size="md"
              w="100%"
              maw={400}
              styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)', border: 'none' } }}
            />
          </Group>

          <Group gap="md">
            <Popover width={320} position="bottom-end" withArrow shadow="md">
              <Popover.Target>
                <Indicator color="red" size={8} offset={4} withBorder>
                  <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                    <Bell size={20} />
                  </ActionIcon>
                </Indicator>
              </Popover.Target>
              <Popover.Dropdown p="md">
                <Text fw={600} mb="sm">Notifications</Text>
                <Stack gap="sm">
                  <div>
                    <Text size="sm" fw={500}>AI Schedule Generated</Text>
                    <Text size="xs" c="dimmed">Your smart schedule for today is ready for review.</Text>
                  </div>
                  <Divider />
                  <div>
                    <Group justify="space-between" align="flex-start">
                      <Text size="sm" fw={500}>Upcoming Deadline</Text>
                      <Text size="xs" c="red" fw={600}>In 2 hrs</Text>
                    </Group>
                    <Text size="xs" c="dimmed">Submit Q3 Marketing Report.</Text>
                  </div>
                  <Divider />
                  <div>
                    <Text size="sm" fw={500}>Daily Goal Met! 🎉</Text>
                    <Text size="xs" c="dimmed">You completed 4.5 hours of deep focus work.</Text>
                  </div>
                </Stack>
              </Popover.Dropdown>
            </Popover>

            <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" component={Link} to="/setting">
              <Settings size={20} />
            </ActionIcon>
            <Avatar color="indigo" radius="xl" src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" withBorder style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
        <Group mb="xl" mt="xs" px="sm">
          <ActionIcon variant="filled" color="indigo.9" radius="md" size="lg">
            <Zap size={20} />
          </ActionIcon>
          <div>
            <Title order={4} c="indigo.9" style={{ lineHeight: 1.2 }}>
              FocusFlow
            </Title>
            <Text size="xs" c="dimmed">Productivity Engine</Text>
          </div>
        </Group>

        <AppShell.Section grow>
          <Stack gap="xs">
            {NAV_LINKS.map((link) => {
              // Special case: /calendar corresponds to "Schedule" in the mockup
              const isActive = currentPath === link.to;
              return (
                <NavLink
                  key={link.to}
                  component={Link}
                  to={link.to}
                  label={<Text fw={isActive ? 600 : 500}>{link.label}</Text>}
                  leftSection={<link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                  active={isActive}
                  variant="filled"
                  color="indigo.0"
                  c={isActive ? "indigo.9" : "gray.7"}
                  style={{ 
                    borderRadius: 8, 
                    padding: '10px 12px',
                    color: isActive ? 'var(--mantine-color-indigo-9)' : undefined 
                  }}
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack gap="xs" pt="md" pb="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <NavLink
              component={Link}
              to="/help"
              label={<Text fw={500}>Help Center</Text>}
              leftSection={<HelpCircle size={20} strokeWidth={currentPath === '/help' ? 2.5 : 2} />}
              active={currentPath === '/help'}
              variant="filled"
              color="indigo.0"
              c={currentPath === '/help' ? "indigo.9" : "gray.7"}
              style={{ borderRadius: 8, padding: '10px 12px' }}
            />
            <NavLink
              label={<Text fw={500}>Logout</Text>}
              leftSection={<LogOut size={20} />}
              c="gray.7"
              style={{ borderRadius: 8, padding: '10px 12px' }}
            />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
