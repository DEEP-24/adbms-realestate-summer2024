import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "~/lib/prisma.server";
import { getPropertyById } from "~/lib/properties.server";
import { getUserId } from "~/lib/session.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    return redirect("/properties");
  }

  const property = await getPropertyById(id);

  return json({
    property,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const userId = await getUserId(request);

  if (!userId) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return redirect("/properties");
  }

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const price = formData.get("price") as string;

  await db.reservation.create({
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice: Number(price),
      propertyId: id,
      userId: userId,
    },
  });

  return redirect("/reservations");
};

export default function ReserveProperty() {
  const { property } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  if (!property) {
    return redirect("/properties");
  }

  return (
    <div className="w-full h-full">
      <span className="text-xl font-semibold text-center">
        {property.title}
      </span>
      <fetcher.Form method="post" className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="startDate" className="text-lg font-semibold">
            Start Date
          </label>
          <div className="p-2">
            <input type="date" name="startDate" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="endDate" className="text-lg font-semibold">
            End Date
          </label>
          <div className="p-2">
            <input type="date" name="endDate" />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg font-semibold">Total Price</span>:{" "}
          <span>${property.price}</span>
          <input type="hidden" name="price" value={property.price} />
        </div>
        <div>
          <button type="submit" className="border-2 p-3 rounded-xl bg-gray-600">
            Reserve
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}
