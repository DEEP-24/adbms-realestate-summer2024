import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, type ShouldReloadFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import {
  isCustomer,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";
import { useOptionalAdmin } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
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
    href: "/admin/properties",
    label: "Properties",
  },
  {
    id: 2,
    href: "/admin/reservations",
    label: "Reservations",
  },
];

export default function AppLayout() {
  const user = useOptionalAdmin();

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        <Navbar
          userName={user!.name}
          navLinks={NavLinks}
          userEmail={user!.email}
        />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export const unstable_shouldReload: ShouldReloadFunction = ({
  submission,
  prevUrl,
  url,
}) => {
  if (!submission && prevUrl.pathname === url.pathname) {
    return false;
  }

  return true;
};
