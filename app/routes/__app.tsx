import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import {
  isAdmin,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }

  // const products = await getAllProducts();
  // const categories = await getAllCategoriesWithProducts();

  return json({
    // products,
    // categories,
    isCustomer: await isPropertyManager(request),
  });
};

export default function AppLayout() {
  return (
    <div className="h-full">
      <Navbar />
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
