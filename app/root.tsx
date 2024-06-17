import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { StylesPlaceholder } from "@mantine/remix";
import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import appConfig from "app.config";
import type React from "react";
import { getAdmin, getCustomer, getPropertyManager } from "~/lib/user.server";
import { UserRole } from "~/roles";
import { getUserId, getUserRole } from "./lib/session.server";
import styles from "./styles/app.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export type RootLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const userRole = await getUserRole(request);

  // biome-ignore lint/style/useConst: <explanation>
  let response: {
    admin: Awaited<ReturnType<typeof getAdmin>>;
    user: Awaited<ReturnType<typeof getCustomer>>;
    propertyManager: Awaited<ReturnType<typeof getPropertyManager>>;
  } = {
    admin: null,
    user: null,
    propertyManager: null,
  };

  if (!userId || !userRole) {
    return json(response);
  }

  if (userRole === UserRole.ADMIN) {
    response.admin = await getAdmin(request);
  } else if (userRole === UserRole.USER) {
    response.user = await getCustomer(request);
  } else if (userRole === UserRole.PROPERTY_MANAGER) {
    response.propertyManager = await getPropertyManager(request);
  }

  return json(response);
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: appConfig.name,
  viewport: "width=device-width,initial-scale=1",
});

export function Document({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
        <StylesPlaceholder />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <ModalsProvider>
        <NotificationsProvider autoClose={2000} limit={3}>
          <Outlet />
        </NotificationsProvider>
      </ModalsProvider>
    </Document>
  );
}
