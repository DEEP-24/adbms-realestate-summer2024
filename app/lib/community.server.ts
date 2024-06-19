import { db } from "~/lib/prisma.server";

export async function getAllCommunities() {
  return await db.community.findMany({
    include: {
      properties: true,
    },
  });
}

export async function getCommunitiesWithUnReservedProperties() {
  return await db.community.findMany({
    include: {
      properties: {
        where: {
          reservations: {
            none: {},
          },
        },
      },
    },
  });
}
