import { db } from "~/lib/prisma.server";

export async function getAllPropertyManagers() {
  return await db.propertyManager.findMany({
    include: {
      community: {
        select: {
          id: true,
        },
      },
    },
  });
}
