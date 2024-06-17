import type { User } from "@prisma/client";
import Container from "~/components/container";
import Logo from "~/components/logo";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            {user?.name}
          </div>
        </Container>
      </div>
    </div>
  );
}
