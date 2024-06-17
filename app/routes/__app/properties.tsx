import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PropertyCard from "~/components/property-card";
import { getAllUnreservedProperties } from "~/lib/properties.server";

export async function loader() {
  const properties = await getAllUnreservedProperties();
  return json({
    properties,
  });
}

export default function Properties() {
  const { properties } = useLoaderData<typeof loader>();

  return (
    <div className="w-full h-full">
      <div className="pt-24 grid grid-cols-4 gap-8 w-full">
        {properties.length > 0 ? (
          properties.map((property) => (
            // @ts-ignore
            <PropertyCard
              property={property}
              key={property.id}
              showReserveButton={true}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="block h-full w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <span className="mt-4 block text-sm font-medium text-gray-500">
        There are no properties available to reserve at the moment. All our
        properties are currently reserved.
      </span>
    </div>
  );
}
