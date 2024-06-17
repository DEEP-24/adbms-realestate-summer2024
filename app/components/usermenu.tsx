import type { User } from "@prisma/client";

interface UserMenuProps {
  user: User | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex">
      <p>{user?.name}</p>
    </div>
  );
}
