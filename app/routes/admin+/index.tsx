import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  isCustomer,
  isPropertyManager,
  requireUserId,
} from "~/lib/session.server";

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

export default function Index() {
  return <div className="text-red-500">this is the admin page</div>;
}
