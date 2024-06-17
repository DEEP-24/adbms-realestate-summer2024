import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { isAdmin, isCustomer, requireUserId } from "~/lib/session.server";
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

export default function AppLayout() {
  // const { user } = useOptionalUser();
  const user = useOptionalPropertyManager();

  return (
    <div className="h-full">
      <Navbar userName={user!.name} userEmail={user!.email} />
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
