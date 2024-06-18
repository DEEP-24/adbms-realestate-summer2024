import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
                  <Link to={`/properties/${property.id}`} key={property.id}>
                    <div className="col-span-1 cursor-pointer group w-full">
                      <div className="flex flex-col gap-1">
                        <div className="overflow-hidden rounded-xl h-[200px] w-full">
                          <img
                            className="w-full h-auto object-cover group-hover:scale-110 transition"
                            src={property.imageSrc}
                            alt="Property"
                          />
                        </div>
                        <div className="font-semibold text-lg">
                          {property.name}
                        </div>
                        <div className="">
                          {property.location}, ${property.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
