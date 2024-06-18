import type { PropertyManager } from "@prisma/client";
import { db } from "~/lib/prisma.server";

export async function getPropertiesByUserId(userId: PropertyManager["id"]) {
  return await db.property.findMany({
    where: {
      community: {
        propertyManagerId: userId,
      },
    },
  });
}

export async function getAllUnreservedProperties() {
  return await db.property.findMany({
    where: {
      reservations: {
        none: {},
      },
    },
  });
}

export async function getPropertyById(id: string) {
  return await db.property.findUnique({
    where: {
      id,
    },
  });
}
