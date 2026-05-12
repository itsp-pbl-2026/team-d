import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import mantineCss from "@mantine/core/styles.css?url";
import mantineDatesCss from "@mantine/dates/styles.css?url";
import mantineScheduleCss from "@mantine/schedule/styles.css?url";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { DashboardLayout } from "../shared/components/Layout/DashboardLayout";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Focus Flow",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: mantineCss,
      },
      {
        rel: "stylesheet",
        href: mantineDatesCss,
      },
      {
        rel: "stylesheet",
        href: mantineScheduleCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: () => <DashboardLayout />,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
