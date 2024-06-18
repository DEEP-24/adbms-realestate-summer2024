import { Badge } from "@mantine/core";
import { RequestStatus } from "@prisma/client";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getAllUserRequests } from "~/lib/customer.server";
import { db } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { formatDateTime } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const requests = await getAllUserRequests(userId);

  return json({
    requests,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const intent = formData.get("intent")?.toString();
  invariant(intent, "Invalid intent");

  const requestId = formData.get("requestId")?.toString();
  invariant(requestId, "Invalid request id");
  switch (intent) {
    case "update-request-status": {
      const status = formData.get("status")?.toString();
      invariant(status, "Invalid status");

      await db.request.update({
        where: { id: requestId },
        data: { status: status as RequestStatus },
      });

      return json({ success: true });
    }

    default:
      return json(
        { success: false, message: "Invalid intent" },
        { status: 400 },
      );
  }
};

export default function MyReservations() {
  const { requests } = useLoaderData<typeof loader>();

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
              <th scope="col" className="w-0 py-3 text-right font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
            {requests.map((request) => {
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
