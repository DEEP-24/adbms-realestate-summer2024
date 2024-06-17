import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import {
  isAdmin,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";
import type { NavbarLink } from "~/routes/admin+/_layout";
import { useOptionCustomer } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }
  if (await isPropertyManager(request)) {
    return redirect("/property-manager");
  }

  return null;
};

const NavLinks: NavbarLink[] = [
  {
    id: 1,
    href: "/",
    label: "Home",
  },
  {
    id: 2,
    href: "/properties",
    label: "Properties",
  },
  {
    id: 3,
    href: "/reservations",
    label: "My Reservations",
  },
];

export default function AppLayout() {
  const user = useOptionCustomer();

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
