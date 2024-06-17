import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUser } from "~/lib/session.server";
import { UserRole } from "~/roles";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (user?.role === UserRole.ADMIN) {
    return redirect("/admin");
  }
  if (user?.role === UserRole.PROPERTY_MANAGER) {
    return redirect("/property-manager");
  }
  if (user?.role === UserRole.USER) {
    return redirect("/");
  }

  return null;
};

export default function AuthLayout() {
  return (
    <>
      <div className="flex h-full">
        {/* <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24"> */}
        {/* </div> */}
        <div className="relative hidden flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=3192&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />

          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute flex items-center justify-center top-[20vh] w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
