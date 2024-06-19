import type { PropertyManager, User } from "@prisma/client";
import { db } from "~/lib/prisma.server";

export async function getAllReservationsForUser(userId: User["id"]) {
  return await db.reservation.findMany({
    where: {
      userId,
    },
    select: {
      property: true,
      id: true,
      reservationRequest: {
        select: {
          property: true,
        },
      },
      startDate: true,
      endDate: true,
      totalPrice: true,
    },
  });
}

export async function getAllReservationsForPropertyManager(
  userId: PropertyManager["id"],
) {
  // I want to get all the reservations for a property manager which should include everything
  // about the user who made the reservation and the property that was reserved
  return await db.reservation.findMany({
    where: {
      property: {
        community: {
          propertyManagerId: userId,
        },
      },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
      property: true,
      user: true,
    },
  });
}

export async function getAllUserRequests(userId: User["id"]) {
  return await db.reservationRequest.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      reservation: true,
      property: {
        select: {
          id: true,
          imageSrc: true,
          name: true,
          price: true,
          community: {
            select: {
              propertyManager: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      user: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
}

export async function getAllReservations() {
  return await db.reservation.findMany({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
      property: {
        select: {
          name: true,
          price: true,
          imageSrc: true,
          community: {
            select: {
              propertyManager: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      user: true,
    },
  });
}
