import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("/property-manager/my-properties");
}
