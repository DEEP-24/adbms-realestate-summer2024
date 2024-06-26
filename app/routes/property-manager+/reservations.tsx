import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllReservationsForPropertyManager } from "~/lib/reservation.server";
import { requireUserId } from "~/lib/session.server";
import { formatDateTime } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const reservations = await getAllReservationsForPropertyManager(userId);

  return json({
    reservations,
  });
};

export default function Reservations() {
  const { reservations } = useLoaderData<typeof loader>();

  return (
    <div>
      {reservations.length > 0 ? (
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
                Customer
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
              <th scope="col" className="py-3 pr-8 font-normal sm:table-cell">
                Total Price
              </th>
              <th scope="col" className="w-0 py-3 text-right font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="py-6 pr-8">
                  <div className="flex items-center">
                    <img
                      src={reservation.property?.imageSrc}
                      alt={reservation.property?.name}
                      className="mr-6 h-16 w-16 rounded object-cover object-center"
                    />
                    <div className="flex flex-col font-medium text-gray-900">
                      {reservation.property?.name}
                    </div>
                  </div>
                </td>
                <td className="py-6 pr-8 sm:table-cell">
                  {reservation.user?.firstName} {reservation.user?.lastName} -
                  {reservation.user?.email}
                </td>
                <td className="py-6 pr-8 sm:table-cell">
                  {formatDateTime(reservation.startDate)}
                </td>
                <td className="py-6 pr-8 sm:table-cell">
                  {formatDateTime(reservation.endDate)}
                </td>
                <td className="py-6 pr-8 sm:table-cell">
                  ${reservation.totalPrice}
                </td>
              </tr>
            ))}
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
        Nobody has booked a reservation yet.
      </span>
    </div>
  );
}
