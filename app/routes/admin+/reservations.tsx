import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllReservations } from "~/lib/reservation.server";
import { formatDateTime } from "~/utils/misc";

export const loader = async () => {
  const reservations = await getAllReservations();

  return json({
    reservations,
  });
};

export default function Reservations() {
  const { reservations } = useLoaderData<typeof loader>();

  return (
    <div className="p-5">
      {reservations.length > 0 ? (
        <table className="mt-4 w-full text-gray-500 sm:mt-6">
          <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
            <tr>
              <th
                scope="col"
                className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3"
              >
                Property
              </th>
              <th
                scope="col"
                className="w-1/5 py-3 pr-8 font-normal sm:table-cell"
              >
                Property Manager
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
                    {reservation.property?.name}
                  </div>
                </td>{" "}
                <td className="py-6 pr-8 sm:table-cell">
                  <div className="flex flex-col gap-1">
                    <span>
                      {
                        reservation.property?.community?.propertyManager
                          ?.firstName
                      }
                      {
                        reservation.property?.community?.propertyManager
                          ?.lastName
                      }
                    </span>
                    <span>
                      {reservation.property?.community?.propertyManager?.email}
                    </span>
                  </div>
                </td>
                <td className="py-6 pr-8 sm:table-cell">
                  <div className="flex flex-col gap-1">
                    <span>
                      {reservation.user?.firstName} {reservation.user?.lastName}
                    </span>
                    <span>{reservation.user?.email}</span>
                  </div>
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
        No Reservations found.
      </span>
    </div>
  );
}
