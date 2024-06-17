import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, type ShouldReloadFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { isAdmin, isCustomer, requireUserId } from "~/lib/session.server";
import type { NavbarLink } from "~/routes/admin";
import { useOptionalPropertyManager } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }
  if (await isCustomer(request)) {
    return redirect("/");
  }

  return json({});
};

const NavLinks: NavbarLink[] = [
  {
    id: 1,
    href: "/property-manager",
    label: "Home",
  },
  {
    id: 2,
    href: "/property-manager/my-properties",
    label: "My Properties",
  },
  {
    id: 3,
    href: "/property-manager/reservations",
    label: "Reservations",
  },
];

export default function AppLayout() {
  // const { user } = useOptionalUser();
  const user = useOptionalPropertyManager();

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
