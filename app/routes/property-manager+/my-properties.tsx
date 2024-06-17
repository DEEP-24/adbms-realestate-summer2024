import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PropertyCard from "~/components/property-card";
import { getPropertiesByUserId } from "~/lib/properties.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const properties = await getPropertiesByUserId(userId);
  return json({
    properties,
  });
}

export default function MyProperties() {
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
