import type { PropertyManager, User } from "@prisma/client";
import { db } from "~/lib/prisma.server";

export async function getAllReservationsForUser(userId: User["id"]) {
  return await db.reservation.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      property: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
    },
  });
}

export async function getAllReservationsForPropertyManager(
  userId: PropertyManager["id"],
) {
  return await db.reservation.findMany({
    where: {
      property: {
        propertyManagerId: userId,
      },
    },
    select: {
      id: true,
      property: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
      user: true,
    },
  });
}
