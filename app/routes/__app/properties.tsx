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
        {properties.map((property) => (
          // @ts-ignore
          <PropertyCard property={property} key={property.id} />
        ))}
      </div>
    </div>
  );
}
