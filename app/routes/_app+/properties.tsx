import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PropertyCard from "~/components/property-card";
import { getAllCommunities } from "~/lib/community.server";

export async function loader() {
  const communities = await getAllCommunities();
  return json({
    communities,
  });
}

export default function Properties() {
  const { communities } = useLoaderData<typeof loader>();

  return (
    <div className="w-screen h-full">
      {communities.map((community) => (
        <div key={community.id} className="p-5">
          {community.properties.length > 0 && (
            <>
              <span className="text-lg font-semibold ml-3">
                {community.name}
              </span>
              <div className="p-5 grid md:grid-cols-3 lg:grid-cols-4 w-full gap-5">
                {community.properties.map((property) => (
                  // @ts-ignore
                  <PropertyCard
                    property={property}
                    key={property.id}
                    showReserveButton={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// function EmptyState() {
//   return (
//     <div className="block h-full w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
//       <span className="mt-4 block text-sm font-medium text-gray-500">
//         There are no properties available to reserve at the moment. All our
//         properties are currently reserved.
//       </span>
//     </div>
//   );
// }
