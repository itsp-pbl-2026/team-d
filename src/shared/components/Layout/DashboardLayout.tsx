import {
  AppShell,
  Box,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Home,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { icon: Home, label: "Home", to: "/" },
  { icon: CalendarIcon, label: "Calender", to: "/calender" },
  { icon: CheckSquare, label: "Tasks", to: "/tasks" },
];

export function DashboardLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <AppShell
      layout="alt"
      navbar={{
        width: 250,
        breakpoint: "xs",
      }}
      padding="lg"
      bg="gray.0"
    >
      <AppShell.Navbar p="md" withBorder>
        <Group mb="xl" mt="xs" px="sm">
          <ThemeIcon variant="filled" color="indigo.9" size="lg">
            <Zap size={20} />
          </ThemeIcon>
          <Box>
            <Title order={4} c="indigo.9" style={{ lineHeight: 1.2 }}>
              FocusFlow
            </Title>
            <Text size="xs" c="dimmed">
              Productivity Engine
            </Text>
          </Box>
        </Group>

        <AppShell.Section grow>
          <Stack gap="xs">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                component={Link}
                to={link.to}
                label={<Text fw={600}>{link.label}</Text>}
                leftSection={<link.icon size={20} />}
                active={currentPath === link.to}
                variant="light"
                color="indigo"
                bdrs="0.5rem"
                p="10px 12px"
              />
            ))}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
