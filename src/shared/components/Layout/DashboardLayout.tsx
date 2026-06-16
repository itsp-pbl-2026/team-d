import {
  ActionIcon,
  AppShell,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Home, LogOut, Zap } from "lucide-react";

const NAV_LINKS = [
  { icon: Home, label: "Home", to: "/" },
  { icon: CalendarIcon, label: "Schedule", to: "/schedule" },
];

export function DashboardLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <AppShell
      layout="alt"
      navbar={{
        width: 250,
        breakpoint: "sm",
      }}
      padding="lg"
      bg="gray.0"
    >
      <AppShell.Navbar
        p="md"
        withBorder
        style={{ borderRight: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Group mb="xl" mt="xs" px="sm">
          <ActionIcon variant="filled" color="indigo.9" radius="md" size="lg">
            <Zap size={20} />
          </ActionIcon>
          <div>
            <Title order={4} c="indigo.9" style={{ lineHeight: 1.2 }}>
              FocusFlow
            </Title>
            <Text size="xs" c="dimmed">
              Productivity Engine
            </Text>
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
                  leftSection={
                    <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  }
                  active={isActive}
                  variant="filled"
                  color="indigo.0"
                  c={isActive ? "indigo.9" : "gray.7"}
                  style={{
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: isActive
                      ? "var(--mantine-color-indigo-9)"
                      : undefined,
                  }}
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack
            gap="xs"
            pt="md"
            pb="xs"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <NavLink
              label={<Text fw={500}>Logout</Text>}
              leftSection={<LogOut size={20} />}
              c="gray.7"
              style={{ borderRadius: 8, padding: "10px 12px" }}
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
