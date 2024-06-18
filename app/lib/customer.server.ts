import type { User } from "@prisma/client";
import { db } from "~/lib/prisma.server";

export async function getAllUserRequests(userId: User["id"]) {
  return await db.request.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      property: {
        select: {
          imageSrc: true,
          name: true,
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
