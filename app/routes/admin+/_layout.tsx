import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import {
  isCustomer,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";
import { useOptionalAdmin } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  if (await isCustomer(request)) {
    return redirect("/");
  }
  if (await isPropertyManager(request)) {
    return redirect("/property-manager");
  }

  return json({});
};
export type NavbarLink = {
  id: number;
  href: string;
  label: string;
};

const NavLinks: NavbarLink[] = [
  {
    id: 1,
    href: "/admin",
    label: "Home",
  },
  {
    id: 2,
    href: "/admin/properties",
    label: "Properties",
  },
  {
    id: 3,
    href: "/admin/reservations",
    label: "Reservations",
  },
  {
    id: 4,
    href: "/admin/communities",
    label: "Communities",
  },
  {
    id: 5,
    href: "/admin/property-managers",
    label: "Property Managers",
  },
];

export default function AppLayout() {
  const user = useOptionalAdmin();

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        <Navbar
          userName={`${user!.firstName} ${user!.lastName}`}
          navLinks={NavLinks}
          userEmail={user!.email}
        />
        <main className="flex-1 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
