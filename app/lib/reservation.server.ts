import type { User } from "@prisma/client";
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
