import type { PropertyManager } from "@prisma/client";

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

export async function getAllPropertyRequests(
  propertyManagerId: PropertyManager["id"],
) {
  //get all requests made for the property of this properymanager
  return await db.reservationRequest.findMany({
    where: {
      property: {
        community: {
          propertyManagerId: propertyManagerId,
        },
      },
    },
    select: {
      id: true,
      property: true,
      user: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
}
