import { Form, NavLink } from "@remix-run/react";
import Container from "~/components/container";
import Logo from "~/components/logo";
import type { NavbarLink } from "~/routes/admin+/_layout";

interface NavbarProps {
  userName: string;
  userEmail: string;
  navLinks?: NavbarLink[];
}

export default function Navbar({ userName, userEmail, navLinks }: NavbarProps) {
  return (
    <div className="sticky w-full bg-white z-10 shadow-sm">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            <div className="flex items-center justify-center gap-4">
              {navLinks?.map((navLink) => (
                <NavLink
                  to={navLink.href}
                  key={navLink.id}
                  className="rounded-lg px-3 py-2 transition-all hover:bg-gray-100 hover:rounded-lg bg-gray-200"
                >
                  {navLink.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center justify-center">
                <span>{userName}</span>
                <span>{userEmail}</span>
              </div>
              <div>
                <Form
                  replace={true}
                  action="/api/auth/logout"
                  method="post"
                  id="logout-form"
                />
                <button
                  type="submit"
                  form="logout-form"
                  className="text-red-500 border-2 rounded-xl p-4 hover:bg-red-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
