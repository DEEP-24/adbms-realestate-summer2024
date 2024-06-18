import { db } from "~/lib/prisma.server";

export async function getAllCommunities() {
  return await db.community.findMany({});
}
