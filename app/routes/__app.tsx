import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import {
  isAdmin,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";
import { useOptionCustomer } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }
  if (await isPropertyManager(request)) {
    return redirect("/property-manager");
  }

  return null;
};

export default function AppLayout() {
  const user = useOptionCustomer();
  return (
    <div className="h-full">
      <Navbar user={user} />
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
