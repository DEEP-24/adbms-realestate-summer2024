import { Badge, Button } from "@mantine/core";
import { RequestStatus } from "@prisma/client";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import z from "zod";
import { db } from "~/lib/prisma.server";
import { getAllUserRequests } from "~/lib/reservation.server";
import { requireUserId } from "~/lib/session.server";
import { useOptionCustomer } from "~/utils/hooks";
import { formatDateTime } from "~/utils/misc";
import { badRequest } from "~/utils/misc.server";
import { validateAction, type inferErrors } from "~/utils/validation";

const ReservationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  totalPrice: z.string().min(1, "Price is required"),
  requestId: z.string().min(1, "Request ID is required"),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const requests = await getAllUserRequests(userId);

  return json({
    requests,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ReservationSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const { userId, propertyId, startDate, endDate, totalPrice, requestId } =
    fields;

  await db.reservation.create({
    data: {
      userId: userId,
      propertyId: propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice: Number(totalPrice),
      reservationRequest: {
        connect: {
          id: requestId,
        },
      },
    },
  });

  return json({ success: true });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ReservationSchema>;
}

export default function MyReservations() {
  const user = useOptionCustomer();
  const { requests } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const isSubmitting = fetcher.state !== "idle";

  return (
    <div className="p-5">
      {requests.length > 0 ? (
        <table className="mt-4 w-full text-gray-500 sm:mt-6">
          <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
            <tr>
              <th
                scope="col"
                className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3"
              >
                Property Name
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                Property Owner
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                Start Date
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                End Date
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                Status
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                {""}
              </th>
              <th scope="col" className="w-0 py-3 text-right font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
            {requests.map((request) => {
              const alreadyLeased = request.reservation !== null;

              return (
                <tr key={request.id}>
                  <td className="py-6 pr-8">
                    <div className="flex items-center">
                      <img
                        src={request.property.imageSrc}
                        alt={request.property.name}
                        className="mr-6 h-16 w-16 rounded object-cover object-center"
                      />
                      <div className="flex flex-col font-medium text-gray-900">
                        {request.property.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 pr-8 sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <span>
                        {request.property.community?.propertyManager?.firstName}{" "}
                        {request.property.community?.propertyManager?.lastName}
                      </span>
                      <span>
                        {request.property.community?.propertyManager?.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 pr-8 sm:table-cell">
                    {formatDateTime(request.startDate)}
                  </td>
                  <td className="py-6 pr-8 sm:table-cell">
                    {formatDateTime(request.endDate)}
                  </td>
                  <td className="py-6 pr-8 sm:table-cell">
                    <Badge
                      color={
                        request.status === RequestStatus.PENDING
                          ? "blue"
                          : request.status === RequestStatus.APPROVED
                            ? "green"
                            : "red"
                      }
                    >
                      {request.status}
                    </Badge>
                  </td>
                  <td className="py-6 pr-8 sm:table-cell">
                    <fetcher.Form method="post">
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <input
                        type="hidden"
                        name="startDate"
                        value={request.startDate}
                      />
                      <input
                        type="hidden"
                        name="endDate"
                        value={request.endDate}
                      />
                      <input
                        type="hidden"
                        name="propertyId"
                        value={request.property.id}
                      />
                      <input type="hidden" name="userId" value={user?.id} />
                      <input
                        type="hidden"
                        name="totalPrice"
                        value={request.property.price}
                      />
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />

                      <Button
                        color="black"
                        className="hover:bg-gray-700 rounded-lg"
                        disabled={
                          request.status === RequestStatus.PENDING ||
                          request.status === RequestStatus.REJECTED ||
                          isSubmitting ||
                          alreadyLeased
                        }
                        type="submit"
                      >
                        Lease
                      </Button>
                    </fetcher.Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <span className="mt-4 block text-sm font-medium text-gray-500">
        You don't have any requests yet.
      </span>
    </div>
  );
}
